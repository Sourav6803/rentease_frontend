'use client'

import { useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  RefreshCw,
  Download,
  GitCompare,
  Store,
  AlertCircle,
} from 'lucide-react'
import { IntelligencePageShell } from '@/components/admin/intelligence'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/admin/intelligence/EmptyState'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import { toCsv, downloadCsv } from '@/lib/api/admin-intelligence'
import type { Period } from '@/types/admin-intelligence.types'
import {
  useVendorOverview,
  useVendorDetail,
  VendorKpiStrip,
  VendorLeaderboard,
  VendorDetail,
  VendorCompare,
  VendorRevenueTrend,
  VendorStatusMix,
  VendorRevenueRanking,
  VendorSkeleton,
  deriveVendorKpis,
} from '@/components/admin/intelligence/vendors'

const PERIODS: Array<{ label: string; value: Period }> = [
  { label: 'Today', value: 'today' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: 'Year', value: '1y' },
]

function PeriodTabs({
  value,
  onChange,
}: {
  value: Period
  onChange: (p: Period) => void
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-semibold transition',
            value === p.value
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

export default function IntelligenceVendorsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const toast = useToast()

  const vendorId = searchParams.get('vendorId') ?? undefined
  const [period, setPeriod] = useState<Period>('30d')
  const [search, setSearch] = useState('')
  const [showCompare, setShowCompare] = useState(searchParams.get('compare') === '1')

  const overviewQ = useVendorOverview(period)
  const detailQ = useVendorDetail(vendorId, period)

  const isDetail = Boolean(vendorId)

  const openVendor = useCallback(
    (id: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      params.set('vendorId', id)
      router.push(`/admin/intelligence/vendors?${params.toString()}`)
    },
    [router, searchParams],
  )

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['ai', 'vendors'] })
  }

  const handleExport = () => {
    const items = overviewQ.data?.vendors ?? []
    if (items.length === 0) {
      toast.info('Nothing to export yet')
      return
    }
    const rows = items.map((i) => ({
      vendorId: i.vendorId,
      businessName: i.businessName ?? '',
      revenue: i.kpi.revenue.current,
      rentals: i.kpi.rentals.current,
      avgRating: i.kpi.averageRating,
      revenueGrowthPct: Number(i.kpi.revenue.growth.toFixed(1)),
    }))
    downloadCsv(
      `vendor-performance-${period}.csv`,
      toCsv(rows, ['vendorId', 'businessName', 'revenue', 'rentals', 'avgRating', 'revenueGrowthPct']),
    )
  }

  const overviewKpis = useMemo(
    () => deriveVendorKpis(overviewQ.data?.vendors ?? []),
    [overviewQ.data],
  )

  const lastUpdated = useMemo(
    () =>
      overviewQ.dataUpdatedAt
        ? new Date(overviewQ.dataUpdatedAt).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : undefined,
    [overviewQ.dataUpdatedAt],
  )

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {lastUpdated && (
        <span className="hidden text-xs text-slate-400 lg:inline">Updated {lastUpdated}</span>
      )}
      {!isDetail && (
        <Button
          variant={showCompare ? 'default' : 'outline'}
          size="sm"
          className={cn('gap-1.5', showCompare && 'bg-indigo-600 hover:bg-indigo-700')}
          onClick={() => setShowCompare((s) => !s)}
        >
          <GitCompare className="h-3.5 w-3.5" />
          Compare
        </Button>
      )}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport} disabled={isDetail && !overviewQ.data}>
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        asChild
      >
        <Link href="/admin/vendors/all-vendors">
          <Store className="h-3.5 w-3.5" />
          Vendor Management
        </Link>
      </Button>
      <Button
        size="sm"
        className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-105"
        onClick={handleRefresh}
        disabled={overviewQ.isFetching || detailQ.isFetching}
      >
        <RefreshCw className={cn('h-3.5 w-3.5', (overviewQ.isFetching || detailQ.isFetching) && 'animate-spin')} />
        Refresh
      </Button>
    </div>
  )

  return (
    <IntelligencePageShell
      title="Vendor Performance Dashboard"
      subtitle="Marketplace leaderboard, individual vendor analytics, and side-by-side benchmarking"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: isDetail ? 'Vendors' : 'Vendor Performance' },
      ]}
      demoMode={isDetail ? detailQ.isError : overviewQ.isError}
      actions={headerActions}
    >
      {isDetail ? (
        <DetailMode detailQ={detailQ} onRefresh={handleRefresh} />
      ) : (
        <OverviewMode
          overviewQ={overviewQ}
          kpis={overviewKpis}
          period={period}
          setPeriod={setPeriod}
          search={search}
          setSearch={setSearch}
          showCompare={showCompare}
          onSelect={openVendor}
          onRefresh={handleRefresh}
        />
      )}
    </IntelligencePageShell>
  )
}

/* -------------------------------------------------------------------------- */
/* Overview                                                                   */
/* -------------------------------------------------------------------------- */

function OverviewMode({
  overviewQ,
  kpis,
  period,
  setPeriod,
  search,
  setSearch,
  showCompare,
  onSelect,
  onRefresh,
}: {
  overviewQ: ReturnType<typeof useVendorOverview>
  kpis: ReturnType<typeof deriveVendorKpis>
  period: Period
  setPeriod: (p: Period) => void
  search: string
  setSearch: (s: string) => void
  showCompare: boolean
  onSelect: (id: string) => void
  onRefresh: () => void
}) {
  if (overviewQ.isLoading) return <VendorSkeleton variant="overview" />

  if (overviewQ.isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4" />
          Could not load vendor performance data.
        </div>
        <EmptyState
          icon={AlertCircle}
          title="Vendor performance unavailable"
          description="The vendor performance API could not be reached. Retry to reload the leaderboard."
          actionLabel="Retry"
          onAction={onRefresh}
        />
      </div>
    )
  }

  const items = overviewQ.data?.vendors ?? []

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="No vendor performance data"
        description="There are no verified vendors with activity in this period yet."
        actionLabel="Refresh"
        onAction={onRefresh}
      />
    )
  }

  return (
    <div className="space-y-6">
      <VendorKpiStrip kpis={kpis} />

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20 -mx-1 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:flex-row sm:items-center">
        <PeriodTabs value={period} onChange={setPeriod} />
        <div className="relative flex-1 sm:max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors…"
            className="h-9 w-full pl-8 text-sm"
          />
        </div>
        <span className="ml-auto hidden text-xs text-slate-400 sm:block">
          {items.length} vendors · {period}
        </span>
      </div>

      <VendorLeaderboard items={items} search={search} onSelect={onSelect} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <VendorRevenueTrend items={items} />
        <VendorStatusMix items={items} />
      </div>

      <VendorRevenueRanking items={items} />

      {showCompare && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Vendor Comparison</h3>
          <VendorCompare items={items} />
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Detail                                                                     */
/* -------------------------------------------------------------------------- */

function DetailMode({
  detailQ,
  onRefresh,
}: {
  detailQ: ReturnType<typeof useVendorDetail>
  onRefresh: () => void
}) {
  if (detailQ.isLoading) return <VendorSkeleton variant="detail" />

  if (detailQ.isError || !detailQ.data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Vendor data unavailable"
        description="We could not load this vendor's performance. Retry to reload."
        actionLabel="Retry"
        onAction={onRefresh}
      />
    )
  }

  return <VendorDetail detail={detailQ.data} />
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
