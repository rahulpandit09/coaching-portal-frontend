import { useAuth } from "@/contexts/auth"
import { Navigate } from "react-router-dom"

export default function Home() {
  const { user, permissions } = useAuth()

  if (!user) return <Navigate to="/signin" replace />

  const roleIds = permissions?.roleIds || []

  // Role mappings:
  // Role ID 1: Admin
  // Role ID 2: Coach
  // Role ID 3: Client / Coachee
  if (roleIds.includes(1)) {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (roleIds.includes(2)) {
    return <Navigate to="/coach/dashboard" replace />
  }
  if (roleIds.includes(3)) {
    return <Navigate to="/client/dashboard" replace />
  }

  // Fallback if role is not mapped
  return <Navigate to="/profile" replace />
}
