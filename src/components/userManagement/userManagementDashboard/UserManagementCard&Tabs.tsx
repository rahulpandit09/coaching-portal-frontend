import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Users,
  GraduationCap,
  UserRoundCheck,
  UserRound,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

import AllUserTab from "../UserManagementTabs/AllUserTab/AllUserTab";
import StudentsTab from "../UserManagementTabs/StudentsTab/StudentsTab";
import TeachersTab from "../UserManagementTabs/TeachersTab/TeachersTab";
import ParentsTab from "../UserManagementTabs/ParentsTab/ParentsTab";

import axiosInstance from "@/api/axiosInstance";
import { IUser, UserDetails } from "@/utils/user.types";

export interface UserKpiData {
  total_users?: number;
  students?: number;
  teachers?: number;
  parents?: number;
  [key: string]: any;
}

export type TabKey = "all" | "students" | "teachers" | "parents";

interface UserManagementTabsProps {
  users: IUser[];
  onViewUser?: (user: UserDetails) => void;
  onEditUser?: (user: IUser) => void;
  onDeleteUser?: (user: IUser) => void;
  defaultTab?: TabKey;
}

const UserManagementTabs: React.FC<UserManagementTabsProps> = ({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser,
  defaultTab = "students",
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  // KPI state
  const [kpi, setKpi] = useState<UserKpiData | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch KPI data
  const fetchKpi = useCallback(async () => {
    try {
      setKpiLoading(true);
      setKpiError(null);

      const response = await axiosInstance.get("/user-management/users/kpi");
      setKpi(response.data);
    } catch (error: any) {
      console.error("KPI API Error:", error);
      setKpiError(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load KPI data"
      );
    } finally {
      setKpiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKpi();
  }, [fetchKpi]);

  const handleViewUser = (user: IUser) => {
    const userId = (user as any).userId ?? user.id ?? (user as any).user_id;

    if (!userId) {
      console.error("User ID is missing");
      return;
    }

    navigate("/user-management/add-new-user", {
      state: {
        mode: "view",
        userId,
      },
    });

    onViewUser?.({
      ...user,
      userId,
    } as UserDetails);
  };

  const handleEditUser = (user: IUser) => {
    const userId = (user as any).userId ?? user.id ?? (user as any).user_id;

    if (!userId) {
      console.error("User ID is missing");
      return;
    }

    navigate("/user-management/add-new-user", {
      state: {
        mode: "edit",
        userId,
      },
    });

    onEditUser?.(user);
  };

  const handleDeleteClick = (user: IUser) => {
    setUserToDelete(user);
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    const userId =
      (userToDelete as any).userId ??
      userToDelete.id ??
      (userToDelete as any).user_id;

    if (!userId) {
      console.error("User ID is missing");
      toast.error("User ID is missing.");
      setUserToDelete(null);
      return;
    }

    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/user-management/users/${userId}`);
      toast.success("User deleted successfully.");
      await fetchKpi();
      onDeleteUser?.(userToDelete);
      setUserToDelete(null);
    } catch (error: any) {
      console.error("Delete User Error:", error);
      const errorData = error?.response?.data;
      const errorMessage =
        errorData?.detail?.[0]?.msg ||
        (typeof errorData?.detail === "string" ? errorData.detail : null) ||
        errorData?.message ||
        error?.message ||
        "Failed to delete user.";

      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const tabsConfig = [
    // {
    //   key: "all" as TabKey,
    //   label: "All Users",
    //   icon: Users,
    //   activeColor: "border-orange-500 text-orange-600 bg-orange-50/50",
    // },
    {
      key: "students" as TabKey,
      label: "Students",
      icon: GraduationCap,
      activeColor: "border-orange-500 text-orange-600 bg-orange-50/50",
    },
    {
      key: "teachers" as TabKey,
      label: "Teachers",
      icon: UserRoundCheck,
      activeColor: "border-orange-500 text-orange-600 bg-orange-50/50",
    },
    {
      key: "parents" as TabKey,
      label: "Parents",
      icon: UserRound,
      activeColor: "border-orange-500 text-orange-600 bg-orange-50/50",
    },
  ];

  return (
    <div className="mt-4 flex flex-col gap-4">

      {/* KPI CARDS (Medium Size) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

        {/* Total Users */}
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Total Users
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {kpiLoading ? "..." : kpi?.total_users ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-orange-50 p-2.5">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          {kpiError && (
            <p className="mt-1 text-xs text-red-500">
              {kpiError}
            </p>
          )}
        </div>

        {/* Students */}
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Students
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {kpiLoading ? "..." : kpi?.students ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-2.5">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Teachers */}
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Teachers
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {kpiLoading ? "..." : kpi?.teachers ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-2.5">
              <UserRoundCheck className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Parents */}
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">
                Parents
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {kpiLoading ? "..." : kpi?.parents ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-2.5">
              <UserRound className="h-5 w-5 text-amber-600" />
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
                className={`group flex items-center gap-2.5 border-b-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive
                  ? `${tab.activeColor} border-b-2`
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
                  }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors ${isActive
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
        {/* {activeTab === "all" && (
          <AllUserTab
            users={users}
            onViewUser={handleViewUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteClick}
          />
        )} */}

        {activeTab === "students" && (
          <StudentsTab
            users={users}
            onViewUser={handleViewUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteClick}
          />
        )}

        {activeTab === "teachers" && (
          <TeachersTab
            users={users}
            onViewUser={handleViewUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteClick}
          />
        )}

        {activeTab === "parents" && (
          <ParentsTab
            users={users}
            onViewUser={handleViewUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteClick}
          />
        )}
      </div>

      {/* =====================================================
          DELETE USER CONFIRMATION MODAL POPUP
      ====================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
            {/* Close button */}
            <button
              type="button"
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={18} />
            </button>

            {/* Icon and Heading */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle size={24} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete User
                </h3>
                <p className="text-xs text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Content Details */}
            <div className="my-5 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete{" "}
                <strong className="font-semibold text-gray-900">
                  {`${userToDelete.first_name || ""} ${userToDelete.last_name || ""}`.trim() ||
                    userToDelete.name ||
                    "this user"}
                </strong>
                ?
              </p>

              <div className="mt-2.5 flex items-center gap-2 text-xs text-gray-500">
                <span className="rounded-md bg-white px-2 py-0.5 font-medium text-gray-700 shadow-sm border border-gray-200">
                  {userToDelete.role || "User"}
                </span>
                {userToDelete.email && <span>• {userToDelete.email}</span>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTabs;

