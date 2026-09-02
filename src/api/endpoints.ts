/**
 * Centralized FastAPI Endpoint URIs
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/users/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_OTP: "/auth/verify-otp",
  },
  USERS: {
    BASE: "/users",
    PROFILE: "/users/me",
    ALL: "/auth/get-all-users",
    BY_ID: (id: string | number) => `/users/${id}`,
  },
  PROFILE_PHOTO: {
    UPLOAD: (userId: number | string) => `/profile-photo/upload/${userId}`,
    UPDATE: (userId: number | string) => `/profile-photo/upload/${userId}`,
    DELETE: (userId: number | string) => `/profile-photo/delete-profile-photo/${userId}`,
  },
  MENUS: {
    BASE: "/menu/",
    BY_ID: (id: string | number) => `/menu/${id}`,
  },
  SUBMENUS: {
    BASE: "/submenu/",
    BY_ID: (id: string | number) => `/submenu/${id}`,
  },
  COURSES: {
    BASE: "/courses",
    BY_ID: (id: string | number) => `/courses/${id}`,
  },
  BATCHES: {
    BASE: "/batches",
    BY_ID: (id: string | number) => `/batches/${id}`,
  },
  STUDENTS: {
    BASE: "/students",
    BY_ID: (id: string | number) => `/students/${id}`,
  },
  PERMISSIONS: {
    BASE: "/permissions/",
    BY_ID: (id: string | number) => `/permissions/${id}`,
    BY_CODE: (code: string) => `/permissions/${code}`,
  },
  ROLES: {
    BASE: "/roles/",
    BY_ID: (id: string | number) => `/roles/${id}`,
    BY_NAME: (name: string) => `/roles/name/${name}`,
  },
} as const

export default API_ENDPOINTS
