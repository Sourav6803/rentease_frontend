'use client'

import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  BellRing,
  LayoutTemplate,
  Megaphone,
  SearchX,
} from 'lucide-react'
import { EmptyState } from '@/components/admin/intelligence'

export type NotificationEmptyVariant =
  | 'default'
  | 'no-notifications'
  | 'no-templates'
  | 'no-campaigns'
  | 'no-results'

interface NotificationEmptyStateProps {
  variant?: NotificationEmptyVariant
  icon?: LucideIcon
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const PRESETS: Record<
  NotificationEmptyVariant,
  { icon: LucideIcon; title: string; description: string; actionLabel?: string }
> = {
  default: {
    icon: Bell,
    title: 'No notifications yet',
    description: 'Broadcasts and transactional notifications will appear here once you start sending.',
  },
  'no-notifications': {
    icon: BellRing,
    title: 'No notifications in this range',
    description: 'Try widening the date range or adjusting the channel and status filters.',
  },
  'no-templates': {
    icon: LayoutTemplate,
    title: 'No templates yet',
    description: 'Create reusable notification templates to speed up campaigns and transactional sends.',
    actionLabel: 'Create template',
  },
  'no-campaigns': {
    icon: Megaphone,
    title: 'No campaigns yet',
    description: 'Launch a campaign to reach your users across email, SMS, push and in-app channels.',
    actionLabel: 'New campaign',
  },
  'no-results': {
    icon: SearchX,
    title: 'No matching results',
    description: 'We could not find notifications matching your current filters.',
  },
}

export function NotificationEmptyState({
  variant = 'default',
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: NotificationEmptyStateProps) {
  const preset = PRESETS[variant]
  const Icon = icon ?? preset.icon
  const showAction = actionLabel ?? preset.actionLabel

  return (
    <EmptyState
      icon={Icon}
      title={title ?? preset.title}
      description={description ?? preset.description}
      actionLabel={showAction}
      onAction={onAction}
      className={className}
    />
  )
}

export default NotificationEmptyState
