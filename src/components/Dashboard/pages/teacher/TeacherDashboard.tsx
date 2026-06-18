const TeacherDashboard = () => {
  const stats = [
    { title: "Total Classes", value: 5 },
    { title: "Total Students", value: 120 },
    { title: "Pending Assignments", value: 3 },
    { title: "Today's Classes", value: 2 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white shadow p-6 rounded-xl"
          >
            <h4 className="text-gray-500 text-sm">{stat.title}</h4>
            <h2 className="text-2xl font-bold">{stat.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;
