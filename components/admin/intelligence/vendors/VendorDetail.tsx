'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Store,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Star,
  Truck,
  Users,
  Package,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Building2,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/useToast'
import type { VendorDetailResponse } from '@/types/admin-intelligence.types'
import { VendorKpiStrip } from './VendorKpiStrip'
import {
  VendorRevenueTrend,
  VendorStatusMix,
  VendorRatingDistribution,
} from './VendorCharts'
import {
  deriveVendorDetailKpis,
  deriveVendorInsights,
  aggregateStatuses,
  planMeta,
  vendorName,
  initials,
  ratingColor,
  formatActivityDate,
  formatActivityAmount,
  type VendorInsight,
} from './vendor.utils'

function ActionButton({ label, icon: Icon, onClick }: { label: string; icon: typeof Mail; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={onClick}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Button>
  )
}

function QualityCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-extrabold" style={{ color: accent }}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}

function InsightCard({ insight }: { insight: VendorInsight }) {
  const meta = {
    positive: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: Lightbulb },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: Lightbulb },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: Lightbulb },
  }[insight.type]
  const Icon = meta.icon
  return (
    <div className={`rounded-xl border ${meta.border} ${meta.bg} p-4`}>
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.text}`} />
        <div>
          <p className={`text-sm font-semibold ${meta.text}`}>{insight.title}</p>
          <p className="mt-0.5 text-xs text-slate-600">{insight.description}</p>
          {insight.action && (
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              <Sparkles className="h-3 w-3" />
              {insight.action}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function VendorDetail({ detail }: { detail: VendorDetailResponse }) {
  const toast = useToast()
  const { vendor, analytics } = detail
  const kpis = deriveVendorDetailKpis(analytics)
  const insights = deriveVendorInsights(analytics)
  const rates = aggregateStatuses([analytics])
  const name = vendorName(vendor)
  const plan = planMeta(vendor.subscription?.plan ?? vendor.plan)
  const verified = vendor.verification?.status === 'verified'
  const active = vendor.status?.isActive !== false && vendor.status?.isBlocked !== true

  const notify = (msg: string) => toast.info(msg)

  return (
    <div className="space-y-6">
      <Link
        href="/admin/intelligence/vendors"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to leaderboard
      </Link>

      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-indigo-600 to-blue-600 p-6 text-white shadow-lg"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {vendor.business?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vendor.business.logo} alt={name} className="h-16 w-16 rounded-2xl border-2 border-white/30 object-cover" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold">
                {initials(name)}
              </span>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">{name}</h2>
                <Badge className="border-0 bg-white/20 text-white">{plan.label} Plan</Badge>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    verified ? 'bg-emerald-400/20 text-emerald-100' : 'bg-amber-400/20 text-amber-100'
                  }`}
                >
                  {verified ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                  {verified ? 'Verified' : (vendor.verification?.status ?? 'Unverified')}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? 'bg-emerald-400/20 text-emerald-100' : 'bg-rose-400/20 text-rose-100'}`}>
                  {active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-indigo-100">
                {vendor.business?.businessType && (
                  <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{vendor.business.businessType}</span>
                )}
                {vendor.contact?.primaryPhone && (
                  <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{vendor.contact.primaryPhone}</span>
                )}
                {(vendor.user?.email || vendor.contact?.email) && (
                  <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{vendor.user?.email ?? vendor.contact?.email}</span>
                )}
                {typeof vendor.category === 'object' && vendor.category?.name && (
                  <span className="inline-flex items-center gap-1.5"><Store className="h-3.5 w-3.5" />{vendor.category.name}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ActionButton label="View Profile" icon={ExternalLink} onClick={() => notify('Opening vendor profile…')} />
            <ActionButton label="Open Analytics" icon={Store} onClick={() => notify('Opening vendor analytics…')} />
            <ActionButton label="Message Vendor" icon={Mail} onClick={() => notify('Opening vendor conversation…')} />
          </div>
        </div>
      </motion.div>

      {/* KPI grid */}
      <VendorKpiStrip kpis={kpis} />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <VendorRevenueTrend items={[analytics]} />
        <VendorStatusMix items={[analytics]} />
      </div>
      <VendorRatingDistribution distribution={vendor.rating?.distribution} />

      {/* Quality & experience */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Truck className="h-4 w-4 text-indigo-500" /> Delivery Performance
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <QualityCard label="Fulfillment" value={`${rates.fulfillmentRate.toFixed(1)}%`} accent="#059669" hint={`${rates.completed} orders`} />
            <QualityCard label="Late" value={String(rates.late)} accent="#e11d48" />
            <QualityCard label="Cancelled" value={`${rates.cancellationRate.toFixed(1)}%`} accent="#ef4444" hint={`${rates.cancelled} orders`} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Star className="h-4 w-4 text-amber-500" /> Customer Experience
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <QualityCard label="Avg Rating" value={`${analytics.kpi.averageRating.toFixed(1)}★`} accent={ratingColor(analytics.kpi.averageRating)} />
            <QualityCard label="Rentals" value={analytics.kpi.rentals.current.toLocaleString('en-IN')} accent="#0891b2" />
            <QualityCard label="Customers" value={analytics.kpi.totalCustomers.toLocaleString('en-IN')} accent="#db2777" />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Package className="h-4 w-4 text-indigo-500" /> Recent Activity
        </h3>
        {analytics.recentActivity.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No recent activity for this period.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Activity</th>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5">Product</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.recentActivity.slice(0, 8).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{a.action}</td>
                    <td className="px-4 py-2.5 text-slate-600">{a.customer ?? '—'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{a.product ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-800">
                      {formatActivityAmount(a.amount) || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-400">{formatActivityDate(a.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI insights */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Sparkles className="h-4 w-4 text-indigo-500" /> AI Insights & Recommendations
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {insights.map((ins) => (
            <InsightCard key={ins.id} insight={ins} />
          ))}
        </div>
      </div>

      {/* Quick navigation */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Users className="h-3.5 w-3.5" /> Quick navigation:
        </span>
        {[
          { label: 'Vendor Analytics', icon: Store },
          { label: 'Inventory', icon: Package },
          { label: 'Orders', icon: Truck },
          { label: 'Support', icon: ShieldAlert },
        ].map((q) => {
          const Icon = q.icon
          return (
            <Button
              key={q.label}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-slate-600"
              onClick={() => notify(`Opening ${q.label}…`)}
            >
              <Icon className="h-3.5 w-3.5" />
              {q.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default VendorDetail
