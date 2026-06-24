import { useEffect } from "react"
import { useRouter } from "next/router"
import nookies from "nookies"
import { useUserStore } from "@/store/user"
import { useTokens } from "@/contexts/TokenContext"
import { clearUserDetails } from "@/utils/AppConfig"

const SignOut = () => {
  const router = useRouter()
  const logoutStore = useUserStore((state) => state.logout)
  const { clearTokens } = useTokens()

  useEffect(() => {
    // Clear cookies
    nookies.destroy(null, "token", { path: "/" })
    nookies.destroy(null, "refreshToken", { path: "/" })

    // Clear local states
    localStorage.removeItem("userData")
    localStorage.removeItem("accessToken")
    clearUserDetails()
    clearTokens()
    logoutStore()

    // Redirect to signin
    router.replace("/signin")
  }, [router, logoutStore, clearTokens])

  return (
    <div className="flex items-center justify-center pt-24 md:pt-48">
      <div className="text-lg font-medium text-gray-500 animate-pulse">Signing out...</div>
    </div>
  )
}

export default SignOut
