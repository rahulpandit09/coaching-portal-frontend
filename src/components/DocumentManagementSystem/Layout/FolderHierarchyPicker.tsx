import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Search,
  X,
} from "lucide-react";

type FolderNode = {
  id?: number | string;
  name?: string;

  folder_id?: number;
  folder_name?: string;

  sub_folder_id?: number;
  sub_folder_name?: string;
  parent_sub_folder_id?: number | null;

  children?: FolderNode[];
  subfolders?: FolderNode[];
  sub_folders?: FolderNode[];
  sub_sub_folders?: FolderNode[];

  is_deleted?: boolean;
  status?: string;
};

export type DmsDestination = {
  folderId: number;
  targetFolderId: number | null;
  label: string;
  path: string;
};

interface FolderHierarchyPickerProps {
  folders: FolderNode[];
  value: string;
  onChange: (destination: DmsDestination) => void;
  disabled?: boolean;
}

type TreeNode = {
  key: string;
  id: number;
  name: string;
  folderId: number;
  targetFolderId: number | null;
  path: string;
  children: TreeNode[];
};

const getChildren = (node: FolderNode): FolderNode[] => {
  const children =
    node.children?.length
      ? node.children
      : node.sub_folders?.length
        ? node.sub_folders
        : node.subfolders?.length
          ? node.subfolders
          : node.sub_sub_folders ?? [];

  const uniqueChildren = new Map<number | string, FolderNode>();

  children.forEach((child) => {
    if (child.is_deleted) return;

    const id = child.sub_folder_id ?? child.folder_id ?? child.id;

    if (id !== undefined && id !== null) {
      uniqueChildren.set(id, child);
    }
  });

  return Array.from(uniqueChildren.values());
};

const buildTree = (folders: FolderNode[]): TreeNode[] => {
  const visitSubfolders = (
    nodes: FolderNode[],
    rootFolderId: number,
    parentPath: string
  ): TreeNode[] => {
    return nodes.flatMap((node) => {
      const rawId = node.sub_folder_id ?? node.id;

      const id = Number(rawId);

      if (!Number.isInteger(id) || id <= 0) {
        return [];
      }

      const name = node.sub_folder_name ?? node.name ?? "";

      const path = `${parentPath} / ${name}`;

      return [
        {
          key: `subfolder:${rootFolderId}:${id}`,
          id,
          name,
          folderId: rootFolderId,
          targetFolderId: id,
          path,
          children: visitSubfolders(
            getChildren(node),
            rootFolderId,
            path
          ),
        },
      ];
    });
  };

  return folders.flatMap((folder) => {
    const folderId = Number(folder.folder_id ?? folder.id);

    if (!Number.isInteger(folderId) || folderId <= 0) {
      return [];
    }

    const folderName = folder.folder_name ?? folder.name ?? "";

    return [
      {
        key: `folder:${folderId}`,
        id: folderId,
        name: folderName,
        folderId,
        targetFolderId: null,
        path: folderName,
        children: visitSubfolders(
          getChildren(folder),
          folderId,
          folderName
        ),
      },
    ];
  });
};

