// DMS Folder Actions hook: create, rename, and delete for folders, subfolders, and sub-subfolders.
// Extracted verbatim from useDmsWorkspace.ts – no behavioural changes.

import React, { useState } from "react";
import api from "@/api/axiosInstance";
import type {
  Role,
  FolderDefinition,
  SubfolderInfo,
  DocumentRecord,
  Publisher,
  CreateFolderResponse,
  CreateSubFolderResponse,
  UpdateFolderResponse,
  UpdateSubFolderResponse,
} from "../types";
import { getLoggedInUserId } from "./dmsUser";

interface UseDmsFolderActionsOptions {
  role: Role;
  folders: FolderDefinition[];
  setFolders: React.Dispatch<React.SetStateAction<FolderDefinition[]>>;
  documents: DocumentRecord[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentRecord[]>>;
  fetchFolders: () => Promise<void>;
  selectedFolder: string | null;
  selectedSubfolder: string | null;
  selectedSubSubfolder: string | null;
  setSelectedFolder: (name: string | null) => void;
  setSelectedSubfolder: (name: string | null) => void;
  setSelectedSubSubfolder: (name: string | null) => void;
  setActiveFolder: (name: string) => void;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setExpandedSubfolders: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setExpandedPaths?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleSelectFolder: (name: string | null) => void;
  handleSelectSubfolder: (folderName: string, subfolderName: string) => void;
  handleSelectSubSubfolder: (
    folderName: string,
    subfolderName: string,
    subSubfolderName: string,
  ) => void;
  selectedSubfolderPath: string[];
  setSelectedSubfolderPath: React.Dispatch<React.SetStateAction<string[]>>;
  setPublishers?: React.Dispatch<React.SetStateAction<Publisher[]>>;
  setToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

export interface SubfolderTarget {
  type: "folder" | "subfolder" | "subsubfolder";
  parentFolder?: string;
  parentSubfolder?: string;
  subfolderPath?: string[];
  subfolderId?: number;
  currentName: string;
}

function findSubfolderById(
  subfolders: SubfolderInfo[],
  subfolderId: number,
): SubfolderInfo | undefined {
  for (const subfolder of subfolders) {
    if (Number(subfolder.id ?? subfolder.sub_folder_id) === subfolderId) {
      return subfolder;
    }

    const found = findSubfolderById(
      subfolder.subfolders ?? [],
      subfolderId,
    );

    if (found) {
      return found;
    }
  }

  return undefined;
}

function findSubfolderByPath(
  subfolders: SubfolderInfo[],
  path: string[],
): SubfolderInfo | undefined {
  if (!path.length) return undefined;

  let currentLevel = subfolders;
  let currentMatch: SubfolderInfo | undefined;

  for (const segment of path) {
    currentMatch = currentLevel.find(
      (subfolder) => subfolder.name === segment,
    );

    if (!currentMatch) {
      return undefined;
    }

    currentLevel = currentMatch.subfolders ?? [];
  }

  return currentMatch;
}

function resolveSubfolderTarget(
  folder: FolderDefinition,
  target: SubfolderTarget,
): SubfolderInfo | undefined {
  const subfolders = folder.subfolders ?? [];

  // Prefer the unique ID.
  if (target.subfolderId != null) {
    const foundById = findSubfolderById(
      subfolders,
      target.subfolderId,
    );

    if (foundById) {
      return foundById;
    }
  }

  // Otherwise, use the complete path.
  if (target.subfolderPath?.length) {
    const foundByPath = findSubfolderByPath(
      subfolders,
      target.subfolderPath,
    );

    if (foundByPath) {
      return foundByPath;
    }
  }

  // Do not search the entire tree by name.
  // Repeated names can exist at different hierarchy levels.
  return undefined;
}

function updateSubfolderTree(
  subfolders: SubfolderInfo[],
  targetId: number,
  updater: (subfolder: SubfolderInfo) => SubfolderInfo,
): SubfolderInfo[] {
  return subfolders.map((subfolder) => {
    const currentId = Number(
      subfolder.id ?? subfolder.sub_folder_id,
    );

    if (currentId === targetId) {
      return updater(subfolder);
    }

    return {
      ...subfolder,
      subfolders: updateSubfolderTree(
        subfolder.subfolders ?? [],
        targetId,
        updater,
      ),
    };
  });
}

function removeSubfolderFromTree(
  subfolders: SubfolderInfo[],
  targetId: number,
): SubfolderInfo[] {
  return subfolders
    .filter((sf) => Number(sf.id ?? sf.sub_folder_id) !== targetId)
    .map((sf) => ({
      ...sf,
      subfolders: removeSubfolderFromTree(sf.subfolders ?? [], targetId),
    }));
}

export function useDmsFolderActions({
  role,
  folders,
  setFolders,
  documents,
  setDocuments,
  fetchFolders,
  selectedFolder,
  selectedSubfolder,
  selectedSubSubfolder,
  setSelectedFolder,
  setSelectedSubfolder,
  setSelectedSubSubfolder,
  setActiveFolder,
  setExpandedFolders,
  setExpandedSubfolders,
  setExpandedPaths,
  handleSelectFolder,
  handleSelectSubfolder,
  handleSelectSubSubfolder,
  selectedSubfolderPath,
  setSelectedSubfolderPath,
  setPublishers,
  setToast,
}: UseDmsFolderActionsOptions) {
  // Admin Folder & Sub-Folder management modal state
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [createSubfolderForFolder, setCreateSubfolderForFolder] =
    useState<string | null>(null);

  const [createSubSubfolderFor, setCreateSubSubfolderFor] = useState<{
    parentFolder: string;
    parentSubfolder: string;
    parentSubfolderId?: number;
    parentSubfolderPath?: string[];
  } | null>(null);
  const [renameTarget, setRenameTarget] = useState<SubfolderTarget | null>(null);
  const [descriptionTarget, setDescriptionTarget] = useState<(SubfolderTarget & { currentDescription: string }) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<(SubfolderTarget & { name: string; docCount: number }) | null>(null);

  const handleCreateFolder = async (
    name: string,
    description: string,
    iconKey: string,
  ) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Frontend duplicate check
    if (
      folders.some(
        (f) => f.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setToast(`A folder named "${trimmed}" already exists.`);
      return;
    }

    try {
      const response = await api.post<CreateFolderResponse>(
        "/dms-folder/create",
        {
          folder_name: trimmed,
          folder_description: description.trim(),
          folder_icon: iconKey || "Folder",
          created_by: getLoggedInUserId(),
        },
      );

      if (response.data.status !== "success") {
        setToast(response.data.message || "Failed to create folder.");
        return;
      }

      // Reload folders from backend
      await fetchFolders();

      // Select newly created folder
      handleSelectFolder(trimmed);

      setToast(`Folder "${trimmed}" created successfully.`);
      setShowCreateFolderModal(false);
    } catch (error: any) {
      console.error("Failed to create DMS folder:", error);

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to create folder.";

      setToast(message);
    }
  };

  const handleCreateSubfolder = async (
    parentFolderName: string,
    name: string,
    description: string,
    letter?: string,
    parentSubfolderId?: number | null,
  ) => {
    const trimmed = name.trim();

    if (!trimmed) return;

    const parentDef = folders.find(
      (folder) => folder.name === parentFolderName,
    );

    if (!parentDef) {
      setToast("Parent folder not found.", "error");
      return;
    }

    const parentId = parentSubfolderId ?? null;

    const parentSubfolder =
      parentId === null
        ? undefined
        : findSubfolderById(
            parentDef.subfolders ?? [],
            parentId,
          );

    if (parentId !== null && !parentSubfolder) {
      setToast("Parent sub-folder not found.", "error");
      return;
    }

    const siblings =
      parentSubfolder?.subfolders ?? parentDef.subfolders ?? [];

    if (
      siblings.some(
        (subfolder) =>
          subfolder.name.trim().toLowerCase() ===
          trimmed.toLowerCase(),
      )
    ) {
      setToast(
        `A sub-folder named "${trimmed}" already exists in the selected parent.`,
        "warning",
      );
      return;
    }

    const assignedCode =
      letter?.trim() || String(siblings.length + 1);

    const folderId = Number(parentDef.id);

    if (!Number.isInteger(folderId) || folderId <= 0) {
      setToast("Invalid folder ID.", "error");
      return;
    }

    const subfolderDescription =
      description.trim() ||
      `Controlled document records for ${trimmed}`;

    try {
      const response = await api.post<CreateSubFolderResponse>(
        "/dms-sub-folder/create",
        {
          folder_id: folderId,
          parent_sub_folder_id: parentId,
          sub_folder_code: assignedCode,
          sub_folder_name: trimmed,
          sub_folder_description: subfolderDescription,
          status: "ACTIVE",
          created_by: getLoggedInUserId(),
        },
      );

      if (response.data.status !== "success") {
        setToast(
          response.data.message || "Failed to create sub-folder.",
          "error",
        );
        return;
      }

      await fetchFolders();

      setExpandedFolders((previous) => ({
        ...previous,
        [parentFolderName]: true,
      }));

      if (createSubSubfolderFor?.parentSubfolderPath) {
        const fullP = createSubSubfolderFor.parentSubfolderPath;
        for (let i = 0; i < fullP.length; i++) {
          const slice = fullP.slice(0, i + 1);
          setExpandedPaths?.((prev) => ({
            ...prev,
            [JSON.stringify([parentFolderName, ...slice])]: true,
          }));
          setExpandedSubfolders((prev) => ({
            ...prev,
            [`${parentFolderName}:::${slice.join(":::")}`]: true,
          }));
        }
      } else if (parentSubfolder) {
        setExpandedPaths?.((prev) => ({
          ...prev,
          [JSON.stringify([parentFolderName, parentSubfolder.name])]: true,
        }));
        setExpandedSubfolders((previous) => ({
          ...previous,
          [`${parentFolderName}:::${parentSubfolder.name}`]: true,
        }));
      }

      setToast(
        `Sub-folder "${trimmed}" created successfully.`,
        "success",
      );

      setCreateSubfolderForFolder(null);
      setCreateSubSubfolderFor(null);
    } catch (error: any) {
      console.error("Failed to create DMS sub-folder:", error);

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to create sub-folder.";

      setToast(message, "error");
    }
  };

  const handleCreateSubSubfolder = async (
    parentFolderName: string,
    parentSubfolderName: string,
    name: string,
    description: string,
    numberCode?: string,
  ) => {
    const parentFolder = folders.find(
      (folder) => folder.name === parentFolderName,
    );

    if (!parentFolder) {
      setToast("Parent folder not found.", "error");
      return;
    }

    let parentSubfolder: SubfolderInfo | undefined;

    // Prefer ID or path from createSubSubfolderFor state if available
    if (createSubSubfolderFor) {
      if (createSubSubfolderFor.parentSubfolderId) {
        parentSubfolder = findSubfolderById(
          parentFolder.subfolders ?? [],
          createSubSubfolderFor.parentSubfolderId,
        );
      } else if (createSubSubfolderFor.parentSubfolderPath && createSubSubfolderFor.parentSubfolderPath.length > 0) {
        parentSubfolder = findSubfolderByPath(
          parentFolder.subfolders ?? [],
          createSubSubfolderFor.parentSubfolderPath,
        );
      }
    }

    // Fallback: search subfolders hierarchy by name
    if (!parentSubfolder) {
      const findSubfolderByName = (
        subfolders: SubfolderInfo[],
        targetName: string,
      ): SubfolderInfo | undefined => {
        for (const subfolder of subfolders) {
          if (subfolder.name === targetName) {
            return subfolder;
          }

          const found = findSubfolderByName(
            subfolder.subfolders ?? [],
            targetName,
          );

          if (found) return found;
        }

        return undefined;
      };

      parentSubfolder = findSubfolderByName(
        parentFolder.subfolders ?? [],
        parentSubfolderName,
      );
    }

    if (!parentSubfolder) {
      setToast("Parent sub-folder not found.", "error");
      return;
    }

    const parentSubfolderId = Number(
      parentSubfolder.id ?? parentSubfolder.sub_folder_id,
    );

    if (
      !Number.isInteger(parentSubfolderId) ||
      parentSubfolderId <= 0
    ) {
      setToast("The selected parent folder has an invalid ID.", "error");
      return;
    }

    await handleCreateSubfolder(
      parentFolderName,
      name,
      description,
      numberCode,
      parentSubfolderId,
    );
  };

  const handleRenameClick = (
    targetOrType: "folder" | "subfolder" | "subsubfolder" | SubfolderTarget,
    currentName?: string,
    parentFolder?: string | undefined,
    parentSubfolder?: string | undefined,
    subfolderPath?: string[],
    subfolderId?: number,
  ) => {
    if (role !== "Admin") {
      setToast("Only administrators can rename folders.");
      return;
    }

    if (typeof targetOrType === "object" && targetOrType !== null) {
      setRenameTarget(targetOrType);
      return;
    }

    const type = targetOrType;
    setRenameTarget({
      type,
      parentFolder,
      parentSubfolder,
      subfolderPath,
      subfolderId,
      currentName: currentName || "",
    });
  };

  const handleEditDescriptionClick = (
    targetOrType: "folder" | "subfolder" | "subsubfolder" | SubfolderTarget,
    currentName?: string,
    parentFolder?: string,
    parentSubfolder?: string,
    subfolderPath?: string[],
    subfolderId?: number,
  ) => {
    if (role !== "Admin") {
      setToast("Only administrators can edit folder descriptions.", "error");
      return;
    }

    let target: SubfolderTarget;
    if (typeof targetOrType === "object" && targetOrType !== null) {
      target = targetOrType;
    } else {
      target = {
        type: targetOrType,
        currentName: currentName || "",
        parentFolder,
        parentSubfolder,
        subfolderPath,
        subfolderId,
      };
    }

    let description = "";

    if (target.type === "folder") {
      const folder = folders.find((f) => f.name === target.currentName);

      if (!folder) {
        setToast("Folder not found.", "error");
        return;
      }

      description = folder.description || "";
    } else {
      // Subfolder at any depth
      const parentFolderDef = folders.find((f) => f.name === target.parentFolder);
      if (!parentFolderDef) {
        setToast("Parent folder not found.", "error");
        return;
      }

      const subfolder = resolveSubfolderTarget(
        parentFolderDef,
        target,
      );

      if (!subfolder) {
        setToast(
          "Sub-folder not found. Please refresh and try again.",
          "error",
        );
        return;
      }

      const resolvedId = Number(
        subfolder.id ?? subfolder.sub_folder_id,
      );

      if (!Number.isInteger(resolvedId) || resolvedId <= 0) {
        setToast("Invalid sub-folder ID.", "error");
        return;
      }

      target.subfolderId = resolvedId;

      description = subfolder.description || "";
    }

    setDescriptionTarget({
      ...target,
      currentDescription: description,
    });
  };

  const handleConfirmDescriptionUpdate = async (
    newDescription: string,
  ) => {
    if (!descriptionTarget) return;

    const description = newDescription.trim();

    try {
      if (descriptionTarget.type === "folder") {
        const folder = folders.find(
          (f) => f.name === descriptionTarget.currentName,
        );

        if (!folder) {
          setToast("Folder not found.", "error");
          return;
        }

        const folderId = Number(folder.id);

        if (!Number.isInteger(folderId) || folderId <= 0) {
          setToast("Invalid folder ID.", "error");
          return;
        }

        const response = await api.put<UpdateFolderResponse>(
          `/dms-folder/update/${folderId}`,
          {
            folder_name: folder.name,
            folder_description: description,
            folder_icon: "Folder",
            updated_by: getLoggedInUserId(),
          },
        );

        if (response.data.status !== "success") {
          setToast(
            response.data.message || "Failed to update folder description.",
            "error",
          );
          return;
        }

        setFolders((prev) =>
          prev.map((f) =>
            f.name === folder.name
              ? { ...f, description }
              : f,
          ),
        );

        setToast("Folder description updated successfully.", "success");
      } else {
        // Subfolder or sub-subfolder at any depth
        const parentFolder = folders.find(
          (f) => f.name === descriptionTarget.parentFolder,
        );

        if (!parentFolder) {
          setToast("Parent folder not found.", "error");
          return;
        }

        const subfolder = resolveSubfolderTarget(
          parentFolder,
          descriptionTarget,
        );

        if (!subfolder) {
          setToast(
            "Sub-folder not found. Please refresh and try again.",
            "error",
          );
          return;
        }

        const subFolderId = Number(
          subfolder.id ?? subfolder.sub_folder_id,
        );

        if (!Number.isInteger(subFolderId) || subFolderId <= 0) {
          setToast("Invalid sub-folder ID.", "error");
          return;
        }

        const response = await api.put<UpdateSubFolderResponse>(
          `/dms-sub-folder/update/${subFolderId}`,
          {
            folder_id: Number(parentFolder.id),
            parent_sub_folder_id:
              subfolder.parent_sub_folder_id ?? null,
            sub_folder_code: subfolder.code || subfolder.letter || "",
            sub_folder_name: subfolder.name,
            sub_folder_description: description,
            status: subfolder.status || "ACTIVE",
            updated_by: getLoggedInUserId(),
          },
        );

        if (response.data.status !== "success") {
          setToast(
            response.data.message ||
              "Failed to update sub-folder description.",
            "error",
          );
          return;
        }

        // Recursively update subfolder in React state
        setFolders((prev) =>
          prev.map((folder) => {
            if (folder.name !== descriptionTarget.parentFolder) {
              return folder;
            }

            return {
              ...folder,
              subfolders: updateSubfolderTree(
                folder.subfolders ?? [],
                subFolderId,
                (sf) => ({ ...sf, description }),
              ),
            };
          }),
        );

        setToast("Sub-folder description updated successfully.", "success");
      }

      setDescriptionTarget(null);

      // Refresh the backend hierarchy.
      await fetchFolders();
    } catch (error: any) {
      console.error("Failed to update folder description:", error);

      const detail = error?.response?.data?.detail;

      const message =
        (Array.isArray(detail)
          ? detail.map((item: { msg?: string }) => item.msg).join(", ")
          : typeof detail === "string"
            ? detail
            : null) ||
        error?.response?.data?.message ||
        "Failed to update description.";

      setToast(message, "error");
    }
  };

  const handleConfirmRename = async (newName: string) => {
    if (!renameTarget) return;
    const trimmed = newName.trim();
    if (!trimmed || trimmed === renameTarget.currentName) {
      setRenameTarget(null);
      return;
    }

    if (renameTarget.type === "folder") {
      const oldName = renameTarget.currentName;

      const folder = folders.find(
        (f) => f.name === oldName,
      );

      if (!folder) {
        setToast("Folder not found.");
        return;
      }

      const folderId = Number(folder.id);

      if (!folderId) {
        setToast("Invalid folder ID.");
        return;
      }

      // Duplicate name check
      if (
        folders.some(
          (f) =>
            f.name.toLowerCase() === trimmed.toLowerCase() &&
            f.name !== oldName,
        )
      ) {
        setToast(`A folder named "${trimmed}" already exists.`);
        return;
      }

      try {
        const response = await api.put<UpdateFolderResponse>(
          `/dms-folder/update/${folderId}`,
          {
            folder_name: trimmed,
            folder_description: folder.description || "",
            folder_icon: "Folder",
            updated_by: getLoggedInUserId(),
          },
        );

        if (response.data.status !== "success") {
          setToast(
            response.data.message || "Failed to update folder.",
          );
          return;
        }
      } catch (error: any) {
        console.error("Failed to update DMS folder:", error);

        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to update folder.";

        setToast(message);
        return;
      }

      // Update frontend state
      setFolders((prev) =>
        prev.map((f) =>
          f.name === oldName
            ? { ...f, name: trimmed }
            : f,
        ),
      );

      setDocuments((prev) =>
        prev.map((d) =>
          d.folder === oldName
            ? { ...d, folder: trimmed }
            : d,
        ),
      );

      setPublishers?.((prev) =>
        prev.map((p) => ({
          ...p,
          assignedFolders: p.assignedFolders.map((f) =>
            f === oldName ? trimmed : f,
          ),
        })),
      );

      if (selectedFolder === oldName) {
        setSelectedFolder(trimmed);

        if (selectedSubfolder) {
          setActiveFolder(
            selectedSubSubfolder
              ? `${trimmed} / ${selectedSubfolder} / ${selectedSubSubfolder}`
              : `${trimmed} / ${selectedSubfolder}`,
          );
        } else {
          setActiveFolder(trimmed);
        }
      }

      setExpandedFolders((prev) => {
        if (prev[oldName] !== undefined) {
          const copy = { ...prev };
          copy[trimmed] = Boolean(copy[oldName]);
          delete copy[oldName];
          return copy;
        }

        return prev;
      });

      setToast(`Folder renamed to "${trimmed}".`);
      setRenameTarget(null);
    } else {
      // Subfolder or sub-subfolder at any depth
      const parent = renameTarget.parentFolder;
      const oldName = renameTarget.currentName;

      if (!parent) {
        setToast("Parent folder not found.");
        return;
      }

      const parentDef = folders.find((f) => f.name === parent);
      if (!parentDef) {
        setToast("Parent folder not found.");
        return;
      }

      const subfolder = resolveSubfolderTarget(
        parentDef,
        renameTarget,
      );

      if (!subfolder) {
        setToast(
          "Sub-folder not found. Please refresh and try again.",
          "error",
        );
        return;
      }

      const subFolderId = Number(
        subfolder.id ?? subfolder.sub_folder_id,
      );

      if (!Number.isInteger(subFolderId) || subFolderId <= 0) {
        setToast("Invalid sub-folder ID.", "error");
        return;
      }

      try {
        const response = await api.put<UpdateSubFolderResponse>(
          `/dms-sub-folder/update/${subFolderId}`,
          {
            folder_id: Number(parentDef.id),
            parent_sub_folder_id:
              subfolder.parent_sub_folder_id ?? null,
            sub_folder_code: subfolder.code || subfolder.letter || "",
            sub_folder_name: trimmed,
            sub_folder_description: subfolder.description || "",
            status: subfolder.status || "ACTIVE",
            updated_by: getLoggedInUserId(),
          },
        );

        if (response.data.status !== "success") {
          setToast(
            response.data.message || "Failed to update sub-folder.",
          );
          return;
        }
      } catch (error: any) {
        console.error("Failed to update DMS sub-folder:", error);
        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to update sub-folder.";
        setToast(message);
        return;
      }

      // Update frontend folders state recursively
      setFolders((prev) =>
        prev.map((f) => {
          if (f.name !== parent) {
            return f;
          }

          return {
            ...f,
            subfolders: updateSubfolderTree(
              f.subfolders ?? [],
              subFolderId,
              (sf) => ({ ...sf, name: trimmed }),
            ),
          };
        }),
      );

      // Update the selected navigation path if the renamed
      // subfolder is part of the currently selected path.
      if (selectedFolder === parent) {
        if (renameTarget.subfolderPath?.length) {
          const targetPath = renameTarget.subfolderPath;
          const targetDepth = targetPath.length;

          setSelectedSubfolderPath((currentPath) => {
            if (
              currentPath.length >= targetDepth &&
              targetPath.slice(0, targetDepth - 1).every((seg, idx) => seg === currentPath[idx]) &&
              currentPath[targetDepth - 1] === oldName
            ) {
              const updated = [...currentPath];
              updated[targetDepth - 1] = trimmed;
              setActiveFolder([parent, ...updated].join(" / "));
              return updated;
            }
            return currentPath;
          });
        }
      }

      // Update documents
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.folder !== parent) return d;
          let updated = d;
          if (d.subfolder === oldName) {
            updated = { ...updated, subfolder: trimmed };
          }
          if (d.subSubfolder) {
            if (d.subSubfolder === oldName) {
              updated = { ...updated, subSubfolder: trimmed };
            } else if (d.subSubfolder.includes(oldName)) {
              const segments = d.subSubfolder.split(" / ");
              const replaced = segments.map((s) => (s === oldName ? trimmed : s));
              updated = { ...updated, subSubfolder: replaced.join(" / ") };
            }
          }
          return updated;
        }),
      );

