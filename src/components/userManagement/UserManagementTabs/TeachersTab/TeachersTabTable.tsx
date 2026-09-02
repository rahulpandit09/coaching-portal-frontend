import React from "react";
import { Eye, Pencil, Trash2, ArrowUpDown, UserRoundCheck } from "lucide-react";
import { IUser } from "@/utils/user.types";

interface TeachersTabTableProps {
  teachers: IUser[];
  onViewUser?: (user: IUser) => void;
  onEditUser?: (user: IUser) => void;
  onDeleteUser?: (user: IUser) => void;
}

const TeachersTabTable: React.FC<TeachersTabTableProps> = ({
  teachers,
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
                  <span>Teacher</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Emp ID</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3.5">
                <div className="flex items-center gap-1">
                  <span>Qualification & Experience</span>
                  <ArrowUpDown size={12} className="text-gray-500" />
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3.5">
                <div className="flex items-center gap-1">
                  <span>Subjects & Classes</span>
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
            {teachers.length > 0 ? (
              teachers.map((teacher, index) => (
                <tr
                  key={teacher.id}
                  className="transition duration-150 hover:bg-purple-50/30"
                >
                  {/* S.No */}
                  <td className="border border-gray-200 px-4 py-3 text-center font-medium text-gray-500">
                    {index + 1}
                  </td>

                  {/* Teacher Name */}
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 shadow-sm">
                        {teacher.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {teacher.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {teacher.specialization || "Faculty"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Emp ID */}
                  <td className="border border-gray-200 px-4 py-3 text-center font-mono text-xs font-semibold text-purple-700">
                    {teacher.employeeId || `EMP-${teacher.id.toString().padStart(4, "0")}`}
                  </td>

                  {/* Qualification & Experience */}
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {teacher.qualification || "M.Sc / B.Ed"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {teacher.experience ? `${teacher.experience} Experience` : "3+ Years Exp."}
                    </div>
                  </td>

                  {/* Subjects & Classes */}
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {teacher.teachingSubjects || "Mathematics, Science"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {teacher.teachingClasses || "Classes 9th - 12th"}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="text-gray-700">{teacher.email}</div>
                    <div className="text-xs text-gray-500">{teacher.phone}</div>
                  </td>

                  {/* Status */}
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        teacher.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          teacher.status === "Active" ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      {teacher.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        title="View Profile"
                        onClick={() => onViewUser?.(teacher)}
                        className="rounded-lg p-1.5 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        type="button"
                        title="Edit Teacher"
                        onClick={() => onEditUser?.(teacher)}
                        className="rounded-lg p-1.5 text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        title="Delete Teacher"
                        onClick={() => onDeleteUser?.(teacher)}
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
                    <div className="mb-2 rounded-full bg-purple-50 p-3 text-purple-600">
                      <UserRoundCheck size={24} />
                    </div>
                    <p className="font-medium text-gray-600">No teachers found</p>
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

export default TeachersTabTable;
