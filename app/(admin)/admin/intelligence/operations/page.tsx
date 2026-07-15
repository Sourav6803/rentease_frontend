'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  RefreshCw,
  Download,
  Truck,
  PackageCheck,
  Wrench,
  Users,
  AlertTriangle,
  Info,
  ClipboardList,
  BarChart3,
  Radio,
  ArrowRight,
} from 'lucide-react'
import { IntelligencePageShell } from '@/components/admin/intelligence'
import { KpiCard } from '@/components/admin/intelligence/kpi/KpiCard'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/admin/intelligence/EmptyState'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import { getOperations, toCsv, downloadCsv } from '@/lib/api/admin-intelligence'
import { formatOpsDate, todayISO, deriveOpsPulse, deriveOpsKpis, deriveOpsAlerts, deriveShiftSummary } from '@/components/admin/intelligence/operations'
import {
  DeliveryFlowChart,
  WarehouseMovementChart,
  DeliveriesPickupsLineChart,
  DriverStatusCard,
} from '@/components/admin/intelligence/operations/OperationsCharts'

const PULSE_META: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  green: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  amber: { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  red: { dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
}

const ALERT_META: Record<string, { icon: typeof AlertTriangle; color: string; bg: string; border: string }> = {
  red: { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  amber: { icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  info: { icon: Info, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
}

export default function IntelligenceOperationsPage() {
  const toast = useToast()
  const [date, setDate] = useState<string>(todayISO())
  const [auto, setAuto] = useState(false)

  const opsQ = useQuery({
    queryKey: ['ai', 'operations', date],
    queryFn: () => getOperations({ date }),
    staleTime: 30_000,
    refetchInterval: auto ? 60_000 : false,
  })

  const data = opsQ.data
  const lastUpdated = useMemo(
    () =>
      opsQ.dataUpdatedAt
        ? new Date(opsQ.dataUpdatedAt).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : undefined,
    [opsQ.dataUpdatedAt],
  )
  const pulse = useMemo(() => (data ? deriveOpsPulse(data) : null), [data])
  const kpis = useMemo(() => (data ? deriveOpsKpis(data) : []), [data])
  const alerts = useMemo(() => (data ? deriveOpsAlerts(data) : []), [data])
  const shift = useMemo(() => (data ? deriveShiftSummary(data) : null), [data])

  const handleExport = () => {
    if (!data) {
      toast.info('Nothing to export yet')
      return
    }
    const row = {
      date,
      todayDeliveries: data.todayDeliveries,
      todayPickups: data.todayPickups,
      lateDeliveries: data.lateDeliveries,
      latePickups: data.latePickups,
      pendingMaintenance: data.pendingMaintenance,
      activeDrivers: data.activeDrivers,
      upcomingReturns: data.upcomingReturns,
      upcomingRenewals: data.upcomingRenewals,
    }
    downloadCsv(`operations-${date}.csv`, toCsv([row], Object.keys(row)))
  }

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {lastUpdated && (
        <span className="hidden text-xs text-slate-400 lg:inline">Updated {lastUpdated}</span>
      )}
      <Button
        variant={auto ? 'default' : 'outline'}
        size="sm"
        className={cn('gap-1.5', auto && 'bg-amber-500 hover:bg-amber-600 text-white')}
        onClick={() => setAuto((a) => !a)}
        title="Auto-refresh every 60 seconds"
      >
        <Radio className={cn('h-3.5 w-3.5', auto && 'animate-pulse')} />
        Auto {auto ? 'On' : 'Off'}
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport} disabled={!data}>
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>
      <Link
        href="/admin/delivery/assignments"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <ClipboardList className="h-3.5 w-3.5" />
        Assignments
      </Link>
      <Link
        href="/admin/delivery/analytics"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <BarChart3 className="h-3.5 w-3.5" />
        Analytics
      </Link>
      <Button
        size="sm"
        className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:brightness-105"
        onClick={() => opsQ.refetch()}
        disabled={opsQ.isFetching}
      >
        <RefreshCw className={cn('h-3.5 w-3.5', opsQ.isFetching && 'animate-spin')} />
        Refresh
      </Button>
    </div>
  )

  return (
    <IntelligencePageShell
      title="Operations Command Center"
      subtitle="Logistics control tower — deliveries, pickups, drivers & alerts"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: 'Operations' },
      ]}
      demoMode={opsQ.isError}
      actions={headerActions}
    >
      {/* Hero */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
            <Radio className="h-3.5 w-3.5 animate-pulse text-amber-400" />
            Live Operations
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold tracking-tight">Operations Pulse</span>
            {pulse && (
              <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold', PULSE_META[pulse.level].bg, PULSE_META[pulse.level].border, PULSE_META[pulse.level].text)}>
                <span className={cn('h-2 w-2 rounded-full', PULSE_META[pulse.level].dot, pulse.level !== 'green' && 'animate-pulse')} />
                {pulse.label}
              </span>
            )}
          </div>
          {pulse && <p className="mt-1 text-sm text-slate-300">{pulse.detail}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value || todayISO())}
              className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white outline-none [color-scheme:dark] focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {opsQ.isLoading ? (
        <OpsSkeleton />
      ) : opsQ.isError ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Could not load the operations dashboard for {formatOpsDate(date)}.
          </div>
          <EmptyState
            icon={AlertTriangle}
            title="Operations data unavailable"
            description="The operations API could not be reached. Retry to reload the command center."
            actionLabel="Retry"
            onAction={() => opsQ.refetch()}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI strip */}
          <TooltipProvider delayDuration={150}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {kpis.map((k, i) => (
                <KpiCard key={k.key} kpi={k} index={i} />
              ))}
            </div>
          </TooltipProvider>

          {/* Shift summary */}
          {shift && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900">Shift Summary</h3>
              </div>
              <p className="text-sm text-slate-600">
                <span className="font-bold text-slate-900">{shift.deliveries}</span> deliveries ·{' '}
                <span className="font-bold text-slate-900">{shift.pickups}</span> pickups ·{' '}
                <span className={cn('font-bold', shift.late > 0 ? 'text-rose-600' : 'text-emerald-600')}>
                  {shift.late} late
                </span>{' '}
                · <span className="font-bold text-slate-900">{shift.maintenance}</span> maintenance pending
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {['Morning', 'Afternoon', 'Evening'].map((s) => (
                  <div key={s} className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{s} shift</p>
                    <p className="mt-1 text-[11px] text-slate-400">Shift-level breakdown not returned by the operations payload.</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DeliveryFlowChart deliveries={data!.todayDeliveries} pickups={data!.todayPickups} />
            <WarehouseMovementChart statuses={data!.warehouseStatus ?? data!.inventoryMovement ?? []} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <DriverStatusCard activeDrivers={data!.activeDrivers} className="lg:col-span-1" />
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900">Alert Feed</h3>
              </div>
              <div className="space-y-2">
                {alerts.map((a) => {
                  const m = ALERT_META[a.level]
                  const Icon = m.icon
                  return (
                    <div key={a.id} className={cn('flex items-start gap-3 rounded-xl border p-3', m.bg, m.border)}>
                      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', m.color)} />
                      <div>
                        <p className={cn('text-sm font-semibold', m.color)}>{a.title}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{a.detail}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <DeliveriesPickupsLineChart deliveries={data!.todayDeliveries} pickups={data!.todayPickups} />

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Truck className="h-3.5 w-3.5" /> Quick actions:
            </span>
            {[
              { label: 'Delivery Assignments', href: '/admin/delivery/assignments', icon: PackageCheck },
              { label: 'Delivery Analytics', href: '/admin/delivery/analytics', icon: BarChart3 },
              { label: 'Maintenance Queue', href: '/admin/delivery/assignments', icon: Wrench },
              { label: 'Driver Personnel', href: '/admin/delivery/personnel', icon: Users },
            ].map((q) => {
              const Icon = q.icon
              return (
                <Link
                  key={q.label}
                  href={q.href}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
                >
                  <Icon className="h-3.5 w-3.5 text-amber-500" />
                  {q.label}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </IntelligencePageShell>
  )
}

function OpsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/60" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/60" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-56 animate-pulse rounded-2xl bg-slate-200/60" />
        <div className="h-56 animate-pulse rounded-2xl bg-slate-200/60 lg:col-span-2" />
      </div>
    </div>
  )
}
