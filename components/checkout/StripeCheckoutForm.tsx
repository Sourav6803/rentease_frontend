// 'use client'

// import { useMemo, useState } from 'react'
// import { loadStripe } from '@stripe/stripe-js'
// import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
// import { Button } from '@/components/ui/button'
// import { Loader2 } from 'lucide-react'

// const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

// function InnerForm({
//   onPaid,
//   onError,
// }: {
//   onPaid: (paymentIntentId: string) => void
//   onError: (msg: string) => void
// }) {
//   const stripe = useStripe()
//   const elements = useElements()
//   const [complete, setComplete] = useState(false)
//   const [submitting, setSubmitting] = useState(false)

//   const handlePay = async () => {
//     if (!stripe || !elements) return
//     setSubmitting(true)
//     try {
//       const { error, paymentIntent } = await stripe.confirmPayment({
//         elements,
//         redirect: 'if_required',
//       })
//       if (error) {
//         onError(error.message || 'Payment could not be completed')
//         return
//       }
//       if (paymentIntent?.status === 'succeeded') {
//         onPaid(paymentIntent.id)
//       } else {
//         onError('Payment was not completed. Please try again.')
//       }
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <div className="space-y-4">
//       <PaymentElement
//         options={{ layout: { type: 'tabs', defaultCollapsed: false } }}
//         onChange={(e) => setComplete(e.complete)}
//       />
//       <p className="text-[11px] text-gray-500">
//         Card, UPI, net banking, and wallets available here are processed securely by Stripe.
//       </p>
//       <Button
//         type="button"
//         className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700"
//         disabled={!stripe || !elements || !complete || submitting}
//         onClick={handlePay}
//       >
//         {submitting ? (
//           <>
//             <Loader2 className="h-4 w-4 animate-spin mr-2" />
//             Processing…
//           </>
//         ) : (
//           'Pay securely'
//         )}
//       </Button>
//     </div>
//   )
// }

// export function StripeCheckoutForm({
//   clientSecret,
//   onPaid,
//   onError,
// }: {
//   clientSecret: string
//   onPaid: (paymentIntentId: string) => void
//   onError: (msg: string) => void
// }) {
//   const stripePromise = useMemo(() => (pk ? loadStripe(pk) : null), [])

//   if (!pk || !stripePromise) {
//     return (
//       <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
//         Stripe is not configured. Set <span className="font-mono text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</span> in
//         your environment.
//       </p>
//     )
//   }

//   return (
//     <Elements
//       stripe={stripePromise}
//       options={{
//         clientSecret,
//         appearance: { theme: 'stripe', variables: { colorPrimary: '#4f46e5' } },
//       }}
//     >
//       <InnerForm onPaid={onPaid} onError={onError} />
//     </Elements>
//   )
// }


// // components/checkout/StripeCheckoutForm.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import {
//   PaymentElement,
//   useStripe,
//   useElements,
//   Elements,
//   AddressElement,
// } from '@stripe/react-stripe-js'
// import { loadStripe } from '@stripe/stripe-js'
// import { Button } from '@/components/ui/button'
// import { Loader2, CreditCard, Smartphone, Building2, Wallet } from 'lucide-react'
// import { toast } from 'sonner'

// // Initialize Stripe
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// interface StripeCheckoutFormProps {
//   clientSecret: string
//   onPaid: (paymentIntentId: string) => Promise<void>
//   onError: (error: string) => void
//   onCancel?: () => void
// }

// // Payment method icons mapping
// const paymentMethodIcons: Record<string, any> = {
//   card: CreditCard,
//   upi: Smartphone,
//   netbanking: Building2,
//   wallet: Wallet,
// }

// function PaymentMethodBadge({ type }: { type: string }) {
//   const Icon = paymentMethodIcons[type] || CreditCard
//   return (
//     <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg text-xs">
//       <Icon className="h-3 w-3 text-gray-500" />
//       <span className="capitalize">{type}</span>
//     </div>
//   )
// }

// function StripePaymentForm({
//   clientSecret,
//   onPaid,
//   onError,
//   onCancel,
// }: StripeCheckoutFormProps) {
//   const stripe = useStripe()
//   const elements = useElements()
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [paymentMethodType, setPaymentMethodType] = useState<string | null>(null)

