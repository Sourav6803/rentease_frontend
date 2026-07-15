'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  Package,
  Truck,
  PackageX,
  RefreshCw,
  TrendingUp,
  Star,
  Eye,
  Heart,
  Award,
  AlertTriangle,
  Activity,
  Repeat,
  Clock,
  Download,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  IntelligencePageShell,
  KpiGrid,
  ChartCard,
  PeriodSelector,
  DataTable,
} from '@/components/admin/intelligence'
import type { DataTableColumn } from '@/components/admin/intelligence'
import type {
  Period,
  ProductRow,
  CustomerSpender,
  ActiveCustomer,
  LeastProducts,
  KpiCardItem,
} from '@/types/admin-intelligence.types'
import {
  getOverview,
  getRentalCharts,
  getTopProducts,
  getLeastProducts,
  getCustomerAnalytics,
  formatINR,
  formatCompactINR,
  toCsv,
  downloadCsv,
} from '@/lib/api/admin-intelligence'

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

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

type TopTab = 'mostRented' | 'highestRevenue' | 'highestRated' | 'mostViewed' | 'mostWishlisted'

const TOP_TABS: { key: TopTab; label: string; icon: React.ElementType }[] = [
  { key: 'mostRented', label: 'Most Rented', icon: ShoppingBag },
  { key: 'highestRevenue', label: 'Top Revenue', icon: DollarSign },
  { key: 'highestRated', label: 'Best Rated', icon: Star },
  { key: 'mostViewed', label: 'Most Viewed', icon: Eye },
  { key: 'mostWishlisted', label: 'Most Wishlisted', icon: Heart },
]

