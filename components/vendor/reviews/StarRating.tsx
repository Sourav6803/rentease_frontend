/**
 * components/vendor/reviews/StarRating.tsx
 *
 * Reusable, accessible star-rating display. Renders filled / half / empty
 * stars for any 0-5 value and exposes a single `aria-label` summarizing the
 * rating for screen readers (individual star icons are decorative).
 */
'use client'

import { Star, StarHalf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showValue?: boolean
}

const SIZE_MAP: Record<NonNullable<StarRatingProps['size']>, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

export function StarRating({ value, size = 'md', className, showValue = false }: StarRatingProps) {
  const clamped = Math.min(5, Math.max(0, value ?? 0))
  const full = Math.floor(clamped)
  const hasHalf = clamped - full >= 0.25 && clamped - full < 0.75
  const roundsUp = clamped - full >= 0.75
  const filledCount = roundsUp ? full + 1 : full
  const iconClass = SIZE_MAP[size]

  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      role="img"
      aria-label={`${clamped.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < filledCount) {
          return (
            <Star
              key={i}
              className={cn(iconClass, 'fill-amber-400 text-amber-400')}
              aria-hidden="true"
            />
          )
        }
        if (i === filledCount && hasHalf) {
          return (
            <StarHalf
              key={i}
              className={cn(iconClass, 'fill-amber-400 text-amber-400')}
              aria-hidden="true"
            />
          )
        }
        return (
          <Star
            key={i}
            className={cn(iconClass, 'text-muted-foreground/30')}
            aria-hidden="true"
          />
        )
      })}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-foreground">{clamped.toFixed(1)}</span>
      )}
    </span>
  )
}

export default StarRating
