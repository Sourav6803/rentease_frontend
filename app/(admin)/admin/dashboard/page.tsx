'use client'

import { useMemo, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  DollarSign, ShoppingBag, Users, Store, Package, Truck,
  RefreshCw, TrendingUp, Star, Eye, Heart, Activity, Repeat,
  Clock, Download, AlertTriangle, Sparkles, ArrowUpRight,
  Award, CheckCircle2, Loader2,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart,
  Legend, Line,
} from 'recharts'
import {
  IntelligencePageShell,
  KpiGrid,
  ChartCard,
  PeriodSelector,
  DataTable,
} from '@/components/admin/intelligence'
import type { DataTableColumn } from '@/components/admin/intelligence'
import type { Period, ProductRow, VendorOverviewItem, KpiCardItem } from '@/types/admin-intelligence.types'
import {
  getOverview,
  getRentalCharts,
  getTopProducts,
  getVendorPerformance,
  getCustomerAnalytics,
  getAiInsights,
  getOperations,
  formatINR,
  formatCompactINR,
  downloadCsv,
  toCsv,
  adminIntelligenceApi,
} from '@/lib/api/admin-intelligence'
import { analyticsApi } from '@/lib/api/analytics'
import { deriveInsights } from '@/components/admin/intelligence/ai-insights/ai-insights.utils'
import { BusinessOpportuntyCards } from '@/components/admin/intelligence/ai-insights'
import { VendorLeaderboard } from '@/components/admin/intelligence/vendors/VendorLeaderboard'
import { RecentActivity } from './components/RecentActivity'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS = ['#2563eb', '#4f46e5', '#0ea5e9', '#059669', '#d97706', '#db2777', '#0891b2', '#7c3aed']

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function ChartTooltip({
  active,
  payload,
  label,
  currencyKey,
  suffix,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string }>
  label?: string | number
  currencyKey?: string
  suffix?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="font-semibold text-slate-700">{p.name}:</span>
          <span className="text-slate-600">
            {currencyKey && p.dataKey === currencyKey
              ? formatCompactINR(p.value ?? 0)
              : `${(p.value ?? 0)?.toLocaleString('en-IN')}${suffix ?? ''}`}
          </span>
        </div>
      ))}
    </div>
  )
}

function getRating(row: ProductRow): number {
  return typeof row.ratings === 'object' && row.ratings ? (row.ratings.average ?? 0) : 0
}

/** Safely format a numeric-ish value to a fixed-decimal percentage string. */
function fmtPct(value: unknown, digits = 1): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  if (typeof n !== 'number' || Number.isNaN(n)) return '0.0'
  return n.toFixed(digits)
}

