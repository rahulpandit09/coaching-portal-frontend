import { IAppConfig, INavigationItem, IUser } from "@/utils/types"
import { parseCookies } from "nookies"

// Application Metadata
export const MetaData = {
  title: "Coaching Portal",
  description: "A premium client-coach growth portal.",
}

// Application Configuration
export const AppConfig: IAppConfig = {
  siteName: "GrowPortal",
  logoPath: "/assets/images/logo.svg",
  imagePath: "/assets/images",
}

// Navigation Items
export const UserNavigation: INavigationItem[] = [
  { name: "My Profile", href: "/profile" },
  { name: "Settings", href: "/settings" },
  { name: "Logout", href: "/logout" },
]

export const getUserImage = (user: IUser): string => {
  const storedAvatar = sessionStorage.getItem(`avatar_${user.emailAddress}`)
  return storedAvatar || ""
}

export const saveUserDetails = (user: IUser): void => {
  localStorage.setItem("currentUser", JSON.stringify(user))
  sessionStorage.setItem(`avatar_${user.emailAddress}`, "")
}

export const clearUserDetails = (): void => {
  localStorage.removeItem("currentUser")
  localStorage.removeItem("currentUserEmail")
}
