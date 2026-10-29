import React from "react";
import type {
  Role,
  DocumentRecord,
  FolderDefinition,
  Publisher,
  EngineerGroup,
  EngineerUser,
  AccessRequest,
  DmsGroupDropdownItem,
  MainTab,
} from "../types";
import { AddDocumentModal } from "../Documents/AddDocumentModal";
import axiosInstance from "@/api/axiosInstance";
import {
  DocSpecificationsModal,
  DocAccessModal,
  DocVersionsModal,
} from "./DocumentDetailModals";
import {
  CreatePublisherModal,
} from "../PublisherPermissions/CreatePublisherModal";
import {
  ManageFolderPublishersModal,
} from "../PublisherPermissions/ManageFolderPublishersModal";
import {
  ManageSubfolderPublishersModal,
} from "../PublisherPermissions/ManageSubfolderPublishersModal";
import { CreateGroupModal } from "../CreateGroup/CreateGroupModal";
import { DeleteGroupConfirmationModal } from "../EngineerGroups/DeleteGroupConfirmationModal";
import { DeletePublisherConfirmationModal } from "../PublisherPermissions/DeletePublisherConfirmationModal";
import {
  CreateFolderModal,
  CreateSubfolderModal,
  CreateSubSubfolderModal,
  RenameModal,
  EditDescriptionModal,
  BlockedDeleteModal,
  ConfirmDeleteModal,
  ConfirmMoveModal,
  ConfirmMoveSubSubfolderModal,
  ConfirmMoveDocumentModal,
} from "./FolderActionModals";
import { AuthorizeAccessModal } from "../AccessRequests/AuthorizeAccessModal";
import { RequestAccessModal } from "../AccessRequests/RequestAccessModal";
import { FileActionContextMenu } from "../Documents/FileActionContextMenu";
import {
  TrashConfirmDeleteModal,
  PermanentDeleteModal,
  EmptyTrashModal,
} from "./TrashModals";

