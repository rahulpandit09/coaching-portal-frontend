import React from "react";
import { UsersRound, Users, Archive, Inbox, KeyRound } from "lucide-react";
import type { MainTab } from "../types";

export function AdminDashboard({
  activeMainTab,
  onTabChange,
  activeFolder,
  onFolderChange,
}: {
  activeMainTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  activeFolder: string;
  onFolderChange: (folder: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl px-3 py-1.5 border border-gray-200 shadow-xs flex flex-wrap items-center gap-1.5 mb-3">
      <div className="flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => {
            onTabChange("all-documents");
            onFolderChange("All documents");
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
            activeMainTab === "all-documents"
              ? "bg-[#1E6FBF] text-white shadow-xs"
              : "text-gray-600 hover:bg-blue-50 hover:text-[#1E6FBF]"
          }`}
        >
          <Inbox className="h-5 w-5" />
          <span>All Documents</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("publishers")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
            activeMainTab === "publishers"
              ? "bg-[#1E6FBF] text-white shadow-xs"
              : "text-gray-600 hover:bg-blue-50 hover:text-[#1E6FBF]"
          }`}
        >
          <UsersRound className="h-5 w-5" />
          <span>Publishers & Permissions</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("groups")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
            activeMainTab === "groups"
              ? "bg-[#1E6FBF] text-white shadow-xs"
              : "text-gray-600 hover:bg-blue-50 hover:text-[#1E6FBF]"
          }`}
        >
          <Users className="h-5 w-5" />
          <span>Engineer Groups</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onTabChange("archive");
            onFolderChange("Archived Records");
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
            activeMainTab === "archive"
              ? "bg-[#1E6FBF] text-white shadow-xs"
              : "text-gray-600 hover:bg-blue-50 hover:text-[#1E6FBF]"
          }`}
        >
          <Archive className="h-5 w-5" />
          <span>Archived Records</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("my-requests")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
            activeMainTab === "my-requests"
              ? "bg-[#1E6FBF] text-white shadow-xs"
              : "text-gray-600 hover:bg-blue-50 hover:text-[#1E6FBF]"
          }`}
        >
          <KeyRound className="h-5 w-5" />
          <span>My Access Requests</span>
        </button>
      </div>
    </div>
  );
}
