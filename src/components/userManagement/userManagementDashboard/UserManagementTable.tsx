import React, { useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Search,
  Trash2,
  ArrowDownUp,
} from "lucide-react";

import {
  IUser,
  UserRole,
  UserStatus,
} from "@/utils/user.types";

interface UserManagementTableProps {
  users: IUser[];
  onViewUser?: (user: IUser) => void;
  onEditUser?: (user: IUser) => void;
  onDeleteUser?: (user: IUser) => void;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState<
    "All" | UserRole
  >("All");

  const [statusFilter, setStatusFilter] = useState<
    "All" | UserStatus
  >("All");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        user.name.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue) ||
        user.phone.includes(searchValue);

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <div className="mt-6 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">

        <table className="w-full min-w-[900px] border-collapse">

          {/* TABLE HEADER */}
          <thead>
            <tr className="bg-[#dce9f6]">

              {/* S.NO */}
              <th className="border border-gray-300 px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs font-medium text-gray-700">
                    S.No
                  </span>

                  <ArrowDownUp
                    size={12}
                    className="text-gray-500"
                  />
                </div>
              </th>

              {/* NAME */}
              <th className="border border-gray-300 px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs font-medium text-gray-700">
                    Name
                  </span>

                  <ArrowDownUp
                    size={12}
                    className="text-gray-500"
                  />
                </div>
              </th>

              {/* EMAIL */}
              <th className="border border-gray-300 px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs font-medium text-gray-700">
                    Email
                  </span>

                  <ArrowDownUp
                    size={12}
                    className="text-gray-500"
                  />
                </div>
              </th>

              {/* ROLE */}
              <th className="border border-gray-300 px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs font-medium text-gray-700">
                    Role
                  </span>

                  <ArrowDownUp
                    size={12}
                    className="text-gray-500"
                  />
                </div>
              </th>

              {/* PHONE */}
              <th className="border border-gray-300 px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs font-medium text-gray-700">
                    Phone
                  </span>

                  <ArrowDownUp
                    size={12}
                    className="text-gray-500"
                  />
                </div>
              </th>

              {/* STATUS */}
              <th className="border border-gray-300 px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs font-medium text-gray-700">
                    Status
                  </span>

                  <ArrowDownUp
                    size={12}
                    className="text-gray-500"
                  />
                </div>
              </th>

              {/* ACTION */}
              <th className="border border-gray-300 px-4 py-3 text-center">
                <span className="text-xs font-medium text-gray-700">
                  Action
                </span>
              </th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody>

            {filteredUsers.length > 0 ? (

              filteredUsers.map((user, index) => (

                <tr
                  key={user.id}
                  className="transition hover:bg-gray-50"
                >

                  {/* S.NO */}
                  <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">
                    {index + 1}
                  </td>

                  {/* NAME */}
                  <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800">
                    {user.name}
                  </td>

                  {/* EMAIL */}
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                    {user.email}
                  </td>

                  {/* ROLE */}
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                      {user.role}
                    </span>
                  </td>

                  {/* PHONE */}
                  <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">
                    {user.phone}
                  </td>

                  {/* STATUS */}
                  <td className="border border-gray-200 px-4 py-3 text-center">

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user.status}
                    </span>

                  </td>

                  {/* ACTION */}
                  <td className="border border-gray-200 px-4 py-3">

                    <div className="flex items-center justify-center gap-1">

                      {/* View */}
                      <button
                        type="button"
                        title="View"
                        onClick={() =>
                          onViewUser?.(user)
                        }
                        className="rounded-md p-1.5 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        title="Edit"
                        onClick={() =>
                          onEditUser?.(user)
                        }
                        className="rounded-md p-1.5 text-gray-500 transition hover:bg-green-50 hover:text-green-600"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        title="Delete"
                        onClick={() =>
                          onDeleteUser?.(user)
                        }
                        className="rounded-md p-1.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td
                  colSpan={7}
                  className="border border-gray-200 px-5 py-10 text-center text-sm text-gray-500"
                >
                  No users found.
                </td>
              </tr>

            )}

          </tbody>

        </table>
      </div>
    </div>
  );
};

export default UserManagementTable;