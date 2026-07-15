
'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  ReplyFilter,
  ReviewFiltersState,
  SortOption,
  StarFilter,
  StatusFilter,
} from '@/types/reviews.types'
import { DEFAULT_FILTERS } from '@/types/reviews.types'

interface ReviewFiltersProps {
  filters: ReviewFiltersState
  onChange: (next: ReviewFiltersState) => void
  resultCount: number
}

const STATUS_LABEL: Record<StatusFilter, string> = {
  all: 'All statuses',
  approved: 'Approved',
  pending: 'Pending',
  flagged: 'Flagged',
  rejected: 'Rejected',
}

const REPLY_LABEL: Record<ReplyFilter, string> = {
  all: 'All',
  'needs-reply': 'Needs reply',
  replied: 'Replied',
}

const SORT_LABEL: Record<SortOption, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  highest: 'Highest rated',
  lowest: 'Lowest rated',
  'most-helpful': 'Most helpful',
}

export function ReviewFilters({ filters, onChange, resultCount }: ReviewFiltersProps) {
  const update = <K extends keyof ReviewFiltersState>(key: K, value: ReviewFiltersState[K]) => {
    onChange({ ...filters, [key]: value })
  }

  const chips: { key: keyof ReviewFiltersState; label: string }[] = []
  if (filters.search) chips.push({ key: 'search', label: `“${filters.search}”` })
  if (filters.star !== 'all') chips.push({ key: 'star', label: `${filters.star} star` })
  if (filters.status !== 'all') chips.push({ key: 'status', label: STATUS_LABEL[filters.status] })
  if (filters.reply !== 'all') chips.push({ key: 'reply', label: REPLY_LABEL[filters.reply] })
  if (filters.sort !== 'newest') chips.push({ key: 'sort', label: SORT_LABEL[filters.sort] })

  const clearOne = (key: keyof ReviewFiltersState) => {
    onChange({ ...filters, [key]: DEFAULT_FILTERS[key] })
  }

  return (
    <div className="sticky top-0 z-10 space-y-3 rounded-2xl border bg-card/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:top-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Search title, review, reviewer, product, or review number…"
            className="pl-8"
            aria-label="Search reviews"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 lg:flex lg:shrink-0 lg:gap-2">
          <Select value={filters.star} onValueChange={(v) => update('star', v as StarFilter)}>
            <SelectTrigger className="w-full lg:w-[110px]" aria-label="Filter by star rating">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              {(['5', '4', '3', '2', '1'] as StarFilter[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {s} star
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(v) => update('status', v as StatusFilter)}>
            <SelectTrigger className="w-full lg:w-[140px]" aria-label="Filter by moderation status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABEL) as StatusFilter[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.reply} onValueChange={(v) => update('reply', v as ReplyFilter)}>
            <SelectTrigger className="w-full lg:w-[130px]" aria-label="Filter by reply state">
              <SelectValue placeholder="Replies" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(REPLY_LABEL) as ReplyFilter[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {REPLY_LABEL[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.sort} onValueChange={(v) => update('sort', v as SortOption)}>
            <SelectTrigger className="w-full lg:w-[150px]" aria-label="Sort reviews">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABEL) as SortOption[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {SORT_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">{resultCount} on this page</span>
        {chips.map((chip) => (
          <Badge
            key={chip.key}
            variant="secondary"
            className="gap-1 rounded-full pl-2.5 pr-1 font-normal"
          >
            {chip.label}
            <button
              type="button"
              onClick={() => clearOne(chip.key)}
              aria-label={`Clear ${chip.label} filter`}
              className="rounded-full p-0.5 hover:bg-muted-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {chips.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => onChange(DEFAULT_FILTERS)}
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  )
}

export default ReviewFilters
