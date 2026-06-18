// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { forgotPassword } from "../api/auth";

// const ForgotPassword: React.FC = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState<string>("");

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     try {
//       const response = await forgotPassword(email);

//       const token = response.data.reset_token;

//       alert("Reset token generated!");

//       // 🔥 Pass token to reset page
//       navigate("/reset-password", { state: { token } });

//     } catch (error) {
//       alert("Something went wrong");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//       <div className="bg-white p-8 rounded-lg shadow-md w-96">
//         <h2 className="text-2xl font-bold mb-4 text-center">
//           Forgot Password
//         </h2>

//         <p className="text-sm text-gray-600 mb-6 text-center">
//           Enter your registered email to reset your password.
//         </p>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="email"
//             required
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           />

//           <button
//             type="submit"
//             className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
//           >
//             Continue
//           </button>
//         </form>

//         <div className="mt-4 text-center">
//           <button
//             onClick={() => navigate("/login")}
//             className="text-indigo-600 text-sm hover:underline"
//           >
//             Back to Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/auth";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(email);
      const token = response.data.reset_token;

      alert("Reset token generated successfully!");

      navigate("/reset-password", { state: { token } });

    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30">

        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Forgot Password 🔑
        </h2>

        <p className="text-sm text-white/90 mb-6 text-center">
          Enter your registered email to reset your password.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="mb-6">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition duration-300 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Continue"}
          </button>
        </form>

        <p className="text-center text-white mt-4">
          Remember your password?{" "}
          <span
            onClick={() => navigate("/login")}
            className="underline cursor-pointer"
          >
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

