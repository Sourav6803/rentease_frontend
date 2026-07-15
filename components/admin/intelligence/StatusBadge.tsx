'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { StatusVariant } from '@/types/admin-intelligence.types'

const VARIANT_STYLES: Record<StatusVariant, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired: 'bg-slate-100 text-slate-600 border-slate-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  scheduled: 'bg-violet-50 text-violet-700 border-violet-200',
  sent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
  inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  exhausted: 'bg-orange-50 text-orange-700 border-orange-200',
  disabled: 'bg-rose-50 text-rose-600 border-rose-200',
  default: 'bg-slate-100 text-slate-600 border-slate-200',
}

function normalizeStatus(status: string): StatusVariant {
  const s = status.toLowerCase() as StatusVariant
  return s in VARIANT_STYLES ? s : 'default'
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = normalizeStatus(status)
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}

export default StatusBadge
