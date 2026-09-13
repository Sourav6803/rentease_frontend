'use client'

/**
 * /admin/payments/refunds
 *
 * Refund operations console:
 *  - KPIs computed from the server's refund totals (never from the visible page).
 *  - A filterable, paginated history where every row is the underlying PAYMENT,
 *    carrying its refundDetails.
 *  - A detail sheet with the refund trace and the post-refund fee split.
 *  - A "Refund a payment" dialog that searches successful payments and issues a
 *    partial or full refund through adminPaymentsApi.processRefund.
 *
 * All data flows through React Query + adminPaymentsApi — no axios here.
 */

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Percent, Plus, Receipt, Search, TrendingDown, Undo2, X } from 'lucide-react'

import { adminPaymentsApi } from '@/lib/api/adminPayments'
import { adminPaymentQueryKeys } from '@/lib/api/queryKeys'
import type { Payment } from '@/types/admin-payments.types'
import { paymentCustomerName, paymentVendorName } from '@/types/admin-payments.types'
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
  formatDateShort,
  formatDateTime,
  formatNumber,
  humanise,
  startOfMonthValue,
  todayValue,
} from '@/components/admin/payments/payment-format'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

/** Refunded amount for a payment row, tolerating a refunded status with no detail. */
function refundedAmountOf(payment: Payment): number {
  const explicit = payment.refundDetails?.amount
  if (typeof explicit === 'number' && Number.isFinite(explicit)) return explicit
  return payment.status === 'refunded' ? payment.amount : 0
}

/** Remaining amount still refundable on a payment. */
function remainingRefundableOf(payment: Payment): number {
  return Math.max(0, payment.amount - (payment.refundDetails?.amount ?? 0))
}

