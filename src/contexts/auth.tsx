import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import nookies from "nookies"
import { useUserStore } from "../store/user"
import { IUser } from "@/utils/types"
import { extractPermissions, PermissionMap } from "@/utils/permissionUtils"
import { verify } from "crypto"

interface AuthContextType {
  user: IUser | null
  username: string | null
  loading: boolean
  permissions: PermissionMap | null
  hasRole: (roleId: number) => boolean
  hasMenu: (menuUrl: string) => boolean
  hasSubMenu: (subMenuUrl: string) => boolean
  hasRoleAccess: (roleId: number, subMenuId: number) => boolean
  getRolesForSubMenu: (subMenuId: number) => number[]
  logSubMenuClick: (subMenuUrl: string) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  username: null,
  loading: true,
  permissions: null,
  hasRole: () => false,
  hasMenu: () => false,
  hasSubMenu: () => false,
  hasRoleAccess: () => false,
  getRolesForSubMenu: () => [],
  logSubMenuClick: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<IUser | null>(null)
  const [permissions, setPermissions] = useState<PermissionMap | null>(null)
  const [loading, setLoading] = useState(true)

  const { user: storeUser, setUser: setUserStore } = useUserStore()

  useEffect(() => {
    const token = nookies.get(null).token || localStorage.getItem("accessToken")
    const PUBLIC_ROUTES = ["/signin", "/forgot-password", "/reset-password", "/user-register","/verify-otp"]
    const path = router.pathname

    if (!token && !PUBLIC_ROUTES.includes(path)) {
      router.push("/signin")
      return
    }

    const hydrateUser = (userData: IUser) => {
      setUser(userData)
      setUserStore(userData)
      setPermissions(extractPermissions(userData.rolePermissions || []))
      setLoading(false)
    }

    if (storeUser) {
      hydrateUser(storeUser)
      return
    }

    const savedUser = localStorage.getItem("userData")
    if (savedUser) {
      hydrateUser(JSON.parse(savedUser))
    } else if (!PUBLIC_ROUTES.includes(path)) {
      router.push("/signin")
    } else {
      setLoading(false)
    }
  }, [router, storeUser, setUserStore])

  const roleIds = permissions?.roleIds || []

  const hasRole = (roleId: number) => roleIds.includes(roleId)

  const hasMenu = (menuUrl: string) => permissions?.menus.has(menuUrl) ?? false

  const hasSubMenu = (subMenuUrl: string) => permissions?.subMenus.has(subMenuUrl) ?? false

  const hasRoleAccess = (roleId: number, subMenuId: number) => permissions?.roleSubMenuMap.get(roleId)?.has(subMenuId) ?? false

  const getRolesForSubMenu = (subMenuId: number): number[] => {
    if (!permissions) return []
    const roles: number[] = []
    permissions.roleSubMenuMap.forEach((subMenus, roleId) => {
      if (subMenus.has(subMenuId)) roles.push(roleId)
    })
    return roles
  }

  const logSubMenuClick = (subMenuUrl: string) => {
    console.log("📌 SubMenu Clicked:", subMenuUrl)
    console.log("👤 User:", `${user?.firstName} ${user?.lastName}`)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        username: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : null,
        loading,
        permissions,
        hasRole,
        hasMenu,
        hasSubMenu,
        hasRoleAccess,
        getRolesForSubMenu,
        logSubMenuClick,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
