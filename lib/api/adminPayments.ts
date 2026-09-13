/**
 * frontend/lib/api/adminPayments.ts
 *
 * Typed client for the admin Payments section.
 *
 * Uses the shared axios instance from lib/api/client.ts, which already sets the
 * base path to /api/v1 and injects the NextAuth bearer token — so there is no
 * second client to keep in sync.
 *
 * Backend responses are wrapped by utils/ApiResponse.js as
 * `{ success, message, timestamp, data }`. Every function here unwraps that and
 * returns only `data`, throwing an Error carrying the server's message (and
 * status) when the call fails, so React Query surfaces something readable.
 */
import apiClient from './client'
import type {
  ApiEnvelope,
  CreatePayoutPayload,
  LedgerListResult,
  LedgerSummary,
  PayableVendorListResult,
  Payment,
  PaymentAnalytics,
  PaymentListFilters,
  PaymentListResult,
  PaymentStats,
  Payout,
  PayoutDetailResult,
  PayoutListFilters,
  PayoutListResult,
  PayoutOverview,
  PayoutReceiptResult,
  ProcessRefundPayload,
  RefundListResult,
  TaxSummaryResult,
} from '@/types/admin-payments.types'

/** Strip empty params so they never reach the query string as `?status=`. */
function clean(params?: Record<string, unknown>): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  )
  if (entries.length === 0) return undefined
  return Object.fromEntries(entries) as Record<string, string | number | boolean>
}

/** Attach the server's status code and message to the thrown Error. */
function toError(error: unknown): never {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: { message?: string } } }).response
    const message = response?.data?.message || 'Request failed'
    const wrapped = new Error(message) as Error & { status?: number }
    wrapped.status = response?.status
    throw wrapped
  }
  throw error instanceof Error ? error : new Error('Request failed')
}

async function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  try {
    const res = await apiClient.get<ApiEnvelope<T>>(path, { params: clean(params) })
    if (!res.data?.success || res.data.data === undefined) {
      throw new Error(res.data?.message || 'Empty response from server')
    }
    return res.data.data
  } catch (error) {
    return toError(error)
  }
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  try {
    const res = await apiClient.post<ApiEnvelope<T>>(path, body ?? {})
    if (!res.data?.success || res.data.data === undefined) {
      throw new Error(res.data?.message || 'Empty response from server')
    }
    return res.data.data
  } catch (error) {
    return toError(error)
  }
}

// ── Payments ─────────────────────────────────────────────────────────────────

export const adminPaymentsApi = {
  /** GET /payments/admin/all — every payment, with filters and status totals. */
  listPayments: (filters: PaymentListFilters = {}) =>
    get<PaymentListResult>('/payments/admin/all', { ...filters }),

  /** GET /payments/admin/all — a page of payments for the current filter shape. */
  getPaymentById: async (id: string): Promise<Payment> => {
    const result = await get<Payment>(`/payments/${id}`)
    return result
  },

  /** GET /admin/payments/stats — platform payment KPIs. */
  getStats: (period?: string) => get<PaymentStats>('/admin/payments/stats', { period }),

  /** POST /payments/admin/:id/refund */
  processRefund: (paymentId: string, payload: ProcessRefundPayload) =>
    post<{ payment: Payment }>(`/payments/admin/${paymentId}/refund`, payload),

  // ── Refunds ────────────────────────────────────────────────────────────────

  /** GET /payments/admin/refunds */
  listRefunds: (filters: { page?: number; limit?: number; vendor?: string; search?: string; startDate?: string; endDate?: string } = {}) =>
    get<RefundListResult>('/payments/admin/refunds', { ...filters }),

  // ── Tax ────────────────────────────────────────────────────────────────────

  /** GET /payments/admin/tax-summary */
  getTaxSummary: (params: { startDate?: string; endDate?: string } = {}) =>
    get<TaxSummaryResult>('/payments/admin/tax-summary', { ...params }),

  /** GET /payments/admin/analytics */
  getAnalytics: (startDate: string, endDate: string) =>
    get<PaymentAnalytics>('/payments/admin/analytics', { startDate, endDate }),
}

// ── Payouts ──────────────────────────────────────────────────────────────────

export const adminPayoutsApi = {
  /** GET /admin/payouts */
  list: (filters: PayoutListFilters = {}) => get<PayoutListResult>('/admin/payouts', { ...filters }),

  /** GET /admin/payouts/summary */
  getOverview: () => get<PayoutOverview>('/admin/payouts/summary'),

  /** GET /admin/payouts/vendors — vendors with a payable balance. */
  listPayableVendors: (params: { page?: number; limit?: number; search?: string } = {}) =>
    get<PayableVendorListResult>('/admin/payouts/vendors', { ...params }),

  /** GET /admin/payouts/:id */
  getById: (id: string) => get<PayoutDetailResult>(`/admin/payouts/${id}`),

  /** GET /admin/payouts/:id/receipt */
  getReceipt: (id: string) => get<PayoutReceiptResult>(`/admin/payouts/${id}/receipt`),

  /** POST /admin/payouts */
  create: (payload: CreatePayoutPayload) => post<{ payout: Payout }>('/admin/payouts', payload),

  /** POST /admin/payouts/:id/process */
  process: (id: string) => post<{ payout: Payout }>(`/admin/payouts/${id}/process`),

  /** POST /admin/payouts/:id/mark-paid — requires a UTR. */
  markPaid: (id: string, payload: { utr: string; note?: string }) =>
    post<{ payout: Payout }>(`/admin/payouts/${id}/mark-paid`, payload),

  /** POST /admin/payouts/:id/cancel */
  cancel: (id: string, reason: string) =>
    post<{ payout: Payout }>(`/admin/payouts/${id}/cancel`, { reason }),

  // ── Ledger ─────────────────────────────────────────────────────────────────

  /** GET /admin/payouts/ledger */
  listLedger: (
    params: { vendorId: string; page?: number; limit?: number; type?: string; status?: string },
  ) => get<LedgerListResult>('/admin/payouts/ledger', { ...params }),

  /** GET /admin/payouts/ledger/summary */
  getLedgerSummary: (vendorId: string) =>
    get<LedgerSummary>('/admin/payouts/ledger/summary', { vendorId }),

  // ── Maintenance ────────────────────────────────────────────────────────────

  /** POST /admin/payouts/release-earnings — move held earnings into the pool. */
  releaseEarnings: () =>
    post<{ released: number }>('/admin/payouts/release-earnings'),

  /** POST /admin/payouts/sweep-payments — expire abandoned payments. */
  sweepPayments: (timeoutMinutes?: number) =>
    post<{ cancelled: Array<{ paymentId: string }>; needsReconciliation: Array<{ paymentId: string }> }>(
      '/admin/payouts/sweep-payments',
      timeoutMinutes ? { timeoutMinutes } : {},
    ),
}
