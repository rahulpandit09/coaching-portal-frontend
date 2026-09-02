import { useState } from "react"
import nookies from "nookies"
import { Formik, Form, Field, ErrorMessage, FormikValues } from "formik"
import { useRouter } from "next/router"
import * as Yup from "yup"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import { AppConfig } from "@/utils/AppConfig"
import { loginUser } from "@/api/auth"
import axiosInstance from "@/api/axiosInstance"
import { API_ENDPOINTS } from "@/api/endpoints"
import { useUserStore } from "@/store/user"
import { formatPhotoUrl } from "@/utils/photoUtils"

interface ISignInFormProps { }

const decodeJwt = (token: string) => {
    try {
        const base64Url = token.split(".")[1]
        if (!base64Url) return {}
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        )
        return JSON.parse(jsonPayload)
    } catch (e) {
        return {}
    }
}

export const SignInForm: React.FunctionComponent<ISignInFormProps> = ({ }) => {
    const router = useRouter()
    const [loginErrorMessage, setLoginErrorMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const onSignIn = async (signInValues: FormikValues) => {
        setLoading(true)
        setLoginErrorMessage("")

        try {
            const response = await loginUser(signInValues.email, signInValues.password)
            const { access_token, refresh_token } = response?.data || {}

            if (!access_token) {
                setLoginErrorMessage("Authentication failed: No access token received.")
                return
            }

            // Save tokens to cookies (nookies) so AuthProvider recognizes user is logged in
            nookies.set(null, "token", access_token, { path: "/", maxAge: 86400 })
            nookies.set(null, "access_token", access_token, { path: "/", maxAge: 86400 })
            if (refresh_token) {
                nookies.set(null, "refreshToken", refresh_token, { path: "/", maxAge: 604800 })
                nookies.set(null, "refresh_token", refresh_token, { path: "/", maxAge: 604800 })
            }

            // Save tokens to localStorage
            if (typeof window !== "undefined") {
                localStorage.setItem("accessToken", access_token)
                localStorage.setItem("token", access_token)
                if (refresh_token) localStorage.setItem("refreshToken", refresh_token)
            }

            // Decode token to get real user_id and role_id from backend payload
            const decoded: any = decodeJwt(access_token)
            const roleId = decoded.role_id || 1
            const roleName = roleId === 3 ? "Client" : roleId === 2 ? "Coach" : "Admin"

            const decodedUserId =
                decoded.user_id ||
                decoded.id ||
                decoded.userId ||
                (decoded.sub && !isNaN(Number(decoded.sub)) ? Number(decoded.sub) : undefined)

            // Fetch fresh profile details from backend if available
            let fetchedUserProfile: any = null
            try {
                const profileRes = await axiosInstance.get(API_ENDPOINTS.USERS.PROFILE)
                fetchedUserProfile = profileRes?.data?.data || profileRes?.data || {}
            } catch (e) {
                // Non-critical fallback if profile endpoint is not available
            }

            // Extract user info from fetched profile, backend login response, or token payload
            const backendUser =
                fetchedUserProfile ||
                response?.data?.user ||
                response?.data?.user_data ||
                (response?.data?.data ? response.data.data : response?.data) ||
                {}

            const userEmail =
                backendUser.emailAddress ||
                backendUser.email ||
                decoded.email ||
                decoded.email_address ||
                (signInValues.email.includes("@") ? signInValues.email : undefined)

            let derivedFirstName =
                backendUser.firstName ||
                backendUser.first_name ||
                decoded.first_name ||
                decoded.firstName

            let derivedLastName =
                backendUser.lastName ||
                backendUser.last_name ||
                decoded.last_name ||
                decoded.lastName

            if (!derivedFirstName && userEmail) {
                const emailPrefix = userEmail.split("@")[0]
                const cleanName = emailPrefix.split(/[\._\-0-9]/)[0]
                if (cleanName && cleanName.length > 1) {
                    derivedFirstName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
                }
            }

            const rawPhoto =
                backendUser.profile_image ||
                backendUser.profilePhoto ||
                backendUser.profile_photo ||
                backendUser.avatarUrl ||
                decoded.profile_image ||
                decoded.profile_photo ||
                decoded.profilePhoto

            const photoUrl = rawPhoto ? formatPhotoUrl(rawPhoto) || undefined : undefined

            // Build user object dynamically from API response & token payload
            const userData = {
                userId:
                    backendUser.userId ||
                    backendUser.id ||
                    backendUser.user_id ||
                    decodedUserId ||
                    roleId ||
                    3,
                username: backendUser.username || decoded.username || signInValues.email,
                emailAddress: userEmail,
                firstName: derivedFirstName || roleName,
                lastName: derivedLastName || (derivedFirstName ? "User" : "User"),
                role: roleName,
                roleName: roleName,
                profilePhoto: photoUrl,
                avatarUrl: photoUrl,
                isSupervisor: roleId === 1,
                rolePermissions:
                    response?.data?.user?.rolePermissions ||
                    response?.data?.rolePermissions ||
                    backendUser.rolePermissions ||
                    [],
            }

            if (typeof window !== "undefined") {
                localStorage.setItem("userData", JSON.stringify(userData))
            }

            useUserStore.getState().setUser(userData)
            if (access_token && refresh_token) {
                useUserStore.getState().login(access_token, refresh_token)
            }

            router.replace("/")
        } catch (error: any) {
            setLoginErrorMessage(
                error?.response?.data?.detail ||
                error?.response?.data?.statusMessage ||
                error?.response?.data?.message ||
                "Invalid username or password. Please try again."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative">
            <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes fieldsIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.2) 20%,
            rgba(255, 255, 255, 0.5) 60%,
            rgba(255, 255, 255, 0)
          );
          animation: shimmer 2s infinite;
        }
        .animate-fields-in {
          animation: fieldsIn 0.5s 0.1s ease-out both;
        }
      `}</style>
            <div className="bg-loginWhite/95 backdrop-blur-md rounded-2xl px-8 py-5 md:px-10 md:py-6 w-full shadow-2xl border border-loginBorder overflow-hidden relative">
                <div className="relative flex flex-col items-center mb-4 animate-fields-in">
                    {AppConfig.logoPath && (
                        <img
                            src={AppConfig.logoPath}
                            className="h-[42px] md:h-[50px] w-auto object-contain mb-2"
                            alt={AppConfig.siteName || "Coaching Portal Logo"}
                        />
                    )}
                    <h2 className="text-xl font-bold text-loginText tracking-wide">
                        Coaching Portal
                    </h2>
                </div>

                {loading && (
                    <div className="absolute inset-0 bg-loginWhite/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                        <div className="w-8 h-8 border-4 border-loginBlueLight border-t-loginBlue rounded-full animate-spin mb-3"></div>
                        <span className="text-sm font-medium text-loginTextDark animate-pulse">Logging....</span>
                    </div>
                )}

                {loginErrorMessage && (
                    <div className="bg-loginErrorBg border border-loginErrorBorder text-loginErrorText p-2.5 rounded-lg mb-4 text-xs font-medium flex items-center gap-2 animate-fields-in">
                        <span className="w-2 h-2 rounded-full bg-loginError animate-pulse"></span>
                        {loginErrorMessage}
                    </div>
                )}

                <Formik
                    initialValues={{
                        email: "",
                        password: "",
                    }}
                    validationSchema={Yup.object({
                        email: Yup.string()
                            .required("Username or Email is required.")
                            .test(
                                "is-valid-username-or-email",
                                "Enter a valid Username or Email ID.",
                                (value) => {
                                    if (!value) return false
                                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                                    const usernameRegex = /^[a-zA-Z0-9_]+$/
                                    return emailRegex.test(value) || usernameRegex.test(value)
                                },
                            ),
                        password: Yup.string().required("Password is required."),
                    })}
                    onSubmit={async (values, { setSubmitting }) => {
                        await onSignIn(values)
                        setSubmitting(false)
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-3 animate-fields-in">

                            {/* Email */}
                            <div>
                                <div className="relative flex items-center">
                                    <User className="absolute left-3.5 w-5 h-5 text-loginMutedLight" />
                                    <Field
                                        type="text"
                                        name="email"
                                        placeholder="Username or Email"
                                        className="w-full py-2.5 pl-11 pr-4 bg-loginInput border border-loginBorder rounded-xl text-sm focus:border-loginBlue outline-none transition-all text-loginText placeholder-loginMutedLight"
                                        disabled={isSubmitting || loading}
                                    />
                                </div>
                                <div className="text-[11px] text-loginError mt-1 ml-1 min-h-[16px]">
                                    <ErrorMessage name="email" />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3.5 w-5 h-5 text-loginMutedLight" />
                                    <Field
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        className="w-full py-2.5 pl-11 pr-11 bg-loginInput border border-loginBorder rounded-xl text-sm focus:border-loginBlue outline-none transition-all text-loginText placeholder-loginMutedLight"
                                        disabled={isSubmitting || loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 text-loginMutedLight hover:text-loginMuted transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                <div className="text-[11px] text-loginError mt-1 ml-1 min-h-[16px]">
                                    <ErrorMessage name="password" />
                                </div>
                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="text-xs text-loginBlueDark underline underline-offset-2 hover:text-loginBlue font-medium transition-colors -mt-1"
                                    onClick={() => router.push("/forgot-password")}
                                    disabled={isSubmitting || loading}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                className={`w-full py-2.5 mt-3 relative overflow-hidden rounded-xl font-bold text-loginWhite text-sm tracking-[0.2em] uppercase transition-all duration-300 border-0 outline-none ${loading
                                    ? 'bg-loginMutedDark cursor-not-allowed'
                                    : 'bg-gradient-to-r from-loginBlue via-loginBlue to-loginIndigo hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98]'
                                    }`}
                                disabled={isSubmitting || loading}
                            >
                                {!loading && <div className="animate-shimmer"></div>}
                                <span className="relative z-10">
                                    {loading ? "Accessing..." : "Log In"}
                                </span>
                            </button>

                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}

export default SignInForm

