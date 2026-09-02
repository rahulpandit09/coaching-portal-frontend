import React from "react";
import { Eye, Pencil, Trash2, ArrowUpDown, UserRound } from "lucide-react";
import { IUser } from "@/utils/user.types";

interface ParentsTabTableProps {
  parents: IUser[];
  onViewUser?: (user: IUser) => void;
  onEditUser?: (user: IUser) => void;
  onDeleteUser?: (user: IUser) => void;
}

const ParentsTabTable: React.FC<ParentsTabTableProps> = ({
  parents,
  onViewUser,
  onEditUser,
  onDeleteUser,
}) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full min-w-[950px] border-collapse text-left">
          {/* HEADER */}
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
                  <span>Parent / Guardian</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3.5">
                <div className="flex items-center gap-1">
                  <span>Student (Child)</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Relationship</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3.5">
                <div className="flex items-center gap-1">
                  <span>Occupation & Org</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3.5">
                <div className="flex items-center gap-1">
                  <span>Contact (Email / Phone)</span>
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

          {/* BODY */}
          <tbody className="divide-y divide-gray-200 text-sm">
            {parents.length > 0 ? (
              parents.map((parent, index) => (
                <tr
                  key={parent.id}
                  className="transition duration-150 hover:bg-amber-50/30"
                >
                  {/* S.No */}
                  <td className="border border-gray-200 px-4 py-3 text-center font-medium text-gray-500">
                    {index + 1}
                  </td>

                  {/* Parent Name */}
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800 shadow-sm">
                        {parent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {parent.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: #{parent.id.toString().padStart(4, "0")}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Student */}
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="font-medium text-blue-700">
                      {parent.studentName || "Assigned Student"}
                    </div>
                  </td>

                  {/* Relationship */}
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      {parent.relationship || "Guardian"}
                    </span>
                  </td>

                  {/* Occupation */}
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {parent.occupation || "Employed"}
                    </div>
                    {parent.companyName && (
                      <div className="text-xs text-gray-500">
                        {parent.companyName}
                      </div>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="text-gray-700">{parent.email}</div>
                    <div className="text-xs text-gray-500">{parent.phone}</div>
                  </td>

                  {/* Status */}
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        parent.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          parent.status === "Active" ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      {parent.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        title="View Profile"
                        onClick={() => onViewUser?.(parent)}
                        className="rounded-lg p-1.5 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        type="button"
                        title="Edit Parent"
                        onClick={() => onEditUser?.(parent)}
                        className="rounded-lg p-1.5 text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        title="Delete Parent"
                        onClick={() => onDeleteUser?.(parent)}
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
                  colSpan={8}
                  className="border border-gray-200 px-4 py-12 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-2 rounded-full bg-amber-50 p-3 text-amber-600">
                      <UserRound size={24} />
                    </div>
                    <p className="font-medium text-gray-600">No parents found</p>
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

export default ParentsTabTable;
