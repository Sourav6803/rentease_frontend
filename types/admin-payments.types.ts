/**
 * frontend/types/admin-payments.types.ts
 *
 * Types for the admin Payments section (/admin/payments/*).
 *
 * Every shape here mirrors what the backend actually returns, so the pages can
 * stay free of `any`. Backend responses are wrapped as
 * `{ success, message, timestamp, data }` by utils/ApiResponse.js — the API layer
 * in lib/api/adminPayments.ts unwraps that envelope and hands the `data` part to
 * these types.
 *
 * Money is always a rupee `number` (never a formatted string), formatted at the
 * edge with formatCurrency().
 */

/** The standard success envelope from utils/ApiResponse.js */
export interface ApiEnvelope<T> {
  success: boolean
  message: string
  timestamp?: string
  data: T
  meta?: unknown
}

/** Pagination block returned alongside every list. */
export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

/** A { count, amount } bucket, used by the payment and payout KPIs. */
export interface AmountBucket {
  count: number
  amount: number
}

// ── Payments ─────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'refunded'
  | 'cancelled'

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'upi'
  | 'net_banking'
  | 'wallet'
  | 'cash'
  | 'bank_transfer'

export type PaymentType =
  | 'security_deposit'
  | 'rent'
  | 'delivery'
  | 'late_fee'
  | 'damage_charge'
  | 'extension'
  | 'refund'

export type PaymentGateway = 'razorpay' | 'stripe'

/** The fee split stored on paymentDetails.breakdown. */
export interface PaymentBreakdown {
  baseAmount?: number
  discount?: number
  taxableAmount?: number
  commissionRate?: number | null
  commissionType?: 'percentage' | 'fixed'
  commissionSource?: string
  commission?: number
  platformFee?: number
  platformFeeType?: string
  taxRate?: number
  tax?: number
  convenienceFee?: number
  total?: number
  vendorNet?: number
  platformNet?: number
}

/** Populated `user` on a payment. */
export interface PaymentUserRef {
  _id: string
  email?: string
  phone?: string
  profile?: {
    firstName?: string
    lastName?: string
  }
}

/** Populated `rental` on a payment. */
export interface PaymentRentalRef {
  _id: string
  rentalNumber?: string
  startDate?: string
  endDate?: string
}

/** Populated `vendor` on a payment (a Vendor document, not a User). */
export interface PaymentVendorRef {
  _id: string
  vendorId?: string
  business?: {
    name?: string
  }
}

