import React, { useEffect, useState } from "react"
import { INavigationItem, IUser } from "@/utils/types"
import { Link, useNavigate } from "react-router-dom"
import { Bell, Menu, X } from "lucide-react"
import { motion } from "framer-motion"

interface INavbarProps {
  user: IUser
  username?: string | null
  siteName: string
  userNavigation: INavigationItem[]
  handleMenuStatus: () => void
  isOpenMenu: boolean
}

const Navbar: React.FC<INavbarProps> = ({
  user,
  username,
  siteName,
  userNavigation,
  handleMenuStatus,
  isOpenMenu,
}) => {
  const navigate = useNavigate()
  const [notificationsCount, setNotificationsCount] = useState(3)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    setAvatarUrl("/success-life.png")
  }, [user])

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
            <div className="avatar">
              <div className="w-8 h-8 rounded-full border border-indigo-200">
                <img src={avatarUrl || ""} alt={user?.firstName} />
              </div>
            </div>

            <span className="hidden sm:inline text-sm font-semibold text-gray-700">
              {user?.firstName || "User"}
            </span>
          </div>

          <ul
            tabIndex={0}
            className="mt-2 p-2 shadow-xl menu dropdown-content bg-white border border-gray-200 rounded-2xl w-56 z-[1]"
          >
            {/* User Info */}
            <div className="px-3 py-2 border-b border-gray-200">
              <div className="text-sm font-bold text-black">
                {user?.firstName} {user?.lastName}
              </div>

              <div className="text-xs text-gray-500 truncate">
                {user?.emailAddress}
              </div>
            </div>

            {/* Links */}
            <li className="mt-2">
              <Link
                to="/profile"
                className="rounded-xl py-2 px-3 text-sm font-medium hover:bg-indigo-50 text-gray-700"
              >
                My Profile
              </Link>
            </li>

            <li>
              <Link
                to="/settings"
                className="rounded-xl py-2 px-3 text-sm font-medium hover:bg-indigo-50 text-gray-700"
              >
                Settings
              </Link>
            </li>

            <hr className="my-2 border-gray-200" />

            <li>
              <Link
                to="/logout"
                className="rounded-xl py-2 px-3 text-sm font-semibold hover:bg-red-50 text-red-600"
              >
                Log Out
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

export default Navbar