'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/** Skeleton for the KPI tile row shown atop analytics / above the queue. */
export function KpiTilesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="rounded-2xl border-border/60">
          <CardHeader className="pb-2">
            <Skeleton className="h-3 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Skeleton for a single moderation row, mirrors ModerationRow's grid. */
function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border/60 px-4 py-3 last:border-0">
      <Skeleton className="h-4 w-4 rounded-sm" />
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

/** Full-console skeleton: KPI strip + queue table, used while the pending/flagged list loads. */
export function AdminReviewsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading reviews">
      <KpiTilesSkeleton />
      <Card className="overflow-hidden rounded-2xl border-border/60">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </Card>
    </div>
  );
}

export default AdminReviewsSkeleton;
