// DMS Document Filters hook: search query, sorting, column quick-filters, and filtered documents memo.
// Extracted verbatim from useDmsWorkspace.ts – no behavioural changes.

import { useState, useMemo, useEffect } from "react"
import type { Role, MainTab, DocumentRecord, FolderDefinition } from "../types"

interface UseDmsDocumentFiltersOptions {
  documents: DocumentRecord[]
  archivedData: DocumentRecord[]
  activeMainTab: MainTab
  role: Role
  currentUserId: number | string | null
  selectedFolder: string | null
  selectedSubfolder: string | null
  selectedSubSubfolder: string | null
  selectedSubfolderPath?: string[]
  currentFolderDef: FolderDefinition | null
}

export function useDmsDocumentFilters({
  documents,
  archivedData,
  activeMainTab,
  role,
  currentUserId,
  selectedFolder,
  selectedSubfolder,
  selectedSubSubfolder,
  selectedSubfolderPath = [],
  currentFolderDef,
}: UseDmsDocumentFiltersOptions) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query])
  const [sortField, setSortField] = useState<string | null>("Location")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filterStatus, setFilterStatus] = useState<string>("All")
  const [filterDepartment, setFilterDepartment] = useState<string>("All")
  const [filterLocation, setFilterLocation] = useState<string>("All")
  const [filterDocType, setFilterDocType] = useState<string>("All")
  const [filterConfidential, setFilterConfidential] = useState<string>("All")
  const [showFilters, setShowFilters] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterStatus !== "All") count++
    if (filterDepartment !== "All") count++
    if (filterLocation !== "All") count++
    if (filterDocType !== "All") count++
    if (filterConfidential !== "All") count++
    return count
  }, [
    filterStatus,
    filterDepartment,
    filterLocation,
    filterDocType,
    filterConfidential,
  ])

  const resetFilters = () => {
    setFilterStatus("All")
    setFilterDepartment("All")
    setFilterLocation("All")
    setFilterDocType("All")
    setFilterConfidential("All")
  }

  const filteredDocuments = useMemo(() => {
    const value = debouncedQuery.trim().toLowerCase()

    // Archive tab: use only archived records.
    // Other tabs: exclude archived, inactive, and deleted records.
    const sourceDocuments =
      activeMainTab === "archive"
        ? archivedData
        : documents.filter((document) => {
            const status = String(document.status ?? "").toUpperCase()

            return (
              status !== "ARCHIVED" &&
              status !== "INACTIVE" &&
              !document.isDeleted
            )
          })

    const filtered = sourceDocuments.filter((document) => {
      if (activeMainTab === "archive") {
        // Regular users must not see the Archive tab.
        if (role === "User") return false

        // Only archived records should appear in the Archive tab.
        if (String(document.status ?? "").toUpperCase() !== "ARCHIVED") {
          return false
        }
      }

      // Quick filter popover filters:
      if (filterStatus !== "All" && document.status !== filterStatus)
        return false
      if (
        filterDepartment !== "All" &&
        document.department !== filterDepartment
      )
        return false
      if (filterLocation !== "All") {
        const docLocNorm =
          document.location === "HO"
            ? "HO BLR"
            : document.location === "DCN"
              ? "DKN"
              : document.location
        const targetLocNorm =
          filterLocation === "HO"
            ? "HO BLR"
            : filterLocation === "DCN"
              ? "DKN"
              : filterLocation
        if (docLocNorm !== targetLocNorm) return false
      }
      if (filterDocType !== "All" && document.type !== filterDocType)
        return false
      if (filterConfidential === "Confidential" && !document.isConfidential)
        return false
      if (filterConfidential === "Standard" && document.isConfidential)
        return false

      // Confidential documents: creator or explicitly authorized user only.
      if (document.isConfidential) {
        const documentRecord = document as DocumentRecord & {
          createdBy?: number | string | null
          hasAccess?: boolean
          canView?: boolean
        }

        const loggedInUserId =
          currentUserId == null ? null : Number(currentUserId)

        const creatorId =
          documentRecord.createdBy == null
            ? null
            : Number(documentRecord.createdBy)

        const isCreator =
          loggedInUserId !== null &&
          creatorId !== null &&
          Number.isFinite(loggedInUserId) &&
          Number.isFinite(creatorId) &&
          loggedInUserId === creatorId

        // These flags must represent document-specific authorization
        // calculated by the backend, not merely general folder access.
        const hasDocumentAccess =
          documentRecord.hasAccess === true || documentRecord.canView === true

        if (!isCreator && !hasDocumentAccess) {
          return false
        }
      }

      // Apply folder filtering only in the All Documents tab.
      if (activeMainTab === "all-documents" && selectedFolder && !value) {
        if (document.folder !== selectedFolder) return false

        if (selectedSubfolderPath && selectedSubfolderPath.length > 0) {
          const documentPath = (
            document as DocumentRecord & {
              subfolderPath?: string[]
            }
          ).subfolderPath

          // Compare the complete nested path at any depth.
          if (Array.isArray(documentPath) && documentPath.length > 0) {
            const isSamePath =
              documentPath.length === selectedSubfolderPath.length &&
              documentPath.every(
                (segment, index) => segment === selectedSubfolderPath[index],
              )

            if (!isSamePath) return false
          } else {
            // Backward compatibility for records without subfolderPath.
            if (document.subfolder !== selectedSubfolderPath[0]) {
              return false
            }

            if (selectedSubfolderPath.length > 1) {
              const expectedSubSub = selectedSubfolderPath.slice(1).join(" / ")

              if (document.subSubfolder !== expectedSubSub) {
                return false
              }
            } else if (document.subSubfolder) {
              return false
            }
          }
        } else if (selectedSubfolder) {
          if (document.subfolder !== selectedSubfolder) return false

          if (
            selectedSubSubfolder &&
            document.subSubfolder !== selectedSubSubfolder
          ) {
            return false
          }
        } else if (
          currentFolderDef?.subfolders &&
          currentFolderDef.subfolders.length > 0
        ) {
          if (document.subfolder) return false
        }
      }

      const documentRecord = document as DocumentRecord & {
        fileName?: string
        file_name?: string
        subfolderPath?: string[]
        document_title?: string
        document_number?: string
      }

      const searchableFields = [
        document.number,
        document.title,
        document.subject,
        document.department,
        document.location,
        document.category,
        document.custodian,
        document.securityClassification,
        document.retentionClass,
        document.rack,
        document.box,
        documentRecord.fileName,
        documentRecord.file_name,
        documentRecord.document_title,
        documentRecord.document_number,
        ...(Array.isArray(document.tags) ? document.tags : []),
      ]

      const matchesQuery =
        !value ||
        searchableFields.some(
          (field) =>
            field !== null &&
            field !== undefined &&
            String(field).trim().toLowerCase().includes(value),
        )

      return matchesQuery
    })

    if (sortField) {
      filtered.sort((a, b) => {
        let cmp = 0
        if (sortField === "Location") {
          const locA = (
            a.location === "HO"
              ? "HO BLR"
              : a.location === "DCN"
                ? "DKN"
                : a.location || ""
          ).trim()
          const locB = (
            b.location === "HO"
              ? "HO BLR"
              : b.location === "DCN"
                ? "DKN"
                : b.location || ""
          ).trim()
          const LOCATION_ORDER = ["HO BLR", "MLR", "NER", "HSN", "DKN"]
          const idxA = LOCATION_ORDER.indexOf(locA)
          const idxB = LOCATION_ORDER.indexOf(locB)
          if (idxA !== -1 && idxB !== -1) {
            cmp = idxA - idxB
          } else if (idxA !== -1) {
            cmp = -1
          } else if (idxB !== -1) {
            cmp = 1
          } else {
            cmp = locA.localeCompare(locB)
          }
          if (cmp === 0) {
            cmp = a.number.localeCompare(b.number)
          }
        } else if (sortField === "Document no.") {
          cmp = a.number.localeCompare(b.number)
        } else if (sortField === "Document title") {
          cmp = a.title.localeCompare(b.title)
        } else if (sortField === "Department") {
          cmp = a.department.localeCompare(b.department)
        } else if (sortField === "Revision") {
          cmp = a.revision.localeCompare(b.revision)
        } else if (sortField === "Status") {
          cmp = a.status.localeCompare(b.status)
        } else if (sortField === "Owner") {
          cmp = a.owner.localeCompare(b.owner)
        } else if (sortField === "Updated") {
          cmp = a.updated.localeCompare(b.updated)
        }
        return sortOrder === "asc" ? cmp : -cmp
      })
    }

    return filtered
  }, [
    debouncedQuery,
    activeMainTab,
    archivedData,
    documents,
    role,
    filterStatus,
    filterDepartment,
    filterLocation,
    filterDocType,
    filterConfidential,
    selectedFolder,
    selectedSubfolder,
    selectedSubSubfolder,
    selectedSubfolderPath,
    currentFolderDef,
    sortField,
    sortOrder,
    currentUserId,
  ])

  const activeDocsCount = useMemo(() => {
    return documents.filter((d) => {
      if (d.isDeleted) return false
      if (d.status === "Archived") return false
      if (d.isConfidential) {
        const documentRecord = d as DocumentRecord & {
          createdBy?: number | string | null
          hasAccess?: boolean
          canView?: boolean
        }

        const loggedInUserId =
          currentUserId == null ? null : Number(currentUserId)

        const creatorId =
          documentRecord.createdBy == null
            ? null
            : Number(documentRecord.createdBy)

        const isCreator =
          loggedInUserId !== null &&
          creatorId !== null &&
          Number.isFinite(loggedInUserId) &&
          Number.isFinite(creatorId) &&
          loggedInUserId === creatorId

        const hasDocumentAccess =
          documentRecord.hasAccess === true || documentRecord.canView === true

        if (!isCreator && !hasDocumentAccess) {
          return false
        }
      }
      return true
    }).length
  }, [documents, currentUserId])

  const archivedDocsCount = useMemo(() => {
    return documents.filter((d) => {
      if (d.isDeleted) return false
      if (d.status?.toUpperCase() !== "ARCHIVED") return false
      if (role === "Admin" && d.isConfidential) return false
      if (role === "User") return false
      return true
    }).length
  }, [documents, role])

  const controlledDocsCount = useMemo(() => {
    return documents.filter((d) => !d.isDeleted && d.status === "Controlled")
      .length
  }, [documents])

  const reviewDocsCount = useMemo(() => {
    return documents.filter((d) => !d.isDeleted && d.status === "Review").length
  }, [documents])

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc")
      } else {
        setSortField(null)
        setSortOrder("asc")
      }
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  return {
    query,
    setQuery,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    filterStatus,
    setFilterStatus,
    filterDepartment,
    setFilterDepartment,
    filterLocation,
    setFilterLocation,
    filterDocType,
    setFilterDocType,
    filterConfidential,
    setFilterConfidential,
    showFilters,
    setShowFilters,
    showSortMenu,
    setShowSortMenu,
    activeFilterCount,
    resetFilters,
    filteredDocuments,
    activeDocsCount,
    archivedDocsCount,
    controlledDocsCount,
    reviewDocsCount,
    handleSort,
  }
}
