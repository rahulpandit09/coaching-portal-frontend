import React from "react";
import { FileCheck2, CalendarClock, Archive, FileMinus } from "lucide-react";
import type { DocStatus } from "../types";

export function StatusBadge({ status }: { status: DocStatus }) {
  if (status === "Controlled" || status === "Active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-700 shadow-2xs">
        <FileCheck2 className="size-3 text-emerald-600" />
        <span>{status}</span>
      </span>
    );
  }
  if (status === "Review" || status === "Under Review") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[10.5px] font-semibold text-amber-700 shadow-2xs">
        <CalendarClock className="size-3 text-amber-600" />
        <span>{status}</span>
      </span>
    );
  }
  if (status === "Inactive") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 text-[10.5px] font-semibold text-rose-700 shadow-2xs">
        <FileMinus className="size-3 text-rose-600" />
        <span>Inactive</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-700 shadow-2xs">
      <Archive className="size-3 text-slate-500" />
      <span>{status || "Archived"}</span>
    </span>
  );
}
