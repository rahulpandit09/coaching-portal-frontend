export type UserRole = "Student" | "Teacher" | "Parent";

export type UserStatus = "Active" | "Inactive";

export interface StudentDetails {
  date_of_birth?: string;
  gender?: string;
  student_id?: string;
  school_name?: string;
  class_name?: string;
  board?: string;
  academic_year?: string;
  subjects?: string;
  preferred_language?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pin_code?: string;
  id?: number;
  user_id?: number;
}

export interface TeacherDetails {
  employee_id?: string;
  qualification?: string;
  specialization?: string;
  experience?: number;
  teaching_language?: string;
  teaching_classes?: string;
  teaching_subjects?: string;
  id?: number;
  user_id?: number;
}

export interface ParentDetails {
  relationship?: string;
  occupation?: string;
  company_name?: string;
  preferred_communication?: string;
  id?: number;
  user_id?: number;
}

export interface IUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  email: string;
  phone_number?: string | null;
  role_id?: number;
  role: UserRole | string;
  profile_image?: string | null;
  aadhaar_card?: string | null;
  last_login?: string | null;

  student_details?: StudentDetails | null;
  teacher_details?: TeacherDetails | null;
  parent_details?: ParentDetails | null;

  // Legacy/flattened properties kept for compatibility
  name?: string;
  phone?: string;
  status?: UserStatus;

  // Student specific fields
  studentId?: string;
  className?: string;
  schoolName?: string;
  board?: string;
  gender?: string;
  parentName?: string;

  // Teacher specific fields
  employeeId?: string;
  qualification?: string;
  specialization?: string;
  experience?: string;
  teachingSubjects?: string;
  teachingClasses?: string;

  // Parent specific fields
  relationship?: string;
  occupation?: string;
  companyName?: string;
  studentName?: string;
}

export interface IUserStats {
  totalUsers: number;
  students: number;
  teachers: number;
  parents: number;
}

export interface IAddUserForm {
  // Common fields
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  phone: string;
  role: UserRole | "";
  password: string;
  confirmPassword: string;
  aadhaarNumber?: string;
  uploadedDocuments?: File[];

  // Student fields
  dateOfBirth: string;
  gender: string;
  studentId: string;
  schoolName: string;
  className: string;
  board: string;
  academicYear: string;
  subjects: string;
  preferredLanguage: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;

  // Parent fields
  relationship: string;
  occupation: string;
  companyName: string;
  preferredCommunication: string;

  // Teacher fields
  employeeId: string;
  qualification: string;
  specialization: string;
  experience: string;
  teachingLanguage: string;
  teachingClasses: string;
  teachingSubjects: string;
}