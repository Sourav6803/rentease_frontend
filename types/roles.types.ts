// src/app/admin/settings/roles-permissions/types/roles.types.ts

export interface Permission {
  view?: boolean
  create?: boolean
  edit?: boolean
  delete?: boolean
  block?: boolean
  approve?: boolean
  suspend?: boolean
  manage?: boolean
  cancel?: boolean
  refund?: boolean
  export?: boolean
  [key: string]: boolean | undefined
}

export interface Permissions {
  users: Permission
  vendors: Permission
  products: Permission
  rentals: Permission
  payments: Permission
  inventory: Permission
  maintenance: Permission
  discounts: Permission
  content: Permission
  analytics: Permission
  admins: Permission
  system: Permission
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permissions
}

export interface AdminUser {
  _id: string
  email: string
  phone: string
  profile: {
    firstName: string
    lastName: string
    avatar?: string
    department: string
    designation: string
    employeeId: string
  }
  role: string
  status: {
    isActive: boolean
  }
  createdAt: string
  lastLogin?: string
}

export interface RoleAssignmentData {
  adminId: string
  role: string
}

export interface CustomPermissionsData {
  adminId: string
  permissions: Partial<Permissions>
}