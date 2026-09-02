import { AppConfig } from "@/utils/AppConfig"
import Meta from "@/layout/Meta"
import SignInForm from "@/navigation/SignInForm"

const Signin = () => {
  return (
    <>
      <Meta />
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
      `}</style>

      <div className="min-h-screen w-full relative flex items-center justify-center lg:justify-start overflow-hidden bg-slate-100">
        {/* Fullscreen Background Image */}
        <img
          src="/bg-image.png"
          alt="Coaching Portal Background"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ top: '6px' }}
        />

        {/* Content Container positioned over the open area */}
        <div className="relative z-10 w-full mx-auto px-6 py-8 flex items-center justify-center lg:justify-start lg:pl-[15%] xl:pl-[18%] overflow-hidden">
          <div className="w-full max-w-xl animate-fade-in-up flex flex-col items-center relative lg:left-[-35px]">
            <div className="w-full  animate-fade-in-up flex flex-col items-center relative lg:left-[-35px]"
            > <SignInForm />
              {/* <p className="text-center text-xs text-slate-600 mt-4 drop-shadow-sm font-medium">
              Having trouble signing in? Contact your system administrator.
            </p> */}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default Signin

