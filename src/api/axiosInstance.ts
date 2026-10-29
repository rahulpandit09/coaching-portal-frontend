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
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface FailedQueueItem {
  resolve: (token: string) => void
  reject: (error: any) => void
}

let isRefreshing = false
let failedQueue: FailedQueueItem[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * Clean up authentication tokens across cookies and localStorage,
 * then redirect the user to the sign-in page.
 */
export const clearAuthAndRedirect = () => {
  destroyCookie(null, "token", { path: "/" })
  destroyCookie(null, "access_token", { path: "/" })
  destroyCookie(null, "refresh_token", { path: "/" })
  destroyCookie(null, "refreshToken", { path: "/" })

  if (typeof window !== "undefined") {
    localStorage.removeItem("userData")
    localStorage.removeItem("accessToken")
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")

    if (window.location.pathname !== "/signin") {
      window.location.href = "/signin"
    }
  }
}

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
})

// REQUEST INTERCEPTOR: Attach auth token & handle multipart requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const cookies = parseCookies()
    const accessToken =
      cookies.access_token ||
      cookies.token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("accessToken") || localStorage.getItem("token")
        : null)

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    // Handle multipart requests (FormData) for document uploads
    // Remove default application/json so browser and Axios set multipart/form-data with boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"]
    }

    return config
  },
  (error) => Promise.reject(error)
)

// RESPONSE INTERCEPTOR: Handle 401 Unauthorized with refresh queue
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<any>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined
    const requestUrl = originalRequest?.url || ""

    // Do NOT attempt token refresh for login, refresh, or public auth endpoints
    const isAuthRoute =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/User/refresh-token") ||
      requestUrl.includes("/login") ||
      requestUrl.includes("/token")

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !isAuthRoute
    ) {
      if (originalRequest._retry) {
        return Promise.reject(error)
      }

      // If a refresh is already in flight, queue this request until it resolves
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            return axiosInstance(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const cookies = parseCookies()
        const refreshToken =
          cookies.refresh_token ||
          cookies.refreshToken ||
          (typeof window !== "undefined"
            ? localStorage.getItem("refreshToken")
            : null)

        if (!refreshToken) {
          throw error
        }

        // Call refresh API with direct axios call (bypasses interceptors to prevent infinite loops)
        let response
        try {
          response = await axios.post(
            `${BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          )
        } catch (authRefreshError: any) {
          // If 404, fallback to /User/refresh-token endpoint
          if (authRefreshError?.response?.status === 404) {
            response = await axios.post(
              `${BASE_URL}/User/refresh-token`,
              { refreshToken }
            )
          } else {
            throw authRefreshError
          }
        }

        const data = response.data?.data || response.data
        const newAccessToken =
          data?.access_token ||
          data?.accessToken ||
          (typeof data === "string" ? data : null)
        const newRefreshToken =
          data?.refresh_token || data?.refreshToken

        if (!newAccessToken) {
          throw new Error("No access token received from refresh response")
        }

        // Save new access token to cookies and localStorage
        setCookie(null, "access_token", newAccessToken, {
          maxAge: 60 * 60 * 24,
          path: "/",
        })
        setCookie(null, "token", newAccessToken, {
          maxAge: 60 * 60 * 24,
          path: "/",
        })

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken)
        }

        // If backend returned rotated refresh token, update it as well
        if (newRefreshToken) {
          setCookie(null, "refresh_token", newRefreshToken, {
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          })
          setCookie(null, "refreshToken", newRefreshToken, {
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          })
          if (typeof window !== "undefined") {
            localStorage.setItem("refreshToken", newRefreshToken)
          }
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }

        processQueue(null, newAccessToken)
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuthAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
