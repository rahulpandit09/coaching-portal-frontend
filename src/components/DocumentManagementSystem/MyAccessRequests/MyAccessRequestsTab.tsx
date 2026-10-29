import React, { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  FileCheck2,
  Clock3,
  Inbox,
  Infinity as InfinityIcon,
  KeyRound,
  Lock,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import type { AccessRequest } from "../types";

export function MyAccessRequestsTab({
  accessRequests,
  globalSearch,
  onBrowseControlledFiles,
  onOpenPreviewDoc,
  onOpenDocument,
}: {
  accessRequests: AccessRequest[];
  globalSearch: string;
  onBrowseControlledFiles: () => void;
  onOpenPreviewDoc: (docId: string, docNum: string) => void;
  onOpenDocument?: (docId: string, docNum: string) => void;
}) {
  type SortColumn =
    | "documentNumber"
    | "requestDate"
    | "reason"
    | "status";

  type SortDirection = "asc" | "desc" | "default";

  const [sortConfig, setSortConfig] = useState<{
    column: SortColumn | null;
    direction: SortDirection;
  }>({
    column: null,
    direction: "default",
  });

  const handleSort = (column: SortColumn) => {
    setSortConfig((previous) => {
      if (previous.column !== column) {
        return { column, direction: "asc" };
      }

      if (previous.direction === "asc") {
        return { column, direction: "desc" };
      }

      return { column: null, direction: "default" };
    });
  };

  const myRequests = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();

    const filteredRequests = accessRequests.filter((request) => {
      if (!query) return true;

      const searchableValues = [
        request.documentNumber,
        request.documentTitle,
        request.requestDate,
        request.reason,
        request.status,
        request.validFrom,
        request.validTo,
        request.isLifetime ? "lifetime permanent" : "",
      ];

      return searchableValues.some((value) =>
        String(value ?? "").toLowerCase().includes(query),
      );
    });

    if (!sortConfig.column || sortConfig.direction === "default") {
      return filteredRequests;
    }

    const column = sortConfig.column;
    const direction = sortConfig.direction === "asc" ? 1 : -1;

    return [...filteredRequests].sort((a, b) => {
      const valueA = String(a[column] ?? "").toLowerCase();
      const valueB = String(b[column] ?? "").toLowerCase();

      return (
        valueA.localeCompare(valueB, undefined, {
          numeric: true,
          sensitivity: "base",
        }) * direction
      );
    });
  }, [accessRequests, globalSearch, sortConfig]);

  return (
    <div className="flex-1 overflow-auto bg-background/50 p-4 sm:p-6 space-y-4">
      <div className="w-full space-y-4">
        {/* Requests Table */}
        <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-xs">
              <thead className="sticky top-0 z-10 border-b border-[#C5D9F2] bg-[#D8E7F8] text-xs text-slate-800">
                <tr>
                  {(
                    [
                      ["Requested Document", "documentNumber"],
                      ["Requested On", "requestDate"],
                      ["My Justification", "reason"],
                      ["Access Status & Validity", "status"],
                    ] as const
                  ).map(([label, column]) => {
                    const isActive = sortConfig.column === column;
                    const direction = isActive ? sortConfig.direction : "default";

                    return (
                      <th
                        key={column}
                        scope="col"
                        aria-sort={
                          direction === "asc"
                            ? "ascending"
                            : direction === "desc"
                              ? "descending"
                              : "none"
                        }
                        onClick={() => handleSort(column)}
                        className={`whitespace-nowrap border-r border-[#C5D9F2] px-5 py-3.5 text-center font-semibold cursor-pointer select-none transition-colors hover:bg-[#C8DCF4] ${isActive ? "bg-[#C8DCF4] text-slate-900" : ""
                          }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{label}</span>

                          {direction === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5 shrink-0 text-slate-900" />
                          ) : direction === "desc" ? (
                            <ArrowDown className="h-3.5 w-3.5 shrink-0 text-slate-900" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          )}
                        </div>
                      </th>
                    );
                  })}

                  <th className="whitespace-nowrap bg-[#D8E7F8] px-5 py-3.5 text-center font-semibold text-slate-800">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {myRequests.map((req) => (
                  <tr key={req.id} className="transition-colors hover:bg-slate-50">
                    <td className="max-w-[280px] px-5 py-4 text-center align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-xs font-semibold text-blue-700">
                          {req.documentNumber}
                        </span>
                        {req.isConfidential && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                            <Lock className="h-3 w-3" />
                            Confidential
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-slate-700 text-center">
                        {req.documentTitle}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-center align-middle text-sm text-slate-600">
                      {req.requestDate}
                    </td>

                    <td className="max-w-[240px] px-5 py-4 text-center align-middle">
                      <p className="line-clamp-2 text-center text-sm leading-5 text-slate-600">
                        {req.reason || "—"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-center align-middle">
                      {req.status === "Pending" && (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                            <Clock3 className="h-3.5 w-3.5" />
                            Awaiting Publisher Review
                          </span>
                          <p className="text-xs text-slate-500">
                            Assigned publisher notified
                          </p>
                        </div>
                      )}
                      {req.status === "Approved" && (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Access Granted
                          </span>
                          {req.isLifetime ? (
                            <p className="flex items-center justify-center gap-1 font-medium text-xs text-slate-500">
                              <InfinityIcon className="h-3.5 w-3.5 text-emerald-600" />
                              Lifetime Access (Permanent)
                            </p>
                          ) : req.validFrom && req.validTo ? (
                            <p className="font-mono text-xs text-slate-500">
                              Valid: {req.validFrom} → {req.validTo}
                            </p>
                          ) : null}
                        </div>
                      )}
                      {req.status === "Rejected" && (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                            <X className="h-3.5 w-3.5" />
                            Request Declined
                          </span>
                        </div>
                      )}
                      {req.status === "Expired" && (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            <Clock3 className="h-3.5 w-3.5" />
                            Access Expired
                          </span>

                          <p className="text-xs text-slate-500">
                            The permission validity period has ended.
                          </p>
                        </div>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-center align-middle">
                      {req.status === "Approved" ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            onOpenPreviewDoc(req.documentId, req.documentNumber)
                          }
                          className="h-8 gap-1.5 rounded-md bg-blue-700 px-2.5 text-[11px] font-medium text-white shadow-none transition-colors hover:bg-blue-800"
                        >
                          <FileCheck2 className="h-3.5 w-3.5" />
                          Open Document
                        </Button>
                      ) : req.status === "Pending" ? (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                          In Queue
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          Closed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {myRequests.length === 0 && (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Inbox className="h-6 w-6 text-slate-500" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  No access requests found
                </p>
                <p className="text-xs text-slate-500">
                  Your document access requests will appear here.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onBrowseControlledFiles}
                className="mt-1"
              >
                Browse Controlled Files
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
