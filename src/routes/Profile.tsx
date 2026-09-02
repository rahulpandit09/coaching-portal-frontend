import React, { useRef, useState } from "react"
import { useAuth } from "@/contexts/auth"
import { Camera, Loader2, Trash2 } from "lucide-react"
import { deleteProfilePhoto, saveProfilePhoto } from "@/api/profile"
import { formatPhotoUrl } from "@/utils/photoUtils"

const Profile: React.FC = () => {
  const { user, updateUserProfilePhoto } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tempAvatar, setTempAvatar] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const getCandidateIds = (): (number | string)[] => {
    const ids: (number | string)[] = []

    // 1. User IDs first (matching path parameter `userId`)
    if (user?.userId) ids.push(user.userId)
    if ((user as any)?.id && !ids.includes((user as any).id)) ids.push((user as any).id)
    if ((user as any)?.user_id && !ids.includes((user as any).user_id)) ids.push((user as any).user_id)

    // 2. Active Role ID fallback
    const activeRoleId =
      user?.roleId ||
      user?.rolePermissions?.[0]?.roleId ||
      (user?.roleName === "Client" || user?.role === "Client" ? 3 : undefined)

    if (activeRoleId && !ids.includes(activeRoleId)) ids.push(activeRoleId)

    // 3. Fallbacks
    const fallbacks = [1, 3, 2, 4, 5]
    fallbacks.forEach((f) => {
      if (!ids.includes(f)) ids.push(f)
    })
    return ids
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setTempAvatar(previewUrl)
    setStatusMessage(null)
  }

  const handleSaveAvatar = async () => {
    const file = fileInputRef.current?.files?.[0]

    if (!file) {
      setStatusMessage({ type: "error", text: "Please select an image." })
      return
    }

    setIsUploading(true)
    setStatusMessage(null)

    try {
      const candidateIds = getCandidateIds()
      let result: any = null
      let lastError: any = null
      const isExisting = Boolean(user?.profilePhoto || user?.avatarUrl)

      for (const candidateId of candidateIds) {
        try {
          result = await saveProfilePhoto(candidateId, file, isExisting)
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
      setTempAvatar(null)
    } catch (err: any) {
      console.error("Failed to process profile photo:", err)
      setStatusMessage({
        type: "error",
        text: err?.response?.data?.detail?.[0]?.msg || err?.response?.data?.detail || "Failed to process profile photo.",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
      setTimeout(() => setStatusMessage(null), 4000)
    }
  }

  const handleCancelAvatar = () => {
    setTempAvatar(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
      // setStatusMessage({ type: "success", text: "Profile photo deleted successfully!" })
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
    <div className="max-w-6xl mx-auto mt-8 px-4 bg-white min-h-screen rounded-2xl p-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Status alert */}
      {statusMessage && (
        <div
          className={`mb-4 p-4 rounded-xl text-sm font-medium border flex items-center justify-between shadow-sm ${statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
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

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT — Profile Photo Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative w-40 h-40 group">
            <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-xl overflow-hidden border-4 border-indigo-100">
              {isUploading || isDeleting ? (
                <Loader2 size={40} className="animate-spin text-white" />
              ) : tempAvatar ? (
                <img
                  src={tempAvatar}
                  alt={user?.firstName}
                  className="w-full h-full object-cover"
                />
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

              {/* Save / Cancel overlay */}
              {tempAvatar && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 rounded-full">
                  <button
                    type="button"
                    className="btn btn-xs btn-success"
                    onClick={handleSaveAvatar}
                    disabled={isUploading}
                  >
                    {isUploading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-error"
                    onClick={handleCancelAvatar}
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Change Photo Button */}
          <div className="mt-5 w-full">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting}
              className="btn btn-outline btn-sm w-full"
            >
              {isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
              Change Photo
            </button>

            {/* Delete Photo Button */}
            {photoUrl && (
              <button
                type="button"
                onClick={handleDeletePhoto}
                disabled={isUploading || isDeleting}
                className="btn btn-outline btn-warning btn-sm w-full mt-2"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Delete Photo
              </button>
            )}
          </div>
        </div>

        {/* RIGHT — Profile Information */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
              Profile Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mt-4">
              {/* Name */}
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Name
                </div>
                <div className="text-lg text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
              </div>

              {/* Email */}
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Email
                </div>
                <div className="text-lg text-gray-900">
                  {displayEmail}
                </div>
              </div>

              {/* Role */}
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Role
                </div>
                <div className="text-lg text-gray-900">
                  {user?.roleName ?? user?.role ?? "User"}
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Contact Number
                </div>
                <div className="text-lg text-gray-900">
                  {user?.contactNumber ?? "N/A"}
                </div>
              </div>

              {/* Employee No. */}
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Employee No.
                </div>
                <div className="text-lg text-gray-900">
                  {user?.employeeNumber ?? "N/A"}
                </div>
              </div>

              {/* Username */}
              <div>
                <div className="text-sm font-medium text-gray-500">
                  Username
                </div>
                <div className="text-lg text-gray-900">
                  {user?.username ?? "N/A"}
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

