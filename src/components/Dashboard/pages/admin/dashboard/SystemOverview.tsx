import React from "react";

const SystemOverview: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div>👨‍🏫 Teachers: 12</div>
      <div>📚 Courses: 8</div>
      <div>🏫 Batches: 15</div>
      <div>📅 Attendance Today: 85%</div>
    </div>
  );
};

export default SystemOverview;