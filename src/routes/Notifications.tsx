import React, { useEffect, useState } from "react"
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  Info,
  UserPlus,
  CheckCheck,
  Trash2,
  RotateCcw,
  Sliders,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

export type NotificationType = "session" | "success" | "student" | "info"

export interface INotification {
  id: number
  title: string
  message: string
  time: string
  type: NotificationType
  read: boolean
}

const STORAGE_KEY = "coaching_notifications_list"
const UNREAD_COUNT_KEY = "notifications_unread_count"

export const sampleNotifications: INotification[] = [
  {
    id: 1,
    title: "New Session Scheduled",
    message:
      "Your Mathematics session with Arjun Kumar has been scheduled for today at 5:00 PM.",
    time: "10 minutes ago",
    type: "session",
    read: false,
  },
  {
    id: 2,
    title: "New Student Request",
    message:
      "Priya Sharma has sent you a tuition request for Class 10 Science.",
    time: "30 minutes ago",
    type: "student",
    read: false,
  },
  {
    id: 3,
    title: "Session Completed",
    message:
      "Your English session with Rohit Singh has been marked as completed.",
    time: "2 hours ago",
    type: "success",
    read: false,
  },
  {
    id: 4,
    title: "Upcoming Class Reminder",
    message:
      "Reminder: Your Physics class starts tomorrow at 10:00 AM.",
    time: "Yesterday",
    type: "session",
    read: true,
  },
  {
    id: 5,
    title: "Profile Updated",
    message: "Your tutor profile information was updated successfully.",
    time: "2 days ago",
    type: "info",
    read: true,
  },
  {
    id: 6,
    title: "Monthly Tuition Fee Credited",
    message:
      "Monthly tuition payment of ₹12,500 has been successfully credited to your account.",
    time: "3 days ago",
    type: "success",
    read: true,
  },
  {
    id: 7,
    title: "New Student Inquiry",
    message:
      "Aman Verma requested a demo class for Grade 12 Advanced Chemistry.",
    time: "4 days ago",
    type: "student",
    read: true,
  },
  {
    id: 8,
    title: "Platform Maintenance",
    message:
      "System maintenance scheduled for Sunday at 2:00 AM IST. Expect 15 mins downtime.",
    time: "5 days ago",
    type: "info",
    read: true,
  },
]

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<INotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      } catch (e) {
        console.error("Failed to parse stored notifications", e)
      }
    }
    return sampleNotifications
  })

  const [filter, setFilter] = useState<"all" | "unread" | "session" | "student">("all")

  const unreadCount = notifications.filter((item) => !item.read).length

  // Synchronize unread count with localStorage and trigger event for Navbar bell
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    localStorage.setItem(UNREAD_COUNT_KEY, unreadCount.toString())
    window.dispatchEvent(
      new CustomEvent("notificationsUpdated", { detail: unreadCount })
    )
  }, [notifications, unreadCount])

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    )
    toast.success("All notifications marked as read")
  }

  const clearAllNotifications = () => {
    setNotifications([])
    toast.info("Notifications cleared")
  }

  const resetToSampleData = () => {
    setNotifications(sampleNotifications)
    toast.success("Sample notifications restored!")
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "session":
        return <CalendarDays size={20} />
      case "success":
        return <CheckCircle2 size={20} />
      case "student":
        return <UserPlus size={20} />
      default:
        return <Info size={20} />
    }
  }

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case "session":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
      case "success":
        return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
      case "student":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
      default:
        return "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
    }
  }

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case "session":
        return "Session"
      case "student":
        return "Student"
      case "success":
        return "Completed"
      default:
        return "Update"
    }
  }

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "unread") return !item.read
    if (filter === "session") return item.type === "session"
    if (filter === "student") return item.type === "student"
    return true
  })

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-130px)] min-h-[500px] flex flex-col gap-4 pb-2">
      {/* Top Banner / Header Card (Fixed, never scrolls) */}
      <div className="shrink-0 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200/90 dark:border-slate-800 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Bell size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Notifications
                </h1>
                {unreadCount > 0 ? (
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white shadow-xs">
                    {unreadCount} unread
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                    All caught up
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Track your student requests, upcoming sessions, and platform activities
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition"
              >
                <CheckCheck size={16} />
                <span>Mark all as read</span>
              </button>
            )}

            {notifications.length === 0 ? (
              <button
                type="button"
                onClick={resetToSampleData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 rounded-xl transition"
              >
                <RotateCcw size={14} />
                <span>Restore Sample Data</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={clearAllNotifications}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
                title="Clear all notifications"
              >
                <Trash2 size={15} />
                <span className="hidden sm:inline">Clear all</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
              filter === "unread"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            Unread ({unreadCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter("session")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
              filter === "session"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            Sessions ({notifications.filter((n) => n.type === "session").length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("student")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
              filter === "student"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            Students ({notifications.filter((n) => n.type === "student").length})
          </button>
        </div>
      </div>

      {/* Notifications Container: Scrollable List + Fixed Bottom Footer */}
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200/90 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Scrollable list: ONLY this inner section scrolls */}
        {filteredNotifications.length > 0 ? (
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/80 custom-scrollbar overscroll-contain">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`group relative flex items-start gap-4 p-4 sm:p-5 transition-all duration-150 cursor-pointer ${
                  !notification.read
                    ? "bg-blue-50/40 hover:bg-blue-50/70 dark:bg-blue-950/20 dark:hover:bg-blue-950/30"
                    : "bg-white hover:bg-gray-50/80 dark:bg-slate-900 dark:hover:bg-slate-850"
                }`}
              >
                {/* Left Colored Icon */}
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${getTypeColor(
                    notification.type
                  )}`}
                >
                  {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                        {getTypeBadge(notification.type)}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <h3
                        className={`text-sm text-gray-900 dark:text-white ${
                          !notification.read ? "font-bold" : "font-semibold"
                        }`}
                      >
                        {notification.title}
                      </h3>
                    </div>

                    {/* Unread status dot */}
                    {!notification.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/40 shrink-0" />
                    )}
                  </div>

                  <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 text-xs text-gray-400 dark:text-gray-500">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock size={12} />
                      <span>{notification.time}</span>
                    </div>

                    {!notification.read && (
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                        Click to mark read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-inner">
              <Bell size={28} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {filter === "unread" ? "No unread notifications" : "All caught up!"}
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              {filter === "unread"
                ? "You have reviewed all your active notifications."
                : "You don't have any notifications right now."}
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={resetToSampleData}
                className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 border-none gap-2 shadow-sm"
              >
                <RotateCcw size={15} />
                Restore Sample Notifications
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM FOOTER (Fixed at the bottom of the notifications card) */}
        <div className="shrink-0 px-5 py-3.5 bg-gray-50/90 dark:bg-slate-950/80 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-gray-500 dark:text-gray-400">
            <span>
              Showing <strong className="text-gray-800 dark:text-gray-200">{filteredNotifications.length}</strong> of{" "}
              <strong className="text-gray-800 dark:text-gray-200">{notifications.length}</strong> alerts
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold text-[11px]">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold transition hover:underline"
              >
                Mark all read
              </button>
            )}

            <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">|</span>

            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 font-medium transition"
            >
              <Sliders size={13} />
              <span>Notification Preferences</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications
