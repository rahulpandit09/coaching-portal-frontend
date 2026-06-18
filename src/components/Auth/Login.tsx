// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { loginUser } from "../api/auth";
// import { jwtDecode } from "jwt-decode";


// interface TokenPayload {
//   user_id: number;
//   role: string;
//   exp: number;
// }


// const Login: React.FC = () => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     try {
//       const response = await loginUser(email, password);

//       const token = response.data.access_token;

//       localStorage.setItem("token", token);

//       const decoded: TokenPayload = jwtDecode(token);
//       const role = decoded.role;

//       localStorage.setItem("role", role);
      
//       if (role === "admin") {
//         navigate("/admin");
//       } else if (role === "teacher") {
//         navigate("/teacher");
//       } else if (role === "student") {
//         navigate("/student");
//       }

//     } catch (error) {
//       alert("Invalid Credentials");
//     }
//   };


//   return (
//     <section className="bg-white min-h-screen flex flex-col">
//       {/* 🔹 Login Form */}
//       <div className="flex justify-center items-center flex-grow py-12">
//         <div className="border rounded-md p-8 w-full max-w-md shadow-sm">
//           <h2 className="text-2xl font-bold mb-6">Login</h2>

//           <form onSubmit={handleSubmit}>

//             {/* Email */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">
//                 Username or Email
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full border-b border-gray-300 outline-none py-2 focus:border-orange-500"
//                 placeholder="Enter username or email"
//               />

//             </div>

//             {/* Password */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full border-b border-gray-300 outline-none py-2 focus:border-orange-500"
//                 placeholder="Enter password"
//               />
//             </div>

//             {/* Remember + Forgot */}
//             <div className="flex justify-between items-center text-sm mb-6">
//               <label className="flex items-center">
//                 <input type="checkbox" className="mr-2" />
//                 Remember Me
//               </label>

//               <button
//                 type="button"
//                 onClick={() => navigate("/forgot-password")}
//                 className="text-orange-500 hover:underline"
//               >
//                 Forgot Password
//               </button>
//             </div>

//             {/* Login Button */}
//             <button
//               type="submit"
//               className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
//             >
//               Login
//             </button>

//             <p className="text-sm text-center mt-4">
//               Don’t have an account?{" "}
//               <button
//                 type="button"
//                 onClick={() => navigate("/register")}
//                 className="text-orange-500 hover:underline"
//               >
//                 Create an account
//               </button>
//             </p>
//           </form>

//           {/* Divider */}
//           <div className="flex items-center my-6">
//             <div className="flex-grow h-px bg-gray-300"></div>
//             <span className="px-4 text-sm text-gray-500">Or</span>
//             <div className="flex-grow h-px bg-gray-300"></div>
//           </div>

//           {/* Social Buttons */}
//           <button
//             type="button"
//             className="w-full flex items-center justify-center gap-2 border py-2 rounded-full mb-3 hover:bg-gray-50"
//           >
//             <img
//               src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGFKGkE0n-MIDhhhVId5GpfwSz5wcPvTJ_Zw&s"
//               alt="Facebook"
//               className="h-5"
//             />
//             Continue with Facebook
//           </button>

//           <button
//             type="button"
//             className="w-full flex items-center justify-center gap-2 border py-2 rounded-full hover:bg-gray-50"
//           >
//             <img
//               src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG5FqrS9OkN5XrA5_GXcN7OV-SoLIl0KPwoQ&s"
//               alt="Google"
//               className="h-5"
//             />
//             Continue with Google
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Login;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff } from "lucide-react";

interface TokenPayload {
  user_id: number;
  role: string;
  exp: number;
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await loginUser(identifier, password);

      const token = response.data.access_token;
      localStorage.setItem("token", token);

      const decoded: TokenPayload = jwtDecode(token);
      const role = decoded.role;

      localStorage.setItem("role", role);

      if (role === "admin") navigate("/admin");
      else if (role === "teacher") navigate("/teacher");
      else navigate("/student");

    } catch (error) {
      alert("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back 
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Username or Email */}
          <div className="mb-4">
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username or Email"
              className="w-full px-4 py-2 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </span>
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center text-sm text-white mb-6">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Remember Me
            </label>

            <span
              onClick={() => navigate("/forgot-password")}
              className="cursor-pointer underline"
            >
              Forgot Password?
            </span>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition duration-300 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-white mt-4">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="underline cursor-pointer"
          >
            Create Account
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
