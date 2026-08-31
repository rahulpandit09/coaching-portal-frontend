/**
 * Utility functions for handling API base URLs and Profile Photos
 */

export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined" && (window as any)._env_?.NEXT_PUBLIC_API_URL) {
    return (window as any)._env_.NEXT_PUBLIC_API_URL
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
}

/**
 * Formats profile photo URLs returned from FastAPI backend.
 * Converts relative paths like "/static/uploads/avatar.png" into full absolute URLs
 * pointing to the backend API server.
 */
export const formatPhotoUrl = (rawUrl: any): string | null => {
  if (!rawUrl) return null

  let urlStr = ""
  if (typeof rawUrl === "string") {
    urlStr = rawUrl
  } else if (typeof rawUrl === "object") {
    urlStr =
      rawUrl.photo_url ||
      rawUrl.profilePhoto ||
      rawUrl.avatarUrl ||
      rawUrl.url ||
      rawUrl.file_path ||
      rawUrl.path ||
      rawUrl.filename ||
      ""
  }

  if (!urlStr || typeof urlStr !== "string") return null

  // If already absolute URL or blob or data URI
  if (
    urlStr.startsWith("http://") ||
    urlStr.startsWith("https://") ||
    urlStr.startsWith("blob:") ||
    urlStr.startsWith("data:")
  ) {
    return urlStr
  }

  // Prepend backend BASE_URL for relative paths
  const baseUrl = getApiBaseUrl().replace(/\/$/, "")
  const cleanPath = urlStr.startsWith("/") ? urlStr : `/${urlStr}`
  return `${baseUrl}${cleanPath}`
}
