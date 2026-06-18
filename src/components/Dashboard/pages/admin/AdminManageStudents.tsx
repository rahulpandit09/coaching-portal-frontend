import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Student {
  id: number;
  student_id: string;
  name: string;
  phone: string;
  course: string;
  batch: string;
  status: string;
}

const ManageStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:8000/admin/students/");
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      return (
        (student.name.toLowerCase().includes(search.toLowerCase()) ||
          student.phone.includes(search)) &&
        (courseFilter ? student.course === courseFilter : true) &&
        (batchFilter ? student.batch === batchFilter : true) &&
        (statusFilter ? student.status === statusFilter : true)
      );
    });
  }, [students, search, courseFilter, batchFilter, statusFilter]);

  const deleteStudent = (id: number) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  return (
    // Removed min-h-screen
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="bg-blue-700 text-white rounded-xl p-6 flex justify-between items-center shadow-md">
        <h1 className="text-3xl font-semibold">Manage Students</h1>
        <button
          onClick={() => navigate("/admin/students/add")}
          className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
        >
          + Add Student
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <StatCard title="Total Students" value={students.length} />
        <StatCard
          title="Paid Students"
          value={students.filter((s) => s.status === "Paid").length}
        />
        <StatCard
          title="Pending Students"
          value={students.filter((s) => s.status === "Pending").length}
        />
        <StatCard
          title="Unpaid Students"
          value={students.filter((s) => s.status === "Unpaid").length}
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="">All Courses</option>
            <option value="Physics">Physics</option>
            <option value="Math">Math</option>
          </select>

          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
          >
            <option value="">All Batches</option>
            <option value="Batch A">Batch A</option>
            <option value="Batch B">Batch B</option>
          </select>

          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow mt-6 flex-1 overflow-hidden">

        {/* Only THIS scrolls */}
        <div className="h-full overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-left">Student ID</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Course</th>
                <th className="p-4 text-left">Batch</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{student.student_id}</td>
                  <td className="p-4">{student.name}</td>
                  <td className="p-4">{student.phone}</td>
                  <td className="p-4">{student.course}</td>
                  <td className="p-4">{student.batch}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        student.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : student.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <button
                      className="text-blue-600 hover:underline mr-3"
                      onClick={() =>
                        navigate(`/admin/students/view/${student.id}`)
                      }
                    >
                      View
                    </button>

                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => deleteStudent(student.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: any }) => {
  const getColor = () => {
    if (title.includes("Paid"))
      return "bg-gradient-to-r from-green-500 to-green-600";
    if (title.includes("Pending"))
      return "bg-gradient-to-r from-yellow-400 to-yellow-500";
    if (title.includes("Unpaid"))
      return "bg-gradient-to-r from-red-500 to-red-600";
    return "bg-gradient-to-r from-blue-500 to-blue-600";
  };

  return (
    <div className={`${getColor()} text-white p-6 rounded-xl shadow text-center`}>
      <p className="text-sm opacity-90">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
};

export default ManageStudents;