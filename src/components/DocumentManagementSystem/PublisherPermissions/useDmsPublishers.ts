// Publisher management state and handlers.
// Extracted verbatim from useDmsWorkspace.ts – no behavioural changes.

import { useState, useCallback, useRef } from "react";
import api from "@/api/axiosInstance";
import type {
  Publisher,
  FolderDefinition,
  SubfolderInfo,
  EngineerUser,
  DmsGroupDropdownItem,
  DmsGroupDropdownResponse,
  DmsPublisherGetAllResponse,
  CreatePublisherResponse,
} from "../types";
import { getLoggedInUserId } from "../hooks/dmsUser";

const resolveToNumericFolderIds = (
  items: (string | number)[],
  folders: FolderDefinition[]
): number[] => {
  const result: number[] = [];
  for (const item of items) {
    if (typeof item === "number" && !isNaN(item) && item > 0) {
      result.push(item);
    } else if (typeof item === "string") {
      const parsed = Number(item);
      if (!isNaN(parsed) && parsed > 0) {
        result.push(parsed);
      } else {
        const found = folders.find(
          (f) => f.name.toLowerCase() === item.toLowerCase()
        );
        const id = found
          ? typeof found.folder_id === "number"
            ? found.folder_id
            : Number(found.id)
          : null;
        if (id !== null && !isNaN(id) && id > 0) result.push(id);
      }
    }
  }
  return Array.from(new Set(result));
};

const resolveToNumericSubfolderIds = (
  items: (string | number)[],
  folders: FolderDefinition[]
): number[] => {
  const result: number[] = [];

  const findSubIdByPath = (path: string): number | null => {
    const parts = path.split(":::").filter(Boolean);

    if (parts.length < 2) {
      return null;
    }

    const [folderName, ...subfolderParts] = parts;

    const folder = folders.find(
      (f) => f.name.toLowerCase() === folderName.toLowerCase()
    );

    if (!folder) {
      return null;
    }

    let currentSubfolders: SubfolderInfo[] = folder.subfolders ?? [];
    let matchedId: number | null = null;

    for (const part of subfolderParts) {
      const matchedSubfolder = currentSubfolders.find(
        (sf) => sf.name.toLowerCase() === part.toLowerCase()
      );

      if (!matchedSubfolder) {
        return null;
      }

      const id =
        typeof matchedSubfolder.sub_folder_id === "number"
          ? matchedSubfolder.sub_folder_id
          : Number(matchedSubfolder.id);

      if (!Number.isInteger(id) || id <= 0) {
        return null;
      }

      matchedId = id;

      currentSubfolders =
        matchedSubfolder.subfolders ??
        matchedSubfolder.children ??
        matchedSubfolder.sub_folders ??
        matchedSubfolder.sub_sub_folders ??
        [];
    }

    return matchedId;
  };

  for (const item of items) {
    if (typeof item === "number" && Number.isInteger(item) && item > 0) {
      result.push(item);
      continue;
    }

    if (typeof item !== "string") {
      continue;
    }

    const parsed = Number(item);

    if (Number.isInteger(parsed) && parsed > 0) {
      result.push(parsed);
      continue;
    }

    const id = findSubIdByPath(item);

    if (id !== null) {
      result.push(id);
    }
  }

  return Array.from(new Set(result));
};

