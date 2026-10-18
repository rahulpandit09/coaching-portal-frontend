import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth"
import {
  Sun,
  Moon,
  Bell,
  Sliders,
  Mail,
  Smartphone,
  ExternalLink,
  CheckCircle,
  Clock,
  Sparkles,
  Save,
  RotateCcw,
} from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

const Settings: React.FC = () => {
  const { user } = useAuth()
  const [currentTheme, setCurrentTheme] = useState<string>("light")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [sessionReminders, setSessionReminders] = useState(true)
  const [studentAlerts, setStudentAlerts] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number>(0)

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme") ||
      document.documentElement.getAttribute("data-theme") ||
      "light"
    setCurrentTheme(savedTheme)

    const storedUnread = localStorage.getItem("notifications_unread_count")
    if (storedUnread !== null) {
      setUnreadCount(Number(storedUnread))
    }

    const handleNotificationsUpdate = (e: any) => {
      if (typeof e.detail === "number") {
        setUnreadCount(e.detail)
      }
    }
    window.addEventListener("notificationsUpdated", handleNotificationsUpdate)
    return () => {
      window.removeEventListener("notificationsUpdated", handleNotificationsUpdate)
    }
  }, [])

  const toggleTheme = (theme: "light" | "dark") => {
    const html = document.documentElement
    html.setAttribute("data-theme", theme)
    if (theme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
    setCurrentTheme(theme)
    toast.success(`Theme switched to ${theme === "dark" ? "Dark Mode" : "Light Mode"}!`)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Preferences updated successfully!")
  }

  const handleResetDefaults = () => {
    setEmailNotifications(true)
    setSessionReminders(true)
    setStudentAlerts(true)
    setWeeklyDigest(false)
    toggleTheme("light")
    toast.info("Preferences reset to default.")
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-130px)] min-h-[500px] flex flex-col gap-4 pb-2">
      {/* 1. TOP HEADER (Fixed, never scrolls) */}
      <div className="shrink-0 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200/90 dark:border-slate-800 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Sliders size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Account Settings
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Manage your appearance, notification delivery channels, and platform preferences
              </p>
            </div>
          </div>

          <Link
            to="/notifications"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition self-start sm:self-center"
          >
            <Bell size={16} />
            <span>Notifications Feed</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
            <ExternalLink size={13} className="ml-0.5 text-blue-500" />
          </Link>
        </div>
      </div>

      {/* 2. SCROLLABLE MIDDLE SECTION (Only this section scrolls) */}
      <form onSubmit={handleSave} className="flex-1 min-h-0 flex flex-col gap-4">
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 custom-scrollbar overscroll-contain">
          {/* Appearance & Theme Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200/90 dark:border-slate-800 transition-all">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Appearance & Theme
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Choose the visual style and color scheme that suits your workspace
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Mode Selector */}
              <div
                onClick={() => toggleTheme("light")}
                className={`relative cursor-pointer p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 ${
                  currentTheme === "light"
                    ? "border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-100"
                    : "border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 bg-gray-50/40 dark:bg-slate-950/40"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                      <Sun size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Light Theme
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Clean & crisp interface
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                      currentTheme === "light"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 dark:border-slate-700"
                    }`}
                  >
                    {currentTheme === "light" && <CheckCircle size={14} />}
                  </div>
                </div>

                {/* Theme Mini Preview */}
                <div className="mt-4 p-3 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <div className="h-2 w-16 bg-gray-200 rounded ml-2" />
                  </div>
                  <div className="h-2 w-full bg-blue-100 rounded" />
                </div>
              </div>

              {/* Dark Mode Selector */}
              <div
                onClick={() => toggleTheme("dark")}
                className={`relative cursor-pointer p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 ${
                  currentTheme === "dark"
                    ? "border-blue-600 bg-blue-950/30 shadow-sm ring-2 ring-blue-900/50"
                    : "border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 bg-gray-50/40 dark:bg-slate-950/40"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                      <Moon size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Dark Theme
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Sleek & comfortable at night
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                      currentTheme === "dark"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 dark:border-slate-700"
                    }`}
                  >
                    {currentTheme === "dark" && <CheckCircle size={14} />}
                  </div>
                </div>

                {/* Theme Mini Preview */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <div className="h-2 w-16 bg-slate-700 rounded ml-2" />
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200/90 dark:border-slate-800 transition-all">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              Notification Delivery Channels
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Configure how and when you receive alerts regarding your tuition sessions and students
            </p>

            <div className="space-y-3">
              {/* 1. Email Notifications */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 dark:bg-slate-950/60 border border-gray-100 dark:border-slate-800/80 transition hover:border-gray-200">
                <div className="flex items-center gap-3.5 pr-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      Email Notifications
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Receive scheduled class digests, updates, and student confirmations via email
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                />
              </div>

              {/* 2. Session Reminders */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 dark:bg-slate-950/60 border border-gray-100 dark:border-slate-800/80 transition hover:border-gray-200">
                <div className="flex items-center gap-3.5 pr-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      Upcoming Class Reminders
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Get alerted 30 minutes before every scheduled tuition session starts
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={sessionReminders}
                  onChange={() => setSessionReminders(!sessionReminders)}
                />
              </div>

              {/* 3. Student Inquiries */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 dark:bg-slate-950/60 border border-gray-100 dark:border-slate-800/80 transition hover:border-gray-200">
                <div className="flex items-center gap-3.5 pr-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      Student Inquiries & Tuition Requests
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Immediate notification when a new student requests or books a demo session
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={studentAlerts}
                  onChange={() => setStudentAlerts(!studentAlerts)}
                />
              </div>

              {/* 4. Weekly Progress Digest */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 dark:bg-slate-950/60 border border-gray-100 dark:border-slate-800/80 transition hover:border-gray-200">
                <div className="flex items-center gap-3.5 pr-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      Weekly Performance Digest
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Receive weekly attendance, hours taught, and client feedback summary
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={weeklyDigest}
                  onChange={() => setWeeklyDigest(!weeklyDigest)}
                />
              </div>
            </div>
          </div>

          {/* Account & Profile Overview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200/90 dark:border-slate-800 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-blue-500/20 shrink-0 uppercase">
                  {user?.firstName?.[0] || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {user?.roleName || "Tutor"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {user?.emailAddress || (user as any)?.email || "user@coachingportal.com"}
                  </p>
                </div>
              </div>

              <Link
                to="/profile"
                className="btn btn-sm btn-outline border-blue-200 hover:border-blue-600 hover:bg-blue-50 text-blue-600 dark:text-blue-400 dark:border-slate-700 self-start sm:self-center rounded-xl"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* 3. FIXED BOTTOM FOOTER / ACTION BAR (Always visible at the bottom) */}
        <div className="shrink-0 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200/90 dark:border-slate-800 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <span className="text-xs text-gray-400 hidden sm:inline">
            Changes are saved to your profile preferences
          </span>

          <button
            type="submit"
            className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 shadow-md shadow-blue-500/20 border-none gap-2 font-semibold text-xs sm:text-sm"
          >
            <Save size={16} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings
