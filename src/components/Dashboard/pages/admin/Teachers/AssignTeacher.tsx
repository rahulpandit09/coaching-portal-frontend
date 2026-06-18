import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AssignTeacher = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    teacher: "",
    course: "",
    batch: "",
  });
  const [teachers, setTeachers] = useState<{ id: number, name: string, email: string }[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);


  /* =============================
     Load Teachers
  ============================== */
  useEffect(() => {
  fetch("http://localhost:8000/admin/faculty-teachers-list")
    .then((res) => res.json())
    .then((data) => setTeachers(data));
}, []);

  /* =============================
     Load Courses
  ============================== */
  useEffect(() => {
    fetch("http://localhost:8000/admin/faculty-courses")
      .then((res) => res.json())
      .then((data) => setCourses(data));
  }, []);
  /* =============================
     Load Batches when course changes
  ============================== */
  useEffect(() => {
    if (!form.course) return;

    fetch(`http://localhost:8000/admin/faculty-batches/${form.course}`)
      .then((res) => res.json())
      .then((data) => setBatches(data));
  }, [form.course]);

  const selectedTeacher = teachers.find((t) => t.id === Number(form.teacher));

  /* =============================
     Submit Assignment
  ============================== */
  const handleSubmit = async () => {
    if (!form.teacher || !form.course || !form.batch) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      teacher_id: Number(form.teacher),
      course_id: Number(form.course),
      batch_id: Number(form.batch),
    };

    try {
      const res = await fetch("http://localhost:8000/admin/faculty-assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log(data);

      alert("Teacher assigned successfully");

      navigate("/admin/teachers");

    } catch (error) {
      console.error("Assignment failed", error);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    // <div className="p-6 bg-gray-100 min-h-screen">
    <div className="p-6 bg-gray-100 h-screen overflow-hidden">

      {/* Header */}
      <div className="bg-blue-700 text-white rounded-xl p-6 shadow-md mb-6 flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-semibold">Assign Teacher</h1>
          <p className="text-sm opacity-80">
            Assign teacher to course and batch
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">

        {/* Assignment Form */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-5">

          <h2 className="text-lg font-semibold text-gray-800">
            Assignment Details
          </h2>

          {/* Teacher */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Teacher
            </label>

            <select
              value={form.teacher}
              onChange={(e) =>
                setForm({ ...form, teacher: e.target.value })
              }
              className={inputClass}
            >
              <option value="">Select Teacher</option>

              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Course
            </label>

            <select
              value={form.course}
              onChange={(e) =>
                setForm({
                  ...form,
                  course: e.target.value,
                  batch: "",
                })
              }
              className={inputClass}
            >
              <option value="">Select Course</option>

              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Batch
            </label>

            <select
              value={form.batch}
              onChange={(e) =>
                setForm({ ...form, batch: e.target.value })
              }
              disabled={!form.course}
              className={inputClass}
            >
              <option value="">Select Batch</option>

              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">

            <button
              onClick={() => navigate("/admin/teachers")}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
            >
              Save Assignment
            </button>

          </div>

        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-xl shadow-md p-6">

          <h2 className="text-lg font-semibold mb-4">
            Teacher Preview
          </h2>

          {!form.teacher ? (
            <p className="text-gray-500 text-sm">
              Select a teacher to see details
            </p>
          ) : (
            <div className="space-y-3 text-sm">

              <p>
                <span className="font-medium">Teacher:</span>{" "}
                {selectedTeacher?.name}
              </p>

              <p>
                <span className="font-medium">Email:</span>{" "}
                {selectedTeacher?.email}
              </p>

              <p>
                <span className="font-medium">Course:</span>{" "}
                {form.course || "-"}
              </p>

              <p>
                <span className="font-medium">Batch:</span>{" "}
                {form.batch || "-"}
              </p>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AssignTeacher;