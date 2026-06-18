const TeacherNotes = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Upload Notes</h2>

      <div className="bg-white p-6 rounded-xl shadow max-w-lg">
        <input type="file" className="mb-4" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Upload
        </button>
      </div>
    </div>
  );
};

export default TeacherNotes;
