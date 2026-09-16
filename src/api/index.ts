export { default as axiosInstance } from "./axiosInstance"
export { default as apiClient } from "./client"
export { API_ENDPOINTS } from "./endpoints"
export { authApi, loginUser, forgotPassword, verifyOtp } from "./auth"
export { menuApi } from "./menu"
export { submenuApi } from "./submenu"
export {
  profileApi,
  uploadProfilePhoto,
  updateProfilePhoto,
  deleteProfilePhoto,
  saveProfilePhoto,
} from "./profile"
export { rolesApi } from "./roles"
export { permissionsApi } from "./permissions"
export {
  userManagementApi,
  getUserKpiCards,
  listUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from "./userManagement"
export * from "./type"



