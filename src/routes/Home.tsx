import { useAuth } from "@/contexts/auth"
import { Navigate } from "react-router-dom"

export default function Home() {
  const { user, permissions } = useAuth()

  if (!user) return <Navigate to="/signin" replace />

  const roleIds = permissions?.roleIds || []
  const roleName = user.roleName || user.role

  // Check roleIds from permissions, or fall back to user role properties
  if (roleIds.includes(1) || user.isSupervisor || roleName === "Admin" || user.roleId === 1) {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (roleIds.includes(2) || roleName === "Coach" || user.roleId === 2) {
    return <Navigate to="/coach/dashboard" replace />
  }
  if (roleIds.includes(3) || roleName === "Client" || user.roleId === 3) {
    return <Navigate to="/client/dashboard" replace />
  }

  return <Navigate to="/dashboard" replace />
}
