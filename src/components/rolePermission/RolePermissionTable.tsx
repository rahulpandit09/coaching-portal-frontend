import { Pencil, Check } from "lucide-react";
import { MODULES, type UserRow } from "@/utils/types";
import { isModuleEnabled } from "./RolePermissionMatrix";

interface RolePermissionTableProps {
    users: UserRow[];
    totalUsersCount: number;
    modules?: string[];
    onEditUser: (user: UserRow) => void;
}

export default function RolePermissionTable({
    users,
    totalUsersCount,
    modules = MODULES,
    onEditUser,
}: RolePermissionTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="hide-scrollbar-x relative max-h-[calc(100vh-340px)] min-h-[300px] w-full overflow-auto">
                <table className="w-max min-w-full border-separate border-spacing-0 text-left text-sm">
                    <thead>
                        <tr className="h-[49px] bg-slate-200 text-slate-700">
                            <th
                                rowSpan={2}
                                className="sticky left-0 top-0 z-40 w-[130px] min-w-[130px] border border-slate-300 bg-slate-200 px-3 py-3 text-left font-semibold"
                            >
                                User ID
                            </th>
                            <th
                                rowSpan={2}
                                className="sticky left-[130px] top-0 z-40 w-[200px] min-w-[200px] border border-slate-300 bg-slate-200 px-3 py-3 text-left font-semibold"
                            >
                                Full Name
                            </th>
                            <th
                                rowSpan={2}
                                className="sticky left-[330px] top-0 z-40 w-[130px] min-w-[130px] border border-slate-300 bg-slate-200 px-3 py-3 text-left font-semibold"
                            >
                                Role
                            </th>
                            <th
                                colSpan={modules.length}
                                className="sticky top-0 z-20 border border-slate-300 bg-slate-200 px-3 py-3 text-center font-semibold text-blue-700"
                            >
                                Module-Specific Permissions
                            </th>
                            <th
                                rowSpan={2}
                                className="sticky right-0 top-0 z-40 w-[90px] min-w-[90px] border border-slate-300 bg-slate-200 px-3 py-3 text-center font-semibold"
                            >
                                Edit
                            </th>
                        </tr>

                        <tr className="bg-slate-100 text-slate-700">
                            {modules.map((module) => (
                                <th
                                    key={module}
                                    className="sticky top-[49px] z-20 w-[180px] min-w-[180px] border border-slate-300 bg-slate-100 px-3 py-3 text-center font-medium"
                                >
                                    {module}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="group text-slate-700 hover:bg-orange-50/40"
                            >
                                <td className="sticky left-0 z-10 w-[130px] min-w-[130px] border border-slate-200 bg-white px-3 py-3 whitespace-nowrap group-hover:bg-orange-50">
                                    {user.employeeCode}
                                </td>

                                <td className="sticky left-[130px] z-10 w-[200px] min-w-[200px] border border-slate-200 bg-white px-3 py-3 font-medium whitespace-nowrap group-hover:bg-orange-50">
                                    {user.fullName}
                                </td>

                                <td className="sticky left-[330px] z-10 w-[130px] min-w-[130px] border border-slate-200 bg-white px-3 py-3 group-hover:bg-orange-50">
                                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                        {user.role}
                                    </span>
                                </td>

                                {modules.map((module) => {
                                    const isEnabled = isModuleEnabled(user.permissions[module]);

                                    return (
                                        <td
                                            key={module}
                                            className="w-[180px] min-w-[180px] whitespace-nowrap border border-slate-200 px-3 py-3 text-center"
                                        >
                                            {isEnabled ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                                    <Check className="h-3 w-3" />
                                                    Enabled
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                                                    Disabled
                                                </span>
                                            )}
                                        </td>
                                    );
                                })}

                                <td className="sticky right-0 z-10 w-[90px] min-w-[90px] border border-slate-200 bg-white px-3 py-3 text-center group-hover:bg-orange-50">
                                    <button
                                        type="button"
                                        title={`Edit access for ${user.fullName}`}
                                        onClick={() => onEditUser(user)}
                                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        <span>Edit</span>
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {users.length === 0 && (
                            <tr>
                                <td
                                    colSpan={modules.length + 4}
                                    className="px-4 py-10 text-center text-slate-500"
                                >
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
                Showing {users.length} of {totalUsersCount} users
            </div>
        </div>
    );
}
