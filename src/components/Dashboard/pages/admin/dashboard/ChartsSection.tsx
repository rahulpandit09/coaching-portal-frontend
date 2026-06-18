import React, { useEffect, useState } from "react";
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

interface RevenueData {
  month: string;
  revenue: number;
}

interface StudentGrowth {
  month: string;
  students: number;
}

const courseData = [
  { name: "Physics", value: 40 },
  { name: "Math", value: 30 },
  { name: "Chemistry", value: 20 },
  { name: "Biology", value: 10 },
];

const COLORS = ["#3b82f6", "#22c55e", "#facc15", "#ef4444"];

const ChartsSection: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [studentGrowth, setStudentGrowth] = useState<StudentGrowth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/admin/dashboard/monthly-revenue").then((res) =>
        res.json()
      ),
      fetch("http://localhost:8000/admin/dashboard/student-growth").then((res) =>
        res.json()
      ),
    ])
      .then(([revenue, growth]) => {
        setRevenueData(revenue);
        setStudentGrowth(growth);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading charts...</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Revenue Bar Chart */}
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

      {/* Student Growth Line Chart */}
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

      {/* Course Distribution Pie */}
      <div className="bg-white p-5 rounded-2xl shadow-sm">
        <h2 className="font-semibold mb-3">Course Distribution</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={courseData} dataKey="value" outerRadius={80}>
              {courseData.map((_entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default ChartsSection;