//   useEffect(() => {
//     // Detect payment method type when available
//     if (elements) {
//       const element = elements.getElement('payment')
//       if (element) {
//         // Listen for payment method changes
//         element.on('change', (event) => {
//           if (event.value?.type) {
//             setPaymentMethodType(event.value.type)
//           }
//         })
//       }
//     }
//   }, [elements])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!stripe || !elements) {
//       onError('Stripe not initialized')
//       return
//     }

//     setIsProcessing(true)

//     try {
//       const { error, paymentIntent } = await stripe.confirmPayment({
//         elements,
//         confirmParams: {
//           return_url: `${window.location.origin}/checkout/success`,
//           payment_method_data: {
//             billing_details: {
//               name: 'Customer',
//             },
//           },
//         },
//         redirect: 'if_required',
//       })

//       if (error) {
//         // Handle specific error types
//         if (error.type === 'card_error' || error.type === 'validation_error') {
//           onError(error.message || 'Payment failed')
//           toast.error(error.message)
//         } else {
//           onError('An unexpected error occurred')
//           toast.error('Payment failed. Please try again.')
//         }
//       } else if (paymentIntent && paymentIntent.status === 'succeeded') {
//         toast.success('Payment successful!')
//         await onPaid(paymentIntent.id)
//       }
//     } catch (err) {
//       onError('Payment processing failed')
//       toast.error('Failed to process payment')
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto">
//       {/* Payment Method Display */}
//       {paymentMethodType && (
//         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
//           <div className="flex items-center gap-2">
//             <PaymentMethodBadge type={paymentMethodType} />
//             <span className="text-sm text-gray-600">will be used for payment</span>
//           </div>
//           <button
//             type="button"
//             onClick={() => {
//               const element = elements?.getElement('payment')
//               if (element && 'focus' in element) {
//                 ;(element as any).focus()
//               }
//             }}
//             className="text-xs text-indigo-600 hover:text-indigo-700"
//           >
//             Change
//           </button>
//         </div>
//       )}

//       {/* Stripe Payment Element - FIXED CONFIGURATION */}
//       <div className="border rounded-xl p-4 bg-white">
//         <PaymentElement
//           options={{
//             layout: {
//               type: 'tabs',
//               defaultCollapsed: false,
//               spacedAccordionItems: false,
//               radios: 'if_multiple', // Fixed: string value, not boolean
//             },
//             business: {
//               name: 'RentEase',
//             },
//             paymentMethodOrder: ['card', 'upi', 'netbanking', 'wallet'],
//             wallets: {
//               applePay: 'auto',
//               googlePay: 'auto',
//             },
//           }}
//         />
//       </div>

//       {/* Optional: Add address collection for delivery */}
//       {/* <div className="border-t pt-4">
//         <label className="text-sm font-medium text-gray-700 mb-2 block">
//           Delivery Address (Optional)
//         </label>
//         <AddressElement
//           options={{
//             mode: 'shipping',
//             allowedCountries: ['IN'],
//             fields: {
//               phone: 'always',
//             },
//             validation: {
//               phone: {
//                 required: 'always',
//               },
//             },
//           }}
//         />
//       </div> */}

//       {/* Actions */}
//       <div className="flex gap-3 pt-4">
//         {onCancel && (
//           <Button
//             type="button"
//             variant="outline"
//             onClick={onCancel}
//             className="flex-1 rounded-xl"
//             disabled={isProcessing}
//           >
//             Cancel
//           </Button>
//         )}
//         <Button
//           type="submit"
//           disabled={!stripe || !elements || isProcessing}
//           className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-base"
//         >
//           {isProcessing ? (
//             <>
//               <Loader2 className="h-5 w-5 animate-spin mr-2" />
//               Processing...
//             </>
//           ) : (
//             'Pay Now'
//           )}
//         </Button>
//       </div>

//       {/* Security Notice */}
//       <div className="flex items-center justify-center gap-3 pt-2 text-xs text-gray-400">
//         <span className="flex items-center gap-1">🔒 Secure payment</span>
//         <span>•</span>
//         <span className="flex items-center gap-1">💳 PCI DSS compliant</span>
//         <span>•</span>
//         <span className="flex items-center gap-1">🛡️ Fraud protection</span>
//       </div>
//     </form>
//   )
// }

