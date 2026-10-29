// DMS Folders state, hierarchy fetching, and folder selection hook.
// Extracted verbatim from useDmsWorkspace.ts – no behavioural changes.

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Folder } from "lucide-react"
import api from "@/api/axiosInstance"
import type {
  Role,
  MainTab,
  DocumentRecord,
  FolderDefinition,
  DmsHierarchyFolder,
  DmsHierarchyResponse,
  DmsHierarchyDocument,
} from "../types"
import { FOLDER_ICON_MAP } from "../initial-data"
import { mapApiDocumentToDocumentRecord } from "./dmsMappers"

interface DmsSubfolderApiItem {
  folder_id: number;
  sub_folder_id: number;
  parent_sub_folder_id?: number | null;
  sub_folder_code: string | null;
  sub_folder_name: string;
  sub_folder_description: string;
  status: string;
  is_deleted: boolean;
}

interface DmsSubfolderApiResponse {
  status: string;
  total_count: number;
  page: number;
  limit: number;
  data: DmsSubfolderApiItem[];
}

function buildSubfolderHierarchy(
  apiSubfolders: DmsSubfolderApiItem[],
  existingSubfolders: DmsHierarchyFolder["sub_folders"] = [],
): DmsHierarchyFolder["sub_folders"] {
  const activeSubfolders = apiSubfolders.filter(
    (subfolder) =>
      !subfolder.is_deleted &&
      subfolder.status?.toUpperCase() === "ACTIVE",
  );

  const existingById = new Map<
    number,
    NonNullable<DmsHierarchyFolder["sub_folders"]>[number]
  >();

  const indexExisting = (subs: any[] = []) => {
    for (const sub of subs) {
      if (typeof sub.sub_folder_id !== "number") {
        continue;
      }

      existingById.set(
        sub.sub_folder_id,
        sub as NonNullable<DmsHierarchyFolder["sub_folders"]>[number],
      );

      // Support all folder hierarchy formats returned by the API.
      const children =
        sub.sub_folders ??
        sub.children ??
        sub.subfolders ??
        sub.sub_sub_folders ??
        [];

      if (Array.isArray(children) && children.length > 0) {
        indexExisting(children);
      }
    }
  };

  indexExisting(existingSubfolders);

  const subfoldersByParent = new Map<
    number | null,
    DmsSubfolderApiItem[]
  >();

  for (const subfolder of activeSubfolders) {
    const parentId = subfolder.parent_sub_folder_id ?? null;

    const siblings = subfoldersByParent.get(parentId) ?? [];

    siblings.push(subfolder);

    subfoldersByParent.set(parentId, siblings);
  }

  const buildChildren = (
    parentId: number | null,
    ancestors: Set<number>,
  ): DmsHierarchyFolder["sub_folders"] => {
    const children = subfoldersByParent.get(parentId) ?? [];

    return children.map((subfolder) => {
      const existing = existingById.get(subfolder.sub_folder_id);

      // Prevent malformed API data from causing infinite recursion.
      if (ancestors.has(subfolder.sub_folder_id)) {
        return {
          ...existing,
          ...subfolder,
          parent_sub_folder_id: subfolder.parent_sub_folder_id ?? null,
          documents: existing?.documents ?? [],
          documents_count: existing?.documents_count ?? 0,
          sub_folders: [],
        };
      }

      const nextAncestors = new Set(ancestors);
      nextAncestors.add(subfolder.sub_folder_id);

      return {
        ...existing,
        ...subfolder,
        parent_sub_folder_id: subfolder.parent_sub_folder_id ?? null,
        documents: existing?.documents ?? [],
        documents_count: existing?.documents_count ?? 0,
        sub_folders: buildChildren(
          subfolder.sub_folder_id,
          nextAncestors,
        ),
      };
    });
  };

  return buildChildren(null, new Set<number>());
}

