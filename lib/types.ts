export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface UserProfile {
  uid: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  phone: string
  profileCompleted: boolean
  createdAt: Date
  firstLogin?: boolean
  mustChangePassword?: boolean
  lastLogin?: Date
  loginCount?: number
}
