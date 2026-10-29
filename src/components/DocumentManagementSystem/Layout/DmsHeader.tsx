import React from "react";
import {
  Search,
  Users,
  Plus,
  PanelLeftOpen,
  PanelLeftClose,
  FilePlus,
} from "lucide-react";
import type { Role } from "../types";

export function DmsHeader({
  role,
  pendingRequestsCount,
  reviewDocsCount,
  onResetHome,
  onOpenNotifications,
  isSidebarCollapsed = false,
  onToggleSidebar,
  searchQuery = "",
  onSearchChange,
  onCreateGroup,
  onCreatePublisher,
  onAddDocument,
}: {
  role: Role;
  pendingRequestsCount?: number;
  reviewDocsCount?: number;
  onResetHome: () => void;
  onOpenNotifications?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onCreateGroup?: () => void;
  onCreatePublisher?: () => void;
  onAddDocument?: () => void;
}) {
  return (
    <div className="px-2 sm:px-3 pt-2 pb-1 shrink-0 bg-slate-50">
      {/* Blue Header Banner */}
      <div className="bg-[#1E6FBF] text-white rounded-xl px-4 sm:px-5 py-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Icon Badge + Title + Subtitle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar || onResetHome}
            className="flex h-9 px-2 sm:h-10 sm:px-2.5 items-center justify-center rounded-md bg-white text-[#1E6FBF] shadow-xs hover:bg-blue-50 transition-transform active:scale-95 cursor-pointer shrink-0 border border-white/30"
            title={
              isSidebarCollapsed
                ? "Expand Folders Sidebar"
                : "Collapse Folders Sidebar"
            }
            aria-label="Toggle Folders Sidebar"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="size-5 text-[#1E6FBF]" />
            ) : (
              <PanelLeftClose className="size-5 text-[#1E6FBF]" />
            )}
          </button>

          <div
            onClick={onResetHome}
            className="cursor-pointer select-none"
          >
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
              Document Management System
            </h1>

            <p className="text-[11px] sm:text-xs text-blue-100/90 font-normal mt-0.5 leading-snug">
              Centralized files for pipeline engineering, compliance, and
              operational drawings
            </p>
          </div>
        </div>

        {/* Right: Search + Admin Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Search Input Bar */}
          {onSearchChange && (
            <div className="relative w-full sm:w-56 md:w-64">
              <Search className="absolute left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange?.(e.currentTarget.value);
                }}
                placeholder="Search files, folders, subfolders..."
                className="h-8 w-full rounded-lg bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 border border-white/20 shadow-xs focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
              />
            </div>
          )}

          {/* Publisher-only Button */}
          {role === "Publisher" && onAddDocument && (
            <button
              type="button"
              onClick={onAddDocument}
              className="h-8 flex items-center gap-1.5 rounded-lg bg-white text-[#1E6FBF] hover:bg-blue-50 px-3 text-xs font-semibold shadow-xs border border-white/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
              title="Add a new document"
            >
              <FilePlus className="h-5 w-5 text-[#1E6FBF]" />
              <span>Add Document</span>
            </button>
          )}

          {/* Admin-only Buttons */}
          {role === "Admin" && (
            <>
              {/* Create Group Button */}
              {onCreateGroup && (
                <button
                  type="button"
                  onClick={onCreateGroup}
                  className="h-8 flex items-center gap-1.5 rounded-lg bg-white text-[#1E6FBF] hover:bg-blue-50 px-3 text-xs font-semibold shadow-xs border border-white/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  title="Create new engineer group"
                >
                  <Users className="h-5 w-5 text-[#1E6FBF]" />
                  <span>Create Group</span>
                </button>
              )}

              {/* Create Publisher Button */}
              {onCreatePublisher && (
                <button
                  type="button"
                  onClick={onCreatePublisher}
                  className="h-8 flex items-center gap-1.5 rounded-lg bg-white text-[#1E6FBF] hover:bg-blue-50 px-3 text-xs font-semibold shadow-xs border border-white/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  title="Create new publisher"
                >
                  <Plus className="h-5 w-5 text-[#1E6FBF]" />
                  <span>Create Publisher</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DmsHeader;
