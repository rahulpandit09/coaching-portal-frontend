import React, { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "react-toastify"
import Link from "next/link"
import { useRouter } from "next/router"
import { Mail, ArrowLeft, Send } from "lucide-react"

const ForgotPassword = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Email is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      try {
        toast.success("Password reset link sent to your email!")
        router.push("/reset-password")
      } catch (err: any) {
        toast.error("Failed to send link")
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
        {/* Top dots */}
        <div className="flex justify-center gap-2 mb-4 sm:mb-6">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
        </div>

        {/* Header */}
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
            Forgot Password
          </h2>

          <p
            className="
            mt-2
            text-gray-500
            text-sm
            sm:text-base
            md:text-lg
          "
          >
            Enter your email and we’ll send you a reset link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-5 sm:space-y-6">

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-2 sm:mb-3 font-semibold text-[#1f3f93] text-sm sm:text-base"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-4 h-5 w-5 text-gray-400" />

              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`w-full h-12 sm:h-14 pl-11 pr-3 rounded-xl border bg-white outline-none focus:border-blue-400 ${formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : "border-blue-200"
                  }`}
              />
            </div>

            {formik.touched.email && formik.errors.email && (
              <span className="text-red-500 text-xs mt-1 block">
                {formik.errors.email}
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
                Send Reset Link <Send size={16} />
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
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword
