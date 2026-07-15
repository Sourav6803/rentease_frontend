'use client'

import { Check, X, Send, MousePointerClick, Clock3 } from 'lucide-react'
import { triggerChannelMeta } from './interests.utils'
import type { TriggerEvent, TriggerStatus } from './interests.types'
import { formatRelativeTime } from './interests.utils'
import { cn } from '@/lib/utils'

const STATUS_META: Record<
  TriggerStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  delivered: { label: 'Delivered', className: 'bg-slate-100 text-slate-600', icon: Check },
  sent: { label: 'Sent', className: 'bg-blue-50 text-blue-700', icon: Send },
  opened: { label: 'Opened', className: 'bg-indigo-50 text-indigo-700', icon: MousePointerClick },
  clicked: { label: 'Clicked', className: 'bg-emerald-50 text-emerald-700', icon: MousePointerClick },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-600', icon: X },
}

interface TriggerHistoryProps {
  events: TriggerEvent[]
  className?: string
}

export function TriggerHistory({ events, className }: TriggerHistoryProps) {
  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center">
        <Clock3 className="mb-2 h-7 w-7 text-slate-300" />
        <p className="text-sm text-slate-400">No marketing triggers fired for this customer yet.</p>
      </div>
    )
  }

  return (
    <ol className={cn('space-y-2.5', className)}>
      {events.map((event) => {
        const channel = triggerChannelMeta(event.channel)
        const status = STATUS_META[event.status]
        const Icon = channel.icon
        const StatusIcon = status.icon
        return (
          <li
            key={event.id}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${channel.color}18` }}
            >
              <Icon className="h-4 w-4" style={{ color: channel.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-slate-800">{event.title}</p>
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
                    status.className,
                  )}
                >
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </span>
              </div>
              {event.detail && <p className="mt-0.5 truncate text-xs text-slate-500">{event.detail}</p>}
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                {channel.label} · {formatRelativeTime(event.at)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default TriggerHistory
