'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Package,
  Eye,
  Heart,
  AlertTriangle,
  RefreshCw,
  Star,
} from 'lucide-react'
import { getProductIntelligence, formatINR } from '@/lib/api/admin-intelligence'
import {
  IntelligencePageShell,
  KpiGrid,
  PeriodSelector,
  DateRangePicker,
  ChartCard,
  DataTable,
  ExportButton,
} from '@/components/admin/intelligence'
import type { DataTableColumn, KpiCardItem, ProductIntelligence, ProductRow } from '@/types/admin-intelligence.types'
import { useIntelligencePeriod } from '@/hooks/useIntelligencePeriod'
import { productName, productViews } from '@/lib/intelligence/product-helpers'

const STATIC: ProductIntelligence = {
  period: '30d',
  dateRange: { start: '2025-06-01', end: '2025-07-01' },
  mostViewed: [
    { name: 'DJI Drone Pro', views: { count: 8420 } },
    { name: 'Canon EOS R5', views: { count: 6210 } },
    { name: 'MacBook Pro M3', views: { count: 5840 } },
  ] as ProductRow[],
  mostRented: [
    { name: 'DJI Drone Pro', rentalCount: 342, revenue: 820000 },
    { name: 'Honda City 2023', rentalCount: 241, revenue: 1200000 },
  ],
  mostAddedToCart: [
    { _id: '1', count: 420 },
    { _id: '2', count: 380 },
  ],
  mostWishlisted: [
    { _id: '1', count: 210 },
    { _id: '2', count: 185 },
  ],
  highestRated: [{ name: 'DJI Drone Pro', ratings: { average: 4.9, count: 128 } }],
  highestRevenue: [{ name: 'Honda City 2023', revenue: 1200000, rentalCount: 241 }],
  lowestRated: [{ name: 'Budget Speaker', ratings: { average: 2.8, count: 14 } }],
  zeroViews: [{ name: 'New Listing A' }, { name: 'New Listing B' }],
  zeroRentals: [{ name: 'Slow Mover X' }, { name: 'Slow Mover Y' }],
  highViewsLowRentals: [
    { name: '4K Projector XL', views: 3200, rentalCount: 1 },
    { name: 'Gaming Console', views: 2800, rentalCount: 2 },
  ] as ProductRow[],
  interestedProducts: [],
}

type TabKey = 'viewed' | 'rented' | 'cart' | 'wishlist' | 'issues'

