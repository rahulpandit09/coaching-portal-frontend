import React, { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { AuthProvider } from "@/contexts/auth"
import { TokenProvider } from "@/contexts/TokenContext"
import { RefreshProvider } from "@/contexts/RefreshContext"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Main } from "@/templates/Main"
import Meta from "@/layout/Meta"

const App: React.FC = () => {
  const location = useLocation()
  const [render, setRender] = useState(false)
  const PUBLIC_ROUTES = ["/signin", "/forgot-password", "/reset-password", "/user-register"]

  useEffect(() => setRender(true), [])

  if (!render) return null

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname)

  return (
    <RefreshProvider>
      <TokenProvider>
        <div className="min-h-screen h-full bg-base-200 dark:bg-slate-900 transition-colors duration-200">
          {!isPublicRoute ? (
            <AuthProvider>
              <Main meta={<Meta />}>
                <></>
              </Main>
            </AuthProvider>
          ) : (
            <Main meta={<Meta />}>
              <></>
            </Main>
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
  )
}

export default App
