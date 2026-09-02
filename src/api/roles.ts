import axiosInstance from "./axiosInstance"
import apiClient from "./client"
import { API_ENDPOINTS } from "./endpoints"
import { ApiRole, CreateRolePayload, UpdateRolePayload } from "./type"

/**
  * Get all roles
  */
export const getRoles = async (): Promise<ApiRole[]> => {
  return apiClient.get<ApiRole[]>(API_ENDPOINTS.ROLES.BASE)
}

/**
  * Create a new role
  */
export const createRole = async (payload: CreateRolePayload): Promise<ApiRole> => {
  return apiClient.post<ApiRole>(API_ENDPOINTS.ROLES.BASE, payload)
}

/**
  * Get role by ID
  */
export const getRoleById = async (roleId: number | string): Promise<ApiRole> => {
  return apiClient.get<ApiRole>(API_ENDPOINTS.ROLES.BY_ID(roleId))
}

/**
  * Get role by Name
  */
export const getRoleByName = async (roleName: string): Promise<ApiRole> => {
  return apiClient.get<ApiRole>(API_ENDPOINTS.ROLES.BY_NAME(roleName))
}

/**
  * Update role by ID
  */
export const updateRole = async (
  roleId: number | string,
  payload: UpdateRolePayload
): Promise<ApiRole> => {
  return apiClient.put<ApiRole>(API_ENDPOINTS.ROLES.BY_ID(roleId), payload)
}

/**
  * Delete role by ID
  */
export const deleteRole = async (roleId: number | string): Promise<any> => {
  return apiClient.delete(API_ENDPOINTS.ROLES.BY_ID(roleId))
}

export const rolesApi = {
  getRoles,
  createRole,
  getRoleById,
  getRoleByName,
  updateRole,
  deleteRole,
}

export default rolesApi
