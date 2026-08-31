import apiClient from "./client"
import { API_ENDPOINTS } from "./endpoints"
import { ApiMenu, CreateMenuPayload, UpdateMenuPayload } from "./type"

/**
+ * Menu API Service
+ * Handles CRUD operations for /menu/ endpoints
+ */
export const menuApi = {
  /**
   * Get all menus
   * GET /menu/
   */
  getAllMenus: async (): Promise<ApiMenu[]> => {
    return apiClient.get<ApiMenu[]>(API_ENDPOINTS.MENUS.BASE)
  },

  /**
   * Get menu by ID
   * GET /menu/{menu_id}
   */
  getMenuById: async (menuId: string | number): Promise<ApiMenu> => {
    return apiClient.get<ApiMenu>(API_ENDPOINTS.MENUS.BY_ID(menuId))
  },

  /**
   * Create a new menu
   * POST /menu/
   */
  createMenu: async (payload: CreateMenuPayload): Promise<ApiMenu> => {
    return apiClient.post<ApiMenu>(API_ENDPOINTS.MENUS.BASE, payload)
  },

  /**
   * Update existing menu by ID
   * PUT /menu/{menu_id}
   */
  updateMenu: async (
    menuId: string | number,
    payload: UpdateMenuPayload
  ): Promise<ApiMenu> => {
    return apiClient.put<ApiMenu>(API_ENDPOINTS.MENUS.BY_ID(menuId), payload)
  },

  /**
   * Delete menu by ID
   * DELETE /menu/{menu_id}
   */
  deleteMenu: async (menuId: string | number): Promise<void> => {
    return apiClient.delete<void>(API_ENDPOINTS.MENUS.BY_ID(menuId))
  },
}

export default menuApi
