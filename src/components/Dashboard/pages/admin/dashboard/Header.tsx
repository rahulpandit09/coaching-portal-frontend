import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";

const Header: React.FC = () => {
  const [headerData, setHeaderData] = useState({
    username: "",
    role: "",
    lastLogin: "",
    systemStatus: "Checking...",
    notifications: 0,
    todayDate: ""
  });
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("❌ No token found in localStorage");
      return;
    }

    fetch("http://localhost:8000/admin/adminDashboard_student/dashboard/header", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          console.error("❌ Backend Error:", errorData);
          throw new Error("Unauthorized or API error");
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Header Data:", data);
        setHeaderData(data);
      })
      .catch((err) => {
        console.error("❌ Header API error:", err.message);
      });
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">

      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm opacity-90">
          Welcome {headerData.username} ({headerData.role})
        </p>
        <p className="text-xs opacity-80">
          Last login: {headerData.lastLogin}
        </p>
      </div>

      <div className="flex items-center gap-4">

        <span className={`text-sm px-3 py-1 rounded-full ${headerData.systemStatus === "Active"
            ? "bg-green-500"
            : "bg-red-500"
          }`}>
          System {headerData.systemStatus}
        </span>

        <div className="relative">
          <Bell className="cursor-pointer" />
          {headerData.notifications > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 rounded-full">
              {headerData.notifications}
            </span>
          )}
        </div>

        <p className="text-sm">
          {headerData.todayDate}
        </p>

      </div>
    </div>
  );
};

export default Header;