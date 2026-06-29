import React, { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "react-toastify"
import Link from "next/link"
import { useRouter } from "next/router"
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react"

const ResetPassword = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-cover bg-center bg-no-repeat relative backdrop:blur-sm"
      style={{
        backgroundImage: "url('/coachingimage.png')",
      }}
    >
      {/* White Overlay */}
      <div className="absolute inset-0 bg-white/70"></div>

      {/* Card */}
      <div
        className="
        relative z-10
        w-full
        max-w-md
        sm:max-w-lg
        bg-primary-content
        rounded-3xl
        shadow-[0_20px_50px_rgba(0,0,0,0.40)]
        px-6 sm:px-8 md:px-10
        py-6 sm:py-8 md:py-10
      "
      >
        {/* Top dots like login */}
        <div className="flex justify-center gap-2 mb-4 sm:mb-6">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <h2
            className="
            text-3xl
            sm:text-4xl
            md:text-5xl
            font-bold
            text-[#1f3f93]
          "
          >
            Reset Password
          </h2>

          <p
            className="
            text-gray-500
            mt-2
            text-sm
            sm:text-base
            md:text-lg
          "
          >
            Define a secure new password for your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-5 sm:space-y-6">

          {/* New Password */}
          <div>
            <label className="block mb-2 sm:mb-3 font-semibold text-[#1f3f93] text-sm sm:text-base">
              New Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3.5 top-4 h-5 w-5 text-gray-400" />

              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className={`w-full h-12 sm:h-14 pl-11 px-4 rounded-xl border bg-white outline-none focus:border-blue-400
              ${formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : "border-blue-200"
                  }`}
              />
            </div>

            {formik.touched.password && formik.errors.password && (
              <span className="text-red-500 text-xs mt-1 block">
                {formik.errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 sm:mb-3 font-semibold text-[#1f3f93] text-sm sm:text-base">
              Confirm Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3.5 top-4 h-5 w-5 text-gray-400" />

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                className={`w-full h-12 sm:h-14 pl-11 px-4 rounded-xl border bg-white outline-none focus:border-blue-400
              ${formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                    ? "border-red-500"
                    : "border-blue-200"
                  }`}
              />
            </div>

            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <span className="text-red-500 text-xs mt-1 block">
                  {formik.errors.confirmPassword}
                </span>
              )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="
            w-full
            h-12 sm:h-14
            rounded-xl
            text-white
            font-semibold
            text-base sm:text-lg
            bg-gradient-to-r
            from-[#2F65F5]
            to-[#A78BFA]
            hover:opacity-90
            transition
            flex items-center justify-center gap-2
          "
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                Reset Password <ShieldCheck size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
