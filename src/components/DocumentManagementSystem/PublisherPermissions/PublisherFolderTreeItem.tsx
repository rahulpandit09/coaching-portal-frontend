import React, { useEffect, useState } from "react";
import { Check, ChevronDown, Folder, FolderOpen } from "lucide-react";
import type { SubfolderInfo } from "../types";

export interface PublisherFolderTreeItemProps {
  subfolder: SubfolderInfo;
  folderName: string;
  folderId?: number;
  parentPath?: string[];
  index?: number;
  assignedSubfolders: (number | string)[];
  onToggleSubfolder: (
    subfolder: SubfolderInfo,
    folderName: string,
    path: string[],
    rootFolderId?: number
  ) => void;
  searchQuery?: string;
  expandMatching?: boolean;
}

const countAllSubfolders = (
  subfolders: SubfolderInfo[] = []
): number => {
  return subfolders.reduce(
    (count, item) =>
      count +
      1 +
      countAllSubfolders(item.subfolders ?? []),
    0
  );
};

const getUniqueSubfolders = (
  subfolders: SubfolderInfo[] = []
): SubfolderInfo[] => {
  const seen = new Set<string>();

  return subfolders.filter((item) => {
    const name = item.name.trim();

    // Prefer the database subfolder ID when available.
    const key =
      item.sub_folder_id != null
        ? `id:${item.sub_folder_id}`
        : item.id != null
        ? `id:${item.id}`
        : `name:${name}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export function PublisherFolderTreeItem({
  subfolder,
  folderName,
  folderId,
  parentPath = [],
  index = 0,
  assignedSubfolders,
  onToggleSubfolder,
  searchQuery = "",
  expandMatching = false,
}: PublisherFolderTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (expandMatching) {
      setIsExpanded(true);
    }
  }, [expandMatching, searchQuery]);

  // Normalize subfolder name in case it's prefixed by parent folder name
  const parentPrefix = `${folderName}:::`;
  const normalizedName = subfolder.name.startsWith(parentPrefix)
    ? subfolder.name.slice(parentPrefix.length)
    : subfolder.name;

  const ownName = normalizedName.includes(":::")
    ? normalizedName.split(":::").pop() || normalizedName
    : normalizedName;

  const currentPath = [...parentPath, ownName];
  const subfolderKey = [folderName, ...currentPath].join(":::");

  const subFolderId =
    typeof subfolder.sub_folder_id === "number"
      ? subfolder.sub_folder_id
      : !isNaN(Number(subfolder.id))
      ? Number(subfolder.id)
      : null;

  // Check assignment using the numeric subfolder ID or its complete path.
  const assignedSubfolderValues = new Set(
    assignedSubfolders.map((value) => String(value).trim())
  );

  const isChecked =
    (subFolderId !== null &&
      subFolderId > 0 &&
      assignedSubfolderValues.has(String(subFolderId))) ||
    assignedSubfolderValues.has(subfolderKey);

  const uniqueSubfolders = getUniqueSubfolders(
    subfolder.subfolders ?? []
  );

  const hasChildren = uniqueSubfolders.length > 0;

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleSubfolder(
      subfolder,
      folderName,
      currentPath,
      folderId
    );
  };

  return (
    <div className="space-y-1">
      <div
        className={`group flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors ${
          isChecked
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-transparent bg-background hover:border-border hover:bg-muted/50"
        }`}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded((previous) => !previous)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={
              isExpanded
                ? `Collapse ${ownName}`
                : `Expand ${ownName}`
            }
            aria-expanded={isExpanded}
          >
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isExpanded ? "" : "-rotate-90"
              }`}
            />
          </button>
        ) : (
          <span className="h-7 w-7 shrink-0" />
        )}

        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 py-0.5">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="h-4 w-4 shrink-0 cursor-pointer rounded accent-primary"
          />

          {isExpanded && hasChildren ? (
            <FolderOpen
              size={18}
              className="shrink-0 text-primary"
            />
          ) : (
            <Folder
              size={18}
              className={`shrink-0 ${
                isChecked ? "text-primary" : "text-muted-foreground"
              }`}
            />
          )}

          <span
            className="min-w-0 flex-1 truncate text-sm font-medium"
            title={ownName}
          >
            {ownName}
          </span>
        </label>

        {isChecked && (
          <Check
            size={16}
            className="shrink-0 text-primary"
            aria-label="Assigned"
          />
        )}

        {hasChildren && (
          <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            {countAllSubfolders(uniqueSubfolders)}
          </span>
        )}
      </div>

      {/* Recursive rendering with hierarchy connector lines */}
      {hasChildren && isExpanded && (
        <div className="relative ml-4 mt-1 space-y-1.5 border-l-2 border-slate-300 pl-4 dark:border-slate-600">
          {uniqueSubfolders.map((child, childIndex) => {
            const childKey =
              child.sub_folder_id != null
                ? `subfolder-${child.sub_folder_id}`
                : child.id != null
                ? `subfolder-${child.id}`
                : `${subfolderKey}:::${child.name}`;

            return (
              <div key={childKey} className="relative">
                {/* Horizontal connector */}
                <span
                  aria-hidden="true"
                  className="absolute -left-[18px] top-[18px] h-0 w-[18px] border-t-2 border-slate-300 dark:border-slate-600"
                />

                <PublisherFolderTreeItem
                  subfolder={child}
                  folderName={folderName}
                  folderId={folderId}
                  parentPath={currentPath}
                  index={childIndex}
                  assignedSubfolders={assignedSubfolders}
                  onToggleSubfolder={onToggleSubfolder}
                  searchQuery={searchQuery}
                  expandMatching={expandMatching}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
