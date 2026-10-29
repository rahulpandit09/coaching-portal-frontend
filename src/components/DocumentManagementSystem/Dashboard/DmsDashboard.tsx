import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { getLoggedInUserId } from "../hooks/dmsUser";
import { useDmsWorkspace } from "../hooks/useDmsWorkspace";
import { DmsHeader } from "../Layout/DmsHeader";
import { DmsSidebar } from "../Layout/DmsSidebar";
import { KpiCards } from "./KpiCards";
import { AdminDashboard } from "./AdminDashboard";
import { PublisherDashboard } from "./PublisherDashboard";
import { UserDashboard } from "./UserDashboard";
import { AllDocumentsTab } from "../Documents/AllDocumentsTab";
import { DocumentsToolbar } from "../Documents/DocumentsToolbar";
import { AllDocumentsTable } from "../Documents/AllDocumentsTable";
import { DocumentPreviewInspector } from "../Documents/DocumentPreviewInspector";
import { PublisherPermissionsTab } from "../PublisherPermissions/PublisherPermissionsTab";
import { EngineerGroupsManagementView } from "../EngineerGroups/EngineerGroupsManagementView";
import { AccessRequestsTab } from "../AccessRequests/AccessRequestsTab";
import { MyAccessRequestsTab } from "../MyAccessRequests/MyAccessRequestsTab";
import { TrashTab } from "../Trash/TrashTab";
import { DmsWorkspaceModals } from "../Modals/DmsWorkspaceModals";
import { DocSpecificationsModal } from "../Modals/DocumentDetailModals";
import { DmsAiAssistant } from "../AIElements/DmsAiAssistant";
import { columns } from "../initial-data";
import { Sparkles } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { Role, MainTab, DocumentRecord } from "../types";

