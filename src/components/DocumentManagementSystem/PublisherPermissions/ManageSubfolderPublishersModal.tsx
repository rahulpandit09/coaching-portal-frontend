import React, { useState } from "react";
import { Check, ChevronRight, Folder, Plus, Search, ShieldCheck, UsersRound, X } from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import { Modal } from "../Common/Modal";
import type { FolderDefinition, Publisher, SubfolderInfo } from "../types";

export function ManageSubfolderPublishersModal({
  folder,
  subfolderName,
  subfolderId,
  subfolderPath,
  publishers,
  onClose,
  onSave,
  onCreateNewPublisher,
}: {
  folder: FolderDefinition;
  subfolderName: string;
  subfolderId?: number;
  subfolderPath?: string[];
  publishers: Publisher[];
  onClose: () => void;
  onSave: (assignedPublisherIds: string[]) => void;
  onCreateNewPublisher: () => void;
}) {
  const [selectedPubIds, setSelectedPubIds] = useState<string[]>(() => {
    const fullPathKey =
      subfolderPath && subfolderPath.length > 0
        ? `${folder.name}:::${subfolderPath.join(":::")}`
        : `${folder.name}:::${subfolderName}`;

    return publishers
      .filter((p) => {
        if (!p.assignedFolders.includes(folder.name)) return false;
        if (!p.assignedSubfolders || p.assignedSubfolders.length === 0) return false;
        if (
          subfolderId &&
          ((p.assignedSubfolders as any).includes(subfolderId) ||
            p.assignedSubfolders.includes(String(subfolderId)))
        ) {
          return true;
        }
        return (
          p.assignedSubfolders.includes(subfolderName) ||
          p.assignedSubfolders.includes(`${folder.name}:::${subfolderName}`) ||
          p.assignedSubfolders.includes(fullPathKey) ||
          p.assignedSubfolders.some((sf) => String(sf).endsWith(`:::${subfolderName}`))
        );
      })
      .map((p) => p.id);
  });

  const [search, setSearch] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const togglePub = (pubId: string) => {
    setSelectedPubIds((prev) =>
      prev.includes(pubId) ? prev.filter((id) => id !== pubId) : [...prev, pubId],
    );
  };

  const handleSelectAll = () => {
    setSelectedPubIds(publishers.map((p) => p.id));
  };

  const handleClear = () => {
    setSelectedPubIds([]);
  };

  const handleConfirmSave = () => {
    setShowConfirmation(false);
    onSave(selectedPubIds);
  };

  const findSubfolderNode = (
    subs: SubfolderInfo[] = [],
  ): SubfolderInfo | undefined => {
    for (const sf of subs) {
      if (
        (subfolderId &&
          (sf.sub_folder_id === subfolderId ||
            sf.id === subfolderId ||
            sf.id === String(subfolderId))) ||
        sf.name === subfolderName
      ) {
        return sf;
      }
      const children =
        sf.subfolders ||
        (sf as any).children ||
        (sf as any).sub_sub_folders ||
        [];
      const found = findSubfolderNode(children);
      if (found) return found;
    }
    return undefined;
  };

  const currentSubfolder = findSubfolderNode(folder.subfolders);

  const filtered = publishers.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
  });

  const displayTitle =
    subfolderPath && subfolderPath.length > 0
      ? subfolderPath.join(" / ")
      : subfolderName;

  return (
    <>
      <Modal
      title={`Manage Subfolder Publishers · ${displayTitle}`}
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 text-xs">
        {/* Subfolder info banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] font-bold text-primary">
              0{folder.number}. {folder.name}
            </span>
            {subfolderPath && subfolderPath.length > 0 ? (
              subfolderPath.map((seg, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      idx === subfolderPath.length - 1
                        ? "font-bold text-foreground bg-primary/15 text-primary"
                        : "text-muted-foreground font-medium"
                    }`}
                  >
                    {seg}
                  </span>
                </React.Fragment>
              ))
            ) : (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-bold text-foreground bg-primary/15 text-primary px-2 py-0.5 rounded text-xs">
                  {currentSubfolder?.letter ? `${currentSubfolder.letter}. ` : ""}
                  {subfolderName}
                </span>
              </>
            )}
          </div>
          {currentSubfolder?.description && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {currentSubfolder.description}
            </p>
          )}
          <p className="text-[10.5px] text-muted-foreground/80">
            Publishers checked below are delegated access to manage, upload, and control documents
            in this specific subfolder.
          </p>
        </div>

        {/* Search & Bulk actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter publishers..."
              className="dms-input h-8 w-full !pl-8 !pr-3 text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] shrink-0">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              Select All
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Publishers list */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filtered.map((pub) => {
            const isAssigned = selectedPubIds.includes(pub.id);
            const hasParentAccess = pub.assignedFolders.includes(folder.name);

            return (
              <label
                key={pub.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${isAssigned
                  ? "border-primary/50 bg-primary/5 shadow-2xs"
                  : "border-border/60 bg-card hover:bg-muted/40 text-muted-foreground"
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isAssigned}
                    onChange={() => togglePub(pub.id)}
                    className="accent-primary rounded size-3.5 cursor-pointer shrink-0"
                  />
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px] shrink-0">
                    {pub.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-xs text-foreground truncate">{pub.name}</p>
                      <span className="text-[10px] text-muted-foreground">
                        ({pub.department} · {pub.location})
                      </span>
                    </div>
                    <p className="text-[10.5px] text-muted-foreground truncate">{pub.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAssigned ? (
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9.5px] font-bold text-emerald-700 dark:text-emerald-400">
                      Assigned
                    </span>
                  ) : hasParentAccess ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[9.5px] text-muted-foreground">
                      Folder Member
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[9.5px] text-muted-foreground">
                      Not Assigned
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-3">
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
            <Button
              type="button"
              size="sm"
              onClick={() => setShowConfirmation(true)}
              className="gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="h-5 w-5" />
              <span>Save Assignments ({selectedPubIds.length})</span>
            </Button>
          </div>
        </div>
      </div>
      </Modal>

      {showConfirmation && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-white p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-900">
              Confirm Subfolder Publisher Assignments
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              Are you sure you want to save publisher assignments for{" "}
              <span className="font-semibold">{subfolderName}</span>?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>

              <Button type="button" onClick={handleConfirmSave}>
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

