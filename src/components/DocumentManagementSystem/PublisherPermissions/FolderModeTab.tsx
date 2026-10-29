import React, { useState } from "react";
import {
  ChevronDown,
  Folder,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import type { FolderDefinition, Publisher, SubfolderInfo } from "../types";

// Recursive helper to count total subfolders across all nested levels
const countAllSubfolders = (subfolders: SubfolderInfo[] = []): number => {
  let count = 0;
  for (const sf of subfolders) {
    count += 1;
    const children =
      sf.subfolders ||
      (sf as any).children ||
      (sf as any).sub_sub_folders ||
      [];
    if (children.length > 0) {
      count += countAllSubfolders(children);
    }
  }
  return count;
};

// Recursive helper to check if search query matches subfolders at any depth
const hasMatchingSubfolder = (
  subs: SubfolderInfo[] = [],
  query: string,
): boolean => {
  return subs.some((sf) => {
    if (sf.name.toLowerCase().includes(query)) return true;
    const children =
      sf.subfolders ||
      (sf as any).children ||
      (sf as any).sub_sub_folders ||
      [];
    return hasMatchingSubfolder(children, query);
  });
};

interface FolderModeSubfolderNodeProps {
  subfolder: SubfolderInfo;
  folder: FolderDefinition;
  parentPath?: string[];
  depth?: number;
  index?: number;
  publishers: Publisher[];
  globalSearch?: string;
  folderModeSearch?: string;
  onSelectSubfolderForPublishers: (target: {
    folder: FolderDefinition;
    subfolderName: string;
    subfolderId?: number;
    subfolderPath?: string[];
  }) => void;
  isPublisherAssignedToSubfolder: (
    publisher: Publisher,
    folderName: string,
    subfolderName: string,
    subfolderId?: number,
    subfolderPath?: string[],
  ) => boolean;
}

function FolderModeSubfolderNode({
  subfolder,
  folder,
  parentPath = [],
  depth = 0,
  index = 0,
  publishers,
  globalSearch,
  folderModeSearch,
  onSelectSubfolderForPublishers,
  isPublisherAssignedToSubfolder,
}: FolderModeSubfolderNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Normalize name if prefixed
  const parentPrefix = `${folder.name}:::`;
  const rawName = subfolder.name || "";
  const normalizedName = rawName.startsWith(parentPrefix)
    ? rawName.slice(parentPrefix.length)
    : rawName;
  const ownName = normalizedName.includes(":::")
    ? normalizedName.split(":::").pop() || normalizedName
    : normalizedName;

  const currentPath = [...parentPath, ownName];

  const subFolderId =
    typeof subfolder.sub_folder_id === "number" && subfolder.sub_folder_id > 0
      ? subfolder.sub_folder_id
      : typeof subfolder.id === "number" && subfolder.id > 0
      ? subfolder.id
      : !isNaN(Number(subfolder.id)) && Number(subfolder.id) > 0
      ? Number(subfolder.id)
      : undefined;

  const children =
    subfolder.subfolders ||
    (subfolder as any).children ||
    (subfolder as any).sub_sub_folders ||
    [];
  const hasChildren = Array.isArray(children) && children.length > 0;

  const codeLabel =
    subfolder.code ||
    subfolder.letter ||
    (depth === 0
      ? String.fromCharCode(65 + (index % 26))
      : String(index + 1));

  // Determine assigned publishers for this node
  const sfPubs = publishers.filter((p) => {
    if (!p.assignedFolders.includes(folder.name)) return false;

    if (
      isPublisherAssignedToSubfolder(
        p,
        folder.name,
        ownName,
        subFolderId,
        currentPath,
      )
    ) {
      return true;
    }

    if (
      subFolderId &&
      ((p.assignedSubfolders as any)?.includes(subFolderId) ||
        p.assignedSubfolders?.includes(String(subFolderId)))
    ) {
      return true;
    }

    const fullKey = `${folder.name}:::${currentPath.join(":::")}`;
    if (p.assignedSubfolders?.includes(fullKey)) {
      return true;
    }

    if (
      p.assignedSubfolders?.some((sf) => String(sf).endsWith(`:::${ownName}`))
    ) {
      return true;
    }

    return false;
  });

  return (
    <div className="space-y-1">
      {/* Subfolder Tree Row */}
      <div className="rounded-md border border-transparent hover:border-border/60 hover:bg-muted/30 transition-colors">
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          {/* Folder Name */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Folder
              className={`h-4 w-4 shrink-0 ${
                depth === 0 ? "text-primary" : "text-slate-500"
              }`}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[10px] font-bold text-primary">
                  {codeLabel}.
                </span>

                <span className="text-xs font-medium text-foreground break-words">
                  {ownName}
                </span>

                {depth > 0 && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                    Level {depth + 1}
                  </span>
                )}

                {hasChildren && (
                  <span className="text-[9px] text-muted-foreground">
                    ({children.length} subfolders)
                  </span>
                )}
              </div>

              {subfolder.description && (
                <p className="mt-0.5 text-[10px] text-muted-foreground truncate">
                  {subfolder.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {hasChildren && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex items-center gap-1 rounded px-1.5 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                title={isExpanded ? "Collapse subfolders" : "Expand subfolders"}
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    isExpanded ? "" : "-rotate-90"
                  }`}
                />
              </button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                onSelectSubfolderForPublishers({
                  folder,
                  subfolderName: ownName,
                  subfolderId: subFolderId,
                  subfolderPath: currentPath,
                })
              }
              className="h-7 px-2 text-[10px] font-semibold text-primary hover:bg-primary/10"
              title={`Assign publishers to ${folder.name} / ${currentPath.join(" / ")}`}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Assign
            </Button>
          </div>
        </div>

        {/* Assigned Publishers */}
        <div className="flex flex-wrap items-center gap-1 px-2 pb-2">
          {sfPubs.length > 0 ? (
            sfPubs.map((publisher) => (
              <span
                key={publisher.id}
                className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-[10px] text-foreground"
                title={`${publisher.name} (${publisher.email})`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {publisher.name}
              </span>
            ))
          ) : (
            <span className="px-2 text-[10px] italic text-muted-foreground">
              No publisher assigned
            </span>
          )}
        </div>
      </div>

      {/* Recursively Render Nested Subfolders */}
      {hasChildren && isExpanded && (
        <div className="relative ml-4 space-y-1 border-l border-border/70 pl-3">
          {children
            .filter((child) => {
              const localQuery = (folderModeSearch || "").trim().toLowerCase();
              const globalQuery = (globalSearch || "").trim().toLowerCase();

              const matches = (query: string) => {
                if (!query) return true;

                const name = (child.name || "").toLowerCase();
                const code = (
                  child.code ||
                  child.letter ||
                  ""
                ).toLowerCase();
                const description = (
                  child.description || ""
                ).toLowerCase();

                if (
                  name.includes(query) ||
                  code.includes(query) ||
                  description.includes(query)
                ) {
                  return true;
                }

                const nestedChildren =
                  child.subfolders ||
                  (child as any).children ||
                  (child as any).sub_sub_folders ||
                  [];

                return hasMatchingSubfolder(nestedChildren, query);
              };

              return matches(localQuery) && matches(globalQuery);
            })
            .map((child, childIndex) => (
              <div
                key={
                  child.sub_folder_id ??
                  child.id ??
                  `${currentPath.join(":::")}:::${child.name}`
                }
                className="relative"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-3 top-4 w-3 border-t border-border/70"
                />

                <FolderModeSubfolderNode
                  subfolder={child}
                  folder={folder}
                  parentPath={currentPath}
                  depth={depth + 1}
                  index={childIndex}
                  publishers={publishers}
                  globalSearch={globalSearch}
                  folderModeSearch={folderModeSearch}
                  onSelectSubfolderForPublishers={onSelectSubfolderForPublishers}
                  isPublisherAssignedToSubfolder={isPublisherAssignedToSubfolder}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export function FolderModeTab({
  folders,
  publishers,
  globalSearch,
  folderModeSearch,
  onFolderModeSearchChange,
  folderModeFilter,
  onFolderModeFilterChange,
  onSelectFolderForPublishers,
  onSelectSubfolderForPublishers,
  onQuickRevokeFolderPublisher,
  isPublisherAssignedToSubfolder,
}: {
  folders: FolderDefinition[];
  publishers: Publisher[];
  globalSearch?: string;
  folderModeSearch: string;
  onFolderModeSearchChange: (val: string) => void;
  folderModeFilter: "All" | "Multi" | "Single" | "Unassigned";
  onFolderModeFilterChange: (val: "All" | "Multi" | "Single" | "Unassigned") => void;
  onSelectFolderForPublishers: (folder: FolderDefinition) => void;
  onSelectSubfolderForPublishers: (target: {
    folder: FolderDefinition;
    subfolderName: string;
    subfolderId?: number;
    subfolderPath?: string[];
  }) => void;
  onQuickRevokeFolderPublisher: (folderName: string, publisherId: string) => void;
  isPublisherAssignedToSubfolder: (
    publisher: Publisher,
    folderName: string,
    subfolderName: string,
    subfolderId?: number,
    subfolderPath?: string[],
  ) => boolean;
}) {
  const [revokeConfirmation, setRevokeConfirmation] = useState<{
    folderName: string;
    publisherId: string;
    publisherName: string;
  } | null>(null);

  const confirmRevokePublisher = () => {
    if (!revokeConfirmation) return;

    onQuickRevokeFolderPublisher(
      revokeConfirmation.folderName,
      revokeConfirmation.publisherId,
    );

    setRevokeConfirmation(null);
  };

  return (
    <div className="space-y-4">
      {/* Folder Mode Controls & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>Folder Governance & Access Directory</span>
            <span className="rounded-full bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5">
              {folders.length} Folders Governed
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            View which publishers have access to each folder and subfolder. Click any
            folder or subfolder to add/manage publishers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={folderModeSearch}
              onChange={(e) => onFolderModeSearchChange(e.target.value)}
              placeholder="Search folder or publisher..."
              className="dms-input h-8 w-full !pl-8 !pr-3 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/50 text-[11px]">
            {(
              [
                { key: "All", label: "All" },
                { key: "Multi", label: "Multi-Publisher" },
                { key: "Single", label: "1 Publisher" },
                { key: "Unassigned", label: "Unassigned" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => onFolderModeFilterChange(t.key)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${folderModeFilter === t.key
                  ? "bg-card text-foreground shadow-2xs font-semibold border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Folder Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {folders
          .filter((folder) => {
            const assignedPubs = publishers.filter((p) =>
              p.assignedFolders.includes(folder.name),
            );
            if (folderModeFilter === "Multi" && assignedPubs.length <= 1)
              return false;
            if (folderModeFilter === "Single" && assignedPubs.length !== 1)
              return false;
            if (folderModeFilter === "Unassigned" && assignedPubs.length > 0)
              return false;

            const localQuery = folderModeSearch.trim().toLowerCase();
            const globalQuery = (globalSearch || "").trim().toLowerCase();

            const matchesQuery = (q: string) => {
              if (!q) return true;

              const folderMatches =
                folder.name.toLowerCase().includes(q) ||
                (folder.description || "").toLowerCase().includes(q);

              const publisherMatches = assignedPubs.some(
                (p) =>
                  p.name.toLowerCase().includes(q) ||
                  p.department.toLowerCase().includes(q) ||
                  p.email.toLowerCase().includes(q) ||
                  p.location.toLowerCase().includes(q),
              );

              const subfolderMatches = folder.subfolders
                ? hasMatchingSubfolder(folder.subfolders, q)
                : false;

              return folderMatches || publisherMatches || subfolderMatches;
            };

            return matchesQuery(localQuery) && matchesQuery(globalQuery);
          })
          .map((folder) => {
            const Icon = folder.icon || Folder;
            const assignedPubs = publishers.filter((p) =>
              p.assignedFolders.includes(folder.name),
            );
            const isMulti = assignedPubs.length > 1;
            const totalSubfolders = countAllSubfolders(folder.subfolders);

            return (
              <div
                key={folder.id}
                className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all space-y-4"
              >
                {/* Card Header: Clickable to add/manage publishers */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div
                    className="flex items-start gap-3 min-w-0 cursor-pointer group"
                    onClick={() => onSelectFolderForPublishers(folder)}
                    title="Click to add or manage publishers for this folder"
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-primary">
                          0{folder.number}.
                        </span>
                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {folder.name}
                        </h4>
                        {isMulti ? (
                          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9.5px] font-bold text-blue-700 dark:text-blue-400">
                            Multi-Publisher ({assignedPubs.length})
                          </span>
                        ) : assignedPubs.length === 1 ? (
                          <span className="rounded-full bg-primary/15 border border-primary/25 px-2 py-0.5 text-[9.5px] font-bold text-primary">
                            1 Publisher
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 text-[9.5px] font-bold text-amber-600">
                            ⚠️ Unassigned
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {folder.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectFolderForPublishers(folder)}
                      className="h-8 gap-1.5 text-xs font-semibold border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer shadow-2xs"
                      title="Add or configure publishers for this folder"
                    >
                      <Plus className="h-5 w-5 shrink-0" />
                      <span>Add / Manage Publishers</span>
                    </Button>
                  </div>
                </div>

                {/* Folder-Level Assigned Publishers */}
                <div className="space-y-1.5 pt-2 border-t border-border/70">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold uppercase tracking-wider text-muted-foreground">
                      Assigned Folder Publishers ({assignedPubs.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectFolderForPublishers(folder)}
                      className="text-primary hover:underline text-[11px] font-semibold cursor-pointer"
                    >
                      + Manage Access
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {assignedPubs.length > 0 ? (
                      assignedPubs.map((pub) => (
                        <span
                          key={pub.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50/80 border border-blue-200 px-2.5 py-1 text-xs text-slate-800 shadow-2xs group"
                        >
                          <span className="font-semibold text-slate-900">{pub.name}</span>
                          <span className="text-[11px] text-slate-600">
                            ({pub.department} · {pub.location})
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();

                              setRevokeConfirmation({
                                folderName: folder.name,
                                publisherId: pub.id,
                                publisherName: pub.name,
                              });
                            }}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded p-0.5 transition-colors cursor-pointer ml-0.5"
                            title={`Revoke ${pub.name} from this folder`}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md italic">
                        No publisher currently assigned to this folder. Click "+ Add /
                        Manage Publishers" to assign.
                      </span>
                    )}
                  </div>
                </div>

                {/* Subfolders Breakdown */}
                {folder.subfolders && folder.subfolders.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t border-border/70">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                      <span>
                        Subfolder Permissions Breakdown ({totalSubfolders}{" "}
                        {totalSubfolders === 1 ? "subfolder" : "subfolders"})
                      </span>
                      <span className="text-primary font-mono text-[10px]">
                        Granular Delegation
                      </span>
                    </div>

                    <div className="space-y-2">
                      {folder.subfolders
                        .filter((sf) => {
                          const lq = (folderModeSearch || "").trim().toLowerCase();
                          const gq = (globalSearch || "").trim().toLowerCase();

                          const matches = (query: string) => {
                            if (!query) return true;
                            if (sf.name.toLowerCase().includes(query)) return true;
                            if ((sf.code || sf.letter || "").toLowerCase().includes(query))
                              return true;
                            if ((sf.description || "").toLowerCase().includes(query))
                              return true;
                            const children =
                              sf.subfolders ||
                              (sf as any).children ||
                              (sf as any).sub_sub_folders ||
                              [];
                            return hasMatchingSubfolder(children, query);
                          };

                          return matches(lq) && matches(gq);
                        })
                        .map((sf, index) => (
                        <FolderModeSubfolderNode
                          key={
                            sf.sub_folder_id ??
                            sf.id ??
                            `${folder.name}:::${sf.name}`
                          }
                          subfolder={sf}
                          folder={folder}
                          parentPath={[]}
                          depth={0}
                          index={index}
                          publishers={publishers}
                          globalSearch={globalSearch}
                          folderModeSearch={folderModeSearch}
                          onSelectSubfolderForPublishers={
                            onSelectSubfolderForPublishers
                          }
                          isPublisherAssignedToSubfolder={
                            isPublisherAssignedToSubfolder
                          }
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted/30 p-2.5 text-[11px] text-muted-foreground border border-border/40">
                    ℹ️ This folder does not have subfolders. All documents in this
                    category are directly governed by the assigned folder publishers
                    above.
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {revokeConfirmation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setRevokeConfirmation(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="revoke-publisher-title"
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <ShieldAlert className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3
                  id="revoke-publisher-title"
                  className="text-base font-semibold text-foreground"
                >
                  Revoke Publisher Access?
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Are you sure you want to revoke access for{" "}
                  <span className="font-semibold text-foreground">
                    {revokeConfirmation.publisherName}
                  </span>{" "}
                  from{" "}
                  <span className="font-semibold text-foreground">
                    {revokeConfirmation.folderName}
                  </span>
                  ?
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  The publisher will lose their assigned access to this folder.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRevokeConfirmation(null)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={confirmRevokePublisher}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Revoke Access
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

