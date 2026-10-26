export type IAppConfig = {
  siteName: string
  logoPath: string
  imagePath: string
}

export type INavigationItem = {
  name: string
  href: string
  external?: boolean
}

export interface ISubMenu {
  subMenuId: number
  subMenuName: string
  subMenuUrl: string
  subMenuIcon?: string
}

export interface IMenu {
  menuId: number
  menuName: string
  menuUrl: string
  menuIcon?: string
  subMenus?: ISubMenu[]
}

export interface IRolePermission {
  roleId: number
  roleName: string
  menus: IMenu[]
}

export interface IUser {
  userId: number
  username: string
  roleId?: number
  rolePermissions: IRolePermission[]
  emailAddress?: string
  role?: string
  roleName?: string
  profilePhoto?: string
  avatarUrl?: string
  isSupervisor: boolean
  firstName: string
  lastName: string
  employeeId?: string
  phone_number?: string
  contactNumber?: string
  employeeNumber?: string
}

export interface ICoachingSession {
  sessionId: string
  clientName: string
  clientId: number
  coachName: string
  coachId: number
  dateTime: string
  duration: number // minutes
  status: "Scheduled" | "Completed" | "Cancelled" | "Pending"
  topic?: string
  notes?: string
}

export interface ICoachingGoal {
  goalId: string
  clientId: number
  title: string
  description: string
  dueDate: string
  status: "Not Started" | "In Progress" | "Completed"
  tasks: IGoalTask[]
}

export interface IGoalTask {
  taskId: string
  title: string
  completed: boolean
}

export interface IResourceItem {
  resourceId: string
  title: string
  description: string
  fileType: string
  fileUrl: string
  sharedBy: string
  dateShared: string
}

// RolePermissionPage types
export interface Role {
  roleId: number;
  name: string;
}

export interface PermissionItem {
  id: number;
  name: string;
  code: string;
}

export interface PermissionGroup {
  id: number;
  name: string;
  icon: string;
  permissions: PermissionItem[];
}

// dummy data for role permission table page

export type UserRow = {
    id: number;
    employeeCode: string;
    fullName: string;
    type: string;
    stationName: string;
    role: string;
    permissions: Record<string, string>;
};

export const MODULES = [
    "Dashboard",
    "User Management",
    "Role & Permission Management",
    "Student Management",
    "Parent Management",
    "Teacher Management",
    "Tutor Management",
    "Class Management",
    "Subject Management",
    "Batch Management",
    "Attendance Management",
    "Timetable Management",
    "Course Management",
    "Study Materials",
    "Homework & Assignments",
    "Exam Management",
    "Results & Grades",
    "Fees & Payments",
    "Notifications",
    "Reports & Analytics",
    "Profile Management",
    "Settings",
];

export const INITIAL_USERS: UserRow[] = [
    {
        id: 1,
        employeeCode: "TUT001",
        fullName: "Rahul Kumar",
        type: "Tutor",
        stationName: "Head Office",
        role: "Tutor",
        permissions: {
            Dashboard: "View",
            "User Management": "Create / Edit",
            "Role & Permission": "Manage",
            Attendance: "Manage",
            Reports: "View",
        },
    },
    {
        id: 2,
        employeeCode: "TCH001",
        fullName: "Aaditya Singh",
        type: "Teacher",
        stationName: "Main Campus",
        role: "Teacher",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "Create / Edit",
            Reports: "View",
        },
    },
    {
        id: 3,
        employeeCode: "STU001",
        fullName: "Arvi Arya",
        type: "Student",
        stationName: "Main Campus",
        role: "Student",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "View",
            Reports: "-",
        },
    },
    {
        id: 4,
        employeeCode: "PAR001",
        fullName: "Aman Tiwari",
        type: "Parent",
        stationName: "Main Campus",
        role: "Parent",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "View",
            Reports: "View",
        },
    },
    {
        id: 5,
        employeeCode: "TUT002",
        fullName: "Pooja Sharma",
        type: "Tutor",
        stationName: "North Branch",
        role: "Tutor",
        permissions: {
            Dashboard: "View",
            "User Management": "View",
            "Role & Permission": "-",
            Attendance: "Manage",
            Reports: "Create / Edit",
        },
    },
    {
        id: 6,
        employeeCode: "TCH002",
        fullName: "Vikram Malhotra",
        type: "Teacher",
        stationName: "South Wing",
        role: "Teacher",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "Create / Edit",
            Reports: "View",
        },
    },
    {
        id: 7,
        employeeCode: "STU002",
        fullName: "Sneha Patel",
        type: "Student",
        stationName: "Main Campus",
        role: "Student",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "View",
            Reports: "-",
        },
    },
    {
        id: 8,
        employeeCode: "PAR002",
        fullName: "Rajesh Gupta",
        type: "Parent",
        stationName: "North Branch",
        role: "Parent",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "View",
            Reports: "View",
        },
    },
    {
        id: 9,
        employeeCode: "TUT003",
        fullName: "Neha Verma",
        type: "Tutor",
        stationName: "East Campus",
        role: "Tutor",
        permissions: {
            Dashboard: "View",
            "User Management": "Create / Edit",
            "Role & Permission": "View",
            Attendance: "Manage",
            Reports: "Manage",
        },
    },
    {
        id: 10,
        employeeCode: "TCH003",
        fullName: "Anil Deshmukh",
        type: "Teacher",
        stationName: "West Campus",
        role: "Teacher",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "Manage",
            Reports: "View",
        },
    },
    {
        id: 11,
        employeeCode: "STU003",
        fullName: "Rohan Joshi",
        type: "Student",
        stationName: "East Campus",
        role: "Student",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "View",
            Reports: "-",
        },
    },
    {
        id: 12,
        employeeCode: "PAR003",
        fullName: "Sunita Reddy",
        type: "Parent",
        stationName: "West Campus",
        role: "Parent",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "View",
            Reports: "View",
        },
    },
    {
        id: 13,
        employeeCode: "TUT004",
        fullName: "Deepak Choudhary",
        type: "Tutor",
        stationName: "Head Office",
        role: "Tutor",
        permissions: {
            Dashboard: "View",
            "User Management": "Manage",
            "Role & Permission": "Manage",
            Attendance: "Manage",
            Reports: "Manage",
        },
    },
    {
        id: 14,
        employeeCode: "TCH004",
        fullName: "Meera Nair",
        type: "Teacher",
        stationName: "Main Campus",
        role: "Teacher",
        permissions: {
            Dashboard: "View",
            "User Management": "-",
            "Role & Permission": "-",
            Attendance: "Create / Edit",
            Reports: "Create / Edit",
        },
    },
];