/** Safely coerce an unknown API value to a finite number (defaults to 0). */
function toNum(value: unknown): number {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

type TopTab = 'mostRented' | 'highestRevenue' | 'highestRated' | 'mostViewed' | 'mostWishlisted'

const TOP_TABS: { key: TopTab; label: string; icon: React.ElementType }[] = [
  { key: 'mostRented', label: 'Most Rented', icon: ShoppingBag },
  { key: 'highestRevenue', label: 'Top Revenue', icon: DollarSign },
  { key: 'highestRated', label: 'Best Rated', icon: Star },
  { key: 'mostViewed', label: 'Most Viewed', icon: Eye },
  { key: 'mostWishlisted', label: 'Most Wishlisted', icon: Heart },
]

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function AdminDashboard() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [period, setPeriod] = useState<Period>('30d')
  const [topTab, setTopTab] = useState<TopTab>('mostRented')

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.push('/admin/login')
  }, [sessionStatus, router])

  const overviewQ = useQuery({
    queryKey: ['admin-dashboard', 'overview', period],
    queryFn: () => adminIntelligenceApi.getOverview(),
    staleTime: 60_000,
  })
  const chartsQ = useQuery({
    queryKey: ['admin-dashboard', 'charts', period],
    queryFn: () => adminIntelligenceApi.getRentalCharts({ period }),
    staleTime: 60_000,
  })
  const topQ = useQuery({
    queryKey: ['admin-dashboard', 'top', period],
    queryFn: () => adminIntelligenceApi.getTopProducts({ period }),
    staleTime: 60_000,
  })
  const vendorsQ = useQuery({
    queryKey: ['admin-dashboard', 'vendors', period],
    queryFn: () => adminIntelligenceApi.getVendorPerformance({ period }),
    staleTime: 120_000,
  })
  const customersQ = useQuery({
    queryKey: ['admin-dashboard', 'customers', period],
    queryFn: () => adminIntelligenceApi.getCustomerAnalytics({ period }),
    staleTime: 60_000,
  })
  const usersQ = useQuery({
    queryKey: ['admin-dashboard', 'users', period],
    queryFn: () => analyticsApi.getUserAnalytics({ period }),
    staleTime: 60_000,
  })
  const growthQ = useQuery({
    queryKey: ['admin-dashboard', 'growth', period],
    queryFn: () => analyticsApi.getGrowthMetrics({ period }),
    staleTime: 60_000,
  })
  const retentionQ = useQuery({
    queryKey: ['admin-dashboard', 'retention'],
    queryFn: () => analyticsApi.getRetentionAnalytics(),
    staleTime: 120_000,
  })
  const funnelQ = useQuery({
    queryKey: ['admin-dashboard', 'funnel', period],
    queryFn: () => analyticsApi.getConversionFunnel({ period }),
    staleTime: 120_000,
  })
  const perfQ = useQuery({
    queryKey: ['admin-dashboard', 'performance'],
    queryFn: () => analyticsApi.getPerformanceMetrics(),
    staleTime: 120_000,
  })
  const activityQ = useQuery({
    queryKey: ['admin-dashboard', 'summary', period],
    queryFn: () => analyticsApi.getDashboardSummary({ period }),
    staleTime: 60_000,
  })
  const aiQ = useQuery({
    queryKey: ['admin-dashboard', 'ai', period],
    queryFn: () => adminIntelligenceApi.getAiInsights({ period }),
    staleTime: 120_000,
  })
  const opsQ = useQuery({
    queryKey: ['admin-dashboard', 'ops'],
    queryFn: () => adminIntelligenceApi.getOperations(),
    staleTime: 120_000,
  })

  const overview = overviewQ.data
  const charts = chartsQ.data
  const top = topQ.data
  const vendors = ((vendorsQ.data as any)?.vendors ?? []) as VendorOverviewItem[]
  const customers = customersQ.data
  const growthMap = (growthQ.data as Record<string, { current: number; previous: number; growth: number }>) ?? {}
  const retentionSeries = useMemo(
    () => ((retentionQ.data as { cohorts?: Array<any> })?.cohorts ?? []).map((c) => ({
      month: c._id?.month ?? c._id?.week ?? c.month ?? c.label ?? '',
      rate: c.retention ?? c.rate ?? c.value ?? 0,
      users: c.users ?? 0,
    })),
    [retentionQ.data],
  )
  const funnelMetrics = (funnelQ.data as Record<string, number>) ?? {}
  const perfMetrics = (perfQ.data as Record<string, number>) ?? {}
  const activityData = (activityQ.data as { recentActivity?: Record<string, any[]> })?.recentActivity ?? {}
  const ai = aiQ.data
  const ops = opsQ.data

  const revenueTrends = charts?.revenueTrends ?? []
  const rentalsByMonth = charts?.rentalsByMonth ?? []
  const rentalsByCategory = charts?.rentalsByCategory ?? []

  const combinedRevenue = useMemo(() => {
    if (!revenueTrends.length) return []
    return revenueTrends.map((rt: any, i: number) => ({
      ...rt,
      transactions: rentalsByMonth[i]?.count ?? 0,
    }))
  }, [revenueTrends, rentalsByMonth])

  const categoryData = useMemo(
    () =>
      rentalsByCategory.map((c: any) => ({
        name: c.name ?? c.category ?? c.label ?? c._id ?? 'Other',
        value: c.count ?? c.value ?? c.total ?? 0,
      })),
    [rentalsByCategory],
  )

  const dailySignups = useMemo(() => {
    const ua = usersQ.data as { dailySignups?: Array<any> } | undefined
    return (ua?.dailySignups ?? []).map((d: any) => ({
      date: d._id ? `${d._id.day}/${d._id.month}` : d.date ?? '',
      newUsers: d.count ?? 0,
    }))
  }, [usersQ.data])

  const activeTopList = (top?.[topTab] as ProductRow[] | undefined) ?? []

  const topColumns: DataTableColumn<Record<string, unknown>>[] = [
    { key: 'name', header: 'Product', sortable: true },
    {
      key: 'rentalCount',
      header: 'Rentals',
      sortable: true,
      render: (r) => (r.rentalCount != null ? Number(r.rentalCount).toLocaleString('en-IN') : '—'),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      sortable: true,
      render: (r) => (r.revenue != null ? formatINR(Number(r.revenue)) : '—'),
    },
    {
      key: 'views',
      header: 'Views',
      sortable: true,
      accessor: (r) => (typeof r.views === 'object' ? ((r.views as any)?.count ?? 0) : Number(r.views ?? 0)),
      render: (r) => {
        const v = typeof r.views === 'object' ? ((r.views as any)?.count ?? 0) : Number(r.views ?? 0)
        return v.toLocaleString('en-IN')
      },
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      accessor: (r) => getRating(r as unknown as ProductRow),
      render: (r) => {
        const rt = getRating(r as unknown as ProductRow)
        return rt ? `${rt.toFixed(1)} / 5` : '—'
      },
    },
    {
      key: 'wishlistCount',
      header: 'Wishlist',
      sortable: true,
      render: (r) => (r.wishlistCount != null ? Number(r.wishlistCount).toLocaleString('en-IN') : '—'),
    },
  ]

  const g = (key: string) => (growthMap as any)?.[key]?.growth

  const trend = (key: string): 'up' | 'down' | undefined => {
    const v = g(key)
    if (v == null) return undefined
    if (v > 0) return 'up'
    if (v < 0) return 'down'
    return undefined
  }

  const kpiItems: KpiCardItem[] = [
    { key: 'revenue', title: 'Total Revenue', value: formatCompactINR(overview?.totalRevenue ?? 0), icon: DollarSign, accent: '#2563eb', change: g('revenue'), trend: trend('revenue') },
    { key: 'mrr', title: 'MRR', value: formatCompactINR(overview?.mrr ?? 0), icon: TrendingUp, accent: '#4f46e5' },
    { key: 'active', title: 'Active Rentals', value: (overview?.activeRentals ?? 0).toLocaleString('en-IN'), icon: Activity, accent: '#059669', change: g('rentals'), trend: trend('rentals') },
    { key: 'users', title: 'Active Users', value: (overview?.activeUsers ?? 0).toLocaleString('en-IN'), icon: Users, accent: '#7c3aed', change: g('users'), trend: trend('users') },
    { key: 'vendors', title: 'Vendors', value: (overview?.vendors ?? 0).toLocaleString('en-IN'), icon: Store, accent: '#d97706', change: g('vendors'), trend: trend('vendors') },
    { key: 'products', title: 'Products', value: (overview?.products ?? 0).toLocaleString('en-IN'), icon: Package, accent: '#db2777' },
    { key: 'inventory', title: 'Available Inventory', value: (overview?.availableInventory ?? 0).toLocaleString('en-IN'), icon: Package, accent: '#16a34a' },
    { key: 'deliveries', title: 'Pending Deliveries', value: (overview?.pendingDeliveries ?? 0).toLocaleString('en-IN'), icon: Truck, accent: '#0891b2' },
  ]

  const topActivityItems = useMemo(() => {
    const items: { text: string; time: string; color: string; icon: string }[] = []
    if (activityData.users) {
      activityData.users.forEach((u: any) =>
        items.push({
          text: `New registration: ${u.user ?? 'Unknown'}`,
          time: new Date(u.time).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          color: '#2563eb',
          icon: '👤',
        }),
      )
    }
    if (activityData.rentals) {
      activityData.rentals.forEach((r: any) =>
        items.push({
          text: `Rental ${r.details ?? 'created'} by ${r.user ?? 'Unknown'}`,
          time: new Date(r.time).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          color: '#059669',
          icon: '📦',
        }),
      )
    }
    if (activityData.payments) {
      activityData.payments.forEach((p: any) =>
        items.push({
          text: `Payment ${p.details ?? 'received'} from ${p.user ?? 'Unknown'}`,
          time: new Date(p.time).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          color: '#d97706',
          icon: '₹',
        }),
      )
    }
    return items.slice(0, 10)
  }, [activityData])

  const insights = useMemo(() => {
    if (!ai) return []
    try {
      return deriveInsights(ai)
    } catch {
      return []
    }
  }, [ai])

  const categoryRevenue = useMemo(
    () => (ai?.categoryRevenue ?? []) as Array<{ _id: string; revenue: number; count: number }>,
    [ai],
  )
  const highViewsLowRentals = useMemo(
    () => (ai?.highViewsLowRentals ?? []) as ProductRow[],
    [ai],
  )

  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
  const handleSelectVendor = (vendorId: string) => router.push(`/admin/vendors/${vendorId}`)

  const exportTop = () => {
    const rows = activeTopList.map((p) => ({
      name: p.name,
      rentals: p.rentalCount ?? '',
      revenue: p.revenue ?? '',
      views: typeof p.views === 'object' ? ((p.views as any)?.count ?? '') : (p.views ?? ''),
      rating: getRating(p),
      wishlist: p.wishlistCount ?? '',
    }))
    downloadCsv(`top-products-${topTab}-${period}.csv`, toCsv(rows, ['name', 'rentals', 'revenue', 'views', 'rating', 'wishlist']))
  }

  if (sessionStatus === 'loading') {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const demoMode = overviewQ.isError
  const spenders = customers?.topSpendingCustomers ?? []
  const activeCustomers = customers?.mostActiveCustomers ?? []

  return (
    <IntelligencePageShell
      title="Super Admin Dashboard"
      subtitle="Platform-wide metrics, revenue trends, and operational pulse"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Dashboard' },
      ]}
      demoMode={demoMode}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <PeriodSelector value={period} onChange={setPeriod} showCustom={false} />
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', overviewQ.isFetching ? 'animate-spin' : '')} />
            Refresh
          </button>
        </div>
      }
    >
      <div className={cn('flex flex-col gap-6', demoMode && 'opacity-80')}>
        {/* ── KPI GRID ─────────────────────────────────────────────────── */}
        <KpiGrid items={kpiItems} columns={4} />

        {/* ── REVENUE + CATEGORY ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Revenue Overview"
            description="Monthly revenue & transaction volume"
            loading={chartsQ.isLoading}
            empty={!chartsQ.isLoading && combinedRevenue.length === 0}
          >
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedRevenue} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="l" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip currencyKey="revenue" />} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar yAxisId="l" dataKey="revenue" fill="url(#revGrad)" name="Revenue" radius={[5, 5, 0, 0]} />
                  <Line yAxisId="r" type="monotone" dataKey="transactions" stroke="#d97706" strokeWidth={2.5} dot={{ fill: '#d97706', r: 3 }} name="Transactions" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Product Categories"
            description="Distribution by listing count"
            loading={chartsQ.isLoading}
            empty={!chartsQ.isLoading && categoryData.length === 0}
          >
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {categoryData.map((c, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v.toLocaleString('en-IN')} items`} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded"
                    style={{ background: CATEGORY_COLORS[categoryData.indexOf(c) % CATEGORY_COLORS.length] }}
                  />
                  <span className="truncate text-[11px] font-semibold text-slate-600">{c.name}</span>
                  <span className="ml-auto text-[11px] font-bold text-slate-800">{c.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* ── RENTALS + USER GROWTH ────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Rentals Over Time"
            description="Monthly rental volume across platform"
            loading={chartsQ.isLoading}
            empty={!chartsQ.isLoading && rentalsByMonth.length === 0}
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rentalsByMonth as any} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
                  <Bar dataKey="count" name="Rentals" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="User Growth Trends"
            description="Daily new registrations"
            loading={usersQ.isLoading}
            empty={!usersQ.isLoading && dailySignups.length === 0}
          >
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySignups} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="newUsers" stroke="#16a34a" strokeWidth={2.5} fill="url(#userGrad)" name="New Users" dot={{ fill: '#16a34a', r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* ── TOP PRODUCTS ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Award className="h-4 w-4 text-blue-600" /> Top Performing Products
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">Switch metric to explore the leaderboard</p>
            </div>
            <button
              type="button"
              onClick={exportTop}
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {TOP_TABS.map((tab) => {
              const Icon = tab.icon
              const active = topTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTopTab(tab.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {tab.label}
                </button>
              )
            })}
          </div>

          <DataTable
            columns={topColumns}
            data={activeTopList as unknown as Record<string, unknown>[]}
            loading={topQ.isLoading}
            searchPlaceholder="Search products…"
            pageSize={8}
            emptyTitle="No products found"
            emptyDescription="Try a different metric or period."
          />
        </div>

        {/* ── VENDORS + RETENTION + PERFORMANCE ────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <VendorLeaderboard items={vendors} loading={vendorsQ.isLoading} onSelect={handleSelectVendor} />

          <div className="flex flex-col gap-4">
            <ChartCard
              title="User Retention"
              description="Cohort retention over time"
              loading={retentionQ.isLoading}
              empty={!retentionQ.isLoading && retentionSeries.length === 0}
            >
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={retentionSeries} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<ChartTooltip suffix="%" />} />
                    <Area type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#retGrad)" name="Retention %" dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Conversion Funnel"
              description="Rental conversion metrics"
              loading={funnelQ.isLoading}
              empty={!funnelQ.isLoading && !Object.keys(funnelMetrics).length}
            >
              <div className="flex flex-col gap-4">
                {[
                  { label: 'View → Cart', value: funnelMetrics.viewToCart ?? 0, color: '#2563eb' },
                  { label: 'Cart → Rental', value: funnelMetrics.cartToRental ?? 0, color: '#16a34a' },
                  { label: 'Overall', value: funnelMetrics.overall ?? 0, color: '#8b5cf6' },
                ].map((f) => (
                  <div key={f.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">{f.label}</span>
                      <span className="text-sm font-extrabold text-slate-900">{f.value.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(toNum(f.value), 100)}%` }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{ background: f.color }}
                      />
                    </div>
                  </div>
                ))}
                <div className="rounded-xl bg-blue-50 p-3">
                  <p className="text-xs text-blue-800">
                    Conversion is {(funnelMetrics.overall ?? 0) > 15 ? 'above' : 'below'} the 15% industry average.
                  </p>
                </div>
              </div>
            </ChartCard>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-900">System Performance</h3>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Fulfillment Rate', value: perfMetrics.fulfillmentRate ?? 0, color: '#16a34a' },
                { label: 'SLA Compliance', value: perfMetrics.slaCompliance ?? 0, color: '#2563eb' },
                { label: 'Customer Satisfaction', value: perfMetrics.customerSatisfaction ? (perfMetrics.customerSatisfaction / 5) * 100 : 0, raw: perfMetrics.customerSatisfaction, color: '#d97706' },
                { label: 'Avg Response Time', value: 100 - (perfMetrics.averageResponseTime ?? 0), raw: perfMetrics.averageResponseTime, color: '#8b5cf6' },
              ].map((m) => (
                <div key={m.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">{m.label}</span>
                    <span className="text-xs font-extrabold text-slate-900">
                      {m.raw != null
                        ? `${m.raw}${m.label === 'Customer Satisfaction' ? '/5' : m.label === 'Avg Response Time' ? ' min' : ''}`
                        : `${Number(m.value || 0).toFixed(0)}%`}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(Math.max(Number(m.value || 0), 0), 100)}%` }}
                      transition={{ duration: 0.7, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ background: m.color }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-800">All systems operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── GROWTH + AI + CUSTOMERS ──────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900">Growth Metrics</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'User Growth', value: `${fmtPct((growthMap as any)?.users?.growth)}%`, sub: `${(overview?.activeUsers ?? 0).toLocaleString('en-IN')} active`, color: '#2563eb', bg: '#f0f4ff' },
                { label: 'Vendor Growth', value: `${fmtPct((growthMap as any)?.vendors?.growth)}%`, sub: `${(overview?.vendors ?? 0).toLocaleString('en-IN')} active`, color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Rental Growth', value: `${fmtPct((growthMap as any)?.rentals?.growth)}%`, sub: `${(overview?.totalRentals ?? 0).toLocaleString('en-IN')} total`, color: '#8b5cf6', bg: '#f5f3ff' },
                { label: 'Revenue Growth', value: `${fmtPct((growthMap as any)?.revenue?.growth)}%`, sub: formatCompactINR(overview?.totalRevenue ?? 0), color: '#d97706', bg: '#fff8e6' },
              ].map((gm) => (
                <div key={gm.label} className="rounded-xl p-3.5" style={{ background: gm.bg }}>
                  <p className="text-xl font-extrabold" style={{ color: gm.color }}>{gm.value}</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-600">{gm.label}</p>
                  <p className="text-[10px] text-slate-500">{gm.sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-3.5">
              <p className="text-center text-[11px] font-semibold text-slate-500">Projected Annual Growth (CAGR)</p>
              <p className="text-center text-2xl font-extrabold text-indigo-600">
                {fmtPct((growthMap as any)?.cagr?.revenue ?? (growthMap as any)?.revenue?.growth)}%
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-slate-900">AI Executive Summary</h3>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-slate-600">
              {ai?.executiveSummary ?? 'No insights available for the selected period.'}
            </p>
            {ai?.generatedAt && (
              <p className="mb-3 text-[10px] text-slate-400">
                Generated {new Date(ai.generatedAt).toLocaleString('en-IN')}
              </p>
            )}
            <div className="flex flex-col gap-2">
              {insights.slice(0, 3).map((ins) => (
                <div key={ins.id} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">{ins.priority} priority</span>
                    <span className="text-[10px] text-slate-400">{ins.source}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{ins.title}</p>
                </div>
              ))}
              {!insights.length && (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
                  <p className="text-[11px] text-slate-400">AI insights will appear once enough activity accrues.</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-900">Customer Pulse</h3>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
                <Repeat className="h-3.5 w-3.5" /> Repeat: {(customers?.repeatCustomers ?? 0).toLocaleString('en-IN')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <Clock className="h-3.5 w-3.5" /> Avg: {customers?.averageRentalDurationDays ?? 0}d
              </span>
            </div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Top Spenders</p>
            <div className="flex flex-col gap-2">
              {spenders.slice(0, 5).map((s: any, i: number) => (
                <div key={s._id ?? i} className="flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-slate-50">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-xs font-bold text-white">
                    {s.name?.charAt(0) ?? '?'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{s.name ?? 'Unknown'}</p>
                    <p className="truncate text-[11px] text-slate-400">{s.email ?? ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCompactINR(s.totalSpent ?? 0)}</p>
                    <p className="text-[10px] text-slate-400">{s.orders ?? 0} orders</p>
                  </div>
                </div>
              ))}
              {!spenders.length && (
                <p className="py-6 text-center text-xs text-slate-400">No spender data available.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── BUSINESS OPPORTUNITIES + OPERATIONS ─────────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BusinessOpportuntyCards categoryRevenue={categoryRevenue} highViewsLowRentals={highViewsLowRentals} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">Operations Pulse</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Today Deliveries', value: ops?.todayDeliveries ?? 0, icon: Truck, color: '#059669' },
                { label: 'Today Pickups', value: ops?.todayPickups ?? 0, icon: Package, color: '#2563eb' },
                { label: 'Active Drivers', value: ops?.activeDrivers ?? 0, icon: Users, color: '#d97706' },
                { label: 'Late Deliveries', value: ops?.lateDeliveries ?? 0, icon: AlertTriangle, color: '#dc2626' },
              ].map((o) => {
                const Icon = o.icon
                return (
                  <div key={o.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${o.color}18` }}>
                      <Icon className="h-4 w-4" style={{ color: o.color }} />
                    </div>
                    <p className="text-xl font-extrabold text-slate-900">{(o.value ?? 0).toLocaleString('en-IN')}</p>
                    <p className="text-[11px] font-semibold text-slate-500">{o.label}</p>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                { label: 'Upcoming Returns', value: ops?.upcomingReturns ?? 0, color: '#7c3aed' },
                { label: 'Upcoming Renewals', value: ops?.upcomingRenewals ?? 0, color: '#0891b2' },
                { label: 'Pending Maint.', value: ops?.pendingMaintenance ?? 0, color: '#db2777' },
                { label: 'Late Pickups', value: ops?.latePickups ?? 0, color: '#ea580c' },
              ].map((o) => (
                <div key={o.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                  <span className="text-[11px] font-medium text-slate-500">{o.label}</span>
                  <span className="text-sm font-extrabold" style={{ color: o.color }}>{(o.value ?? 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SUPER ADMIN CONTROL CENTER + ACTIVITY ───────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <RecentActivity items={topActivityItems} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 shadow-lg lg:col-span-2"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
            <div className="relative">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <Sparkles className="h-4 w-4 text-violet-300" />
                </span>
                <div>
                  <h3 className="font-semibold text-white">Super Admin Control Center</h3>
                  <p className="text-[11px] text-white/50">System-wide tools & diagnostics</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Truck, label: 'Deliveries Today', value: (ops?.todayDeliveries ?? 0).toLocaleString('en-IN'), sub: 'Scheduled', color: '#34d399' },
                  { icon: Activity, label: 'Active Rentals', value: (overview?.activeRentals ?? 0).toLocaleString('en-IN'), sub: 'In progress', color: '#60a5fa' },
                  { icon: AlertTriangle, label: 'Late Deliveries', value: (ops?.lateDeliveries ?? 0).toLocaleString('en-IN'), sub: 'Needs attention', color: '#f87171' },
                  { icon: Package, label: 'Out of Stock', value: (overview?.outOfStockProducts ?? 0).toLocaleString('en-IN'), sub: 'Replenish', color: '#fbbf24' },
                ].map((s) => {
                  const Icon = s.icon
                  return (
                    <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${s.color}22` }}>
                        <Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                      </div>
                      <p className="text-lg font-extrabold text-white">{s.value}</p>
                      <p className="text-[11px] font-medium text-white/60">{s.label}</p>
                      <p className="text-[10px] text-white/30">{s.sub}</p>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/20"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
                </button>
                <a
                  href="/admin/intelligence"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/10"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" /> Open Intelligence Hub
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </IntelligencePageShell>
  )
}
