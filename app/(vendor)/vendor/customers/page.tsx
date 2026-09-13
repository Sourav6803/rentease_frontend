'use client'

/**
 * app/(vendor)/vendor/customers/page.tsx
 *
 * Vendor customer directory — the page the sidebar's "Customers"
 * (href /vendor/customers) has always pointed at but which never existed.
 *
 * All figures come from GET /vendor/customers, which returns the page of rows,
 * the filtered total and the vendor-wide stats + segment counts from a single
 * aggregation pass, so the list and the header can never disagree. The detail
 * panel uses GET /vendor/customers/:customerId, which 404s for anyone who has
 * never rented from this vendor.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  IndianRupee,
  Info,
  Loader2,
  Mail,
  Package,
  Phone,
  RefreshCw,
  Repeat,
  Search,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { vendorQueryKeys } from '@/lib/api/queryKeys'
import {
  CUSTOMER_SEGMENTS,
  CUSTOMER_SORT_OPTIONS,
  SEGMENT_META,
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatDaysAgo,
  getAvatarTone,
  getCustomerErrorMessage,
  getFullName,
  getInitials,
  getRentalStatusLabel,
  getVendorCustomerDetail,
  isActiveRentalStatus,
  listVendorCustomers,
  type CustomerSegment,
  type CustomerSort,
  type SegmentCounts,
  type VendorCustomer,
  type VendorCustomerDetailResponse,
  type VendorCustomerStats,
} from '@/lib/api/vendorCustomers'

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 350

// ── Small presentational pieces ───────────────────────────────────────────────

function Avatar({ customer, size = 'md' }: { customer: VendorCustomer; size?: 'md' | 'lg' }) {
  const name = getFullName(customer)
  const dimension = size === 'lg' ? 'h-14 w-14 text-base' : 'h-10 w-10 text-xs'

  if (customer.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={customer.avatar}
        alt=""
        className={cn(dimension, 'shrink-0 rounded-full object-cover')}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        dimension,
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        getAvatarTone(customer.customerId),
      )}
    >
      {getInitials(name)}
    </span>
  )
}

function SegmentChip({ segment }: { segment: CustomerSegment }) {
  if (segment === 'all') return null
  const meta = SEGMENT_META[segment]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        meta.activeTone,
      )}
    >
      {segment === 'vip' && <Crown className="h-3 w-3" aria-hidden />}
      {meta.label}
    </span>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'slate',
}: {
  icon: React.ElementType
  label: string
  value: string
  hint?: string
  tone?: 'slate' | 'blue' | 'emerald' | 'amber' | 'violet'
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-50 text-slate-600',
    blue: 'bg-[#2874f0]/10 text-[#2874f0]',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <span className={cn('rounded-xl p-1.5', tones[tone])}>
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
      <p className="mt-2 text-xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}

function InlineStat({
  label,
  value,
  tone = 'text-slate-900',
}: {
  label: string
  value: string
  tone?: string
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={cn('mt-0.5 text-sm font-semibold', tone)}>{value}</p>
    </div>
  )
}

// ── KPI strip ─────────────────────────────────────────────────────────────────

function KpiStrip({ stats }: { stats: VendorCustomerStats }) {
  const repeatRate = Math.round(stats.repeatRate)

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        icon={Users}
        label="Total customers"
        value={String(stats.totalCustomers)}
        hint={`${stats.oneTimeCustomers} one-time`}
        tone="blue"
      />
      <StatCard
        icon={UserPlus}
        label="New this month"
        value={String(stats.newThisMonth)}
        hint="First rental this month"
        tone="violet"
      />
      <StatCard
        icon={Repeat}
        label="Repeat rate"
        value={`${repeatRate}%`}
        hint={`${stats.returningCustomers} returned`}
        tone="emerald"
      />
      <StatCard
        icon={UserCheck}
        label="Active rentals"
        value={String(stats.activeCustomers)}
        hint="Customers with an open rental"
        tone="amber"
      />
      <StatCard
        icon={Crown}
        label="VIP customers"
        value={String(stats.vipCount)}
        hint="₹50,000+ lifetime"
        tone="amber"
      />
      <StatCard
        icon={IndianRupee}
        label="Lifetime revenue"
        value={formatCompactCurrency(stats.totalRevenue)}
        hint={`Avg ${formatCompactCurrency(stats.avgSpendPerCustomer)} each`}
        tone="emerald"
      />
    </div>
  )
}

// ── Filters ───────────────────────────────────────────────────────────────────

function SegmentTabs({
  active,
  counts,
  onChange,
}: {
  active: CustomerSegment
  counts: SegmentCounts
  onChange: (segment: CustomerSegment) => void
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by customer segment">
      {CUSTOMER_SEGMENTS.map((segment) => {
        const meta = SEGMENT_META[segment]
        const isActive = active === segment
        return (
          <button
            key={segment}
            type="button"
            onClick={() => onChange(segment)}
            aria-pressed={isActive}
            title={meta.description}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors',
              isActive
                ? meta.activeTone
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
            )}
          >
            {meta.label}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                isActive ? meta.countTone : 'bg-slate-100 text-slate-500',
              )}
            >
              {counts[segment] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ── Row rendering (table on desktop, cards on mobile) ─────────────────────────

function RentalBreakdown({ customer }: { customer: VendorCustomer }) {
  return (
    <span className="flex items-center gap-2 text-[11px]">
      <span className="font-semibold text-slate-700">{customer.totalRentals}</span>
      <span className="text-slate-300">·</span>
      <span className="text-emerald-600">{customer.completedRentals} done</span>
      {customer.activeRentals > 0 && (
        <>
          <span className="text-slate-300">·</span>
          <span className="text-[#2874f0]">{customer.activeRentals} active</span>
        </>
      )}
      {customer.cancelledRentals > 0 && (
        <>
          <span className="text-slate-300">·</span>
          <span className="text-rose-500">{customer.cancelledRentals} cancelled</span>
        </>
      )}
    </span>
  )
}

function DesktopTable({
  customers,
  onSelect,
}: {
  customers: VendorCustomer[]
  onSelect: (customerId: string) => void
}) {
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="w-full min-w-[860px] border-collapse text-left">
        <caption className="sr-only">
          Your customers, with rental counts, lifetime spend and last rental
        </caption>
        <thead>
          <tr className="border-b border-slate-100">
            <th scope="col" className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Customer
            </th>
            <th scope="col" className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Segment
            </th>
            <th scope="col" className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Rentals
            </th>
            <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Lifetime spend
            </th>
            <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Avg order
            </th>
            <th scope="col" className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Last rental
            </th>
            <th scope="col" className="px-4 py-2.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.customerId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar customer={customer} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {getFullName(customer)}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">
                      {customer.email || customer.phone || 'No contact on file'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <SegmentChip segment={customer.segment} />
              </td>
              <td className="px-4 py-3">
                <RentalBreakdown customer={customer} />
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                {formatCurrency(customer.totalSpent)}
              </td>
              <td className="px-4 py-3 text-right text-sm text-slate-600">
                {formatCurrency(customer.avgOrderValue)}
              </td>
              <td className="px-4 py-3">
                <p className="text-xs font-medium text-slate-700">
                  {formatDaysAgo(customer.lastRentalAt)}
                </p>
                {customer.lastRentalNumber && (
                  <p className="font-mono text-[10px] text-slate-400">
                    {customer.lastRentalNumber}
                    {customer.lastRentalStatus ? ` · ${getRentalStatusLabel(customer.lastRentalStatus)}` : ''}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(customer.customerId)}
                  aria-label={`View details for ${getFullName(customer)}`}
                  className="text-[#2874f0] hover:bg-[#2874f0]/10"
                >
                  View
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MobileCardList({
  customers,
  onSelect,
}: {
  customers: VendorCustomer[]
  onSelect: (customerId: string) => void
}) {
  return (
    <div className="space-y-3 lg:hidden">
      {customers.map((customer) => (
        <div key={customer.customerId} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Avatar customer={customer} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {getFullName(customer)}
                </p>
                <SegmentChip segment={customer.segment} />
              </div>
              <p className="mt-0.5 truncate text-[11px] text-slate-400">
                {customer.email || customer.phone || 'No contact on file'}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <InlineStat label="Lifetime spend" value={formatCurrency(customer.totalSpent)} />
            <InlineStat label="Avg order" value={formatCurrency(customer.avgOrderValue)} />
            <InlineStat
              label="Rentals"
              value={`${customer.totalRentals} (${customer.activeRentals} active)`}
            />
            <InlineStat
              label="Last rental"
              value={formatDaysAgo(customer.lastRentalAt)}
              tone={isActiveRentalStatus(customer.lastRentalStatus) ? 'text-[#2874f0]' : 'text-slate-900'}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect(customer.customerId)}
            className="mt-3 w-full"
            aria-label={`View details for ${getFullName(customer)}`}
          >
            View details
            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      ))}
    </div>
  )
}

// ── Detail dialog ─────────────────────────────────────────────────────────────

function CustomerDetailDialog({
  open,
  onOpenChange,
  customerId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string | null
}) {
  const { data, isPending, isError, error, refetch } = useQuery<VendorCustomerDetailResponse>({
    queryKey: [...vendorQueryKeys.customers, 'detail', customerId],
    queryFn: () => getVendorCustomerDetail(customerId as string),
    enabled: open && Boolean(customerId),
  })

  const customer = data?.customer
  const rentals = data?.rentals ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customer details</DialogTitle>
          <DialogDescription>
            Everything below covers this customer&apos;s activity with your store only.
          </DialogDescription>
        </DialogHeader>

        {isPending && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading customer…
          </div>
        )}

        {isError && !isPending && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-center">
            <p className="text-sm font-medium text-rose-700">
              {getCustomerErrorMessage(error, 'Could not load this customer')}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Try again
            </Button>
          </div>
        )}

        {customer && !isPending && (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <Avatar customer={customer} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-slate-900">{getFullName(customer)}</p>
                  <SegmentChip segment={customer.segment} />
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  Customer since {formatDate(customer.customerSince)}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  {customer.email && (
                    <a
                      href={`mailto:${customer.email}`}
                      className="inline-flex items-center gap-1.5 text-[#2874f0] hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden />
                      {customer.email}
                    </a>
                  )}
                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone}`}
                      className="inline-flex items-center gap-1.5 text-[#2874f0] hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      {customer.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <InlineStat label="Lifetime spend" value={formatCurrency(customer.totalSpent)} />
              <InlineStat label="Avg order" value={formatCurrency(customer.avgOrderValue)} />
              <InlineStat label="Total rentals" value={String(customer.totalRentals)} />
              <InlineStat label="Products taken" value={String(customer.uniqueProducts)} />
            </div>

            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Package className="h-4 w-4 text-slate-400" aria-hidden />
                Rental history with you
                <span className="text-xs font-normal text-slate-400">({rentals.length} shown)</span>
              </h3>

              {rentals.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-xs text-slate-400">
                  No rentals recorded yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {rentals.map((rental) => (
                    <li key={rental._id} className="rounded-xl border border-slate-100 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {rental.product?.basicInfo?.name || 'Product unavailable'}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                            {rental.rentalNumber || rental._id}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            isActiveRentalStatus(rental.status)
                              ? 'bg-[#2874f0]/10 text-[#2874f0]'
                              : rental.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-slate-100 text-slate-500',
                          )}
                        >
                          {getRentalStatusLabel(rental.status)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" aria-hidden />
                          {formatDate(rental.rentalDetails?.startDate)} →{' '}
                          {formatDate(rental.rentalDetails?.endDate)}
                        </span>
                        {typeof rental.rentalDetails?.tenureMonths === 'number' && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" aria-hidden />
                            {rental.rentalDetails.tenureMonths} mo
                          </span>
                        )}
                        <span className="font-semibold text-slate-700">
                          {formatCurrency(rental.rentalDetails?.totalAmount ?? 0)}
                        </span>
                        {rental.payment?.status && (
                          <span>Payment: {getRentalStatusLabel(rental.payment.status)}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VendorCustomersPage() {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [segment, setSegment] = useState<CustomerSegment>('all')
  const [sort, setSort] = useState<CustomerSort>('totalSpent')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Debounce so typing does not fire a request per keystroke. `search` is in the
  // dependency list so the effect settles once it catches up.
  useEffect(() => {
    const next = searchInput.trim()
    if (next === search) return
    const timer = setTimeout(() => {
      setSearch(next)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchInput, search])

  const filters = useMemo(
    () => ({ page, limit: PAGE_SIZE, search, segment, sort }),
    [page, search, segment, sort],
  )

  const { data, isPending, isError, error, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: [...vendorQueryKeys.customers, filters],
    queryFn: () => listVendorCustomers(filters),
    placeholderData: keepPreviousData,
  })

  const customers = data?.customers ?? []
  const stats = data?.stats
  const segments = data?.segments
  const pagination = data?.pagination

  const hasActiveFilters = Boolean(search) || segment !== 'all'
  const isFiltered = hasActiveFilters || sort !== 'totalSpent'

  const clearFilters = useCallback(() => {
    setSearchInput('')
    setSearch('')
    setSegment('all')
    setSort('totalSpent')
    setPage(1)
  }, [])

  const handleSegmentChange = useCallback((next: CustomerSegment) => {
    setSegment(next)
    setPage(1)
  }, [])

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: vendorQueryKeys.customers })
    refetch()
  }, [queryClient, refetch])

  const from = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-16">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2874f0] via-[#1f63d6] to-[#1a4fb0] p-6 text-white shadow-lg sm:p-7"
      >
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
              <Users className="h-3.5 w-3.5" aria-hidden />
              Customer directory
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Customers</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-white/80">
              Everyone who has rented from your store, with what they have spent and how recently
              they came back.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isFetching}
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className={cn('mr-1.5 h-4 w-4', isFetching && 'animate-spin')} aria-hidden />
              Refresh
            </Button>
            <Button asChild className="bg-white text-[#2874f0] hover:bg-white/90">
              <Link href="/vendor/analytics/customers">
                Insights
                <ArrowUpRight className="ml-1.5 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>

        {dataUpdatedAt > 0 && (
          <p className="relative mt-4 text-[11px] text-white/60">
            Updated {new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            {isFetching ? ' · refreshing…' : ''}
          </p>
        )}
      </motion.section>

      {/* KPIs */}
      {stats && <KpiStrip stats={stats} />}

      {/* Filters */}
      <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, email or phone…"
              aria-label="Search customers by name, email or phone"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-[#2874f0] focus:bg-white focus:ring-2 focus:ring-[#2874f0]/20"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
              Sort by
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as CustomerSort)
                  setPage(1)
                }}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#2874f0] focus:ring-2 focus:ring-[#2874f0]/20"
              >
                {CUSTOMER_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
                <X className="mr-1 h-3.5 w-3.5" aria-hidden />
                Clear all
              </Button>
            )}
          </div>
        </div>

        {segments && <SegmentTabs active={segment} counts={segments} onChange={handleSegmentChange} />}

        <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Info className="h-3 w-3" aria-hidden />
          VIP = ₹50,000+ lifetime. Inactive = no rental in 90 days. A customer counts once per
          segment, in the order VIP → Inactive → Frequent → Regular → New.
        </p>
      </section>

      {/* List */}
      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        {isPending ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#2874f0]" aria-hidden />
            <p className="text-sm font-medium text-slate-400">Loading customers…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <span className="rounded-2xl bg-rose-50 p-3">
              <AlertCircle className="h-6 w-6 text-rose-500" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-slate-800">Couldn&apos;t load your customers</p>
              <p className="mt-1 text-sm text-slate-500">
                {getCustomerErrorMessage(error, 'Something went wrong. Please try again.')}
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden />
              Try again
            </Button>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <span className="rounded-2xl bg-slate-50 p-3">
              <Users className="h-6 w-6 text-slate-400" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-slate-800">
                {hasActiveFilters ? 'No customers match these filters' : 'No customers yet'}
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {hasActiveFilters
                  ? 'Try a different segment or clear the search to see everyone.'
                  : 'Customers appear here automatically once someone rents from your store.'}
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <DesktopTable customers={customers} onSelect={setSelectedId} />
            <MobileCardList customers={customers} onSelect={setSelectedId} />
          </>
        )}
      </section>

      {/* Pagination */}
      {pagination && pagination.total > 0 && customers.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{from}</span>–
            <span className="font-semibold text-slate-700">{to}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.total}</span>{' '}
            {pagination.total === 1 ? 'customer' : 'customers'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={pagination.page <= 1 || isFetching}
            >
              <ChevronLeft className="mr-1 h-3.5 w-3.5" aria-hidden />
              Previous
            </Button>
            <span className="text-xs font-medium text-slate-500">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))}
              disabled={pagination.page >= pagination.pages || isFetching}
            >
              Next
              <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
        </div>
      )}

      {selectedId && (
        <CustomerDetailDialog
          open={Boolean(selectedId)}
          onOpenChange={(open) => {
            if (!open) setSelectedId(null)
          }}
          customerId={selectedId}
        />
      )}
    </div>
  )
}
