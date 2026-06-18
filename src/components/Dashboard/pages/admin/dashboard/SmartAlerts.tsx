import React from "react";

const SmartAlerts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
        🔴 5 Overdue Students
      </div>
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
        🟡 12 Pending Payments
      </div>
      <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
        🟢 3 New Admissions Today
      </div>
    </div>
  );
};

export default SmartAlerts;