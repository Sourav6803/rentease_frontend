'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface BehaviorSkeletonProps {
  className?: string
}

function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <Skeleton className="h-9 w-40 rounded-lg" />
      <Skeleton className="h-9 w-32 rounded-lg" />
      <Skeleton className="h-9 w-32 rounded-lg" />
      <Skeleton className="h-9 w-32 rounded-lg" />
      <div className="ml-auto flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  )
}

function MetricSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="mt-2 h-4 w-32 rounded-md" />
      <Skeleton className="mt-1 h-3 w-20 rounded-md" />
    </div>
  )
}

function ChartSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-40 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <Skeleton className={cn('w-full rounded-lg', tall ? 'h-72' : 'h-56')} />
    </div>
  )
}

/**
 * Full-page loading skeleton for the Customer Behaviour Analytics module.
 * Mirrors the real layout: filter bar, KPI cards, event charts and a tables row.
 */
export function BehaviorSkeleton({ className }: BehaviorSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} aria-hidden>
      <FilterBarSkeleton />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartSkeleton tall />
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Skeleton className="mb-4 h-4 w-48 rounded-md" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-40 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BehaviorSkeleton
