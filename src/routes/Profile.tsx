import React, { useRef, useState } from "react"
import { useAuth } from "@/contexts/auth"
import { Calendar, Camera, Loader2, Mail, Shield, Trash2, User } from "lucide-react"
import { deleteProfilePhoto, uploadProfilePhoto } from "@/api/profile"
import { formatPhotoUrl } from "@/utils/photoUtils"

const Profile: React.FC = () => {
  const { user, updateUserProfilePhoto } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const getCandidateIds = (): (number | string)[] => {
    const ids: (number | string)[] = []
    
    const activeRoleId =
      user?.roleId ||
      user?.rolePermissions?.[0]?.roleId ||
      (user?.roleName === "Client" || user?.role === "Client" ? 3 : undefined)

    if (activeRoleId) ids.push(activeRoleId)

    if (user?.userId && !ids.includes(user.userId) && user.userId !== 1) ids.push(user.userId)
    if ((user as any)?.id && !ids.includes((user as any).id) && (user as any).id !== 1) ids.push((user as any).id)
    if ((user as any)?.user_id && !ids.includes((user as any).user_id) && (user as any).user_id !== 1) ids.push((user as any).user_id)

    const fallbacks = [3, 2, 4, 5, 1]
    fallbacks.forEach((f) => {
      if (!ids.includes(f)) ids.push(f)
    })
    return ids
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setStatusMessage(null)

    try {
      const candidateIds = getCandidateIds()
      let result: string | null = null
      let lastError: any = null

      for (const candidateId of candidateIds) {
        try {
          result = await uploadProfilePhoto(candidateId, file)
          if (result) break
        } catch (err: any) {
          lastError = err
          const detail = err?.response?.data?.detail
          if (
            detail === "User not found" ||
            (typeof detail === "string" && detail.toLowerCase().includes("user not found"))
          ) {
            continue
          }
          throw err
        }
      }

      if (!result && lastError) {
        throw lastError
      }

      const serverPhotoUrl = formatPhotoUrl(result)
      const newPhotoUrl = serverPhotoUrl || URL.createObjectURL(file)

      updateUserProfilePhoto(newPhotoUrl)
      setStatusMessage({ type: "success", text: "Profile photo uploaded successfully!" })
    } catch (err: any) {
      console.error("Failed to upload profile photo:", err)
      setStatusMessage({
        type: "error",
        text: err?.response?.data?.detail?.[0]?.msg || err?.response?.data?.detail || "Failed to upload profile photo.",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
      setTimeout(() => setStatusMessage(null), 4000)
    }
  }

  const handleDeletePhoto = async () => {
    setIsDeleting(true)
    setStatusMessage(null)

    try {
      const candidateIds = getCandidateIds()
      let deleted = false
      let lastError: any = null

      for (const candidateId of candidateIds) {
        try {
          await deleteProfilePhoto(candidateId)
          deleted = true
          break
        } catch (err: any) {
          lastError = err
          const detail = err?.response?.data?.detail
          if (
            detail === "User not found" ||
            (typeof detail === "string" && detail.toLowerCase().includes("user not found"))
          ) {
            continue
          }
          throw err
        }
      }

      if (!deleted && lastError) {
        throw lastError
      }

      updateUserProfilePhoto(null)
      setStatusMessage({ type: "success", text: "Profile photo deleted successfully!" })
    } catch (err: any) {
      console.error("Failed to delete profile photo:", err)
      setStatusMessage({
        type: "error",
        text: err?.response?.data?.detail?.[0]?.msg || err?.response?.data?.detail || "Failed to delete profile photo.",
      })
    } finally {
      setIsDeleting(false)
      setTimeout(() => setStatusMessage(null), 4000)
    }
  }

  const [imgError, setImgError] = useState(false)
  const photoUrl = formatPhotoUrl(user?.profilePhoto || user?.avatarUrl)
  const userInitial = (user?.firstName?.[0] || user?.username?.[0] || "U").toUpperCase()
  const displayEmail = user?.emailAddress || (user?.username?.includes("@") ? user.username : "N/A")

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Profile</h1>

      {/* Status alert */}
      {statusMessage && (
        <div
          className={`mb-4 p-4 rounded-xl text-sm font-medium border flex items-center justify-between shadow-sm ${statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800"
            }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-gray-150 dark:border-slate-800 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-emerald-500 relative"></div>

        {/* Profile Card body */}
        <div className="p-6 relative">
          <div className="absolute -top-16 left-6 group">
            <div className="relative w-24 h-24 rounded-full border-4 border-white dark:border-slate-950 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg overflow-hidden">
              {isUploading || isDeleting ? (
                <Loader2 size={28} className="animate-spin text-white" />
              ) : photoUrl && !imgError ? (
                <img
                  src={photoUrl}
                  alt={user?.firstName}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span>{userInitial}</span>
              )}

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isDeleting}
                className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:pointer-events-none"
                title="Change Photo"
              >
                <Camera size={20} />
                <span className="text-[10px] font-medium mt-0.5">Upload</span>
              </button>
            </div>
          </div>

          <div className="pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{user?.username}</p>
            </div>

            {/* Profile Photo Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isDeleting}
                className="btn btn-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-none font-semibold flex items-center gap-1.5 rounded-xl disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                Upload Photo
              </button>

              {photoUrl && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  disabled={isUploading || isDeleting}
                  className="btn btn-sm bg-red-50 hover:bg-red-100 text-red-600 border-none font-semibold flex items-center gap-1.5 rounded-xl disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete Photo
                </button>
              )}
            </div>
          </div>

          <hr className="my-6 border-gray-100 dark:border-slate-800" />

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Mail size={18} className="text-indigo-500" />
              <div>
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">Email Address</div>
                <div className="text-sm font-semibold">{displayEmail}</div>
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

