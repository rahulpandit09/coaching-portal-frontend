import { useState } from "react";
import axios from "axios";

const AdminCreateTeacher = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:8000/admin/create-teacher",
        { name, username, email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Teacher created successfully!");

      setName("");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      alert(error.response?.data?.detail || "Error creating teacher");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/30 transition-all duration-300 hover:shadow-indigo-300">
        
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
           Create Teacher
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 rounded-lg transition outline-none"
          />
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 rounded-lg transition outline-none"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 rounded-lg transition outline-none"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 rounded-lg transition outline-none"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
        >
          Create Teacher 
        </button>
      </div>
    </div>
  );
};

export default AdminCreateTeacher;
