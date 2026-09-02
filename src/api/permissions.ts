import apiClient from "./client"
import { API_ENDPOINTS } from "./endpoints"
import { ApiPermission, CreatePermissionPayload, UpdatePermissionPayload } from "./type"

/**
  * Get all permissions
  */
export const getPermissions = async (): Promise<ApiPermission[]> => {
  return apiClient.get<ApiPermission[]>(API_ENDPOINTS.PERMISSIONS.BASE)
}

/**
  * Create a new permission
  */
export const createPermission = async (
  payload: CreatePermissionPayload
): Promise<ApiPermission> => {
  return apiClient.post<ApiPermission>(API_ENDPOINTS.PERMISSIONS.BASE, payload)
}

/**
  * Get permission by ID
  */
export const getPermissionById = async (
  permissionId: number | string
): Promise<ApiPermission> => {
  return apiClient.get<ApiPermission>(API_ENDPOINTS.PERMISSIONS.BY_ID(permissionId))
}

/**
  * Get permission by Code
  */
export const getPermissionByCode = async (
  permissionCode: string
): Promise<ApiPermission> => {
  return apiClient.get<ApiPermission>(API_ENDPOINTS.PERMISSIONS.BY_CODE(permissionCode))
}

/**
  * Update permission by ID
  */
export const updatePermission = async (
  permissionId: number | string,
  payload: UpdatePermissionPayload
): Promise<ApiPermission> => {
  return apiClient.put<ApiPermission>(
    API_ENDPOINTS.PERMISSIONS.BY_ID(permissionId),
    payload
  )
}

/**
  * Delete permission by ID
  */
export const deletePermission = async (
  permissionId: number | string
): Promise<any> => {
  return apiClient.delete(API_ENDPOINTS.PERMISSIONS.BY_ID(permissionId))
}

export const permissionsApi = {
  getPermissions,
  createPermission,
  getPermissionById,
  getPermissionByCode,
  updatePermission,
  deletePermission,
}

export default permissionsApi
