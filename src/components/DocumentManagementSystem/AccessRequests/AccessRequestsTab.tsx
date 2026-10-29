import React, { useMemo, useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Calendar,
    CalendarClock,
    Check,
    Clock3,
    Infinity as InfinityIcon,
    KeyRound,
    Lock,
    Search,
    ShieldCheck,
    X,
} from "lucide-react";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import type { AccessRequest } from "../types";
import { getLoggedInUserId } from "../hooks/dmsUser";

export function AccessRequestsTab({
    accessRequests,
    requestFilter,
    setRequestFilter,
    requestSearch,
    setRequestSearch,
    pendingRequestsCount,
    onOpenGrantModal,
    onRejectRequest,
    onOpenPreviewDoc,
    onViewDocument,
    tabCounts,
    page,
    setPage,
    limit,
    setLimit,
    totalCount,
}: {
    accessRequests: AccessRequest[];
    requestFilter: "All" | "Pending" | "Approved" | "Rejected" | "Expired";
    setRequestFilter: (
        val: "All" | "Pending" | "Approved" | "Rejected" | "Expired"
    ) => void;
    requestSearch: string;
    setRequestSearch: (val: string) => void;
    pendingRequestsCount: number;
    onOpenGrantModal: (req: AccessRequest) => void;
    onRejectRequest: (req: AccessRequest) => void;
    onOpenPreviewDoc: (docId: string, docNum: string) => void;
    onViewDocument?: (docId: string) => void;
    tabCounts: {
        all: number;
        pending: number;
        approved: number;
        rejected: number;
        expired: number;
    };
    page: number;
    setPage: (page: number) => void;
    limit: number;
    setLimit: (limit: number) => void;
    totalCount: number;
}) {
    type SortColumn =
        | "requesterName"
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
    const [requestToDecline, setRequestToDecline] = useState<AccessRequest | null>(null);

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

    const currentUserId = useMemo(() => getLoggedInUserId(), []);

    const filteredRequests = useMemo(() => {
        return accessRequests.filter(
            (req) => Number(req.requesterId) !== Number(currentUserId)
        );
    }, [accessRequests, currentUserId]);

    const sortedRequests = useMemo(() => {
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
    }, [filteredRequests, sortConfig]);

    return (
        <div className="flex-1 overflow-auto bg-background/50 p-4 sm:p-6">
            <div className="w-full max-w-none space-y-4">
                {/* Header Banner */}
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <KeyRound className="size-4" />
                            </div>
                            <h2 className="text-sm font-semibold">Access & Custody Requests</h2>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Review and authorize user access permissions for controlled, restricted, and
                            confidential files. Specify timed validity windows.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs">
                            <span className="text-muted-foreground">Pending:</span>
                            <strong className="text-gray-600 font-bold">{tabCounts.pending}</strong>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs">
                            <span className="text-muted-foreground">Approved:</span>
                            <strong className="text-gray-600 font-bold">{tabCounts.approved}</strong>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-1">
                        {(["All", "Pending", "Approved", "Rejected", "Expired"] as const).map((filter) => {
                            const count = tabCounts[filter.toLowerCase() as keyof typeof tabCounts] || 0;
                            return (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setRequestFilter(filter)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${requestFilter === filter
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                                        }`}
                                >
                                    {filter} ({count})
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={requestSearch}
                            onChange={(e) => setRequestSearch(e.target.value)}
                            placeholder="Search requester or doc…"
                            className="dms-input h-8 w-full !pl-8 !pr-3 text-xs"
                        />
                    </div>
                </div>

                {/* Requests Table */}
                <div className="flex min-h-[400px] w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex-1 overflow-auto">
                        <table className="w-full min-w-[1100px] text-xs">
                            <thead className="sticky top-0 z-10 border-b border-[#C5D9F2] bg-[#D8E7F8] text-xs text-slate-800">
                                <tr>
                                    {(
                                        [
                                            ["Requester", "requesterName"],
                                            ["Target Document", "documentNumber"],
                                            ["Requested On", "requestDate"],
                                            ["Justification", "reason"],
                                            ["Status", "status"],
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
                                                <div
                                                    className={`flex items-center gap-1.5 ${column === "requesterName" ? "justify-start" : "justify-center"
                                                        }`}
                                                >
                                                    <span>{label}</span>

                                                    {direction === "asc" ? (
                                                        <ArrowUp className="h-3.5 w-3.5 shrink-0 text-blue-900" />
                                                    ) : direction === "desc" ? (
                                                        <ArrowDown className="h-3.5 w-3.5 shrink-0 text-blue-900" />
                                                    ) : (
                                                        <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })}

                                    <th className="whitespace-nowrap border-l border-[#C5D9F2] bg-[#D8E7F8] px-5 py-3.5 text-center font-semibold text-slate-800">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {sortedRequests.map((req) => (
                                    <tr key={req.id} className="transition-colors hover:bg-slate-50">
                                        <td className="px-5 py-4 text-left align-middle whitespace-nowrap">
                                            <div className="flex items-center justify-start gap-2.5">
                                                <div className="flex size-7 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground border border-border uppercase">
                                                    {req.requesterName
                                                        ?.split(" ")
                                                        .map((p: string) => p[0])
                                                        .join("") || "?"}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-semibold text-foreground">{req.requesterName}</p>
                                                    <p className="text-[10.5px] text-muted-foreground">
                                                        {req.requesterRole} ·{" "}
                                                        <span className="font-mono">{req.requesterDepartment}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-center align-middle max-w-[280px]">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onViewDocument && onViewDocument(req.documentId);
                                                    }}
                                                    className="font-mono text-xs font-semibold text-blue-700 hover:underline truncate cursor-pointer"
                                                    title="Click to inspect this document"
                                                >
                                                    {req.documentNumber}
                                                </button>
                                                {req.isConfidential && (
                                                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 shrink-0">
                                                        <Lock className="h-3 w-3" /> Confidential
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 truncate text-sm font-medium text-slate-700">
                                                {req.documentTitle}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-center align-middle whitespace-nowrap text-sm text-slate-600">
                                            {req.requestDate}
                                        </td>

                                        <td className="px-5 py-4 text-center align-middle max-w-[240px]">
                                            <p className="line-clamp-2 text-sm leading-5 text-slate-600">
                                                {req.reason || "—"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-center align-middle whitespace-nowrap">
                                            {req.status === "Pending" && (
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                        <Clock3 className="h-3.5 w-3.5" /> Pending Review
                                                    </span>
                                                </div>
                                            )}
                                            {req.status === "Approved" && (
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                                        <ShieldCheck className="h-3.5 w-3.5" /> Access Granted
                                                    </span>
                                                    {req.isLifetime ? (
                                                        <p className="flex items-center justify-center gap-1 font-medium text-xs text-slate-500">
                                                            <InfinityIcon className="h-3.5 w-3.5 text-emerald-600" /> Lifetime Access
                                                        </p>
                                                    ) : req.validFrom && req.validTo ? (
                                                        <p className="font-mono text-xs text-slate-500">
                                                            {req.validFrom} → {req.validTo}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            )}
                                            {req.status === "Rejected" && (
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                                                        <X className="h-3.5 w-3.5" /> Declined
                                                    </span>
                                                </div>
                                            )}
                                            {req.status === "Expired" && (
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                                                        <Clock3 className="h-3.5 w-3.5" />
                                                        Expired
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-center align-middle">
                                            {req.status === "Pending" ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => onOpenGrantModal(req)}
                                                        className="h-8 gap-1.5 px-3 text-xs bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-none rounded-md font-medium"
                                                        title="Specify validity window or grant permanent lifetime access"
                                                    >
                                                        <CalendarClock className="h-3.5 w-3.5" /> Grant Access
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setRequestToDecline(req)}
                                                        className="h-8 px-2.5 text-xs text-rose-700 border-rose-200 hover:bg-rose-50 hover:text-rose-800 cursor-pointer rounded-md font-medium"
                                                    >
                                                        Decline
                                                    </Button>
                                                </div>
                                            ) : req.status === "Approved" ? (
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    <span className="text-xs font-medium text-emerald-700 flex items-center justify-center gap-1">
                                                        <ShieldCheck className="h-3.5 w-3.5" /> Authorized
                                                    </span>
                                                    {req.isLifetime ? (
                                                        <span className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
                                                            <InfinityIcon className="h-3 w-3 text-emerald-600" /> Lifetime Access
                                                        </span>
                                                    ) : req.validFrom && req.validTo ? (
                                                        <span className="text-[11px] text-slate-500 font-mono">
                                                            {req.validFrom} → {req.validTo}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            ) : req.status === "Expired" ? (
                                                <span className="text-xs font-medium text-orange-700">
                                                    Access Expired
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

                        {sortedRequests.length === 0 && (
                            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-muted-foreground p-6">
                                <KeyRound className="size-6 text-muted-foreground/50" />
                                <p className="text-xs">No access requests match your criteria</p>
                                {requestSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setRequestSearch("")}
                                        className="text-xs font-semibold text-primary cursor-pointer hover:underline"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalCount > 0 && (
                        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
                            <div>
                                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} entries
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="h-7 text-xs"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page * limit >= totalCount}
                                    className="h-7 text-xs"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {requestToDecline && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-[2px]"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setRequestToDecline(null);
                        }
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="decline-confirmation-title"
                        className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                    >
                        <div className="flex items-start gap-3 p-5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-600">
                                <X className="size-5" />
                            </div>

                            <div className="min-w-0 flex-1 pt-0.5">
                                <h3
                                    id="decline-confirmation-title"
                                    className="text-sm font-semibold text-slate-900"
                                >
                                    Decline access request?
                                </h3>

                                <p className="mt-1.5 text-sm leading-5 text-slate-600">
                                    This will reject the access request for:
                                </p>

                                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                                    <p className="break-words font-mono text-xs font-semibold leading-5 text-slate-800">
                                        {requestToDecline.documentNumber}
                                    </p>

                                    <p className="mt-1 break-words text-xs text-slate-500">
                                        {requestToDecline.documentTitle}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setRequestToDecline(null)}
                                className="h-9 border-slate-300 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                    const request = requestToDecline;
                                    setRequestToDecline(null);
                                    onRejectRequest(request);
                                }}
                                className="h-9 bg-rose-600 px-4 text-xs font-semibold text-white shadow-none hover:bg-rose-700"
                            >
                                <X className="mr-1.5 size-3.5" />
                                Yes, Decline
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
