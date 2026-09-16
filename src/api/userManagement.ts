import apiClient from "./client"
import { API_ENDPOINTS } from "./endpoints"
import {
  CreateUserPayload,
  ListUsersParams,
  UserKpiData,
} from "./type"

/**
 * Get User KPI Cards statistics
 * GET /user-management/users/kpi
 */
export const getUserKpiCards = async (): Promise<UserKpiData> => {
  return apiClient.get<UserKpiData>(API_ENDPOINTS.USER_MANAGEMENT.KPI)
}

/**
 * List all users with pagination and optional filters
 * GET /user-management/users/
 */
export const listUsers = async (params?: ListUsersParams): Promise<any[]> => {
  return apiClient.get<any[]>(API_ENDPOINTS.USER_MANAGEMENT.USERS, {
    params,
  })
}

/**
 * Create a new user (Student, Teacher, Parent, etc.)
 * POST /user-management/users/
 */
export const createUser = async (payload: CreateUserPayload): Promise<any> => {
  return apiClient.post<any>(API_ENDPOINTS.USER_MANAGEMENT.CREATE, payload)
}

/**
 * Get user by ID
 * GET /user-management/users/:id
 */
export const getUserById = async (id: number | string): Promise<any> => {
  return apiClient.get<any>(API_ENDPOINTS.USER_MANAGEMENT.BY_ID(id))
}

/**
 * Update user by ID
 * PUT /user-management/users/:id
 */
export const updateUser = async (
  id: number | string,
  payload: any
): Promise<any> => {
  return apiClient.put<any>(API_ENDPOINTS.USER_MANAGEMENT.BY_ID(id), payload)
}

/**
 * Delete user by ID
 * DELETE /user-management/users/:id
 */
export const deleteUser = async (id: number | string): Promise<any> => {
  return apiClient.delete(API_ENDPOINTS.USER_MANAGEMENT.BY_ID(id))
}

export const userManagementApi = {
  getUserKpiCards,
  listUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
}

export default userManagementApi
