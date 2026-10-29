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

export interface RoleItem {
  roleId: number;
  name: string;
  description?: string;
  [key: string]: any;
}

export interface RolesApiResponse {
  count?: number;
  data: RoleItem[];
}

export interface SubmenuApiItem {
  subMenuId: number;
  title: string;
  orderIndex: number;
  menuId?: number;
  path?: string;
  icon?: string;
  status?: boolean;
  [key: string]: any;
}

export interface SubmenuApiResponse {
  count?: number;
  data: SubmenuApiItem[];
}

export interface RoleAccessSubMenu {
  subMenuId: number;
  subMenuName?: string;
  title?: string;
  path?: string;
  [key: string]: any;
}

export interface RoleAccessMenu {
  menuId: number;
  menuName?: string;
  title?: string;
  path?: string;
  subMenus: RoleAccessSubMenu[];
  [key: string]: any;
}

export interface RoleAccessResponse {
  roleId?: number;
  roleName?: string;
  menus: RoleAccessMenu[];
  [key: string]: any;
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

// Role permission table types

export type UserRow = {
    id: number;
    roleId?: number;
    employeeCode: string;
    fullName: string;
    type: string;
    stationName: string;
    role: string;
    permissions: Record<string, boolean | string | string[]>;
    assignedRoles?: Record<string, string>;
};


