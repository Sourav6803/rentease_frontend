'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Zap,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'
import type { MarketingOverview } from '@/types/admin-intelligence.types'

interface AutomationHealthBannerProps {
  overview?: MarketingOverview
  loading?: boolean
  onViewIssues?: () => void
  className?: string
}

interface HealthMetric {
  label: string
  value: number
  suffix?: string
  tone: string
}

function computeHealth(o: MarketingOverview): number {
  const open = Math.min(100, o.openRate)
  const click = Math.min(100, o.clickRate)
  const conv = Math.min(100, o.conversionRate * 5)
  const bouncePenalty = Math.min(40, o.bounceRate)
  const score = Math.round((open + click + conv) / 3 - bouncePenalty * 0.5)
  return Math.max(0, Math.min(100, score))
}

function healthLabel(score: number): { label: string; tone: string; icon: typeof CheckCircle2 } {
  if (score >= 75) return { label: 'Healthy', tone: '#059669', icon: CheckCircle2 }
  if (score >= 45) return { label: 'Needs attention', tone: '#d97706', icon: AlertTriangle }
  return { label: 'At risk', tone: '#dc2626', icon: AlertTriangle }
}

export function AutomationHealthBanner({
  overview,
  loading = false,
  onViewIssues,
  className,
}: AutomationHealthBannerProps) {
  if (loading || !overview) {
    return (
      <div
        className={cn(
          'h-28 w-full animate-pulse rounded-2xl bg-gradient-to-r from-violet-100 via-indigo-100 to-blue-100',
          className,
        )}
      />
    )
  }

  const score = computeHealth(overview)
  const status = healthLabel(score)
  const StatusIcon = status.icon

  const metrics: HealthMetric[] = [
    { label: 'Open rate', value: overview.openRate, suffix: '%', tone: '#2563eb' },
    { label: 'Click rate', value: overview.clickRate, suffix: '%', tone: '#7c3aed' },
    { label: 'Conversion', value: overview.conversionRate, suffix: '%', tone: '#059669' },
    { label: 'Bounce', value: overview.bounceRate, suffix: '%', tone: '#dc2626' },
  ]

  const workflowRatio =
    overview.totalWorkflows > 0
      ? Math.round((overview.activeWorkflows / overview.totalWorkflows) * 100)
      : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/60 p-5 shadow-sm',
        'bg-gradient-to-r from-violet-50 via-indigo-50 to-blue-50',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-violet-300/40 to-indigo-300/0 blur-2xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${status.tone}, ${status.tone}bb)` }}
          >
            <span className="text-xl font-extrabold leading-none">{score}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-90">
              Health
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4" style={{ color: status.tone }} />
              <span
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: status.tone }}
              >
                {status.label}
              </span>
            </div>
            <p className="mt-1 text-lg font-bold text-slate-900">
              Marketing Automation is running
            </p>
            <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-violet-500" />
                {overview.activeWorkflows}/{overview.totalWorkflows} workflows active
              </span>
              <span className="inline-flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-blue-500" />
                {overview.scheduledCampaigns} scheduled
              </span>
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                {formatPrice(overview.revenueGenerated)} revenue
              </span>
            </p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:max-w-2xl">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{m.label}</span>
                <span className="text-xs font-bold text-slate-900">
                  {m.value}
                  {m.suffix}
                </span>
              </div>
              <Progress
                value={Math.min(100, m.value)}
                className="h-1.5"
                style={{ ['--progress' as string]: m.tone }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/60 pt-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Workflow coverage {workflowRatio}% · {overview.emailsSentToday} emails today ·{' '}
          {overview.returningCustomers} returning customers
        </div>
        {onViewIssues && status.label !== 'Healthy' && (
          <button
            onClick={onViewIssues}
            className="text-xs font-semibold text-violet-600 transition-colors hover:text-violet-700"
          >
            Review issues
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default AutomationHealthBanner
