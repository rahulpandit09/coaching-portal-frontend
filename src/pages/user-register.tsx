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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl border border-gray-200 shadow-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-black">
            Create Account
          </h2>
          <p className="mt-2 text-gray-500 text-base">
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
                className="block mb-2 text-sm font-semibold text-black"
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
                  className={`w-full h-12 pl-10 pr-3 rounded-xl border bg-gray-50 outline-none ${formik.touched.firstName && formik.errors.firstName
                      ? "border-red-500"
                      : "border-gray-300"
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
                className="block mb-2 text-sm font-semibold text-black"
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
                  className={`w-full h-12 pl-10 pr-3 rounded-xl border bg-gray-50 outline-none ${formik.touched.lastName && formik.errors.lastName
                      ? "border-red-500"
                      : "border-gray-300"
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
              className="block mb-2 text-sm font-semibold text-black"
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
                className={`w-full h-12 pl-10 pr-3 rounded-xl border bg-gray-50 outline-none ${formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : "border-gray-300"
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
              className="block mb-2 text-sm font-semibold text-black"
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
                className={`w-full h-12 pl-10 pr-3 rounded-xl border bg-gray-50 outline-none ${formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : "border-gray-300"
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
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition"
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