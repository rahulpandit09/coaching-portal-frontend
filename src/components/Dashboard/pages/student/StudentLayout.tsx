import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  CreditCard,
  User,
  LogOut,
  Bell,
} from "lucide-react";

const StudentLayout: React.FC = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const linkClass =
    "flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 transition-all";

  const activeClass = "bg-blue-800";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-blue-700 text-white flex flex-col p-5 shadow-lg">
        <h2 className="text-2xl font-bold mb-8">🎓 Student Panel</h2>

        <nav className="space-y-2 flex-1 overflow-hidden">
          
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <Home size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/student/courses"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <BookOpen size={18} />
            My Courses
          </NavLink>

          <NavLink
            to="/student/assignments"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <ClipboardList size={18} />
            Assignments
          </NavLink>

          <NavLink
            to="/student/attendance"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <CalendarCheck size={18} />
            Attendance
          </NavLink>

          <NavLink
            to="/student/payments"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <CreditCard size={18} />
            Fees & Payments
          </NavLink>

          <NavLink
            to="/student/profile"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <User size={18} />
            Profile
          </NavLink>

          <NavLink
            to="/student/notifications"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <Bell size={18} />
            Notifications
          </NavLink>

        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 p-3 rounded-lg mt-4 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-green-400 to-yellow-300">
        <Outlet />
      </main>

    </div>
  );
};

export default StudentLayout;