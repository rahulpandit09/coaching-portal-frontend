import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Key, Edit, Trash2, Loader2, RefreshCw, X, AlertCircle } from "lucide-react"
import { permissionsApi } from "@/api/permissions"
import { ApiPermission, CreatePermissionPayload } from "@/api/type"

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<ApiPermission[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)

  const [selectedPermission, setSelectedPermission] = useState<ApiPermission | null>(null)
  const [formData, setFormData] = useState<CreatePermissionPayload>({
    permissionCode: "",
    permissionName: "",
    description: "",
  })
  const [actionLoading, setActionLoading] = useState<boolean>(false)

  const fetchPermissions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await permissionsApi.getPermissions()
      setPermissions(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Failed to fetch permissions:", err)
      setError("Failed to load permissions from backend.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [])

  const filteredPermissions = permissions.filter((perm) => {
    const code = perm.permissionCode || perm.code || ""
    const name = perm.permissionName || perm.name || ""
    const desc = perm.description || ""
    const query = searchQuery.toLowerCase()
    return (
      code.toLowerCase().includes(query) ||
      name.toLowerCase().includes(query) ||
      desc.toLowerCase().includes(query)
    )
  })

  const handleOpenCreate = () => {
    setFormData({ permissionCode: "", permissionName: "", description: "" })
    setIsCreateOpen(true)
  }

  const handleOpenEdit = (perm: ApiPermission) => {
    setSelectedPermission(perm)
    setFormData({
      permissionCode: perm.permissionCode || perm.code || "",
      permissionName: perm.permissionName || perm.name || "",
      description: perm.description || "",
    })
    setIsEditOpen(true)
  }

  const handleOpenDelete = (perm: ApiPermission) => {
    setSelectedPermission(perm)
    setIsDeleteOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.permissionCode.trim() || !formData.permissionName.trim()) return

    setActionLoading(true)
    setError(null)
    try {
      await permissionsApi.createPermission(formData)
      setSuccess("Permission created successfully!")
      setIsCreateOpen(false)
      fetchPermissions()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error("Failed to create permission:", err)
      setError(err?.response?.data?.detail || "Failed to create permission.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPermission || !formData.permissionCode.trim()) return
    const id = selectedPermission.permissionId || selectedPermission.id
    if (!id) return

    setActionLoading(true)
    setError(null)
    try {
      await permissionsApi.updatePermission(id, formData)
      setSuccess("Permission updated successfully!")
      setIsEditOpen(false)
      fetchPermissions()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error("Failed to update permission:", err)
      setError(err?.response?.data?.detail || "Failed to update permission.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPermission) return
    const id = selectedPermission.permissionId || selectedPermission.id
    if (!id) return

    setActionLoading(true)
    setError(null)
    try {
      await permissionsApi.deletePermission(id)
      setSuccess("Permission deleted successfully!")
      setIsDeleteOpen(false)
      fetchPermissions()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error("Failed to delete permission:", err)
      setError(err?.response?.data?.detail || "Failed to delete permission.")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="text-emerald-600 dark:text-emerald-400" size={28} />
            Permissions Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure system permissions, action capabilities, and access scope tags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPermissions}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900 text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-50"
            title="Refresh Permissions"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="btn bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white border-none rounded-xl px-4 flex items-center gap-2 font-semibold shadow-md"
          >
            <Plus size={18} />
            Create Permission
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm font-medium flex justify-between items-center"
        >
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}><X size={16} /></button>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-sm font-medium flex items-center gap-2"
        >
          <AlertCircle size={18} />
          <span className="flex-1">{typeof error === "string" ? error : JSON.stringify(error)}</span>
          <button onClick={() => setError(null)}><X size={16} /></button>
        </motion.div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search permissions by code, name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-gray-200"
        />
      </div>

      {/* Permissions Grid / Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Loader2 size={36} className="animate-spin text-emerald-600 mb-3" />
          <p className="text-sm font-medium">Fetching permissions from server...</p>
        </div>
      ) : filteredPermissions.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-gray-200 dark:border-slate-800 p-12 text-center">
          <Key size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">No Permissions Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {searchQuery ? "No permissions match your search query." : "Get started by adding system permission codes."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPermissions.map((perm) => {
            const permId = perm.permissionId || perm.id
            const code = perm.permissionCode || perm.code || "N/A"
            const name = perm.permissionName || perm.name || code
            const desc = perm.description || "No description provided."

            return (
              <motion.div
                key={permId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-2.5 py-1 rounded-lg truncate">
                      {code}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                      ID: {permId}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 dark:text-white text-base mt-2">{name}</h3>

                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mt-1 mb-4">
                    {desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-900 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(perm)}
                    className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                    title="Edit Permission"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleOpenDelete(perm)}
                    className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                    title="Delete Permission"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="text-emerald-600" size={20} />
                Create New Permission
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Permission Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user:read, course:create"
                  value={formData.permissionCode}
                  onChange={(e) => setFormData({ ...formData, permissionCode: e.target.value })}
                  className="w-full px-3.5 py-2 font-mono text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Permission Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read Users, Create Course"
                  value={formData.permissionName}
                  onChange={(e) => setFormData({ ...formData, permissionName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what action this permission allows..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-gray-200 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin" />}
                  Create Permission
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Edit className="text-emerald-600" size={20} />
                Edit Permission
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Permission Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.permissionCode}
                  onChange={(e) => setFormData({ ...formData, permissionCode: e.target.value })}
                  className="w-full px-3.5 py-2 font-mono text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Permission Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.permissionName}
                  onChange={(e) => setFormData({ ...formData, permissionName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-gray-200 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Delete Permission?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Are you sure you want to delete <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">"{selectedPermission?.permissionCode || selectedPermission?.code}"</span>? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-md"
              >
                {actionLoading && <Loader2 size={16} className="animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Permissions
