'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { adminReviewsApi } from '@/lib/api/adminReviews';
import { AdminReviewsSkeleton } from './AdminReviewsSkeleton';
import { AdminReviewsEmptyState } from './AdminReviewsEmptyState';
import { ModerationRow } from './ModerationRow';
import { ModerateDialog } from './ModerateDialog';
import { BulkModerateBar } from './BulkModerateBar';
import type { ModerationTab, Review, SingleModerationAction } from '@/types/reviews.types';

const LIMIT = 20;

interface ModerationQueueProps {
  tab: Extract<ModerationTab, 'pending' | 'flagged'>;
  page: number;
  onPageChange: (page: number) => void;
  onOpenDetail: (review: Review) => void;
}

export function ModerationQueue({ tab, page, onPageChange, onOpenDetail }: ModerationQueueProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quickModerate, setQuickModerate] = useState<{ review: Review; action: SingleModerationAction } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['admin-reviews', tab, page, LIMIT],
    queryFn: () =>
      tab === 'pending'
        ? adminReviewsApi.listPending({ page, limit: LIMIT })
        : adminReviewsApi.listFlagged({ page, limit: LIMIT }),
    placeholderData: (prev) => prev,
  });

  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;

  const allSelectedOnPage = useMemo(
    () => reviews.length > 0 && reviews.every((r) => selectedIds.includes(r._id)),
    [reviews, selectedIds]
  );

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !reviews.some((r) => r._id === id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...reviews.map((r) => r._id)])));
    }
  }

  function handleQuickModerate(review: Review, action: SingleModerationAction) {
    setQuickModerate({ review, action });
  }

  if (isLoading) {
    return <AdminReviewsSkeleton />;
  }

  if (isError) {
    return (
      <AdminReviewsEmptyState
        kind="error"
        onRetry={() => {
          refetch();
          toast.error('Retrying…');
        }}
      />
    );
  }

  if (reviews.length === 0) {
    return <AdminReviewsEmptyState kind={tab === 'pending' ? 'pending-clear' : 'flagged-clear'} />;
  }

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden rounded-2xl border-border/60">
        <div className="flex items-center gap-3 border-b border-border/60 bg-muted/30 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Checkbox
            checked={allSelectedOnPage}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all reviews on this page"
          />
          <span>Reviewer &amp; content</span>
          <span className="ml-auto">{isFetching ? 'Refreshing…' : `${pagination?.total ?? reviews.length} total`}</span>
        </div>
        <div role="table" aria-label={`${tab === 'pending' ? 'Pending' : 'Flagged'} reviews`}>
          <AnimatePresence initial={false}>
            {reviews.map((review) => (
              <ModerationRow
                key={review._id}
                review={review}
                tab={tab}
                selected={selectedIds.includes(review._id)}
                onToggleSelected={toggleSelected}
                onOpenDetail={onOpenDetail}
                onQuickModerate={handleQuickModerate}
              />
            ))}
          </AnimatePresence>
        </div>
      </Card>

      {pagination && pagination.pages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && onPageChange(page - 1)}
                className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pagination.pages)
              .map((p, idx, arr) => (
                <PaginationItem key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 ? (
                    <span className="px-2 text-muted-foreground">…</span>
                  ) : null}
                  <PaginationLink isActive={p === page} onClick={() => onPageChange(p)} className="cursor-pointer">
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => page < pagination.pages && onPageChange(page + 1)}
                className={page >= pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <BulkModerateBar
        selectedIds={selectedIds}
        onCleared={() => {
          setSelectedIds([]);
          queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
        }}
      />

      <ModerateDialog
        review={quickModerate?.review ?? null}
        defaultAction={quickModerate?.action ?? 'approved'}
        open={quickModerate !== null}
        onOpenChange={(open) => !open && setQuickModerate(null)}
      />
    </div>
  );
}

export default ModerationQueue;
