import React, { useMemo, useState, useEffect } from "react";
import {
  AlertTriangle,
  Check,
  ShieldCheck,
  ArrowRightLeft,
  ChevronDown,
  Folder,
  FolderPlus,
  Info,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import { Modal } from "../Common/Modal";
import type { DocumentRecord, FolderDefinition } from "../types";
import { FOLDER_AVAILABLE_ICONS, FOLDER_ICON_MAP } from "../initial-data";

export function CreateFolderModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, description: string, iconKey: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Folder");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Folder name is required");
      return;
    }
    onCreate(name.trim(), description.trim(), selectedIcon);
  };

  return (
    <Modal title="Create New Primary Folder" onClose={onClose} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-5 w-5 text-primary" /> Admin Folder Creation
          </p>
          <p className="text-[11px] mt-0.5">
            Create a top-level workspace folder module. Documents, drawings, and sub-folders can be
            filed and governed within it.
          </p>
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">
            Folder Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. Cathodic Protection & Integrity"
            className="dms-input h-9 w-full px-3 text-xs"
            autoFocus
          />
          {error && <p className="text-destructive text-[11px] mt-1">{error}</p>}
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Corrosion prevention, CP survey logs, TR units, and test lead records."
            rows={3}
            className="dms-input w-full p-2.5 text-xs resize-none hide-scrollbar"
          />
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1.5">Folder Icon</label>
          <div className="grid grid-cols-5 gap-2">
            {FOLDER_AVAILABLE_ICONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = selectedIcon === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedIcon(item.key)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-all cursor-pointer ${isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-xs font-semibold ring-1 ring-primary"
                    : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  title={item.label}
                >
                  <IconComp className="h-5 w-5" />
                  <span className="text-[9px] truncate max-w-full">{item.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-8 min-w-[84px] rounded-md px-3 text-xs font-medium cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="h-8 min-w-[152px] rounded-md px-4 text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>Create Folder</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function CreateSubfolderModal({
  parentFolder,
  folders,
  onClose,
  onCreate,
}: {
  parentFolder: string;
  folders: FolderDefinition[];
  onClose: () => void;
  onCreate: (parentFolderName: string, name: string, description: string, letter?: string) => void;
}) {
  const [selectedParent, setSelectedParent] = useState(parentFolder);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [letter, setLetter] = useState("");
  const [error, setError] = useState("");

  const parentDef = folders.find((f) => f.name === selectedParent);
  const defaultLetter = useMemo(() => {
    const count = parentDef?.subfolders?.length || 0;
    return String.fromCharCode(97 + count);
  }, [parentDef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Sub-folder name is required");
      return;
    }
    onCreate(selectedParent, name.trim(), description.trim(), letter.trim() || defaultLetter);
  };

  return (
    <Modal title={`Add Sub-folder · ${selectedParent}`} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-foreground mb-1">Primary Parent Folder</label>
          <div className="relative">
            <select
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
              className="dms-input h-9 w-full appearance-none pr-7 pl-3 text-xs cursor-pointer"
            >
              {folders.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.number}. {f.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-1">
            <label className="block font-semibold text-foreground mb-1">Letter / Code</label>
            <input
              type="text"
              value={letter || defaultLetter}
              readOnly
              placeholder={defaultLetter}
              maxLength={3}
              className="dms-input h-9 w-full px-2.5 font-mono text-center text-xs bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="col-span-3">
            <label className="block font-semibold text-foreground mb-1">
              Sub-folder Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Annual CP Surveys"
              className="dms-input h-9 w-full px-3 text-xs"
              autoFocus
            />
          </div>
        </div>
        {error && <p className="text-destructive text-[11px] mt-1">{error}</p>}

        <div>
          <label className="block font-semibold text-foreground mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Annual close interval potential survey data, reports, and defect logs."
            rows={3}
            className="dms-input w-full p-2.5 text-xs resize-none"
          />
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
          <Button type="submit" size="sm" className="gap-1.5 cursor-pointer">
            <Plus className="h-5 w-5" />
            <span>Add Sub-folder</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

type NestedSubfolderInfo = {
  id?: number | string;
  sub_folder_id?: number;
  name: string;
  code?: string;
  letter?: string;
  description?: string;
  subfolders?: NestedSubfolderInfo[];
};

type CreateNestedSubfolderModalProps = {
  parentFolder: string;
  parentPath: string[];
  parentSubfolderId: number;
  parentSubfolder: NestedSubfolderInfo;
  onClose: () => void;
  onCreate: (
    parentFolderName: string,
    parentSubfolderId: number,
    name: string,
    description: string,
    code: string,
  ) => void;
};

export function CreateNestedSubfolderModal({
  parentFolder,
  parentPath,
  parentSubfolderId,
  parentSubfolder,
  onClose,
  onCreate,
}: CreateNestedSubfolderModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultCode = useMemo(() => {
    const childCount = parentSubfolder.subfolders?.length ?? 0;
    return String(childCount + 1);
  }, [parentSubfolder.subfolders]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Sub-folder name is required");
      return;
    }

    if (!Number.isFinite(parentSubfolderId) || parentSubfolderId <= 0) {
      setError("The selected parent folder has an invalid ID");
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      onCreate(
        parentFolder,
        parentSubfolderId,
        name.trim(),
        description.trim(),
        defaultCode,
      );
    } catch {
      setError("Unable to create the sub-folder");
      setIsSubmitting(false);
    }
  };

  const fullParentPath = [
    parentFolder,
    ...parentPath,
    parentSubfolder.name,
  ].filter(Boolean);

  return (
    <Modal
      title="Create Nested Sub-folder"
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 text-xs"
      >
        <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-muted-foreground">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Folder className="h-5 w-5" />
            <span>Create Sub-folder</span>
          </div>

          <p className="mt-2 text-[11px]">
            <span className="font-semibold text-foreground">
              Parent Path:
            </span>
            <br />
            <span className="break-words">
              {fullParentPath.join(" / ")}
            </span>
          </p>
        </div>

        <div>
          <label className="mb-1 block font-semibold text-foreground">
            Number / Code
          </label>

          <input
            type="text"
            value={defaultCode}
            readOnly
            className="dms-input h-9 w-full cursor-not-allowed bg-gray-100 px-3 font-mono text-xs"
          />
        </div>

        <div>
          <label className="mb-1 block font-semibold text-foreground">
            Sub-folder Name{" "}
            <span className="text-destructive">*</span>
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);

              if (error) {
                setError("");
              }
            }}
            placeholder="Enter sub-folder name"
            className="dms-input h-9 w-full px-3 text-xs"
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="mb-1 block font-semibold text-foreground">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            rows={3}
            className="dms-input w-full resize-none p-2.5 text-xs"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <p className="text-[11px] text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            className="gap-1.5 cursor-pointer"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4" />
            <span>
              {isSubmitting ? "Creating..." : "Create Sub-folder"}
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function CreateSubSubfolderModal({
  parentFolder,
  parentSubfolder,
  folders,
  onClose,
  onCreate,
}: {
  parentFolder: string;
  parentSubfolder: string;
  folders: FolderDefinition[];
  onClose: () => void;
  onCreate: (
    parentFolderName: string,
    parentSubfolderName: string,
    name: string,
    description: string,
    numberCode?: string,
  ) => void;
}) {
  const parentFolderDef = folders.find((f) => f.name === parentFolder);

  const findSubByName = (
    subs: FolderDefinition["subfolders"] = [],
    target: string,
  ): any => {
    for (const sf of subs) {
      if (sf.name === target) return sf;
      const found = findSubByName(sf.subfolders, target);
      if (found) return found;
    }
    return undefined;
  };

  const parentSubDef = findSubByName(
    parentFolderDef?.subfolders,
    parentSubfolder,
  );

  const parentSubfolderId = Number(
    parentSubDef?.id ?? parentSubDef?.sub_folder_id ?? 0,
  );

  return (
    <CreateNestedSubfolderModal
      parentFolder={parentFolder}
      parentPath={[]}
      parentSubfolderId={parentSubfolderId}
      parentSubfolder={
        parentSubDef ?? {
          name: parentSubfolder,
          subfolders: [],
        }
      }
      onClose={onClose}
      onCreate={(pFolder, _pSubId, name, desc, code) => {
        onCreate(pFolder, parentSubfolder, name, desc, code);
      }}
    />
  );
}


export function RenameModal({
  type,
  currentName,
  parentFolder,
  parentSubfolder,
  docCount,
  onClose,
  onConfirm,
}: {
  type: "folder" | "subfolder" | "subsubfolder";
  currentName: string;
  parentFolder?: string | undefined;
  parentSubfolder?: string | undefined;
  docCount: number;
  onClose: () => void;
  onConfirm: (newName: string) => void;
}) {
  const [newName, setNewName] = useState(currentName);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }
    if (trimmed === currentName) {
      onClose();
      return;
    }
    if (!confirmed && docCount > 0) {
      setConfirmed(true);
      return;
    }
    onConfirm(trimmed);
  };

  const typeLabel =
    type === "folder" ? "Folder" : type === "subfolder" ? "Sub-folder" : "Sub-sub folder";

  return (
    <Modal title={`Rename ${typeLabel}`} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {parentFolder && (
          <div className="rounded-md border border-border bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
            Folder: <strong className="text-foreground">{parentFolder}</strong>
            {parentSubfolder && (
              <>
                {" "}
                · Sub-folder: <strong className="text-foreground">{parentSubfolder}</strong>
              </>
            )}
          </div>
        )}

        <div>
          <label className="block font-semibold text-foreground mb-1">Current Name</label>
          <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs font-mono text-muted-foreground">
            {currentName}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">
            New Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              if (error) setError("");
              setConfirmed(false);
            }}
            placeholder="Enter new name"
            className="dms-input h-9 w-full px-3 text-xs"
            autoFocus
          />
          {error && <p className="text-destructive text-[11px] mt-1">{error}</p>}
        </div>

        {docCount > 0 && (
          <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 space-y-1.5">
            <p className="font-semibold text-primary flex items-center gap-1.5">
              <Info className="h-5 w-5" /> Associated Documents Notice
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              This {typeLabel.toLowerCase()} contains{" "}
              <strong className="text-foreground">{docCount} document(s)</strong>. Renaming will
              automatically update all document metadata and folder references.
            </p>
          </div>
        )}

        {confirmed && docCount > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-700 dark:text-amber-400 animate-in fade-in duration-150">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-5 w-5" /> Confirmation Required
            </p>
            <p className="mt-0.5">
              Are you sure you want to rename &apos;{currentName}&apos; to &apos;{newName.trim()}
              &apos;? Click &quot;Confirm Rename&quot; to proceed.
            </p>
          </div>
        )}

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
          <Button type="submit" size="sm" className="gap-1.5 cursor-pointer">
            <Pencil className="h-5 w-5" />
            <span>{confirmed || docCount === 0 ? "Confirm Rename" : "Rename"}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function EditDescriptionModal({
  type,
  currentName,
  parentFolder,
  currentDescription,
  onClose,
  onConfirm,
}: {
  type: "folder" | "subfolder" | "subsubfolder";
  currentName: string;
  parentFolder?: string;
  currentDescription: string;
  onClose: () => void;
  onConfirm: (description: string) => void | Promise<void>;
}) {
  const [description, setDescription] = useState(currentDescription);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving) return;

    if (description.trim() === currentDescription.trim()) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);
      await onConfirm(description);
    } finally {
      setIsSaving(false);
    }
  };

  const typeLabel = type === "folder" ? "Folder" : "Sub-folder";

  return (
    <Modal
      title={`Edit ${typeLabel} Description`}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Folder information */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-start gap-2">
            <Folder className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {typeLabel} Name
              </p>

              <p className="mt-1 break-words text-sm font-semibold text-foreground">
                {currentName}
              </p>

              {parentFolder && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Parent Folder: {parentFolder}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Editable description */}
        <div>
          <label
            htmlFor="folder-description"
            className="mb-1.5 block font-semibold text-foreground"
          >
            Description
          </label>

          <textarea
            id="folder-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Enter ${typeLabel.toLowerCase()} description`}
            rows={5}
            maxLength={2000}
            autoFocus
            className="dms-input w-full resize-y rounded-lg p-3 text-xs leading-relaxed"
          />

          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-[10px] text-muted-foreground">
              Update the description without changing the name.
            </p>

            <span className="shrink-0 text-[10px] text-muted-foreground">
              {description.length}/2000
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
            className="min-w-[84px] cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            className="min-w-[140px] cursor-pointer gap-1.5"
          >
            <Pencil className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function BlockedDeleteModal({
  type,
  name,
  parentFolder,
  parentSubfolder,
  docCount,
  onClose,
}: {
  type: "folder" | "subfolder" | "subsubfolder";
  name: string;
  parentFolder?: string | undefined;
  parentSubfolder?: string | undefined;
  docCount: number;
  onClose: () => void;
}) {
  const typeLabel =
    type === "folder" ? "Folder" : type === "subfolder" ? "Sub-folder" : "Sub-sub folder";

  return (
    <Modal title={`Cannot Delete ${typeLabel}`} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/20 text-destructive shrink-0">
            <ShieldAlert className="size-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="font-bold text-sm text-destructive">
              Deletion Disallowed: Documents Present
            </h3>
            <p className="text-xs text-foreground/85 leading-relaxed">
              The {typeLabel.toLowerCase()}{" "}
              <strong className="font-mono bg-background/50 px-1 py-0.5 rounded border border-border">
                {name}
              </strong>{" "}
              {parentFolder
                ? `under "${parentFolder}${parentSubfolder ? ` / ${parentSubfolder}` : ""}" `
                : ""}
              contains{" "}
              <strong className="text-destructive font-bold">{docCount} document(s)</strong>.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3.5 space-y-2 text-muted-foreground">
          <p className="font-semibold text-foreground text-xs">
            Compliance & Integrity Protection Rule:
          </p>
          <p className="text-[11px] leading-relaxed">
            In accordance with PMHBL Controlled Document Management policies, folders and
            sub-folders containing active or archived records cannot be deleted.
          </p>
          <p className="text-[11px] leading-relaxed font-medium text-foreground">
            To delete this {typeLabel.toLowerCase()}, please first relocate or delete all{" "}
            {docCount} document(s) located within it.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button type="button" size="sm" onClick={onClose} className="cursor-pointer">
            Understood
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ConfirmDeleteModal({
  type,
  name,
  parentFolder,
  parentSubfolder,
  onClose,
  onConfirm,
}: {
  type: "folder" | "subfolder" | "subsubfolder";
  name: string;
  parentFolder?: string | undefined;
  parentSubfolder?: string | undefined;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const typeLabel =
    type === "folder" ? "Folder" : type === "subfolder" ? "Sub-folder" : "Sub-sub folder";

  return (
    <Modal title={`Confirm ${typeLabel} Deletion`} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/15 text-destructive shrink-0">
            <Trash2 className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-foreground">
              Are you sure you want to delete this {typeLabel.toLowerCase()}?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You are about to delete{" "}
              <strong className="text-foreground font-mono bg-muted px-1.5 py-0.5 rounded border border-border">
                {name}
              </strong>
              {parentFolder
                ? ` from "${parentFolder}${parentSubfolder ? ` / ${parentSubfolder}` : ""}"`
                : ""}
              .
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 text-[11px] text-emerald-700 dark:text-emerald-400">
          <p className="font-semibold flex items-center gap-1.5">
            <Check className="h-5 w-5" /> Safe to Remove
          </p>
          <p className="mt-0.5">
            This {typeLabel.toLowerCase()} contains 0 documents or files. No records will be lost.
          </p>
        </div>

        <p className="text-[11px] text-destructive/90 font-medium">
          ⚠️ This action cannot be undone.
        </p>

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
            className="gap-1.5 cursor-pointer"
          >
            <Trash2 className="h-5 w-5" />
            <span>Delete {typeLabel}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ConfirmMoveModal({
  subfolderName,
  sourceFolder,
  initialTargetFolder,
  folders,
  docCount,
  subFolderId,
  fetchPreview,
  onClose,
  onConfirm,
}: {
  subfolderName: string;
  sourceFolder: string;
  initialTargetFolder?: string | undefined;
  folders: FolderDefinition[];
  docCount: number;
  subFolderId?: number | undefined;
  fetchPreview?: (
    subFolderId: number,
    destinationFolderId: number,
    parentSubFolderId?: number | null,
  ) => Promise<any>;
  onClose: () => void;
  onConfirm: (targetFolder: string, parentSubFolderId?: number | null) => void;
}) {
  type DestinationOption = {
    key: string;
    folderName: string;
    folderId: number;
    parentSubFolderId: number | null;
    label: string;
    path: string;
  };

  const getSubfolderId = (subfolder: any): number | undefined => {
    const id = Number(subfolder?.sub_folder_id ?? subfolder?.id);
    return Number.isFinite(id) && id > 0 ? id : undefined;
  };

  const sourceFolderDef = folders.find((folder) => folder.name === sourceFolder);
  const findById = (nodes: any[] = [], id?: number): any => {
    if (!id) return undefined;
    for (const node of nodes) {
      if (getSubfolderId(node) === id) return node;
      const found = findById(node.subfolders || [], id);
      if (found) return found;
    }
    return undefined;
  };
  const findByName = (nodes: any[] = [], name: string): any => {
    for (const node of nodes) {
      if (node.name === name) return node;
      const found = findByName(node.subfolders || [], name);
      if (found) return found;
    }
    return undefined;
  };

  const sourceNode = findById(sourceFolderDef?.subfolders || [], subFolderId) ||
    findByName(sourceFolderDef?.subfolders || [], subfolderName);
  const sourceNodeId = getSubfolderId(sourceNode);
  const findPath = (nodes: any[] = [], targetId?: number, ancestors: string[] = []): string[] | undefined => {
    for (const node of nodes) {
      const path = [...ancestors, node.name];
      if (targetId && getSubfolderId(node) === targetId) return path;
      const nestedPath = findPath(node.subfolders || [], targetId, path);
      if (nestedPath) return nestedPath;
    }
    return undefined;
  };
  const sourcePath = [sourceFolder, ...(findPath(sourceFolderDef?.subfolders || [], sourceNodeId) || [sourceNode?.name || subfolderName])].join(" / ");
  const excludedSubfolderIds = new Set<number>();
  const collectDescendantIds = (node: any) => {
    const id = getSubfolderId(node);
    if (id) excludedSubfolderIds.add(id);
    (node?.subfolders || []).forEach(collectDescendantIds);
  };
  collectDescendantIds(sourceNode);

  const destinationOptions: DestinationOption[] = [];
  folders.forEach((folder) => {
    const folderId = Number(folder.id ?? folder.number);
    if (!Number.isFinite(folderId) || folderId <= 0) return;

    const rootKey = `${folderId}:root`;
    destinationOptions.push({
      key: rootKey,
      folderName: folder.name,
      folderId,
      parentSubFolderId: null,
      label: `${folder.number ?? ""}. ${folder.name} (Primary folder root)`.trim(),
      path: folder.name,
    });

    const walk = (nodes: any[] = [], parentPath: string[] = []) => {
      nodes.forEach((node) => {
        const nodeId = getSubfolderId(node);
        const pathParts = [...parentPath, node.name];
        if (nodeId) {
          destinationOptions.push({
            key: `${folderId}:${nodeId}`,
            folderName: folder.name,
            folderId,
            parentSubFolderId: nodeId,
            label: `${folder.name} / ${pathParts.join(" / ")}`,
            path: `${folder.name} / ${pathParts.join(" / ")}`,
          });
        }
        walk(node.subfolders || [], pathParts);
      });
    };
    walk(folder.subfolders || []);
  });

  const currentParentId = sourceNode?.parent_sub_folder_id == null
    ? null
    : Number(sourceNode.parent_sub_folder_id);
  const validDestinationOptions = destinationOptions.filter((option) => {
    if (option.parentSubFolderId != null && excludedSubfolderIds.has(option.parentSubFolderId)) {
      return false;
    }
    // Do not offer the current parent as a destination (a no-op move).
    if (
      option.folderName === sourceFolder &&
      option.parentSubFolderId === currentParentId
    ) {
      return false;
    }
    return true;
  });

  const initialOption = validDestinationOptions.find(
    (option) => option.folderName === initialTargetFolder && option.parentSubFolderId === null,
  ) || validDestinationOptions[0];
  const [selectedDestinationKey, setSelectedDestinationKey] = useState<string>(initialOption?.key || "");
  const selectedDestination = validDestinationOptions.find(
    (option) => option.key === selectedDestinationKey,
  );
  const [currentDocCount, setCurrentDocCount] = useState<number>(docCount);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  useEffect(() => {
    setCurrentDocCount(docCount);
  }, [docCount]);

  useEffect(() => {
    if (!fetchPreview || !selectedDestination) return;
    const resolvedSubId = sourceNodeId;
    if (!resolvedSubId || !selectedDestination.folderId) return;

    let cancelled = false;
    setIsLoadingPreview(true);
    fetchPreview(
      resolvedSubId,
      selectedDestination.folderId,
      selectedDestination.parentSubFolderId,
    )
      .then((preview) => {
        if (!cancelled && preview && typeof preview.affected_documents_count === "number") {
          setCurrentDocCount(preview.affected_documents_count);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPreview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDestinationKey, sourceNodeId, fetchPreview]);

  return (
    <Modal title="Confirm Move Sub-folder" onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <ArrowRightLeft className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-800">Move Sub-folder</h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Choose a primary folder or any nested subfolder as the destination for{" "}
              <strong className="font-semibold text-blue-700">{subfolderName}</strong>.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-medium text-slate-500">Source</span>
            <span className="max-w-[70%] text-right text-sm font-semibold text-slate-800 break-words">
              {sourcePath}
            </span>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
              <ChevronDown className="size-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Destination <span className="ml-1 text-red-500">*</span>
            </label>
            <select
              value={selectedDestinationKey}
              onChange={(event) => setSelectedDestinationKey(event.target.value)}
              className="dms-input h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              {validDestinationOptions.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
            {selectedDestination && (
              <p className="mt-2 break-words text-[11px] text-slate-500">
                Destination path: <span className="font-medium text-slate-700">{selectedDestination.path}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <span className="text-xs font-medium text-slate-500">Affected Documents</span>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {isLoadingPreview ? "Checking..." : `${currentDocCount} document(s)`}
            </span>
          </div>
        </div>

        <p className="text-xs leading-5 text-slate-500">
          The subfolder and its descendants will move together. The backend will validate the destination and update the hierarchy.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}
            className="h-9 min-w-[88px] rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!selectedDestination}
            onClick={() => selectedDestination && onConfirm(
              selectedDestination.folderName,
              selectedDestination.parentSubFolderId,
            )}
            className="h-9 min-w-[140px] rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <Check className="h-5 w-5" />
            <span>Confirm Move</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ConfirmMoveSubSubfolderModal({
  subSubfolderName,
  sourceFolder,
  sourceSubfolder,
  subFolderId,
  initialTargetFolder,
  initialTargetSubfolder,
  folders,
  docCount,
  fetchPreview,
  onClose,
  onConfirm,
}: {
  subSubfolderName: string;
  sourceFolder: string;
  sourceSubfolder: string;
  subFolderId: number;
  initialTargetFolder?: string;
  initialTargetSubfolder?: string;
  folders: FolderDefinition[];
  docCount: number;
  fetchPreview?: (
    subFolderId: number,
    destinationFolderId: number,
    parentSubFolderId?: number | null,
  ) => Promise<any>;
  onClose: () => void;
  onConfirm: (
    subFolderId: number,
    destinationFolderId: number,
    parentSubFolderId: number | null,
  ) => Promise<void>;
}) {
  type DestinationOption = {
    key: string;
    folderId: number;
    folderName: string;
    parentSubFolderId: number | null;
    label: string;
    path: string;
  };

  const getSubfolderId = (subfolder: any): number | undefined => {
    const id = Number(subfolder?.sub_folder_id ?? subfolder?.id);

    return Number.isFinite(id) && id > 0 ? id : undefined;
  };

  const sourceFolderDef = folders.find(
    (folder) => folder.name === sourceFolder,
  );

  const findById = (nodes: any[], id: number): any => {
    for (const node of nodes) {
      if (getSubfolderId(node) === id) return node;

      const found = findById(node.subfolders || [], id);
      if (found) return found;
    }

    return undefined;
  };

  const sourceNode = findById(
    sourceFolderDef?.subfolders || [],
    subFolderId,
  );

  const excludedIds = new Set<number>();

  const collectDescendants = (node: any) => {
    const id = getSubfolderId(node);

    if (id) excludedIds.add(id);

    (node?.subfolders || []).forEach(collectDescendants);
  };

  collectDescendants(sourceNode);

  const destinationOptions: DestinationOption[] = [];

  folders.forEach((folder) => {
    const folderId = Number(folder.id ?? folder.number);

    if (!Number.isFinite(folderId) || folderId <= 0) return;

    destinationOptions.push({
      key: `${folderId}:root`,
      folderId,
      folderName: folder.name,
      parentSubFolderId: null,
      label: `${folder.number ?? ""}. ${folder.name} (Primary folder root)`.trim(),
      path: folder.name,
    });

    const walk = (nodes: any[], parentPath: string[] = []) => {
      nodes.forEach((node) => {
        const nodeId = getSubfolderId(node);
        const path = [...parentPath, node.name];

        if (nodeId && !excludedIds.has(nodeId)) {
          destinationOptions.push({
            key: `${folderId}:${nodeId}`,
            folderId,
            folderName: folder.name,
            parentSubFolderId: nodeId,
            label: `${folder.name} / ${path.join(" / ")}`,
            path: `${folder.name} / ${path.join(" / ")}`,
          });
        }

        walk(node.subfolders || [], path);
      });
    };

    walk(folder.subfolders || []);
  });

  const currentParentId =
    sourceNode?.parent_sub_folder_id == null
      ? null
      : Number(sourceNode.parent_sub_folder_id);

  const validDestinationOptions = destinationOptions.filter((option) => {
    if (
      option.folderName === sourceFolder &&
      option.parentSubFolderId === currentParentId
    ) {
      return false;
    }

    return true;
  });

  const initialOption =
    validDestinationOptions.find(
      (option) =>
        option.folderName === initialTargetFolder &&
        option.parentSubFolderId === null,
    ) || validDestinationOptions[0];

  const [selectedDestinationKey, setSelectedDestinationKey] =
    useState(initialOption?.key || "");

  const selectedDestination = validDestinationOptions.find(
    (option) => option.key === selectedDestinationKey,
  );

  const [currentDocCount, setCurrentDocCount] = useState(docCount);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    setCurrentDocCount(docCount);
  }, [docCount]);

  useEffect(() => {
    if (!fetchPreview || !selectedDestination) return;

    let cancelled = false;

    setIsLoadingPreview(true);

    fetchPreview(
      subFolderId,
      selectedDestination.folderId,
      selectedDestination.parentSubFolderId,
    )
      .then((preview) => {
        if (
          !cancelled &&
          typeof preview?.affected_documents_count === "number"
        ) {
          setCurrentDocCount(preview.affected_documents_count);
        }
      })
      .catch((error) => {
        console.error("Failed to preview subfolder move:", error);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPreview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDestinationKey, subFolderId, fetchPreview]);

  return (
    <Modal title="Confirm Move Sub-sub folder" onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary shrink-0">
            <ArrowRightLeft className="size-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="font-bold text-sm text-foreground">
              Move Sub-sub folder to Another Location
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to move sub-sub folder{" "}
              <strong className="text-primary font-semibold">{subSubfolderName}</strong>?
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Source Location:</span>
            <span className="font-semibold text-foreground truncate max-w-[240px] text-right">
              {sourceFolder} / {sourceSubfolder}
            </span>
          </div>
          <div className="flex items-center justify-center text-muted-foreground/60 py-0.5">
            <ChevronDown className="h-5 w-5" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-muted-foreground">
              Destination:
            </label>

            <select
              value={selectedDestinationKey}
              onChange={(e) => setSelectedDestinationKey(e.target.value)}
              className="dms-input h-9 w-full px-3 text-xs cursor-pointer"
            >
              {validDestinationOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>

            {selectedDestination && (
              <p className="break-words text-[11px] text-muted-foreground">
                Destination path: {selectedDestination.path}
              </p>
            )}
          </div>
          <div className="border-t border-border/70 pt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Affected Documents:</span>
            <span className="font-bold text-foreground">
              {isLoadingPreview
                ? "Checking..."
                : `${currentDocCount} document(s)`}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          All {docCount} document(s) filed under this sub-sub folder will be automatically updated
          with the new parent folder & sub-folder location.
        </p>

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
            type="submit"
            size="sm"
            disabled={!selectedDestination || isLoadingPreview}
            onClick={() => {
              if (!selectedDestination) return;

              void onConfirm(
                subFolderId,
                selectedDestination.folderId,
                selectedDestination.parentSubFolderId,
              );
            }}
            className="gap-1.5 cursor-pointer"
          >
            <Check className="h-5 w-5" />
            <span>Confirm Move</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ConfirmMoveDocumentModal({
  document,
  folders,
  initialTargetFolder,
  initialTargetSubfolder,
  initialTargetSubSubfolder,
  onClose,
  onConfirm,
}: {
  document: DocumentRecord;
  folders: FolderDefinition[];
  initialTargetFolder: string;
  initialTargetSubfolder?: string | undefined;
  initialTargetSubSubfolder?: string | undefined;
  onClose: () => void;
  onConfirm: (
    documentId: string,
    targetFolder: string,
    targetSubfolder?: string | undefined,
    targetSubSubfolder?: string | undefined,
  ) => void;
}) {
  const [selectedFolder, setSelectedFolder] = useState<string>(
    initialTargetFolder || document.folder || folders[0]?.name || "",
  );
  const targetFolderDef = folders.find((f) => f.name === selectedFolder);
  const availableSubfolders = targetFolderDef?.subfolders || [];
  const [selectedSubfolder, setSelectedSubfolder] = useState<string>(() => {
    if (
      initialTargetSubfolder &&
      availableSubfolders.some((s) => s.name === initialTargetSubfolder)
    ) {
      return initialTargetSubfolder;
    }
    return availableSubfolders[0]?.name || "";
  });

  const currentSubDef = availableSubfolders.find((s) => s.name === selectedSubfolder);
  const availableSubSubfolders = currentSubDef?.subfolders || [];
  const [selectedSubSubfolder, setSelectedSubSubfolder] = useState<string>(() => {
    if (
      initialTargetSubSubfolder &&
      availableSubSubfolders.some((ss) => ss.name === initialTargetSubSubfolder)
    ) {
      return initialTargetSubSubfolder;
    }
    return "";
  });

  const handleFolderChange = (folderName: string) => {
    setSelectedFolder(folderName);
    const def = folders.find((f) => f.name === folderName);
    const subs = def?.subfolders || [];
    setSelectedSubfolder(subs[0]?.name || "");
    setSelectedSubSubfolder("");
  };

  const handleSubfolderChange = (subName: string) => {
    setSelectedSubfolder(subName);
    setSelectedSubSubfolder("");
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      document.id,
      selectedFolder,
      selectedSubfolder || undefined,
      selectedSubSubfolder || undefined,
    );
  };

  const isSameLocation =
    document.folder === selectedFolder &&
    (document.subfolder || "") === (selectedSubfolder || "") &&
    (document.subSubfolder || "") === (selectedSubSubfolder || "");

  return (
    <Modal title={`Move Document · ${document.number}`} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleConfirm} className="space-y-4 text-xs">
        {/* Document Banner */}
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] font-semibold text-primary">{document.number}</p>
            <p className="font-semibold text-foreground text-xs leading-snug line-clamp-2 mt-0.5">
              {document.title}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[10.5px] text-muted-foreground">
              <span>{document.type}</span>
              <span>·</span>
              <span>{document.department}</span>
              <span>·</span>
              <span>{document.revision}</span>
            </div>
          </div>
        </div>

        {/* Path Relocation Visual */}
        <div className="rounded-lg border border-border bg-card p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Current Location:</span>
            <span className="font-semibold text-foreground text-right truncate max-w-[220px]">
              {document.folder || "Unassigned"}
              {document.subfolder ? ` / ${document.subfolder}` : ""}
              {document.subSubfolder ? ` / ${document.subSubfolder}` : ""}
            </span>
          </div>

          <div className="flex items-center justify-center text-primary/70 py-0.5">
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </div>

          {/* Target Folder Selector */}
          <div>
            <label className="block font-semibold text-foreground mb-1">
              Destination Folder <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedFolder}
                onChange={(e) => handleFolderChange(e.target.value)}
                className="dms-input h-9 w-full appearance-none pr-7 pl-3 text-xs cursor-pointer"
              >
                {folders.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.number}. {f.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Target Subfolder Selector */}
          <div>
            <label className="block font-semibold text-foreground mb-1">
              Destination Sub-folder
            </label>
            <div className="relative">
              <select
                value={selectedSubfolder}
                onChange={(e) => handleSubfolderChange(e.target.value)}
                className="dms-input h-9 w-full appearance-none pr-7 pl-3 text-xs cursor-pointer"
              >
                {availableSubfolders.length === 0 ? (
                  <option value="">(Root of folder — No sub-folders)</option>
                ) : (
                  <>
                    <option value="">(Root of folder)</option>
                    {availableSubfolders.map((sf) => (
                      <option key={sf.name} value={sf.name}>
                        {sf.letter}. {sf.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Target Sub-sub folder Selector */}
          {selectedSubfolder && availableSubSubfolders.length > 0 && (
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Destination Sub-sub folder{" "}
                <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <select
                  value={selectedSubSubfolder}
                  onChange={(e) => setSelectedSubSubfolder(e.target.value)}
                  className="dms-input h-9 w-full appearance-none pr-7 pl-3 text-xs cursor-pointer"
                >
                  <option value="">(Root of Sub-folder: {selectedSubfolder})</option>
                  {availableSubSubfolders.map((ssf) => (
                    <option key={ssf.name} value={ssf.name}>
                      {ssf.letter}. {ssf.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {isSameLocation && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Selected destination is identical to current location. Choose a different folder or
            sub-folder to move.
          </p>
        )}

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          The document will be relocated to the destination path. Governance, compliance rules, and
          audit logs will automatically reflect the change while preserving complete version
          history.
        </p>

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
            type="submit"
            size="sm"
            disabled={isSameLocation}
            className="gap-1.5 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <ArrowRightLeft className="h-5 w-5" />
            <span>Confirm Move Document</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

