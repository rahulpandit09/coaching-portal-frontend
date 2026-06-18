const StudentCourses = () => {
  const courses = [
    { id: 1, name: "Physics", teacher: "Mr. Sharma" },
    { id: 2, name: "Mathematics", teacher: "Mrs. Verma" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Courses</h2>

      <div className="bg-white p-6 rounded-xl shadow">
        {courses.map((course) => (
          <div key={course.id} className="mb-3 border-b pb-2">
            <p className="font-semibold">{course.name}</p>
            <p className="text-gray-600 text-sm">
              Teacher: {course.teacher}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentCourses;
