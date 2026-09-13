'use client'

/**
 * frontend/app/(admin)/admin/payments/payouts/page.tsx
 *
 * Admin → Payments → Vendor Payouts.
 *
 * Everything here talks to the live admin payout API through
 * lib/api/adminPayments.ts and @tanstack/react-query — no axios calls, no
 * locally invented money. Two domain rules drive the whole screen:
 *
 *  1. State machine: pending → processing → paid, with failed (retryable) and
 *     cancelled (terminal). The UI only offers the actions the backend accepts
 *     for a given status, because the API answers 409 for anything else.
 *
 *  2. When gateway payouts are switched off (`razorpayPayoutEnabled === false`,
 *     or a payout's `requiresManualTransfer === true`) no money moves on its
 *     own. The page says so loudly and never renders a pending payout as if it
 *     had been transferred.
 */

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Ban,
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  HandCoins,
  Info,
  Landmark,
  Loader2,
  Play,
  Plus,
  Receipt,
  RefreshCw,
  RotateCcw,
  ScrollText,
  Search,
  Wallet,
  X,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { adminPayoutsApi } from '@/lib/api/adminPayments'
import { adminPayoutQueryKeys } from '@/lib/api/queryKeys'
import type {
  CreatePayoutPayload,
  LedgerEntry,
  PayableVendor,
  Payout,
  PayoutListFilters,
  PayoutStatus,
} from '@/types/admin-payments.types'
import { asPopulated, paymentVendorName } from '@/types/admin-payments.types'
import {
  CardListSkeleton,
  DetailRow,
  EmptyState,
  ErrorState,
  FilterBar,
  FilterField,
  InlineLoading,
  MobileCard,
  PaginationBar,
  SectionCard,
  StatCard,
  StatGrid,
  StatusBadge,
  TableScroll,
  TableSkeleton,
  Td,
  Th,
} from '@/components/admin/payments/PaymentPrimitives'
import {
  formatCompactCurrency,
  formatCurrency,
  formatDateOnly,
  formatDateShort,
  formatDateTime,
  formatNumber,
  humanise,
} from '@/components/admin/payments/payment-format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20
const LEDGER_PAGE_SIZE = 20

/** The primary action gradient used across the admin surfaces. */
const PRIMARY_BTN =
  'gap-2 border-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm shadow-indigo-500/25 ' +
  'transition-all hover:from-indigo-500 hover:to-blue-500 hover:shadow-md hover:shadow-indigo-500/30 ' +
  'focus-visible:ring-indigo-400'

