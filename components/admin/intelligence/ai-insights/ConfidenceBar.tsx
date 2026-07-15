import { cn } from '@/lib/utils'
import { confidenceMeta } from './ai-insights.utils'

interface ConfidenceBarProps {
  /** 0..1 */
  value: number
  label?: string
  className?: string
  light?: boolean
}

export function ConfidenceBar({ value, label, className, light = false }: ConfidenceBarProps) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  const meta = confidenceMeta(value)
  return (
    <div className={cn('w-full', className)}>
      <div className="mb-1 flex items-center justify-between">
        <span className={cn('text-[11px] font-medium', light ? 'text-white/70' : 'text-slate-500')}>
          {label ?? 'Confidence'}
        </span>
        <span className="text-[11px] font-bold" style={{ color: meta.color }}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: meta.color }}
        />
      </div>
    </div>
  )
}

export default ConfidenceBar
