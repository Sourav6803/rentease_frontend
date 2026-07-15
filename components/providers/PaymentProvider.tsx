// components/providers/PaymentProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import Script from 'next/script'
import axios from 'axios'
import { toast } from 'sonner'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

declare global {
  interface Window {
    Razorpay: any
  }
}

// Types matching backend
export type PaymentType = 'security_deposit' | 'rent' | 'delivery' | 'late_fee' | 'damage_charge' | 'extension' | 'refund'
export type PaymentMethod = 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'wallet' | 'cash' | 'bank_transfer'
export type PaymentGateway = 'razorpay' | 'stripe'
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'refunded' | 'cancelled'

export interface InitiatePaymentData {
  rentalId: string
  amount: number
  paymentType: PaymentType
  paymentMethod: PaymentMethod
  gateway?: PaymentGateway
}

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
}

export interface StripePaymentIntent {
  clientSecret: string
  id: string
  amount: number
  currency: string
}

export interface PaymentBreakdown {
  rentalId: string
  rentalNumber: string
  paymentType: PaymentType
  baseAmount: number
  tax: number
  convenienceFee: number
  discount: number
  total: number
}

export interface InitiatePaymentResponse {
  payment: {
    _id: string
    paymentNumber: string
    amount: number
    status: PaymentStatus
  }
  gatewayOrder: RazorpayOrder | StripePaymentIntent
  breakdown: PaymentBreakdown
}

export interface Payment {
  _id: string
  paymentNumber: string
  user: string
  rental: {
    _id: string
    rentalNumber: string
  }
  vendor: string
  amount: number
  type: PaymentType
  method: PaymentMethod
  status: PaymentStatus
  paymentDetails: {
    gateway: PaymentGateway
    breakdown: PaymentBreakdown
    transactionId?: string
    cardLast4?: string
    cardBrand?: string
    upiId?: string
    razorpayPaymentId?: string
    razorpayOrderId?: string
  }
  timestamps: {
    initiated: Date
    processed?: Date
    completed?: Date
    failed?: Date
  }
  receipt?: {
    url: string
    generatedAt: Date
  }
}

interface PaymentContextType {
  stripePromise: Promise<Stripe | null> | null
  isRazorpayLoaded: boolean
  initiatePayment: (data: InitiatePaymentData)=> Promise<InitiatePaymentResponse>
  verifyPayment: (paymentId: string, verificationData: any)=> Promise<Payment>
  getPayment: (paymentId: string)=> Promise<Payment>
  getUserPayments: (page?: number, limit?: number, filters?: any)=> Promise<any>
  getPaymentStats: (period?: 'month' | 'year')=> Promise<any>
  generateReceipt: (paymentId: string)=> Promise<any>
  downloadReceipt: (paymentId: string)=> Promise<void>
  savePaymentMethod: (paymentMethodId: string)=> Promise<void>
  removePaymentMethod: (methodId: string)=> Promise<void>
  setDefaultPaymentMethod: (methodId: string)=> Promise<void>
  isProcessing: boolean
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export const usePayment = () => {
  const context = useContext(PaymentContext)
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider')
  }
  return context
}

interface PaymentProviderProps {
  children: ReactNode
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const { data: session } = useSession()
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      if (stripeKey && stripeKey !== 'pk_test_xxx') {
        const stripe = await loadStripe(stripeKey)
        setStripePromise(Promise.resolve(stripe))
      } else {
        console.warn('Stripe publishable key not configured')
        setStripePromise(Promise.resolve(null))
      }
    }

    initializeStripe()
  }, [])

  // API request helper with auth
  const apiRequest = async (method: string, url: string, data?: any) => {
    try {
      const response = await axios({
        method,
        url: `${BASE_URL}/api/v1/payments${url}`,
        data,
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      })
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Payment request failed'
      toast.error(message)
      throw new Error(message)
    }
  }

  // Initiate payment (creates payment record and gateway order)
  const initiatePayment = async (data: InitiatePaymentData): Promise<InitiatePaymentResponse> => {
    setIsProcessing(true)
    try {
      const response = await apiRequest('POST', '/initiate', data)
      return response.data
    } finally {
      setIsProcessing(false)
    }
  }

  // Verify payment after gateway callback
  const verifyPayment = async (paymentId: string, verificationData: any): Promise<Payment> => {
    setIsProcessing(true)
    try {
      const response = await apiRequest('POST', `/${paymentId}/verify`, verificationData)
      return response.data.payment
    } finally {
      setIsProcessing(false)
    }
  }

  // Get single payment details
  const getPayment = async (paymentId: string): Promise<Payment> => {
    const response = await apiRequest('GET', `/${paymentId}`)
    return response.data.payment
  }

  // Get user's payment history
  const getUserPayments = async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
    })
    const response = await apiRequest('GET', `/user/me?${queryParams}`)
    return response.data
  }

  // Get payment statistics
  const getPaymentStats = async (period: 'month' | 'year' = 'month') => {
    const response = await apiRequest('GET', `/stats?period=${period}`)
    return response.data
  }

  // Generate receipt
  const generateReceipt = async (paymentId: string) => {
    const response = await apiRequest('GET', `/${paymentId}/receipt`)
    return response.data.receipt
  }

  // Download receipt as PDF
  const downloadReceipt = async (paymentId: string) => {
    try {
      const response = await axios({
        method: 'GET',
        url: `${BASE_URL}/api/v1/payments/${paymentId}/receipt/download`,
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `receipt-${paymentId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Receipt downloaded successfully')
    } catch (error) {
      toast.error('Failed to download receipt')
    }
  }

  // Save payment method
  const savePaymentMethod = async (paymentMethodId: string) => {
    await apiRequest('POST', '/methods', { paymentMethodId })
    toast.success('Payment method saved')
  }

  // Remove payment method
  const removePaymentMethod = async (methodId: string) => {
    await apiRequest('DELETE', `/methods/${methodId}`)
    toast.success('Payment method removed')
  }

  // Set default payment method
  const setDefaultPaymentMethod = async (methodId: string) => {
    await apiRequest('PATCH', `/methods/${methodId}/default`)
    toast.success('Default payment method updated')
  }

  return (
    <PaymentContext.Provider
      value={{
        stripePromise,
        isRazorpayLoaded,
        initiatePayment,
        verifyPayment,
        getPayment,
        getUserPayments,
        getPaymentStats,
        generateReceipt,
        downloadReceipt,
        savePaymentMethod,
        removePaymentMethod,
        setDefaultPaymentMethod,
        isProcessing,
      }}
    >
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setIsRazorpayLoaded(true)}
        strategy="lazyOnload"
      />
      {children}
    </PaymentContext.Provider>
  )
}