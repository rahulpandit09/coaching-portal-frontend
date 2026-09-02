export type UserRole = "Student" | "Teacher" | "Parent";

export type UserStatus = "Active" | "Inactive";

export interface IUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;

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