import axiosInstance from "./axiosInstance"
import {
  setCookie,
  destroyCookie,
} from "nookies"


// TYPES

interface RegisterPayload {
  full_name: string
  username: string
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}


// REGISTER
// POST /auth/register

export const registerUser = async (
  data: RegisterPayload
) => {
  const response = await axiosInstance.post(
    "/auth/register",
    data
  )

  return response.data
}


// LOGIN
// POST /auth/login
// x-www-form-urlencoded

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const formData = new URLSearchParams()

  // FastAPI OAuth2 uses username field
  formData.append("username", email)
  formData.append("password", password)

  const response = await axiosInstance.post(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  )

  const data = response.data

  // Save access token
  setCookie(
    null,
    "access_token",
    data.access_token,
    {
      maxAge: 60 * 60,
      path: "/",
    }
  )

  // Save refresh token
  setCookie(
    null,
    "refresh_token",
    data.refresh_token,
    {
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    }
  )

  return data
}


// LOGOUT
// POST /auth/logout

export const logoutUser = async () => {
  try {
    await axiosInstance.post("/auth/logout")
  } catch (error) {
    console.log("Logout API error:", error)
  }

  // Remove cookies
  destroyCookie(null, "access_token")
  destroyCookie(null, "refresh_token")

  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
}



// FORGOT PASSWORD
// POST /auth/forgot-password

export const forgotPassword = async (
  email: string
) => {
  const response = await axiosInstance.post(
    "/auth/forgot-password",
    {
      email,
    }
  )

  return response.data
}



// VERIFY OTP
// POST /auth/verify-otp

export const verifyOtp = async (
  email: string,
  otp: string
) => {
  const response = await axiosInstance.post(
    "/auth/verify-otp",
    {
      email,
      otp,
    }
  )

  return response.data
}



// RESET PASSWORD
// POST /auth/reset-password

export const resetPassword = async (
  email: string,
  new_password: string,
  confirm_password: string
) => {
  const response = await axiosInstance.post(
    "/auth/reset-password",
    {
      email,
      new_password,
      confirm_password,
    }
  )

  return response.data
}