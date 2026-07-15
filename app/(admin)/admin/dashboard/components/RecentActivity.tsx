'use client'

import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'

export interface ActivityItem {
  text: string
  time: string
  color: string
  icon: string
}

export function RecentActivity({ items = [] }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
          <Bell className="h-4 w-4 text-blue-600" />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Live Activity Feed</h3>
          <p className="text-xs text-slate-500">Real-time platform events</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {items.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
              style={{ background: `${a.color}15` }}
            >
              {a.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700">{a.text}</p>
              <p className="text-xs text-slate-400">{a.time}</p>
            </div>
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: a.color }} />
          </motion.div>
        ))}
        {items.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">No recent activity.</p>
        )}
      </div>
    </div>
  )
}

export default RecentActivity
