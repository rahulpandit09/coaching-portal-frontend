// Access Requests state and handlers for Publishers.
// Extracted verbatim from useDmsWorkspace.ts – no behavioural changes.

import { useState, useEffect, useCallback } from "react";
import api from "@/api/axiosInstance";
import type { AccessRequest } from "../types";
import { getLoggedInUserId, getLoggedInUserName } from "../hooks/dmsUser";

interface UseDmsAccessRequestsOptions {
  activeMainTab: string;
  setToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
  notify?: (message: string) => void;
}

export function useDmsAccessRequests({
  activeMainTab,
  setToast,
  notify,
}: UseDmsAccessRequestsOptions) {
  // Access requests & timed access grant state (Publisher)
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [accessRequestsPage, setAccessRequestsPage] = useState(1);
  const [accessRequestsLimit, setAccessRequestsLimit] = useState(10);
  const [accessRequestsTotalCount, setAccessRequestsTotalCount] = useState(0);
  const [accessRequestsCounts, setAccessRequestsCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
  });

  const [requestFilter, setRequestFilter] = useState<
    "All" | "Pending" | "Approved" | "Rejected" | "Expired"
  >("All");
  const [requestSearch, setRequestSearch] = useState("");
  const [grantModalRequest, setGrantModalRequest] = useState<AccessRequest | null>(null);
  const [grantFromDate, setGrantFromDate] = useState<string>(
    () => new Date().toISOString().split("T")[0] || "",
  );
  const [grantToDate, setGrantToDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0] || "";
  });
  const [grantIsLifetime, setGrantIsLifetime] = useState(false);
  const [grantRemarks, setGrantRemarks] = useState("");

  const fetchAccessRequestCounts = useCallback(async () => {
    try {
      const response = await api.get("/dms-access-request/counts");
      if (response.data.status === "success" && response.data.data) {
        setAccessRequestsCounts({
          all: response.data.data.all || 0,
          pending: response.data.data.pending || 0,
          approved: response.data.data.approved || 0,
          rejected: response.data.data.rejected || 0,
          expired: response.data.data.expired || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch access request counts:", error);
    }
  }, []);

  const fetchAccessRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("page", String(accessRequestsPage));
      params.set("limit", String(accessRequestsLimit));

      if (requestFilter !== "All") {
        params.set("status", requestFilter.toUpperCase());
      }
      if (requestSearch.trim()) {
        params.set("search", requestSearch.trim());
      }

      const response = await api.get("/dms-access-request/get-all", { params });

      if (response.data.status === "success" && Array.isArray(response.data.data)) {
        const mapped = response.data.data.map((item: any): AccessRequest => ({
          id: item.request_id,
          requesterId: item.requester_id,
          requesterName: item.requester_name,
          requesterRole: item.requester_designation,
          requesterDepartment: item.requester_department,

          documentId: String(item.document_id),
          documentNumber: item.document_number,
          documentTitle: item.document_title,

          isConfidential: item.security_classification === "CONFIDENTIAL",
          reason: item.justification,

          status:
            ({
              PENDING: "Pending",
              APPROVED: "Approved",
              REJECTED: "Rejected",
              EXPIRED: "Expired",
            }[String(item.status).toUpperCase()] as
              | "Pending"
              | "Approved"
              | "Rejected"
              | "Expired") ??
            (item.status === "PENDING"
              ? "Pending"
              : item.status === "APPROVED"
                ? "Approved"
                : item.status === "EXPIRED"
                  ? "Expired"
                  : "Rejected"),

          requestDate: new Date(item.requested_on).toLocaleDateString("en-IN"),

          validFrom: item.valid_from,
          validTo: item.valid_to,

          isLifetime: item.permission_model === "LIFETIME",

          approvedBy: undefined,
          approvedDate: undefined,
        }));

        setAccessRequests(mapped);
        setAccessRequestsTotalCount(response.data.total_count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch access requests:", error);
      setToast("Failed to load access requests.", "error");
    }
  }, [accessRequestsPage, accessRequestsLimit, requestFilter, requestSearch, setToast]);

  useEffect(() => {
    if (activeMainTab === "access-requests") {
      fetchAccessRequestCounts();
      fetchAccessRequests();
    }
  }, [activeMainTab, fetchAccessRequestCounts, fetchAccessRequests]);

  useEffect(() => {
    setAccessRequestsPage(1);
  }, [requestFilter, requestSearch]);

  const pendingRequestsCount = accessRequestsCounts.pending;

  const handleOpenGrantModal = async (request: AccessRequest) => {
    try {
      const response = await api.get(`/dms-access-request/get/${request.id}`);
      if (response.data?.status === "success" && response.data.data) {
        const item = response.data.data;
        const freshRequest: AccessRequest = {
          id: item.request_id,
          requesterName: item.requester_name,
          requesterRole: item.requester_designation,
          requesterDepartment: item.requester_department,

          documentId: String(item.document_id),
          documentNumber: item.document_number,
          documentTitle: item.document_title,

          isConfidential: item.security_classification === "CONFIDENTIAL",
          reason: item.justification,

          status:
            item.status === "PENDING"
              ? "Pending"
              : item.status === "APPROVED"
                ? "Approved"
                : "Rejected",

          requestDate: new Date(item.requested_on).toLocaleDateString("en-IN"),

          validFrom: item.valid_from,
          validTo: item.valid_to,

          isLifetime: item.permission_model === "LIFETIME",

          approvedBy: undefined,
          approvedDate: undefined,
        };

        setGrantModalRequest(freshRequest);

        const defaultFromDate = freshRequest.validFrom || new Date().toISOString().split("T")[0];
        setGrantFromDate(defaultFromDate);

        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const defaultToDate = freshRequest.validTo || nextMonth.toISOString().split("T")[0];
        setGrantToDate(defaultToDate);

        setGrantRemarks("");
        setGrantIsLifetime(Boolean(freshRequest.isLifetime));
        return;
      }
    } catch (error) {
      console.error("Failed to fetch fresh request data:", error);
    }

    // Fallback if fetch fails or data is missing
    setGrantModalRequest(request);
    const today = new Date().toISOString().split("T")[0] || "";
    const defaultTo = new Date();
    defaultTo.setDate(defaultTo.getDate() + 30);
    setGrantFromDate(today);
    setGrantToDate(defaultTo.toISOString().split("T")[0] || "");
    setGrantRemarks("");
    setGrantIsLifetime(Boolean(request.isLifetime));
  };

  const handleConfirmGrantAccess = async () => {
    if (!grantModalRequest) return;
    const req = grantModalRequest;

    try {
      const payload = {
        status: "APPROVED",
        permission_model: grantIsLifetime ? "LIFETIME" : "TIME_BOUNDED",
        valid_from: grantFromDate || null,
        valid_to: grantIsLifetime ? null : grantToDate || null,
        review_remarks: grantRemarks || "",
        reviewed_by: getLoggedInUserId(),
        reviewed_by_name: getLoggedInUserName(),
      };

      const response = await api.patch(`/dms-access-request/action/${req.id}`, payload);

      if (response.data.status === "success") {
        if (grantIsLifetime) {
          notify?.(`Permanent Lifetime access granted to ${req.requesterName}`);
        } else {
          notify?.(
            `Timed access granted to ${req.requesterName} from ${grantFromDate} to ${grantToDate}`,
          );
        }

        // Refresh table and counts
        fetchAccessRequestCounts();
        fetchAccessRequests();
      } else {
        setToast("Failed to grant access.", "error");
      }
    } catch (error) {
      console.error("Failed to grant access:", error);
      setToast("Failed to grant access.", "error");
    } finally {
      setGrantModalRequest(null);
    }
  };

  const handleRejectRequest = async (request: AccessRequest) => {
    try {
      const payload = {
        status: "REJECTED",
        permission_model: "TIME_BOUNDED",
        valid_from: new Date().toISOString().split("T")[0],
        valid_to: new Date().toISOString().split("T")[0],
        review_remarks: "Access not required",
        reviewed_by: getLoggedInUserId(),
        reviewed_by_name: getLoggedInUserName(),
      };

      const response = await api.patch(`/dms-access-request/action/${request.id}`, payload);

      if (response.data.status === "success") {
        notify?.(`Access request for ${request.documentNumber} declined`);
        fetchAccessRequestCounts();
        fetchAccessRequests();
      } else {
        setToast("Failed to decline request.", "error");
      }
    } catch (error) {
      console.error("Failed to decline request:", error);
      setToast("Failed to decline request.", "error");
    }
  };

  return {
    accessRequests,
    setAccessRequests,
    accessRequestsPage,
    setAccessRequestsPage,
    accessRequestsLimit,
    setAccessRequestsLimit,
    accessRequestsTotalCount,
    setAccessRequestsTotalCount,
    accessRequestsCounts,
    setAccessRequestsCounts,
    pendingRequestsCount,
    requestFilter,
    setRequestFilter,
    requestSearch,
    setRequestSearch,
    grantModalRequest,
    setGrantModalRequest,
    grantFromDate,
    setGrantFromDate,
    grantToDate,
    setGrantToDate,
    grantIsLifetime,
    setGrantIsLifetime,
    grantRemarks,
    setGrantRemarks,
    fetchAccessRequests,
    fetchAccessRequestCounts,
    handleOpenGrantModal,
    handleConfirmGrantAccess,
    handleRejectRequest,
  };
}
