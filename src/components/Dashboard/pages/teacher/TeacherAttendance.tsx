const TeacherAttendance = () => {
  const students = ["Rahul", "Amit", "Riya"];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Mark Attendance</h2>

      <div className="bg-white p-6 rounded-xl shadow">
        {students.map((student, index) => (
          <div key={index} className="flex justify-between mb-3">
            <span>{student}</span>
            <select className="border p-1 rounded">
              <option>Present</option>
              <option>Absent</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherAttendance;
