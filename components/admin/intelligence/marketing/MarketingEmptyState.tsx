'use client'

import type { LucideIcon } from 'lucide-react'
import {
  Workflow,
  Send,
  Mail,
  Users,
  Megaphone,
  Inbox,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type EmptyVariant =
  | 'workflows'
  | 'campaigns'
  | 'templates'
  | 'segments'
  | 'executions'
  | 'generic'

interface VariantConfig {
  icon: LucideIcon
  title: string
  description: string
  accent: string
}

const VARIANTS: Record<EmptyVariant, VariantConfig> = {
  workflows: {
    icon: Workflow,
    title: 'No automation workflows yet',
    description:
      'Create your first workflow to automatically nurture customers across the rental lifecycle.',
    accent: '#7c3aed',
  },
  campaigns: {
    icon: Send,
    title: 'No campaigns created',
    description:
      'Launch targeted email campaigns to segments, lists or your entire customer base.',
    accent: '#2563eb',
  },
  templates: {
    icon: Mail,
    title: 'No email templates',
    description:
      'Design reusable, on-brand templates to power campaigns and automated workflows.',
    accent: '#0891b2',
  },
  segments: {
    icon: Users,
    title: 'No customer segments',
    description:
      'Group customers with rules to target the right audience with the right message.',
    accent: '#059669',
  },
  executions: {
    icon: Megaphone,
    title: 'No executions to show',
    description:
      'Workflow activity will appear here once your automations start running.',
    accent: '#d97706',
  },
  generic: {
    icon: Inbox,
    title: 'Nothing here yet',
    description: 'There is no data to display for this view.',
    accent: '#64748b',
  },
}

interface MarketingEmptyStateProps {
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

export function MarketingEmptyState({
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
}: MarketingEmptyStateProps) {
  const config = VARIANTS[variant]
  const Icon = icon ?? config.icon
  const tone = accent ?? config.accent

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center backdrop-blur-sm',
        className,
      )}
    >
      <div className="relative mb-5">
        <div
          className="absolute inset-0 -z-10 blur-2xl"
          style={{ background: `${tone}22` }}
        />
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ring-white/60"
          style={{
            background: `linear-gradient(135deg, ${tone}1f, ${tone}0a)`,
          }}
        >
          <Icon className="h-8 w-8" style={{ color: tone }} />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-900">
        {title ?? config.title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">
        {description ?? config.description}
      </p>
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

export default MarketingEmptyState
