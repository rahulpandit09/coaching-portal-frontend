import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  BookOpen,
  Layers,
  CreditCard,
  BarChart3,
  LogOut,
} from "lucide-react";

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const linkClass =
    "flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-600 transition-all";

  const activeClass = "bg-indigo-800";

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-indigo-700 text-white flex flex-col p-5 shadow-lg">
        <h2 className="text-2xl font-bold mb-8"> Admin Panel</h2>

        <nav className="space-y-2 flex-1 overflow-hidden">

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/AdminManageStudents"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <Users size={18} />
            Manage Students
          </NavLink>

          <NavLink
            to="/admin/teachers"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <GraduationCap size={18} />
            Teachers
          </NavLink>

          <NavLink
            to="/admin/courses"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <BookOpen size={18} />
            Courses
          </NavLink>

          <NavLink
            to="/admin/batches"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <Layers size={18} />
            Batches
          </NavLink>

          <NavLink
            to="/admin/fees"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <CreditCard size={18} />
            Update Fees
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <BarChart3 size={18} />
            Reports
          </NavLink>

          <NavLink
            to="/admin/create-teacher"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <UserPlus size={18} />
            Add Teacher
          </NavLink>

          <NavLink
            to="/admin/create-student"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            <UserPlus size={18} />
            Add Student
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

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;