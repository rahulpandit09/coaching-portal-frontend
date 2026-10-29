import React, { useState } from "react";
import { Check, Folder, Plus, Search, ShieldCheck, UsersRound, X } from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import { Modal } from "../Common/Modal";
import type { FolderDefinition, Publisher } from "../types";

export function ManageFolderPublishersModal({
  folder,
  publishers,
  onClose,
  onSave,
  onCreateNewPublisher,
}: {
  folder: FolderDefinition;
  publishers: Publisher[];
  onClose: () => void;
  onSave: (
    assignments: Record<string, { hasFolderAccess: boolean; assignedSubfolders: string[] }>,
  ) => void;
  onCreateNewPublisher: () => void;
}) {
  const [assignments, setAssignments] = useState<
    Record<string, { hasFolderAccess: boolean; assignedSubfolders: string[] }>
  >(() => {
    const initial: Record<string, { hasFolderAccess: boolean; assignedSubfolders: string[] }> = {};
    publishers.forEach((p) => {
      const hasFolder = p.assignedFolders.includes(folder.name);
      const subs: string[] = [];
      folder.subfolders?.forEach((sf) => {
        if (
          p.assignedSubfolders?.includes(sf.name) ||
          p.assignedSubfolders?.includes(`${folder.name}:::${sf.name}`)
        ) {
          subs.push(sf.name);
        }
      });
      initial[p.id] = {
        hasFolderAccess: hasFolder,
        assignedSubfolders: subs,
      };
    });
    return initial;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "assigned" | "unassigned">("all");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [expandedPublishers, setExpandedPublishers] = useState<string[]>([]);

  const togglePublisherExpansion = (publisherId: string) => {
    setExpandedPublishers((prev) =>
      prev.includes(publisherId)
        ? prev.filter((id) => id !== publisherId)
        : [...prev, publisherId]
    );
  };

  const toggleFolderAccess = (pubId: string) => {
    setAssignments((prev) => {
      const current = prev[pubId] || { hasFolderAccess: false, assignedSubfolders: [] };
      const nextHasAccess = !current.hasFolderAccess;
      let nextSubs = current.assignedSubfolders;
      if (
        nextHasAccess &&
        nextSubs.length === 0 &&
        folder.subfolders &&
        folder.subfolders.length > 0
      ) {
        nextSubs = folder.subfolders.map((sf) => sf.name);
      }
      return {
        ...prev,
        [pubId]: {
          hasFolderAccess: nextHasAccess,
          assignedSubfolders: nextHasAccess ? nextSubs : [],
        },
      };
    });
  };

  const toggleSubfolder = (pubId: string, subfolderName: string) => {
    setAssignments((prev) => {
      const current = prev[pubId] || { hasFolderAccess: true, assignedSubfolders: [] };
      const exists = current.assignedSubfolders.includes(subfolderName);
      const nextSubs = exists
        ? current.assignedSubfolders.filter((s) => s !== subfolderName)
        : [...current.assignedSubfolders, subfolderName];
      return {
        ...prev,
        [pubId]: {
          hasFolderAccess: true,
          assignedSubfolders: nextSubs,
        },
      };
    });
  };

  const selectAllSubfolders = (pubId: string) => {
    if (!folder.subfolders) return;
    setAssignments((prev) => ({
      ...prev,
      [pubId]: {
        hasFolderAccess: true,
        assignedSubfolders: folder.subfolders?.map((sf) => sf.name) || [],
      },
    }));
  };

  const clearSubfolders = (pubId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [pubId]: {
        hasFolderAccess: prev[pubId]?.hasFolderAccess ?? true,
        assignedSubfolders: [],
      },
    }));
  };

  const handleSelectAllPublishers = () => {
    setAssignments((prev) => {
      const next = { ...prev };
      publishers.forEach((p) => {
        next[p.id] = {
          hasFolderAccess: true,
          assignedSubfolders: folder.subfolders?.map((sf) => sf.name) || [],
        };
      });
      return next;
    });
  };

  const handleClearAllPublishers = () => {
    setAssignments((prev) => {
      const next = { ...prev };
      publishers.forEach((p) => {
        next[p.id] = {
          hasFolderAccess: false,
          assignedSubfolders: [],
        };
      });
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmation(false);
    onSave(assignments);
  };

  const Icon = folder.icon || Folder;
  const totalAssigned = Object.values(assignments).filter((a) => a.hasFolderAccess).length;

  const filteredPublishers = publishers.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    const hasAccess = assignments[p.id]?.hasFolderAccess;
    if (filterMode === "assigned" && !hasAccess) return false;
    if (filterMode === "unassigned" && hasAccess) return false;

    return true;
  });

  return (
    <>
      <Modal
      title={`Folder Permissions · 0${folder.number}. ${folder.name}`}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Folder Summary */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                {folder.name}
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Manage publishers who can access this folder and its subfolders.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-muted px-2.5 py-1 text-xs">
                  Total: {publishers.length}
                </span>

                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
                  Assigned: {totalAssigned}
                </span>

                <span className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  Not Assigned: {publishers.length - totalAssigned}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search publishers by name, email, or department..."
              className="dms-input h-10 w-full !pl-9 !pr-3 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
              {(
                [
                  { key: "all", label: `All (${publishers.length})` },
                  { key: "assigned", label: `Assigned (${totalAssigned})` },
                  {
                    key: "unassigned",
                    label: `Not Assigned (${publishers.length - totalAssigned})`,
                  },
                ] as const
              ).map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setFilterMode(m.key)}
                  className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                    filterMode === m.key
                      ? "bg-background font-semibold text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={handleSelectAllPublishers}
                className="font-medium text-primary hover:underline"
              >
                Assign All
              </button>

              <button
                type="button"
                onClick={handleClearAllPublishers}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Publishers List */}
        <div className="min-h-0 max-h-[45vh] space-y-2 overflow-y-auto overscroll-contain pr-2">
          {filteredPublishers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
              No publishers match your search.
            </div>
          ) : (
            filteredPublishers.map((pub) => {
              const pubAssign = assignments[pub.id] || {
                hasFolderAccess: false,
                assignedSubfolders: [],
              };
              const hasAccess = pubAssign.hasFolderAccess;
              const assignedSubsCount = pubAssign.assignedSubfolders.length;
              const totalSubsCount = folder.subfolders?.length || 0;

              return (
                <div
                  key={pub.id}
                  className={`rounded-lg border p-3 transition-colors ${
                    hasAccess
                      ? "border-border bg-card"
                      : "border-border bg-muted/20"
                  }`}
                >
                  {/* Publisher Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0 border border-primary/20">
                        {pub.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-xs text-foreground truncate">{pub.name}</p>
                          <span className="text-[10.5px] text-muted-foreground">
                            {pub.department} · Station {pub.location}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{pub.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleFolderAccess(pub.id)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                          hasAccess
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        {hasAccess ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Access Granted</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            <span>Grant Access</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Subfolder Permissions */}
                  {hasAccess && folder.subfolders && folder.subfolders.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3">
                      <button
                        type="button"
                        onClick={() => togglePublisherExpansion(pub.id)}
                        className="flex w-full items-center justify-between gap-3 rounded-md py-1 text-left hover:bg-muted/40"
                      >
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            Subfolder Permissions
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {assignedSubsCount} of {totalSubsCount} subfolders selected
                          </p>
                        </div>

                        <span className="shrink-0 text-xs font-medium text-primary">
                          {expandedPublishers.includes(pub.id) ? "Hide ▲" : "Configure ▼"}
                        </span>
                      </button>

                      {expandedPublishers.includes(pub.id) && (
                        <div className="mt-3 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">
                              Select the subfolders this publisher can access.
                            </span>

                            <div className="flex shrink-0 gap-3">
                              <button
                                type="button"
                                onClick={() => selectAllSubfolders(pub.id)}
                                className="text-xs font-medium text-primary hover:underline"
                              >
                                Select All
                              </button>

                              <button
                                type="button"
                                onClick={() => clearSubfolders(pub.id)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                Clear
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {folder.subfolders.map((sf) => {
                              const isSubChecked = pubAssign.assignedSubfolders.includes(sf.name);

                              return (
                                <label
                                  key={sf.name}
                                  className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 text-xs transition-colors ${
                                    isSubChecked
                                      ? "border-primary/30 bg-primary/5 text-foreground"
                                      : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSubChecked}
                                    onChange={() => toggleSubfolder(pub.id, sf.name)}
                                    className="size-4 shrink-0 accent-primary"
                                  />

                                  <span className="min-w-0 break-words">
                                    <span className="mr-1 font-medium">
                                      {sf.letter}.
                                    </span>
                                    {sf.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {hasAccess && (!folder.subfolders || folder.subfolders.length === 0) && (
                    <div className="rounded-lg bg-muted/30 p-2 text-[10.5px] text-muted-foreground">
                      ℹ️ This folder does not have subfolders. Granting access allows {pub.name} to
                      manage all documents in this category.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between gap-3 border-t border-border bg-background py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose();
              onCreateNewPublisher();
            }}
            className="text-xs text-primary hover:bg-primary/10 gap-1.5 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Publisher</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5 cursor-pointer shadow-xs">
              <Check className="h-5 w-5" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>
      </form>
      </Modal>

      {showConfirmation && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-background p-5 shadow-xl">
            <h3 className="text-base font-semibold text-foreground">
              Save Changes?
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Save the updated permissions for{" "}
              <span className="font-semibold text-foreground">
                {folder.name}
              </span>
              ?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>

              <Button type="button" onClick={handleConfirmSubmit}>
                <Check className="mr-1 h-4 w-4" />
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

