import { useMemo, useState } from "react";
import {
    Search,
    Users,
    ShieldCheck,
    ChevronDown,
} from "lucide-react";
import RolePermissionTable from "./RolePermissionTable";
import RolePermissionMatrix from "./RolePermissionMatrix";
import { INITIAL_USERS, type UserRow } from "@/utils/types";

export default function RolePermissionPage() {
    const [users, setUsers] = useState<UserRow[]>(INITIAL_USERS);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return users.filter((user) => {
            const matchesSearch =
                !query ||
                user.fullName.toLowerCase().includes(query) ||
                user.employeeCode.toLowerCase().includes(query) ||
                user.stationName.toLowerCase().includes(query);

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
                            className="h-10 min-w-[130px] appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="All">All Roles</option>
                            <option value="Tutor">Tutor</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Student">Student</option>
                            <option value="Parent">Parent</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* User Access Table Component */}
            <RolePermissionTable
                users={filteredUsers}
                totalUsersCount={users.length}
                onEditUser={handleEditAccess}
            />
        </div>
    );
}
