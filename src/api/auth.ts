import axiosInstance from "./axiosInstance"
import apiClient from "./client"
import { API_ENDPOINTS } from "./endpoints"
import {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
  RefreshTokenPayload,
  UserProfile,
} from "./type"

/**
 * 1. Register User (POST /auth/register)
 * Creates a new user account.
 */
export const registerUser = async (payload: RegisterPayload): Promise<UserProfile> => {
  const response = await axiosInstance.post<UserProfile>(
    API_ENDPOINTS.AUTH.REGISTER,
    payload
  )
  return response.data
}

/**
 * 2. Login User (POST /auth/login)
 * Authenticates user and retrieves JWT access + refresh tokens.
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

    return axiosInstance.post<AuthTokens>(API_ENDPOINTS.AUTH.LOGIN, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
  }

  return axiosInstance.post<AuthTokens>(API_ENDPOINTS.AUTH.LOGIN, {
    username,
    password,
  })
}

/**
 * 3. Forgot Password (POST /auth/forgot-password)
 * Requests an OTP sent to the user's email.
 */
export const forgotPassword = async (email: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
}

/**
 * 4. Verify OTP (POST /auth/verify-otp)
 * Verifies the 6-digit OTP code sent for password reset.
 */
export const verifyOtp = async (email: string, otp: string) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp })
}

/**
 * 5. Reset Password (POST /auth/reset-password)
 * Resets user's password given email, new_password, and confirm_password.
 */
export const resetPassword = async (payload: ResetPasswordPayload) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload)
}

/**
 * 6. Logout User (POST /auth/logout)
 * Invalidates the current user session on the backend.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT)
  } catch (error) {
    // If token already expired or network fails, ignore so local cleanup proceeds
    console.warn("Backend logout request completed with error:", error)
  }
}

/**
 * 7. Refresh Token (POST /auth/refresh)
 * Obtains a new access token using a valid refresh token.
 */
export const refreshAuthToken = async (
  refreshToken: string
): Promise<AuthTokens> => {
  const response = await axiosInstance.post<AuthTokens>(
    API_ENDPOINTS.AUTH.REFRESH,
    { refresh_token: refreshToken }
  )
  return response.data
}

/**
 * Get Current User Profile (GET /auth/me)
 */
export const getMe = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get<UserProfile>(API_ENDPOINTS.AUTH.ME)
  return response.data
}

/**
 * Get All Users (GET /auth/get-all-users)
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const response = await axiosInstance.get<UserProfile[]>(
    API_ENDPOINTS.AUTH.GET_ALL_USERS
  )
  return response.data
}

/**
 * Unified authApi object
 */
export const authApi = {
  register: registerUser,
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
  forgotPassword,
  verifyOtp,
  resetPassword,
  logout: logoutUser,
  refresh: refreshAuthToken,
  getProfile: getMe,
  getAllUsers,
}

export default authApi
