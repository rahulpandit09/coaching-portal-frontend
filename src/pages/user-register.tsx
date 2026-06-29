import React, { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "react-toastify"
import Link from "next/link"
import { useRouter } from "next/router"
import { Mail, Lock, User, UserPlus } from "lucide-react"

const UserRegister = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "client",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Must be at least 6 characters")
        .required("Password is required"),
      role: Yup.string()
        .oneOf(["coach", "client"])
        .required("Please select your role"),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      try {
        toast.success("Account created successfully! Please sign in.")
        router.push("/signin")
      } catch (err: any) {
        toast.error("Registration failed")
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
        <div className="text-center mb-8">
          <h2
            className="
            text-3xl
            sm:text-4xl
            md:text-5xl
            font-bold
            text-[#1f3f93]
          "
          >
            Create Account
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
            Join GrowPortal to track your goals
          </p>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-5">

          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-4">

            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block mb-2 text-sm font-semibold text-[#1f3f93]"
              >
                First Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter first name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.firstName}
                  className={`w-full h-12 pl-10 pr-3 rounded-xl border bg-white outline-none focus:border-blue-400 ${formik.touched.firstName && formik.errors.firstName
                    ? "border-red-500"
                    : "border-blue-200"
                    }`}
                />
              </div>

              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block mb-2 text-sm font-semibold text-[#1f3f93]"
              >
                Last Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter last name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.lastName}
                  className={`w-full h-12 pl-10 pr-3 rounded-xl border bg-white outline-none focus:border-blue-400 ${formik.touched.lastName && formik.errors.lastName
                    ? "border-red-500"
                    : "border-blue-200"
                    }`}
                />
              </div>

              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-semibold text-[#1f3f93]"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

              <input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`w-full h-12 pl-10 pr-3 rounded-xl border bg-white outline-none focus:border-blue-400 ${formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : "border-blue-200"
                  }`}
              />
            </div>

            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-semibold text-[#1f3f93]"
            >
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className={`w-full h-12 pl-10 pr-3 rounded-xl border bg-white outline-none focus:border-blue-400 ${formik.touched.password && formik.errors.password
                  ? "border-red-500"
                  : "border-blue-200"
                  }`}
              />
            </div>

            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.password}
              </p>
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
                SIGN UP <UserPlus size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UserRegister