export default function IntelligenceAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d')
  const [topTab, setTopTab] = useState<TopTab>('mostRented')

  const overviewQ = useQuery({
    queryKey: ['ai', 'analytics', 'overview', period],
    queryFn: () => getOverview(),
    staleTime: 60_000,
  })

  const chartsQ = useQuery({
    queryKey: ['ai', 'analytics', 'charts', period],
    queryFn: () => getRentalCharts({ period }),
    staleTime: 60_000,
  })

  const topQ = useQuery({
    queryKey: ['ai', 'analytics', 'top', period],
    queryFn: () => getTopProducts({ period }),
    staleTime: 60_000,
  })

  const leastQ = useQuery({
    queryKey: ['ai', 'analytics', 'least', period],
    queryFn: () => getLeastProducts({ period }),
    staleTime: 60_000,
  })

  const customerQ = useQuery({
    queryKey: ['ai', 'analytics', 'customers', period],
    queryFn: () => getCustomerAnalytics({ period }),
    staleTime: 60_000,
  })

  const demoMode = overviewQ.isError
  const overview = overviewQ.data
  const charts = chartsQ.data
  const top = topQ.data
  const least = leastQ.data
  const customers = customerQ.data

  const kpiItems = [
    { key: 'revenue', title: 'Total Revenue', value: formatCompactINR(overview?.totalRevenue ?? 0), icon: DollarSign, accent: '#2563eb', loading: overviewQ.isLoading },
    { key: 'mrr', title: 'MRR', value: formatCompactINR(overview?.mrr ?? 0), icon: TrendingUp, accent: '#4f46e5', loading: overviewQ.isLoading },
    { key: 'rentals', title: 'Total Rentals', value: (overview?.totalRentals ?? 0).toLocaleString('en-IN'), icon: ShoppingBag, accent: '#0ea5e9', loading: overviewQ.isLoading },
    { key: 'active', title: 'Active Rentals', value: (overview?.activeRentals ?? 0).toLocaleString('en-IN'), icon: Activity, accent: '#059669', loading: overviewQ.isLoading },
    { key: 'users', title: 'Active Users', value: (overview?.activeUsers ?? 0).toLocaleString('en-IN'), icon: Users, accent: '#7c3aed', loading: overviewQ.isLoading },
    { key: 'vendors', title: 'Vendors', value: (overview?.vendors ?? 0).toLocaleString('en-IN'), icon: Store, accent: '#d97706', loading: overviewQ.isLoading },
    { key: 'products', title: 'Products', value: (overview?.products ?? 0).toLocaleString('en-IN'), icon: Package, accent: '#db2777', loading: overviewQ.isLoading },
    { key: 'deliveries', title: 'Pending Deliveries', value: (overview?.pendingDeliveries ?? 0).toLocaleString('en-IN'), icon: Truck, accent: '#0891b2', loading: overviewQ.isLoading },
    { key: 'inventory', title: 'Available Inventory', value: (overview?.availableInventory ?? 0).toLocaleString('en-IN'), icon: Package, accent: '#16a34a', loading: overviewQ.isLoading },
    { key: 'oos', title: 'Out of Stock', value: (overview?.outOfStockProducts ?? 0).toLocaleString('en-IN'), icon: PackageX, accent: '#dc2626', loading: overviewQ.isLoading },
    { key: 'returned', title: 'Returned Rentals', value: (overview?.returnedRentals ?? 0).toLocaleString('en-IN'), icon: ShoppingBag, accent: '#64748b', loading: overviewQ.isLoading },
    { key: 'new-users', title: 'New Users (Month)', value: (overview?.newUsersThisMonth ?? 0).toLocaleString('en-IN'), icon: Users, accent: '#9333ea', loading: overviewQ.isLoading },
  ] satisfies KpiCardItem[]

  const rentalsByMonth = charts?.rentalsByMonth ?? []
  const revenueTrends = charts?.revenueTrends ?? []
  const rentalsByCategory = charts?.rentalsByCategory ?? []
  const rentalGrowth = charts?.rentalGrowth ?? []

  const categoryData = rentalsByCategory.map((c) => ({
    name: c.name ?? c.category ?? c.label ?? c._id ?? 'Other',
    value: c.count ?? c.value ?? c.total ?? 0,
  }))

  const activeTopList: ProductRow[] = (top?.[topTab] as ProductRow[] | undefined) ?? []

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
      accessor: (r) => (typeof r.views === 'object' ? ((r.views as { count?: number })?.count ?? 0) : Number(r.views ?? 0)),
      render: (r) => {
        const v = typeof r.views === 'object' ? ((r.views as { count?: number })?.count ?? 0) : Number(r.views ?? 0)
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

  const spenders: CustomerSpender[] = customers?.topSpendingCustomers ?? []
  const spenderColumns: DataTableColumn<Record<string, unknown>>[] = [
    { key: 'name', header: 'Customer', sortable: true },
    { key: 'email', header: 'Email', render: (r) => String(r.email ?? '—') },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      sortable: true,
      render: (r) => formatINR(Number(r.totalSpent ?? 0)),
    },
    {
      key: 'orders',
      header: 'Orders',
      sortable: true,
      render: (r) => (r.orders != null ? Number(r.orders).toLocaleString('en-IN') : '—'),
    },
  ]

  const activeCustomers: ActiveCustomer[] = customers?.mostActiveCustomers ?? []
  const activeColumns: DataTableColumn<Record<string, unknown>>[] = [
    { key: 'name', header: 'Customer', sortable: true },
    {
      key: 'rentalCount',
      header: 'Rentals',
      sortable: true,
      render: (r) => (r.rentalCount != null ? Number(r.rentalCount).toLocaleString('en-IN') : '—'),
    },
  ]

  const leastColumns: DataTableColumn<Record<string, unknown>>[] = [
    { key: 'name', header: 'Product', sortable: true },
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
      key: 'stock',
      header: 'Stock',
      sortable: true,
      accessor: (r) => (r.inventory as { availableQuantity?: number })?.availableQuantity ?? 0,
      render: (r) => {
        const inv = r.inventory as { availableQuantity?: number; totalQuantity?: number } | undefined
        return inv ? `${inv.availableQuantity ?? 0}/${inv.totalQuantity ?? 0}` : '—'
      },
    },
  ]

  const leastSections: { key: keyof LeastProducts; title: string; desc: string }[] = [
    { key: 'zeroRentals', title: 'Zero Rentals', desc: 'Listed but never rented' },
    { key: 'lowRating', title: 'Low Rated (≤3)', desc: 'Quality review needed' },
    { key: 'lowStock', title: 'Low Stock (≤2)', desc: 'Replenish soon' },
  ]

  const exportTop = () => {
    const rows = activeTopList.map((p) => ({
      name: p.name,
      rentals: p.rentalCount ?? '',
      revenue: p.revenue ?? '',
      views: typeof p.views === 'object' ? ((p.views as { count?: number })?.count ?? '') : (p.views ?? ''),
      rating: getRating(p),
      wishlist: p.wishlistCount ?? '',
    }))
    downloadCsv(`top-products-${topTab}-${period}.csv`, toCsv(rows, ['name', 'rentals', 'revenue', 'views', 'rating', 'wishlist']))
  }

  const exportSpenders = () => {
    const rows = spenders.map((s) => ({ name: s.name, email: s.email ?? '', totalSpent: s.totalSpent, orders: s.orders }))
    downloadCsv(`top-spenders-${period}.csv`, toCsv(rows, ['name', 'email', 'totalSpent', 'orders']))
  }

  return (
    <IntelligencePageShell
      title="Analytics"
      subtitle="Overview cards, rental trends, top & least performing products, and customer analytics"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: 'Analytics' },
      ]}
      demoMode={demoMode}
      actions={
        <div className="flex items-center gap-2">
          <PeriodSelector value={period} onChange={setPeriod} showCustom={false} />
          <button
            type="button"
            onClick={() => {
              overviewQ.refetch()
              chartsQ.refetch()
              topQ.refetch()
              leastQ.refetch()
              customerQ.refetch()
            }}
            disabled={overviewQ.isFetching || chartsQ.isFetching}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${(overviewQ.isFetching || chartsQ.isFetching) ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      }
    >
      {/* KPI grid */}
      <KpiGrid items={kpiItems} columns={4} className="mb-8" />

      {/* Charts row */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Rentals Over Time"
          description="Monthly / period rental volume"
          loading={chartsQ.isLoading}
          empty={!chartsQ.isLoading && rentalsByMonth.length === 0}
          className="lg:col-span-1"
        >
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rentalsByMonth} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
                <Bar dataKey="count" name="Rentals" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Revenue Trends"
          description="Revenue performance over the period"
          loading={chartsQ.isLoading}
          empty={!chartsQ.isLoading && revenueTrends.length === 0}
        >
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrends} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactINR(v)} />
                <Tooltip content={<ChartTooltip currencyKey="revenue" />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4f46e5" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Rentals by Category"
          description="Distribution across product categories"
          loading={chartsQ.isLoading}
          empty={!chartsQ.isLoading && categoryData.length === 0}
        >
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Rental Growth"
          description="Period-over-period growth %"
          loading={chartsQ.isLoading}
          empty={!chartsQ.isLoading && rentalGrowth.length === 0}
        >
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rentalGrowth} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<ChartTooltip suffix="%" />} />
                <Line type="monotone" dataKey="growth" name="Growth %" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Top products */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
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
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
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

      {/* Customer analytics */}
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Users className="h-4 w-4 text-blue-600" /> Customer Analytics
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
              <Repeat className="h-3.5 w-3.5" /> Repeat: {(customers?.repeatCustomers ?? 0).toLocaleString('en-IN')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <Clock className="h-3.5 w-3.5" /> Avg Duration: {customers?.averageRentalDurationDays ?? 0}d
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <DollarSign className="h-4 w-4 text-emerald-600" /> Top Spenders
              </h3>
              <button
                type="button"
                onClick={exportSpenders}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
            </div>
            <DataTable
              columns={spenderColumns}
              data={spenders as unknown as Record<string, unknown>[]}
              loading={customerQ.isLoading}
              searchable={false}
              pageSize={6}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Activity className="h-4 w-4 text-blue-600" /> Most Active Customers
            </h3>
            <DataTable
              columns={activeColumns}
              data={activeCustomers as unknown as Record<string, unknown>[]}
              loading={customerQ.isLoading}
              searchable={false}
              pageSize={6}
            />
          </div>
        </div>
      </div>

      {/* Least performing */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Least Performing Products
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {leastSections.map((sec) => {
            const list = (least?.[sec.key] ?? []) as ProductRow[]
            return (
              <div key={sec.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">{sec.title}</h3>
                <p className="mb-3 text-xs text-slate-500">{sec.desc}</p>
                <DataTable
                  columns={leastColumns}
                  data={list as unknown as Record<string, unknown>[]}
                  loading={leastQ.isLoading}
                  searchable={false}
                  pageSize={6}
                />
              </div>
            )
          })}
        </div>
      </div>
    </IntelligencePageShell>
  )
}
