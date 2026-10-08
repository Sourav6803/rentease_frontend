// src/components/vendor/OnboardingChecklist.tsx
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ChecklistItem {
  label: string
  detail: string
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { label: 'Register', detail: "You're doing this now" },
  { label: 'List your products', detail: 'Add photos, pricing, and availability' },
  { label: 'Fulfil orders', detail: 'Confirm pickups and deliveries' },
  { label: 'Get paid', detail: 'Payouts land every 14 days' },
]

interface OnboardingChecklistProps {
  /** 1-indexed — how many steps are considered "reached" (defaults to just the first) */
  activeStep?: number
}

export function OnboardingChecklist({ activeStep = 1 }: OnboardingChecklistProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-bold text-foreground">Steps to start renting out your assets</h3>

      <ol className="mt-4 space-y-0">
        {CHECKLIST_ITEMS.map((item, index) => {
          const stepNumber = index + 1
          const isDone = stepNumber < activeStep
          const isCurrent = stepNumber === activeStep
          const isLast = index === CHECKLIST_ITEMS.length - 1

          return (
            <li key={item.label} className="relative flex gap-3 pb-6 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-[11px] top-6 h-full w-px',
                    isDone ? 'bg-brand' : 'bg-border',
                  )}
                />
              )}
              <span
                className={cn(
                  'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                  isDone && 'bg-brand text-white',
                  isCurrent && 'border-2 border-brand bg-card text-brand',
                  !isDone && !isCurrent && 'border border-border bg-card text-muted-foreground',
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : stepNumber}
              </span>

              <div className="-mt-0.5">
                <div
                  className={cn(
                    'text-sm font-semibold',
                    isCurrent || isDone ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </div>
                <div className="text-xs text-muted-foreground">{item.detail}</div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
