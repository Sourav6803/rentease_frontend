import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfidenceBar } from './ConfidenceBar'
import { priorityMeta, type DerivedInsight } from './ai-insights.utils'

interface InsightCardProps {
  insight: DerivedInsight
  onAction?: (id: string) => void
  index?: number
}

export function InsightCard({ insight, onAction, index = 0 }: InsightCardProps) {
  const pm = priorityMeta(insight.priority)
  const Icon = insight.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md',
        insight.priority === 'High' ? 'border-rose-100' : 'border-slate-200',
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', pm.bg, pm.color)}>
          {insight.priority} priority
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          {insight.source}
        </span>
      </div>

      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
          <p className="mt-0.5 text-xs leading-snug text-slate-500">{insight.description}</p>
        </div>
      </div>

      <div className="mt-3">
        <ConfidenceBar value={insight.confidence} />
      </div>

      {insight.recommendation && (
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Recommended action</p>
          <p className="mt-0.5 text-xs text-slate-700">{insight.recommendation}</p>
        </div>
      )}

      {onAction && insight.recommendation && (
        <button
          type="button"
          onClick={() => onAction(insight.id)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-105"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Apply
          <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  )
}

export default InsightCard
