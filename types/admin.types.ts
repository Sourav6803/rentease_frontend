// src/app/admin/settings/admins/types/admin.types.ts

export interface Admin {
  _id: string
  user: {
    _id: string
    email: string
    phone: string
    profile: {
      firstName: string
      lastName: string
      avatar?: string
    }
    lastLogin?: string
    status: {
      isActive: boolean
    }
  }
  email: string
  phone: string
  profile: {
    firstName: string
    lastName: string
    department: string
    designation: string
    employeeId: string
    avatar?: string
  }
  role: 'super_admin' | 'admin' | 'operations_manager' | 'support_manager' | 'finance_manager'
  permissions: {
    users: { view: boolean; create: boolean; edit: boolean; delete: boolean; block: boolean }
    vendors: { view: boolean; approve: boolean; suspend: boolean }
    products: { view: boolean; approve: boolean; feature: boolean }
    rentals: { view: boolean; manage: boolean; cancel: boolean }
    payments: { view: boolean; refund: boolean }
    content: { manage: boolean }
    analytics: { view: boolean; export: boolean }
    admins: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  }
  access: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    maxSessions: number
    lastLogin?: string
    lastLoginIp?: string
    lastLoginDevice?: string
  }
  status: {
    isActive: boolean
    isBlocked: boolean
    lastActive?: string
  }
  createdAt: string
  updatedAt: string
  createdBy?: {
    _id: string
    profile: { firstName: string; lastName: string }
  }
}

export interface CreateAdminData {
  email: string
  phone: string
  password: string
  profile: {
    firstName: string
    lastName: string
    department: string
    designation: string
    employeeId: string
  }
  role: Admin['role']
}

export interface UpdateAdminData {
  profile?: Partial<Admin['profile']>
  role?: Admin['role']
  permissions?: Partial<Admin['permissions']>
  status?: { isActive: boolean }
}

export interface AdminStats {
  total: number
  active: number
  inactive: number
  byRole: Array<{ _id: string; count: number }>
  recentActivity: Array<{
    adminId: string
    name: string
    action: string
    timestamp: string
  }>
}