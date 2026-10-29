import React, { useState, useMemo, useEffect, useCallback } from "react";
import api from "@/api/axiosInstance";
import { Check, ChevronDown, Folder, FolderOpen, Plus, UsersRound, X, Search } from "lucide-react";
import { formatNow } from "../initial-data";
import { Button } from "@/components/DocumentManagementSystem/ui/button";
import { Modal } from "../Common/Modal";
import type { FolderDefinition, Publisher, DmsGroupDropdownItem, SubfolderInfo } from "../types";
import { PublisherFolderTreeItem } from "./PublisherFolderTreeItem";

// Helper to get numeric ID for a primary folder
const getFolderNumericId = (folder: FolderDefinition): number | null => {
  if (typeof folder.folder_id === "number") return folder.folder_id;
  const parsed = Number(folder.id);
  return !isNaN(parsed) && parsed > 0 ? parsed : null;
};

// Helper to get numeric ID for a subfolder
const getSubfolderNumericId = (sf: SubfolderInfo): number | null => {
  if (typeof sf.sub_folder_id === "number") return sf.sub_folder_id;
  const parsed = Number(sf.id);
  return !isNaN(parsed) && parsed > 0 ? parsed : null;
};

// Recursive helper to count total subfolders across all nested levels
const countAllSubfolders = (subfolders: SubfolderInfo[] = []): number => {
  let count = 0;
  for (const sf of subfolders) {
    count += 1;
    if (sf.subfolders && sf.subfolders.length > 0) {
      count += countAllSubfolders(sf.subfolders);
    }
  }
  return count;
};

// Recursive helper to collect all descendant subfolder numeric IDs
const collectDescendantSubfolderIds = (
  subfolders: SubfolderInfo[] = []
): number[] => {
  const result: number[] = [];
  for (const sf of subfolders) {
    const id = getSubfolderNumericId(sf);
    if (id !== null) {
      result.push(id);
    }
    if (sf.subfolders && sf.subfolders.length > 0) {
      result.push(...collectDescendantSubfolderIds(sf.subfolders));
    }
  }
  return result;
};

interface UnallottedEngineer {
  user_id: number;
  user_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  employee_code?: string;
  designation?: string;
  station_name?: string;
  station_id?: number;
  role_id?: number;
  role_name?: string;
}

