import React, { useRef, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  RotateCcw,
  Trash2,
  Sparkles,
} from "lucide-react";
import type { DocumentRecord, Role, MainTab } from "../types";

export function FileActionContextMenu({
  fileActionMenu,
  activeMainTab,
  role,
  onClose,
  onOpenPreview,
  onShowInfo,
  onShowVersions,
  onDownload,
  onCopyNumber,
  onEditDocument,
  onMoveDocument,
  onToggleArchive,
  onDeleteDocument,
  onSummarizeDocument,
}: {
  fileActionMenu: { document: DocumentRecord; x: number; y: number } | null;
  activeMainTab: MainTab;
  role: Role;
  onClose: () => void;
  onOpenPreview: (doc: DocumentRecord) => void;
  onShowInfo: (doc: DocumentRecord) => void;
  onShowVersions: (doc: DocumentRecord) => void;
  onDownload: (doc: DocumentRecord) => void;
  onCopyNumber: (num: string) => void;
  onEditDocument: (doc: DocumentRecord) => void;
  onMoveDocument: (doc: DocumentRecord) => void;
  onToggleArchive: (doc: DocumentRecord) => void;
  onDeleteDocument: (doc: DocumentRecord) => void;
  onSummarizeDocument?: (doc: DocumentRecord) => void;
}) {
  if (!fileActionMenu) return null;

  const [menuRect, setMenuRect] = useState({ width: 240, height: 500 });
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (menuRef.current) {
      setMenuRect({
        width: menuRef.current.offsetWidth,
        height: menuRef.current.offsetHeight,
      });
    }
  }, [fileActionMenu]);

  const PADDING = 8;
  const x = Math.min(
    fileActionMenu.x,
    window.innerWidth - menuRect.width - PADDING
  );
  const y = Math.min(
    fileActionMenu.y,
    window.innerHeight - menuRect.height - PADDING
  );

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9998] bg-transparent"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: `${Math.max(PADDING, y)}px`,
          left: `${Math.max(PADDING, x)}px`,
          zIndex: 9999,
        }}
        className="w-60 max-h-[360px] rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-2xl animate-in fade-in zoom-in-95 duration-100 text-xs select-none flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Document Number and Title */}
        <div className="shrink-0 px-2.5 py-1.5 border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <span className="font-mono text-[11px] font-bold text-primary truncate">
              {fileActionMenu.document.number}
            </span>
            <span className="ml-auto text-[10px] font-medium text-muted-foreground">
              Rev {fileActionMenu.document.revision}
            </span>
          </div>
          <p className="text-[11px] font-medium text-foreground truncate mt-0.5">
            {fileActionMenu.document.title}
          </p>
        </div>

        {/* Scrollable Actions */}
        <div className="min-h-0 overflow-y-auto p-1.5 space-y-0.5 [scrollbar-width:thin] [scrollbar-color:rgb(148_163_184)_transparent]">
          {/* 1. Open Preview */}
          <button
            type="button"
            onClick={() => {
              const doc = fileActionMenu.document;
              onClose();
              onOpenPreview(doc);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer font-medium"
          >
            <FileCheck2 className="h-5 w-5 text-primary" />
            <span>Open Preview</span>
          </button>

          {/* Summarize with AI */}
          {onSummarizeDocument && (
            <button
              type="button"
              onClick={() => {
                const doc = fileActionMenu.document;
                onClose();
                onSummarizeDocument(doc);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer font-semibold"
            >
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <span>Summarize with AI</span>
            </button>
          )}

          {/* 2. Show all info */}
          <button
            type="button"
            onClick={() => {
              const doc = fileActionMenu.document;
              onClose();
              onShowInfo(doc);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
          >
            <Info className="h-5 w-5 text-sky-500" />
            <span>Show all info</span>
          </button>

          {/* 3. Show version history */}
          <button
            type="button"
            onClick={() => {
              const doc = fileActionMenu.document;
              onClose();
              onShowVersions(doc);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
          >
            <History className="h-5 w-5 text-amber-500" />
            <span>Show version history</span>
          </button>

          {/* 4. Download */}
          <button
            type="button"
            onClick={() => {
              const doc = fileActionMenu.document;
              onClose();
              onDownload(doc);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
          >
            <Download className="h-5 w-5 text-emerald-500" />
            <span>Download</span>
          </button>

          {/* 5. Copy Document Number */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onCopyNumber(fileActionMenu.document.number);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Copy className="h-5 w-5 text-muted-foreground" />
            <span>Copy document no.</span>
          </button>

          {/* Publisher Only Operations: Edit, Move, Archive, Delete */}
          {role === "Publisher" && (
            <>
              <div className="my-1 border-t border-border/60" />
              <p className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                Publisher Actions
              </p>

              {/* Edit */}
              <button
                type="button"
                onClick={() => {
                  const doc = fileActionMenu.document;
                  onClose();
                  onEditDocument(doc);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
              >
                <Edit3 className="h-5 w-5 text-blue-500" />
                <span>Edit Document</span>
              </button>

              {/* Move */}
              <button
                type="button"
                onClick={() => {
                  const doc = fileActionMenu.document;
                  onClose();
                  onMoveDocument(doc);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                <span>Move file</span>
              </button>

              {/* Archive / Unarchive */}
              {activeMainTab === "archive" ||
              fileActionMenu.document.status === "Archived" ? (
                <button
                  type="button"
                  onClick={() => {
                    const doc = fileActionMenu.document;
                    onClose();
                    onToggleArchive(doc);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  <RotateCcw className="size-3.5 text-emerald-500" />
                  <span>Unarchive record</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const doc = fileActionMenu.document;
                    onClose();
                    onToggleArchive(doc);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-amber-500/10 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  <Archive className="size-3.5 text-amber-500" />
                  <span>Archive record</span>
                </button>
              )}

              {/* Delete */}
              <button
                type="button"
                onClick={() => {
                  const doc = fileActionMenu.document;
                  onClose();
                  onDeleteDocument(doc);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <Trash2 className="h-5 w-5 text-destructive" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
