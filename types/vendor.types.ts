// src/app/vendor/settings/types/vendor.types.ts

export interface VendorProfile {
  _id: string
  vendorId: string
  user: {
    _id: string
    email: string
    phone: string
    profile: {
      firstName: string
      lastName: string
      avatar?: string
    }
  }
  business: {
    name: string
    legalName?: string
    registrationNumber?: string
    gstin?: string
    panNumber?: string
    businessType: string
    foundedYear?: number
    description?: string
    website?: string
  }
  contact: {
    primaryPhone: string
    secondaryPhone?: string
    primaryEmail: string
    supportEmail?: string
    supportPhone?: string
  }
  addresses: {
    registeredOffice: {
      addressLine1: string
      city: string
      state: string
      pincode: string
      country: string
    }
    serviceableCities: Array<{
      city: string
      state: string
      isActive: boolean
    }>
    serviceablePincodes: string[]
  }
  bankDetails: {
    accountHolderName: string
    accountNumber: string
    ifscCode: string
    bankName: string
    branchName: string
    accountType: 'savings' | 'current'
    upiId?: string
    verified: boolean
  }
  settings: {
    autoConfirmBookings: boolean
    instantBooking: boolean
    advanceNotice: number
    minRentalDuration: number
    maxRentalDuration: number
    cancellationPolicy: 'flexible' | 'moderate' | 'strict'
    businessHours: BusinessHour[]
    notificationPreferences: NotificationPreferences
  }
  subscription: {
    plan: string
    validUntil: string
    autoRenew: boolean
    limits: {
      maxProducts: number
      maxRentalsPerMonth: number
      maxInventoryItems: number
      prioritySupport: boolean
      analyticsAccess: boolean
    }
  }
  performance: {
    rating: {
      average: number
      count: number
    }
    metrics: {
      totalRentals: number
      completedRentals: number
      totalRevenue: number
      responseRate: number
    }
  }
  verification: {
    status: 'pending' | 'verified' | 'rejected' | 'suspended'
  }
  createdAt: string
  updatedAt: string
}

export interface BusinessHour {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
  breaks: Array<{
    start: string
    end: string
  }>
}

export interface NotificationPreferences {
  email: {
    newRentals: boolean
    cancellations: boolean
    maintenanceRequests: boolean
    payments: boolean
    reviews: boolean
    dailyDigest: boolean
    weeklyReport: boolean
  }
  push: {
    enabled: boolean
    newRentals: boolean
    cancellations: boolean
    maintenanceRequests: boolean
    payments: boolean
  }
}

export interface UpdateProfileData {
  business?: {
    name?: string
    description?: string
    website?: string
  }
  contact?: {
    secondaryPhone?: string
    supportEmail?: string
    supportPhone?: string
  }
  addresses?: {
    serviceableCities?: Array<{ city: string; state: string; isActive: boolean }>
    serviceablePincodes?: string[]
  }
}

export interface UpdateBankDetailsData {
  accountHolderName: string
  accountNumber: string
  confirmAccountNumber: string
  ifscCode: string
  bankName: string
  branchName?: string
  accountType: 'savings' | 'current'
  upiId?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// src/app/vendor/support/types/support.types.ts

export interface SupportTicket {
  _id: string
  ticketNumber: string
  subject: string
  description: string
  category: 'technical' | 'billing' | 'product' | 'rental' | 'account' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  attachments?: Array<{
    name: string
    url: string
    size: number
  }>
  messages: Array<{
    sender: 'vendor' | 'support'
    message: string
    attachments?: string[]
    createdAt: string
    read: boolean
  }>
  assignedTo?: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface CreateTicketData {
  subject: string
  description: string
  category: SupportTicket['category']
  priority: SupportTicket['priority']
  attachments?: File[]
}

export interface FAQItem {
  question: string
  answer: string
  category: string
  helpful?: number
}