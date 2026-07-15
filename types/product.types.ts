// src/types/product.types.ts

export interface Product {
  _id: string
  basicInfo: {
    name: string
    slug: string
    brand?: string
    description: string
    sku: string
  }
  pricing: {
    monthlyRent: number
    securityDeposit: number
    deliveryCharges: number
  }
  inventory: {
    totalQuantity: number
    availableQuantity: number
    rentedQuantity: number
    maintenanceQuantity: number
  }
  media: {
    images: Array<{
      url: string
      thumbnail: string
      isPrimary: boolean
    }>
  }
  ratings: {
    average: number
    count: number
  }
  condition: string
  category: {
    _id: string
    name: string
    slug: string
  }
  vendor?: {
    _id: string
    business: {
      name: string
    }
    user?: {
      email: string
    }
  }
  status: {
    isActive: boolean
    isFeatured: boolean
    isVerified: boolean
    approvalStatus: 'pending' | 'approved' | 'rejected'
    rejectionReason?: string
  }
  createdAt: string
  updatedAt: string
}

export interface ProductStats {
  total: number
  active: number
  inactive: number
  pendingApproval: number
  featured: number
  outOfStock: number
}