export function DmsWorkspaceModals({
  role,
  folders,
  authorizedFolders,
  activeMainTab,
  documents,
  setDocuments,
  publishers,
  engineerGroups,
  selected,
  setSelectedId,
  showAdd,
  setShowAdd,
  addDocPrefill,
  setAddDocPrefill,
  showDocInfoModal,
  setShowDocInfoModal,
  showAccess,
  setShowAccess,
  showVersions,
  setShowVersions,
  showCreatePublisherModal,
  setShowCreatePublisherModal,
  editingPublisher,
  setEditingPublisher,
  publisherToDelete,
  setPublisherToDelete,
  handleDeletePublisher,
  handleSavePublisher,
  publisherDropdown = [],
  showCreateGroupModal,
  setShowCreateGroupModal,
  editingGroup,
  setEditingGroup,
  handleSaveGroup,
  engineersList,
  groupToDelete,
  setGroupToDelete,
  handleDeleteGroup,
  selectedFolderForPublishers,
  setSelectedFolderForPublishers,
  handleUpdateFolderPublishers,
  selectedSubfolderForPublishers,
  setSelectedSubfolderForPublishers,
  handleUpdateSubfolderPublishers,
  showCreateFolderModal,
  setShowCreateFolderModal,
  handleCreateFolder,
  createSubfolderForFolder,
  setCreateSubfolderForFolder,
  handleCreateSubfolder,
  createSubSubfolderFor,
  setCreateSubSubfolderFor,
  handleCreateSubSubfolder,
  renameTarget,
  setRenameTarget,
  handleConfirmRename,
  descriptionTarget,
  setDescriptionTarget,
  handleConfirmDescriptionUpdate,
  deleteTarget,
  setDeleteTarget,
  handleConfirmDelete,
  moveTarget,
  setMoveTarget,
  handleConfirmMove,
  fetchMoveSubfolderPreview,
  moveSubSubTarget,
  setMoveSubSubTarget,
  handleConfirmMoveSubSubfolder,
  moveDocTarget,
  setMoveDocTarget,
  handleConfirmMoveDocument,
  grantModalRequest,
  setGrantModalRequest,
  grantIsLifetime,
  setGrantIsLifetime,
  grantFromDate,
  setGrantFromDate,
  grantToDate,
  setGrantToDate,
  grantRemarks,
  setGrantRemarks,
  handleConfirmGrantAccess,
  showRequestAccessModalFor,
  setShowRequestAccessModalFor,
  userRequestReason,
  setUserRequestReason,
  handleUserSubmitRequest,
  fileActionMenu,
  setFileActionMenu,
  handleOpenFilePreview,
  handleDownloadDocument,
  setToast,
  documentToDelete,
  setDocumentToDelete,
  handleMoveToTrash,
  permanentDeleteTarget,
  setPermanentDeleteTarget,
  handlePermanentDelete,
  showEmptyTrashModal,
  setShowEmptyTrashModal,
  deletedDocsCount,
  handleEmptyTrash,
  notify,
  updateSelected,
  handleUnarchiveDocument,
  onSummarizeDocument,
}: {
  role: Role;
  folders: FolderDefinition[];
  authorizedFolders: FolderDefinition[];
  activeMainTab: MainTab;
  documents: DocumentRecord[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentRecord[]>>;
  publishers: Publisher[];
  engineerGroups: EngineerGroup[];
  selected: DocumentRecord | null;
  setSelectedId: (id: string | null) => void;
  showAdd: boolean;
  setShowAdd: (show: boolean) => void;
  addDocPrefill: any;
  setAddDocPrefill: (prefill: any) => void;
  showDocInfoModal: boolean;
  setShowDocInfoModal: (show: boolean) => void;
  showAccess: boolean;
  setShowAccess: (show: boolean) => void;
  showVersions: boolean;
  setShowVersions: (show: boolean) => void;
  showCreatePublisherModal: boolean;
  setShowCreatePublisherModal: (show: boolean) => void;
  editingPublisher: Publisher | null;
  setEditingPublisher: (pub: Publisher | null) => void;
  publisherToDelete?: Publisher | null;
  setPublisherToDelete?: (pub: Publisher | null) => void;
  handleDeletePublisher?: (id: string) => void;
  handleSavePublisher: (pub: Publisher) => void;
  publisherDropdown?: DmsGroupDropdownItem[];
  showCreateGroupModal: boolean;
  setShowCreateGroupModal: (show: boolean) => void;
  editingGroup: EngineerGroup | null;
  setEditingGroup: (group: EngineerGroup | null) => void;
  handleSaveGroup: (data: any) => void;
  engineersList: EngineerUser[];
  groupToDelete: EngineerGroup | null;
  setGroupToDelete: (group: EngineerGroup | null) => void;
  handleDeleteGroup: (id: string) => void;
  selectedFolderForPublishers: FolderDefinition | null;
  setSelectedFolderForPublishers: (folder: FolderDefinition | null) => void;
  handleUpdateFolderPublishers: (folderName: string, assignments: any) => void;
  selectedSubfolderForPublishers: {
    folder: FolderDefinition;
    subfolderName: string;
    subfolderId?: number;
    subfolderPath?: string[];
  } | null;
  setSelectedSubfolderForPublishers: (val: any) => void;
  handleUpdateSubfolderPublishers: (
    folderName: string,
    subfolderName: string,
    ids: string[],
    subfolderId?: number,
    subfolderPath?: string[],
  ) => void;
  showCreateFolderModal: boolean;
  setShowCreateFolderModal: (show: boolean) => void;
  handleCreateFolder: (name: string, description: string, iconKey: string) => void;
  createSubfolderForFolder: string | null;
  setCreateSubfolderForFolder: (folder: string | null) => void;
  handleCreateSubfolder: (parentFolderName: string, name: string, description: string, letter?: string) => void;
  createSubSubfolderFor: { parentFolder: string; parentSubfolder: string } | null;
  setCreateSubSubfolderFor: (val: { parentFolder: string; parentSubfolder: string } | null) => void;
  handleCreateSubSubfolder: (parentFolderName: string, parentSubfolderName: string, name: string, description: string, numberCode?: string) => void;
  renameTarget: any;
  setRenameTarget: (val: any) => void;
  handleConfirmRename: (newName: string) => void;
  descriptionTarget?: any;
  setDescriptionTarget?: (val: any) => void;
  handleConfirmDescriptionUpdate?: (description: string) => void | Promise<void>;
  deleteTarget: any;
  setDeleteTarget: (val: any) => void;
  handleConfirmDelete: () => void;
  moveTarget: any;
  setMoveTarget: (val: any) => void;
  handleConfirmMove: (targetFolder?: string) => void;
  fetchMoveSubfolderPreview?: (
    subFolderId: number,
    destinationFolderId: number,
    parentSubFolderId?: number | null,
  ) => Promise<any>;
  moveSubSubTarget: any;
  setMoveSubSubTarget: (val: any) => void;
  handleConfirmMoveSubSubfolder: (
    subFolderId: number,
    destinationFolderId: number,
    parentSubFolderId: number | null,
  ) => Promise<void>;
  moveDocTarget: any;
  setMoveDocTarget: (val: any) => void;
  handleConfirmMoveDocument: (docId: string, tf: string, ts: string, tss?: string) => void;
  grantModalRequest: AccessRequest | null;
  setGrantModalRequest: (req: AccessRequest | null) => void;
  grantIsLifetime: boolean;
  setGrantIsLifetime: (isLifetime: boolean) => void;
  grantFromDate: string;
  setGrantFromDate: (date: string) => void;
  grantToDate: string;
  setGrantToDate: (date: string) => void;
  grantRemarks: string;
  setGrantRemarks: (remarks: string) => void;
  handleConfirmGrantAccess: () => void;
  showRequestAccessModalFor: DocumentRecord | null;
  setShowRequestAccessModalFor: (doc: DocumentRecord | null) => void;
  userRequestReason: string;
  setUserRequestReason: (reason: string) => void;
  handleUserSubmitRequest: (e: React.FormEvent) => void;
  fileActionMenu: any;
  setFileActionMenu: (menu: any) => void;
  handleOpenFilePreview: (doc: DocumentRecord) => void;
  handleDownloadDocument: (doc: DocumentRecord) => void;
  setToast: (msg: string) => void;
  documentToDelete: DocumentRecord | null;
  setDocumentToDelete: (doc: DocumentRecord | null) => void;
  handleMoveToTrash: (doc: DocumentRecord) => void;
  permanentDeleteTarget: DocumentRecord | null;
  setPermanentDeleteTarget: (doc: DocumentRecord | null) => void;
  handlePermanentDelete: (id: string) => void;
  showEmptyTrashModal: boolean;
  setShowEmptyTrashModal: (show: boolean) => void;
  deletedDocsCount: number;
  handleEmptyTrash: () => void;
  notify: (msg: string) => void;
  updateSelected: (patch: Partial<DocumentRecord>) => void;
  handleUnarchiveDocument?: (docId: string) => Promise<void>;
  onSummarizeDocument?: (doc: DocumentRecord) => void;
}) {
  return (
    <>
      {showAdd && (role === "Admin" || role === "Publisher") && (
        <AddDocumentModal
          key={
            addDocPrefill?.prefillDoc
              ? `edit-document-${addDocPrefill.prefillDoc.id}`
              : "empty-doc-modal"
          }
          folders={folders}
          publishers={publishers}
          publisherId={(() => {
            try {
              const raw = typeof window !== "undefined" ? localStorage.getItem("userData") : null;
              if (!raw) return undefined;
              const parsed = JSON.parse(raw);
              if (parsed?.publisher_id) return parsed.publisher_id;
              const uid = parsed?.user_id ?? parsed?.userId ?? parsed?.id;
              if (uid) {
                const p = publishers?.find((pub: any) => pub.publisherUserId === Number(uid) || pub.publisher_user_id === Number(uid));
                return p?.id ?? (p as any)?.publisher_id;
              }
            } catch (e) {}
            return undefined;
          })()}
          publisherName={role === "Publisher" ? "A. Menon" : "A. Menon"}
          engineerGroups={engineerGroups}
          prefillDoc={addDocPrefill?.prefillDoc}
          defaultFolder={addDocPrefill?.targetFolder}
          defaultSubfolder={addDocPrefill?.targetSubfolder}
          defaultSubSubfolder={addDocPrefill?.targetSubSubfolder}
          onClose={() => {
            setShowAdd(false);
            setAddDocPrefill(null);
          }}
          existingCount={documents.length}
          onAdd={(newDoc) => {
            setDocuments((prev) => [newDoc, ...prev]);
            setSelectedId(newDoc.id);
            setShowAdd(false);
            setAddDocPrefill(null);
            notify(`Document ${newDoc.number} registered in controlled index`);
          }}
        />
      )}
      {showDocInfoModal && selected && (
        <DocSpecificationsModal
          selected={selected}
          onClose={() => setShowDocInfoModal(false)}
          onOpenAccess={() => setShowAccess(true)}
          onOpenVersions={() => setShowVersions(true)}
          onOpenFile={() => notify("Opening controlled file viewer")}
        />
      )}
      {showAccess && selected && (
        <DocAccessModal
          selected={selected}
          onClose={() => setShowAccess(false)}
          onGrantUser={(user) => {
            updateSelected({ access: [...selected.access, user] });
            setShowAccess(false);
            notify("Access granted and logged");
          }}
        />
      )}
      {(selected ?? documents[0]) && showVersions && (
        <DocVersionsModal
          doc={selected ?? documents[0]!}
          onClose={() => setShowVersions(false)}
          onOpenFile={(historyId, isCurrent) => {
            if (isCurrent) {
              notify(`Opening current file`);
            } else {
              notify(`Opening revision file (ID: ${historyId})`);
              // Implement API call: axiosInstance.get(`/dms-document/download-revision/${historyId}`)
            }
          }}
          onDownloadFile={(historyId, isCurrent) => {
            if (isCurrent) {
              notify(`Downloading current file`);
            } else {
              notify(`Downloading revision file (ID: ${historyId})`);
              // Implement API call: axiosInstance.get(`/dms-document/download-revision/${historyId}`)
            }
          }}
        />
      )}
      {/* Admin: Create / Edit Publisher Modal */}
      {showCreatePublisherModal && (
        <CreatePublisherModal
          publisher={editingPublisher}
          folders={folders}
          publisherDropdown={publisherDropdown}
          onClose={() => {
            setShowCreatePublisherModal(false);
            setEditingPublisher(null);
          }}
          onSave={handleSavePublisher}
        />
      )}
      {/* Admin: Delete Publisher Confirmation Modal */}
      {publisherToDelete && (
        <DeletePublisherConfirmationModal
          publisher={publisherToDelete}
          onClose={() => setPublisherToDelete?.(null)}
          onConfirm={() => {
            if (handleDeletePublisher) {
              handleDeletePublisher(publisherToDelete.id);
            }
          }}
        />
      )}
      {/* Admin: Create / Edit Group Modal */}
      {showCreateGroupModal && (
        <CreateGroupModal
          group={editingGroup}
          engineers={engineersList}
          onClose={() => {
            setShowCreateGroupModal(false);
            setEditingGroup(null);
          }}
          onSave={handleSaveGroup}
        />
      )}
      {/* Admin: Delete Group Confirmation Modal */}
      {groupToDelete && (
        <DeleteGroupConfirmationModal
          group={groupToDelete}
          onClose={() => setGroupToDelete(null)}
          onConfirm={() => handleDeleteGroup(groupToDelete.id)}
        />
      )}
      {/* Admin: Manage Folder Publishers Modal */}
      {selectedFolderForPublishers && (
        <ManageFolderPublishersModal
          folder={selectedFolderForPublishers}
          publishers={publishers}
          onClose={() => setSelectedFolderForPublishers(null)}
          onSave={(assignments) => {
            handleUpdateFolderPublishers(selectedFolderForPublishers.name, assignments);
            setSelectedFolderForPublishers(null);
          }}
          onCreateNewPublisher={() => {
            setEditingPublisher(null);
            setShowCreatePublisherModal(true);
          }}
        />
      )}
      {/* Admin: Manage Subfolder Publishers Modal */}
      {selectedSubfolderForPublishers && (
        <ManageSubfolderPublishersModal
          folder={selectedSubfolderForPublishers.folder}
          subfolderName={selectedSubfolderForPublishers.subfolderName}
          subfolderId={selectedSubfolderForPublishers.subfolderId}
          subfolderPath={selectedSubfolderForPublishers.subfolderPath}
          publishers={publishers}
          onClose={() => setSelectedSubfolderForPublishers(null)}
          onSave={(assignedPublisherIds) => {
            handleUpdateSubfolderPublishers(
              selectedSubfolderForPublishers.folder.name,
              selectedSubfolderForPublishers.subfolderName,
              assignedPublisherIds,
              selectedSubfolderForPublishers.subfolderId,
              selectedSubfolderForPublishers.subfolderPath,
            );
            setSelectedSubfolderForPublishers(null);
          }}
          onCreateNewPublisher={() => {
            setEditingPublisher(null);
            setShowCreatePublisherModal(true);
          }}
        />
      )}
      {/* Admin Folder & Sub-Folder Modals */}
      {showCreateFolderModal && (
        <CreateFolderModal
          onClose={() => setShowCreateFolderModal(false)}
          onCreate={handleCreateFolder}
        />
      )}
      {createSubfolderForFolder && (
        <CreateSubfolderModal
          parentFolder={createSubfolderForFolder}
          folders={folders}
          onClose={() => setCreateSubfolderForFolder(null)}
          onCreate={handleCreateSubfolder}
        />
      )}
      {createSubSubfolderFor && (
        <CreateSubSubfolderModal
          parentFolder={createSubSubfolderFor.parentFolder}
          parentSubfolder={createSubSubfolderFor.parentSubfolder}
          folders={folders}
          onClose={() => setCreateSubSubfolderFor(null)}
          onCreate={handleCreateSubSubfolder}
        />
      )}
      {renameTarget && (
        <RenameModal
          type={renameTarget.type}
          currentName={renameTarget.currentName}
          parentFolder={renameTarget.parentFolder}
          parentSubfolder={renameTarget.parentSubfolder}
          docCount={
            renameTarget.type === "folder"
              ? documents.filter((d) => d.folder === renameTarget.currentName).length
              : renameTarget.type === "subfolder"
                ? documents.filter(
                    (d) =>
                      d.folder === renameTarget.parentFolder &&
                      d.subfolder === renameTarget.currentName,
                  ).length
                : documents.filter(
                    (d) =>
                      d.folder === renameTarget.parentFolder &&
                      d.subfolder === renameTarget.parentSubfolder &&
                      d.subSubfolder === renameTarget.currentName,
                  ).length
          }
          onClose={() => setRenameTarget(null)}
          onConfirm={handleConfirmRename}
        />
      )}
      {descriptionTarget && handleConfirmDescriptionUpdate && (
        <EditDescriptionModal
          type={descriptionTarget.type}
          currentName={descriptionTarget.currentName}
          parentFolder={descriptionTarget.parentFolder}
          currentDescription={descriptionTarget.currentDescription}
          onClose={() => setDescriptionTarget?.(null)}
          onConfirm={handleConfirmDescriptionUpdate}
        />
      )}
      {deleteTarget && deleteTarget.docCount > 0 && (
        <BlockedDeleteModal
          type={deleteTarget.type}
          name={deleteTarget.name}
          parentFolder={deleteTarget.parentFolder}
          parentSubfolder={deleteTarget.parentSubfolder}
          docCount={deleteTarget.docCount}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {deleteTarget && deleteTarget.docCount === 0 && (
        <ConfirmDeleteModal
          type={deleteTarget.type}
          name={deleteTarget.name}
          parentFolder={deleteTarget.parentFolder}
          parentSubfolder={deleteTarget.parentSubfolder}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
      {moveTarget && (
        <ConfirmMoveModal
          subfolderName={moveTarget.subfolderName}
          sourceFolder={moveTarget.sourceFolder}
          initialTargetFolder={moveTarget.targetFolder}
          folders={folders}
          docCount={moveTarget.docCount}
          subFolderId={moveTarget.subFolderId}
          fetchPreview={fetchMoveSubfolderPreview}
          onClose={() => setMoveTarget(null)}
          onConfirm={(targetFolder) => handleConfirmMove(targetFolder)}
        />
      )}
      {moveSubSubTarget && (
        <ConfirmMoveSubSubfolderModal
          subSubfolderName={moveSubSubTarget.subSubfolderName}
          sourceFolder={moveSubSubTarget.sourceFolder}
          sourceSubfolder={moveSubSubTarget.sourceSubfolder}
          subFolderId={moveSubSubTarget.subFolderId}
          initialTargetFolder={moveSubSubTarget.targetFolder}
          initialTargetSubfolder={moveSubSubTarget.targetSubfolder}
          folders={folders}
          docCount={moveSubSubTarget.docCount}
          fetchPreview={fetchMoveSubfolderPreview}
          onClose={() => setMoveSubSubTarget(null)}
          onConfirm={(subFolderId, destinationFolderId, parentSubFolderId) =>
            handleConfirmMoveSubSubfolder(
              subFolderId,
              destinationFolderId,
              parentSubFolderId,
            )
          }
        />
      )}
      {moveDocTarget && (
        <ConfirmMoveDocumentModal
          document={moveDocTarget.document}
          folders={authorizedFolders}
          initialTargetFolder={moveDocTarget.targetFolder}
          initialTargetSubfolder={moveDocTarget.targetSubfolder}
          initialTargetSubSubfolder={moveDocTarget.targetSubSubfolder}
          onClose={() => setMoveDocTarget(null)}
          onConfirm={(docId, tf, ts, tss) => handleConfirmMoveDocument(docId, tf, ts || "", tss)}
        />
      )}
      {/* Publisher: Grant Timed or Lifetime Access Modal */}
      {grantModalRequest && (
        <AuthorizeAccessModal
          request={grantModalRequest}
          isLifetime={grantIsLifetime}
          fromDate={grantFromDate}
          toDate={grantToDate}
          remarks={grantRemarks}
          onIsLifetimeChange={setGrantIsLifetime}
          onFromDateChange={setGrantFromDate}
          onToDateChange={setGrantToDate}
          onRemarksChange={setGrantRemarks}
          onClose={() => setGrantModalRequest(null)}
          onConfirm={handleConfirmGrantAccess}
        />
      )}
      {/* User: Request Document Access Modal */}
      {showRequestAccessModalFor && (
        <RequestAccessModal
          document={showRequestAccessModalFor}
          reason={userRequestReason}
          onReasonChange={setUserRequestReason}
          onClose={() => setShowRequestAccessModalFor(null)}
          onSubmit={handleUserSubmitRequest}
        />
      )}
      {/* Universal File Action Menu */}
      <FileActionContextMenu
        fileActionMenu={fileActionMenu}
        activeMainTab={activeMainTab}
        role={role}
        onClose={() => setFileActionMenu(null)}
        onOpenPreview={(doc) => handleOpenFilePreview(doc)}
        onSummarizeDocument={onSummarizeDocument}
        onShowInfo={(doc) => {
          setSelectedId(doc.id);
          setShowDocInfoModal(true);
        }}
        onShowVersions={(doc) => {
          setSelectedId(doc.id);
          setShowVersions(true);
        }}
        onDownload={(doc) => handleDownloadDocument(doc)}
        onCopyNumber={(num) => setToast(`Copied ${num} to clipboard`)}
        onEditDocument={(doc) => {
          setAddDocPrefill({
            targetFolder: doc.folder || folders[0]?.name || "",
            targetSubfolder: doc.subfolder || "",
            targetSubSubfolder: doc.subSubfolder || "",
            prefillDoc: doc,
          });
          setShowAdd(true);
        }}
        onMoveDocument={(doc) => {
          setMoveDocTarget({
            document: doc,
            targetFolder: doc.folder || folders[0]?.name || "",
            targetSubfolder: doc.subfolder || "",
          });
        }}
        onToggleArchive={async (doc) => {
          if (doc.status === "Archived" || (doc.status as string) === "ARCHIVED") {
            if (handleUnarchiveDocument) {
              await handleUnarchiveDocument(doc.id);
            }
          } else {
            try {
              const nextStatus = "ARCHIVED";
              
              let userId = 114;
              const raw = typeof window !== "undefined" ? localStorage.getItem("userData") : null;
              if (raw) {
                const parsed = JSON.parse(raw);
                const uid = parsed?.user_id ?? parsed?.userId ?? parsed?.id;
                if (uid) userId = Number(uid);
              }

              await axiosInstance.patch(
                `/dms-document/status-update/${doc.id}`,
                null,
                {
                  params: {
                    status: nextStatus,
                    updated_by: userId,
                  },
                }
              );

            // update local state
            const displayStatus = "Archived";
            setDocuments((current) =>
              current.map((d) =>
                d.id === doc.id
                  ? {
                      ...d,
                      status: displayStatus as any,
                      archived: new Date().toISOString(),
                      updated: new Date().toISOString(),
                    }
                  : d,
              ),
            );
            notify(`Document ${doc.number} moved to Archive`);
          } catch (error) {
            console.error("Failed to update document status:", error);
            setToast("Failed to update document status.");
          }
        }
      }}
        onDeleteDocument={(doc) => setDocumentToDelete(doc)}
      />

      {/* Delete Confirmation Modal (Moves Document to Trash) */}
      {documentToDelete && (
        <TrashConfirmDeleteModal
          documentToDelete={documentToDelete}
          onClose={() => setDocumentToDelete(null)}
          onConfirmMoveToTrash={(doc) => handleMoveToTrash(doc)}
        />
      )}

      {/* Admin Permanent Delete Modal */}
      {permanentDeleteTarget && (
        <PermanentDeleteModal
          permanentDeleteTarget={permanentDeleteTarget}
          onClose={() => setPermanentDeleteTarget(null)}
          onConfirmPermanentDelete={(id) => handlePermanentDelete(id)}
        />
      )}

      {/* Admin Empty Trash Confirmation Modal */}
      {showEmptyTrashModal && (
        <EmptyTrashModal
          deletedDocsCount={deletedDocsCount}
          onClose={() => setShowEmptyTrashModal(false)}
          onConfirmEmptyTrash={handleEmptyTrash}
        />
      )}
    </>
  );
}
