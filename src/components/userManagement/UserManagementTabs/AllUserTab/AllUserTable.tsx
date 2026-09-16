import React from "react"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { IUser } from "@/utils/user.types"

interface AllUserTableProps {
  users: IUser[]
  onViewUser?: (user: IUser) => void
  onEditUser?: (user: IUser) => void
  onDeleteUser?: (user: IUser) => void
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
        return "bg-blue-50 text-blue-700 border-blue-200"

      case "Teacher":
        return "bg-purple-50 text-purple-700 border-purple-200"

      case "Parent":
        return "bg-amber-50 text-amber-700 border-amber-200"

      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getName = (user: IUser) => {
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.name || "—"
  }

  const getInitials = (user: IUser) => {
    const name = getName(user)

    return (
      name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .join("")
        .substring(0, 2)
        .toUpperCase() || "U"
    )
  }

  const getUserId = (user: IUser) => {
    if (user.role === "Student") {
      return user.student_details?.student_id || user.studentId || "—"
    }

    if (user.role === "Teacher") {
      return user.teacher_details?.employee_id || user.employeeId || "—"
    }

    return `#${user.id.toString().padStart(4, "0")}`
  }

  const getClassBoard = (user: IUser) => {
    if (user.role !== "Student" || !user.student_details) {
      if (user.role === "Student" && (user.className || user.board)) {
        return `${user.className || "—"} / ${user.board || "—"}`
      }
      return "—"
    }

    const className = user.student_details.class_name || "—"
    const board = user.student_details.board || "—"

    return `${className} / ${board}`
  }

  const getSubjectsClasses = (user: IUser) => {
    if (user.role === "Student") {
      return user.student_details?.subjects || "—"
    }

    if (user.role === "Teacher") {
      const subjects = user.teacher_details?.teaching_subjects || user.teachingSubjects || "—"
      const classes = user.teacher_details?.teaching_classes || user.teachingClasses || "—"

      return `${subjects} / Classes: ${classes}`
    }

    return "—"
  }

  const getQualificationExperience = (user: IUser) => {
    if (user.role !== "Teacher" || !user.teacher_details) {
      if (user.role === "Teacher" && (user.qualification || user.experience)) {
        return `${user.qualification || "—"} / ${user.experience ? `${user.experience} years` : "—"}`
      }
      return "—"
    }

    const qualification = user.teacher_details.qualification || "—"
    const experience =
      user.teacher_details.experience !== undefined
        ? `${user.teacher_details.experience} years`
        : "—"

    return `${qualification} / ${experience}`
  }

  const getRelationship = (user: IUser) => {
    return user.parent_details?.relationship || user.relationship || "—"
  }

  const getOccupationOrganization = (user: IUser) => {
    if (!user.parent_details) {
      if (user.occupation || user.companyName) {
        return `${user.occupation || "—"} / ${user.companyName || "—"}`
      }
      return "—"
    }

    const occupation = user.parent_details.occupation || "—"
    const company = user.parent_details.company_name || "—"

    return `${occupation} / ${company}`
  }

  const getEmail = (user: IUser) => {
    return (
      user.email
    )
  }

