'use client'

import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Search,
  Smartphone,
  Filter,
  GitBranch,
  MousePointerClick,
  Inbox,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type EmptyVariant =
  | 'events'
  | 'search'
  | 'device'
  | 'funnel'
  | 'sessions'
  | 'table'
  | 'generic'

interface VariantConfig {
  icon: LucideIcon
  title: string
  description: string
  accent: string
}

const VARIANTS: Record<EmptyVariant, VariantConfig> = {
  events: {
    icon: Activity,
    title: 'No events captured yet',
    description:
      'Once storefront events start streaming in, you will see page views, product interactions and conversion signals here.',
    accent: '#6366f1',
  },
  search: {
    icon: Search,
    title: 'No search activity',
    description:
      'Customer search queries, click-through rates and zero-result searches will appear here once tracked.',
    accent: '#0ea5e9',
  },
  device: {
    icon: Smartphone,
    title: 'No device data',
    description:
      'A breakdown of sessions by device, browser and platform will populate this view over time.',
    accent: '#7c3aed',
  },
  funnel: {
    icon: Filter,
    title: 'No funnel data',
    description:
      'Track how visitors move from view to checkout to complete the conversion funnel analysis.',
    accent: '#059669',
  },
  sessions: {
    icon: MousePointerClick,
    title: 'No session metrics',
    description:
      'Engagement metrics such as session time, scroll depth and pages per session will show here.',
    accent: '#f59e0b',
  },
  table: {
    icon: Inbox,
    title: 'No events in this view',
    description:
      'Try widening the date range or clearing filters to surface more storefront activity.',
    accent: '#64748b',
  },
  generic: {
    icon: GitBranch,
    title: 'Nothing here yet',
    description: 'There is no data to display for this view.',
    accent: '#64748b',
  },
}

interface BehaviorEmptyStateProps {
  variant?: EmptyVariant
  icon?: LucideIcon
  title?: string
  description?: string
  accent?: string
  actionLabel?: string
  onAction?: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  className?: string
}

export function BehaviorEmptyState({
  variant = 'generic',
  icon,
  title,
  description,
  accent,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  className,
}: BehaviorEmptyStateProps) {
  const config = VARIANTS[variant]
  const Icon = icon ?? config.icon
  const tone = accent ?? config.accent

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-14 text-center backdrop-blur-sm',
        className,
      )}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 -z-10 blur-2xl" style={{ background: `${tone}22` }} />
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ring-white/60"
          style={{ background: `linear-gradient(135deg, ${tone}1f, ${tone}0a)` }}
        >
          <Icon className="h-8 w-8" style={{ color: tone }} />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title ?? config.title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description ?? config.description}</p>
      {(actionLabel || secondaryLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {actionLabel && onAction && (
            <Button size="sm" onClick={onAction} style={{ background: tone }}>
              {actionLabel}
            </Button>
          )}
          {secondaryLabel && onSecondary && (
            <Button variant="outline" size="sm" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default BehaviorEmptyState
