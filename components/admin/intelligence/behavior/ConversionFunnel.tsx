'use client'

import { motion } from 'framer-motion'
import { ArrowDown, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConversionFunnelStage } from '@/types/admin-intelligence.types'

interface ConversionFunnelProps {
  stages: ConversionFunnelStage[]
  loading?: boolean
  className?: string
}

const ACCENT = {
  indigo: '#6366f1',
  violet: '#7c3aed',
  blue: '#0ea5e9',
  emerald: '#059669',
  amber: '#f59e0b',
}

function stageColor(index: number): string {
  const keys = [ACCENT.indigo, ACCENT.blue, ACCENT.violet, ACCENT.emerald, ACCENT.amber]
  return keys[index % keys.length]
}

function fmtPct(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function ConversionFunnel({ stages, loading = false, className }: ConversionFunnelProps) {
  if (loading) {
    return (
      <div className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-slate-100" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  if (!stages.length) {
    return (
      <div className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Filter className="h-4 w-4 text-emerald-500" />
          Conversion funnel
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">No funnel data available.</p>
      </div>
    )
  }

  const top = stages[0]?.count || 1

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
            <Filter className="h-4 w-4 text-emerald-500" />
            Conversion funnel
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">Stage volume and drop-off</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
          {fmtPct(stages[stages.length - 1]?.conversionRate ?? 0)} overall
        </span>
      </div>

      <div className="space-y-1">
        {stages.map((stage, i) => {
          const width = Math.max(8, (stage.count / top) * 100)
          const color = stageColor(i)
          const isLast = i === stages.length - 1
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, scaleX: 0.96 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <div className="relative mb-1 flex items-center justify-between rounded-xl px-3 py-2.5 text-white" style={{ background: color, width: `${width}%`, minWidth: '160px' }}>
                <span className="truncate text-xs font-semibold">{stage.label}</span>
                <span className="ml-2 shrink-0 text-xs font-bold">{stage.count.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between px-1 pb-1 text-[11px]">
                <span className="text-slate-400">
                  {fmtPct(stage.conversionRate)} of top stage
                </span>
                {!isLast && stage.dropOffRate > 0 && (
                  <span className="flex items-center gap-0.5 font-medium text-red-500">
                    <ArrowDown className="h-3 w-3" />
                    {fmtPct(stage.dropOffRate)} drop-off
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default ConversionFunnel
