import { Clock, Bot } from 'lucide-react'
import type { DerivedInsight } from './ai-insights.utils'

interface InsightTimelineProps {
  insights: DerivedInsight[]
  generatedAt?: string
}

export function InsightTimeline({ insights, generatedAt }: InsightTimelineProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-900">Insight Timeline</h3>
      </div>

      <ol className="relative space-y-4 border-l-2 border-slate-100 pl-5">
        <li className="relative">
          <span className="absolute -left-[26px] flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <Bot className="h-3 w-3" />
          </span>
          <p className="text-xs font-semibold text-slate-900">Report generated</p>
          <p className="text-[11px] text-slate-400">{generatedAt ?? 'Just now'}</p>
        </li>

        {insights.length === 0 ? (
          <li className="text-xs text-slate-400">No insights recorded in this window.</li>
        ) : (
          insights.map((it) => {
            const Icon = it.icon
            return (
              <li key={it.id} className="relative">
                <span className="absolute -left-[26px] flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <Icon className="h-3 w-3" />
                </span>
                <p className="text-xs font-semibold text-slate-800">{it.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{it.description}</p>
              </li>
            )
          })
        )}
      </ol>
    </div>
  )
}

export default InsightTimeline