export default function IntelligenceProductsPage() {
  const { period, setPeriod, customRange, setCustomRange, params, isCustom } = useIntelligencePeriod('30d')
  const [activeTab, setActiveTab] = useState<TabKey>('viewed')

  const dataQ = useQuery({
    queryKey: ['ai', 'products', params],
    queryFn: () => getProductIntelligence(params),
    staleTime: 60_000,
  })

  const demoMode = dataQ.isError
  const data = demoMode ? STATIC : (dataQ.data ?? STATIC)

  const kpiItems: KpiCardItem[] = [
    { key: 'viewed', title: 'Top Viewed', value: data.mostViewed?.length ?? 0, icon: Eye, accent: '#2563eb', loading: dataQ.isLoading },
    { key: 'rented', title: 'Most Rented', value: data.mostRented?.length ?? 0, icon: Package, accent: '#059669', loading: dataQ.isLoading },
    { key: 'issues', title: 'High Views / Low Rentals', value: data.highViewsLowRentals?.length ?? 0, icon: AlertTriangle, accent: '#dc2626', loading: dataQ.isLoading },
    { key: 'zero', title: 'Zero Rentals', value: data.zeroRentals?.length ?? 0, icon: AlertTriangle, accent: '#d97706', loading: dataQ.isLoading },
  ]

  const cartChart = useMemo(
    () =>
      (data.mostAddedToCart ?? []).slice(0, 8).map((item, i) => ({
        name: `#${i + 1}`,
        count: item.count,
      })),
    [data.mostAddedToCart],
  )

  const productColumns: DataTableColumn<ProductRow>[] = [
    { key: 'name', header: 'Product', sortable: true, accessor: (r) => productName(r) },
    {
      key: 'views',
      header: 'Views',
      sortable: true,
      accessor: (r) => productViews(r as Record<string, unknown>),
    },
    {
      key: 'rentals',
      header: 'Rentals',
      sortable: true,
      accessor: (r) => r.rentalCount ?? 0,
    },
    {
      key: 'revenue',
      header: 'Revenue',
      sortable: true,
      render: (r) => formatINR(r.revenue ?? 0),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (r) => (
        <span className="inline-flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {r.ratings?.average?.toFixed(1) ?? '—'}
        </span>
      ),
    },
  ]

  const issueColumns: DataTableColumn<ProductRow>[] = [
    { key: 'name', header: 'Product', accessor: (r) => productName(r) },
    { key: 'views', header: 'Views', accessor: (r) => productViews(r as Record<string, unknown>) },
    { key: 'rentals', header: 'Rentals', accessor: (r) => r.rentalCount ?? 0 },
  ]

  const tabData: Record<TabKey, ProductRow[]> = {
    viewed: data.mostViewed ?? [],
    rented: data.mostRented ?? [],
    cart: [],
    wishlist: [],
    issues: data.highViewsLowRentals ?? [],
  }

  const exportRows = (data.mostRented ?? []).map((p) => ({
    name: productName(p),
    views: productViews(p as Record<string, unknown>),
    rentals: p.rentalCount ?? 0,
    revenue: p.revenue ?? 0,
  }))

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'viewed', label: 'Most Viewed', icon: Eye },
    { key: 'rented', label: 'Most Rented', icon: Package },
    { key: 'issues', label: 'Conversion Gaps', icon: AlertTriangle },
  ]

  return (
    <IntelligencePageShell
      title="Product Intelligence"
      subtitle="Demand signals, performance rankings & conversion gaps"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: 'Products' },
      ]}
      demoMode={demoMode}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <PeriodSelector value={period} onChange={setPeriod} />
          {isCustom && <DateRangePicker value={customRange} onChange={setCustomRange} />}
          <ExportButton filename="product-intelligence.csv" rows={exportRows} columns={['name', 'views', 'rentals', 'revenue']} />
          <button
            type="button"
            onClick={() => dataQ.refetch()}
            disabled={dataQ.isFetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${dataQ.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      }
    >
      <KpiGrid items={kpiItems} columns={4} className="mb-8" />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Cart Adds" description="Top products added to cart" loading={dataQ.isLoading} empty={!cartChart.length}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cartChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Cart adds" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Wishlist Leaders" description="Most wishlisted products" loading={dataQ.isLoading} empty={!data.mostWishlisted?.length}>
          <div className="space-y-2">
            {(data.mostWishlisted ?? []).slice(0, 6).map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <span className="flex items-center gap-2 text-slate-700">
                  <Heart className="h-3.5 w-3.5 text-pink-500" />
                  Product #{String(item._id).slice(-6)}
                </span>
                <span className="font-semibold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <DataTable
        columns={activeTab === 'issues' ? issueColumns : productColumns}
        data={tabData[activeTab]}
        loading={dataQ.isLoading}
        getRowKey={(r, i) => String(r._id ?? productName(r) + i)}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Zero Views</h2>
          <DataTable
            columns={[{ key: 'name', header: 'Product', accessor: (r) => productName(r) }]}
            data={data.zeroViews ?? []}
            loading={dataQ.isLoading}
            searchable={false}
            pageSize={5}
          />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Zero Rentals</h2>
          <DataTable
            columns={[{ key: 'name', header: 'Product', accessor: (r) => productName(r) }]}
            data={data.zeroRentals ?? []}
            loading={dataQ.isLoading}
            searchable={false}
            pageSize={5}
          />
        </div>
      </div>
    </IntelligencePageShell>
  )
}
