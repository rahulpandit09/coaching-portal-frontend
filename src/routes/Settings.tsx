import React, { useState } from "react"
import { useAuth } from "@/contexts/auth"
import { Sun, Moon, Bell, Lock } from "lucide-react"
import { toast } from "react-toastify"

const Settings: React.FC = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(true)

  const toggleTheme = () => {
    const html = document.documentElement
    const current = html.getAttribute("data-theme")
    const next = current === "dark" ? "light" : "dark"
    html.setAttribute("data-theme", next)
    localStorage.setItem("theme", next)
    toast.success(`Theme updated to ${next}!`)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Settings saved successfully!")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-md border border-gray-150 dark:border-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            Preferences
          </h2>

          <div className="space-y-4">
            {/* Dark Mode toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Sun size={20} className="text-amber-500 dark:hidden" />
                <Moon size={20} className="text-indigo-400 hidden dark:block" />
                <div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Interface Theme</div>
                  <div className="text-xs text-gray-400">Toggle dark / light appearance</div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={toggleTheme}
                className="btn btn-sm btn-primary"
              >
                Change Theme
              </button>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-indigo-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Email Notifications</div>
                  <div className="text-xs text-gray-400">Receive update reminders for scheduled sessions</div>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={notifications} 
                onChange={() => setNotifications(!notifications)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary px-8">
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings
