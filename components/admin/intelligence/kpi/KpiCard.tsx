'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TrendPill } from '../TrendPill'
import { Sparkline } from './Sparkline'
import { useCountUp } from './useCountUp'
import { cn } from '@/lib/utils'

export type KpiTrend = 'up' | 'down' | 'neutral'

export interface KpiStat {
  key: string
  title: string
  /** preformatted display value (used when raw animation is not desired) */
  value?: string
  /** numeric value used for the animated counter */
  raw: number
  /** when true, render `value` verbatim instead of animating `raw` */
  forceValue?: boolean
  change: number
  trend: KpiTrend
  icon: LucideIcon
  accent: string
  sparkline: number[]
  tooltip: string
  sub?: string
  className?: string
}

interface KpiCardProps {
  kpi: KpiStat
  index?: number
}

export function KpiCard({ kpi, index = 0 }: KpiCardProps) {
  const Icon = kpi.icon
  const accent = kpi.accent
  const animated = useCountUp(kpi.raw)
  const display = kpi.forceValue && kpi.value !== undefined ? kpi.value : animated.toString()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04, duration: 0.35 }}
          whileHover={{ y: -4 }}
          className={cn(
            'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
            kpi.className,
          )}
        >
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-xl transition-opacity group-hover:opacity-20"
            style={{ background: accent }}
          />
          <div className="mb-2 flex items-start justify-between">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: `${accent}18` }}
            >
              <Icon className="h-4.5 w-4.5" style={{ color: accent, width: 18, height: 18 }} />
            </div>
            <TrendPill value={kpi.change} trend={kpi.trend} />
          </div>
          <p className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">
            {display}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-slate-600">{kpi.title}</p>
          {kpi.sub && <p className="mt-0.5 text-[10px] text-slate-400">{kpi.sub}</p>}
          <div className="mt-3">
            <Sparkline data={kpi.sparkline} color={accent} />
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px]">
        <p className="text-xs font-medium text-slate-700">{kpi.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function KpiGrid({ kpis, columns = 9 }: { kpis: KpiStat[]; columns?: 3 | 4 | 6 | 9 }) {
  const colClass: Record<number, string> = {
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    6: 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
    9: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-9',
  }
  return (
    <div className={cn('grid grid-cols-1 gap-4', colClass[columns])}>
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.key} kpi={kpi} index={i} />
      ))}
    </div>
  )
}