export interface Payment {
  _id: string
  paymentNumber: string
  user?: PaymentUserRef | string
  rental?: PaymentRentalRef | string
  vendor?: PaymentVendorRef | string
  amount: number
  type: PaymentType
  method: PaymentMethod
  status: PaymentStatus
  paymentDetails?: {
    gateway?: PaymentGateway
    breakdown?: PaymentBreakdown
    cardLast4?: string
    cardBrand?: string
    upiId?: string
    bankName?: string
    transactionId?: string
    referenceNumber?: string
    razorpayPaymentId?: string
    razorpayOrderId?: string
  }
  timestamps?: {
    initiated?: string
    processed?: string
    completed?: string
    failed?: string
    refunded?: string
  }
  failureReason?: string
  refundDetails?: {
    amount?: number
    reason?: string
    processedBy?: string
    processedAt?: string
    transactionId?: string
  }
  receipt?: {
    url?: string
    generatedAt?: string
    sentToEmail?: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface PaymentTotals {
  totalCollected: number
  successfulPayments: number
  pending: AmountBucket
  failed: AmountBucket
  refunded: AmountBucket
  averageTicket: number
  grandTotal: number
  byStatus: Record<string, AmountBucket>
}

export interface PaymentListResult {
  payments: Payment[]
  totals: PaymentTotals
  pagination: Pagination
}

export interface PaymentListFilters {
  page?: number
  limit?: number
  status?: PaymentStatus | ''
  method?: PaymentMethod | ''
  type?: PaymentType | ''
  gateway?: PaymentGateway | ''
  vendor?: string
  user?: string
  rental?: string
  search?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  refunded?: boolean
}

/** GET /admin/payments/stats (adminController.getPaymentStats) */
export interface PaymentStats {
  totalAmount?: number
  totalPayments?: number
  successful?: number
  pending?: number
  failed?: number
  byStatus?: Record<string, number>
  [key: string]: unknown
}

/** GET /payments/admin/analytics */
export interface PaymentAnalytics {
  overview?: Array<{
    totalRevenue: number
    totalTransactions: number
    averageTransaction: number
  }>
  byGateway?: Array<{ _id: string | null; count: number; amount: number }>
  byMethod?: Array<{ _id: string | null; count: number; amount: number }>
  byType?: Array<{ _id: string | null; count: number; amount: number }>
  dailyRevenue?: Array<{
    _id: { year: number; month: number; day: number }
    revenue: number
    transactions: number
  }>
}

// ── Refunds ──────────────────────────────────────────────────────────────────

export interface RefundTotals {
  refundedAmount: number
  originalAmount: number
  refundCount: number
  /** Percentage of everything ever charged that has been refunded. */
  refundRate: number
}

export interface RefundListResult {
  refunds: Payment[]
  totals: RefundTotals
  pagination: Pagination
}

export interface ProcessRefundPayload {
  amount: number
  reason: string
}

// ── Tax summary ──────────────────────────────────────────────────────────────

export interface TaxSummaryBlock {
  taxableBase: number
  tax: number
  commission: number
  platformFee: number
  convenienceFee: number
  discount: number
  grossCollected: number
  transactions: number
  paymentsWithBreakdown: number
  /**
   * Legacy payments recorded before the fee engine existed. Surfaced so the UI
   * can warn that the period's figures are incomplete rather than implying they
   * are exact.
   */
  paymentsWithoutBreakdown: number
  effectiveTaxRate: number
}

export interface TaxSummaryMonth {
  year: number
  month: number
  label: string
  taxableBase: number
  tax: number
  commission: number
  platformFee: number
  grossCollected: number
  transactions: number
}

export interface TaxSummaryResult {
  summary: TaxSummaryBlock
  monthly: TaxSummaryMonth[]
}

// ── Payouts ──────────────────────────────────────────────────────────────────

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled'

export type PayoutMethod = 'razorpay_payout' | 'bank_transfer' | 'upi' | 'manual'

export interface PayoutDeductions {
  grossAmount: number
  commission: number
  platformFee: number
  tax: number
  processingFee: number
  netAmount: number
}

export interface PayoutBankSnapshot {
  accountHolderName?: string
  accountNumberMasked?: string
  ifscCode?: string
  bankName?: string
  upiId?: string
}

export interface Payout {
  _id: string
  payoutNumber: string
  vendor?: PaymentVendorRef | string
  amount: number
  currency: string
  method: PayoutMethod
  status: PayoutStatus
  periodStart?: string
  periodEnd?: string
  entryIds?: string[]
  deductions?: PayoutDeductions
  bankAccountSnapshot?: PayoutBankSnapshot
  gateway?: {
    payoutId?: string
    utr?: string
    failureReason?: string
    attemptedAt?: string
    attempts?: number
  }
  /**
   * True when gateway payouts are switched off and this payout must be settled by
   * finance manually. The UI must never present such a payout as transferred.
   */
  requiresManualTransfer?: boolean
  requestedBy?: string
  processedBy?: string
  processedAt?: string
  cancelledBy?: string
  cancelledAt?: string
  cancellationReason?: string
  receiptNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PayoutListResult {
  payouts: Payout[]
  pagination: Pagination
}

export interface PayoutListFilters {
  page?: number
  limit?: number
  status?: PayoutStatus | ''
  vendorId?: string
  requiresManualTransfer?: boolean
}

export interface PayoutOverview {
  totalAvailable: number
  totalPending: number
  totalReserved: number
  availableEntries: number
  pendingEntries: number
  payoutsByStatus: Record<string, AmountBucket>
  pendingPayouts: AmountBucket
  processingPayouts: AmountBucket
  failedPayouts: AmountBucket
  cancelledPayouts: AmountBucket
  paidPayouts: AmountBucket
  paidThisMonth: AmountBucket
  needsManualTransfer: number
  razorpayPayoutEnabled: boolean
  minPayoutAmount: number
  holdDays: number
}

/** A vendor row in the create-payout picker. */
export interface PayableVendor {
  vendorId: string
  vendorCode?: string
  businessName: string
  availableBalance: number
  pendingBalance: number
  reservedBalance: number
  entryCount: number
  lastEarningAt?: string
  holdDays: number
  minPayoutAmount: number
  hasPayoutDestination: boolean
  payoutMethod: 'upi' | 'bank_transfer' | null
  /** UPI handle on file — the destination used when payoutMethod is 'upi'. */
  upiId?: string | null
  bankName?: string | null
  accountNumberMasked?: string
  /** available >= minPayoutAmount AND a destination exists on file. */
  isPayable: boolean
  belowMinimum: boolean
}

export interface PayableVendorListResult {
  vendors: PayableVendor[]
  pagination: Pagination
}

export interface CreatePayoutPayload {
  vendorId: string
  periodStart?: string
  periodEnd?: string
  notes?: string
}

export interface PayoutDetailResult {
  payout: Payout
  entries: LedgerEntry[]
}

export interface PayoutReceiptResult {
  payout: Payout
  entries: LedgerEntry[]
  receiptNumber: string
  generatedAt: string
  isPaid: boolean
}

// ── Ledger ───────────────────────────────────────────────────────────────────

export type LedgerType =
  | 'earning'
  | 'commission'
  | 'platform_fee'
  | 'tax'
  | 'refund'
  | 'adjustment'
  | 'payout'
  | 'reversal'

export type LedgerDirection = 'credit' | 'debit'

/**
 * pending   -> still inside the hold window
 * available -> payable
 * settled   -> already paid out
 * reversed  -> undone by a refund
 */
export type LedgerStatus = 'pending' | 'available' | 'settled' | 'reversed'

export interface LedgerEntry {
  _id: string
  vendor: string
  rental?: string
  payment?: string
  payout?: string | null
  type: LedgerType
  direction: LedgerDirection
  amount: number
  currency: string
  status: LedgerStatus
  availableAt?: string
  settledAt?: string
  description?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface LedgerListResult {
  entries: LedgerEntry[]
  pagination: Pagination
}

export interface LedgerSummary {
  availableBalance: number
  pendingBalance: number
  lifetimeEarned: number
  lifetimePaidOut: number
  lifetimeRefunded: number
  holdDays: number
  minPayoutAmount: number
  razorpayPayoutEnabled: boolean
}

// ── Shared UI helpers ────────────────────────────────────────────────────────

/** Normalise a populated-or-id reference down to its populated form, if any. */
export function asPopulated<T>(value: T | string | undefined): T | null {
  if (!value || typeof value === 'string') return null
  return value
}

/** Customer display name, tolerating a missing or unpopulated user. */
export function paymentCustomerName(payment: Payment): string {
  const user = asPopulated(payment.user)
  if (!user) return 'Unknown customer'
  const first = user.profile?.firstName?.trim()
  const last = user.profile?.lastName?.trim()
  const full = [first, last].filter(Boolean).join(' ')
  return full || user.email || 'Unknown customer'
}

/** Vendor business name, tolerating a missing or unpopulated vendor. */
export function paymentVendorName(payment: Payment | Payout): string {
  const vendor = asPopulated(payment.vendor as PaymentVendorRef | string | undefined)
  if (!vendor) return 'Unassigned'
  return vendor.business?.name || vendor.vendorId || 'Unnamed vendor'
}
