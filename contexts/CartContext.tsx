// src/contexts/CartContext.tsx
'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { getSession, useSession } from 'next-auth/react'
import axios from 'axios'
import { toast } from 'sonner'
import { trackEvent } from '@/lib/api/behavior'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CartItem {
  _id: string
  product: {
    _id: string
    basicInfo: { name: string; slug: string }
    media?: { images?: Array<{ url: string; thumbnail: string; isPrimary: boolean }> }
    pricing: { monthlyRent: number; securityDeposit: number; deliveryCharges: number }
    inventory: { availableQuantity: number }
    status: { isActive: boolean }
    rentalTerms: { minRentalMonths: number; maxRentalMonths: number }
  }
  quantity: number
  rentalMonths: number
  totals: {
    monthlySubtotal: number
    tenureSubtotal: number
    securityDepositTotal: number
    deliveryChargesTotal: number
    lineTotal: number
  }
  pricing?: { discountPercent?: number }
}

export interface CartSummary {
  itemsCount: number
  totalQuantity: number
  monthlyRentTotal: number
  securityDepositTotal: number
  deliveryChargesTotal: number
  subtotal?: number
  discountAmount?: number
  grandTotal: number
}

export interface CartCoupon {
  code: string
  type?: string
  value?: number
  discountAmount?: number
  isValid?: boolean
}

export interface Cart {
  _id: string
  items: CartItem[]
  summary: CartSummary
  coupon?: CartCoupon | null
}

interface CartContextValue {
  cart: Cart | null
  isLoading: boolean
  itemCount: number
  fetchCart: () => Promise<void>
  addToCart: (productId: string, quantity?: number, rentalMonths?: number) => Promise<boolean>
  updateCartItem: (itemId: string, data: { quantity?: number; rentalMonths?: number }) => Promise<boolean>
  removeCartItem: (itemId: string) => Promise<boolean>
  clearCart: () => Promise<boolean>
  getCartCount: () => number
  isInCart: (productId: string) => boolean
  setCart: (cart: Cart | null) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const getAuthHeaders = async () => {
  const session = await getSession()
  return {
    'Content-Type': 'application/json',
    Authorization: session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [itemCount, setItemCount] = useState(0)

  // Keep the derived count in sync whenever the cart object changes.
  const applyCart = useCallback((next: Cart | null) => {
    setCart(next)
    setItemCount(next?.summary?.itemsCount ?? 0)
  }, [])

  const fetchCart = useCallback(async () => {
    const headers = await getAuthHeaders()
    setIsLoading(true)
    try {
      if (headers.Authorization) {
        const response = await axios.get(`${BASE_URL}/api/v1/cart/me`, { headers })
        if (response.data.success) {
          applyCart(response.data.data.cart)
        } else {
          console.error('Failed to fetch cart:', response.data.message)
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setIsLoading(false)
    }
  }, [applyCart])

  const addToCart = async (productId: string, quantity: number = 1, rentalMonths: number = 3) => {
    if (!session) {
      toast.error('Please login to add items to cart')
      return false
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/cart/add`,
        { productId, quantity, rentalMonths },
        { headers: { Authorization: `Bearer ${session.user?.accessToken}` } }
      )
      if (response.data.success) {
        applyCart(response.data.data.cart)
        toast.success('Item added to cart')
        trackEvent({ eventType: 'add_to_cart', productId })
        return true
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      toast.error(error.response?.data?.message || 'Failed to add to cart')
      return false
    }
    return false
  }

  const updateCartItem = async (itemId: string, data: { quantity?: number; rentalMonths?: number }) => {
    if (!session) return false

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/cart/item/${itemId}`,
        data,
        { headers: { Authorization: `Bearer ${session.user?.accessToken}` } }
      )
      if (response.data.success) {
        applyCart(response.data.data.cart)
        return true
      }
    } catch (error: any) {
      console.error('Error updating cart:', error)
      toast.error(error.response?.data?.message || 'Failed to update cart')
      return false
    }
    return false
  }

  const removeCartItem = async (itemId: string) => {
    if (!session) return false

    try {
      const response = await axios.delete(`${BASE_URL}/api/v1/cart/item/${itemId}`, {
        headers: { Authorization: `Bearer ${session.user?.accessToken}` },
      })
      if (response.data.success) {
        applyCart(response.data.data.cart)
        toast.success('Item removed from cart')
        trackEvent({ eventType: 'remove_from_cart' })
        return true
      }
    } catch (error) {
      console.error('Error removing cart item:', error)
      toast.error('Failed to remove item')
      return false
    }
    return false
  }

  const clearCart = async () => {
    if (!session) return false

    try {
      await axios.delete(`${BASE_URL}/api/v1/cart/clear`, {
        headers: { Authorization: `Bearer ${session.user?.accessToken}` },
      })
      applyCart(null)
      toast.success('Cart cleared')
      trackEvent({ eventType: 'remove_from_cart' })
      return true
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
      return false
    }
  }

  const getCartCount = () => itemCount

  const isInCart = useCallback(
    (productId: string) => !!cart?.items?.some((item) => item.product?._id === productId),
    [cart]
  )

  useEffect(() => {
    if (
      session?.user?.accessToken &&
      session?.error !== 'RefreshAccessTokenError' &&
      session?.user?.role === 'user'
    ) {
      fetchCart()
    } else {
      setIsLoading(false)
    }
  }, [session, fetchCart])

  const value: CartContextValue = {
    cart,
    isLoading,
    itemCount,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    getCartCount,
    isInCart,
    setCart: applyCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
