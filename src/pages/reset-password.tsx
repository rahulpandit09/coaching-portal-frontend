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
    <div className="w-full max-w-md p-8 bg-white dark:bg-slate-950 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Define a secure new password for your account.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="form-control">
          <label htmlFor="password">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-450" />
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className={`input input-bordered w-full pl-11 rounded-xl bg-gray-50/50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 ${
                formik.touched.password && formik.errors.password ? "border-rose-500 focus:border-rose-500" : ""
              }`}
            />
          </div>
          {formik.touched.password && formik.errors.password && (
            <span className="text-rose-500 text-xs mt-1 block">{formik.errors.password}</span>
          )}
        </div>

        <div className="form-control">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-450" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
              className={`input input-bordered w-full pl-11 rounded-xl bg-gray-50/50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 ${
                formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-rose-500 focus:border-rose-500" : ""
              }`}
            />
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <span className="text-rose-500 text-xs mt-1 block">{formik.errors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full mt-2 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold"
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <>
              Reset Password <ShieldCheck size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/signin"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>
    </div>
  )
}

export default ResetPassword
