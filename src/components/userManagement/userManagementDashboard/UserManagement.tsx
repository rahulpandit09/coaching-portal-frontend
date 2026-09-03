import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Loader2 } from "lucide-react";

import UserManagementTabs from "./UserManagementCard&Tabs";

import { IUser, UserRole } from "@/utils/user.types";

const mapUserData = (user: any): IUser => {
  let role: UserRole = "Student";

  switch (user.role_id) {
    case 2:
      role = "Teacher";
      break;
    case 3:
      role = "Student";
      break;
    case 4:
      role = "Parent";
      break;
    default:
      role = "Student";
  }

  const studentDetails = user.student_details || {};
  const teacherDetails = user.teacher_details || {};
  const parentDetails = user.parent_details || {};

  return {
    id: user.id,
    name:
      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.username ||
      "User",
    email: user.email || "",
    phone: user.phone || "",
    role,
    status: user.status || "Active",

    // Student fields
    studentId: studentDetails.student_id || user.student_id,
    className: studentDetails.class_name || user.class_name,
    schoolName: studentDetails.school_name || user.school_name,
    board: studentDetails.board || user.board,
    parentName: studentDetails.parent_name || user.parent_name,

    // Teacher fields
    employeeId: teacherDetails.employee_id || user.employee_id,
    qualification: teacherDetails.qualification || user.qualification,
    specialization: teacherDetails.specialization || user.specialization,
    experience: teacherDetails.experience?.toString() || user.experience,

    // Parent fields
    relationship: parentDetails.relationship || user.relationship,
    occupation: parentDetails.occupation || user.occupation,
    companyName: parentDetails.company_name || user.company_name,
  };
};

const UserManagement: React.FC = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "http://localhost:8000/user-management/users/?skip=0&limit=100",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        console.log("Users API response:", data);

        if (Array.isArray(data)) {
          const mappedUsers: IUser[] = data.map(mapUserData);
          setUsers(mappedUsers);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Get Users API Error:", err);
        setError("Unable to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
          USER MANAGEMENT TABS & TABLES (Includes KPI Cards)
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