  const getPhone = (user: IUser) => {
    return (
      user.phone_number
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="max-h-[600px] overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-[1700px] border-collapse text-left">

          {/* ================= TABLE HEADER ================= */}
          <thead className="sticky top-0 z-10 bg-[#dce9f6] shadow-sm">
            <tr className="bg-[#dce9f6] text-xs font-semibold uppercase tracking-wider text-gray-700">

              {/* S.NO */}
              <th className="border border-gray-300 px-4 py-3.5 text-center whitespace-nowrap">
                <span>S.No</span>
              </th>

              {/* NAME */}
              <th className="border border-gray-300 px-4 py-3.5 whitespace-nowrap">
                <span>Name</span>
              </th>

              {/* TYPE */}
              <th className="border border-gray-300 px-4 py-3.5 text-center whitespace-nowrap">
                <span>Type</span>
              </th>

              {/* ID */}
              <th className="border border-gray-300 px-4 py-3.5 text-center whitespace-nowrap">
                <span>ID</span>
              </th>

              {/* CLASS & BOARD */}
              <th className="border border-gray-300 px-4 py-3.5 whitespace-nowrap">
                <span>Class & Board</span>
              </th>

              {/* SUBJECTS & CLASSES */}
              <th className="border border-gray-300 px-4 py-3.5 whitespace-nowrap">
                <span>Subjects & Classes</span>
              </th>

              {/* QUALIFICATION & EXPERIENCE */}
              <th className="border border-gray-300 px-4 py-3.5 whitespace-nowrap">
                <span>Qualification & Experience</span>
              </th>

              {/* RELATIONSHIP */}
              <th className="border border-gray-300 px-4 py-3.5 whitespace-nowrap">
                <span>Relationship</span>
              </th>

              {/* OCCUPATION & ORGANIZATION */}
              <th className="border border-gray-300 px-4 py-3.5 whitespace-nowrap">
                <span>Occupation & Organization</span>
              </th>

              {/* CONTACT */}
              <th className="border border-gray-300 px-4 py-3.5 whitespace-nowrap">
                <span>Contact (Email / Phone)</span>
              </th>

              {/* ACTIONS */}
              <th className="border border-gray-300 px-4 py-3.5 text-center whitespace-nowrap">
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          {/* ================= TABLE BODY ================= */}
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

                  {/* NAME */}
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-3">

                      {/* <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 text-xs font-bold text-white shadow-sm">
                        {getInitials(user)}
                      </div> */}

                      <div className="min-w-[140px]">
                        <div className="font-semibold text-gray-900">
                          {getName(user)}
                        </div>

                        {/* {user.username && (
                          <div className="text-xs text-gray-400">
                            @{user.username}
                          </div>
                        )} */}
                      </div>

                    </div>
                  </td>

                  {/* TYPE */}
                  <td className="border border-gray-200 px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* ID */}
                  <td className="border border-gray-200 px-4 py-3 text-center font-medium text-gray-600 whitespace-nowrap">
                    {getUserId(user)}
                  </td>

                  {/* CLASS & BOARD */}
                  <td className="border border-gray-200 px-4 py-3 text-gray-600">
                    {getClassBoard(user)}
                  </td>

                  {/* SUBJECTS & CLASSES */}
                  <td className="border border-gray-200 px-4 py-3 text-gray-600 max-w-[260px]">
                    <div className="max-w-[250px] whitespace-normal">
                      {getSubjectsClasses(user)}
                    </div>
                  </td>

                  {/* QUALIFICATION & EXPERIENCE */}
                  <td className="border border-gray-200 px-4 py-3 text-gray-600">
                    {getQualificationExperience(user)}
                  </td>

                  {/* RELATIONSHIP */}
                  <td className="border border-gray-200 px-4 py-3 text-gray-600">
                    {getRelationship(user)}
                  </td>

                  {/* OCCUPATION & ORGANIZATION */}
                  <td className="border border-gray-200 px-4 py-3 text-gray-600">
                    {getOccupationOrganization(user)}
                  </td>

                  {/* CONTACT */}
                  <td className="border border-gray-200 px-4 py-3 text-gray-600 min-w-[210px]">
                    <div className="flex flex-col">
                      <span>{getEmail(user)}</span>

                      <span className="text-xs text-gray-400">
                        {getPhone(user)}
                      </span>
                    </div>
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
                  colSpan={11}
                  className="border border-gray-200 px-4 py-12 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">

                    <div className="mb-2 rounded-full bg-gray-100 p-3 text-gray-400">
                      <Trash2 size={24} />
                    </div>

                    <p className="font-medium text-gray-600">
                      No users found
                    </p>

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
  )
}

export default AllUserTable