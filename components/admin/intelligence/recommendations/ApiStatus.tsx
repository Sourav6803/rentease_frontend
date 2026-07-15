'use client'

import { CheckCircle2, Loader2, XCircle, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ApiEndpointHealth, ApiHealthStatus } from './recommendations.types'

const STATUS_META: Record<
  ApiHealthStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  connected: { label: 'Connected', className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  loading: { label: 'Loading', className: 'bg-amber-50 text-amber-700', icon: Loader2 },
  unavailable: { label: 'Unavailable', className: 'bg-red-50 text-red-700', icon: XCircle },
}

export function ApiStatus({
  endpoints,
  className,
}: {
  endpoints: ApiEndpointHealth[]
  className?: string
}) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      <div className="mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-900">API Status</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {endpoints.map((e) => {
          const meta = STATUS_META[e.status]
          const Icon = meta.icon
          return (
            <div
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{e.label}</p>
                <code className="text-[10px] text-slate-400">{e.path}</code>
              </div>
              <div className="flex items-center gap-2">
                {e.latencyMs != null && e.status === 'connected' && (
                  <span className="text-[10px] font-medium text-slate-400">{e.latencyMs}ms</span>
                )}
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
                    meta.className,
                  )}
                >
                  <Icon className={cn('h-3 w-3', e.status === 'loading' && 'animate-spin')} />
                  {meta.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ApiStatus
