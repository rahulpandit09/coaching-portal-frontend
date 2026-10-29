import React from "react";
import { CalendarClock, Infinity as InfinityIcon, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import { Modal } from "../Common/Modal";
import type { AccessRequest } from "../types";

export function AuthorizeAccessModal({
  request,
  isLifetime,
  fromDate,
  toDate,
  remarks,
  onIsLifetimeChange,
  onFromDateChange,
  onToDateChange,
  onRemarksChange,
  onClose,
  onConfirm,
}: {
  request: AccessRequest;
  isLifetime: boolean;
  fromDate: string;
  toDate: string;
  remarks: string;
  onIsLifetimeChange: (val: boolean) => void;
  onFromDateChange: (val: string) => void;
  onToDateChange: (val: string) => void;
  onRemarksChange: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  // Use local date components to avoid UTC/time-zone shifts when formatting dates.
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const setPresetDays = (days: number) => {
    onIsLifetimeChange(false);
    const start = fromDate && fromDate >= minDate ? new Date(`${fromDate}T00:00:00`) : new Date(`${minDate}T00:00:00`);
    const target = new Date(start);
    target.setDate(target.getDate() + days);
    const targetDate = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
    onToDateChange(targetDate);
  };

  const isFormValid =
    isLifetime ||
    (Boolean(fromDate) &&
      Boolean(toDate) &&
      fromDate >= minDate &&
      toDate >= fromDate);

  return (
    <Modal
      title={`Authorize Access · ${request.documentNumber}`}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 pb-2 text-sm">
        {/* Request Context Card */}
        <div className="space-y-3 rounded-lg border border-blue-200 bg-slate-50/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-sm font-semibold text-blue-700">
              {request.documentNumber}
            </span>

            {request.isConfidential && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800">
                <Lock className="size-3" />
                Confidential Document
              </span>
            )}
          </div>

          <p className="text-sm font-semibold leading-relaxed text-slate-900">
            {request.documentTitle}
          </p>

          <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 text-xs sm:flex-row sm:items-start sm:justify-between">
            <p className="min-w-0 text-slate-500">
              Requester:{" "}
              <strong className="font-semibold text-slate-800">
                {request.requesterName}
              </strong>{" "}
              <span>
                ({request.requesterRole}, {request.requesterDepartment})
              </span>
            </p>

            <p className="shrink-0 text-slate-500">
              Requested:{" "}
              <span className="font-medium text-slate-700">
                {request.requestDate}
              </span>
            </p>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-3 text-xs leading-relaxed">
            <span className="font-semibold text-slate-600">Justification: </span>
            <span className="break-words italic text-slate-800">
              {request.reason
                ? `"${request.reason}"`
                : "No justification provided"}
            </span>
          </div>
        </div>

        {/* Access Model Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800">
            Permission Model *
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onIsLifetimeChange(false)}
              className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors ${!isLifetime
                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <div
                className={`mt-0.5 shrink-0 rounded-md p-2 ${!isLifetime
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-500"
                  }`}
              >
                <CalendarClock className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Time-Bounded</span>
                  {!isLifetime && <span className="size-1.5 rounded-full bg-blue-600" />}
                </div>
                <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                  Specific From & To validity dates
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onIsLifetimeChange(true)}
              className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors ${isLifetime
                ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              <div
                className={`mt-0.5 shrink-0 rounded-md p-2 ${isLifetime
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-500"
                  }`}
              >
                <InfinityIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Lifetime Access</span>
                  {isLifetime && <span className="size-1.5 rounded-full bg-emerald-500" />}
                </div>
                <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                  Permanent, non-expiring permission
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Configuration Details Box */}
        {isLifetime ? (
          <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>Permanent Lifetime Authorization</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-700">
              Granting lifetime access gives{" "}
              <strong className="font-semibold text-slate-900">
                {request.requesterName}
              </strong>{" "}
              permission to open, inspect, and reference this controlled record
              indefinitely. No expiration date or periodic renewal is required.
            </p>
            <div className="flex flex-col gap-2 border-t border-emerald-200 pt-3 text-xs sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono text-emerald-800">
                Effective Date:{" "}
                <strong>{fromDate || "Immediately"}</strong>
              </span>

              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <InfinityIcon className="h-5 w-5" />
                No Expiration Date
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <CalendarClock className="h-5 w-5 text-blue-600" />
              <span>Timed Permission Window</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Specify the date range during which this user can open and preview
              the controlled document.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-800">
                  Valid From Date *
                </label>
                <input
                  type="date"
                  required
                  min={minDate}
                  value={fromDate}
                  onChange={(e) => {
                    const nextFromDate = e.target.value;
                    if (nextFromDate < minDate) return;

                    onFromDateChange(nextFromDate);
                    // Keep the date range valid if the start date moves past the end date.
                    if (toDate && toDate < nextFromDate) {
                      onToDateChange(nextFromDate);
                    }
                  }}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-800">
                  Valid To Date *
                </label>
                <input
                  type="date"
                  required
                  min={fromDate && fromDate > minDate ? fromDate : minDate}
                  value={toDate}
                  onChange={(e) => {
                    const nextToDate = e.target.value;
                    if (nextToDate < minDate || (fromDate && nextToDate < fromDate)) return;
                    onToDateChange(nextToDate);
                  }}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Quick Duration Presets */}
            <div className="pt-1">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Quick Validity Duration Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "+7 Days", days: 7 },
                  { label: "+14 Days", days: 14 },
                  { label: "+30 Days (Default)", days: 30 },
                  { label: "+90 Days (Quarterly)", days: 90 },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setPresetDays(preset.days)}
                    className="cursor-pointer rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => onIsLifetimeChange(true)}
                  className="flex cursor-pointer items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <InfinityIcon className="h-4 w-4" />
                  <span>Lifetime Access</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Remarks Input */}
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
          <label className="block text-xs font-semibold text-slate-800">
            Approval Conditions / Remarks{" "}
            <span className="font-normal text-slate-500">(Optional)</span>
          </label>

          <input
            type="text"
            value={remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            placeholder={
              isLifetime
                ? "e.g. Authorized permanent departmental access for project lead"
                : "e.g. Authorized for PNGRB compliance review audit"
            }
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-20 -mx-1 mt-2 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-1 py-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-10 cursor-pointer border-slate-300 bg-white px-5 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={!isFormValid}
            className={`h-10 cursor-pointer gap-2 px-5 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${isLifetime
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isLifetime ? (
              <>
                <InfinityIcon className="h-4 w-4" />
                <span>Authorize Lifetime Access</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Authorize Timed Access</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

