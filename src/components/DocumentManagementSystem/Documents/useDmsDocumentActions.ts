// DMS Document Actions hook: selection, preview, download, archive/unarchive, and document prefill.
// Extracted verbatim from useDmsWorkspace.ts – no behavioural changes.

import React, { useState, useMemo } from "react";
import api from "@/api/axiosInstance";
import type { Role, DocStatus, DocumentRecord } from "../types";
import { formatNow } from "../initial-data";

interface UseDmsDocumentActionsOptions {
  role: Role;
  documents: DocumentRecord[];
  filteredDocuments: DocumentRecord[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  previewDocId: string | null;
  setPreviewDocId: (id: string | null) => void;
  setShowDetailsPane?: (show: boolean) => void;
  setShowRequestAccessModalFor: (doc: DocumentRecord | null) => void;
  setFileActionMenu: React.Dispatch<
    React.SetStateAction<{
      document: DocumentRecord;
      x: number;
      y: number;
    } | null>
  >;
  fetchFolders: () => Promise<void>;
  fetchArchivedDocuments: () => Promise<void>;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentRecord[]>>;
  setToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
  notify?: (msg: string) => void;
}

export function useDmsDocumentActions({
  role,
  documents,
  filteredDocuments,
  selectedId,
  setSelectedId,
  previewDocId,
  setPreviewDocId,
  setShowDetailsPane,
  setShowRequestAccessModalFor,
  setFileActionMenu,
  fetchFolders,
  fetchArchivedDocuments,
  setDocuments,
  setToast,
  notify,
}: UseDmsDocumentActionsOptions) {
  const [showAdd, setShowAdd] = useState(false);
  const [addDocPrefill, setAddDocPrefill] = useState<{
    targetFolder: string;
    targetSubfolder: string;
    targetSubSubfolder?: string | undefined;
    prefillDoc: DocumentRecord | null;
  } | null>(null);

  const selected: DocumentRecord | null = useMemo(() => {
    if (!selectedId) return null;
    return (
      filteredDocuments.find((document) => document.id === selectedId) ??
      documents.find((document) => document.id === selectedId) ??
      null
    );
  }, [documents, filteredDocuments, selectedId]);

  const hasAccess = selected ? !!selected.hasAccess : false;
  const canEdit = selected ? role === "Publisher" : false;

  const previewDoc: DocumentRecord | null = useMemo(() => {
    if (!previewDocId) return null;
    return documents.find((doc) => doc.id === previewDocId) ?? null;
  }, [documents, previewDocId]);

  const previewAccess = previewDoc ? !!previewDoc.hasAccess : false;

  const updateSelected = (patch: Partial<DocumentRecord>) => {
    if (!selected) return;
    setDocuments((current) =>
      current.map((document) =>
        document.id === selected.id ? { ...document, ...patch } : document,
      ),
    );
  };

  const getPrefillDocForSubfolder = (
    folderName: string,
    subfolderName: string,
    subSubfolderName?: string | null,
  ): DocumentRecord => {
    // 1. Check if there are existing documents in this exact folder & subfolder (and sub-subfolder)
    if (subSubfolderName) {
      const exactSubSubDoc = documents.find(
        (d) =>
          d.folder === folderName &&
          d.subfolder === subfolderName &&
          d.subSubfolder === subSubfolderName,
      );
      if (exactSubSubDoc) return exactSubSubDoc;
    }

    const exactSubDoc = documents.find(
      (d) => d.folder === folderName && d.subfolder === subfolderName,
    );
    if (exactSubDoc) {
      if (subSubfolderName && !exactSubDoc.subSubfolder) {
        return {
          ...exactSubDoc,
          subSubfolder: subSubfolderName,
        };
      }
      return exactSubDoc;
    }

    // 2. Fallback to any document in the same folder
    const folderDoc = documents.find((d) => d.folder === folderName);

    // 3. Fallback to any document in the workspace
    const baseDoc = folderDoc || documents[0];

    // Determine appropriate department
    const combinedName = (folderName + " " + subfolderName).toLowerCase();
    let dept = baseDoc?.department || "OP";
    if (
      combinedName.includes("hse") ||
      combinedName.includes("safety") ||
      combinedName.includes("environment") ||
      combinedName.includes("kspcb") ||
      combinedName.includes("oisd")
    ) {
      dept = "HSE";
    } else if (
      combinedName.includes("hr") ||
      combinedName.includes("human") ||
      combinedName.includes("labour")
    ) {
      dept = "HR";
    } else if (combinedName.includes("project") || combinedName.includes("engineering")) {
      dept = "PROJECTS";
    } else if (
      combinedName.includes("legal") ||
      combinedName.includes("land") ||
      combinedName.includes("acts") ||
      combinedName.includes("rules")
    ) {
      dept = "LE";
    } else if (
      combinedName.includes("finance") ||
      combinedName.includes("account") ||
      combinedName.includes("audit")
    ) {
      dept = "FI";
    } else if (
      combinedName.includes("it") ||
      combinedName.includes("telecom") ||
      combinedName.includes("wireless")
    ) {
      dept = "IT";
    } else if (combinedName.includes("corporate") || combinedName.includes("secretariat")) {
      dept = "CS";
    } else if (combinedName.includes("public") || combinedName.includes("relations")) {
      dept = "PR";
    } else if (
      combinedName.includes("operation") ||
      combinedName.includes("pipeline") ||
      combinedName.includes("ims")
    ) {
      dept = "OP";
    }

    // Determine document type
    let docType = baseDoc?.type || "Procedure";
    if (
      combinedName.includes("standard") ||
      combinedName.includes("code") ||
      combinedName.includes("oisd")
    ) {
      docType = "Standard";
    } else if (combinedName.includes("policy") || combinedName.includes("policies")) {
      docType = "Policy";
    } else if (combinedName.includes("manual")) {
      docType = "Manual";
    } else if (combinedName.includes("register") || combinedName.includes("log")) {
      docType = "Register";
    } else if (combinedName.includes("drawing") || combinedName.includes("route")) {
      docType = "Drawing";
    }

    const subTag = subfolderName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const folderTag =
      folderName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .split("-")[0] || "";
    const tags: string[] = Array.from(
      new Set([subTag, folderTag, ...(baseDoc?.tags || ["controlled", "pmhbl"])]),
    ).filter((t): t is string => Boolean(t));

    return {
      id: String(baseDoc?.id),
      number: `PMHBL - ${dept} - ${baseDoc?.location || "MLR"} - 09/2026 - PRE`,
      title: `${subfolderName} - Standard Operational Specification`,
      subject: `Controlled operating, maintenance & statutory compliance record for ${folderName} · ${subfolderName}`,
      department: dept,
      location: baseDoc?.location || "MLR",
      category: `${folderName} / ${subfolderName}`,
      folder: folderName,
      subfolder: subfolderName,
      subSubfolder: subSubfolderName || undefined,
      type: docType,
      revision: baseDoc?.revision || "Rev 01",
      status: "Controlled",
      owner: baseDoc?.owner || "Doc Controller (MLR)",
      custodian: baseDoc?.custodian || baseDoc?.owner || "Doc Controller (MLR)",
      openDate: baseDoc?.openDate || new Date().toISOString().split("T")[0],
      closeDate: baseDoc?.closeDate || "",
      volume: baseDoc?.volume || "Vol 01",
      securityClassification: baseDoc?.securityClassification || "Restricted",
      retentionClass: baseDoc?.retentionClass || "10 Years",
      rack: baseDoc?.rack || "Rack 01",
      shelf: baseDoc?.shelf || "Shelf A",
      box: baseDoc?.box || "BX-101",
      isConfidential: Boolean(baseDoc?.isConfidential),
      updated: "Just now",
      created: "Just now",
      access: baseDoc?.access?.length ? [...baseDoc.access] : ["A. Menon", "R. Thomas"],
      tags,
      size: "2.5 MB",
      description: `Operational record pre-filled for ${folderName} · ${subfolderName}`,
    };
  };

  const handleOpenAddForSubfolder = (
    folderName: string,
    subfolderName: string,
    subSubfolderName?: string,
    targetFolderId?: number | null,
    subfolderPath?: string[],
  ) => {
    setAddDocPrefill({
      targetFolder: folderName,
      targetSubfolder: subfolderName,
      targetSubSubfolder: subSubfolderName,
      prefillDoc: null,
    });

    setShowAdd(true);
  };

  const handleOpenAddForSubSubfolder = (
    folderName: string,
    subfolderName: string,
    subSubfolderName: string,
  ) => {
    handleOpenAddForSubfolder(folderName, subfolderName, subSubfolderName);
  };

  const handleOpenDocumentNumberPreview = (doc: DocumentRecord) => {
    setSelectedId(doc.id);
    const hasAccess = !!doc.hasAccess;
    if (!hasAccess && role !== "Publisher") {
      setShowRequestAccessModalFor(doc);
      return;
    }
    setPreviewDocId(doc.id);
    setShowDetailsPane?.(true);
  };
  const handleOpenFilePreview = handleOpenDocumentNumberPreview;

  const handleDocumentLeftClick = (e: React.MouseEvent, document: DocumentRecord) => {
    setSelectedId(document.id);
    const menuWidth = 240;
    const menuHeight = 280;
    const x = Math.min(
      e.clientX,
      (typeof window !== "undefined" ? window.innerWidth : 1200) - menuWidth - 20,
    );
    const y = Math.min(
      e.clientY,
      (typeof window !== "undefined" ? window.innerHeight : 800) - menuHeight - 20,
    );
    setFileActionMenu({
      document,
      x: Math.max(10, x),
      y: Math.max(10, y),
    });
  };

  const handleDocumentClick = (doc: DocumentRecord, e?: React.MouseEvent) => {
    e?.stopPropagation();

    const access = { hasAccess: !!doc.hasAccess, isPending: doc.accessStatus === "PENDING_REQUEST" };

    if (!access.hasAccess) {
      setShowRequestAccessModalFor(doc);
      return;
    }

    handleOpenFilePreview(doc);
  };

  const handleDownloadDocument = (doc: DocumentRecord) => {
    const content =
      `PMHBL DOCUMENT MANAGEMENT SYSTEM - CONTROLLED SPECIFICATION\n` +
      `===============================================================\n\n` +
      `Document Number : ${doc.number}\n` +
      `Document Title  : ${doc.title}\n` +
      `Subject         : ${doc.subject || "N/A"}\n` +
      `Folder Path     : ${doc.folder || "N/A"}${doc.subfolder ? " / " + doc.subfolder : ""}${doc.subSubfolder ? " / " + doc.subSubfolder : ""}\n` +
      `Revision        : ${doc.revision}\n` +
      `Status          : ${doc.status}\n` +
      `Department      : ${doc.department}\n` +
      `Location        : ${doc.location}\n` +
      `Owner           : ${doc.owner}\n` +
      `Custodian       : ${doc.custodian || doc.owner}\n` +
      `Classification  : ${doc.securityClassification || "Internal"}\n` +
      `Retention Class : ${doc.retentionClass || "10 Years"}\n` +
      `Storage Physical: Rack ${doc.rack || "01"}, Shelf ${doc.shelf || "A"}, Box ${doc.box || "BX-100"}\n` +
      `File Size       : ${doc.size}\n` +
      `Deposit Date    : ${doc.created}\n` +
      `Last Revision   : ${doc.updated}\n` +
      `Confidential    : ${doc.isConfidential ? "YES (Restricted Access)" : "NO (Standard Access)"}\n` +
      `Tags            : ${doc.tags.join(", ")}\n` +
      `Authorized Viewers: ${doc.access.join(", ")}\n\n` +
      `DESCRIPTION & OPERATIONAL SPECIFICATION:\n` +
      `---------------------------------------------------------------\n` +
      `${doc.description}\n\n` +
      `===============================================================\n` +
      `PMHBL Pipeline Management & Hydrocarbon Balancing Ltd.\n`;

    if (typeof window !== "undefined") {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.number.replace(/[^a-zA-Z0-9-_]/g, "_")}_${doc.revision}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setFileActionMenu(null);
    setToast(`Downloaded specification for ${doc.number}`);
  };

  const handleArchive = async () => {
    if (!selected) return;
    const nextStatus =
      selected.status === "Archived" || (selected.status as string) === "ARCHIVED"
        ? "ACTIVE"
        : "ARCHIVED";

    try {
      let userId = 114;
      const raw = typeof window !== "undefined" ? localStorage.getItem("userData") : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        userId = Number(parsed?.user_id ?? parsed?.userId ?? parsed?.id ?? 114);
      }

      await api.patch(
        `/dms-document/status-update/${selected.id}`,
        null,
        {
          params: {
            status: nextStatus,
            updated_by: userId,
          },
        },
      );

      const displayStatus = nextStatus === "ARCHIVED" ? "Archived" : "Controlled";

      if (nextStatus === "ARCHIVED") {
        updateSelected({
          status: displayStatus as DocStatus,
          archived: formatNow(),
          updated: formatNow(),
        });
      } else {
        updateSelected({ status: displayStatus as DocStatus, updated: formatNow() });
      }
      await fetchFolders();
      await fetchArchivedDocuments();
      (notify || setToast)(
        nextStatus === "ARCHIVED"
          ? "Document moved to Archive with audit timestamp"
          : "Document unarchived and restored to active index",
      );
    } catch (error) {
      console.error("Failed to archive/unarchive document:", error);
      setToast("Failed to update document status.", "error");
    }
  };

  const handleUnarchiveDocument = async (docId: string) => {
    try {
      const response = await api.patch(
        `/dms-document/status-update/${docId}`,
        null,
        {
          params: { status: "ACTIVE" },
        },
      );

      // Handle successful API response.
      if (response.status >= 200 && response.status < 300) {
        // Refresh the active document hierarchy.
        await fetchFolders();

        // Refresh the archive list.
        await fetchArchivedDocuments();

        (notify || setToast)("Document unarchived successfully.");
      }
    } catch (error: any) {
      console.error("Failed to unarchive document:", error);

      (notify || setToast)(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to unarchive document.",
      );
    }
  };

  return {
    showAdd,
    setShowAdd,
    addDocPrefill,
    setAddDocPrefill,
    selected,
    hasAccess,
    canEdit,
    previewDoc,
    previewAccess,
    updateSelected,
    getPrefillDocForSubfolder,
    handleOpenAddForSubfolder,
    handleOpenAddForSubSubfolder,
    handleOpenDocumentNumberPreview,
    handleOpenFilePreview,
    handleDocumentLeftClick,
    handleDocumentClick,
    handleDownloadDocument,
    handleArchive,
    handleUnarchiveDocument,
  };
}
