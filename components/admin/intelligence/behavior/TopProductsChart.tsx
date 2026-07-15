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
import { Package } from 'lucide-react'
import { ChartCard } from '@/components/admin/intelligence/ChartCard'

interface TopProductsChartProps {
  data: Array<{ _id?: string; name: string; views: number }>
  loading?: boolean
  className?: string
}

const PALETTE = ['#6366f1', '#7c3aed', '#0ea5e9', '#059669', '#f59e0b', '#ec4899', '#14b8a6']

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; views: number } }> }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="font-semibold text-slate-800">{row.name}</p>
      <p className="mt-0.5 text-slate-500">
        <span className="font-bold text-violet-600">{row.views.toLocaleString()}</span> views
      </p>
    </div>
  )
}

export function TopProductsChart({ data, loading = false, className }: TopProductsChartProps) {
  const chartData = useMemo(
    () => [...data].sort((a, b) => b.views - a.views).slice(0, 10).reverse(),
    [data],
  )

  return (
    <ChartCard
      title="Most viewed products"
      description="Top listings by total views"
      loading={loading}
      empty={!loading && chartData.length === 0}
      emptyLabel="No product views tracked yet"
      actions={<Package className="h-4 w-4 text-violet-400" />}
      className={className}
      height={300}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke="#eef2f7" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="views" radius={[0, 6, 6, 0]} animationDuration={900} maxBarSize={20}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export default TopProductsChart
