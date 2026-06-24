import React, { useState } from "react"
import { useRouter } from "next/router"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "react-toastify"
import nookies from "nookies"
import Link from "next/link"
import { Mail, Lock, LogIn, ChevronRight, Info } from "lucide-react"

const SignIn = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Interactive role selector for easy testing/demo
  const [selectedRole, setSelectedRole] = useState<"admin" | "coach" | "client">("coach")

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string().min(6, "Must be at least 6 characters").required("Password is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      try {
        // Build mock user matching selected demo role
        let mockUser: any = {}

        if (selectedRole === "admin") {
          mockUser = {
            userId: 1,
            username: "admin_portal",
            emailAddress: values.email,
            firstName: "Alex",
            lastName: "Administrator",
            roleName: "Portal Admin",
            isSupervisor: false,
            rolePermissions: [
              {
                roleId: 1,
                roleName: "Admin",
                menus: [
                  {
                    menuId: 1,
                    menuName: "Dashboard",
                    menuUrl: "/admin/dashboard",
                    menuIcon: "layout-dashboard",
                    subMenus: [
                      { subMenuId: 101, subMenuName: "Manage Portal", subMenuUrl: "/admin/dashboard", subMenuIcon: "shield" }
                    ]
                  },
                  {
                    menuId: 2,
                    menuName: "Settings",
                    menuUrl: "/settings",
                    menuIcon: "settings",
                    subMenus: [
                      { subMenuId: 201, subMenuName: "Profile", subMenuUrl: "/profile", subMenuIcon: "user" },
                      { subMenuId: 202, subMenuName: "Preferences", subMenuUrl: "/settings", subMenuIcon: "sliders" }
                    ]
                  }
                ]
              }
            ]
          }
        } else if (selectedRole === "coach") {
          mockUser = {
            userId: 2,
            username: "coach_jane",
            emailAddress: values.email,
            firstName: "Jane",
            lastName: "Coachington",
            roleName: "Lead Coach",
            isSupervisor: true,
            rolePermissions: [
              {
                roleId: 2,
                roleName: "Coach",
                menus: [
                  {
                    menuId: 1,
                    menuName: "Coaching Panel",
                    menuUrl: "/coach/dashboard",
                    menuIcon: "layout-dashboard",
                    subMenus: [
                      { subMenuId: 101, subMenuName: "My Clients", subMenuUrl: "/coach/dashboard?tab=clients", subMenuIcon: "users" },
                      { subMenuId: 102, subMenuName: "Schedules", subMenuUrl: "/coach/dashboard?tab=schedules", subMenuIcon: "calendar" },
                      { subMenuId: 103, subMenuName: "Feedback Panel", subMenuUrl: "/coach/dashboard?tab=feedback", subMenuIcon: "message-square" }
                    ]
                  },
                  {
                    menuId: 2,
                    menuName: "Settings",
                    menuUrl: "/settings",
                    menuIcon: "settings",
                    subMenus: [
                      { subMenuId: 201, subMenuName: "Profile", subMenuUrl: "/profile", subMenuIcon: "user" },
                      { subMenuId: 202, subMenuName: "Preferences", subMenuUrl: "/settings", subMenuIcon: "sliders" }
                    ]
                  }
                ]
              }
            ]
          }
        } else {
          mockUser = {
            userId: 3,
            username: "client_mark",
            emailAddress: values.email,
            firstName: "Mark",
            lastName: "Coachee",
            roleName: "Client Partner",
            isSupervisor: false,
            rolePermissions: [
              {
                roleId: 3,
                roleName: "Client",
                menus: [
                  {
                    menuId: 1,
                    menuName: "My Hub",
                    menuUrl: "/client/dashboard",
                    menuIcon: "layout-dashboard",
                    subMenus: [
                      { subMenuId: 101, subMenuName: "My Goals", subMenuUrl: "/client/dashboard?tab=goals", subMenuIcon: "target" },
                      { subMenuId: 102, subMenuName: "Book Session", subMenuUrl: "/client/dashboard?tab=book", subMenuIcon: "calendar" },
                      { subMenuId: 103, subMenuName: "Resources", subMenuUrl: "/client/dashboard?tab=resources", subMenuIcon: "folder-open" }
                    ]
                  },
                  {
                    menuId: 2,
                    menuName: "Settings",
                    menuUrl: "/settings",
                    menuIcon: "settings",
                    subMenus: [
                      { subMenuId: 201, subMenuName: "Profile", subMenuUrl: "/profile", subMenuIcon: "user" },
                      { subMenuId: 202, subMenuName: "Preferences", subMenuUrl: "/settings", subMenuIcon: "sliders" }
                    ]
                  }
                ]
              }
            ]
          }
        }

        // Save auth details
        const mockAccessToken = "mock_access_token_jwt_" + Math.random().toString(36).substring(7)
        nookies.set(null, "token", mockAccessToken, { path: "/" })
        localStorage.setItem("accessToken", mockAccessToken)
        localStorage.setItem("userData", JSON.stringify(mockUser))

        toast.success(`Welcome back, ${mockUser.firstName}!`)
        router.replace("/")
      } catch (err: any) {
        toast.error(err?.message || "Sign in failed")
      } finally {
        setLoading(false)
      }
    },
  })

  // Quick fill helper
  const handleQuickFill = (role: "admin" | "coach" | "client") => {
    setSelectedRole(role)
    formik.setValues({
      email: `${role}@growportal.com`,
      password: "password123",
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-gray-200 shadow-lg">

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-black">
            Sign In
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Access your account
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5">

          {/* Email */}
          <div className="form-control">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold !text-black"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`input input-bordered w-full pl-10 rounded-lg border-gray-300 bg-white ${formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : ""
                  }`}
              />
            </div>

            {formik.touched.email && formik.errors.email && (
              <span className="text-red-500 text-xs mt-1 block">
                {formik.errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-control">
            <div className="flex justify-between items-center mb-2">

              <label
                htmlFor="password"
                className="text-sm font-semibold text-black"
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className={`input input-bordered w-full pl-10 rounded-lg border-gray-300 bg-white ${formik.touched.password && formik.errors.password
                  ? "border-red-500"
                  : ""
                  }`}
              />
            </div>

            {formik.touched.password && formik.errors.password && (
              <span className="text-red-500 text-xs mt-1 block">
                {formik.errors.password}
              </span>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full rounded-lg text-sm font-medium"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                Sign In <LogIn size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          New here?{" "}
          <Link
            href="/user-register"
            className="font-medium text-blue-600 hover:underline"
          >
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
}

export default SignIn
