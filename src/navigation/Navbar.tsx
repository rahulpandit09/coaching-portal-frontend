import React, { useEffect, useState } from "react"
import { INavigationItem, IUser } from "@/utils/types"
import { Link, useNavigate } from "react-router-dom"
import { Bell, Menu, X } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth"

import { formatPhotoUrl } from "@/utils/photoUtils"

interface INavbarProps {
  user: IUser
  username?: string | null
  siteName: string
  userNavigation: INavigationItem[]
  handleMenuStatus: () => void
  isOpenMenu: boolean
}

const Navbar: React.FC<INavbarProps> = ({
  user: initialUser,
  username,
  siteName,
  userNavigation,
  handleMenuStatus,
  isOpenMenu,
}) => {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const user = authUser || initialUser

  const [notificationsCount, setNotificationsCount] = useState(3)
  const [imgError, setImgError] = useState(false)

  const photoUrl = formatPhotoUrl(user?.profilePhoto || user?.avatarUrl)

  useEffect(() => {
    setImgError(false)
  }, [photoUrl])

  const handleNotificationClick = () => {
    navigate("/settings")
  }

  return (
    <motion.div
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full h-16 px-6 flex justify-between items-center bg-white border-b border-gray-200 shadow-sm"
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          className="btn btn-ghost btn-circle btn-sm text-gray-600"
          onClick={handleMenuStatus}
        >
          {isOpenMenu ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          {/* Logo */}
          <svg
            className="w-7 h-7 text-indigo-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>

          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
            Coaching Portal
          </span>
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button
          onClick={handleNotificationClick}
          className="btn btn-ghost btn-circle btn-sm relative text-gray-500 hover:text-indigo-600"
        >
          <Bell size={24} />

          {notificationsCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {notificationsCount}
            </span>
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="avatar relative">
              <div className="w-8 h-8 rounded-full border border-indigo-200 overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-sm shrink-0">
                {photoUrl && !imgError ? (
                  <img
                    src={photoUrl}
                    alt={user?.firstName || "User"}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span>{user?.firstName?.[0]?.toUpperCase() || "U"}</span>
                )}
              </div>
            </div>

            <span className="hidden sm:inline text-sm font-semibold text-gray-700">
              {user?.firstName || "User"}
            </span>
          </div>

          <ul
            tabIndex={0}
            className="mt-2 p-3.5 shadow-xl menu dropdown-content bg-white border border-gray-100 rounded-2xl w-52 z-[50]"
          >
            <div className="px-2.5 pb-2 text-[11px] font-bold tracking-wider text-sky-500 uppercase">
              ACCOUNT CONTROLS
            </div>

            <li>
              <Link
                to="/profile"
                className="rounded-lg py-2 px-2.5 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                My Profile
              </Link>
            </li>

            <li>
              <Link
                to="/settings"
                className="rounded-lg py-2 px-2.5 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                Settings
              </Link>
            </li>

            <li>
              <Link
                to="/logout"
                className="rounded-lg py-2 px-2.5 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

export default Navbar