// // Wrapper component with Elements provider
// export function StripeCheckoutForm(props: StripeCheckoutFormProps) {
//   return (
//     <Elements
//       stripe={stripePromise}
//       options={{
//         clientSecret: props.clientSecret,
//         appearance: {
//           theme: 'stripe',
//           variables: {
//             colorPrimary: '#4f46e5',
//             colorBackground: '#ffffff',
//             colorText: '#1f2937',
//             colorDanger: '#ef4444',
//             fontFamily: 'system-ui, -apple-system, sans-serif',
//             borderRadius: '12px',
//           },
//           rules: {
//             '.Input': {
//               padding: '12px',
//               borderRadius: '12px',
//             },
//             '.Label': {
//               fontSize: '12px',
//               fontWeight: '500',
//               marginBottom: '6px',
//             },
//           },
//         },
//       }}
//     >
//       <StripePaymentForm {...props} />
//     </Elements>
//   )
// }


// components/checkout/StripeCheckoutForm.tsx
// 'use client'

// import { useState } from 'react'
// import {
//   PaymentElement,
//   useStripe,
//   useElements,
//   Elements,
// } from '@stripe/react-stripe-js'
// import { loadStripe } from '@stripe/stripe-js'
// import { Button } from '@/components/ui/button'
// import { Loader2 } from 'lucide-react'
// import { toast } from 'sonner'

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// interface StripeCheckoutFormProps {
//   clientSecret: string
//   onPaid: (paymentIntentId: string) => Promise<void>
//   onError: (error: string) => void
//   onCancel?: () => void
// }

