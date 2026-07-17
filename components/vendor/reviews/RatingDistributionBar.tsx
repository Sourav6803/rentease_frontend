/**
 * components/vendor/reviews/RatingDistributionBar.tsx
 *
 * 5-star -> 1-star histogram of the vendor's rating distribution. Each row
 * is clickable and toggles the star filter (clicking the active row clears
 * it back to "all"). Bars animate their width in on mount/update.
 */
'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { RatingDistribution, StarFilter } from '@/types/reviews.types'
// import type { RatingDistribution, StarFilter } from '@/app/(vendor)/vendor/reviews/types'

interface RatingDistributionBarProps {
  distribution: RatingDistribution
  activeStar: StarFilter
  onStarClick: (star: StarFilter) => void
}

const STARS: (keyof RatingDistribution)[] = ['5', '4', '3', '2', '1']

export function RatingDistributionBar({ distribution, activeStar, onStarClick }: RatingDistributionBarProps) {
  const total = STARS.reduce((sum, s) => sum + (distribution[s] ?? 0), 0)

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Rating breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {STARS.map((star) => {
          const count = distribution[star] ?? 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          const isActive = activeStar === star

          return (
            <button
              key={star}
              type="button"
              onClick={() => onStarClick(isActive ? 'all' : star)}
              aria-pressed={isActive}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors',
                'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive && 'bg-primary/5 ring-1 ring-primary/30'
              )}
            >
              <span className="flex w-8 shrink-0 items-center gap-0.5 text-xs font-medium text-foreground">
                {star}
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.span
                  className="block h-full rounded-full bg-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </span>
              <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {count} ({pct}%)
              </span>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default RatingDistributionBar
