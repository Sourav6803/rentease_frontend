'use client'

/**
 * /admin/payments/tax
 *
 * Tax & fee summary for a reporting period.
 *
 *  - Every figure comes from GET /payments/admin/tax-summary (adminPaymentsApi
 *    .getTaxSummary) — nothing is derived from a client-side list.
 *  - A period selector (This month / Last month / Last 3 months / This financial
 *    year / Custom) drives the query; the Indian financial year runs 1 April to
 *    31 March and is the default view.
 *  - Legacy payments recorded before the fee engine existed carry no breakdown,
 *    so the server reports them separately and the page warns that the period
 *    totals are incomplete instead of implying they are exact.
 *  - The monthly tax-vs-commission comparison is drawn with plain divs, so no
 *    charting dependency is pulled into the bundle.
 *
 * All data flows through React Query + adminPaymentsApi — no axios here.
 */

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Download,
  FileText,
  IndianRupee,
  Percent,
  Ticket,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { adminPaymentsApi } from '@/lib/api/adminPayments'
import { adminPaymentQueryKeys } from '@/lib/api/queryKeys'
import type { TaxSummaryBlock, TaxSummaryMonth } from '@/types/admin-payments.types'
import {
  DetailRow,
  EmptyState,
  ErrorState,
  FilterField,
  MobileCard,
  SectionCard,
  StatCard,
  StatGrid,
  TableScroll,
  TableSkeleton,
  Td,
  Th,
} from '@/components/admin/payments/PaymentPrimitives'
import {
  formatCompactCurrency,
  formatCurrency,
  formatDateShort,
  formatNumber,
  startOfMonthValue,
  toDateInputValue,
  todayValue,
} from '@/components/admin/payments/payment-format'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// ── Period handling ──────────────────────────────────────────────────────────

type PeriodPreset = 'this-month' | 'last-month' | 'last-3-months' | 'this-fy' | 'custom'

interface PeriodRange {
  startDate: string
  endDate: string
}

const PERIOD_PRESETS: Array<{ value: PeriodPreset; label: string }> = [
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'last-3-months', label: 'Last 3 months' },
  { value: 'this-fy', label: 'This financial year' },
  { value: 'custom', label: 'Custom' },
]

/** First day of the current month through today. */
function thisMonthRange(): PeriodRange {
  return { startDate: startOfMonthValue(), endDate: todayValue() }
}

/** The whole previous calendar month. */
function lastMonthRange(): PeriodRange {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 0)
  return { startDate: toDateInputValue(start), endDate: toDateInputValue(end) }
}

/** The current month plus the two before it, through today. */
function lastThreeMonthsRange(): PeriodRange {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  return { startDate: toDateInputValue(start), endDate: todayValue() }
}

/**
 * Indian financial year to date: 1 April – 31 March.
 * If we are in Jan–Mar the FY began 1 April of the previous calendar year.
 */
function thisFinancialYearRange(): PeriodRange {
  const now = new Date()
  const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  const start = new Date(fyStartYear, 3, 1)
  return { startDate: toDateInputValue(start), endDate: todayValue() }
}

function presetRange(preset: Exclude<PeriodPreset, 'custom'>): PeriodRange {
  switch (preset) {
    case 'this-month':
      return thisMonthRange()
    case 'last-month':
      return lastMonthRange()
    case 'last-3-months':
      return lastThreeMonthsRange()
    case 'this-fy':
      return thisFinancialYearRange()
  }
}

/** Zeroed block so the KPI row never has to null-check the server payload. */
const EMPTY_SUMMARY: TaxSummaryBlock = {
  taxableBase: 0,
  tax: 0,
  commission: 0,
  platformFee: 0,
  convenienceFee: 0,
  discount: 0,
  grossCollected: 0,
  transactions: 0,
  paymentsWithBreakdown: 0,
  paymentsWithoutBreakdown: 0,
  effectiveTaxRate: 0,
}

// ── CSV ──────────────────────────────────────────────────────────────────────