export function DmsDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const ws = useDmsWorkspace("home");

  const [isLoadingEditDocument, setIsLoadingEditDocument] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("HO BLR");

  const [trashInfoDocument, setTrashInfoDocument] = useState<
    (typeof ws.deletedDocuments)[number] | null
  >(null);

  useEffect(() => {
    const determineDmsRoute = async () => {
      // Only perform the check if we are at the base routes
      if (
        location.pathname !== "/dashboard/document-management-system" &&
        location.pathname !== "/hr-admin/document-management-system" &&
        location.pathname !== "/dms"
      ) {
        // Sync workspace role based on route
        const currentRole = location.pathname.includes("/admin")
          ? "Admin"
          : location.pathname.includes("/publisher")
            ? "Publisher"
            : "User";

        if (ws.role !== currentRole) {
          ws.handleRoleChange(currentRole);
        }

        return;
      }

      const storedUser = localStorage.getItem("userData");
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const rolePermissions = parsed?.rolePermissions;

      if (!rolePermissions) {
        navigate("/dms/user", { replace: true });
        return;
      }

      const loggedInUserId = Number(
        parsed?.user_id ?? parsed?.userId ?? parsed?.id
      );

      // Determine publisher from publisher assignment API
      try {
        const response = await axiosInstance.get("/dms-publisher/get-all");

        const publishers = response?.data?.data ?? [];

        const isPublisher = publishers.some(
          (publisher: { publisher_user_id: number }) =>
            Number(publisher.publisher_user_id) === loggedInUserId
        );

        if (isPublisher) {
          navigate("/dms/publisher", { replace: true });
          return;
        }
      } catch (error) {
        console.error("Failed to determine publisher status:", error);
      }

      const permsList = Array.isArray(rolePermissions)
        ? rolePermissions
        : rolePermissions && typeof rolePermissions === "object"
          ? [rolePermissions]
          : [];

      const dmsRole = permsList.find((role: any) => {
        const menus = Array.isArray(role?.menus) ? role.menus : [];
        return menus.some((menu: any) => {
          const subMenus = Array.isArray(menu?.subMenus)
            ? menu.subMenus
            : Array.isArray(menu?.submenu)
              ? menu.submenu
              : Array.isArray(menu?.sub_menus)
                ? menu.sub_menus
                : [];

          return subMenus.some(
            (subMenu: any) =>
              subMenu?.subMenuId === 12 ||
              subMenu?.subMenuId === 30 ||
              subMenu?.id === 12 ||
              subMenu?.id === 30 ||
              subMenu?.path === "/dashboard/document-management-system" ||
              subMenu?.path === "/hr-admin/document-management-system"
          );
        });
      });

      const userRoleId = Number(
        dmsRole?.roleId ?? parsed?.roleId ?? parsed?.role_id ?? 1
      );

      if (userRoleId === 4) {
        ws.setActiveMainTab("publishers");
        ws.setActiveFolder("");
        navigate("/dms/admin", { replace: true });
        return;
      }

      navigate("/dms/user", { replace: true });
    };

    determineDmsRoute();
  }, [location.pathname, navigate, ws.role]);

  const selectedDocument =
    ws.documents.find((d) => d.id === ws.selectedId) || null;
  const previewDocument =
    ws.documents.find((d) => d.id === ws.previewDocId) || null;

  // Documents for "View all files" mode: include files belonging to the selected root folder
  // and all its nested subfolders, while excluding archived, inactive, and deleted records.
  // Also preserves document-level authorization / confidentiality restrictions.
  const folderDocuments = React.useMemo(() => {
    if (!ws.viewAllInFolder || !ws.currentFolderDef) {
      return ws.filteredDocuments;
    }

    const loggedInUserId = getLoggedInUserId();
    const currentUserIdNum = loggedInUserId == null ? null : Number(loggedInUserId);
    const queryVal = ws.query?.trim().toLowerCase();

    return ws.documents.filter((doc) => {
      // Must match root folder name
      if (doc.folder !== ws.currentFolderDef?.name) return false;

      // Status check
      const status = String(doc.status ?? "").toUpperCase();
      if (status === "ARCHIVED" || status === "INACTIVE" || doc.isDeleted) {
        return false;
      }

      // Quick filter popover: status
      if (ws.filterStatus !== "All" && doc.status !== ws.filterStatus) {
        return false;
      }

      // Quick filter popover: department
      if (ws.filterDepartment !== "All" && doc.department !== ws.filterDepartment) {
        return false;
      }

      // Quick filter popover: location
      if (ws.filterLocation !== "All") {
        const docLocNorm =
          doc.location === "HO"
            ? "HO BLR"
            : doc.location === "DCN"
              ? "DKN"
              : doc.location;
        const targetLocNorm =
          ws.filterLocation === "HO"
            ? "HO BLR"
            : ws.filterLocation === "DCN"
              ? "DKN"
              : ws.filterLocation;
        if (docLocNorm !== targetLocNorm) return false;
      }

      // Quick filter popover: type
      if (ws.filterDocType !== "All" && doc.type !== ws.filterDocType) {
        return false;
      }

      // Quick filter popover: confidential
      if (ws.filterConfidential === "Confidential" && !doc.isConfidential) {
        return false;
      }
      if (ws.filterConfidential === "Standard" && doc.isConfidential) {
        return false;
      }

      // Confidential authorization check
      if (doc.isConfidential) {
        const docRecord = doc as DocumentRecord & {
          createdBy?: number | string | null;
          hasAccess?: boolean;
          canView?: boolean;
        };
        const creatorId =
          docRecord.createdBy == null ? null : Number(docRecord.createdBy);
        const isCreator =
          currentUserIdNum !== null &&
          creatorId !== null &&
          Number.isFinite(currentUserIdNum) &&
          Number.isFinite(creatorId) &&
          currentUserIdNum === creatorId;
        const hasAccess =
          docRecord.hasAccess === true || docRecord.canView === true;
        if (!isCreator && !hasAccess) return false;
      }

      // Search query filter
      if (queryVal) {
        const docRecord = doc as DocumentRecord & {
          fileName?: string;
          file_name?: string;
          document_title?: string;
          document_number?: string;
        };
        const searchableFields = [
          doc.number,
          doc.title,
          doc.subject,
          doc.department,
          doc.location,
          doc.category,
          doc.custodian,
          doc.securityClassification,
          doc.retentionClass,
          doc.rack,
          doc.box,
          docRecord.fileName,
          docRecord.file_name,
          docRecord.document_title,
          docRecord.document_number,
          ...(Array.isArray(doc.tags) ? doc.tags : []),
        ];
        return searchableFields.some(
          (field) =>
            field != null &&
            String(field).trim().toLowerCase().includes(queryVal)
        );
      }

      return true;
    });
  }, [
    ws.viewAllInFolder,
    ws.currentFolderDef,
    ws.documents,
    ws.filteredDocuments,
    ws.filterStatus,
    ws.filterDepartment,
    ws.filterLocation,
    ws.filterDocType,
    ws.filterConfidential,
    ws.query,
  ]);

  const handleEditDocument = async () => {
    if (!previewDocument?.id || isLoadingEditDocument) return;

    try {
      setIsLoadingEditDocument(true);

      const response = await axiosInstance.get(
        `/dms-document/get/${previewDocument.id}`
      );

      if (response.data?.status !== "success" || !response.data?.data) {
        throw new Error("Failed to fetch document details.");
      }

      const doc = response.data.data;

      // Preserve the complete API response while mapping the fields
      // expected by AddDocumentModal's DocumentRecord interface.
      const mappedDoc = {
        ...previewDocument,
        id: String(doc.document_id),
        number: doc.document_number,
        title: doc.document_title,
        subject: doc.document_subject,
        folder: doc.target_folder,
        subfolder: "",
        subSubfolder: "",
        department: doc.department,
        location: doc.location,
        category: doc.category,
        type: doc.document_type,
        custodian: doc.custodian_name,
        owner: doc.custodian_name,
        openDate: doc.open_date || "",
        closeDate: doc.close_date || "",
        volume: doc.volume,
        securityClassification: doc.security_classification,
        retentionClass: doc.retention_class,
        isConfidential: doc.confidential_document,
        rack: doc.physical_rack,
        shelf: doc.physical_shelf,
        box: doc.physical_box,
        fileName: doc.file_name,
        filePath: doc.file_path,
        fileType: doc.file_type,
        size: doc.file_size,
        access: (doc.individual_engineer || []).map(String),
        tags: doc.tags || [],
        description: doc.description,
      } as DocumentRecord;

      ws.setAddDocPrefill({
        targetFolder: doc.target_folder || "",
        targetSubfolder: "",
        targetSubSubfolder: "",
        prefillDoc: mappedDoc,
      });

      ws.setShowAdd(true);
    } catch (error) {
      console.error("Failed to fetch document for editing:", error);
      ws.setToast("Failed to load document details. Please try again.");
    } finally {
      setIsLoadingEditDocument(false);
    }
  };

  const handleSummarizeDocument = async (doc: DocumentRecord) => {
    if (ws.isSummarizingDocument) return;

    const rawId = doc.id;
    const documentId = Number(rawId);

    if (!Number.isSafeInteger(documentId) || documentId <= 0) {
      ws.setToast("Invalid document ID for summarization.");
      return;
    }

    // Open assistant drawer
    ws.setShowAssistant(true);

    try {
      // 1. Create a scoped thread or use existing
      const title = `Summary: ${doc.title || doc.number || `Doc #${documentId}`}`;
      const newThread = await ws.createThread(title, documentId);

      // 2. Request document summary
      // ws.setToast(`Generating AI summary for ${doc.title || doc.number}...`);
      await ws.summarizeDocument(
        documentId,
        "detailed",
        newThread && typeof (newThread as any).thread_id === "number"
          ? (newThread as any).thread_id
          : ws.activeThreadId,
        null
      );

    } catch (err: any) {
      console.error("AI summarization failed:", err);
      ws.setToast(err?.message || "Failed to generate AI summary.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* Top Header */}
      <DmsHeader
        role={ws.role}
        pendingRequestsCount={ws.pendingRequestsCount}
        reviewDocsCount={ws.reviewDocsCount}
        onResetHome={() => {
          ws.setActiveMainTab("all-documents");
          ws.handleSelectFolder(null);
        }}
        onOpenNotifications={() => navigate("/notifications")}
        isSidebarCollapsed={ws.isSidebarCollapsed}
        onToggleSidebar={() => ws.setIsSidebarCollapsed((prev) => !prev)}
        searchQuery={ws.query}
        onSearchChange={(value) => {
          ws.setQuery(value);
        }}
        onCreateGroup={() => {
          ws.setEditingGroup(null);
          ws.setShowCreateGroupModal(true);
        }}
        onCreatePublisher={() => {
          ws.setEditingPublisher(null);
          ws.setShowCreatePublisherModal(true);
        }}
        onAddDocument={() => ws.setShowAdd(true)}
      />

      {/* Main Workspace: Left Sidebar + Center Content Area */}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        {/* Left Sidebar */}
        <DmsSidebar
          isSidebarCollapsed={ws.isSidebarCollapsed}
          onToggleCollapse={() => ws.setIsSidebarCollapsed((prev) => !prev)}
          role={ws.role}
          folders={ws.folders}
          selectedFolder={ws.selectedFolder}
          selectedSubfolder={ws.selectedSubfolder}
          selectedSubSubfolder={ws.selectedSubSubfolder}
          selectedSubfolderPath={ws.selectedSubfolderPath}
          expandedFolders={ws.expandedFolders}
          expandedSubfolders={ws.expandedSubfolders}
          expandedPaths={ws.expandedPaths}
          folderCounts={ws.folderCounts}
          subfolderCounts={ws.subfolderCounts}
          subSubfolderCounts={ws.subSubfolderCounts}
          dragOverFolder={ws.dragOverFolder}
          dragOverSubfolder={ws.dragOverSubfolder}
          dragOverSubSubfolder={ws.dragOverSubSubfolder}
          filterLocation={ws.filterLocation}
          activeMainTab={ws.activeMainTab}
          deletedDocsCount={ws.deletedDocsCount}
          onSelectFolder={ws.handleSelectFolder}
          onSelectSubfolder={ws.handleSelectSubfolder}
          onSelectSubSubfolder={ws.handleSelectSubSubfolder}
          onSelectNestedSubfolder={ws.handleSelectNestedSubfolder}
          toggleFolderExpand={ws.toggleFolderExpand}
          toggleSubfolderExpand={ws.toggleSubfolderExpand}
          onToggleNestedPath={ws.handleToggleNestedPath}
          setShowCreateFolderModal={ws.setShowCreateFolderModal}
          setCreateSubfolderForFolder={ws.setCreateSubfolderForFolder}
          setCreateSubSubfolderFor={ws.setCreateSubSubfolderFor}
          handleRenameClick={ws.handleRenameClick}
          handleEditDescriptionClick={ws.handleEditDescriptionClick}
          handleDeleteFolderClick={ws.handleDeleteFolderClick}
          handleDeleteSubfolderClick={ws.handleDeleteSubfolderClick}
          handleDeleteSubSubfolderClick={ws.handleDeleteSubSubfolderClick}
          setMoveFolderTarget={(target) =>
            ws.setMoveTarget({
              subfolderName: target.folderName,
              sourceFolder: target.folderName,
              docCount: target.docCount,
            })
          }
          setMoveSubfolderTarget={ws.setMoveTarget}
          setMoveSubSubTarget={ws.setMoveSubSubTarget}
          handleFolderDragOver={ws.handleFolderDragOver}
          handleFolderDragLeave={ws.handleFolderDragLeave}
          handleFolderDrop={ws.handleFolderDrop}
          handleSubfolderDragStart={ws.handleSubfolderDragStart}
          handleSubfolderDragOver={ws.handleSubfolderDragOver}
          handleSubfolderDragLeave={ws.handleSubfolderDragLeave}
          handleSubfolderDrop={ws.handleSubfolderDrop}
          handleSubSubfolderDragStart={ws.handleSubSubfolderDragStart}
          handleSubSubfolderDragOver={ws.handleSubSubfolderDragOver}
          handleSubSubfolderDragLeave={ws.handleSubSubfolderDragLeave}
          handleSubSubfolderDrop={ws.handleSubSubfolderDrop}
          onLocationSelect={(loc) => {
            setSelectedLocation(loc);
            ws.setFilterLocation(loc);
          }}
          onTrashClick={() => {
            ws.setActiveMainTab("trash");
          }}
        />

        {/* Center Main Content */}
        <main className="relative flex flex-1 flex-col min-w-0 bg-white overflow-hidden">
          {/* KPI & Tab Navigation Bar */}
          <div className="p-3 sm:p-4 pb-1 bg-white border-b border-slate-200 shrink-0">
            {/* Global KPI Summary Bar */}
            <KpiCards
              role={ws.role}
              onTotalClick={() => {
                ws.setActiveMainTab("all-documents");
                ws.setSelectedFolder(null);
                ws.setSelectedSubfolder(null);
                ws.setSelectedSubSubfolder(null);
                ws.setViewAllInFolder(false);
                ws.setActiveFolder("All documents");
              }}
              onControlledClick={() => {
                ws.setActiveMainTab("all-documents");
                ws.setSelectedFolder(null);
                ws.setSelectedSubfolder(null);
                ws.setSelectedSubSubfolder(null);
                ws.setViewAllInFolder(false);
                ws.setFilterStatus("Controlled");
              }}
              onReviewClick={() => {
                ws.setActiveMainTab("all-documents");
                ws.setSelectedFolder(null);
                ws.setSelectedSubfolder(null);
                ws.setSelectedSubSubfolder(null);
                ws.setViewAllInFolder(false);
                ws.setFilterStatus("Review");
              }}
              onArchiveClick={() => {
                ws.setActiveMainTab("archive");
                ws.setSelectedFolder(null);
                ws.setSelectedSubfolder(null);
                ws.setSelectedSubSubfolder(null);
                ws.setViewAllInFolder(false);
                ws.setActiveFolder("Archived Records");
              }}
            />

            {/* Role Dashboard Switcher */}
            {ws.role === "Admin" && (
              <AdminDashboard
                activeMainTab={ws.activeMainTab}
                onTabChange={(tab: MainTab) => {
                  ws.setActiveMainTab(tab);
                  ws.setSelectedFolder(null);
                  ws.setSelectedSubfolder(null);
                  ws.setSelectedSubSubfolder(null);
                  ws.setViewAllInFolder(false);
                }}
                activeFolder={ws.activeFolder}
                onFolderChange={(folder: string) => ws.setActiveFolder(folder)}
              />
            )}

            {ws.role === "Publisher" && (
              <PublisherDashboard
                activeMainTab={ws.activeMainTab}
                onTabChange={(tab: MainTab) => {
                  ws.setActiveMainTab(tab);
                  ws.setSelectedFolder(null);
                  ws.setSelectedSubfolder(null);
                  ws.setSelectedSubSubfolder(null);
                  ws.setViewAllInFolder(false);
                }}
                activeFolder={ws.activeFolder}
                onFolderChange={(folder: string) => ws.setActiveFolder(folder)}
              />
            )}

            {ws.role === "User" && (
              <UserDashboard
                activeMainTab={ws.activeMainTab}
                onTabChange={(tab: MainTab) => {
                  ws.setActiveMainTab(tab);
                  ws.setSelectedFolder(null);
                  ws.setSelectedSubfolder(null);
                  ws.setSelectedSubSubfolder(null);
                  ws.setViewAllInFolder(false);
                }}
                activeFolder={ws.activeFolder}
                onFolderChange={(folder: string) => ws.setActiveFolder(folder)}
              />
            )}
          </div>

          {/* Content Area for Active Tab */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50/50">
            {ws.activeMainTab === "publishers" && (
              <PublisherPermissionsTab
                publishers={ws.publishers}
                folders={ws.folders}
                globalSearch={ws.query}
                adminGovernanceMode={ws.adminGovernanceMode}
                setAdminGovernanceMode={ws.setAdminGovernanceMode}
                publisherSearch={ws.publisherSearch}
                setPublisherSearch={ws.setPublisherSearch}
                publisherFolderFilter={ws.publisherFolderFilter}
                setPublisherFolderFilter={ws.setPublisherFolderFilter}
                folderModeSearch={ws.folderModeSearch}
                setFolderModeSearch={ws.setFolderModeSearch}
                folderModeFilter={ws.folderModeFilter as any}
                setFolderModeFilter={ws.setFolderModeFilter as any}
                onCreatePublisher={() => {
                  ws.setEditingPublisher(null);
                  ws.setShowCreatePublisherModal(true);
                }}
                onEditPublisher={(pub) => {
                  ws.setEditingPublisher(pub);
                  ws.setShowCreatePublisherModal(true);
                }}
                onDeletePublisher={(id: string) => {
                  const pub = ws.publishers.find((p) => p.id === id);
                  if (pub) {
                    ws.setPublisherToDelete(pub);
                  }
                }}
                onManageFolderPublishers={(folder) =>
                  ws.setSelectedFolderForPublishers(folder)
                }
                onSelectFolderForPublishers={(folder) =>
                  ws.setSelectedFolderForPublishers(folder)
                }
                onSelectSubfolderForPublishers={(target) => {
                  ws.setSelectedFolderForPublishers(null);
                  ws.setSelectedSubfolderForPublishers(target);
                }}
                onQuickRevokeFolderPublisher={(
                  folderName: string,
                  publisherId: string
                ) => {
                  ws.handleQuickRevokeFolderPublisher(folderName, publisherId);
                }}
                isPublisherAssignedToSubfolder={
                  ws.isPublisherAssignedToSubfolder
                }
              />
            )}

            {ws.activeMainTab === "groups" && (
              <EngineerGroupsManagementView
                engineerGroups={ws.engineerGroups}
                engineers={ws.engineersList}
                search={ws.groupSearch}
                onSearchChange={ws.setGroupSearch}
                filterDept={ws.groupFilterDept}
                onFilterDeptChange={ws.setGroupFilterDept}
                onCreateGroup={() => {
                  ws.setEditingGroup(null);
                  ws.setShowCreateGroupModal(true);
                }}
                onEditGroup={(group) => {
                  ws.setEditingGroup(group);
                  ws.setShowCreateGroupModal(true);
                }}
                onDeleteGroup={(group) => ws.setGroupToDelete(group)}
                dashboardCounts={ws.dashboardCounts}
                groupPage={ws.groupPage}
                groupLimit={ws.groupLimit}
                groupTotalCount={ws.groupTotalCount}
                onPageChange={ws.setGroupPage}
              />
            )}

            {ws.activeMainTab === "trash" && (
              <TrashTab
                deletedDocuments={ws.deletedDocuments}
                folders={ws.folders}
                onShowDocInfo={(doc) => setTrashInfoDocument(doc)}
                availableTrashYears={ws.availableTrashYears}
                trashSearchQuery={ws.trashSearchQuery}
                setTrashSearchQuery={ws.setTrashSearchQuery}
                trashFilterYear={ws.trashFilterYear}
                setTrashFilterYear={ws.setTrashFilterYear}
                trashFilterFolder={ws.trashFilterFolder}
                setTrashFilterFolder={ws.setTrashFilterFolder}
                trashFilterSubfolder={ws.trashFilterSubfolder}
                setTrashFilterSubfolder={ws.setTrashFilterSubfolder}
                trashSortBy={ws.trashSortBy}
                setTrashSortBy={ws.setTrashSortBy}
                onEmptyTrashClick={() => ws.setShowEmptyTrashModal(true)}
                onRestoreDocument={(id) => ws.handleRestoreDocument(id)}
                onPermanentDeleteClick={(doc) =>
                  ws.setPermanentDeleteTarget(doc)
                }
                onRestoreAllDocuments={ws.handleRestoreAllDocuments}
                totalDeletedCount={ws.totalDeletedCount}
                matchingFilterCount={ws.matchingFilterCount}
              />
            )}

            {ws.activeMainTab === "access-requests" && (
              <AccessRequestsTab
                accessRequests={ws.accessRequests}
                requestFilter={ws.requestFilter}
                setRequestFilter={ws.setRequestFilter}
                requestSearch={ws.requestSearch}
                setRequestSearch={ws.setRequestSearch}
                pendingRequestsCount={ws.pendingRequestsCount}
                onOpenGrantModal={ws.handleOpenGrantModal}
                onRejectRequest={ws.handleRejectRequest}
                onOpenPreviewDoc={(docId, docNum) => {
                  const target = ws.documents.find(
                    (d) => String(d.id) === String(docId)
                  );

                  if (target) {
                    ws.handleOpenFilePreview(target);
                  } else {
                    console.error("Document not found:", {
                      docId,
                      docNum,
                      availableDocumentIds: ws.documents.map((d) => d.id),
                    });
                  }
                }}
                tabCounts={ws.accessRequestsCounts}
                page={ws.accessRequestsPage}
                setPage={ws.setAccessRequestsPage}
                limit={ws.accessRequestsLimit}
                setLimit={ws.setAccessRequestsLimit}
                totalCount={ws.accessRequestsTotalCount}
              />
            )}

            {ws.activeMainTab === "my-requests" && (
              <MyAccessRequestsTab
                accessRequests={ws.accessRequests}
                globalSearch={ws.query}
                onBrowseControlledFiles={() => {
                  ws.setActiveMainTab("all-documents");
                  ws.handleSelectFolder(null);
                }}
                onOpenPreviewDoc={(docId, docNum) => {
                  const target = ws.documents.find(
                    (d) => String(d.id) === String(docId)
                  );

                  if (target) {
                    ws.handleOpenFilePreview(target);
                  } else {
                    console.error("Document not found:", {
                      docId,
                      docNum,
                      availableDocumentIds: ws.documents.map((d) => d.id),
                    });
                  }
                }}
              />
            )}

            {ws.activeMainTab === "all-documents" && ws.viewAllInFolder ? (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-background">
                <DocumentsToolbar
                  selectedSubSubfolder={ws.selectedSubSubfolder}
                  selectedSubfolder={ws.selectedSubfolder}
                  selectedFolder={ws.selectedFolder}
                  currentFolderDef={ws.currentFolderDef}
                  currentSubfolderDef={ws.currentSubfolderDef}
                  currentSubSubfolderDef={ws.currentSubSubfolderDef}
                  viewAllInFolder={ws.viewAllInFolder}
                  filterLocation={ws.filterLocation}
                  filteredDocumentsCount={folderDocuments.length}
                  activeMainTab={ws.activeMainTab}
                  selected={ws.selected}
                  role={ws.role}
                  showColumns={ws.showColumns}
                  setShowColumns={ws.setShowColumns}
                  visibleColumns={ws.visibleColumns}
                  setVisibleColumns={ws.setVisibleColumns}
                  columns={ws.columns}
                  toggleColumn={ws.toggleColumn}
                  showFilters={ws.showFilters}
                  setShowFilters={ws.setShowFilters}
                  activeFilterCount={ws.activeFilterCount}
                  resetFilters={ws.resetFilters}
                  filterStatus={ws.filterStatus}
                  setFilterStatus={ws.setFilterStatus}
                  filterDepartment={ws.filterDepartment}
                  setFilterDepartment={ws.setFilterDepartment}
                  setFilterLocation={ws.setFilterLocation}
                  filterDocType={ws.filterDocType}
                  setFilterDocType={ws.setFilterDocType}
                  filterConfidential={ws.filterConfidential}
                  setFilterConfidential={ws.setFilterConfidential}
                  showSortMenu={ws.showSortMenu}
                  setShowSortMenu={ws.setShowSortMenu}
                  sortField={ws.sortField}
                  setSortField={ws.setSortField}
                  sortOrder={ws.sortOrder}
                  setSortOrder={ws.setSortOrder}
                  showViewMenu={ws.showViewMenu}
                  setShowViewMenu={ws.setShowViewMenu}
                  viewMode={ws.viewMode}
                  setViewMode={ws.setViewMode}
                  showDetailsPane={ws.showDetailsPane}
                  setShowDetailsPane={ws.setShowDetailsPane}
                  previewDocId={ws.previewDocId}
                  setPreviewDocId={ws.setPreviewDocId}
                  selectedId={ws.selectedId}
                  setSelectedId={ws.setSelectedId}
                  filteredDocuments={folderDocuments}
                  query={ws.query}
                  setQuery={ws.setQuery}
                  onSelectFolder={ws.handleSelectFolder}
                  setSelectedSubfolder={ws.setSelectedSubfolder}
                  setSelectedSubSubfolder={ws.setSelectedSubSubfolder}
                  setViewAllInFolder={ws.setViewAllInFolder}
                  onUnarchiveDocument={ws.handleUnarchiveDocument}
                  handleOpenAddForSubSubfolder={ws.handleOpenAddForSubSubfolder}
                  handleOpenAddForSubfolder={ws.handleOpenAddForSubfolder}
                />
                <AllDocumentsTable
                  filteredDocuments={folderDocuments}
                  selectedId={ws.selectedId}
                  folders={ws.folders}
                  authorizedFolders={ws.authorizedFolders}
                  activeMainTab={ws.activeMainTab}
                  setShowVersions={ws.setShowVersions}
                  setMoveDocTarget={ws.setMoveDocTarget}
                  visibleColumns={ws.visibleColumns}
                  columns={ws.columns}
                  sortField={ws.sortField}
                  sortOrder={ws.sortOrder}
                  onSort={ws.handleSort}
                  selected={ws.selected}
                  onSelect={ws.updateSelected}
                  viewMode={ws.viewMode}
                  canMoveFiles={ws.canMoveFiles}
                  role={ws.role}
                  accessRequests={ws.accessRequests}
                  onOpenPreview={ws.handleOpenFilePreview}
                  onShowVersions={() => ws.setShowVersions(true)}
                  onUnarchive={ws.handleUnarchiveDocument}
                  onDocumentLeftClick={ws.handleDocumentLeftClick}
                  handleDocumentDragStart={ws.handleDocumentDragStart}
                  handleDocumentClick={ws.handleDocumentClick}
                  handleOpenFilePreview={ws.handleOpenFilePreview}
                  query={ws.query}
                  setQuery={ws.setQuery}
                  resetFilters={ws.resetFilters}
                  setActiveFolder={ws.setActiveFolder}
                />
              </div>
            ) : (
              (ws.activeMainTab === "all-documents" ||
                ws.activeMainTab === "archive") && (
                <AllDocumentsTab
                  activeMainTab={ws.activeMainTab}
                  isShowingSubfoldersScreen={ws.isShowingSubfoldersScreen}
                  currentFolderDef={ws.currentFolderDef}
                  selectedSubfolder={ws.selectedSubfolder}
                  selectedSubSubfolder={ws.selectedSubSubfolder}
                  selectedSubfolderPath={ws.selectedSubfolderPath}
                  currentSubfolderDef={ws.currentSubfolderDef}
                  currentSubSubfolderDef={ws.currentSubSubfolderDef}
                  currentNestedSubfolderDef={ws.currentNestedSubfolderDef}
                  onSelectNestedSubfolder={ws.handleSelectNestedSubfolder}
                  folders={ws.folders}
                  folderCounts={ws.folderCounts}
                  role={ws.role}
                  filteredDocuments={ws.filteredDocuments}
                  onOpenFilePreview={ws.handleOpenFilePreview}
                  onSelectFolder={ws.handleSelectFolder}
                  setShowCreateFolderModal={ws.setShowCreateFolderModal}
                  viewAllInFolder={ws.viewAllInFolder}
                  setViewAllInFolder={ws.setViewAllInFolder}
                  showViewMenu={ws.showViewMenu}
                  setShowViewMenu={ws.setShowViewMenu}
                  viewMode={ws.viewMode}
                  setViewMode={ws.setViewMode}
                  showDetailsPane={ws.showDetailsPane}
                  setShowDetailsPane={ws.setShowDetailsPane}
                  previewDocId={ws.previewDocId}
                  setPreviewDocId={ws.setPreviewDocId}
                  selectedId={ws.selectedId}
                  setSelectedId={ws.setSelectedId}
                  setSubfolderSearch={ws.setSubfolderSearch}
                  subfolderSearch={ws.subfolderSearch}
                  displayedSubfolders={ws.displayedSubfolders}
                  subfolderCounts={ws.subfolderCounts}
                  onSelectSubfolder={ws.handleSelectSubfolder}
                  onSelectSubSubfolder={ws.handleSelectSubSubfolder}
                  handleSubfolderDragStart={ws.handleSubfolderDragStart}
                  handleSubSubfolderDragStart={ws.handleSubSubfolderDragStart}
                  dragOverSubfolder={ws.dragOverSubfolder}
                  dragOverSubSubfolder={ws.dragOverSubSubfolder}
                  handleSubfolderDragOver={ws.handleSubfolderDragOver}
                  handleSubfolderDragLeave={ws.handleSubfolderDragLeave}
                  handleSubfolderDrop={ws.handleSubfolderDrop}
                  handleSubSubfolderDragOver={ws.handleSubSubfolderDragOver}
                  handleSubSubfolderDragLeave={ws.handleSubSubfolderDragLeave}
                  handleSubSubfolderDrop={ws.handleSubSubfolderDrop}
                  setCreateSubfolderForFolder={
                    ws.setCreateSubfolderForFolder
                  }
                  setCreateSubSubfolderFor={ws.setCreateSubSubfolderFor}
                  setSelectedFolderForPublishers={
                    ws.setSelectedFolderForPublishers
                  }
                  setSelectedSubfolderForPublishers={
                    ws.setSelectedSubfolderForPublishers
                  }
                  handleDeleteFolderClick={ws.handleDeleteFolderClick}
                  handleOpenAddForSubfolder={ws.handleOpenAddForSubfolder}
                  canUploadToSubfolder={ws.canUploadToSubfolder}
                  handleRenameClick={ws.handleRenameClick}
                  handleEditDescriptionClick={ws.handleEditDescriptionClick}
                  handleDeleteSubfolderClick={
                    ws.handleDeleteSubfolderClick
                  }
                  handleDeleteSubSubfolderClick={
                    ws.handleDeleteSubSubfolderClick
                  }
                  onBrowseControlledFiles={ws.handleBrowseControlledFiles}
                  isControlledFilesView={ws.isControlledFilesView}
                  query={ws.query}
                />
              )
            )}

          </div>

          {/* Side Preview Inspector Panel (Spans full height of main workspace from top KPI cards to bottom) */}
          {ws.showDetailsPane && previewDocument && (
            <DocumentPreviewInspector
              previewDoc={previewDocument}
              onClose={() => ws.setPreviewDocId(null)}
              previewAccess={{
                hasAccess: !!previewDocument.hasAccess,
                isPending: previewDocument.accessStatus === "PENDING_REQUEST",
              }}
              role={ws.role}
              userId={getLoggedInUserId() ?? undefined}
              folders={ws.folders}
              onOpenVersions={() => ws.setShowVersions(true)}
              onOpenSpecs={() => ws.setShowDocInfoModal(true)}
              onOpenAccess={() => ws.setShowAccess(true)}
              onEditDoc={handleEditDocument}
              onMoveDoc={() => {
                ws.setMoveDocTarget({
                  document: previewDocument,
                  targetFolder: ws.folders[0]?.name || "",
                  targetSubfolder: "",
                });
              }}
              onDownloadDoc={(doc) =>
                ws.handleDownloadDocument(doc)
              }
              onToggleArchive={(doc) => ws.handleArchive()}
              onDeleteDoc={(doc) =>
                ws.setDocumentToDelete(doc)
              }
              onRequestAccess={(doc) =>
                ws.setShowRequestAccessModalFor(doc)
              }
              onSummarizeDoc={handleSummarizeDocument}
              isSummarizingDocument={ws.isSummarizingDocument}
              onCopyNumber={(num) => {
                if (
                  typeof navigator !== "undefined" &&
                  navigator.clipboard
                ) {
                  navigator.clipboard.writeText(num);
                }
                ws.setToast(`Copied document number ${num}`);
              }}
            />
          )}
        </main>
      </div>

      {/* Floating AI Assistant Trigger */}
      <button
        type="button"
        onClick={() => ws.setShowAssistant(!ws.showAssistant)}
        className="fixed bottom-6 right-6 z-40 flex size-16 items-center justify-center rounded-full bg-[#1E6FBF] text-white shadow-lg hover:bg-[#165b9e] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="AI Assistant"
        aria-label="AI Assistant"
      >
        <Sparkles className="size-8" />
      </button>

      {/* AI Assistant Modal */}
      {ws.showAssistant && (
        <DmsAiAssistant
          threadId="home"
          showAssistant={ws.showAssistant}
          onClose={() => ws.setShowAssistant(false)}
          onToggle={() => ws.setShowAssistant(!ws.showAssistant)}
          onCreateThread={ws.createThread}
          messages={ws.messages}
          status={ws.assistantStatus}
          stop={ws.stop}
          error={ws.error}
          onSubmitAssistant={ws.submitAssistant}
          threads={ws.threads}
          activeThreadId={ws.activeThreadId}
          onSelectThread={ws.setActiveThreadId}
          onDeleteThread={ws.deleteThread}
          isLoadingThreads={ws.isLoadingThreads}
          isLoadingMessages={ws.isLoadingMessages}
          isCreatingThread={ws.isCreatingThread}
          isSummarizingDocument={ws.isSummarizingDocument}
          ocrResult={ws.ocrResult}
          isProcessingOcr={ws.isProcessingOcr}
          isLoadingOcr={ws.isLoadingOcr}
          ocrError={ws.ocrError}
          onGetDocumentOcr={ws.getDocumentOcr}
          onProcessDocumentOcr={ws.processDocumentOcr}
          onOpenCitation={(documentId: number) => {
            const targetDoc = ws.documents.find(
              (doc) =>
                doc.id === String(documentId) ||
                Number((doc as any).document_id) === documentId
            );

            if (targetDoc) {
              ws.handleOpenFilePreview(targetDoc);
            } else {
              console.warn(
                "Document not found in workspace for ID:",
                documentId
              );
            }
          }}
        />
      )}

      {/* Modals & Dialogs Container */}
      <DmsWorkspaceModals
        role={ws.role}
        folders={ws.folders}
        authorizedFolders={ws.authorizedFolders}
        activeMainTab={ws.activeMainTab}
        documents={ws.documents}
        setDocuments={ws.setDocuments}
        publishers={ws.publishers}
        engineerGroups={ws.engineerGroups}
        selected={selectedDocument}
        setSelectedId={ws.setSelectedId}
        showAdd={ws.showAdd}
        setShowAdd={ws.setShowAdd}
        addDocPrefill={ws.addDocPrefill}
        setAddDocPrefill={ws.setAddDocPrefill}
        showDocInfoModal={ws.showDocInfoModal}
        setShowDocInfoModal={ws.setShowDocInfoModal}
        showAccess={ws.showAccess}
        setShowAccess={ws.setShowAccess}
        showVersions={ws.showVersions}
        setShowVersions={ws.setShowVersions}
        showCreatePublisherModal={ws.showCreatePublisherModal}
        setShowCreatePublisherModal={ws.setShowCreatePublisherModal}
        editingPublisher={ws.editingPublisher}
        setEditingPublisher={ws.setEditingPublisher}
        publisherToDelete={ws.publisherToDelete}
        setPublisherToDelete={ws.setPublisherToDelete}
        handleDeletePublisher={ws.handleDeletePublisher}
        handleSavePublisher={ws.handleSavePublisher}
        publisherDropdown={ws.publisherDropdown}
        showCreateGroupModal={ws.showCreateGroupModal}
        setShowCreateGroupModal={ws.setShowCreateGroupModal}
        editingGroup={ws.editingGroup}
        setEditingGroup={ws.setEditingGroup}
        handleSaveGroup={ws.handleSaveGroup}
        engineersList={ws.engineersList}
        groupToDelete={ws.groupToDelete}
        setGroupToDelete={ws.setGroupToDelete}
        handleDeleteGroup={ws.handleDeleteGroup}
        selectedFolderForPublishers={ws.selectedFolderForPublishers}
        setSelectedFolderForPublishers={ws.setSelectedFolderForPublishers}
        handleUpdateFolderPublishers={ws.handleUpdateFolderPublishers}
        selectedSubfolderForPublishers={ws.selectedSubfolderForPublishers}
        setSelectedSubfolderForPublishers={ws.setSelectedSubfolderForPublishers}
        handleUpdateSubfolderPublishers={ws.handleUpdateSubfolderPublishers}
        showCreateFolderModal={ws.showCreateFolderModal}
        setShowCreateFolderModal={ws.setShowCreateFolderModal}
        handleCreateFolder={ws.handleCreateFolder}
        createSubfolderForFolder={ws.createSubfolderForFolder}
        setCreateSubfolderForFolder={ws.setCreateSubfolderForFolder}
        handleCreateSubfolder={ws.handleCreateSubfolder}
        createSubSubfolderFor={ws.createSubSubfolderFor}
        setCreateSubSubfolderFor={ws.setCreateSubSubfolderFor}
        handleCreateSubSubfolder={ws.handleCreateSubSubfolder}
        renameTarget={ws.renameTarget}
        setRenameTarget={ws.setRenameTarget}
        handleConfirmRename={ws.handleConfirmRename}
        descriptionTarget={ws.descriptionTarget}
        setDescriptionTarget={ws.setDescriptionTarget}
        handleConfirmDescriptionUpdate={ws.handleConfirmDescriptionUpdate}
        deleteTarget={ws.deleteTarget}
        setDeleteTarget={ws.setDeleteTarget}
        handleConfirmDelete={ws.handleConfirmDelete}
        moveTarget={ws.moveTarget}
        setMoveTarget={ws.setMoveTarget}
        handleConfirmMove={ws.handleConfirmMove}
        fetchMoveSubfolderPreview={ws.fetchMoveSubfolderPreview}
        moveSubSubTarget={ws.moveSubSubTarget}
        setMoveSubSubTarget={ws.setMoveSubSubTarget}
        handleConfirmMoveSubSubfolder={ws.handleConfirmMoveSubSubfolder}
        moveDocTarget={ws.moveDocTarget}
        setMoveDocTarget={ws.setMoveDocTarget}
        handleConfirmMoveDocument={ws.handleConfirmMoveDocument}
        grantModalRequest={ws.grantModalRequest}
        setGrantModalRequest={ws.setGrantModalRequest}
        grantIsLifetime={ws.grantIsLifetime}
        setGrantIsLifetime={ws.setGrantIsLifetime}
        grantFromDate={ws.grantFromDate}
        setGrantFromDate={ws.setGrantFromDate}
        grantToDate={ws.grantToDate}
        setGrantToDate={ws.setGrantToDate}
        grantRemarks={ws.grantRemarks}
        setGrantRemarks={ws.setGrantRemarks}
        handleConfirmGrantAccess={ws.handleConfirmGrantAccess}
        showRequestAccessModalFor={ws.showRequestAccessModalFor}
        setShowRequestAccessModalFor={ws.setShowRequestAccessModalFor}
        userRequestReason={ws.userRequestReason}
        setUserRequestReason={ws.setUserRequestReason}
        handleUserSubmitRequest={ws.handleUserSubmitRequest}
        fileActionMenu={ws.fileActionMenu}
        setFileActionMenu={ws.setFileActionMenu}
        handleOpenFilePreview={ws.handleOpenFilePreview}
        handleDownloadDocument={ws.handleDownloadDocument}
        setToast={ws.setToast}
        documentToDelete={ws.documentToDelete}
        setDocumentToDelete={ws.setDocumentToDelete}
        handleMoveToTrash={ws.handleMoveToTrash}
        permanentDeleteTarget={ws.permanentDeleteTarget}
        setPermanentDeleteTarget={ws.setPermanentDeleteTarget}
        handlePermanentDelete={ws.handlePermanentDelete}
        showEmptyTrashModal={ws.showEmptyTrashModal}
        setShowEmptyTrashModal={ws.setShowEmptyTrashModal}
        deletedDocsCount={ws.deletedDocsCount}
        handleEmptyTrash={ws.handleEmptyTrash}
        notify={ws.notify}
        updateSelected={ws.updateSelected}
        handleUnarchiveDocument={ws.handleUnarchiveDocument}
        onSummarizeDocument={handleSummarizeDocument}
      />

      {trashInfoDocument && (
        <DocSpecificationsModal
          selected={trashInfoDocument}
          onClose={() => setTrashInfoDocument(null)}
          onOpenAccess={() => {
            ws.setSelectedId(trashInfoDocument.id);
            ws.setShowAccess(true);
          }}
          onOpenVersions={() => {
            ws.setSelectedId(trashInfoDocument.id);
            ws.setShowVersions(true);
          }}
          onOpenFile={() => ws.handleOpenFilePreview(trashInfoDocument)}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 999999 }}
      />
    </div>
  );
}

export { KpiCards };
export default DmsDashboard;
