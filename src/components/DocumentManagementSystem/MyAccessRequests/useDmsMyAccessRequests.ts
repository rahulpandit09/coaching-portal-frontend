// User access requests state and handlers.
// Extracted verbatim from useDmsWorkspace.ts – no behavioural changes.

import React, { useState, useEffect, useCallback } from "react";
import api from "@/api/axiosInstance";
import type { DocumentRecord, AccessRequest, DmsHierarchyFolder } from "../types";
import {
  getLoggedInUserId,
  getLoggedInUserName,
  getLoggedInUserDesignation,
  getLoggedInUserDepartment,
} from "../hooks/dmsUser";

interface UseDmsMyAccessRequestsOptions {
  activeMainTab: string;
  setToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
  setHierarchyData: React.Dispatch<React.SetStateAction<DmsHierarchyFolder[]>>;
  setAccessRequests: React.Dispatch<React.SetStateAction<AccessRequest[]>>;
  setAccessRequestsTotalCount: React.Dispatch<React.SetStateAction<number>>;
}

export function useDmsMyAccessRequests({
  activeMainTab,
  setToast,
  setHierarchyData,
  setAccessRequests,
  setAccessRequestsTotalCount,
}: UseDmsMyAccessRequestsOptions) {
  // User access request state
  const [showRequestAccessModalFor, setShowRequestAccessModalFor] = useState<DocumentRecord | null>(
    null,
  );
  const [userRequestReason, setUserRequestReason] = useState("");

  const fetchMyAccessRequests = useCallback(async () => {
    try {
      const requesterId = getLoggedInUserId();

      const response = await api.get("/dms-access-request/get-all", {
        params: {
          scope: "my_requests",
          requester_id: requesterId,
          page: 1,
          limit: 100,
        },
      });

      if (
        response.data?.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        const mapped = response.data.data.map(
          (item: any): AccessRequest => ({
            id: item.request_id,
            requesterId: item.requester_id,

            requesterName: item.requester_name,
            requesterRole: item.requester_designation,
            requesterDepartment: item.requester_department,

            documentId: String(item.document_id),
            documentNumber: item.document_number,
            documentTitle: item.document_title,

            isConfidential:
              item.security_classification?.toUpperCase() ===
              "CONFIDENTIAL",

            reason: item.justification || "",

            status:
              item.status === "PENDING"
                ? "Pending"
                : item.status === "APPROVED"
                  ? "Approved"
                  : item.status === "REJECTED"
                    ? "Rejected"
                    : item.status === "EXPIRED"
                      ? "Expired"
                      : item.status,

            requestDate: item.requested_on
              ? new Date(item.requested_on).toLocaleDateString("en-IN")
              : "",

            validFrom: item.valid_from || undefined,
            validTo: item.valid_to || undefined,

            isLifetime: item.permission_model === "LIFETIME",

            approvedBy: item.reviewed_by_name || undefined,

            approvedDate: item.reviewed_at
              ? new Date(item.reviewed_at).toLocaleDateString("en-IN")
              : undefined,
          })
        );

        setAccessRequests(mapped);
        setAccessRequestsTotalCount(
          response.data.total_count ?? mapped.length
        );
      }
    } catch (error: any) {
      console.error("Failed to fetch my access requests:", error);

      setToast(
        error?.response?.data?.detail ||
          "Failed to load your access requests.",
        "error"
      );
    }
  }, [setAccessRequests, setAccessRequestsTotalCount, setToast]);

  useEffect(() => {
    if (activeMainTab === "my-requests") {
      fetchMyAccessRequests();
    }
  }, [activeMainTab, fetchMyAccessRequests]);

  const handleUserSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!showRequestAccessModalFor || !userRequestReason.trim()) return;

    const targetDoc = showRequestAccessModalFor;
    const reasonText = userRequestReason.trim();

    try {
      const payload = {
        requester_id: getLoggedInUserId(),
        requester_name: getLoggedInUserName(),
        requester_designation: getLoggedInUserDesignation(),
        requester_department: getLoggedInUserDepartment(),

        document_id: Number(targetDoc.id) || 0,
        document_number: targetDoc.number,
        document_title: targetDoc.title,

        security_classification: targetDoc.securityClassification || "Internal",

        justification: reasonText,

        status: "PENDING",
        permission_model: "TIME_BOUNDED",

        valid_from: new Date().toISOString().split("T")[0],
        valid_to: new Date().toISOString().split("T")[0],

        created_by: getLoggedInUserId(),
      };

      const response = await api.post("/dms-access-request/create", payload);

      if (
        response.data?.status === "success" ||
        response.status === 200 ||
        response.status === 201
      ) {
        setToast(
          `Access request submitted successfully for ${targetDoc.number}. Notification sent to assigned Publisher.`,
          "success"
        );

        setShowRequestAccessModalFor(null);
        setUserRequestReason("");

        const requestId = response.data?.request_id || response.data?.data?.id || null;
        const targetIdNum = Number(targetDoc.id);

        setHierarchyData((prev) =>
          prev.map((folder) => ({
            ...folder,
            root_documents: folder.root_documents?.map((doc) =>
              doc.document_id === targetIdNum
                ? {
                    ...doc,
                    has_access: false,
                    can_view: false,
                    can_download: false,
                    can_request_access: false,
                    access_status: "PENDING_REQUEST",
                    pending_request_id: requestId,
                  }
                : doc
            ),
            sub_folders: folder.sub_folders?.map((sub) => ({
              ...sub,
              documents: sub.documents?.map((doc) =>
                doc.document_id === targetIdNum
                  ? {
                      ...doc,
                      has_access: false,
                      can_view: false,
                      can_download: false,
                      can_request_access: false,
                      access_status: "PENDING_REQUEST",
                      pending_request_id: requestId,
                    }
                  : doc
              ),
            })),
          }))
        );

        await fetchMyAccessRequests();
      } else {
        setToast("Failed to submit access request.", "error");
      }
    } catch (error: any) {
      console.error("Failed to create access request:", error);

      const status = error?.response?.status;
      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.message;

      if (
        status === 400 &&
        typeof detail === "string" &&
        detail.toLowerCase().includes("pending access request already exists")
      ) {
        setToast(
          "You already have a pending access request for this document.",
          "warning"
        );
        return;
      }

      setToast(
        detail || "Failed to submit access request.",
        "error"
      );
    }
  };

  return {
    showRequestAccessModalFor,
    setShowRequestAccessModalFor,
    userRequestReason,
    setUserRequestReason,
    fetchMyAccessRequests,
    handleUserSubmitRequest,
  };
}
