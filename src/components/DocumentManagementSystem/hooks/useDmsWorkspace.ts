// DMS Workspace Master Hook
// Thin composer hook that coordinates smaller, focused feature and cross-cutting hooks.
// Verbatim split preserving all state, effects, signatures, and returned object keys.

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import type { Role, ViewMode, DocumentRecord, MainTab } from "../types";
import { columns } from "../initial-data";
import { getLoggedInUserId } from "./dmsUser";
import { useDmsToast } from "./useDmsToast";
import { useDmsFolders } from "./useDmsFolders";
import { useDmsFolderActions } from "./useDmsFolderActions";
import { useDmsDragDrop } from "./useDmsDragDrop";
import { useDmsDocumentFilters } from "./useDmsDocumentFilters";
import { useDmsPublishers } from "../PublisherPermissions/useDmsPublishers";
import { useDmsArchive } from "../Documents/useDmsArchive";
import { useDmsTrash } from "../Trash/useDmsTrash";
import { useDmsEngineerGroups } from "../EngineerGroups/useDmsEngineerGroups";
import { useDmsAccessRequests } from "../AccessRequests/useDmsAccessRequests";
import { useDmsMyAccessRequests } from "../MyAccessRequests/useDmsMyAccessRequests";
import { useDmsDocumentActions } from "../Documents/useDmsDocumentActions";
import { useDmsAssistant } from "../AIElements/useDmsAssistant";

