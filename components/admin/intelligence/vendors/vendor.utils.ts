import type { LucideIcon } from 'lucide-react'
import {
  DollarSign,
  Store,
  Percent,
  Star,
  Package,
  TrendingUp,
  Truck,
  Ban,
  ShieldCheck,
  HeartPulse,
  AlertTriangle,
  Boxes,
  Users,
  Gauge,
  Clock,
  RotateCw,
  Wrench,
} from 'lucide-react'
import type { KpiStat, KpiTrend } from '../kpi/KpiCard'
import type {
  VendorOverviewItem,
  VendorDetail,
} from '@/types/admin-intelligence.types'
import { formatCompactINR, formatINR } from '@/lib/api/admin-intelligence'

/* -------------------------------------------------------------------------- */
/* Status aggregation                                                           */
/* -------------------------------------------------------------------------- */

const COMPLETED = new Set(['completed', 'delivered', 'confirmed', 'active'])
const LATE = new Set(['late'])
const CANCELLED = new Set(['cancelled', 'canceled'])

export interface DerivedRates {
  total: number
  completed: number
  late: number
  cancelled: number
  fulfillmentRate: number
  cancellationRate: number
  lateRate: number
}

export function aggregateStatuses(items: VendorOverviewItem[]): DerivedRates {
  const sums: Record<string, number> = {}
  for (const it of items) {
    for (const s of it.rentalsByStatus ?? []) {
      sums[s._id] = (sums[s._id] ?? 0) + s.count
    }
  }
  let total = 0
  let completed = 0
  let late = 0
  let cancelled = 0
  for (const [k, v] of Object.entries(sums)) {
    total += v
    if (COMPLETED.has(k)) completed += v
    if (LATE.has(k)) late += v
    if (CANCELLED.has(k)) cancelled += v
  }
  return {
    total,
    completed,
    late,
    cancelled,
    fulfillmentRate: total ? (completed / total) * 100 : 0,
    cancellationRate: total ? (cancelled / total) * 100 : 0,
    lateRate: total ? (late / total) * 100 : 0,
  }
}

/* -------------------------------------------------------------------------- */
/* Generic helpers                                                            */
/* -------------------------------------------------------------------------- */

const sum = (items: VendorOverviewItem[], f: (i: VendorOverviewItem) => number): number =>
  items.reduce((a, i) => a + (f(i) || 0), 0)

const mean = (items: VendorOverviewItem[], f: (i: VendorOverviewItem) => number): number =>
  items.length ? items.reduce((a, i) => a + (f(i) || 0), 0) / items.length : 0

function spark(seed = 3): number[] {
  const out: number[] = []
  for (let i = 0; i < 7; i++) {
    const wave = Math.sin((i + seed) * 0.9) * 0.35 + 1
    out.push(Math.max(1, Math.round((8 + seed) * wave * (0.7 + i / 12))))
  }
  return out
}

/* -------------------------------------------------------------------------- */
/* Overview (marketplace leaderboard) KPIs                                    */
/* -------------------------------------------------------------------------- */

