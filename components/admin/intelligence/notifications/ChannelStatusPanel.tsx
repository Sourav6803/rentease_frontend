'use client'

import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  MessageSquare,
  Smartphone,
  AppWindow,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FlaskConical,
  Activity,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { ChannelStatus } from '@/types/admin-intelligence.types'

export const CHANNEL_META: Record<
  string,
  { label: string; color: string; icon: typeof Mail }
> = {
  email: { label: 'Email', color: '#4f46e5', icon: Mail },
  sms: { label: 'SMS', color: '#059669', icon: MessageSquare },
  push: { label: 'Push', color: '#7c3aed', icon: Smartphone },
  in_app: { label: 'In-App', color: '#2563eb', icon: AppWindow },
  whatsapp: { label: 'WhatsApp', color: '#d97706', icon: MessageCircle },
}

const STATUS_META: Record<
  ChannelStatus['status'],
  { label: string; tone: string; icon: typeof CheckCircle2 }
> = {
  connected: { label: 'Connected', tone: '#059669', icon: CheckCircle2 },
  degraded: { label: 'Degraded', tone: '#d97706', icon: AlertTriangle },
  down: { label: 'Down', tone: '#dc2626', icon: XCircle },
  beta: { label: 'Beta', tone: '#7c3aed', icon: FlaskConical },
}

export interface ChannelStatusPanelProps {
  channels: ChannelStatus[]
  loading?: boolean
  className?: string
}

export function ChannelStatusPanel({ channels, loading = false, className }: ChannelStatusPanelProps) {
  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {channels.map((channel, i) => {
        const meta = CHANNEL_META[channel.channel] ?? CHANNEL_META.email
        const status = STATUS_META[channel.status] ?? STATUS_META.connected
        const Icon = meta.icon
        const StatusIcon = status.icon
        return (
          <motion.div
            key={channel.channel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            whileHover={{ y: -3 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10"
              style={{ background: meta.color }}
            />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-white/60"
                  style={{ background: `linear-gradient(135deg, ${meta.color}1f, ${meta.color}0a)` }}
                >
                  <Icon className="h-5 w-5" style={{ color: meta.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{meta.label}</p>
                  <p className="text-[11px] text-slate-400">
                    Last sync {new Date(channel.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: `${status.tone}14`, color: status.tone, border: 0 }}
              >
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Success rate</span>
                <span className="font-bold text-slate-800">{channel.successRate.toFixed(1)}%</span>
              </div>
              <Progress
                value={channel.successRate}
                className="h-2"
                style={{ '--primary': meta.color } as CSSProperties}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <MiniMetric label="Latency" value={`${channel.latency}ms`} />
              <MiniMetric label="Errors 24h" value={channel.errors24h} tone={channel.errors24h > 0 ? '#dc2626' : '#64748b'} />
              <MiniMetric label="Queued" value={channel.queuedMessages} tone={channel.queuedMessages > 0 ? '#d97706' : '#64748b'} />
            </div>

            {channel.status === 'down' && (
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-700">
                <Activity className="h-3.5 w-3.5" />
                Outbound delivery paused
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

function MiniMetric({
  label,
  value,
  tone = '#64748b',
}: {
  label: string
  value: string | number
  tone?: string
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
      <p className="text-sm font-bold" style={{ color: tone }}>
        {value}
      </p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  )
}

export default ChannelStatusPanel