function mapSubfolderToDefinition(
  subfolder: NonNullable<DmsHierarchyFolder["sub_folders"]>[number],
  index: number,
): import("../types").SubfolderInfo {
  return {
    id: String(subfolder.sub_folder_id),
    sub_folder_id: subfolder.sub_folder_id,
    parent_sub_folder_id: subfolder.parent_sub_folder_id ?? null,
    folder_id: subfolder.folder_id,
    name: subfolder.sub_folder_name,
    description: subfolder.sub_folder_description,
    letter: String.fromCharCode(65 + (index % 26)),
    code: subfolder.sub_folder_code ?? "",
    subfolders: (subfolder.sub_folders ?? [])
      .filter(
        (child) =>
          !child.is_deleted &&
          child.status?.toUpperCase() === "ACTIVE",
      )
      .map(mapSubfolderToDefinition),
  };
}

function findSubfolderByPath(
  subfolders: import("../types").SubfolderInfo[],
  path: string[],
): import("../types").SubfolderInfo | null {
  if (path.length === 0) return null;

  const current = subfolders.find(
    (subfolder) => subfolder.name === path[0],
  );

  if (!current) return null;

  if (path.length === 1) {
    return current;
  }

  return findSubfolderByPath(
    current.subfolders ?? [],
    path.slice(1),
  );
}


interface UseDmsFoldersOptions {
  role: Role
  activeMainTab: MainTab
  setActiveMainTab: (tab: MainTab) => void
  activeFolder: string
  setActiveFolder: (folder: string) => void
  query?: string
  setQuery?: (q: string) => void
  setToast: (
    msg: string,
    type?: "success" | "error" | "warning" | "info",
  ) => void
}