export function useDmsWorkspace(threadId: string) {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("Admin");
  const canMoveFiles = role === "Admin" || role === "Publisher";

  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [activeFolder, setActiveFolder] = useState("All documents");
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("all-documents");

  // Pane & menu toggle state
  const [showDocInfoModal, setShowDocInfoModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("Details");
  const [showDetailsPane, setShowDetailsPane] = useState(true);
  const [showPreviewPane, setShowPreviewPane] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showAccess, setShowAccess] = useState(false);
  const [expandedTree, setExpandedTree] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState(columns);

  const setDocuments: React.Dispatch<React.SetStateAction<DocumentRecord[]>> = useCallback(
    (_value) => {
      // Optimistic updates disabled; documents are derived from backend hierarchy
    },
    [],
  );

  // 1. Toast notifications hook
  const { toast, setToast, notify } = useDmsToast();

  // 2. Folders hook
  const foldersHook = useDmsFolders({
    role,
    activeMainTab,
    setActiveMainTab,
    activeFolder,
    setActiveFolder,
    setToast,
  });

  // 3. Publishers hook
  const publishersHook = useDmsPublishers({
    setToast,
    folders: foldersHook.folders,
  });

  // Authorized folders derived state
  const authorizedFolders = useMemo(() => {
    if (role === "Admin") return foldersHook.folders;
    if (role === "Publisher") {
      const loggedInUserId = getLoggedInUserId();
      const publisher = publishersHook.publishers.find(
        (p) => p.publisherUserId === loggedInUserId,
      );
      if (!publisher) return [];

      return foldersHook.folders
        .filter(
          (f) =>
            publisher.assignedFolders.includes(f.name) ||
            f.subfolders?.some((sf) => publisher.assignedSubfolders.includes(sf.name)),
        )
        .map((f) => {
          if (publisher.assignedFolders.includes(f.name)) {
            return f;
          }
          return {
            ...f,
            subfolders:
              f.subfolders?.filter((sf) =>
                publisher.assignedSubfolders.includes(sf.name),
              ) || [],
          };
        });
    }
    return foldersHook.folders;
  }, [foldersHook.folders, role, publishersHook.publishers]);

  // Publisher detailed assignments state (from GET /dms-publisher/get/{publisher_id})
  const [publisherDetails, setPublisherDetails] = useState<{
    assigned_folder_ids?: number[];
    assigned_subfolder_ids?: number[];
    assigned_folders?: any[];
    assigned_subfolders?: any[];
    assigned_hierarchy?: any[];
  } | null>(null);

  useEffect(() => {
    if (role !== "Publisher") {
      setPublisherDetails(null);
      return;
    }

    const loggedInUserId = getLoggedInUserId();
    if (!loggedInUserId) return;

    const publisher = publishersHook.publishers.find(
      (p) => String(p.publisherUserId) === String(loggedInUserId),
    );

    if (!publisher) return;

    let cancelled = false;

    publishersHook.fetchPublisherDetails(publisher.id).then((details) => {
      if (!cancelled && details) {
        setPublisherDetails(details);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [role, publishersHook.publishers, publishersHook.fetchPublisherDetails]);

  const canUploadToSubfolder = useCallback((
    folderName: string,
    subfolderPath: string[],
  ): boolean => {
    if (role !== "Publisher") return false;

    // The Add Document button remains hidden until the Publisher's permissions have been loaded and verified.
    if (!publisherDetails) return false;

    const loggedInUserId = getLoggedInUserId();
    if (!loggedInUserId) return false;

    const publisher = publishersHook.publishers.find(
      (p) => String(p.publisherUserId) === String(loggedInUserId),
    );

    if (!publisher) return false;

    // Normalize assigned folder IDs to numbers
    const assignedFolderIds: number[] = Array.from(
      new Set(
        [
          ...(publisherDetails.assigned_folder_ids ?? []),
          ...(publisherDetails.assigned_folders?.map((f: any) => f.folder_id ?? f.id) ?? []),
          ...(publisherDetails.assigned_hierarchy?.map((f: any) => f.folder_id ?? f.id) ?? []),
          ...(publisher.assignedFolderIds ?? []),
        ]
          .map((id: any) => Number(id))
          .filter((id) => !isNaN(id) && id > 0),
      ),
    );

    // Normalize assigned subfolder IDs to numbers
    const assignedSubfolderIds: number[] = Array.from(
      new Set(
        [
          ...(publisherDetails.assigned_subfolder_ids ?? []),
          ...(publisherDetails.assigned_subfolders?.map((sf: any) => sf.sub_folder_id ?? sf.id) ?? []),
          ...(publisher.assignedSubfolderIds ?? []),
        ]
          .map((id: any) => Number(id))
          .filter((id) => !isNaN(id) && id > 0),
      ),
    );

    // Find the target root folder
    const targetFolder = foldersHook.folders.find(
      (folder) => folder.name === folderName,
    );

    console.log("Target folder:", targetFolder);
    console.log("Folder ID:", targetFolder?.id);
    console.log("Backend folder ID:", (targetFolder as any)?.folder_id);
    console.log("Assigned folder IDs:", assignedFolderIds);

    const targetFolderId = targetFolder ? Number(targetFolder.folder_id ?? targetFolder.id) : null;

    // Grant root-folder upload access only when the requested path is empty.
    const isRootFolderRequest =
      !subfolderPath || subfolderPath.length === 0;

    const hasRootFolderAccess =
      targetFolderId !== null &&
      assignedFolderIds.includes(targetFolderId);

    const hasRootFolderNameAccess =
      publisher.assignedFolders?.includes(folderName) ?? false;

    if (isRootFolderRequest) {
      return hasRootFolderAccess || hasRootFolderNameAccess;
    }

    // 2. Resolve subfolder ID from the actual hierarchy to avoid identically named subfolder collision
    let currentLevel: any[] = targetFolder?.subfolders ?? [];
    let targetSubfolderNode: any = null;
    const pathNodeIds: number[] = [];

    for (const segment of subfolderPath) {
      targetSubfolderNode = currentLevel.find(
        (sf: any) => (sf.name ?? sf.sub_folder_name) === segment,
      );
      if (!targetSubfolderNode) break;

      const sid = targetSubfolderNode.sub_folder_id ?? targetSubfolderNode.id;
      if (sid) {
        const numId = Number(sid);
        if (!isNaN(numId) && numId > 0) pathNodeIds.push(numId);
      }

      currentLevel =
        targetSubfolderNode.subfolders ??
        targetSubfolderNode.children ??
        targetSubfolderNode.sub_folders ??
        targetSubfolderNode.sub_sub_folders ??
        [];
    }

    const targetSubfolderId = targetSubfolderNode
      ? Number(targetSubfolderNode.sub_folder_id ?? targetSubfolderNode.id)
      : null;

    if (targetSubfolderId !== null && assignedSubfolderIds.includes(targetSubfolderId)) {
      return true;
    }

    if (pathNodeIds.some((id) => assignedSubfolderIds.includes(id))) {
      return true;
    }

    // Fallback: check subfolder name in publisher.assignedSubfolders
    return subfolderPath.some((name) =>
      publisher.assignedSubfolders?.includes(name),
    );
  }, [role, publishersHook.publishers, publisherDetails, foldersHook.folders]);

  // 4. Archive hook
  const archiveHook = useDmsArchive({
    activeMainTab,
  });

  // 5. Trash hook
  const trashHook = useDmsTrash({
    role,
    activeMainTab,
    setToast,
    fetchFolders: foldersHook.fetchFolders,
    previewDocId,
    setPreviewDocId,
    selectedId,
    setSelectedId,
  });

  // 6. Engineer Groups hook
  const engineerGroupsHook = useDmsEngineerGroups({
    setToast,
  });

  // 7. Access Requests hook
  const accessRequestsHook = useDmsAccessRequests({
    activeMainTab,
    setToast,
    notify,
  });

  // 8. My Access Requests hook
  const myAccessRequestsHook = useDmsMyAccessRequests({
    activeMainTab,
    setToast,
    setHierarchyData: foldersHook.setHierarchyData,
    setAccessRequests: accessRequestsHook.setAccessRequests,
    setAccessRequestsTotalCount: accessRequestsHook.setAccessRequestsTotalCount,
  });

  // 9. Document Filters hook
  const documentFiltersHook = useDmsDocumentFilters({
    documents: foldersHook.documents,
    archivedData: archiveHook.archivedData,
    activeMainTab,
    role,
    currentUserId: getLoggedInUserId(),
    selectedFolder: foldersHook.selectedFolder,
    selectedSubfolder: foldersHook.selectedSubfolder,
    selectedSubSubfolder: foldersHook.selectedSubSubfolder,
    selectedSubfolderPath: foldersHook.selectedSubfolderPath,
    currentFolderDef: foldersHook.currentFolderDef,
  });

  const handleSelectFolder = (folderName: string | null) => {
    if (folderName === null) {
      documentFiltersHook.setQuery("");
    }
    foldersHook.handleSelectFolder(folderName);
  };

  const isShowingSubfoldersScreen = Boolean(
    activeMainTab === "all-documents" &&
    foldersHook.currentFolderDef &&
    !foldersHook.viewAllInFolder &&
    !documentFiltersHook.query.trim(),
  );

  // 10. Folder Actions hook
  const folderActionsHook = useDmsFolderActions({
    role,
    folders: foldersHook.folders,
    setFolders: foldersHook.setFolders,
    documents: foldersHook.documents,
    setDocuments,
    fetchFolders: foldersHook.fetchFolders,
    selectedFolder: foldersHook.selectedFolder,
    selectedSubfolder: foldersHook.selectedSubfolder,
    selectedSubSubfolder: foldersHook.selectedSubSubfolder,
    setSelectedFolder: foldersHook.setSelectedFolder,
    setSelectedSubfolder: foldersHook.setSelectedSubfolder,
    setSelectedSubSubfolder: foldersHook.setSelectedSubSubfolder,
    setActiveFolder,
    setExpandedFolders: foldersHook.setExpandedFolders,
    setExpandedSubfolders: foldersHook.setExpandedSubfolders,
    setExpandedPaths: foldersHook.setExpandedPaths,
    handleSelectFolder,
    handleSelectSubfolder: foldersHook.handleSelectSubfolder,
    handleSelectSubSubfolder: foldersHook.handleSelectSubSubfolder,
    selectedSubfolderPath: foldersHook.selectedSubfolderPath,
    setSelectedSubfolderPath: foldersHook.setSelectedSubfolderPath,
    setPublishers: publishersHook.setPublishers,
    setToast,
  });

  // 11. Drag & Drop hook
  const dragDropHook = useDmsDragDrop({
    role,
    canMoveFiles,
    folders: foldersHook.folders,
    setFolders: foldersHook.setFolders,
    authorizedFolders,
    documents: foldersHook.documents,
    setDocuments,
    fetchFolders: foldersHook.fetchFolders,
    selectedFolder: foldersHook.selectedFolder,
    selectedSubfolder: foldersHook.selectedSubfolder,
    selectedSubSubfolder: foldersHook.selectedSubSubfolder,
    setSelectedFolder: foldersHook.setSelectedFolder,
    setSelectedSubfolder: foldersHook.setSelectedSubfolder,
    setActiveFolder,
    setExpandedFolders: foldersHook.setExpandedFolders,
    setExpandedSubfolders: foldersHook.setExpandedSubfolders,
    setToast,
  });

  // 12. Document Actions hook
  const documentActionsHook = useDmsDocumentActions({
    role,
    documents: foldersHook.documents,
    filteredDocuments: documentFiltersHook.filteredDocuments,
    selectedId,
    setSelectedId,
    previewDocId,
    setPreviewDocId,
    setShowDetailsPane,
    setShowRequestAccessModalFor: myAccessRequestsHook.setShowRequestAccessModalFor,
    setFileActionMenu: trashHook.setFileActionMenu,
    fetchFolders: foldersHook.fetchFolders,
    fetchArchivedDocuments: archiveHook.fetchArchivedDocuments,
    setDocuments,
    setToast,
    notify,
  });

  // 13. AI Assistant hook
  const assistantHook = useDmsAssistant({
    threadId,
    showAssistant,
    documents: foldersHook.documents,
    activeDocumentId: previewDocId,
    activeFolderId: foldersHook.currentFolderDef?.folder_id ?? null,
    activeSubFolderId: foldersHook.currentSubfolderDef?.sub_folder_id ?? null,
    activeSubSubFolderId:
      foldersHook.currentSubSubfolderDef?.sub_folder_id ?? null,
  });

  const createThread = async (
    threadTitle?: string,
    customDocId?: number | null
  ) => {
    setShowAssistant(true);

    const safeTitle =
      typeof threadTitle === "string" && threadTitle.trim()
        ? threadTitle.trim()
        : "New Chat";

    const safeDocId =
      typeof customDocId === "number" ? customDocId : null;

    try {
      return await assistantHook.createThread(safeTitle, safeDocId);
    } catch {
      // The hook already stores the API error.
      return null;
    }
  };

  const handleEmptyTrash = () => {
    trashHook.handleEmptyTrash(documentActionsHook.previewDoc);
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setSelectedId(null);
    if (newRole === "Admin") {
      setActiveMainTab("publishers");
      setActiveFolder("All Folders");
      foldersHook.setSelectedFolder(null);
      foldersHook.setSelectedSubfolder(null);
      foldersHook.setViewAllInFolder(false);
    } else if (newRole === "Publisher") {
      setActiveMainTab("all-documents");
      setActiveFolder("All documents");
    } else if (newRole === "User") {
      setActiveMainTab("all-documents");
      setActiveFolder("All documents");
    }
  };

  const toggleColumn = (column: string) => {
    setVisibleColumns((current: string[]) =>
      current.includes(column)
        ? current.filter((item: string) => item !== column)
        : [...current, column],
    );
  };

  // Initial fetches
  useEffect(() => {
    foldersHook.fetchFolders();
    publishersHook.fetchPublisherDropdown();
    publishersHook.fetchPublishers();
  }, [
    foldersHook.fetchFolders,
    publishersHook.fetchPublisherDropdown,
    publishersHook.fetchPublishers,
  ]);

  // Interceptor effect for dms:data-changed
  useEffect(() => {
    const handleDmsDataChanged = () => {
      if (foldersHook.isControlledFilesView) {
        void foldersHook.handleBrowseControlledFiles();
      } else {
        void foldersHook.fetchFolders();
      }

      if (activeMainTab === "archive") {
        void archiveHook.fetchArchivedDocuments();
      }

      if (activeMainTab === "trash" && role === "Admin") {
        void trashHook.fetchTrashDocuments();
      }
    };

    // Refresh workspace data after a successful DMS mutation.
    const interceptorId = api.interceptors.response.use(
      (response) => {
        const method = response.config.method?.toLowerCase();
        const url = response.config.url ?? "";

        const isMutation =
          method === "post" ||
          method === "put" ||
          method === "patch";

        const isDmsApi = url.includes("/dms-");

        if (isMutation && isDmsApi) {
          window.dispatchEvent(new Event("dms:data-changed"));
        }

        return response;
      },
      (error) => Promise.reject(error),
    );

    window.addEventListener("dms:data-changed", handleDmsDataChanged);

    return () => {
      api.interceptors.response.eject(interceptorId);
      window.removeEventListener("dms:data-changed", handleDmsDataChanged);
    };
  }, [
    foldersHook.isControlledFilesView,
    activeMainTab,
    role,
    foldersHook.fetchFolders,
    archiveHook.fetchArchivedDocuments,
    trashHook.fetchTrashDocuments,
    foldersHook.handleBrowseControlledFiles,
  ]);

  useEffect(() => {
    engineerGroupsHook.fetchEngineerGroups();
  }, [engineerGroupsHook.fetchEngineerGroups]);

  useEffect(() => {
    engineerGroupsHook.fetchDashboardCounts();
  }, [engineerGroupsHook.fetchDashboardCounts]);

  // Trash role guard
  useEffect(() => {
    if (role !== "Admin" && activeMainTab === "trash") {
      setActiveMainTab("all-documents");
      setActiveFolder("All documents");
    }
  }, [role, activeMainTab]);

  // Ctrl+B sidebar toggle shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    navigate,
    role,
    setRole,
    canMoveFiles,
    previewDocId,
    setPreviewDocId,
    documents: foldersHook.documents,
    setDocuments,
    selectedId,
    setSelectedId,
    showDocInfoModal,
    setShowDocInfoModal,
    query: documentFiltersHook.query,
    setQuery: documentFiltersHook.setQuery,
    activeFolder,
    setActiveFolder,
    activeMainTab,
    setActiveMainTab,
    selectedFolder: foldersHook.selectedFolder,
    setSelectedFolder: foldersHook.setSelectedFolder,
    selectedSubfolder: foldersHook.selectedSubfolder,
    setSelectedSubfolder: foldersHook.setSelectedSubfolder,
    selectedSubSubfolder: foldersHook.selectedSubSubfolder,
    setSelectedSubSubfolder: foldersHook.setSelectedSubSubfolder,
    expandedFolders: foldersHook.expandedFolders,
    expandedSubfolders: foldersHook.expandedSubfolders,
    expandedPaths: foldersHook.expandedPaths,
    setExpandedPaths: foldersHook.setExpandedPaths,
    handleToggleNestedPath: foldersHook.handleToggleNestedPath,
    subfolderSearch: foldersHook.subfolderSearch,
    setSubfolderSearch: foldersHook.setSubfolderSearch,
    viewAllInFolder: foldersHook.viewAllInFolder,
    setViewAllInFolder: foldersHook.setViewAllInFolder,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    trashSearchQuery: trashHook.trashSearchQuery,
    setTrashSearchQuery: trashHook.setTrashSearchQuery,
    trashFilterYear: trashHook.trashFilterYear,
    setTrashFilterYear: trashHook.setTrashFilterYear,
    trashFilterFolder: trashHook.trashFilterFolder,
    setTrashFilterFolder: trashHook.setTrashFilterFolder,
    trashFilterSubfolder: trashHook.trashFilterSubfolder,
    setTrashFilterSubfolder: trashHook.setTrashFilterSubfolder,
    trashSortBy: trashHook.trashSortBy,
    setTrashSortBy: trashHook.setTrashSortBy,
    fileActionMenu: trashHook.fileActionMenu,
    setFileActionMenu: trashHook.setFileActionMenu,
    documentToDelete: trashHook.documentToDelete,
    setDocumentToDelete: trashHook.setDocumentToDelete,
    permanentDeleteTarget: trashHook.permanentDeleteTarget,
    setPermanentDeleteTarget: trashHook.setPermanentDeleteTarget,
    showEmptyTrashModal: trashHook.showEmptyTrashModal,
    setShowEmptyTrashModal: trashHook.setShowEmptyTrashModal,
    folders: foldersHook.folders,
    setFolders: foldersHook.setFolders,
    showCreateFolderModal: folderActionsHook.showCreateFolderModal,
    setShowCreateFolderModal: folderActionsHook.setShowCreateFolderModal,
    createSubfolderForFolder: folderActionsHook.createSubfolderForFolder,
    setCreateSubfolderForFolder: folderActionsHook.setCreateSubfolderForFolder,
    createSubSubfolderFor: folderActionsHook.createSubSubfolderFor,
    setCreateSubSubfolderFor: folderActionsHook.setCreateSubSubfolderFor,
    renameTarget: folderActionsHook.renameTarget,
    setRenameTarget: folderActionsHook.setRenameTarget,
    descriptionTarget: folderActionsHook.descriptionTarget,
    setDescriptionTarget: folderActionsHook.setDescriptionTarget,
    handleEditDescriptionClick: folderActionsHook.handleEditDescriptionClick,
    handleConfirmDescriptionUpdate: folderActionsHook.handleConfirmDescriptionUpdate,
    deleteTarget: folderActionsHook.deleteTarget,
    setDeleteTarget: folderActionsHook.setDeleteTarget,
    moveTarget: dragDropHook.moveTarget,
    setMoveTarget: dragDropHook.setMoveTarget,
    moveSubSubTarget: dragDropHook.moveSubSubTarget,
    setMoveSubSubTarget: dragDropHook.setMoveSubSubTarget,
    moveDocTarget: dragDropHook.moveDocTarget,
    setMoveDocTarget: dragDropHook.setMoveDocTarget,
    dragOverFolder: dragDropHook.dragOverFolder,
    setDragOverFolder: dragDropHook.setDragOverFolder,
    dragOverSubfolder: dragDropHook.dragOverSubfolder,
    setDragOverSubfolder: dragDropHook.setDragOverSubfolder,
    dragOverSubSubfolder: dragDropHook.dragOverSubSubfolder,
    setDragOverSubSubfolder: dragDropHook.setDragOverSubSubfolder,
    publishers: publishersHook.publishers,
    setPublishers: publishersHook.setPublishers,
    showCreatePublisherModal: publishersHook.showCreatePublisherModal,
    setShowCreatePublisherModal: publishersHook.setShowCreatePublisherModal,
    editingPublisher: publishersHook.editingPublisher,
    setEditingPublisher: publishersHook.setEditingPublisher,
    publisherToDelete: publishersHook.publisherToDelete,
    setPublisherToDelete: publishersHook.setPublisherToDelete,
    publisherSearch: publishersHook.publisherSearch,
    setPublisherSearch: publishersHook.setPublisherSearch,
    publisherFolderFilter: publishersHook.publisherFolderFilter,
    setPublisherFolderFilter: publishersHook.setPublisherFolderFilter,
    adminGovernanceMode: publishersHook.adminGovernanceMode,
    setAdminGovernanceMode: publishersHook.setAdminGovernanceMode,
    selectedFolderForPublishers: publishersHook.selectedFolderForPublishers,
    setSelectedFolderForPublishers: publishersHook.setSelectedFolderForPublishers,
    selectedSubfolderForPublishers: publishersHook.selectedSubfolderForPublishers,
    setSelectedSubfolderForPublishers: publishersHook.setSelectedSubfolderForPublishers,
    folderModeSearch: publishersHook.folderModeSearch,
    setFolderModeSearch: publishersHook.setFolderModeSearch,
    folderModeFilter: publishersHook.folderModeFilter,
    setFolderModeFilter: publishersHook.setFolderModeFilter,
    engineerGroups: engineerGroupsHook.engineerGroups,
    setEngineerGroups: engineerGroupsHook.setEngineerGroups,
    showCreateGroupModal: engineerGroupsHook.showCreateGroupModal,
    setShowCreateGroupModal: engineerGroupsHook.setShowCreateGroupModal,
    editingGroup: engineerGroupsHook.editingGroup,
    setEditingGroup: engineerGroupsHook.setEditingGroup,
    groupSearch: engineerGroupsHook.groupSearch,
    setGroupSearch: engineerGroupsHook.setGroupSearch,
    groupFilterDept: engineerGroupsHook.groupFilterDept,
    setGroupFilterDept: engineerGroupsHook.setGroupFilterDept,
    groupToDelete: engineerGroupsHook.groupToDelete,
    setGroupToDelete: engineerGroupsHook.setGroupToDelete,
    accessRequests: accessRequestsHook.accessRequests,
    setAccessRequests: accessRequestsHook.setAccessRequests,
    accessRequestsPage: accessRequestsHook.accessRequestsPage,
    setAccessRequestsPage: accessRequestsHook.setAccessRequestsPage,
    accessRequestsLimit: accessRequestsHook.accessRequestsLimit,
    setAccessRequestsLimit: accessRequestsHook.setAccessRequestsLimit,
    accessRequestsTotalCount: accessRequestsHook.accessRequestsTotalCount,
    accessRequestsCounts: accessRequestsHook.accessRequestsCounts,
    requestFilter: accessRequestsHook.requestFilter,
    setRequestFilter: accessRequestsHook.setRequestFilter,
    requestSearch: accessRequestsHook.requestSearch,
    setRequestSearch: accessRequestsHook.setRequestSearch,
    grantModalRequest: accessRequestsHook.grantModalRequest,
    setGrantModalRequest: accessRequestsHook.setGrantModalRequest,
    grantFromDate: accessRequestsHook.grantFromDate,
    setGrantFromDate: accessRequestsHook.setGrantFromDate,
    grantToDate: accessRequestsHook.grantToDate,
    setGrantToDate: accessRequestsHook.setGrantToDate,
    grantIsLifetime: accessRequestsHook.grantIsLifetime,
    setGrantIsLifetime: accessRequestsHook.setGrantIsLifetime,
    grantRemarks: accessRequestsHook.grantRemarks,
    setGrantRemarks: accessRequestsHook.setGrantRemarks,
    showRequestAccessModalFor: myAccessRequestsHook.showRequestAccessModalFor,
    setShowRequestAccessModalFor: myAccessRequestsHook.setShowRequestAccessModalFor,
    userRequestReason: myAccessRequestsHook.userRequestReason,
    setUserRequestReason: myAccessRequestsHook.setUserRequestReason,
    showAdd: documentActionsHook.showAdd,
    setShowAdd: documentActionsHook.setShowAdd,
    addDocPrefill: documentActionsHook.addDocPrefill,
    setAddDocPrefill: documentActionsHook.setAddDocPrefill,
    showColumns,
    setShowColumns,
    showFilters: documentFiltersHook.showFilters,
    setShowFilters: documentFiltersHook.setShowFilters,
    showSortMenu: documentFiltersHook.showSortMenu,
    setShowSortMenu: documentFiltersHook.setShowSortMenu,
    sortField: documentFiltersHook.sortField,
    setSortField: documentFiltersHook.setSortField,
    sortOrder: documentFiltersHook.sortOrder,
    setSortOrder: documentFiltersHook.setSortOrder,
    filterStatus: documentFiltersHook.filterStatus,
    setFilterStatus: documentFiltersHook.setFilterStatus,
    filterDepartment: documentFiltersHook.filterDepartment,
    setFilterDepartment: documentFiltersHook.setFilterDepartment,
    filterLocation: documentFiltersHook.filterLocation,
    setFilterLocation: documentFiltersHook.setFilterLocation,
    filterDocType: documentFiltersHook.filterDocType,
    setFilterDocType: documentFiltersHook.setFilterDocType,
    filterConfidential: documentFiltersHook.filterConfidential,
    setFilterConfidential: documentFiltersHook.setFilterConfidential,
    showViewMenu,
    setShowViewMenu,
    viewMode,
    setViewMode,
    showDetailsPane,
    setShowDetailsPane,
    showAssistant,
    setShowAssistant,
    showVersions,
    setShowVersions,
    showAccess,
    setShowAccess,
    visibleColumns,
    setVisibleColumns,
    toast,
    setToast,
    columns,
    selected: documentActionsHook.selected,
    previewDoc: documentActionsHook.previewDoc,
    handleSelectFolder,
    handleSelectSubfolder: foldersHook.handleSelectSubfolder,
    handleSelectSubSubfolder: foldersHook.handleSelectSubSubfolder,
    handleSelectNestedSubfolder: foldersHook.handleSelectNestedSubfolder,
    selectedSubfolderPath: foldersHook.selectedSubfolderPath,
    setSelectedSubfolderPath: foldersHook.setSelectedSubfolderPath,
    handleBrowseControlledFiles: foldersHook.handleBrowseControlledFiles,
    isControlledFilesView: foldersHook.isControlledFilesView,
    toggleFolderExpand: foldersHook.toggleFolderExpand,
    toggleSubfolderExpand: foldersHook.toggleSubfolderExpand,
    currentFolderDef: foldersHook.currentFolderDef,
    currentSubfolderDef: foldersHook.currentSubfolderDef,
    currentSubSubfolderDef: foldersHook.currentSubSubfolderDef,
    currentNestedSubfolderDef: foldersHook.currentNestedSubfolderDef,
    isShowingSubfoldersScreen,
    displayedSubfolders: foldersHook.displayedSubfolders,
    folderCounts: foldersHook.folderCounts,
    authorizedFolders,
    handleCreateFolder: folderActionsHook.handleCreateFolder,
    handleCreateSubfolder: folderActionsHook.handleCreateSubfolder,
    handleCreateSubSubfolder: folderActionsHook.handleCreateSubSubfolder,
    handleRenameClick: folderActionsHook.handleRenameClick,
    handleConfirmRename: folderActionsHook.handleConfirmRename,
    handleDeleteFolderClick: folderActionsHook.handleDeleteFolderClick,
    handleDeleteSubfolderClick: folderActionsHook.handleDeleteSubfolderClick,
    handleDeleteSubSubfolderClick: folderActionsHook.handleDeleteSubSubfolderClick,
    handleConfirmDelete: folderActionsHook.handleConfirmDelete,
    handleDocumentDragStart: dragDropHook.handleDocumentDragStart,
    handleSubfolderDragStart: dragDropHook.handleSubfolderDragStart,
    handleSubSubfolderDragStart: dragDropHook.handleSubSubfolderDragStart,
    handleFolderDragOver: dragDropHook.handleFolderDragOver,
    handleFolderDragLeave: dragDropHook.handleFolderDragLeave,
    handleFolderDrop: dragDropHook.handleFolderDrop,
    handleSubfolderDragOver: dragDropHook.handleSubfolderDragOver,
    handleSubfolderDragLeave: dragDropHook.handleSubfolderDragLeave,
    handleSubfolderDrop: dragDropHook.handleSubfolderDrop,
    handleSubSubfolderDragOver: dragDropHook.handleSubSubfolderDragOver,
    handleSubSubfolderDragLeave: dragDropHook.handleSubSubfolderDragLeave,
    handleSubSubfolderDrop: dragDropHook.handleSubSubfolderDrop,
    handleConfirmMoveDocument: dragDropHook.handleConfirmMoveDocument,
    handleConfirmMove: dragDropHook.handleConfirmMove,
    handleConfirmMoveSubSubfolder: dragDropHook.handleConfirmMoveSubSubfolder,
    fetchMoveSubfolderPreview: dragDropHook.fetchMoveSubfolderPreview,
    moveSubfolder: dragDropHook.moveSubfolder,
    handleOpenAddForSubfolder: documentActionsHook.handleOpenAddForSubfolder,
    handleOpenAddForSubSubfolder: documentActionsHook.handleOpenAddForSubSubfolder,
    canUploadToSubfolder,
    subfolderCounts: foldersHook.subfolderCounts,
    subSubfolderCounts: foldersHook.subSubfolderCounts,
    activeFilterCount: documentFiltersHook.activeFilterCount,
    resetFilters: documentFiltersHook.resetFilters,
    filteredDocuments: documentFiltersHook.filteredDocuments,
    activeDocsCount: documentFiltersHook.activeDocsCount,
    archivedDocsCount: documentFiltersHook.archivedDocsCount,
    controlledDocsCount: documentFiltersHook.controlledDocsCount,
    reviewDocsCount: documentFiltersHook.reviewDocsCount,
    deletedDocsCount: trashHook.deletedDocsCount,
    totalDeletedCount: trashHook.totalDeletedCount,
    matchingFilterCount: trashHook.matchingFilterCount,
    trashPage: trashHook.trashPage,
    setTrashPage: trashHook.setTrashPage,
    trashLimit: trashHook.trashLimit,
    setTrashLimit: trashHook.setTrashLimit,
    availableTrashYears: trashHook.availableTrashYears,
    deletedDocuments: trashHook.deletedDocuments,
    trashDocuments: trashHook.trashDocuments,
    isLoadingTrash: trashHook.isLoadingTrash,
    fetchTrashDocuments: trashHook.fetchTrashDocuments,
    pendingRequestsCount: accessRequestsHook.pendingRequestsCount,
    handleRoleChange,
    handleOpenGrantModal: accessRequestsHook.handleOpenGrantModal,
    handleConfirmGrantAccess: accessRequestsHook.handleConfirmGrantAccess,
    handleRejectRequest: accessRequestsHook.handleRejectRequest,
    handleUserSubmitRequest: myAccessRequestsHook.handleUserSubmitRequest,
    handleOpenFilePreview: documentActionsHook.handleOpenFilePreview,
    handleDocumentLeftClick: documentActionsHook.handleDocumentLeftClick,
    handleDocumentClick: documentActionsHook.handleDocumentClick,
    handleDownloadDocument: documentActionsHook.handleDownloadDocument,
    handleMoveToTrash: trashHook.handleMoveToTrash,
    handleRestoreDocument: trashHook.handleRestoreDocument,
    handleRestoreAllDocuments: trashHook.handleRestoreAllDocuments,
    handlePermanentDelete: trashHook.handlePermanentDelete,
    handleEmptyTrash,
    publisherDropdown: publishersHook.publisherDropdown,
    fetchPublisherDropdown: publishersHook.fetchPublisherDropdown,
    fetchPublishers: publishersHook.fetchPublishers,
    fetchPublisherDetails: publishersHook.fetchPublisherDetails,
    handleSavePublisher: publishersHook.handleSavePublisher,
    handleDeletePublisher: publishersHook.handleDeletePublisher,
    fetchEngineerGroups: engineerGroupsHook.fetchEngineerGroups,
    engineersList: publishersHook.engineersList,
    dashboardCounts: engineerGroupsHook.dashboardCounts,
    groupPage: engineerGroupsHook.groupPage,
    setGroupPage: engineerGroupsHook.setGroupPage,
    groupLimit: engineerGroupsHook.groupLimit,
    groupTotalCount: engineerGroupsHook.groupTotalCount,
    fetchDashboardCounts: engineerGroupsHook.fetchDashboardCounts,
    handleSaveGroup: engineerGroupsHook.handleSaveGroup,
    handleDeleteGroup: engineerGroupsHook.handleDeleteGroup,
    isPublisherAssignedToSubfolder: publishersHook.isPublisherAssignedToSubfolder,
    handleUpdateFolderPublishers: publishersHook.handleUpdateFolderPublishers,
    handleUpdateSubfolderPublishers: publishersHook.handleUpdateSubfolderPublishers,
    handleQuickRevokeFolderPublisher: publishersHook.handleQuickRevokeFolderPublisher,
    hasAccess: documentActionsHook.hasAccess,
    canEdit: documentActionsHook.canEdit,
    previewAccess: documentActionsHook.previewAccess,
    toggleColumn,
    notify,
    updateSelected: documentActionsHook.updateSelected,
    handleArchive: documentActionsHook.handleArchive,
    handleUnarchiveDocument: documentActionsHook.handleUnarchiveDocument,
    handleSort: documentFiltersHook.handleSort,
    createThread,
    submitAssistant: assistantHook.submitAssistant,
    messages: assistantHook.messages,
    assistantStatus: assistantHook.assistantStatus,
    assistantInput: assistantHook.assistantInput,
    stop: assistantHook.stop,
    error: assistantHook.error,
    threads: assistantHook.threads,
    activeThreadId: assistantHook.activeThreadId,
    setActiveThreadId: assistantHook.setActiveThreadId,
    deleteThread: assistantHook.deleteThread,
    isLoadingThreads: assistantHook.isLoadingThreads,
    isLoadingMessages: assistantHook.isLoadingMessages,
    isCreatingThread: assistantHook.isCreatingThread,
    documentSummary: assistantHook.documentSummary,
    isSummarizingDocument: assistantHook.isSummarizingDocument,
    summaryError: assistantHook.summaryError,
    summarizeDocument: assistantHook.summarizeDocument,
    setDocumentSummary: assistantHook.setDocumentSummary,
    // OCR state and handlers
    ocrResult: assistantHook.ocrResult,
    isProcessingOcr: assistantHook.isProcessingOcr,
    isLoadingOcr: assistantHook.isLoadingOcr,
    ocrError: assistantHook.ocrError,
    getDocumentOcr: assistantHook.getDocumentOcr,
    processDocumentOcr: assistantHook.processDocumentOcr,
    setOcrResult: assistantHook.setOcrResult,
  };
}
