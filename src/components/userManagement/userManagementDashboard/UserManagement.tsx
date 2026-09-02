import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users } from "lucide-react";

import UserDashboard from "./UserDashboard";
import UserManagementTabs from "../UserManagementTabs/UserManagementCard&Tabs";

import { IUser } from "@/utils/user.types";

const UserManagement: React.FC = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<IUser[]>([
    {
      id: 1,
      name: "Rahul Kumar",
      email: "rahul@gmail.com",
      phone: "9876543210",
      role: "Student",
      status: "Active",
      studentId: "STU-2024-001",
      className: "Class 10th",
      schoolName: "Delhi Public School",
      board: "CBSE",
      parentName: "Anil Kumar",
    },
    {
      id: 2,
      name: "Aman Verma",
      email: "aman.verma@gmail.com",
      phone: "9876543213",
      role: "Student",
      status: "Active",
      studentId: "STU-2024-002",
      className: "Class 12th",
      schoolName: "St. Xavier's High School",
      board: "ICSE",
      parentName: "Sanjay Verma",
    },
  ]);

  const stats = {
    totalUsers: users.length,
    students: users.filter((user) => user.role === "Student").length,
    teachers: users.filter((user) => user.role === "Teacher").length,
    parents: users.filter((user) => user.role === "Parent").length,
  };

  const handleViewUser = (user: IUser) => {
    console.log("View user:", user);
  };

  const handleEditUser = (user: IUser) => {
    console.log("Edit user:", user);
  };

  const handleDeleteUser = (user: IUser) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    setUsers((prev) => prev.filter((item) => item.id !== user.id));
  };

  return (
    <div className="w-full">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="mb-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          
          {/* Left Side */}
          <div className="flex items-center gap-4">
            
            {/* Icon */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Users className="h-6 w-6 text-orange-500" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-xl font-bold text-white md:text-2xl">
                User Management
              </h1>

              <p className="mt-0.5 text-xs text-orange-50 md:text-sm">
                Manage students, teachers and parents
              </p>
            </div>
          </div>

          {/* Right Side */}
          <button
            type="button"
            onClick={() => navigate("/user-management/add-new-user")}
            className="flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-orange-600 shadow-sm transition duration-200 hover:bg-orange-50"
          >
            <Plus size={18} />
            New User
          </button>
        </div>
      </div>

      {/* =====================================================
          DASHBOARD STATS
      ====================================================== */}
      <UserDashboard stats={stats} />

      {/* =====================================================
          USER MANAGEMENT TABS & TABLES
      ====================================================== */}
      <UserManagementTabs
        users={users}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
};

export default UserManagement;