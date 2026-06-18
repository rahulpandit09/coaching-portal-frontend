import axios from "axios";

// 🔹 Create Axios Instance
//nuse only docker when you want to run docker 
const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

//production leve
// const API = axios.create({
//   baseURL: "/api",
// });

//this is only for kubernites use when you need k8s
// const API = axios.create({
//   baseURL: "/api",
// });

// const API = axios.create({
//   baseURL: "http://192.168.1.4:8000",
// });


// 🔹 Optional: Attach token automatically to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// =========================
// ✅ REGISTER
// =========================
export const registerUser = (data: {
  full_name: string;
  username: string;
  email: string;
  password: string;
}) => {
  return API.post("/auth/register", data);
};




// =========================
// ✅ LOGIN (Username or Email)
// =========================
export const loginUser = async (
  identifier: string,
  password: string
) => {
  const formData = new URLSearchParams();
  formData.append("username", identifier);
  formData.append("password", password);

  return API.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};


// =========================
// ✅ LOGOUT
// =========================
export const logoutUser = async () => {
  return API.post("/auth/logout");
};


// =========================
// ✅ FORGOT PASSWORD
// =========================
export const forgotPassword = async (email: string) => {
  return API.post("/auth/forgot-password", { email });
};


// =========================
// ✅ RESET PASSWORD
// =========================
export const resetPassword = async (
  token: string,
  new_password: string
) => {
  return API.post("/auth/reset-password", {
    token,
    new_password,
  });
};
