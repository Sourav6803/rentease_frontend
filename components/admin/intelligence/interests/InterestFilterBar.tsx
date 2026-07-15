'use client'

import { motion } from 'framer-motion'
import { Search, RotateCcw, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { DateRangePicker } from '../DateRangePicker'
import type { DateRangeValue } from '../DateRangePicker'
import { INTEREST_SIGNAL_DEFINITIONS } from './interests.utils'
import type { InterestFilters, InterestSortKey } from './interests.types'
import { cn } from '@/lib/utils'

interface InterestFilterBarProps {
  filters: InterestFilters
  onChange: (next: InterestFilters) => void
  onReset?: () => void
  minScore: number
  onMinScoreChange: (value: number) => void
  categories: string[]
  loading?: boolean
  className?: string
}

const SORT_OPTIONS: { value: InterestSortKey; label: string }[] = [
  { value: 'score_desc', label: 'Score (High → Low)' },
  { value: 'score_asc', label: 'Score (Low → High)' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'views', label: 'Most Views' },
  { value: 'time', label: 'Most Time Spent' },
]

export function InterestFilterBar({
  filters,
  onChange,
  onReset,
  minScore,
  onMinScoreChange,
  categories,
  loading = false,
  className,
}: InterestFilterBarProps) {
  const set = (patch: Partial<InterestFilters>) => onChange({ ...filters, ...patch })

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'sticky top-[57px] z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm backdrop-blur',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 pr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
      </div>

      {/* Interest Score Slider */}
      <div className="flex min-w-[200px] items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5">
        <span className="whitespace-nowrap text-xs font-medium text-slate-500">Score ≥</span>
        <Slider
          value={[minScore]}
          min={0}
          max={100}
          step={5}
          onValueChange={(v) => onMinScoreChange(v[0] ?? 0)}
          className="w-28"
        />
        <span className="w-7 text-right text-xs font-bold tabular-nums text-slate-700">{minScore}</span>
      </div>

      <div className="relative w-full max-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search product / user…"
          className="h-9 pl-8 text-sm"
        />
      </div>

      <Select value={filters.category} onValueChange={(v) => set({ category: v })}>
        <SelectTrigger className="h-9 w-[150px] text-xs">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All Categories
          </SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c} className="text-xs">
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.user} onValueChange={(v) => set({ user: v })}>
        <SelectTrigger className="h-9 w-[140px] text-xs">
          <SelectValue placeholder="User" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All Users
          </SelectItem>
          <SelectItem value="returning" className="text-xs">
            Returning
          </SelectItem>
          <SelectItem value="new" className="text-xs">
            New
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.signalType} onValueChange={(v) => set({ signalType: v })}>
        <SelectTrigger className="h-9 w-[150px] text-xs">
          <SelectValue placeholder="Signal Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All Signals
          </SelectItem>
          {INTEREST_SIGNAL_DEFINITIONS.map((s) => (
            <SelectItem key={s.type} value={s.type} className="text-xs">
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.marketingTriggered} onValueChange={(v) => set({ marketingTriggered: v })}>
        <SelectTrigger className="h-9 w-[150px] text-xs">
          <SelectValue placeholder="Marketing" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All Marketing
          </SelectItem>
          <SelectItem value="triggered" className="text-xs">
            Triggered
          </SelectItem>
          <SelectItem value="none" className="text-xs">
            Not Triggered
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.sortBy} onValueChange={(v) => set({ sortBy: v as InterestSortKey })}>
        <SelectTrigger className="h-9 w-[170px] text-xs">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DateRangePicker
        value={{ startDate: filters.startDate, endDate: filters.endDate }}
        onChange={(range: DateRangeValue) =>
          onChange({ ...filters, startDate: range.startDate, endDate: range.endDate })
        }
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

export default InterestFilterBar
