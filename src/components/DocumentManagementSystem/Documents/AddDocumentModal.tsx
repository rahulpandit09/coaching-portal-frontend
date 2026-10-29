import React, { useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  FileCheck2,
  Lock,
  Plus,
  Search,
  ShieldAlert,
  Tag,
  UploadCloud,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { formatNow } from "../initial-data";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import { Modal } from "../Common/Modal";
import { SelectWithOther } from "../Common/SelectWithOther";
import FolderHierarchyPicker, {
  type DmsDestination,
} from "../Layout/FolderHierarchyPicker";
import type { DocumentRecord, FolderDefinition, Publisher, EngineerGroup, EngineerUser } from "../types";

const DOC_DEPT_OPTS = ["OP", "HR", "PR", "LE", "CS", "IT", "HSE", "PROJECTS", "FI"];
const DOC_LOC_OPTS = ["HO BLR", "MLR", "NER", "HSN", "DKN"];
const DOC_CAT_OPTS = [
  "Operational Records",
  "Corporate Records",
  "Pipeline / Land / Route Records",
  "Project Records",
  "Common / All Locations",
];
const DOC_TYPE_OPTS = ["Drawing", "Policy", "Procedure", "Register", "Plan", "Index"];
const DOC_CUST_OPTS: string[] = [];
const DOC_VOL_OPTS = ["Vol 01", "Vol 02", "Vol 03", "Vol 04", "Vol 05"];
const DOC_SEC_OPTS = [
  "Public",
  "Internal",
  "Restricted",
  "Confidential",
];
const DOC_RET_OPTS = [
  "Permanent",
  "10 Years",
  "7 Years",
  "5 Years",
  "3 Years",
  "Project Lifecycle",
];
const DOC_RACK_OPTS = ["Rack 01", "Rack 02", "Rack 03", "Rack 04", "Rack 05", "Rack 06"];
const DOC_SHELF_OPTS = ["Shelf A", "Shelf B", "Shelf C", "Shelf D", "Shelf E"];

type DmsAssignedSubFolder = {
  sub_folder_id: number;
  sub_folder_name: string;
  folder_id: number;
  parent_sub_folder_id?: number | null;
  parent_sub_folder_name?: string | null;
  children?: DmsAssignedSubFolder[];
  sub_sub_folders?: DmsAssignedSubFolder[];
};

type DmsAssignedFolder = {
  folder_id: number;
  folder_name: string;
  folder_icon?: string;
  subfolders?: DmsAssignedSubFolder[];
  sub_folders?: DmsAssignedSubFolder[];
};

type DmsPublisherResponse = {
  status: string;
  data: {
    publisher_id: number;
    assigned_folders: DmsAssignedFolder[];
    assigned_subfolders: {
      sub_folder_id: number;
      sub_folder_name: string;
      folder_id: number;
      folder_name: string;
      parent_sub_folder_id?: number | null;
      parent_sub_folder_name?: string | null;
    }[];
    assigned_hierarchy: DmsAssignedFolder[];
  };
};

const getDmsDestinations = (
  folders: DmsAssignedFolder[]
): DmsDestination[] => {
  const destinations: DmsDestination[] = [];

  const visitSubfolders = (
    nodes: DmsAssignedSubFolder[],
    folderId: number,
    parentPath: string
  ) => {
    nodes.forEach((node) => {
      const path = `${parentPath} / ${node.sub_folder_name}`;

      destinations.push({
        label: node.sub_folder_name,
        path,
        folderId,
        targetFolderId: node.sub_folder_id,
      });

      // Prefer children when populated because the API can return
      // the same hierarchy through both children and sub_sub_folders.
      const children =
        node.children?.length
          ? node.children
          : node.sub_sub_folders ?? [];

      visitSubfolders(children, folderId, path);
    });
  };

  folders.forEach((folder) => {
    destinations.push({
      label: folder.folder_name,
      path: folder.folder_name,
      folderId: folder.folder_id,
      targetFolderId: null,
    });

    const subfolders =
      folder.subfolders?.length
        ? folder.subfolders
        : folder.sub_folders ?? [];

    visitSubfolders(subfolders, folder.folder_id, folder.folder_name);
  });

  return destinations;
};

type DmsEngineer = {
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
};

type DmsEngineerResponse = {
  status: string;
  count: number;
  data: DmsEngineer[];
};

interface DmsUploadResponse {
  status: string;
  data: {
    file_name: string;
    file_path: string;
    file_size: string;
    file_type: string;
  };
}

const MAX_FILE_SIZE = 30 * 1024 * 1024;

const validateDocumentFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return "File size must not exceed 30 MB.";
  }

  const blockedExtensions = [".zip", ".rar", ".7z", ".tar", ".gz"];
  const fileName = file.name.toLowerCase();

  if (blockedExtensions.some((extension) => fileName.endsWith(extension))) {
    return "Archive and ZIP files are not allowed.";
  }

  if (file.type.startsWith("video/")) {
    return "Video files are not allowed.";
  }

  return null;
};

const uploadDocumentFile = async (file: File): Promise<DmsUploadResponse["data"]> => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("custom_file_name", file.name);

  const response = await axiosInstance.post<DmsUploadResponse>(
    "/dms-document/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (response.data?.status !== "success" || !response.data?.data) {
    throw new Error("Document upload failed.");
  }

  return response.data.data;
};

