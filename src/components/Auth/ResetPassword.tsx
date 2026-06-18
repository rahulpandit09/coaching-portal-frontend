// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { resetPassword } from "../api/auth";

// const ResetPassword: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const token = location.state?.token;

//   const [password, setPassword] = useState<string>("");
//   const [confirmPassword, setConfirmPassword] = useState<string>("");

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!token) {
//       alert("Invalid or missing token");
//       return;
//     }

//     if (password !== confirmPassword) {
//       alert("Passwords do not match");
//       return;
//     }

//     try {
//       await resetPassword(token, password);

//       alert("Password reset successfully!");
//       navigate("/login");

//     } catch (error) {
//       alert("Reset failed");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//       <div className="bg-white p-8 rounded-lg shadow-md w-96">
//         <h2 className="text-2xl font-bold mb-6 text-center">
//           Reset Password
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="password"
//             required
//             placeholder="New Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           />

//           <input
//             type="password"
//             required
//             placeholder="Confirm Password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           />

//           <button
//             type="submit"
//             className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
//           >
//             Reset Password
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;


import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = location.state?.token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!token) {
      alert("Invalid or missing token");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!passwordPattern.test(password)) {
      alert(
        "Password must contain 1 uppercase, 1 lowercase, 1 number and be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      await resetPassword(token, password);

      alert("Password reset successfully!");
      navigate("/login");
    } catch (error) {
      alert("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Reset Your Password 🔐
        </h2>

        <form onSubmit={handleSubmit}>

          {/* New Password */}
          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Confirm Password */}
          <div className="mb-6 relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="w-full px-4 py-2 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <span
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition duration-300 disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-white mt-4">
          Remember your password?{" "}
          <span
            onClick={() => navigate("/login")}
            className="underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
