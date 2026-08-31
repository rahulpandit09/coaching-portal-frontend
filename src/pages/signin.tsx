import React, { useState } from "react";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Link from "next/link";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import nookies from "nookies";
import { useUserStore } from "@/store/user";
import { loginUser } from "@/api/auth";

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return {};
  }
};

const SignIn = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      Username: "",
      password: "",
    },
    validationSchema: Yup.object({
      Username: Yup.string().required("Username required"),
      password: Yup.string().required("Password required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await loginUser(values.Username, values.password);
        const { access_token, refresh_token } = response?.data || {};

        if (access_token) {
          // Save tokens to cookies (nookies) so AuthProvider recognizes user is logged in
          nookies.set(null, "token", access_token, { path: "/", maxAge: 86400 });
          if (refresh_token) {
            nookies.set(null, "refreshToken", refresh_token, { path: "/", maxAge: 604800 });
          }

          // Save tokens to localStorage
          localStorage.setItem("accessToken", access_token);
          localStorage.setItem("token", access_token);
          if (refresh_token) localStorage.setItem("refreshToken", refresh_token);
        }

        // Decode token to get real user_id and role_id from backend payload
        const decoded: any = access_token ? decodeJwt(access_token) : {};
        const roleId = decoded.role_id || 1;
        const roleName = roleId === 3 ? "Client" : roleId === 2 ? "Coach" : "Admin";
        const dashboardUrl = roleId === 3 ? "/client/dashboard" : roleId === 2 ? "/coach/dashboard" : "/admin/dashboard";

        // Extract user info from backend response or token payload
        const backendUser = response?.data?.user || response?.data?.user_data || {};
        const userEmail =
          backendUser.emailAddress ||
          backendUser.email ||
          decoded.email ||
          decoded.email_address ||
          (values.Username.includes("@") ? values.Username : undefined);

        let derivedFirstName = backendUser.firstName || backendUser.first_name || decoded.first_name || decoded.firstName;
        let derivedLastName = backendUser.lastName || backendUser.last_name || decoded.last_name || decoded.lastName;

        if (!derivedFirstName && userEmail) {
          const emailPrefix = userEmail.split("@")[0];
          const cleanName = emailPrefix.split(/[\._\-0-9]/)[0];
          if (cleanName && cleanName.length > 1) {
            derivedFirstName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
          }
        }

        const decodedUserId =
          decoded.user_id ||
          decoded.id ||
          decoded.userId ||
          (decoded.sub && !isNaN(Number(decoded.sub)) ? Number(decoded.sub) : undefined);

        // Build user object dynamically from API response & token payload
        const userData = {
          userId: backendUser.userId || backendUser.id || backendUser.user_id || decodedUserId || roleId || 3,
          username: backendUser.username || decoded.username || values.Username,
          emailAddress: userEmail,
          firstName: derivedFirstName || roleName,
          lastName: derivedLastName || (derivedFirstName ? "User" : "User"),
          role: roleName,
          roleName: roleName,
          profilePhoto: backendUser.profilePhoto || backendUser.profile_photo || decoded.profile_photo || decoded.profilePhoto,
          avatarUrl: backendUser.avatarUrl || backendUser.profilePhoto || backendUser.profile_photo || decoded.profile_photo,
          isSupervisor: roleId === 1,
          rolePermissions: response?.data?.user?.rolePermissions || response?.data?.rolePermissions || [],
        };

        localStorage.setItem("userData", JSON.stringify(userData));
        useUserStore.getState().setUser(userData);
        if (access_token && refresh_token) {
          useUserStore.getState().login(access_token, refresh_token);
        }

        toast.success("Login successfull!");
        router.replace("/");
      } catch (err: any) {
        toast.error(
          err?.response?.data?.detail || "Invalid username or password",
        );
      } finally {
        setLoading(false);
      }
    },
  });

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
              {/* Lock Icon */}
              <Lock className="absolute left-3 top-4 h-5 w-5 text-gray-400" />

              {/* Input */}
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className="
        w-full
        h-12 sm:h-14
        pl-11 pr-12
        rounded-xl
        border
        border-blue-200
        bg-white
        outline-none
        focus:border-blue-400
      "
              />

              {/* Eye Icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
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
      </div>
    </div>
  );
};

export default SignIn;
