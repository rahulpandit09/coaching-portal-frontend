import { useEffect } from "react"
import { useRouter } from "next/router"
import nookies from "nookies"
import { useUserStore } from "@/store/user"
import { useTokens } from "@/contexts/TokenContext"
import { clearUserDetails } from "@/utils/AppConfig"
import { logoutUser } from "@/api/auth"

const SignOut = () => {
  const router = useRouter()
  const logoutStore = useUserStore((state) => state.logout)
  const { clearTokens } = useTokens()

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call backend POST /auth/logout
        await logoutUser()
      } catch (e) {
        console.warn("Backend logout error:", e)
      } finally {
        // Clear cookies
        nookies.destroy(null, "token", { path: "/" })
        nookies.destroy(null, "access_token", { path: "/" })
        nookies.destroy(null, "refreshToken", { path: "/" })
        nookies.destroy(null, "refresh_token", { path: "/" })

        // Clear local storage & store states
        localStorage.removeItem("userData")
        localStorage.removeItem("accessToken")
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        clearUserDetails()
        clearTokens()
        logoutStore()

        // Redirect to signin
        router.replace("/signin")
      }
    }

    performLogout()
  }, [router, logoutStore, clearTokens])

  return (
    <div className="flex items-center justify-center pt-24 md:pt-48">
      <div className="text-lg font-medium text-gray-500 animate-pulse">Signing out...</div>
    </div>
  )
}

export default SignOut
