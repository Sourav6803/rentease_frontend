'use client'

/**
 * app/(admin)/admin/payments/page.tsx
 *
 * Admin → Payments → Transactions.
 *
 * Lists every payment captured by the platform, with filter-driven KPIs, a
 * responsive table (cards on mobile), a detail sheet and an inline refund flow.
 *
 * Data flows only through `adminPaymentsApi` (never axios directly) and React
 * Query keys come from `adminPaymentQueryKeys` so a refund invalidates every
 * filtered view of the same list.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquareWarning,
  Receipt,
  RefreshCw,
  Search,
  Undo2,
  Wallet,
  X,
  XCircle,
} from 'lucide-react'

import { adminPaymentsApi } from '@/lib/api/adminPayments'
import { adminPaymentQueryKeys } from '@/lib/api/queryKeys'
import {
  asPopulated,
  paymentCustomerName,
  paymentVendorName,
  type Payment,
  type PaymentListFilters,
  type PaymentMethod,
  type PaymentStatus,
  type PaymentType,
} from '@/types/admin-payments.types'
import {
  CardListSkeleton,
  DetailRow,
  EmptyState,
  ErrorState,
  FilterBar,
  FilterField,
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

const STATUS_OPTIONS: PaymentStatus[] = [
  'pending',
  'processing',
  'success',
  'failed',
  'refunded',
  'cancelled',
]

const METHOD_OPTIONS: PaymentMethod[] = [
  'credit_card',
  'debit_card',
  'upi',
  'net_banking',
  'wallet',
  'cash',
  'bank_transfer',
]

const TYPE_OPTIONS: PaymentType[] = [
  'security_deposit',
  'rent',
  'delivery',
  'late_fee',
  'damage_charge',
  'extension',
  'refund',
]

interface FilterState {
  status: string
  method: string
  type: string
  startDate: string
  endDate: string
}

const DEFAULT_FILTERS: FilterState = {
  status: 'all',
  method: 'all',
  type: 'all',
  startDate: '',
  endDate: '',
}

/** Remaining amount that can still be refunded on a payment. */
function refundableBalance(payment: Payment): number {
  return Math.max(0, payment.amount - (payment.refundDetails?.amount ?? 0))
}

