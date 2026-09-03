import React, { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  UserRoundCheck,
  UserRound,
} from "lucide-react";

import AllUserTab from "../UserManagementTabs/AllUserTab/AllUserTab";
import StudentsTab from "../UserManagementTabs/StudentsTab/StudentsTab";
import TeachersTab from "../UserManagementTabs/TeachersTab/TeachersTab";
import ParentsTab from "../UserManagementTabs/ParentsTab/ParentsTab";

import { IUser } from "@/utils/user.types";

export type TabKey = "all" | "students" | "teachers" | "parents";

interface UserKpi {
  total_users: number;
  students: number;
  teachers: number;
  parents: number;
  total_students: number;
  total_teachers: number;
  total_parents: number;
}

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

  // KPI state
  const [kpi, setKpi] = useState<UserKpi | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);

  // Fetch KPI data
  useEffect(() => {
    const fetchKpi = async () => {
      try {
        setKpiLoading(true);
        setKpiError(null);

        const response = await fetch(
          "http://localhost:8000/user-management/users/kpi",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user KPI data");
        }

        const data: UserKpi = await response.json();

        console.log("User KPI:", data);

        setKpi(data);
      } catch (error) {
        console.error("KPI API Error:", error);
        setKpiError("Unable to load KPI data");
      } finally {
        setKpiLoading(false);
      }
    };

    fetchKpi();
  }, []);

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

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total Users */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Users
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {kpiLoading ? "..." : kpi?.total_users ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          {kpiError && (
            <p className="mt-1 text-xs text-red-500">
              {kpiError}
            </p>
          )}
        </div>

        {/* Students */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Students
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {kpiLoading ? "..." : kpi?.students ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Teachers */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Teachers
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {kpiLoading ? "..." : kpi?.teachers ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <UserRoundCheck className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Parents */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Parents
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {kpiLoading ? "..." : kpi?.parents ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <UserRound className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

      </div>

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
