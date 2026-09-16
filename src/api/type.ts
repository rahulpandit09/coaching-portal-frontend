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
export interface RegisterPayload {
  first_name: string
  last_name: string
  username: string
  email: string
  password: string
  role_name?: string
}

export interface LoginPayload {
  username?: string
  email?: string
  password: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface ResetPasswordPayload {
  email: string
  new_password: string
  confirm_password: string
}

export interface RefreshTokenPayload {
  refresh_token: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type?: string
  expires_in?: number
  user?: UserProfile | null
  user_data?: any
  data?: any
  rolePermissions?: any[]
  [key: string]: any
}

export interface UserProfile {
  id: number | string
  first_name?: string
  last_name?: string
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  emailAddress?: string
  role_id?: number
  roleId?: number
  role?: string
  roleName?: string
  profile_image?: string | null
  profilePhoto?: string | null
  avatarUrl?: string | null
  aadhaar_card?: string | null
  last_login?: string | null
  student_details?: any
  teacher_details?: any
  parent_details?: any
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

/**
 * User Management Interfaces
 */
export interface UserKpiData {
  total_users: number
  students: number
  teachers: number
  parents: number
  total_students?: number
  total_teachers?: number
  total_parents?: number
  [key: string]: any
}

export interface CreateStudentDetailsPayload {
  date_of_birth?: string
  gender?: string
  student_id?: string
  school_name?: string
  class_name?: string
  board?: string
  academic_year?: string
  subjects?: string
  preferred_language?: string
  address?: string
  city?: string
  state?: string
  country?: string
  pin_code?: string
  [key: string]: any
}

export interface CreateTeacherDetailsPayload {
  employee_id?: string
  qualification?: string
  specialization?: string
  experience?: number
  teaching_language?: string
  teaching_classes?: string
  teaching_subjects?: string
  [key: string]: any
}

export interface CreateParentDetailsPayload {
  relationship?: string
  occupation?: string
  company_name?: string
  preferred_communication?: string
  [key: string]: any
}

export interface CreateUserPayload {
  first_name: string
  last_name: string
  username?: string
  email: string
  phone?: string
  password?: string
  role_id: number
  student_details?: CreateStudentDetailsPayload
  teacher_details?: CreateTeacherDetailsPayload
  parent_details?: CreateParentDetailsPayload
  [key: string]: any
}

export interface ListUsersParams {
  skip?: number
  limit?: number
  role_id?: number
  search?: string
  status?: string
  [key: string]: any
}