      // Update publishers
      setPublishers?.((prev) =>
        prev.map((p) => ({
          ...p,
          assignedSubfolders: p.assignedSubfolders.map((sf) =>
            sf === oldName ? trimmed : sf,
          ),
        })),
      );

      // Update selection if active
      if (selectedFolder === parent) {
        if (selectedSubfolder === oldName) {
          setSelectedSubfolder(trimmed);
          setActiveFolder(
            selectedSubSubfolder
              ? `${parent} / ${trimmed} / ${selectedSubSubfolder}`
              : `${parent} / ${trimmed}`,
          );
        } else if (selectedSubSubfolder === oldName) {
          setSelectedSubSubfolder(trimmed);
          setActiveFolder(`${parent} / ${selectedSubfolder} / ${trimmed}`);
        }
      }

      // Update expanded subfolders key
      setExpandedSubfolders((prev) => {
        const next: Record<string, boolean> = {};
        const oldPrefix = `${parent}:::`;
        for (const [key, val] of Object.entries(prev)) {
          if (key.startsWith(oldPrefix)) {
            const segments = key.split(":::");
            if (segments.includes(oldName)) {
              const updated = segments.map((s) => (s === oldName ? trimmed : s));
              next[updated.join(":::")] = val;
              continue;
            }
          }
          next[key] = val;
        }
        return next;
      });

