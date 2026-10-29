import React, { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import {
  ArrowDownToLine,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  FileText,
  Lock,
} from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import { Modal } from "../Common/Modal";
import { StatusBadge } from "../Common/StatusBadge";
import type { DocumentRecord } from "../types";

export function DocSpecificationsModal({
  selected,
  onClose,
}: {
  selected: DocumentRecord;
  onClose: () => void;
  onOpenAccess: () => void;
  onOpenVersions: () => void;
  onOpenFile: () => void;
}) {
  return (
    <Modal
      title={`Document Specifications · ${selected.number}`}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Header Box */}
        <div className="rounded-lg border border-border bg-muted/20 p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary">
                  {selected.number}
                </span>
                {selected.isConfidential && (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-600">
                    <Lock className="size-2.5" /> Confidential
                  </span>
                )}
              </div>
              <h3 className="mt-1 text-base font-semibold leading-snug">{selected.title}</h3>
              {selected.subject && (
                <p className="mt-1 text-xs text-muted-foreground font-medium">
                  {selected.subject}
                </p>
              )}
            </div>
            <StatusBadge status={selected.status} />
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/40 px-3.5 py-2 border-b border-border">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
              18 Controlled Attributes & Metadata
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
            {[
              ["Department", selected.department],
              ["Location", selected.location],
              ["Category", selected.category],
              ["Document Type", selected.type],
              ["Volume", selected.volume || "Vol 01"],
              ["Revision", selected.revision],
              ["Custodian", selected.custodian || selected.owner],
              ["Security Classification", selected.securityClassification || "Internal"],
              ["Retention Class", selected.retentionClass || "Permanent"],
              ["File Size", selected.size],
              ["Open Date", selected.openDate || "—"],
              ["Close Date", selected.closeDate || "—"],
              ["Rack Location", selected.rack || "—"],
              ["Shelf Tier", selected.shelf || "—"],
              ["Container / Box", selected.box || "—"],
              [
                "Confidentiality",
                selected.isConfidential ? "Yes (Search Restricted)" : "No (Standard)",
              ],
              ["Last Updated", selected.updated],
              ["Created Date", selected.created],
            ].map(([label, value]) => (
              <div key={label} className="bg-card px-3.5 py-2.5">
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="mt-0.5 truncate text-xs font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Description & Scope */}
        <div className="rounded-lg border border-border bg-card p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Description & Operational Scope
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            {selected.description}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end border-t border-border pt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function DocAccessModal({
  selected,
  onClose,
  onGrantUser,
}: {
  selected: DocumentRecord;
  onClose: () => void;
  onGrantUser: (user: string) => void;
}) {
  return (
    <Modal title="Access & ownership" onClose={onClose}>
      <div className="rounded border border-primary/20 bg-primary/5 p-3">
        <p className="text-xs font-semibold">Document owner</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {selected.owner} · all document actions are recorded against the owner.
        </p>
      </div>
      <p className="dms-section-label mt-4">Viewers with access</p>
      <div className="mt-2 space-y-2">
        {[...selected.access, "Request from User 004"].map((person, index) => (
          <div
            key={person}
            className="flex items-center gap-2 rounded border border-border px-3 py-2"
          >
            <div className="flex size-6 items-center justify-center rounded-full bg-secondary text-[9px] font-bold">
              {person
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
            <span className="flex-1 text-xs">{person}</span>
            {index === selected.access.length ? (
              <Button
                size="sm"
                onClick={() => onGrantUser("User 004")}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Grant
              </Button>
            ) : (
              <span className="text-[10px] text-muted-foreground">Viewer</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        >
          Done
        </Button>
      </div>
    </Modal>
  );
}

export function DocVersionsModal({
  doc,
  onClose,
  onOpenFile,
  onDownloadFile,
}: {
  doc: DocumentRecord;
  onClose: () => void;
  onOpenFile: (historyId: number, isCurrent?: boolean) => void;
  onDownloadFile: (historyId: number, isCurrent?: boolean) => void;
}) {
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRevisions, setExpandedRevisions] = useState<number[]>([]);

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get(
          `/dms-document/revisions/${doc.id}`
        );

        const responseData = response.data?.data;

        if (response.data?.status !== "success" || !responseData) {
          throw new Error("Invalid version history response.");
        }

        // The API returns revision records directly inside data.revisions.
        const revisionMetadata = Array.isArray(responseData.revisions)
          ? responseData.revisions
          : [];

        // Map the actual API response to the fields used by the UI.
        const mappedRevisions = revisionMetadata.map((revision: any) => ({
          ...revision,

          // Revision information
          revision:
            revision.revision ??
            (revision.revision_number != null
              ? `Rev ${String(revision.revision_number).padStart(2, "0")}`
              : "Version unavailable"),
          version:
            revision.revision ??
            (revision.revision_number != null
              ? `Rev ${String(revision.revision_number).padStart(2, "0")}`
              : "Version unavailable"),
          version_date: revision.deposited_at ?? null,

          // Revision description
          reason: revision.description ?? "",
          content: revision.description ?? "",

          // File information
          file_name: revision.file_name ?? "",
          file_size: revision.file_size ?? "",
          file_type: revision.file_type ?? "",
          attachments: revision.file_name
            ? [
                {
                  file_name: revision.file_name,
                  file_size: revision.file_size,
                  file_type: revision.file_type,
                },
              ]
            : [],

          // Revision status
          is_current_active: Boolean(revision.is_current_active),
          is_oldest_baseline: Boolean(revision.is_oldest_baseline),
        }));

        setRevisions(mappedRevisions);

        // Expand the current revision by default.
        const current = mappedRevisions.find(
          (revision: any) => revision.is_current_active
        );

        setExpandedRevisions(current ? [current.history_id] : []);
      } catch (err: any) {
        console.error("Failed to fetch revisions:", err);

        setError(
          err.response?.data?.detail ||
          err.message ||
          "Failed to load version history."
        );
      } finally {
        setLoading(false);
      }
    };

    if (doc?.id) {
      fetchRevisions();
    }
  }, [doc.id]);

  const toggleRevision = (historyId: number) => {
    setExpandedRevisions((current) =>
      current.includes(historyId)
        ? current.filter((id) => id !== historyId)
        : [...current, historyId],
    );
  };

  const formatDate = (value: unknown) => {
    if (!value) return "Date unavailable";
    if (typeof value !== "string") return String(value);
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
  };

  const handleOpenVersion = async (
    historyId: number,
    isCurrent = false,
    fileName = ""
  ) => {
    if (!doc?.id) return;

    // Open the tab immediately to avoid browser popup blocking.
    const newTab = window.open("", "_blank");

    if (!newTab) {
      alert("Please allow pop-ups to view the document.");
      return;
    }

    try {
      const endpoint = isCurrent
        ? `/dms-document/download/${doc.id}`
        : `/dms-document/download-revision/${historyId}`;

      const response = await axiosInstance.get(endpoint, {
        responseType: "blob",
      });

      const responseBlob = response.data as Blob;

      let mimeType =
        response.headers["content-type"] || responseBlob.type;

      // Infer the MIME type when the backend returns octet-stream.
      if (!mimeType || mimeType === "application/octet-stream") {
        const extension = fileName.split(".").pop()?.toLowerCase();

        const mimeTypes: Record<string, string> = {
          pdf: "application/pdf",
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          webp: "image/webp",
          gif: "image/gif",
          txt: "text/plain",
        };

        mimeType = mimeTypes[extension || ""] || "application/octet-stream";
      }

      if (!responseBlob || responseBlob.size === 0) {
        throw new Error("The document is empty.");
      }

      const blob = new Blob([responseBlob], {
        type: mimeType,
      });

      const fileUrl = URL.createObjectURL(blob);

      if (blob.type.startsWith("image/")) {
        newTab.document.title = fileName || "Document Preview";

        const image = newTab.document.createElement("img");
        image.src = fileUrl;
        image.alt = fileName || "Document Preview";
        image.style.cssText =
          "max-width:100%;max-height:100vh;object-fit:contain;";

        newTab.document.body.replaceChildren(image);
        newTab.document.body.style.cssText =
          "margin:0;display:flex;justify-content:center;align-items:center;background:#1f1f1f;min-height:100vh;";
      } else {
        newTab.location.replace(fileUrl);
      }

      window.setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 120_000);
    } catch (error: any) {
      newTab.close();

      const status = error?.response?.status;

      if (status === 401) {
        alert("Your session has expired. Please sign in again.");
      } else if (status === 403) {
        alert("You do not have permission to view this version.");
      } else if (status === 404) {
        alert("The document version was not found.");
      } else {
        console.error("Version preview error:", error);
        alert("Unable to open this document version.");
      }
    }
  };

  const handleDownloadVersion = async (
    historyId: number,
    isCurrent = false,
    fileName = ""
  ) => {
    if (!doc?.id) return;

    try {
      const endpoint = isCurrent
        ? `/dms-document/download/${doc.id}`
        : `/dms-document/download-revision/${historyId}`;

      const response = await axiosInstance.get(endpoint, {
        responseType: "blob",
      });

      const responseBlob = response.data as Blob;

      if (!responseBlob || responseBlob.size === 0) {
        throw new Error("The downloaded document is empty.");
      }

      const blob = new Blob([responseBlob], {
        type:
          response.headers["content-type"] ||
          responseBlob.type ||
          "application/octet-stream",
      });

      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = fileUrl;
      link.download = fileName || `document-version-${historyId}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 60_000);
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 401) {
        alert("Your session has expired. Please sign in again.");
      } else if (status === 403) {
        alert("You do not have permission to download this version.");
      } else if (status === 404) {
        alert("Document version not found.");
      } else {
        console.error("Version download error:", error);
        alert("Failed to download the document version.");
      }
    }
  };

  const getAttachments = (item: any): any[] => {
    const value = item.attachments ?? item.attachment ?? item.files ?? item.file_name;
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return [{ file_name: value }];
    return [value];
  };

  const currentRevision = revisions.find((revision) => revision.is_current_active);

  return (
    <Modal title="Version History" onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4 text-sm">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading versions...</div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center text-destructive">
            {error}
          </div>
        ) : revisions.length === 0 ? (
          <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
            No version history available for this document.
          </div>
        ) : (
          <div className="relative py-1 pl-8 sm:pl-10">
            {/* Timeline rail */}
            <div className="absolute bottom-3 left-[10px] top-3 w-[3px] rounded-full bg-slate-200 sm:left-[13px]" />

            <div className="space-y-5">
              {revisions.map((item) => {
                const isExpanded = expandedRevisions.includes(item.history_id);
                const isCurrent = Boolean(item.is_current_active);
                const isOldest = Boolean(item.is_oldest_baseline);
                const attachments = getAttachments(item);
                const revisionLabel = item.revision || "Version unavailable";

                return (
                  <div key={item.history_id} className="relative min-w-0">
                    <span
                      className="absolute -left-[27px] top-6 z-10 size-4 rounded-full border-2 border-white bg-blue-600 sm:-left-[34px]"
                    />

                    <section
                      className={`overflow-hidden rounded-md border transition-colors ${isCurrent
                        ? "border-blue-200 bg-blue-50/40"
                        : "border-border bg-card"
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleRevision(item.history_id)}
                        aria-expanded={isExpanded}
                        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left sm:px-5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                            <span className="font-semibold text-foreground">{revisionLabel}</span>
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                              {item.version_type || item.versionType || (isOldest ? "Baseline Version" : "Minor Version")}
                            </span>
                            {isCurrent && (
                              <span className="text-xs font-medium text-emerald-600">Current</span>
                            )}
                            {isOldest && !isCurrent && (
                              <span className="text-xs font-medium text-muted-foreground">Oldest baseline</span>
                            )}
                          </div>
                          <p className="mt-2 break-words font-mono text-xs text-muted-foreground">
                            {doc.title || doc.fileName || "Untitled Document"}
                          </p>
                          <p className="mt-1 break-words font-mono text-xs text-muted-foreground">
                            Document Number: {doc.number}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            {item.deposited_at ?? item.version_date ?? "Date unavailable"}
                          </p>
                        </div>
                        <span className="mt-1 shrink-0 text-slate-700">
                          {isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-5 sm:px-5">
                          {attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {attachments.map((attachment: any, index: number) => {
                                const fileName =
                                  typeof attachment === "string"
                                    ? attachment
                                    : attachment.file_name ||
                                    attachment.filename ||
                                    attachment.name ||
                                    `Attachment ${index + 1}`;

                                const fileSize =
                                  typeof attachment === "object"
                                    ? attachment.file_size || item.file_size
                                    : item.file_size;

                                const fileType =
                                  typeof attachment === "object"
                                    ? attachment.file_type || item.file_type
                                    : item.file_type;

                                return (
                                  <div
                                    key={`${item.history_id}-attachment-${index}`}
                                    className="flex flex-col gap-3 rounded-md border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    <div className="flex min-w-0 items-start gap-3">
                                      <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                      <div className="min-w-0">
                                        <p className="break-all text-sm font-medium text-foreground">
                                          {fileName}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                          {fileType || "Attachment"}
                                          {fileSize ? ` · ${fileSize}` : ""}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {(item.description || item.reason) && (
                            <p className="mt-3 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">Description: </span>
                              {item.description || item.reason}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDownloadVersion(
                                  item.history_id,
                                  isCurrent,
                                  item.file_name
                                )
                              }
                              className="gap-1.5 border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            >
                              <ArrowDownToLine className="size-4" />
                              Download
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                handleOpenVersion(
                                  item.history_id,
                                  isCurrent,
                                  item.file_name
                                )
                              }
                              className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
                            >
                              <FileCheck2 className="size-4" />
                              Open
                            </Button>
                          </div>
                        </div>
                      )}
                    </section>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {currentRevision && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  handleOpenVersion(
                    currentRevision.history_id,
                    true,
                    currentRevision.file_name || doc.fileName || doc.title
                  )
                }
                className="gap-1.5 border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              >
                <FileCheck2 className="size-4" />
                Open Current ({currentRevision.revision})
              </Button>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onClose}
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
