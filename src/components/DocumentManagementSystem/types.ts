import type { LucideIcon } from "lucide-react";

export type Role = "Admin" | "Publisher" | "User";
export type DocStatus = "Controlled" | "Review" | "Archived" | "Active" | "Inactive" | "Under Review";
export type ViewMode =
  | "Extra large icons"
  | "Large icons"
  | "Medium icons"
  | "Small icons"
  | "List"
  | "Details"
  | "Tiles"
  | "Content";

export type DocumentRecord = {
  id: string;
  number: string;
  title: string;
  subject?: string | undefined;
  department: string;
  location: string;
  category: string;
  folder?: string | undefined;
  subfolder?: string | undefined;
  subSubfolder?: string | undefined;
  subfolderPath?: string[] | undefined;
  filePath?: string;
  fileName?: string;
  type: string;
  revision: string;
  revisionNumber?: number | undefined;
  revisionCount?: number | undefined;
  status: DocStatus;
  owner: string;
  custodian?: string | undefined;
  openDate?: string | undefined;
  closeDate?: string | undefined;
  volume?: string | undefined;
  securityClassification?: string | undefined;
  retentionClass?: string | undefined;
  rack?: string | undefined;
  shelf?: string | undefined;
  box?: string | undefined;
  isConfidential?: boolean | undefined;
  updated: string;
  access: string[];
  tags: string[];
  size: string;
  created: string;
  archived?: string | undefined;
  description: string;
  preview?: boolean | undefined;
  isDeleted?: boolean | undefined;
  deletedAt?: string | undefined;
  deletedBy?: string | undefined;
  version?: string | undefined;
  confidentiality?: string | undefined;
  fileType?: string | undefined;
  publisher?: string | undefined;
  approvalStatus?: string | undefined;
  hasAccess?: boolean;
  canView?: boolean;
  canDownload?: boolean;
  canRequestAccess?: boolean;
  accessStatus?: string;
  pendingRequestId?: number | null;
  createdBy?: number | string | null;
  created_by_name?: string;
  has_publisher_privileges?: boolean;
};

export type SubfolderInfo = {
  id?: number | string;
  sub_folder_id?: number;
  parent_sub_folder_id?: number | null;
  folder_id?: number;
  letter?: string;
  code?: string;
  name: string;
  description: string;
  status?: string;
  is_deleted?: boolean;

  // Recursive nested subfolder support
  subfolders?: SubfolderInfo[];
  children?: SubfolderInfo[];
  sub_folders?: SubfolderInfo[];
  sub_sub_folders?: SubfolderInfo[];
};

export type FolderDefinition = {
  id: string;
  folder_id?: number;
  number: number;
  name: string;
  icon: LucideIcon;
  description: string;
  subfolders?: SubfolderInfo[];
};

export type MainTab =
  | "all-documents"
  | "archive"
  | "access-requests"
  | "publishers"
  | "groups"
  | "my-requests"
  | "trash";

export type EngineerUser = {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  email: string;
};

export type EngineerGroup = {
  id: string;
  name: string;
  description: string;
  department?: string | undefined;
  members: string[];
  createdAt: string;
  createdBy: string;
};

export interface DmsGroupDropdownItem {
  user_id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_code: string;
  designation: string;
  station_name: string;
  station_id: number;
  role_id: number;
  role_name: string;
}

export interface DmsGroupDropdownResponse {
  status: string;
  count: number;
  data: DmsGroupDropdownItem[];
}

export type Publisher = {
  id: string;
  name: string;
  email: string;
  department: string;
  location: string;
  publisherUserId?: number | undefined;
  publisherStationId?: number | undefined;
  assignedFolders: (string | number)[];
  assignedSubfolders: (string | number)[];
  assignedFolderIds?: number[] | undefined;
  assignedSubfolderIds?: number[] | undefined;
  createdDate: string;
  roleTitle?: string | undefined;
  status?: string | undefined;
};

export type AccessRequest = {
  id: string;
  requesterId?: number | string | undefined;
  requesterName: string;
  requesterRole: string;
  requesterDepartment: string;
  requesterLocation?: string | undefined;
  documentId: string;
  docId?: string | undefined;
  documentNumber: string;
  documentTitle: string;
  isConfidential?: boolean | undefined;
  requestDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Expired";
  isLifetime?: boolean | undefined;
  validFrom?: string | undefined;
  validTo?: string | undefined;
  approvedBy?: string | undefined;
  approvedDate?: string | undefined;
};

export type UIMessagePart = {
  type: string;
  text?: string;
  [key: string]: unknown;
};

export type UIMessage = {
  id?: string;
  role?: string;
  content?: string;
  parts: UIMessagePart[];
  [key: string]: unknown;
};

