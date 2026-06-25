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
  rolePermissions: IRolePermission[]
  emailAddress?: string
  role?: string
  roleName?: string
  isSupervisor: boolean
  firstName: string
  lastName: string
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