export default function AdminTransactionsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Detail sheet + refund dialog state.
  const [selected, setSelected] = useState<Payment | null>(null)
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [amountInput, setAmountInput] = useState('')
  const [reasonInput, setReasonInput] = useState('')

  // Debounce the free-text search and always jump back to page 1 on change.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(handle)
  }, [searchInput])

  const params = useMemo<PaymentListFilters>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      status: filters.status === 'all' ? undefined : (filters.status as PaymentStatus),
      method: filters.method === 'all' ? undefined : (filters.method as PaymentMethod),
      type: filters.type === 'all' ? undefined : (filters.type as PaymentType),
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    }),
    [page, search, filters],
  )

  const listQuery = useQuery({
    queryKey: [...adminPaymentQueryKeys.payments, params],
    queryFn: () => adminPaymentsApi.listPayments(params),
    placeholderData: keepPreviousData,
  })

  const payments = listQuery.data?.payments ?? []
  const totals = listQuery.data?.totals
  const pagination = listQuery.data?.pagination

  const hasFilters =
    search.trim() !== '' ||
    filters.status !== 'all' ||
    filters.method !== 'all' ||
    filters.type !== 'all' ||
    filters.startDate !== '' ||
    filters.endDate !== ''

  const resetFilters = () => {
    setSearchInput('')
    setSearch('')
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  const setFilter = (key: keyof FilterState, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  // Keep the open sheet in sync with the freshest list data (e.g. after a refund
  // the row's refundDetails update, so the sheet reflects the new balance).
  const selectedPayment = useMemo(() => {
    if (!selected) return null
    return payments.find((payment) => payment._id === selected._id) ?? selected
  }, [selected, payments])

  const refundMutation = useMutation({
    mutationFn: (vars: { paymentId: string; amount: number; reason: string }) =>
      adminPaymentsApi.processRefund(vars.paymentId, { amount: vars.amount, reason: vars.reason }),
    onSuccess: (result) => {
      toast.success('Refund processed', {
        description: `${formatCurrency(result.payment.refundDetails?.amount ?? result.payment.amount)} refunded on ${result.payment.paymentNumber}.`,
      })
      void queryClient.invalidateQueries({ queryKey: adminPaymentQueryKeys.payments })
      setSelected(result.payment)
      setRefundTarget(null)
      setConfirming(false)
    },
  })

  const openRefundDialog = (payment: Payment) => {
    refundMutation.reset()
    setConfirming(false)
    setReasonInput('')
    setAmountInput(String(refundableBalance(payment) || payment.amount))
    setRefundTarget(payment)
    setSelected(null)
  }

  const closeRefundDialog = () => {
    if (refundMutation.isPending) return
    setRefundTarget(null)
    setConfirming(false)
  }

  const targetBalance = refundTarget ? refundableBalance(refundTarget) : 0
  const parsedAmount = Number.parseFloat(amountInput)
  const amountError =
    amountInput.trim() === ''
      ? 'Enter a refund amount.'
      : !Number.isFinite(parsedAmount) || parsedAmount <= 0
        ? 'Amount must be greater than 0.'
        : parsedAmount > targetBalance
          ? `Amount cannot exceed the refundable balance of ${formatCurrency(targetBalance)}.`
          : null
  const reasonError = reasonInput.trim() === '' ? 'A reason is required.' : null
  const refundFormValid = !amountError && !reasonError
  const refundApiError =
    refundMutation.error instanceof Error
      ? refundMutation.error.message
      : refundMutation.error
        ? 'The refund could not be processed.'
        : null

  const submitRefund = () => {
    if (!refundTarget || !refundFormValid) return
    refundMutation.mutate({
      paymentId: refundTarget._id,
      amount: Math.round(parsedAmount * 100) / 100,
      reason: reasonInput.trim(),
    })
  }

  const isInitialLoading = listQuery.isLoading && !listQuery.data
  const showList = !listQuery.isError && !isInitialLoading && payments.length > 0

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-5">
        {/* KPI row — driven by the list's own `totals`, so it respects filters. */}
        <StatGrid columns={6}>
          <StatCard
            label="Total collected"
            value={totals ? formatCompactCurrency(totals.totalCollected) : '—'}
            sub={totals ? `${formatNumber(totals.successfulPayments)} successful` : undefined}
            icon={Wallet}
            accent="text-emerald-600"
            accentBg="bg-emerald-50"
            loading={!totals}
          />
          <StatCard
            label="Successful"
            value={totals ? formatNumber(totals.successfulPayments) : '—'}
            sub="completed payments"
            icon={CheckCircle2}
            accent="text-blue-600"
            accentBg="bg-blue-50"
            loading={!totals}
          />
          <StatCard
            label="Pending"
            value={totals ? formatNumber(totals.pending.count) : '—'}
            sub={totals ? formatCurrency(totals.pending.amount) : undefined}
            icon={Clock}
            accent="text-amber-600"
            accentBg="bg-amber-50"
            tone="warning"
            loading={!totals}
          />
          <StatCard
            label="Failed"
            value={totals ? formatNumber(totals.failed.count) : '—'}
            sub={totals ? formatCurrency(totals.failed.amount) : undefined}
            icon={XCircle}
            accent="text-rose-600"
            accentBg="bg-rose-50"
            tone="danger"
            loading={!totals}
          />
          <StatCard
            label="Refunded"
            value={totals ? formatNumber(totals.refunded.count) : '—'}
            sub={totals ? formatCurrency(totals.refunded.amount) : undefined}
            icon={Undo2}
            accent="text-violet-600"
            accentBg="bg-violet-50"
            loading={!totals}
          />
          <StatCard
            label="Average ticket"
            value={totals ? formatCurrency(totals.averageTicket) : '—'}
            sub="per successful payment"
            icon={Receipt}
            accent="text-indigo-600"
            accentBg="bg-indigo-50"
            loading={!totals}
          />
        </StatGrid>

        <SectionCard
          flush
          title="Transactions"
          description={
            pagination
              ? `${formatNumber(pagination.total)} payment${pagination.total === 1 ? '' : 's'}${
                  hasFilters ? ' matching your filters' : ''
                }`
              : 'Every payment captured across the platform'
          }
          actions={
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => void listQuery.refetch()}
              disabled={listQuery.isFetching}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', listQuery.isFetching && 'animate-spin')} />
              Refresh
            </Button>
          }
        >
          <FilterBar
            actions={
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={resetFilters}
                disabled={!hasFilters}
              >
                <X className="h-3.5 w-3.5" />
                Reset
              </Button>
            }
          >
            <FilterField label="Search">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Payment no. or gateway id…"
                  className="pl-8"
                />
              </div>
            </FilterField>

            <FilterField label="Status">
              <Select value={filters.status} onValueChange={(value) => setFilter('status', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {humanise(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Method">
              <Select value={filters.method} onValueChange={(value) => setFilter('method', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All methods</SelectItem>
                  {METHOD_OPTIONS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {humanise(method)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Type">
              <Select value={filters.type} onValueChange={(value) => setFilter('type', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {humanise(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="From">
              <Input
                type="date"
                value={filters.startDate}
                max={filters.endDate || undefined}
                onChange={(event) => setFilter('startDate', event.target.value)}
              />
            </FilterField>

            <FilterField label="To">
              <Input
                type="date"
                value={filters.endDate}
                min={filters.startDate || undefined}
                onChange={(event) => setFilter('endDate', event.target.value)}
              />
            </FilterField>
          </FilterBar>

          {listQuery.isError ? (
            <ErrorState
              message={listQuery.error instanceof Error ? listQuery.error.message : undefined}
              onRetry={() => void listQuery.refetch()}
            />
          ) : isInitialLoading ? (
            <>
              <div className="hidden md:block">
                <TableSkeleton rows={8} columns={8} />
              </div>
              <div className="md:hidden">
                <CardListSkeleton count={6} />
              </div>
            </>
          ) : payments.length === 0 ? (
            hasFilters ? (
              <EmptyState
                title="No payments match your filters"
                description="Try a different search term or date range, or reset the filters to see everything."
                icon={Search}
                action={
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="No payments yet"
                description="As soon as customers start paying, their transactions will show up here."
              />
            )
          ) : (
            <div className={cn('transition-opacity', listQuery.isFetching && 'opacity-60')}>
              {/* Desktop table */}
              <div className="hidden md:block">
                <TableScroll>
                  <table className="w-full border-collapse">
                    <thead className="border-b border-slate-100 bg-slate-50/70">
                      <tr>
                        <Th>Payment</Th>
                        <Th>Customer</Th>
                        <Th>Vendor</Th>
                        <Th>Type</Th>
                        <Th>Method</Th>
                        <Th align="right">Amount</Th>
                        <Th>Status</Th>
                        <Th>Date</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map((payment) => (
                        <tr
                          key={payment._id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelected(payment)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setSelected(payment)
                            }
                          }}
                          className="cursor-pointer transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                        >
                          <Td className="font-semibold text-slate-900">{payment.paymentNumber}</Td>
                          <Td>{paymentCustomerName(payment)}</Td>
                          <Td>{paymentVendorName(payment)}</Td>
                          <Td>{humanise(payment.type)}</Td>
                          <Td>{humanise(payment.method)}</Td>
                          <Td align="right" className="font-semibold text-slate-900">
                            {formatCurrency(payment.amount)}
                          </Td>
                          <Td>
                            <StatusBadge status={payment.status} />
                          </Td>
                          <Td className="text-slate-500">{formatDateShort(payment.createdAt)}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableScroll>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-4 md:hidden">
                {payments.map((payment) => (
                  <MobileCard
                    key={payment._id}
                    title={payment.paymentNumber}
                    subtitle={paymentCustomerName(payment)}
                    status={payment.status}
                    amount={formatCurrency(payment.amount)}
                    onClick={() => setSelected(payment)}
                    rows={[
                      { label: 'Vendor', value: paymentVendorName(payment) },
                      { label: 'Type', value: humanise(payment.type) },
                      { label: 'Method', value: humanise(payment.method) },
                      { label: 'Date', value: formatDateShort(payment.createdAt) },
                    ]}
                  />
                ))}
              </div>
            </div>
          )}

          {pagination && pagination.total > 0 && (
            <PaginationBar
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          )}
        </SectionCard>

        <PaymentDetailSheet
          payment={selectedPayment}
          open={selectedPayment !== null}
          onOpenChange={(open) => {
            if (!open) setSelected(null)
          }}
          onRefund={openRefundDialog}
        />

        {/* Refund dialog */}
        <Dialog
          open={refundTarget !== null}
          onOpenChange={(open) => {
            if (!open) closeRefundDialog()
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Refund payment</DialogTitle>
              <DialogDescription>
                {refundTarget ? (
                  <>
                    Refund against{' '}
                    <span className="font-medium text-slate-700">{refundTarget.paymentNumber}</span> ·
                    original amount {formatCurrency(refundTarget.amount)}
                  </>
                ) : (
                  'Refund a successful payment.'
                )}
              </DialogDescription>
            </DialogHeader>

            {!confirming ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="refund-amount">Refund amount</Label>
                  <Input
                    id="refund-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={amountInput}
                    onChange={(event) => setAmountInput(event.target.value)}
                  />
                  <p className="text-xs text-slate-500">
                    Refundable balance: {formatCurrency(targetBalance)}
                  </p>
                  {amountError && <p className="text-xs font-medium text-rose-600">{amountError}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="refund-reason">
                    Reason <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    id="refund-reason"
                    rows={3}
                    value={reasonInput}
                    onChange={(event) => setReasonInput(event.target.value)}
                    placeholder="Why is this payment being refunded?"
                  />
                  {reasonError && <p className="text-xs font-medium text-rose-600">{reasonError}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-sm text-slate-700">
                    This will refund{' '}
                    <span className="font-semibold text-slate-900">{formatCurrency(parsedAmount)}</span>{' '}
                    immediately and cannot be undone.
                  </p>
                </div>
                <div className="rounded-lg bg-white/70 p-2.5">
                  <DetailRow label="Payment" value={refundTarget?.paymentNumber ?? '—'} />
                  <DetailRow label="Amount" value={formatCurrency(parsedAmount)} emphasis="total" />
                  <DetailRow label="Reason" value={reasonInput.trim()} />
                </div>
              </div>
            )}

            {refundApiError && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <MessageSquareWarning className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{refundApiError}</span>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={closeRefundDialog} disabled={refundMutation.isPending}>
                Cancel
              </Button>
              {!confirming ? (
                <Button onClick={() => setConfirming(true)} disabled={!refundFormValid}>
                  Continue
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setConfirming(false)}
                    disabled={refundMutation.isPending}
                  >
                    Back
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={submitRefund}
                    disabled={refundMutation.isPending}
                  >
                    {refundMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Undo2 className="h-3.5 w-3.5" />
                    )}
                    Confirm refund
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// ── Detail sheet ─────────────────────────────────────────────────────────────

interface PaymentDetailSheetProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRefund: (payment: Payment) => void
}

function PaymentDetailSheet({ payment, open, onOpenChange, onRefund }: PaymentDetailSheetProps) {
  const user = payment ? asPopulated(payment.user) : null
  const rental = payment ? asPopulated(payment.rental) : null
  const vendor = payment ? asPopulated(payment.vendor) : null

  const details = payment?.paymentDetails
  const breakdown = details?.breakdown

  const remaining = payment ? refundableBalance(payment) : 0
  const isSuccess = payment?.status === 'success'
  const canRefund = payment !== null && isSuccess && remaining > 0
  const refundDisabledReason = !payment
    ? ''
    : !isSuccess
      ? `Only successful payments can be refunded — this one is ${humanise(payment.status).toLowerCase()}.`
      : remaining <= 0
        ? 'This payment has already been fully refunded.'
        : ''

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="gap-0 p-0">
        {payment && (
          <>
            <SheetHeader className="gap-1.5 border-b border-slate-100 pr-12">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-base font-semibold text-slate-900">
                  {payment.paymentNumber}
                </SheetTitle>
                <StatusBadge status={payment.status} />
              </div>
              <SheetDescription>
                {formatCurrency(payment.amount)} · {humanise(payment.type)} ·{' '}
                {formatDateTime(payment.createdAt)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
              {payment.failureReason && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Payment failed</p>
                    <p className="mt-0.5 text-xs">{payment.failureReason}</p>
                  </div>
                </div>
              )}

              <SheetSection title="Payment details">
                <DetailRow label="Customer" value={paymentCustomerName(payment)} />
                {user?.email && <DetailRow label="Email" value={user.email} emphasis="muted" />}
                {user?.phone && <DetailRow label="Phone" value={user.phone} emphasis="muted" />}
                <DetailRow label="Vendor" value={paymentVendorName(payment)} />
                {vendor?.vendorId && <DetailRow label="Vendor ID" value={vendor.vendorId} emphasis="muted" />}
                <DetailRow
                  label="Rental"
                  value={rental?.rentalNumber || (typeof payment.rental === 'string' ? payment.rental : '—')}
                />
                {rental?.startDate && (
                  <DetailRow
                    label="Rental period"
                    value={`${formatDateOnly(rental.startDate)} – ${formatDateOnly(rental.endDate)}`}
                  />
                )}
                <DetailRow label="Method" value={humanise(payment.method)} />
                <DetailRow label="Gateway" value={details?.gateway ? humanise(details.gateway) : '—'} />
              </SheetSection>

              {(details?.razorpayPaymentId ||
                details?.razorpayOrderId ||
                details?.transactionId ||
                details?.referenceNumber) && (
                <SheetSection title="Gateway references">
                  {details?.razorpayPaymentId && (
                    <DetailRow label="Razorpay payment" value={<Mono>{details.razorpayPaymentId}</Mono>} />
                  )}
                  {details?.razorpayOrderId && (
                    <DetailRow label="Razorpay order" value={<Mono>{details.razorpayOrderId}</Mono>} />
                  )}
                  {details?.transactionId && (
                    <DetailRow label="Transaction ID" value={<Mono>{details.transactionId}</Mono>} />
                  )}
                  {details?.referenceNumber && (
                    <DetailRow label="Reference" value={<Mono>{details.referenceNumber}</Mono>} />
                  )}
                </SheetSection>
              )}

              <SheetSection title="Fee breakdown">
                {breakdown ? (
                  <div>
                    <DetailRow label="Base amount" value={formatCurrency(breakdown.baseAmount)} />
                    {typeof breakdown.discount === 'number' && breakdown.discount !== 0 && (
                      <DetailRow label="Discount" value={`− ${formatCurrency(breakdown.discount)}`} />
                    )}
                    <DetailRow label="Taxable amount" value={formatCurrency(breakdown.taxableAmount)} />
                    {typeof breakdown.commission === 'number' && (
                      <DetailRow
                        label="Commission"
                        value={
                          <Stacked
                            primary={formatCurrency(breakdown.commission)}
                            secondary={
                              typeof breakdown.commissionRate === 'number' || breakdown.commissionSource
                                ? `${typeof breakdown.commissionRate === 'number' ? `${breakdown.commissionRate}${breakdown.commissionType === 'fixed' ? '' : '%'}` : ''}${
                                    breakdown.commissionSource ? `${typeof breakdown.commissionRate === 'number' ? ' · ' : ''}${breakdown.commissionSource}` : ''
                                  }`
                                : undefined
                            }
                          />
                        }
                      />
                    )}
                    {typeof breakdown.platformFee === 'number' && (
                      <DetailRow label="Platform fee" value={formatCurrency(breakdown.platformFee)} />
                    )}
                    {typeof breakdown.tax === 'number' && (
                      <DetailRow
                        label="Tax"
                        value={
                          <Stacked
                            primary={formatCurrency(breakdown.tax)}
                            secondary={
                              typeof breakdown.taxRate === 'number' ? `${breakdown.taxRate}%` : undefined
                            }
                          />
                        }
                      />
                    )}
                    {typeof breakdown.convenienceFee === 'number' && (
                      <DetailRow label="Convenience fee" value={formatCurrency(breakdown.convenienceFee)} />
                    )}
                    <DetailRow
                      label="Total"
                      value={formatCurrency(breakdown.total ?? payment.amount)}
                      emphasis="total"
                    />
                    {typeof breakdown.vendorNet === 'number' && (
                      <DetailRow label="Vendor net" value={formatCurrency(breakdown.vendorNet)} />
                    )}
                    {typeof breakdown.platformNet === 'number' && (
                      <DetailRow label="Platform net" value={formatCurrency(breakdown.platformNet)} />
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm text-slate-600">
                      No fee breakdown was recorded for this payment. Legacy payments created before the
                      fee engine existed do not carry a commission/tax split.
                    </p>
                    <div className="mt-2">
                      <DetailRow
                        label="Amount"
                        value={formatCurrency(payment.amount)}
                        emphasis="total"
                      />
                    </div>
                  </div>
                )}
              </SheetSection>

              {payment.refundDetails &&
                (payment.refundDetails.amount !== undefined || payment.refundDetails.reason) && (
                  <SheetSection title="Refund">
                    <DetailRow label="Refunded" value={formatCurrency(payment.refundDetails.amount)} />
                    {payment.refundDetails.reason && (
                      <DetailRow label="Reason" value={payment.refundDetails.reason} />
                    )}
                    {payment.refundDetails.processedAt && (
                      <DetailRow
                        label="Processed"
                        value={formatDateTime(payment.refundDetails.processedAt)}
                        emphasis="muted"
                      />
                    )}
                    <DetailRow label="Refundable balance" value={formatCurrency(remaining)} />
                  </SheetSection>
                )}
            </div>

            <div className="border-t border-slate-100 p-4">
              {canRefund ? (
                <Button className="w-full gap-1.5" onClick={() => onRefund(payment)}>
                  <Undo2 className="h-4 w-4" />
                  Refund payment
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block w-full" tabIndex={0}>
                      <Button className="w-full gap-1.5" disabled>
                        <Undo2 className="h-4 w-4" />
                        Refund payment
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{refundDisabledReason}</TooltipContent>
                </Tooltip>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ── Small presentational helpers ─────────────────────────────────────────────

function SheetSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      <div className="rounded-xl border border-slate-100 bg-white p-3">{children}</div>
    </section>
  )
}

function Mono({ children }: { children: ReactNode }) {
  return <span className="font-mono text-xs text-slate-600">{children}</span>
}

function Stacked({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <span className="flex flex-col items-end leading-tight">
      <span>{primary}</span>
      {secondary && <span className="text-[11px] font-normal text-slate-400">{secondary}</span>}
    </span>
  )
}
