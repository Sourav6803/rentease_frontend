import { CheckCircle2, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DerivedInsight } from './ai-insights.utils'

interface RecommendationPanelProps {
  insights: DerivedInsight[]
  onAccept?: (id: string) => void
  onDismiss?: (id: string) => void
}

export function RecommendationPanel({ insights, onAccept, onDismiss }: RecommendationPanelProps) {
  const recs = insights.filter((i) => i.recommendation)
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-900">Recommendations</h3>
        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
          {recs.length}
        </span>
      </div>

      {recs.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No recommendations for this window.</p>
      ) : (
        <div className="space-y-2">
          {recs.map((r) => (
            <div key={r.id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">{r.recommendation}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{r.title}</p>
              </div>
              {onAccept && (
                <Button size="sm" variant="ghost" className="shrink-0 text-emerald-600 hover:bg-emerald-50" onClick={() => onAccept(r.id)}>
                  Accept
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" className="shrink-0 text-slate-400 hover:bg-slate-50" onClick={() => onDismiss(r.id)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecommendationPanel
