'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModerationQueue } from './ModerationQueue';
import { ReviewAnalyticsPanel } from './ReviewAnalyticsPanel';
import { ReviewDetailDrawer } from './ReviewDetailDrawer';
import { MODERATION_TABS, type ModerationTab, type Review } from '@/types/reviews.types';

function parseTab(value: string | null): ModerationTab {
  return value === 'flagged' || value === 'analytics' ? value : 'pending';
}

function parsePage(value: string | null): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

/**
 * Top-level tab switcher for the moderation console. Active tab + page are
 * persisted in the URL query string (?tab=pending&page=1) so refresh/back/
 * forward navigation restores the moderator's place in the queue.
 */
export function ReviewModerationTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [detailReviewId, setDetailReviewId] = useState<string | null>(null);

  const tab = parseTab(searchParams.get('tab'));
  const page = parsePage(searchParams.get('page'));

  const updateUrl = useCallback(
    (next: { tab?: ModerationTab; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.tab) {
        params.set('tab', next.tab);
        params.set('page', '1');
      }
      if (next.page) {
        params.set('page', String(next.page));
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  function handleOpenDetail(review: Review) {
    setDetailReviewId(review._id);
  }

  return (
    <>
      <Tabs value={tab} onValueChange={(v) => updateUrl({ tab: v as ModerationTab })}>
        <TabsList className="rounded-xl">
          {MODERATION_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="rounded-lg">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <ModerationQueue tab="pending" page={tab === 'pending' ? page : 1} onPageChange={(p) => updateUrl({ page: p })} onOpenDetail={handleOpenDetail} />
        </TabsContent>

        <TabsContent value="flagged" className="mt-4">
          <ModerationQueue tab="flagged" page={tab === 'flagged' ? page : 1} onPageChange={(p) => updateUrl({ page: p })} onOpenDetail={handleOpenDetail} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <ReviewAnalyticsPanel />
        </TabsContent>
      </Tabs>

      <ReviewDetailDrawer reviewId={detailReviewId} onClose={() => setDetailReviewId(null)} />
    </>
  );
}

export default ReviewModerationTabs;
