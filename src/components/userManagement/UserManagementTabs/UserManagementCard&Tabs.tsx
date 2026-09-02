import React, { useState } from "react";
import { Users, GraduationCap, UserRoundCheck, UserRound } from "lucide-react";
import AllUserTab from "./AllUserTab/AllUserTab";
import StudentsTab from "./StudentsTab/StudentsTab";
import TeachersTab from "./TeachersTab/TeachersTab";
import ParentsTab from "./ParentsTab/ParentsTab";
import { IUser } from "@/utils/user.types";

export type TabKey = "all" | "students" | "teachers" | "parents";

interface UserManagementTabsProps {
  users: IUser[];
  onViewUser?: (user: IUser) => void;
  onEditUser?: (user: IUser) => void;
  onDeleteUser?: (user: IUser) => void;
  defaultTab?: TabKey;
}

const UserManagementTabs: React.FC<UserManagementTabsProps> = ({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser,
  defaultTab = "all",
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  const tabsConfig = [
    {
      key: "all" as TabKey,
      label: "All Users",
      icon: Users,
      activeColor: "border-orange-500 text-orange-600 bg-orange-50/50",
    },
    {
      key: "students" as TabKey,
      label: "Students",
      icon: GraduationCap,
      activeColor: "border-blue-500 text-blue-600 bg-blue-50/50",
    },
    {
      key: "teachers" as TabKey,
      label: "Teachers",
      icon: UserRoundCheck,
      activeColor: "border-purple-500 text-purple-600 bg-purple-50/50",
    },
    {
      key: "parents" as TabKey,
      label: "Parents",
      icon: UserRound,
      activeColor: "border-amber-500 text-amber-600 bg-amber-50/50",
    },
  ];

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* TABS NAVIGATION HEADER */}
      <div className="flex w-full items-center justify-between border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-px">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`group flex items-center gap-2.5 border-b-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? `${tab.activeColor} border-b-2`
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors ${
                    isActive
                      ? "currentColor"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE TAB CONTENT */}
      <div>
        {activeTab === "all" && (
          <AllUserTab
            users={users}
            onViewUser={onViewUser}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
          />
        )}

        {activeTab === "students" && (
          <StudentsTab
            users={users}
            onViewUser={onViewUser}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
          />
        )}

        {activeTab === "teachers" && (
          <TeachersTab
            users={users}
            onViewUser={onViewUser}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
          />
        )}

        {activeTab === "parents" && (
          <ParentsTab
            users={users}
            onViewUser={onViewUser}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagementTabs;
