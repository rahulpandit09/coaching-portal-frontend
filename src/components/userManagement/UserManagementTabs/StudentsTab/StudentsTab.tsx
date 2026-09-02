import React, { useMemo, useState } from "react";
import { Search, Filter, RefreshCw, GraduationCap } from "lucide-react";
import StudentsTabTable from "./StudentsTabTable";
import { IUser, UserStatus } from "@/utils/user.types";

interface StudentsTabProps {
  users: IUser[];
  onViewUser?: (user: IUser) => void;
  onEditUser?: (user: IUser) => void;
  onDeleteUser?: (user: IUser) => void;
}

const StudentsTab: React.FC<StudentsTabProps> = ({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");

  const students = useMemo(() => {
    return users.filter((user) => user.role === "Student");
  }, [users]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        student.phone.toLowerCase().includes(q) ||
        (student.studentId && student.studentId.toLowerCase().includes(q)) ||
        (student.schoolName && student.schoolName.toLowerCase().includes(q));

      const matchesClass =
        classFilter === "All" || student.className === classFilter;
      const matchesStatus =
        statusFilter === "All" || student.status === statusFilter;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, search, classFilter, statusFilter]);



  return (
    <div className="flex flex-col gap-4">
      {/* TABLE */}
      <StudentsTabTable
        students={filteredStudents}
        onViewUser={onViewUser}
        onEditUser={onEditUser}
        onDeleteUser={onDeleteUser}
      />

      {/* FOOTER */}
      {/* <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing <strong className="text-gray-700">{filteredStudents.length}</strong> of{" "}
          <strong className="text-gray-700">{students.length}</strong> students
        </span>
      </div> */}
    </div>
  );
};

export default StudentsTab;
