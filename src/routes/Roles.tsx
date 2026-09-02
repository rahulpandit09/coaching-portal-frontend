import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, ShieldCheck, Edit, Trash2, Loader2, RefreshCw, X, AlertCircle } from "lucide-react"
import { rolesApi } from "@/api/roles"
import { ApiRole, CreateRolePayload } from "@/api/type"

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<ApiRole[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  
  const [selectedRole, setSelectedRole] = useState<ApiRole | null>(null)
  const [formData, setFormData] = useState<CreateRolePayload>({
    roleName: "",
    description: "",
  })
  const [actionLoading, setActionLoading] = useState<boolean>(false)

  const fetchRoles = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await rolesApi.getRoles()
      setRoles(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Failed to fetch roles:", err)
      setError("Failed to load roles from backend.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const filteredRoles = roles.filter((role) => {
    const name = role.roleName || role.name || ""
    const desc = role.description || ""
    const query = searchQuery.toLowerCase()
    return name.toLowerCase().includes(query) || desc.toLowerCase().includes(query)
  })

  const handleOpenCreate = () => {
    setFormData({ roleName: "", description: "" })
    setIsCreateOpen(true)
  }

  const handleOpenEdit = (role: ApiRole) => {
    setSelectedRole(role)
    setFormData({
      roleName: role.roleName || role.name || "",
      description: role.description || "",
    })
    setIsEditOpen(true)
  }

  const handleOpenDelete = (role: ApiRole) => {
    setSelectedRole(role)
    setIsDeleteOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.roleName.trim()) return

    setActionLoading(true)
    setError(null)
    try {
      await rolesApi.createRole(formData)
      setSuccess("Role created successfully!")
      setIsCreateOpen(false)
      fetchRoles()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error("Failed to create role:", err)
      setError(err?.response?.data?.detail || "Failed to create role.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole || !formData.roleName.trim()) return
    const id = selectedRole.roleId || selectedRole.id
    if (!id) return

    setActionLoading(true)
    setError(null)
    try {
      await rolesApi.updateRole(id, formData)
      setSuccess("Role updated successfully!")
      setIsEditOpen(false)
      fetchRoles()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error("Failed to update role:", err)
      setError(err?.response?.data?.detail || "Failed to update role.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return
    const id = selectedRole.roleId || selectedRole.id
    if (!id) return

    setActionLoading(true)
    setError(null)
    try {
      await rolesApi.deleteRole(id)
      setSuccess("Role deleted successfully!")
      setIsDeleteOpen(false)
      fetchRoles()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error("Failed to delete role:", err)
      setError(err?.response?.data?.detail || "Failed to delete role.")
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
            <ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={28} />
            Roles Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Define and manage user roles and their security access levels across the platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRoles}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900 text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-50"
            title="Refresh Roles"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="btn bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white border-none rounded-xl px-4 flex items-center gap-2 font-semibold shadow-md"
          >
            <Plus size={18} />
            Create Role
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
          placeholder="Search roles by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-gray-200"
        />
      </div>

      {/* Roles Grid / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Loader2 size={36} className="animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Fetching roles from server...</p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-gray-200 dark:border-slate-800 p-12 text-center">
          <ShieldCheck size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">No Roles Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {searchQuery ? "No roles match your search term." : "Get started by creating your first user role."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => {
            const roleId = role.roleId || role.id
            const name = role.roleName || role.name || "Unnamed Role"
            const desc = role.description || "No description provided."

            return (
              <motion.div
                key={roleId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base border border-indigo-100 dark:border-indigo-900">
                        {name[0]?.toUpperCase() || "R"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">{name}</h3>
                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                          ID: {roleId}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mb-4">
                    {desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-900 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(role)}
                    className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                    title="Edit Role"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleOpenDelete(role)}
                    className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                    title="Delete Role"
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
                <Plus className="text-indigo-600" size={20} />
                Create New Role
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Administrator, Coach, Student"
                  value={formData.roleName}
                  onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the responsibilities of this role..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-gray-200 resize-none"
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {actionLoading && <Loader2 size={16} className="animate-spin" />}
                  Create Role
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
                <Edit className="text-indigo-600" size={20} />
                Edit Role
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.roleName}
                  onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-gray-200"
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
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-gray-200 resize-none"
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-md"
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

            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Delete Role?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Are you sure you want to delete <span className="font-semibold text-gray-800 dark:text-gray-200">"{selectedRole?.roleName || selectedRole?.name}"</span>? This action cannot be undone.
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

export default Roles
