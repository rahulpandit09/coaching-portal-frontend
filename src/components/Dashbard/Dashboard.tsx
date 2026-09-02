import React from "react"
import { useAuth } from "@/contexts/auth"
import {
  Users,
  ShieldCheck,
  Menu as MenuIcon,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Layers,
  Sparkles,
  Calendar
} from "lucide-react"
import { Link } from "react-router-dom"

const Dashboard: React.FC = () => {
  const { user, username } = useAuth()

  const stats = [
    {
      title: "Total Menus",
      value: "12",
      change: "+2 this week",
      icon: MenuIcon,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50 text-blue-600",
    },
    {
      title: "Active Submenus",
      value: "28",
      change: "+5 this week",
      icon: Layers,
      color: "from-purple-500 to-pink-600",
      bg: "bg-purple-50 text-purple-600",
    },
    {
      title: "Roles Configured",
      value: "4",
      change: "All systems active",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Active Users",
      value: "154",
      change: "+18% growth",
      icon: Users,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50 text-amber-600",
    }
  ]

  return (
    <div className="-m-6 p-6 sm:p-8 bg-white text-gray-900 min-h-[calc(100vh-64px)] space-y-6 sm:space-y-8 pb-28 sm:pb-36">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-200/50">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-20 bottom-0 h-48 w-48 rounded-full bg-black/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {username || user?.firstName || "Admin"}!
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-sm font-medium">
              <Calendar className="w-4 h-4 text-indigo-200" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="group relative bg-slate-50/80 p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
              </div>

              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
          )
        })}
      </div>

      {/* Quick Action Cards / System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-50/80 rounded-3xl p-5 sm:p-8 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                API & Permission Status
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Dynamic RBAC endpoints configured and operational
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All APIs Online
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-between hover:border-indigo-300 transition-colors shadow-sm">
              <div>
                <div className="font-semibold text-sm text-gray-900">Menu API (`/menu/`)</div>
                <div className="text-xs text-gray-500 mt-0.5">GET, POST, PUT, DELETE</div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl">Active</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-between hover:border-indigo-300 transition-colors shadow-sm">
              <div>
                <div className="font-semibold text-sm text-gray-900">Submenu API (`/submenu/`)</div>
                <div className="text-xs text-gray-500 mt-0.5">GET, POST, PUT, DELETE</div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl">Active</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-between hover:border-indigo-300 transition-colors shadow-sm">
              <div>
                <div className="font-semibold text-sm text-gray-900">Roles API (`/roles/`)</div>
                <div className="text-xs text-gray-500 mt-0.5">GET, POST, PUT, DELETE</div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl">Active</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-between hover:border-indigo-300 transition-colors shadow-sm">
              <div>
                <div className="font-semibold text-sm text-gray-900">Permissions API (`/permissions/`)</div>
                <div className="text-xs text-gray-500 mt-0.5">GET, POST, PUT, DELETE</div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl">Active</span>
            </div>
          </div>
        </div>

        {/* Profile Card Summary */}
        <div className="bg-slate-50/80 rounded-3xl p-5 sm:p-8 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden min-w-0">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Your Role
              </span>
              <span className="text-xs font-medium text-gray-400">ID #{user?.userId || 1}</span>
            </div>

            <h3 className="text-2xl font-extrabold text-gray-900 mb-2 truncate">{user?.roleName || "Supervisor Admin"}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              You currently have full administrative control over menus, submenus, roles, and granular permissions across the platform.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200/80 flex items-center justify-between gap-2">
            <div className="text-xs text-gray-500 truncate">
              <div>Assigned Menus: <strong className="text-gray-900">{user?.rolePermissions?.[0]?.menus?.length || 0}</strong></div>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-100 shrink-0"
            >
              View Profile
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
