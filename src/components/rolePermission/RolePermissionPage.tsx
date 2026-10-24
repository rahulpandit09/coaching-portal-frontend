import { useMemo, useState } from "react";
import {
    Search,
    Pencil,
    Users,
    X,
    Save,
    ShieldCheck,
    ChevronDown,
} from "lucide-react";

type UserRow = {
    id: number;
    employeeCode: string;
    fullName: string;
    type: string;
    stationName: string;
    role: string;
    permissions: Record<string, string>;
};

const MODULES = [
    "Dashboard",
    "User Management",
    "Role & Permission Management",
    "Student Management",
    "Parent Management",
    "Teacher Management",
    "Tutor Management",
    "Class Management",
    "Subject Management",
    "Batch Management",
    "Attendance Management",
    "Timetable Management",
    "Course Management",
    "Study Materials",
    "Homework & Assignments",
    "Exam Management",
    "Results & Grades",
    "Fees & Payments",
    "Notifications",
    "Reports & Analytics",
    "Profile Management",
    "Settings",
];

const INITIAL_USERS: UserRow[] = [
    {
        id: 1,
        employeeCode: "TUT001",
        fullName: "Rahul Kumar",
        type: "Tutor",
        stationName: "Head Office",
        role: "Tutor",
        permissions: {
            Dashboard: "View",
            "User Management": "Create / Edit",
            "Role & Permission": "Manage",
            Attendance: "Manage",
            Reports: "View",
        },
    },
    {
        id: 2,
        employeeCode: "TCH001",
        fullName: "Aaditya Singh",
        type: "Teacher",
        stationName: "Main Campus",
        role: "Teacher",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "Create / Edit",
            Reports: "View",
        },
    },
    {
        id: 3,
        employeeCode: "STU001",
        fullName: "Arvi Arya",
        type: "Student",
        stationName: "Main Campus",
        role: "Student",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "View",
            Reports: "-",
        },
    },
    {
        id: 4,
        employeeCode: "PAR001",
        fullName: "Aman Tiwari",
        type: "Parent",
        stationName: "Main Campus",
        role: "Parent",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "View",
            Reports: "View",
        },
    },
    {
        id: 5,
        employeeCode: "TUT002",
        fullName: "Pooja Sharma",
        type: "Tutor",
        stationName: "North Branch",
        role: "Tutor",
        permissions: {
            Dashboard: "View",
            "User Management": "View",
            "Role & Permission": "-",
            Attendance: "Manage",
            Reports: "Create / Edit",
        },
    },
    {
        id: 6,
        employeeCode: "TCH002",
        fullName: "Vikram Malhotra",
        type: "Teacher",
        stationName: "South Wing",
        role: "Teacher",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "Create / Edit",
            Reports: "View",
        },
    },
    {
        id: 7,
        employeeCode: "STU002",
        fullName: "Sneha Patel",
        type: "Student",
        stationName: "Main Campus",
        role: "Student",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "View",
            Reports: "-",
        },
    },
    {
        id: 8,
        employeeCode: "PAR002",
        fullName: "Rajesh Gupta",
        type: "Parent",
        stationName: "North Branch",
        role: "Parent",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "View",
            Reports: "View",
        },
    },
    {
        id: 9,
        employeeCode: "TUT003",
        fullName: "Neha Verma",
        type: "Tutor",
        stationName: "East Campus",
        role: "Tutor",
        permissions: {
            Dashboard: "View",
            "User Management": "Create / Edit",
            "Role & Permission": "View",
            Attendance: "Manage",
            Reports: "Manage",
        },
    },
    {
        id: 10,
        employeeCode: "TCH003",
        fullName: "Anil Deshmukh",
        type: "Teacher",
        stationName: "West Campus",
        role: "Teacher",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "Manage",
            Reports: "View",
        },
    },
    {
        id: 11,
        employeeCode: "STU003",
        fullName: "Rohan Joshi",
        type: "Student",
        stationName: "East Campus",
        role: "Student",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "View",
            Reports: "-",
        },
    },
    {
        id: 12,
        employeeCode: "PAR003",
        fullName: "Sunita Reddy",
        type: "Parent",
        stationName: "West Campus",
        role: "Parent",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "View",
            Reports: "View",
        },
    },
    {
        id: 13,
        employeeCode: "TUT004",
        fullName: "Deepak Choudhary",
        type: "Tutor",
        stationName: "Head Office",
        role: "Tutor",
        permissions: {
            Dashboard: "View",
            "User Management": "Manage",
            "Role & Permission": "Manage",
            Attendance: "Manage",
            Reports: "Manage",
        },
    },
    {
        id: 14,
        employeeCode: "TCH004",
        fullName: "Meera Nair",
        type: "Teacher",
        stationName: "Main Campus",
        role: "Teacher",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "Create / Edit",
            Reports: "Create / Edit",
        },
    },
];

