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
      className="fixed top-0 w-full z-50 h-16 px-6 flex justify-between items-center bg-[#FAF9F6] border-b border-blue-100 shadow-sm"
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          className="btn btn-square btn-xs bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600 transition duration-200"
          onClick={handleMenuStatus}
        >
          {isOpenMenu ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/navbar-logo.png"
            className="h-9 sm:h-10 cursor-pointer hover:scale-102 transition"
            alt={siteName || "Logo"}
          />
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-x-4">
        {/* Notification */}
        <button
          onClick={handleNotificationClick}
          className="flex items-center justify-center w-9 h-9 border border-blue-100 bg-white rounded-full hover:bg-blue-50/60 hover:border-blue-300 transition text-gray-600 relative group"
        >
          <Bell className="w-5 h-5 text-blue-600/80 group-hover:text-blue-700 transition" />

          {notificationsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex px-1.5 py-0.5 min-w-[20px] h-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white shadow-sm transition-all duration-300">
              {notificationsCount}
            </span>
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="flex items-center gap-2.5 px-3 py-1.5 border border-blue-200/80 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-300 rounded-full transition-all duration-200 select-none shadow-2xs"
          >
            <div className="avatar relative">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-blue-200 bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
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

            <span className="hidden sm:inline text-blue-950 text-xs font-bold tracking-tight pr-0.5">
              {user?.firstName || "User"}
            </span>
          </div>

          <ul
            tabIndex={0}
            className="mt-2 p-2 bg-white shadow-xl menu menu-sm dropdown-content border border-blue-50 rounded-xl w-52 z-50 text-gray-700"
          >
            <h3 className="font-bold mb-1 px-2.5 pt-1 text-[10px] text-blue-400 tracking-wider uppercase font-mono">
              Account Controls
            </h3>

            <li>
              <Link
                to="/profile"
                className="flex justify-between items-center hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-md transition text-gray-700 font-medium text-xs"
              >
                My Profile
              </Link>
            </li>

            <li>
              <Link
                to="/settings"
                className="flex justify-between items-center hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-md transition text-gray-700 font-medium text-xs"
              >
                Settings
              </Link>
            </li>

            <li>
              <Link
                to="/logout"
                className="flex justify-between items-center hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-md transition text-gray-700 font-medium text-xs"
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

