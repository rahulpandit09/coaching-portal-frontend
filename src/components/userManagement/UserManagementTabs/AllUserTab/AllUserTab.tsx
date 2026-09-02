import React, { useMemo, useState } from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import AllUserTable from "./AllUserTable";
import { IUser, UserRole, UserStatus } from "@/utils/user.types";

interface AllUserTabProps {
  users: IUser[];
  onViewUser?: (user: IUser) => void;
  onEditUser?: (user: IUser) => void;
  onDeleteUser?: (user: IUser) => void;
}

const AllUserTab: React.FC<AllUserTabProps> = ({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | UserRole>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.phone.toLowerCase().includes(q) ||
        user.id.toString().includes(q);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* TABLE */}
      <AllUserTable
        users={filteredUsers}
        onViewUser={onViewUser}
        onEditUser={onEditUser}
        onDeleteUser={onDeleteUser}
      />

      {/* FOOTER / RECORD COUNT */}
      {/* <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing <strong className="text-gray-700">{filteredUsers.length}</strong> of{" "}
          <strong className="text-gray-700">{users.length}</strong> users
        </span>
      </div> */}
    </div>
  );
};

export default AllUserTab;
