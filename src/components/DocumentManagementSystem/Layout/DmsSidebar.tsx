import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRightLeft,
  ChevronDown,
  Folder,
  GripVertical,
  MoreHorizontal,
  PanelLeftClose,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/DocumentManagementSystem/ui/dropdown-menu";
import type { FolderDefinition, Role, SubfolderInfo } from "../types";
import type { SubfolderTarget } from "../hooks/useDmsFolderActions";
import { DmsFolderTreeItem } from "./DmsFolderTreeItem";

export function DmsSidebar({
  isSidebarCollapsed,
  onToggleCollapse,
  role,
  folders,
  selectedFolder,
  selectedSubfolder,
  selectedSubSubfolder,
  selectedSubfolderPath = [],
  expandedFolders,
  expandedSubfolders,
  expandedPaths = {},
  folderCounts,
  subfolderCounts,
  subSubfolderCounts,
  dragOverFolder,
  dragOverSubfolder,
  dragOverSubSubfolder,
  filterLocation,
  activeMainTab,
  deletedDocsCount,
  onSelectFolder,
  onSelectSubfolder,
  onSelectSubSubfolder,
  onSelectNestedSubfolder,
  toggleFolderExpand,
  toggleSubfolderExpand,
  onToggleNestedPath,
  setShowCreateFolderModal,
  setCreateSubfolderForFolder,
  setCreateSubSubfolderFor,
  handleRenameClick,
  handleEditDescriptionClick,
  handleDeleteFolderClick,
  handleDeleteSubfolderClick,
  handleDeleteSubSubfolderClick,
  setMoveFolderTarget,
  setMoveSubfolderTarget,
  setMoveSubSubTarget,
  handleFolderDragOver,
  handleFolderDragLeave,
  handleFolderDrop,
  handleSubfolderDragStart,
  handleSubfolderDragOver,
  handleSubfolderDragLeave,
  handleSubfolderDrop,
  handleSubSubfolderDragStart,
  handleSubSubfolderDragOver,
  handleSubSubfolderDragLeave,
  handleSubSubfolderDrop,
  onLocationSelect,
  onTrashClick,
}: {
  isSidebarCollapsed: boolean;
  onToggleCollapse?: () => void;
  role: Role;
  folders: FolderDefinition[];
  selectedFolder: string | null;
  selectedSubfolder: string | null;
  selectedSubSubfolder: string | null;
  selectedSubfolderPath?: string[];
  expandedFolders: Record<string, boolean>;
  expandedSubfolders: Record<string, boolean>;
  expandedPaths?: Record<string, boolean>;
  folderCounts: Record<string, number>;
  subfolderCounts: Record<string, number>;
  subSubfolderCounts: Record<string, number>;
  dragOverFolder: string | null;
  dragOverSubfolder: string | null;
  dragOverSubSubfolder: string | null;
  filterLocation: string;
  activeMainTab: string;
  deletedDocsCount: number;
  onSelectFolder: (name: string | null) => void;
  onSelectSubfolder: (f: string, sf: string) => void;
  onSelectSubSubfolder: (f: string, sf: string, ssf: string) => void;
  onSelectNestedSubfolder?: (
    folderName: string,
    subfolderPath: string[],
  ) => void;
  toggleFolderExpand: (name: string, e: React.MouseEvent) => void;
  toggleSubfolderExpand: (key: string, e: React.MouseEvent) => void;
  onToggleNestedPath?: (
    folderName: string,
    subfolderPath: string[],
    e?: React.MouseEvent,
  ) => void;
  setShowCreateFolderModal: (show: boolean) => void;
  setCreateSubfolderForFolder: (f: string | null) => void;
  setCreateSubSubfolderFor: (
    val: {
      parentFolder: string;
      parentSubfolder: string;
      parentSubfolderId?: number;
      parentSubfolderPath?: string[];
    } | null,
  ) => void;
  handleRenameClick: (
    targetOrType: "folder" | "subfolder" | "subsubfolder" | SubfolderTarget,
    name?: string,
    folderName?: string,
    subfolderName?: string,
    subfolderPath?: string[],
    subfolderId?: number,
  ) => void;
  handleEditDescriptionClick?: (
    targetOrType: "folder" | "subfolder" | "subsubfolder" | SubfolderTarget,
    name?: string,
    parentFolder?: string,
    parentSubfolder?: string,
    subfolderPath?: string[],
    subfolderId?: number,
  ) => void;
  handleDeleteFolderClick: (folder: FolderDefinition) => void;
  handleDeleteSubfolderClick: (
    folderOrTarget: string | SubfolderTarget,
    subfolderName?: string,
    subfolderPath?: string[],
    subfolderId?: number,
  ) => void;
  handleDeleteSubSubfolderClick: (
    folderName: string,
    subfolderName: string,
    subSubfolderName: string,
    subfolderPath?: string[],
    subfolderId?: number,
  ) => void;
  setMoveFolderTarget: (target: {
    folderName: string;
    docCount: number;
  }) => void;
  setMoveSubfolderTarget: (target: {
    subfolderName: string;
    sourceFolder: string;
    docCount: number;
    subFolderId?: number | undefined;
    destinationFolderId?: number | undefined;
    destinationFolderName?: string | undefined;
  }) => void;
  setMoveSubSubTarget: (target: {
    subSubfolderName: string;
    sourceFolder: string;
    sourceSubfolder: string;
    subFolderId?: number;
    targetFolder?: string;
    targetSubfolder?: string;
    docCount: number;
  } | null) => void;
  handleFolderDragOver: (e: React.DragEvent, name: string) => void;
  handleFolderDragLeave: (name: string) => void;
  handleFolderDrop: (e: React.DragEvent, name: string) => void;
  handleSubfolderDragStart: (e: React.DragEvent, f: string, sf: string, folderId?: number | string, subfolderId?: number | string) => void;
  handleSubfolderDragOver: (e: React.DragEvent, f: string, sf: string) => void;
  handleSubfolderDragLeave: (f: string, sf: string) => void;
  handleSubfolderDrop: (e: React.DragEvent, f: string, sf: string) => void;
  handleSubSubfolderDragStart: (e: React.DragEvent, f: string, sf: string, ssf: string) => void;
  handleSubSubfolderDragOver: (e: React.DragEvent, f: string, sf: string, ssf: string) => void;
  handleSubSubfolderDragLeave: (f: string, sf: string, ssf: string) => void;
  handleSubSubfolderDrop: (e: React.DragEvent, f: string, sf: string, ssf: string) => void;
  onLocationSelect: (loc: string) => void;
  onTrashClick: () => void;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === "undefined") return 288;

    const savedWidth = Number(localStorage.getItem("dms-sidebar-width"));
    const maxWidth = Math.floor(window.innerWidth * 0.6);

    return Number.isFinite(savedWidth) && savedWidth >= 180 && savedWidth <= maxWidth
      ? savedWidth
      : Math.min(maxWidth, Math.max(180, 288));
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dms-sidebar-width", String(sidebarWidth));
    }
  }, [sidebarWidth]);

  const isResizing = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const resizeHandleRef = useRef<HTMLDivElement | null>(null);

  const resizeStartRef = useRef({
    pointerX: 0,
    sidebarLeft: 0,
    width: 288,
  });

  const handleResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (isSidebarCollapsed || event.button !== 0) return;

      const sidebar = sidebarRef.current;
      if (!sidebar) return;

      event.preventDefault();

      const rect = sidebar.getBoundingClientRect();

      resizeStartRef.current = {
        pointerX: event.clientX,
        sidebarLeft: rect.left,
        width: rect.width,
      };

      isResizing.current = true;
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [isSidebarCollapsed],
  );

  const handleResizeMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isResizing.current) return;

      const { pointerX, width } = resizeStartRef.current;
      const newWidth = width + event.clientX - pointerX;
      const maxWidth =
        typeof window !== "undefined"
          ? Math.floor(window.innerWidth * 0.6)
          : 600;

      setSidebarWidth(Math.min(maxWidth, Math.max(180, newWidth)));
    },
    [],
  );

  const handleResizeEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isResizing.current) return;

      isResizing.current = false;
      setIsDragging(false);

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    },
    [],
  );

  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback(() => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <aside
      ref={sidebarRef}
      style={{
        width: isSidebarCollapsed ? 0 : `${sidebarWidth}px`,
        minWidth: isSidebarCollapsed ? 0 : `${sidebarWidth}px`,
        maxWidth: isSidebarCollapsed ? 0 : `${sidebarWidth}px`,
      }}
      className={`relative flex flex-col bg-white border-slate-200 text-slate-800 shrink-0 overflow-hidden ${!isDragging ? "transition-all duration-300 ease-in-out" : ""
        } ${isSidebarCollapsed
          ? "border-r-0 opacity-0 pointer-events-none"
          : "border-r opacity-100"
        }`}
      aria-hidden={isSidebarCollapsed}
    >
      <div
        style={{ width: `${sidebarWidth}px` }}
        className="flex flex-col h-full overflow-hidden shrink-0"
      >
        {/* Pinned Sticky Header: Workspace Folders & Actions */}
        <div className="shrink-0 px-3 pt-2.5 pb-2 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace Folders
            </p>
            <div className="flex items-center gap-1.5">
              {role === "Admin" && (
                <button
                  type="button"
                  onClick={() => setShowCreateFolderModal(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#1E6FBF] hover:bg-blue-100/70 bg-blue-50 px-2 py-0.5 rounded-md cursor-pointer transition-all border border-blue-200/60 shadow-2xs"
                  title="Add New Primary Folder (Admin Only)"
                >
                  <Plus className="size-3" />
                  <span>New Folder</span>
                </button>
              )}
              {selectedFolder && (
                <button
                  type="button"
                  onClick={() => onSelectFolder(null)}
                  className="text-[11px] font-semibold text-[#1E6FBF] hover:underline cursor-pointer"
                  title="Clear folder selection"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Folder Navigation List */}
        <nav
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto px-2.5 py-2 space-y-1 dms-scrollbar ${isScrolling ? "is-scrolling" : ""
            }`}
        >
          {/* Primary Folders List */}
          <div className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon || Folder;
              const isSelected = selectedFolder === folder.name;
              const effectiveSubfolders: SubfolderInfo[] = folder.subfolders || [];
              const effectiveSelectedPath =
                selectedFolder === folder.name
                  ? selectedSubfolderPath.length > 0
                    ? selectedSubfolderPath
                    : selectedSubfolder
                      ? selectedSubSubfolder
                        ? [selectedSubfolder, selectedSubSubfolder]
                        : [selectedSubfolder]
                      : []
                  : [];

              const handleSelectSub =
                onSelectNestedSubfolder ??
                ((fName: string, subPath: string[]) => {
                  if (subPath.length === 1) onSelectSubfolder(fName, subPath[0]);
                  else if (subPath.length >= 2)
                    onSelectSubSubfolder(
                      fName,
                      subPath[0],
                      subPath[subPath.length - 1],
                    );
                });

              const handleToggleExpand = (fName: string, subPath: string[]) => {
                if (onToggleNestedPath) {
                  onToggleNestedPath(fName, subPath);
                } else {
                  toggleSubfolderExpand(
                    `${fName}:::${subPath.join(":::")}`,
                    undefined as any,
                  );
                }
              };

              const hasSub = effectiveSubfolders.length > 0;
              const isExpanded = Boolean(expandedFolders[folder.name]);
              const count = folderCounts[folder.name] || 0;
              const isDragOver = dragOverFolder === folder.name;

              return (
                <div
                  key={folder.id}
                  className={`space-y-0.5 rounded-lg transition-all ${isDragOver ? "ring-2 ring-[#1E6FBF] bg-blue-50" : ""
                    }`}
                  onDragOver={
                    role === "Admin"
                      ? (e) => handleFolderDragOver(e, folder.name)
                      : undefined
                  }
                  onDragLeave={
                    role === "Admin"
                      ? () => handleFolderDragLeave(folder.name)
                      : undefined
                  }
                  onDrop={
                    role === "Admin"
                      ? (e) => handleFolderDrop(e, folder.name)
                      : undefined
                  }
                >
                  <div
                    onClick={(e) => {
                      onSelectFolder(folder.name);

                      if (hasSub) {
                        toggleFolderExpand(folder.name, e);
                      }
                    }}
                    className={`group flex items-center justify-between rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${isSelected && !selectedSubfolder
                      ? "bg-blue-50 text-[#1E6FBF] font-bold border border-blue-200/80 shadow-2xs"
                      : isSelected && selectedSubfolder
                        ? "bg-blue-50/60 text-[#1E6FBF]"
                        : isDragOver
                          ? "bg-blue-100 text-[#1E6FBF] font-semibold"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    title={`${folder.number}. ${folder.name} (${count} files)${role === "Admin" ? " — Drag sub-folders here to move" : ""}`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {hasSub ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFolderExpand(folder.name, e);
                          }}
                          className="w-5 h-5 flex items-center justify-center hover:bg-slate-200/70 rounded cursor-pointer transition-transform shrink-0"
                          aria-label={
                            isExpanded ? "Collapse subfolders" : "Expand subfolders"
                          }
                        >
                          <ChevronDown
                            className={`h-5 w-5 text-slate-400 transition-transform duration-150 ${isExpanded ? "" : "-rotate-90"
                              }`}
                          />
                        </button>
                      ) : (
                        <span className="w-5 h-5 shrink-0 inline-block" />
                      )}
                      <Icon className="h-5 w-5 shrink-0 text-[#1E6FBF]" />
                      <span className="truncate text-xs font-medium text-slate-800">
                        {folder.number}. {folder.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-1">
                      {role === "Admin" && (
                        <div
                          className="flex items-center gap-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                className="flex h-5.5 w-5.5 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 cursor-pointer transition-all"
                                title="More options"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              sideOffset={5}
                              className="z-[100] w-36 rounded-md border border-slate-200 bg-white p-1 shadow-md"
                            >
                              {/* Add */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCreateSubfolderForFolder(folder.name);
                                }}
                                className="h-7 cursor-pointer gap-2 rounded-sm px-2 text-[11px] font-medium text-slate-700 outline-none hover:bg-blue-50 hover:text-[#1E6FBF] focus:bg-blue-50 focus:text-[#1E6FBF]"
                              >
                                <Plus className="h-4 w-4 shrink-0 text-[#1E6FBF]" />
                                <span>Add Sub-folder</span>
                              </DropdownMenuItem>

                              {/* Rename */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRenameClick("folder", folder.name);
                                }}
                                className="h-7 cursor-pointer gap-2 rounded-sm px-2 text-[11px] font-medium text-slate-700 outline-none hover:bg-blue-50 hover:text-[#1E6FBF] focus:bg-blue-50 focus:text-[#1E6FBF]"
                              >
                                <Pencil className="h-4 w-4 shrink-0 text-slate-400" />
                                <span>Rename</span>
                              </DropdownMenuItem>

                              {/* Edit Description */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDescriptionClick &&
                                    handleEditDescriptionClick("folder", folder.name);
                                }}
                                className="h-7 cursor-pointer gap-2 rounded-sm px-2 text-[11px] font-medium text-slate-700 outline-none hover:bg-blue-50 hover:text-[#1E6FBF] focus:bg-blue-50 focus:text-[#1E6FBF]"
                              >
                                <Pencil className="h-4 w-4 shrink-0 text-slate-400" />
                                <span>Edit Description</span>
                              </DropdownMenuItem>

                              {/* Move */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMoveFolderTarget({
                                    folderName: folder.name,
                                    docCount: count,
                                  });
                                }}
                                className="h-7 cursor-pointer gap-2 rounded-sm px-2 text-[11px] font-medium text-slate-700 outline-none hover:bg-blue-50 hover:text-[#1E6FBF] focus:bg-blue-50 focus:text-[#1E6FBF]"
                              >
                                <ArrowRightLeft className="h-4 w-4 shrink-0 text-[#1E6FBF]" />
                                <span>Move</span>
                              </DropdownMenuItem>

                              {/* Delete */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFolderClick(folder);
                                }}
                                className="h-7 cursor-pointer gap-2 rounded-sm px-2 text-[11px] font-medium text-red-600 outline-none hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 shrink-0 text-red-500" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600">
                        {count}
                      </span>
                    </div>
                  </div>
                  {/* Subfolders list when expanded */}
                  {isExpanded && hasSub && (
                    <div className="ml-5 pl-2.5 border-l-2 border-slate-200 space-y-1 mt-1">
                      {effectiveSubfolders.map((subfolder) => (
                        <DmsFolderTreeItem
                          key={subfolder.id ?? subfolder.sub_folder_id ?? subfolder.name}
                          folder={subfolder}
                          folderName={folder.name}
                          path={[subfolder.name]}
                          depth={1}
                          selectedPath={effectiveSelectedPath}
                          expandedPaths={expandedPaths}
                          expandedSubfolders={expandedSubfolders}
                          onSelect={handleSelectSub}
                          onToggleExpand={(subPath) =>
                            handleToggleExpand(folder.name, subPath)
                          }
                          role={role}
                          folderCounts={folderCounts}
                          subfolderCounts={subfolderCounts}
                          subSubfolderCounts={subSubfolderCounts}
                          dragOverSubfolder={dragOverSubfolder}
                          dragOverSubSubfolder={dragOverSubSubfolder}
                          onSelectSubfolder={onSelectSubfolder}
                          onSelectSubSubfolder={onSelectSubSubfolder}
                          setCreateSubSubfolderFor={setCreateSubSubfolderFor}
                          handleRenameClick={handleRenameClick}
                          handleEditDescriptionClick={handleEditDescriptionClick}
                          handleDeleteSubfolderClick={handleDeleteSubfolderClick}
                          handleDeleteSubSubfolderClick={handleDeleteSubSubfolderClick}
                          setMoveSubfolderTarget={setMoveSubfolderTarget}
                          setMoveSubSubTarget={setMoveSubSubTarget}
                          handleSubfolderDragStart={handleSubfolderDragStart}
                          handleSubfolderDragOver={handleSubfolderDragOver}
                          handleSubfolderDragLeave={handleSubfolderDragLeave}
                          handleSubfolderDrop={handleSubfolderDrop}
                          handleSubSubfolderDragStart={handleSubSubfolderDragStart}
                          handleSubSubfolderDragOver={handleSubSubfolderDragOver}
                          handleSubSubfolderDragLeave={handleSubSubfolderDragLeave}
                          handleSubSubfolderDrop={handleSubSubfolderDrop}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Pinned Sticky Bottom Section: Station / Location & Recycle Bin */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-2.5 py-2.5 space-y-2.5 shadow-[0_-2px_6px_rgba(0,0,0,0.03)] z-10">
          {/* Location Station Filter */}
          <div>
            <div className="flex items-center justify-between px-1 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Station / Location
              </p>
              {filterLocation !== "All" && (
                <button
                  type="button"
                  onClick={() => onLocationSelect("All")}
                  className="text-[11px] text-[#1E6FBF] hover:underline font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1">
              {["HO BLR", "MLR", "NER", "HSN", "DKN"].map((location) => {
                const isLocActive = filterLocation === location;
                return (
                  <button
                    type="button"
                    key={location}
                    onClick={() => onLocationSelect(location)}
                    className={`rounded-md border px-1.5 py-1 text-[10px] font-semibold transition-all cursor-pointer text-center truncate ${isLocActive
                        ? "bg-[#1E6FBF] text-white border-[#1E6FBF] shadow-xs font-bold"
                        : "border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    title={`Filter documents strictly by ${location}`}
                  >
                    {location}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recycle Bin Button (Admin Only) */}
          {role === "Admin" && (
            <div className="pt-0.5">
              <p className="px-1 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Recycle Bin
              </p>
              <button
                type="button"
                onClick={onTrashClick}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeMainTab === "trash"
                    ? "bg-red-50 text-red-700 border border-red-200 shadow-xs"
                    : "text-slate-600 hover:bg-red-50 hover:text-red-700"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="size-3.5 text-red-500" />
                  <span>Trash / Deleted</span>
                </div>
                {deletedDocsCount > 0 && (
                  <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold">
                    {deletedDocsCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar resize handle */}
      {!isSidebarCollapsed && (
        <div
          ref={resizeHandleRef}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize workspace folders sidebar"
          aria-valuenow={sidebarWidth}
          aria-valuemin={180}
          aria-valuemax={
            typeof window !== "undefined"
              ? Math.floor(window.innerWidth * 0.6)
              : 600
          }
          tabIndex={0}
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          onLostPointerCapture={handleResizeEnd}
          onKeyDown={(event) => {
            const maxWidth =
              typeof window !== "undefined"
                ? Math.floor(window.innerWidth * 0.6)
                : 600;

            if (event.key === "ArrowRight") {
              event.preventDefault();
              setSidebarWidth((width) => Math.min(maxWidth, width + 16));
            }

            if (event.key === "ArrowLeft") {
              event.preventDefault();
              setSidebarWidth((width) => Math.max(180, width - 16));
            }
          }}
          className="absolute right-0 top-0 z-30 h-full w-2 cursor-col-resize touch-none bg-transparent transition-colors hover:bg-blue-400 active:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          title="Drag to resize sidebar"
        />
      )}
    </aside>
  );
}

export default DmsSidebar;
