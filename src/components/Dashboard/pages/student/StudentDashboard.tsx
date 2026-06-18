import { useEffect, useState } from "react";

const StudentDashboard = () => {
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("student");
    if (data) {
      setStudent(JSON.parse(data));
    }
  }, []);

  if (!student) {
    return <h2 className="text-center mt-10">No student data found</h2>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow mb-6">
        <h1 className="text-2xl font-bold">
          Welcome, {student.fullName} 🎓
        </h1>
        <p className="text-sm opacity-80">
          Here is your academic overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Enrolled Course</h3>
          <p className="text-xl font-bold mt-2">{student.course}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Batch</h3>
          <p className="text-xl font-bold mt-2">{student.batch}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Mode</h3>
          <p className="text-xl font-bold mt-2">{student.mode}</p>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Student Details</h2>

        <table className="w-full text-sm">
          <tbody className="divide-y">
            <tr>
              <td className="py-2 font-medium">Email</td>
              <td>{student.email}</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Phone</td>
              <td>{student.phone}</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Qualification</td>
              <td>{student.qualification}</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">School</td>
              <td>{student.school}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default StudentDashboard;
