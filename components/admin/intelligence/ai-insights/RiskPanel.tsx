import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deriveRisks, RISK_META, type RiskItem, type DerivedInsight } from './ai-insights.utils'

interface RiskPanelProps {
  insights: DerivedInsight[]
}

export function RiskPanel({ insights }: RiskPanelProps) {
  const risks: RiskItem[] = deriveRisks(insights)
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-rose-500" />
        <h3 className="text-sm font-semibold text-slate-900">Risk Panel</h3>
      </div>
      <div className="space-y-2">
        {risks.map((r) => {
          const m = RISK_META[r.level]
          const Icon = m.icon
          return (
            <div key={r.id} className={cn('flex items-start gap-3 rounded-xl border p-3', m.bg, m.border)}>
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', m.color)} />
              <div className="min-w-0">
                <p className={cn('text-sm font-semibold', m.color)}>{r.title}</p>
                <p className="mt-0.5 text-xs text-slate-600">{r.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RiskPanel
