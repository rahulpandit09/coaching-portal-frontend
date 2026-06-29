import React, { useState } from "react";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import nookies from "nookies";
import Link from "next/link";
import { Mail, Lock, LogIn, ChevronRight, Info, User } from "lucide-react";

const SignIn = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Interactive role selector for easy testing/demo
  const [selectedRole, setSelectedRole] = useState<
    "admin" | "coach" | "client"
  >("coach");

  const formik = useFormik({
    initialValues: {
      Username: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Build mock user matching selected demo role
        let mockUser: any = {};

        if (selectedRole === "admin") {
          mockUser = {
            userId: 1,
            username: "admin_portal",
            emailAddress: values.Username,
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
                      {
                        subMenuId: 101,
                        subMenuName: "Manage Portal",
                        subMenuUrl: "/admin/dashboard",
                        subMenuIcon: "shield",
                      },
                    ],
                  },
                  {
                    menuId: 2,
                    menuName: "Settings",
                    menuUrl: "/settings",
                    menuIcon: "settings",
                    subMenus: [
                      {
                        subMenuId: 201,
                        subMenuName: "Profile",
                        subMenuUrl: "/profile",
                        subMenuIcon: "user",
                      },
                      {
                        subMenuId: 202,
                        subMenuName: "Preferences",
                        subMenuUrl: "/settings",
                        subMenuIcon: "sliders",
                      },
                    ],
                  },
                ],
              },
            ],
          };
        } else if (selectedRole === "coach") {
          mockUser = {
            userId: 2,
            username: "coach_jane",
            emailAddress: values.Username,
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
                      {
                        subMenuId: 101,
                        subMenuName: "My Clients",
                        subMenuUrl: "/coach/dashboard?tab=clients",
                        subMenuIcon: "users",
                      },
                      {
                        subMenuId: 102,
                        subMenuName: "Schedules",
                        subMenuUrl: "/coach/dashboard?tab=schedules",
                        subMenuIcon: "calendar",
                      },
                      {
                        subMenuId: 103,
                        subMenuName: "Feedback Panel",
                        subMenuUrl: "/coach/dashboard?tab=feedback",
                        subMenuIcon: "message-square",
                      },
                    ],
                  },
                  {
                    menuId: 2,
                    menuName: "Settings",
                    menuUrl: "/settings",
                    menuIcon: "settings",
                    subMenus: [
                      {
                        subMenuId: 201,
                        subMenuName: "Profile",
                        subMenuUrl: "/profile",
                        subMenuIcon: "user",
                      },
                      {
                        subMenuId: 202,
                        subMenuName: "Preferences",
                        subMenuUrl: "/settings",
                        subMenuIcon: "sliders",
                      },
                    ],
                  },
                ],
              },
            ],
          };
        } else {
          mockUser = {
            userId: 3,
            username: "client_mark",
            emailAddress: values.Username,
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
                      {
                        subMenuId: 101,
                        subMenuName: "My Goals",
                        subMenuUrl: "/client/dashboard?tab=goals",
                        subMenuIcon: "target",
                      },
                      {
                        subMenuId: 102,
                        subMenuName: "Book Session",
                        subMenuUrl: "/client/dashboard?tab=book",
                        subMenuIcon: "calendar",
                      },
                      {
                        subMenuId: 103,
                        subMenuName: "Resources",
                        subMenuUrl: "/client/dashboard?tab=resources",
                        subMenuIcon: "folder-open",
                      },
                    ],
                  },
                  {
                    menuId: 2,
                    menuName: "Settings",
                    menuUrl: "/settings",
                    menuIcon: "settings",
                    subMenus: [
                      {
                        subMenuId: 201,
                        subMenuName: "Profile",
                        subMenuUrl: "/profile",
                        subMenuIcon: "user",
                      },
                      {
                        subMenuId: 202,
                        subMenuName: "Preferences",
                        subMenuUrl: "/settings",
                        subMenuIcon: "sliders",
                      },
                    ],
                  },
                ],
              },
            ],
          };
        }

        // Save auth details
        const mockAccessToken =
          "mock_access_token_jwt_" + Math.random().toString(36).substring(7);
        nookies.set(null, "token", mockAccessToken, { path: "/" });
        localStorage.setItem("accessToken", mockAccessToken);
        localStorage.setItem("userData", JSON.stringify(mockUser));

        toast.success(`Welcome back, ${mockUser.firstName}!`);
        router.replace("/");
      } catch (err: any) {
        toast.error(err?.message || "Sign in failed");
      } finally {
        setLoading(false);
      }
    },
  });

  // Quick fill helper
  const handleQuickFill = (role: "admin" | "coach" | "client") => {
    setSelectedRole(role);
    formik.setValues({
      Username: `${role}@growportal.com`,
      password: "password123",
    });
  };
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 bg-cover bg-center bg-no-repeat relative backdrop:blur-sm"
      style={{
        backgroundImage: "url('/coachingimage.png')",
      }}
    >
      {/* Dark Overlay */}
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
      py-2 sm:py-3 md:py-4
    "
      >
        {/* Top dots */}
        <div className="flex justify-center gap-2 mb-4 sm:mb-6">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <h1
            className="
          text-3xl 
          sm:text-4xl 
          md:text-5xl 
          font-bold 
          text-[#1f3f93]
        "
          >
            Welcome back
          </h1>

          <p
            className="
          text-gray-500 
          mt-2 
          text-sm 
          sm:text-base 
          md:text-lg
        "
          >
            Sign in to continue your coaching journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-5 sm:space-y-6">

          <div>
            <label className="block mb-2 sm:mb-3 font-semibold text-[#1f3f93] text-sm sm:text-base">
              Username
            </label>

            <div className="relative">
              <User className="absolute left-3 top-4 h-5 w-5 text-gray-400" />

              <input
                id="username"
                name="Username"
                type="text"
                placeholder="Username"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.Username}
                className="
        w-full
        h-12 sm:h-14
        pl-11 pr-4
        rounded-xl
        border
        border-blue-200
        bg-white
        outline-none
        focus:border-blue-400
      "
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between mb-2 sm:mb-3">
              <label className="font-semibold text-[#1f3f93] text-sm sm:text-base">
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-orange-500 text-xs sm:text-sm font-medium"
              >
                Forgot-Password?
              </Link>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-4 h-5 w-5 text-gray-400" />

              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className="
        w-full
        h-12 sm:h-14
        pl-11 pr-4
        rounded-xl
        border
        border-blue-200
        bg-white
        outline-none
        focus:border-blue-400
      "
              />
            </div>
          </div>

          {/* Remember me */}
          {/* <div className="flex items-center gap-2 sm:gap-3">
            <input
              type="checkbox"
              className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300"
            />

            <span className="text-gray-500 text-sm sm:text-base">
              Remember me
            </span>
          </div> */}

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
          "
          >
            Sign in
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center text-gray-500 text-sm sm:text-base">
          New here?{" "}
          <Link href="/user-register" className="text-blue-600 font-semibold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
