const StudentAttendance = () => {
  const data = [
    { subject: "Physics", present: 18, total: 20 },
    { subject: "Math", present: 15, total: 20 }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Attendance</h2>

      <div className="bg-white p-6 rounded-xl shadow">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between mb-3">
            <span>{item.subject}</span>
            <span>
              {item.present}/{item.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAttendance;
