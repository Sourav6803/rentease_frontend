'use client'

import { motion } from 'framer-motion'
import {
  Users,
  Layers,
  Clock,
  Copy,
  Trash2,
  Target,
  CircleDot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { CustomerSegmentExtended } from '@/types/admin-intelligence.types'
import { MarketingEmptyState } from './MarketingEmptyState'

interface SegmentGridProps {
  segments: CustomerSegmentExtended[]
  loading?: boolean
  totalCustomers?: number
  onEdit?: (segment: CustomerSegmentExtended) => void
  onDuplicate?: (segment: CustomerSegmentExtended) => void
  onDelete?: (segment: CustomerSegmentExtended) => void
  onCreate?: () => void
  className?: string
}

function timeAgo(date?: string): string {
  if (!date) return 'never'
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function SegmentGrid({
  segments,
  loading = false,
  totalCustomers = 0,
  onEdit,
  onDuplicate,
  onDelete,
  onCreate,
  className,
}: SegmentGridProps) {
  if (!loading && segments.length === 0) {
    return (
      <MarketingEmptyState
        variant="segments"
        actionLabel="Build segment"
        onAction={onCreate}
        className={className}
      />
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))
        : segments.map((segment, i) => {
            const users = segment.estimatedUsers ?? segment.userIds.length
            const share =
              totalCustomers > 0
                ? Math.min(100, Math.round((users / totalCustomers) * 100))
                : 0
            return (
              <motion.div
                key={segment._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                whileHover={{ y: -3 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-300/30 to-blue-300/0 blur-2xl" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-blue-500/10 text-emerald-600">
                    <Target className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700"
                  >
                    {segment.rules?.length ?? 0} rules
                  </Badge>
                </div>

                <div className="relative mt-3">
                  <h3 className="truncate text-sm font-semibold text-slate-900">
                    {segment.name}
                  </h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                    {segment.description ?? 'No description provided.'}
                  </p>
                </div>

                <div className="relative mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                      <Users className="h-3.5 w-3.5 text-emerald-500" />
                      {users.toLocaleString()} users
                    </span>
                    <span className="text-slate-400">{share}% of base</span>
                  </div>
                  <Progress value={share} className="h-1.5" />
                </div>

                <div className="relative mt-3 flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {segment.userIds.length} mapped
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeAgo(segment.lastUsed)}
                  </span>
                </div>

                <div className="relative mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3">
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => onEdit?.(segment)}
                  >
                    <CircleDot className="h-3.5 w-3.5" />
                    Open
                  </Button>
                  <Button variant="outline" size="icon-sm" onClick={() => onDuplicate?.(segment)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onDelete?.(segment)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )
          })}
    </div>
  )
}

export default SegmentGrid
