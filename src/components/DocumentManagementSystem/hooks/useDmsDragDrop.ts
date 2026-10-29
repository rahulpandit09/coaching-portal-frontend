// DMS Drag & Drop and Move operations hook for documents, subfolders, and sub-subfolders.
// Extracted verbatim from useDmsWorkspace.ts – no behavioural changes.

import React, { useState, useCallback, useRef } from "react"
import { toast as toastify } from "react-toastify"
import api from "@/api/axiosInstance"
import type {
  Role,
  FolderDefinition,
  DocumentRecord,
  MoveSubfolderPreviewResponse,
  MoveSubfolderResponse,
} from "../types"
import { formatNow } from "../initial-data"
import { getLoggedInUserId } from "./dmsUser"

interface UseDmsDragDropOptions {
  role: Role
  canMoveFiles: boolean
  folders: FolderDefinition[]
  setFolders: React.Dispatch<React.SetStateAction<FolderDefinition[]>>
  authorizedFolders: FolderDefinition[]
  documents: DocumentRecord[]
  setDocuments: React.Dispatch<React.SetStateAction<DocumentRecord[]>>
  fetchFolders: () => Promise<void>
  selectedFolder: string | null
  selectedSubfolder: string | null
  selectedSubSubfolder: string | null
  setSelectedFolder: (name: string | null) => void
  setSelectedSubfolder: (name: string | null) => void
  setActiveFolder: (name: string) => void
  setExpandedFolders: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >
  setExpandedSubfolders: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >
  setToast: (
    msg: string,
    type?: "success" | "error" | "warning" | "info",
  ) => void
}

