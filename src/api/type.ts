/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T
  message?: string
  status?: number
  success?: boolean
}

/**
 * FastAPI standard error detail structures
 */
export interface FastAPIValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

export interface FastAPIErrorResponse {
  detail: string | FastAPIValidationError[]
}

/**
 * Authentication Payload & Response Types
 */
export interface LoginPayload {
  username?: string
  email?: string
  password: string
}

export interface AuthTokens {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
}

export interface UserProfile {
  id: number | string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  role?: string
  rolePermissions?: any[]
  [key: string]: any
}

/**
 * Menu & Submenu API Interfaces
 */
export interface ApiSubmenu {
  subMenuId?: number
  subMenuName: string
  subMenuUrl: string
  subMenuIcon?: string
  menuId?: number
  [key: string]: any
}

export interface ApiMenu {
  menuId?: number
  menuName: string
  menuUrl: string
  menuIcon?: string
  subMenus?: ApiSubmenu[]
  [key: string]: any
}

export interface CreateMenuPayload {
  menuName: string
  menuUrl: string
  menuIcon?: string
  subMenus?: ApiSubmenu[]
}

export interface UpdateMenuPayload {
  menuName?: string
  menuUrl?: string
  menuIcon?: string
  subMenus?: ApiSubmenu[]
}

export interface CreateSubmenuPayload {
  subMenuName: string
  subMenuUrl: string
  subMenuIcon?: string
  menuId: number
}

export interface UpdateSubmenuPayload {
  subMenuName?: string
  subMenuUrl?: string
  subMenuIcon?: string
  menuId?: number
}

/**
 * Permission API Interfaces
 */
export interface ApiPermission {
  permissionId?: number
  id?: number
  permissionCode?: string
  code?: string
  permissionName?: string
  name?: string
  description?: string
  [key: string]: any
}

export interface CreatePermissionPayload {
  permissionCode: string
  permissionName: string
  description?: string
}

export interface UpdatePermissionPayload {
  permissionCode?: string
  permissionName?: string
  description?: string
}

/**
 * Role API Interfaces
 */
export interface ApiRole {
  roleId?: number
  id?: number
  roleName?: string
  name?: string
  description?: string
  permissions?: ApiPermission[]
  [key: string]: any
}

export interface CreateRolePayload {
  roleName: string
  description?: string
  permissionIds?: number[]
}

export interface UpdateRolePayload {
  roleName?: string
  description?: string
  permissionIds?: number[]
}


