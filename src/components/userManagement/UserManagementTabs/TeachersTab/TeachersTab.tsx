import React, { useMemo, useState } from "react";
import { Search, Filter, RefreshCw, UserRoundCheck } from "lucide-react";
import TeachersTabTable from "./TeachersTabTable";
import { IUser, UserStatus } from "@/utils/user.types";

interface TeachersTabProps {
  users: IUser[];
  onViewUser?: (user: IUser) => void;
  onEditUser?: (user: IUser) => void;
  onDeleteUser?: (user: IUser) => void;
}

const TeachersTab: React.FC<TeachersTabProps> = ({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");

  const teachers = useMemo(() => {
    return users.filter((user) => user.role === "Teacher");
  }, [users]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        teacher.name.toLowerCase().includes(q) ||
        teacher.email.toLowerCase().includes(q) ||
        teacher.phone.toLowerCase().includes(q) ||
        (teacher.employeeId && teacher.employeeId.toLowerCase().includes(q)) ||
        (teacher.teachingSubjects &&
          teacher.teachingSubjects.toLowerCase().includes(q)) ||
        (teacher.specialization &&
          teacher.specialization.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "All" || teacher.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teachers, search, statusFilter]);


  return (
    <div className="flex flex-col gap-4">
      {/* TABLE */}
      <TeachersTabTable
        teachers={filteredTeachers}
        onViewUser={onViewUser}
        onEditUser={onEditUser}
        onDeleteUser={onDeleteUser}
      />

      {/* FOOTER */}
      {/* <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing <strong className="text-gray-700">{filteredTeachers.length}</strong> of{" "}
          <strong className="text-gray-700">{teachers.length}</strong> teachers
        </span>
      </div> */}
    </div>
  );
};

export default TeachersTab;
