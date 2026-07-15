'use client'

import { motion } from 'framer-motion'
import { formatRelativeTime } from './interests.utils'
import type { SignalTimelineEntry } from './interests.types'
import { cn } from '@/lib/utils'

interface SignalTimelineProps {
  entries: SignalTimelineEntry[]
  className?: string
}

export function SignalTimeline({ entries, className }: SignalTimelineProps) {
  if (!entries.length) {
    return (
      <p className="text-sm text-slate-400">No behavioral signals captured for this customer yet.</p>
    )
  }

  return (
    <ol className={cn('relative space-y-0', className)}>
      {entries.map((entry, i) => {
        const Icon = entry.icon
        const isLast = i === entries.length - 1
        return (
          <motion.li
            key={entry.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative flex gap-3 pb-4 last:pb-0"
          >
            {!isLast && (
              <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-slate-200" />
            )}
            <span
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white',
                entry.isScoreUpdate ? 'bg-indigo-100' : 'bg-slate-100',
              )}
              style={entry.isScoreUpdate ? undefined : { background: `${entry.color}1a` }}
            >
              <Icon
                className="h-4 w-4"
                style={{ color: entry.isScoreUpdate ? '#6366f1' : entry.color }}
              />
            </span>
            <div className="flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{entry.label}</p>
                {entry.scoreDelta > 0 && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                    +{entry.scoreDelta}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{entry.description}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                {formatRelativeTime(entry.time)}
              </p>
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}

export default SignalTimeline
