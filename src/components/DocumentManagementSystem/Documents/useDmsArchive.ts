// Archive state and handlers.
// Extracted verbatim from useDmsWorkspace.ts – no behavioural changes.

import { useState, useEffect, useCallback } from "react";
import api from "@/api/axiosInstance";
import type { DocStatus, DocumentRecord } from "../types";
import { mapApiDocumentToDocumentRecord } from "../hooks/dmsMappers";

export function useDmsArchive({
  activeMainTab,
}: {
  activeMainTab: string;
}) {
  const [archivedData, setArchivedData] = useState<DocumentRecord[]>([]);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);

  const fetchArchivedDocuments = useCallback(async () => {
    try {
      setIsLoadingArchived(true);

      const response = await api.get("/dms-document/get-all-archived", {
        params: {
          page: 1,
          limit: 100,
        },
      });

      if (
        response.data?.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        const mapped: DocumentRecord[] = response.data.data.map(
          (doc: any) => ({
            ...mapApiDocumentToDocumentRecord(
              doc,
              doc.folder_name || doc.target_folder || "Archived Records",
              doc.sub_folder_name || ""
            ),

            // Preserve the archive state returned by the API.
            status: "Archived" as DocStatus,

            // Archive records should not be treated as deleted files.
            isDeleted: false,
          })
        );

        setArchivedData(mapped);
      } else {
        setArchivedData([]);
      }
    } catch (error) {
      console.error("Failed to load archived documents:", error);
      setArchivedData([]);
    } finally {
      setIsLoadingArchived(false);
    }
  }, []);

  useEffect(() => {
    if (activeMainTab === "archive") {
      fetchArchivedDocuments();
    }
  }, [activeMainTab, fetchArchivedDocuments]);

  return {
    archivedData,
    isLoadingArchived,
    fetchArchivedDocuments,
  };
}
