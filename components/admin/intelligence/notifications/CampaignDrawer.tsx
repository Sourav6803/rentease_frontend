'use client'

import {
  Megaphone,
  Send,
  CheckCircle2,
  Eye,
  MousePointerClick,
  XCircle,
  Clock,
  Copy,
  RefreshCw,
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
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import type { CampaignPerformance } from '@/types/admin-intelligence.types'

export interface CampaignDrawerProps {
  campaign: CampaignPerformance | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDuplicate?: (campaign: CampaignPerformance) => void
  onResend?: (campaign: CampaignPerformance) => void
  className?: string
}

const FUNNEL_COLORS = ['#6366f1', '#10b981', '#0ea5e9', '#8b5cf6']

interface TooltipPayloadItem {
  name?: string
  value?: number
  color?: string
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-700">{item.name}</p>
      <p className="font-bold text-slate-800">{item.value?.toLocaleString()}</p>
    </div>
  )
}

function fmtDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function CampaignDrawer({
  campaign,
  open,
  onOpenChange,
  onDuplicate,
  onResend,
  className,
}: CampaignDrawerProps) {
  if (!campaign) return null

  const funnel = [
    { name: 'Sent', value: campaign.totalSent },
    { name: 'Delivered', value: campaign.delivered },
    { name: 'Opened', value: campaign.opened },
    { name: 'Clicked', value: campaign.clicked },
  ]

  const metrics = [
    { label: 'Total sent', value: campaign.totalSent, icon: Send, tone: '#6366f1' },
    { label: 'Delivered', value: campaign.delivered, icon: CheckCircle2, tone: '#10b981' },
    { label: 'Opened', value: campaign.opened, icon: Eye, tone: '#0ea5e9' },
    { label: 'Clicked', value: campaign.clicked, icon: MousePointerClick, tone: '#8b5cf6' },
    { label: 'Failed', value: campaign.failed, icon: XCircle, tone: '#ef4444' },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn('flex w-full flex-col gap-0 p-0 sm:max-w-xl', className)}>
        <SheetHeader className="space-y-0 border-b border-slate-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10">
                <Megaphone className="h-5 w-5 text-violet-600" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="truncate text-base font-bold text-slate-900">
                  {campaign.title}
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {campaign._id}
                </SheetDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="rounded-full border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700"
            >
              {campaign.type}
            </Badge>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            Sent {fmtDate(campaign.sentAt)}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-5">
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {metrics.map((m) => {
                const Icon = m.icon
                return (
                  <div key={m.label} className="rounded-xl border border-slate-100 bg-white p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                      <Icon className="h-3 w-3" style={{ color: m.tone }} />
                      {m.label}
                    </div>
                    <p className="mt-1 text-lg font-bold" style={{ color: m.tone }}>
                      {m.value.toLocaleString()}
                    </p>
                  </div>
                )
              })}
            </section>

            <section className="space-y-3">
              <RateBar label="Delivery rate" value={Math.round(campaign.deliveryRate * 100)} tone="#10b981" />
              <RateBar label="Open rate" value={Math.round(campaign.openRate * 100)} tone="#0ea5e9" />
              <RateBar label="Click rate" value={Math.round(campaign.clickRate * 100)} tone="#8b5cf6" />
            </section>

            <Separator />

            <section>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Funnel
              </h4>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnel} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]} animationDuration={800}>
                      {funnel.map((_, i) => (
                        <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 border-t border-slate-100 p-4">
          {onDuplicate && (
            <Button variant="outline" className="gap-1.5" onClick={() => onDuplicate(campaign)}>
              <Copy className="h-4 w-4" /> Duplicate
            </Button>
          )}
          {onResend && (
            <Button className="ml-auto gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={() => onResend(campaign)}>
              <RefreshCw className="h-4 w-4" /> Resend
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function RateBar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">{label}</span>
        <span className="font-bold text-slate-800">{value}%</span>
      </div>
      <Progress value={value} className="h-2.5" style={{ '--primary': tone } as CSSProperties} />
    </div>
  )
}

export default CampaignDrawer