// function StripePaymentForm({
//   onPaid,
//   onError,
//   onCancel,
// }: StripeCheckoutFormProps) {
//   const stripe = useStripe()
//   const elements = useElements()
//   const [isProcessing, setIsProcessing] = useState(false)

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (!stripe || !elements) {
//       onError('Stripe not initialized')
//       return
//     }

//     setIsProcessing(true)

//     try {
//       // Confirm the payment - this will handle 3D Secure automatically
//       const { error, paymentIntent } = await stripe.confirmPayment({
//         elements,
//         confirmParams: {
//           return_url: `${window.location.origin}/checkout/success`,
//           payment_method_data: {
//             billing_details: {
//               name: 'Customer',
//             },
//           },
//         },
//         redirect: 'if_required',
//       })

//       if (error) {
//         // Handle card errors
//         if (error.type === 'card_error' || error.type === 'validation_error') {
//           onError(error.message || 'Payment failed')
//           toast.error(error.message)
//         } else {
//           onError('An unexpected error occurred')
//           toast.error('Payment failed. Please try again.')
//         }
//         setIsProcessing(false)
//         return
//       }

//       // Check payment intent status
//       if (paymentIntent) {
//         switch (paymentIntent.status) {
//           case 'succeeded':
//             toast.success('Payment successful!')
//             await onPaid(paymentIntent.id)
//             break
          
//           case 'processing':
//             toast.info('Payment is processing. We\'ll notify you when complete.')
//             break
          
//           case 'requires_payment_method':
//             onError('Payment failed. Please try another payment method.')
//             toast.error('Payment failed. Please try another payment method.')
//             break
          
//           default:
//             console.log('Payment status:', paymentIntent.status)
//             // Don't show error, Stripe will handle redirect or additional actions
//             break
//         }
//       }
//     } catch (err) {
//       console.error('Payment error:', err)
//       onError('Payment processing failed')
//       toast.error('Failed to process payment')
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="border rounded-xl p-4 bg-white min-h-[300px]">
//         <PaymentElement 
//           options={{
//             layout: 'tabs',
//             defaultValues: {
//               billingDetails: {
//                 name: 'Customer',
//                 email: '',
//               },
//             },
//           }}
//         />
//       </div>

//       <div className="flex gap-3 pt-4">
//         {onCancel && (
//           <Button
//             type="button"
//             variant="outline"
//             onClick={onCancel}
//             className="flex-1 rounded-xl"
//             disabled={isProcessing}
//           >
//             Cancel
//           </Button>
//         )}
//         <Button
//           type="submit"
//           disabled={!stripe || !elements || isProcessing}
//           className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-base"
//         >
//           {isProcessing ? (
//             <>
//               <Loader2 className="h-5 w-5 animate-spin mr-2" />
//               Processing...
//             </>
//           ) : (
//             'Pay Now'
//           )}
//         </Button>
//       </div>

//       {/* Security Notice */}
//       <div className="flex items-center justify-center gap-3 pt-2 text-xs text-gray-400">
//         <span className="flex items-center gap-1">🔒 3D Secure Ready</span>
//         <span>•</span>
//         <span className="flex items-center gap-1">💳 PCI DSS Compliant</span>
//         <span>•</span>
//         <span className="flex items-center gap-1">🛡️ Fraud Protection</span>
//       </div>
//     </form>
//   )
// }

// export function StripeCheckoutForm(props: StripeCheckoutFormProps) {
//   return (
//     <Elements
//       stripe={stripePromise}
//       options={{
//         clientSecret: props.clientSecret,
//         appearance: {
//           theme: 'stripe',
//           variables: {
//             colorPrimary: '#4f46e5',
//             colorBackground: '#ffffff',
//             colorText: '#1f2937',
//             colorDanger: '#ef4444',
//             fontFamily: 'system-ui, -apple-system, sans-serif',
//             borderRadius: '12px',
//           },
//         },
//       }}
//     >
//       <StripePaymentForm {...props} />
//     </Elements>
//   )
// }



// components/checkout/StripeCheckoutForm.tsx
// 'use client'

// import { useState } from 'react'
// import {
//   PaymentElement,
//   useStripe,
//   useElements,
//   Elements,
// } from '@stripe/react-stripe-js'
// import { loadStripe } from '@stripe/stripe-js'
// import { Button } from '@/components/ui/button'
// import { Loader2 } from 'lucide-react'
// import { toast } from 'sonner'

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// interface StripeCheckoutFormProps {
//   clientSecret: string
//   onPaid: (paymentIntentId: string) => Promise<void>
//   onError: (error: string) => void
//   onCancel?: () => void
// }

// function StripePaymentForm({
//   clientSecret,
//   onPaid,
//   onError,
//   onCancel,
// }: StripeCheckoutFormProps) {
//   const stripe = useStripe()
//   const elements = useElements()
//   const [isProcessing, setIsProcessing] = useState(false)

//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault()
    
//   //   if (!stripe || !elements) {
//   //     onError('Stripe not initialized. Please refresh the page.')
//   //     toast.error('Stripe not initialized')
//   //     return
//   //   }

//   //   setIsProcessing(true)

//   //   try {
//   //     console.log('Confirming payment with clientSecret:', clientSecret)
      
//   //     // Confirm the payment - this will handle 3D Secure automatically
//   //     const { error, paymentIntent } = await stripe.confirmPayment({
//   //       elements,
//   //       confirmParams: {
//   //         return_url: `${window.location.origin}/checkout/success`,
//   //         payment_method_data: {
//   //           billing_details: {
//   //             name: 'Customer',
//   //           },
//   //         },
//   //       },
//   //       redirect: 'if_required',
//   //     })

//   //     if (error) {
//   //       console.error('Stripe confirmPayment error:', error)
//   //       // Handle card errors
//   //       if (error.type === 'card_error' || error.type === 'validation_error') {
//   //         onError(error.message || 'Payment failed')
//   //         toast.error(error.message)
//   //       } else {
//   //         onError('An unexpected error occurred')
//   //         toast.error('Payment failed. Please try again.')
//   //       }
//   //       setIsProcessing(false)
//   //       return
//   //     }

//   //     // Check payment intent status
//   //     if (paymentIntent) {
//   //       console.log('Payment intent status:', paymentIntent.status)
        
//   //       switch (paymentIntent.status) {
//   //         case 'succeeded':
//   //           toast.success('Payment successful!')
//   //           await onPaid(paymentIntent.id)
//   //           break
          
//   //         case 'processing':
//   //           toast.info('Payment is processing. We\'ll notify you when complete.')
//   //           // Still call onPaid as the payment is being processed
//   //           await onPaid(paymentIntent.id)
//   //           break
          
//   //         case 'requires_action':
//   //           // Stripe will handle this automatically with the SDK
//   //           console.log('Payment requires additional action (3D Secure)')
//   //           toast.info('Redirecting to your bank for verification...')
//   //           // Don't call onPaid yet, wait for redirect
//   //           break
          
//   //         case 'requires_payment_method':
//   //           onError('Payment failed. Please try another payment method.')
//   //           toast.error('Payment failed. Please try another payment method.')
//   //           break
          
//   //         default:
//   //           console.log('Payment status:', paymentIntent.status)
//   //           break
//   //       }
//   //     }
//   //   } catch (err) {
//   //     console.error('Payment error:', err)
//   //     onError('Payment processing failed')
//   //     toast.error('Failed to process payment')
//   //   } finally {
//   //     // Only set processing to false if not redirecting for 3D Secure
//   //     // For 3D Secure, the component will unmount and we don't want to show processing state
//   //     const paymentIntent = (err as any)?.paymentIntent;
//   //     if (!paymentIntent || paymentIntent.status !== 'requires_action') {
//   //       setIsProcessing(false)
//   //     }
//   //   }
//   // }

//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault()
  
//   if (!stripe || !elements) {
//     onError('Stripe not initialized. Please refresh the page.')
//     toast.error('Stripe not initialized')
//     return
//   }

//   setIsProcessing(true)
//   let paymentIntentStatus: string | undefined

//   try {
//     console.log('Confirming payment with clientSecret:', clientSecret)
    
//     // Confirm the payment - this will handle 3D Secure automatically
//     const { error, paymentIntent } = await stripe.confirmPayment({
//       elements,
//       confirmParams: {
//         return_url: `${window.location.origin}/checkout/success`,
//         payment_method_data: {
//           billing_details: {
//             name: 'Customer',
//           },
//         },
//       },
//       redirect: 'if_required',
//     })

//     if (error) {
//       console.error('Stripe confirmPayment error:', error)
//       // Handle card errors
//       if (error.type === 'card_error' || error.type === 'validation_error') {
//         onError(error.message || 'Payment failed')
//         toast.error(error.message)
//       } else {
//         onError('An unexpected error occurred')
//         toast.error('Payment failed. Please try again.')
//       }
//       setIsProcessing(false)
//       return
//     }

//     // Check payment intent status
//     if (paymentIntent) {
//       paymentIntentStatus = paymentIntent.status
//       console.log('Payment intent status:', paymentIntent.status)
      
//       switch (paymentIntent.status) {
//         case 'succeeded':
//           toast.success('Payment successful!')
//           await onPaid(paymentIntent.id)
//           break
        
//         case 'processing':
//           toast.info('Payment is processing. We\'ll notify you when complete.')
//           // Still call onPaid as the payment is being processed
//           await onPaid(paymentIntent.id)
//           break
        
//         case 'requires_action':
//           // Stripe will handle this automatically with the SDK
//           console.log('Payment requires additional action (3D Secure)')
//           toast.info('Redirecting to your bank for verification...')
//           // Don't call onPaid yet, wait for redirect
//           break
        
//         case 'requires_payment_method':
//           onError('Payment failed. Please try another payment method.')
//           toast.error('Payment failed. Please try another payment method.')
//           break
        
//         default:
//           console.log('Payment status:', paymentIntent.status)
//           break
//       }
//     }
//   } catch (err) {
//     console.error('Payment error:', err)
//     onError('Payment processing failed')
//     toast.error('Failed to process payment')
//   } finally {
//     // Only set processing to false if not redirecting for 3D Secure
//     // For 3D Secure, the component will unmount and we don't want to show processing state
//     if (paymentIntentStatus !== 'requires_action') {
//       setIsProcessing(false)
//     }
//   }
// }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="border rounded-xl p-4 bg-white min-h-[300px]">
//         <PaymentElement 
//           options={{
//             layout: {
//               type: 'tabs',
//               defaultCollapsed: false,
//               radios: 'if_multiple',
//               spacedAccordionItems: false,
//             },
//             defaultValues: {
//               billingDetails: {
//                 name: 'Customer',
//                 email: '',
//               },
//             },
//           }}
//         />
//       </div>

//       <div className="flex gap-3 pt-4">
//         {onCancel && (
//           <Button
//             type="button"
//             variant="outline"
//             onClick={onCancel}
//             className="flex-1 rounded-xl"
//             disabled={isProcessing}
//           >
//             Cancel
//           </Button>
//         )}
//         <Button
//           type="submit"
//           disabled={!stripe || !elements || isProcessing}
//           className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-base"
//         >
//           {isProcessing ? (
//             <>
//               <Loader2 className="h-5 w-5 animate-spin mr-2" />
//               Processing...
//             </>
//           ) : (
//             'Pay Now'
//           )}
//         </Button>
//       </div>

//       {/* Security Notice */}
//       <div className="flex items-center justify-center gap-3 pt-2 text-xs text-gray-400">
//         <span className="flex items-center gap-1">🔒 3D Secure Ready</span>
//         <span>•</span>
//         <span className="flex items-center gap-1">💳 PCI DSS Compliant</span>
//         <span>•</span>
//         <span className="flex items-center gap-1">🛡️ Fraud Protection</span>
//       </div>
//     </form>
//   )
// }

// // Main export - clientSecret is passed to Elements provider
// export function StripeCheckoutForm({ clientSecret, onPaid, onError, onCancel }: StripeCheckoutFormProps) {
//   console.log('StripeCheckoutForm rendering with clientSecret:', clientSecret ? 'present' : 'missing')
  
//   if (!clientSecret) {
//     console.error('StripeCheckoutForm: clientSecret is missing')
//     return (
//       <div className="p-4 text-center text-red-600">
//         Payment configuration error. Please refresh and try again.
//       </div>
//     )
//   }

//   return (
//     <Elements
//       stripe={stripePromise}
//       options={{
//         clientSecret: clientSecret,
//         appearance: {
//           theme: 'stripe',
//           variables: {
//             colorPrimary: '#4f46e5',
//             colorBackground: '#ffffff',
//             colorText: '#1f2937',
//             colorDanger: '#ef4444',
//             fontFamily: 'system-ui, -apple-system, sans-serif',
//             borderRadius: '12px',
//           },
//           rules: {
//             '.Input': {
//               padding: '12px',
//               borderRadius: '12px',
//             },
//             '.Label': {
//               fontSize: '12px',
//               fontWeight: '500',
//               marginBottom: '6px',
//             },
//           },
//         },
//       }}
//     >
//       <StripePaymentForm 
//         clientSecret={clientSecret}
//         onPaid={onPaid}
//         onError={onError}
//         onCancel={onCancel}
//       />
//     </Elements>
//   )
// }


// components/checkout/StripeCheckoutForm.tsx
'use client'

import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutFormProps {
  clientSecret: string
  onPaid: (paymentIntentId: string) => Promise<void>
  onError: (error: string) => void
  onCancel?: () => void
}

function StripePaymentForm({
  clientSecret,
  onPaid,
  onError,
  onCancel,
}: StripeCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      onError('Stripe not initialized. Please refresh the page.')
      toast.error('Stripe not initialized')
      return
    }

    setIsProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        console.error('Stripe error:', error)
        onError(error.message || 'Payment failed')
        toast.error(error.message || 'Payment failed')
        setIsProcessing(false)
        return
      }

      if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          toast.success('Payment successful!')
          await onPaid(paymentIntent.id)
        } else if (paymentIntent.status === 'requires_action') {
          toast.info('Please complete additional verification')
          // Stripe will handle the redirect automatically
        } else {
          onError(`Payment status: ${paymentIntent.status}`)
          setIsProcessing(false)
        }
      }
    } catch (err) {
      console.error('Payment error:', err)
      onError('Payment processing failed')
      toast.error('Failed to process payment')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border rounded-xl p-4 bg-white min-h-[300px]">
        <PaymentElement />
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-xl"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-base"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            'Pay Now'
          )}
        </Button>
      </div>
    </form>
  )
}

export function StripeCheckoutForm(props: StripeCheckoutFormProps) {
  if (!props.clientSecret) {
    return (
      <div className="p-4 text-center text-red-600">
        Payment configuration error. Please refresh and try again.
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#4f46e5',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            borderRadius: '12px',
          },
        },
      }}
    >
      <StripePaymentForm {...props} />
    </Elements>
  )
}