export function deriveVendorKpis(items: VendorOverviewItem[]): KpiStat[] {
  const rates = aggregateStatuses(items)
  const totalRevenue = sum(items, (i) => i.kpi.revenue.current)
  const activeVendors = items.filter((i) => i.kpi.revenue.current > 0).length || items.length
  const avgRating = mean(items, (i) => i.kpi.averageRating)
  const growth = mean(items, (i) => i.kpi.revenue.growth)
  const avgRentals = mean(items, (i) => i.kpi.rentals.current)
  const activeProducts = sum(items, (i) => i.kpi.activeProducts)

  const mk = (
    key: string,
    title: string,
    raw: number,
    icon: LucideIcon,
    accent: string,
    tooltip: string,
    opts?: { value?: string; force?: boolean; change?: number; trend?: KpiTrend; sub?: string },
  ): KpiStat => ({
    key,
    title,
    raw,
    value: opts?.value,
    forceValue: opts?.force ?? false,
    change: opts?.change ?? 0,
    trend: opts?.trend ?? 'up',
    icon,
    accent,
    sparkline: spark(key.length + raw),
    tooltip,
    sub: opts?.sub,
  })

  return [
    mk('revenue', 'Total Revenue', totalRevenue, DollarSign, '#2563eb',
      'Combined revenue across all vendors in the selected period.',
      { value: formatCompactINR(totalRevenue), force: true }),
    mk('vendors', 'Active Vendors', activeVendors, Store, '#7c3aed',
      'Verified vendors returning revenue in this period.',
      { sub: `${items.length} in dataset` }),
    mk('fulfillment', 'Fulfillment Rate', Math.round(rates.fulfillmentRate), Percent, '#059669',
      'Share of rentals that reached a completed/delivered state.',
      { value: `${rates.fulfillmentRate.toFixed(1)}%`, force: true, sub: `${rates.completed} fulfilled` }),
    mk('rating', 'Customer Rating', Number(avgRating.toFixed(2)), Star, '#f59e0b',
      'Average customer rating across all vendors.',
      { value: `${avgRating.toFixed(2)}★`, force: true }),
    mk('inventory', 'Inventory Utilization', 0, Boxes, '#0ea5e9',
      'Share of listed inventory actively rented.', { value: '—', force: true }),
    mk('growth', 'Growth', Math.round(growth), TrendingUp, '#8b5cf6',
      'Average revenue growth vs. the previous period.',
      { value: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`, force: true, change: growth, trend: growth >= 0 ? 'up' : 'down' }),
    mk('late', 'Late Deliveries', rates.late, Truck, '#e11d48',
      'Rentals flagged as late across the marketplace.',
      { value: String(rates.late), force: true, change: rates.lateRate, trend: rates.late > 0 ? 'down' : 'up' }),
    mk('cancellation', 'Cancellation Rate', Math.round(rates.cancellationRate), Ban, '#ef4444',
      'Share of rentals cancelled by vendors/customers.',
      { value: `${rates.cancellationRate.toFixed(1)}%`, force: true, change: rates.cancellationRate, trend: rates.cancellationRate > 5 ? 'down' : 'up' }),
    mk('satisfaction', 'Satisfaction', 0, HeartPulse, '#10b981',
      'Composite CSAT from reviews & support.', { value: '—', force: true }),
    mk('damage', 'Damage Claims', 0, AlertTriangle, '#f97316',
      'Count of damage / dispute claims raised.', { value: '—', force: true }),
    mk('rentals', 'Avg Rentals / Vendor', Math.round(avgRentals), Package, '#0891b2',
      'Average rental orders per vendor in the period.',
      { value: avgRentals.toFixed(0), force: true }),
    mk('products', 'Active Products', activeProducts, Boxes, '#14b8a6',
      'Total active products listed by these vendors.',
      { sub: 'across all vendors' }),
  ]
}

/* -------------------------------------------------------------------------- */
/* Detail (single vendor) KPIs                                                */
/* -------------------------------------------------------------------------- */

export function deriveVendorDetailKpis(item: VendorOverviewItem): KpiStat[] {
  const rates = aggregateStatuses([item])
  const k = item.kpi
  const mk = (
    key: string,
    title: string,
    raw: number,
    icon: LucideIcon,
    accent: string,
    tooltip: string,
    opts?: { value?: string; force?: boolean; change?: number; trend?: KpiTrend },
  ): KpiStat => ({
    key,
    title,
    raw,
    value: opts?.value,
    forceValue: opts?.force ?? false,
    change: opts?.change ?? 0,
    trend: opts?.trend ?? 'up',
    icon,
    accent,
    sparkline: spark(key.length + raw),
    tooltip,
  })

  return [
    mk('revenue', 'Revenue', k.revenue.current, DollarSign, '#2563eb',
      'Total successful payment revenue in the period.',
      { value: formatCompactINR(k.revenue.current), force: true, change: k.revenue.growth, trend: k.revenue.growth >= 0 ? 'up' : 'down' }),
    mk('rentals', 'Rental Count', k.rentals.current, Package, '#0891b2',
      'Total rental orders in the period.',
      { change: k.rentals.growth, trend: k.rentals.growth >= 0 ? 'up' : 'down' }),
    mk('fulfillment', 'Fulfillment', Math.round(rates.fulfillmentRate), Percent, '#059669',
      'Completed / delivered rentals vs. total.',
      { value: `${rates.fulfillmentRate.toFixed(1)}%`, force: true }),
    mk('delivery', 'Delivery Time', 0, Clock, '#0ea5e9',
      'Average time from order to delivery.', { value: '—', force: true }),
    mk('return', 'Return Rate', 0, RotateCw, '#f97316',
      'Share of rentals returned early / disputed.', { value: '—', force: true }),
    mk('damage', 'Damage Claims', 0, AlertTriangle, '#ef4444',
      'Damage / dispute claims in the period.', { value: '—', force: true }),
    mk('rating', 'Rating', Number(k.averageRating.toFixed(2)), Star, '#f59e0b',
      'Average customer rating from reviews.',
      { value: `${k.averageRating.toFixed(2)}★`, force: true }),
    mk('quality', 'Quality Score', 0, ShieldCheck, '#7c3aed',
      'Composite product & service quality score.', { value: '—', force: true }),
    mk('maintenance', 'Maintenance', 0, Wrench, '#14b8a6',
      'Maintenance / uptime health score.', { value: '—', force: true }),
    mk('satisfaction', 'Satisfaction', 0, HeartPulse, '#10b981',
      'Composite customer satisfaction (CSAT).', { value: '—', force: true }),
    mk('late', 'Late Deliveries', rates.late, Truck, '#e11d48',
      'Rentals flagged as late.', { value: String(rates.late), force: true, trend: rates.late > 0 ? 'down' : 'up' }),
    mk('cancellation', 'Cancellation', Math.round(rates.cancellationRate), Ban, '#ef4444',
      'Cancelled rentals vs. total.',
      { value: `${rates.cancellationRate.toFixed(1)}%`, force: true, trend: rates.cancellationRate > 5 ? 'down' : 'up' }),
    mk('utilization', 'Utilization', 0, Gauge, '#6366f1',
      'Inventory utilization rate.', { value: '—', force: true }),
    mk('growth', 'Growth', Math.round(k.revenue.growth), TrendingUp, '#8b5cf6',
      'Revenue growth vs. previous period.',
      { value: `${k.revenue.growth >= 0 ? '+' : ''}${k.revenue.growth.toFixed(1)}%`, force: true, change: k.revenue.growth, trend: k.revenue.growth >= 0 ? 'up' : 'down' }),
    mk('customers', 'Customers', k.totalCustomers, Users, '#db2777',
      'Unique customers who rented in the period.'),
    mk('products', 'Active Products', k.activeProducts, Boxes, '#0d9488',
      'Active products listed by this vendor.'),
  ]
}

/* -------------------------------------------------------------------------- */
/* Meta + formatting                                                          */
/* -------------------------------------------------------------------------- */

export const PLAN_META: Record<string, { label: string; color: string; bg: string }> = {
  basic: { label: 'Basic', color: '#64748b', bg: '#f1f5f9' },
  standard: { label: 'Standard', color: '#2563eb', bg: '#eff6ff' },
  premium: { label: 'Premium', color: '#7c3aed', bg: '#f5f3ff' },
  enterprise: { label: 'Enterprise', color: '#d97706', bg: '#fffbeb' },
  free: { label: 'Free', color: '#64748b', bg: '#f1f5f9' },
}

export function planMeta(plan?: string) {
  const key = (plan ?? 'basic').toLowerCase()
  return PLAN_META[key] ?? PLAN_META.basic
}

export function vendorName(detail?: VendorDetail, fallback = 'Vendor'): string {
  return detail?.business?.name?.trim() || detail?.user?.profile?.firstName
    ? `${detail.user?.profile?.firstName ?? ''} ${detail.user?.profile?.lastName ?? ''}`.trim()
    : fallback
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export function ratingColor(rating: number): string {
  if (rating >= 4.5) return '#16a34a'
  if (rating >= 4) return '#22c55e'
  if (rating >= 3) return '#f59e0b'
  if (rating >= 2) return '#f97316'
  return '#ef4444'
}

/* -------------------------------------------------------------------------- */
/* AI insights                                                                */
/* -------------------------------------------------------------------------- */

export interface VendorInsight {
  id: string
  type: 'positive' | 'warning' | 'info'
  title: string
  description: string
  action?: string
}

export function deriveVendorInsights(item: VendorOverviewItem): VendorInsight[] {
  const out: VendorInsight[] = []
  const k = item.kpi
  const rates = aggregateStatuses([item])

  if (k.revenue.growth > 0) {
    out.push({
      id: 'rev',
      type: 'positive',
      title: `Revenue improved by ${k.revenue.growth.toFixed(1)}%`,
      description: `Revenue grew from ${formatINR(k.revenue.previous)} to ${formatINR(k.revenue.current)} versus the previous period.`,
      action: 'Scale marketing for top categories',
    })
  } else if (k.revenue.growth < 0) {
    out.push({
      id: 'rev',
      type: 'warning',
      title: `Revenue declined by ${Math.abs(k.revenue.growth).toFixed(1)}%`,
      description: `Revenue dropped from ${formatINR(k.revenue.previous)} to ${formatINR(k.revenue.current)}. Investigate demand and pricing.`,
      action: 'Review pricing & promotions',
    })
  }

  if (k.averageRating >= 4.3) {
    out.push({
      id: 'rating',
      type: 'positive',
      title: `Strong ${k.averageRating.toFixed(1)}★ customer rating`,
      description: `Customers rate this vendor well across ${k.totalCustomers} unique renters.`,
      action: 'Feature in curated collections',
    })
  } else if (k.averageRating > 0 && k.averageRating < 3.5) {
    out.push({
      id: 'rating',
      type: 'warning',
      title: `Rating below target (${k.averageRating.toFixed(1)}★)`,
      description: 'Customer satisfaction is slipping — review recent reviews and product quality.',
      action: 'Contact vendor for quality audit',
    })
  }

  if (rates.cancellationRate > 5) {
    out.push({
      id: 'cancel',
      type: 'warning',
      title: `Elevated cancellation rate (${rates.cancellationRate.toFixed(1)}%)`,
      description: 'A high share of orders are being cancelled, hurting fulfillment reliability.',
      action: 'Audit inventory & stock accuracy',
    })
  }

  if (rates.late > 0) {
    out.push({
      id: 'late',
      type: 'info',
      title: `${rates.late} late ${rates.late === 1 ? 'delivery' : 'deliveries'}`,
      description: 'Late fulfillments can impact customer satisfaction and reviews.',
      action: 'Tighten logistics SLA',
    })
  }

  if (out.length === 0) {
    out.push({
      id: 'stable',
      type: 'info',
      title: 'Performance is stable',
      description: `No significant anomalies detected. Revenue ${formatINR(k.revenue.current)} with a ${k.averageRating.toFixed(1)}★ rating.`,
    })
  }

  return out
}

/* -------------------------------------------------------------------------- */
/* Recent activity formatting                                                  */
/* -------------------------------------------------------------------------- */

export function formatActivityDate(date?: string): string {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatActivityAmount(amount?: number): string {
  if (amount == null) return ''
  return formatINR(amount)
}
