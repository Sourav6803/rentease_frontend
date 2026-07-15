// src/types/cart.types.ts

export interface CartItemPricing {
  monthlyRent: number
  effectiveMonthlyRent: number
  securityDeposit: number
  deliveryCharges: number
  discountPercent: number
}

export interface CartItemTotals {
  monthlySubtotal: number
  tenureSubtotal: number
  securityDepositTotal: number
  deliveryChargesTotal: number
  lineTotal: number
}

export interface CartItem {
  _id: string
  product: {
    _id: string
    basicInfo: {
      name: string
      slug: string
    }
    media?: {
      images?: Array<{
        url: string
        thumbnail: string
        isPrimary: boolean
      }>
    }
    pricing: {
      monthlyRent: number
      securityDeposit: number
      deliveryCharges: number
    }
    inventory: {
      availableQuantity: number
    }
    status: {
      isActive: boolean
    }
    rentalTerms: {
      minRentalMonths: number
      maxRentalMonths: number
    }
  }
  quantity: number
  rentalMonths: number
  pricing: CartItemPricing
  totals: CartItemTotals
  addedAt: string
}

export interface CartSummary {
  itemsCount: number
  totalQuantity: number
  monthlyRentTotal: number
  securityDepositTotal: number
  deliveryChargesTotal: number
  grandTotal: number
}

export interface Cart {
  _id: string
  user: string
  items: CartItem[]
  summary: CartSummary
  createdAt: string
  updatedAt: string
}