// src/app/admin/settings/payments/types/payment.types.ts

export interface RazorpaySettings {
  keyId: string
  keySecret: string
  webhookSecret: string
  enabled: boolean
  testMode: boolean
}

export interface StripeSettings {
  publishableKey: string
  secretKey: string
  webhookSecret: string
  enabled: boolean
  testMode: boolean
}

export interface CommissionSettings {
  defaultRate: number
  maxRate: number
  minRate: number
  type: 'percentage' | 'fixed'
  vendorTiers: Array<{
    minRentals: number
    maxRentals: number
    rate: number
  }>
  categoryRates: Array<{
    categoryId: string
    categoryName: string
    rate: number
  }>
}

export interface PayoutSettings {
  schedule: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  minimumAmount: number
  processingFee: number
  taxRate: number
  autoPayout: boolean
  payoutDay?: number
  holdPeriod: number // days
  /** Master switch for gateway payouts. While false every payout falls back to manual transfer. */
  razorpayPayoutEnabled: boolean
  /** RazorpayX source account number that payouts are debited from. */
  razorpayAccount: string
  /** RazorpayX key id. Read back in clear so the operator can see which key is live. */
  keyId: string
  /**
   * RazorpayX key secret. The API never returns the real value — it reads back as
   * '***' once set, and submitting '***' means "keep the stored secret".
   */
  keySecret: string
  /**
   * Operator intent for the payout environment. Defaults to true. The gateway
   * environment is decided by the key prefix, not this flag, so a live key here
   * still means live — the backend re-derives it and refuses live payouts against
   * test-derived earnings.
   */
  testMode: boolean
}

export interface RefundSettings {
  autoRefundPeriod: number // days
  maxRefundAmount: number
  refundReasonRequired: boolean
  approvalRequired: boolean
  refundFee: number
}

export interface PaymentTransaction {
  _id: string
  transactionId: string
  orderId: string
  amount: number
  currency: string
  status: 'success' | 'failed' | 'pending' | 'refunded'
  method: 'razorpay' | 'stripe' | 'cash' | 'upi'
  customer: {
    name: string
    email: string
    phone: string
  }
  createdAt: string
  refundedAmount?: number
  refundReason?: string
}

export interface PaymentStats {
  totalTransactions: number
  totalAmount: number
  successRate: number
  averageTransaction: number
  dailyStats: Array<{
    date: string
    count: number
    amount: number
  }>
  methodBreakdown: Array<{
    method: string
    count: number
    amount: number
  }>
}