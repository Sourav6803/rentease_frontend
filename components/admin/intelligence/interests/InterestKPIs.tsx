'use client'

import type { InterestKpi } from './interests.types'
import { KpiCard, type KpiStat } from '../kpi'
import { cn } from '@/lib/utils'

interface InterestKPIsProps {
  kpis: InterestKpi[]
  columns?: 3 | 4 | 6 | 9
  className?: string
}

const colClass: Record<number, string> = {
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  6: 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
  9: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-9',
}

export function InterestKPIs({ kpis, columns = 9, className }: InterestKPIsProps) {
  const stats: KpiStat[] = kpis.map((kpi) => ({
    key: kpi.key,
    title: kpi.title,
    value: kpi.value,
    raw: kpi.raw,
    forceValue: kpi.key === 'avg_time' || kpi.key === 'interest_rental' || kpi.key === 'avg_score',
    change: kpi.change,
    trend: kpi.trend,
    icon: kpi.icon,
    accent: kpi.accent,
    sparkline: kpi.sparkline,
    tooltip: kpi.tooltip,
    sub: kpi.sub,
  }))

  return (
    <div className={cn('grid grid-cols-1 gap-4', colClass[columns], className)}>
      {stats.map((stat, i) => (
        <KpiCard key={stat.key} kpi={stat} index={i} />
      ))}
    </div>
  )
}

export default InterestKPIs
