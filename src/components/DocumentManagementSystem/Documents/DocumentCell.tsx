import React from "react";
import {
  Clock3,
  FileText,
  GripVertical,
  History,
  Lock,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { StatusBadge } from "../Common/StatusBadge";
import type { DocumentRecord } from "../types";
import { formatDocumentStatus } from "./AllDocumentsTable";

export function DocumentCell({
  column,
  document,
  onUnarchive,
  onShowVersions,
  onOpenPreview,
  isUserRole,
  userAccess,
  canMoveFiles,
}: {
  column: string;
  document: DocumentRecord;
  onUnarchive?: ((docId: string) => void) | undefined;
  onShowVersions?: (doc: DocumentRecord) => void;
  onOpenPreview?: (doc: DocumentRecord) => void;
  isUserRole?: boolean | undefined;
  userAccess?: { hasAccess: boolean; isPending: boolean } | undefined;
  canMoveFiles?: boolean | undefined;
}) {
  const value = {
    "Document no.": document.number,
    "Document title": document.fileName || document.title,
    Department: document.department,
    Location: document.location,
    Revision: document.revision,
    Status: document.status,
    Owner: document.owner,
    Updated: document.updated,
  }[column];

  if (column === "Document no.") {
    return (
      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-[#1E6FBF] min-w-[160px]">
        <div className="flex items-center gap-1.5">
          {canMoveFiles && (
            <span
              title="Drag to move file to another folder or subfolder"
              className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-[#1E6FBF] transition-colors"
            >
              <GripVertical className="h-5 w-5" />
            </span>
          )}
          <span
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview?.(document);
            }}
            className="hover:underline hover:text-blue-700 cursor-pointer transition-colors"
            title="Click to open preview"
          >
            {value}
          </span>
        </div>
      </td>
    );
  }

  if (column === "Document title") {
    return (
      <td className="px-4 py-3 min-w-[260px] max-w-[420px]">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 shrink-0 text-slate-400" />
          <span
            className="truncate text-xs font-semibold text-slate-900"
            title={document.fileName || document.title}
          >
            {document.fileName || document.title}
          </span>
          {document.isConfidential && (
            <span
              title="Confidential Document"
              className="inline-flex items-center gap-0.5 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 shrink-0"
            >
              <Lock className="h-5 w-5" />
            </span>
          )}
          {isUserRole &&
            (userAccess?.hasAccess ? (
              <span
                title="Access Permitted"
                className="inline-flex items-center gap-0.5 rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 shrink-0"
              >
                <ShieldCheck className="h-5 w-5" /> Permitted
              </span>
            ) : userAccess?.isPending ? (
              <span
                title="Access Request Pending"
                className="inline-flex items-center gap-0.5 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 shrink-0"
              >
                <Clock3 className="h-5 w-5" /> Pending
              </span>
            ) : (
              <span
                title="Restricted Document"
                className="inline-flex items-center gap-0.5 rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 shrink-0"
              >
                <Lock className="h-5 w-5" /> Locked
              </span>
            ))}
        </div>
        {(document.subject || document.description) && (
          <p className="text-[11px] text-slate-400 truncate pl-6 mt-0.5" title={document.subject || document.description}>
            {document.subject || document.description}
          </p>
        )}
      </td>
    );
  }

  if (column === "Department") {
    return (
      <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-slate-700 min-w-[100px]">
        {value}
      </td>
    );
  }

  if (column === "Location") {
    return (
      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-700 min-w-[90px]">
        {value}
      </td>
    );
  }

  if (column === "Revision") {
    return (
      <td className="whitespace-nowrap px-4 py-3 min-w-[100px]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShowVersions?.(document);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E6FBF] hover:bg-blue-50 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
          title="Click to view full revision history"
        >
          <History className="h-5 w-5 text-[#1E6FBF]/70" />
          <span>{value}</span>
        </button>
      </td>
    );
  }

  if (column === "Status") {
    return (
      <td className="whitespace-nowrap px-4 py-3 min-w-[140px]">
        <div className="flex items-center gap-2">
          <StatusBadge status={formatDocumentStatus(document.status)} />
        </div>
      </td>
    );
  }

  if (column === "Owner") {
    return (
      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600 min-w-[110px]">
        {value}
      </td>
    );
  }

  return (
    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 min-w-[100px]">
      {value}
    </td>
  );
}

export default DocumentCell;
