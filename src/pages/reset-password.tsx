import React, { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "react-toastify"
import Link from "next/link"
import { useRouter } from "next/router"
import { Lock, ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react"
import Meta from "@/layout/Meta"
import { AppConfig } from "@/utils/AppConfig"

const ResetPassword = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string().min(6, "Must be at least 6 characters").required("New Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Please confirm your password"),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      try {
        toast.success("Password has been reset successfully!")
        router.push("/signin")
      } catch (err: any) {
        toast.error("Failed to reset password")
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <>
      <Meta />
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes fieldsIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fields-in { animation: fieldsIn 0.5s 0.1s ease-out both; }
      `}</style>

      <div className="min-h-screen w-full relative flex items-center justify-center lg:justify-start overflow-hidden bg-slate-100">
        {/* Fullscreen Background Image */}
        <img
          src="/bg-image.png"
          alt="Coaching Portal Background"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ top: '6px' }}
        />

        {/* Content Container */}
        <div className="relative z-10 w-full mx-auto px-6 py-8 flex items-center justify-center lg:justify-start lg:pl-[15%] xl:pl-[18%]">
          <div className="w-full max-w-[500px] animate-fade-in-up flex flex-col items-center relative lg:left-[-35px]">

            {/* Card — matching SignInForm style */}
            <div className="w-full bg-loginWhite/95 backdrop-blur-md rounded-2xl px-8 py-5 md:px-10 md:py-6 shadow-2xl border border-loginBorder overflow-hidden relative min-h-[350px] flex flex-col justify-center">

                {/* Loading overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-loginWhite/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <div className="w-8 h-8 border-4 border-loginBlueLight border-t-loginBlue rounded-full animate-spin mb-3"></div>
                    <span className="text-sm font-medium text-loginTextDark animate-pulse">Resetting...</span>
                  </div>
                )}

                {/* Logo & Title */}
                <div className="relative flex flex-col items-center mb-4 animate-fields-in">
                  {AppConfig.logoPath && (
                    <img
                      src={AppConfig.logoPath}
                      className="h-[42px] md:h-[50px] w-auto object-contain mb-2"
                      alt={AppConfig.siteName || "Coaching Portal Logo"}
                    />
                  )}
                  <h2 className="text-xl font-bold text-loginText tracking-wide">
                    Reset Password
                  </h2>
                  <p className="text-xs text-loginMuted mt-1">
                    Define a secure new password for your account
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={formik.handleSubmit} className="space-y-3 animate-fields-in">

                  {/* New Password */}
                  <div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-5 h-5 text-loginMutedLight" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                        disabled={loading}
                        className={`w-full py-2.5 pl-11 pr-11 bg-loginInput border rounded-xl text-sm focus:border-loginBlue outline-none transition-all text-loginText placeholder-loginMutedLight ${formik.touched.password && formik.errors.password
                            ? "border-loginError"
                            : "border-loginBorder"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-loginMutedLight hover:text-loginMuted transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="text-[11px] text-loginError mt-1 ml-1 min-h-[16px]">
                      {formik.touched.password && formik.errors.password && formik.errors.password}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-5 h-5 text-loginMutedLight" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.confirmPassword}
                        disabled={loading}
                        className={`w-full py-2.5 pl-11 pr-11 bg-loginInput border rounded-xl text-sm focus:border-loginBlue outline-none transition-all text-loginText placeholder-loginMutedLight ${formik.touched.confirmPassword && formik.errors.confirmPassword
                            ? "border-loginError"
                            : "border-loginBorder"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 text-loginMutedLight hover:text-loginMuted transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="text-[11px] text-loginError mt-1 ml-1 min-h-[16px]">
                      {formik.touched.confirmPassword && formik.errors.confirmPassword && formik.errors.confirmPassword}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 mt-3 relative overflow-hidden rounded-xl font-bold text-loginWhite text-sm tracking-[0.2em] uppercase transition-all duration-300 border-0 outline-none flex items-center justify-center gap-2 ${loading
                        ? 'bg-loginMutedDark cursor-not-allowed'
                        : 'bg-gradient-to-r from-loginBlue via-loginBlue to-loginIndigo hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98]'
                      }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? "Resetting..." : <>Reset Password <ShieldCheck size={16} /></>}
                    </span>
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-4 text-center animate-fields-in">
                  <Link
                    href="/signin"
                    className="inline-flex items-center gap-2 text-xs text-loginBlueDark underline underline-offset-2 hover:text-loginBlue font-medium transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Back to Sign In
                  </Link>
                </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default ResetPassword