export function AddDocumentModal({
  onClose,
  onAdd,
  existingCount,
  folders = [],
  publishers,
  publisherId,
  publisherName = "A. Menon",
  engineerGroups = [],
  prefillDoc,
  defaultFolder,
  defaultSubfolder,
  defaultSubSubfolder,
}: {
  onClose: () => void;
  onAdd: (doc: DocumentRecord) => void;
  existingCount: number;
  folders?: FolderDefinition[] | undefined;
  publishers?: Publisher[] | undefined;
  publisherId?: string | number | undefined;
  publisherName?: string | undefined;
  engineerGroups?: EngineerGroup[] | undefined;
  prefillDoc?: DocumentRecord | null | undefined;
  defaultFolder?: string | undefined;
  defaultSubfolder?: string | undefined;
  defaultSubSubfolder?: string | undefined;
}) {
  const DEPT_OPTS = DOC_DEPT_OPTS;
  const LOC_OPTS = DOC_LOC_OPTS;
  const CAT_OPTS = DOC_CAT_OPTS;
  const TYPE_OPTS = DOC_TYPE_OPTS;
  const CUST_OPTS = DOC_CUST_OPTS;
  const VOL_OPTS = DOC_VOL_OPTS;
  const SEC_OPTS = DOC_SEC_OPTS;
  const RET_OPTS = DOC_RET_OPTS;
  const RACK_OPTS = DOC_RACK_OPTS;
  const SHELF_OPTS = DOC_SHELF_OPTS;

  const dynamicCustOpts = useMemo(() => {
    const list: string[] = [];

    if (publishers?.length) {
      publishers.forEach((publisher) => {
        if (publisher.name && !list.includes(publisher.name)) {
          list.push(publisher.name);
        }
      });
    }

    return list;
  }, [publishers]);

  const initialFolder = defaultFolder || prefillDoc?.folder || "";
  const initialFolderDef = initialFolder
    ? folders.find((f) => f.name === initialFolder) || null
    : null;
  const initialSubfolder = defaultSubfolder || prefillDoc?.subfolder || "";
  const initialSubSubfolder = defaultSubSubfolder || prefillDoc?.subSubfolder || "";

  const [title, setTitle] = useState(prefillDoc?.title || "");
  const [subject, setSubject] = useState(prefillDoc?.subject || prefillDoc?.title || "");
  const [folder, setFolder] = useState<string>(initialFolder);
  const [subfolder, setSubfolder] = useState<string>(initialSubfolder);
  const [subSubfolder, setSubSubfolder] = useState<string>(initialSubSubfolder);

  const [selectedDestination, setSelectedDestination] =
    useState<DmsDestination | null>(null);

  const [department, setDepartment] = useState(() => {
    if (!prefillDoc?.department) return "";
    return DEPT_OPTS.includes(prefillDoc.department) ? prefillDoc.department : "Other…";
  });
  const [customDepartment, setCustomDepartment] = useState(() => {
    if (!prefillDoc?.department) return "";
    return DEPT_OPTS.includes(prefillDoc.department) ? "" : prefillDoc.department;
  });

  const [location, setLocation] = useState(() => {
    if (!prefillDoc?.location) return "";
    const locNorm =
      prefillDoc.location === "HO"
        ? "HO BLR"
        : prefillDoc.location === "DCN"
          ? "DKN"
          : prefillDoc.location;
    return LOC_OPTS.includes(locNorm) ? locNorm : "Other…";
  });
  const [customLocation, setCustomLocation] = useState(() => {
    if (!prefillDoc?.location) return "";
    const locNorm =
      prefillDoc.location === "HO"
        ? "HO BLR"
        : prefillDoc.location === "DCN"
          ? "DKN"
          : prefillDoc.location;
    return LOC_OPTS.includes(locNorm) ? "" : prefillDoc.location;
  });

  const [category, setCategory] = useState(() => {
    if (!prefillDoc?.category) return "";
    return CAT_OPTS.includes(prefillDoc.category) ? prefillDoc.category : "Other…";
  });
  const [customCategory, setCustomCategory] = useState(() => {
    if (!prefillDoc?.category) return "";
    return CAT_OPTS.includes(prefillDoc.category) ? "" : prefillDoc.category;
  });

  const [docType, setDocType] = useState(() => {
    if (!prefillDoc?.type) return "";
    return TYPE_OPTS.includes(prefillDoc.type) ? prefillDoc.type : "Other…";
  });
  const [customDocType, setCustomDocType] = useState(() => {
    if (!prefillDoc?.type) return "";
    return TYPE_OPTS.includes(prefillDoc.type) ? "" : prefillDoc.type;
  });

  const rawCustodian = prefillDoc?.custodian || prefillDoc?.owner || "";
  const [custodian, setCustodian] = useState(() => {
    return dynamicCustOpts.includes(rawCustodian) ? rawCustodian : "";
  });
  const [customCustodian, setCustomCustodian] = useState("");

  const [openDate, setOpenDate] = useState(() => prefillDoc?.openDate || "");
  const [closeDate, setCloseDate] = useState(prefillDoc?.closeDate || "");

  const [volume, setVolume] = useState(() => {
    if (!prefillDoc?.volume) return "";
    return VOL_OPTS.includes(prefillDoc.volume) ? prefillDoc.volume : "Other…";
  });
  const [customVolume, setCustomVolume] = useState(() => {
    if (!prefillDoc?.volume) return "";
    return VOL_OPTS.includes(prefillDoc.volume) ? "" : prefillDoc.volume;
  });

  const [securityClassification, setSecurityClassification] = useState(() => {
    const classification = prefillDoc?.securityClassification;

    return DOC_SEC_OPTS.includes(classification || "")
      ? classification!
      : "Public";
  });

  const [customSecurity, setCustomSecurity] = useState("");

  const [retentionClass, setRetentionClass] = useState(() => {
    if (!prefillDoc?.retentionClass) return "";
    return RET_OPTS.includes(prefillDoc.retentionClass) ? prefillDoc.retentionClass : "Other…";
  });
  const [customRetention, setCustomRetention] = useState(() => {
    if (!prefillDoc?.retentionClass) return "";
    return RET_OPTS.includes(prefillDoc.retentionClass) ? "" : prefillDoc.retentionClass;
  });

  const [rack, setRack] = useState(() => {
    if (!prefillDoc?.rack) return "";
    return RACK_OPTS.includes(prefillDoc.rack) ? prefillDoc.rack : "Other…";
  });
  const [customRack, setCustomRack] = useState(() => {
    if (!prefillDoc?.rack) return "";
    return RACK_OPTS.includes(prefillDoc.rack) ? "" : prefillDoc.rack;
  });

  const [shelf, setShelf] = useState(() => {
    if (!prefillDoc?.shelf) return "";
    return SHELF_OPTS.includes(prefillDoc.shelf) ? prefillDoc.shelf : "Other…";
  });
  const [customShelf, setCustomShelf] = useState(() => {
    if (!prefillDoc?.shelf) return "";
    return SHELF_OPTS.includes(prefillDoc.shelf) ? "" : prefillDoc.shelf;
  });

  const [box, setBox] = useState(prefillDoc?.box || "");
  const [isConfidential, setIsConfidential] = useState(
    prefillDoc?.securityClassification?.toLowerCase() === "confidential" ||
    Boolean(prefillDoc?.isConfidential)
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    prefillDoc?.access && prefillDoc.access.length > 0 ? [...prefillDoc.access] : [],
  );
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userStationFilter, setUserStationFilter] = useState("All");
  const [apiEngineers, setApiEngineers] = useState<DmsEngineer[]>([]);
  const [isLoadingEngineers, setIsLoadingEngineers] = useState(false);

  const handleToggleGroup = (group: EngineerGroup) => {
    const allMembersIn =
      group.members.length > 0 && group.members.every((m) => selectedUsers.includes(m));
    if (allMembersIn) {
      setSelectedUsers((prev) => prev.filter((u) => !group.members.includes(u)));
    } else {
      setSelectedUsers((prev) => Array.from(new Set([...prev, ...group.members])));
    }
  };

  const handleGroupDropdownChange = (groupId: string) => {
    if (!groupId) return;
    const grp = engineerGroups.find((g) => g.id === groupId);
    if (grp) {
      setSelectedUsers((prev) => Array.from(new Set([...prev, ...grp.members])));
    }
  };

  const engineerStationOptions = useMemo(() => {
    return Array.from(
      new Set(
        apiEngineers
          .map((engineer) => engineer.station_name?.trim())
          .filter(Boolean),
      ),
    ).sort();
  }, [apiEngineers]);

  const filteredEngineersForModal = useMemo(() => {
    const query = userSearchQuery.trim().toLowerCase();

    // The user uploading the document should not be selectable as an individual engineer.
    let currentUserId: number | null = null;
    let currentUserNames: string[] = [publisherName.trim().toLowerCase()].filter(Boolean);

    try {
      const rawUserData = typeof window !== "undefined" ? localStorage.getItem("userData") : null;
      if (rawUserData) {
        const userData = JSON.parse(rawUserData);
        const id = userData?.user_id ?? userData?.userId ?? userData?.id;
        if (id !== undefined && id !== null && id !== "") currentUserId = Number(id);

        const storedNames = [
          userData?.user_name,
          userData?.username,
          userData?.name,
          userData?.full_name,
          [userData?.first_name, userData?.last_name].filter(Boolean).join(" "),
        ];
        currentUserNames = Array.from(new Set([
          ...currentUserNames,
          ...storedNames.map((name) => String(name ?? "").trim().toLowerCase()).filter(Boolean),
        ]));
      }
    } catch {
      // Continue filtering by the publisher name when userData is unavailable or invalid.
    }

    return apiEngineers.filter((eng) => {
      const engineerName = (eng.user_name || "").trim().toLowerCase();
      if (
        (currentUserId !== null && Number.isFinite(currentUserId) && eng.user_id === currentUserId) ||
        currentUserNames.includes(engineerName)
      ) {
        return false;
      }

      if (userStationFilter !== "All" && eng.station_name !== userStationFilter) {
        return false;
      }

      if (!query) return true;

      return [
        eng.user_name,
        eng.first_name,
        eng.last_name,
        eng.email,
        eng.employee_code,
        eng.designation,
        eng.role_name,
        eng.station_name,
      ].some((value) => value?.toLowerCase().includes(query));
    });
  }, [apiEngineers, userSearchQuery, userStationFilter, publisherName]);

  const [tagList, setTagList] = useState<string[]>(() => {
    if (prefillDoc?.tags && Array.isArray(prefillDoc.tags)) {
      return [...prefillDoc.tags];
    }
    return [];
  });
  const [currentTagInput, setCurrentTagInput] = useState("");
  const [fileName, setFileName] = useState(prefillDoc?.fileName || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [assignedHierarchy, setAssignedHierarchy] = useState<
    DmsAssignedFolder[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [apiError, setApiError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!toastMessage) return;

    const timeoutId = window.setTimeout(() => setToastMessage(""), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  useEffect(() => {
    if (!publisherId) {
      setAssignedHierarchy([]);
      return;
    }

    let cancelled = false;

    const loadPublisherAssignments = async () => {
      try {
        setIsLoadingFolders(true);
        setApiError("");

        const response = await axiosInstance.get<DmsPublisherResponse>(
          `/dms-publisher/get/${publisherId}`
        );

        if (cancelled) return;

        if (response.data?.status === "success") {
          const publisher = response.data.data;

          setAssignedHierarchy(
            publisher.assigned_hierarchy ??
            publisher.assigned_folders ??
            []
          );
        } else {
          setAssignedHierarchy([]);
          setApiError("Failed to load publisher folder assignments.");
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load publisher assignments:", error);
        setAssignedHierarchy([]);
        setApiError("Failed to load publisher folder assignments.");
      } finally {
        if (!cancelled) {
          setIsLoadingFolders(false);
        }
      }
    };

    void loadPublisherAssignments();

    return () => {
      cancelled = true;
    };
  }, [publisherId]);

  useEffect(() => {
    const loadEngineers = async () => {
      try {
        setIsLoadingEngineers(true);

        const response = await axiosInstance.get<DmsEngineerResponse>("/dms-group/dropdown");
        const engineers = response.data?.data ?? [];

        setApiEngineers(engineers);

        // If editing a prefilled document, map any numeric user IDs in prefillDoc.access to engineer user_names
        if (prefillDoc?.access && prefillDoc.access.length > 0 && engineers.length > 0) {
          setSelectedUsers((prev) => {
            const mapped = prev.map((entry) => {
              const numericId = Number(entry);
              if (!Number.isNaN(numericId) && String(numericId) === String(entry).trim()) {
                const found = engineers.find((e) => e.user_id === numericId);
                return found ? found.user_name : entry;
              }
              return entry;
            });
            return Array.from(new Set(mapped));
          });
        }
      } catch (error) {
        console.error("Failed to load engineer dropdown:", error);
        setApiError("Failed to load engineers. Please try again.");
      } finally {
        setIsLoadingEngineers(false);
      }
    };

    loadEngineers();
  }, [prefillDoc?.access]);

  const availableDestinations = useMemo(
    () => getDmsDestinations(assignedHierarchy),
    [assignedHierarchy]
  );

  // Reset selected destination when prefillDoc changes or switches between create and edit mode
  const lastPrefillDocIdRef = useRef<string | number | undefined>(prefillDoc?.id);
  useEffect(() => {
    const currentId = prefillDoc?.id;
    if (lastPrefillDocIdRef.current !== currentId) {
      lastPrefillDocIdRef.current = currentId;
      setSelectedDestination(null);
    }
  }, [prefillDoc?.id]);

  // Restore saved destination for edit-document or create flow
  useEffect(() => {
    if (!availableDestinations.length) return;
    if (selectedDestination) return;

    const docTargetFolderId =
      (prefillDoc as any)?.target_folder_id ??
      (prefillDoc as any)?.sub_folder_id ??
      (prefillDoc as any)?.targetFolderId;
    const docFolderId =
      (prefillDoc as any)?.folder_id ?? (prefillDoc as any)?.folderId;

    let matched: DmsDestination | undefined;

    if (docTargetFolderId) {
      matched = availableDestinations.find(
        (d) => d.targetFolderId === Number(docTargetFolderId)
      );
    }

    if (!matched && docFolderId) {
      matched = availableDestinations.find(
        (d) => d.folderId === Number(docFolderId) && d.targetFolderId === null
      );
    }

    if (!matched) {
      const parts = [initialFolder, initialSubfolder, initialSubSubfolder].filter(Boolean);
      if (parts.length > 0) {
        const expectedPath = parts.join(" / ").toLowerCase();
        matched = availableDestinations.find(
          (destination) => destination.path.toLowerCase() === expectedPath
        );
      }

      if (!matched && initialFolder && initialSubfolder && initialSubSubfolder) {
        matched = availableDestinations.find(
          (d) =>
            d.path.toLowerCase().includes(initialFolder.toLowerCase()) &&
            d.path.toLowerCase().includes(initialSubfolder.toLowerCase()) &&
            d.path.toLowerCase().includes(initialSubSubfolder.toLowerCase())
        );
      }
      if (!matched && initialFolder && initialSubfolder) {
        matched = availableDestinations.find(
          (d) =>
            d.path.toLowerCase().includes(initialFolder.toLowerCase()) &&
            d.path.toLowerCase().includes(initialSubfolder.toLowerCase())
        );
      } else if (!matched && initialFolder) {
        matched = availableDestinations.find(
          (d) =>
            d.path.toLowerCase() === initialFolder.toLowerCase() ||
            d.label.toLowerCase() === initialFolder.toLowerCase()
        );
      }
    }

    if (matched) {
      setSelectedDestination(matched);
      setFolder(matched.path);
    }
  }, [
    availableDestinations,
    selectedDestination,
    prefillDoc,
    initialFolder,
    initialSubfolder,
    initialSubSubfolder,
  ]);

  const handleResetToBlank = () => {
    setTitle("");
    setSubject("");
    setFolder(initialFolder);
    setSubfolder(initialSubfolder);
    setSubSubfolder(initialSubSubfolder);
    setSelectedDestination(null);
    setDepartment("");
    setCustomDepartment("");
    setLocation("");
    setCustomLocation("");
    setCategory("");
    setCustomCategory("");
    setDocType("");
    setCustomDocType("");
    setCustodian("");
    setCustomCustodian("");
    setOpenDate("");
    setCloseDate("");
    setVolume("");
    setCustomVolume("");
    setSecurityClassification("Public");
    setCustomSecurity("");
    setRetentionClass("");
    setCustomRetention("");
    setRack("");
    setCustomRack("");
    setShelf("");
    setCustomShelf("");
    setBox("");
    setIsConfidential(false);
    setSelectedUsers([]);
    setUserSearchQuery("");
    setUserStationFilter("All");
    setTagList([]);
    setCurrentTagInput("");
    setFileName("");
    setSelectedFile(null);
  };

  useEffect(() => {
    if (prefillDoc) return;

    setTitle("");
    setSubject("");
    setFolder(initialFolder);
    setSubfolder(initialSubfolder);
    setSubSubfolder(initialSubSubfolder);
    setSelectedDestination(null);

    setDepartment("");
    setCustomDepartment("");
    setLocation("");
    setCustomLocation("");
    setCategory("");
    setCustomCategory("");
    setDocType("");
    setCustomDocType("");
    setCustodian("");
    setCustomCustodian("");
    setOpenDate("");
    setCloseDate("");
    setVolume("");
    setCustomVolume("");
    setSecurityClassification("Public");
    setCustomSecurity("");
    setRetentionClass("");
    setCustomRetention("");
    setRack("");
    setCustomRack("");
    setShelf("");
    setCustomShelf("");
    setBox("");
    setIsConfidential(false);
    setSelectedUsers([]);
    setUserSearchQuery("");
    setUserStationFilter("All");
    setTagList([]);
    setCurrentTagInput("");
    setFileName("");
    setSelectedFile(null);
  }, [
    prefillDoc,
    initialFolder,
    initialSubfolder,
    initialSubSubfolder,
  ]);

  const handleDestinationChange = (destination: DmsDestination) => {
    setSelectedDestination(destination);
    setFolder(destination.path);
    setSubfolder("");
    setSubSubfolder("");
  };

  const toggleUser = (user: string) => {
    setSelectedUsers((prev) =>
      prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user],
    );
  };

  const handleAddTag = (rawTag?: string) => {
    const textToAdd = rawTag !== undefined ? rawTag : currentTagInput;
    const clean = textToAdd.trim().replace(/^#/, "");
    if (!clean) return;

    const parts = clean
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    setTagList((prev) => {
      const next = [...prev];
      for (const p of parts) {
        if (!next.includes(p)) {
          next.push(p);
        }
      }
      return next;
    });
    setCurrentTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagList((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      e.stopPropagation();
      handleAddTag();
    } else if (e.key === "Backspace" && currentTagInput === "" && tagList.length > 0) {
      e.preventDefault();
      setTagList((prev) => prev.slice(0, -1));
    }
  };

  const finalDept =
    department === "Other…" || department === "Other" ? customDepartment.trim() : department;
  const finalLoc = location === "Other…" || location === "Other" ? customLocation.trim() : location;
  const finalCategory =
    category === "Other…" || category === "Other" ? customCategory.trim() : category;
  const finalDocType = docType === "Other…" || docType === "Other" ? customDocType.trim() : docType;
  const finalCustodian =
    custodian === "Other…" || custodian === "Other" ? customCustodian.trim() : custodian;
  const finalVolume = volume === "Other…" || volume === "Other" ? customVolume.trim() : volume;
  const finalSecurity =
    securityClassification === "Other…" || securityClassification === "Other"
      ? customSecurity.trim()
      : securityClassification;
  const finalRetention =
    retentionClass === "Other…" || retentionClass === "Other"
      ? customRetention.trim()
      : retentionClass;
  const finalRack = rack === "Other…" || rack === "Other" ? customRack.trim() : rack;
  const finalShelf = shelf === "Other…" || shelf === "Other" ? customShelf.trim() : shelf;

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const monthYear = `${month}/${year}`;
  const seq = String(existingCount + 1).padStart(3, "0");
  const displayDept = (finalDept || "DEPT").toUpperCase();
  const displayLoc = (finalLoc || "LOC").toUpperCase();
  const previewDocNumber = `PMHBL - ${displayDept} - ${displayLoc} - ${monthYear} - ${seq}`;



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (isSubmitting) return;

    if (!title.trim()) {
      setApiError("Document Title is required.");
      return;
    }

    if (!selectedDestination) {
      setApiError("Please select a valid Target Folder.");
      return;
    }

    if (!selectedFile && !prefillDoc?.fileName && !fileName) {
      setToastMessage("Please upload a document before submitting.");
      return;
    }

    if (selectedFile) {
      const validationError = validateDocumentFile(selectedFile);
      if (validationError) {
        setApiError(validationError);
        return;
      }
    }

    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!title.trim() || !selectedDestination || isSubmitting) return;

    setShowConfirmation(false);

    const finalTags = [...tagList];
    const pendingTag = currentTagInput.trim().replace(/^#/, "").toLowerCase();
    if (pendingTag && !finalTags.includes(pendingTag)) {
      finalTags.push(pendingTag);
    }

    const assignedDept = (finalDept || "OP").toUpperCase();
    const assignedLoc = (finalLoc || "MLR").toUpperCase();

    let loggedInUserId: number | null = null;

    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("userData")
          : null;

      if (raw) {
        const parsed = JSON.parse(raw);
        const userId =
          parsed?.user_id ?? parsed?.userId ?? parsed?.id;

        if (
          userId !== undefined &&
          userId !== null &&
          userId !== "" &&
          Number.isFinite(Number(userId))
        ) {
          loggedInUserId = Number(userId);
        }
      }
    } catch {
      loggedInUserId = null;
    }

    if (loggedInUserId === null) {
      setApiError("Unable to identify the logged-in user. Please sign in again.");
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError("");

      let uploadedFileData = {
        file_name: prefillDoc?.fileName || fileName || "",
        file_path: (prefillDoc as any)?.filePath || "",
        file_size: prefillDoc?.size || "",
        file_type: prefillDoc?.fileType || "",
      };

      if (selectedFile) {
        uploadedFileData = await uploadDocumentFile(selectedFile);
      }

      const selectedEngineerIds = Array.from(
        new Set(
          selectedUsers
            .map((userName) => {
              const engineer = apiEngineers.find(
                (eng) => eng.user_name === userName
              );

              return engineer?.user_id;
            })
            .filter(
              (userId): userId is number =>
                typeof userId === "number" && Number.isFinite(userId)
            )
        )
      );

      const payload: Record<string, any> = {
        document_title: title.trim(),
        document_subject: subject.trim() || title.trim(),
        target_folder: selectedDestination.path,
        folder_id: selectedDestination.folderId,
        target_folder_id: selectedDestination.targetFolderId,
        department: assignedDept,
        location: assignedLoc,
        station_id: null,
        category: finalCategory || "Operational Records",
        document_type: finalDocType || "Drawing",
        custodian_id: null,
        custodian_name: finalCustodian || null,
        open_date: openDate || new Date().toISOString().split("T")[0],
        close_date: closeDate || null,
        volume: finalVolume || "Vol 01",
        security_classification: finalSecurity || "Internal",
        retention_class: finalRetention || "10 Years",
        confidential_document: isConfidential,
        status: "ACTIVE",
        physical_rack: finalRack || "Rack 01",
        physical_shelf: finalShelf || "Shelf A",
        physical_box: box.trim() || "BX-001",
        custody_list: selectedEngineerIds,
        individual_engineer: selectedEngineerIds,
        file_path: uploadedFileData.file_path,
        file_name: uploadedFileData.file_name,
        file_size: uploadedFileData.file_size,
        file_type: uploadedFileData.file_type,
        description: subject.trim() || `Controlled record for ${assignedDept} at ${assignedLoc}.`,
        tags: finalTags,
        ...(prefillDoc ? { updated_by: loggedInUserId } : { created_by: loggedInUserId }),
      };

      let response;
      if (prefillDoc) {
        response = await axiosInstance.put(`/dms-document/update/${prefillDoc.id}`, payload);
      } else {
        response = await axiosInstance.post("/dms-document/create", payload);
      }

      console.log(prefillDoc ? "Document updated successfully:" : "Document created successfully:", response.data);

      const pathSegments = selectedDestination
        ? selectedDestination.path.split(" / ").map((s) => s.trim()).filter(Boolean)
        : [];
      const resolvedFolder = pathSegments[0] || folder || selectedDestination?.path || "";
      const resolvedSubfolder =
        pathSegments[1] ||
        (selectedDestination?.targetFolderId !== null ? selectedDestination?.label : "") ||
        subfolder ||
        "";
      const resolvedSubSubfolder = pathSegments[2] || subSubfolder || undefined;

      onAdd({
        ...prefillDoc,
        id: String(response.data?.document_id ?? response.data?.id ?? prefillDoc?.id ?? ""),
        number: prefillDoc?.number ?? `PMHBL - ${assignedDept} - ${assignedLoc} - ${monthYear} - ${seq}`,
        title: title.trim(),
        subject: subject.trim() || title.trim(),
        department: assignedDept,
        location: assignedLoc,
        category: finalCategory || "Operational Records",
        folder: resolvedFolder,
        subfolder: resolvedSubfolder,
        subSubfolder: resolvedSubSubfolder,
        type: finalDocType || "Drawing",
        owner: finalCustodian || "",
        custodian: finalCustodian || "",
        openDate: openDate || new Date().toISOString().split("T")[0],
        closeDate: closeDate || undefined,
        volume: finalVolume || "Vol 01",
        securityClassification: finalSecurity || "Internal",
        retentionClass: finalRetention || "10 Years",
        rack: finalRack || "Rack 01",
        shelf: finalShelf || "Shelf A",
        box: box.trim() || "BX-001",
        isConfidential,
        updated: formatNow(),
        created: prefillDoc?.created || formatNow(),
        access: selectedUsers.length > 0 ? selectedUsers : [finalCustodian || "Doc Controller (MLR)"],
        tags: finalTags,
        size: fileName ? "3.6 MB" : "1.8 MB",
        description: subject.trim() || `Controlled record for ${assignedDept} at ${assignedLoc}.`,
        preview: false,
      } as DocumentRecord);

      onClose();
    } catch (error: any) {
      console.error(prefillDoc ? "Failed to update document:" : "Failed to create document:", error);
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        setApiError(detail.map((item: any) => item.msg).filter(Boolean).join(", "));
      } else {
        setApiError(detail || error?.response?.data?.message || "Failed to save document. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal title="Add Controlled Document" onClose={onClose} maxWidth="max-w-2xl">
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
              const inputType = (e.target as HTMLInputElement).type;
              if (inputType !== "submit") {
                e.preventDefault();
              }
            }
          }}
          className="space-y-4 pb-2 text-xs"
        >
          {apiError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}
          {prefillDoc && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <Copy className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-primary">
                    Prefilled for {subfolder || defaultSubfolder || "sub-folder"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Reference:{" "}
                    <span className="font-mono font-medium text-foreground">{prefillDoc.number}</span>{" "}
                    · All fields are editable
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetToBlank}
                className="h-7 text-[11px] cursor-pointer self-start sm:self-auto text-muted-foreground hover:text-foreground"
              >
                Reset to blank
              </Button>
            </div>
          )}
          {/* Numbering Preview Callout */}
          <div className="flex items-center justify-between rounded-lg border border-primary/25 bg-primary/5 px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-muted-foreground">Standard Document No:</span>
              <span className="font-mono text-xs font-bold text-primary">{previewDocNumber}</span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Rule PMHBL-02
            </span>
          </div>

          {/* Section 1: Core Identification & Subject */}
          <div className="space-y-3 rounded-lg border border-border bg-card/60 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
              1. Document Identification & Subject
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-foreground">
                  Document Title <span className="text-destructive">*</span>
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pipeline Alignment & Route Drawings"
                  className="dms-input mt-1 h-8.5 w-full !px-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground">
                  Subject
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mainline Route Alignment, Crossings & Chainage"
                  className="dms-input mt-1 h-8.5 w-full !px-2.5 text-xs"
                />
              </div>
            </div>

            <div className="border-t border-border/60 pt-3">
              <label className="mb-1.5 block text-[11px] font-medium text-foreground">
                Target Folder / Subfolder{" "}
                <span className="text-destructive">*</span>
              </label>

              <FolderHierarchyPicker
                folders={assignedHierarchy}
                value={
                  selectedDestination
                    ? selectedDestination.targetFolderId === null
                      ? `folder:${selectedDestination.folderId}`
                      : `subfolder:${selectedDestination.folderId}:${selectedDestination.targetFolderId}`
                    : ""
                }
                onChange={handleDestinationChange}
                disabled={isLoadingFolders}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <SelectWithOther
                label="Department"
                value={department}
                placeholderOption="Select Department…"
                options={["OP", "HR", "PR", "LE", "CS", "IT", "HSE", "PROJECTS", "FI", "Other…"]}
                customValue={customDepartment}
                onChange={setDepartment}
                onCustomChange={setCustomDepartment}
                placeholder="e.g. ENG"
              />
              <SelectWithOther
                label="Location"
                value={location}
                placeholderOption="Select Location…"
                options={["HO BLR", "MLR", "NER", "HSN", "DKN", "Other…"]}
                customValue={customLocation}
                onChange={setLocation}
                onCustomChange={setCustomLocation}
                placeholder="e.g. BLR"
              />
              <SelectWithOther
                label="Category"
                value={category}
                placeholderOption="Select Category…"
                options={[
                  "Operational Records",
                  "Corporate Records",
                  "Pipeline / Land / Route Records",
                  "Project Records",
                  "Common / All Locations",
                  "Other…",
                ]}
                customValue={customCategory}
                onChange={setCategory}
                onCustomChange={setCustomCategory}
                placeholder="e.g. Quality Records"
              />
              <SelectWithOther
                label="Document Type"
                value={docType}
                placeholderOption="Select Document Type…"
                options={["Drawing", "Policy", "Procedure", "Register", "Plan", "Index", "Other…"]}
                customValue={customDocType}
                onChange={setDocType}
                onCustomChange={setCustomDocType}
                placeholder="e.g. Report"
              />
            </div>
          </div>

          {/* Section 2: Lifecycle, Dates & Volume */}
          <div className="space-y-3 rounded-lg border border-border bg-card/60 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
              2. Lifecycle, Dates & Volume
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SelectWithOther
                label="Custodian"
                value={custodian}
                placeholderOption="Select Custodian…"
                options={dynamicCustOpts}
                customValue={customCustodian}
                onChange={setCustodian}
                onCustomChange={setCustomCustodian}
              />
              <div>
                <label className="block text-[11px] font-medium text-foreground">Open Date</label>
                <div className="relative mt-1">
                  <input
                    type="date"
                    value={openDate}
                    onChange={(e) => setOpenDate(e.target.value)}
                    className="dms-input h-8.5 w-full !px-2 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground">Close Date</label>
                <div className="relative mt-1">
                  <input
                    type="date"
                    value={closeDate}
                    onChange={(e) => setCloseDate(e.target.value)}
                    className="dms-input h-8.5 w-full !px-2 text-xs"
                  />
                </div>
              </div>
              <SelectWithOther
                label="Volume"
                value={volume}
                placeholderOption="Select Volume…"
                options={["Vol 01", "Vol 02", "Vol 03", "Vol 04", "Vol 05", "Other…"]}
                customValue={customVolume}
                onChange={setVolume}
                onCustomChange={setCustomVolume}
                placeholder="e.g. Vol 06"
              />
            </div>
          </div>

          {/* Section 3: Security & Retention Classification */}
          <div className="space-y-3 rounded-lg border border-border bg-card/60 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
              3. Security & Retention Classification
            </p>

            {/* Confidentiality Toggle - Moved Above Dropdowns */}
            <div
              className={`flex min-h-[68px] items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition-all ${isConfidential
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-border bg-background"
                }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg ${isConfidential
                    ? "bg-amber-500 text-white"
                    : "bg-slate-100 text-slate-600"
                    }`}
                >
                  <Lock className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-[16px] text-foreground">
                    Confidential Document Toggle
                  </p>

                  <p className="mt-0.5 text-[12px] leading-[15px] text-muted-foreground">
                    {isConfidential
                      ? "Active: This file is confidential and will NOT be visible in search results or document listings for unauthorized users."
                      : "Standard document: Visible to team members with general search access."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isConfidential}
                aria-label="Confidential Document Toggle"
                onClick={() => {
                  setIsConfidential((prev) => {
                    const next = !prev;
                    setSecurityClassification(next ? "Confidential" : "Public");
                    return next;
                  });
                }}
                className={`relative inline-flex h-[30px] w-[55px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isConfidential ? "bg-amber-500" : "bg-slate-300"
                  }`}
              >
                <span
                  className={`pointer-events-none absolute left-[2px] h-[26px] w-[26px] rounded-full bg-white shadow-sm transition-transform duration-200 ${isConfidential ? "translate-x-[25px]" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            {/* Security Classification & Retention Class */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SelectWithOther
                label="Security Classification"
                value={securityClassification}
                placeholderOption="Select Classification…"
                options={DOC_SEC_OPTS}
                customValue={customSecurity}
                onChange={(value) => {
                  setSecurityClassification(value);
                  setIsConfidential(value === "Confidential");
                }}
                onCustomChange={setCustomSecurity}
              />

              <SelectWithOther
                label="Retention Class"
                value={retentionClass}
                placeholderOption="Select Retention Class…"
                options={[
                  "Permanent",
                  "10 Years",
                  "7 Years",
                  "5 Years",
                  "3 Years",
                  "Project Lifecycle",
                  "Other…",
                ]}
                customValue={customRetention}
                onChange={setRetentionClass}
                onCustomChange={setCustomRetention}
                placeholder="e.g. 15 Years"
              />
            </div>
          </div>

          {/* Section 4: Physical Archival Location */}
          <div className="space-y-3 rounded-lg border border-border bg-card/60 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
              4. Physical Archival Storage Location
            </p>
            <div className="grid grid-cols-3 gap-3">
              <SelectWithOther
                label="Rack"
                value={rack}
                placeholderOption="Select Rack…"
                options={["Rack 01", "Rack 02", "Rack 03", "Rack 04", "Rack 05", "Rack 06", "Other…"]}
                customValue={customRack}
                onChange={setRack}
                onCustomChange={setCustomRack}
                placeholder="e.g. Rack 07"
              />
              <SelectWithOther
                label="Shelf"
                value={shelf}
                placeholderOption="Select Shelf…"
                options={["Shelf A", "Shelf B", "Shelf C", "Shelf D", "Shelf E", "Other…"]}
                customValue={customShelf}
                onChange={setShelf}
                onCustomChange={setCustomShelf}
                placeholder="e.g. Shelf F"
              />
              <div>
                <label className="block text-[11px] font-medium text-foreground">
                  Container / Box
                </label>
                <input
                  value={box}
                  onChange={(e) => setBox(e.target.value)}
                  placeholder="e.g. BX-102"
                  className="dms-input mt-1 h-8.5 w-full !px-2.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Custody & Access Permissions */}
          <div className="space-y-4 rounded-lg border border-border bg-card/60 p-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  5. Custody & Access Permissions
                </p>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded-full font-bold bg-primary/15 text-primary">
                  Groups & User Search
                </span>
              </div>
              <span className="text-[11px] font-medium text-foreground">
                <span className="font-bold text-primary">{selectedUsers.length}</span> user
                {selectedUsers.length !== 1 ? "s" : ""} granted custody
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Grant document access using either pre-configured Engineer Groups, direct user search,
              or both:
            </p>

            {/* Option 1: Choose by Engineer Group */}
            <div className="space-y-2.5 rounded-lg border border-primary/25 bg-primary/5 p-3">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold text-primary">
                    Option 1: Quick Grant by Engineer Group
                  </span>
                </div>
                <span className="text-[10.5px] text-muted-foreground">
                  Click a group to grant access to all its engineers with 1-click
                </span>
              </div>

              {/* Quick dropdown for choosing a group */}
              <div className="relative">
                <select
                  onChange={(e) => {
                    handleGroupDropdownChange(e.target.value);
                    e.target.value = "";
                  }}
                  defaultValue=""
                  className="dms-input h-8 w-full appearance-none !pr-8 !pl-2.5 text-xs font-medium bg-card"
                >
                  <option value="" disabled>
                    Select an Engineer Group to add all members at once…
                  </option>
                  {engineerGroups.map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      {grp.name} ({grp.members.length} engineers · {grp.department || "OP"})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>

              {/* Clickable group pills/cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                {engineerGroups.map((grp) => {
                  const allMembersIn =
                    grp.members.length > 0 && grp.members.every((m) => selectedUsers.includes(m));
                  const someMembersIn = grp.members.some((m) => selectedUsers.includes(m));

                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => handleToggleGroup(grp)}
                      className={`flex flex-col items-start p-2 rounded-lg border text-left transition-all cursor-pointer ${allMembersIn
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : someMembersIn
                          ? "border-primary/50 bg-primary/10 text-foreground"
                          : "border-border/80 bg-card hover:bg-muted/50 text-foreground"
                        }`}
                    >
                      <div className="flex items-center justify-between w-full gap-1">
                        <span className="text-xs font-bold truncate">{grp.name}</span>
                        <span
                          className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${allMembersIn
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                            }`}
                        >
                          {grp.members.length} eng
                        </span>
                      </div>
                      <span
                        className={`text-[10px] truncate max-w-full mt-0.5 ${allMembersIn ? "text-primary-foreground/80" : "text-muted-foreground"
                          }`}
                      >
                        {grp.members.slice(0, 2).join(", ")}
                        {grp.members.length > 2 ? ` +${grp.members.length - 2}` : ""}
                      </span>
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold">
                        {allMembersIn ? (
                          <>
                            <Check className="h-5 w-5" />
                            <span>Group Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-5 w-5" />
                            <span>{someMembersIn ? "Add Remaining" : "Add All Engineers"}</span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Option 2: Search & Select Individual Engineers */}
            <div className="space-y-2.5 rounded-lg border border-border bg-card/40 p-3">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    Option 2: Search & Select Individual Engineers
                  </span>
                </div>
                <span className="text-[10.5px] text-muted-foreground">
                  Search by name, role, employee code, email, or station
                </span>
              </div>

              {/* Live Search Input & Department Pills */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search engineers (e.g. A. Rao, Mechanical, HSE, MLR)..."
                    className="dms-input h-8 w-full !pl-8 !pr-7 text-xs bg-card"
                  />
                  {userSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setUserSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  {["All", ...engineerStationOptions].map((station) => (
                    <button
                      key={station}
                      type="button"
                      onClick={() => setUserStationFilter(station)}
                      className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-colors cursor-pointer shrink-0 ${userStationFilter === station
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                      {station}
                    </button>
                  ))}
                </div>
              </div>

              {/* Engineer Selection Pills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {isLoadingEngineers ? (
                  <div className="col-span-full text-center py-4 text-xs text-muted-foreground">
                    Loading engineers...
                  </div>
                ) : (
                  filteredEngineersForModal.map((eng) => {
                    const engineerName = eng.user_name;
                    const active = selectedUsers.includes(engineerName);

                    return (
                      <button
                        key={eng.user_id}
                        type="button"
                        onClick={() => toggleUser(engineerName)}
                        className={`flex items-center justify-between gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer border ${active
                          ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                          : "bg-card border-border/80 hover:bg-muted text-foreground"
                          }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[11px] leading-tight font-medium">{eng.user_name}</p>
                          <p
                            className={`text-[9.5px] truncate mt-0.5 ${active ? "text-primary-foreground/80" : "text-muted-foreground"
                              }`}
                          >
                            {eng.role_name}
                            {eng.designation ? ` · ${eng.designation}` : ""}
                            {eng.station_name ? ` · ${eng.station_name}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0">
                          {active ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Plus className="h-5 w-5 opacity-60" />
                          )}
                        </span>
                      </button>
                    );
                  })
                )}
                {!isLoadingEngineers && filteredEngineersForModal.length === 0 && (
                  <div className="col-span-full text-center py-4 text-xs text-muted-foreground">
                    No engineers found matching "{userSearchQuery}".
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: File & Search Tags */}
          <div className="space-y-3 rounded-lg border border-border bg-card/60 p-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-medium text-foreground">
                  Search Meta Tags{" "}
                  {tagList.length > 0 && (
                    <span className="text-primary font-semibold">
                      ({tagList.length} tag{tagList.length !== 1 ? "s" : ""} added)
                    </span>
                  )}
                </label>
                <span className="text-[10.5px] text-muted-foreground flex items-center gap-1">
                  <span>Write tag & press</span>
                  <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/70 font-mono text-[9px] font-semibold text-foreground">
                    Enter ↵
                  </kbd>
                </span>
              </div>

              {/* Interactive Tags Box */}
              <div className="min-h-[44px] w-full rounded-md border border-input bg-background p-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all">
                <div className="flex flex-wrap items-center gap-1.5">
                  {tagList.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/25 px-2 py-0.5 text-xs font-medium text-primary animate-in fade-in zoom-in-95 duration-100"
                    >
                      <Tag className="h-5 w-5 text-primary/70" />
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="ml-0.5 rounded p-0.5 text-primary/60 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title={`Remove tag "${t}"`}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </span>
                  ))}
                  <div className="flex flex-1 items-center gap-1 min-w-[170px]">
                    <input
                      value={currentTagInput}
                      onChange={(e) => setCurrentTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder={
                        tagList.length === 0
                          ? "Type tag & press Enter (e.g. pipeline, survey, permit)…"
                          : "Type another tag + Enter…"
                      }
                      className="flex-1 border-none bg-transparent px-1.5 py-0.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    {currentTagInput.trim() && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddTag()}
                        className="h-6 px-2 text-[10px] gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="h-5 w-5" /> Add
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-1.5 text-[10.5px] text-muted-foreground">
                Add tags one at a time by pressing <strong>Enter</strong> or comma. Form will only
                submit when you click <em>Create Controlled Document</em> below.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-foreground">
                Document Upload <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2 rounded border border-dashed border-border bg-muted/25 p-3 text-xs text-muted-foreground">
                <UploadCloud className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1 truncate">
                  {fileName ? (
                    <span className="font-medium text-foreground">{fileName}</span>
                  ) : (
                    <span>Drop controlled document here or browse (.pdf, .dwg, .docx) · max 25 MB</span>
                  )}
                </div>
                <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input bg-background shadow-xs hover:bg-accent px-2.5 py-1 text-xs font-medium">
                  Browse
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setFileName(f.name);
                        setSelectedFile(f);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 z-20 flex items-center justify-end gap-2 border-t border-border bg-card/95 py-3 pt-3 backdrop-blur">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !folder || isSubmitting}
              className="gap-1.5 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {prefillDoc ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  {prefillDoc ? "Update Document" : "Create Controlled Document"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {toastMessage && (
        <div
          role="alert"
          className="fixed right-4 top-4 z-[10000] flex max-w-sm items-start gap-2 rounded-lg border border-amber-500/40 bg-background px-4 py-3 text-sm text-foreground shadow-xl"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span>{toastMessage}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToastMessage("")}
            className="ml-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-document-title"
            className="w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-xl"
          >
            <h2 id="confirm-document-title" className="text-sm font-semibold text-foreground">
              Confirm Document {prefillDoc ? "Update" : "Creation"}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Are you sure you want to {prefillDoc ? "update" : "create"} this controlled document?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                <Check className="h-4 w-4" />
                {prefillDoc ? "Confirm Update" : "Confirm Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

