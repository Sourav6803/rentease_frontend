'use client'

import {
  Eye,
  Send,
  Megaphone,
  Download,
  UserRound,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  SignalHigh,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '../EmptyState'
import { InterestScoreBar } from './InterestScoreBar'
import {
  clampScore,
  customerInitials,
  customerName,
  formatDuration,
  formatRelativeTime,
  getSignalMeta,
  isMarketingTriggered,
  productName,
  scoreTier,
} from './interests.utils'
import type { InterestItem } from './interests.types'
import { cn } from '@/lib/utils'

export type InterestRowAction = 'details' | 'offer' | 'campaign' | 'export' | 'customer'

interface InterestTableProps {
  items: InterestItem[]
  loading?: boolean
  page: number
  pages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onRowClick: (item: InterestItem) => void
  onAction: (action: InterestRowAction, item: InterestItem) => void
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

function SignalChips({ item }: { item: InterestItem }) {
  const signals = item.signals ?? []
  if (!signals.length) {
    return <span className="text-xs text-slate-400">No signals</span>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {signals.slice(0, 4).map((s, i) => {
        const meta = getSignalMeta(s.type)
        const Icon = meta.icon
        return (
          <Tooltip key={`${s.type}-${i}`}>
            <TooltipTrigger asChild>
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                style={{ borderColor: `${meta.color}40`, background: `${meta.color}12`, color: meta.color }}
              >
                <Icon className="h-3 w-3" />
                {meta.label}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">+{s.score} to Interest Score</TooltipContent>
          </Tooltip>
        )
      })}
      {signals.length > 4 && (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          +{signals.length - 4}
        </span>
      )}
    </div>
  )
}

function MarketingStatus({ item }: { item: InterestItem }) {
  const triggered = isMarketingTriggered(item)
  return triggered ? (
    <Badge
      variant="outline"
      className="gap-1 border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700"
    >
      <SignalHigh className="h-3 w-3" />
      Triggered
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="gap-1 border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500"
    >
      Pending
    </Badge>
  )
}

export function InterestTable({
  items,
  loading = false,
  page,
  pages,
  total,
  limit,
  onPageChange,
  onRowClick,
  onAction,
  emptyTitle = 'No customer interests detected yet',
  emptyDescription = 'Behavioral signals will appear here once customers interact with products.',
  className,
}: InterestTableProps) {
  if (!loading && !items.length) {
    return (
      <EmptyState
        icon={SignalHigh}
        title={emptyTitle}
        description={emptyDescription}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm"
      />
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>
      <div className="max-h-[640px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
            <TableRow className="hover:bg-transparent">
              {['Customer', 'Session', 'Product', 'Interest Score', 'Views', 'Time Spent', 'Interaction', 'Signals', 'Last Viewed', 'Marketing', 'Actions'].map(
                (h) => (
                  <TableHead
                    key={h}
                    className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-slate-400"
                  >
                    {h}
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: limit }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 11 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : items.map((item) => {
                  const tier = scoreTier(clampScore(item.interactionScore))
                  return (
                    <TableRow
                      key={item._id}
                      onClick={() => onRowClick(item)}
                      className="cursor-pointer transition-colors hover:bg-slate-50/70"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-xs font-bold text-white">
                            {customerInitials(item)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {customerName(item)}
                            </p>
                            <p className="truncate text-[11px] text-slate-400">
                              {item.user?.email ?? 'Guest session'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                          {(item.sessionId ?? item._id).slice(-6)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[160px] truncate text-sm font-medium text-slate-700">
                          {productName(item)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {item.product?.category?.name ?? 'Uncategorized'}
                        </p>
                      </TableCell>
                      <TableCell className="w-[160px]">
                        <InterestScoreBar score={item.interactionScore} size="sm" />
                      </TableCell>
                      <TableCell className="text-sm tabular-nums text-slate-600">
                        {item.viewCount ?? 0}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums text-slate-600">
                        {formatDuration(item.totalTimeSpentSeconds ?? 0)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
                            tier.bg,
                            tier.text,
                          )}
                        >
                          {clampScore(item.interactionScore)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        <SignalChips item={item} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-slate-500">
                        {formatRelativeTime(item.lastViewedAt)}
                      </TableCell>
                      <TableCell>
                        <MarketingStatus item={item} />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => onAction('details', item)}>
                              <Eye className="h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction('offer', item)}>
                              <Send className="h-4 w-4" /> Send Offer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction('campaign', item)}>
                              <Megaphone className="h-4 w-4" /> Trigger Campaign
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction('customer', item)}>
                              <UserRound className="h-4 w-4" /> View Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onAction('export', item)}>
                              <Download className="h-4 w-4" /> Export
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <p className="text-xs text-slate-500">
          {total > 0 ? (
            <>
              Showing <span className="font-semibold text-slate-700">{(page - 1) * limit + 1}</span>–
              <span className="font-semibold text-slate-700">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-semibold text-slate-700">{total}</span>
            </>
          ) : (
            'No records'
          )}
        </p>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="flex items-center px-2 text-xs font-medium text-slate-500">
            {page} / {Math.max(1, pages)}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= pages || loading}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InterestTable
