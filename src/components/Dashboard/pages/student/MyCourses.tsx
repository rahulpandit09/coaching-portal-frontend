import React from "react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: number;
  title: string;
  teacher: string;
  progress: number;
  assignments: number;
  nextClass: string;
  color: string;
}

const courses: Course[] = [
  {
    id: 1,
    title: "Physics",
    teacher: "Mr. Sharma",
    progress: 70,
    assignments: 2,
    nextClass: "Today - 5:00 PM",
    color: "bg-orange-500",
  },
  {
    id: 2,
    title: "Mathematics",
    teacher: "Mrs. Verma",
    progress: 50,
    assignments: 1,
    nextClass: "Tomorrow - 6:30 PM",
    color: "bg-blue-500",
  },
  {
    id: 3,
    title: "Chemistry",
    teacher: "Mr. Khan",
    progress: 85,
    assignments: 0,
    nextClass: "Friday - 4:00 PM",
    color: "bg-green-500",
  },
];

const MyCourses: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative p-6 bg-gray-100 min-h-screen">

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <span
                className={`text-white text-sm px-3 py-1 rounded-full ${course.color}`}
              >
                {course.title}
              </span>
              <span className="text-sm text-gray-500">
                {course.assignments} Assignments
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-3">
              👨‍🏫 Teacher: {course.teacher}
            </p>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              📅 Next Class: {course.nextClass}
            </p>

            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
              View Details
            </button>
          </div>
        ))}
      </div>
      {/* Back Button Bottom Left */}
      <button
        onClick={() => navigate(-1)}
        className="fixed bottom-6 left-6 bg-gray-500 text-white px-5 py-2 rounded-lg shadow-lg hover:bg-gray-600 transition"
      >
        ← Back
      </button>


    </div>
  );
};

export default MyCourses;
