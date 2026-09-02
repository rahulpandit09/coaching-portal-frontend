import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import nookies from "nookies"
import { useUserStore } from "../store/user"
import { IUser } from "@/utils/types"
import { extractPermissions, PermissionMap } from "@/utils/permissionUtils"
import { formatPhotoUrl } from "@/utils/photoUtils"

interface AuthContextType {
  user: IUser | null
  username: string | null
  loading: boolean
  permissions: PermissionMap | null
  updateUser: (updatedUser: IUser) => void
  updateUserProfilePhoto: (photoUrl: string | null) => void
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
  updateUser: () => {},
  updateUserProfilePhoto: () => {},
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
    const PUBLIC_ROUTES = ["/signin", "/forgot-password", "/reset-password", "/user-register","/verify-otp","/home"]
    const path = router.pathname

    if (!token && !PUBLIC_ROUTES.includes(path)) {
      router.push("/signin")
      return
    }

    const hydrateUser = (userData: IUser) => {
      const email = userData.emailAddress || (userData.username?.includes("@") ? userData.username : undefined)
      let firstName = userData.firstName
      if ((!firstName || firstName === "Client" || firstName === "Admin" || firstName === "Coach") && email) {
        const prefix = email.split("@")[0]
        const cleanName = prefix.split(/[\._\-0-9]/)[0]
        if (cleanName && cleanName.length > 1) {
          firstName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
        }
      }

      const roleId = userData.roleId || (userData.roleName === "Client" || userData.role === "Client" ? 3 : userData.roleName === "Coach" || userData.role === "Coach" ? 2 : 1)

      const rawPhoto = userData.profilePhoto || userData.avatarUrl || (userData as any).profile_image
      const photoUrl = rawPhoto ? formatPhotoUrl(rawPhoto) || undefined : undefined

      const needsEnrichment =
        email !== userData.emailAddress ||
        (firstName && firstName !== userData.firstName) ||
        roleId !== userData.roleId ||
        (photoUrl && photoUrl !== userData.profilePhoto)

      const enrichedUser: IUser = needsEnrichment
        ? {
            ...userData,
            emailAddress: email,
            firstName: firstName || userData.firstName || "User",
            roleId: roleId,
            profilePhoto: photoUrl || userData.profilePhoto,
            avatarUrl: photoUrl || userData.avatarUrl,
          }
        : userData

      // Prevent infinite re-render loop if user state is already set and matching
      if (
        user &&
        user.userId === enrichedUser.userId &&
        user.emailAddress === enrichedUser.emailAddress &&
        user.firstName === enrichedUser.firstName &&
        user.profilePhoto === enrichedUser.profilePhoto
      ) {
        setLoading(false)
        return
      }

      setUser(enrichedUser)
      if (needsEnrichment || !storeUser) {
        setUserStore(enrichedUser)
      }
      setPermissions(extractPermissions(enrichedUser.rolePermissions || []))
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
  }, [router, storeUser, setUserStore, user])

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

  const updateUser = (updatedUser: IUser) => {
    setUser(updatedUser)
    setUserStore(updatedUser)
    if (typeof window !== "undefined") {
      localStorage.setItem("userData", JSON.stringify(updatedUser))
    }
  }

  const updateUserProfilePhoto = (photoUrl: string | null) => {
    if (!user) return
    const updated = {
      ...user,
      profilePhoto: photoUrl || undefined,
      avatarUrl: photoUrl || undefined,
    }
    updateUser(updated)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        username: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : null,
        loading,
        permissions,
        updateUser,
        updateUserProfilePhoto,
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
