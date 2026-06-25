import React from "react"
import { Route, Routes, Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/auth"
import Home from "./Home"
import NotFound from "./NotFound"
import Profile from "./Profile"
import Settings from "./Settings"
import SignOut from "./SignOut"
import AccessWrapper from "./AccessWrapper"

interface IAppRouterProps {
  isOpenMenu: boolean
}

const AppRouter: React.FC<IAppRouterProps> = ({ isOpenMenu }) => {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <div className="transition-all duration-300 ease-in-out">
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Core Layout Routes */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/logout" element={<SignOut />} />
        <Route path="/signout" element={<SignOut />} />
        
        {/* Fallbacks */}
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </div>
  )
}

export default AppRouter
