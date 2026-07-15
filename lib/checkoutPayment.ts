

// lib/checkoutPayment.ts

/**
 * Load Razorpay script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      console.error('Failed to load Razorpay script')
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

/**
 * Map UI payment method to API expected format
 */
export const mapUiPaymentMethodToApi = (uiMethod: string): string => {
  const methodMap: Record<string, string> = {
    card: 'credit_card',
    upi: 'upi',
    netbanking: 'net_banking',
    wallet: 'wallet',
  }
  return methodMap[uiMethod] || 'credit_card'
}

/**
 * Check if Razorpay payment details are ready
 */
export const isRazorpayPaymentDetailsReady = (
  selectedMethod: string,
  fieldValues: Record<string, string>
): boolean => {
  switch (selectedMethod) {
    case 'upi':
      return !!(fieldValues.upiId && fieldValues.upiId.includes('@'))
    case 'netbanking':
      return !!fieldValues.bank
    case 'wallet':
      return !!fieldValues.wallet
    case 'card':
      // For card, we'll let Stripe handle validation
      return true
    default:
      return true
  }
}

/**
 * Compute total payable from cart
 */
export const computeRentalPayableFromCart = (cart: any) => {
  const subtotal = cart.summary.grandTotal || 0
  const securityDeposit = cart.summary.securityDepositTotal || 0
  const deliveryCharges = cart.summary.deliveryChargesTotal || 0
  const platformFee = 49
  const tax = Math.round(subtotal * 0.18)
  
  const total = subtotal + securityDeposit + deliveryCharges + platformFee + tax
  
  return {
    subtotal,
    securityDeposit,
    deliveryCharges,
    platformFee,
    tax,
    total,
  }
}

/**
 * Format amount for display
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