export function useDmsPublishers({
  setToast,
  initialPublishers = [],
  folders = [],
}: {
  setToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
  initialPublishers?: Publisher[];
  folders?: FolderDefinition[];
}) {
  const foldersRef = useRef(folders);
  foldersRef.current = folders;

  const [publishers, setPublishers] = useState<Publisher[]>(initialPublishers);
  const [showCreatePublisherModal, setShowCreatePublisherModal] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [publisherToDelete, setPublisherToDelete] = useState<Publisher | null>(null);
  const [publisherSearch, setPublisherSearch] = useState("");
  const [publisherFolderFilter, setPublisherFolderFilter] = useState("All");

  const [adminGovernanceMode, setAdminGovernanceMode] = useState<"publisher" | "folder">(
    "publisher",
  );
  const [selectedFolderForPublishers, setSelectedFolderForPublishers] =
    useState<FolderDefinition | null>(null);
  const [selectedSubfolderForPublishers, setSelectedSubfolderForPublishers] = useState<{
    folder: FolderDefinition;
    subfolderName: string;
    subfolderId?: number;
    subfolderPath?: string[];
  } | null>(null);
  const [folderModeSearch, setFolderModeSearch] = useState("");
  const [folderModeFilter, setFolderModeFilter] = useState<
    "All" | "Multi" | "Single" | "Unassigned"
  >("All");

  const [publisherDropdown, setPublisherDropdown] = useState<DmsGroupDropdownItem[]>([]);
  const [engineersList, setEngineersList] = useState<EngineerUser[]>([]);

  const fetchPublisherDropdown = useCallback(async () => {
    try {
      const response = await api.get<DmsGroupDropdownResponse>(
        "/dms-group/dropdown"
      );

      if (response.data.status === "success" && Array.isArray(response.data.data)) {
        setPublisherDropdown(response.data.data);
        const mappedEngineers: EngineerUser[] = response.data.data.map((user: any) => ({
          id: String(user.user_id),
          name: user.user_name,
          role: user.designation || user.role_name || "",
          department: user.role_name || "",
          location: user.station_name || "",
          email: user.email || "",
        }));
        setEngineersList(mappedEngineers);
      }
    } catch (error) {
      console.error("Failed to fetch publisher dropdown:", error);
    }
  }, []);

  const fetchPublishers = useCallback(async () => {
    try {
      const response = await api.get<DmsPublisherGetAllResponse>(
        "/dms-publisher/get-all"
      );

      if (response.data.status !== "success" || !Array.isArray(response.data.data)) {
        return;
      }

      const mappedPublishers: Publisher[] = response.data.data.map((item) => {
        const currentFolders = foldersRef.current;
        const assignedHierarchy =
          (item as any).assigned_hierarchy ??
          (item as any).assigned_folders ??
          [];

        // 1. Collect numeric folder IDs
        const assignedFolderIds = resolveToNumericFolderIds(
          [
            ...assignedHierarchy.map((f: any) =>
              typeof f === "object" ? f?.folder_id ?? f?.id : f
            ),
            ...((item as any).assigned_folders ?? []).map((f: any) =>
              typeof f === "object" ? f?.folder_id ?? f?.id : f
            ),
          ],
          currentFolders
        );

        // 2. Collect numeric subfolder IDs
        const assignedSubfolderIds = resolveToNumericSubfolderIds(
          [
            ...((item as any).assigned_subfolders ?? []).map((sf: any) =>
              typeof sf === "object" ? sf?.sub_folder_id ?? sf?.id : sf
            ),
            ...assignedHierarchy.flatMap((f: any) =>
              (f.subfolders ?? []).flatMap((sf: any) => [
                sf?.sub_folder_id ?? sf?.id ?? sf,
                ...(sf.sub_sub_folders ?? []).map(
                  (ssf: any) => ssf?.sub_folder_id ?? ssf?.id ?? ssf
                ),
              ])
            ),
          ],
          currentFolders
        );

        // 3. Collect folder display names
        const hierarchyFolderNames = assignedHierarchy.map((folder: any) =>
          typeof folder === "string" ? folder : folder?.folder_name
        );
        const rawFolderNames = ((item as any).assigned_folders ?? []).map(
          (folder: any) =>
            typeof folder === "string" ? folder : folder?.folder_name
        );
        const idFolderNames = assignedFolderIds.map((fId) => {
          const f = currentFolders.find(
            (folder) =>
              (typeof folder.folder_id === "number"
                ? folder.folder_id
                : Number(folder.id)) === fId
          );
          return f ? f.name : "";
        });

        const assignedFolders: string[] = Array.from(
          new Set(
            [
              ...hierarchyFolderNames,
              ...rawFolderNames,
              ...idFolderNames,
            ].filter(
              (name: unknown): name is string =>
                typeof name === "string" && name.length > 0
            )
          )
        );

        // 4. Collect assigned subfolder paths recursively.
        const nestedSubfolders: string[] = [];

        const collectAssignedSubfolders = (
          subfolders: any[],
          parentPath: string,
        ) => {
          subfolders.forEach((subfolder) => {
            if (!subfolder) return;

            const name =
              typeof subfolder === "string"
                ? subfolder
                : subfolder.sub_folder_name ??
                  subfolder.sub_sub_folder_name ??
                  subfolder.name ??
                  "";

            if (!name) return;

            const currentPath = name.includes(":::")
              ? name
              : parentPath
                ? `${parentPath}:::${name}`
                : name;

            nestedSubfolders.push(currentPath);

            const children =
              subfolder.sub_folders ??
              subfolder.subfolders ??
              subfolder.sub_sub_folders ??
              subfolder.children ??
              [];

            if (Array.isArray(children) && children.length > 0) {
              collectAssignedSubfolders(children, currentPath);
            }
          });
        };

        assignedHierarchy.forEach((folder: any) => {
          if (!folder || typeof folder === "string") return;

          const folderName = folder.folder_name ?? folder.name ?? "";

          collectAssignedSubfolders(
            folder.sub_folders ??
              folder.subfolders ??
              [],
            folderName,
          );
        });

        // Include only explicit, complete subfolder paths.
        // Resolve entries containing IDs separately using the actual folder hierarchy.
        const separateSubfolders: string[] = (
          (item as any).assigned_subfolders ?? []
        )
          .map((subfolder: any): string => {
            if (typeof subfolder === "string") {
              const parts = subfolder.split(":::").filter(Boolean);

              return parts.length >= 2 ? parts.join(":::") : "";
            }

            if (!subfolder || typeof subfolder !== "object") {
              return "";
            }

            const explicitPath =
              subfolder.path ??
              subfolder.subfolder_path ??
              subfolder.full_path;

            if (typeof explicitPath === "string") {
              const parts = explicitPath.split(":::").filter(Boolean);

              return parts.length >= 2 ? parts.join(":::") : "";
            }

            const name =
              subfolder.sub_folder_name ??
              subfolder.sub_sub_folder_name ??
              subfolder.name ??
              "";

            if (typeof name === "string" && name.includes(":::")) {
              const parts = name.split(":::").filter(Boolean);

              return parts.length >= 2 ? parts.join(":::") : "";
            }

            // Do not construct a path from folder_name alone.
            // It may represent the root folder rather than the actual parent.
            return "";
          })
          .filter(Boolean);

        // Resolve assigned subfolder IDs to their complete hierarchy paths.
        const idSubfolderNames = assignedSubfolderIds
          .map((subfolderId): string => {
            for (const folder of currentFolders) {
              const findSubfolderPath = (
                subfolders: SubfolderInfo[] = [],
                parentPath: string
              ): string | null => {
                for (const subfolder of subfolders) {
                  const id =
                    typeof subfolder.sub_folder_id === "number"
                      ? subfolder.sub_folder_id
                      : Number(subfolder.id);

                  const currentPath = `${parentPath}:::${subfolder.name}`;

                  if (id === subfolderId) {
                    return currentPath;
                  }

                  const children =
                    subfolder.subfolders ??
                    subfolder.children ??
                    subfolder.sub_folders ??
                    subfolder.sub_sub_folders ??
                    [];

                  const nestedPath = findSubfolderPath(
                    children,
                    currentPath
                  );

                  if (nestedPath) {
                    return nestedPath;
                  }
                }

                return null;
              };

              const path = findSubfolderPath(
                folder.subfolders ?? [],
                folder.name
              );

              if (path) {
                return path;
              }
            }

            return "";
          })
          .filter(Boolean);

        const assignedSubfolders = Array.from(
          new Set([
            ...nestedSubfolders,
            ...separateSubfolders,
            ...idSubfolderNames,
          ]),
        );

        console.group(`Publisher: ${item.publisher_name}`);
        console.log("Assigned hierarchy:", assignedHierarchy);
        console.log("Nested subfolders:", nestedSubfolders);
        console.log("Separate subfolders:", separateSubfolders);
        console.log("Subfolder paths resolved from IDs:", idSubfolderNames);
        console.log("Final assigned folders:", assignedFolders);
        console.log("Final assigned subfolders:", assignedSubfolders);
        console.groupEnd();

        return {
          id: String(item.publisher_id),
          name: item.publisher_name,
          email: item.publisher_email,
          department: item.publisher_dept,
          location: item.publisher_station_location,
          publisherUserId: item.publisher_user_id,
          publisherStationId: item.publisher_station_id,
          assignedFolders,
          assignedSubfolders,
          assignedFolderIds,
          assignedSubfolderIds,
          createdDate: item.created_at,
          status: item.status,
        };
      });

      setPublishers(mappedPublishers);
    } catch (error) {
      console.error("Failed to fetch publishers:", error);
    }
  }, []);

  const fetchPublisherDetails = useCallback(async (publisherId: number | string) => {
    try {
      const response = await api.get(
        `/dms-publisher/get/${publisherId}`,
      );

      if (response.data.status === "success" && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error("Failed to fetch publisher details:", error);
      return null;
    }
  }, []);

  const handleSavePublisher = async (pub: Publisher) => {
    try {
      const adminUserId = getLoggedInUserId();

      if (adminUserId === null) {
        setToast("Unable to identify the logged-in user. Please log in again.", "error");
        return;
      }

      const assignedFolderIds = resolveToNumericFolderIds(
        pub.assignedFolderIds ?? pub.assignedFolders,
        foldersRef.current
      );
      const assignedSubfolderIds = resolveToNumericSubfolderIds(
        pub.assignedSubfolderIds ?? pub.assignedSubfolders,
        foldersRef.current
      );

      // =========================
      // UPDATE PUBLISHER
      // =========================
      const isEditing = Boolean(editingPublisher || (pub.id && !pub.id.startsWith("pub-")));
      const publisherId = Number(editingPublisher?.id || pub.id);

      if (isEditing && !isNaN(publisherId) && publisherId > 0) {
        await api.put(
          `/dms-publisher/update/${publisherId}`,
          {
            publisher_user_id: pub.publisherUserId || 1,
            publisher_name: pub.name,
            publisher_email: pub.email,
            publisher_dept: pub.department,
            publisher_station_location: pub.location,
            publisher_station_id: pub.publisherStationId || 1,
            status: "ACTIVE",
            assigned_folders: assignedFolderIds,
            assigned_subfolders: assignedSubfolderIds,
            updated_by: adminUserId,
          }
        );

        await fetchPublishers();

        setShowCreatePublisherModal(false);
        setEditingPublisher(null);

        setToast(
          `Publisher "${pub.name}" updated successfully.`,
          "success"
        );

        return;
      }

      // =========================
      // CREATE PUBLISHER
      // =========================
      const response = await api.post<CreatePublisherResponse>(
        "/dms-publisher/create",
        {
          publisher_user_id: pub.publisherUserId || 1,
          publisher_name: pub.name,
          publisher_email: pub.email,
          publisher_dept: pub.department,
          publisher_station_location: pub.location,
          publisher_station_id: pub.publisherStationId || 1,
          status: "ACTIVE",
          assigned_folders: assignedFolderIds,
          assigned_subfolders: assignedSubfolderIds,
          created_by: adminUserId,
        }
      );

      if (response.data.status !== "success") {
        setToast("Failed to create publisher.", "error");
        return;
      }

      await fetchPublishers();

      setShowCreatePublisherModal(false);
      setEditingPublisher(null);

      setToast(
        `Publisher "${pub.name}" created successfully.`,
        "success"
      );
    } catch (error: any) {
      console.error("Failed to save publisher:", error);

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to save publisher.";

      const errorMessage = Array.isArray(message)
        ? message.map((item: any) => item.msg).join(", ")
        : message;

      setToast(errorMessage, "error");
    }
  };

  const handleDeletePublisher = async (pubId: string) => {
    const pub = publishers.find((p) => p.id === pubId);

    if (!pub) {
      setToast("Publisher not found.", "error");
      return;
    }

    const numericPublisherId = Number(pubId);

    if (!Number.isInteger(numericPublisherId)) {
      setToast("Invalid publisher ID.", "error");
      return;
    }

    try {
      await api.delete(
        `/dms-publisher/delete/${numericPublisherId}`,
        {
          params: {
            deleted_by: getLoggedInUserId(),
          },
        }
      );

      // Refetch from backend instead of local state update
      await fetchPublishers();

      setPublisherToDelete(null);

      setToast(
        `Publisher "${pub.name}" deleted successfully.`,
        "success"
      );
    } catch (error: any) {
      console.error("Failed to delete publisher:", error);

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to delete publisher.";

      const errorMessage = Array.isArray(message)
        ? message.map((item: any) => item.msg).join(", ")
        : message;

      setToast(errorMessage, "error");
    }
  };

  const isPublisherAssignedToSubfolder = (
    pub: Publisher,
    folderName: string,
    subfolderName: string,
    subfolderId?: number,
    subfolderPath?: string[],
  ): boolean => {
    if (!pub.assignedFolders.includes(folderName)) return false;
    if (!pub.assignedSubfolders || pub.assignedSubfolders.length === 0) return false;
    if (
      subfolderId &&
      ((pub.assignedSubfolders as any).includes(subfolderId) ||
        pub.assignedSubfolders.includes(String(subfolderId)))
    ) {
      return true;
    }
    if (subfolderPath && subfolderPath.length > 0) {
      const fullKey = `${folderName}:::${subfolderPath.join(":::")}`;
      if (pub.assignedSubfolders.includes(fullKey)) return true;
    }
    return (
      pub.assignedSubfolders.includes(
        `${folderName}:::${subfolderPath?.join(":::") || subfolderName}`
      ) ||
      (
        (!subfolderPath || subfolderPath.length === 0) &&
        pub.assignedSubfolders.includes(`${folderName}:::${subfolderName}`)
      )
    );
  };

  const handleUpdateFolderPublishers = async (
    folderName: string,
    assignments: Record<string, { hasFolderAccess: boolean; assignedSubfolders: string[] }>,
  ) => {
    try {
      const updates = [];
      for (const [pubId, update] of Object.entries(assignments)) {
        const pub = publishers.find(p => p.id === pubId);
        if (!pub) continue;

        let nextFolders = pub.assignedFolders;
        let nextSubfolders = (pub.assignedSubfolders || []).filter(
          (sf) => !String(sf).startsWith(`${folderName}:::`) && sf !== folderName,
        );

        if (update.hasFolderAccess) {
          if (!nextFolders.includes(folderName)) {
            nextFolders = [...nextFolders, folderName];
          }
          const newSubs = update.assignedSubfolders.map((sf) => `${folderName}:::${sf}`);
          nextSubfolders = [...nextSubfolders, ...newSubs];
        } else {
          nextFolders = nextFolders.filter((f) => f !== folderName);
        }

        const folderIds = resolveToNumericFolderIds(nextFolders, foldersRef.current);
        const subfolderIds = resolveToNumericSubfolderIds(nextSubfolders, foldersRef.current);

        updates.push(
          api.put(`/dms-publisher/update/${pubId}`, {
            publisher_user_id: pub.publisherUserId || 1,
            publisher_name: pub.name,
            publisher_email: pub.email,
            publisher_dept: pub.department,
            publisher_station_location: pub.location,
            publisher_station_id: pub.publisherStationId || 1,
            status: pub.status || "ACTIVE",
            assigned_folders: folderIds,
            assigned_subfolders: subfolderIds,
            updated_by: getLoggedInUserId(),
          })
        );
      }

      await Promise.all(updates);
      await fetchPublishers();
      setToast(`Updated publisher permissions for folder "${folderName}"`, "success");
    } catch (error) {
      console.error("Failed to update folder publishers:", error);
      setToast("Failed to update folder publishers", "error");
    }
  };

  const handleUpdateSubfolderPublishers = async (
    folderName: string,
    subfolderName: string,
    assignedPublisherIds: string[],
    subfolderId?: number,
    subfolderPath?: string[],
  ) => {
    try {
      const subfolderKey =
        subfolderPath && subfolderPath.length > 0
          ? `${folderName}:::${subfolderPath.join(":::")}`
          : `${folderName}:::${subfolderName}`;
      
      const affectedPublishers = publishers.filter((pub) => {
        const currentlyAssigned =
          (pub.assignedSubfolders || []).includes(subfolderKey) ||
          (pub.assignedSubfolders || []).includes(subfolderName) ||
          (pub.assignedSubfolders || []).includes(
            `${folderName}:::${subfolderName}`
          ) ||
          (subfolderId
            ? (pub.assignedSubfolders || []).includes(String(subfolderId)) ||
              (pub.assignedSubfolders as any[]).includes(subfolderId)
            : false);
        const willBeAssigned = assignedPublisherIds.includes(pub.id);
        return currentlyAssigned !== willBeAssigned;
      });

      const updates = affectedPublishers.map((pub) => {
        const isAssigned = assignedPublisherIds.includes(pub.id);
        let nextFolders = pub.assignedFolders;
        let nextSubfolders = (pub.assignedSubfolders || []).filter(
          (sf) =>
            sf !== subfolderName &&
            sf !== subfolderKey &&
            sf !== `${folderName}:::${subfolderName}` &&
            (subfolderId
              ? sf !== String(subfolderId) && (sf as any) !== subfolderId
              : true)
        );

        if (isAssigned) {
          if (!nextFolders.includes(folderName)) {
            nextFolders = [...nextFolders, folderName];
          }
          nextSubfolders = [...nextSubfolders, subfolderKey];
        }

        const folderIds = resolveToNumericFolderIds(
          nextFolders,
          foldersRef.current
        );
        let subfolderIds = resolveToNumericSubfolderIds(
          nextSubfolders,
          foldersRef.current
        );
        if (isAssigned && subfolderId && !subfolderIds.includes(subfolderId)) {
          subfolderIds.push(subfolderId);
        }

        return api.put(`/dms-publisher/update/${pub.id}`, {
            publisher_user_id: pub.publisherUserId || 1,
            publisher_name: pub.name,
            publisher_email: pub.email,
            publisher_dept: pub.department,
            publisher_station_location: pub.location,
            publisher_station_id: pub.publisherStationId || 1,
            status: pub.status || "ACTIVE",
            assigned_folders: folderIds,
            assigned_subfolders: subfolderIds,
            updated_by: getLoggedInUserId(),
        });
      });

      await Promise.all(updates);
      await fetchPublishers();
      setToast(`Updated publisher assignments for "${folderName} / ${subfolderName}"`, "success");
    } catch(error) {
      console.error("Failed to update subfolder publishers:", error);
      setToast("Failed to update subfolder publishers", "error");
    }
  };

  const handleQuickRevokeFolderPublisher = async (folderName: string, publisherId: string) => {
    const pub = publishers.find((p) => p.id === publisherId);
    if (!pub) return;

    try {
      const nextFolders = pub.assignedFolders.filter((f) => f !== folderName);
      const nextSubfolders = (pub.assignedSubfolders || []).filter(
        (sf) => !String(sf).startsWith(`${folderName}:::`) && sf !== folderName,
      );

      const folderIds = resolveToNumericFolderIds(nextFolders, foldersRef.current);
      const subfolderIds = resolveToNumericSubfolderIds(nextSubfolders, foldersRef.current);

      await api.put(`/dms-publisher/update/${publisherId}`, {
            publisher_user_id: pub.publisherUserId || 1,
            publisher_name: pub.name,
            publisher_email: pub.email,
            publisher_dept: pub.department,
            publisher_station_location: pub.location,
            publisher_station_id: pub.publisherStationId || 1,
            status: pub.status || "ACTIVE",
            assigned_folders: folderIds,
            assigned_subfolders: subfolderIds,
            updated_by: getLoggedInUserId(),
      });

      await fetchPublishers();
      setToast(`Removed ${pub.name} from folder "${folderName}"`, "success");
    } catch (error) {
      console.error("Failed to revoke folder publisher:", error);
      setToast(`Failed to remove ${pub.name} from folder`, "error");
    }
  };

  return {
    publishers,
    setPublishers,
    showCreatePublisherModal,
    setShowCreatePublisherModal,
    editingPublisher,
    setEditingPublisher,
    publisherToDelete,
    setPublisherToDelete,
    publisherSearch,
    setPublisherSearch,
    publisherFolderFilter,
    setPublisherFolderFilter,
    adminGovernanceMode,
    setAdminGovernanceMode,
    selectedFolderForPublishers,
    setSelectedFolderForPublishers,
    selectedSubfolderForPublishers,
    setSelectedSubfolderForPublishers,
    folderModeSearch,
    setFolderModeSearch,
    folderModeFilter,
    setFolderModeFilter,
    publisherDropdown,
    fetchPublisherDropdown,
    fetchPublishers,
    fetchPublisherDetails,
    engineersList,
    handleSavePublisher,
    handleDeletePublisher,
    isPublisherAssignedToSubfolder,
    handleUpdateFolderPublishers,
    handleUpdateSubfolderPublishers,
    handleQuickRevokeFolderPublisher,
  };
}
