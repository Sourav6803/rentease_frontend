// src/hooks/useCart.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSession, useSession } from 'next-auth/react'
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

interface CartItem {
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
}

interface CartSummary {
  itemsCount: number
  totalQuantity: number
  monthlyRentTotal: number
  securityDepositTotal: number
  deliveryChargesTotal: number
  grandTotal: number
}

interface Cart {
  _id: string
  items: CartItem[]
  summary: CartSummary
}

const getAuthHeaders = async () => {
  const session = await getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

export function useCart() {
  const { data: session } = useSession()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [itemCount, setItemCount] = useState(0)
  const router = useRouter()

  const fetchCart = useCallback(async () => {
    // if (!session?.user?.accessToken) {
    //   setIsLoading(false)
    //   return
    // }
    
    console.log("session--->", session?.user?.accessToken)

    // const accessToken = await getAccessToken()
    //   if (!accessToken) {
    //     toast.error('Session expired. Please log in again.')
    //     router.push('/login?callbackUrl=/checkout')
    //     return
    //   }

    const headers = await getAuthHeaders()
    console.log("headers--->", headers)

    setIsLoading(true)
    try {
      if(headers?.Authorization){
        const response = await axios.get(`${BASE_URL}/api/v1/cart/me`, {
          headers
        })
        if (response.data.success) {
        setCart(response.data.data.cart)
        setItemCount(response.data.data.cart.summary.itemsCount)
      }else{
        console.error("Failed to fetch cart:", response.data.message)
      }
      }
      
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session])

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
        fetchCart() // Refresh cart after adding item
        setCart(response.data.data.cart)
        setItemCount(response.data.data.cart.summary.itemsCount)
        toast.success('Item added to cart')
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
      const response = await axios.put(
        `${BASE_URL}/api/v1/cart/items/${itemId}`,
        data,
        { headers: { Authorization: `Bearer ${session.user?.accessToken}` } }
      )
      if (response.data.success) {
        setCart(response.data.data.cart)
        setItemCount(response.data.data.cart.summary.itemsCount)
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
      const response = await axios.delete(`${BASE_URL}/api/v1/cart/items/${itemId}`, {
        headers: { Authorization: `Bearer ${session.user?.accessToken}` }
      })
      if (response.data.success) {
        setCart(response.data.data.cart)
        setItemCount(response.data.data.cart.summary.itemsCount)
        toast.success('Item removed from cart')
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
        headers: { Authorization: `Bearer ${session.user?.accessToken}` }
      })
      setCart(null)
      setItemCount(0)
      toast.success('Cart cleared')
      return true
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error('Failed to clear cart')
      return false
    }
  }

  const getCartCount = () => itemCount

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

  }, [fetchCart])

  return {
    cart,
    isLoading,
    itemCount,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    getCartCount
  }
}