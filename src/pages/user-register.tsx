import React, { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "react-toastify"
import Link from "next/link"
import { useRouter } from "next/router"
import { Mail, Lock, User, UserPlus, Shield, AtSign } from "lucide-react"
import { registerUser } from "@/api/auth"
import Meta from "@/layout/Meta"
import { AppConfig } from "@/utils/AppConfig"

const UserRegister = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      roleName: "Student",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().trim().required("First name is required"),
      lastName: Yup.string().trim().required("Last name is required"),
      username: Yup.string().trim().required("Username is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Must be at least 6 characters")
        .max(72, "Must not exceed 72 characters")
        .required("Password is required"),
      roleName: Yup.string().required("Please select your role"),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      try {
        await registerUser({
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password,
          role_name: values.roleName,
        })

        toast.success("Account created successfully! Please sign in.")
        router.push("/signin")
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.detail ||
          (typeof err?.response?.data === "string" ? err?.response?.data : null) ||
          err?.message ||
          "Registration failed. Please try again."
        toast.error(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg))
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

      <div className="min-h-screen w-full relative flex items-center justify-center lg:justify-start overflow-hidden bg-slate-100 py-8">
        {/* Fullscreen Background Image */}
        <img
          src="/bg-image.png"
          alt="Coaching Portal Background"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ top: "6px" }}
        />

        {/* Content Container */}
        <div className="relative z-10 w-full mx-auto px-6 py-4 flex items-center justify-center lg:justify-start lg:pl-[12%] xl:pl-[15%]">
          <div className="w-full max-w-[540px] animate-fade-in-up flex flex-col items-center relative">
            {/* Card */}
            <div className="w-full bg-loginWhite/95 backdrop-blur-md rounded-2xl px-8 py-6 shadow-2xl border border-loginBorder overflow-hidden relative">
              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-loginWhite/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                  <div className="w-8 h-8 border-4 border-loginBlueLight border-t-loginBlue rounded-full animate-spin mb-3"></div>
                  <span className="text-sm font-medium text-loginTextDark animate-pulse">
                    Creating Account...
                  </span>
                </div>
              )}

              {/* Logo & Title */}
              <div className="relative flex flex-col items-center mb-4 animate-fields-in">
                {AppConfig.logoPath && (
                  <img
                    src={AppConfig.logoPath}
                    className="h-[40px] md:h-[46px] w-auto object-contain mb-2"
                    alt={AppConfig.siteName || "Coaching Portal Logo"}
                  />
                )}
                <h2 className="text-xl font-bold text-loginText tracking-wide">
                  Create Account
                </h2>
                <p className="text-xs text-loginMuted mt-0.5">
                  Join Coaching Portal to manage learning & progress
                </p>
              </div>

              {/* Form */}
              <form onSubmit={formik.handleSubmit} className="space-y-3 animate-fields-in">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block mb-1 text-xs font-semibold text-loginText"
                    >
                      First Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 w-4 h-4 text-loginMutedLight" />
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="First name"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.firstName}
                        disabled={loading}
                        className={`w-full py-2 pl-9 pr-3 bg-loginInput border rounded-xl text-sm focus:border-loginBlue outline-none transition-all text-loginText placeholder-loginMutedLight ${
                          formik.touched.firstName && formik.errors.firstName
                            ? "border-loginError"
                            : "border-loginBorder"
                        }`}
                      />
                    </div>
                    {formik.touched.firstName && formik.errors.firstName && (
                      <p className="text-loginError text-[11px] mt-0.5 ml-1">
                        {formik.errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block mb-1 text-xs font-semibold text-loginText"
                    >
                      Last Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 w-4 h-4 text-loginMutedLight" />
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Last name"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.lastName}
                        disabled={loading}
                        className={`w-full py-2 pl-9 pr-3 bg-loginInput border rounded-xl text-sm focus:border-loginBlue outline-none transition-all text-loginText placeholder-loginMutedLight ${
                          formik.touched.lastName && formik.errors.lastName
                            ? "border-loginError"
                            : "border-loginBorder"
                        }`}
                      />
                    </div>
                    {formik.touched.lastName && formik.errors.lastName && (
                      <p className="text-loginError text-[11px] mt-0.5 ml-1">
                        {formik.errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-1 text-xs font-semibold text-loginText"
                  >
                    Username
                  </label>
                  <div className="relative flex items-center">
                    <AtSign className="absolute left-3 w-4 h-4 text-loginMutedLight" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="e.g. john_doe"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.username}
                      disabled={loading}
                      className={`w-full py-2 pl-9 pr-3 bg-loginInput border rounded-xl text-sm focus:border-loginBlue outline-none transition-all text-loginText placeholder-loginMutedLight ${
                        formik.touched.username && formik.errors.username
                          ? "border-loginError"
                          : "border-loginBorder"
                      }`}
                    />
                  </div>
                  {formik.touched.username && formik.errors.username && (
                    <p className="text-loginError text-[11px] mt-0.5 ml-1">
                      {formik.errors.username}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-1 text-xs font-semibold text-loginText"
                  >
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-loginMutedLight" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                      disabled={loading}
                      className={`w-full py-2 pl-9 pr-3 bg-loginInput border rounded-xl text-sm focus:border-loginBlue outline-none transition-all text-loginText placeholder-loginMutedLight ${
                        formik.touched.email && formik.errors.email
                          ? "border-loginError"
                          : "border-loginBorder"
                      }`}
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-loginError text-[11px] mt-0.5 ml-1">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-1 text-xs font-semibold text-loginText"
                  >
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-loginMutedLight" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
                      disabled={loading}
                      className={`w-full py-2 pl-9 pr-3 bg-loginInput border rounded-xl text-sm focus:border-loginBlue outline-none transition-all text-loginText placeholder-loginMutedLight ${
                        formik.touched.password && formik.errors.password
                          ? "border-loginError"
                          : "border-loginBorder"
                      }`}
                    />
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-loginError text-[11px] mt-0.5 ml-1">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label
                    htmlFor="roleName"
                    className="block mb-1 text-xs font-semibold text-loginText"
                  >
                    Role
                  </label>
                  <div className="relative flex items-center">
                    <Shield className="absolute left-3 w-4 h-4 text-loginMutedLight" />
                    <select
                      id="roleName"
                      name="roleName"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.roleName}
                      disabled={loading}
                      className="w-full py-2 pl-9 pr-3 bg-loginInput border border-loginBorder rounded-xl text-sm focus:border-loginBlue outline-none transition-all text-loginText"
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher / Coach</option>
                      <option value="Parent">Parent</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 mt-2 relative overflow-hidden rounded-xl font-bold text-loginWhite text-sm tracking-[0.2em] uppercase transition-all duration-300 border-0 outline-none flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-loginMutedDark cursor-not-allowed"
                      : "bg-gradient-to-r from-loginBlue via-loginBlue to-loginIndigo hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98]"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      "Registering..."
                    ) : (
                      <>
                        Sign Up <UserPlus size={16} />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Footer */}
              <div className="mt-4 text-center animate-fields-in">
                <span className="text-xs text-loginMuted">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="text-xs text-loginBlueDark underline underline-offset-2 hover:text-loginBlue font-semibold transition-colors"
                  >
                    Sign In
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserRegister