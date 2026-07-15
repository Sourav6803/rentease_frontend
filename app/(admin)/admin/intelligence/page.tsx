'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Sparkles,
  BarChart3,
  TicketPercent,
  Users,
  Megaphone,
  Package,
  ScanEye,
  Target,
  Lightbulb,
  Store,
  Bell,
  ClipboardList,
  Brain,
  RefreshCw,
  ArrowRight,
  DollarSign,
  ShoppingBag,
  Truck,
  PackageX,
} from 'lucide-react'
import {
  getOverview,
  getAiInsights,
  formatCompactINR,
} from '@/lib/api/admin-intelligence'
import {
  IntelligencePageShell,
  KpiGrid,
  INTELLIGENCE_MODULES,
} from '@/components/admin/intelligence'
import { GlossaryButton } from '@/components/admin/intelligence/GlossaryDrawer'
import type { KpiCardItem } from '@/types/admin-intelligence.types'

const MODULE_ICONS: Record<string, React.ElementType> = {
  hub: Sparkles,
  analytics: BarChart3,
  coupons: TicketPercent,
  crm: Users,
  marketing: Megaphone,
  products: Package,
  behavior: ScanEye,
  interests: Target,
  recommendations: Lightbulb,
  vendors: Store,
  notifications: Bell,
  operations: ClipboardList,
  'ai-insights': Brain,
}

const MODULE_DESCRIPTIONS: Record<string, string> = {
  analytics: 'Overview cards, rental charts & KPIs',
  coupons: 'Discount performance & promotion analytics',
  crm: 'Customer 360 profiles & email outreach',
  marketing: 'Workflows, campaigns & audience segments',
  products: 'Demand signals & product performance',
  behavior: 'User events, funnels & session analytics',
  interests: 'High-intent product interest signals',
  recommendations: 'Recommendation engine preview',
  vendors: 'Vendor leaderboard & performance KPIs',
  notifications: 'Broadcast delivery & read-rate monitoring',
  operations: 'Deliveries, pickups & daily operations',
  'ai-insights': 'Automated business insights & alerts',
}

export default function IntelligenceHubPage() {
  const overviewQ = useQuery({
    queryKey: ['ai', 'hub', 'overview'],
    queryFn: getOverview,
    staleTime: 60_000,
  })

  const insightsQ = useQuery({
    queryKey: ['ai', 'hub', 'insights'],
    queryFn: () => getAiInsights({ period: '30d' }),
    staleTime: 120_000,
  })

  const demoMode = overviewQ.isError
  const data = overviewQ.data

  const kpiItems: KpiCardItem[] = [
    { key: 'revenue', title: 'Total Revenue', value: formatCompactINR(data?.totalRevenue ?? 0), icon: DollarSign, accent: '#2563eb', loading: overviewQ.isLoading },
    { key: 'mrr', title: 'MRR', value: formatCompactINR(data?.mrr ?? 0), icon: BarChart3, accent: '#4f46e5', loading: overviewQ.isLoading },
    { key: 'rentals', title: 'Total Rentals', value: (data?.totalRentals ?? 0).toLocaleString('en-IN'), icon: ShoppingBag, accent: '#0ea5e9', loading: overviewQ.isLoading },
    { key: 'active', title: 'Active Rentals', value: (data?.activeRentals ?? 0).toLocaleString('en-IN'), icon: ShoppingBag, accent: '#059669', loading: overviewQ.isLoading },
    { key: 'users', title: 'Active Users', value: (data?.activeUsers ?? 0).toLocaleString('en-IN'), icon: Users, accent: '#7c3aed', loading: overviewQ.isLoading },
    { key: 'vendors', title: 'Vendors', value: (data?.vendors ?? 0).toLocaleString('en-IN'), icon: Store, accent: '#d97706', loading: overviewQ.isLoading },
    { key: 'products', title: 'Products', value: (data?.products ?? 0).toLocaleString('en-IN'), icon: Package, accent: '#db2777', loading: overviewQ.isLoading },
    { key: 'deliveries', title: 'Pending Deliveries', value: (data?.pendingDeliveries ?? 0).toLocaleString('en-IN'), icon: Truck, accent: '#0891b2', loading: overviewQ.isLoading },
    { key: 'inventory', title: 'Available Inventory', value: (data?.availableInventory ?? 0).toLocaleString('en-IN'), icon: Package, accent: '#16a34a', loading: overviewQ.isLoading },
    { key: 'oos', title: 'Out of Stock', value: (data?.outOfStockProducts ?? 0).toLocaleString('en-IN'), icon: PackageX, accent: '#dc2626', loading: overviewQ.isLoading },
    { key: 'returned', title: 'Returned Rentals', value: (data?.returnedRentals ?? 0).toLocaleString('en-IN'), icon: ShoppingBag, accent: '#64748b', loading: overviewQ.isLoading },
    { key: 'new-users', title: 'New Users (Month)', value: (data?.newUsersThisMonth ?? 0).toLocaleString('en-IN'), icon: Users, accent: '#9333ea', loading: overviewQ.isLoading },
  ]

  return (
    <IntelligencePageShell
      title="Intelligence Hub"
      subtitle="Central command for all 12 business intelligence modules"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence Hub' },
      ]}
      demoMode={demoMode}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              overviewQ.refetch()
              insightsQ.refetch()
            }}
            disabled={overviewQ.isFetching}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${overviewQ.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <GlossaryButton />
        </div>
      }
    >
      {/* What's new */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-[11px] font-bold text-white">
            <Sparkles className="h-3 w-3" /> What’s new
          </span>
          <p className="text-xs text-slate-600">
            New intelligence modules, command palette (⌘K), and live KPI tooltips.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Vendor Performance', 'Operations Command', 'AI Insights', 'Recommendations'].map((t) => (
            <span key={t} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-indigo-700 shadow-sm">
              {t}
            </span>
          ))}
        </div>
      </div>

      <KpiGrid items={kpiItems} columns={4} className="mb-10" />

      {/* AI executive summary */}
      <div className="mb-10 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Brain className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-900">Executive Summary</h2>
        </div>
        {insightsQ.isLoading ? (
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className="text-sm text-slate-600">
            {insightsQ.data?.executiveSummary ?? 'Loading insights…'}
          </p>
        )}
      </div>

      {/* Module grid */}
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Modules</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {INTELLIGENCE_MODULES.filter((m) => m.key !== 'hub').map((mod, i) => {
          const Icon = MODULE_ICONS[mod.key] ?? Sparkles
          return (
            <motion.div
              key={mod.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                href={mod.href}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{mod.label}</h3>
                <p className="mt-1 flex-1 text-xs text-slate-500">
                  {MODULE_DESCRIPTIONS[mod.key] ?? 'Open module'}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                  Open <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </IntelligencePageShell>
  )
}
