'use client'

import { motion } from 'framer-motion'
import { MoreHorizontal, Eye, Send, Copy } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable, type DataTableColumn } from '@/components/admin/intelligence'
import { StatusBadge } from '@/components/admin/intelligence/StatusBadge'
import { cn } from '@/lib/utils'
import type { NotificationRecordExtended } from '@/types/admin-intelligence.types'
import { CHANNEL_META } from './ChannelStatusPanel'

export interface NotificationTableProps {
  records: NotificationRecordExtended[]
  loading?: boolean
  onRowClick?: (record: NotificationRecordExtended) => void
  onResend?: (record: NotificationRecordExtended) => void
  onCopyId?: (record: NotificationRecordExtended) => void
  className?: string
}

const PRIORITY_TONE: Record<string, string> = {
  low: 'bg-slate-100 text-slate-500 border-slate-200',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-amber-50 text-amber-700 border-amber-200',
  urgent: 'bg-red-50 text-red-700 border-red-200',
}

type Row = NotificationRecordExtended & Record<string, unknown>

function asRec(row: Row): NotificationRecordExtended {
  return row as unknown as NotificationRecordExtended
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NotificationTable({
  records,
  loading = false,
  onRowClick,
  onResend,
  onCopyId,
  className,
}: NotificationTableProps) {
  const columns: DataTableColumn<Row>[] = [
    {
      key: 'title',
      header: 'Notification',
      sortable: true,
      accessor: (r) => asRec(r).title,
      render: (r) => {
        const rec = asRec(r)
        return (
          <button
            onClick={() => onRowClick?.(rec)}
            className="block max-w-[280px] text-left"
          >
            <p className="truncate text-sm font-medium text-slate-800 hover:text-indigo-600">
              {rec.title}
            </p>
            <p className="truncate text-xs text-slate-400">{rec.message}</p>
          </button>
        )
      },
    },
    {
      key: 'recipient',
      header: 'Recipient',
      sortable: true,
      accessor: (r) => asRec(r).recipient ?? asRec(r).user ?? '—',
      render: (r) => <span className="text-sm text-slate-600">{asRec(r).recipient ?? asRec(r).user ?? '—'}</span>,
    },
    {
      key: 'channel',
      header: 'Channel',
      sortable: true,
      accessor: (r) => asRec(r).channel,
      render: (r) => {
        const rec = asRec(r)
        const meta = CHANNEL_META[rec.channel] ?? CHANNEL_META.email
        const Icon = meta.icon
        return (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: `${meta.color}14`, color: meta.color }}
          >
            <Icon className="h-3 w-3" />
            {meta.label}
          </span>
        )
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      accessor: (r) => asRec(r).priority ?? 'medium',
      render: (r) => {
        const p = asRec(r).priority ?? 'medium'
        return (
          <Badge
            variant="outline"
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
              PRIORITY_TONE[p] ?? PRIORITY_TONE.medium,
            )}
          >
            {p}
          </Badge>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (r) => asRec(r).status ?? 'sent',
      render: (r) => <StatusBadge status={asRec(r).status ?? 'sent'} />,
    },
    {
      key: 'read',
      header: 'Read',
      render: (r) => {
        const rec = asRec(r)
        return rec.isRead ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            Read
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
            Unread
          </span>
        )
      },
    },
    {
      key: 'sentAt',
      header: 'Sent',
      sortable: true,
      accessor: (r) => asRec(r).sentAt ?? asRec(r).createdAt,
      render: (r) => <span className="text-xs text-slate-500">{formatDate(asRec(r).sentAt ?? asRec(r).createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => {
        const rec = asRec(r)
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRowClick?.(rec)}>
                <Eye className="h-4 w-4" /> View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResend?.(rec)}>
                <Send className="h-4 w-4" /> Resend
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopyId?.(rec)}>
                <Copy className="h-4 w-4" /> Copy ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const rows = records as unknown as Row[]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className={className}>
      <DataTable<Row>
        columns={columns}
        data={rows}
        loading={loading}
        searchable={false}
        pageSize={10}
        emptyTitle="No notifications"
        emptyDescription="No notifications match the current filters."
        getRowKey={(row) => asRec(row as unknown as Row)._id}
        className="overflow-hidden"
      />
    </motion.div>
  )
}

export default NotificationTable
