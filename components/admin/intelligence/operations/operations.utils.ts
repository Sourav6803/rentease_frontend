import type { LucideIcon } from 'lucide-react'
import {
  Truck,
  PackageCheck,
  AlertTriangle,
  Clock,
  Wrench,
  Users,
  Undo2,
  RefreshCw,
} from 'lucide-react'
import type { KpiStat } from '../kpi/KpiCard'
import type { OperationsDashboard } from '@/types/admin-intelligence.types'

function spark(seed = 3): number[] {
  const out: number[] = []
  for (let i = 0; i < 7; i++) {
    const wave = Math.sin((i + seed) * 0.9) * 0.35 + 1
    out.push(Math.max(1, Math.round((6 + seed) * wave * (0.7 + i / 12))))
  }
  return out
}

/* -------------------------------------------------------------------------- */
/* Operational pulse                                                           */
/* -------------------------------------------------------------------------- */

export type OpsPulse = 'green' | 'amber' | 'red'

export function deriveOpsPulse(d: OperationsDashboard): {
  level: OpsPulse
  label: string
  detail: string
} {
  const late = (d.lateDeliveries || 0) + (d.latePickups || 0)
  const maint = d.pendingMaintenance || 0
  if (late >= 5 || maint >= 10) {
    return {
      level: 'red',
      label: 'Critical',
      detail: `${late} late movements · ${maint} maintenance pending`,
    }
  }
  if (late > 0 || maint > 0) {
    return {
      level: 'amber',
      label: 'Elevated',
      detail: `${late} late movements · ${maint} maintenance pending`,
    }
  }
  return { level: 'green', label: 'All Systems Go', detail: 'No late deliveries or maintenance backlog' }
}

/* -------------------------------------------------------------------------- */
/* KPI cards                                                                 */
/* -------------------------------------------------------------------------- */

export function deriveOpsKpis(d: OperationsDashboard): KpiStat[] {
  const mk = (
    key: string,
    title: string,
    raw: number,
    icon: LucideIcon,
    accent: string,
    tooltip: string,
    opts?: { trend?: 'up' | 'down' | 'neutral'; change?: number; sub?: string },
  ): KpiStat => ({
    key,
    title,
    raw,
    value: raw.toLocaleString('en-IN'),
    forceValue: false,
    change: opts?.change ?? 0,
    trend: opts?.trend ?? 'up',
    icon,
    accent,
    sparkline: spark(key.length + raw),
    tooltip,
    sub: opts?.sub,
  })

  return [
    mk('deliveries', "Today's Deliveries", d.todayDeliveries || 0, Truck, '#059669',
      'Deliveries scheduled for today.',
      { trend: (d.lateDeliveries || 0) > 0 ? 'down' : 'up', change: d.lateDeliveries || 0 }),
    mk('pickups', "Today's Pickups", d.todayPickups || 0, PackageCheck, '#2563eb',
      'Pickups scheduled for today.',
      { trend: 'up' }),
    mk('lateDeliveries', 'Late Deliveries', d.lateDeliveries || 0, AlertTriangle, '#ef4444',
      'Deliveries past their deadline.',
      { trend: (d.lateDeliveries || 0) > 0 ? 'down' : 'up', change: d.lateDeliveries || 0 }),
    mk('latePickups', 'Late Pickups', d.latePickups || 0, Clock, '#f97316',
      'Pickups past their scheduled date.',
      { trend: (d.latePickups || 0) > 0 ? 'down' : 'up', change: d.latePickups || 0 }),
    mk('maintenance', 'Pending Maintenance', d.pendingMaintenance || 0, Wrench, '#f59e0b',
      'Open (pending / in-progress) maintenance requests.',
      { trend: (d.pendingMaintenance || 0) > 0 ? 'down' : 'up', change: d.pendingMaintenance || 0 }),
    mk('drivers', 'Active Drivers', d.activeDrivers || 0, Users, '#7c3aed',
      'Delivery personnel currently on duty.'),
    mk('returns', 'Upcoming Returns', d.upcomingReturns || 0, Undo2, '#0ea5e9',
      'Active rentals ending in the next 7 days.'),
    mk('renewals', 'Upcoming Renewals', d.upcomingRenewals || 0, RefreshCw, '#8b5cf6',
      'Extension requests awaiting review.'),
  ]
}

/* -------------------------------------------------------------------------- */
/* Alert feed                                                                 */
/* -------------------------------------------------------------------------- */

export interface OpsAlert {
  id: string
  level: 'red' | 'amber' | 'info'
  title: string
  detail: string
}

export function deriveOpsAlerts(d: OperationsDashboard): OpsAlert[] {
  const out: OpsAlert[] = []
  if ((d.lateDeliveries || 0) > 0) {
    out.push({
      id: 'lateDeliveries',
      level: 'red',
      title: `${(d.lateDeliveries || 0)} late ${d.lateDeliveries === 1 ? 'delivery' : 'deliveries'}`,
      detail: 'One or more deliveries have passed their deadline and need escalation.',
    })
  }
  if ((d.latePickups || 0) > 0) {
    out.push({
      id: 'latePickups',
      level: 'amber',
      title: `${(d.latePickups || 0)} late ${d.latePickups === 1 ? 'pickup' : 'pickups'}`,
      detail: 'Pickups are overdue against their scheduled date.',
    })
  }
  if ((d.pendingMaintenance || 0) > 0) {
    out.push({
      id: 'maintenance',
      level: 'amber',
      title: `${(d.pendingMaintenance || 0)} pending maintenance`,
      detail: 'Open maintenance requests are waiting on the queue.',
    })
  }
  if (out.length === 0) {
    out.push({
      id: 'clear',
      level: 'info',
      title: 'No active alerts',
      detail: 'Operations are running within SLA for this date.',
    })
  }
  return out
}

/* -------------------------------------------------------------------------- */
/* Shift summary                                                              */
/* -------------------------------------------------------------------------- */

export interface ShiftSummary {
  deliveries: number
  pickups: number
  late: number
  maintenance: number
}

export function deriveShiftSummary(d: OperationsDashboard): ShiftSummary {
  return {
    deliveries: d.todayDeliveries || 0,
    pickups: d.todayPickups || 0,
    late: (d.lateDeliveries || 0) + (d.latePickups || 0),
    maintenance: d.pendingMaintenance || 0,
  }
}

export function formatOpsDate(date: string): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
