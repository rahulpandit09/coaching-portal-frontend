import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  status?: string;
  course?: string;
  batch?: string;
  students?: number;
}

const TeacherProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTeacher();
    }
  }, [id]);

  const fetchTeacher = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/admin/faculty-teacher/${id}`
      );

      setTeacher(res.data);
    } catch (error) {
      console.error("Error fetching teacher:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!teacher) {
    return <div className="p-6">Teacher not found</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="bg-blue-700 text-white rounded-xl p-6 shadow-md mb-6">
        <h1 className="text-3xl font-semibold">Teacher Profile</h1>
      </div>

      <div className="bg-white rounded-xl shadow p-6 max-w-4xl mx-auto">

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {teacher.name}
        </h2>

        <div className="grid grid-cols-2 gap-6 text-sm">

          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium">{teacher.email}</p>
          </div>

          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium">{teacher.phone}</p>
          </div>

          {/* Placeholder until assignment API */}
          <div>
            <p className="text-gray-500">Course</p>
            <p className="font-medium">{teacher.course ?? "-"}</p>
          </div>

          <div>
            <p className="text-gray-500">Batch</p>
            <p className="font-medium">{teacher.batch ?? "-"}</p>
          </div>

          <div>
            <p className="text-gray-500">Students</p>
            <p className="font-medium">{teacher.students ?? 0}</p>
          </div>

          <div>
            <p className="text-gray-500 mb-1">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs ${teacher.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
            >
              {teacher.status ?? "Inactive"}
            </span>
          </div>

        </div>

      </div>

      <button
  onClick={() => navigate(-1)}
  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  ← Back
</button>

    </div>
  );
};

export default TeacherProfile;