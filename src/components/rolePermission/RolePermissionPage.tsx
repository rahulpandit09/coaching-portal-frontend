import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Users,
    ShieldCheck,
    ChevronDown,
} from "lucide-react";
import RolePermissionTable from "./RolePermissionTable";
import RolePermissionMatrix from "./RolePermissionMatrix";
import type {
    Role,
    UserRow,
    RolesApiResponse,
    SubmenuApiResponse,
    SubmenuApiItem,
} from "@/utils/types";
import axiosInstance from "@/api/axiosInstance";

interface ApiUser {
    userId: number;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    email: string | null;
    phone_number: string | null;
    roleId: number;
    role: string;

    student_details?: {
        student_id?: string | null;
        studentId?: string | null;
    } | null;

    teacher_details?: {
        employee_id?: string | null;
        employeeId?: string | null;
    } | null;

    parent_details?: {
        parent_id?: string | null;
        parentId?: string | null;
    } | null;
}

const mapApiUserToUserRow = (apiUser: ApiUser): UserRow => {
    const fullName = [
        apiUser.first_name,
        apiUser.last_name,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    const employeeCode =
        apiUser.teacher_details?.employee_id ??
        apiUser.teacher_details?.employeeId ??
        apiUser.student_details?.student_id ??
        apiUser.student_details?.studentId ??
        apiUser.parent_details?.parent_id ??
        apiUser.parent_details?.parentId ??
        "";

    return {
        id: apiUser.userId,
        roleId: apiUser.roleId,
        employeeCode,
        fullName: fullName || apiUser.username || apiUser.email || "Unknown User",
        type: apiUser.role,
        stationName: "",
        role: apiUser.role,
        permissions: {},
        assignedRoles: {},
    };
};

export default function RolePermissionPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const [roles, setRoles] = useState<Role[]>([]);
    const [rolesLoading, setRolesLoading] = useState<boolean>(true);
    const [rolesError, setRolesError] = useState<string>("");

    const [modules, setModules] = useState<string[]>([]);
    const [modulesLoading, setModulesLoading] = useState<boolean>(true);

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axiosInstance.get<ApiUser[]>("/users/");

                const mappedUsers = response.data.map(mapApiUserToUserRow);

                setUsers(mappedUsers);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setError("Failed to load users. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setRolesLoading(true);
                setRolesError("");

                const response =
                    await axiosInstance.get<RolesApiResponse>("/roles/");

                const roleItems = Array.isArray(response.data?.data)
                    ? response.data.data
                    : [];

                setRoles(roleItems);
            } catch (err) {
                console.error("Failed to fetch roles:", err);
                setRolesError("Failed to load roles.");
            } finally {
                setRolesLoading(false);
            }
        };

        fetchRoles();
    }, []);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                setModulesLoading(true);

                const response =
                    await axiosInstance.get<SubmenuApiResponse>("/submenu/");

                const rawData: any = response.data;
                const items: SubmenuApiItem[] = Array.isArray(rawData)
                    ? rawData
                    : Array.isArray(rawData?.data)
                        ? rawData.data
                        : [];

                const sortedTitles = [...items]
                    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                    .map((item) => item.title || item.subMenuName || "")
                    .filter(Boolean);

                setModules(sortedTitles);
            } catch (err) {
                console.error("Failed to fetch submenus for modules:", err);
            } finally {
                setModulesLoading(false);
            }
        };

        fetchModules();
    }, []);

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return users.filter((user) => {
            const matchesSearch =
                !query ||
                user.fullName.toLowerCase().includes(query) ||
                user.employeeCode.toLowerCase().includes(query) ||
                user.stationName.toLowerCase().includes(query) ||
                String(user.id).includes(query);

            const matchesRole =
                roleFilter === "All" || user.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    const handleSavePermissions = (updatedUser: UserRow) => {
        setUsers((previous) =>
            previous.map((user) =>
                user.id === updatedUser.id ? updatedUser : user,
            ),
        );
        setSelectedUser(null);
    };

    const handleEditAccess = (user: UserRow) => {
        setSelectedUser(user);
    };

    if (selectedUser) {
        return (
            <RolePermissionMatrix
                user={selectedUser}
                modules={modules}
                onBack={() => setSelectedUser(null)}
                onSave={handleSavePermissions}
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white">
                        <ShieldCheck className="h-6 w-6 text-orange-500" />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-white md:text-2xl">
                            Role &amp; Permission
                        </h1>
                        <p className="mt-0.5 text-xs text-orange-50 md:text-sm">
                            View users and manage module-specific access
                        </p>
                    </div>
                </div>
            </div>

            {/* SUMMARY CARD & FILTERS */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                {/* Total Users Card */}
                <div className="flex min-h-[88px] shrink-0 items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:w-64">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                        <Users className="h-6 w-6 text-orange-600" />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-slate-500">
                            Total Users
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-800">
                            {users.length}
                        </p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex min-h-[88px] flex-1 flex-col justify-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                    <div className="relative w-full flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search name, user ID..."
                            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(event) => setRoleFilter(event.target.value)}
                            disabled={rolesLoading}
                            className="h-10 min-w-[130px] appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="All">
                                {rolesLoading ? "Loading roles..." : "All Roles"}
                            </option>

                            {roles.map((role) => (
                                <option key={role.roleId} value={role.name}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* User Access Table Component */}
            {loading || modulesLoading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                    Loading users and modules...
                </div>
            ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="ml-2 font-semibold underline"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <RolePermissionTable
                    users={filteredUsers}
                    totalUsersCount={users.length}
                    modules={modules}
                    onEditUser={handleEditAccess}
                />
            )}
        </div>
    );
}
