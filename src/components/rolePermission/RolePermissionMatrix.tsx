import { useEffect, useMemo, useState } from "react";
import { MODULES, type UserRow } from "@/utils/types";
import {
    ArrowLeft,
    Save,
    Search,
    ShieldCheck,
    CheckSquare,
    Square,
} from "lucide-react";

interface RolePermissionMatrixProps {
    user: UserRow;
    onBack: () => void;
    onSave: (updatedUser: UserRow) => void;
    modules?: string[];
}

export const isModuleEnabled = (value: boolean | string | string[] | undefined): boolean => {
    if (typeof value === "boolean") return value;
    if (Array.isArray(value)) return value.length > 0 && !value.includes("-");
    if (typeof value === "string") {
        return value !== "-" && value.trim() !== "" && value.toLowerCase() !== "false";
    }
    return false;
};

export default function RolePermissionMatrix({
    user,
    onBack,
    onSave,
    modules = MODULES,
}: RolePermissionMatrixProps) {
    const [editingUser, setEditingUser] = useState<UserRow>({
        ...user,
        permissions: { ...user.permissions },
    });
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setEditingUser({
            ...user,
            permissions: { ...user.permissions },
        });
    }, [user]);

    const handleToggleModule = (module: string) => {
        setEditingUser((previous) => {
            const currentlyEnabled = isModuleEnabled(previous.permissions[module]);
            return {
                ...previous,
                permissions: {
                    ...previous.permissions,
                    [module]: !currentlyEnabled,
                },
            };
        });
    };

    const enabledCount = useMemo(() => {
        return modules.filter((mod) => isModuleEnabled(editingUser.permissions[mod])).length;
    }, [modules, editingUser.permissions]);

    const filteredModules = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return modules;
        return modules.filter((mod) => mod.toLowerCase().includes(query));
    }, [modules, searchQuery]);

    return (
        <div className="space-y-4">
            {/* Main Card */}
            <div className="flex h-[calc(100vh-100px)] min-h-[480px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Header */}
                <div className="shrink-0 flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-orange-600" />
                                <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                                    Sidebar Module Access
                                </h2>
                            </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                            Control which sidebar navigation modules are visible for{" "}
                            <span className="font-semibold text-slate-700">
                                {editingUser.fullName}
                            </span>{" "}
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                {editingUser.role}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Scrollable Table - fills remaining height and pushes footer down */}
                <div className="relative flex-1 w-full overflow-auto">
                    <table className="w-full min-w-[650px] border-collapse text-left text-sm">
                        <thead className="sticky top-0 z-20 bg-slate-100 shadow-sm">
                            <tr className="bg-slate-100 text-slate-700">
                                <th className="w-16 border-b border-r border-slate-200 px-4 py-3.5 text-center text-xs font-semibold">
                                    S.No
                                </th>
                                <th className="border-b border-r border-slate-200 px-5 py-3.5 text-left text-xs font-semibold">
                                    Sidebar Module
                                </th>
                                <th className="w-48 border-b border-slate-200 px-5 py-3.5 text-center text-xs font-semibold">
                                    Sidebar Access
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredModules.map((module, index) => {
                                const enabled = isModuleEnabled(editingUser.permissions[module]);
                                const inputId = `sidebar-perm-${module}`;

                                return (
                                    <tr
                                        key={module}
                                        onClick={() => handleToggleModule(module)}
                                        className={`cursor-pointer transition-colors ${enabled
                                                ? "bg-orange-50/20 hover:bg-orange-50/50"
                                                : "hover:bg-slate-50"
                                            }`}
                                    >
                                        {/* Row Index */}
                                        <td className="border-b border-r border-slate-100 px-4 py-3.5 text-center text-xs text-slate-400">
                                            {index + 1}
                                        </td>

                                        {/* Module Name */}
                                        <td className="border-b border-r border-slate-100 px-5 py-3.5 font-medium text-slate-800">
                                            <div className="flex items-center gap-2.5">
                                                <span
                                                    className={`h-2 w-2 rounded-full ${enabled
                                                            ? "bg-emerald-500 ring-2 ring-emerald-100"
                                                            : "bg-slate-300"
                                                        }`}
                                                />
                                                <span>{module}</span>
                                            </div>
                                        </td>

                                        {/* Checkbox Toggle */}
                                        <td
                                            className="border-b border-slate-100 px-5 py-3.5 text-center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <label
                                                htmlFor={inputId}
                                                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-slate-50"
                                            >
                                                <input
                                                    id={inputId}
                                                    type="checkbox"
                                                    checked={enabled}
                                                    onChange={() => handleToggleModule(module)}
                                                    className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-orange-600 focus:ring-2 focus:ring-orange-300"
                                                />
                                                <span
                                                    className={`text-xs font-semibold ${enabled
                                                            ? "text-emerald-700"
                                                            : "text-slate-500"
                                                        }`}
                                                >
                                                    {enabled ? "Enabled" : "Disabled"}
                                                </span>
                                            </label>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredModules.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        No sidebar modules matching "{searchQuery}".
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="shrink-0 flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                        {enabledCount} of {modules.length} sidebar modules enabled for this user.
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onBack}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
                        >
                            Back to Users
                        </button>
                        <button
                            type="button"
                            onClick={() => onSave(editingUser)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
                        >
                            <Save className="h-3.5 w-3.5" />
                            Save Permissions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { RolePermissionMatrix };
