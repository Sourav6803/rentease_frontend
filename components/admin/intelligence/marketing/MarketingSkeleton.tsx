'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface MarketingSkeletonProps {
  className?: string
}

function MetricSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="mt-2 h-4 w-32 rounded-md" />
    </div>
  )
}

/**
 * Full-page loading skeleton for the Marketing Automation Command Center.
 * Mirrors the real layout: health banner, KPI metrics, workflow grid,
 * campaign table and a charts row.
 */
export function MarketingSkeleton({ className }: MarketingSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} aria-hidden>
      {/* Automation health banner */}
      <Skeleton className="h-28 w-full rounded-2xl" />

      {/* KPI metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>

      {/* Section header + workflow grid */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-48 rounded-md" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Campaign table */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  )
}

export default MarketingSkeleton
