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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-gray-200 shadow-lg">

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email and we’ll send you a reset link.
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5">

          <div className="form-control">
            <label htmlFor="email" className="mb-2 text-sm font-medium text-gray-700">
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

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full rounded-lg text-sm font-medium"
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

        <div className="mt-6 text-center">
          <Link
            href="/signin"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
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
