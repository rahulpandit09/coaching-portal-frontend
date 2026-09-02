import axiosInstance from "./axiosInstance"
import { API_ENDPOINTS } from "./endpoints"

export interface ProfileUserData {
  id: number
  first_name: string
  last_name: string
  username: string
  email: string
  profile_image: string
}

export interface ProfilePhotoResponse {
  message: string
  data?: ProfileUserData
}

/**
 * Upload profile photo for a user (POST /profile-photo/upload/{userId})
 * @param userId User ID (e.g. 1)
 * @param file Image File object
 */
export const uploadProfilePhoto = async (
  userId: number | string,
  file: File
): Promise<ProfilePhotoResponse> => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await axiosInstance.post<ProfilePhotoResponse>(
    API_ENDPOINTS.PROFILE_PHOTO.UPLOAD(userId),
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
 * Update profile photo for a user (PUT /profile-photo/upload/{userId})
 * @param userId User ID (e.g. 1)
 * @param file Image File object
 */
export const updateProfilePhoto = async (
  userId: number | string,
  file: File
): Promise<ProfilePhotoResponse> => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await axiosInstance.put<ProfilePhotoResponse>(
    API_ENDPOINTS.PROFILE_PHOTO.UPDATE(userId),
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
 * Delete profile photo for a user (DELETE /profile-photo/delete-profile-photo/{userId})
 * @param userId User ID (e.g. 1)
 */
export const deleteProfilePhoto = async (userId: number | string): Promise<any> => {
  const response = await axiosInstance.delete(
    API_ENDPOINTS.PROFILE_PHOTO.DELETE(userId)
  )

  return response.data
}

/**
 * Smart upload/update profile photo that tries primary method (PUT if isUpdate else POST) with fallback
 */
export const saveProfilePhoto = async (
  userId: number | string,
  file: File,
  isUpdate: boolean = false
): Promise<ProfilePhotoResponse> => {
  if (isUpdate) {
    try {
      return await updateProfilePhoto(userId, file)
    } catch (err: any) {
      // Fallback to POST if PUT returns error
      return await uploadProfilePhoto(userId, file)
    }
  } else {
    try {
      return await uploadProfilePhoto(userId, file)
    } catch (err: any) {
      // Fallback to PUT if POST returns error
      return await updateProfilePhoto(userId, file)
    }
  }
}

export const profileApi = {
  uploadProfilePhoto,
  updateProfilePhoto,
  deleteProfilePhoto,
  saveProfilePhoto,
}

export default profileApi

