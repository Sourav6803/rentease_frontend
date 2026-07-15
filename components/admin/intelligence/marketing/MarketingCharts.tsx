'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Globe2, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChartSeriesPoint } from '@/types/admin-intelligence.types'
import { ChartCard } from '@/components/admin/intelligence/ChartCard'

interface MarketingChartData {
  deliveryTimeline?: ChartSeriesPoint[]
  deviceBreakdown?: Array<{ _id: string; count: number }>
  geography?: Array<{ _id: string; count: number }>
  opensByHour?: Array<{ _id: string; count: number }>
}

interface MarketingChartsProps {
  data: MarketingChartData
  loading?: boolean
  className?: string
}

const PALETTE = ['#6366f1', '#7c3aed', '#0ea5e9', '#059669', '#f59e0b', '#ec4899']

function pointValue(p: ChartSeriesPoint): number {
  return Number(p.count ?? p.value ?? p.total ?? p.revenue ?? 0)
}

function pointLabel(p: ChartSeriesPoint): string {
  return String(
    p.label ?? p.month ?? p.date ?? p.name ?? p.category ?? p._id ?? '',
  )
}

export function MarketingCharts({ data, loading = false, className }: MarketingChartsProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-2', className)}>
      <EngagementArea
        data={data.deliveryTimeline ?? []}
        loading={loading}
      />
      <DeviceDonut
        data={data.deviceBreakdown ?? []}
        loading={loading}
      />
      <OpensByHour data={data.opensByHour ?? []} loading={loading} />
      <GeographyBars data={data.geography ?? []} loading={loading} />
    </div>
  )
}

/* ------------------------------ Area chart ------------------------------ */

function EngagementArea({
  data,
  loading,
}: {
  data: ChartSeriesPoint[]
  loading?: boolean
}) {
  const { path, area, points } = useMemo(() => {
    const W = 100
    const H = 40
    if (data.length === 0)
      return { path: '', area: '', points: [] as Array<{ x: number; y: number }> }
    const max = Math.max(1, ...data.map(pointValue))
    const step = data.length > 1 ? W / (data.length - 1) : W
    const pts = data.map((p, i) => ({
      x: i * step,
      y: H - (pointValue(p) / max) * (H - 4) - 2,
    }))
    const line = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`).join(' ')
    const areaPath = `${line} L${W},${H} L0,${H} Z`
    return { path: line, area: areaPath, points: pts }
  }, [data])

  return (
    <ChartCard
      title="Delivery & engagement"
      description="Emails delivered over time"
      loading={loading}
      empty={!loading && data.length === 0}
      actions={
        <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600">
          <TrendingUp className="h-3.5 w-3.5" /> Trend
        </span>
      }
      className="lg:col-span-2"
    >
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-44 w-full">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points.length > 0 && (
          <>
            <path d={area} fill="url(#areaFill)" />
            <path
              d={path}
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            {points.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="1.4"
                fill="#6366f1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </>
        )}
      </svg>
      {points.length > 0 && (
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          <span>{pointLabel(data[0])}</span>
          <span>{pointLabel(data[data.length - 1])}</span>
        </div>
      )}
    </ChartCard>
  )
}

/* ------------------------------ Donut chart ----------------------------- */

function DeviceDonut({
  data,
  loading,
}: {
  data: Array<{ _id: string; count: number }>
  loading?: boolean
}) {
  const { segments, total } = useMemo(() => {
    const total = data.reduce((s, d) => s + d.count, 0)
    const segments = data.map((d, i) => {
      const frac = total > 0 ? d.count / total : 0
      const offset = data
        .slice(0, i)
        .reduce((s, prev) => s + (total > 0 ? prev.count / total : 0), 0)
      return { id: d._id, value: d.count, frac, offset, color: PALETTE[i % PALETTE.length] }
    })
    return { segments, total }
  }, [data])

  const R = 42
  const C = 2 * Math.PI * R

  return (
    <ChartCard
      title="Device breakdown"
      description="Opens by device type"
      loading={loading}
      empty={!loading && data.length === 0}
      actions={<Smartphone className="h-4 w-4 text-slate-300" />}
    >
      <div className="flex items-center gap-5">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" stroke="#f1f5f9" strokeWidth="12" />
            {segments.map((s) => (
              <motion.circle
                key={s.id}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${s.frac * C} ${C}`}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: -s.offset * C }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-slate-900">{total}</span>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">total</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {segments.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 capitalize text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                {s.id}
              </span>
              <span className="font-semibold text-slate-800">{Math.round(s.frac * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  )
}

/* ------------------------------ Hourly bars ----------------------------- */

function OpensByHour({
  data,
  loading,
}: {
  data: Array<{ _id: string; count: number }>
  loading?: boolean
}) {
  const { bars } = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.count))
    const bars = data.map((d) => ({ id: d._id, count: d.count, h: (d.count / max) * 100 }))
    return { bars }
  }, [data])

  return (
    <ChartCard
      title="Opens by hour"
      description="When customers engage"
      loading={loading}
      empty={!loading && data.length === 0}
      actions={<Clock className="h-4 w-4 text-slate-300" />}
    >
      <div className="flex h-44 items-end justify-between gap-1">
        {bars.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ height: 0 }}
            animate={{ height: `${b.h}%` }}
            transition={{ delay: i * 0.02, duration: 0.4 }}
            className="group relative flex flex-1 items-end"
          >
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400"
              title={`${b.id}:00 — ${b.count}`}
            />
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100">
              {b.count}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{bars[0]?.id ?? '00'}:00</span>
        <span>{bars[bars.length - 1]?.id ?? '23'}:00</span>
      </div>
    </ChartCard>
  )
}

/* ----------------------------- Geography bars --------------------------- */

function GeographyBars({
  data,
  loading,
}: {
  data: Array<{ _id: string; count: number }>
  loading?: boolean
}) {
  const { rows, max } = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 6)
    const max = Math.max(1, ...sorted.map((d) => d.count))
    return { rows: sorted, max }
  }, [data])

  return (
    <ChartCard
      title="Top geographies"
      description="Opens by location"
      loading={loading}
      empty={!loading && data.length === 0}
      actions={<Globe2 className="h-4 w-4 text-slate-300" />}
    >
      <div className="space-y-2.5">
        {rows.map((r, i) => (
          <div key={r._id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">{r._id}</span>
              <span className="font-semibold text-slate-800">{r.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(r.count / max) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="h-full rounded-full"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

export default MarketingCharts
