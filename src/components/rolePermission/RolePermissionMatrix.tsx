import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import {
    type UserRow,
    type SubmenuApiItem,
    type SubmenuApiResponse,
    type RoleAccessResponse,
    type RoleItem,
    type RolesApiResponse,
} from "@/utils/types";

import {
    ArrowLeft,
    Save,
    Search,
    ShieldCheck,
} from "lucide-react";

export const AVAILABLE_ROLES = [
    "Engineer",
    "SIC",
    "Head of Operations",
    "Admin",
    "MD",
    "Technician",
    "Safety Officer",
    "HSE HEAD",
    "EAP",
    "ASIC",
    "Security",
    "Station Admin",
    "Line Walker",
    "Parent",
    "Student",
    "Teacher",
];

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
    modules = [],
}: RolePermissionMatrixProps) {
    const [submenuData, setSubmenuData] = useState<SubmenuApiItem[]>([]);
    const [menuLoading, setMenuLoading] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<RoleItem[]>([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
    const [selectedSubMenuIds, setSelectedSubMenuIds] = useState<number[]>([]);

    const [editingUser, setEditingUser] = useState<UserRow>({
        ...user,
        permissions: { ...user.permissions },
    });
    const [assignedRoles, setAssignedRoles] = useState<Record<string, string>>(
        user.assignedRoles || {}
    );
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchSubmenus = async () => {
            try {
                setMenuLoading(true);

                const response =
                    await axiosInstance.get<SubmenuApiResponse>("/submenu/");

                setSubmenuData(Array.isArray(response.data?.data) ? response.data.data : []);
            } catch (error) {
                console.error("Failed to fetch submenus:", error);
            } finally {
                setMenuLoading(false);
            }
        };

        fetchSubmenus();
    }, []);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setRolesLoading(true);

                const response =
                    await axiosInstance.get<RolesApiResponse>("/roles/");

                const roles = Array.isArray(response.data?.data) ? response.data.data : [];
                setAvailableRoles(roles);

                if (roles.length > 0) {
                    setSelectedRoleId(roles[0].roleId);
                }
            } catch (error) {
                console.error("Failed to fetch roles:", error);
            } finally {
                setRolesLoading(false);
            }
        };

        fetchRoles();
    }, []);

    useEffect(() => {
        const fetchRoleAccess = async () => {
            if (selectedRoleId === null) {
                setSelectedMenuIds([]);
                setSelectedSubMenuIds([]);
                return;
            }

            try {
                setMenuLoading(true);

                const response = await axiosInstance.get<RoleAccessResponse>(
                    `/roles/${selectedRoleId}/access`
                );

                const roleAccess = response.data;

                const menuIds = (roleAccess?.menus || []).map(
                    (menu) => menu.menuId
                );

                const subMenuIds = (roleAccess?.menus || []).flatMap(
                    (menu) => (menu.subMenus || []).map(
                        (subMenu) => subMenu.subMenuId
                    )
                );

                setSelectedMenuIds(menuIds);
                setSelectedSubMenuIds(subMenuIds);

                // Keep the existing checkbox UI synchronized with
                // the selected role's submenu permissions.
                setEditingUser((previous) => ({
                    ...previous,
                    permissions: Object.fromEntries(
                        submenuData.map((submenu) => [
                            submenu.title,
                            subMenuIds.includes(submenu.subMenuId),
                        ])
                    ),
                }));
            } catch (error) {
                console.error("Failed to fetch role access:", error);
            } finally {
                setMenuLoading(false);
            }
        };

        fetchRoleAccess();
    }, [selectedRoleId, submenuData]);

    useEffect(() => {
        setEditingUser({
            ...user,
            permissions: { ...user.permissions },
        });
        setAssignedRoles(user.assignedRoles || {});
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

    const handleRoleChange = (module: string, role: string) => {
        setAssignedRoles((previous) => ({
            ...previous,
            [module]: previous[module] === role ? "" : role,
        }));
    };

    const apiModules = useMemo(
        () =>
            [...submenuData]
                .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                .map((submenu) => submenu.title || submenu.subMenuName || "")
                .filter(Boolean),
        [submenuData]
    );

    const totalModules = apiModules.length > 0 ? apiModules : modules;

    const enabledCount = useMemo(() => {
        return totalModules.filter((mod) => isModuleEnabled(editingUser.permissions[mod])).length;
    }, [totalModules, editingUser.permissions]);

    const filteredModules = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return apiModules;

        return apiModules.filter((module) =>
            module.toLowerCase().includes(query)
        );
    }, [apiModules, searchQuery]);

    return (
        <div className="space-y-4">
            {/* Main Card */}
            <div className="flex h-[calc(100vh-100px)] min-h-[480px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Header */}
                <div className="shrink-0 flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-orange-600" />
                            <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                                Sidebar Module Access
                            </h2>
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

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="w-full sm:w-56">
                            <label
                                htmlFor="role-selector"
                                className="mb-1 block text-xs font-medium text-slate-600"
                            >
                                Select Role
                            </label>

                            <select
                                id="role-selector"
                                value={selectedRoleId ?? ""}
                                onChange={(event) => {
                                    const value = event.target.value;

                                    setSelectedRoleId(value === "" ? null : Number(value));
                                }}
                                disabled={rolesLoading}
                                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            >
                                <option value="">
                                    {rolesLoading ? "Loading roles..." : "Select a role"}
                                </option>

                                {availableRoles.map((role) => (
                                    <option key={role.roleId} value={role.roleId}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search module..."
                                className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            />
                        </div>
                    </div>
                </div>

                {/* Scrollable Table - fills remaining height and pushes footer down */}
                <div className="relative flex-1 w-full overflow-auto">
                    <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                        <thead className="sticky top-0 z-20 bg-slate-100 shadow-sm">
                            <tr className="bg-slate-100 text-slate-700">
                                <th className="w-16 border-b border-r border-slate-200 px-4 py-3.5 text-center text-xs font-semibold">
                                    S.No
                                </th>
                                <th className="w-56 border-b border-r border-slate-200 px-5 py-3.5 text-left text-xs font-semibold">
                                    Sidebar Module
                                </th>
                                <th className="border-b border-r border-slate-200 px-5 py-3.5 text-center text-xs font-semibold">
                                    Assigned Roles
                                </th>
                                <th className="w-48 border-b border-slate-200 px-5 py-3.5 text-center text-xs font-semibold">
                                    Sidebar Access
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white">
                            {menuLoading ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-5 py-10 text-center text-sm text-slate-500"
                                    >
                                        Loading submenus...
                                    </td>
                                </tr>
                            ) : (
                                filteredModules.map((module, index) => {
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

                                            {/* Assigned Roles */}
                                            <td
                                                className="border-b border-r border-slate-100 px-5 py-3.5"
                                                onClick={(event) => event.stopPropagation()}
                                            >
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 lg:grid-cols-3">
                                                    {availableRoles.map((role) => (
                                                        <label
                                                            key={role.roleId}
                                                            className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm text-slate-700"
                                                            onClick={(event) => event.stopPropagation()}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={assignedRoles[module] === role.name}
                                                                onChange={() => handleRoleChange(module, role.name)}
                                                                className="h-4 w-4 cursor-pointer accent-orange-600"
                                                            />

                                                            <span>{role.name}</span>
                                                        </label>
                                                    ))}
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
                                })
                            )}

                            {!menuLoading && filteredModules.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
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
                        {enabledCount} of {totalModules.length} sidebar modules enabled for this user.
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to Users
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                onSave({
                                    ...editingUser,
                                    assignedRoles,
                                })
                            }
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
