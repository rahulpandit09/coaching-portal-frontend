import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";

// import Layout from "./components/Dashboard/Layout";
// import Dashboard from "./components/Dashboard/Dashboard";
// import Attendance from "./components/Dashboard/Attendance";
// import MyCourses from "./components/Pages/MyCourses";
// import CourseRegistration from "./components/Pages/CourseRegistration";

import ProtectedRoute from "./components/ProtectedRoute";

// Admin
import AdminLayout from "./components/Dashboard/pages/admin/AdminLayout";
import AdminDashboard from "./components/Dashboard/pages/admin/AdminDashboard";
import Teachers from "./components/Dashboard/pages/admin/Teachers/teacherDash";
import TeacherProfile from "./components/Dashboard/pages/admin/Teachers/TeacherProfile";
import AssignTeacher from "./components/Dashboard/pages/admin/Teachers/AssignTeacher";


// Teacher
import TeacherLayout from "./components/Dashboard/pages/teacher/TeacherLayout";
import TeacherDashboard from "./components/Dashboard/pages/teacher/TeacherDashboard";
import TeacherAssignments from "./components/Dashboard/pages/teacher/TeacherAssignments";
import TeacherNotes from "./components/Dashboard/pages/teacher/TeacherNotes";
import TeacherAttendance from "./components/Dashboard/pages/teacher/TeacherAttendance";
import TeacherStudents from "./components/Dashboard/pages/teacher/TeacherStudents";
import AdminCreateTeacher from "./components/Dashboard/pages/admin/AdminCreateTeacher";
import AdminCreateStudent from "./components/Dashboard/pages/admin/AdminCreateStudent";
import StudentAssignments from "./components/Dashboard/pages/student/StudentAssignments";
import StudentAttendance from "./components/Dashboard/pages/student/StudentAttendance";
import StudentCourses from "./components/Dashboard/pages/student/StudentCourses";
import StudentDashboard from "./components/Dashboard/pages/student/StudentDashboard";
import StudentLayout from "./components/Dashboard/pages/student/StudentLayout";
import CourseRegistration from "./components/Dashboard/pages/student/CourseRegistration";
import MyCourses from "./components/Dashboard/pages/student/MyCourses";
import AdminManageStudents from "./components/Dashboard/pages/admin/AdminManageStudents"
import AddStudent from "./components/Dashboard/pages/admin/AddStudent";
import ManageStudents from "./components/Dashboard/pages/admin/AdminManageStudents";
import ViewStudent from "./components/Dashboard/pages/admin/viewStudent";
import Courses from "./components/Dashboard/pages/admin/Courses/Courses";
import Batches from "./components/Dashboard/pages/admin/Batch/Batches ";


const App = () => {
  return (
    <Routes>

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ================= STUDENT ROUTES ================= */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="CourseRegistration" element={<CourseRegistration/>}/>
        <Route path="mycourse" element={<MyCourses/>}/>
      </Route>
      
      {/* ================= ADMIN ROUTES ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="create-teacher" element={<AdminCreateTeacher />} />
        <Route path="create-student" element={<AdminCreateStudent />} />
        <Route path="AdminManageStudents" element={<AdminManageStudents/>} />
        <Route path="/admin/students/add" element={<AddStudent/>} />
        <Route path="/admin/manage-students" element={<ManageStudents />} />
        <Route path="/admin/students/view/:id" element={<ViewStudent />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="teachers/assign" element={<AssignTeacher />} />
        <Route path="teachers/:id" element={<TeacherProfile />} />
        <Route path="courses" element={<Courses/>} />
        <Route path="/admin/batches" element={<Batches />} />
      </Route>

      {/* ================= TEACHER ROUTES ================= */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="assignments" element={<TeacherAssignments />} />
        <Route path="notes" element={<TeacherNotes />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="students" element={<TeacherStudents />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />

    </Routes>
  );
};

export default App;