const STATUS_OPTIONS: Array<{ value: PayoutStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Awaiting transfer' },
  { value: 'processing', label: 'Processing' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

type PayoutAction = 'detail' | 'process' | 'mark-paid' | 'cancel' | 'receipt'

/**
 * The client-side mirror of the backend payout state machine. Anything not in
 * this list would be rejected with a 409, so we never render it.
 *
 *   pending    → process | mark-paid | cancel
 *   processing → mark-paid | cancel
 *   failed     → process | mark-paid | cancel
 *   paid       → (receipt only)
 *   cancelled  → (nothing)
 */
function allowedPayoutActions(status: PayoutStatus): PayoutAction[] {
  switch (status) {
    case 'pending':
      return ['detail', 'process', 'mark-paid', 'cancel']
    case 'processing':
      return ['detail', 'mark-paid', 'cancel']
    case 'failed':
      return ['detail', 'process', 'mark-paid', 'cancel']
    case 'paid':
      return ['detail', 'receipt']
    case 'cancelled':
    default:
      return ['detail']
  }
}

function payoutMethodLabel(method: Payout['method']): string {
  switch (method) {
    case 'razorpay_payout':
      return 'Razorpay payout'
    case 'bank_transfer':
      return 'Bank transfer'
    case 'upi':
      return 'UPI'
    default:
      return 'Manual'
  }
}

function payoutPeriodLabel(payout: Payout): string {
  if (!payout.periodStart && !payout.periodEnd) return '—'
  return `${formatDateShort(payout.periodStart)} → ${formatDateShort(payout.periodEnd)}`
}

/** The `_id` of a payout's populated vendor, or null when it isn't populated. */
function payoutVendorId(payout: Payout): string | null {
  const vendor = asPopulated(payout.vendor)
  return vendor?._id ?? null
}

/** Why a payable-vendor row cannot be paid out right now, or null if it can. */
function ineligibilityReason(vendor: PayableVendor): string | null {
  if (vendor.isPayable) return null
  if (vendor.belowMinimum) return `below the minimum payout of ${formatCurrency(vendor.minPayoutAmount)}`
  if (!vendor.hasPayoutDestination) return 'no bank account or UPI on file'
  return 'not eligible for a payout yet'
}

/** Inclusive day-range test for the client-side date filter. */
function withinDateRange(value: string, from: string, to: string): boolean {
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return false
  if (from) {
    const start = new Date(`${from}T00:00:00`).getTime()
    if (!Number.isNaN(start) && timestamp < start) return false
  }
  if (to) {
    const end = new Date(`${to}T23:59:59.999`).getTime()
    if (!Number.isNaN(end) && timestamp > end) return false
  }
  return true
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function VendorPayoutsPage() {
  const queryClient = useQueryClient()

  // Filters / pagination
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'all'>('all')
  const [vendorFilter, setVendorFilter] = useState<string>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Overlays
  const [detailPayoutId, setDetailPayoutId] = useState<string | null>(null)
  const [receiptPayoutId, setReceiptPayoutId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const [ledgerVendorId, setLedgerVendorId] = useState('')
  const [ledgerPage, setLedgerPage] = useState(1)
  const [markPaidPayout, setMarkPaidPayout] = useState<Payout | null>(null)
  const [cancelPayout, setCancelPayout] = useState<Payout | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [processPayout, setProcessPayout] = useState<Payout | null>(null)
  const [releaseOpen, setReleaseOpen] = useState(false)

  // ── Queries ────────────────────────────────────────────────────────────────

  const overviewQ = useQuery({
    queryKey: adminPayoutQueryKeys.overview,
    queryFn: adminPayoutsApi.getOverview,
    staleTime: 30_000,
  })

  const filters: PayoutListFilters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(vendorFilter !== 'all' ? { vendorId: vendorFilter } : {}),
    }),
    [page, statusFilter, vendorFilter],
  )

  const listQ = useQuery({
    queryKey: [...adminPayoutQueryKeys.payouts, filters],
    queryFn: () => adminPayoutsApi.list(filters),
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  })

  // Vendor choices for the status filter (one generous page is plenty here).
  const vendorOptionsQ = useQuery({
    queryKey: [...adminPayoutQueryKeys.payableVendors, 'options'],
    queryFn: () => adminPayoutsApi.listPayableVendors({ page: 1, limit: 100 }),
    staleTime: 60_000,
  })

  const detailQ = useQuery({
    queryKey: adminPayoutQueryKeys.detail(detailPayoutId ?? ''),
    queryFn: () => adminPayoutsApi.getById(detailPayoutId as string),
    enabled: Boolean(detailPayoutId),
    staleTime: 10_000,
  })

  const receiptQ = useQuery({
    queryKey: adminPayoutQueryKeys.receipt(receiptPayoutId ?? ''),
    queryFn: () => adminPayoutsApi.getReceipt(receiptPayoutId as string),
    enabled: Boolean(receiptPayoutId),
    staleTime: 30_000,
  })

  const ledgerQ = useQuery({
    queryKey: [...adminPayoutQueryKeys.ledger, { vendorId: ledgerVendorId, page: ledgerPage }],
    queryFn: () =>
      adminPayoutsApi.listLedger({ vendorId: ledgerVendorId, page: ledgerPage, limit: LEDGER_PAGE_SIZE }),
    enabled: Boolean(ledgerVendorId),
    staleTime: 15_000,
  })

  const ledgerSummaryQ = useQuery({
    queryKey: adminPayoutQueryKeys.ledgerSummary(ledgerVendorId),
    queryFn: () => adminPayoutsApi.getLedgerSummary(ledgerVendorId),
    enabled: Boolean(ledgerVendorId),
    staleTime: 15_000,
  })

  // ── Derived data ───────────────────────────────────────────────────────────

  const payouts = listQ.data?.payouts ?? []
  const pagination = listQ.data?.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, pages: 1 }
  const overview = overviewQ.data
  const vendorOptions = vendorOptionsQ.data?.vendors ?? []

  /**
   * The payouts list endpoint supports page/limit/status/vendorId only, so a
   * date range is applied to the rows already loaded for this page. The caption
   * under the filter bar says exactly that.
   */
  const dateFilterActive = Boolean(fromDate || toDate)
  const visiblePayouts = useMemo(() => {
    if (!dateFilterActive) return payouts
    return payouts.filter((payout) => withinDateRange(payout.createdAt, fromDate, toDate))
  }, [payouts, fromDate, toDate, dateFilterActive])

  const hasFilters =
    statusFilter !== 'all' || vendorFilter !== 'all' || dateFilterActive

  const selectedVendorName = vendorOptions.find((v) => v.vendorId === vendorFilter)?.businessName

  // ── Invalidation ───────────────────────────────────────────────────────────

  const invalidatePayoutData = () => {
    queryClient.invalidateQueries({ queryKey: adminPayoutQueryKeys.payouts })
    queryClient.invalidateQueries({ queryKey: adminPayoutQueryKeys.overview })
    queryClient.invalidateQueries({ queryKey: adminPayoutQueryKeys.ledger })
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  const processM = useMutation({
    mutationFn: (payoutId: string) => adminPayoutsApi.process(payoutId),
    onSuccess: ({ payout }) => {
      invalidatePayoutData()
      if (payout.status === 'paid') {
        toast.success(`Payout ${payout.payoutNumber} marked paid by the gateway`, {
          description: `Net ${formatCurrency(payout.amount)} has been sent to ${paymentVendorName(payout)}.`,
        })
      } else if (payout.status === 'failed') {
        toast.error(`Payout ${payout.payoutNumber} failed`, {
          description:
            payout.gateway?.failureReason ||
            'The gateway rejected the transfer. You can retry once the vendor details are fixed.',
        })
      } else if (payout.requiresManualTransfer) {
        // Not a failure — a work item for finance.
        toast(`Manual transfer required for ${payout.payoutNumber}`, {
          description:
            'Gateway payouts are disabled, so no money moved. Make the bank transfer yourself, then record the UTR with “Mark paid”.',
          duration: 10_000,
        })
      } else {
        toast(`Payout ${payout.payoutNumber} is processing`, {
          description: 'The gateway accepted the request and will settle it shortly.',
        })
      }
    },
    onError: (error: Error) => toast.error(error.message || 'Could not process this payout'),
  })

  const cancelM = useMutation({
    mutationFn: ({ payoutId, reason }: { payoutId: string; reason: string }) =>
      adminPayoutsApi.cancel(payoutId, reason),
    onSuccess: ({ payout }) => {
      invalidatePayoutData()
      toast.success(`Payout ${payout.payoutNumber} cancelled`, {
        description: 'The reserved ledger entries are back in the vendor’s available balance.',
      })
    },
    onError: (error: Error) => toast.error(error.message || 'Could not cancel this payout'),
    onSettled: () => {
      setCancelPayout(null)
      setCancelReason('')
    },
  })

  const releaseM = useMutation({
    mutationFn: () => adminPayoutsApi.releaseEarnings(),
    onSuccess: ({ released }) => {
      invalidatePayoutData()
      queryClient.invalidateQueries({ queryKey: adminPayoutQueryKeys.payableVendors })
      toast.success(
        released > 0
          ? `${formatNumber(released)} ledger ${released === 1 ? 'entry' : 'entries'} released`
          : 'Nothing to release right now',
        {
          description:
            released > 0
              ? 'Those earnings have moved out of the hold period and into the payable pool.'
              : 'No held earnings have passed the hold window yet.',
        },
      )
    },
    onError: (error: Error) => toast.error(error.message || 'Could not release earnings'),
  })

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openDetail = (payoutId: string) => setDetailPayoutId(payoutId)

  const openLedger = (vendorId?: string | null) => {
    if (vendorId) {
      setLedgerVendorId(vendorId)
      setLedgerPage(1)
    }
    setLedgerOpen(true)
  }

  const resetFilters = () => {
    setStatusFilter('all')
    setVendorFilter('all')
    setFromDate('')
    setToDate('')
    setPage(1)
  }

  const refreshAll = () => {
    overviewQ.refetch()
    listQ.refetch()
    vendorOptionsQ.refetch()
  }

  const detail = detailQ.data
  const detailPayout = detail?.payout ?? null
  const detailActions = detailPayout ? allowedPayoutActions(detailPayout.status) : []

  const receipt = receiptQ.data

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25">
              <Wallet className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vendor payouts</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Move vendor earnings out of the ledger and settle them.
                {pagination.total > 0 && (
                  <span className="ml-1">
                    · <span className="font-medium text-slate-700">{formatNumber(pagination.total)}</span> payouts
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" onClick={refreshAll} aria-label="Refresh payouts">
              <RefreshCw className={cn('h-4 w-4', (listQ.isFetching || overviewQ.isFetching) && 'animate-spin')} />
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => openLedger()}>
              <ScrollText className="h-4 w-4" />
              Vendor ledger
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setReleaseOpen(true)}>
              <HandCoins className="h-4 w-4" />
              Release earnings
            </Button>
            <Button className={PRIMARY_BTN} onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create payout
            </Button>
          </div>
        </div>
      </div>

      {/* Manual-transfer notice — the single most important thing on this page */}
      {overview && !overview.razorpayPayoutEnabled && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm sm:p-5">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-sm font-semibold text-amber-900">
                Manual bank transfer mode — payouts do not move money automatically
              </p>
              <p className="text-sm leading-relaxed text-amber-800">
                Gateway payouts are switched off platform-wide. Creating a payout only reserves the
                vendor&apos;s earnings and opens a work item for finance; clicking{' '}
                <span className="font-semibold">Process</span> will not send any money. Make the bank
                transfer yourself, then record the UTR with <span className="font-semibold">Mark paid</span>.
                A payout sitting in <span className="font-semibold">Awaiting transfer</span> is a task,
                not a failure.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-amber-900/90">
                <span className="inline-flex items-center gap-1.5">
                  <Banknote className="h-3.5 w-3.5" />
                  Minimum payout {formatCurrency(overview.minPayoutAmount)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Hold period {overview.holdDays} {overview.holdDays === 1 ? 'day' : 'days'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {formatNumber(overview.needsManualTransfer)} awaiting transfer
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy strip — keeps the payout policy legible even when the gateway is live */}
      {overview && overview.razorpayPayoutEnabled && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            Payout policy
          </span>
          <span>Minimum payout {formatCurrency(overview.minPayoutAmount)}</span>
          <span>Earnings hold {overview.holdDays} {overview.holdDays === 1 ? 'day' : 'days'}</span>
          <span>Razorpay payouts enabled</span>
        </div>
      )}

      {/* KPIs */}
      <StatGrid columns={5}>
        <StatCard
          label="Available to pay out"
          value={formatCompactCurrency(overview?.totalAvailable ?? 0)}
          sub={`${formatNumber(overview?.availableEntries ?? 0)} payable entries`}
          icon={Wallet}
          accent="text-emerald-600"
          accentBg="bg-emerald-50"
          loading={overviewQ.isLoading}
        />
        <StatCard
          label="In hold period"
          value={formatCompactCurrency(overview?.totalPending ?? 0)}
          sub={`${formatNumber(overview?.pendingEntries ?? 0)} entries below the hold window`}
          icon={Clock}
          accent="text-amber-600"
          accentBg="bg-amber-50"
          loading={overviewQ.isLoading}
        />
        <StatCard
          label="Paid this month"
          value={formatCompactCurrency(overview?.paidThisMonth.amount ?? 0)}
          sub={`${formatNumber(overview?.paidThisMonth.count ?? 0)} payouts settled`}
          icon={CheckCircle2}
          accent="text-sky-600"
          accentBg="bg-sky-50"
          loading={overviewQ.isLoading}
        />
        <StatCard
          label="Failed payouts"
          value={formatCompactCurrency(overview?.failedPayouts.amount ?? 0)}
          sub={`${formatNumber(overview?.failedPayouts.count ?? 0)} to retry`}
          icon={XCircle}
          accent="text-rose-600"
          accentBg="bg-rose-50"
          tone="danger"
          loading={overviewQ.isLoading}
        />
        <StatCard
          label="Needs manual transfer"
          value={formatNumber(overview?.needsManualTransfer ?? 0)}
          sub={`${formatCompactCurrency(overview?.totalReserved ?? 0)} reserved — transfer, then Mark paid`}
          icon={Banknote}
          accent="text-amber-600"
          accentBg="bg-amber-50"
          tone="warning"
          loading={overviewQ.isLoading}
        />
      </StatGrid>

      {/* List */}
      <SectionCard
        title="Payout runs"
        description="Click a row to inspect the payout, its deductions and the reserved ledger entries."
        flush
        actions={
          <Button className={PRIMARY_BTN} size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Create payout
          </Button>
        }
      >
        <FilterBar
          actions={
            <Button variant="ghost" size="sm" onClick={resetFilters} disabled={!hasFilters} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          }
        >
          <FilterField label="Status">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as PayoutStatus | 'all')
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Vendor">
            <Select
              value={vendorFilter}
              onValueChange={(value) => {
                setVendorFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All vendors</SelectItem>
                {vendorOptions.map((vendor) => (
                  <SelectItem key={vendor.vendorId} value={vendor.vendorId}>
                    {vendor.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Created from">
            <Input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(event) => {
                setFromDate(event.target.value)
                setPage(1)
              }}
            />
          </FilterField>

          <FilterField label="Created to">
            <Input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) => {
                setToDate(event.target.value)
                setPage(1)
              }}
            />
          </FilterField>
        </FilterBar>

        {dateFilterActive && (
          <p className="flex items-start gap-1.5 border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] text-slate-500">
            <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            The payouts endpoint filters by status and vendor server-side; this date range narrows the
            rows on the page you are viewing. Use Status or Vendor to narrow the whole data set.
          </p>
        )}

        {listQ.isLoading ? (
          <>
            <div className="hidden md:block">
              <TableSkeleton rows={6} columns={9} />
            </div>
            <div className="md:hidden">
              <CardListSkeleton count={5} />
            </div>
          </>
        ) : listQ.isError ? (
          <ErrorState message={(listQ.error as Error)?.message} onRetry={() => listQ.refetch()} />
        ) : visiblePayouts.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={hasFilters ? 'No payouts match these filters' : 'No payouts yet'}
            description={
              hasFilters
                ? 'Try widening the status, vendor or date range.'
                : 'Create a payout once a vendor has available earnings past the hold period.'
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={resetFilters}>
                  Reset filters
                </Button>
              ) : (
                <Button className={PRIMARY_BTN} onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create payout
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <TableScroll className="hidden md:block">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50/80">
                  <tr>
                    <Th>Payout</Th>
                    <Th>Vendor</Th>
                    <Th align="right">Amount</Th>
                    <Th>Status</Th>
                    <Th>Method</Th>
                    <Th>Period</Th>
                    <Th>UTR</Th>
                    <Th>Created</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visiblePayouts.map((payout) => (
                    <tr
                      key={payout._id}
                      onClick={() => openDetail(payout._id)}
                      className="cursor-pointer transition-colors hover:bg-slate-50/70"
                    >
                      <Td>
                        <div className="font-medium text-slate-900">{payout.payoutNumber}</div>
                        {payout.requiresManualTransfer && (
                          <span className="text-[11px] font-medium text-amber-600">Manual transfer</span>
                        )}
                      </Td>
                      <Td className="max-w-[200px] truncate">{paymentVendorName(payout)}</Td>
                      <Td align="right" className="font-semibold text-slate-900">
                        {formatCurrency(payout.amount)}
                      </Td>
                      <Td>
                        <StatusBadge status={payout.status} kind="payout" />
                      </Td>
                      <Td className="text-xs text-slate-600">{payoutMethodLabel(payout.method)}</Td>
                      <Td className="text-xs text-slate-500">{payoutPeriodLabel(payout)}</Td>
                      <Td className="font-mono text-xs text-slate-600">{payout.gateway?.utr || '—'}</Td>
                      <Td className="text-xs text-slate-500">{formatDateShort(payout.createdAt)}</Td>
                      <Td align="right">
                        <PayoutActionButtons
                          payout={payout}
                          onDetail={() => openDetail(payout._id)}
                          onProcess={() => setProcessPayout(payout)}
                          onMarkPaid={() => setMarkPaidPayout(payout)}
                          onCancel={() => {
                            setCancelReason('')
                            setCancelPayout(payout)
                          }}
                          onReceipt={() => setReceiptPayoutId(payout._id)}
                        />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>

            {/* Mobile cards */}
            <div className="space-y-3 p-3 md:hidden">
              {visiblePayouts.map((payout) => (
                <MobileCard
                  key={payout._id}
                  title={payout.payoutNumber}
                  subtitle={paymentVendorName(payout)}
                  status={payout.status}
                  statusKind="payout"
                  amount={formatCurrency(payout.amount)}
                  onClick={() => openDetail(payout._id)}
                  rows={[
                    { label: 'Method', value: payoutMethodLabel(payout.method) },
                    { label: 'Period', value: payoutPeriodLabel(payout) },
                    { label: 'UTR', value: payout.gateway?.utr || '—' },
                    { label: 'Created', value: formatDateShort(payout.createdAt) },
                  ]}
                  actions={
                    <PayoutActionButtons
                      payout={payout}
                      onDetail={() => openDetail(payout._id)}
                      onProcess={() => setProcessPayout(payout)}
                      onMarkPaid={() => setMarkPaidPayout(payout)}
                      onCancel={() => {
                        setCancelReason('')
                        setCancelPayout(payout)
                      }}
                      onReceipt={() => setReceiptPayoutId(payout._id)}
                    />
                  }
                />
              ))}
            </div>

            <PaginationBar
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          </>
        )}
      </SectionCard>

      {/* ── Detail sheet ──────────────────────────────────────────────────── */}
      <Sheet
        open={Boolean(detailPayoutId)}
        onOpenChange={(open) => {
          if (!open) setDetailPayoutId(null)
        }}
      >
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-xl">
          <SheetHeader className="border-b border-slate-100">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              {detailPayout ? detailPayout.payoutNumber : 'Payout'}
            </SheetTitle>
            <SheetDescription>
              {detailPayout
                ? `${paymentVendorName(detailPayout)} · ${formatCurrency(detailPayout.amount)}`
                : 'Loading payout details…'}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4 py-4">
            {detailQ.isLoading ? (
              <InlineLoading label="Loading payout…" />
            ) : detailQ.isError ? (
              <ErrorState message={(detailQ.error as Error)?.message} onRetry={() => detailQ.refetch()} />
            ) : detailPayout ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <StatusBadge status={detailPayout.status} kind="payout" />
                  <PayoutActionButtons
                    payout={detailPayout}
                    onDetail={() => undefined}
                    onProcess={() => setProcessPayout(detailPayout)}
                    onMarkPaid={() => setMarkPaidPayout(detailPayout)}
                    onCancel={() => {
                      setCancelReason('')
                      setCancelPayout(detailPayout)
                    }}
                    onReceipt={() => setReceiptPayoutId(detailPayout._id)}
                  />
                </div>

                {detailPayout.requiresManualTransfer && detailPayout.status !== 'paid' && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                    <span className="font-semibold">Awaiting a manual bank transfer.</span>{' '}
                    {detailPayout.status === 'pending'
                      ? 'No money has moved. Pay the vendor from your bank account and record the UTR with Mark paid.'
                      : 'No money has moved automatically for this payout — confirm the transfer in your bank before recording the UTR.'}
                  </div>
                )}

                <DetailRow label="Payout number" value={detailPayout.payoutNumber} />
                <DetailRow label="Vendor" value={paymentVendorName(detailPayout)} />
                <DetailRow label="Amount" value={formatCurrency(detailPayout.amount)} />
                <DetailRow label="Method" value={payoutMethodLabel(detailPayout.method)} />
                <DetailRow
                  label="Period"
                  value={
                    detailPayout.periodStart || detailPayout.periodEnd
                      ? `${formatDateOnly(detailPayout.periodStart)} → ${formatDateOnly(detailPayout.periodEnd)}`
                      : '—'
                  }
                />
                <DetailRow label="Created" value={formatDateTime(detailPayout.createdAt)} />
                <DetailRow label="Processed" value={formatDateTime(detailPayout.processedAt)} />
                {detailPayout.notes && <DetailRow label="Notes" value={detailPayout.notes} />}

                {detailPayout.deductions && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Deductions
                    </p>
                    <DetailRow label="Gross amount" value={formatCurrency(detailPayout.deductions.grossAmount)} />
                    <DetailRow label="Commission" value={`− ${formatCurrency(detailPayout.deductions.commission)}`} />
                    <DetailRow label="Platform fee" value={`− ${formatCurrency(detailPayout.deductions.platformFee)}`} />
                    <DetailRow label="Tax" value={`− ${formatCurrency(detailPayout.deductions.tax)}`} />
                    <DetailRow label="Processing fee" value={`− ${formatCurrency(detailPayout.deductions.processingFee)}`} />
                    <DetailRow
                      label="Net payout"
                      value={formatCurrency(detailPayout.deductions.netAmount)}
                      emphasis="total"
                    />
                  </div>
                )}

                {detailPayout.bankAccountSnapshot && (
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <Landmark className="h-3.5 w-3.5" />
                      Bank details at creation
                    </p>
                    <DetailRow label="Account holder" value={detailPayout.bankAccountSnapshot.accountHolderName || '—'} />
                    <DetailRow label="Account number" value={detailPayout.bankAccountSnapshot.accountNumberMasked || '—'} />
                    <DetailRow label="IFSC" value={detailPayout.bankAccountSnapshot.ifscCode || '—'} />
                    <DetailRow label="Bank" value={detailPayout.bankAccountSnapshot.bankName || '—'} />
                    {detailPayout.bankAccountSnapshot.upiId && (
                      <DetailRow label="UPI" value={detailPayout.bankAccountSnapshot.upiId} />
                    )}
                  </div>
                )}

                {detailPayout.gateway &&
                  (detailPayout.gateway.payoutId ||
                    detailPayout.gateway.utr ||
                    detailPayout.gateway.failureReason ||
                    detailPayout.gateway.attempts !== undefined) && (
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Gateway
                      </p>
                      <DetailRow label="Gateway payout id" value={detailPayout.gateway.payoutId || '—'} />
                      <DetailRow label="UTR / reference" value={detailPayout.gateway.utr || '—'} />
                      <DetailRow label="Attempts" value={formatNumber(detailPayout.gateway.attempts ?? 0)} />
                      {detailPayout.gateway.attemptedAt && (
                        <DetailRow label="Last attempt" value={formatDateTime(detailPayout.gateway.attemptedAt)} />
                      )}
                      {detailPayout.gateway.failureReason && (
                        <DetailRow
                          label="Failure reason"
                          value={<span className="text-rose-600">{detailPayout.gateway.failureReason}</span>}
                        />
                      )}
                    </div>
                  )}

                {detailPayout.status === 'cancelled' && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Cancellation
                    </p>
                    <DetailRow label="Reason" value={detailPayout.cancellationReason || '—'} />
                    <DetailRow label="Cancelled at" value={formatDateTime(detailPayout.cancelledAt)} />
                  </div>
                )}

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Reserved ledger entries ({detail?.entries.length ?? 0})
                    </p>
                    {payoutVendorId(detailPayout) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => openLedger(payoutVendorId(detailPayout))}
                      >
                        <ScrollText className="h-3.5 w-3.5" />
                        Open ledger
                      </Button>
                    )}
                  </div>
                  {detail?.entries.length ? (
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                      {detail.entries.map((entry) => (
                        <LedgerEntryRow key={entry._id} entry={entry} />
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-500">
                      No ledger entries are linked to this payout.
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Receipt sheet ─────────────────────────────────────────────────── */}
      <Sheet
        open={Boolean(receiptPayoutId)}
        onOpenChange={(open) => {
          if (!open) setReceiptPayoutId(null)
        }}
      >
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-lg">
          <SheetHeader className="border-b border-slate-100">
            <SheetTitle className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-slate-400" />
              Payout receipt
            </SheetTitle>
            <SheetDescription>
              {receipt ? receipt.receiptNumber : 'Fetching the settlement receipt…'}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4 py-4">
            {receiptQ.isLoading ? (
              <InlineLoading label="Loading receipt…" />
            ) : receiptQ.isError ? (
              <ErrorState message={(receiptQ.error as Error)?.message} onRetry={() => receiptQ.refetch()} />
            ) : receipt ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <StatusBadge status={receipt.payout.status} kind="payout" />
                  <Badge
                    variant="outline"
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                      receipt.isPaid
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        : 'bg-amber-50 text-amber-700 ring-amber-200',
                    )}
                  >
                    {receipt.isPaid ? 'Settled' : 'Not yet settled'}
                  </Badge>
                </div>

                <DetailRow label="Receipt number" value={receipt.receiptNumber} />
                <DetailRow label="Generated" value={formatDateTime(receipt.generatedAt)} />
                <DetailRow label="Payout number" value={receipt.payout.payoutNumber} />
                <DetailRow label="Vendor" value={paymentVendorName(receipt.payout)} />
                <DetailRow label="Method" value={payoutMethodLabel(receipt.payout.method)} />
                <DetailRow label="UTR / reference" value={receipt.payout.gateway?.utr || '—'} />

                {receipt.payout.deductions && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Deductions
                    </p>
                    <DetailRow label="Gross amount" value={formatCurrency(receipt.payout.deductions.grossAmount)} />
                    <DetailRow label="Commission" value={`− ${formatCurrency(receipt.payout.deductions.commission)}`} />
                    <DetailRow label="Platform fee" value={`− ${formatCurrency(receipt.payout.deductions.platformFee)}`} />
                    <DetailRow label="Tax" value={`− ${formatCurrency(receipt.payout.deductions.tax)}`} />
                    <DetailRow
                      label="Processing fee"
                      value={`− ${formatCurrency(receipt.payout.deductions.processingFee)}`}
                    />
                    <DetailRow
                      label="Net paid"
                      value={formatCurrency(receipt.payout.deductions.netAmount)}
                      emphasis="total"
                    />
                  </div>
                )}

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Settled entries ({receipt.entries.length})
                  </p>
                  {receipt.entries.length ? (
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                      {receipt.entries.map((entry) => (
                        <LedgerEntryRow key={entry._id} entry={entry} />
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-500">
                      No ledger entries are attached to this receipt.
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Ledger drill-down sheet ───────────────────────────────────────── */}
      <Sheet
        open={ledgerOpen}
        onOpenChange={(open) => {
          setLedgerOpen(open)
        }}
      >
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-xl">
          <SheetHeader className="border-b border-slate-100">
            <SheetTitle className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-slate-400" />
              Vendor ledger
            </SheetTitle>
            <SheetDescription>
              Earnings, fees, refunds and payouts — the source of every payable balance.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 py-4">
            <div>
              <Label className="mb-1 block text-xs font-medium text-slate-500">Vendor</Label>
              <Select
                value={ledgerVendorId || undefined}
                onValueChange={(value) => {
                  setLedgerVendorId(value)
                  setLedgerPage(1)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendorOptions.map((vendor) => (
                    <SelectItem key={vendor.vendorId} value={vendor.vendorId}>
                      {vendor.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!ledgerVendorId ? (
              <EmptyState
                icon={ScrollText}
                title="Pick a vendor"
                description="Choose a vendor to see their ledger summary and entries."
              />
            ) : (
              <>
                {ledgerSummaryQ.isLoading ? (
                  <InlineLoading label="Loading summary…" />
                ) : ledgerSummaryQ.isError ? (
                  <ErrorState
                    message={(ledgerSummaryQ.error as Error)?.message}
                    onRetry={() => ledgerSummaryQ.refetch()}
                  />
                ) : ledgerSummaryQ.data ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <DetailRow
                      label="Available balance"
                      value={formatCurrency(ledgerSummaryQ.data.availableBalance)}
                      emphasis="total"
                    />
                    <DetailRow label="Pending (in hold)" value={formatCurrency(ledgerSummaryQ.data.pendingBalance)} />
                    <DetailRow label="Lifetime earned" value={formatCurrency(ledgerSummaryQ.data.lifetimeEarned)} />
                    <DetailRow label="Lifetime paid out" value={formatCurrency(ledgerSummaryQ.data.lifetimePaidOut)} />
                    <DetailRow label="Lifetime refunded" value={formatCurrency(ledgerSummaryQ.data.lifetimeRefunded)} />
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                      <span>Minimum payout {formatCurrency(ledgerSummaryQ.data.minPayoutAmount)}</span>
                      <span>Hold period {ledgerSummaryQ.data.holdDays} days</span>
                      <span>
                        Gateway payouts {ledgerSummaryQ.data.razorpayPayoutEnabled ? 'enabled' : 'disabled'}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Entries {ledgerQ.data ? `(${formatNumber(ledgerQ.data.pagination.total)})` : ''}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      onClick={() => ledgerQ.refetch()}
                    >
                      <RefreshCw className={cn('h-3.5 w-3.5', ledgerQ.isFetching && 'animate-spin')} />
                      Refresh
                    </Button>
                  </div>

                  {ledgerQ.isLoading ? (
                    <CardListSkeleton count={4} />
                  ) : ledgerQ.isError ? (
                    <ErrorState message={(ledgerQ.error as Error)?.message} onRetry={() => ledgerQ.refetch()} />
                  ) : ledgerQ.data && ledgerQ.data.entries.length > 0 ? (
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                      {ledgerQ.data.entries.map((entry) => (
                        <LedgerEntryRow key={entry._id} entry={entry} />
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-500">
                      No ledger entries for this vendor yet.
                    </p>
                  )}
                </div>

                {ledgerQ.data && ledgerQ.data.pagination.total > 0 && (
                  <div className="rounded-xl border border-slate-200">
                    <PaginationBar
                      page={ledgerQ.data.pagination.page}
                      pages={ledgerQ.data.pagination.pages}
                      total={ledgerQ.data.pagination.total}
                      limit={ledgerQ.data.pagination.limit}
                      onPageChange={setLedgerPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Create payout ─────────────────────────────────────────────────── */}
      <CreatePayoutDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* ── Mark paid ─────────────────────────────────────────────────────── */}
      <MarkPaidDialog
        payout={markPaidPayout}
        onClose={() => setMarkPaidPayout(null)}
        onSuccess={() => invalidatePayoutData()}
      />

      {/* ── Process confirmation ──────────────────────────────────────────── */}
      <AlertDialog
        open={Boolean(processPayout)}
        onOpenChange={(open) => {
          if (!open) setProcessPayout(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process payout {processPayout?.payoutNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This asks the payout gateway to transfer{' '}
              <span className="font-semibold text-slate-700">
                {processPayout ? formatCurrency(processPayout.amount) : ''}
              </span>{' '}
              to {processPayout ? paymentVendorName(processPayout) : 'the vendor'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs leading-relaxed text-slate-600">
            {overview && !overview.razorpayPayoutEnabled ? (
              <>
                Gateway payouts are currently <span className="font-semibold">disabled</span>, so this will
                leave the payout awaiting a manual transfer — no money moves. You will still need to make the
                bank transfer yourself and then record the UTR with Mark paid.
              </>
            ) : (
              <>
                If the gateway accepts the request the payout becomes Processing, then Paid. If it rejects it,
                the payout is marked Failed with the gateway reason.
              </>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processM.isPending}>Back</AlertDialogCancel>
            <AlertDialogAction
              className={PRIMARY_BTN}
              disabled={processM.isPending}
              onClick={(event) => {
                event.preventDefault()
                if (!processPayout) return
                processM.mutate(processPayout._id, {
                  onSuccess: () => setProcessPayout(null),
                  onError: () => setProcessPayout(null),
                })
              }}
            >
              {processM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Process payout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Cancel confirmation ───────────────────────────────────────────── */}
      <AlertDialog
        open={Boolean(cancelPayout)}
        onOpenChange={(open) => {
          if (!open) {
            setCancelPayout(null)
            setCancelReason('')
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel payout {cancelPayout?.payoutNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              The reserved earnings ({cancelPayout ? formatCurrency(cancelPayout.amount) : ''}) return to{' '}
              {cancelPayout ? paymentVendorName(cancelPayout) : 'the vendor'}&apos;s available balance, and the
              payout becomes Cancelled. This cannot be undone — you would need to create a new payout to pay
              the vendor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Label htmlFor="cancel-reason" className="mb-1 block text-xs font-medium text-slate-500">
              Reason <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="e.g. Vendor asked to hold this payout until next week"
              rows={3}
            />
            {!cancelReason.trim() && (
              <p className="mt-1 text-xs text-slate-500">A reason is required and is stored on the payout.</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelM.isPending}>Keep payout</AlertDialogCancel>
            <AlertDialogAction
              className="border-0 bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-400"
              disabled={!cancelReason.trim() || cancelM.isPending}
              onClick={(event) => {
                event.preventDefault()
                if (!cancelPayout) return
                if (!cancelReason.trim()) {
                  toast.error('Please add a cancellation reason')
                  return
                }
                cancelM.mutate({ payoutId: cancelPayout._id, reason: cancelReason.trim() })
              }}
            >
              {cancelM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel payout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Release earnings ─────────────────────────────────────────────── */}
      <AlertDialog open={releaseOpen} onOpenChange={setReleaseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release held earnings?</AlertDialogTitle>
            <AlertDialogDescription>
              Every ledger entry whose hold window has passed moves from <em>pending</em> into the payable
              pool, which makes it count towards the vendor&apos;s available balance and therefore towards the
              next payout. Nothing is transferred to a bank account by this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-600">
            <Info className="h-4 w-4 shrink-0 text-slate-400" />
            <span>
              Currently in hold: {formatCompactCurrency(overview?.totalPending ?? 0)} across{' '}
              {formatNumber(overview?.pendingEntries ?? 0)} entries · hold period {overview?.holdDays ?? 0} days.
            </span>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={releaseM.isPending}>Not now</AlertDialogCancel>
            <AlertDialogAction
              className={PRIMARY_BTN}
              disabled={releaseM.isPending}
              onClick={(event) => {
                event.preventDefault()
                releaseM.mutate(undefined, { onSettled: () => setReleaseOpen(false) })
              }}
            >
              {releaseM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Release earnings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── Row-level pieces ─────────────────────────────────────────────────────────

function LedgerEntryRow({ entry }: { entry: LedgerEntry }) {
  const credit = entry.direction === 'credit'
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={entry.type} kind="ledgerType" />
          <span className="truncate text-xs text-slate-600">{entry.description || humanise(entry.type)}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-slate-400">
          {formatDateShort(entry.createdAt)}
          {entry.availableAt ? ` · available ${formatDateShort(entry.availableAt)}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={cn('text-sm font-semibold tabular-nums', credit ? 'text-emerald-700' : 'text-slate-700')}>
          {credit ? '+' : '−'} {formatCurrency(Math.abs(entry.amount))}
        </span>
        <StatusBadge status={entry.status} kind="ledger" />
      </div>
    </div>
  )
}

/**
 * The action buttons for one payout, gated on the state machine so the UI never
 * offers something the API would reject with a 409.
 */
function PayoutActionButtons({
  payout,
  onDetail,
  onProcess,
  onMarkPaid,
  onCancel,
  onReceipt,
}: {
  payout: Payout
  onDetail: () => void
  onProcess: () => void
  onMarkPaid: () => void
  onCancel: () => void
  onReceipt: () => void
}) {
  const actions = allowedPayoutActions(payout.status)
  if (actions.length <= 1) {
    return (
      <div className="flex items-center justify-end">
        <span className="text-xs text-slate-400">No actions</span>
      </div>
    )
  }

  return (
    <div
      className="flex flex-wrap items-center justify-end gap-1.5"
      onClick={(event) => event.stopPropagation()}
    >
      {actions.includes('process') && (
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={onProcess} title="Process payout">
          <Play className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Process</span>
        </Button>
      )}
      {actions.includes('mark-paid') && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          onClick={onMarkPaid}
          title="Mark this payout as paid (requires a UTR)"
        >
          <Banknote className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Mark paid</span>
        </Button>
      )}
      {actions.includes('receipt') && (
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={onReceipt} title="View receipt">
          <Receipt className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Receipt</span>
        </Button>
      )}
      {actions.includes('cancel') && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          onClick={onCancel}
          title="Cancel this payout"
        >
          <Ban className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Cancel</span>
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-500"
        onClick={onDetail}
        title="Open payout details"
        aria-label="Open payout details"
      >
        <FileText className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

// ── Create payout dialog ─────────────────────────────────────────────────────

function CreatePayoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [notes, setNotes] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  // Debounce the vendor search so the picker does not refetch on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 350)
    return () => clearTimeout(timeout)
  }, [searchInput])

  // Start from a clean form the next time the dialog opens.
  useEffect(() => {
    if (open) return
    setSearchInput('')
    setSearch('')
    setSelectedVendorId('')
    setNotes('')
    setPeriodStart('')
    setPeriodEnd('')
  }, [open])

  const vendorsQ = useQuery({
    queryKey: [...adminPayoutQueryKeys.payableVendors, 'create', search],
    queryFn: () => adminPayoutsApi.listPayableVendors({ page: 1, limit: 20, search }),
    enabled: open,
    staleTime: 15_000,
  })

  const vendors = vendorsQ.data?.vendors ?? []
  const selectedVendor = vendors.find((vendor) => vendor.vendorId === selectedVendorId) ?? null

  // The balances shown for the chosen vendor come from the ledger itself.
  const summaryQ = useQuery({
    queryKey: adminPayoutQueryKeys.ledgerSummary(selectedVendorId),
    queryFn: () => adminPayoutsApi.getLedgerSummary(selectedVendorId),
    enabled: open && Boolean(selectedVendorId),
    staleTime: 10_000,
  })

  const createM = useMutation({
    mutationFn: (payload: CreatePayoutPayload) => adminPayoutsApi.create(payload),
    onSuccess: ({ payout }) => {
      queryClient.invalidateQueries({ queryKey: adminPayoutQueryKeys.payouts })
      queryClient.invalidateQueries({ queryKey: adminPayoutQueryKeys.overview })
      queryClient.invalidateQueries({ queryKey: adminPayoutQueryKeys.ledger })
      queryClient.invalidateQueries({ queryKey: adminPayoutQueryKeys.payableVendors })
      toast.success(`Payout ${payout.payoutNumber} created`, {
        description: payout.requiresManualTransfer
          ? 'The earnings are reserved and no money has moved — make the bank transfer, then record the UTR with Mark paid.'
          : `Reserved ${formatCurrency(payout.amount)} of vendor earnings.`,
      })
      onOpenChange(false)
    },
    onError: (error: Error) => toast.error(error.message || 'Could not create the payout'),
  })

  const reason = selectedVendor ? ineligibilityReason(selectedVendor) : null
  const canSubmit = Boolean(selectedVendor && selectedVendor.isPayable && !createM.isPending)
  const noPayableVendors = vendors.length > 0 && !vendors.some((vendor) => vendor.isPayable)

  const submit = () => {
    if (!selectedVendor) {
      toast.error('Select a vendor first')
      return
    }
    if (!selectedVendor.isPayable) {
      toast.error(`This vendor cannot be paid out: ${reason}`)
      return
    }
    createM.mutate({
      vendorId: selectedVendor.vendorId,
      ...(periodStart ? { periodStart } : {}),
      ...(periodEnd ? { periodEnd } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!createM.isPending) onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create payout</DialogTitle>
          <DialogDescription>
            Reserving a vendor&apos;s available earnings creates a payout work item. It does not transfer
            money by itself.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vendor picker */}
          <div>
            <Label className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Vendor</span>
              <span className="text-slate-400">Search by business name or code</span>
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search vendors with payable balances…"
                className="pl-9 pr-8"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label="Clear vendor search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {vendorsQ.isLoading ? (
            <InlineLoading label="Loading payable vendors…" />
          ) : vendorsQ.isError ? (
            <ErrorState message={(vendorsQ.error as Error)?.message} onRetry={() => vendorsQ.refetch()} />
          ) : vendors.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No vendors with a payable balance"
              description={
                search
                  ? 'No vendor matches this search. Try a different name or code.'
                  : 'Every vendor is inside the hold period, below the minimum payout, or has no payout destination on file.'
              }
            />
          ) : (
            <>
              {noPayableVendors && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    None of these vendors can be paid out yet. Each row below says why — usually the earnings
                    are still inside the hold period, below the minimum, or no bank account / UPI is on file.
                  </span>
                </div>
              )}
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {vendors.map((vendor) => {
                  const vendorReason = ineligibilityReason(vendor)
                  const selected = vendor.vendorId === selectedVendorId
                  return (
                    <button
                      type="button"
                      key={vendor.vendorId}
                      onClick={() => setSelectedVendorId(vendor.vendorId)}
                      className={cn(
                        'w-full rounded-xl border p-3 text-left transition-colors',
                        selected
                          ? 'border-indigo-300 bg-indigo-50/60 ring-1 ring-indigo-200'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {vendor.businessName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {vendor.vendorCode || vendor.vendorId} · {formatNumber(vendor.entryCount)} entries ·{' '}
                            {vendor.payoutMethod ? humanise(vendor.payoutMethod) : 'no payout method'}
                            {/* Show the destination that will actually be paid. A UPI vendor
                                used to display a masked bank account number beside "Upi",
                                because the API returned no upiId. */}
                            {vendor.payoutMethod === 'upi' && vendor.upiId
                              ? ` · ${vendor.upiId}`
                              : vendor.accountNumberMasked
                                ? ` · ${vendor.accountNumberMasked}`
                                : ''}
                          </p>
                          {vendorReason && (
                            <p className="mt-1 text-xs font-medium text-amber-600">
                              Cannot pay out: {vendorReason}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold tabular-nums text-slate-900">
                            {formatCurrency(vendor.availableBalance)}
                          </p>
                          <p className="text-[11px] text-slate-400">available</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* Selected vendor balances (read from the ledger) */}
          {selectedVendor && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Building2 className="h-3.5 w-3.5" />
                  {selectedVendor.businessName}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                    selectedVendor.isPayable
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                      : 'bg-amber-50 text-amber-700 ring-amber-200',
                  )}
                >
                  {selectedVendor.isPayable ? 'Payable' : 'Not payable'}
                </Badge>
              </div>

              {summaryQ.isLoading ? (
                <InlineLoading label="Loading ledger balances…" />
              ) : summaryQ.isError ? (
                <ErrorState
                  message={(summaryQ.error as Error)?.message}
                  onRetry={() => summaryQ.refetch()}
                />
              ) : summaryQ.data ? (
                <div className="mt-1">
                  <DetailRow
                    label="Available balance"
                    value={formatCurrency(summaryQ.data.availableBalance)}
                    emphasis="total"
                  />
                  <DetailRow label="Pending (inside hold)" value={formatCurrency(summaryQ.data.pendingBalance)} />
                  <DetailRow
                    label="Reserved in payout pool"
                    value={formatCurrency(selectedVendor.reservedBalance)}
                  />
                  <DetailRow label="Hold period" value={`${summaryQ.data.holdDays} days`} />
                  <DetailRow label="Minimum payout" value={formatCurrency(summaryQ.data.minPayoutAmount)} />
                  {selectedVendor.lastEarningAt && (
                    <DetailRow
                      label="Last earning"
                      value={formatDateTime(selectedVendor.lastEarningAt)}
                      emphasis="muted"
                    />
                  )}
                </div>
              ) : null}

              {reason && (
                <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-2 text-xs font-medium text-amber-800">
                  This vendor cannot be paid out because they are {reason}.
                </p>
              )}
            </div>
          )}

          {/* Period + notes */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1 block text-xs font-medium text-slate-500">Period start (optional)</Label>
              <Input
                type="date"
                value={periodStart}
                max={periodEnd || undefined}
                onChange={(event) => setPeriodStart(event.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1 block text-xs font-medium text-slate-500">Period end (optional)</Label>
              <Input
                type="date"
                value={periodEnd}
                min={periodStart || undefined}
                onChange={(event) => setPeriodEnd(event.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="mb-1 block text-xs font-medium text-slate-500">Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              placeholder="Anything finance should know about this payout run"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createM.isPending}>
            Cancel
          </Button>
          <Button className={PRIMARY_BTN} onClick={submit} disabled={!canSubmit} title={reason || undefined}>
            {createM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create payout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Mark paid dialog ─────────────────────────────────────────────────────────

function MarkPaidDialog({
  payout,
  onClose,
  onSuccess,
}: {
  payout: Payout | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [utr, setUtr] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!payout) return
    setUtr('')
    setNote('')
    setError(null)
  }, [payout])

  const markPaidM = useMutation({
    mutationFn: ({
      payoutId,
      reference,
      noteText,
    }: {
      payoutId: string
      reference: string
      noteText?: string
    }) => adminPayoutsApi.markPaid(payoutId, { utr: reference, note: noteText }),
    onSuccess: ({ payout: updated }, variables) => {
      onSuccess()
      toast.success(`Payout ${updated.payoutNumber} marked paid`, {
        description: `UTR ${updated.gateway?.utr || variables.reference} recorded.`,
      })
      onClose()
    },
    onError: (err: Error) => {
      const message = err.message || 'Could not mark this payout as paid'
      // Keep the server's message in the dialog, not just in a toast.
      setError(message)
      toast.error(message)
    },
  })

  const submit = () => {
    if (!payout) return
    const reference = utr.trim()
    if (!reference) {
      // Blocked client-side — the API returns 400 without a UTR.
      setError('A UTR or bank reference is required before this payout can be recorded as paid.')
      return
    }
    setError(null)
    markPaidM.mutate({ payoutId: payout._id, reference, noteText: note.trim() || undefined })
  }

  return (
    <Dialog
      open={Boolean(payout)}
      onOpenChange={(next) => {
        if (!next && !markPaidM.isPending) onClose()
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mark payout {payout?.payoutNumber} as paid</DialogTitle>
          <DialogDescription>
            This confirms the money has <span className="font-semibold">actually left your bank</span> and
            reached the vendor. The reserved ledger entries become settled and the payout becomes Paid — it
            cannot be reversed from this screen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <DetailRow label="Vendor" value={payout ? paymentVendorName(payout) : '—'} />
            <DetailRow label="Amount" value={payout ? formatCurrency(payout.amount) : '—'} />
            <DetailRow label="Method" value={payout ? payoutMethodLabel(payout.method) : '—'} />
            <DetailRow label="Period" value={payout ? payoutPeriodLabel(payout) : '—'} />
          </div>

          <div>
            <Label htmlFor="payout-utr" className="mb-1 block text-xs font-medium text-slate-500">
              UTR / bank reference <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="payout-utr"
              value={utr}
              onChange={(event) => {
                setUtr(event.target.value)
                if (error) setError(null)
              }}
              placeholder="e.g. HDFCN52026091200123456"
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-slate-500">
              Required — the API rejects a mark-paid without a reference, and this is what finance reconciles
              against the bank statement.
            </p>
          </div>

          <div>
            <Label htmlFor="payout-utr-note" className="mb-1 block text-xs font-medium text-slate-500">
              Note (optional)
            </Label>
            <Textarea
              id="payout-utr-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              placeholder="e.g. Paid from the ICICI current account"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={markPaidM.isPending}>
            Cancel
          </Button>
          <Button className={PRIMARY_BTN} onClick={submit} disabled={markPaidM.isPending}>
            {markPaidM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm paid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