export default function AdminRefundsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()

  const defaultFrom = useMemo(() => startOfMonthValue(), [])
  const defaultTo = useMemo(() => todayValue(), [])

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [vendor, setVendor] = useState('')
  const [startDate, setStartDate] = useState(defaultFrom)
  const [endDate, setEndDate] = useState(defaultTo)
  const [page, setPage] = useState(1)

  // Debounce the free-text search; every filter change resets to page 1.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const refundsQuery = useQuery({
    queryKey: [
      ...adminPaymentQueryKeys.refunds,
      { page, limit: PAGE_SIZE, search, vendor, startDate, endDate },
    ],
    queryFn: () =>
      adminPaymentsApi.listRefunds({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        vendor: vendor || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  })

  const data = refundsQuery.data
  const refunds = data?.refunds ?? []
  const totals = data?.totals
  const pagination = data?.pagination

  const hasActiveFilters =
    search.trim() !== '' ||
    vendor.trim() !== '' ||
    startDate !== defaultFrom ||
    endDate !== defaultTo

  function resetFilters() {
    setSearchInput('')
    setSearch('')
    setVendor('')
    setStartDate(defaultFrom)
    setEndDate(defaultTo)
    setPage(1)
  }

  const refundedAmount = totals?.refundedAmount ?? 0
  const originalAmount = totals?.originalAmount ?? 0
  const refundCount = totals?.refundCount ?? 0
  const refundRate = totals?.refundRate ?? 0
  const averageRefund = refundCount > 0 ? refundedAmount / refundCount : 0

  const [selected, setSelected] = useState<Payment | null>(null)
  const [refundOpen, setRefundOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm sm:flex">
              <Undo2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Refunds</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Review refunded payments and issue new refunds against successful transactions.
                Every figure below comes straight from the payments service.
              </p>
            </div>
          </div>
          <Button
            className="gap-2 border-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm hover:from-indigo-500 hover:to-blue-500"
            onClick={() => setRefundOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Refund a payment
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <StatGrid columns={4}>
        <StatCard
          label="Total refunded"
          value={formatCompactCurrency(refundedAmount)}
          sub={`${formatNumber(refundCount)} refund${refundCount === 1 ? '' : 's'}`}
          icon={Undo2}
          accent="text-rose-600"
          accentBg="bg-rose-50"
          loading={refundsQuery.isLoading}
        />
        <StatCard
          label="Original value of refunded payments"
          value={formatCompactCurrency(originalAmount)}
          sub="Gross charged before refunds"
          icon={Receipt}
          accent="text-slate-600"
          accentBg="bg-slate-100"
          loading={refundsQuery.isLoading}
        />
        <StatCard
          label="Refund rate"
          value={`${refundRate.toFixed(1)}%`}
          sub={refundRate > 5 ? 'Above the 5% watch threshold' : 'Share of everything ever charged'}
          icon={Percent}
          accent={refundRate > 5 ? 'text-amber-600' : 'text-indigo-600'}
          accentBg={refundRate > 5 ? 'bg-amber-50' : 'bg-indigo-50'}
          tone={refundRate > 5 ? 'warning' : 'default'}
          loading={refundsQuery.isLoading}
        />
        <StatCard
          label="Average refund"
          value={formatCompactCurrency(averageRefund)}
          sub="Per refunded payment"
          icon={TrendingDown}
          accent="text-violet-600"
          accentBg="bg-violet-50"
          loading={refundsQuery.isLoading}
        />
      </StatGrid>

      {/* History */}
      <SectionCard
        title="Refund history"
        description="Payments that have been refunded in whole or in part."
        flush
      >
        <FilterBar
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </Button>
          }
        >
          <FilterField label="Search">
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Payment number or refund txn id"
            />
          </FilterField>
          <FilterField label="From">
            <Input
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value)
                setPage(1)
              }}
            />
          </FilterField>
          <FilterField label="To">
            <Input
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value)
                setPage(1)
              }}
            />
          </FilterField>
          <FilterField label="Vendor">
            <Input
              value={vendor}
              onChange={(event) => {
                setVendor(event.target.value)
                setPage(1)
              }}
              placeholder="Vendor name or ID"
            />
          </FilterField>
        </FilterBar>

        {refundsQuery.isLoading ? (
          <>
            <div className="hidden md:block">
              <TableSkeleton columns={8} rows={6} />
            </div>
            <div className="md:hidden">
              <CardListSkeleton count={5} />
            </div>
          </>
        ) : refundsQuery.isError ? (
          <ErrorState
            message={
              refundsQuery.error instanceof Error
                ? refundsQuery.error.message
                : 'Refunds could not be loaded.'
            }
            onRetry={() => refundsQuery.refetch()}
          />
        ) : refunds.length === 0 ? (
          <EmptyState
            icon={Undo2}
            title={hasActiveFilters ? 'No refunds in this period' : 'No refunds yet'}
            description={
              hasActiveFilters
                ? 'No refunds match the current filters. Try widening the date range or clearing the filters.'
                : 'Refunds you process against successful payments will appear here.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <TableScroll>
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <Th>Payment</Th>
                      <Th>Customer</Th>
                      <Th>Vendor</Th>
                      <Th align="right">Original</Th>
                      <Th align="right">Refunded</Th>
                      <Th>Reason</Th>
                      <Th>Status</Th>
                      <Th align="right">Refunded at</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {refunds.map((payment) => {
                      const reason = payment.refundDetails?.reason
                      return (
                        <tr
                          key={payment._id}
                          onClick={() => setSelected(payment)}
                          className="cursor-pointer transition-colors hover:bg-slate-50"
                        >
                          <Td className="font-medium text-slate-900">{payment.paymentNumber}</Td>
                          <Td>{paymentCustomerName(payment)}</Td>
                          <Td>{paymentVendorName(payment)}</Td>
                          <Td align="right">{formatCurrency(payment.amount)}</Td>
                          <Td align="right" className="font-semibold text-rose-600">
                            {formatCurrency(refundedAmountOf(payment))}
                          </Td>
                          <Td>
                            <span
                              title={reason || humanise(payment.type)}
                              className="block max-w-[220px] truncate"
                            >
                              {reason || '—'}
                            </span>
                          </Td>
                          <Td>
                            <StatusBadge status={payment.status} />
                          </Td>
                          <Td align="right">
                            {formatDateShort(
                              payment.refundDetails?.processedAt || payment.timestamps?.refunded,
                            )}
                          </Td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </TableScroll>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 md:hidden">
              {refunds.map((payment) => (
                <MobileCard
                  key={payment._id}
                  title={payment.paymentNumber}
                  subtitle={`${paymentCustomerName(payment)} · ${paymentVendorName(payment)}`}
                  status={payment.status}
                  amount={formatCurrency(refundedAmountOf(payment))}
                  onClick={() => setSelected(payment)}
                  rows={[
                    { label: 'Original', value: formatCurrency(payment.amount) },
                    { label: 'Reason', value: payment.refundDetails?.reason || '—' },
                    {
                      label: 'Refunded',
                      value: formatDateShort(
                        payment.refundDetails?.processedAt || payment.timestamps?.refunded,
                      ),
                    },
                  ]}
                />
              ))}
            </div>
          </>
        )}

        {!refundsQuery.isLoading && !refundsQuery.isError && pagination && (
          <PaginationBar
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        )}
      </SectionCard>

      {/* Detail sheet */}
      <RefundDetailSheet payment={selected} onClose={() => setSelected(null)} />

      {/* Refund entry point */}
      <RefundPaymentDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        onSuccess={() => toast.success('Refund processed')}
      />
    </div>
  )
}

// ── Detail sheet ──────────────────────────────────────────────────────────────

function RefundDetailSheet({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
  const breakdown = payment?.paymentDetails?.breakdown

  return (
    <Sheet open={Boolean(payment)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {payment && (
          <>
            <SheetHeader>
              <SheetTitle>{payment.paymentNumber}</SheetTitle>
              <SheetDescription>
                {paymentCustomerName(payment)} · {paymentVendorName(payment)}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 px-4 pb-6">
              <div className="rounded-xl border border-slate-200 p-3">
                <DetailRow label="Status" value={<StatusBadge status={payment.status} />} />
                <DetailRow label="Payment type" value={humanise(payment.type)} />
                <DetailRow label="Method" value={humanise(payment.method)} />
                <DetailRow label="Original amount" value={formatCurrency(payment.amount)} />
                <DetailRow label="Created" value={formatDateTime(payment.createdAt)} />
              </div>

              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-700">
                  Refund
                </p>
                <DetailRow
                  label="Refunded amount"
                  value={formatCurrency(refundedAmountOf(payment))}
                />
                <DetailRow label="Reason" value={payment.refundDetails?.reason || '—'} />
                <DetailRow
                  label="Processed at"
                  value={formatDateTime(
                    payment.refundDetails?.processedAt || payment.timestamps?.refunded,
                  )}
                />
                <DetailRow
                  label="Transaction ID"
                  value={payment.refundDetails?.transactionId || '—'}
                />
                <DetailRow label="Processed by" value={payment.refundDetails?.processedBy || '—'} />
              </div>

              {breakdown && (
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fee breakdown
                  </p>
                  <DetailRow label="Taxable amount" value={formatCurrency(breakdown.taxableAmount)} />
                  <DetailRow label="Discount" value={formatCurrency(breakdown.discount)} />
                  <DetailRow label="Commission" value={formatCurrency(breakdown.commission)} />
                  <DetailRow label="Platform fee" value={formatCurrency(breakdown.platformFee)} />
                  <DetailRow label="Tax" value={formatCurrency(breakdown.tax)} />
                  <DetailRow
                    label="Convenience fee"
                    value={formatCurrency(breakdown.convenienceFee)}
                  />
                  <DetailRow
                    label="Total charged"
                    value={formatCurrency(breakdown.total)}
                    emphasis="total"
                  />
                  <DetailRow label="Vendor net" value={formatCurrency(breakdown.vendorNet)} />
                  <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500">
                    The vendor&apos;s share was reduced proportionally to this refund — the split
                    above reflects the post-refund amounts.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ── Refund dialog ─────────────────────────────────────────────────────────────

function RefundPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const queryClient = useQueryClient()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Payment | null>(null)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Reset everything whenever the dialog closes.
  useEffect(() => {
    if (!open) {
      setSearchInput('')
      setSearch('')
      setSelected(null)
      setAmount('')
      setReason('')
      setStep('form')
      setFormError(null)
    }
  }, [open])

  const paymentsQuery = useQuery({
    queryKey: [...adminPaymentQueryKeys.payments, 'refund-picker', { search }],
    queryFn: () => adminPaymentsApi.listPayments({ status: 'success', search: search || undefined, limit: 10 }),
    enabled: open,
  })

  const candidates = paymentsQuery.data?.payments ?? []
  const remaining = selected ? remainingRefundableOf(selected) : 0

  const refundMutation = useMutation({
    mutationFn: (variables: { id: string; amount: number; reason: string }) =>
      adminPaymentsApi.processRefund(variables.id, {
        amount: variables.amount,
        reason: variables.reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPaymentQueryKeys.refunds })
      queryClient.invalidateQueries({ queryKey: adminPaymentQueryKeys.payments })
      onSuccess()
      onOpenChange(false)
    },
  })

  const serverError =
    refundMutation.isError && refundMutation.error instanceof Error
      ? refundMutation.error.message
      : refundMutation.isError
        ? 'The refund could not be processed.'
        : null

  function validate(): string | null {
    if (!selected) return 'Select a payment to refund.'
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return 'Enter a refund amount greater than zero.'
    if (value > remaining) {
      return `Amount cannot exceed the remaining refundable balance of ${formatCurrency(remaining)}.`
    }
    if (!reason.trim()) return 'A reason is required for every refund.'
    return null
  }

  function handleReview() {
    const error = validate()
    if (error) {
      setFormError(error)
      return
    }
    setFormError(null)
    setStep('confirm')
  }

  function handleConfirm() {
    if (!selected) return
    refundMutation.mutate({ id: selected._id, amount: Number(amount), reason: reason.trim() })
  }

  function selectPayment(payment: Payment) {
    setSelected(payment)
    setAmount(String(remainingRefundableOf(payment)))
    setFormError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Refund a payment</DialogTitle>
          <DialogDescription>
            Search a successful payment, then refund part or all of it. Refunds cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? (
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs text-slate-500">Find a successful payment</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by payment number, customer or reference"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="max-h-60 space-y-2 overflow-y-auto">
              {paymentsQuery.isLoading || paymentsQuery.isFetching ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching payments…
                </div>
              ) : paymentsQuery.isError ? (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {paymentsQuery.error instanceof Error
                    ? paymentsQuery.error.message
                    : 'Could not load payments.'}
                </p>
              ) : candidates.length === 0 ? (
                <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                  No successful payments match this search.
                </p>
              ) : (
                candidates.map((payment) => {
                  const left = remainingRefundableOf(payment)
                  const isSelected = selected?._id === payment._id
                  return (
                    <button
                      key={payment._id}
                      type="button"
                      disabled={left <= 0}
                      onClick={() => selectPayment(payment)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-lg border p-2.5 text-left transition-colors',
                        left <= 0 && 'cursor-not-allowed opacity-50',
                        isSelected
                          ? 'border-indigo-300 bg-indigo-50'
                          : 'border-slate-200 hover:bg-slate-50',
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {payment.paymentNumber}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {paymentCustomerName(payment)} · {paymentVendorName(payment)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums text-slate-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Remaining {formatCurrency(left)}
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {selected && (
              <div className="space-y-3 rounded-xl border border-slate-200 p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="refund-amount" className="mb-1.5 block text-xs text-slate-500">
                      Refund amount (₹)
                    </Label>
                    <Input
                      id="refund-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Max {formatCurrency(remaining)} refundable
                    </p>
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs text-slate-500">Original amount</Label>
                    <p className="pt-1.5 text-sm font-semibold tabular-nums text-slate-900">
                      {formatCurrency(selected.amount)}
                    </p>
                    {selected.refundDetails?.amount ? (
                      <p className="mt-1 text-[11px] text-slate-400">
                        Already refunded {formatCurrency(selected.refundDetails.amount)}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div>
                  <Label htmlFor="refund-reason" className="mb-1.5 block text-xs text-slate-500">
                    Reason <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    id="refund-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Why is this payment being refunded?"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {formError && (
              <Alert variant="destructive">
                <AlertTitle>Check the details</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-3">
              <DetailRow label="Payment" value={selected?.paymentNumber || '—'} />
              <DetailRow label="Customer" value={selected ? paymentCustomerName(selected) : '—'} />
              <DetailRow
                label="Refund amount"
                value={formatCurrency(Number(amount))}
                emphasis="total"
              />
              <DetailRow label="Reason" value={reason.trim() || '—'} />
            </div>
            <Alert variant="destructive">
              <AlertTitle>Confirm refund</AlertTitle>
              <AlertDescription>
                This will immediately refund {formatCurrency(Number(amount))} and reduce the
                vendor&apos;s share proportionally. This action cannot be undone.
              </AlertDescription>
            </Alert>
            {serverError && (
              <Alert variant="destructive">
                <AlertTriangleIcon />
                <AlertTitle>Refund failed</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'form' ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                className="border-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500"
                onClick={handleReview}
                disabled={!selected}
              >
                Review refund
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setStep('form')}
                disabled={refundMutation.isPending}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={refundMutation.isPending}
              >
                {refundMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm refund
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Small inline alert icon so the destructive alert keeps a consistent mark. */
function AlertTriangleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