export function CreatePublisherModal({
  publisher,
  folders = [],
  publisherDropdown = [],
  onClose,
  onSave,
}: {
  publisher: Publisher | null;
  folders?: FolderDefinition[];
  publisherDropdown?: DmsGroupDropdownItem[];
  onClose: () => void;
  onSave: (pub: Publisher) => void;
}) {
  const [selectedPublisherUserId, setSelectedPublisherUserId] = useState<number | null>(
    publisher?.publisherUserId ?? null,
  );
  const [selectedPublisherStationId, setSelectedPublisherStationId] = useState<number | null>(
    publisher?.publisherStationId ?? null,
  );
  const [publisherSearch, setPublisherSearch] = useState("");
  const [isPublisherDropdownOpen, setIsPublisherDropdownOpen] = useState(false);
  const [name, setName] = useState(publisher?.name || "");
  const [email, setEmail] = useState(publisher?.email || "");
  const [availableEngineers, setAvailableEngineers] = useState<
    UnallottedEngineer[]
  >([]);
  const [isLoadingEngineers, setIsLoadingEngineers] = useState(false);
  const [engineerFetchError, setEngineerFetchError] = useState("");
  const [department, setDepartment] = useState(publisher?.department || "Operations");
  const [location, setLocation] = useState(() => {
    const rawLoc = publisher?.location || "ALL";
    return rawLoc === "HO" ? "HO BLR" : rawLoc === "DCN" ? "DKN" : rawLoc;
  });
  const [assignedFolders, setAssignedFolders] = useState<number[]>(() => {
    if (!publisher) return [];
    if (publisher.assignedFolderIds && publisher.assignedFolderIds.length > 0) {
      return Array.from(new Set(publisher.assignedFolderIds));
    }
    const initial: number[] = [];
    for (const item of publisher.assignedFolders ?? []) {
      if (typeof item === "number" && !isNaN(item)) {
        initial.push(item);
      } else if (typeof item === "string") {
        const parsed = Number(item);
        if (!isNaN(parsed) && parsed > 0) {
          initial.push(parsed);
        } else {
          const matched = folders.find(
            (f) => f.name.toLowerCase() === item.toLowerCase()
          );
          const fId = matched ? getFolderNumericId(matched) : null;
          if (fId !== null) initial.push(fId);
        }
      }
    }
    return Array.from(new Set(initial));
  });

  const [assignedSubfolders, setAssignedSubfolders] = useState<number[]>(() => {
    if (!publisher) return [];
    if (publisher.assignedSubfolderIds && publisher.assignedSubfolderIds.length > 0) {
      return Array.from(new Set(publisher.assignedSubfolderIds));
    }

    const subfolderNameToIdMap = new Map<string, number>();
    const registerSubfolders = (
      sfs: SubfolderInfo[] = [],
      folderName: string,
      parentPath: string[] = []
    ) => {
      for (const sf of sfs) {
        const id = getSubfolderNumericId(sf);
        if (id !== null) {
          const currentPath = [...parentPath, sf.name];
          const pathKey = `${folderName}:::${currentPath.join(":::")}`.toLowerCase();
          // Store the complete path to avoid matching a subfolder
          // with the same name under a different parent.
          subfolderNameToIdMap.set(pathKey, id);
        }
        if (sf.subfolders && sf.subfolders.length > 0) {
          registerSubfolders(sf.subfolders, folderName, [...parentPath, sf.name]);
        }
      }
    };
    for (const folder of folders) {
      registerSubfolders(folder.subfolders ?? [], folder.name);
    }

    const initial: number[] = [];
    for (const item of publisher.assignedSubfolders ?? []) {
      if (typeof item === "number" && !isNaN(item)) {
        initial.push(item);
      } else if (typeof item === "string") {
        const parsed = Number(item);
        if (!isNaN(parsed) && parsed > 0) {
          initial.push(parsed);
        } else {
          const lower = item.toLowerCase();
          const matchedId = subfolderNameToIdMap.get(lower);
          if (matchedId) {
            initial.push(matchedId);
          }
        }
      }
    }
    return Array.from(new Set(initial));
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [folderSearch, setFolderSearch] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const fetchUnallottedEngineers = useCallback(async () => {
    setIsLoadingEngineers(true);
    setEngineerFetchError("");

    try {
      const response = await api.get("/dms-publisher/unallotted-engineers");
      const engineers: UnallottedEngineer[] = Array.isArray(response.data?.data)
        ? response.data.data
        : [];
      setAvailableEngineers(engineers);
    } catch (error) {
      console.error("Failed to fetch unallotted engineers:", error);
      setAvailableEngineers([]);
      setEngineerFetchError(
        "Failed to load available engineers. Please try again."
      );
    } finally {
      setIsLoadingEngineers(false);
    }
  }, []);

  useEffect(() => {
    // Fetch available engineers only when creating a new publisher.
    if (publisher) return;

    fetchUnallottedEngineers();
  }, [publisher, fetchUnallottedEngineers]);

  const publisherOptions = publisher
    ? publisherDropdown
    : availableEngineers;

  // Extract unique stations dynamically from the API dropdown items
  const stationOptions = useMemo(() => {
    const stationMap = new Map<
      string,
      { station_id?: number; station_name: string }
    >();

    publisherOptions.forEach((item) => {
      if (item.station_name && item.station_name.trim()) {
        const stationName = item.station_name.trim();
        const key = stationName.toLowerCase();

        if (!stationMap.has(key)) {
          stationMap.set(key, {
            station_id: item.station_id,
            station_name: stationName,
          });
        }
      }
    });

    return Array.from(stationMap.values());
  }, [publisherOptions]);

  // Filter publishers based on selected station location
  const filteredPublishers = useMemo(() => {
    if (!location || location === "ALL" || location === "All Stations") {
      return publisherOptions;
    }

    const locLower = location.toLowerCase();

    return publisherOptions.filter((item) => {
      const pubStation = item.station_name?.toLowerCase() || "";

      return (
        pubStation === locLower ||
        (locLower === "mlr" && pubStation.includes("mangalore")) ||
        (locLower === "hsn" && pubStation.includes("hassan")) ||
        (locLower === "dkn" && pubStation.includes("devangonthi")) ||
        (locLower === "ner" && pubStation.includes("neriya")) ||
        (locLower.includes("blr") && pubStation.includes("bangalore"))
      );
    });
  }, [publisherOptions, location]);

  const searchedPublishers = useMemo(() => {
    const search = publisherSearch.trim().toLowerCase();

    if (!search) {
      return filteredPublishers;
    }

    return filteredPublishers.filter((pub) => {
      const searchableText = [
        pub.user_name,
        pub.email,
        pub.designation,
        pub.role_name,
        pub.station_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [filteredPublishers, publisherSearch]);

  const handleStationChange = (newLocation: string) => {
    setLocation(newLocation);

    // If currently selected publisher doesn't belong to the newly selected station, reset publisher selection
    if (selectedPublisherUserId && newLocation && newLocation !== "ALL") {
      const currentPub = publisherOptions.find(
        (u) => u.user_id === selectedPublisherUserId,
      );
      if (currentPub) {
        const pubStation = currentPub.station_name?.toLowerCase() || "";
        const newLocLower = newLocation.toLowerCase();
        const matches =
          pubStation === newLocLower ||
          (newLocLower === "mlr" && pubStation.includes("mangalore")) ||
          (newLocLower === "hsn" && pubStation.includes("hassan")) ||
          (newLocLower === "dkn" && pubStation.includes("devangonthi")) ||
          (newLocLower === "ner" && pubStation.includes("neriya")) ||
          (newLocLower.includes("blr") && pubStation.includes("bangalore"));

        if (!matches) {
          setSelectedPublisherUserId(null);
          setSelectedPublisherStationId(null);
          setName("");
          setEmail("");
        }
      }
    }
  };

  const handlePublisherSelect = (userId: number) => {
    const selected = publisherOptions.find((user) => user.user_id === userId);

    if (!selected) {
      setSelectedPublisherUserId(null);
      setSelectedPublisherStationId(null);
      setName("");
      setEmail("");
      return;
    }

    setSelectedPublisherUserId(selected.user_id);
    setSelectedPublisherStationId(selected.station_id ?? null);
    setName(selected.user_name);
    setEmail(selected.email ?? "");
    if (selected.station_name) {
      setLocation(selected.station_name);
    }
  };

  const toggleFolder = (folder: FolderDefinition) => {
    const folderId = getFolderNumericId(folder);
    if (folderId === null) return;

    const isSelected = assignedFolders.includes(folderId);

    if (isSelected) {
      // Remove the primary folder.
      setAssignedFolders((prev) => prev.filter((id) => id !== folderId));

      // Collect all descendant subfolder IDs for this primary folder
      const descendantIds = collectDescendantSubfolderIds(folder.subfolders ?? []);
      const descendantIdSet = new Set(descendantIds);

      // Remove all descendant subfolders belonging to this primary folder
      setAssignedSubfolders((prev) =>
        prev.filter((id) => !descendantIdSet.has(id))
      );
    } else {
      // Add the primary folder.
      setAssignedFolders((prev) =>
        prev.includes(folderId) ? prev : [...prev, folderId]
      );
    }
  };

  const toggleSubfolder = (
    subfolder: SubfolderInfo,
    folderName: string,
    path: string[] = [],
    rootFolderId?: number
  ) => {
    const subFolderId = getSubfolderNumericId(subfolder);
    if (subFolderId === null) return;

    const targetFolderDef = folders.find(
      (folder) => getFolderNumericId(folder) === rootFolderId
    );

    const parentFolderId =
      rootFolderId ??
      (targetFolderDef ? getFolderNumericId(targetFolderDef) : null) ??
      subfolder.folder_id ??
      null;

    const getAncestorSubfolderIds = (
      subfolders: SubfolderInfo[],
      targetPath: string[],
      currentPath: string[] = []
    ): number[] => {
      const result: number[] = [];

      for (const sf of subfolders) {
        const nextPath = [...currentPath, sf.name];

        if (
          nextPath.length <= targetPath.length &&
          nextPath.every(
            (name, index) =>
              name.toLowerCase() === targetPath[index]?.toLowerCase()
          )
        ) {
          const id = getSubfolderNumericId(sf);

          if (id !== null && nextPath.length < targetPath.length) {
            result.push(id);
          }

          if (nextPath.length === targetPath.length) {
            return result;
          }

          const nestedResult = getAncestorSubfolderIds(
            sf.subfolders ?? [],
            targetPath,
            nextPath
          );

          if (nestedResult.length > 0 || nextPath.length < targetPath.length) {
            return [...result, ...nestedResult];
          }
        }
      }

      return result;
    };

    const rootFolder = folders.find(
      (folder) => getFolderNumericId(folder) === parentFolderId
    );

    const ancestorIds = rootFolder
      ? getAncestorSubfolderIds(rootFolder.subfolders ?? [], path)
      : [];

    setAssignedSubfolders((previous) => {
      const isAssigned = previous.includes(subFolderId);

      if (isAssigned) {
        const descendantIds = collectDescendantSubfolderIds(
          subfolder.subfolders ?? []
        );

        const toRemove = new Set([subFolderId, ...descendantIds]);
        const remaining = previous.filter((id) => !toRemove.has(id));

        // Preserve ancestors that are still needed by other selected descendants.
        const requiredAncestors = new Set<number>();

        const collectRequiredAncestors = (
          subfolders: SubfolderInfo[],
          currentPath: string[] = []
        ) => {
          for (const sf of subfolders) {
            const nextPath = [...currentPath, sf.name];
            const id = getSubfolderNumericId(sf);

            if (
              id !== null &&
              remaining.includes(id) &&
              nextPath.length > 1
            ) {
              const ids = getAncestorSubfolderIds(
                rootFolder?.subfolders ?? [],
                nextPath
              );

              ids.forEach((ancestorId) =>
                requiredAncestors.add(ancestorId)
              );
            }

            collectRequiredAncestors(sf.subfolders ?? [], nextPath);
          }
        };

        collectRequiredAncestors(rootFolder?.subfolders ?? []);

        return remaining.filter(
          (id) => !ancestorIds.includes(id) || requiredAncestors.has(id)
        );
      }

      return Array.from(
        new Set([...previous, ...ancestorIds, subFolderId])
      );
    });

    // A selected subfolder always requires its primary folder.
    if (parentFolderId !== null) {
      setAssignedFolders((previous) =>
        previous.includes(parentFolderId)
          ? previous
          : [...previous, parentFolderId]
      );
    }
  };

  const toggleExpandedFolder = (key: string) => {
    setExpandedFolders((previous) => {
      const next = new Set(previous);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  // Filter folders and nested subfolders recursively for search
  const matchingFolders = useMemo(() => {
    const query = folderSearch.trim().toLowerCase();
    if (!query) return folders;

    const filterSubfolders = (subfolders: SubfolderInfo[]): SubfolderInfo[] => {
      return subfolders.reduce<SubfolderInfo[]>((result, sf) => {
        const matchesSelf = sf.name.toLowerCase().includes(query);
        const filteredChildren = sf.subfolders ? filterSubfolders(sf.subfolders) : [];
        if (matchesSelf || filteredChildren.length > 0) {
          result.push({
            ...sf,
            subfolders: filteredChildren,
          });
        }
        return result;
      }, []);
    };

    return folders.reduce<FolderDefinition[]>((result, folder) => {
      const matchesSelf = folder.name.toLowerCase().includes(query);
      const filteredChildren = folder.subfolders ? filterSubfolders(folder.subfolders) : [];
      if (matchesSelf || filteredChildren.length > 0) {
        result.push({
          ...folder,
          subfolders: filteredChildren,
        });
      }
      return result;
    }, []);
  }, [folders, folderSearch]);

  const handleSelectAllFolders = () => {
    const allFolderIds: number[] = [];
    for (const folder of folders) {
      const fId = getFolderNumericId(folder);
      if (fId !== null) {
        allFolderIds.push(fId);
      }
    }
    setAssignedFolders(Array.from(new Set(allFolderIds)));

    const allSubs = folders.flatMap((folder) =>
      collectDescendantSubfolderIds(folder.subfolders ?? [])
    );
    setAssignedSubfolders(Array.from(new Set(allSubs)));
  };

  const handleClearAllFolders = () => {
    setAssignedFolders([]);
    setAssignedSubfolders([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    const cleanAssignedFolders = Array.from(new Set(assignedFolders));
    const cleanAssignedSubfolders = Array.from(new Set(assignedSubfolders));

    const pub: Publisher = {
      id: publisher?.id || `pub-${Date.now()}`,
      name: name.trim(),
      email:
        email.trim() ||
        `${name.trim().toLowerCase().replace(/\s+/g, ".")}@pmhbl.com`,
      department,
      location,
      publisherUserId: selectedPublisherUserId ?? undefined,
      publisherStationId: selectedPublisherStationId ?? undefined,
      assignedFolders: cleanAssignedFolders,
      assignedSubfolders: cleanAssignedSubfolders,
      assignedFolderIds: cleanAssignedFolders,
      assignedSubfolderIds: cleanAssignedSubfolders,
      createdDate: publisher?.createdDate || formatNow(),
    };

    setShowConfirmation(false);
    onSave(pub);
  };


  return (
    <>
      <Modal
      title={publisher ? `Edit Publisher · ${publisher.name}` : "Create & Assign Publisher"}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-semibold text-primary">Admin RBAC Delegation Notice</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
            As an Administrator, you can assign one or multiple publishers to any folder or
            subfolder. Multiple publishers can co-manage the same folder or subfolder for
            collaborative compliance governance.
          </p>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1">
              Station Location
            </label>
            <div className="relative">
              <select
                value={location}
                onChange={(e) => handleStationChange(e.target.value)}
                className="dms-input h-8.5 w-full appearance-none !pr-7 !pl-2.5 text-xs font-medium cursor-pointer"
              >
                <option value="ALL">All Stations (Company-wide)</option>
                {stationOptions.length > 0
                  ? stationOptions.map((st) => (
                    <option key={st.station_name} value={st.station_name}>
                      {st.station_name}
                    </option>
                  ))
                  : [
                    "HO BLR",
                    "MLR",
                    "NER",
                    "HSN",
                    "DKN",
                  ].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1">
              Publisher Full Name <span className="text-red-500">*</span>
              {location && location !== "ALL" && (
                <span className="text-[10px] text-primary font-normal ml-1">
                  (Filtered by {location})
                </span>
              )}
            </label>
            {isLoadingEngineers ? (
              <div className="dms-input flex h-9 items-center px-2.5 text-xs text-muted-foreground">
                Loading available engineers...
              </div>
            ) : engineerFetchError ? (
              <div className="space-y-2">
                <p className="text-xs text-red-500">{engineerFetchError}</p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchUnallottedEngineers}
                  className="h-8 text-xs cursor-pointer"
                >
                  Retry
                </Button>
              </div>
            ) : publisherOptions.length > 0 ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPublisherDropdownOpen((prev) => !prev)}
                  className="relative flex h-9 w-full items-center rounded-md border border-input bg-background px-2.5 pr-8 text-left text-xs font-medium text-foreground shadow-xs outline-none transition-colors hover:bg-muted/30 focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                  <span
                    className={`truncate ${selectedPublisherUserId
                      ? "text-foreground"
                      : "text-muted-foreground"
                      }`}
                  >
                    {selectedPublisherUserId
                      ? (() => {
                        const selected = publisherOptions.find(
                          (pub) => pub.user_id === selectedPublisherUserId
                        );

                        return selected
                          ? `${selected.user_name} (${selected.designation || selected.role_name || ""
                          })`
                          : "Select Publisher";
                      })()
                      : "Select Publisher"}
                  </span>

                  <ChevronDown
                    className={`pointer-events-none absolute right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-transform ${isPublisherDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isPublisherDropdownOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-white shadow-lg">
                    {/* Search */}
                    <div className="border-b border-border p-2">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                        <input
                          type="text"
                          value={publisherSearch}
                          onChange={(e) => setPublisherSearch(e.target.value)}
                          placeholder="Search publisher..."
                          autoFocus
                          className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-8 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />

                        {publisherSearch && (
                          <button
                            type="button"
                            onClick={() => setPublisherSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Publisher List */}
                    <div className="max-h-52 overflow-y-auto">
                      {searchedPublishers.length > 0 ? (
                        searchedPublishers.map((pubUser) => {
                          const isSelected =
                            selectedPublisherUserId === pubUser.user_id;

                          return (
                            <button
                              key={pubUser.user_id}
                              type="button"
                              onClick={() => {
                                handlePublisherSelect(pubUser.user_id);
                                setPublisherSearch("");
                                setIsPublisherDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left transition-colors ${isSelected
                                ? "bg-primary/10"
                                : "hover:bg-muted/50"
                                }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`truncate text-xs font-medium ${isSelected
                                    ? "text-primary"
                                    : "text-foreground"
                                    }`}
                                >
                                  {pubUser.user_name}
                                </span>

                                {isSelected && (
                                  <Check className="h-5 w-5 shrink-0 text-primary" />
                                )}
                              </div>

                              <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                {pubUser.designation || pubUser.role_name || "—"}
                                {" • "}
                                {pubUser.station_name || "—"}
                                {pubUser.email && (
                                  <>
                                    {" • "}
                                    {pubUser.email}
                                  </>
                                )}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">
                          No publishers found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="dms-input flex h-9 items-center px-2.5 text-xs text-muted-foreground">
                No unallotted engineers available.
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              readOnly={Boolean(selectedPublisherUserId)}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. s.pillai@pmhbl.com"
              className={`dms-input h-8.5 w-full !px-2.5 text-xs ${selectedPublisherUserId
                ? "bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed"
                : ""
                }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1">
              Department
            </label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="dms-input h-8.5 w-full appearance-none !pr-7 !pl-2.5 text-xs"
              >
                <option value="Operations">Operations</option>
                <option value="Pipeline Engineering">Pipeline Engineering</option>
                <option value="IMS & Quality">IMS & Quality</option>
                <option value="HSE & Environmental">HSE & Environmental</option>
                <option value="Mechanical & Maintenance">Mechanical & Maintenance</option>
                <option value="Electrical & Instrumentation">Electrical & Instrumentation</option>
                <option value="Legal & Regulatory Affairs">Legal & Regulatory Affairs</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Unified Assign Folders & Subfolders Section */}
        <div className="space-y-3 pt-3 border-t border-border">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-foreground">
                Assign Folders & Subfolders
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Select the folders and nested subfolders this publisher can manage.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs self-start sm:self-auto">
              <span className="text-[11px] text-muted-foreground font-medium mr-1">
                {assignedFolders.length} folders · {assignedSubfolders.length} subfolders assigned
              </span>
              <button
                type="button"
                onClick={handleSelectAllFolders}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Select All
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                type="button"
                onClick={handleClearAllFolders}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={folderSearch}
              onChange={(e) => setFolderSearch(e.target.value)}
              placeholder="Search folders and subfolders..."
              aria-label="Search folders and subfolders"
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            {folderSearch && (
              <button
                type="button"
                onClick={() => setFolderSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Unified Recursive Folder Tree */}
          <div className="max-h-72 overflow-y-auto space-y-2 rounded-xl border border-border bg-muted/10 p-2.5">
            {matchingFolders.length > 0 ? (
              matchingFolders.map((folder) => {
                const folderId = getFolderNumericId(folder);
                const isFolderChecked =
                  folderId !== null && assignedFolders.includes(folderId);
                const hasSubfolders = Boolean(
                  folder.subfolders && folder.subfolders.length > 0
                );
                const isSearching = folderSearch.trim().length > 0;
                const isExpanded =
                  isSearching ||
                  expandedFolders.has(String(folder.id ?? folderId));
                const totalSubs = countAllSubfolders(folder.subfolders ?? []);

                return (
                  <div key={folder.id} className="space-y-1.5">
                    {/* Primary Folder Row */}
                    <div
                      className={`group flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors ${
                        isFolderChecked
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-transparent bg-background hover:border-border hover:bg-muted/50"
                      }`}
                    >
                      {hasSubfolders ? (
                        <button
                          type="button"
                          onClick={() =>
                            toggleExpandedFolder(
                              String(folder.id ?? folderId)
                            )
                          }
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={
                            isExpanded
                              ? `Collapse ${folder.name}`
                              : `Expand ${folder.name}`
                          }
                          aria-expanded={isExpanded}
                        >
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${
                              isExpanded ? "" : "-rotate-90"
                            }`}
                          />
                        </button>
                      ) : (
                        <span className="h-7 w-7 shrink-0" />
                      )}

                      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 py-0.5">
                        <input
                          type="checkbox"
                          checked={isFolderChecked}
                          onChange={() => toggleFolder(folder)}
                          className="h-4 w-4 shrink-0 cursor-pointer rounded accent-primary"
                        />

                        {isExpanded && hasSubfolders ? (
                          <FolderOpen
                            size={18}
                            className="shrink-0 text-primary"
                          />
                        ) : (
                          <Folder
                            size={18}
                            className={`shrink-0 ${
                              isFolderChecked
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        )}

                        <span
                          className="min-w-0 flex-1 truncate text-sm font-medium"
                          title={folder.name}
                        >
                          {folder.number !== undefined && (
                            <span className="font-mono text-xs opacity-75 mr-1.5 font-bold">
                              {String(folder.number).padStart(2, "0")}.
                            </span>
                          )}
                          {folder.name}
                        </span>
                      </label>

                      {isFolderChecked && (
                        <Check
                          size={16}
                          className="shrink-0 text-primary"
                          aria-label="Assigned"
                        />
                      )}

                      {hasSubfolders && (
                        <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {totalSubs}
                        </span>
                      )}
                    </div>

                    {/* Nested Subfolders Tree */}
                    {hasSubfolders && isExpanded && (
                      <div className="ml-3.5 mt-1 space-y-1.5 border-l border-border pl-3">
                        {folder.subfolders!.map((sf, index) => (
                          <PublisherFolderTreeItem
                            key={
                              sf.sub_folder_id ??
                              sf.id ??
                              `${folder.name}:::${sf.name}`
                            }
                            subfolder={sf}
                            folderName={folder.name}
                            folderId={folderId ?? undefined}
                            parentPath={[]}
                            index={index}
                            assignedSubfolders={assignedSubfolders}
                            onToggleSubfolder={toggleSubfolder}
                            searchQuery={folderSearch}
                            expandMatching={isSearching}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No matching folders or subfolders found.
              </div>
            )}
          </div>

          {/* Selected Summary Footer */}
          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              Selected: {assignedFolders.length} folders · {assignedSubfolders.length} subfolders
            </span>
            <span className="text-[11px]">
              Subfolders automatically link to their primary folder
            </span>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-2 border-t border-border bg-white py-2.5">
          <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              !name.trim() ||
              (!publisher && !selectedPublisherUserId) ||
              (!publisher && availableEngineers.length === 0) ||
              assignedFolders.length === 0
            }
            className="gap-1.5 shadow-md cursor-pointer"
          >
            <Check className="h-5 w-5" />
            <span>{publisher ? "Update Publisher" : "Save Publisher & Permissions"}</span>
          </Button>
        </div>
      </form>
      </Modal>

      {showConfirmation && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-white p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-900">
              {publisher ? "Confirm Publisher Update" : "Confirm Publisher Creation"}
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              {publisher
                ? "Are you sure you want to update this publisher and its permissions?"
                : "Are you sure you want to create this publisher and save the assigned permissions?"}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleConfirmSubmit}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

