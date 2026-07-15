'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ChartCard } from '@/components/admin/intelligence/ChartCard'
import { formatCompactINR, formatINR } from '@/lib/api/admin-intelligence'
import type { VendorOverviewItem } from '@/types/admin-intelligence.types'

const PALETTE = ['#6366f1', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444']

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: Record<string, unknown>; value?: number; name?: string }>
  label?: string | number
  formatter?: (v: number) => string
}

function ChartTooltip({ active, payload, label, formatter }: TooltipProps & { formatter?: (v: number) => string }) {
  if (!active || !payload?.length) return null
  const row = payload[0]
  const value = (row.value ?? (row.payload.amount as number) ?? 0) as number
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label != null && <p className="font-semibold text-slate-800">{String(label)}</p>}
      <p className="mt-0.5 text-slate-500">
        <span className="font-bold text-indigo-600">{formatter ? formatter(value) : value.toLocaleString('en-IN')}</span>
      </p>
    </div>
  )
}

/* Revenue trend (aggregated across one or many vendors) --------------------- */

export function VendorRevenueTrend({
  items,
  loading = false,
  className,
}: {
  items: VendorOverviewItem[]
  loading?: boolean
  className?: string
}) {
  const data = useMemo(() => {
    const byDate = new Map<string, number>()
    for (const it of items) {
      for (const d of it.revenueByDay ?? []) {
        byDate.set(d._id, (byDate.get(d._id) ?? 0) + (d.amount || 0))
      }
    }
    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, amount]) => ({ date, amount }))
  }, [items])

  return (
    <ChartCard
      title="Revenue Trend"
      description="Daily successful revenue across the selected period"
      loading={loading}
      empty={!loading && data.length === 0}
      className={className}
      height={280}
    >
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="vendorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatCompactINR(v)}
            width={56}
          />
          <Tooltip content={<ChartTooltip formatter={(v) => formatINR(v)} />} cursor={{ stroke: '#c7d2fe' }} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#vendorRev)"
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* Rental status mix (aggregated) ------------------------------------------- */

export function VendorStatusMix({
  items,
  loading = false,
  className,
}: {
  items: VendorOverviewItem[]
  loading?: boolean
  className?: string
}) {
  const data = useMemo(() => {
    const sums: Record<string, number> = {}
    for (const it of items) {
      for (const s of it.rentalsByStatus ?? []) {
        sums[s._id] = (sums[s._id] ?? 0) + s.count
      }
    }
    return Object.entries(sums)
      .map(([status, count]) => ({ status: status.replace(/_/g, ' '), count }))
      .sort((a, b) => b.count - a.count)
  }, [items])

  return (
    <ChartCard
      title="Rental Status Mix"
      description="Distribution of rental order statuses"
      loading={loading}
      empty={!loading && data.length === 0}
      className={className}
      height={280}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke="#eef2f7" />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="status"
            width={92}
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} animationDuration={900} maxBarSize={20}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* Top vendors by revenue (overview only) ----------------------------------- */

export function VendorRevenueRanking({
  items,
  loading = false,
  className,
}: {
  items: VendorOverviewItem[]
  loading?: boolean
  className?: string
}) {
  const data = useMemo(
    () =>
      [...items]
        .sort((a, b) => b.kpi.revenue.current - a.kpi.revenue.current)
        .slice(0, 8)
        .map((i) => ({
          name: (i.businessName ?? 'Vendor').slice(0, 18),
          revenue: i.kpi.revenue.current,
        })),
    [items],
  )

  return (
    <ChartCard
      title="Top Vendors by Revenue"
      description="Highest grossing vendors in the period"
      loading={loading}
      empty={!loading && data.length === 0}
      className={className}
      height={280}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke="#eef2f7" />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompactINR(v)} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip formatter={(v) => formatINR(v)} />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill="#0ea5e9" animationDuration={900} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* Rating distribution (detail only) ---------------------------------------- */

export function VendorRatingDistribution({
  distribution,
  loading = false,
  className,
}: {
  distribution?: Record<string, number>
  loading?: boolean
  className?: string
}) {
  const data = useMemo(() => {
    const dist = distribution ?? {}
    return [1, 2, 3, 4, 5].map((star) => ({ star: `${star}★`, count: dist[String(star)] ?? 0 }))
  }, [distribution])

  return (
    <ChartCard
      title="Rating Distribution"
      description="Customer review scores"
      loading={loading}
      empty={!loading && data.every((d) => d.count === 0)}
      className={className}
      height={260}
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="star" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={40} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={900} maxBarSize={42}>
            {data.map((_, i) => (
              <Cell key={i} fill={['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#16a34a'][i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export default VendorRevenueTrend
