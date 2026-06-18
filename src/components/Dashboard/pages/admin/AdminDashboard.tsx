import React from "react";
import { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  UserPlus,
  BookOpen,
  FileText,
  Bell,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import StatCard from "./dashboard/StatCard";
import ActionCard from "./dashboard/ActionCard";
import RecentStudentsTable from "./dashboard/RecentStudentsTable";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    paidStudents: 0,
    pendingStudents: 0,
    unpaidStudents: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    monthRevenue: 0,
    todayRevenue: 0,
  });
  const [, setLoading] = useState(true);


  useEffect(() => {
    fetch("http://localhost:8000/admin/adminDashboard_student/dashboard")
      .then((res) => res.json())
      .then((data) => {
        console.log("Dashboard Stats:", data); // optional debug
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, []);

  /* ===== CHART DATA ===== */
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [studentGrowth, setStudentGrowth] = useState<any[]>([]);
  const [courseData, setCourseData] = useState<any[]>([]);



  useEffect(() => {

    // Revenue
    fetch("http://localhost:8000/admin/adminDashboard_student/dashboard/revenue")
      .then(res => res.json())
      .then(data => setRevenueData(data))
      .catch(err => console.error("Revenue API error:", err));

    // Student Growth
    fetch("http://localhost:8000/admin/adminDashboard_student/dashboard/student-growth")
      .then(res => res.json())
      .then(data => setStudentGrowth(data))
      .catch(err => console.error("Growth API error:", err));

    // Course Distribution
    fetch("http://localhost:8000/admin/adminDashboard_student/dashboard/course-distribution")
      .then(res => res.json())
      .then(data => setCourseData(data))
      .catch(err => console.error("Course API error:", err));

  }, []);


  const COLORS = ["#3b82f6", "#22c55e", "#facc15", "#ef4444"];

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm opacity-90">
            Welcome Rahul (Admin)
          </p>
          <p className="text-xs opacity-80">
            Last login: 10:30 AM
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="bg-green-500 px-3 py-1 rounded-full text-sm">
            System Active
          </span>
          <Bell className="cursor-pointer" />
          <p>{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* ================= SMART ALERTS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
          🔴 {stats.unpaidStudents} Unpaid Students
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
          🟡 {stats.pendingStudents} Pending Payments
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
          🟢 {stats.paidStudents} Paid Students
        </div>

      </div>

      {/* ================= STUDENT STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div onClick={() => navigate("/admin/manage-students")}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<Users size={20} />}
            bg="bg-blue-50"
            border="border-blue-500"
          />
        </div>

        <div onClick={() => navigate("/admin/manage-students?status=paid")}>
          <StatCard
            title="Paid Students"
            value={stats.paidStudents}
            icon={<Users size={20} />}
            bg="bg-green-50"
            border="border-green-500"
          />
        </div>

        <div onClick={() => navigate("/admin/manage-students?status=pending")}>
          <StatCard
            title="Pending Students"
            value={stats.pendingStudents}
            icon={<Users size={20} />}
            bg="bg-yellow-50"
            border="border-yellow-500"
          />
        </div>

        <StatCard
          title="Unpaid Students"
          value={stats.unpaidStudents}
          icon={<Users size={20} />}
          bg="bg-red-50"
          border="border-red-500"
        />
      </div>

      {/* ================= REVENUE STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue}`}
          icon={<DollarSign size={20} />}
          bg="bg-green-50"
          border="border-green-600"
        />
        <StatCard
          title="This Month Revenue"
          value={`₹${stats.monthRevenue}`}
          icon={<DollarSign size={20} />}
          bg="bg-blue-50"
          border="border-blue-600"
        />
        <StatCard
          title="Today Revenue"
          value={`₹${stats.todayRevenue}`}
          icon={<DollarSign size={20} />}
          bg="bg-purple-50"
          border="border-purple-600"
        />
        <StatCard
          title="Pending Amount"
          value={`₹${stats.pendingAmount}`}
          icon={<DollarSign size={20} />}
          bg="bg-red-50"
          border="border-red-600"
        />
      </div>

      {/* ================= CHARTS SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Student Growth */}
        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3">Student Growth</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={studentGrowth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="#22c55e" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Course Pie */}
        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-3">Course Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={courseData} dataKey="value" outerRadius={80}>
                {courseData.map((_entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* <ActionCard title="Add Student" icon={<UserPlus size={22} />} /> */}
          <ActionCard
            title="Add Student"
            icon={<UserPlus size={22} />}
            onClick={() => navigate("/admin/students/add")}
          />
          <ActionCard title="Manage Courses" icon={<BookOpen size={22} />} />
          <ActionCard title="Update Fees" icon={<DollarSign size={22} />} />
          <ActionCard title="View Reports" icon={<FileText size={22} />} />
        </div>
      </div>

      <RecentStudentsTable />

    </div>
  );
};

export default AdminDashboard;