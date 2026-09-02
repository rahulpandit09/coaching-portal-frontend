import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Users, FileText, Eye, Trash2 } from "lucide-react";
import { IAddUserForm } from "@/utils/user.types";

interface IUploadedFile {
  id: string;
  file: File;
}

const AddNewUserPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<IAddUserForm>({
    // Common fields
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",

    // Student fields
    dateOfBirth: "",
    gender: "",
    studentId: "",
    schoolName: "",
    className: "",
    board: "",
    academicYear: "",
    subjects: "",
    preferredLanguage: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pinCode: "",

    // Parent fields
    relationship: "",
    occupation: "",
    companyName: "",
    preferredCommunication: "",

    // Teacher fields
    employeeId: "",
    qualification: "",
    specialization: "",
    experience: "",
    teachingLanguage: "",
    teachingClasses: "",
    teachingSubjects: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<IUploadedFile[]>([]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: IUploadedFile[] = Array.from(e.target.files).map(
        (file) => ({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
        })
      );
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleViewFile = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl, "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role) {
      alert("Please select a user role.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const payload = {
      ...formData,
      uploadedDocuments: uploadedFiles.map((item) => item.file),
    };

    // TODO: Call API to create user
    console.log("Create user:", payload);
    navigate("/user-management");
  };

  const handleCancel = () => {
    navigate("/user-management");
  };

  return (
    <div className="w-full">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="mb-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
            <Users className="h-6 w-6 text-orange-500" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-xl font-bold text-white md:text-2xl">
              User Management
            </h1>

            <p className="mt-0.5 text-xs text-orange-50 md:text-sm">
              Manage students, teachers and parents
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          FORM CARD WITH 3-COLUMN STRUCTURE & VERTICAL SCROLL
      ====================================================== */}
      <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col max-h-[calc(100vh-200px)] overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="flex h-full flex-col overflow-hidden"
        >
          {/* FORM BODY */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <div className="w-full">
              {/* User Type */}
              <div className="mb-6 max-w-sm">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  User Type <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Parent">Parent</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>

              {/* Personal Information */}
              <h3 className="mb-4 text-base font-semibold text-gray-800">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* First Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Phone <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* =====================================================
                  STUDENT ONLY FIELDS (3-COLUMN STRUCTURE)
              ====================================================== */}
              {formData.role === "Student" && (
                <>
                  {/* Student Information */}
                  <h3 className="mb-4 mt-7 text-base font-semibold text-gray-800">
                    Student Information
                  </h3>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Date of Birth */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Date of Birth
                      </label>

                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Gender
                      </label>

                      <div className="relative">
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      </div>
                    </div>

                    {/* Student ID */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Student ID
                      </label>

                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="Enter student ID"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* School */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        School / College
                      </label>

                      <input
                        type="text"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        placeholder="Enter school or college name"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Class */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Class / Grade
                      </label>

                      <div className="relative">
                        <select
                          name="className"
                          value={formData.className}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="">Select class</option>
                          <option value="6">Class 6</option>
                          <option value="7">Class 7</option>
                          <option value="8">Class 8</option>
                          <option value="9">Class 9</option>
                          <option value="10">Class 10</option>
                          <option value="11">Class 11</option>
                          <option value="12">Class 12</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      </div>
                    </div>

                    {/* Board */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Board
                      </label>

                      <div className="relative">
                        <select
                          name="board"
                          value={formData.board}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="">Select board</option>
                          <option value="CBSE">CBSE</option>
                          <option value="ICSE">ICSE</option>
                          <option value="State Board">State Board</option>
                          <option value="IB">IB</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      </div>
                    </div>

                    {/* Academic Year */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Academic Year
                      </label>

                      <input
                        type="text"
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleChange}
                        placeholder="e.g. 2026-2027"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Subjects */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Subjects
                      </label>

                      <input
                        type="text"
                        name="subjects"
                        value={formData.subjects}
                        onChange={handleChange}
                        placeholder="e.g. Maths, Physics, Chemistry"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Preferred Language */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Preferred Language
                      </label>

                      <div className="relative">
                        <select
                          name="preferredLanguage"
                          value={formData.preferredLanguage}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="">Select language</option>
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Kannada">Kannada</option>
                          <option value="Tamil">Tamil</option>
                          <option value="Telugu">Telugu</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <h3 className="mb-4 mt-7 text-base font-semibold text-gray-800">
                    Address Information
                  </h3>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Address - full row */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Address
                      </label>

                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter address"
                        rows={2}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        City
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        State
                      </label>

                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Country
                      </label>

                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Enter country"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* PIN Code */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        PIN Code
                      </label>

                      <input
                        type="text"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleChange}
                        placeholder="Enter PIN code"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* =====================================================
                  PARENT ONLY FIELDS (3-COLUMN STRUCTURE)
              ====================================================== */}
              {formData.role === "Parent" && (
                <>
                  <h3 className="mb-4 mt-7 text-base font-semibold text-gray-800">
                    Parent Information
                  </h3>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Relationship */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Relationship with Student
                      </label>

                      <div className="relative">
                        <select
                          name="relationship"
                          value={formData.relationship}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="">Select relationship</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      </div>
                    </div>

                    {/* Occupation */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Occupation
                      </label>

                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        placeholder="Enter occupation"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Company / Organization
                      </label>

                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Communication */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Preferred Communication
                      </label>

                      <div className="relative">
                        <select
                          name="preferredCommunication"
                          value={formData.preferredCommunication}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="">Select method</option>
                          <option value="Email">Email</option>
                          <option value="Phone">Phone</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="SMS">SMS</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* =====================================================
                  TEACHER ONLY FIELDS (3-COLUMN STRUCTURE)
              ====================================================== */}
              {formData.role === "Teacher" && (
                <>
                  <h3 className="mb-4 mt-7 text-base font-semibold text-gray-800">
                    Teaching Information
                  </h3>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Employee ID */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Employee ID
                      </label>

                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        placeholder="Enter employee ID"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Qualification */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Highest Qualification
                      </label>

                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="e.g. M.Sc, B.Ed, M.Tech"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Specialization */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Specialization
                      </label>

                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g. Mathematics"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Teaching Experience (Years)
                      </label>

                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="Years of experience"
                        min="0"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Subjects */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Teaching Subjects
                      </label>

                      <input
                        type="text"
                        name="teachingSubjects"
                        value={formData.teachingSubjects}
                        onChange={handleChange}
                        placeholder="e.g. Maths, Physics"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Classes */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Classes / Grades
                      </label>

                      <input
                        type="text"
                        name="teachingClasses"
                        value={formData.teachingClasses}
                        onChange={handleChange}
                        placeholder="e.g. 8, 9, 10, 11"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Language */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Teaching Language
                      </label>

                      <div className="relative">
                        <select
                          name="teachingLanguage"
                          value={formData.teachingLanguage}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="">Select language</option>
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Kannada">Kannada</option>
                          <option value="Tamil">Tamil</option>
                          <option value="Telugu">Telugu</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* =====================================================
                  DOCUMENT UPLOAD (DIRECT FILE UPLOAD, VIEW, DELETE)
              ====================================================== */}
              <div className="mt-7 space-y-3">
                {/* Upload Document Banner */}
                <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-gray-800">
                      Upload Document
                    </h4>
                    <p className="text-xs text-gray-500">
                      Attach supporting documents
                    </p>
                  </div>

                  <div>
                    <input
                      type="file"
                      id="upload-doc-input"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    />
                    <label
                      htmlFor="upload-doc-input"
                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <Plus size={16} />
                      Add
                    </label>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((fileItem) => (
                      <div
                        key={fileItem.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition"
                      >
                        {/* File Info */}
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <FileText size={18} />
                          </div>
                          <div className="truncate">
                            <p className="truncate text-sm font-medium text-gray-800">
                              {fileItem.file.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {(fileItem.file.size / (1024 * 1024)).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                        </div>

                        {/* Actions: View & Delete */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleViewFile(fileItem.file)}
                            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition"
                            title="View document"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveFile(fileItem.id)}
                            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition"
                            title="Delete document"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* =====================================================
                  COMMON ACCOUNT INFORMATION (3-COLUMN STRUCTURE)
              ====================================================== */}
              <h3 className="mb-4 mt-7 text-base font-semibold text-gray-800">
                Account Information
              </h3>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              STICKY / DOCKED BOTTOM ACTION BUTTONS
          ====================================================== */}
          <div className="shrink-0 flex justify-end gap-3 border-t border-gray-200 bg-gray-50/80 px-6 py-3.5 sm:px-8 backdrop-blur-sm">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition duration-150 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition duration-150 hover:from-orange-600 hover:to-orange-700"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewUserPage;