import React, { useState } from "react";
import {
  Calendar,
  ChevronDown,
  Folder,
  FolderTree,
  History,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
  FileText,
  Clock3,
  UserRound,
  Info,
} from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import type { DocumentRecord, FolderDefinition } from "../types";

export function TrashTab({
  deletedDocuments,
  folders,
  availableTrashYears,
  trashSearchQuery,
  setTrashSearchQuery,
  trashFilterYear,
  setTrashFilterYear,
  trashFilterFolder,
  setTrashFilterFolder,
  trashFilterSubfolder,
  setTrashFilterSubfolder,
  trashSortBy,
  setTrashSortBy,
  onEmptyTrashClick,
  onRestoreDocument,
  onPermanentDeleteClick,
  onRestoreAllDocuments,
  onShowDocInfo,
  totalDeletedCount,
  matchingFilterCount,
}: {
  deletedDocuments: DocumentRecord[];
  folders: FolderDefinition[];
  availableTrashYears: string[];
  trashSearchQuery: string;
  setTrashSearchQuery: (q: string) => void;
  trashFilterYear: string;
  setTrashFilterYear: (y: string) => void;
  trashFilterFolder: string;
  setTrashFilterFolder: (f: string) => void;
  trashFilterSubfolder: string;
  setTrashFilterSubfolder: (sf: string) => void;
  trashSortBy: "recently-deleted" | "oldest-deleted" | "title-asc" | "number-asc";
  setTrashSortBy: (s: "recently-deleted" | "oldest-deleted" | "title-asc" | "number-asc") => void;
  onEmptyTrashClick: () => void;
  onRestoreDocument: (id: string) => void;
  onPermanentDeleteClick: (doc: DocumentRecord) => void;
  onRestoreAllDocuments?: () => void;
  onShowDocInfo?: (doc: DocumentRecord) => void;
  totalDeletedCount?: number;
  matchingFilterCount?: number;
}) {
  type TrashAction =
    | { type: "restore"; documentId: string }
    | { type: "restoreAll" }
    | { type: "emptyTrash" };

  const [pendingTrashAction, setPendingTrashAction] =
    useState<TrashAction | null>(null);

  const confirmTrashAction = () => {
    if (!pendingTrashAction) return;

    switch (pendingTrashAction.type) {
      case "restore":
        onRestoreDocument(pendingTrashAction.documentId);
        break;

      case "restoreAll":
        onRestoreAllDocuments?.();
        break;

      case "emptyTrash":
        onEmptyTrashClick();
        break;
    }

    setPendingTrashAction(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-background/50 p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
      <div className="w-full space-y-6">
        {/* Trash Top Banner */}
        <div className="relative overflow-hidden rounded-xl border border-destructive/30 bg-gradient-to-br from-card via-card to-destructive/10 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive shadow-xs shrink-0">
                <Trash2 className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-destructive">
                    RECYCLE BIN & ARCHIVAL PURGE
                  </span>
                  <span className="inline-flex items-center rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                    Admin Only
                  </span>
                </div>
                <h2 className="text-base font-bold text-foreground mt-0.5">Trash Files</h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                  All files deleted by Administrators, Publishers, and Field Engineers are
                  held here safely. Only Administrators can restore documents back to active
                  circulation or permanently purge them.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              {deletedDocuments.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPendingTrashAction({ type: "restoreAll" })}
                    className="gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Restore All ({deletedDocuments.length})</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setPendingTrashAction({ type: "emptyTrash" })}
                    className="gap-1.5 text-xs cursor-pointer shadow-xs"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Empty Trash</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Quick stats pills */}
          <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">
                {totalDeletedCount ?? deletedDocuments.length}
              </span>
              <span>Total Deleted Files</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">
                {matchingFilterCount ?? deletedDocuments.length}
              </span>
              <span>Files Matching Filter</span>
            </div>
          </div>
        </div>

        {/* Dedicated Search & Filter Controls */}
        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 space-y-3 shadow-xs">
          <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
            {/* Dedicated Search Bar */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={trashSearchQuery}
                onChange={(e) => setTrashSearchQuery(e.target.value)}
                placeholder="Search deleted files only (ID, title, department, deleted by, etc.)…"
                className="dms-input h-9 w-full !pl-9 !pr-8 text-xs font-medium"
              />
              {trashSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTrashSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills Group */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <div
                  className="flex size-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground border border-border shrink-0 shadow-2xs"
                  title="Filter by Year"
                >
                  <Calendar className="size-3.5" />
                </div>
                <div className="relative">
                  <select
                    value={trashFilterYear}
                    onChange={(e) => setTrashFilterYear(e.target.value)}
                    className="dms-input h-9 min-w-[115px] !appearance-none !pl-2.5 !pr-8 text-xs font-medium cursor-pointer"
                  >
                    <option value="All">All Years</option>
                    {availableTrashYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Folder Filter */}
              <div className="flex items-center gap-2">
                <div
                  className="flex size-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground border border-border shrink-0 shadow-2xs"
                  title="Filter by Folder"
                >
                  <Folder className="size-3.5" />
                </div>
                <div className="relative">
                  <select
                    value={trashFilterFolder}
                    onChange={(e) => {
                      setTrashFilterFolder(e.target.value);
                      setTrashFilterSubfolder("All");
                    }}
                    className="dms-input h-9 min-w-[140px] max-w-[200px] !appearance-none !pl-2.5 !pr-8 truncate text-xs font-medium cursor-pointer"
                  >
                    <option value="All">All Folders</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Subfolder Filter */}
              {trashFilterFolder !== "All" && (
                <div className="flex items-center gap-2 animate-in fade-in duration-150">
                  <div
                    className="flex size-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground border border-border shrink-0 shadow-2xs"
                    title="Filter by Subfolder"
                  >
                    <FolderTree className="size-3.5" />
                  </div>
                  <div className="relative">
                    <select
                      value={trashFilterSubfolder}
                      onChange={(e) => setTrashFilterSubfolder(e.target.value)}
                      className="dms-input h-9 min-w-[140px] max-w-[200px] !appearance-none !pl-2.5 !pr-8 truncate text-xs font-medium cursor-pointer"
                    >
                      <option value="All">All Sub-folders</option>
                      {folders
                        .find((f) => f.name === trashFilterFolder)
                        ?.subfolders?.map((sf) => (
                          <option key={sf.letter} value={sf.name}>
                            {sf.name}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <div
                  className="flex size-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground border border-border shrink-0 shadow-2xs"
                  title="Sort by"
                >
                  <SlidersHorizontal className="size-3.5" />
                </div>
                <div className="relative">
                  <select
                    value={trashSortBy}
                    onChange={(e) =>
                      setTrashSortBy(
                        e.target.value as
                        "recently-deleted" | "oldest-deleted" | "title-asc" | "number-asc",
                      )
                    }
                    className="dms-input h-9 min-w-[160px] !appearance-none !pl-2.5 !pr-8 text-xs font-medium cursor-pointer"
                  >
                    <option value="recently-deleted">Recently Deleted</option>
                    <option value="oldest-deleted">Oldest Deleted</option>
                    <option value="title-asc">Document Title (A-Z)</option>
                    <option value="number-asc">Document Number (A-Z)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Reset Filters button */}
              {(trashSearchQuery ||
                trashFilterYear !== "All" ||
                trashFilterFolder !== "All" ||
                trashFilterSubfolder !== "All" ||
                trashSortBy !== "recently-deleted") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTrashSearchQuery("");
                      setTrashFilterYear("All");
                      setTrashFilterFolder("All");
                      setTrashFilterSubfolder("All");
                      setTrashSortBy("recently-deleted");
                    }}
                    className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset</span>
                  </Button>
                )}
            </div>
          </div>
        </div>

        {/* Deleted Files Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          {deletedDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="border-b border-border bg-muted/60 text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Document</th>
                    <th className="px-4 py-3">Original Location</th>
                    <th className="px-4 py-3">Dept & Location</th>
                    <th className="px-4 py-3">Deleted Date</th>
                    <th className="px-4 py-3">Deleted By</th>
                    <th className="px-4 py-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {deletedDocuments.map((doc) => {
                    const deletedDateFormatted = doc.deletedAt
                      ? new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                        .format(new Date(doc.deletedAt))
                        .replace(",", " ·")
                      : doc.updated;

                    return (
                      <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5 max-w-[280px]">
                          <div className="flex items-start gap-2.5">
                            <div className="flex size-7 items-center justify-center rounded-md bg-destructive/10 text-destructive shrink-0 mt-0.5">
                              <FileText className="size-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-mono text-[11px] font-bold text-destructive">
                                {doc.number}
                              </span>
                              <p className="truncate font-semibold text-foreground text-xs mt-0.5">
                                {doc.title}
                              </p>
                              <span className="text-[10px] text-muted-foreground">
                                {doc.revision} · {doc.type} · {doc.size}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <p className="font-medium text-foreground text-xs">
                              {doc.folder || "Unassigned Folder"}
                            </p>
                            {doc.subfolder && (
                              <p className="text-[11px] text-muted-foreground">
                                ↳ {doc.subfolder}{" "}
                                {doc.subSubfolder ? ` / ${doc.subSubfolder}` : ""}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                            {doc.department} · {doc.location}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock3 className="size-3 text-muted-foreground" />
                            <span>{deletedDateFormatted}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className="
                              inline-flex items-center gap-1.5
                              rounded-md
                              border border-slate-300
                              bg-slate-100
                              px-2.5 py-1
                              text-[11px] font-medium
                              text-slate-700
                              leading-none
                            "
                          >
                            <UserRound className="size-3.5 text-slate-500 shrink-0" />
                            <span>{doc.deletedBy || "System User"}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                onShowDocInfo && onShowDocInfo(doc);
                              }}
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Show Document Information"
                            >
                              <Info className="size-3" />
                              <span className="hidden lg:inline">Info</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setPendingTrashAction({
                                  type: "restore",
                                  documentId: doc.id,
                                })
                              }
                              className="h-7 px-2.5 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer shadow-xs gap-1"
                              title="Restore file back to its folder"
                            >
                              <RotateCcw className="size-3" />
                              <span>Restore</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onPermanentDeleteClick(doc)}
                              className="h-7 px-2.5 text-xs cursor-pointer shadow-xs gap-1"
                              title="Permanently delete from database"
                            >
                              <Trash2 className="size-3" />
                              <span>Delete Forever</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-muted/40 text-muted-foreground mb-3">
                <Trash2 className="size-7 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {trashSearchQuery ||
                  trashFilterYear !== "All" ||
                  trashFilterFolder !== "All"
                  ? "No deleted files match your filters"
                  : "Trash is Empty"}
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                {trashSearchQuery ||
                  trashFilterYear !== "All" ||
                  trashFilterFolder !== "All"
                  ? "Try clearing or changing your search criteria or filter selections above."
                  : "No documents have been moved to the recycle bin. Deleted files from administrators, publishers, or engineers will appear here for recovery."}
              </p>
              {(trashSearchQuery ||
                trashFilterYear !== "All" ||
                trashFilterFolder !== "All") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTrashSearchQuery("");
                      setTrashFilterYear("All");
                      setTrashFilterFolder("All");
                      setTrashFilterSubfolder("All");
                    }}
                    className="mt-4 text-xs cursor-pointer"
                  >
                    Clear all filters
                  </Button>
                )}
            </div>
          )}
        </div>
      </div>

      {pendingTrashAction && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent p-4 pointer-events-none">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trash-confirm-title"
            className="pointer-events-auto w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                  pendingTrashAction.type === "emptyTrash"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-emerald-500/10 text-emerald-600"
                }`}
              >
                {pendingTrashAction.type === "emptyTrash" ? (
                  <Trash2 className="size-5" />
                ) : (
                  <RotateCcw className="size-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  id="trash-confirm-title"
                  className="text-sm font-semibold text-foreground"
                >
                  {pendingTrashAction.type === "restore"
                    ? "Restore Document?"
                    : pendingTrashAction.type === "restoreAll"
                      ? "Restore All Documents?"
                      : "Empty Trash?"}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pendingTrashAction.type === "restore"
                    ? "Are you sure you want to restore this document?"
                    : pendingTrashAction.type === "restoreAll"
                      ? `Are you sure you want to restore all ${deletedDocuments.length} documents?`
                      : `Are you sure you want to permanently delete all ${deletedDocuments.length} documents? This action cannot be undone.`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingTrashAction(null)}
                className="h-9 px-4"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant={
                  pendingTrashAction.type === "emptyTrash"
                    ? "destructive"
                    : "default"
                }
                onClick={confirmTrashAction}
                className="h-9 px-4"
              >
                {pendingTrashAction.type === "restore"
                  ? "Confirm Restore"
                  : pendingTrashAction.type === "restoreAll"
                    ? "Restore All"
                    : "Empty Trash"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
