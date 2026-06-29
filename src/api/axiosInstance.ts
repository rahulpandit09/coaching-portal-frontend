
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios"
import {
  parseCookies,
  setCookie,
  destroyCookie,
} from "nookies"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})


// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const cookies = parseCookies()
    const accessToken = cookies.access_token

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)



// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config

    // Token expired → refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        const cookies = parseCookies()
        const refreshToken = cookies.refresh_token

        if (!refreshToken) {
          throw error
        }

        // Call refresh API
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        )

        const newAccessToken =
          response.data.access_token

        // Save new access token
        setCookie(
          null,
          "access_token",
          newAccessToken,
          {
            maxAge: 60 * 60,
            path: "/",
          }
        )

        // Retry original request
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`

        return axiosInstance(originalRequest)

      } catch (refreshError) {
        // Clear cookies
        destroyCookie(null, "access_token")
        destroyCookie(null, "refresh_token")

        // Redirect login
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance