'use client'

import { motion } from 'framer-motion'
import {
  Timer,
  ScrollText,
  UsersRound,
  PackageSearch,
  FileStack,
  ShoppingCart,
  CalendarClock,
  Gauge,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SessionMetrics as SessionMetricsType } from '@/types/admin-intelligence.types'

interface SessionMetricsProps {
  metrics?: SessionMetricsType
  loading?: boolean
  className?: string
}

interface MetricDef {
  key: keyof SessionMetricsType
  label: string
  icon: LucideIcon
  accent: string
  format: (v: number) => string
}

const METRICS: MetricDef[] = [
  {
    key: 'avgSessionTimeSeconds',
    label: 'Avg. session time',
    icon: Timer,
    accent: '#6366f1',
    format: (v) => `${Math.floor(v / 60)}m ${Math.round(v % 60)}s`,
  },
  {
    key: 'avgScrollDepth',
    label: 'Avg. scroll depth',
    icon: ScrollText,
    accent: '#7c3aed',
    format: (v) => `${Math.round(v)}%`,
  },
  {
    key: 'returningVisitors',
    label: 'Returning visitors',
    icon: UsersRound,
    accent: '#0ea5e9',
    format: (v) => v.toLocaleString(),
  },
  {
    key: 'avgProductsViewed',
    label: 'Products viewed',
    icon: PackageSearch,
    accent: '#059669',
    format: (v) => v.toFixed(1),
  },
  {
    key: 'pagesPerSession',
    label: 'Pages / session',
    icon: FileStack,
    accent: '#f59e0b',
    format: (v) => v.toFixed(1),
  },
  {
    key: 'avgCartSize',
    label: 'Avg. cart size',
    icon: ShoppingCart,
    accent: '#ec4899',
    format: (v) => v.toFixed(1),
  },
  {
    key: 'avgRentalDurationDays',
    label: 'Avg. rental duration',
    icon: CalendarClock,
    accent: '#14b8a6',
    format: (v) => `${v.toFixed(1)}d`,
  },
]

function MetricCard({
  def,
  value,
  index,
  loading,
}: {
  def: MetricDef
  value?: number
  index: number
  loading: boolean
}) {
  const Icon = def.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div
        className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-bl-[70px] opacity-60"
        style={{ background: `${def.accent}15` }}
      />
      <div className="mb-2.5 flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `${def.accent}18` }}
        >
          <Icon className="h-4 w-4" style={{ color: def.accent }} />
        </div>
        <span className="text-xs font-medium text-slate-500">{def.label}</span>
      </div>
      {loading ? (
        <div className="h-7 w-20 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <p className="text-xl font-extrabold tracking-tight text-slate-900">
          {value !== undefined ? def.format(value) : '—'}
        </p>
      )}
    </motion.div>
  )
}

export function SessionMetrics({ metrics, loading = false, className }: SessionMetricsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Gauge className="h-4 w-4 text-amber-500" />
            Session metrics
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">Engagement depth & quality</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {METRICS.map((def, i) => (
          <MetricCard
            key={def.key}
            def={def}
            value={metrics ? metrics[def.key] : undefined}
            index={i}
            loading={loading}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default SessionMetrics
