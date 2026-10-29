import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import { Modal } from "../Common/Modal";
import type { Publisher } from "../types";

export function DeletePublisherConfirmationModal({
  publisher,
  onClose,
  onConfirm,
}: {
  publisher: Publisher;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title="Delete Publisher" onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-destructive/10 text-destructive shrink-0">
            <Trash2 className="size-4.5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              Are you sure you want to delete this publisher?
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              This will remove <strong className="text-foreground font-semibold">"{publisher.name}"</strong> and revoke their publishing permissions for all assigned folders.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Publisher Name:</span>
            <span className="font-bold text-foreground">{publisher.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium text-foreground">{publisher.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Department:</span>
            <span className="font-mono text-primary">{publisher.department || "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Station Location:</span>
            <span className="font-medium text-foreground">{publisher.location || "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Assigned Folders:</span>
            <span className="font-bold text-foreground">{publisher.assignedFolders.length} folders</span>
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
            onClick={onConfirm}
            className="gap-1.5 cursor-pointer shadow-xs font-bold"
          >
            <Trash2 className="h-5 w-5" />
            <span>Delete Publisher</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
