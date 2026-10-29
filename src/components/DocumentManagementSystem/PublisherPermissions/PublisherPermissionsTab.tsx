import React from "react";
import { UsersRound, ShieldCheck, Folder } from "lucide-react";
import type { FolderDefinition, Publisher } from "../types";
import { PublisherModeTab } from "./PublisherModeTab";
import { FolderModeTab } from "./FolderModeTab";

export function PublisherPermissionsTab({
  publishers,
  folders,
  globalSearch,
  adminGovernanceMode,
  setAdminGovernanceMode,
  publisherSearch,
  setPublisherSearch,
  publisherFolderFilter,
  setPublisherFolderFilter,
  folderModeSearch,
  setFolderModeSearch,
  folderModeFilter,
  setFolderModeFilter,
  onCreatePublisher,
  onEditPublisher,
  onDeletePublisher,
  onManageFolderPublishers,
  onSelectFolderForPublishers,
  onSelectSubfolderForPublishers,
  onQuickRevokeFolderPublisher,
  isPublisherAssignedToSubfolder,
}: {
  publishers: Publisher[];
  folders: FolderDefinition[];
  globalSearch: string;
  adminGovernanceMode: "publisher" | "folder";
  setAdminGovernanceMode: (mode: "publisher" | "folder") => void;
  publisherSearch: string;
  setPublisherSearch: (val: string) => void;
  publisherFolderFilter: string;
  setPublisherFolderFilter: (val: string) => void;
  folderModeSearch: string;
  setFolderModeSearch: (val: string) => void;
  folderModeFilter: "All" | "Multi" | "Single" | "Unassigned";
  setFolderModeFilter: (val: "All" | "Multi" | "Single" | "Unassigned") => void;
  onCreatePublisher: () => void;
  onEditPublisher: (pub: Publisher) => void;
  onDeletePublisher: (id: string) => void;
  onManageFolderPublishers: (folder: FolderDefinition) => void;
  onSelectFolderForPublishers: (folder: FolderDefinition) => void;
  onSelectSubfolderForPublishers: (target: {
    folder: FolderDefinition;
    subfolderName: string;
    subfolderId?: number;
    subfolderPath?: string[];
  }) => void;
  onQuickRevokeFolderPublisher: (folderName: string, publisherId: string) => void;
  isPublisherAssignedToSubfolder: (
    publisher: Publisher,
    folderName: string,
    subfolderName: string,
    subfolderId?: number,
    subfolderPath?: string[],
  ) => boolean;
}) {
  return (
    <div className="flex-1 overflow-auto bg-background/50 p-4 sm:p-6 space-y-6">
      <div className="w-full space-y-6">
        {/* Mode Toggle Bar: Switch between Publisher Mode & Folder Mode */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center p-0.5 bg-muted/60 rounded-lg border border-border/60">
            <button
              type="button"
              onClick={() => setAdminGovernanceMode("publisher")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                adminGovernanceMode === "publisher"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <UsersRound className="h-5 w-5" />
              <span>Publisher Mode</span>
              <span
                className={`text-[9px] px-1 py-0.5 rounded-full font-mono ${
                  adminGovernanceMode === "publisher"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted-foreground/15 text-muted-foreground"
                }`}
              >
                {publishers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAdminGovernanceMode("folder")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                adminGovernanceMode === "folder"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Folder className="h-5 w-5" />
              <span>Folder Mode</span>
              <span
                className={`text-[9px] px-1 py-0.5 rounded-full font-mono ${
                  adminGovernanceMode === "folder"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted-foreground/15 text-muted-foreground"
                }`}
              >
                {folders.length}
              </span>
            </button>
          </div>

          <div className="text-xs text-muted-foreground px-2">
            {adminGovernanceMode === "publisher" ? (
              <span>Managing permissions grouped by publisher individual</span>
            ) : (
              <span>Managing permissions grouped by folder and subfolder structure</span>
            )}
          </div>
        </div>

        {adminGovernanceMode === "publisher" ? (
          <PublisherModeTab
            publishers={publishers}
            folders={folders}
            globalSearch={globalSearch}
            publisherSearch={publisherSearch}
            onPublisherSearchChange={setPublisherSearch}
            publisherFolderFilter={publisherFolderFilter}
            onPublisherFolderFilterChange={setPublisherFolderFilter}
            onCreatePublisher={onCreatePublisher}
            onEditPublisher={onEditPublisher}
            onDeletePublisher={onDeletePublisher}
            onManageFolderPublishers={onManageFolderPublishers}
          />
        ) : (
          <FolderModeTab
            folders={folders}
            publishers={publishers}
            globalSearch={globalSearch}
            folderModeSearch={folderModeSearch}
            onFolderModeSearchChange={setFolderModeSearch}
            folderModeFilter={folderModeFilter}
            onFolderModeFilterChange={setFolderModeFilter}
            onSelectFolderForPublishers={onSelectFolderForPublishers}
            onSelectSubfolderForPublishers={onSelectSubfolderForPublishers}
            onQuickRevokeFolderPublisher={onQuickRevokeFolderPublisher}
            isPublisherAssignedToSubfolder={isPublisherAssignedToSubfolder}
          />
        )}
      </div>
    </div>
  );
}

export { PublisherModeTab, FolderModeTab };
