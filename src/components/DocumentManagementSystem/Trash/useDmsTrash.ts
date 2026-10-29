// Trash (Recycle Bin) state and handlers.
// Extracted verbatim from useDmsWorkspace.ts – no behavioural changes.

import { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/api/axiosInstance";
import type { DocumentRecord, DmsHierarchyDocument } from "../types";
import { mapApiDocumentToDocumentRecord } from "../hooks/dmsMappers";
import { getLoggedInUserId } from "../hooks/dmsUser";

export function useDmsTrash({
  role,
  activeMainTab,
  setToast,
  fetchFolders,
  previewDocId,
  setPreviewDocId,
  selectedId,
  setSelectedId,
}: {
  role: string;
  activeMainTab: string;
  setToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
  fetchFolders: () => Promise<void>;
  previewDocId: string | null;
  setPreviewDocId: (id: string | null) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}) {
  const [trashDocuments, setTrashDocuments] = useState<DocumentRecord[]>([]);
  const [isLoadingTrash, setIsLoadingTrash] = useState(false);
  const [totalDeletedCount, setTotalDeletedCount] = useState(0);
  const [matchingFilterCount, setMatchingFilterCount] = useState(0);
  const [trashPage, setTrashPage] = useState(1);
  const [trashLimit, setTrashLimit] = useState(10);
  const [trashSearchQuery, setTrashSearchQuery] = useState("");
  const [trashFilterYear, setTrashFilterYear] = useState<string>("All");
  const [trashFilterFolder, setTrashFilterFolder] = useState<string>("All");
  const [trashFilterSubfolder, setTrashFilterSubfolder] = useState<string>("All");
  const [trashSortBy, setTrashSortBy] = useState<
    "recently-deleted" | "oldest-deleted" | "title-asc" | "number-asc"
  >("recently-deleted");

  const [documentToDelete, setDocumentToDelete] = useState<DocumentRecord | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<DocumentRecord | null>(null);
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
  const [fileActionMenu, setFileActionMenu] = useState<{
    document: DocumentRecord;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (role !== "Admin" && activeMainTab === "trash") {
      // Role guard handled by composer via setActiveMainTab
    }
  }, [role, activeMainTab]);

  const fetchTrashDocuments = useCallback(async () => {
    try {
      setIsLoadingTrash(true);

      const params: Record<string, string | number> = {
        page: trashPage,
        limit: trashLimit,
      };

      if (trashSearchQuery.trim()) {
        params.search = trashSearchQuery.trim();
      }

      if (trashFilterYear !== "All") {
        params.year = Number(trashFilterYear);
      }

      const response = await api.get("/dms-document/trash", { params });

      if (
        response.data?.status !== "success" ||
        !Array.isArray(response.data.data)
      ) {
        throw new Error("Invalid Trash API response.");
      }

      const mappedDocuments: DocumentRecord[] =
        response.data.data.map((doc: any) => ({
          ...mapApiDocumentToDocumentRecord(
            doc,
            doc.folder_name || doc.target_folder || "Unknown Folder",
            doc.sub_folder_name || "",
          ),
          id: String(doc.document_id),
          title: doc.document_title || "",
          number: doc.document_number || "",
          subject: doc.document_subject || "",
          type: doc.document_type || "",
          size: doc.file_size || "",
          revision: doc.revision || "",
          department: doc.department || "",
          location: doc.location || "",
          folder: doc.folder_name || doc.target_folder || "",
          subfolder: doc.sub_folder_name || "",
          subSubfolder: doc.sub_sub_folder_name || "",
          isDeleted: Boolean(doc.is_deleted),
          deletedAt: doc.deleted_at || "",
          deletedBy: doc.deleted_by_name || "",
        }));

      setTrashDocuments(mappedDocuments);
      setTotalDeletedCount(Number(response.data.total_deleted) || 0);
      setMatchingFilterCount(
        Number(response.data.matching_filter_count) || 0,
      );
    } catch (error) {
      console.error("Failed to load Trash documents:", error);
      setToast("Failed to load Trash documents.", "error");
    } finally {
      setIsLoadingTrash(false);
    }
  }, [
    trashPage,
    trashLimit,
    trashSearchQuery,
    trashFilterYear,
    setToast,
  ]);

  useEffect(() => {
    setTrashPage(1);
  }, [trashSearchQuery, trashFilterYear]);

  useEffect(() => {
    if (activeMainTab === "trash" && role === "Admin") {
      fetchTrashDocuments();
    }
  }, [activeMainTab, role, fetchTrashDocuments]);

  const deletedDocsCount = totalDeletedCount;

  const availableTrashYears = useMemo(() => {
    const years = new Set<string>();
    for (const doc of trashDocuments) {
      if (doc.isDeleted) {
        const dateStr = doc.deletedAt || doc.updated || doc.created || "";
        const m = dateStr.match(/\b(20\d\d)\b/);
        if (m && m[1]) years.add(m[1]);
      }
    }
    return Array.from(years).sort().reverse();
  }, [trashDocuments]);

  const deletedDocuments = useMemo(() => {
    const q = trashSearchQuery.trim().toLowerCase();
    const list = trashDocuments.filter((doc) => {
      if (!doc.isDeleted) return false;

      // Year filter
      if (trashFilterYear !== "All") {
        const delDate = doc.deletedAt || doc.updated || doc.created || "";
        if (!delDate.includes(trashFilterYear)) {
          return false;
        }
      }

      // Folder filter
      if (trashFilterFolder !== "All") {
        if (doc.folder !== trashFilterFolder) return false;
      }

      // Subfolder filter
      if (trashFilterSubfolder !== "All") {
        if (doc.subfolder !== trashFilterSubfolder) return false;
      }

      // Search query in deleted files only
      if (q) {
        const matches = [
          doc.number,
          doc.title,
          doc.subject || "",
          doc.department,
          doc.location,
          doc.folder || "",
          doc.subfolder || "",
          doc.deletedBy || "",
          doc.type,
          ...doc.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
        if (!matches) return false;
      }

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (trashSortBy === "recently-deleted") {
        const timeA = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
        const timeB = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
        return timeB - timeA;
      }
      if (trashSortBy === "oldest-deleted") {
        const timeA = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
        const timeB = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
        return timeA - timeB;
      }
      if (trashSortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      }
      if (trashSortBy === "number-asc") {
        return a.number.localeCompare(b.number);
      }
      return 0;
    });
  }, [
    trashDocuments,
    trashSearchQuery,
    trashFilterYear,
    trashFilterFolder,
    trashFilterSubfolder,
    trashSortBy,
  ]);

  const handleMoveToTrash = async (doc: DocumentRecord) => {
    try {
      const deleterName =
        role === "Admin"
          ? "Administrator"
          : role === "Publisher"
            ? "A. Menon (Publisher)"
            : "Field Engineer (User)";

      await api.delete(
        `/dms-document/delete/${doc.id}`,
        {
          params: {
            deleted_by: getLoggedInUserId(),
          },
        }
      );

      await Promise.all([
        fetchFolders(),
        fetchTrashDocuments(),
      ]);

      if (selectedId === doc.id) {
        setSelectedId(null);
      }
      if (previewDocId === doc.id) {
        setPreviewDocId(null);
      }
      setDocumentToDelete(null);
      setFileActionMenu(null);
      setToast(`Document "${doc.number}" moved to Trash.`);
    } catch (error) {
      console.error("Failed to delete document:", error);
      setToast("Failed to delete document.");
    }
  };

  const handleRestoreDocument = async (docId: string) => {
    const doc = trashDocuments.find((d) => d.id === docId);

    try {
      await api.post(`/dms-document/trash/restore/${docId}`);

      await Promise.all([
        fetchFolders(),
        fetchTrashDocuments(),
      ]);

      setPermanentDeleteTarget(null);

      setToast(
        `Document "${doc?.number || docId}" restored successfully.`,
        "success"
      );
    } catch (error: any) {
      console.error("Failed to restore document:", error);

      setToast(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to restore document.",
        "error"
      );
    }
  };

  const handleRestoreAllDocuments = async () => {
    try {
      await Promise.all(
        trashDocuments.map((doc) =>
          api.post(`/dms-document/trash/restore/${doc.id}`)
        )
      );

      await Promise.all([
        fetchFolders(),
        fetchTrashDocuments(),
      ]);

      setToast("All Trash documents restored successfully.", "success");
    } catch (error: any) {
      console.error("Failed to restore all Trash documents:", error);

      await fetchTrashDocuments();

      setToast(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to restore all Trash documents.",
        "error"
      );
    }
  };

  const handlePermanentDelete = async (docId: string) => {
    const doc = trashDocuments.find((d) => d.id === docId);

    try {
      await api.delete(`/dms-document/trash/purge/${docId}`);

      await fetchTrashDocuments();

      if (previewDocId === docId) {
        setPreviewDocId(null);
      }

      if (selectedId === docId) {
        setSelectedId(null);
      }

      setPermanentDeleteTarget(null);

      setToast(
        `Document "${doc?.number || docId}" permanently deleted.`,
        "success"
      );
    } catch (error: any) {
      console.error("Failed to permanently delete document:", error);

      setToast(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to permanently delete document.",
        "error"
      );
    }
  };

  const handleEmptyTrash = async (previewDoc: DocumentRecord | null) => {
    const count = trashDocuments.length;

    try {
      await Promise.all(
        trashDocuments.map((doc) =>
          api.delete(`/dms-document/trash/purge/${doc.id}`)
        )
      );

      if (previewDoc?.isDeleted) {
        setPreviewDocId(null);
      }

      await fetchTrashDocuments();

      setShowEmptyTrashModal(false);

      setToast(`Trash emptied: ${count} documents permanently purged.`, "success");
    } catch (error: any) {
      console.error("Failed to empty Trash:", error);

      await fetchTrashDocuments();

      setToast(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to empty Trash.",
        "error"
      );
    }
  };

  return {
    trashDocuments,
    isLoadingTrash,
    trashSearchQuery,
    setTrashSearchQuery,
    trashFilterYear,
    setTrashFilterYear,
    trashFilterFolder,
    setTrashFilterFolder,
    trashFilterSubfolder,
    setTrashFilterSubfolder,
    trashSortBy,
    setTrashSortBy,
    fileActionMenu,
    setFileActionMenu,
    documentToDelete,
    setDocumentToDelete,
    permanentDeleteTarget,
    setPermanentDeleteTarget,
    showEmptyTrashModal,
    setShowEmptyTrashModal,
    fetchTrashDocuments,
    deletedDocsCount,
    totalDeletedCount,
    matchingFilterCount,
    trashPage,
    setTrashPage,
    trashLimit,
    setTrashLimit,
    availableTrashYears,
    deletedDocuments,
    handleMoveToTrash,
    handleRestoreDocument,
    handleRestoreAllDocuments,
    handlePermanentDelete,
    handleEmptyTrash,
  };
}
