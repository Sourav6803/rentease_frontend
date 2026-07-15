'use client'

import { cn } from '@/lib/utils'
import type { Period } from '@/types/admin-intelligence.types'
import { PERIOD_OPTIONS } from '@/lib/api/admin-intelligence'

interface PeriodSelectorProps {
  value: Period
  onChange: (period: Period) => void
  onCustomClick?: () => void
  showCustom?: boolean
  className?: string
}

export function PeriodSelector({
  value,
  onChange,
  onCustomClick,
  showCustom = true,
  className,
}: PeriodSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {PERIOD_OPTIONS.filter((o) => o.value !== 'custom').map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            value === opt.value
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          {opt.label}
        </button>
      ))}
      {showCustom && (
        <button
          type="button"
          onClick={() => {
            onChange('custom')
            onCustomClick?.()
          }}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            value === 'custom'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          Custom
        </button>
      )}
    </div>
  )
}

export default PeriodSelector