export default function FolderHierarchyPicker({
  folders,
  value,
  onChange,
  disabled = false,
}: FolderHierarchyPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [draftValue, setDraftValue] = useState(value);

  const tree = useMemo(() => buildTree(folders), [folders]);

  const findNode = (
    nodes: TreeNode[],
    key: string
  ): TreeNode | undefined => {
    for (const node of nodes) {
      if (
        node.key === key ||
        (node.targetFolderId !== null &&
          (key === `subfolder:${node.targetFolderId}` ||
            key === `subfolder:${node.folderId}:${node.targetFolderId}`)) ||
        (node.targetFolderId === null && key === `folder:${node.folderId}`)
      ) {
        return node;
      }

      const found = findNode(node.children, key);
      if (found) return found;
    }

    return undefined;
  };

  const selectedNode = findNode(tree, value);
  const draftNode = findNode(tree, draftValue);

  const toggleExpanded = (key: string) => {
    setExpanded((previous) => {
      const next = new Set(previous);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const matchingTree = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tree;

    const filterNodes = (nodes: TreeNode[]): TreeNode[] =>
      nodes.reduce<TreeNode[]>((result, node) => {
        const matches =
          node.name.toLowerCase().includes(query) ||
          node.path.toLowerCase().includes(query);

        const children = matches
          ? node.children
          : filterNodes(node.children);

        if (matches || children.length > 0) {
          result.push({
            ...node,
            children,
          });
        }

        return result;
      }, []);

    return filterNodes(tree);
  }, [tree, search]);

  const selectDestination = () => {
    if (!draftNode) return;

    onChange({
      folderId: draftNode.folderId,
      targetFolderId: draftNode.targetFolderId,
      label: draftNode.name,
      path: draftNode.path,
    });

    setIsOpen(false);
    setSearch("");
  };

  const renderNodes = (
    nodes: TreeNode[],
    depth = 0
  ): React.ReactNode =>
    nodes.map((node) => {
      const isExpanded =
        search.trim().length > 0 || expanded.has(node.key);

      const isSelected = draftValue === node.key || draftNode?.key === node.key;
      const hasChildren = node.children.length > 0;

      return (
        <div key={node.key}>
          <div
            className={`group flex min-w-0 items-center gap-1 rounded-lg border px-2 py-1.5 transition-colors ${
              isSelected
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-transparent hover:bg-muted/70"
            }`}
            style={{ paddingLeft: `${8 + depth * 18}px` }}
          >
            <button
              type="button"
              aria-label={
                isExpanded ? "Collapse folder" : "Expand folder"
              }
              onClick={() => toggleExpanded(node.key)}
              disabled={!hasChildren}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-background ${
                !hasChildren ? "invisible" : "text-muted-foreground"
              }`}
            >
              {isExpanded ? (
                <ChevronDown size={15} />
              ) : (
                <ChevronRight size={15} />
              )}
            </button>

            <button
              type="button"
              onClick={() => setDraftValue(node.key)}
              className="flex min-w-0 flex-1 items-center gap-2 text-left text-xs"
            >
              {isExpanded ? (
                <FolderOpen
                  size={16}
                  className="shrink-0 text-amber-600"
                />
              ) : (
                <Folder
                  size={16}
                  className="shrink-0 text-amber-600"
                />
              )}

              <span
                className="min-w-0 flex-1 truncate text-sm"
                title={node.name}
              >
                {node.name}
              </span>

              {isSelected && (
                <Check
                  size={15}
                  className="shrink-0 text-primary"
                />
              )}
            </button>
          </div>

          {hasChildren && isExpanded && (
            <div>{renderNodes(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });

  return (
    <div className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setDraftValue(selectedNode?.key ?? value);
          setSearch("");
          setIsOpen(true);
        }}
        className="group flex w-full min-h-[64px] flex-row flex-nowrap items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-3 text-left transition-colors hover:border-primary/50 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {/* Folder icon */}
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {selectedNode ? (
            <FolderOpen size={20} className="text-primary" />
          ) : (
            <Folder size={20} className="text-primary" />
          )}
        </span>

        {/* Destination text */}
        <span className="min-w-0 flex-1 overflow-hidden">
          <span
            className="block truncate text-sm font-medium text-muted-foreground"
            title={selectedNode?.name}
          >
            {disabled
              ? "Loading folder assignments..."
              : selectedNode?.name ?? "Select a destination folder..."}
          </span>

          <span
            className="mt-1 block truncate text-xs text-muted-foreground"
            title={selectedNode?.path}
          >
            {selectedNode?.path ?? "Browse folders and nested subfolders"}
          </span>
        </span>

        {/* Right-aligned chevron */}
        <span className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center">
          <ChevronDown
            size={18}
            className="text-muted-foreground transition-colors group-hover:text-primary"
          />
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Select destination folder"
            className="flex h-[min(82vh,720px)] w-full max-w-3xl flex-col
              overflow-hidden rounded-2xl border border-border
              bg-background shadow-2xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FolderOpen size={19} className="text-primary" />
                  </span>

                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Select destination
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Browse and select a folder or any nested subfolder.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSearch("");
                }}
                className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close folder selector"
              >
                <X size={19} />
              </button>
            </div>

            <div className="shrink-0 border-b border-border bg-muted/20 p-4">
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search folders and subfolders..."
                  aria-label="Search folders and subfolders"
                  className="h-11 w-full rounded-xl border border-border bg-background pl-11 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <p className="mt-2 text-[11px] text-muted-foreground">
                Search by folder name or full folder path.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {matchingTree.length > 0 ? (
                renderNodes(matchingTree)
              ) : (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  No matching folders found.
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-border bg-muted/20 p-4">
              <div className="mb-4 rounded-xl border border-border bg-background p-3">
                <div className="flex items-start gap-2.5">
                  <FolderOpen
                    size={18}
                    className="mt-0.5 shrink-0 text-primary"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">
                      Selected destination
                    </p>

                    {draftNode ? (
                      <>
                        <p className="mt-1 break-words text-sm font-medium text-primary">
                          {draftNode.name}
                        </p>

                        <p
                          className="mt-1 break-words text-xs leading-relaxed text-muted-foreground"
                          title={draftNode.path}
                        >
                          {draftNode.path}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Select a folder or nested subfolder to continue.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!draftNode}
                  onClick={selectDestination}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={16} />
                  Select destination
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
