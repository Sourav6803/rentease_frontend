'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable, type DataTableColumn } from '@/components/admin/intelligence/DataTable'
import { cn } from '@/lib/utils'
import type { BehaviorEventLog, Pagination } from '@/types/admin-intelligence.types'

interface BehaviorEventTableProps {
  events: BehaviorEventLog[]
  loading?: boolean
  onRowClick?: (event: BehaviorEventLog) => void
  pagination?: Pagination
  className?: string
}

const EVENT_TONES: Record<string, string> = {
  page_view: 'border-blue-200 bg-blue-50 text-blue-700',
  product_view: 'border-violet-200 bg-violet-50 text-violet-700',
  search: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  add_to_cart: 'border-amber-200 bg-amber-50 text-amber-700',
  wishlist_add: 'border-pink-200 bg-pink-50 text-pink-700',
  checkout_start: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  rental_start: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

function eventTone(type: string): string {
  return EVENT_TONES[type] ?? 'border-slate-200 bg-slate-50 text-slate-600'
}

function formatTs(ts?: string): string {
  if (!ts) return '—'
  try {
    return format(new Date(ts), 'dd MMM HH:mm')
  } catch {
    return ts
  }
}

export function BehaviorEventTable({
  events,
  loading = false,
  onRowClick,
  pagination,
  className,
}: BehaviorEventTableProps) {
  const columns: DataTableColumn<BehaviorEventLog>[] = [
    {
      key: 'eventType',
      header: 'Event',
      sortable: true,
      accessor: (r) => r.eventType,
      render: (r) => (
        <Badge
          variant="outline"
          className={cn('rounded-full text-[10px] font-bold uppercase', eventTone(r.eventType))}
        >
          {r.eventType.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'userId',
      header: 'User',
      sortable: true,
      accessor: (r) => r.userId,
      render: (r) => (
        <span className="font-mono text-xs text-slate-600">
          {r.userId ? r.userId.slice(-8) : 'guest'}
        </span>
      ),
    },
    {
      key: 'sessionId',
      header: 'Session',
      accessor: (r) => r.sessionId,
      render: (r) => (
        <span className="font-mono text-xs text-slate-400">{r.sessionId.slice(-8)}</span>
      ),
    },
    {
      key: 'device',
      header: 'Device',
      sortable: true,
      accessor: (r) => r.device,
      render: (r) => <span className="capitalize text-slate-600">{r.device ?? '—'}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      accessor: (r) => r.location,
      render: (r) => <span className="text-slate-600">{r.location ?? '—'}</span>,
    },
    {
      key: 'timestamp',
      header: 'Time',
      sortable: true,
      accessor: (r) => r.timestamp,
      render: (r) => (
        <span className="whitespace-nowrap text-xs text-slate-500">{formatTs(r.timestamp)}</span>
      ),
    },
    ...(onRowClick
      ? [
          {
            key: 'actions',
            header: '',
            className: 'w-10 text-right',
            render: (r: BehaviorEventLog) => (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-indigo-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onRowClick(r)
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            ),
          } as DataTableColumn<BehaviorEventLog>,
        ]
      : []),
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', className)}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Event stream</h3>
          <p className="text-xs text-slate-500">
            {pagination
              ? `${pagination.total.toLocaleString()} events · page ${pagination.page} of ${pagination.pages}`
              : `${events.length} events`}
          </p>
        </div>
        {onRowClick && (
          <span className="hidden text-xs text-slate-400 sm:block">Click a row for details</span>
        )}
      </div>
      <DataTable
        columns={columns}
        data={events}
        loading={loading}
        searchable
        searchPlaceholder="Search events, users, sessions…"
        pageSize={10}
        emptyTitle="No events in this view"
        emptyDescription="Adjust the filters or date range to surface more activity."
        getRowKey={(r) => r._id}
        className="border-0 shadow-none"
      />
    </motion.div>
  )
}

export default BehaviorEventTable
