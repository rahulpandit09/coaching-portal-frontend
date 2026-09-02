
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios"
import {
  parseCookies,
  setCookie,
  destroyCookie,
} from "nookies"

// Default local FastAPI server URL (running on port 8000)
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
})

// REQUEST INTERCEPTOR: Attach auth token to headers if present
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const cookies = parseCookies()
    const accessToken =
      cookies.access_token ||
      cookies.token ||
      (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null)

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// RESPONSE INTERCEPTOR: Handle 401 Unauthorized & refresh token strategy
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config
    const requestUrl = originalRequest?.url || ""

    // Do NOT attempt token refresh for login, refresh, or public auth endpoints
    const isAuthRoute =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/login") ||
      requestUrl.includes("/token")

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true

      try {
        const cookies = parseCookies()
        const refreshToken =
          cookies.refresh_token ||
          (typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null)

        if (!refreshToken) {
          throw error
        }

        // Call refresh API using direct axios (bypassing interceptors to avoid infinite loops)
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        )

        const newAccessToken = response.data.access_token

        // Save new access token to cookies and localStorage
        setCookie(null, "access_token", newAccessToken, {
          maxAge: 60 * 60 * 24,
          path: "/",
        })

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken)
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)

      } catch (refreshError) {
        // Clear tokens on failed refresh
        destroyCookie(null, "access_token")
        destroyCookie(null, "refresh_token")
        destroyCookie(null, "token")

        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          window.location.href = "/signin"
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
