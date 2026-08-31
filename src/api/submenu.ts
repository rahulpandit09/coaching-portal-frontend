import apiClient from "./client"
import { API_ENDPOINTS } from "./endpoints"
import { ApiSubmenu, CreateSubmenuPayload, UpdateSubmenuPayload } from "./type"

/**
 * Submenu API Service
 * Handles CRUD operations for /submenu/ endpoints
 */
export const submenuApi = {
  /**
   * Get all submenus
   * GET /submenu/
   */
  getAllSubmenus: async (): Promise<ApiSubmenu[]> => {
    return apiClient.get<ApiSubmenu[]>(API_ENDPOINTS.SUBMENUS.BASE)
  },

  /**
   * Get submenu by ID
   * GET /submenu/{submenu_id}
   */
  getSubmenuById: async (submenuId: string | number): Promise<ApiSubmenu> => {
    return apiClient.get<ApiSubmenu>(API_ENDPOINTS.SUBMENUS.BY_ID(submenuId))
  },

  /**
   * Create a new submenu
   * POST /submenu/
   */
  createSubmenu: async (payload: CreateSubmenuPayload): Promise<ApiSubmenu> => {
    return apiClient.post<ApiSubmenu>(API_ENDPOINTS.SUBMENUS.BASE, payload)
  },

  /**
   * Update existing submenu by ID
   * PUT /submenu/{submenu_id}
   */
  updateSubmenu: async (
    submenuId: string | number,
    payload: UpdateSubmenuPayload
  ): Promise<ApiSubmenu> => {
    return apiClient.put<ApiSubmenu>(
      API_ENDPOINTS.SUBMENUS.BY_ID(submenuId),
      payload
    )
  },

  /**
   * Delete submenu by ID
   * DELETE /submenu/{submenu_id}
   */
  deleteSubmenu: async (submenuId: string | number): Promise<void> => {
    return apiClient.delete<void>(API_ENDPOINTS.SUBMENUS.BY_ID(submenuId))
  },
}

export default submenuApi
