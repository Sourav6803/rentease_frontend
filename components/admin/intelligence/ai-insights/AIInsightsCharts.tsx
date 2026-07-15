'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartCard } from '@/components/admin/intelligence/ChartCard'
import { formatINR } from '@/lib/api/admin-intelligence'

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: Record<string, unknown>; value?: number }>
  label?: string | number
}

function ChartTooltip({ active, payload, label, currency }: TooltipProps & { currency?: boolean }) {
  if (!active || !payload?.length) return null
  const row = payload[0]
  const value = (row.value ?? (row.payload.revenue as number) ?? 0) as number
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label != null && <p className="font-semibold text-slate-800">{String(label)}</p>}
      <p className="mt-0.5 text-slate-500">
        <span className="font-bold text-indigo-600">
          {currency ? formatINR(value) : value.toLocaleString('en-IN')}
        </span>
      </p>
    </div>
  )
}

/* Revenue Drivers — real (categoryRevenue) */
export function RevenueDriversChart({
  categoryRevenue,
  loading = false,
  className,
}: {
  categoryRevenue: Array<{ _id: string; revenue: number; count: number }>
  loading?: boolean
  className?: string
}) {
  const data = useMemo(
    () => [...categoryRevenue].sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    [categoryRevenue],
  )
  return (
    <ChartCard
      title="Revenue Drivers"
      description="Top categories by revenue (this window)"
      loading={loading}
      empty={!loading && data.length === 0}
      emptyLabel="No category revenue in this window"
      className={className}
      height={280}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ left: 4, right: 8, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={48} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatINR(v)} width={56} />
          <Tooltip content={<ChartTooltip currency />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} animationDuration={900} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* Category Growth — real (categoryRevenue, horizontal) */
export function CategoryGrowthChart({
  categoryRevenue,
  loading = false,
  className,
}: {
  categoryRevenue: Array<{ _id: string; revenue: number; count: number }>
  loading?: boolean
  className?: string
}) {
  const data = useMemo(
    () => [...categoryRevenue].sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    [categoryRevenue],
  )
  return (
    <ChartCard
      title="Category Growth"
      description="Category revenue distribution"
      loading={loading}
      empty={!loading && data.length === 0}
      emptyLabel="No category data in this window"
      className={className}
      height={280}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke="#eef2f7" />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatINR(v)} />
          <YAxis type="category" dataKey="_id" width={100} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip currency />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="revenue" fill="#0ea5e9" radius={[0, 6, 6, 0]} animationDuration={900} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* Honest placeholder for signals not in the AI-insights payload */
export function InsightPlaceholderChart({
  title,
  description,
  className,
}: {
  title: string
  description: string
  className?: string
}) {
  return (
    <ChartCard
      title={title}
      description={description}
      empty
      emptyLabel="Signal not included in the AI-insights payload — see dedicated analytics modules"
      className={className}
      height={280}
    >
      <span />
    </ChartCard>
  )
}

export default RevenueDriversChart
