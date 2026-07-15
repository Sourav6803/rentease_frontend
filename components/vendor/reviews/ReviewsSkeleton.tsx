/**
 * components/vendor/reviews/ReviewsSkeleton.tsx
 *
 * Loading placeholder for the vendor reviews page: KPI header row plus N
 * review-card skeletons, using shadcn's shimmer Skeleton primitive.
 */
'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

interface ReviewsSkeletonProps {
  cardCount?: number
}

export function ReviewsSkeleton({ cardCount = 4 }: ReviewsSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>

      <Skeleton className="h-40 rounded-2xl" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: cardCount }).map((_, i) => (
          <Card key={i} className="rounded-2xl border shadow-sm">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ReviewsSkeleton
