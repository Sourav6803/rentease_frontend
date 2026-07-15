// components/payment/PaymentGateway.tsx
'use client'

import { useState, useEffect } from 'react'
import { usePayment, InitiatePaymentData, PaymentMethod, PaymentGateway as GatewayType } from '@/components/providers/PaymentProvider'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { CreditCard, Smartphone, Building2, Wallet, Loader2, CheckCircle, ArrowRight } from 'lucide-react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { toast } from 'sonner'

interface PaymentGatewayProps {
  rentalId: string
  amount: number
  paymentType: 'security_deposit' | 'rent' | 'delivery' | 'full'
  onSuccess: (paymentId: string, paymentNumber: string) => void
  onError?: (error: string) => void
  onCancel?: () => void
}

// Payment method configuration matching backend
const paymentMethodsConfig = [
  { 
    id: 'credit_card' as PaymentMethod, 
    name: 'Credit Card', 
    icon: CreditCard, 
    gateway: 'stripe' as GatewayType,
    description: 'Visa, Mastercard, RuPay'
  },
  { 
    id: 'debit_card' as PaymentMethod, 
    name: 'Debit Card', 
    icon: CreditCard, 
    gateway: 'stripe' as GatewayType,
    description: 'All major banks'
  },
  { 
    id: 'upi' as PaymentMethod, 
    name: 'UPI', 
    icon: Smartphone, 
    gateway: 'razorpay' as GatewayType,
    description: 'Google Pay, PhonePe, Paytm'
  },
  { 
    id: 'net_banking' as PaymentMethod, 
    name: 'Net Banking', 
    icon: Building2, 
    gateway: 'razorpay' as GatewayType,
    description: 'All major banks'
  },
  { 
    id: 'wallet' as PaymentMethod, 
    name: 'Wallet', 
    icon: Wallet, 
    gateway: 'razorpay' as GatewayType,
    description: 'Paytm, Amazon Pay'
  },
]

// Stripe Card Form Component
function StripeCardForm({ 
  amount, 
  paymentIntentId,
  clientSecret,
  paymentId,
  onSuccess, 
  onError 
}: { 
  amount: number
  paymentIntentId: string
  clientSecret: string
  paymentId: string
  onSuccess: (paymentId: string, paymentNumber?: string) => void
  onError: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { verifyPayment } = usePayment()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (error) {
        onError(error.message || 'Payment failed')
        toast.error(error.message)
      } else if (paymentIntent.status === 'succeeded') {
        // Verify payment with backend
        const verifiedPayment = await verifyPayment(paymentId, {
          gateway: 'stripe',
          paymentIntentId: paymentIntent.id
        })
        
        onSuccess(verifiedPayment._id, verifiedPayment.paymentNumber)
        toast.success('Payment successful!')
      }
    } catch (error) {
      onError('Payment processing failed')
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-xl bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': { color: '#9ca3af' },
              },
            },
            hidePostalCode: true,
          }}
          className="p-3"
        />
      </div>
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 text-base"
      >
        {isProcessing ? (
          <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Processing...</>
        ) : (
          <>Pay ₹{amount.toLocaleString()}</>
        )}
      </Button>
    </form>
  )
}

