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
  Legend,
  Cell,
} from 'recharts'
import { Globe2, IndianRupee } from 'lucide-react'
import { ChartCard } from '@/components/admin/intelligence/ChartCard'
import { formatPrice } from '@/lib/utils'
import type { TrafficSourceItem } from '@/types/admin-intelligence.types'

interface TrafficAnalyticsProps {
  data: TrafficSourceItem[]
  loading?: boolean
  className?: string
}

const PALETTE = ['#6366f1', '#7c3aed', '#0ea5e9', '#059669', '#f59e0b', '#ec4899']

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="mb-1 font-semibold capitalize text-slate-800">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 text-slate-500">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.dataKey === 'revenue' ? formatPrice(p.value) : p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export function TrafficAnalytics({ data, loading = false, className }: TrafficAnalyticsProps) {
  const chartData = useMemo(() => [...data].sort((a, b) => b.visitors - a.visitors), [data])

  return (
    <ChartCard
      title="Traffic sources"
      description="Where engaged visitors come from"
      loading={loading}
      empty={!loading && chartData.length === 0}
      emptyLabel="No traffic sources recorded"
      actions={<Globe2 className="h-4 w-4 text-blue-400" />}
      className={className}
      height={300}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis
            dataKey="source"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis yAxisId="right" orientation="right" hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#64748b' }}
            iconType="circle"
            formatter={(v) => <span className="capitalize text-slate-500">{v}</span>}
          />
          <Bar
            yAxisId="left"
            dataKey="visitors"
            name="visitors"
            radius={[6, 6, 0, 0]}
            animationDuration={900}
            maxBarSize={36}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
          <Bar
            yAxisId="right"
            dataKey="conversion"
            name="conversion"
            radius={[6, 6, 0, 0]}
            animationDuration={900}
            fill="#fbbf24"
            maxBarSize={10}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-4">
        {chartData.map((t, i) => (
          <motion.div
            key={t.source}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="rounded-xl bg-slate-50/70 p-3"
          >
            <p className="flex items-center gap-1.5 text-xs font-medium capitalize text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              {t.source}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">{t.visitors.toLocaleString()}</p>
            <p className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>CR {Math.round(t.conversion * 100)}%</span>
              <span className="flex items-center gap-0.5">
                <IndianRupee className="h-3 w-3" />
                {formatPrice(t.revenue)}
              </span>
            </p>
          </motion.div>
        ))}
      </div>
    </ChartCard>
  )
}

export default TrafficAnalytics
