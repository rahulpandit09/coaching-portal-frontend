import axiosInstance from "./axiosInstance"
import apiClient from "./client"
import { API_ENDPOINTS } from "./endpoints"
import { AuthTokens, LoginPayload, UserProfile } from "./type"

/**
 * Login user helper
 * @param username Username or email
 * @param password User password
 * @param useFormUrlEncoded Defaults to true for FastAPI OAuth2PasswordRequestForm
 */
export const loginUser = async (
  username?: string,
  password?: string,
  useFormUrlEncoded: boolean = true
) => {
  if (useFormUrlEncoded) {
    const params = new URLSearchParams()
    if (username) params.append("username", username)
    if (password) params.append("password", password)

    return axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
  }

  return axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
    username,
    password,
  })
}

/**
 * Forgot password helper
 */
export const forgotPassword = async (email: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
}

/**
 * Verify OTP helper
 */
export const verifyOtp = async (email: string, otp: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp })
}

export const authApi = {
  /**
   * Login user with credentials object to FastAPI backend
   */
  login: async (
    credentials: LoginPayload,
    useFormUrlEncoded: boolean = true
  ): Promise<AuthTokens> => {
    if (useFormUrlEncoded) {
      const params = new URLSearchParams()
      const userVal = credentials.username || credentials.email || ""
      if (userVal) params.append("username", userVal)
      if (credentials.password) params.append("password", credentials.password)

      const response = await axiosInstance.post<AuthTokens>(
        API_ENDPOINTS.AUTH.LOGIN,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      )
      return response.data
    }

    return apiClient.post<AuthTokens>(API_ENDPOINTS.AUTH.LOGIN, credentials)
  },

  /**
   * Register a new user
   */
  register: async (payload: any): Promise<UserProfile> => {
    return apiClient.post<UserProfile>(API_ENDPOINTS.AUTH.REGISTER, payload)
  },

  /**
   * Get current authenticated user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    return apiClient.get<UserProfile>(API_ENDPOINTS.AUTH.ME)
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT)
  },
}

export default authApi

