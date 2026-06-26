import { AppProps } from "next/app"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { AuthProvider } from "@/contexts/auth"
import { TokenProvider } from "@/contexts/TokenContext"
import { RefreshProvider } from "@/contexts/RefreshContext"
import "../styles/globals.css"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Head from "next/head"

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [render, setRender] = useState(false)
  const PUBLIC_ROUTES = ["/signin", "/forgot-password", "/reset-password", "/user-register"]

  useEffect(() => setRender(true), [])

  if (!render) return null

  const isPublicRoute = PUBLIC_ROUTES.includes(router.pathname)

  return (
    <>
      <RefreshProvider>
        <TokenProvider>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/coachinglogo.png" />
          </Head>
          <div className="min-h-screen h-full bg-base-200 dark:bg-slate-900 transition-colors duration-200">
            {!isPublicRoute ? (
              <AuthProvider>
                <Component {...pageProps} />
              </AuthProvider>
            ) : (
              <Component {...pageProps} />
            )}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </TokenProvider>
      </RefreshProvider>
    </>
  )
}

export default MyApp
