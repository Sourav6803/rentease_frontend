/**
 * frontend/lib/api/queryKeys.ts
 *
 * Centralised React Query key registry.
 *
 * These keys are intentionally shared: any hook that needs the vendor's own
 * profile must use `vendorQueryKeys.profile` so that React Query dedupes the
 * requests into a single in-flight fetch + a single cache entry, no matter how
 * many components ask for it (sidebar, header, layout, settings pages).
 */

export const vendorQueryKeys = {
  /**
   * GET /api/v1/vendor/profile/me
   * The full vendor document. Used by the vendor layout, sidebar, header and
   * every vendor settings page.
   */
  profile: ['vendor', 'profile', 'me'] as const,

  /** GET /api/v1/vendor/dashboard */
  dashboard: ['vendor', 'dashboard'] as const,

  /** GET /api/v1/notifications/unread/count */
  unreadCount: ['notifications', 'unread', 'count'] as const,

  /**
   * GET /api/v1/deliveries/vendor/me — the vendor delivery list.
   * A root key only: the page appends its current filter object, and mutations
   * invalidate the whole root so every filtered view refreshes.
   */
  deliveries: ['vendor', 'deliveries'] as const,

  /**
   * /api/v1/vendor/customers — the vendor customer directory.
   * A root key only: the page appends its filter object, and the detail query is
   * nested under the same root so one invalidation refreshes both.
   */
  customers: ['vendor', 'customers'] as const,
} as const

export type VendorQueryKey = (typeof vendorQueryKeys)[keyof typeof vendorQueryKeys]

/**
 * Admin Payments section (/admin/payments/*).
 *
 * Each list key is a ROOT that the page extends with its current filter object,
 * so a mutation can invalidate the whole family with one call
 * (`invalidateQueries({ queryKey: adminPaymentQueryKeys.payments })`) and every
 * filtered view refreshes — the same pattern used for vendor deliveries.
 */
export const adminPaymentQueryKeys = {
  /** GET /api/v1/payments/admin/all — root, extended with filters by the page. */
  payments: ['admin', 'payments', 'list'] as const,

  /** GET /api/v1/admin/payments/stats */
  paymentStats: ['admin', 'payments', 'stats'] as const,

  /** GET /api/v1/payments/admin/analytics */
  paymentAnalytics: ['admin', 'payments', 'analytics'] as const,

  /** GET /api/v1/payments/admin/refunds */
  refunds: ['admin', 'payments', 'refunds'] as const,

  /** GET /api/v1/payments/admin/tax-summary */
  taxSummary: ['admin', 'payments', 'tax-summary'] as const,
} as const

export const adminPayoutQueryKeys = {
  /** GET /api/v1/admin/payouts */
  payouts: ['admin', 'payouts', 'list'] as const,

  /** GET /api/v1/admin/payouts/summary */
  overview: ['admin', 'payouts', 'overview'] as const,

  /** GET /api/v1/admin/payouts/vendors */
  payableVendors: ['admin', 'payouts', 'vendors'] as const,

  /** GET /api/v1/admin/payouts/:id */
  detail: (id: string) => ['admin', 'payouts', 'detail', id] as const,

  /** GET /api/v1/admin/payouts/:id/receipt */
  receipt: (id: string) => ['admin', 'payouts', 'receipt', id] as const,

  /** GET /api/v1/admin/payouts/ledger — extended with { vendorId, ... }. */
  ledger: ['admin', 'payouts', 'ledger'] as const,

  /** GET /api/v1/admin/payouts/ledger/summary */
  ledgerSummary: (vendorId: string) => ['admin', 'payouts', 'ledger', 'summary', vendorId] as const,
} as const

export type AdminPaymentQueryKey =
  (typeof adminPaymentQueryKeys)[keyof typeof adminPaymentQueryKeys]
export type AdminPayoutQueryKey =
  (typeof adminPayoutQueryKeys)[keyof typeof adminPayoutQueryKeys]
