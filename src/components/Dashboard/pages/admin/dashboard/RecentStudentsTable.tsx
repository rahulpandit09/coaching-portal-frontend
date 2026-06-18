import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";

interface Student {
  id: number;
  name: string;
  course_id: number;
  pending_amount: number;
  created_at: string | null;
}

const RecentStudentsTable: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/admin/dashboard/recent-students")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-800">
          Recent Students
        </h2>
        <button
          // onClick={() => navigate("/admin/manage-students")}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          View All →
        </button>
      </div>

      {/* ===== Loading State ===== */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600">
                <th className="py-3 px-3 text-left">ID</th>
                <th className="py-3 px-3 text-left">Name</th>
                <th className="py-3 px-3 text-left">Course</th>
                <th className="py-3 px-3 text-left">Joined</th>
                <th className="py-3 px-3 text-left">Pending</th>
                <th className="py-3 px-3 text-left">Status</th>
                <th className="py-3 px-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-400">
                    No recent students found
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-3 font-medium">
                      STU-{student.id}
                    </td>

                    <td className="py-3 px-3">
                      {student.name}
                    </td>

                    <td className="py-3 px-3">
                      Course {student.course_id}
                    </td>

                    <td className="py-3 px-3 text-gray-500">
                      {student.created_at
                        ? new Date(student.created_at).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="py-3 px-3 font-medium">
                      ₹{student.pending_amount}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          student.pending_amount > 0
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {student.pending_amount > 0 ? "Pending" : "Paid"}
                      </span>
                    </td>

                    <td className="py-3 px-3 flex gap-3">
                      <button
                        onClick={() =>
                          navigate(`/admin/view-student/${student.id}`)
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/admin/edit-student/${student.id}`)
                        }
                        className="text-green-600 hover:text-green-800"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default RecentStudentsTable;