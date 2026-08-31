import axiosInstance from "./axiosInstance"
import { API_ENDPOINTS } from "./endpoints"

/**
 * Upload profile photo for a user role
 * @param roleId Role ID of the user (e.g. 1)
 * @param file Image File object
 */
export const uploadProfilePhoto = async (roleId: number | string, file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await axiosInstance.post<string>(
    API_ENDPOINTS.PROFILE_PHOTO.UPLOAD(roleId),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )

  return response.data
}

/**
 * Delete profile photo for a user role
 * @param roleId Role ID of the user (e.g. 1)
 */
export const deleteProfilePhoto = async (roleId: number | string): Promise<string> => {
  const response = await axiosInstance.delete<string>(
    API_ENDPOINTS.PROFILE_PHOTO.DELETE(roleId)
  )

  return response.data
}

export const profileApi = {
  uploadProfilePhoto,
  deleteProfilePhoto,
}

export default profileApi
