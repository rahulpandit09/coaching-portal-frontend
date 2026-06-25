import React from "react"
import { useAuth } from "@/contexts/auth"
import { User, Mail, Shield, Calendar } from "lucide-react"

const Profile: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Profile</h1>
      
      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-gray-150 dark:border-slate-800 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
        
        {/* Profile Card body */}
        <div className="p-6 relative">
          <div className="absolute -top-16 left-6">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-950 bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl shadow-lg">
              {user?.firstName?.[0] ?? "U"}
            </div>
          </div>
          
          <div className="pt-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user?.username}</p>
          </div>
          
          <hr className="my-6 border-gray-100 dark:border-slate-800" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Mail size={18} className="text-indigo-500" />
              <div>
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">Email Address</div>
                <div className="text-sm font-semibold">{user?.emailAddress ?? "N/A"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Shield size={18} className="text-indigo-500" />
              <div>
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">Role</div>
                <div className="text-sm font-semibold">{user?.roleName ?? user?.role ?? "User"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Calendar size={18} className="text-indigo-500" />
              <div>
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">Account Status</div>
                <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
