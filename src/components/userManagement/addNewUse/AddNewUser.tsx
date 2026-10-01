import React, { useState, useEffect } from "react";
import { ChevronDown, Plus, Users, FileText, Eye, Trash2, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "@/api/axiosInstance";
import { IAddUserForm } from "@/utils/user.types";

const ROLE_MAP: Record<string, number> = {
  Tutor: 1,
  Teacher: 2,
  Student: 3,
  Parent: 4,
};

const buildStudentDetails = (formData: IAddUserForm) => ({
  date_of_birth: formData.dateOfBirth,
  gender: formData.gender,
  school_name: formData.schoolName,
  class_name: formData.className,
  board: formData.board,
  academic_year: formData.academicYear,
  subjects: formData.subjects,
  preferred_language: formData.preferredLanguage,
  address: formData.address,
  city: formData.city,
  state: formData.state,
  country: formData.country,
  pin_code: formData.pinCode,
});

const buildTeacherDetails = (formData: IAddUserForm) => ({
  qualification: formData.qualification,
  specialization: formData.specialization,
  experience: formData.experience ? Number(formData.experience) : 0,
  teaching_language: formData.teachingLanguage,
  teaching_classes: formData.teachingClasses,
  teaching_subjects: formData.teachingSubjects,
});

const buildParentDetails = (formData: IAddUserForm, generatedId?: string) => ({
  parent_id: generatedId || formData.parentId || undefined,
  relationship: formData.relationship,
  occupation: formData.occupation,
  company_name: formData.companyName,
  preferred_communication: formData.preferredCommunication,
});

const buildUserPayload = (
  formData: IAddUserForm,
  isCreateMode: boolean,
  roleId: number,
  generatedId?: string
) => {
  const payload: any = {
    first_name: formData.firstName,
    last_name: formData.lastName,
    username: formData.username || formData.email,
    email: formData.email,
    phone_number: formData.phone,
    gender: formData.gender,
    role_id: roleId,
  };

  if (isCreateMode) {
    payload.password = formData.password;
  }

  if (formData.role === "Student") {
    payload.student_details = buildStudentDetails(formData);
  } else if (formData.role === "Teacher") {
    payload.teacher_details = buildTeacherDetails(formData);
  } else if (formData.role === "Parent") {
    payload.parent_details = buildParentDetails(formData, generatedId);
  }

  return payload;
};

const AddNewUserPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = (location.state as any)?.mode || "create";
  const userId = (location.state as any)?.userId;

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>("");
  const [isGeneratingId, setIsGeneratingId] = useState<boolean>(false);

  const [formData, setFormData] = useState<IAddUserForm>({
    // Common fields
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
    aadhaarNumber: "",

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
    parentId: "",
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

  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);

  // Fetch user details when in view or edit mode
  useEffect(() => {
    if ((!isViewMode && !isEditMode) || !userId) {
      return;
    }

    const fetchUserDetails = async () => {
      try {
        setIsLoadingDetails(true);
        const response = await axiosInstance.get(
          `/user-management/users/${userId}`
        );
        const user = response.data;

        // Map role
        let role = user.role || "";
        if (!role && user.role_id) {
          if (user.role_id === 2) role = "Teacher";
          else if (user.role_id === 3) role = "Student";
          else if (user.role_id === 4) role = "Parent";
        }

        const studentDetails = user.student_details || {};
        const teacherDetails = user.teacher_details || {};
        const parentDetails = user.parent_details || {};

        setFormData({
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          username: user.username || "",
          email: user.email || "",
          phone: user.phone_number || user.phone || "",
          role,
          password: "",
          confirmPassword: "",
          aadhaarNumber: user.aadhaar_number || "",

          // Student
          dateOfBirth: studentDetails.date_of_birth || "",
          gender: user.gender || studentDetails.gender || "",
          studentId: studentDetails.student_id || studentDetails.studentId || "",
          schoolName: studentDetails.school_name || "",
          className: studentDetails.class_name || "",
          board: studentDetails.board || "",
          academicYear: studentDetails.academic_year || "",
          subjects: studentDetails.subjects || "",
          preferredLanguage: studentDetails.preferred_language || "",
          address: studentDetails.address || "",
          city: studentDetails.city || "",
          state: studentDetails.state || "",
          country: studentDetails.country || "India",
          pinCode: studentDetails.pin_code || "",

          // Parent
          parentId:
            parentDetails.parent_id ||
            parentDetails.parentId ||
            "",
          relationship: parentDetails.relationship || "",
          occupation: parentDetails.occupation || "",
          companyName: parentDetails.company_name || "",
          preferredCommunication: parentDetails.preferred_communication || "",

          // Teacher
          employeeId: teacherDetails.employee_id || teacherDetails.employeeId || "",
          qualification: teacherDetails.qualification || "",
          specialization: teacherDetails.specialization || "",
          experience: teacherDetails.experience != null ? teacherDetails.experience.toString() : "",
          teachingLanguage: teacherDetails.teaching_language || "",
          teachingClasses: teacherDetails.teaching_classes || "",
          teachingSubjects: teacherDetails.teaching_subjects || "",
        });

        setGeneratedId(
          studentDetails.student_id ||
          studentDetails.studentId ||
          teacherDetails.employee_id ||
          teacherDetails.employeeId ||
          parentDetails.parent_id ||
          parentDetails.parentId ||
          ""
        );
      } catch (error: any) {
        console.error("Get User Details Error:", error);
        toast.error(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load user details."
        );
      } finally {
        setIsLoadingDetails(false);
      }
    };

    void fetchUserDetails();
  }, [isViewMode, isEditMode, userId]);

  // ID preview generation ONLY for new user creation
  useEffect(() => {
    if (!isCreateMode) {
      return;
    }

    if (formData.role === "Student") {
      setIsGeneratingId(true);
      axiosInstance
        .post("/user-management/users/generate-student-id?student_code=CS")
        .then((res) => {
          const id = res.data.student_id || res.data.id || "";
          setGeneratedId(id);
        })
        .catch((err) => {
          console.error("Error fetching preview Student ID:", err);
          setGeneratedId("");
        })
        .finally(() => {
          setIsGeneratingId(false);
        });
    } else if (formData.role === "Teacher") {
      setIsGeneratingId(true);
      axiosInstance
        .post("/user-management/users/generate-employee-id")
        .then((res) => {
          const id = res.data.employee_id || res.data.id || "";
          setGeneratedId(id);
        })
        .catch((err) => {
          console.error("Error fetching preview Employee ID:", err);
          setGeneratedId("");
        })
        .finally(() => {
          setIsGeneratingId(false);
        });
    } else if (formData.role === "Parent") {
      setIsGeneratingId(true);
      axiosInstance
        .get("/user-management/users/generate-parent-id")
        .then((res) => {
          const id = res.data.parent_id || res.data.id || "";
          setGeneratedId(id);
        })
        .catch((err) => {
          console.error("Error fetching preview Parent ID:", err);
          setGeneratedId("");
        })
        .finally(() => {
          setIsGeneratingId(false);
        });
    } else {
      setGeneratedId("");
    }
  }, [formData.role, isCreateMode]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (isViewMode) return;

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAadhaarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewMode) return;

    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, JPG, JPEG or PNG file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      toast.error("Aadhaar file size must be less than 5 MB.");
      return;
    }

    setAadhaarFile(file);
    e.target.value = "";
  };

  const handleRemoveAadhaar = () => {
    if (isViewMode) return;
    setAadhaarFile(null);
  };

  const handleViewFile = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isViewMode) {
      return;
    }

    if (!formData.role) {
      toast.warning("Please select a user role.");
      return;
    }

    if (isCreateMode && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (isEditMode && !userId) {
      toast.error("User ID is missing.");
      return;
    }

    const roleId = ROLE_MAP[formData.role];
    if (!roleId) {
      toast.error("Invalid user role.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildUserPayload(formData, isCreateMode, roleId, generatedId);

      if (isEditMode) {
        await axiosInstance.put(`/user-management/users/${userId}`, payload);
        toast.success("User updated successfully.");
      } else {
        await axiosInstance.post("/user-management/users/", payload);
        toast.success("User created successfully.");
      }

      navigate("/user-management");
    } catch (error: any) {
      console.error(isEditMode ? "Update User Error:" : "Create User Error:", error);
      const errorData = error?.response?.data;
      const errorMessage =
        errorData?.detail?.[0]?.msg ||
        (typeof errorData?.detail === "string" ? errorData.detail : null) ||
        errorData?.message ||
        error?.message ||
        (isEditMode ? "Failed to update user." : "Failed to create user.");

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/user-management");
  };

  // Compute non-nested titles and labels to satisfy SonarLint rules
  let pageTitle = "User Management";
  if (isViewMode) {
    pageTitle = "View User";
  } else if (isEditMode) {
    pageTitle = "Edit User";
  }

  let pageSubtitle = "Manage students, teachers and parents";
  if (isViewMode) {
    pageSubtitle = "View user details";
  } else if (isEditMode) {
    pageSubtitle = "Update user information";
  }

  let submitButtonText = "Create User";
  if (isSubmitting) {
    submitButtonText = isEditMode ? "Updating User..." : "Creating User...";
  } else if (isEditMode) {
    submitButtonText = "Update User";
  }

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
              {pageTitle}
            </h1>

            <p className="mt-0.5 text-xs text-orange-50 md:text-sm">
              {pageSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Loading state indicator in view/edit mode */}
      {isLoadingDetails && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading user details...</span>
        </div>
      )}

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
                <label
                  htmlFor="user-type-select"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  User Type {!isViewMode && <span className="text-red-500">*</span>}
                </label>

                <div className="relative">
                  <select
                    id="user-type-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required={!isViewMode}
                    disabled={isViewMode || isEditMode}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Parent">Parent</option>
                  </select>
                  {!isViewMode && !isEditMode && (
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <h3 className="mb-4 text-base font-semibold text-gray-800">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="first-name-input"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    First Name {!isViewMode && <span className="text-red-500">*</span>}
                  </label>

                  <input
                    id="first-name-input"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required={!isViewMode}
                    disabled={isViewMode}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="last-name-input"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Last Name {!isViewMode && <span className="text-red-500">*</span>}
                  </label>

                  <input
                    id="last-name-input"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required={!isViewMode}
                    disabled={isViewMode}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email-input"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Email {!isViewMode && <span className="text-red-500">*</span>}
                  </label>

                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required={!isViewMode}
                    disabled={isViewMode}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone-input"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Phone {!isViewMode && <span className="text-red-500">*</span>}
                  </label>

                  <input
                    id="phone-input"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required={!isViewMode}
                    disabled={isViewMode}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
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
                      <label
                        htmlFor="dob-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Date of Birth
                      </label>

                      <input
                        id="dob-input"
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label
                        htmlFor="gender-select"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Gender
                      </label>

                      <div className="relative">
                        <select
                          id="gender-select"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          disabled={isViewMode}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {!isViewMode && (
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Student ID - Auto Generated Preview */}
                    <div>
                      <label
                        htmlFor="student-id-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Student ID
                      </label>

                      <input
                        id="student-id-input"
                        type="text"
                        value={
                          isGeneratingId
                            ? "Generating..."
                            : generatedId || "Auto-generated"
                        }
                        disabled
                        className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-gray-700"
                      />
                    </div>

                    {/* School */}
                    <div>
                      <label
                        htmlFor="school-name-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        School / College
                      </label>

                      <input
                        id="school-name-input"
                        type="text"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        placeholder="Enter school or college name"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Class */}
                    <div>
                      <label
                        htmlFor="class-name-select"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Class / Grade
                      </label>

                      <div className="relative">
                        <select
                          id="class-name-select"
                          name="className"
                          value={formData.className}
                          onChange={handleChange}
                          disabled={isViewMode}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
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
                        {!isViewMode && (
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Board */}
                    <div>
                      <label
                        htmlFor="board-select"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Board
                      </label>

                      <div className="relative">
                        <select
                          id="board-select"
                          name="board"
                          value={formData.board}
                          onChange={handleChange}
                          disabled={isViewMode}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                        >
                          <option value="">Select board</option>
                          <option value="CBSE">CBSE</option>
                          <option value="ICSE">ICSE</option>
                          <option value="State Board">State Board</option>
                          <option value="IB">IB</option>
                          <option value="Other">Other</option>
                        </select>
                        {!isViewMode && (
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Academic Year */}
                    <div>
                      <label
                        htmlFor="academic-year-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Academic Year
                      </label>

                      <input
                        id="academic-year-input"
                        type="text"
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleChange}
                        placeholder="e.g. 2026-2027"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Subjects */}
                    <div>
                      <label
                        htmlFor="subjects-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Subjects
                      </label>

                      <input
                        id="subjects-input"
                        type="text"
                        name="subjects"
                        value={formData.subjects}
                        onChange={handleChange}
                        placeholder="e.g. Maths, Physics, Chemistry"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Preferred Language */}
                    <div>
                      <label
                        htmlFor="preferred-language-select"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Preferred Language
                      </label>

                      <div className="relative">
                        <select
                          id="preferred-language-select"
                          name="preferredLanguage"
                          value={formData.preferredLanguage}
                          onChange={handleChange}
                          disabled={isViewMode}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                        >
                          <option value="">Select language</option>
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Kannada">Kannada</option>
                          <option value="Tamil">Tamil</option>
                          <option value="Telugu">Telugu</option>
                        </select>
                        {!isViewMode && (
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        )}
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
                      <label
                        htmlFor="address-textarea"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Address
                      </label>

                      <textarea
                        id="address-textarea"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter address"
                        rows={2}
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label
                        htmlFor="city-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        City
                      </label>

                      <input
                        id="city-input"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label
                        htmlFor="state-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        State
                      </label>

                      <input
                        id="state-input"
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label
                        htmlFor="country-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Country
                      </label>

                      <input
                        id="country-input"
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Enter country"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* PIN Code */}
                    <div>
                      <label
                        htmlFor="pincode-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        PIN Code
                      </label>

                      <input
                        id="pincode-input"
                        type="text"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleChange}
                        placeholder="Enter PIN code"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
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
                    {/* Parent ID - Auto Generated Preview */}
                    <div>
                      <label
                        htmlFor="parent-id-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Parent ID
                      </label>

                      <input
                        id="parent-id-input"
                        type="text"
                        value={
                          isGeneratingId
                            ? "Generating..."
                            : generatedId || "Auto-generated"
                        }
                        disabled
                        className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-gray-700"
                      />

                      {isCreateMode && (
                        <p className="mt-1 text-xs text-gray-400">
                          Parent ID generated automatically.
                        </p>
                      )}
                    </div>

                    {/* Relationship */}
                    <div>
                      <label
                        htmlFor="relationship-select"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Relationship with Student
                      </label>

                      <div className="relative">
                        <select
                          id="relationship-select"
                          name="relationship"
                          value={formData.relationship}
                          onChange={handleChange}
                          disabled={isViewMode}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                        >
                          <option value="">Select relationship</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Other">Other</option>
                        </select>
                        {!isViewMode && (
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Occupation */}
                    <div>
                      <label
                        htmlFor="occupation-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Occupation
                      </label>

                      <input
                        id="occupation-input"
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        placeholder="Enter occupation"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label
                        htmlFor="company-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Company / Organization
                      </label>

                      <input
                        id="company-input"
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Communication */}
                    <div>
                      <label
                        htmlFor="preferred-communication-select"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Preferred Communication
                      </label>

                      <div className="relative">
                        <select
                          id="preferred-communication-select"
                          name="preferredCommunication"
                          value={formData.preferredCommunication}
                          onChange={handleChange}
                          disabled={isViewMode}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                        >
                          <option value="">Select method</option>
                          <option value="Email">Email</option>
                          <option value="Phone">Phone</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="SMS">SMS</option>
                        </select>
                        {!isViewMode && (
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        )}
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
                    {/* Employee ID - Auto Generated Preview */}
                    <div>
                      <label
                        htmlFor="employee-id-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Employee ID
                      </label>

                      <input
                        id="employee-id-input"
                        type="text"
                        value={
                          isGeneratingId
                            ? "Generating..."
                            : generatedId || "Auto-generated"
                        }
                        disabled
                        className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-gray-700"
                      />

                      {isCreateMode && (
                        <p className="mt-1 text-xs text-gray-400">
                          Employee ID generated automatically.
                        </p>
                      )}
                    </div>

                    {/* Qualification */}
                    <div>
                      <label
                        htmlFor="qualification-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Highest Qualification
                      </label>

                      <input
                        id="qualification-input"
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="e.g. M.Sc, B.Ed, M.Tech"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Specialization */}
                    <div>
                      <label
                        htmlFor="specialization-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Specialization
                      </label>

                      <input
                        id="specialization-input"
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g. Mathematics"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Experience */}
                    <div>
                      <label
                        htmlFor="experience-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Teaching Experience (Years)
                      </label>

                      <input
                        id="experience-input"
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="Years of experience"
                        min="0"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Subjects */}
                    <div>
                      <label
                        htmlFor="teaching-subjects-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Teaching Subjects
                      </label>

                      <input
                        id="teaching-subjects-input"
                        type="text"
                        name="teachingSubjects"
                        value={formData.teachingSubjects}
                        onChange={handleChange}
                        placeholder="e.g. Maths, Physics"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Classes */}
                    <div>
                      <label
                        htmlFor="teaching-classes-input"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Classes / Grades
                      </label>

                      <input
                        id="teaching-classes-input"
                        type="text"
                        name="teachingClasses"
                        value={formData.teachingClasses}
                        onChange={handleChange}
                        placeholder="e.g. 8, 9, 10, 11"
                        disabled={isViewMode}
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Language */}
                    <div>
                      <label
                        htmlFor="teaching-language-select"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Teaching Language
                      </label>

                      <div className="relative">
                        <select
                          id="teaching-language-select"
                          name="teachingLanguage"
                          value={formData.teachingLanguage}
                          onChange={handleChange}
                          disabled={isViewMode}
                          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
                        >
                          <option value="">Select language</option>
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Kannada">Kannada</option>
                          <option value="Tamil">Tamil</option>
                          <option value="Telugu">Telugu</option>
                        </select>
                        {!isViewMode && (
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* =====================================================
                  AADHAAR CARD DOCUMENT UPLOAD
              ====================================================== */}
              {!isViewMode && (
                <div className="mt-7">
                  <h3 className="mb-4 text-base font-semibold text-gray-800">
                    Aadhaar Card <span className="text-red-500">*</span>
                  </h3>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      {/* Upload Aadhaar Card */}
                      <div>
                        <label
                          htmlFor="aadhaar-upload"
                          className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                          Upload Aadhaar Card
                        </label>

                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            id="aadhaar-upload"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleAadhaarUpload}
                            className="hidden"
                          />

                          <label
                            htmlFor="aadhaar-upload"
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600"
                          >
                            <Plus size={16} />
                            Choose File
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Uploaded Aadhaar Preview */}
                    {aadhaarFile && (
                      <div className="mt-5 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                            <FileText size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">
                              Aadhaar Card
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {aadhaarFile.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => handleViewFile(aadhaarFile)}
                            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={handleRemoveAadhaar}
                            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =====================================================
                  COMMON ACCOUNT INFORMATION (3-COLUMN STRUCTURE)
              ====================================================== */}
              {isCreateMode && (
                <div className="mt-7 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password-input"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="password-input"
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
                    <label
                      htmlFor="confirm-password-input"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Confirm Password <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="confirm-password-input"
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
              )}
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
              {isViewMode ? "Back" : "Cancel"}
            </button>

            {!isViewMode && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition duration-150 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitButtonText}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewUserPage;