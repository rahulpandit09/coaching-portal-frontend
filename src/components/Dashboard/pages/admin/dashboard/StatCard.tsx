import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
  border: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  bg,
  border,
}) => {
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm border-l-4 ${border} ${bg} hover:shadow-md transition`}
    >
      <div className="flex justify-between items-center mb-3 text-gray-600">
        <span className="text-sm">{title}</span>
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
    </div>
  );
};

export default StatCard;