export function useDmsDragDrop({
  role,
  canMoveFiles,
  folders,
  setFolders,
  authorizedFolders,
  documents,
  setDocuments,
  fetchFolders,
  selectedFolder,
  selectedSubfolder,
  selectedSubSubfolder,
  setSelectedFolder,
  setSelectedSubfolder,
  setActiveFolder,
  setExpandedFolders,
  setExpandedSubfolders,
  setToast,
}: UseDmsDragDropOptions) {
  const [moveTarget, setMoveTarget] = useState<{
    subfolderName: string
    sourceFolder: string
    targetFolder?: string | undefined
    docCount: number
    subFolderId?: number | undefined
    destinationFolderId?: number | undefined
    destinationFolderName?: string | undefined
    destinationParentSubFolderId?: number | null | undefined
  } | null>(null)
  const [moveSubSubTarget, setMoveSubSubTarget] = useState<{
    subSubfolderName: string
    sourceFolder: string
    sourceSubfolder: string
    subFolderId?: number
    targetFolder?: string
    targetSubfolder?: string
    docCount: number
  } | null>(null)
  const [moveDocTarget, setMoveDocTarget] = useState<{
    document: DocumentRecord
    targetFolder: string
    targetSubfolder?: string | undefined
    targetSubSubfolder?: string | undefined
  } | null>(null)
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)
  const [dragOverSubfolder, setDragOverSubfolder] = useState<string | null>(
    null,
  )
  const [dragOverSubSubfolder, setDragOverSubSubfolder] = useState<
    string | null
  >(null)

  const movingSubfoldersRef = useRef<Set<number>>(new Set())
  const confirmingMoveRef = useRef(false)

  const findSubfolderInTree = useCallback(
    (nodes: any[] = [], predicate: (node: any) => boolean): any => {
      for (const node of nodes) {
        if (predicate(node)) return node
        const found = findSubfolderInTree(node.subfolders || [], predicate)
        if (found) return found
      }
      return undefined
    },
    [],
  )

  const handleDocumentDragStart = (e: React.DragEvent, doc: DocumentRecord) => {
    if (!canMoveFiles) return
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "document",
        documentId: doc.id,
        documentNumber: doc.number,
        documentTitle: doc.title,
        sourceFolder: doc.folder || "",
        sourceSubfolder: doc.subfolder || "",
        sourceSubSubfolder: doc.subSubfolder || "",
      }),
    )
    e.dataTransfer.effectAllowed = "move"
  }

  const fetchMoveSubfolderPreview = useCallback(
    async (
      subFolderId: number,
      destinationFolderId: number,
      parentSubFolderId?: number | null,
    ) => {
      try {
        const response = await api.get<MoveSubfolderPreviewResponse>(
          `/dms-sub-folder/move-preview/${subFolderId}`,
          {
            params: {
              destination_folder_id: destinationFolderId,
              parent_sub_folder_id: parentSubFolderId ?? null,
            },
          },
        )

        if (response.data?.status !== "success") {
          toastify.error("Unable to preview sub-folder move.")
          return null
        }

        return response.data.data
      } catch (error: any) {
        console.error("Move sub-folder preview failed:", error)

        const status = error?.response?.status
        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Unable to preview sub-folder move."

        // The preview endpoint can reject a move when the subfolder
        // is already present in the destination. Do not show a toast
        // for this expected duplicate-location response.
        if (
          status === 400 &&
          typeof message === "string" &&
          message.toLowerCase().includes("already in")
        ) {
          return null
        }

        toastify.error(
          Array.isArray(message)
            ? message.map((item: any) => item.msg).join(", ")
            : message,
        )

        return null
      }
    },
    [],
  )

  const moveSubfolder = useCallback(
    async (
      subFolderId: number,
      destinationFolderId: number,
      updatedBy: number,
      parentSubFolderId?: number | null,
    ) => {
      // Prevent duplicate requests for the same subfolder.
      if (movingSubfoldersRef.current.has(subFolderId)) {
        return false
      }

      movingSubfoldersRef.current.add(subFolderId)

      try {
        const response = await api.post<MoveSubfolderResponse>(
          `/dms-sub-folder/move/${subFolderId}`,
          {
            destination_folder_id: destinationFolderId,
            parent_sub_folder_id: parentSubFolderId ?? null,
            updated_by: updatedBy,
          },
        )

        if (response.data?.status !== "success") {
          toastify.error(response.data?.message || "Failed to move sub-folder.")
          return false
        }

        toastify.success(
          response.data?.message || "Sub-folder moved successfully.",
        )

        return true
      } catch (error: any) {
        console.error("Move sub-folder failed:", error)

        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to move sub-folder."

        toastify.error(
          Array.isArray(message)
            ? message.map((item: any) => item.msg).join(", ")
            : message,
        )

        return false
      } finally {
        movingSubfoldersRef.current.delete(subFolderId)
      }
    },
    [],
  )

  const handleSubfolderDragStart = (
    e: React.DragEvent,
    sourceFolder: string,
    subfolderName: string,
    sourceFolderId?: number | string,
    subfolderId?: number | string,
  ) => {
    if (role !== "Admin") return
    const srcFolderDef = folders.find((f) => f.name === sourceFolder)
    const srcSubDef = findSubfolderInTree(
      srcFolderDef?.subfolders || [],
      (sf) =>
        subfolderId != null
          ? Number(sf.sub_folder_id ?? sf.id) === Number(subfolderId)
          : sf.name === subfolderName,
    )
    const resolvedFolderId = sourceFolderId
      ? Number(sourceFolderId)
      : srcFolderDef?.id
        ? Number(srcFolderDef.id)
        : undefined
    const resolvedSubfolderId = subfolderId
      ? Number(subfolderId)
      : srcSubDef?.sub_folder_id ||
        (srcSubDef?.id ? Number(srcSubDef.id) : undefined)

    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "subfolder",
        sourceFolder,
        subfolderName,
        sourceFolderId: resolvedFolderId,
        subFolderId: resolvedSubfolderId,
      }),
    )
    e.dataTransfer.effectAllowed = "move"
  }

  const handleSubSubfolderDragStart = (
    e: React.DragEvent,
    sourceFolder: string,
    sourceSubfolder: string,
    subSubfolderName: string,
    subFolderId?: number | string,
  ) => {
    if (role !== "Admin") return

    const sourceFolderDef = folders.find(
      (folder) => folder.name === sourceFolder,
    )

    const sourceParent = findSubfolderInTree(
      sourceFolderDef?.subfolders || [],
      (node) =>
        node.name === sourceSubfolder &&
        (node.subfolders || []).some(
          (child: any) =>
            child.name === subSubfolderName &&
            (subFolderId == null ||
              Number(child.sub_folder_id ?? child.id) === Number(subFolderId)),
        ),
    )

    const sourceNode = (sourceParent?.subfolders || []).find(
      (child: any) =>
        child.name === subSubfolderName &&
        (subFolderId == null ||
          Number(child.sub_folder_id ?? child.id) === Number(subFolderId)),
    )

    const resolvedId = Number(
      subFolderId ?? sourceNode?.sub_folder_id ?? sourceNode?.id,
    )

    if (!Number.isFinite(resolvedId) || resolvedId <= 0) {
      toastify.error("Unable to identify the subfolder being moved.")
      return
    }

    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "subsubfolder",
        sourceFolder,
        sourceSubfolder,
        subSubfolderName,
        subFolderId: resolvedId,
      }),
    )

    e.dataTransfer.effectAllowed = "move"
  }

  const handleFolderDragOver = (e: React.DragEvent, folderName: string) => {
    if (!canMoveFiles) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverFolder !== folderName) {
      setDragOverFolder(folderName)
    }
  }

  const handleFolderDragLeave = (folderName: string) => {
    if (dragOverFolder === folderName) {
      setDragOverFolder(null)
    }
  }

  const handleFolderDrop = async (
    e: React.DragEvent,
    targetFolderName: string,
  ) => {
    if (!canMoveFiles) return
    e.preventDefault()
    setDragOverFolder(null)

    try {
      const raw = e.dataTransfer.getData("application/json")
      if (!raw) return
      const data = JSON.parse(raw)

      // Case 1: Dropping a document onto a primary folder
      if (data.type === "document" || data.documentId) {
        const doc = documents.find((d) => d.id === data.documentId)
        if (!doc) return
        const targetDef = folders.find((f) => f.name === targetFolderName)
        const defaultSub = targetDef?.subfolders?.[0]?.name || ""
        const defaultSubSub =
          targetDef?.subfolders?.[0]?.subfolders?.[0]?.name || undefined

        setMoveDocTarget({
          document: doc,
          targetFolder: targetFolderName,
          targetSubfolder: defaultSub,
          targetSubSubfolder: defaultSubSub,
        })
        return
      }

      // Case 2: Dropping a subfolder onto a primary folder
      if (
        role === "Admin" &&
        (data.type === "subfolder" || data.subfolderName)
      ) {
        const { sourceFolder, subfolderName, subFolderId: rawSubId } = data
        if (!sourceFolder || !subfolderName) return
        const targetDef = folders.find((f) => f.name === targetFolderName)
        if (!targetDef) return

        if (
          targetDef.subfolders?.some(
            (sf) => sf.name.toLowerCase() === subfolderName.toLowerCase(),
          )
        ) {
          toastify.error(
            `Target folder "${targetFolderName}" already contains sub-folder "${subfolderName}".`,
          )
          return
        }

        const srcFolderDef = folders.find((f) => f.name === sourceFolder)
        const srcSubDef = findSubfolderInTree(
          srcFolderDef?.subfolders || [],
          (sf) =>
            rawSubId != null
              ? Number(sf.sub_folder_id ?? sf.id) === Number(rawSubId)
              : sf.name === subfolderName,
        )
        const subFolderId = Number(
          rawSubId || srcSubDef?.sub_folder_id || srcSubDef?.id,
        )
        const destinationFolderId = Number(targetDef.id)

        if (subFolderId && destinationFolderId) {
          const preview = await fetchMoveSubfolderPreview(
            subFolderId,
            destinationFolderId,
          )
          if (preview) {
            setMoveTarget({
              subfolderName: preview.sub_folder_name || subfolderName,
              sourceFolder,
              targetFolder: targetFolderName,
              docCount: preview.affected_documents_count,
              subFolderId: preview.sub_folder_id,
              destinationFolderId: preview.destination_folder_id,
              destinationFolderName: preview.destination_folder_name,
            })
            return
          }
        }

        const docCount = documents.filter(
          (d) => d.folder === sourceFolder && d.subfolder === subfolderName,
        ).length

        setMoveTarget({
          subfolderName,
          sourceFolder,
          targetFolder: targetFolderName,
          docCount,
          subFolderId: subFolderId || undefined,
          destinationFolderId: destinationFolderId || undefined,
          destinationFolderName: targetFolderName,
        })
      }
    } catch (err) {
      console.error("Drop error", err)
    }
  }

  const handleSubfolderDragOver = (
    e: React.DragEvent,
    folderName: string,
    subfolderName: string,
  ) => {
    if (!canMoveFiles) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"
    const key = `${folderName}:::${subfolderName}`
    if (dragOverSubfolder !== key) {
      setDragOverSubfolder(key)
    }
  }

  const handleSubfolderDragLeave = (
    folderName: string,
    subfolderName: string,
  ) => {
    const key = `${folderName}:::${subfolderName}`
    if (dragOverSubfolder === key) {
      setDragOverSubfolder(null)
    }
  }

  const handleSubfolderDrop = async (
    e: React.DragEvent,
    targetFolderName: string,
    targetSubfolderName: string,
  ) => {
    if (!canMoveFiles) return
    e.preventDefault()
    e.stopPropagation()
    setDragOverSubfolder(null)
    setDragOverFolder(null)

    try {
      const raw = e.dataTransfer.getData("application/json")
      if (!raw) return
      const data = JSON.parse(raw)

      if (data.type === "document" || data.documentId) {
        const doc = documents.find((d) => d.id === data.documentId)
        if (!doc) return

        const targetFolderDef = folders.find((f) => f.name === targetFolderName)
        const targetSubDef = targetFolderDef?.subfolders?.find(
          (sf) => sf.name === targetSubfolderName,
        )
        const defaultSubSub = targetSubDef?.subfolders?.[0]?.name || undefined

        setMoveDocTarget({
          document: doc,
          targetFolder: targetFolderName,
          targetSubfolder: targetSubfolderName,
          targetSubSubfolder: defaultSubSub,
        })
        return
      }

      // Case 2: Dropping a nested subfolder onto a subfolder.
      // Open the confirmation modal; the destination can be selected at any depth.
      if (role === "Admin" && data.type === "subsubfolder") {
        const {
          sourceFolder,
          sourceSubfolder,
          subSubfolderName,
          subFolderId: rawSubFolderId,
        } = data

        const subFolderId = Number(rawSubFolderId)

        if (
          !sourceFolder ||
          !sourceSubfolder ||
          !subSubfolderName ||
          !Number.isFinite(subFolderId) ||
          subFolderId <= 0
        ) {
          toastify.error("Unable to identify the subfolder being moved.")
          return
        }

        const sourceFolderDef = folders.find(
          (folder) => folder.name === sourceFolder,
        )

        const sourceNode = findSubfolderInTree(
          sourceFolderDef?.subfolders || [],
          (node) =>
            Number(node.sub_folder_id ?? node.id) === subFolderId,
        )

        if (!sourceNode) {
          toastify.error("The source subfolder could not be found.")
          return
        }

        const docCount = documents.filter(
          (document) =>
            document.folder === sourceFolder &&
            document.subfolder === sourceSubfolder &&
            document.subSubfolder === subSubfolderName,
        ).length

        setMoveSubSubTarget({
          subSubfolderName,
          sourceFolder,
          sourceSubfolder,
          subFolderId,
          targetFolder: targetFolderName,
          targetSubfolder: targetSubfolderName,
          docCount,
        })

        return
      }

      // Case 3: Dropping a subfolder onto a subfolder (move into the target primary folder)
      if (
        role === "Admin" &&
        (data.type === "subfolder" || data.subfolderName)
      ) {
        const { sourceFolder, subfolderName, subFolderId: rawSubId } = data
        if (!sourceFolder || !subfolderName) return
        const targetDef = folders.find((f) => f.name === targetFolderName)
        if (!targetDef) return

        if (
          targetDef.subfolders?.some(
            (sf) => sf.name.toLowerCase() === subfolderName.toLowerCase(),
          )
        ) {
          toastify.error(
            `Target folder "${targetFolderName}" already contains sub-folder "${subfolderName}".`,
          )
          return
        }

        const srcFolderDef = folders.find((f) => f.name === sourceFolder)
        const srcSubDef = findSubfolderInTree(
          srcFolderDef?.subfolders || [],
          (sf) =>
            rawSubId != null
              ? Number(sf.sub_folder_id ?? sf.id) === Number(rawSubId)
              : sf.name === subfolderName,
        )
        const subFolderId = Number(
          rawSubId || srcSubDef?.sub_folder_id || srcSubDef?.id,
        )
        const destinationFolderId = Number(targetDef.id)

        if (subFolderId && destinationFolderId) {
          const preview = await fetchMoveSubfolderPreview(
            subFolderId,
            destinationFolderId,
          )
          if (preview) {
            setMoveTarget({
              subfolderName: preview.sub_folder_name || subfolderName,
              sourceFolder,
              targetFolder: targetFolderName,
              docCount: preview.affected_documents_count,
              subFolderId: preview.sub_folder_id,
              destinationFolderId: preview.destination_folder_id,
              destinationFolderName: preview.destination_folder_name,
            })
            return
          }
        }

        const docCount = documents.filter(
          (d) => d.folder === sourceFolder && d.subfolder === subfolderName,
        ).length

        setMoveTarget({
          subfolderName,
          sourceFolder,
          targetFolder: targetFolderName,
          docCount,
          subFolderId: subFolderId || undefined,
          destinationFolderId: destinationFolderId || undefined,
          destinationFolderName: targetFolderName,
        })
        return
      }
    } catch (err) {
      console.error("Subfolder drop error", err)
    }
  }

  const handleSubSubfolderDragOver = (
    e: React.DragEvent,
    folderName: string,
    subfolderName: string,
    subSubfolderName: string,
  ) => {
    if (!canMoveFiles) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"
    const key = `${folderName}:::${subfolderName}:::${subSubfolderName}`
    if (dragOverSubSubfolder !== key) {
      setDragOverSubSubfolder(key)
    }
  }

  const handleSubSubfolderDragLeave = (
    folderName: string,
    subfolderName: string,
    subSubfolderName: string,
  ) => {
    const key = `${folderName}:::${subfolderName}:::${subSubfolderName}`
    if (dragOverSubSubfolder === key) {
      setDragOverSubSubfolder(null)
    }
  }

  const handleSubSubfolderDrop = (
    e: React.DragEvent,
    targetFolderName: string,
    targetSubfolderName: string,
    targetSubSubfolderName: string,
  ) => {
    if (!canMoveFiles) return
    e.preventDefault()
    e.stopPropagation()
    setDragOverSubSubfolder(null)
    setDragOverSubfolder(null)
    setDragOverFolder(null)

    try {
      const raw = e.dataTransfer.getData("application/json")
      if (!raw) return
      const data = JSON.parse(raw)

      if (data.type === "document" || data.documentId) {
        const doc = documents.find((d) => d.id === data.documentId)
        if (!doc) return

        setMoveDocTarget({
          document: doc,
          targetFolder: targetFolderName,
          targetSubfolder: targetSubfolderName,
          targetSubSubfolder: targetSubSubfolderName,
        })
      }
    } catch (err) {
      console.error("Sub-subfolder drop error", err)
    }
  }

  const handleConfirmMoveDocument = async (
    documentId: string,
    targetFolder: string,
    targetSubfolder?: string | undefined,
    targetSubSubfolder?: string | undefined,
  ) => {
    // Validate target location against authorized folders
    const authorized = authorizedFolders.find((f) => f.name === targetFolder)
    if (!authorized) {
      setToast(
        "You do not have permission to move documents to this folder.",
        "error",
      )
      return
    }
    if (targetSubfolder) {
      const authorizedSub = authorized.subfolders?.find(
        (sf) => sf.name === targetSubfolder,
      )
      if (!authorizedSub) {
        setToast(
          "You do not have permission to move documents to this sub-folder.",
          "error",
        )
        return
      }
    }

    try {
      const doc = documents.find((d) => d.id === documentId)
      if (!doc) return

      const targetFolderDef = folders.find((f) => f.name === targetFolder)
      const targetSubDef = targetFolderDef?.subfolders?.find(
        (sf) => sf.name === targetSubfolder,
      )
      const targetSubSubDef = targetSubDef?.subfolders?.find(
        (ssf) => ssf.name === targetSubSubfolder,
      )

      await api.put(`/dms-document/update/${documentId}`, {
        target_folder: targetFolder,
        folder_id: targetFolderDef
          ? Number(targetFolderDef.id || targetFolderDef.number)
          : 0,
        sub_folder_id: targetSubDef
          ? Number(targetSubDef.id || targetSubDef.sub_folder_id)
          : 0,
        sub_sub_folder_id: targetSubSubDef
          ? Number(targetSubSubDef.id || 0)
          : 0,
        updated_by: getLoggedInUserId(),
      })

      setDocuments((prev) => {
        const next = prev.map((d) => {
          if (d.id === documentId) {
            const categoryPath = targetSubSubfolder
              ? `${targetFolder} / ${targetSubfolder} / ${targetSubSubfolder}`
              : targetSubfolder
                ? `${targetFolder} / ${targetSubfolder}`
                : targetFolder

            return {
              ...d,
              folder: targetFolder,
              subfolder: targetSubfolder || undefined,
              subSubfolder: targetSubSubfolder || undefined,
              category: categoryPath,
              updated: formatNow(),
            }
          }
          return d
        })

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              "pmhbl_workspace_documents",
              JSON.stringify(next),
            )
          } catch (e) {
            // ignore
          }
        }
        return next
      })

      const destName = targetSubSubfolder
        ? `${targetFolder} / ${targetSubfolder} / ${targetSubSubfolder}`
        : targetSubfolder
          ? `${targetFolder} / ${targetSubfolder}`
          : targetFolder
      setToast(`Document "${doc.number}" moved to "${destName}".`)
      setMoveDocTarget(null)
    } catch (error) {
      console.error("Failed to move document:", error)
      setToast("Failed to move document.")
    }
  }

  const handleConfirmMove = async (
    targetFolderOverride?: string,
    parentSubFolderId?: number | null,
  ) => {
    if (confirmingMoveRef.current) return
    if (!moveTarget) return

    confirmingMoveRef.current = true

    try {
      if (role !== "Admin") {
        toastify.error(
          "Only System Administrators can move folders and sub-folders.",
        )
        setMoveTarget(null)
        return
      }

      const { sourceFolder, subfolderName } = moveTarget
      const targetFolder = targetFolderOverride || moveTarget.targetFolder
      const resolvedParentSubFolderId =
        parentSubFolderId === undefined
          ? (moveTarget.destinationParentSubFolderId ?? null)
          : parentSubFolderId

      if (!targetFolder) {
        toastify.error("Please select a destination.")
        return
      }

      const sourceFolderDef = folders.find(
        (folder) => folder.name === sourceFolder,
      )
      const targetFolderDef = folders.find(
        (folder) => folder.name === targetFolder,
      )

      if (!sourceFolderDef || !targetFolderDef) {
        toastify.error("Folder not found.")
        return
      }

      const requestedSubfolderId = Number(moveTarget.subFolderId || 0)
      const subfolderToMove = findSubfolderInTree(
        sourceFolderDef.subfolders || [],
        (subfolder) =>
          requestedSubfolderId > 0
            ? Number(subfolder.sub_folder_id ?? subfolder.id) ===
              requestedSubfolderId
            : subfolder.name === subfolderName,
      )
      const subFolderId = Number(
        moveTarget.subFolderId ||
          subfolderToMove?.sub_folder_id ||
          subfolderToMove?.id,
      )
      const destinationFolderId = Number(
        targetFolderDef.id || targetFolderDef.number,
      )

      if (!subFolderId || !destinationFolderId || !subfolderToMove) {
        toastify.error("Invalid sub-folder or destination folder ID.")
        return
      }

      if (resolvedParentSubFolderId != null) {
        const destinationParent = findSubfolderInTree(
          targetFolderDef.subfolders || [],
          (subfolder) =>
            Number(subfolder.sub_folder_id ?? subfolder.id) ===
            Number(resolvedParentSubFolderId),
        )
        if (!destinationParent) {
          toastify.error(
            "The selected destination subfolder was not found in the destination folder.",
          )
          return
        }

        // Guard against moving a subfolder into itself or one of its descendants.
        const descendantIds = new Set<number>()
        const collectDescendants = (node: any) => {
          const id = Number(node?.sub_folder_id ?? node?.id)
          if (Number.isFinite(id) && id > 0) descendantIds.add(id)
          ;(node?.subfolders || []).forEach(collectDescendants)
        }
        collectDescendants(subfolderToMove)
        if (descendantIds.has(Number(resolvedParentSubFolderId))) {
          toastify.error(
            "A subfolder cannot be moved into itself or one of its descendants.",
          )
          return
        }
      }

      const currentParentId =
        subfolderToMove.parent_sub_folder_id == null
          ? null
          : Number(subfolderToMove.parent_sub_folder_id)
      if (
        Number(sourceFolderDef.id || sourceFolderDef.number) ===
          destinationFolderId &&
        currentParentId === resolvedParentSubFolderId
      ) {
        toastify.error("The selected destination is the current location.")
        return
      }

      const success = await moveSubfolder(
        subFolderId,
        destinationFolderId,
        getLoggedInUserId() || 114,
        resolvedParentSubFolderId,
      )

      if (!success) return

      await fetchFolders()

      if (
        selectedFolder === sourceFolder &&
        selectedSubfolder === subfolderName
      ) {
        setSelectedFolder(targetFolder)
        setActiveFolder(
          resolvedParentSubFolderId != null
            ? `${targetFolder} / ${subfolderName}`
            : `${targetFolder} / ${subfolderName}`,
        )
      }
      setExpandedFolders((prev) => ({ ...prev, [targetFolder]: true }))
      setMoveTarget(null)
    } finally {
      confirmingMoveRef.current = false
    }
  }

  const handleConfirmMoveSubSubfolder = async (
    subFolderId: number,
    destinationFolderId: number,
    parentSubFolderId: number | null,
  ) => {
    if (confirmingMoveRef.current) return
    if (!moveSubSubTarget) return

    confirmingMoveRef.current = true

    try {
      if (role !== "Admin") {
        toastify.error(
          "Only System Administrators can move subfolders.",
        )
        setMoveSubSubTarget(null)
        return
      }

      if (
        !Number.isFinite(subFolderId) ||
        subFolderId <= 0 ||
        !Number.isFinite(destinationFolderId) ||
        destinationFolderId <= 0
      ) {
        toastify.error("Invalid source subfolder or destination folder.")
        return
      }

      const { sourceFolder, subSubfolderName } = moveSubSubTarget

      const sourceFolderDef = folders.find(
        (folder) => folder.name === sourceFolder,
      )

      const destinationFolderDef = folders.find(
        (folder) =>
          Number(folder.id ?? folder.number) === destinationFolderId,
      )

      if (!sourceFolderDef || !destinationFolderDef) {
        toastify.error("Source or destination folder could not be found.")
        return
      }

      const sourceNode = findSubfolderInTree(
        sourceFolderDef.subfolders || [],
        (node) =>
          Number(node.sub_folder_id ?? node.id) === subFolderId,
      )

      if (!sourceNode) {
        toastify.error("The source subfolder could not be found.")
        return
      }

      if (parentSubFolderId != null) {
        const destinationParent = findSubfolderInTree(
          destinationFolderDef.subfolders || [],
          (node) =>
            Number(node.sub_folder_id ?? node.id) === parentSubFolderId,
        )

        if (!destinationParent) {
          toastify.error("The selected destination subfolder could not be found.")
          return
        }

        const descendantIds = new Set<number>()

        const collectDescendants = (node: any) => {
          const id = Number(node.sub_folder_id ?? node.id)

          if (Number.isFinite(id) && id > 0) {
            descendantIds.add(id)
          }

          ;(node.subfolders || []).forEach(collectDescendants)
        }

        collectDescendants(sourceNode)

        if (descendantIds.has(parentSubFolderId)) {
          toastify.error(
            "A subfolder cannot be moved into itself or one of its descendants.",
          )
          return
        }
      }

      const currentParentId =
        sourceNode.parent_sub_folder_id == null
          ? null
          : Number(sourceNode.parent_sub_folder_id)

      if (
        Number(sourceFolderDef.id ?? sourceFolderDef.number) ===
          destinationFolderId &&
        currentParentId === parentSubFolderId
      ) {
        toastify.error("The selected destination is the current location.")
        return
      }

      const success = await moveSubfolder(
        subFolderId,
        destinationFolderId,
        getLoggedInUserId() || 114,
        parentSubFolderId,
      )

      if (!success) return

      await fetchFolders()

      setExpandedFolders((previous) => ({
        ...previous,
        [destinationFolderDef.name]: true,
      }))

      setToast(
        `Subfolder "${subSubfolderName}" moved successfully.`,
        "success",
      )

      setMoveSubSubTarget(null)
    } finally {
      confirmingMoveRef.current = false
    }
  }

  return {
    moveTarget,
    setMoveTarget,
    moveSubSubTarget,
    setMoveSubSubTarget,
    moveDocTarget,
    setMoveDocTarget,
    dragOverFolder,
    setDragOverFolder,
    dragOverSubfolder,
    setDragOverSubfolder,
    dragOverSubSubfolder,
    setDragOverSubSubfolder,
    handleDocumentDragStart,
    fetchMoveSubfolderPreview,
    moveSubfolder,
    handleSubfolderDragStart,
    handleSubSubfolderDragStart,
    handleFolderDragOver,
    handleFolderDragLeave,
    handleFolderDrop,
    handleSubfolderDragOver,
    handleSubfolderDragLeave,
    handleSubfolderDrop,
    handleSubSubfolderDragOver,
    handleSubSubfolderDragLeave,
    handleSubSubfolderDrop,
    handleConfirmMoveDocument,
    handleConfirmMove,
    handleConfirmMoveSubSubfolder,
  }
}
