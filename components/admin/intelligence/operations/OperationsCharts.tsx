'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ChartCard } from '@/components/admin/intelligence/ChartCard'

const PALETTE = ['#f59e0b', '#6366f1', '#0ea5e9', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899']

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: Record<string, unknown>; value?: number }>
  label?: string | number
  formatter?: (v: number) => string
}

function ChartTooltip({ active, payload, label, formatter }: TooltipProps & { formatter?: (v: number) => string }) {
  if (!active || !payload?.length) return null
  const row = payload[0]
  const value = (row.value ?? (row.payload.count as number) ?? 0) as number
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label != null && <p className="font-semibold text-slate-800">{String(label)}</p>}
      <p className="mt-0.5 text-slate-500">
        <span className="font-bold text-indigo-600">{formatter ? formatter(value) : value.toLocaleString('en-IN')}</span>
      </p>
    </div>
  )
}

/* Section 1 — Delivery Schedule Timeline (today's flow) ------------------- */

export function DeliveryFlowChart({
  deliveries,
  pickups,
  loading = false,
  className,
}: {
  deliveries: number
  pickups: number
  loading?: boolean
  className?: string
}) {
  const data = useMemo(
    () => [{ name: 'Today', Deliveries: deliveries, Pickups: pickups }],
    [deliveries, pickups],
  )
  return (
    <ChartCard
      title="Delivery Schedule Timeline"
      description="Today's scheduled deliveries vs. pickups (hourly buckets unavailable in payload)"
      loading={loading}
      className={className}
      height={280}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ left: 4, right: 8, top: 16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={40} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Deliveries" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={64} animationDuration={900} />
          <Bar dataKey="Pickups" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={64} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* Section 2 — Warehouse / Inventory Movement (stacked by status) ---- */

export function WarehouseMovementChart({
  statuses,
  loading = false,
  className,
}: {
  statuses: Array<{ _id: string; count: number }>
  loading?: boolean
  className?: string
}) {
  const { data, keys } = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of statuses) map[s._id] = s.count
    const ks = Object.keys(map)
    return {
      keys: ks,
      data: ks.length ? [{ name: 'Today', ...map }] : [],
    }
  }, [statuses])

  return (
    <ChartCard
      title="Warehouse / Inventory Movement"
      description="Inventory records updated today, grouped by status"
      loading={loading}
      empty={!loading && keys.length === 0}
      emptyLabel="No inventory movement recorded for this date"
      className={className}
      height={280}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ left: 4, right: 8, top: 16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={40} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {keys.map((k, i) => (
            <Bar key={k} dataKey={k} stackId="wh" radius={[0, 0, 0, 0]} fill={PALETTE[i % PALETTE.length]} animationDuration={900} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* Operational chart — Deliveries vs Pickups dual line ---------------------- */

export function DeliveriesPickupsLineChart({
  deliveries,
  pickups,
  loading = false,
  className,
}: {
  deliveries: number
  pickups: number
  loading?: boolean
  className?: string
}) {
  const data = useMemo(
    () => [
      { label: 'Deliveries', value: deliveries },
      { label: 'Pickups', value: pickups },
    ],
    [deliveries, pickups],
  )
  return (
    <ChartCard
      title="Operational Pace — Deliveries vs Pickups"
      description="Same-day volume comparison across the two movement types"
      loading={loading}
      className={className}
      height={260}
    >
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ left: 4, right: 8, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={40} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#c7d2fe' }} />
          <Line type="monotone" dataKey="value" name="Deliveries" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} animationDuration={900} />
          <Line type="monotone" dataKey="value" name="Pickups" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} animationDuration={900} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* Section 3 — Driver status placeholder (count only) --------------------- */

export function DriverStatusCard({
  activeDrivers,
  className,
}: {
  activeDrivers: number
  className?: string
}) {
  return (
    <div className={className}>
      <div className="relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-100/40 blur-2xl" />
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          </span>
          <h3 className="text-sm font-semibold text-slate-900">Driver Status Map</h3>
        </div>
        <p className="text-xs text-slate-500">
          Live on-duty personnel tracking is served by the delivery module. This control-tower view shows the current on-duty headcount.
        </p>
        <div className="mt-4 flex items-end gap-3">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900">{activeDrivers}</span>
          <span className="mb-1 text-xs font-medium text-slate-500">drivers on duty</span>
        </div>
        <Link
          href="/admin/delivery/personnel"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          View personnel
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  )
}

export default DeliveryFlowChart
