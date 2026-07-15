// app/checkout/success/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { toast } from 'sonner'
import { CheckCircle, Loader2 } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentIntentId = searchParams.get('payment_intent')
      const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret')
      const redirectStatus = searchParams.get('redirect_status')
      const orderId = searchParams.get('orderId')

      // If we have orderId from Razorpay or pre-created rental
      if (orderId) {
        setVerifying(false)
        setSuccess(true)
        return
      }

      // Handle Stripe redirect
      if (paymentIntentId && paymentIntentClientSecret) {
        try {
          const accessToken = session?.user?.accessToken
          if (!accessToken) {
            toast.error('Session expired')
            router.push('/login')
            return
          }

          if (redirectStatus === 'succeeded') {
            // Payment succeeded, verify with backend
            const response = await axios.post(
              `${BASE_URL}/api/v1/payments/verify-stripe`,
              {
                paymentIntentId,
                clientSecret: paymentIntentClientSecret,
              },
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            )

            if (response.data.success) {
              setSuccess(true)
              toast.success('Payment successful!')
              
              // Redirect to order confirmation after 3 seconds
              setTimeout(() => {
                router.push(`/dashboard/orders/${response.data.data.rentalId}`)
              }, 3000)
            } else {
              toast.error('Payment verification failed')
              setSuccess(false)
            }
          } else {
            toast.error('Payment failed or was cancelled')
            setSuccess(false)
          }
        } catch (error) {
          console.error('Verification error:', error)
          toast.error('Failed to verify payment')
          setSuccess(false)
        } finally {
          setVerifying(false)
        }
      } else {
        // No payment intent, redirect to orders
        setTimeout(() => {
          router.push('/dashboard/orders')
        }, 3000)
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams, session, router])

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Verifying Payment...</h2>
          <p className="text-gray-500 mt-2">Please wait while we confirm your payment</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We've received your payment and will process your rental shortly.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your orders...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          Your payment could not be processed. Please try again.
        </p>
        <button
          onClick={() => router.push('/checkout')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Return to Checkout
        </button>
      </div>
    </div>
  )
}