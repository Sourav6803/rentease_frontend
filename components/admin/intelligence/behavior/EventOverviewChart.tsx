'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Activity } from 'lucide-react'
import { ChartCard } from '@/components/admin/intelligence/ChartCard'
import type { BehaviorFilters } from '@/types/admin-intelligence.types'

interface EventOverviewChartProps {
  data: Array<{ _id: string; count: number }>
  loading?: boolean
  filters?: BehaviorFilters
  className?: string
}

const PALETTE = ['#6366f1', '#7c3aed', '#0ea5e9', '#059669', '#f59e0b', '#ec4899', '#14b8a6']

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { _id: string; count: number } }> }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="font-semibold capitalize text-slate-800">{row._id.replace(/_/g, ' ')}</p>
      <p className="mt-0.5 text-slate-500">
        <span className="font-bold text-indigo-600">{row.count.toLocaleString()}</span> events
      </p>
    </div>
  )
}

export function EventOverviewChart({ data, loading = false, className }: EventOverviewChartProps) {
  const chartData = useMemo(
    () =>
      [...data]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((d) => ({ ...d, label: d._id.replace(/_/g, ' ') })),
    [data],
  )

  return (
    <ChartCard
      title="Events by type"
      description="Volume of each tracked storefront event"
      loading={loading}
      empty={!loading && chartData.length === 0}
      emptyLabel="No events recorded for this period"
      actions={<Activity className="h-4 w-4 text-indigo-400" />}
      className={className}
      height={300}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke="#eef2f7" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} animationDuration={900} maxBarSize={22}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export default EventOverviewChart
