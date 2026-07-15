'use client'

import { motion } from 'framer-motion'
import {
  Send,
  CheckCircle2,
  Eye,
  XCircle,
  RefreshCw,
  Clock,
  Tag,
  User,
  Radio,
  Mail,
  MessageSquare,
  Smartphone,
  AppWindow,
  MessageCircle,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/admin/intelligence/StatusBadge'
import { cn } from '@/lib/utils'
import type { NotificationRecordExtended } from '@/types/admin-intelligence.types'

export interface NotificationDrawerProps {
  record: NotificationRecordExtended | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onResend?: (record: NotificationRecordExtended) => void
  onViewRecipient?: (record: NotificationRecordExtended) => void
  className?: string
}

const CHANNEL_ICON: Record<string, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  push: Smartphone,
  in_app: AppWindow,
  whatsapp: MessageCircle,
}

function fmt(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NotificationDrawer({
  record,
  open,
  onOpenChange,
  onResend,
  onViewRecipient,
  className,
}: NotificationDrawerProps) {
  if (!record) return null

  const ChannelIcon = CHANNEL_ICON[record.channel] ?? Mail
  const tracking = record.tracking?.events ?? []
  const timelineSteps = [
    { label: 'Sent', value: record.sentAt ?? record.tracking?.sentAt, icon: Send, ok: Boolean(record.sentAt ?? record.tracking?.sentAt) },
    { label: 'Delivered', value: record.deliveredAt ?? record.tracking?.deliveredAt, icon: CheckCircle2, ok: Boolean(record.deliveredAt ?? record.tracking?.deliveredAt) },
    { label: 'Opened', value: record.tracking?.openedAt ?? record.readAt, icon: Eye, ok: Boolean(record.tracking?.openedAt ?? record.readAt) },
    { label: 'Read', value: record.readAt ?? record.tracking?.readAt, icon: Eye, ok: Boolean(record.readAt ?? record.tracking?.readAt) },
    { label: 'Clicked', value: record.tracking?.clickedAt, icon: CheckCircle2, ok: Boolean(record.tracking?.clickedAt) },
    { label: 'Failed', value: record.failedAt ?? record.tracking?.failedAt, icon: XCircle, ok: false, onlyFail: true },
  ].filter((s) => !s.onlyFail || s.value)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn('flex w-full flex-col gap-0 p-0 sm:max-w-xl', className)}>
        <SheetHeader className="space-y-0 border-b border-slate-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10">
                <ChannelIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="truncate text-base font-bold text-slate-900">
                  {record.title}
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {record._id}
                </SheetDescription>
              </div>
            </div>
            <StatusBadge status={record.status ?? 'sent'} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {record.channel && (
              <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600">
                <Radio className="mr-1 h-3 w-3" /> {record.channel.replace(/_/g, ' ')}
              </Badge>
            )}
            {record.category && (
              <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600">
                {record.category}
              </Badge>
            )}
            {record.priority && (
              <Badge
                variant="outline"
                className={cn(
                  'rounded-full',
                  record.priority === 'urgent'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : record.priority === 'high'
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-blue-200 bg-blue-50 text-blue-700',
                )}
              >
                {record.priority} priority
              </Badge>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-5">
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Message</h4>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">{record.subject ?? record.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{record.message}</p>
              </div>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Delivery timeline
              </h4>
              <ol className="relative space-y-4 border-l border-slate-200 pl-5">
                {timelineSteps.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <motion.li
                      key={step.label}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative"
                    >
                      <span
                        className={cn(
                          'absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white',
                          step.label === 'Failed' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600',
                        )}
                      >
                        <Icon className="h-3 w-3" />
                      </span>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">{step.label}</p>
                        <p className="text-xs text-slate-400">{fmt(step.value)}</p>
                      </div>
                    </motion.li>
                  )
                })}
                {timelineSteps.length === 0 && (
                  <li className="text-sm text-slate-400">No delivery events recorded yet.</li>
                )}
              </ol>
            </section>

            {record.failureReason && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <div>
                  <p className="text-xs font-semibold text-red-700">Delivery failed</p>
                  <p className="text-xs text-red-600">{record.failureReason}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <InfoTile icon={User} label="Recipient" value={record.recipient ?? record.user ?? '—'} />
              <InfoTile icon={Clock} label="Scheduled" value={fmt(record.scheduledAt)} />
              <InfoTile icon={RefreshCw} label="Retries" value={String(record.retryCount ?? 0)} />
              <InfoTile icon={Tag} label="Template" value={record.template ?? '—'} />
            </div>

            {record.tags && record.tags.length > 0 && (
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {record.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {tracking.length > 0 && (
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Raw tracking events
                </h4>
                <div className="space-y-1.5">
                  {tracking.map((ev, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2"
                    >
                      <span className="text-sm font-medium capitalize text-slate-700">{ev.event}</span>
                      <span className="text-xs text-slate-400">{fmt(ev.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {record.metadata && Object.keys(record.metadata).length > 0 && (
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Metadata
                </h4>
                <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-[11px] text-slate-100">
                  {JSON.stringify(record.metadata, null, 2)}
                </pre>
              </section>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 border-t border-slate-100 p-4">
          {record.recipient && record.recipient !== record.user && (
            <Button variant="outline" className="gap-1.5" onClick={() => onViewRecipient?.(record)}>
              <User className="h-4 w-4" /> Recipient
            </Button>
          )}
          <Button className="ml-auto gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={() => onResend?.(record)}>
            <Send className="h-4 w-4" /> Resend
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-slate-800" title={value}>
        {value}
      </p>
    </div>
  )
}

export default NotificationDrawer
