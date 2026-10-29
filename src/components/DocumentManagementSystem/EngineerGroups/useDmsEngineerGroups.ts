// Engineer Groups state and handlers.
// Extracted verbatim from useDmsWorkspace.ts – no behavioural changes.

import { useState, useCallback } from "react";
import api from "@/api/axiosInstance";
import type { EngineerGroup } from "../types";
import { parseStringList } from "../hooks/dmsMappers";
import { getLoggedInUserId } from "../hooks/dmsUser";

export function useDmsEngineerGroups({
  setToast,
}: {
  setToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}) {
  const [engineerGroups, setEngineerGroups] = useState<EngineerGroup[]>([]);
  const [groupPage, setGroupPage] = useState(1);
  const [groupLimit, setGroupLimit] = useState(10);
  const [groupTotalCount, setGroupTotalCount] = useState(0);

  const [dashboardCounts, setDashboardCounts] = useState({
    total_groups: 0,
    assigned_engineers: 0,
    total_directory: 0,
    publisher_ready: "",
    publisher_ready_subtitle: "",
  });

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<EngineerGroup | null>(null);
  const [groupSearch, setGroupSearch] = useState("");
  const [groupFilterDept, setGroupFilterDept] = useState("All");
  const [groupToDelete, setGroupToDelete] = useState<EngineerGroup | null>(null);

  const fetchEngineerGroups = useCallback(async () => {
    try {
      const response = await api.get("/dms-group/get-all", {
        params: {
          page: groupPage,
          limit: groupLimit,
        },
      });

      if (response.data.status === "success") {
        const groupsData = response.data.data || [];
        const mappedGroups: EngineerGroup[] = groupsData.map((item: any) => ({
          id: String(item.group_id),
          name: item.group_name,
          description: item.description,
          department: item.discipline_dept,
          members: parseStringList(item.member_engineers),
          createdAt: item.created_at || "",
          createdBy: item.created_by_name || "Admin",
        }));
        setEngineerGroups(mappedGroups);
        setGroupTotalCount(response.data.total_count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch engineer groups:", error);
    }
  }, [groupPage, groupLimit]);

  const fetchDashboardCounts = useCallback(async () => {
    try {
      const response = await api.get("/dms-group/dashboard-counts");

      if (response.data?.status === "success") {
        setDashboardCounts(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch engineer group dashboard counts:", error);
    }
  }, []);

  const handleSaveGroup = async (groupData: {
    id?: string;
    name: string;
    description: string;
    department?: string;
    members: string[];
  }) => {
    if (!groupData.name.trim()) {
      setToast("Group name is required.", "error");
      return;
    }

    if (groupData.members.length === 0) {
      setToast("Please select at least one engineer.", "error");
      return;
    }

    try {
      // =========================
      // UPDATE GROUP
      // =========================
      if (groupData.id) {
        await api.put(
          `/dms-group/update/${Number(groupData.id)}`,
          {
            group_name: groupData.name.trim(),
            discipline_dept: groupData.department || "OP",
            description: groupData.description.trim(),
            member_engineers: groupData.members,
            member_count: groupData.members.length,
            updated_by: getLoggedInUserId(),
          }
        );

        await fetchEngineerGroups();
        await fetchDashboardCounts();

        setShowCreateGroupModal(false);
        setEditingGroup(null);

        setToast(
          `Engineer group "${groupData.name}" updated successfully.`,
          "success"
        );

        return;
      }

      // =========================
      // CREATE GROUP
      // =========================
      const response = await api.post<{ status: string; message?: string; group_id: number }>(
        "/dms-group/create",
        {
          group_name: groupData.name.trim(),
          discipline_dept: groupData.department || "OP",
          description: groupData.description.trim(),
          member_engineers: groupData.members,
          member_count: groupData.members.length,
          created_by: getLoggedInUserId(),
        }
      );

      if (response.data.status !== "success") {
        setToast("Failed to create engineer group.", "error");
        return;
      }

      await fetchEngineerGroups();
      await fetchDashboardCounts();

      setShowCreateGroupModal(false);
      setEditingGroup(null);

      setToast(
        `Engineer group "${groupData.name.trim()}" created successfully.`,
        "success"
      );
    } catch (error: any) {
      console.error("Failed to save engineer group:", error);

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to save engineer group.";

      const errorMessage = Array.isArray(message)
        ? message.map((item: any) => item.msg).join(", ")
        : message;

      setToast(errorMessage, "error");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    const grp = engineerGroups.find((g) => g.id === groupId);

    if (!grp) {
      setToast("Engineer group not found.", "error");
      return;
    }

    const numericGroupId = Number(groupId);

    if (!Number.isInteger(numericGroupId)) {
      setToast("Invalid engineer group ID.", "error");
      return;
    }

    try {
      await api.delete(`/dms-group/delete/${numericGroupId}`, {
        params: {
          deleted_by: getLoggedInUserId(),
        },
      });

      await fetchEngineerGroups();
      await fetchDashboardCounts();

      setGroupToDelete(null);

      setToast(
        `Engineer group "${grp.name}" deleted successfully.`,
        "success"
      );
    } catch (error: any) {
      console.error("Failed to delete engineer group:", error);

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to delete engineer group.";

      const errorMessage = Array.isArray(message)
        ? message.map((item: any) => item.msg).join(", ")
        : message;

      setToast(errorMessage, "error");
    }
  };

  return {
    engineerGroups,
    setEngineerGroups,
    groupPage,
    setGroupPage,
    groupLimit,
    groupTotalCount,
    dashboardCounts,
    showCreateGroupModal,
    setShowCreateGroupModal,
    editingGroup,
    setEditingGroup,
    groupSearch,
    setGroupSearch,
    groupFilterDept,
    setGroupFilterDept,
    groupToDelete,
    setGroupToDelete,
    fetchEngineerGroups,
    fetchDashboardCounts,
    handleSaveGroup,
    handleDeleteGroup,
  };
}
