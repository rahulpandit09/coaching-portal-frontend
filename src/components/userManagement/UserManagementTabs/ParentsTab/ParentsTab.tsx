import React, { useMemo, useState } from "react";
import { Search, Filter, RefreshCw, UserRound } from "lucide-react";
import ParentsTabTable from "./ParentsTabTable";
import { IUser, UserStatus } from "@/utils/user.types";

interface ParentsTabProps {
  users: IUser[];
  onViewUser?: (user: IUser) => void;
  onEditUser?: (user: IUser) => void;
  onDeleteUser?: (user: IUser) => void;
}

const ParentsTab: React.FC<ParentsTabProps> = ({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [search, setSearch] = useState("");
  const [relFilter, setRelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");

  const parents = useMemo(() => {
    return users.filter((user) => user.role === "Parent");
  }, [users]);

  const filteredParents = useMemo(() => {
    return parents.filter((parent) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        parent.name.toLowerCase().includes(q) ||
        parent.email.toLowerCase().includes(q) ||
        parent.phone.toLowerCase().includes(q) ||
        (parent.studentName && parent.studentName.toLowerCase().includes(q)) ||
        (parent.occupation && parent.occupation.toLowerCase().includes(q));

      const matchesRel =
        relFilter === "All" || parent.relationship === relFilter;
      const matchesStatus =
        statusFilter === "All" || parent.status === statusFilter;

      return matchesSearch && matchesRel && matchesStatus;
    });
  }, [parents, search, relFilter, statusFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setRelFilter("All");
    setStatusFilter("All");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* TABLE */}
      <ParentsTabTable
        parents={filteredParents}
        onViewUser={onViewUser}
        onEditUser={onEditUser}
        onDeleteUser={onDeleteUser}
      />

      {/* FOOTER */}
      {/* <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing <strong className="text-gray-700">{filteredParents.length}</strong> of{" "}
          <strong className="text-gray-700">{parents.length}</strong> parents
        </span>
      </div> */}
    </div>
  );
};

export default ParentsTab;
