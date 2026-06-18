const TeacherStudents = () => {
  const students = ["Rahul", "Amit", "Riya"];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Student List</h2>

      <div className="bg-white p-6 rounded-xl shadow">
        <ul className="space-y-2">
          {students.map((student, index) => (
            <li key={index} className="border-b pb-2">
              {student}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeacherStudents;
