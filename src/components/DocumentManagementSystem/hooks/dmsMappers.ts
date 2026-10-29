// Pure data-mapping functions used across multiple features (Trash, Archive, Folders).
// Extracted verbatim from useDmsWorkspace.ts – no behavioural changes.

import type {
  DocStatus,
  DocumentRecord,
  DmsHierarchyDocument,
} from "../types";

export const parseStringList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return (
            (item as any).user_name ||
            (item as any).name ||
            (item as any).email ||
            (item as any).employee_code ||
            String((item as any).id || "") ||
            ""
          ).trim();
        }
        return String(item).trim();
      })
      .filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parseStringList(parsed);
        }
      } catch {
        // fallback to comma split
      }
    }
    return trimmed
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const mapApiDocumentToDocumentRecord = (
  doc: DmsHierarchyDocument,
  folderName: string,
  subfolderName = "",
  subSubfolderName = ""
): DocumentRecord => ({
  id: String(doc.document_id),
  number: doc.document_number,
  title: doc.document_title,
  subject: doc.document_subject || "",
  department: doc.department || "",
  location: doc.location || "",
  category: doc.category || "",
  folder: folderName,
  subfolder: subfolderName,
  subSubfolder: subSubfolderName || doc.sub_sub_folder_name || undefined,
  filePath: doc.file_path || "",
  fileName: doc.file_name || "",
  fileType: doc.file_type || "",
  type: doc.document_type || "",
  revision: doc.revision || "Rev 01",
  revisionNumber: doc.revision_number ?? undefined,
  revisionCount: doc.revision_count ?? undefined,
  status: (doc.status as DocStatus) || "Controlled",
  owner: doc.custodian_name || "",
  custodian: doc.custodian_name || "",
  openDate: doc.open_date || "",
  closeDate: doc.close_date || undefined,
  volume: doc.volume || "",
  securityClassification: doc.security_classification || "",
  retentionClass: doc.retention_class || "",
  rack: doc.physical_rack || "",
  shelf: doc.physical_shelf || "",
  box: doc.physical_box || "",
  isConfidential: doc.confidential_document,
  updated: doc.updated_at || doc.created_at || "",
  created: doc.created_at || "",
  access: parseStringList(doc.individual_engineer),
  tags: parseStringList(doc.tags),
  size: doc.file_size || "",
  description: doc.description || "",
  preview: false,
  isDeleted: doc.is_deleted,
  hasAccess: doc.has_access,
  canView: doc.can_view,
  canDownload: doc.can_download,
  canRequestAccess: doc.can_request_access,
  accessStatus: doc.access_status,
  approvalStatus: doc.approval_status || undefined,
  pendingRequestId: doc.pending_request_id,
  createdBy: doc.created_by ?? null,
  created_by_name: doc.created_by_name || "",
  has_publisher_privileges: doc.has_publisher_privileges,
});
