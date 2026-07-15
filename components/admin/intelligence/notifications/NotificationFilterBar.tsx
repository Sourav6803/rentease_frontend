'use client'

import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, CalendarDays } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DateRangePicker,
  type DateRangeValue,
} from '@/components/admin/intelligence'
import { cn } from '@/lib/utils'
import type { NotificationFilter } from '@/types/admin-intelligence.types'

export const NOTIFICATION_CHANNELS = ['email', 'sms', 'push', 'in_app', 'whatsapp'] as const
export const NOTIFICATION_STATUSES = [
  'sent',
  'delivered',
  'failed',
  'queued',
  'read',
  'clicked',
  'bounced',
] as const
export const NOTIFICATION_AUDIENCES = ['all', 'users', 'vendors', 'partners', 'specific'] as const
export const NOTIFICATION_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const

export interface NotificationFilterBarProps {
  value: NotificationFilter
  dateRange: DateRangeValue
  onChange: (next: NotificationFilter) => void
  onDateRangeChange: (range: DateRangeValue) => void
  onReset?: () => void
  onApply?: (value: NotificationFilter) => void
  className?: string
}

function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function NotificationFilterBar({
  value,
  dateRange,
  onChange,
  onDateRangeChange,
  onReset,
  onApply,
  className,
}: NotificationFilterBarProps) {
  const set = (patch: Partial<NotificationFilter>) => onChange({ ...value, ...patch })

  const activeCount =
    (value.search ? 1 : 0) +
    (value.status ? 1 : 0) +
    (value.channel ? 1 : 0) +
    (value.audience ? 1 : 0) +
    (value.priority ? 1 : 0) +
    (dateRange.startDate ? 1 : 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={value.search ?? ''}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Search title, recipient or subject…"
            className="h-9 pl-8 text-sm"
          />
        </div>

        <Select value={value.channel ?? 'all'} onValueChange={(v) => set({ channel: v === 'all' ? undefined : v })}>
          <SelectTrigger size="sm" className="h-9 w-[140px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            {NOTIFICATION_CHANNELS.map((c) => (
              <SelectItem key={c} value={c}>
                {titleCase(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={value.status ?? 'all'} onValueChange={(v) => set({ status: v === 'all' ? undefined : v })}>
          <SelectTrigger size="sm" className="h-9 w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {NOTIFICATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {titleCase(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={value.audience ?? 'all'} onValueChange={(v) => set({ audience: v === 'all' ? undefined : v })}>
          <SelectTrigger size="sm" className="h-9 w-[140px]">
            <SelectValue placeholder="Audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All audiences</SelectItem>
            {NOTIFICATION_AUDIENCES.map((a) => (
              <SelectItem key={a} value={a}>
                {titleCase(a)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={value.priority ?? 'all'} onValueChange={(v) => set({ priority: v === 'all' ? undefined : v })}>
          <SelectTrigger size="sm" className="h-9 w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priority</SelectItem>
            {NOTIFICATION_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {titleCase(p)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={onDateRangeChange} className="h-9" />
          {activeCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-slate-500"
              onClick={() => {
                onReset?.()
              }}
            >
              <X className="h-3.5 w-3.5" />
              Clear
              <span className="ml-0.5 rounded-full bg-indigo-100 px-1.5 text-[10px] font-bold text-indigo-700">
                {activeCount}
              </span>
            </Button>
          ) : (
            <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </span>
          )}
          {onApply && (
            <Button size="sm" className="h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={() => onApply(value)}>
              <CalendarDays className="h-3.5 w-3.5" />
              Apply
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default NotificationFilterBar
