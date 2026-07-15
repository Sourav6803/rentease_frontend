'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Smartphone } from 'lucide-react'
import { ChartCard } from '@/components/admin/intelligence/ChartCard'
import { cn } from '@/lib/utils'
import type { DeviceAnalytics as DeviceAnalyticsType } from '@/types/admin-intelligence.types'

interface DeviceAnalyticsProps {
  /** Either pre-aggregated DeviceAnalytics rows or raw {_id,count} buckets. */
  data?: DeviceAnalyticsType[]
  raw?: Array<{ _id: string; count: number }>
  loading?: boolean
  className?: string
}

const PALETTE = ['#6366f1', '#7c3aed', '#0ea5e9', '#059669', '#f59e0b', '#ec4899']

interface Slice {
  id: string
  value: number
  fraction: number
  color: string
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Slice }> }) {
  if (!active || !payload?.length) return null
  const s = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="flex items-center gap-1.5 font-semibold capitalize text-slate-800">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
        {s.id}
      </p>
      <p className="mt-0.5 text-slate-500">
        <span className="font-bold" style={{ color: s.color }}>
          {s.value.toLocaleString()}
        </span>{' '}
        · {Math.round(s.fraction * 100)}%
      </p>
    </div>
  )
}

export function DeviceAnalytics({ data, raw, loading = false, className }: DeviceAnalyticsProps) {
  const slices = useMemo<Slice[]>(() => {
    const source =
      data && data.length > 0
        ? data.map((d) => ({ _id: d.device, count: d.count }))
        : (raw ?? [])
    const total = source.reduce((s, d) => s + d.count, 0)
    return source.map((d, i) => ({
      id: d._id,
      value: d.count,
      fraction: total > 0 ? d.count / total : 0,
      color: PALETTE[i % PALETTE.length],
    }))
  }, [data, raw])

  return (
    <ChartCard
      title="Device breakdown"
      description="Sessions by device type"
      loading={loading}
      empty={!loading && slices.length === 0}
      emptyLabel="No device data for this period"
      actions={<Smartphone className="h-4 w-4 text-violet-400" />}
      className={className}
      height={260}
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="id"
                innerRadius={54}
                outerRadius={78}
                paddingAngle={2}
                animationDuration={900}
                stroke="none"
              >
                {slices.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-slate-900">
              {slices.reduce((s, d) => s + d.value, 0).toLocaleString()}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">sessions</span>
          </div>
        </div>

        <div className="w-full flex-1 space-y-2.5">
          {slices.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2 capitalize text-sm text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                {s.id}
              </span>
              <div className="flex items-center gap-3">
                <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 sm:block">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.fraction * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: s.color }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold text-slate-800">
                  {Math.round(s.fraction * 100)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ChartCard>
  )
}

export default DeviceAnalytics
