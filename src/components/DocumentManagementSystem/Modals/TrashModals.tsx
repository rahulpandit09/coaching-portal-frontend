import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import { Modal } from "../Common/Modal";
import type { DocumentRecord } from "../types";

export function TrashConfirmDeleteModal({
  documentToDelete,
  onClose,
  onConfirmMoveToTrash,
}: {
  documentToDelete: DocumentRecord;
  onClose: () => void;
  onConfirmMoveToTrash: (doc: DocumentRecord) => void;
}) {
  return (
    <Modal
      title="Confirm Delete Document"
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive shrink-0">
            <Trash2 className="size-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="font-semibold text-foreground">Move this file to Trash?</p>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              Are you sure you want to delete this document? It will be removed from active
              files and moved to the <strong>Trash (Recycle Bin)</strong>.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Document No:</span>
            <span className="font-mono font-bold text-primary">{documentToDelete.number}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Title:</span>
            <span className="font-medium text-foreground truncate max-w-[240px]">
              {documentToDelete.title}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Folder:</span>
            <span className="font-medium text-foreground">
              {documentToDelete.folder || "General"}
            </span>
          </div>
          {documentToDelete.subfolder && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Subfolder:</span>
              <span className="font-medium text-foreground">{documentToDelete.subfolder}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Revision:</span>
            <span className="font-semibold text-foreground">{documentToDelete.revision}</span>
          </div>
        </div>

        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-800 dark:text-amber-300">
          <p className="font-semibold">Note for Administrators:</p>
          <p className="mt-0.5">
            Only the Administrator can restore this file or permanently purge it from the Trash.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onConfirmMoveToTrash(documentToDelete)}
            className="gap-1.5 cursor-pointer shadow-xs"
          >
            <Trash2 className="h-5 w-5" />
            <span>Move to Trash</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function PermanentDeleteModal({
  permanentDeleteTarget,
  onClose,
  onConfirmPermanentDelete,
}: {
  permanentDeleteTarget: DocumentRecord;
  onClose: () => void;
  onConfirmPermanentDelete: (id: string) => void;
}) {
  return (
    <Modal
      title="Permanently Delete Document?"
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/20 text-destructive shrink-0">
            <AlertTriangle className="size-5 text-destructive" />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="font-bold text-destructive">Warning: This action cannot be undone!</p>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              This will permanently eradicate <strong>{permanentDeleteTarget.number}</strong>{" "}
              from PMHBL storage. All associated metadata, revision logs, and file records will
              be deleted forever.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Document:</span>
            <span className="font-mono font-bold text-primary">
              {permanentDeleteTarget.number}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Title:</span>
            <span className="font-medium text-foreground truncate max-w-[240px]">
              {permanentDeleteTarget.title}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Original Folder:</span>
            <span className="font-medium text-foreground">
              {permanentDeleteTarget.folder || "N/A"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onConfirmPermanentDelete(permanentDeleteTarget.id)}
            className="gap-1.5 cursor-pointer shadow-xs font-bold"
          >
            <Trash2 className="h-5 w-5" />
            <span>Delete Permanently</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function EmptyTrashModal({
  deletedDocsCount,
  onClose,
  onConfirmEmptyTrash,
}: {
  deletedDocsCount: number;
  onClose: () => void;
  onConfirmEmptyTrash: () => void;
}) {
  return (
    <Modal
      title="Empty Entire Trash?"
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/20 text-destructive shrink-0">
            <AlertTriangle className="size-5 text-destructive" />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="font-bold text-destructive">
              Eradicate all {deletedDocsCount} deleted documents?
            </p>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              You are about to permanently remove all items currently in the Trash. This action
              cannot be reversed and documents cannot be restored once purged.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirmEmptyTrash}
            className="gap-1.5 cursor-pointer shadow-xs font-bold"
          >
            <Trash2 className="h-5 w-5" />
            <span>Empty Trash Now</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