/** Quote a CSV cell when it holds a comma, quote or newline (RFC 4180). */
function escapeCsvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTaxSummaryPage() {
  const [preset, setPreset] = useState<PeriodPreset>('this-fy')
  const [period, setPeriod] = useState<PeriodRange>(() => thisFinancialYearRange())

  const startDate = period.startDate
  const endDate = period.endDate

  const taxQuery = useQuery({
    queryKey: [...adminPaymentQueryKeys.taxSummary, { startDate, endDate }],
    queryFn: () => adminPaymentsApi.getTaxSummary({ startDate, endDate }),
  })

  const data = taxQuery.data
  const summary = data?.summary
  const monthly = useMemo(() => data?.monthly ?? [], [data])

  const loadError =
    taxQuery.error instanceof Error ? taxQuery.error.message : 'The tax summary could not be loaded.'

  // Totals must come from the monthly rows, not from `summary`: the aggregate
  // also counts payments that fall outside the monthly grouping.
  const monthlyTotals = useMemo(
    () =>
      monthly.reduce(
        (acc, month) => ({
          taxableBase: acc.taxableBase + month.taxableBase,
          tax: acc.tax + month.tax,
          commission: acc.commission + month.commission,
          platformFee: acc.platformFee + month.platformFee,
          grossCollected: acc.grossCollected + month.grossCollected,
          transactions: acc.transactions + month.transactions,
        }),
        {
          taxableBase: 0,
          tax: 0,
          commission: 0,
          platformFee: 0,
          grossCollected: 0,
          transactions: 0,
        },
      ),
    [monthly],
  )

  const hasData =
    Boolean(summary) && ((summary?.transactions ?? 0) > 0 || monthly.length > 0)
  const loading = taxQuery.isLoading && !data

  function selectPreset(next: PeriodPreset) {
    setPreset(next)
    if (next !== 'custom') setPeriod(presetRange(next))
  }

  function setCustomBound(field: 'startDate' | 'endDate', value: string) {
    setPeriod((current) => ({ ...current, [field]: value }))
  }

  function handleExport() {
    if (monthly.length === 0) return

    const header = 'Month,Taxable Base,Tax,Commission,Platform Fee,Gross Collected,Transactions'
    const rows = monthly.map((month) =>
      [
        month.label,
        month.taxableBase.toFixed(2),
        month.tax.toFixed(2),
        month.commission.toFixed(2),
        month.platformFee.toFixed(2),
        month.grossCollected.toFixed(2),
        String(month.transactions),
      ]
        .map(escapeCsvCell)
        .join(','),
    )

    const csv = [header, ...rows].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tax-summary-${startDate}-to-${endDate}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const s = summary ?? EMPTY_SUMMARY
  const noBreakdownAtAll = s.transactions > 0 && s.paymentsWithBreakdown === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-sm sm:flex">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tax &amp; fees</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Taxable base, GST collected and platform fees for the selected period, straight
                from the payments ledger.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {formatDateShort(startDate)} – {formatDateShort(endDate)}
          </span>
        </div>
      </div>

      {/* Period selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Reporting period
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PERIOD_PRESETS.map((option) => {
            const active = preset === option.value
            return (
              <Button
                key={option.value}
                size="sm"
                variant={active ? 'default' : 'outline'}
                onClick={() => selectPreset(option.value)}
                className={cn(
                  active &&
                    'border-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm hover:from-indigo-500 hover:to-blue-500',
                )}
              >
                {option.label}
              </Button>
            )
          })}
        </div>
        {preset === 'custom' && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:max-w-md sm:grid-cols-2">
            <FilterField label="From">
              <Input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setCustomBound('startDate', event.target.value)}
              />
            </FilterField>
            <FilterField label="To">
              <Input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setCustomBound('endDate', event.target.value)}
              />
            </FilterField>
          </div>
        )}
      </div>

      {/* Data-quality warning */}
      {!loading && !taxQuery.isError && summary && (s.paymentsWithoutBreakdown > 0 || noBreakdownAtAll) && (
        <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertTriangle className="text-amber-600" />
          <AlertTitle className="text-amber-900">Fee breakdown is incomplete</AlertTitle>
          <AlertDescription className="text-amber-800">
            {s.paymentsWithoutBreakdown > 0 && (
              <p>
                {formatNumber(s.paymentsWithoutBreakdown)} payment
                {s.paymentsWithoutBreakdown === 1 ? '' : 's'} in this period predate fee tracking
                and carry no tax or commission breakdown, so the totals below are incomplete.
              </p>
            )}
            {noBreakdownAtAll && (
              <p>No payment in this period has a recorded fee breakdown.</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <>
          <StatGrid columns={3}>
            {Array.from({ length: 6 }).map((_, index) => (
              <StatCard key={index} label="" value="" icon={IndianRupee} loading />
            ))}
          </StatGrid>
          <SectionCard title="Monthly breakdown" flush>
            <TableSkeleton columns={7} rows={6} />
          </SectionCard>
        </>
      ) : taxQuery.isError ? (
        <SectionCard>
          <ErrorState message={loadError} onRetry={() => taxQuery.refetch()} />
        </SectionCard>
      ) : !hasData ? (
        <SectionCard>
          <EmptyState
            icon={BarChart3}
            title="No tax data in this period"
            description="No payments with a recorded fee breakdown fall inside the selected dates. Try a wider period."
            action={
              <Button variant="outline" size="sm" onClick={() => selectPreset('this-fy')}>
                Reset to this financial year
              </Button>
            }
          />
        </SectionCard>
      ) : (
        <>
          {/* KPIs */}
          <StatGrid columns={3}>
            <StatCard
              label="Taxable base"
              value={formatCompactCurrency(s.taxableBase)}
              sub={`${formatNumber(s.paymentsWithBreakdown)} payment${
                s.paymentsWithBreakdown === 1 ? '' : 's'
              } with breakdown`}
              icon={IndianRupee}
              accent="text-emerald-600"
              accentBg="bg-emerald-50"
            />
            <StatCard
              label="Tax collected"
              value={formatCompactCurrency(s.tax)}
              sub={`${s.effectiveTaxRate.toFixed(1)}% effective`}
              icon={Percent}
              accent="text-cyan-600"
              accentBg="bg-cyan-50"
            />
            <StatCard
              label="Commission"
              value={formatCompactCurrency(s.commission)}
              sub="Platform take on bookings"
              icon={TrendingUp}
              accent="text-indigo-600"
              accentBg="bg-indigo-50"
            />
            <StatCard
              label="Platform fee"
              value={formatCompactCurrency(s.platformFee)}
              sub="Fixed platform charges"
              icon={Building2}
              accent="text-violet-600"
              accentBg="bg-violet-50"
            />
            <StatCard
              label="Convenience fee"
              value={formatCompactCurrency(s.convenienceFee)}
              sub="Payment convenience charges"
              icon={Ticket}
              accent="text-amber-600"
              accentBg="bg-amber-50"
            />
            <StatCard
              label="Total collected"
              value={formatCompactCurrency(s.grossCollected)}
              sub={`${formatNumber(s.transactions)} transaction${
                s.transactions === 1 ? '' : 's'
              }`}
              icon={Wallet}
              accent="text-slate-700"
              accentBg="bg-slate-100"
            />
          </StatGrid>

          {/* Period detail + chart */}
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Period detail"
              description="Exact rupees for the selected period."
            >
              <DetailRow label="Taxable base" value={formatCurrency(s.taxableBase)} />
              <DetailRow label="Discounts given" value={formatCurrency(s.discount)} />
              <DetailRow label="Tax collected" value={formatCurrency(s.tax)} />
              <DetailRow label="Commission" value={formatCurrency(s.commission)} />
              <DetailRow label="Platform fee" value={formatCurrency(s.platformFee)} />
              <DetailRow label="Convenience fee" value={formatCurrency(s.convenienceFee)} />
              <DetailRow label="Effective tax rate" value={`${s.effectiveTaxRate.toFixed(1)}%`} />
              <DetailRow
                label="Total collected"
                value={formatCurrency(s.grossCollected)}
                emphasis="total"
              />
              <DetailRow
                label="Payments with breakdown"
                value={formatNumber(s.paymentsWithBreakdown)}
              />
              <DetailRow
                label="Payments without breakdown"
                value={formatNumber(s.paymentsWithoutBreakdown)}
                emphasis="muted"
              />
            </SectionCard>

            <SectionCard
              title="Tax vs commission"
              description="Monthly comparison, scaled to the largest bar."
            >
              <TaxCommissionChart monthly={monthly} />
            </SectionCard>
          </div>

          {/* Monthly breakdown */}
          <SectionCard
            title="Monthly breakdown"
            description="Tax and fee totals per calendar month."
            flush
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={monthly.length === 0}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            }
          >
            {monthly.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No monthly rows"
                description="The server has no month-by-month breakdown for this period."
              />
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <TableScroll>
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-50">
                        <tr>
                          <Th>Month</Th>
                          <Th align="right">Taxable base</Th>
                          <Th align="right">Tax</Th>
                          <Th align="right">Commission</Th>
                          <Th align="right">Platform fee</Th>
                          <Th align="right">Gross collected</Th>
                          <Th align="right">Transactions</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {monthly.map((month) => (
                          <tr key={month.label} className="transition-colors hover:bg-slate-50">
                            <Td className="font-medium text-slate-900">{month.label}</Td>
                            <Td align="right">{formatCurrency(month.taxableBase)}</Td>
                            <Td align="right">{formatCurrency(month.tax)}</Td>
                            <Td align="right">{formatCurrency(month.commission)}</Td>
                            <Td align="right">{formatCurrency(month.platformFee)}</Td>
                            <Td align="right" className="font-semibold text-slate-900">
                              {formatCurrency(month.grossCollected)}
                            </Td>
                            <Td align="right">{formatNumber(month.transactions)}</Td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50">
                          <Td className="font-semibold text-slate-900">Total</Td>
                          <Td align="right" className="font-semibold text-slate-900">
                            {formatCurrency(monthlyTotals.taxableBase)}
                          </Td>
                          <Td align="right" className="font-semibold text-slate-900">
                            {formatCurrency(monthlyTotals.tax)}
                          </Td>
                          <Td align="right" className="font-semibold text-slate-900">
                            {formatCurrency(monthlyTotals.commission)}
                          </Td>
                          <Td align="right" className="font-semibold text-slate-900">
                            {formatCurrency(monthlyTotals.platformFee)}
                          </Td>
                          <Td align="right" className="font-semibold text-slate-900">
                            {formatCurrency(monthlyTotals.grossCollected)}
                          </Td>
                          <Td align="right" className="font-semibold text-slate-900">
                            {formatNumber(monthlyTotals.transactions)}
                          </Td>
                        </tr>
                      </tbody>
                    </table>
                  </TableScroll>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 p-4 md:hidden">
                  {monthly.map((month) => (
                    <MobileCard
                      key={month.label}
                      title={month.label}
                      subtitle={`${formatNumber(month.transactions)} transaction${
                        month.transactions === 1 ? '' : 's'
                      }`}
                      amount={formatCompactCurrency(month.grossCollected)}
                      rows={[
                        { label: 'Taxable base', value: formatCurrency(month.taxableBase) },
                        { label: 'Tax', value: formatCurrency(month.tax) },
                        { label: 'Commission', value: formatCurrency(month.commission) },
                        { label: 'Platform fee', value: formatCurrency(month.platformFee) },
                      ]}
                    />
                  ))}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total
                    </p>
                    <div className="mt-2">
                      <DetailRow
                        label="Taxable base"
                        value={formatCurrency(monthlyTotals.taxableBase)}
                      />
                      <DetailRow label="Tax" value={formatCurrency(monthlyTotals.tax)} />
                      <DetailRow
                        label="Commission"
                        value={formatCurrency(monthlyTotals.commission)}
                      />
                      <DetailRow
                        label="Platform fee"
                        value={formatCurrency(monthlyTotals.platformFee)}
                      />
                      <DetailRow
                        label="Transactions"
                        value={formatNumber(monthlyTotals.transactions)}
                      />
                      <DetailRow
                        label="Gross collected"
                        value={formatCurrency(monthlyTotals.grossCollected)}
                        emphasis="total"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </SectionCard>
        </>
      )}
    </div>
  )
}

// ── Charts & icons ───────────────────────────────────────────────────────────

/**
 * Dependency-free Tax vs Commission comparison. Bars are plain divs whose
 * heights are normalised against the largest value across BOTH series, so the
 * two columns stay directly comparable. A zeroed month renders no bar.
 */
function TaxCommissionChart({ monthly }: { monthly: TaxSummaryMonth[] }) {
  const max = useMemo(
    () => monthly.reduce((acc, month) => Math.max(acc, month.tax, month.commission), 0),
    [monthly],
  )

  if (monthly.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No monthly data to chart for this period.
      </p>
    )
  }

  const heightPct = (value: number): string => {
    if (!Number.isFinite(value) || value <= 0 || max <= 0) return '0%'
    return `${Math.max(4, Math.round((value / max) * 100))}%`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500" aria-hidden />
          Tax
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" aria-hidden />
          Commission
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[480px] items-end gap-2 sm:min-w-0">
          {monthly.map((month) => (
            <div key={month.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-40 w-full items-end justify-center gap-1 border-b border-slate-200">
                <div
                  className="w-2.5 rounded-t bg-cyan-500/90 transition-all sm:w-3.5"
                  style={{ height: heightPct(month.tax) }}
                  title={`${month.label} tax: ${formatCurrency(month.tax)}`}
                />
                <div
                  className="w-2.5 rounded-t bg-indigo-500/90 transition-all sm:w-3.5"
                  style={{ height: heightPct(month.commission) }}
                  title={`${month.label} commission: ${formatCurrency(month.commission)}`}
                />
              </div>
              <span className="w-full truncate text-center text-[10px] font-medium text-slate-500">
                {month.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
