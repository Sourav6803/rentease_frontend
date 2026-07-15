'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendPillProps {
  value: number
  trend?: 'up' | 'down' | 'neutral'
  suffix?: string
  className?: string
}

export function TrendPill({ value, trend, suffix = '%', className }: TrendPillProps) {
  const resolvedTrend =
    trend ?? (value > 0 ? 'up' : value < 0 ? 'down' : 'neutral')

  const isUp = resolvedTrend === 'up'
  const isDown = resolvedTrend === 'down'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold',
        isUp && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        isDown && 'bg-red-50 text-red-600 ring-1 ring-red-200',
        !isUp && !isDown && 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
        className,
      )}
    >
      {isUp && <ChevronUp className="h-3 w-3" strokeWidth={3} />}
      {isDown && <ChevronDown className="h-3 w-3" strokeWidth={3} />}
      {value > 0 && isUp ? '+' : ''}
      {value}
      {suffix}
    </span>
  )
}

export default TrendPill