export function useDmsFolders({
  role,
  activeMainTab,
  setActiveMainTab,
  activeFolder,
  setActiveFolder,
  query,
  setQuery,
  setToast,
}: UseDmsFoldersOptions) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(
    null,
  )
  const [selectedSubSubfolder, setSelectedSubSubfolder] = useState<
    string | null
  >(null)
  const [selectedSubfolderPath, setSelectedSubfolderPath] = useState<string[]>(
    [],
  )
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({})
  const [expandedSubfolders, setExpandedSubfolders] = useState<
    Record<string, boolean>
  >({})
  const [expandedPaths, setExpandedPaths] = useState<
    Record<string, boolean>
  >({})
  const [subfolderSearch, setSubfolderSearch] = useState("")
  const [viewAllInFolder, setViewAllInFolder] = useState(false)

  // Dynamic Folders State (Admin managed with persistence)
  const [folders, setFolders] = useState<FolderDefinition[]>([])
  const [hierarchyData, setHierarchyData] = useState<DmsHierarchyFolder[]>([])
  const [regularHierarchyData, setRegularHierarchyData] = useState<
    DmsHierarchyFolder[]
  >([])
  const [isControlledFilesView, setIsControlledFilesView] = useState(false)
  const [isLoadingHierarchy, setIsLoadingHierarchy] = useState(false)

  const documents = useMemo<DocumentRecord[]>(() => {
    const result: DocumentRecord[] = [];

    const collectSubfolderDocuments = (
      folder: DmsHierarchyFolder,
      subfolders: NonNullable<DmsHierarchyFolder["sub_folders"]>,
      parentPath: string[] = [],
    ) => {
      for (const subfolder of subfolders) {
        const currentPath = [
          ...parentPath,
          subfolder.sub_folder_name,
        ];

        for (const doc of subfolder.documents ?? []) {
          const record = mapApiDocumentToDocumentRecord(
            doc,
            folder.folder_name,
            currentPath[0],
            currentPath[1],
          );

          // Preserve the complete nested path for deeper subfolders.
          record.folder = folder.folder_name;
          record.subfolder = currentPath[0];
          record.subSubfolder =
            currentPath.length > 1
              ? currentPath.slice(1).join(" / ")
              : undefined;
          record.subfolderPath = [...currentPath];

          result.push(record);
        }

        collectSubfolderDocuments(
          folder,
          subfolder.sub_folders ?? [],
          currentPath,
        );
      }
    };

    for (const folder of hierarchyData) {
      const rootDocuments =
        folder.folder_documents ??
        folder.root_documents ??
        folder.documents ??
        [];

      for (const doc of rootDocuments) {
        result.push(
          mapApiDocumentToDocumentRecord(doc, folder.folder_name),
        );
      }

      collectSubfolderDocuments(
        folder,
        folder.sub_folders ?? [],
      );
    }

    return result;
  }, [hierarchyData]);

  const fetchFolders = useCallback(async () => {
    try {
      setIsLoadingHierarchy(true);

      const [hierarchyResponse, firstSubfolderResponse] = await Promise.all([
        api.get<DmsHierarchyResponse>("/dms-document/get-all-hierarchy"),
        api.get<DmsSubfolderApiResponse>(
          "/dms-sub-folder/get-all?page=1&limit=100",
        ),
      ]);

      if (hierarchyResponse.data?.status !== "success") {
        setToast("Failed to load folders.");
        return;
      }

      const allSubfolders: DmsSubfolderApiItem[] =
        firstSubfolderResponse.data?.status === "success" &&
        Array.isArray(firstSubfolderResponse.data.data)
          ? [...firstSubfolderResponse.data.data]
          : [];

      const totalCount =
        firstSubfolderResponse.data?.total_count ?? allSubfolders.length;
      const limit = firstSubfolderResponse.data?.limit || 100;
      const totalPages = Math.ceil(totalCount / limit);

      if (totalPages > 1) {
        const pageRequests = [];
        for (let p = 2; p <= totalPages; p++) {
          pageRequests.push(
            api.get<DmsSubfolderApiResponse>(
              `/dms-sub-folder/get-all?page=${p}&limit=${limit}`,
            ),
          );
        }

        const remainingResponses = await Promise.all(pageRequests);
        for (const res of remainingResponses) {
          if (res.data?.status === "success" && Array.isArray(res.data.data)) {
            allSubfolders.push(...res.data.data);
          }
        }
      }

      const uniqueSubfoldersMap = new Map<number, DmsSubfolderApiItem>();
      for (const item of allSubfolders) {
        if (item && typeof item.sub_folder_id === "number") {
          uniqueSubfoldersMap.set(item.sub_folder_id, item);
        }
      }

      const apiSubfolders = Array.from(uniqueSubfoldersMap.values());

      const activeHierarchy = hierarchyResponse.data.data
        .filter((folder) => !folder.is_deleted)
        .map((folder) => {
          const existingSubfolders =
            (folder.sub_folders && folder.sub_folders.length > 0
              ? folder.sub_folders
              : folder.children) ?? [];

          const matchingSubfolders = apiSubfolders.filter(
            (subfolder) =>
              subfolder.folder_id === folder.folder_id,
          );

          return {
            ...folder,
            sub_folders: buildSubfolderHierarchy(
              matchingSubfolders,
              existingSubfolders,
            ),
          };
        });

      setRegularHierarchyData(activeHierarchy);

      if (!isControlledFilesView) {
        setHierarchyData(activeHierarchy);
      }
    } catch (error) {
      console.error("Failed to load document hierarchy:", error);
      setToast("Failed to load folders.");
    } finally {
      setIsLoadingHierarchy(false);
    }
  }, [isControlledFilesView, setToast]);

  const handleBrowseControlledFiles = useCallback(async () => {
    try {
      setIsLoadingHierarchy(true)

      const response = await api.get("/dms-document/browse-controlled-files")

      if (
        response.data?.status !== "success" ||
        !Array.isArray(response.data.data)
      ) {
        setToast("Failed to load controlled files.")
        return
      }

      const controlledHierarchy: DmsHierarchyFolder[] = response.data.data.map(
        (folder: any) => {
          const normalizeSubfolders = (subfolders: any[]): any[] =>
            subfolders.map((subFolder: any) => {
              const subFolderDocuments = (subFolder.documents ?? []).map(
                (doc: any) => ({
                  ...doc,
                  has_access: doc.has_access ?? doc.has_file_access ?? true,
                  can_view: doc.can_view ?? false,
                  can_download: doc.can_download ?? false,
                }),
              )

              const nestedChildren = normalizeSubfolders(
                subFolder.sub_folders ??
                subFolder.children ??
                subFolder.subfolders ??
                subFolder.sub_sub_folders ??
                [],
              )

              return {
                ...subFolder,
                sub_folder_id: subFolder.sub_folder_id ?? subFolder.id,
                sub_folder_name:
                  subFolder.sub_folder_name ?? subFolder.subfolder_name,
                sub_folder_description: subFolder.sub_folder_description ?? "",
                documents_count:
                  subFolder.documents_count ?? subFolder.documents?.length ?? 0,
                documents: subFolderDocuments,
                sub_folders: nestedChildren,
                is_deleted: false,
                status: "ACTIVE",
              }
            })

          const subFolders = normalizeSubfolders(
            folder.sub_folders ??
            folder.children ??
            folder.subfolders ??
            [],
          )

          const rootDocuments = (
            folder.folder_documents ??
            folder.root_documents ??
            folder.documents ??
            []
          ).map((doc: any) => ({
            ...doc,
            has_access: doc.has_access ?? doc.has_file_access ?? true,
            can_view: doc.can_view ?? false,
            can_download: doc.can_download ?? false,
          }))

          return {
            ...folder,
            folder_id: folder.folder_id,
            folder_name: folder.folder_name,
            folder_description: folder.folder_description ?? "",
            folder_icon: folder.folder_icon ?? "Folder",
            total_documents:
              folder.total_documents ?? folder.folder_documents?.length ?? 0,
            root_documents: rootDocuments,
            sub_folders: subFolders,
            is_deleted: false,
          }
        },
      )

      setHierarchyData(controlledHierarchy)
      setIsControlledFilesView(true)

      setSelectedFolder(null)
      setSelectedSubfolder(null)
      setSelectedSubSubfolder(null)
      setViewAllInFolder(false)
      setSubfolderSearch("")

      setActiveFolder("All documents")
      setActiveMainTab("all-documents")
    } catch (error) {
      console.error("Failed to load controlled files:", error)

      setToast("Failed to load controlled files.")
    } finally {
      setIsLoadingHierarchy(false)
    }
  }, [setActiveFolder, setActiveMainTab, setToast])

  useEffect(() => {
    setFolders(
      hierarchyData.map((folder, folderIndex) => ({
        id: String(folder.folder_id),
        folder_id: folder.folder_id,
        number: folderIndex + 1,
        name: folder.folder_name,
        description: folder.folder_description,
        icon: FOLDER_ICON_MAP[folder.folder_icon] || Folder,
        subfolders: (folder.sub_folders ?? [])
          .filter(
            (subfolder) =>
              !subfolder.is_deleted &&
              subfolder.status?.toUpperCase() === "ACTIVE",
          )
          .map(mapSubfolderToDefinition),
      })),
    );
  }, [hierarchyData]);

  const handleSelectFolder = (folderName: string | null) => {
    if (folderName === null) {
      if (isControlledFilesView) {
        setHierarchyData(regularHierarchyData)
        setIsControlledFilesView(false)
      }

      setSelectedFolder(null)
      setSelectedSubfolder(null)
      setSelectedSubSubfolder(null)
      setSelectedSubfolderPath([])
      setViewAllInFolder(false)
      setSubfolderSearch("")
      setQuery?.("")
      setActiveFolder("All documents")
      setActiveMainTab("all-documents")
      return
    }

    const selectedFolderDef = folders.find(
      (folder) => folder.name === folderName,
    )

    if (!selectedFolderDef) {
      console.error("Folder not found:", folderName)
      return
    }

    setSelectedFolder(selectedFolderDef.name)
    setSelectedSubfolder(null)
    setSelectedSubSubfolder(null)
    setSelectedSubfolderPath([])
    setViewAllInFolder(false)
    setSubfolderSearch("")
    setQuery?.("")
    setActiveFolder(selectedFolderDef.name)
    setActiveMainTab("all-documents")
  }

  const handleSelectSubfolder = (folderName: string, subfolderName: string) => {
    setSelectedFolder(folderName)
    setSelectedSubfolder(subfolderName)
    setSelectedSubSubfolder(null)
    setSelectedSubfolderPath([subfolderName])
    setViewAllInFolder(false)
    setSubfolderSearch("")
    setActiveFolder(`${folderName} / ${subfolderName}`)
    setActiveMainTab("all-documents")

    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: true,
    }))
  }

  const handleSelectSubSubfolder = (
    folderName: string,
    subfolderName: string,
    subSubfolderName: string,
  ) => {
    setSelectedFolder(folderName)
    setSelectedSubfolder(subfolderName)
    setSelectedSubSubfolder(subSubfolderName)
    setSelectedSubfolderPath([subfolderName, subSubfolderName])
    setViewAllInFolder(false)
    setActiveFolder(`${folderName} / ${subfolderName} / ${subSubfolderName}`)
    setActiveMainTab("all-documents")
    setExpandedFolders((prev) => ({ ...prev, [folderName]: true }))
    setExpandedSubfolders((prev) => ({
      ...prev,
      [`${folderName}:::${subfolderName}`]: true,
    }))
  }

  const handleSelectNestedSubfolder = (
    folderName: string,
    subfolderPath: string[],
  ) => {
    const folder = folders.find(
      (item) => item.name === folderName,
    );

    if (!folder) {
      console.error("Folder not found:", folderName);
      return;
    }

    const selectedSubfolder = findSubfolderByPath(
      folder.subfolders ?? [],
      subfolderPath,
    );

    if (!selectedSubfolder) {
      console.error(
        "Nested subfolder not found:",
        folderName,
        subfolderPath,
      );
      return;
    }

    setSelectedFolder(folderName);
    setSelectedSubfolderPath(subfolderPath);
    setSelectedSubfolder(subfolderPath[0] ?? null);
    setSelectedSubSubfolder(subfolderPath[1] ?? null);

    setViewAllInFolder(false);
    setSubfolderSearch("");
    setQuery?.("");

    setActiveFolder(
      [folderName, ...subfolderPath].join(" / "),
    );

    setActiveMainTab("all-documents");

    setExpandedFolders((previous) => ({
      ...previous,
      [folderName]: true,
    }));

    // Expand every ancestor along the selected path.
    for (let index = 0; index < subfolderPath.length - 1; index++) {
      const parentPath = subfolderPath.slice(0, index + 1);

      setExpandedPaths((previous) => ({
        ...previous,
        [JSON.stringify([folderName, ...parentPath])]: true,
      }));

      setExpandedSubfolders((previous) => ({
        ...previous,
        [`${folderName}:::${parentPath.join(":::")}`]: true,
      }));
    }
  };

  const handleToggleNestedPath = (
    folderName: string,
    subfolderPath: string[],
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    const pathKey = JSON.stringify([folderName, ...subfolderPath]);
    setExpandedPaths((prev) => ({
      ...prev,
      [pathKey]: !prev[pathKey],
    }));

    const subKey = `${folderName}:::${subfolderPath.join(":::")}`;
    setExpandedSubfolders((prev) => ({
      ...prev,
      [subKey]: !prev[subKey],
    }));
  };

  const toggleFolderExpand = (folderName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }))
  }

  const toggleSubfolderExpand = (subKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setExpandedSubfolders((prev) => ({
      ...prev,
      [subKey]: !prev[subKey],
    }))
  }

  const currentFolderDef = useMemo(() => {
    return folders.find((f) => f.name === selectedFolder) || null
  }, [folders, selectedFolder])

  const currentSubfolderDef = useMemo(() => {
    if (!currentFolderDef?.subfolders || !selectedSubfolder) return null
    return (
      currentFolderDef.subfolders.find((sf) => sf.name === selectedSubfolder) ||
      null
    )
  }, [currentFolderDef, selectedSubfolder])

  const currentSubSubfolderDef = useMemo(() => {
    if (!currentSubfolderDef?.subfolders || !selectedSubSubfolder) return null
    return (
      currentSubfolderDef.subfolders.find(
        (ssf) => ssf.name === selectedSubSubfolder,
      ) || null
    )
  }, [currentSubfolderDef, selectedSubSubfolder])

  const currentNestedSubfolderDef = useMemo(() => {
    if (!currentFolderDef || selectedSubfolderPath.length === 0) {
      return null;
    }

    return findSubfolderByPath(
      currentFolderDef.subfolders ?? [],
      selectedSubfolderPath,
    );
  }, [currentFolderDef, selectedSubfolderPath]);

  const isShowingSubfoldersScreen = Boolean(
    activeMainTab === "all-documents" &&
    currentFolderDef &&
    !viewAllInFolder &&
    !query?.trim(),
  )

  const displayedSubfolders = useMemo(() => {
    if (!currentFolderDef?.subfolders) return [];

    const localQuery = subfolderSearch.trim().toLowerCase();
    const globalQuery = query?.trim().toLowerCase() ?? "";

    const getChildren = (
      subfolder: import("../types").SubfolderInfo,
    ): import("../types").SubfolderInfo[] => {
      const node = subfolder as any;

      return (
        node.subfolders ??
        node.children ??
        node.sub_folders ??
        node.sub_sub_folders ??
        []
      );
    };

    const matchesGlobalSearch = (
      subfolder: import("../types").SubfolderInfo,
    ): boolean => {
      if (!globalQuery) return true;

      const name = String(subfolder.name ?? "").toLowerCase();
      const code = String(subfolder.code ?? "").toLowerCase();
      const description = String(subfolder.description ?? "").toLowerCase();

      if (
        name.includes(globalQuery) ||
        code.includes(globalQuery) ||
        description.includes(globalQuery)
      ) {
        return true;
      }

      return getChildren(subfolder).some(matchesGlobalSearch);
    };

    const matchesLocalSearch = (
      subfolder: import("../types").SubfolderInfo,
    ): boolean => {
      if (!localQuery) return true;

      const name = String(subfolder.name ?? "").toLowerCase();
      const letter = String(subfolder.letter ?? "").toLowerCase();
      const code = String(subfolder.code ?? "").toLowerCase();
      const description = String(subfolder.description ?? "").toLowerCase();

      return (
        name.includes(localQuery) ||
        letter.includes(localQuery) ||
        code.includes(localQuery) ||
        description.includes(localQuery)
      );
    };

    return currentFolderDef.subfolders.filter(
      (subfolder) =>
        matchesLocalSearch(subfolder) &&
        matchesGlobalSearch(subfolder),
    );
  }, [currentFolderDef, subfolderSearch, query]);

  const folderCounts = useMemo(() => {
    return hierarchyData.reduce<Record<string, number>>((acc, folder) => {
      const isActiveDocument = (doc: DmsHierarchyDocument) => {
        const status = String(doc.status ?? "").toUpperCase()

        return status !== "ARCHIVED" && status !== "INACTIVE" && !doc.is_deleted
      }

      // Count active files directly inside the folder.
      const rootDocuments =
        folder.folder_documents ??
        folder.root_documents ??
        folder.documents ??
        [];

      const rootDocumentCount = rootDocuments.filter(isActiveDocument).length

      // Count active files inside all subfolders.
      const countSubfolderDocuments = (
        subfolders: NonNullable<DmsHierarchyFolder["sub_folders"]>,
      ): number => {
        return subfolders.reduce((total, subfolder) => {
          const ownCount = (subfolder.documents ?? []).filter(
            isActiveDocument,
          ).length;

          return (
            total +
            ownCount +
            countSubfolderDocuments(subfolder.sub_folders ?? [])
          );
        }, 0);
      };

      const subfolderDocumentCount = countSubfolderDocuments(
        folder.sub_folders ?? [],
      );

      acc[folder.folder_name] =
        rootDocumentCount + subfolderDocumentCount;

      return acc
    }, {})
  }, [hierarchyData])

  const activeDocumentCount = (docs: DmsHierarchyDocument[] = []) =>
    docs.filter((doc) => {
      const status = String(doc.status ?? "").toUpperCase();

      return (
        status !== "ARCHIVED" &&
        status !== "INACTIVE" &&
        !doc.is_deleted
      );
    }).length;

  const getChildren = (node: any): any[] =>
    node?.sub_folders ??
    node?.children ??
    node?.subfolders ??
    node?.sub_sub_folders ??
    [];

  const subfolderCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    const getActiveChildren = (node: any): any[] => {
      const children =
        node?.sub_folders ??
        node?.children ??
        node?.subfolders ??
        node?.sub_sub_folders ??
        [];

      return children.filter(
        (child: any) =>
          !child.is_deleted &&
          String(child.status ?? "ACTIVE").toUpperCase() === "ACTIVE",
      );
    };

    const countActiveDocumentsRecursively = (node: any): number => {
      const ownCount = activeDocumentCount(node.documents ?? []);
      const children = getActiveChildren(node);

      return (
        ownCount +
        children.reduce(
          (total: number, child: any) =>
            total + countActiveDocumentsRecursively(child),
          0,
        )
      );
    };

    const visit = (
      folder: any,
      subfolders: any[],
      parentPath: string[] = [],
    ) => {
      for (const subfolder of subfolders) {
        if (
          subfolder.is_deleted ||
          String(subfolder.status ?? "ACTIVE").toUpperCase() !== "ACTIVE"
        ) {
          continue;
        }

        const name =
          subfolder.sub_folder_name ?? subfolder.name ?? "";

        const currentPath = [...parentPath, name];

        const key = `${folder.folder_name}:::${currentPath.join(":::")}`;

        counts[key] = countActiveDocumentsRecursively(subfolder);

        visit(folder, getActiveChildren(subfolder), currentPath);
      }
    };

    for (const folder of hierarchyData) {
      visit(folder, getActiveChildren(folder));
    }

    return counts;
  }, [hierarchyData]);

  const subSubfolderCounts = useMemo(() => {
    return subfolderCounts;
  }, [subfolderCounts]);

  return {
    folders,
    setFolders,
    hierarchyData,
    setHierarchyData,
    regularHierarchyData,
    setRegularHierarchyData,
    isControlledFilesView,
    setIsControlledFilesView,
    isLoadingHierarchy,
    documents,
    selectedFolder,
    setSelectedFolder,
    selectedSubfolder,
    setSelectedSubfolder,
    selectedSubSubfolder,
    setSelectedSubSubfolder,
    expandedFolders,
    setExpandedFolders,
    expandedSubfolders,
    setExpandedSubfolders,
    expandedPaths,
    setExpandedPaths,
    subfolderSearch,
    setSubfolderSearch,
    viewAllInFolder,
    setViewAllInFolder,
    currentFolderDef,
    currentSubfolderDef,
    currentSubSubfolderDef,
    selectedSubfolderPath,
    setSelectedSubfolderPath,
    currentNestedSubfolderDef,
    isShowingSubfoldersScreen,
    displayedSubfolders,
    folderCounts,
    subfolderCounts,
    subSubfolderCounts,
    fetchFolders,
    handleBrowseControlledFiles,
    handleSelectFolder,
    handleSelectSubfolder,
    handleSelectSubSubfolder,
    handleSelectNestedSubfolder,
    toggleFolderExpand,
    toggleSubfolderExpand,
    handleToggleNestedPath,
  }
}
