import { useState } from "react";

const TeacherAssignments = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    alert("Assignment Added");
    setTitle("");
    setDescription("");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Add Assignment</h2>

      <div className="bg-white p-6 rounded-xl shadow max-w-lg">
        <input
          type="text"
          placeholder="Assignment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Assignment
        </button>
      </div>
    </div>
  );
};

export default TeacherAssignments;
