import React, { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { IUser, UserRole } from "@/utils/user.types"
import AllUserTable from "./AllUserTable"

interface AllUserTabProps {
  users: IUser[]
  onViewUser?: (user: IUser) => void
  onEditUser?: (user: IUser) => void
  onDeleteUser?: (user: IUser) => void
}

const AllUserTab: React.FC<AllUserTabProps> = ({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"All" | UserRole>("All")

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim()

    return users.filter((user) => {
      const fullName = `${user.first_name || ""} ${
        user.last_name || ""
      }`.trim() || user.name || ""

      const studentDetails = user.student_details
      const teacherDetails = user.teacher_details
      const parentDetails = user.parent_details

      const matchesSearch =
        !q ||
        fullName.toLowerCase().includes(q) ||
        user.username?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.phone_number?.toLowerCase().includes(q) ||
        user.phone?.toLowerCase().includes(q) ||
        (user.id != null && user.id.toString().includes(q)) ||
        studentDetails?.student_id?.toLowerCase().includes(q) ||
        studentDetails?.class_name?.toLowerCase().includes(q) ||
        studentDetails?.board?.toLowerCase().includes(q) ||
        studentDetails?.subjects?.toLowerCase().includes(q) ||
        teacherDetails?.employee_id?.toLowerCase().includes(q) ||
        teacherDetails?.qualification?.toLowerCase().includes(q) ||
        teacherDetails?.teaching_subjects?.toLowerCase().includes(q) ||
        teacherDetails?.teaching_classes?.toLowerCase().includes(q) ||
        parentDetails?.relationship?.toLowerCase().includes(q) ||
        parentDetails?.occupation?.toLowerCase().includes(q) ||
        parentDetails?.company_name?.toLowerCase().includes(q)

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter])

  // const handleResetFilters = () => {
  //   setSearch("")
  //   setRoleFilter("All")
  // }

  return (
    <div className="flex flex-col gap-4 -mt-3">

      {/* SEARCH / FILTER AREA (Commented) */}
      {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value as "All" | UserRole)
            }
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-400"
          >
            <option value="All">All Types</option>
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
            <option value="Parent">Parent</option>
          </select>
          <button
            type="button"
            onClick={handleResetFilters}
            title="Reset Filters"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div> */}

      {/* TABLE */}
      <AllUserTable
        users={filteredUsers}
        onViewUser={onViewUser}
        onEditUser={onEditUser}
        onDeleteUser={onDeleteUser}
      />

      {/* RECORD COUNT */}
      <div className="text-xs text-gray-500">
        Showing{" "}
        <strong className="text-gray-700">
          {filteredUsers.length}
        </strong>{" "}
        of{" "}
        <strong className="text-gray-700">
          {users.length}
        </strong>{" "}
        users
      </div>

    </div>
  )
}

export default AllUserTab
