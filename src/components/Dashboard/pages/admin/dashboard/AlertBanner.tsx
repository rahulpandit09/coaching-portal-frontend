import React from "react";
import { AlertCircle } from "lucide-react";

interface AlertBannerProps {
  overdueStudents: number;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ overdueStudents }) => {
  if (overdueStudents === 0) return null;

  return (
    <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-xl flex justify-between items-center">
      <div className="flex items-center gap-2">
        <AlertCircle size={20} />
        <span>{overdueStudents} students have overdue fees.</span>
      </div>
      <button className="bg-yellow-500 text-white px-4 py-1 rounded-lg hover:bg-yellow-600 transition">
        View Now
      </button>
    </div>
  );
};

export default AlertBanner;