export type DmsHierarchyDocument = {
  document_id: number;
  document_number: string;
  document_title: string;
  document_subject: string | null;
  target_folder: string;
  folder_id: number;
  sub_folder_id: number | null;
  sub_sub_folder_id: number | null;
  department: string | null;
  location: string | null;
  station_id: number | null;
  category: string | null;
  document_type: string | null;
  custodian_id: number | null;
  custodian_name: string | null;
  open_date: string | null;
  close_date: string | null;
  volume: string | null;
  security_classification: string | null;
  retention_class: string | null;
  confidential_document: boolean;
  status: string;
  physical_rack: string | null;
  physical_shelf: string | null;
  physical_box: string | null;
  custody_list: string | string[] | any[] | null;
  individual_engineer: string | string[] | any[] | null;
  file_path: string | null;
  file_name: string | null;
  file_size: string | null;
  file_type: string | null;

  // Current document revision information
  revision?: string | null;
  revision_number?: number | null;
  revision_count?: number | null;

  description: string | null;
  tags: string | string[] | any[] | null;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
  has_access?: boolean;
  can_view?: boolean;
  can_download?: boolean;
  can_request_access?: boolean;
  access_status?: string;
  pending_request_id?: number | null;
  created_by?: number | string | null;
  created_by_name?: string | null;
  approval_status?: string | null;
  sub_sub_folder_name?: string | null;
  has_publisher_privileges?: boolean;
};

export type DmsHierarchySubFolder = {
  sub_folder_id: number;
  folder_id: number;
  parent_sub_folder_id?: number | null;
  sub_folder_code: string | null;
  sub_folder_name: string;
  sub_folder_description: string;
  status: string;
  is_deleted: boolean;
  documents: DmsHierarchyDocument[];
  documents_count: number;
  sub_folders?: DmsHierarchySubFolder[];
  children?: DmsHierarchySubFolder[];
  sub_sub_folders?: DmsHierarchySubFolder[];
};

export type DmsHierarchyFolder = {
  folder_id: number;
  folder_name: string;
  folder_description: string;
  folder_icon: string;
  is_deleted: boolean;
  total_sub_folders: number;
  total_documents: number;
  sub_folders: DmsHierarchySubFolder[];
  children?: DmsHierarchySubFolder[];
  sub_sub_folders?: DmsHierarchySubFolder[];
  documents?: DmsHierarchyDocument[];
  root_documents?: DmsHierarchyDocument[];
  folder_documents?: DmsHierarchyDocument[];
};

export type DmsHierarchyResponse = {
  status: string;
  count: number;
  data: DmsHierarchyFolder[];
};

export interface MoveSubfolderPreviewData {
  sub_folder_id: number;
  sub_folder_name: string;
  source_folder_id: number;
  source_folder_name: string;
  destination_folder_id: number;
  destination_folder_name: string;
  affected_documents_count: number;
}

export interface MoveSubfolderPreviewResponse {
  status: string;
  data: MoveSubfolderPreviewData;
}

export interface MoveSubfolderResponse {
  status: string;
  message: string;
  data?: MoveSubfolderPreviewData | any;
}

// API response interfaces (extracted from useDmsWorkspace.ts)

export interface ApiFolder {
  folder_name: string;
  folder_description: string;
  folder_icon: string;
  folder_id: number;
  is_deleted: boolean;
  created_at: string;
  created_by: number;
  created_by_name: string;
  updated_at: string;
  updated_by: number | null;
  updated_by_name: string;
}

export interface ApiFolderResponse {
  status: string;
  count: number;
  total_count: number;
  page: number;
  limit: number;
  data: ApiFolder[];
}

export interface CreateFolderResponse {
  status: string;
  message: string;
  folder_id: number;
}

export interface UpdateFolderResponse {
  status: string;
  message: string;
}

export interface CreateSubFolderResponse {
  status: string;
  message: string;
  sub_folder_id: number;
}

export interface UpdateSubFolderResponse {
  status: string;
  message: string;
}

export interface CreateGroupResponse {
  status: string;
  message?: string;
  group_id: number;
}

export interface CreatePublisherResponse {
  status: string;
  message?: string;
  publisher_id: number;
}

export interface ApiSubFolder {
  sub_folder_id: number;
  folder_id: number;
  parent_sub_folder_id?: number | null;
  sub_folder_code: string;
  sub_folder_name: string;
  sub_folder_description: string;
  status: string;
  is_deleted: boolean;
  created_at: string;
  created_by: number;
  created_by_name: string;
  updated_at: string;
  updated_by: number | null;
  updated_by_name: string;
}

export interface ApiSubFolderResponse {
  status: string;
  count: number;
  total_count: number;
  page: number;
  limit: number;
  data: ApiSubFolder[];
}

export interface PublisherFolderItem {
  folder_id: number;
  folder_name: string;
}

export interface PublisherSubfolderItem {
  sub_folder_id: number;
  sub_folder_name: string;
  folder_id: number;
  folder_name: string;
}

export interface DmsPublisherApiItem {
  publisher_id: number;
  publisher_user_id: number;
  publisher_name: string;
  publisher_email: string;
  publisher_dept: string;
  publisher_station_location: string;
  publisher_station_id: number;
  status: string;
  assigned_folders: (string | number | PublisherFolderItem)[];
  assigned_subfolders: (string | number | PublisherSubfolderItem)[];
  is_deleted: boolean;
  created_at: string;
  created_by: number;
  created_by_name: string;
  updated_at: string | null;
  updated_by: number | null;
  updated_by_name: string;
}

export interface DmsPublisherGetAllResponse {
  status: string;
  count: number;
  total_count: number;
  page: number;
  limit: number;
  data: DmsPublisherApiItem[];
}

