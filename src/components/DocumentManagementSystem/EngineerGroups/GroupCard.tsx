import React from "react";
import { Pencil, Trash2, User, UsersRound } from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import type { EngineerGroup } from "../types";

export function GroupCard({
  group,
  onEdit,
  onDelete,
}: {
  group: EngineerGroup;
  onEdit: (group: EngineerGroup) => void;
  onDelete: (group: EngineerGroup) => void;
}) {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-[#1E6FBF]/60 hover:shadow-md transition-all">
      <div className="space-y-3">
        {/* Card Header & Group Details */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-[#1E6FBF] shrink-0 mt-0.5">
              <UsersRound className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {group.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center rounded bg-blue-50 border border-blue-100 px-1.5 py-0.2 text-[10px] font-mono font-bold text-[#1E6FBF]">
                  {group.department || "OP"}
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {group.members.length} engineer{group.members.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 gap-1 text-xs"
              onClick={() => onEdit(group)}
            >
              <Pencil className="h-3.5 w-3.5 shrink-0" />
              <span>Edit</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(group)}
              aria-label="Delete group"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
            </Button>
          </div>
        </div>

        {/* Group Details: Description */}
        {group.description && (
          <p className="text-xs text-slate-500 leading-relaxed">
            {group.description}
          </p>
        )}

        {/* Group Members & Permissions */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Engineers in Group:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {group.members.map((memberName) => (
              <span
                key={memberName}
                className="inline-flex items-center gap-1 rounded bg-blue-50/80 border border-blue-100 px-2 py-0.5 text-[11px] font-medium text-[#1E6FBF]"
              >
                <User className="size-3 text-[#1E6FBF] shrink-0" />
                <span className="text-slate-700">{memberName}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Created {group.createdAt}</span>
        <span className="font-medium text-slate-600">{group.createdBy}</span>
      </div>
    </div>
  );
}
