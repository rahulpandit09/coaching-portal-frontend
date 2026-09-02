import React from "react";
import { Eye, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { IUser } from "@/utils/user.types";

interface AllUserTableProps {
  users: IUser[];
  onViewUser?: (user: IUser) => void;
  onEditUser?: (user: IUser) => void;
  onDeleteUser?: (user: IUser) => void;
}

const AllUserTable: React.FC<AllUserTableProps> = ({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser,
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Student":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Teacher":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Parent":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          {/* TABLE HEADER */}
          <thead className="sticky top-0 z-10 bg-[#dce9f6] shadow-sm">
            <tr className="bg-[#dce9f6] text-xs font-semibold uppercase tracking-wider text-gray-700">
              <th className="border border-gray-300 px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>S.No</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3.5">
                <div className="flex items-center gap-1">
                  <span>User Name</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3.5">
                <div className="flex items-center gap-1">
                  <span>Email</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Role</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Phone</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3.5 text-center">
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="divide-y divide-gray-200 text-sm">
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className="transition duration-150 hover:bg-orange-50/30"
                >
                  {/* S.NO */}
                  <td className="border border-gray-200 px-4 py-3 text-center font-medium text-gray-500">
                    {index + 1}
                  </td>

                  {/* USER NAME */}
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 text-xs font-bold text-white shadow-sm">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: #{user.id.toString().padStart(4, "0")}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* EMAIL */}
                  <td className="border border-gray-200 px-4 py-3 text-gray-600">
                    {user.email}
                  </td>

                  {/* ROLE */}
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* PHONE */}
                  <td className="border border-gray-200 px-4 py-3 text-center text-gray-600">
                    {user.phone || "—"}
                  </td>

                  {/* STATUS */}
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.status === "Active" ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      {user.status}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        title="View Details"
                        onClick={() => onViewUser?.(user)}
                        className="rounded-lg p-1.5 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        type="button"
                        title="Edit User"
                        onClick={() => onEditUser?.(user)}
                        className="rounded-lg p-1.5 text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        title="Delete User"
                        onClick={() => onDeleteUser?.(user)}
                        className="rounded-lg p-1.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="border border-gray-200 px-4 py-12 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-2 rounded-full bg-gray-100 p-3 text-gray-400">
                      <Trash2 size={24} />
                    </div>
                    <p className="font-medium text-gray-600">No users found</p>
                    <p className="text-xs text-gray-400">
                      Try adjusting your search or filters.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllUserTable;
