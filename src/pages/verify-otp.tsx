import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { verifyOtp } from "@/api/auth";
import Meta from "@/layout/Meta";
import { AppConfig } from "@/utils/AppConfig";


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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      (prevInput as HTMLInputElement)?.focus();
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
          "OTP verified successfully!",
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

      <div className="min-h-screen w-full relative flex items-center justify-center lg:justify-start overflow-hidden bg-slate-100">
        {/* Fullscreen Background Image */}
        <img
          src="/bg-image.png"
          alt="Coaching Portal Background"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ top: '6px' }}
        />

        {/* Content Container */}
        <div className="relative z-10 w-full mx-auto px-6 py-8 flex items-center justify-center lg:justify-start lg:pl-[15%] xl:pl-[18%]">
          <div className="w-full max-w-[500px] animate-fade-in-up flex flex-col items-center relative lg:left-[-35px]">

            {/* Card — matching SignInForm / ForgotPassword style */}
            <div className="w-full bg-loginWhite/95 backdrop-blur-md rounded-2xl px-8 py-5 md:px-10 md:py-6 shadow-2xl border border-loginBorder overflow-hidden relative min-h-[350px] flex flex-col justify-center">

                {/* Loading overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-loginWhite/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <div className="w-8 h-8 border-4 border-loginBlueLight border-t-loginBlue rounded-full animate-spin mb-3"></div>
                    <span className="text-sm font-medium text-loginTextDark animate-pulse">Verifying...</span>
                  </div>
                )}

                {/* Logo & Title */}
                <div className="relative flex flex-col items-center mb-4 animate-fields-in">
                  {AppConfig.logoPath && (
                    <img
                      src={AppConfig.logoPath}
                      className="h-[42px] md:h-[50px] w-auto object-contain mb-2"
                      alt={AppConfig.siteName || "Coaching Portal Logo"}
                    />
                  )}
                  <h2 className="text-xl font-bold text-loginText tracking-wide">
                    Verify OTP
                  </h2>
                  <p className="text-xs text-loginMuted mt-1">
                    Enter the 6-digit OTP sent to your email
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={formik.handleSubmit} className="space-y-3 animate-fields-in">
                  {/* OTP Inputs */}
                  <div>
                    <div className="flex justify-between gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          inputMode="numeric"
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          disabled={loading}
                          className={`w-12 h-12 rounded-xl border text-center text-lg font-semibold bg-loginInput outline-none transition-all text-loginText focus:border-loginBlue ${
                            digit ? "border-loginBlue" : "border-loginBorder"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-[11px] text-loginMuted mt-2 ml-1">
                      {email && (
                        <span>OTP sent to <strong className="text-loginTextDark">{email}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 mt-3 relative overflow-hidden rounded-xl font-bold text-loginWhite text-sm tracking-[0.2em] uppercase transition-all duration-300 border-0 outline-none flex items-center justify-center gap-2 ${loading
                        ? 'bg-loginMutedDark cursor-not-allowed'
                        : 'bg-gradient-to-r from-loginBlue via-loginBlue to-loginIndigo hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98]'
                      }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? "Verifying..." : <>Verify OTP <ShieldCheck size={16} /></>}
                    </span>
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-4 text-center animate-fields-in">
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-2 text-xs text-loginBlueDark underline underline-offset-2 hover:text-loginBlue font-medium transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Back to Forgot Password
                  </Link>
                </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyOtp;