      // Update expanded paths
      if (setExpandedPaths) {
        setExpandedPaths((prev) => {
          const next: Record<string, boolean> = {};
          for (const [key, val] of Object.entries(prev)) {
            try {
              const parsed = JSON.parse(key);
              if (Array.isArray(parsed) && parsed[0] === parent && parsed.includes(oldName)) {
                const updated = parsed.map((s) => (s === oldName ? trimmed : s));
                next[JSON.stringify(updated)] = val;
                continue;
              }
            } catch {
              // Ignore invalid JSON
            }
            next[key] = val;
          }
          return next;
        });
      }

      await fetchFolders();

      setToast(`Sub-folder renamed to "${trimmed}".`);
      setRenameTarget(null);
    }
  };

  const handleDeleteFolderClick = (folder: FolderDefinition) => {
    if (role !== "Admin") {
      setToast("Only administrators can delete folders.");
      return;
    }
    const docCount = documents.filter((d) => d.folder === folder.name).length;
    setDeleteTarget({
      type: "folder",
      name: folder.name,
      currentName: folder.name,
      docCount,
    });
  };

  const handleDeleteSubfolderClick = (
    folderOrTarget: string | SubfolderTarget,
    subfolderName?: string,
    subfolderPath?: string[],
    subfolderId?: number,
  ) => {
    if (role !== "Admin") {
      setToast("Only administrators can delete sub-folders.");
      return;
    }

    let target: SubfolderTarget;
    if (typeof folderOrTarget === "object" && folderOrTarget !== null) {
      target = folderOrTarget;
    } else {
      target = {
        type: "subfolder",
        parentFolder: folderOrTarget,
        currentName: subfolderName || "",
        subfolderPath,
        subfolderId,
      };
    }

    const folderName = target.parentFolder || "";
    const name = target.currentName;
    const docCount = documents.filter((d) => {
      if (d.folder !== folderName) return false;
      if (d.subfolder === name) return true;
      if (d.subSubfolder) {
        if (d.subSubfolder === name) return true;
        const parts = d.subSubfolder.split(" / ");
        if (parts.includes(name)) return true;
      }
      return false;
    }).length;

    setDeleteTarget({
      ...target,
      name,
      docCount,
    });
  };

  const handleDeleteSubSubfolderClick = (
    folderName: string,
    subfolderName: string,
    subSubfolderName: string,
    subfolderPath?: string[],
    subfolderId?: number,
  ) => {
    if (role !== "Admin") {
      setToast("Only administrators can delete sub-sub folders.");
      return;
    }
    const docCount = documents.filter((d) => {
      if (d.folder !== folderName) return false;
      if (d.subfolder === subSubfolderName) return true;
      if (d.subSubfolder) {
        if (d.subSubfolder === subSubfolderName) return true;
        const parts = d.subSubfolder.split(" / ");
        if (parts.includes(subSubfolderName)) return true;
      }
      return false;
    }).length;
    setDeleteTarget({
      type: "subsubfolder",
      parentFolder: folderName,
      parentSubfolder: subfolderName,
      subfolderPath: subfolderPath ?? [subfolderName, subSubfolderName],
      subfolderId,
      currentName: subSubfolderName,
      name: subSubfolderName,
      docCount,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteTarget.docCount > 0) return;

    // ============================================
    // DELETE PRIMARY FOLDER
    // ============================================
    if (deleteTarget.type === "folder") {
      const folder = folders.find(
        (f) => f.name === deleteTarget.name,
      );

      if (!folder) {
        setToast("Folder not found.");
        return;
      }

      const folderId = Number(folder.id);

      if (!folderId) {
        setToast("Invalid folder ID.");
        return;
      }

      try {
        const response =
          await api.delete<UpdateFolderResponse>(
            `/dms-folder/delete/${folderId}`,
            {
              params: {
                deleted_by: getLoggedInUserId(),
              },
            },
          );

        if (response.data.status !== "success") {
          setToast(
            response.data.message ||
              "Failed to delete folder.",
          );
          return;
        }

        // Update frontend only after successful API response
        setFolders((prev) =>
          prev.filter(
            (f) => f.name !== deleteTarget.name,
          ),
        );

        if (selectedFolder === deleteTarget.name) {
          handleSelectFolder(null);
        }

        setToast(
          `Folder "${deleteTarget.name}" deleted successfully.`,
        );

        setDeleteTarget(null);
      } catch (error: any) {
        console.error(
          "Failed to delete DMS folder:",
          error,
        );

        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to delete folder.";

        setToast(message);
      }

      return;
    }

    // ============================================
    // DELETE SUB-FOLDER (ANY DEPTH)
    // ============================================
    if (deleteTarget.parentFolder) {
      const parentFolder = folders.find(
        (f) => f.name === deleteTarget.parentFolder,
      );

      if (!parentFolder) {
        setToast("Parent folder not found.");
        return;
      }

      const subfolder = resolveSubfolderTarget(
        parentFolder,
        deleteTarget,
      );

      if (!subfolder) {
        setToast(
          "Sub-folder not found. Please refresh and try again.",
          "error",
        );
        return;
      }

      const subFolderId = Number(
        subfolder.id ?? subfolder.sub_folder_id,
      );

      if (!Number.isInteger(subFolderId) || subFolderId <= 0) {
        setToast("Invalid sub-folder ID.", "error");
        return;
      }

      try {
        const response =
          await api.delete<UpdateSubFolderResponse>(
            `/dms-sub-folder/delete/${subFolderId}`,
            {
              params: {
                deleted_by: getLoggedInUserId(),
              },
            },
          );

        if (response.data.status !== "success") {
          setToast(
            response.data.message ||
              "Failed to delete sub-folder.",
          );
          return;
        }

        // Recursively remove from tree after successful API response
        setFolders((prev) =>
          prev.map((f) => {
            if (f.name !== deleteTarget.parentFolder) {
              return f;
            }

            return {
              ...f,
              subfolders: removeSubfolderFromTree(
                f.subfolders ?? [],
                subFolderId,
              ),
            };
          }),
        );

        if (selectedFolder === deleteTarget.parentFolder) {
          const isDeletedInSelectedPath =
            selectedSubfolderPath.includes(deleteTarget.name) ||
            selectedSubfolder === deleteTarget.name ||
            selectedSubSubfolder === deleteTarget.name;

          if (isDeletedInSelectedPath) {
            setSelectedSubfolder(null);
            setSelectedSubSubfolder(null);
            setSelectedSubfolderPath([]);
            setActiveFolder(deleteTarget.parentFolder);
          }
        }

        await fetchFolders();

        setToast(
          `Sub-folder "${deleteTarget.name}" deleted successfully.`,
        );

        setDeleteTarget(null);
      } catch (error: any) {
        console.error(
          "Failed to delete DMS sub-folder:",
          error,
        );

        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to delete sub-folder.";

        setToast(message);
      }

      return;
    }
  };

  return {
    showCreateFolderModal,
    setShowCreateFolderModal,
    createSubfolderForFolder,
    setCreateSubfolderForFolder,
    createSubSubfolderFor,
    setCreateSubSubfolderFor,
    renameTarget,
    setRenameTarget,
    descriptionTarget,
    setDescriptionTarget,
    handleEditDescriptionClick,
    handleConfirmDescriptionUpdate,
    deleteTarget,
    setDeleteTarget,
    handleCreateFolder,
    handleCreateSubfolder,
    handleCreateSubSubfolder,
    handleRenameClick,
    handleConfirmRename,
    handleDeleteFolderClick,
    handleDeleteSubfolderClick,
    handleDeleteSubSubfolderClick,
    handleConfirmDelete,
  };
}
