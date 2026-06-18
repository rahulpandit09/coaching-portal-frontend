import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  CalendarCheck,
  Users,
  LogOut,
} from "lucide-react";

const TeacherLayout: React.FC = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const linkClass =
    "flex items-center gap-3 p-3 rounded-lg hover:bg-green-600 transition-all";

  const activeClass = "bg-green-800";

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-green-700 text-white flex flex-col p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-8"> Teacher Panel</h2>

        <nav className="space-y-2 flex-1 overflow-hidden">

          <NavLink
            to="/teacher"
            end
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/teacher/assignments"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <ClipboardList size={18} />
            Assignments
          </NavLink>

          <NavLink
            to="/teacher/notes"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <FileText size={18} />
            Upload Notes
          </NavLink>

          <NavLink
            to="/teacher/attendance"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <CalendarCheck size={18} />
            Attendance
          </NavLink>

          <NavLink
            to="/teacher/students"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <Users size={18} />
            Student List
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
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;