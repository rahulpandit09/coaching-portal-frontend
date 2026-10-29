import React, { useMemo } from "react";
import {
  Folder,
  FolderOpen,
  Plus,
  ChevronRight,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
  UsersRound,
  LayoutList,
  Search,
  X,
  ArrowLeft,
  FileText,
  Inbox,
  Lock,
  Archive,
} from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/DocumentManagementSystem/ui/dropdown-menu";
import { StatusBadge } from "../Common/StatusBadge";
import { DocumentsToolbar } from "./DocumentsToolbar";
import { AllDocumentsTable, formatDocumentStatus } from "./AllDocumentsTable";
import type {
  DocumentRecord,
  FolderDefinition,
  Role,
  ViewMode,
} from "../types";
import type { SubfolderTarget } from "../hooks/useDmsFolderActions";
const HighlightText = ({
  text,
  query,
}: {
  text: string;
  query?: string;
}) => {
  const search = query?.trim();

  if (!search || !text) {
    return <>{text}</>;
  }

  const escapedQuery = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <mark
            key={index}
            className="rounded-sm bg-yellow-200 px-0.5 text-inherit"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

export function AllDocumentsTab({
  activeMainTab,
  isShowingSubfoldersScreen,
  currentFolderDef,
  selectedSubfolder,
  selectedSubSubfolder,
  selectedSubfolderPath = [],
  currentSubfolderDef,
  currentSubSubfolderDef,
  currentNestedSubfolderDef,
  onSelectNestedSubfolder,
  folders,
  folderCounts,
  role,
  onSelectFolder,
  setShowCreateFolderModal,
  viewAllInFolder,
  setViewAllInFolder,
  setSubfolderSearch,
  subfolderSearch,
  displayedSubfolders,
  subfolderCounts,
  onSelectSubfolder,
  onSelectSubSubfolder,
  handleSubfolderDragStart,
  handleSubSubfolderDragStart,
  dragOverSubfolder,
  dragOverSubSubfolder,
  handleSubfolderDragOver,
  handleSubfolderDragLeave,
  handleSubfolderDrop,
  handleSubSubfolderDragOver,
  handleSubSubfolderDragLeave,
  handleSubSubfolderDrop,
  setCreateSubfolderForFolder,
  setCreateSubSubfolderFor,
  setSelectedFolderForPublishers,
  setSelectedSubfolderForPublishers,
  handleDeleteFolderClick,
  handleOpenAddForSubfolder,
  canUploadToSubfolder,
  handleRenameClick,
  handleEditDescriptionClick,
  handleDeleteSubfolderClick,
  handleDeleteSubSubfolderClick,
  onBrowseControlledFiles,
  isControlledFilesView,
  filteredDocuments,
  onOpenFilePreview,
  query,
  showViewMenu,
  setShowViewMenu,
  viewMode,
  setViewMode,
  showDetailsPane,
  setShowDetailsPane,
  previewDocId,
  setPreviewDocId,
  selectedId,
  setSelectedId,
}: {
  activeMainTab?: string;
  isShowingSubfoldersScreen: boolean;
  currentFolderDef: FolderDefinition | null | undefined;
  selectedSubfolder?: string | null;
  selectedSubSubfolder?: string | null;
  selectedSubfolderPath?: string[];
  currentSubfolderDef?: any;
  currentSubSubfolderDef?: any;
  currentNestedSubfolderDef?: any;
  onSelectNestedSubfolder?: (folder: string, path: string[]) => void;
  folders: FolderDefinition[];
  folderCounts: Record<string, number>;
  role: Role;
  onSelectFolder: (name: string | null) => void;
  setShowCreateFolderModal: (show: boolean) => void;
  viewAllInFolder: boolean;
  setViewAllInFolder: (viewAll: boolean) => void;
  setSubfolderSearch: (val: string) => void;
  subfolderSearch: string;
  displayedSubfolders: any[];
  subfolderCounts: Record<string, number>;
  onSelectSubfolder: (folder: string, subfolder: string) => void;
  onSelectSubSubfolder: (folder: string, subfolder: string, subSubfolder: string) => void;
  handleSubfolderDragStart: (e: React.DragEvent, folderName: string, sfName: string, folderId?: number | string, sfId?: number | string) => void;
  handleSubSubfolderDragStart: (e: React.DragEvent, folderName: string, sfName: string, ssfName: string) => void;
  dragOverSubfolder: string | null;
  dragOverSubSubfolder: string | null;
  handleSubfolderDragOver: (e: React.DragEvent, folderName: string, sfName: string) => void;
  handleSubfolderDragLeave: (folderName: string, sfName: string) => void;
  handleSubfolderDrop: (e: React.DragEvent, folderName: string, sfName: string) => void;
  handleSubSubfolderDragOver: (e: React.DragEvent, folderName: string, sfName: string, ssfName: string) => void;
  handleSubSubfolderDragLeave: (folderName: string, sfName: string, ssfName: string) => void;
  handleSubSubfolderDrop: (e: React.DragEvent, folderName: string, sfName: string, ssfName: string) => void;
  setCreateSubfolderForFolder: (folderName: string | null) => void;
  setCreateSubSubfolderFor: (
    target: {
      parentFolder: string;
      parentSubfolder: string;
      parentSubfolderId?: number;
      parentSubfolderPath?: string[];
    } | null
  ) => void;
  setSelectedFolderForPublishers?: (folder: FolderDefinition | null) => void;
  setSelectedSubfolderForPublishers: (
    target: {
      folder: FolderDefinition;
      subfolderName: string;
      subfolderId?: number;
      subfolderPath?: string[];
    } | null
  ) => void;
  handleDeleteFolderClick?: (folder: FolderDefinition) => void;
  handleOpenAddForSubfolder?: (
    folder: string,
    subfolder: string,
    subSubfolder?: string,
    targetFolderId?: number,
    subfolderPath?: string[],
  ) => void;
  canUploadToSubfolder?: (
    folderName: string,
    subfolderPath: string[],
  ) => boolean;
  handleRenameClick: (
    targetOrType: "folder" | "subfolder" | "subsubfolder" | SubfolderTarget,
    name?: string,
    parentFolder?: string,
    parentSubfolder?: string,
    subfolderPath?: string[],
    subfolderId?: number
  ) => void;
  handleEditDescriptionClick?: (
    targetOrType: "folder" | "subfolder" | "subsubfolder" | SubfolderTarget,
    name?: string,
    parentFolder?: string,
    parentSubfolder?: string,
    subfolderPath?: string[],
    subfolderId?: number
  ) => void;
  handleDeleteSubfolderClick: (
    folderOrTarget: string | SubfolderTarget,
    subfolderName?: string,
    subfolderPath?: string[],
    subfolderId?: number
  ) => void;
  handleDeleteSubSubfolderClick: (
    folderName: string,
    subfolderName: string,
    ssfName: string,
    subfolderPath?: string[],
    subfolderId?: number
  ) => void;
  onBrowseControlledFiles?: () => void;
  isControlledFilesView?: boolean;
  filteredDocuments?: DocumentRecord[];
  onOpenFilePreview?: (doc: DocumentRecord) => void;
  query?: string;
  showViewMenu: boolean;
  setShowViewMenu: (show: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showDetailsPane: boolean;
  setShowDetailsPane: (show: boolean) => void;
  previewDocId: string | null;
  setPreviewDocId: (id: string | null) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}) {
  const normalizedQuery = query?.trim().toLowerCase() ?? "";

  const getNestedChildren = (node: any): any[] => {
    if (node?.subfolders?.length) return node.subfolders;
    if (node?.children?.length) return node.children;
    if (node?.sub_folders?.length) return node.sub_folders;
    if (node?.sub_sub_folders?.length) return node.sub_sub_folders;

    return [];
  };

  const countAllNestedSubfolders = (node: any): number => {
    const children = getNestedChildren(node);
    return children.reduce(
      (total: number, child: any) => total + 1 + countAllNestedSubfolders(child),
      0,
    );
  };


  const getSubfolderChildren = (node: any): any[] =>
    node?.subfolders ??
    node?.children ??
    node?.sub_folders ??
    node?.sub_sub_folders ??
    [];

  const folderMatchesGlobalSearch = (
    folder: any,
    searchTerm: string,
  ): boolean => {
    if (!searchTerm) return true;

    const name = String(
      folder?.name ?? folder?.sub_folder_name ?? "",
    ).toLowerCase();

    const description = String(
      folder?.description ??
        folder?.sub_folder_description ??
        "",
    ).toLowerCase();

    const code = String(
      folder?.code ?? folder?.sub_folder_code ?? "",
    ).toLowerCase();

    if (
      name.includes(searchTerm) ||
      description.includes(searchTerm) ||
      code.includes(searchTerm)
    ) {
      return true;
    }

    return getSubfolderChildren(folder).some((child) =>
      folderMatchesGlobalSearch(child, searchTerm),
    );
  };

  const globallyFilteredSubfolders = useMemo(() => {
    if (!normalizedQuery) {
      return displayedSubfolders;
    }

    return displayedSubfolders.filter((folder) =>
      folderMatchesGlobalSearch(folder, normalizedQuery),
    );
  }, [displayedSubfolders, normalizedQuery]);

  const isNestedSubfolderSelected = selectedSubfolderPath.length > 0;

  const levelFilteredDocuments = useMemo(() => {
    if (!filteredDocuments) return [];

    if (!currentFolderDef && normalizedQuery) {
      return filteredDocuments.filter((doc) => {
        const searchableFields = [
          doc.number,
          doc.title,
          doc.subject,
          (doc as any).fileName,
          (doc as any).file_name,
          (doc as any).document_title,
          (doc as any).document_number,
        ];

        return searchableFields.some(
          (field) =>
            field != null &&
            String(field).trim().toLowerCase().includes(normalizedQuery)
        );
      });
    }

    if (!currentFolderDef) return [];

    return filteredDocuments.filter((doc) => {
      if (doc.id === "160") {
        console.log("[DMS] Document 160:", doc);
        console.log("[DMS] Selected folder:", currentFolderDef.name);
        console.log("[DMS] Document folder:", doc.folder);
        console.log("[DMS] Document subfolder:", doc.subfolder);
        console.log("[DMS] Document sub-subfolder:", doc.subSubfolder);
      }

      // The document must belong to the currently selected root folder.
      if (doc.folder !== currentFolderDef.name) {
        return false;
      }

      const docRecord = doc as DocumentRecord & {
        subfolderPath?: string[];
      };

      const docPath = Array.isArray(docRecord.subfolderPath)
        ? docRecord.subfolderPath
        : doc.subfolder
          ? doc.subSubfolder
            ? [doc.subfolder, ...doc.subSubfolder.split(" / ")]
            : [doc.subfolder]
          : [];

      // At the root folder level, show only documents directly
      // attached to that folder, not documents inside subfolders.
      if (!isNestedSubfolderSelected) {
        return docPath.length === 0;
      }

      // Inside a nested subfolder, require an exact path match.
      if (docPath.length !== selectedSubfolderPath.length) {
        return false;
      }

      return docPath.every(
        (segment, index) => segment === selectedSubfolderPath[index],
      );
    });
  }, [
    filteredDocuments,
    currentFolderDef,
    normalizedQuery,
    isNestedSubfolderSelected,
    selectedSubfolderPath,
  ]);


  if (activeMainTab === "archive") {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6">
        {filteredDocuments && filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onOpenFilePreview?.(doc)}
                className="group flex min-h-[160px] cursor-pointer flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[#EAF4FB] text-[#1E6FBF] shrink-0">
                        <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                      </div>
                      <span
                        className="truncate font-mono text-xs font-semibold text-blue-600"
                        title={doc.number}
                      >
                        {doc.number}
                      </span>
                      {doc.isConfidential && (
                        <span
                          title="Confidential document"
                          className="inline-flex shrink-0 items-center justify-center rounded-md border border-amber-200 bg-amber-50 p-1 text-amber-600"
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    {String(doc.status ?? "").toUpperCase() === "ARCHIVED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <Archive className="h-[18px] w-[18px] text-slate-500 shrink-0" />
                        Archived
                      </span>
                    ) : (
                      <StatusBadge
                        status={formatDocumentStatus(doc.status)}
                      />
                    )}
                  </div>

                  <div className="mt-3">
                    <h3
                      className="line-clamp-2 text-xs font-medium leading-snug text-gray-900"
                      title={
                        doc.title ||
                        (doc as any).document_title ||
                        doc.fileName ||
                        (doc as any).file_name ||
                        "Untitled Document"
                      }
                    >
                      {doc.title ||
                        (doc as any).document_title ||
                        doc.fileName ||
                        (doc as any).file_name ||
                        "Untitled Document"}
                    </h3>

                    {doc.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs text-gray-500">
                  <span className="truncate max-w-[140px]">
                    {doc.department || doc.category || "Document"}
                  </span>

                  <span className="font-semibold text-[#1E6FBF] flex items-center gap-0.5 text-xs transition-transform group-hover:translate-x-0.5">
                    Preview <ChevronRight className="size-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center">
            <FolderOpen className="mx-auto mb-2 size-10 text-gray-400" />

            <p className="text-sm font-medium text-gray-700">
              No archived documents found
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!currentFolderDef) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              File Folders
            </h2>
            <p className="text-xs text-gray-500">
              Browse records across PMHBL pipeline asset classifications
            </p>
          </div>
          {role === "Admin" && (
            <button
              type="button"
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1E6FBF] text-white hover:bg-[#165b9e] transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-5 w-5" /> <span>Add New Folder</span>
            </button>
          )}
          {role === "User" && !isControlledFilesView && (
            <Button
              size="sm"
              onClick={onBrowseControlledFiles}
              className="gap-1.5 text-xs shrink-0 cursor-pointer shadow-xs self-start sm:self-center"
            >
              <Inbox className="h-5 w-5" />
              <span>Browse Controlled Files</span>
            </Button>
          )}
          {isControlledFilesView && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectFolder(null)}
              className="gap-2 text-xs shrink-0 cursor-pointer shadow-xs self-start sm:self-center"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Documents
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {folders
            .filter((folder) => {
              if (!normalizedQuery) return true;

              const folderName = String(folder.name ?? "").trim().toLowerCase();
              const folderDescription = String(folder.description ?? "")
                .trim()
                .toLowerCase();

              return (
                folderName.includes(normalizedQuery) ||
                folderDescription.includes(normalizedQuery)
              );
            })
            .map((folder) => {
            const Icon = folder.icon || Folder;
            const count = folderCounts[folder.name] || 0;
            const subCount = countAllNestedSubfolders(folder);
            return (
              <div
                key={folder.id}
                onClick={() => onSelectFolder(folder.name)}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs hover:shadow-md hover:border-[#1E6FBF] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start gap-2.5">
                  <div className="text-[#1E6FBF] shrink-0 mt-0.5 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#1E6FBF]">
                        {folder.number ? `${String(folder.number).padStart(2, "0")}.` : ""}
                      </span>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#1E6FBF] transition-colors truncate">
                        <HighlightText text={String(folder.name ?? "")} query={query} />
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                      {folder.description}
                    </p>
                  </div>
                  {role === "Admin" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#F1F5F9] text-[#60788A] hover:text-[#172B3A] cursor-pointer transition-opacity"
                          title="Folder options"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44 text-xs bg-card border-border shadow-xl"
                      >
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameClick("folder", folder.name);
                          }}
                          className="cursor-pointer gap-2 py-1.5"
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                          <span>Rename Folder</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDescriptionClick &&
                              handleEditDescriptionClick("folder", folder.name);
                          }}
                          className="cursor-pointer gap-2 py-1.5"
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                          <span>Edit Description</span>
                        </DropdownMenuItem>
                        {handleDeleteFolderClick && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolderClick(folder);
                            }}
                            className="cursor-pointer gap-2 py-1.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Folder</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">{count} {count === 1 ? "file" : "files"}</span>
                    <span>·</span>
                    <span>{subCount} {subCount === 1 ? "subfolder" : "subfolders"}</span>
                  </div>
                  <ChevronRight className="size-4 text-gray-400 group-hover:text-[#1E6FBF] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Search Results */}
        {normalizedQuery && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-800">
              Matching Documents ({levelFilteredDocuments.length})
            </h3>

            {levelFilteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {levelFilteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onOpenFilePreview?.(doc)}
                    className="group flex min-h-[150px] cursor-pointer flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 shrink-0 text-blue-600" />

                        <span className="truncate font-mono text-xs font-semibold text-blue-600">
                          <HighlightText
                            text={String(doc.number || (doc as any).document_number || "")}
                            query={query}
                          />
                        </span>

                        {doc.isConfidential && (
                          <Lock className="h-4 w-4 shrink-0 text-amber-600" />
                        )}
                      </div>

                      <h4 className="mt-3 line-clamp-2 text-sm font-semibold text-gray-900">
                        <HighlightText
                          text={String(
                            doc.title ||
                              (doc as any).document_title ||
                              doc.fileName ||
                              (doc as any).file_name ||
                              "Untitled Document"
                          )}
                          query={query}
                        />
                      </h4>

                      {doc.folder && (
                        <p className="mt-2 break-words text-xs text-gray-500">
                          Path:{" "}
                          {[
                            doc.folder,
                            ...(
                              Array.isArray((doc as any).subfolderPath)
                                ? (doc as any).subfolderPath
                                : [
                                    doc.subfolder,
                                    ...(doc.subSubfolder
                                      ? doc.subSubfolder.split(" / ")
                                      : []),
                                  ]
                            ).filter(Boolean),
                          ].join(" / ")}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-end border-t border-gray-100 pt-2 text-xs font-semibold text-[#1E6FBF]">
                      Open Document
                      <ChevronRight className="ml-1 size-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                No matching documents found.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  const activeSubfolderDef = isNestedSubfolderSelected
    ? currentNestedSubfolderDef
    : null;





  const activeSubfolderChildren = activeSubfolderDef
    ? getNestedChildren(activeSubfolderDef)
    : [];

  const getActiveSubfolderId = (): number | undefined => {
    if (!activeSubfolderDef) return undefined;

    const rawId =
      activeSubfolderDef.id ?? activeSubfolderDef.sub_folder_id;

    if (rawId == null || rawId === "") return undefined;

    const id = Number(rawId);

    return Number.isInteger(id) && id > 0 ? id : undefined;
  };

  const getActiveSubfolderTarget = (): SubfolderTarget | null => {
    if (!currentFolderDef || !activeSubfolderDef) {
      return null;
    }

    const subfolderId = getActiveSubfolderId();

    return {
      type: selectedSubfolderPath.length > 1
        ? "subsubfolder"
        : "subfolder",
      parentFolder: currentFolderDef.name,
      parentSubfolder:
        selectedSubfolderPath.length > 1
          ? selectedSubfolderPath[selectedSubfolderPath.length - 2]
          : undefined,
      subfolderPath: [...selectedSubfolderPath],
      subfolderId,
      currentName: activeSubfolderDef.name,
    };
  };

  const selectedSubfolderDepth = selectedSubfolderPath.length;

  const selectedSubfolderParentName =
    selectedSubfolderDepth > 1
      ? selectedSubfolderPath[selectedSubfolderDepth - 2]
      : undefined;

  // Resolve subfolder breadcrumb path definitions from selectedSubfolderPath
  const breadcrumbChain = (() => {
    if (!currentFolderDef || selectedSubfolderPath.length === 0) {
      return [];
    }

    const chain: {
      name: string;
      letter?: string;
      path: string[];
    }[] = [];

    let currentLevelSubfolders: any[] =
      currentFolderDef.subfolders ??
      (currentFolderDef as any).children ??
      (currentFolderDef as any).sub_folders ??
      [];

    for (let i = 0; i < selectedSubfolderPath.length; i++) {
      const name = selectedSubfolderPath[i];

      const match = currentLevelSubfolders.find(
        (sf: any) =>
          (sf.name ?? sf.sub_folder_name) === name
      );

      if (!match) {
        break;
      }

      chain.push({
        name: match.name ?? match.sub_folder_name,
        letter: match.letter,
        path: selectedSubfolderPath.slice(0, i + 1),
      });

      currentLevelSubfolders =
        match.subfolders ??
        match.children ??
        match.sub_folders ??
        match.sub_sub_folders ??
        [];
    }

    return chain;
  })();

  // Back button handler: return to parent nested folder or back to root folder
  const handleBackNavigation = () => {
    if (!currentFolderDef) return;
    if (selectedSubfolderPath.length > 1) {
      onSelectNestedSubfolder?.(
        currentFolderDef.name,
        selectedSubfolderPath.slice(0, -1),
      );
    } else {
      onSelectFolder(currentFolderDef.name);
    }
  };

  const parentFolderLabel =
    selectedSubfolderPath.length > 1
      ? selectedSubfolderPath[selectedSubfolderPath.length - 2]
      : currentFolderDef?.name;


  return (
    <div className="flex-1 overflow-y-auto flex min-h-0 flex-col bg-[#F8FAFC] px-4 py-4 sm:px-6 sm:py-5 gap-5 animate-in fade-in duration-150">
      {/* Top Breadcrumb Bar */}
      <div className="flex w-full min-w-0 items-center justify-between gap-3 border-b border-[#D9E2EC] pb-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-[12px]">
          {isControlledFilesView && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectFolder(null)}
              className="gap-2 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Documents
            </Button>
          )}

          {isNestedSubfolderSelected && activeSubfolderDef ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBackNavigation}
                className="gap-1.5 h-7.5 px-2.5 text-[11px] font-medium text-[#29465B] border-[#C9D7E3] hover:border-[#9CC8E8] hover:bg-[#F2F8FC] hover:text-[#1E6FBF] cursor-pointer shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to {parentFolderLabel}</span>
              </Button>

              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 [scrollbar-width:thin]">
                <button
                  type="button"
                  onClick={() => onSelectFolder(null)}
                  className="flex shrink-0 items-center gap-1.5 font-medium text-[#35546F] transition-colors hover:text-[#1E6FBF] cursor-pointer"
                >
                  <Folder className="h-5 w-5" />
                  <span>All Folders</span>
                </button>

                <ChevronRight className="size-3.5 shrink-0 text-[#8A9BAB]" />

                <button
                  type="button"
                  onClick={() => onSelectFolder(currentFolderDef.name)}
                  className="shrink-0 font-medium text-[#35546F] transition-colors hover:text-[#1E6FBF] cursor-pointer"
                >
                  {currentFolderDef.number ? `${currentFolderDef.number}. ` : ""}{currentFolderDef.name}
                </button>

                {breadcrumbChain.map((crumb, idx) => {
                  const isLast = idx === breadcrumbChain.length - 1;
                  return (
                    <React.Fragment key={crumb.path.join(":::")}>
                      <ChevronRight className="size-3.5 shrink-0 text-[#8A9BAB]" />
                      {isLast ? (
                        <span className="shrink-0 font-semibold text-[#172B3A]">
                          {crumb.letter ? `${crumb.letter}. ` : ""}{crumb.name}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            onSelectNestedSubfolder?.(currentFolderDef.name, crumb.path)
                          }
                          className="shrink-0 font-medium text-[#35546F] transition-colors hover:text-[#1E6FBF] cursor-pointer"
                        >
                          {crumb.letter ? `${crumb.letter}. ` : ""}{crumb.name}
                        </button>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 [scrollbar-width:thin]">
              <button
                type="button"
                onClick={() => onSelectFolder(null)}
                className="flex shrink-0 items-center gap-1.5 font-medium text-[#35546F] transition-colors hover:text-[#1E6FBF] cursor-pointer"
              >
                <Folder className="h-5 w-5" />
                <span>All Folders</span>
              </button>

              <ChevronRight className="size-3.5 shrink-0 text-[#8A9BAB]" />

              <span className="shrink-0 font-semibold text-[#172B3A]">
                {currentFolderDef.number}. {currentFolderDef.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isNestedSubfolderSelected && activeSubfolderDef ? (
            <>
              {activeSubfolderChildren.length > 0 && (
                <span className="rounded-full border border-[#B9D8EF] bg-[#EAF5FD] px-2.5 py-1 text-[11px] font-semibold text-[#1E6FBF]">
                  {activeSubfolderChildren.length} Subfolders
                </span>
              )}
              <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700">
                {levelFilteredDocuments.length} Files
              </span>
            </>
          ) : (
            <>
              <span className="rounded-full border border-[#B9D8EF] bg-[#EAF5FD] px-2.5 py-1 text-[11px] font-semibold text-[#1E6FBF]">
                {currentFolderDef.subfolders?.length || 0} Subfolders
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewAllInFolder(true)}
                className="h-8 gap-1.5 rounded-md border-[#C9D7E3] bg-white px-3 text-[11px] font-semibold text-[#29465B] shadow-none hover:border-[#9CC8E8] hover:bg-[#F2F8FC] hover:text-[#1E6FBF] cursor-pointer"
              >
                <LayoutList className="h-5 w-5" />
                <span>View all files ({folderCounts[currentFolderDef.name] || 0})</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="relative w-full min-w-0 rounded-xl border border-[#CBD9E5] bg-gradient-to-br from-white via-white to-[#EAF4FB] px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:px-5">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#DFF0FB] text-[#1E6FBF] shadow-xs">
              {(() => {
                if (isNestedSubfolderSelected && activeSubfolderDef) {
                  return <Folder className="h-5 w-5" />;
                }
                const FolderIcon = currentFolderDef.icon;
                return <FolderIcon className="h-5 w-5" />;
              })()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="block break-words font-mono text-[11px] font-semibold leading-5 text-[#1E6FBF]">
                  {isNestedSubfolderSelected && activeSubfolderDef
                    ? `${currentFolderDef.name} / ${selectedSubfolderPath.join(" / ")}`
                    : `Folder ${String(currentFolderDef.number).padStart(2, "0")}`}
                </span>

                <span className="size-1 rounded-full bg-[#9AAAB8]" />

                <span className="text-[11px] text-[#52697A]">
                  {isNestedSubfolderSelected && activeSubfolderDef
                    ? `${levelFilteredDocuments.length} Files`
                    : `${folderCounts[currentFolderDef.name] || 0} Controlled Documents`}
                </span>
              </div>

              <h2 className="mt-1 block text-[18px] font-bold leading-6 text-[#122A3A] sm:text-[19px]">
                {isNestedSubfolderSelected && activeSubfolderDef
                  ? activeSubfolderDef.name
                  : currentFolderDef.name}
              </h2>

              <p className="mt-1 block max-w-2xl text-[11px] leading-4 text-[#52697A]">
                {isNestedSubfolderSelected && activeSubfolderDef
                  ? activeSubfolderDef.description
                  : currentFolderDef.description}
              </p>
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 border-t border-[#D9E2EC] pt-3">
            {isNestedSubfolderSelected && activeSubfolderDef ? (
              <>
                {role === "Publisher" &&
                  canUploadToSubfolder?.(
                    currentFolderDef.name,
                    selectedSubfolderPath,
                  ) && (
                  <Button
                    size="sm"
                    onClick={() =>
                      handleOpenAddForSubfolder &&
                      handleOpenAddForSubfolder(
                        currentFolderDef.name,
                        activeSubfolderDef.name,
                        selectedSubfolderPath.length > 1
                          ? selectedSubfolderPath[selectedSubfolderPath.length - 1]
                          : undefined,
                        getActiveSubfolderId(),
                        selectedSubfolderPath,
                      )
                    }
                    className="h-9 shrink-0 gap-1.5 rounded-md bg-[#1E6FBF] px-3 text-xs font-semibold text-white shadow-none hover:bg-[#185D9E] cursor-pointer"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Document</span>
                  </Button>
                )}
                {role === "Admin" && (
                  <>
                    {/* Manage Publishers */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!activeSubfolderDef) return;

                        setSelectedSubfolderForPublishers({
                          folder: currentFolderDef,
                          subfolderName: activeSubfolderDef.name,
                          subfolderId: getActiveSubfolderId(),
                          subfolderPath: [...selectedSubfolderPath],
                        });
                      }}
                      className="h-9 shrink-0 gap-1.5 rounded-md border-[#B9D8EF] bg-white px-3 text-xs font-semibold text-[#1E6FBF] shadow-none hover:border-[#9CC8E8] hover:bg-[#EFF8FE] cursor-pointer"
                      title="Manage publishers for this folder"
                    >
                      <UsersRound className="h-5 w-5" />
                      <span>Subfolder Publishers</span>
                    </Button>

                    {/* Create Nested Folder */}
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!activeSubfolderDef) return;

                        setCreateSubSubfolderFor({
                          parentFolder: currentFolderDef.name,
                          parentSubfolder: activeSubfolderDef.name,
                          parentSubfolderId: getActiveSubfolderId(),
                          parentSubfolderPath: [...selectedSubfolderPath],
                        });
                      }}
                      className="h-9 shrink-0 gap-1.5 rounded-md bg-[#1E6FBF] px-3 text-xs font-semibold text-white shadow-none hover:bg-[#185D9E] cursor-pointer"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Subfolder</span>
                    </Button>

                    {/* Rename */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const target = getActiveSubfolderTarget();

                        if (!target) return;

                        handleRenameClick(target);
                      }}
                      className="h-9 shrink-0 gap-1.5 rounded-md border-[#C9D7E3] bg-white px-3 text-xs font-semibold text-[#29465B] shadow-none hover:border-[#9CC8E8] hover:bg-[#F2F8FC] cursor-pointer"
                    >
                      <Pencil className="h-5 w-5" />
                      <span>Rename Sub-folder</span>
                    </Button>

                    {/* Edit Description */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const target = getActiveSubfolderTarget();

                        if (!target) return;

                        handleEditDescriptionClick?.(target);
                      }}
                      className="h-9 shrink-0 gap-1.5 rounded-md border-[#C9D7E3] bg-white px-3 text-xs font-semibold text-[#29465B] shadow-none hover:border-[#9CC8E8] hover:bg-[#F2F8FC] cursor-pointer"
                    >
                      <Pencil className="h-5 w-5" />
                      <span>Edit Description</span>
                    </Button>

                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const target = getActiveSubfolderTarget();

                        if (!target) return;

                        handleDeleteSubfolderClick(target);
                      }}
                      className="h-9 shrink-0 gap-1.5 rounded-md border-[#E6B8B8] bg-white px-3 text-xs font-semibold text-[#C0392B] shadow-none hover:border-[#E6B8B8] hover:bg-[#FFF5F5] cursor-pointer"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span>Delete Sub-folder</span>
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                {role === "Publisher" &&
                  canUploadToSubfolder?.(
                    currentFolderDef.name,
                    [],
                  ) && (
                  <Button
                    size="sm"
                    onClick={() =>
                      handleOpenAddForSubfolder &&
                      handleOpenAddForSubfolder(
                        currentFolderDef.name,
                        "",
                        undefined,
                        Number(currentFolderDef.folder_id ?? currentFolderDef.id) || undefined,
                        [],
                      )
                    }
                    className="h-9 shrink-0 gap-1.5 rounded-md bg-[#1E6FBF] px-3 text-xs font-semibold text-white shadow-none hover:bg-[#185D9E] cursor-pointer"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Document</span>
                  </Button>
                )}
                {role === "Admin" && (
                  <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setSelectedFolderForPublishers &&
                      setSelectedFolderForPublishers(currentFolderDef)
                    }
                    className="h-9 shrink-0 gap-1.5 rounded-md border-[#B9D8EF] bg-white px-3 text-xs font-semibold text-[#1E6FBF] shadow-none hover:border-[#9CC8E8] hover:bg-[#EFF8FE] cursor-pointer"
                    title="Manage publishers delegated to this folder"
                  >
                    <UsersRound className="h-5 w-5" />
                    <span>Folder Publishers</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => setCreateSubfolderForFolder(currentFolderDef.name)}
                    className="h-9 shrink-0 gap-1.5 rounded-md bg-[#1E6FBF] px-3 text-xs font-semibold text-white shadow-none hover:bg-[#185D9E] cursor-pointer"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Sub-folder</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleRenameClick("folder", currentFolderDef.name)
                    }
                    className="h-9 shrink-0 gap-1.5 rounded-md border-[#C9D7E3] bg-white px-3 text-xs font-semibold text-[#29465B] shadow-none hover:border-[#9CC8E8] hover:bg-[#F2F8FC] cursor-pointer"
                  >
                    <Pencil className="h-5 w-5" />
                    <span>Rename Folder</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleEditDescriptionClick &&
                      handleEditDescriptionClick("folder", currentFolderDef.name)
                    }
                    className="h-9 shrink-0 gap-1.5 rounded-md border-[#C9D7E3] bg-white px-3 text-xs font-semibold text-[#29465B] shadow-none hover:border-[#9CC8E8] hover:bg-[#F2F8FC] cursor-pointer"
                  >
                    <Pencil className="h-5 w-5" />
                    <span>Edit Description</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleDeleteFolderClick &&
                      handleDeleteFolderClick(currentFolderDef)
                    }
                    className="h-9 shrink-0 gap-1.5 rounded-md border-[#E6B8B8] bg-white px-3 text-xs font-semibold text-[#C0392B] shadow-none hover:border-[#E6B8B8] hover:bg-[#FFF5F5] cursor-pointer"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Delete Folder</span>
                  </Button>
                </>
              )}
            </>
          )}
          </div>
        </div>
      </div>

      {/* Nested Subfolder Contents or Root Subfolders Section */}
      {isNestedSubfolderSelected && activeSubfolderDef ? (
        <div className="space-y-6">
          {/* Child subfolders if any (nested deeper) */}
          {activeSubfolderChildren.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Sub-folders ({activeSubfolderChildren.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {activeSubfolderChildren
                  .filter((child: any) =>
                    folderMatchesGlobalSearch(child, normalizedQuery),
                  )
                  .map((child: any) => {
                  const childName =
                    child.name ?? child.sub_folder_name ?? "";

                  const childId =
                    child.id ?? child.sub_folder_id;

                  const nextPath = [...selectedSubfolderPath, childName];

                  return (
                    <div
                      key={childId ?? childName}
                      onClick={() =>
                        onSelectNestedSubfolder?.(currentFolderDef.name, nextPath)
                      }
                      className="group relative flex min-h-[150px] min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-[#D5E0E8] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9CC8E8] hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Folder className="h-5 w-5 text-[#1E6FBF]" />
                            <span className="font-mono text-xs font-bold text-[#1E6FBF]">
                              {child.letter ? `${child.letter}.` : ""}
                            </span>
                          </div>
                        </div>

                        <h3
                          title={childName}
                          className="mt-3 break-words text-[13px] font-semibold leading-5 text-[#1D3445] transition-colors group-hover:text-[#1E6FBF] line-clamp-2"
                        >
                          <HighlightText text={String(childName)} query={query} />
                        </h3>
                        {child.description && (
                          <p className="mt-1 text-[11px] leading-5 text-[#60788A] line-clamp-2">
                            {child.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-[#E5EBF0] pt-2.5 text-[10.5px] font-medium text-[#60788A] transition-colors group-hover:text-[#1E6FBF]">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const childNestedSubCount = countAllNestedSubfolders(child);
                            const childPath = [...selectedSubfolderPath, childName];
                            const childKey = `${currentFolderDef.name}:::${childPath.join(":::")}` ;
                            const childFileCount = subfolderCounts[childKey] || 0;
                            return (
                              <>
                                <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#52697A]">
                                  {childFileCount} {childFileCount === 1 ? "file" : "files"}
                                </span>
                                {childNestedSubCount > 0 && (
                                  <span className="inline-flex items-center gap-1 rounded bg-[#EAF4FB] border border-[#B9D8EF] px-1.5 py-0.5 text-[10px] font-medium text-[#1E6FBF]">
                                    <Folder className="size-2.5" />
                                    {childNestedSubCount} {childNestedSubCount === 1 ? "subfolder" : "subfolders"}
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents Section in Nested Subfolder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Documents ({levelFilteredDocuments?.length || 0})
              </h3>
            </div>

            {levelFilteredDocuments && levelFilteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {levelFilteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onOpenFilePreview && onOpenFilePreview(doc)}
                    className="group relative flex min-h-[170px] cursor-pointer flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex size-7 items-center justify-center rounded-lg bg-[#EAF4FB] text-[#1E6FBF] shrink-0">
                            <FileText className="size-4" />
                          </div>
                          <span
                            className="truncate font-mono text-xs font-semibold text-blue-600"
                            title={doc.number}
                          >
                            <HighlightText
                              text={String(doc.number ?? "")}
                              query={query}
                            />
                          </span>
                          {doc.isConfidential && (
                            <span
                              title="Confidential document"
                              className="inline-flex shrink-0 items-center justify-center rounded-md border border-amber-200 bg-amber-50 p-1 text-amber-600"
                            >
                              <Lock className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        {String(doc.status ?? "").toUpperCase() === "ARCHIVED" && (
                          <StatusBadge status={formatDocumentStatus(doc.status)} />
                        )}
                      </div>

                      <h3
                        className="mt-3 line-clamp-2 text-sm font-semibold leading-5 text-gray-900"
                        title={doc.title}
                      >
                        {doc.title}
                      </h3>
                      {doc.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                          {doc.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                      <span className="truncate max-w-[140px]">
                        {doc.department || doc.category || "Document"}
                      </span>
                      <span className="font-semibold text-[#1E6FBF] flex items-center gap-0.5 transition-transform group-hover:translate-x-0.5">
                        Preview
                        <ChevronRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              activeSubfolderChildren.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD9E5] bg-white py-12 text-center">
                  <Folder className="size-10 text-[#8A9BAB] mb-2" />
                  <p className="text-sm font-medium text-[#172B3A]">
                    No documents found in {activeSubfolderDef.name}
                  </p>
                  <p className="text-xs text-[#52697A] mt-1">
                    Add a new document to this subfolder to get started
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBackNavigation}
                    className="mt-3 text-xs border-[#C9D7E3] text-[#29465B] hover:bg-[#F2F8FC] hover:text-[#1E6FBF] cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Back to {parentFolderLabel}
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Subfolders Filter Bar */}
          <div className="flex h-[32px] w-full items-center justify-between">
            <div className="relative w-[505px]">
              <Search className="absolute left-3 top-1/2 z-10 size-[22px] -translate-y-1/2 text-[#60788A]" />

              <input
                value={subfolderSearch}
                onChange={(e) => setSubfolderSearch(e.target.value)}
                placeholder={`Search subfolders in ${currentFolderDef.name} (e.g. OISD, PNGRB, PESO, ISO…)`}
                className="h-[32px] w-full rounded-md border border-[#C9D7E3] bg-white pl-10 pr-8 text-[12px] text-[#243B4A] outline-none placeholder:text-[#718596] transition-all focus:border-[#6AAED8] focus:ring-1 focus:ring-[#DCEFFB]"
              />

              {subfolderSearch && (
                <button
                  type="button"
                  onClick={() => setSubfolderSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#60788A] hover:text-[#243B4A] cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 whitespace-nowrap text-[12px] text-[#60788A]">
              <span>Showing</span>

              <strong className="font-semibold text-[#263F50]">
                {globallyFilteredSubfolders.length}
              </strong>

              <span>
                of {currentFolderDef.subfolders?.length || 0} subfolders
              </span>
            </div>
          </div>

          {/* Responsive Subfolders Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {globallyFilteredSubfolders.map((sf) => {
              const sfName = sf.name ?? sf.sub_folder_name ?? "";

              const sfChildren =
                sf.subfolders ??
                sf.children ??
                sf.sub_folders ??
                sf.sub_sub_folders ??
                [];

              const subKey = `${currentFolderDef.name}:::${sfName}`;
              const count = subfolderCounts[subKey] || 0;
              const nestedSubCount = countAllNestedSubfolders(sf);
              const isSubDragOver = dragOverSubfolder === subKey;

              const rootSubfolderTarget: SubfolderTarget = {
                type: "subfolder",
                parentFolder: currentFolderDef.name,
                subfolderPath: [sfName],
                subfolderId: Number(sf.id ?? sf.sub_folder_id) || undefined,
                currentName: sfName,
              };

              return (
                <div
                  key={sf.name}
                  draggable={role === "Admin"}
                  onDragStart={(e) =>
                    handleSubfolderDragStart(
                      e,
                      currentFolderDef.name,
                      sf.name,
                      currentFolderDef.id,
                      sf.sub_folder_id || sf.id,
                    )
                  }
                  onDragOver={(e) => handleSubfolderDragOver(e, currentFolderDef.name, sf.name)}
                  onDragLeave={() => handleSubfolderDragLeave(currentFolderDef.name, sf.name)}
                  onDrop={(e) => handleSubfolderDrop(e, currentFolderDef.name, sf.name)}
                  onClick={() => onSelectSubfolder(currentFolderDef.name, sf.name)}
                  className={`group relative flex min-h-[170px] flex-col justify-between rounded-lg border bg-white p-4 transition-all duration-200 cursor-pointer ${isSubDragOver
                    ? "border-[#1E6FBF] bg-[#EFF8FE] ring-2 ring-[#9CC8E8] shadow-md"
                    : "border-[#D5E0E8] hover:-translate-y-0.5 hover:border-[#9CC8E8] hover:shadow-md"
                    }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {role === "Admin" && (
                          <span
                            title="Drag and drop to another folder in the sidebar"
                            onClick={(e) => e.stopPropagation()}
                            className="cursor-grab active:cursor-grabbing inline-flex items-center"
                          >
                            <GripVertical className="size-3.5 opacity-40 group-hover:opacity-100 hover:text-primary" />
                          </span>
                        )}
                        <span className="font-mono text-xs font-bold text-[#1E6FBF]">
                          {sf.letter}.
                        </span>
                        <Folder className="h-5 w-5 text-[#1E6FBF]" />
                      </div>
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10.5px] font-mono font-semibold text-[#52697A]">
                          {count} {count === 1 ? "file" : "files"}
                        </span>
                        {role === "Publisher" &&
                          canUploadToSubfolder?.(
                            currentFolderDef.name,
                            [sfName],
                          ) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddForSubfolder &&
                                handleOpenAddForSubfolder(
                                  currentFolderDef.name,
                                  sf.name,
                                  undefined,
                                  Number(sf.sub_folder_id ?? sf.id) || undefined,
                                  [sfName],
                                );
                            }}
                            className="h-6 gap-1 px-2 text-[10.5px] font-semibold text-[#1E6FBF] border-[#B9D8EF] hover:bg-[#1E6FBF] hover:text-white cursor-pointer transition-colors shadow-2xs"
                            title={`Add new document to ${sf.name} with prefilled info from last document`}
                          >
                            <Plus className="h-5 w-5" />
                            <span>Add</span>
                          </Button>
                        )}
                        {role === "Admin" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#F1F5F9] text-[#60788A] hover:text-[#172B3A] cursor-pointer transition-opacity"
                                title="Sub-folder options (Left-click)"
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 text-xs bg-card border-border shadow-xl"
                            >
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCreateSubSubfolderFor({
                                    parentFolder: currentFolderDef.name,
                                    parentSubfolder: sf.name,
                                    parentSubfolderId: Number(sf.id ?? sf.sub_folder_id) || undefined,
                                    parentSubfolderPath: [sf.name],
                                  });
                                }}
                                className="cursor-pointer gap-2 py-1.5 font-medium text-primary"
                              >
                                <Plus className="h-5 w-5 text-primary" />
                                <span>Add Sub-sub folder</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSubfolderForPublishers({
                                    folder: currentFolderDef,
                                    subfolderName: sf.name,
                                    subfolderId: rootSubfolderTarget.subfolderId,
                                    subfolderPath: rootSubfolderTarget.subfolderPath,
                                  });
                                }}
                                className="cursor-pointer gap-2 py-1.5"
                              >
                                <UsersRound className="h-5 w-5 text-muted-foreground" />
                                <span>Manage Publishers</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRenameClick(rootSubfolderTarget);
                                }}
                                className="cursor-pointer gap-2 py-1.5"
                              >
                                <Pencil className="h-5 w-5 text-muted-foreground" />
                                <span>Rename Sub-folder</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDescriptionClick?.(rootSubfolderTarget);
                                }}
                                className="cursor-pointer gap-2 py-1.5"
                              >
                                <Pencil className="h-5 w-5 text-muted-foreground" />
                                <span>Edit Description</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSubfolderClick(rootSubfolderTarget);
                                }}
                                className="cursor-pointer gap-2 py-1.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="h-5 w-5" />
                                <span>Delete Sub-folder</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    <h3 className="mt-3 text-[13px] font-semibold text-[#1D3445] group-hover:text-[#1E6FBF] transition-colors line-clamp-1">
                      <HighlightText
                        text={String(sf.name ?? sf.sub_folder_name ?? "")}
                        query={query}
                      />
                    </h3>
                    <p className="mt-1 text-[11px] leading-5 text-[#60788A] line-clamp-2">
                      {sf.description}
                    </p>
                    {nestedSubCount > 0 && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded bg-[#EAF4FB] border border-[#B9D8EF] px-1.5 py-0.5 text-[10px] font-medium text-[#1E6FBF]">
                          <Folder className="size-2.5" />
                          <span>
                            {nestedSubCount} {nestedSubCount === 1 ? "subfolder" : "subfolders"}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#E5EBF0] pt-2.5 text-[10.5px] font-medium text-[#60788A] transition-colors group-hover:text-[#1E6FBF]">
                    <span className="transition-transform group-hover:translate-x-0.5">
                      Browse files
                    </span>
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}

            {/* Document cards */}
            {levelFilteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onOpenFilePreview && onOpenFilePreview(doc)}
                className="group relative flex min-h-[170px] cursor-pointer flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[#EAF4FB] text-[#1E6FBF] shrink-0">
                        <FileText className="size-4" />
                      </div>
                      <span
                        className="truncate font-mono text-xs font-semibold text-blue-600"
                        title={doc.number}
                      >
                        <HighlightText
                          text={String(doc.number ?? "")}
                          query={query}
                        />
                      </span>
                      {doc.isConfidential && (
                        <span
                          title="Confidential document"
                          className="inline-flex shrink-0 items-center justify-center rounded-md border border-amber-200 bg-amber-50 p-1 text-amber-600"
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                    {String(doc.status ?? "").toUpperCase() === "ARCHIVED" && (
                      <StatusBadge status={formatDocumentStatus(doc.status)} />
                    )}
                  </div>

                  <h3
                    className="mt-3 line-clamp-2 text-sm font-semibold leading-5 text-gray-900"
                    title={doc.title || doc.fileName || "Untitled Document"}
                  >
                    {doc.title || doc.fileName || "Untitled Document"}
                  </h3>
                  {doc.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                  <span className="truncate max-w-[140px]">
                    {doc.department || doc.category || "Document"}
                  </span>
                  <span className="font-semibold text-[#1E6FBF] flex items-center gap-0.5 transition-transform group-hover:translate-x-0.5">
                    Preview
                    <ChevronRight className="size-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {globallyFilteredSubfolders.length === 0 && (!levelFilteredDocuments || levelFilteredDocuments.length === 0) && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#CBD9E5] bg-white py-12 text-center">
              <Folder className="size-10 text-[#8A9BAB] mb-2" />
              <p className="text-sm font-medium text-[#172B3A]">
                No matching subfolders or documents found
              </p>
              <p className="text-xs text-[#52697A] mt-1">
                Try a different search term or clear the filter
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSubfolderSearch("")}
                className="mt-3 text-xs border-[#C9D7E3] text-[#29465B] hover:bg-[#F2F8FC] hover:text-[#1E6FBF] cursor-pointer"
              >
                Clear filter
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
