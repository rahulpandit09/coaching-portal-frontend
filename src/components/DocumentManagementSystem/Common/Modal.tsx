import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";

export function Modal({
  title,
  onClose,
  maxWidth = "max-w-lg",
  hideScrollbar = true,
  children,
}: {
  title: string;
  onClose: () => void;
  maxWidth?: string;
  hideScrollbar?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div
        className={`w-full ${maxWidth} max-h-[92vh] flex flex-col rounded-xl border border-slate-200 bg-white text-slate-900 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="mb-3 flex shrink-0 items-start justify-between border-b border-slate-200 pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              PMHBL Document Management System
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">{title}</h2>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close dialog" className="text-slate-500 hover:text-slate-700 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto pr-1 ${hideScrollbar ? "hide-scrollbar" : "custom-scrollbar"}`}>{children}</div>
      </div>
    </div>
  );
}
