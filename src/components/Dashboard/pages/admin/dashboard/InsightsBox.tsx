import React from "react";

const InsightsBox: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
      <h2 className="font-semibold mb-3">Top Insights</h2>
      <p>🏆 Most Popular Course: Physics</p>
      <p>📉 Highest Pending Course: Math</p>
      <p>📈 Highest Revenue Month: January</p>
      <p>🔔 Batch B has low attendance</p>
    </div>
  );
};

export default InsightsBox;