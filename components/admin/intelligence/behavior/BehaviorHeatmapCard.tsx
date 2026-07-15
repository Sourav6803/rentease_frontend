'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Grid3x3 } from 'lucide-react'
import { ChartCard } from '@/components/admin/intelligence/ChartCard'
import { cn } from '@/lib/utils'

interface HeatmapCell {
  day: string
  hour: number
  value: number
}

interface BehaviorHeatmapCardProps {
  data: HeatmapCell[]
  loading?: boolean
  className?: string
  title?: string
  description?: string
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function colorFor(ratio: number): string {
  if (ratio <= 0) return '#f1f5f9'
  if (ratio < 0.2) return '#e0e7ff'
  if (ratio < 0.4) return '#c7d2fe'
  if (ratio < 0.6) return '#a5b4fc'
  if (ratio < 0.8) return '#818cf8'
  return '#6366f1'
}

export function BehaviorHeatmapCard({
  data,
  loading = false,
  className,
  title = 'Activity heatmap',
  description = 'Events by day of week and hour',
}: BehaviorHeatmapCardProps) {
  const { grid, max, hours } = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.value))
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const map = new Map<string, number>()
    data.forEach((d) => map.set(`${d.day}-${d.hour}`, d.value))
    const grid = DAYS.map((day) =>
      hours.map((hour) => ({ day, hour, value: map.get(`${day}-${hour}`) ?? 0 })),
    )
    return { grid, max, hours }
  }, [data])

  return (
    <ChartCard
      title={title}
      description={description}
      loading={loading}
      empty={!loading && data.length === 0}
      emptyLabel="No activity to visualize"
      actions={<Grid3x3 className="h-4 w-4 text-indigo-400" />}
      className={className}
      height={240}
    >
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="mb-1 flex pl-9">
            {hours.filter((h) => h % 3 === 0).map((h) => (
              <span key={h} className="flex-1 text-center text-[9px] text-slate-400">
                {String(h).padStart(2, '0')}
              </span>
            ))}
          </div>
          {grid.map((row, ri) => (
            <div key={row[0].day} className="mb-1 flex items-center">
              <span className="w-9 shrink-0 text-[10px] font-medium text-slate-500">{row[0].day}</span>
              <div className="flex flex-1 gap-1">
                {row.map((cell, ci) => {
                  const ratio = cell.value / max
                  return (
                    <motion.div
                      key={`${ri}-${ci}`}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (ri * 24 + ci) * 0.0015, duration: 0.2 }}
                      title={`${cell.day} ${String(cell.hour).padStart(2, '0')}:00 — ${cell.value} events`}
                      className={cn('h-4 flex-1 rounded-[3px]', cell.value === 0 && 'ring-1 ring-inset ring-slate-100')}
                      style={{ background: colorFor(ratio) }}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-slate-400">
        <span>Less</span>
        {['#f1f5f9', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'].map((c) => (
          <span key={c} className="h-3 w-3 rounded-[3px]" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </ChartCard>
  )
}

export default BehaviorHeatmapCard
