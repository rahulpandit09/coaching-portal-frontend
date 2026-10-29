import React, { useMemo, useState } from "react";
import { Check, ChevronDown, Search, User, Users, X } from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import { Modal } from "../Common/Modal";
import type { EngineerGroup, EngineerUser } from "../types";

export function CreateGroupModal({
  group,
  engineers = [],
  onClose,
  onSave,
}: {
  group: EngineerGroup | null;
  engineers?: EngineerUser[];
  onClose: () => void;
  onSave: (groupData: {
    id?: string;
    name: string;
    description: string;
    department?: string;
    members: string[];
  }) => void;
}) {
  const [name, setName] = useState(group?.name || "");
  const [description, setDescription] = useState(group?.description || "");
  const [department, setDepartment] = useState(group?.department || "OP");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(group?.members || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const deptList = ["All", "OP", "HSE", "PROJECTS", "CS", "LE", "CROSS"];

  const filteredEngineers = useMemo(() => {
    return engineers.filter((eng) => {
      if (filterDept !== "All" && eng.department !== filterDept) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        eng.name.toLowerCase().includes(q) ||
        eng.role.toLowerCase().includes(q) ||
        eng.department.toLowerCase().includes(q) ||
        eng.location.toLowerCase().includes(q) ||
        eng.email.toLowerCase().includes(q)
      );
    });
  }, [engineers, filterDept, searchQuery]);

  const toggleMember = (engineerName: string) => {
    setSelectedMembers((prev) =>
      prev.includes(engineerName)
        ? prev.filter((n) => n !== engineerName)
        : [...prev, engineerName],
    );
  };

  const handleSelectAllFiltered = () => {
    const namesToAdd = filteredEngineers.map((e) => e.name);
    setSelectedMembers((prev) => Array.from(new Set([...prev, ...namesToAdd])));
  };

  const handleDeselectAll = () => {
    setSelectedMembers([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || selectedMembers.length === 0) return;

    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    onSave({
      ...(group?.id ? { id: group.id } : {}),
      name: name.trim(),
      description: description.trim(),
      department,
      members: selectedMembers,
    });

    setShowConfirmation(false);
  };

  return (
    <>
      <Modal
      title={group ? `Edit Engineer Group · ${group.name}` : "Create Engineer Group"}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Subtitle Banner */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-3">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-xs">
              {group
                ? "Modify Group Composition & Permissions"
                : "Engineer Cluster Access Delegation"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Define a team of engineers. When Publishers upload new controlled documents, they can
              select this group to grant access to all members in a single click, or search
              individual engineers.
            </p>
          </div>
        </div>

        {/* Form fields: Name, Department, Description */}
        <div className="space-y-3 rounded-lg border border-border bg-card/60 p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-foreground">
                Group Name <span className="text-destructive">*</span>
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pipeline Integrity Engineers"
                className="dms-input mt-1 h-8.5 w-full !px-2.5 text-xs bg-card"
              />
            </div>
            <div className="relative">
              <label className="block text-[11px] font-medium text-foreground">
                Discipline / Dept
              </label>

              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="dms-input mt-1 h-8.5 w-full appearance-none !pl-2 !pr-8 text-xs bg-card cursor-pointer"
              >
                <option value="OP">Operations (OP)</option>
                <option value="HSE">HSE & Fire Safety</option>
                <option value="PROJECTS">Projects & Civil</option>
                <option value="CS">Compliance & Inspection</option>
                <option value="LE">Legal & Contracts</option>
                <option value="CROSS">Cross-Functional</option>
              </select>

              <ChevronDown
                className="absolute right-3 bottom-2.5 h-4 w-4 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-foreground">
              Group Description & Scope
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Mainline inspection, cathodic protection, and valve maintenance team"
              className="dms-input mt-1 h-8.5 w-full !px-2.5 text-xs bg-card"
            />
          </div>
        </div>

        {/* Engineer Selection Section */}
        <div className="space-y-2.5 rounded-lg border border-border bg-card/60 p-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                Select Member Engineers
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Choose the engineers who belong to this group:
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="font-semibold text-primary">{selectedMembers.length}</span>
              <span className="text-muted-foreground">selected</span>
              <span className="text-border">·</span>
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Select filtered ({filteredEngineers.length})
              </button>
              <span className="text-border">·</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Selected chips row */}
          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 rounded-md bg-muted/40 border border-border/60 max-h-24 overflow-y-auto">
              {selectedMembers.map((engName) => (
                <span
                  key={engName}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary text-primary-foreground shadow-2xs"
                >
                  <span>{engName}</span>
                  <button
                    type="button"
                    onClick={() => toggleMember(engName)}
                    className="hover:bg-primary-foreground/20 rounded p-0.5 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search and Dept Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search engineers by name, role, terminal location..."
                className="dms-input h-8 w-full !pl-8 !pr-7 text-xs bg-card"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {deptList.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFilterDept(d)}
                  className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors shrink-0 ${filterDept === d
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Engineers Card List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {filteredEngineers.map((eng) => {
              const isSelected = selectedMembers.includes(eng.name);
              return (
                <div
                  key={eng.id}
                  onClick={() => toggleMember(eng.name)}
                  className={`flex items-start gap-2.5 rounded-lg border p-2.5 transition-all cursor-pointer ${isSelected
                    ? "border-primary bg-primary/10 text-foreground shadow-2xs"
                    : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => { }}
                    className="accent-primary mt-0.5 rounded cursor-pointer shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs truncate ${isSelected ? "font-bold text-primary" : "font-medium text-foreground"}`}
                      >
                        {eng.name}
                      </p>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded font-mono bg-muted text-muted-foreground shrink-0">
                        {eng.department} · {eng.location}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-muted-foreground truncate mt-0.5">
                      {eng.role}
                    </p>
                    <p className="text-[10px] text-muted-foreground/75 truncate">{eng.email}</p>
                  </div>
                </div>
              );
            })}
            {filteredEngineers.length === 0 && (
              <div className="sm:col-span-2 text-center py-6 text-muted-foreground text-xs">
                No engineers match your search criteria.
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!name.trim() || selectedMembers.length === 0}
            className="gap-1.5 shadow-md cursor-pointer font-semibold"
          >
            <Check className="h-5 w-5" />
            <span>{group ? "Update Group" : "Create Group"}</span>
          </Button>
        </div>
      </form>
      </Modal>

      {showConfirmation && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-white p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-900">
              {group ? "Confirm Group Update" : "Confirm Group Creation"}
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              {group
                ? "Are you sure you want to update this engineer group and its members?"
                : "Are you sure you want to create this engineer group with the selected members?"}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>

              <Button type="button" onClick={handleConfirmSubmit}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

