import { useAuth } from "@/contexts/auth"
import { Navigate } from "react-router-dom"

export default function Home() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/signin" replace />

  return <Navigate to="/dashboard/overview" replace />
}
