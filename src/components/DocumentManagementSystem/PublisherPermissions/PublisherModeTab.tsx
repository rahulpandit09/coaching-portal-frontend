import React, { useState } from "react";
import {
  Folder,
  Mail,
  MapPin,
  Edit3,
  Pencil,
  Plus,
  Search,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import type { FolderDefinition, Publisher } from "../types";

type AssignedFolderNode = {
  name: string;
  children: AssignedFolderNode[];
};

function buildAssignedFolderTree(
  assignedFolders: (string | number)[],
  assignedSubfolders: (string | number)[],
): AssignedFolderNode[] {
  const roots: AssignedFolderNode[] = [];
  const nodeMap = new Map<string, AssignedFolderNode>();

  const normalizePath = (value: string | number): string[] =>
    String(value)
      .split(":::")
      .map((part) => part.trim())
      .filter(Boolean);

  const getOrCreate = (
    name: string,
    parentPath: string,
    siblings: AssignedFolderNode[],
  ): AssignedFolderNode => {
    const key = parentPath ? `${parentPath}:::${name}` : name;

    let node = nodeMap.get(key);

    if (!node) {
      node = {
        name,
        children: [],
      };

      nodeMap.set(key, node);
      siblings.push(node);
    }

    return node;
  };

  // Create unique root folders.
  const uniqueFolders = new Set(
    assignedFolders
      .map((folder) => String(folder).trim())
      .filter(Boolean),
  );

  uniqueFolders.forEach((folderName) => {
    getOrCreate(folderName, "", roots);
  });

  // Normalize and deduplicate complete subfolder paths.
  const uniquePaths = new Set(
    assignedSubfolders
      .map((subfolder) => normalizePath(subfolder).join(":::"))
      .filter(Boolean),
  );

  uniquePaths.forEach((path) => {
    const parts = normalizePath(path);

    if (parts.length < 2) {
      // A subfolder must include its root folder.
      return;
    }

    const rootFolderName = parts[0];

    // Do not display a subfolder under a root folder
    // that is not assigned to this publisher.
    if (!uniqueFolders.has(rootFolderName)) {
      return;
    }

    let currentChildren = roots;
    let parentPath = "";

    parts.forEach((part) => {
      const node = getOrCreate(part, parentPath, currentChildren);

      parentPath = parentPath
        ? `${parentPath}:::${part}`
        : part;

      currentChildren = node.children;
    });
  });

  return roots;
}

function AssignedFolderTree({
  nodes,
  depth = 0,
}: {
  nodes: AssignedFolderNode[];
  depth?: number;
}) {
  return (
    <div className="space-y-1">
      {nodes.map((node, index) => {
        const hasChildren = node.children.length > 0;

        return (
          <div
            key={`${depth}-${node.name}-${index}`}
            className="relative"
          >
            {/* Folder row */}
            <div
              className="relative flex min-h-8 items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              style={{ paddingLeft: `${8 + depth * 20}px` }}
            >
              <Folder
                className={`h-4 w-4 shrink-0 ${
                  depth === 0 ? "text-primary" : "text-slate-500"
                }`}
              />

              <span className="min-w-0 break-words">
                {node.name}
              </span>
            </div>

            {/* Nested children */}
            {hasChildren && (
              <div className="relative">
                {/* Vertical line aligned with the child indentation */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-4 top-0 w-px bg-slate-300"
                  style={{ left: `${17 + depth * 20}px` }}
                />

                <AssignedFolderTree
                  nodes={node.children}
                  depth={depth + 1}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PublisherModeTab({
  publishers,
  folders,
  globalSearch,
  publisherSearch,
  onPublisherSearchChange,
  publisherFolderFilter,
  onPublisherFolderFilterChange,
  onCreatePublisher,
  onEditPublisher,
  onDeletePublisher,
  onManageFolderPublishers,
}: {
  publishers: Publisher[];
  folders: FolderDefinition[];
  globalSearch?: string;
  publisherSearch: string;
  onPublisherSearchChange: (val: string) => void;
  publisherFolderFilter: string;
  onPublisherFolderFilterChange: (val: string) => void;
  onCreatePublisher: () => void;
  onEditPublisher: (pub: Publisher) => void;
  onDeletePublisher: (id: string) => void;
  onManageFolderPublishers: (folder: FolderDefinition) => void;
}) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedPublisherId, setSelectedPublisherId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>Active Publishers Directory</span>
            <span className="rounded-full bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5">
              {publishers.length} Active
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Individual publishers and their folder/subfolder management delegations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              value={publisherSearch}
              onChange={(e) => onPublisherSearchChange(e.target.value)}
              placeholder="Search publisher by name, dept…"
              className="dms-input h-8 w-full !pl-9 pr-3 text-xs"
            />
          </div>
          <div className="relative w-full sm:w-56">
            <select
              value={publisherFolderFilter}
              onChange={(e) => onPublisherFolderFilterChange(e.target.value)}
              className="dms-input h-8 w-full text-xs appearance-none pl-2.5 pr-8 cursor-pointer"
            >
              <option value="All">All Folders</option>

              {Array.from(
                new Map(
                  folders.map((folder) => [
                    String(
                      folder.folder_id ??
                      folder.id ??
                      folder.name
                    ),
                    folder,
                  ]),
                ).values(),
              ).map((folder) => {
                const folderId = String(
                  folder.folder_id ??
                  folder.id ??
                  folder.name
                );

                return (
                  <option
                    key={folderId}
                    value={folder.name}
                  >
                    {folder.name}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {publishers
          .filter((p) => {
            const localQuery = publisherSearch.trim().toLowerCase();
            const globalQuery = (globalSearch || "").trim().toLowerCase();

            const matchesSearch = (query: string) =>
              !query ||
              [
                p.name,
                p.email,
                p.department,
                p.location,
                p.status,
                ...(p.assignedFolders || []),
                ...(p.assignedSubfolders || []),
              ].some((value) =>
                String(value ?? "").toLowerCase().includes(query),
              );

            if (!matchesSearch(localQuery) || !matchesSearch(globalQuery)) {
              return false;
            }

            if (
              publisherFolderFilter !== "All" &&
              !p.assignedFolders.includes(publisherFolderFilter)
            ) {
              return false;
            }

            return true;
          })
          .map((pub) => (
            <div
              key={pub.id}
              className="rounded-xl border border-border bg-card p-4 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold uppercase text-primary">
                    {(pub.name || "User")
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-xs text-foreground truncate">
                        {pub.name}
                      </p>
                      <span className="rounded bg-primary/15 border border-primary/25 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                        Publisher
                      </span>
                      <span className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${
                        pub.status === "ACTIVE" || !pub.status
                          ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-700 dark:text-emerald-400"
                          : "bg-slate-500/15 border-slate-500/25 text-slate-700 dark:text-slate-400"
                      }`}>
                        {pub.status === "ACTIVE" || !pub.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {pub.email}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                      {pub.department} · Station {pub.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 gap-1 text-xs"
                    onClick={() => onEditPublisher(pub)}
                  >
                    <Pencil className="h-5 w-5 shrink-0" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setSelectedPublisherId(pub.id);
                      setShowDeleteConfirmation(true);
                    }}
                    aria-label="Delete publisher"
                  >
                    <Trash2 className="h-5 w-5 shrink-0" />
                  </Button>
                </div>
              </div>

              {/* Assigned folders and nested subfolders */}
              <div className="space-y-2 pt-3 border-t border-border">
                {(() => {
                  const folderTree = buildAssignedFolderTree(
                    pub.assignedFolders ?? [],
                    pub.assignedSubfolders ?? [],
                  );

                  const countNodes = (
                    nodes: AssignedFolderNode[],
                  ): number =>
                    nodes.reduce(
                      (total, node) =>
                        total + 1 + countNodes(node.children),
                      0,
                    );

                  return (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Assigned Folders & Subfolders (
                        {countNodes(folderTree)})
                      </p>

                      {folderTree.length > 0 ? (
                        <div className="rounded-lg border border-border/70 bg-white p-2">
                          <AssignedFolderTree nodes={folderTree} />
                        </div>
                      ) : (
                        <p className="px-2 py-3 text-xs text-muted-foreground">
                          No folders assigned.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
      </div>

      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-white p-5 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>

              <h3 className="text-sm font-semibold text-gray-900">
                Delete Publisher
              </h3>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-gray-600">
              Are you sure you want to delete this publisher? This action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setSelectedPublisherId(null);
                }}
              >
                Cancel
              </Button>

              <Button
                type="button"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  if (selectedPublisherId) {
                    onDeletePublisher(selectedPublisherId);
                  }

                  setShowDeleteConfirmation(false);
                  setSelectedPublisherId(null);
                }}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
