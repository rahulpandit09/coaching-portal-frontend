import React, { useState } from "react";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Link from "next/link";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { loginUser } from "../components/api/auth";

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
        await loginUser(values.Username, values.password);
        toast.success("Login successfull!");
        router.replace("/home");
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
