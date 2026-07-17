/**
 * components/vendor/reviews/ReviewStatsHeader.tsx
 *
 * KPI strip for the Vendor Reviews page: average rating (computed from the
 * distribution), total review count, reply rate, reviews awaiting a reply,
 * and reviews needing attention (pending/flagged). Values count up on mount
 * via framer-motion for a premium feel; respects prefers-reduced-motion.
 */
'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { StarRating } from './StarRating'
import { MessageSquareReply, MessagesSquare, ShieldAlert, Star } from 'lucide-react'
// import type { RatingDistribution } from '@/types/reviews.types'
// import { cn } from '@/lib/utils'
// import { RatingDistribution } from '@/lib/api/reviews'
import { RatingDistribution } from '@/types/reviews.types'
import { cn } from '@/lib/utils'

interface ReviewStatsHeaderProps {
  distribution: RatingDistribution
  totalReviews: number
  repliedCount: number
  needsReplyCount: number
  attentionCount: number
  isLoading?: boolean
}

function useCountUp(target: number, durationMs = 700) {
  const [value, setValue] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      setValue(target)
      return
    }
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs, reduceMotion])

  return value
}

function averageFromDistribution(distribution: RatingDistribution): number {
  const entries = Object.entries(distribution) as [keyof RatingDistribution, number][]
  const total = entries.reduce((sum, [, count]) => sum + count, 0)
  if (total === 0) return 0
  const weighted = entries.reduce((sum, [star, count]) => sum + Number(star) * count, 0)
  return Math.round((weighted / total) * 10) / 10
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  tone?: 'default' | 'warning' | 'danger'
  index: number
}

function StatCard({ icon, label, value, tone = 'default', index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-4">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              tone === 'default' && 'bg-primary/10 text-primary',
              tone === 'warning' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
              tone === 'danger' && 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            )}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function ReviewStatsHeader({
  distribution,
  totalReviews,
  repliedCount,
  needsReplyCount,
  attentionCount,
  isLoading,
}: ReviewStatsHeaderProps) {
  const average = averageFromDistribution(distribution)
  const replyRate = totalReviews > 0 ? Math.round((repliedCount / totalReviews) * 100) : 0

  const animatedTotal = useCountUp(totalReviews)
  const animatedReplyRate = useCountUp(replyRate)
  const animatedNeedsReply = useCountUp(needsReplyCount)
  const animatedAttention = useCountUp(attentionCount)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">Average rating</p>
              <div className="flex items-center gap-1.5">
                <p className="text-xl font-semibold tabular-nums text-foreground">
                  {average.toFixed(1)}
                </p>
                <StarRating value={average} size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <StatCard
        icon={<MessagesSquare className="h-5 w-5" />}
        label="Total reviews"
        value={animatedTotal}
        index={1}
      />
      <StatCard
        icon={<MessageSquareReply className="h-5 w-5" />}
        label="Reply rate"
        value={`${animatedReplyRate}%`}
        index={2}
      />
      <StatCard
        icon={<MessageSquareReply className="h-5 w-5" />}
        label="Awaiting reply"
        value={animatedNeedsReply}
        tone={needsReplyCount > 0 ? 'warning' : 'default'}
        index={3}
      />
      <StatCard
        icon={<ShieldAlert className="h-5 w-5" />}
        label="Needs attention"
        value={animatedAttention}
        tone={attentionCount > 0 ? 'danger' : 'default'}
        index={4}
      />
    </div>
  )
}

export default ReviewStatsHeader
