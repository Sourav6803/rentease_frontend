'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, PieChart as PieIcon, BarChart3, Activity } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { ChartCard } from '@/components/admin/intelligence'
import { cn } from '@/lib/utils'
import type {
  NotificationOverview,
  DeliveryTimelinePoint,
  CampaignPerformance,
} from '@/types/admin-intelligence.types'

export interface AnalyticsPanelProps {
  overview?: NotificationOverview
  timeline?: DeliveryTimelinePoint[]
  campaigns?: CampaignPerformance[]
  loading?: boolean
  className?: string
}

const SERIES_COLORS = {
  sent: '#6366f1',
  delivered: '#10b981',
  failed: '#ef4444',
  opened: '#0ea5e9',
  clicked: '#8b5cf6',
}

interface TooltipPayloadItem {
  name?: string
  value?: number
  color?: string
  payload?: Record<string, unknown>
}

interface ChartTooltipProps {
  active?: boolean
  label?: string | number
  payload?: TooltipPayloadItem[]
}

function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur">
      {label !== undefined && <p className="mb-1 font-semibold text-slate-700">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-500">{entry.name}</span>
          <span className="ml-auto font-bold text-slate-800">{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export function AnalyticsPanel({
  overview,
  timeline = [],
  campaigns = [],
  loading = false,
  className,
}: AnalyticsPanelProps) {
  const statusData = useMemo(() => {
    if (!overview) return []
    return [
      { name: 'Delivered', value: overview.delivered, color: SERIES_COLORS.delivered },
      { name: 'Opened', value: overview.opened, color: SERIES_COLORS.opened },
      { name: 'Clicked', value: overview.clicked, color: SERIES_COLORS.clicked },
      { name: 'Failed', value: overview.failed, color: SERIES_COLORS.failed },
    ].filter((d) => d.value > 0)
  }, [overview])

  const campaignData = useMemo(
    () =>
      campaigns
        .slice(0, 6)
        .map((c) => ({
          name: c.title.length > 14 ? `${c.title.slice(0, 14)}…` : c.title,
          deliveryRate: Math.round(c.deliveryRate * 100),
          openRate: Math.round(c.openRate * 100),
        })),
    [campaigns],
  )

  return (
    <div className={cn('grid grid-cols-1 gap-4 lg:grid-cols-2', className)}>
      <ChartCard
        title="Delivery over time"
        description="Sent, delivered and failed across the selected range"
        loading={loading}
        empty={timeline.length === 0}
        emptyLabel="No delivery data for this period"
        className="lg:col-span-2"
        actions={<TrendingUp className="h-4 w-4 text-indigo-500" />}
      >
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SERIES_COLORS.sent} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={SERIES_COLORS.sent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SERIES_COLORS.delivered} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={SERIES_COLORS.delivered} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="sent"
                name="Sent"
                stroke={SERIES_COLORS.sent}
                fill="url(#gradSent)"
                strokeWidth={2}
                animationDuration={900}
              />
              <Area
                type="monotone"
                dataKey="delivered"
                name="Delivered"
                stroke={SERIES_COLORS.delivered}
                fill="url(#gradDelivered)"
                strokeWidth={2}
                animationDuration={900}
              />
              <Area
                type="monotone"
                dataKey="failed"
                name="Failed"
                stroke={SERIES_COLORS.failed}
                fillOpacity={0.1}
                fill={SERIES_COLORS.failed}
                strokeWidth={2}
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        title="Delivery status mix"
        description="Overall engagement breakdown"
        loading={loading}
        empty={statusData.length === 0}
        emptyLabel="No engagement data"
        actions={<PieIcon className="h-4 w-4 text-violet-500" />}
      >
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={90}
                paddingAngle={3}
                animationDuration={800}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {overview && (
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <Mini label="Delivery" value={`${Math.round(overview.deliveryRate * 100)}%`} tone={SERIES_COLORS.delivered} />
            <Mini label="Open" value={`${Math.round(overview.ctr * 100)}%`} tone={SERIES_COLORS.opened} />
            <Mini label="Click" value={`${Math.round(overview.ctr * 100)}%`} tone={SERIES_COLORS.clicked} />
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Campaign performance"
        description="Delivery & open rate by recent campaign"
        loading={loading}
        empty={campaignData.length === 0}
        emptyLabel="No campaigns to compare"
        actions={<BarChart3 className="h-4 w-4 text-blue-500" />}
      >
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={campaignData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="deliveryRate" name="Delivery %" fill={SERIES_COLORS.delivered} radius={[4, 4, 0, 0]} animationDuration={800} />
              <Bar dataKey="openRate" name="Open %" fill={SERIES_COLORS.opened} radius={[4, 4, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 lg:col-span-2"
      >
        <Activity className="h-5 w-5 text-indigo-600" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">Queue health</p>
          <p className="text-xs text-slate-500">
            {overview
              ? `${overview.pendingQueue} notifications pending · avg delivery ${overview.avgDeliveryTimeSeconds}s`
              : 'Live delivery metrics will appear here.'}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function Mini({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
      <p className="text-sm font-bold" style={{ color: tone }}>
        {value}
      </p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  )
}

export default AnalyticsPanel
