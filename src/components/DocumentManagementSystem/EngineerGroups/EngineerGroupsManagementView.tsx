import React, { useMemo } from "react";
import { Search, UsersRound, X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { EngineerGroup, EngineerUser } from "../types";
import { GroupCard } from "./GroupCard";

export function EngineerGroupsManagementView({
  engineerGroups,
  engineers,
  search,
  onSearchChange,
  filterDept,
  onFilterDeptChange,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
  dashboardCounts,
  groupPage,
  groupLimit,
  groupTotalCount,
  onPageChange,
}: {
  engineerGroups: EngineerGroup[];
  engineers: EngineerUser[];
  search: string;
  onSearchChange: (val: string) => void;
  filterDept: string;
  onFilterDeptChange: (val: string) => void;
  onCreateGroup: () => void;
  onEditGroup: (group: EngineerGroup) => void;
  onDeleteGroup: (group: EngineerGroup) => void;
  dashboardCounts?: any;
  groupPage?: number;
  groupLimit?: number;
  groupTotalCount?: number;
  onPageChange?: (page: number) => void;
}) {
  const departments = ["All", "OP", "HSE", "PROJECTS", "CS", "LE"];

  const filteredGroups = useMemo(() => {
    return engineerGroups.filter((g) => {
      if (filterDept !== "All" && g.department !== filterDept) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.members.some((m) => m.toLowerCase().includes(q))
      );
    });
  }, [engineerGroups, filterDept, search]);

  const totalPages = groupLimit && groupTotalCount ? Math.ceil(groupTotalCount / groupLimit) : 1;

  return (
    <div className="flex-1 overflow-auto bg-slate-50/50 p-4 sm:p-6 space-y-4">
      <div className="w-full space-y-4">

        {/* Dashboard Counts (KPI) */}
        {dashboardCounts && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 font-medium">Total Groups</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{dashboardCounts.total_groups || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <p className="text-xs text-slate-500 font-medium">Assigned Engineers</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{dashboardCounts.assigned_engineers || 0}</p>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />

            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search groups by name, description, or engineer..."
              className="dms-input h-9 w-full !pl-9 !pr-8 text-xs bg-white border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:border-[#1E6FBF]"
            />

            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium shrink-0">
              Dept:
            </span>

            <div className="relative">
              <select
                value={filterDept}
                onChange={(e) => onFilterDeptChange(e.target.value)}
                className="h-9 min-w-[130px] appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 shadow-xs outline-none cursor-pointer transition-colors focus:border-[#1E6FBF] focus:ring-1 focus:ring-[#1E6FBF]/20"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={onEditGroup}
              onDelete={onDeleteGroup}
            />
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-center bg-white">
            <UsersRound className="size-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              No matching engineer groups found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search query or department filter
            </p>
          </div>
        )}
        {/* Pagination */}
        {onPageChange && groupPage && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-6">
            <p className="text-xs text-slate-500">
              Showing page {groupPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(groupPage - 1)}
                disabled={groupPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => onPageChange(groupPage + 1)}
                disabled={groupPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

