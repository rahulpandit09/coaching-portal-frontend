import { useAuth } from "@/contexts/auth"
import { Navigate } from "react-router-dom"

type Props = {
  requireSubMenu?: string
  allowRoles?: number[]
  children: JSX.Element
}

export default function AccessWrapper({
  requireSubMenu,
  allowRoles,
  children,
}: Props) {
  const { loading, hasRole, hasSubMenu } = useAuth()

  if (loading) return null

  if (allowRoles && !allowRoles.some(hasRole)) {
    return <Navigate to="/not-found" replace />
  }

  if (requireSubMenu && !hasSubMenu(requireSubMenu)) {
    return <Navigate to="/not-found" replace />
  }

  return children
}