// Main Payment Gateway Component
export function PaymentGateway({ 
  rentalId,
  amount, 
  paymentType,
  onSuccess, 
  onError,
  onCancel 
}: PaymentGatewayProps) {
  const { data: session } = useSession()
  const { 
    stripePromise, 
    isRazorpayLoaded, 
    initiatePayment, 
    verifyPayment,
    isProcessing 
  } = usePayment()
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('credit_card')
  const [paymentState, setPaymentState] = useState<{
    status: 'idle' | 'processing' | 'ready' | 'success'
    paymentId?: string
    clientSecret?: string
    gatewayOrder?: any
  }>({ status: 'idle' })

  const selectedMethodConfig = paymentMethodsConfig.find(m => m.id === selectedMethod)!

  const handleInitiatePayment = async () => {
    setPaymentState({ status: 'processing' })
    
    try {
      const result = await initiatePayment({
        rentalId,
        amount,
        paymentType: paymentType === 'full' ? 'rent' : paymentType,
        paymentMethod: selectedMethod,
        gateway: selectedMethodConfig.gateway
      })

      setPaymentState({
        status: 'ready',
        paymentId: result.payment._id,
        gatewayOrder: result.gatewayOrder,
        clientSecret: result.gatewayOrder.clientSecret
      })
    } catch (error) {
      setPaymentState({ status: 'idle' })
      onError?.('Failed to initiate payment')
    }
  }

  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh the page.')
      return
    }

    const { gatewayOrder, paymentId } = paymentState

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: gatewayOrder.amount * 100, // Convert to paise
      currency: gatewayOrder.currency,
      name: 'RentEase',
      description: `Payment for rental ${rentalId}`,
      order_id: gatewayOrder.id,
      handler: async (response: any) => {
        // Verify payment with backend
        try {
          const verifiedPayment = await verifyPayment(paymentId!, {
            gateway: 'razorpay',
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature
          })
          
          onSuccess(verifiedPayment._id, verifiedPayment.paymentNumber)
          toast.success('Payment successful!')
        } catch (error) {
          onError?.('Payment verification failed')
        }
      },
      prefill: {
        name: session?.user?.name,
        email: session?.user?.email,
        contact: session?.user?.phone,
      },
      theme: {
        color: '#4f46e5',
      },
      modal: {
        ondismiss: () => {
          onCancel?.()
        },
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  // Render Stripe form if ready
  if (paymentState.status === 'ready' && selectedMethodConfig.gateway === 'stripe' && paymentState.clientSecret) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Complete Card Payment</h3>
          <button
            onClick={() => setPaymentState({ status: 'idle' })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to methods
          </button>
        </div>
        <Elements stripe={stripePromise} options={{ clientSecret: paymentState.clientSecret }}>
          <StripeCardForm
            amount={amount}
            paymentIntentId={paymentState.gatewayOrder.id}
            clientSecret={paymentState.clientSecret}
            paymentId={paymentState.paymentId!}
            onSuccess={onSuccess}
            onError={onError || (() => {})}
          />
        </Elements>
      </div>
    )
  }

  // Render Razorpay button if ready
  if (paymentState.status === 'ready' && selectedMethodConfig.gateway === 'razorpay') {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600 mb-3">You'll be redirected to Razorpay secure checkout</p>
          <Button
            onClick={handleRazorpayPayment}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 text-base"
          >
            Complete Payment ₹{amount.toLocaleString()}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <button
            onClick={() => setPaymentState({ status: 'idle' })}
            className="text-sm text-gray-400 hover:text-gray-600 mt-3"
          >
            ← Choose different method
          </button>
        </div>
      </div>
    )
  }

  // Render payment method selection
  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div className="grid gap-3">
        {paymentMethodsConfig.map((method) => {
          const Icon = method.icon
          const isSelected = selectedMethod === method.id
          const isDisabled = method.gateway === 'stripe' && !stripePromise
          
          return (
            <button
              key={method.id}
              onClick={() => !isDisabled && setSelectedMethod(method.id)}
              disabled={isDisabled}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-indigo-500' : 'bg-gray-100'
              }`}>
                <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-semibold ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {method.name}
                </p>
                <p className="text-xs text-gray-400">{method.description}</p>
              </div>
              {isSelected && <CheckCircle className="h-5 w-5 text-indigo-600" />}
              {method.gateway === 'razorpay' && (
                <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                  Razorpay
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Proceed Button */}
      <Button
        onClick={handleInitiatePayment}
        disabled={isProcessing || paymentState.status === 'processing' || (selectedMethodConfig.gateway === 'stripe' && !stripePromise) || (selectedMethodConfig.gateway === 'razorpay' && !isRazorpayLoaded)}
        className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg"
      >
        {isProcessing || paymentState.status === 'processing' ? (
          <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Initializing...</>
        ) : (
          <>Proceed with {selectedMethodConfig.name} • ₹{amount.toLocaleString()}</>
        )}
      </Button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-2">
        <span className="flex items-center gap-1">🔒 256-bit SSL</span>
        <span>•</span>
        <span className="flex items-center gap-1">💳 PCI DSS Level 1</span>
        <span>•</span>
        <span className="flex items-center gap-1">🛡️ Fraud Protection</span>
      </div>
    </div>
  )
}