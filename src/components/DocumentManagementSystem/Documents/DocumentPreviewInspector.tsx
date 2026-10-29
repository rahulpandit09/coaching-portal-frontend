import React, { useState } from "react";
import {
  Archive,
  ArrowRightLeft,
  Copy,
  Download,
  Edit3,
  FileCheck2,
  FileText,
  History,
  Info,
  Lock,
  LockKeyhole,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
  Eye,
  Sparkles,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import { StatusBadge } from "../Common/StatusBadge";
import type { DocumentRecord, FolderDefinition, Role } from "../types";
import {
  viewDocumentFile,
  downloadDocumentFile,
} from "../Common/DocumentViewer";

export function DocumentPreviewInspector({
  previewDoc,
  onClose,
  previewAccess,
  role,
  userId,
  onOpenVersions,
  onOpenSpecs,
  onEditDoc,
  onMoveDoc,
  onDownloadDoc,
  onToggleArchive,
  onDeleteDoc,
  onRequestAccess,
  onCopyNumber,
  folders,
  onOpenAccess,
  onSummarizeDoc,
  isSummarizingDocument = false,
}: {
  previewDoc: DocumentRecord;
  onClose: () => void;
  previewAccess: { hasAccess: boolean; isPending: boolean; accessInfo?: any };
  role: Role;
  userId?: number | string;
  onOpenVersions: () => void;
  onOpenSpecs: () => void;
  onEditDoc: () => void;
  onMoveDoc: () => void;
  onDownloadDoc: (doc: DocumentRecord) => void;
  onToggleArchive: (doc: DocumentRecord) => void;
  onDeleteDoc: (doc: DocumentRecord) => void;
  onRequestAccess: (doc: DocumentRecord) => void;
  onCopyNumber: (num: string) => void;
  folders: FolderDefinition[];
  onOpenAccess: () => void;
  onSummarizeDoc?: (doc: DocumentRecord) => void;
  isSummarizingDocument?: boolean;
}) {
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);

  const isArchived =
    String(previewDoc.status ?? "").toUpperCase() === "ARCHIVED";

  const handleArchiveToggleRequest = () => {
    setArchiveConfirmOpen(true);
  };

  const handleArchiveToggleConfirm = () => {
    onToggleArchive(previewDoc);
    setArchiveConfirmOpen(false);
  };

  const handleArchiveToggleCancel = () => {
    setArchiveConfirmOpen(false);
  };

  const handleViewDocument = async () => {
    if (!previewDoc?.id || !previewAccess.hasAccess) {
      return;
    }
    await viewDocumentFile(previewDoc);
  };

  const handleDownloadDocument = async () => {
    if (!previewDoc?.id || !previewAccess.hasAccess) {
      return;
    }
    await downloadDocumentFile(previewDoc);
    onDownloadDoc?.(previewDoc);
  };

  const canManagePublisherPrivileges =
    role === "Publisher" &&
    previewDoc.has_publisher_privileges === true;

  return (
    <div className="absolute inset-y-0 right-0 z-40 w-[460px] max-w-full pointer-events-auto">
      <div
        className="
 relative
 flex h-full w-full
 flex-col
 overflow-hidden
 border-l border-slate-200 bg-white text-slate-900 shadow-2xl

 animate-in slide-in-from-right duration-200
 "
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Document Preview
              </p>
              <p className="truncate font-mono text-xs font-bold text-slate-700">
                {previewDoc.number}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {/* View Button - Top Right */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleViewDocument}
              disabled={!previewAccess.hasAccess}
              className="h-8 gap-1.5 border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 "
              title="View Document"
            >
              <Eye className="h-5 w-5" />
              View
            </Button>

            <Button
              size="icon"
              variant="ghost"
              aria-label="Copy document number"
              title="Copy Document Number"
              onClick={() => onCopyNumber(previewDoc.number)}
              className="h-8 w-8 p-0 cursor-pointer hover:text-primary"
            >
              <Copy className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="View document specifications"
              title="Specifications & Metadata"
              onClick={onOpenSpecs}
              className="h-8 w-8 p-0 cursor-pointer hover:text-primary"
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Close side preview"
              title="Close Preview Panel"
              onClick={onClose}
              className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Inspector Scrollable Body */}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-white p-3 ">
          {/* Title & Classification Tag */}
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="text-sm font-bold leading-snug text-slate-900"
                title={previewDoc.title || previewDoc.fileName || "Untitled Document"}
              >
                {previewDoc.title || previewDoc.fileName || "Untitled Document"}
              </h3>
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 ">
              {previewDoc.description || "Controlled engineering documentation record."}
            </p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {String(previewDoc.status ?? "").toUpperCase() === "ARCHIVED" && (
                <StatusBadge status={previewDoc.status ?? "Archived"} />
              )}

              {previewDoc.confidentiality && (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 ">
                  {previewDoc.confidentiality}
                </span>
              )}

              {previewDoc.isConfidential && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 ">
                  Controlled Access
                </span>
              )}
            </div>
          </div>

          {/* Access Status Alert Box */}
          <div
            className={`flex items-start gap-2 rounded-lg border p-2.5 text-xs ${previewAccess.hasAccess
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : previewAccess.isPending
                  ? "border-slate-200 bg-slate-50 text-slate-700"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
          >
            {previewAccess.hasAccess ? (
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : previewAccess.isPending ? (
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
            ) : (
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            )}
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="font-bold text-xs">
                {previewAccess.hasAccess
                  ? "Access Granted"
                  : previewAccess.isPending
                    ? "Access Request Pending"
                    : "Access Restricted"}
              </p>
              <p className="text-[11px] leading-relaxed opacity-90">
                {previewAccess.hasAccess
                  ? previewAccess.accessInfo
                    ? `Access granted via ${previewAccess.accessInfo.grantedVia ?? "publisher permission"} (${previewAccess.accessInfo.accessLevel ?? "Full"}).`
                    : "You have verified read & review permissions for this record."
                  : previewAccess.isPending
                    ? "Your authorization request is awaiting publisher or admin review."
                    : "You require publisher approval to view this controlled engineering specification."}
              </p>
            </div>
          </div>

          {/* Visual Document Preview Thumbnail or Restricted Lock UI */}
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            {previewAccess.hasAccess ? (
              <div className="relative flex min-h-[120px] flex-col items-center justify-center bg-slate-800 p-3 text-white">
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-slate-700 text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="font-mono text-xs font-semibold text-white">{previewDoc.number}</div>
                  <div
                    className="text-xs font-medium text-slate-100 mt-0.5 line-clamp-1"
                    title={previewDoc.title || previewDoc.fileName || "Untitled Document"}
                  >
                    {previewDoc.title || previewDoc.fileName || "Untitled Document"}
                  </div>
                </div>
                <div className="mt-3 flex w-full items-center justify-between gap-2 border-t border-slate-700/80 pt-2.5 text-xs text-white">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                    <FileCheck2 className="h-5 w-5" />
                    Verified Revision
                  </span>
                  <span className="text-right font-mono text-[11px] text-slate-300">
                    {previewDoc.size} · {previewDoc.fileType || "PDF"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="dms-locked-preview flex aspect-[16/9] flex-col items-center justify-center gap-2 bg-slate-100 p-4 text-center text-slate-600 ">
                <LockKeyhole className="size-8 text-amber-500" />
                <p className="text-xs font-semibold text-slate-900 ">
                  Preview Restricted
                </p>
                <p className="max-w-[240px] text-[10.5px]">
                  Access approval is required to view this controlled engineering specification.
                </p>
                {(role === "Admin" || previewDoc.canRequestAccess) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRequestAccess(previewDoc)}
                    className="mt-1 gap-1 border-amber-300 bg-white text-xs font-semibold text-amber-800 hover:bg-amber-50 "
                  >
                    <Lock className="h-5 w-5 text-amber-600" />
                    <span>Request Access from Publisher</span>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Archived Warning Banner & Direct Unarchive */}
          {isArchived && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 ">
              <div className="flex items-center gap-2 min-w-0">
                <Archive className="h-5 w-5 shrink-0 text-amber-600 " />
                <div className="min-w-0">
                  <p className="font-semibold text-xs leading-none">Archived Record</p>
                  <p className="mt-0.5 truncate text-[10.5px] text-amber-800 ">
                    Compliance archive
                  </p>
                </div>
              </div>
              {role === "Publisher" && (
                <Button
                  size="sm"
                  onClick={handleArchiveToggleRequest}
                  className="h-7 shrink-0 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 font-medium shadow-xs cursor-pointer"
                >
                  <RotateCcw className="h-5 w-5" /> Unarchive
                </Button>
              )}
            </div>
          )}

          {/* Quick Metadata Attributes Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Department
              </p>
              <p className="mt-1 truncate font-semibold text-slate-900">
                {previewDoc.department}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Location
              </p>
              <p className="mt-1 truncate font-semibold text-slate-900">
                {previewDoc.location}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Folder Path
              </p>
              <p className="mt-1 truncate font-semibold text-slate-900">
                {[
                  previewDoc.folder,
                  previewDoc.subfolder,
                  previewDoc.subSubfolder,
                ]
                  .filter(Boolean)
                  .join(" / ") || "General"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Publishing Engineer
              </p>
              <p className="mt-1 truncate font-semibold text-slate-900">
                {previewDoc.created_by_name || "N/A"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Revision Number
              </p>
              <p className="mt-1 truncate font-semibold text-slate-900">
                {previewDoc.revision}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Approval Status
              </p>
              <p className="mt-1 truncate font-semibold text-slate-900">
                {previewDoc.approvalStatus || "Not Submitted"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Last Updated
              </p>
              <p className="mt-1 truncate font-semibold text-slate-900">
                {previewDoc.updated}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Custodian
              </p>
              <p className="mt-1 truncate font-semibold text-slate-900">
                {previewDoc.custodian || previewDoc.owner}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Storage Rack / Shelf
              </p>
              <p className="mt-1 truncate font-semibold text-slate-900">
                {previewDoc.rack || "MLR"} / {previewDoc.shelf || "Tier-1"}
              </p>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="space-y-2 border-t border-slate-200 pt-3 ">
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                type="button"
                size="sm"
                onClick={handleDownloadDocument}
                disabled={!previewAccess.hasAccess}
                className="h-8 gap-1 bg-blue-600 px-2 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-5 w-5" />
                Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onOpenSpecs}
                className="h-8 gap-1 border-slate-300 bg-white px-2 text-[11px] text-slate-700 hover:bg-slate-50"
              >
                <Info className="h-5 w-5" /> Specs
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onOpenVersions}
                className="h-8 gap-1 border-slate-300 bg-white px-2 text-[11px] text-slate-700 hover:bg-slate-50"
              >
                <History className="h-5 w-5" /> Rev ({previewDoc.revision})
              </Button>
            </div>

            {/* Summarize with AI Button — only for users with document access */}
            {previewAccess.hasAccess && onSummarizeDoc && (
              <Button
                type="button"
                size="sm"
                onClick={() => onSummarizeDoc(previewDoc)}
                disabled={isSummarizingDocument}
                className="w-full h-8 gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 text-[11px] font-semibold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSummarizingDocument ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                    Generating summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    Summarize with Navi AI
                  </>
                )}
              </Button>
            )}

            {/* Publisher Only Action Buttons */}
            {canManagePublisherPrivileges && (
              <div className="pt-2 border-t border-border space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Publisher Privileges
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onEditDoc}
                    className="h-8 gap-1 border-slate-300 bg-white px-2 text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="h-5 w-5" /> Edit Document
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onMoveDoc}
                    className="h-8 gap-1 border-slate-300 bg-white px-2 text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowRightLeft className="h-5 w-5" /> Move File
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleArchiveToggleRequest}
                    className="h-8 gap-1 border-amber-300 bg-white px-2 text-[11px] text-amber-800 hover:bg-amber-50"
                  >
                    {isArchived ? (
                      <RotateCcw className="h-5 w-5" />
                    ) : (
                      <Archive className="h-5 w-5" />
                    )}

                    {isArchived ? "Unarchive" : "Archive"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteDoc(previewDoc)}
                    className="h-8 gap-1 border-red-200 bg-white px-2 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" /> Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {archiveConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-confirm-title"
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${isArchived
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                  }`}
              >
                {isArchived ? (
                  <RotateCcw className="h-5 w-5" />
                ) : (
                  <Archive className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  id="archive-confirm-title"
                  className="text-sm font-semibold text-slate-900"
                >
                  {isArchived ? "Unarchive Document?" : "Archive Document?"}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {isArchived
                    ? `Are you sure you want to unarchive "${previewDoc.title}"? The document will become active again.`
                    : `Are you sure you want to archive "${previewDoc.title}"?`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleArchiveToggleCancel}
                className="h-9 px-4"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleArchiveToggleConfirm}
                className={`h-9 px-4 text-white ${isArchived
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-amber-600 hover:bg-amber-700"
                  }`}
              >
                {isArchived ? "Confirm Unarchive" : "Confirm Archive"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

