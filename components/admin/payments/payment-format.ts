/**
 * frontend/components/admin/payments/payment-format.ts
 *
 * Formatting and status metadata shared by every page in the admin Payments
 * section, so a rupee amount or a status pill looks identical everywhere.
 *
 * Note on currency: lib/utils.ts already exports `formatPrice`, but it forces 0
 * decimal places. That is fine for catalogue prices and wrong for money here —
 * a commission of ₹333.33 or a tax of ₹1,799.82 must not be displayed as ₹333 or
 * ₹1,800 on a payout receipt. `formatCurrency` below therefore keeps paise and
 * drops them only for the compact forms used inside KPI cards.
 */

/** ₹1,23,456.78 — full precision, Indian digit grouping. */
export function formatCurrency(value: number | null | undefined, options?: { decimals?: number }): string {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0
  const decimals = options?.decimals ?? 2
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

/**
 * ₹1.23L / ₹4.5Cr — for KPI cards where the exact paise are noise.
 * Falls back to the full form below ₹1,000 so small values stay precise.
 */
export function formatCompactCurrency(value: number | null | undefined): string {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0
  const abs = Math.abs(amount)

  if (abs < 1000) return formatCurrency(amount)
  if (abs < 100000) {
    return `₹${(amount / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}K`
  }
  if (abs < 10000000) {
    return `₹${(amount / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })}L`
  }
  return `₹${(amount / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })}Cr`
}

/** A plain integer count with Indian grouping. */
export function formatNumber(value: number | null | undefined): string {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat('en-IN').format(amount)
}

/** 12 Sep 2026, 4:32 pm */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

/** 12 Sep 2026 */
export function formatDateOnly(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/** 12 Sep (same year) or 12 Sep 2025 — for dense table cells. */
export function formatDateShort(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(date)
}

/** `YYYY-MM-DD` for date inputs, in local time (not UTC-shifted). */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** First day of the current month, as a date-input value. */
export function startOfMonthValue(): string {
  const now = new Date()
  return toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1))
}

/** Today, as a date-input value. */
export function todayValue(): string {
  return toDateInputValue(new Date())
}

/** Human label for an enum value: security_deposit -> Security deposit */
export function humanise(value: string | null | undefined): string {
  if (!value) return '—'
  const spaced = value.replace(/[_-]+/g, ' ').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

// ── Status metadata ──────────────────────────────────────────────────────────

export interface StatusMeta {
  label: string
  /** Tailwind classes for the pill. */
  className: string
  /** Tailwind classes for a solid dot, used in the mobile card list. */
  dotClassName: string
}

const NEUTRAL: StatusMeta = {
  label: 'Unknown',
  className: 'bg-slate-100 text-slate-700 ring-slate-200',
  dotClassName: 'bg-slate-400',
}

export const PAYMENT_STATUS_META: Record<string, StatusMeta> = {
  success: {
    label: 'Success',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dotClassName: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    dotClassName: 'bg-amber-500',
  },
  processing: {
    label: 'Processing',
    className: 'bg-sky-50 text-sky-700 ring-sky-200',
    dotClassName: 'bg-sky-500',
  },
  failed: {
    label: 'Failed',
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
    dotClassName: 'bg-rose-500',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-violet-50 text-violet-700 ring-violet-200',
    dotClassName: 'bg-violet-500',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
    dotClassName: 'bg-slate-400',
  },
}

/**
 * Payout statuses. `pending` is deliberately amber rather than neutral: while
 * the gateway transfer flag is off, pending is the state that needs a human.
 */
export const PAYOUT_STATUS_META: Record<string, StatusMeta> = {
  pending: {
    label: 'Awaiting transfer',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    dotClassName: 'bg-amber-500',
  },
  processing: {
    label: 'Processing',
    className: 'bg-sky-50 text-sky-700 ring-sky-200',
    dotClassName: 'bg-sky-500',
  },
  paid: {
    label: 'Paid',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dotClassName: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed',
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
    dotClassName: 'bg-rose-500',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
    dotClassName: 'bg-slate-400',
  },
}

export const LEDGER_STATUS_META: Record<string, StatusMeta> = {
  pending: {
    label: 'In hold period',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    dotClassName: 'bg-amber-500',
  },
  available: {
    label: 'Available',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dotClassName: 'bg-emerald-500',
  },
  settled: {
    label: 'Settled',
    className: 'bg-sky-50 text-sky-700 ring-sky-200',
    dotClassName: 'bg-sky-500',
  },
  reversed: {
    label: 'Reversed',
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
    dotClassName: 'bg-rose-500',
  },
}

export const LEDGER_TYPE_META: Record<string, StatusMeta> = {
  earning: {
    label: 'Earning',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dotClassName: 'bg-emerald-500',
  },
  commission: {
    label: 'Commission',
    className: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    dotClassName: 'bg-indigo-500',
  },
  platform_fee: {
    label: 'Platform fee',
    className: 'bg-violet-50 text-violet-700 ring-violet-200',
    dotClassName: 'bg-violet-500',
  },
  tax: {
    label: 'Tax',
    className: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    dotClassName: 'bg-cyan-500',
  },
  refund: {
    label: 'Refund',
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
    dotClassName: 'bg-rose-500',
  },
  adjustment: {
    label: 'Adjustment',
    className: 'bg-slate-100 text-slate-700 ring-slate-200',
    dotClassName: 'bg-slate-400',
  },
  payout: {
    label: 'Payout',
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
    dotClassName: 'bg-blue-500',
  },
  reversal: {
    label: 'Reversal',
    className: 'bg-orange-50 text-orange-700 ring-orange-200',
    dotClassName: 'bg-orange-500',
  },
}

export function getStatusMeta(
  kind: 'payment' | 'payout' | 'ledger' | 'ledgerType',
  status: string | null | undefined,
): StatusMeta {
  if (!status) return NEUTRAL
  const map =
    kind === 'payment'
      ? PAYMENT_STATUS_META
      : kind === 'payout'
        ? PAYOUT_STATUS_META
        : kind === 'ledgerType'
          ? LEDGER_TYPE_META
          : LEDGER_STATUS_META
  return map[status] || NEUTRAL
}
