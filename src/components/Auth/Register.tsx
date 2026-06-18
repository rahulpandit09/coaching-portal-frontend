import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { Eye, EyeOff } from "lucide-react";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [full_name, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = (): boolean => {
    let isValid = true;

    const newErrors = {
      full_name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!full_name.trim()) {
      newErrors.full_name = "Full name is required.";
      isValid = false;
    }

    if (!username.trim()) {
      newErrors.username = "Username is required.";
      isValid = false;
    }

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email || !emailPattern.test(email)) {
      newErrors.email = "Please enter a valid email.";
      isValid = false;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (!passwordPattern.test(password)) {
      newErrors.password =
        "Password must contain 1 uppercase, 1 lowercase, 1 number and be at least 6 characters.";
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await registerUser({
        full_name: full_name,
        username,
        email,
        password,
      });

      alert("Registered Successfully 🎉");
      navigate("/login");
    } catch (error: any) {
      alert(error?.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} noValidate>

          {/* Full Name */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="full_name"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.full_name && (
              <p className="text-red-200 text-sm mt-1">
                {errors.full_name}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.username && (
              <p className="text-red-200 text-sm mt-1">
                {errors.username}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="text-red-200 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
            {errors.password && (
              <p className="text-red-200 text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4 relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
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
            {errors.confirmPassword && (
              <p className="text-red-200 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition duration-300"
          >
            Register
          </button>
        </form>

        <p className="text-center text-white mt-4">
          Already have an account?{" "}
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

export default Register;
