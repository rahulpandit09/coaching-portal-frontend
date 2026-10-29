import React from "react"
import { useAuth } from "@/contexts/auth"
import { Navigate } from "react-router-dom"

type Props = {
  requireMenu?: string | string[]
  requireSubMenu?: string | string[]
  allowRoles?: number[]
  children: React.ReactNode | JSX.Element
}

export default function AccessWrapper({
  requireMenu,
  requireSubMenu,
  allowRoles,
  children,
}: Props) {
  const { user, loading, hasRole, hasMenu, hasSubMenu, permissions } = useAuth()

  if (loading) return null

  // Role check failure
  if (allowRoles && !allowRoles.some(hasRole)) {
    console.warn("⛔ [AccessWrapper] Access Denied by Role:", {
      requiredRoles: allowRoles,
      userRoleIds: permissions?.roleIds,
      user: user,
    })
    return <Navigate to="/not-found" replace />
  }

  // Main menu check failure
  if (requireMenu) {
    const isMenuAllowed = Array.isArray(requireMenu)
      ? requireMenu.some(hasMenu)
      : hasMenu(requireMenu)
    if (!isMenuAllowed) {
      console.warn("⛔ [AccessWrapper] Access Denied by Menu URL:", {
        requireMenu,
        availableMenus: Array.from(permissions?.menus || []),
        user: user,
      })
      return <Navigate to="/not-found" replace />
    }
  }

  // Sub menu check failure
  if (requireSubMenu) {
    const isSubMenuAllowed = Array.isArray(requireSubMenu)
      ? requireSubMenu.some(hasSubMenu)
      : hasSubMenu(requireSubMenu)
    if (!isSubMenuAllowed) {
      console.warn("⛔ [AccessWrapper] Access Denied by SubMenu URL:", {
        requireSubMenu,
        availableSubMenus: Array.from(permissions?.subMenus || []),
        user: user,
      })
      return <Navigate to="/not-found" replace />
    }
  }

  console.log("✅ [AccessWrapper] Access Granted for:", {
    requireSubMenu,
    requireMenu,
    allowRoles,
    availableSubMenus: Array.from(permissions?.subMenus || []),
  })

  return <>{children}</>
}
