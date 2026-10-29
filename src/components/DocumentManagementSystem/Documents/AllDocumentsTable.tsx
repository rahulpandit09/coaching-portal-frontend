// DMS AllDocumentsTable Component
import React from "react";
import {
  ArrowDown,
  ArrowRightLeft,
  GripVertical,
  ArrowUp,
  ArrowUpDown,
  Clock3,
  Columns3,
  FileText,
  Filter,
  History,
  Lock,
  MoreHorizontal,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  View,
} from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import { DocumentCell } from "./DocumentCell";
import { StatusBadge } from "../Common/StatusBadge";
import type { DocumentRecord, Role, ViewMode, MainTab, FolderDefinition, DocStatus } from "../types";

export const formatDocumentStatus = (status: string): DocStatus => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'Active';
    case 'ARCHIVED':
      return 'Archived';
    case 'INACTIVE':
      return 'Inactive';
    case 'UNDER REVIEW':
      return 'Under Review';
    default:
      return (status || 'Unknown') as DocStatus;
  }
};

export function AllDocumentsTable({
  filteredDocuments,
  selectedId,
  folders,
  setShowVersions,
  setMoveDocTarget,
  visibleColumns,
  columns,
  sortField,
  sortOrder,
  onSort,
  selected,
  onSelect,
  viewMode,
  canMoveFiles,
  role,
  accessRequests,
  onOpenPreview,
  onShowVersions,
  authorizedFolders,
  activeMainTab,
  onUnarchive,
  onDocumentLeftClick,
  handleDocumentDragStart,
  handleDocumentClick,
  handleOpenFilePreview,
  query,
  setQuery,
  resetFilters,
  setActiveFolder,
  previewPane,
}: {
  filteredDocuments: DocumentRecord[];
  selectedId?: string | null;
  folders: any[];
  authorizedFolders: FolderDefinition[];
  activeMainTab: MainTab;
  setShowVersions?: (show: boolean) => void;
  setMoveDocTarget?: (target: any) => void;
  visibleColumns: string[];
  columns: string[];
  sortField: string | null;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
  selected: DocumentRecord | null;
  onSelect: (doc: DocumentRecord) => void;
  viewMode: ViewMode;
  canMoveFiles: boolean;
  role: Role;
  accessRequests: any[];
  onOpenPreview: (doc: DocumentRecord) => void;
  onShowVersions: (doc: DocumentRecord) => void;
  onUnarchive?: (id: string) => void;
  onDocumentLeftClick: (e: React.MouseEvent, doc: DocumentRecord) => void;
  handleDocumentDragStart: (e: React.DragEvent, doc: DocumentRecord) => void;
  handleDocumentClick: (doc: DocumentRecord, e?: React.MouseEvent) => void;
  handleOpenFilePreview: (doc: DocumentRecord) => void;
  query: string;
  setQuery: (q: string) => void;
  resetFilters: () => void;
  setActiveFolder: (f: string) => void;
  previewPane?: React.ReactNode;
}) {

  const visibleDocuments =
    activeMainTab === "archive"
      ? filteredDocuments.filter(
        (document) =>
          String(document.status ?? "").toUpperCase() === "ARCHIVED"
      )
      : filteredDocuments.filter((document) => {
        const status = String(document.status ?? "").toUpperCase();

        return status !== "ARCHIVED" && status !== "INACTIVE";
      });

  return (
    <div className="relative min-h-0 flex-1 flex flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-auto" data-view={viewMode}>
        {/* 1. DETAILS VIEW (Full customizable table with working visible columns and unarchive button) */}
        {viewMode === "Details" && (
          <table className="w-full min-w-[960px] border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600 select-none">
              <tr>
                {visibleColumns.map((column) => {
                  const isActive = sortField === column;
                  return (
                    <th
                      key={column}
                      onClick={() => {
                        onSort(column);
                      }}
                      className={`border-b border-r border-slate-200 px-4 py-3 font-semibold whitespace-nowrap cursor-pointer transition-colors select-none group ${isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      title={
                        isActive
                          ? sortOrder === "asc"
                            ? `Sorted by ${column} (Ascending) — Click for Descending`
                            : `Sorted by ${column} (Descending) — Click to reset to default`
                          : `Sort by ${column}`
                      }
                    >
                      <div className="flex items-center gap-1">
                        <span>{column}</span>
                        {isActive ? (
                          sortOrder === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5 shrink-0 text-blue-800 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 shrink-0 text-blue-800 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors" />
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="px-4 py-2.5 font-normal text-right w-16 whitespace-nowrap text-gray-600 bg-blue-200">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleDocuments.map((document) => (
                <tr
                  key={document.id}
                  draggable={canMoveFiles}
                  onDragStart={(e) => handleDocumentDragStart(e, document)}
                  onClick={() => onSelect(document)}
                  className={`dms-row cursor-pointer transition-colors ${selectedId === document.id ? "bg-blue-50/80 font-medium" : "hover:bg-slate-50/80"} ${canMoveFiles ? "cursor-grab active:cursor-grabbing" : ""}`}
                >
                  {visibleColumns.map((col) => (
                    <DocumentCell
                      key={col}
                      column={col}
                      document={document}
                      onUnarchive={onUnarchive}
                      onShowVersions={(doc) => {
                        onSelect(doc);
                        setShowVersions && setShowVersions(true);
                      }}
                      onOpenPreview={handleDocumentClick}
                      isUserRole={role === "User"}
                      userAccess={{ hasAccess: !!document.hasAccess, isPending: document.accessStatus === "PENDING_REQUEST" }}
                      canMoveFiles={canMoveFiles}
                    />
                  ))}
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDocumentLeftClick(e, document);
                      }}
                      title="File Options"
                      className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary cursor-pointer shrink-0"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 2. LIST VIEW (Minimal info, compact rows with unarchive button) */}
        {viewMode === "List" && (
          <div className="flex flex-col gap-2 p-4">
            {visibleDocuments.map((document) => {
              const isSelected = selectedId === document.id;
              const access = { hasAccess: !!document.hasAccess, isPending: document.accessStatus === "PENDING_REQUEST" };
              return (
                <div
                  key={document.id}
                  draggable={canMoveFiles}
                  onDragStart={(e) => handleDocumentDragStart(e, document)}
                  onClick={() => onSelect(document)}
                  className={`group flex min-h-[64px] min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-all duration-200 cursor-pointer ${canMoveFiles ? "cursor-grab active:cursor-grabbing" : ""
                    } ${isSelected
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                      : "border-border/70 bg-card hover:border-primary/30 hover:bg-accent/30"
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {canMoveFiles && (
                      <span
                        title="Drag to move file"
                        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0"
                      >
                        <GripVertical className="size-3.5" />
                      </span>
                    )}
                    <div className="flex size-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDocumentClick(document, e);
                          }}
                          className="font-mono text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                          title="Click to open preview"
                        >
                          {document.number}
                        </span>
                        {document.isConfidential && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 text-[9px] font-bold text-amber-600">
                            <Lock className="size-2.5" />
                          </span>
                        )}
                        {role === "User" &&
                          (access.hasAccess ? (
                            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
                              <ShieldCheck className="size-2.5" /> Permitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 dark:text-amber-400">
                              <Lock className="size-2.5" /> Request Access
                            </span>
                          ))}
                      </div>
                      <p
                        className="truncate text-xs font-medium text-foreground"
                        title={
                          document.title ||
                          (document as any).document_title ||
                          document.fileName ||
                          (document as any).file_name ||
                          "Untitled Document"
                        }
                      >
                        {document.title ||
                          (document as any).document_title ||
                          document.fileName ||
                          (document as any).file_name ||
                          "Untitled Document"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    <span className="hidden sm:inline-block rounded bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {document.department} · {document.location}
                    </span>
                    <span className="hidden md:inline-block font-mono text-[10px] text-muted-foreground">
                      {document.revision}
                    </span>
                    {String(document.status ?? "").toUpperCase() === "ARCHIVED" && (
                      <StatusBadge status={formatDocumentStatus(document.status)} />
                    )}
                    {canMoveFiles && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMoveDocTarget && setMoveDocTarget({
                            document,
                            targetFolder: document.folder || authorizedFolders[0]?.name || "",
                            targetSubfolder: document.subfolder || "",
                          });
                        }}
                        title="Move document to another folder or sub-folder"
                        className="inline-flex items-center gap-1 rounded border border-border/70 hover:border-primary/40 bg-card hover:bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer shadow-xs"
                      >
                        <ArrowRightLeft className="size-2.5" /> Move
                      </button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDocumentLeftClick(e, document);
                      }}
                      title="File Options"
                      className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary cursor-pointer shrink-0"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. TILES VIEW (Minimal info card tiles with unarchive button) */}
        {viewMode === "Tiles" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 items-stretch">
            {visibleDocuments.map((document) => {
              const isSelected = selectedId === document.id;
              const access = { hasAccess: !!document.hasAccess, isPending: document.accessStatus === "PENDING_REQUEST" };
              return (
                <div
                  key={document.id}
                  draggable={canMoveFiles}
                  onDragStart={(e) => handleDocumentDragStart(e, document)}
                  onClick={() => onSelect(document)}
                  className={`group flex h-full min-w-0 flex-col justify-between rounded-xl border p-4 transition-all duration-200 cursor-pointer ${canMoveFiles ? "cursor-grab active:cursor-grabbing" : ""
                    } ${isSelected
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {canMoveFiles && (
                        <span
                          title="Drag to move file"
                          className="cursor-grab active:cursor-grabbing text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0"
                        >
                          <GripVertical className="size-3.5" />
                        </span>
                      )}
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <FileText className="size-4" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {canMoveFiles && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMoveDocTarget && setMoveDocTarget({
                              document,
                              targetFolder: document.folder || authorizedFolders[0]?.name || "",
                              targetSubfolder: document.subfolder || "",
                            });
                          }}
                          title="Move file"
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          <ArrowRightLeft className="size-3" />
                        </button>
                      )}
                      {role !== "Publisher" && !access.hasAccess && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 dark:text-amber-400">
                          <Lock className="size-2.5" /> Request Access
                        </span>
                      )}
                      {String(document.status ?? "").toUpperCase() === "ARCHIVED" && (
                        <StatusBadge status={formatDocumentStatus(document.status)} />
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDocumentLeftClick(e, document);
                        }}
                        title="File Options"
                        className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary cursor-pointer shrink-0"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentClick(document, e);
                        }}
                        className="font-mono text-[10.5px] font-semibold text-primary truncate hover:underline cursor-pointer"
                        title="Click to open preview"
                      >
                        {document.number}
                      </span>
                      {document.isConfidential && (
                        <Lock className="size-2 text-amber-600 shrink-0" />
                      )}
                    </div>
                    <h3
                      className="mt-1 text-xs font-semibold text-foreground line-clamp-2 leading-snug"
                      title={
                        document.title ||
                        (document as any).document_title ||
                        document.fileName ||
                        (document as any).file_name ||
                        "Untitled Document"
                      }
                    >
                      {document.title ||
                        (document as any).document_title ||
                        document.fileName ||
                        (document as any).file_name ||
                        "Untitled Document"}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[10.5px] text-muted-foreground">
                    <span className="font-medium">
                      {document.department} · {document.location}
                    </span>
                    <span>{document.size}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. EXTRA LARGE ICONS (Minimal info, oversized visual cards with unarchive button) */}
        {viewMode === "Extra large icons" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 items-stretch">
            {visibleDocuments.map((document) => {
              const isSelected = selectedId === document.id;
              const access = { hasAccess: !!document.hasAccess, isPending: document.accessStatus === "PENDING_REQUEST" };
              return (
                <div
                  key={document.id}
                  draggable={canMoveFiles}
                  onDragStart={(e) => handleDocumentDragStart(e, document)}
                  onClick={() => onSelect(document)}
                  className={`group flex h-full min-w-0 flex-col rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${canMoveFiles ? "cursor-grab active:cursor-grabbing" : ""
                    } ${isSelected
                      ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-md"
                    }`}
                >
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted/40 flex items-center justify-center">
                    {document.preview ? (
                      <div className="size-full bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-3 text-center group-hover:scale-105 transition-transform duration-300">
                        <FileText className="size-8 text-blue-400 mb-1 opacity-80" />
                        <span className="text-[11px] font-semibold text-white truncate max-w-full px-1">{document.number}</span>
                        <span className="text-[9px] text-blue-200/70 uppercase tracking-wider">{document.type}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="size-10 text-primary/70 mb-1" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          {document.type}
                        </span>
                      </div>
                    )}
                    {document.isConfidential && (
                      <span className="absolute top-1.5 right-1.5 rounded bg-amber-500/90 p-1 text-white shadow-xs">
                        <Lock className="size-2.5" />
                      </span>
                    )}
                    {role !== "Publisher" && !access.hasAccess && (
                      <span className="absolute top-1.5 left-1.5 rounded bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs flex items-center gap-0.5">
                        <Lock className="size-2.5" /> Access Req.
                      </span>
                    )}
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-background/80 backdrop-blur-xs px-1.5 py-0.2 text-[9px] font-mono font-semibold text-foreground">
                      {document.revision}
                    </span>
                  </div>

                  <div className="mt-2.5 text-center min-w-0">
                    <p
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDocumentClick(document, e);
                      }}
                      className="font-mono text-[10px] font-semibold text-primary truncate hover:underline cursor-pointer"
                      title="Click to open preview"
                    >
                      {document.number}
                    </p>
                    <p
                      className="mt-0.5 text-xs font-semibold line-clamp-1 text-foreground"
                      title={
                        document.title ||
                        (document as any).document_title ||
                        document.fileName ||
                        (document as any).file_name ||
                        "Untitled Document"
                      }
                    >
                      {document.title ||
                        (document as any).document_title ||
                        document.fileName ||
                        (document as any).file_name ||
                        "Untitled Document"}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-muted-foreground">
                        {String(document.status ?? "").toUpperCase() === "ARCHIVED"
                          ? `${document.department} · ${formatDocumentStatus(document.status)}`
                          : document.department}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDocumentLeftClick(e, document);
                        }}
                        title="File Options"
                        className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary cursor-pointer shrink-0"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. LARGE ICONS (Clean large icons with minimal info and unarchive button) */}
        {viewMode === "Large icons" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4 items-stretch">
            {visibleDocuments.map((document) => {
              const isSelected = selectedId === document.id;
              return (
                <div
                  key={document.id}
                  draggable={canMoveFiles}
                  onDragStart={(e) => handleDocumentDragStart(e, document)}
                  onClick={() => onSelect(document)}
                  className={`group flex h-full min-w-0 flex-col items-center justify-start rounded-xl border p-3 text-center transition-all duration-200 cursor-pointer ${canMoveFiles ? "cursor-grab active:cursor-grabbing" : ""
                    } ${isSelected
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                    }`}
                >
                  <div className="relative mb-2 flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-8" />
                    {document.isConfidential && (
                      <span className="absolute -top-1 -right-1 rounded-full bg-amber-500 p-0.5 text-white">
                        <Lock className="size-2" />
                      </span>
                    )}
                  </div>
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDocumentClick(document, e);
                    }}
                    className="font-mono text-[9.5px] font-semibold text-primary truncate w-full hover:underline cursor-pointer"
                    title="Click to open preview"
                  >
                    {document.number}
                  </p>
                  <p
                    className="mt-0.5 text-xs font-medium text-foreground line-clamp-2 w-full"
                    title={
                      document.title ||
                      (document as any).document_title ||
                      document.fileName ||
                      (document as any).file_name ||
                      "Untitled Document"
                    }
                  >
                    {document.title ||
                      (document as any).document_title ||
                      document.fileName ||
                      (document as any).file_name ||
                      "Untitled Document"}
                  </p>
                  <div className="flex items-center justify-between w-full mt-1">
                    <span className="text-[9.5px] text-muted-foreground">
                      {document.department}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDocumentLeftClick(e, document);
                      }}
                      title="File Options"
                      className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary cursor-pointer shrink-0"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. MEDIUM ICONS (Medium icons with minimal info and unarchive button) */}
        {viewMode === "Medium icons" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-4 items-stretch">
            {visibleDocuments.map((document) => {
              const isSelected = selectedId === document.id;
              return (
                <div
                  key={document.id}
                  draggable={canMoveFiles}
                  onDragStart={(e) => handleDocumentDragStart(e, document)}
                  onClick={() => onSelect(document)}
                  className={`group flex h-full min-w-0 flex-col items-center justify-start rounded-lg border p-3 text-center transition-all duration-200 cursor-pointer ${canMoveFiles ? "cursor-grab active:cursor-grabbing" : ""
                    } ${isSelected
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                      : "border-border/70 bg-card hover:border-primary/40 hover:shadow-xs"
                    }`}
                >
                  <div className="relative flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1.5">
                    <FileText className="size-5" />
                    {document.isConfidential && (
                      <Lock className="absolute -top-0.5 -right-0.5 size-2 text-amber-600" />
                    )}
                  </div>
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDocumentClick(document, e);
                    }}
                    className="font-mono text-[9px] font-semibold text-primary truncate w-full hover:underline cursor-pointer"
                    title="Click to open preview"
                  >
                    {document.number}
                  </p>
                  <p
                    className="text-[11px] font-medium line-clamp-1 w-full text-foreground"
                    title={
                      document.title ||
                      (document as any).document_title ||
                      document.fileName ||
                      (document as any).file_name ||
                      "Untitled Document"
                    }
                  >
                    {document.title ||
                      (document as any).document_title ||
                      document.fileName ||
                      (document as any).file_name ||
                      "Untitled Document"}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* 7. SMALL ICONS (Compact minimal icon list with unarchive button) */}
        {viewMode === "Small icons" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 p-4 items-stretch">
            {visibleDocuments.map((document) => {
              const isSelected = selectedId === document.id;
              return (
                <div
                  key={document.id}
                  draggable={canMoveFiles}
                  onDragStart={(e) => handleDocumentDragStart(e, document)}
                  onClick={() => onSelect(document)}
                  className={`group flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-200 cursor-pointer ${canMoveFiles ? "cursor-grab active:cursor-grabbing" : ""
                    } ${isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border/70 bg-card hover:border-primary/30 hover:bg-accent/30"
                    }`}
                >
                  <div className="p-1 rounded text-primary shrink-0">
                    <FileText className="size-4 text-primary shrink-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDocumentClick(document, e);
                      }}
                      className="font-mono text-[9.5px] font-semibold text-primary truncate hover:underline cursor-pointer"
                      title="Click to open preview"
                    >
                      {document.number}
                    </p>
                    <p
                      className="text-[11px] font-medium text-foreground truncate"
                      title={
                        document.title ||
                        (document as any).document_title ||
                        document.fileName ||
                        (document as any).file_name ||
                        "Untitled Document"
                      }
                    >
                      {document.title ||
                        (document as any).document_title ||
                        document.fileName ||
                        (document as any).file_name ||
                        "Untitled Document"}
                    </p>
                  </div>
                  {document.isConfidential && (
                    <Lock className="size-2 text-amber-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 8. CONTENT VIEW (Media preview cards with unarchive button) */}
        {viewMode === "Content" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 items-stretch">
            {visibleDocuments.map((document) => {
              const isSelected = selectedId === document.id;
              return (
                <div
                  key={document.id}
                  draggable={canMoveFiles}
                  onDragStart={(e) => handleDocumentDragStart(e, document)}
                  onClick={() => onSelect(document)}
                  className={`group flex h-full min-w-0 flex-col justify-between rounded-xl border p-4 transition-all duration-200 cursor-pointer ${canMoveFiles ? "cursor-grab active:cursor-grabbing" : ""
                    } ${isSelected
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                    }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                       <div>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDocumentClick(document, e);
                          }}
                          className="font-mono text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                          title="Click to open preview"
                        >
                          {document.number}
                        </span>
                        <h3
                          className="mt-1 break-words text-sm font-semibold leading-snug text-foreground line-clamp-2"
                          title={
                            document.title ||
                            (document as any).document_title ||
                            document.fileName ||
                            (document as any).file_name ||
                            "Untitled Document"
                          }
                        >
                          {document.title ||
                            (document as any).document_title ||
                            document.fileName ||
                            (document as any).file_name ||
                            "Untitled Document"}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        {String(document.status ?? "").toUpperCase() === "ARCHIVED" && (
                          <StatusBadge status={formatDocumentStatus(document.status)} />
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDocumentLeftClick(e, document);
                          }}
                          title="File Options"
                          className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary cursor-pointer shrink-0"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {document.subject && (
                      <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed bg-muted/20 p-2 rounded border border-border/50">
                        {document.subject}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium">
                      {document.department} · {document.location}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>Rev: {document.revision}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {visibleDocuments.length === 0 && (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground p-6">
            <Search className="size-5 text-muted-foreground/60" />
            <p className="text-sm font-medium">
              No records match this view or filter criteria
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                resetFilters();
                setActiveFolder("All documents");
              }}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Clear search & filters
            </button>
          </div>
        )}
      </div>

      {/* Table Footer with Clearance for Floating AI Button */}
      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 pr-24 py-2 text-[11px] text-muted-foreground">
        <span>Showing {visibleDocuments.length} records</span>
        <span className="flex items-center gap-1">
          <Clock3 className="size-3" /> Last index sync 28 Aug 2026 · 14:40
        </span>
      </div>
    </div>
  );
}