export default function UserRoleMatrix() {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [editingUser, setEditingUser] = useState<UserRow | null>(null);

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

    const saveUser = () => {
        if (!editingUser) return;

        setUsers((previous) =>
            previous.map((user) =>
                user.id === editingUser.id ? editingUser : user,
            ),
        );

        setEditingUser(null);
    };

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

            {/* User matrix */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* <div className="border-b border-slate-200 px-4 py-3">
                    <h2 className="font-semibold text-slate-800">
                        User Access
                    </h2>
                </div> */}

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
                                    colSpan={MODULES.length}
                                    className="sticky top-0 z-20 border border-slate-300 bg-slate-200 px-3 py-3 text-center font-semibold text-blue-700"
                                >
                                    Module-Specific Permissions
                                </th>
                                <th
                                    rowSpan={2}
                                    className="sticky right-0 top-0 z-40 w-[80px] min-w-[80px] border border-slate-300 bg-slate-200 px-3 py-3 text-center font-semibold"
                                >
                                    Edit
                                </th>
                            </tr>

                            <tr className="bg-slate-100 text-slate-700">
                                {MODULES.map((module) => (
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
                            {filteredUsers.map((user) => (
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

                                    {MODULES.map((module) => (
                                        <td
                                            key={module}
                                            className="w-[180px] min-w-[180px] whitespace-nowrap border border-slate-200 px-3 py-3 text-center"
                                        >
                                            {user.permissions[module] || "-"}
                                        </td>
                                    ))}

                                    <td className="sticky right-0 z-10 w-[80px] min-w-[80px] border border-slate-200 bg-white px-3 py-3 text-center group-hover:bg-orange-50">
                                        <button
                                            type="button"
                                            title={`Edit access for ${user.fullName}`}
                                            onClick={() => setEditingUser({ ...user })}
                                            className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={MODULES.length + 4}
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
                    Showing {filteredUsers.length} of {users.length} users
                </div>
            </div>

            {/* Edit dialog */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-access-title"
                        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 p-4">
                            <div>
                                <h2
                                    id="edit-access-title"
                                    className="font-semibold text-slate-800"
                                >
                                    Edit User Access
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    {editingUser.fullName} · {editingUser.role}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                aria-label="Close dialog"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4 p-4">
                            {MODULES.map((module) => (
                                <div key={module}>
                                    <label
                                        htmlFor={`permission-${editingUser.id}-${module}`}
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        {module}
                                    </label>

                                    <select
                                        id={`permission-${editingUser.id}-${module}`}
                                        value={editingUser.permissions[module] || "-"}
                                        onChange={(event) =>
                                            setEditingUser((previous) =>
                                                previous
                                                    ? {
                                                        ...previous,
                                                        permissions: {
                                                            ...previous.permissions,
                                                            [module]: event.target.value,
                                                        },
                                                    }
                                                    : previous,
                                            )
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400"
                                    >
                                        <option value="-">No Access</option>
                                        <option value="View">View</option>
                                        <option value="Create / Edit">Create / Edit</option>
                                        <option value="Manage">Manage</option>
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4">
                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={saveUser}
                                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                            >
                                <Save className="h-4 w-4" />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
