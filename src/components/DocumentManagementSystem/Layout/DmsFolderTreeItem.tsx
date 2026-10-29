import React from "react";
import {
  ArrowRightLeft,
  ChevronDown,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/DocumentManagementSystem/ui/dropdown-menu";
import type { Role, SubfolderInfo } from "../types";
import type { SubfolderTarget } from "../hooks/useDmsFolderActions";

export interface DmsFolderTreeItemProps {
  folder: SubfolderInfo;
  folderName: string;
  path: string[];
  depth: number;
  selectedPath: string[];
  expandedPaths: Record<string, boolean>;
  expandedSubfolders?: Record<string, boolean>;
  onSelect: (folderName: string, path: string[]) => void;
  onToggleExpand: (path: string[]) => void;
  role: Role;
  folderCounts?: Record<string, number>;
  subfolderCounts?: Record<string, number>;
  subSubfolderCounts?: Record<string, number>;
  dragOverSubfolder?: string | null;
  dragOverSubSubfolder?: string | null;
  onSelectSubfolder?: (f: string, sf: string) => void;
  onSelectSubSubfolder?: (f: string, sf: string, ssf: string) => void;
  setCreateSubSubfolderFor?: (val: {
    parentFolder: string;
    parentSubfolder: string;
    parentSubfolderId?: number;
    parentSubfolderPath?: string[];
  } | null) => void;
  handleRenameClick?: (
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
  handleDeleteSubfolderClick?: (
    folderOrTarget: string | SubfolderTarget,
    subfolderName?: string,
    subfolderPath?: string[],
    subfolderId?: number,
  ) => void;
  handleDeleteSubSubfolderClick?: (
    folderName: string,
    subfolderName: string,
    subSubfolderName: string,
    subfolderPath?: string[],
    subfolderId?: number,
  ) => void;
  setMoveSubfolderTarget?: (target: {
    subfolderName: string;
    sourceFolder: string;
    docCount: number;
    subFolderId?: number | undefined;
    destinationFolderId?: number | undefined;
    destinationFolderName?: string | undefined;
  }) => void;
  setMoveSubSubTarget?: (target: {
    subSubfolderName: string;
    sourceFolder: string;
    sourceSubfolder: string;
    subFolderId?: number;
    targetFolder?: string;
    targetSubfolder?: string;
    docCount: number;
  } | null) => void;
  handleSubfolderDragStart?: (
    e: React.DragEvent,
    f: string,
    sf: string,
    folderId?: number | string,
    subfolderId?: number | string,
  ) => void;
  handleSubfolderDragOver?: (
    e: React.DragEvent,
    f: string,
    sf: string,
  ) => void;
  handleSubfolderDragLeave?: (f: string, sf: string) => void;
  handleSubfolderDrop?: (e: React.DragEvent, f: string, sf: string) => void;
  handleSubSubfolderDragStart?: (
    e: React.DragEvent,
    f: string,
    sf: string,
    ssf: string,
  ) => void;
  handleSubSubfolderDragOver?: (
    e: React.DragEvent,
    f: string,
    sf: string,
    ssf: string,
  ) => void;
  handleSubSubfolderDragLeave?: (
    f: string,
    sf: string,
    ssf: string,
  ) => void;
  handleSubSubfolderDrop?: (
    e: React.DragEvent,
    f: string,
    sf: string,
    ssf: string,
  ) => void;
}

export function DmsFolderTreeItem({
  folder,
  folderName,
  path,
  depth,
  selectedPath,
  expandedPaths,
  expandedSubfolders,
  onSelect,
  onToggleExpand,
  role,
  folderCounts = {},
  subfolderCounts = {},
  subSubfolderCounts = {},
  dragOverSubfolder,
  dragOverSubSubfolder,
  onSelectSubfolder,
  onSelectSubSubfolder,
  setCreateSubSubfolderFor,
  handleRenameClick,
  handleEditDescriptionClick,
  handleDeleteSubfolderClick,
  handleDeleteSubSubfolderClick,
  setMoveSubfolderTarget,
  setMoveSubSubTarget,
  handleSubfolderDragStart,
  handleSubfolderDragOver,
  handleSubfolderDragLeave,
  handleSubfolderDrop,
  handleSubSubfolderDragStart,
  handleSubSubfolderDragOver,
  handleSubSubfolderDragLeave,
  handleSubSubfolderDrop,
}: DmsFolderTreeItemProps) {
  // Check selection by full path comparison
  const isSelected =
    selectedPath.length === path.length &&
    selectedPath.every((segment, idx) => segment === path[idx]);

  // Expansion key
  const pathKey = JSON.stringify([folderName, ...path]);
  const legacySubKey = `${folderName}:::${path.join(":::")}`;
  const isExpanded = Boolean(
    expandedPaths[pathKey] ?? expandedSubfolders?.[legacySubKey],
  );

  const hasChildren = Boolean(folder.subfolders && folder.subfolders.length > 0);

  // Compute document count for this folder node
  const countKey = `${folderName}:::${path.join(":::")}`;
  const ssfPathKey =
    path.length > 1
      ? `${folderName}:::${path[0]}:::${path.slice(1).join(" / ")}`
      : "";
  const docCount =
    (path.length === 1 ? subfolderCounts[countKey] : undefined) ??
    (ssfPathKey ? subSubfolderCounts[ssfPathKey] : undefined) ??
    subSubfolderCounts[countKey] ??
    subfolderCounts[countKey] ??
    0;

  // Drag over detection
  const isDragOver =
    dragOverSubfolder === countKey ||
    dragOverSubSubfolder === countKey ||
    (path.length > 1 && dragOverSubSubfolder === ssfPathKey);

  const prefixCode = folder.code || folder.letter || "";
  const subfolderIdNumber = Number(folder.id ?? folder.sub_folder_id) || undefined;

  // Drag handlers depending on depth
  const onDragStartHandler = (e: React.DragEvent) => {
    if (role !== "Admin") return;
    if (depth === 1 && handleSubfolderDragStart) {
      handleSubfolderDragStart(
        e,
        folderName,
        folder.name,
        undefined,
        subfolderIdNumber,
      );
    } else if (handleSubSubfolderDragStart) {
      handleSubSubfolderDragStart(
        e,
        folderName,
        path[0],
        folder.name,
      );
    }
  };

  const onDragOverHandler = (e: React.DragEvent) => {
    if (depth === 1 && handleSubfolderDragOver) {
      handleSubfolderDragOver(e, folderName, folder.name);
    } else if (handleSubSubfolderDragOver) {
      handleSubSubfolderDragOver(e, folderName, path[0], folder.name);
    }
  };

  const onDragLeaveHandler = () => {
    if (depth === 1 && handleSubfolderDragLeave) {
      handleSubfolderDragLeave(folderName, folder.name);
    } else if (handleSubSubfolderDragLeave) {
      handleSubSubfolderDragLeave(folderName, path[0], folder.name);
    }
  };

  const onDropHandler = (e: React.DragEvent) => {
    if (depth === 1 && handleSubfolderDrop) {
      handleSubfolderDrop(e, folderName, folder.name);
    } else if (handleSubSubfolderDrop) {
      handleSubSubfolderDrop(e, folderName, path[0], folder.name);
    }
  };

  const handleClick = () => {
    // Preserve the existing selection behavior.
    onSelect(folderName, path);

    if (path.length === 1 && onSelectSubfolder) {
      onSelectSubfolder(folderName, folder.name);
    } else if (path.length === 2 && onSelectSubSubfolder) {
      onSelectSubSubfolder(folderName, path[0], folder.name);
    }

    // Clicking a folder row also toggles its children.
    if (hasChildren) {
      onToggleExpand(path);
    }
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (setCreateSubSubfolderFor) {
      setCreateSubSubfolderFor({
        parentFolder: folderName,
        parentSubfolder: folder.name,
        parentSubfolderId: subfolderIdNumber,
        parentSubfolderPath: path,
      });
    }
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (handleRenameClick) {
      handleRenameClick({
        type: depth > 1 ? "subsubfolder" : "subfolder",
        parentFolder: folderName,
        parentSubfolder: path.length > 1 ? path[path.length - 2] : undefined,
        subfolderPath: path,
        subfolderId: subfolderIdNumber,
        currentName: folder.name,
      });
    }
  };

  const handleEditDesc = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (handleEditDescriptionClick) {
      handleEditDescriptionClick({
        type: depth > 1 ? "subsubfolder" : "subfolder",
        parentFolder: folderName,
        parentSubfolder: path.length > 1 ? path[path.length - 2] : undefined,
        subfolderPath: path,
        subfolderId: subfolderIdNumber,
        currentName: folder.name,
      });
    }
  };

  const handleMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (depth === 1 && setMoveSubfolderTarget) {
      setMoveSubfolderTarget({
        subfolderName: folder.name,
        sourceFolder: folderName,
        docCount,
        subFolderId: subfolderIdNumber,
      });
    } else if (setMoveSubSubTarget) {
      setMoveSubSubTarget({
        subSubfolderName: folder.name,
        sourceFolder: folderName,
        sourceSubfolder: path[path.length - 2] || path[0],
        subFolderId: subfolderIdNumber,
        docCount,
      });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (depth === 1 && handleDeleteSubfolderClick) {
      handleDeleteSubfolderClick({
        type: "subfolder",
        parentFolder: folderName,
        currentName: folder.name,
        subfolderPath: path,
        subfolderId: subfolderIdNumber,
      });
    } else if (handleDeleteSubSubfolderClick) {
      handleDeleteSubSubfolderClick(
        folderName,
        path[0],
        folder.name,
        path,
        subfolderIdNumber,
      );
    } else if (handleDeleteSubfolderClick) {
      handleDeleteSubfolderClick({
        type: "subsubfolder",
        parentFolder: folderName,
        parentSubfolder: path[path.length - 2] || path[0],
        currentName: folder.name,
        subfolderPath: path,
        subfolderId: subfolderIdNumber,
      });
    }
  };

  return (
    <div key={folder.id ?? folder.name} className="space-y-0.5">
      <div
        draggable={role === "Admin"}
        onDragStart={onDragStartHandler}
        onDragOver={onDragOverHandler}
        onDragLeave={onDragLeaveHandler}
        onDrop={onDropHandler}
        onClick={handleClick}
        className={`group/treeitem flex items-center justify-between rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
          isDragOver
            ? "ring-2 ring-[#1E6FBF] bg-blue-100 text-[#1E6FBF] font-bold"
            : isSelected
              ? "bg-[#1E6FBF] text-white font-semibold shadow-2xs"
              : depth > 1
                ? "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title={`${prefixCode ? `${prefixCode}. ` : ""}${folder.name}${
          folder.description ? ` — ${folder.description}` : ""
        } (${docCount} files)${role === "Admin" ? " (Drag to re-order/move)" : ""}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {role === "Admin" && (
            <span
              title="Drag to move folder"
              onClick={(e) => e.stopPropagation()}
              className="cursor-grab active:cursor-grabbing shrink-0 inline-flex items-center"
            >
              <GripVertical className="size-2.5 opacity-30 group-hover/treeitem:opacity-100 hover:text-[#1E6FBF]" />
            </span>
          )}

          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(path);
              }}
              className="w-3.5 h-3.5 flex items-center justify-center hover:bg-slate-200/60 rounded cursor-pointer transition-transform shrink-0"
              aria-label={isExpanded ? "Collapse subfolders" : "Expand subfolders"}
            >
              <ChevronDown
                className={`size-2.5 text-slate-400 transition-transform duration-150 ${
                  isExpanded ? "" : "-rotate-90"
                }`}
              />
            </button>
          ) : (
            <span className="w-3.5 h-3.5 shrink-0 inline-block" />
          )}

          {prefixCode && (
            <span
              className={`font-mono text-[10px] font-bold shrink-0 ${
                isSelected ? "text-blue-100" : "text-[#1E6FBF]"
              }`}
            >
              {prefixCode}.
            </span>
          )}

          <span className="truncate">{folder.name}</span>
        </div>

        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {role === "Admin" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-5 w-5 items-center justify-center rounded-md opacity-0 group-hover/treeitem:opacity-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 cursor-pointer transition-all"
                  title="More options"
                >
                  <MoreHorizontal className="size-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={5}
                className="z-[100] w-36 rounded-md border border-slate-200 bg-white p-1 shadow-md"
              >
                <DropdownMenuItem
                  onClick={handleAddChild}
                  className="h-7 cursor-pointer gap-2 rounded-sm px-2 text-[11px] font-medium text-slate-700 outline-none hover:bg-blue-50 hover:text-[#1E6FBF] focus:bg-blue-50 focus:text-[#1E6FBF]"
                >
                  <Plus className="h-4 w-4 shrink-0 text-[#1E6FBF]" />
                  <span>Add Sub-folder</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleRename}
                  className="h-7 cursor-pointer gap-2 rounded-sm px-2 text-[11px] font-medium text-slate-700 outline-none hover:bg-blue-50 hover:text-[#1E6FBF] focus:bg-blue-50 focus:text-[#1E6FBF]"
                >
                  <Pencil className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>Rename</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleEditDesc}
                  className="h-7 cursor-pointer gap-2 rounded-sm px-2 text-[11px] font-medium text-slate-700 outline-none hover:bg-blue-50 hover:text-[#1E6FBF] focus:bg-blue-50 focus:text-[#1E6FBF]"
                >
                  <Pencil className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>Edit Description</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleMove}
                  className="h-7 cursor-pointer gap-2 rounded-sm px-2 text-[11px] font-medium text-slate-700 outline-none hover:bg-blue-50 hover:text-[#1E6FBF] focus:bg-blue-50 focus:text-[#1E6FBF]"
                >
                  <ArrowRightLeft className="h-4 w-4 shrink-0 text-[#1E6FBF]" />
                  <span>Move</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleDelete}
                  className="h-7 cursor-pointer gap-2 rounded-sm px-2 text-[11px] font-medium text-red-600 outline-none hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                >
                  <Trash2 className="h-4 w-4 shrink-0 text-red-500" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <span
            className={`rounded px-1 text-[9.5px] font-mono ${
              isSelected ? "bg-white/20 text-white" : "text-slate-400"
            }`}
          >
            {docCount}
          </span>
        </div>
      </div>

      {/* Recursive rendering of children */}
      {isExpanded && folder.subfolders && folder.subfolders.length > 0 && (
        <div className="ml-3 pl-2.5 border-l-2 border-slate-200 space-y-0.5 mt-0.5">
          {folder.subfolders.map((child) => (
            <DmsFolderTreeItem
              key={child.id ?? child.sub_folder_id ?? child.name}
              folder={child}
              folderName={folderName}
              path={[...path, child.name]}
              depth={depth + 1}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              expandedSubfolders={expandedSubfolders}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
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
}
