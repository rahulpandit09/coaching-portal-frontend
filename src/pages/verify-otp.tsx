import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { verifyOtp } from "@/api/authApi";

const VerifyOtp = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { email } = router.query;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);

      (nextInput as HTMLInputElement)?.focus();
    }
  };
  const formik = useFormik({
    initialValues: {},

    validationSchema: Yup.object({}),

    onSubmit: async () => {
      setLoading(true);

      try {
        const otpValue = otp.join("");
        if (otpValue.length !== 6) {
          toast.error("Please enter a valid 6-digit OTP");
          setLoading(false);
          return;
        }
        if (!email) {
          toast.error("Email not found. Please try again.");
          setLoading(false);
          return;
        }
        // API Call
        await verifyOtp(email as string, otpValue);
        toast.success(
          "OTP sent successfully! Please check your email.",
        );
        router.push(`/reset-password?email=${email}`);
      } catch (err: any) {
        toast.error(
  err?.response?.data?.detail ||
  "OTP verification failed"
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
        {/* Top dots like login */}
        <div className="flex justify-center gap-2 mb-4 sm:mb-6">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
        </div>

        {/* Heading */}
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
            Verify OTP
          </h2>

          <p
            className="
            text-gray-500
            mt-2
            text-sm
            sm:text-base
            md:text-lg
          "
          >
            Enter the 6 digit OTP sent to your email
          </p>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block mb-3 font-semibold text-[#1f3f93] text-sm sm:text-base">
              Enter OTP
            </label>

            <div className="flex justify-between gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  className="
          w-12 h-12
          sm:w-14 sm:h-14
          rounded-xl
          border border-blue-200
          text-center
          text-lg font-semibold
          bg-white
          outline-none
          focus:border-blue-400
        "
                />
              ))}
            </div>
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
                Verify OTP <ShieldCheck size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
