'use client'

import { motion } from 'framer-motion'
import {
  Users,
  Eye,
  Timer,
  MousePointerClick,
  ShoppingCart,
  Heart,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { KpiGrid } from '@/components/admin/intelligence/KpiGrid'
import type { BehaviorOverview, KpiCardItem } from '@/types/admin-intelligence.types'

interface AnalyticsCardsProps {
  overview?: BehaviorOverview
  loading?: boolean
  className?: string
}

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}

function pct(value: number): number {
  return Math.round(value * 100)
}

const ACCENT = {
  indigo: '#6366f1',
  violet: '#7c3aed',
  blue: '#0ea5e9',
  emerald: '#059669',
  amber: '#f59e0b',
}

export function AnalyticsCards({ overview, loading = false, className }: AnalyticsCardsProps) {
  const items: KpiCardItem[] = [
    {
      key: 'totalEvents',
      title: 'Total Events',
      value: overview ? overview.totalEvents.toLocaleString() : '—',
      icon: Eye as LucideIcon,
      accent: ACCENT.indigo,
      sub: 'Tracked interactions',
      loading,
    },
    {
      key: 'uniqueVisitors',
      title: 'Unique Visitors',
      value: overview ? overview.uniqueVisitors.toLocaleString() : '—',
      icon: Users as LucideIcon,
      accent: ACCENT.blue,
      sub: `${overview?.returningVisitors ?? 0} returning`,
      loading,
    },
    {
      key: 'avgSession',
      title: 'Avg. Session',
      value: overview ? fmtDuration(overview.avgSessionTimeSeconds) : '—',
      icon: Timer as LucideIcon,
      accent: ACCENT.amber,
      sub: 'Time on site',
      loading,
    },
    {
      key: 'engagement',
      title: 'Engagement Score',
      value: overview ? Math.round(overview.engagementScore).toString() : '—',
      icon: TrendingUp as LucideIcon,
      accent: ACCENT.violet,
      sub: 'Composite index',
      loading,
    },
    {
      key: 'conversion',
      title: 'Conversion Rate',
      value: overview ? `${pct(overview.conversionRate)}%` : '—',
      icon: MousePointerClick as LucideIcon,
      accent: ACCENT.emerald,
      sub: 'Visitors to rental',
      loading,
    },
    {
      key: 'checkout',
      title: 'Checkout Completion',
      value: overview ? `${pct(overview.checkoutCompletion)}%` : '—',
      icon: CheckCircle2 as LucideIcon,
      accent: ACCENT.indigo,
      sub: 'Started to paid',
      loading,
    },
    {
      key: 'cartAdds',
      title: 'Cart Adds',
      value: overview ? overview.cartAdds.toLocaleString() : '—',
      icon: ShoppingCart as LucideIcon,
      accent: ACCENT.blue,
      sub: 'Add-to-cart events',
      loading,
    },
    {
      key: 'wishlist',
      title: 'Wishlist Adds',
      value: overview ? overview.wishlistAdds.toLocaleString() : '—',
      icon: Heart as LucideIcon,
      accent: ACCENT.violet,
      sub: 'Saved for later',
      loading,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <KpiGrid items={items} columns={4} />
    </motion.div>
  )
}

export default AnalyticsCards
