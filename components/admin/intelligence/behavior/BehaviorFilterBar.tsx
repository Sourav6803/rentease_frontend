'use client'

import { motion } from 'framer-motion'
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/admin/intelligence/DateRangePicker'
import type { DateRangeValue } from '@/components/admin/intelligence/DateRangePicker'
import { cn } from '@/lib/utils'
import type { BehaviorFilters } from '@/types/admin-intelligence.types'

interface BehaviorFilterBarProps {
  filters: BehaviorFilters
  onChange: (next: BehaviorFilters) => void
  onReset?: () => void
  loading?: boolean
  className?: string
}

const DEVICES = ['desktop', 'mobile', 'tablet']
const BROWSERS = ['chrome', 'safari', 'firefox', 'edge', 'opera', 'samsung']
const VISITOR_TYPES: Array<{ value: BehaviorFilters['visitorType']; label: string }> = [
  { value: 'all', label: 'All visitors' },
  { value: 'new', label: 'New visitors' },
  { value: 'returning', label: 'Returning visitors' },
]
const TRAFFIC_SOURCES = ['organic', 'paid', 'social', 'referral', 'email', 'direct']
const EVENT_TYPES = [
  'page_view',
  'product_view',
  'search',
  'add_to_cart',
  'wishlist_add',
  'checkout_start',
  'rental_start',
]

function toRange(filters: BehaviorFilters): DateRangeValue {
  return { startDate: filters.startDate ?? '', endDate: filters.endDate ?? '' }
}

function fromRange(range: DateRangeValue): Pick<BehaviorFilters, 'startDate' | 'endDate'> {
  return {
    startDate: range.startDate || undefined,
    endDate: range.endDate || undefined,
  }
}

export function BehaviorFilterBar({
  filters,
  onChange,
  onReset,
  loading = false,
  className,
}: BehaviorFilterBarProps) {
  const set = (patch: Partial<BehaviorFilters>) => onChange({ ...filters, ...patch })

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 pr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
      </div>

      <div className="relative w-full max-w-[220px]">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          value={filters.search ?? ''}
          onChange={(e) => set({ search: e.target.value || undefined })}
          placeholder="Search events, users…"
          className="h-9 pl-8 text-sm"
        />
      </div>

      <Select
        value={filters.visitorType ?? 'all'}
        onValueChange={(v) => set({ visitorType: v as BehaviorFilters['visitorType'] })}
      >
        <SelectTrigger className="h-9 w-[150px] text-xs">
          <SelectValue placeholder="Visitor type" />
        </SelectTrigger>
        <SelectContent>
          {VISITOR_TYPES.map((v) => (
            <SelectItem key={v.value} value={v.value ?? 'all'} className="text-xs">
              {v.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.device ?? 'all'}
        onValueChange={(v) => set({ device: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="h-9 w-[130px] text-xs">
          <SelectValue placeholder="Device" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All devices
          </SelectItem>
          {DEVICES.map((d) => (
            <SelectItem key={d} value={d} className="capitalize text-xs">
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.browser ?? 'all'}
        onValueChange={(v) => set({ browser: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="h-9 w-[130px] text-xs">
          <SelectValue placeholder="Browser" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All browsers
          </SelectItem>
          {BROWSERS.map((b) => (
            <SelectItem key={b} value={b} className="capitalize text-xs">
              {b}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.trafficSource ?? 'all'}
        onValueChange={(v) => set({ trafficSource: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="h-9 w-[150px] text-xs">
          <SelectValue placeholder="Traffic source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All sources
          </SelectItem>
          {TRAFFIC_SOURCES.map((s) => (
            <SelectItem key={s} value={s} className="capitalize text-xs">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.eventType ?? 'all'}
        onValueChange={(v) => set({ eventType: v === 'all' ? undefined : v })}
      >
        <SelectTrigger className="h-9 w-[170px] text-xs">
          <SelectValue placeholder="Event type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All events
          </SelectItem>
          {EVENT_TYPES.map((e) => (
            <SelectItem key={e} value={e} className="text-xs">
              {e.replace(/_/g, ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DateRangePicker
        value={toRange(filters)}
        onChange={(range) => onChange({ ...filters, ...fromRange(range) })}
      />

      <div className="ml-auto flex items-center gap-2">
        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs text-slate-500"
            onClick={onReset}
            disabled={loading}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>
    </motion.div>
  )
}

export default BehaviorFilterBar