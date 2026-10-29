import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Archive,
  ArrowLeft,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Columns3,
  Grid2X2,
  LayoutList,
  List,
  PanelRight,
  Plus,
  RotateCcw,
  Rows3,
  Search,
  SlidersHorizontal,
  Lock,
  X,
} from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import type { DocumentRecord, FolderDefinition, Role, ViewMode } from "../types";


function usePopoverPosition(isOpen: boolean, onClose: () => void) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({
    top: 0,
    right: 0,
    maxHeight: 400,
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();

      if (!rect) return;

      const viewportPadding = 12;
      const gap = 8;

      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
      const spaceAbove = rect.top - viewportPadding;

      // Prefer opening below.
      // If there is very little space below and more space above,
      // open the popover above the button instead.
      const openAbove = spaceBelow < 280 && spaceAbove > spaceBelow;

      const maxHeight = Math.max(
        180,
        openAbove ? spaceAbove - gap : spaceBelow - gap
      );

      setPosition({
        top: openAbove
          ? Math.max(viewportPadding, rect.top - Math.min(maxHeight, spaceAbove) - gap)
          : rect.bottom + gap,
        right: Math.max(viewportPadding, window.innerWidth - rect.right),
        maxHeight,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  return { triggerRef, popoverRef, position };
}

export function DocumentsToolbar({
  selectedSubSubfolder,
  selectedSubfolder,
  selectedFolder,
  currentFolderDef,
  currentSubfolderDef,
  currentSubSubfolderDef,
  viewAllInFolder,
  filterLocation,
  filteredDocumentsCount,
  activeMainTab,
  selected,
  role,
  showColumns,
  setShowColumns,
  visibleColumns,
  setVisibleColumns,
  columns,
  toggleColumn,
  showFilters,
  setShowFilters,
  activeFilterCount,
  resetFilters,
  filterStatus,
  setFilterStatus,
  filterDepartment,
  setFilterDepartment,
  setFilterLocation,
  filterDocType,
  setFilterDocType,
  filterConfidential,
  setFilterConfidential,
  showSortMenu,
  setShowSortMenu,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  showViewMenu,
  setShowViewMenu,
  viewMode,
  setViewMode,
  showDetailsPane,
  setShowDetailsPane,
  previewDocId,
  setPreviewDocId,
  selectedId,
  setSelectedId,
  filteredDocuments,
  query,
  setQuery,
  onSelectFolder,
  setSelectedSubfolder,
  setSelectedSubSubfolder,
  setViewAllInFolder,
  onUnarchiveDocument,
  handleOpenAddForSubSubfolder,
  handleOpenAddForSubfolder,
}: {
  selectedSubSubfolder: string | null;
  selectedSubfolder: string | null;
  selectedFolder: string | null;
  currentFolderDef?: FolderDefinition | null;
  currentSubfolderDef?: any;
  currentSubSubfolderDef?: any;
  viewAllInFolder: boolean;
  filterLocation: string;
  filteredDocumentsCount: number;
  activeMainTab: string;
  selected: DocumentRecord | null;
  role: Role;
  showColumns: boolean;
  setShowColumns: React.Dispatch<React.SetStateAction<boolean>>;
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
  columns: string[];
  toggleColumn: (col: string) => void;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  activeFilterCount: number;
  resetFilters: () => void;
  filterStatus: string;
  setFilterStatus: (s: any) => void;
  filterDepartment: string;
  setFilterDepartment: (d: string) => void;
  setFilterLocation: (l: string) => void;
  filterDocType: string;
  setFilterDocType: (t: string) => void;
  filterConfidential: string;
  setFilterConfidential: (c: any) => void;
  showSortMenu: boolean;
  setShowSortMenu: React.Dispatch<React.SetStateAction<boolean>>;
  sortField: string | null;
  setSortField: (f: string | null) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  showViewMenu: boolean;
  setShowViewMenu: React.Dispatch<React.SetStateAction<boolean>>;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  showDetailsPane: boolean;
  setShowDetailsPane: React.Dispatch<React.SetStateAction<boolean>>;
  previewDocId: string | null;
  setPreviewDocId: (id: string | null) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  filteredDocuments: DocumentRecord[];
  query: string;
  setQuery: (q: string) => void;
  onSelectFolder: (name: string | null) => void;
  setSelectedSubfolder: (sf: string | null) => void;
  setSelectedSubSubfolder: (ssf: string | null) => void;
  setViewAllInFolder: (v: boolean) => void;
  onUnarchiveDocument: (id: string) => void;
  handleOpenAddForSubSubfolder: (f: string, sf: string, ssf: string) => void;
  handleOpenAddForSubfolder: (f: string, sf: string) => void;
}) {
  const columnsPopover = usePopoverPosition(showColumns, () => setShowColumns(false));
  const filtersPopover = usePopoverPosition(showFilters, () => setShowFilters(false));
  const sortPopover = usePopoverPosition(showSortMenu, () => setShowSortMenu(false));
  const viewPopover = usePopoverPosition(showViewMenu, () => setShowViewMenu(false));

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5 bg-muted/15">
        <div className="flex min-w-0 flex-1 items-center gap-2 flex-wrap">
          {/* Back Navigation Buttons */}
          {selectedSubSubfolder && selectedSubfolder && currentFolderDef && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedSubSubfolder(null);
              }}
              className="h-7.5 gap-1.5 px-2.5 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 cursor-pointer shadow-xs"
              title={`Return to all files in ${selectedSubfolder}`}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to {selectedSubfolder}</span>
            </Button>
          )}
          {!selectedSubSubfolder && selectedSubfolder && currentFolderDef && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedSubfolder(null);
                setSelectedSubSubfolder(null);
                setViewAllInFolder(false);
              }}
              className="h-7.5 gap-1.5 px-2.5 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 cursor-pointer shadow-xs"
              title="Return to subfolders grid"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Subfolders</span>
            </Button>
          )}
          {viewAllInFolder && currentFolderDef && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewAllInFolder(false)}
              className="h-7.5 gap-1.5 px-2.5 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 cursor-pointer shadow-xs"
              title="Return to subfolders grid"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Subfolders</span>
            </Button>
          )}
          {selectedFolder && !currentFolderDef?.subfolders?.length && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSelectFolder(null)}
              className="h-7 gap-1 px-2 text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer"
              title="Return to all folders"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>All Folders</span>
            </Button>
          )}
          {filterLocation !== "All" && !selectedFolder && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFilterLocation("All")}
              className="h-7.5 gap-1.5 px-2.5 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 cursor-pointer shadow-xs"
              title="Return to all folders"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>All Folders</span>
            </Button>
          )}

          {/* Breadcrumb Trail */}
          <div className="flex items-center gap-1.5 text-xs min-w-0">
            {activeMainTab === "archive" ? (
              <span className="font-semibold text-foreground">
                All Folders
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onSelectFolder(null);
                  setFilterLocation("All");
                }}
                className={`hover:text-primary transition-colors cursor-pointer font-medium ${!selectedFolder && filterLocation === "All"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
                  }`}
              >
                All Folders
              </button>
            )}
            {activeMainTab !== "archive" && filterLocation !== "All" && !selectedFolder && (
              <>
                <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  Station:{" "}
                  <span className="bg-[#1E6FBF] text-white px-2 py-0.5 rounded text-[11px] font-bold">
                    {filterLocation}
                  </span>
                </span>
              </>
            )}
            {activeMainTab !== "archive" && currentFolderDef && (
              <>
                <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubfolder(null);
                    setSelectedSubSubfolder(null);
                    setViewAllInFolder(false);
                  }}
                  className={`hover:text-primary transition-colors cursor-pointer truncate ${selectedSubfolder || viewAllInFolder
                    ? "text-muted-foreground font-medium"
                    : "text-foreground font-semibold"
                    }`}
                >
                  {currentFolderDef.number}. {currentFolderDef.name}
                </button>
              </>
            )}
            {activeMainTab !== "archive" && selectedSubfolder && (
              <>
                <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />
                {selectedSubSubfolder ? (
                  <button
                    type="button"
                    onClick={() => setSelectedSubSubfolder(null)}
                    className="hover:text-primary transition-colors cursor-pointer font-medium text-muted-foreground flex items-center gap-1 truncate"
                    title={`Return to ${selectedSubfolder}`}
                  >
                    {currentSubfolderDef && (
                      <span className="font-mono text-primary">
                        {currentSubfolderDef.letter}.
                      </span>
                    )}
                    {selectedSubfolder}
                  </button>
                ) : (
                  <span className="font-semibold text-foreground flex items-center gap-1 truncate">
                    {currentSubfolderDef && (
                      <span className="font-mono text-primary">
                        {currentSubfolderDef.letter}.
                      </span>
                    )}
                    {selectedSubfolder}
                  </span>
                )}
              </>
            )}
            {activeMainTab !== "archive" && selectedSubSubfolder && (
              <>
                <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />
                <span className="font-semibold text-foreground flex items-center gap-1 truncate">
                  {currentSubSubfolderDef && (
                    <span className="font-mono text-primary">
                      {currentSubSubfolderDef.letter}.
                    </span>
                  )}
                  {selectedSubSubfolder}
                </span>
              </>
            )}
            {activeMainTab !== "archive" && viewAllInFolder && (
              <>
                <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />
                <span className="font-semibold text-foreground">All Files</span>
              </>
            )}
          </div>

          <span className="text-xs text-muted-foreground shrink-0 font-normal">
            ({filteredDocumentsCount}{" "}
            {filteredDocumentsCount === 1 ? "record" : "records"})
          </span>
        </div>

        {/* Sub-folder / Sub-sub folder Add Document Button */}
        {selectedSubSubfolder &&
          selectedSubfolder &&
          currentFolderDef &&
          role === "Publisher" ? (
          <Button
            size="sm"
            onClick={() =>
              handleOpenAddForSubSubfolder(
                currentFolderDef.name,
                selectedSubfolder,
                selectedSubSubfolder,
              )
            }
            className="h-7.5 gap-1.5 px-3 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs shrink-0"
            title={`Add document to ${selectedSubSubfolder} (prefilled form)`}
          >
            <Plus className="h-5 w-5" />
            <span>Add to this sub-sub folder</span>
          </Button>
        ) : selectedSubfolder && currentFolderDef && role === "Publisher" ? (
          <Button
            size="sm"
            onClick={() =>
              handleOpenAddForSubfolder(currentFolderDef.name, selectedSubfolder)
            }
            className="h-7.5 gap-1.5 px-3 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs shrink-0"
            title={`Add document to ${selectedSubfolder} (prefilled form)`}
          >
            <Plus className="h-5 w-5" />
            <span>Add to this sub-folder</span>
          </Button>
        ) : null}

        {/* Columns Popover */}
        <div className="relative z-30 flex items-center justify-end gap-2">
          <div className="relative">
          <button
            ref={columnsPopover.triggerRef}
            type="button"
            onClick={() => {
              setShowColumns((value) => !value);
              setShowFilters(false);
              setShowViewMenu(false);
            }}
            className={`dms-quiet-button cursor-pointer ${showColumns ? "bg-muted text-foreground" : ""}`}
          >
            <Columns3 className="h-5 w-5" />
            <span>Columns</span>
            {visibleColumns.length !== columns.length && (
              <span className="rounded-full bg-primary/15 px-1 text-[10px] font-bold text-primary">
                {visibleColumns.length}
              </span>
            )}
          </button>
          {showColumns && createPortal(
            <div
              ref={columnsPopover.popoverRef}
              className="fixed z-[9999] w-[280px] flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150 p-3"
              style={{
                top: `${columnsPopover.position.top}px`,
                right: `${columnsPopover.position.right}px`,
                maxHeight: `${columnsPopover.position.maxHeight}px`,
              }}
            >
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Visible columns ({visibleColumns.length}/{columns.length})
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleColumns(columns)}
                  className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
                {columns.map((column) => {
                  const checked = visibleColumns.includes(column);
                  return (
                    <label
                      key={column}
                      className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/60 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const nextVisibleColumns = checked
                            ? visibleColumns.filter((col) => col !== column)
                            : [...visibleColumns, column];

                          // Preserve the original column order.
                          const orderedVisibleColumns = columns.filter((col) =>
                            nextVisibleColumns.includes(col)
                          );

                          setVisibleColumns(orderedVisibleColumns);
                        }}
                        className="accent-primary rounded cursor-pointer"
                      />
                      <span
                        className={`text-xs ${checked ? "font-medium text-foreground" : "text-muted-foreground"}`}
                      >
                        {column}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* Filter Popover */}
        <div className="relative">
          <button
            ref={filtersPopover.triggerRef}
            type="button"
            className={`dms-icon-button relative cursor-pointer ${showFilters || activeFilterCount > 0 ? "is-active text-primary border-primary/40 bg-primary/10" : ""}`}
            aria-label="Filter records"
            title="Filter records"
            onClick={() => {
              setShowFilters((value) => !value);
              setShowColumns(false);
              setShowViewMenu(false);
            }}
          >
            <SlidersHorizontal className="h-5 w-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
          {showFilters && createPortal(
            <div
              ref={filtersPopover.popoverRef}
              className="fixed z-[9999] w-[400px] overflow-hidden rounded-xl border border-border bg-white shadow-xl text-xs animate-in fade-in zoom-in-95 duration-150 flex flex-col p-4"
              style={{
                top: `${filtersPopover.position.top}px`,
                right: `${filtersPopover.position.right}px`,
                maxHeight: `${filtersPopover.position.maxHeight}px`,
              }}
            >
              <div className="flex items-center justify-between border-b border-border pb-2.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Filter Records</span>
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                      {activeFilterCount} active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Reset all
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2 py-2 space-y-2.5">
                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {(["All", "Controlled", "Review", "Archived"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFilterStatus(st)}
                        className={`rounded-md px-2 py-0.8 text-[11px] font-medium transition-colors cursor-pointer border ${filterStatus === st
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                          }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="dms-input h-8 w-full appearance-none pr-7 pl-2 text-xs font-medium"
                    >
                      <option value="All">All Departments</option>
                      {["OP", "HR", "PR", "LE", "CS", "IT", "HSE", "PROJECTS", "FI"].map(
                        (d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ),
                      )}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <select
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="dms-input h-8 w-full appearance-none pr-7 pl-2 text-xs font-medium"
                    >
                      <option value="All">All Locations</option>
                      {["HO BLR", "MLR", "NER", "HSN", "DKN"].map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                {/* Document Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                    Document Type
                  </label>
                  <div className="relative">
                    <select
                      value={filterDocType}
                      onChange={(e) => setFilterDocType(e.target.value)}
                      className="dms-input h-8 w-full appearance-none pr-7 pl-2 text-xs font-medium"
                    >
                      <option value="All">All Types</option>
                      {[
                        "Drawing",
                        "Policy",
                        "Procedure",
                        "Register",
                        "Plan",
                        "Index",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                {/* Confidentiality */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                    Security / Confidentiality
                  </label>
                  <div className="flex gap-1">
                    {(["All", "Confidential", "Standard"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFilterConfidential(c)}
                        className={`flex-1 rounded-md py-1 text-[11px] font-medium transition-colors cursor-pointer border text-center flex items-center justify-center gap-1 ${filterConfidential === c
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                          }`}
                      >
                        {c === "Confidential" ? (
                          <>
                            <Lock className="h-3 w-3 inline-block" />
                            <span>Confidential</span>
                          </>
                        ) : (
                          c
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-2.5 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-muted-foreground">
                  Matching:{" "}
                  <strong className="text-foreground font-semibold">
                    {filteredDocumentsCount}
                  </strong>{" "}
                  records
                </span>
                <Button
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="h-7 text-xs px-3 cursor-pointer"
                >
                  Apply
                </Button>
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* Sort Popover */}
        <div className="relative">
          <button
            ref={sortPopover.triggerRef}
            type="button"
            className={`dms-icon-button relative cursor-pointer ${sortField ? "is-active text-primary border-primary/40 bg-primary/10" : ""}`}
            aria-label="Sort records"
            title={`Sort records (Current: ${sortField ? `${sortField} ${sortOrder.toUpperCase()}` : "Default"})`}
            onClick={() => {
              setShowSortMenu((value) => !value);
              setShowColumns(false);
              setShowFilters(false);
              setShowViewMenu(false);
            }}
          >
            <ArrowUpDown className="h-5 w-5" />
          </button>
          {showSortMenu && createPortal(
            <div
              ref={sortPopover.popoverRef}
              className="fixed z-[9999] w-56 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-2xl text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150"
              style={{
                top: `${sortPopover.position.top}px`,
                right: `${sortPopover.position.right}px`,
                maxHeight: `${sortPopover.position.maxHeight}px`,
              }}
            >
              <div className="flex items-center justify-between px-2 py-1 border-b border-border/60 pb-1.5 mb-1">
                <span className="font-semibold text-foreground">Sort Records</span>
                {sortField && (
                  <button
                    type="button"
                    onClick={() => {
                      setSortField(null);
                      setSortOrder("asc");
                    }}
                    className="text-[10px] text-primary hover:underline cursor-pointer font-medium"
                  >
                    Reset Default
                  </button>
                )}
              </div>
              {[
                { field: "Location", label: "Station / Location" },
                { field: "Document no.", label: "Document Number" },
                { field: "Document title", label: "Document Title" },
                { field: "Department", label: "Department" },
                { field: "Revision", label: "Revision" },
                { field: "Status", label: "Status" },
                { field: "Updated", label: "Date Updated" },
              ].map((item) => {
                const isFieldActive = sortField === item.field;
                return (
                  <button
                    key={item.field}
                    type="button"
                    onClick={() => {
                      if (isFieldActive) {
                        if (sortOrder === "asc") {
                          setSortOrder("desc");
                        } else {
                          setSortField(null);
                          setSortOrder("asc");
                        }
                      } else {
                        setSortField(item.field);
                        setSortOrder("asc");
                      }
                    }}
                    className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${isFieldActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-foreground hover:bg-muted"
                      }`}
                  >
                    <span>{item.label}</span>
                    {isFieldActive && (
                      <span className="text-[10px] uppercase font-mono tracking-wider bg-primary/20 text-primary px-1.5 py-0.2 rounded font-semibold">
                        {sortOrder === "asc" ? "Asc ↑" : "Desc ↓"}
                      </span>
                    )}
                  </button>
                );
              })}
              {sortField && (
                <div className="pt-1 mt-1 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => {
                      setSortField(null);
                      setSortOrder("asc");
                      setShowSortMenu(false);
                    }}
                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  >
                    <span>Default Order</span>
                    <span className="text-[10px] text-muted-foreground">Original</span>
                  </button>
                </div>
              )}
            </div>,
            document.body
          )}
        </div>

        {/* View Switcher */}
        <div className="relative">
          <button
            ref={viewPopover.triggerRef}
            type="button"
            className={`dms-icon-button cursor-pointer ${showViewMenu ? "is-active text-primary bg-muted" : ""}`}
            aria-label="Change view"
            aria-expanded={showViewMenu}
            onClick={() => {
              setShowViewMenu((value) => !value);
              setShowColumns(false);
              setShowFilters(false);
              setShowSortMenu(false);
            }}
          >
            <LayoutList className="h-5 w-5" />
          </button>
          {showViewMenu && createPortal(
            <div
              ref={viewPopover.popoverRef}
              className="fixed z-[9999] w-[280px] overflow-y-auto rounded-xl border border-border bg-white shadow-xl p-2"
              role="menu"
              aria-label="View options"
              style={{
                top: `${viewPopover.position.top}px`,
                right: `${viewPopover.position.right}px`,
                maxHeight: `${viewPopover.position.maxHeight}px`,
              }}
            >
              {(
                [
                  "Extra large icons",
                  "Large icons",
                  "Medium icons",
                  "Small icons",
                  "List",
                  "Details",
                  "Tiles",
                  "Content",
                ] as ViewMode[]
              ).map((option) => {
                const Icon = option.includes("icons")
                  ? Grid2X2
                  : option === "List"
                    ? List
                    : option === "Details"
                      ? LayoutList
                      : option === "Tiles"
                        ? Rows3
                        : Columns3;
                return (
                  <button
                    key={option}
                    type="button"
                    role="menuitemradio"
                    aria-checked={viewMode === option}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => {
                      setViewMode(option);
                      setShowViewMenu(false);
                    }}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center text-primary font-bold">
                      {viewMode === option ? "•" : ""}
                    </span>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <span className="truncate flex-1">{option}</span>
                  </button>
                );
              })}
              <div className="my-1 h-px bg-border" />
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={showDetailsPane}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setShowDetailsPane((value) => !value)}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-primary font-bold">
                  {showDetailsPane ? "•" : ""}
                </span>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
                  <PanelRight className="size-4" />
                </span>
                <span className="truncate flex-1">Details pane</span>
              </button>
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={previewDocId !== null}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                onClick={() => {
                  if (previewDocId !== null) {
                    setPreviewDocId(null);
                  } else if (selectedId) {
                    setPreviewDocId(selectedId);
                  } else if (filteredDocuments[0]) {
                    setPreviewDocId(filteredDocuments[0].id);
                    setSelectedId(filteredDocuments[0].id);
                  }
                }}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-primary font-bold">
                  {previewDocId !== null ? "•" : ""}
                </span>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
                  <PanelRight className="size-4" />
                </span>
                <span className="truncate flex-1">Preview pane</span>
              </button>
              <div className="my-1 h-px bg-border" />
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setShowViewMenu(false)}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center" />
                <span className="flex h-5 w-5 shrink-0 items-center justify-center" />
                <span className="truncate flex-1 text-muted-foreground italic">Close menu</span>
                <ChevronRight className="ml-auto size-3.5" />
              </button>
            </div>,
            document.body
          )}
        </div>
        </div>
      </div>

      {/* Archive Tab File Information Banner */}
      {activeMainTab === "archive" && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-xs bg-[#F8F0E4] border-[#F9DAAB]">
          <div className="flex items-center gap-1.5 text-[#A55722]">
            <Archive className="h-5 w-5 text-[#E37203] shrink-0" />
            <span className="font-semibold text-[#A55722]">
              Archived Files
            </span>
            <span className="text-[#A55722]/80 text-xs">
              - Preserved records. Click Unarchive on any file to return it to active circulation.
            </span>
          </div>
          <span className="text-xs text-[#A55722]/80">
            Use the Unarchive button on any record to restore it
          </span>
        </div>
      )}

      <div className="dms-mobile-search relative border-b border-border px-4 py-2 sm:hidden">
        <Search className="absolute left-7 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search records…"
          className="dms-input h-9 w-full pl-9"
        />
      </div>
    </>
  );
}
