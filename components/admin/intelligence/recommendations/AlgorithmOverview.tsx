'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { RECOMMENDATION_ALGORITHMS } from './recommendations.utils'
import type { AlgorithmInfo } from './recommendations.types'

function ConfidenceBadge({ value, available }: { value: number; available: boolean }) {
  const color = available ? '#10b981' : '#94a3b8'
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ background: `${color}18`, color }}
    >
      {value}% conf.
    </span>
  )
}

export function AlgorithmOverview({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-900">Algorithm Overview</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {RECOMMENDATION_ALGORITHMS.map((algo: AlgorithmInfo, i) => {
          const Icon = algo.icon
          return (
            <motion.div
              key={algo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-white p-4 shadow-sm',
                algo.available ? 'border-slate-200' : 'border-dashed border-slate-300 bg-slate-50/50',
              )}
            >
              {algo.comingSoon && (
                <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  Future Enhancement
                </span>
              )}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${algo.available ? '#6366f1' : '#94a3b8'}18` }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: algo.available ? '#6366f1' : '#94a3b8' }}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{algo.name}</h4>
                  <ConfidenceBadge value={algo.confidence} available={algo.available} />
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-500">{algo.description}</p>

              <div className="mt-3 space-y-1.5 text-[11px]">
                <p className="text-slate-500">
                  <span className="font-semibold text-slate-600">Business value: </span>
                  {algo.businessValue}
                </p>
                <p className="text-slate-500">
                  <span className="font-semibold text-slate-600">Data source: </span>
                  <code className="rounded bg-slate-100 px-1 text-[10px] text-slate-500">
                    {algo.dataSource}
                  </code>
                </p>
              </div>

              {!algo.available && (
                <Badge
                  variant="outline"
                  className="mt-3 w-fit border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700"
                >
                  Coming Soon
                </Badge>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default AlgorithmOverview
