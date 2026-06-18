import { useState } from "react";

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([
    { id: 1, title: "Physics HW 1", submitted: false },
    { id: 2, title: "Math Worksheet", submitted: true }
  ]);

  const submitAssignment = (id: number) => {
    setAssignments(assignments.map(a =>
      a.id === id ? { ...a, submitted: true } : a
    ));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Assignments</h2>

      <div className="bg-white p-6 rounded-xl shadow">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="flex justify-between mb-4">
            <span>{assignment.title}</span>

            {assignment.submitted ? (
              <span className="text-green-600 font-semibold">
                Submitted
              </span>
            ) : (
              <button
                onClick={() => submitAssignment(assignment.id)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Submit
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAssignments;
