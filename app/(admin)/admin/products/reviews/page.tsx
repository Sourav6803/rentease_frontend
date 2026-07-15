'use client';

/**
 * /admin/reviews — Product Reviews moderation console.
 *
 * Assumptions & notes for reviewers:
 *  - `GET /admin/analytics` returns `overview` as an ARRAY (aggregation $facet
 *    shape), not a single object. Every read goes through `overview[0] ??
 *    ZERO_OVERVIEW` (see app/(admin)/admin/reviews/types.ts) so an empty date
 *    range never throws on missing fields.
 *  - Bulk moderation (`POST /admin/bulk/moderate`) only accepts
 *    status: 'approved' | 'rejected'. 'flagged' is a single-review-only
 *    outcome and is intentionally not offered in BulkModerateBar.
 *  - KNOWN BACKEND RISK: /admin/:id/moderate, /admin/bulk/moderate, and
 *    /admin/analytics can currently respond with HTTP 500 because `req.admin`
 *    is undefined server-side (see lib/api/adminReviews.ts header comment).
 *    All three mutation paths in this console surface a dedicated toast for
 *    500s and never optimistically mutate local state before the request
 *    resolves. TODO(backend): fix admin-auth middleware population for the
 *    reviews router.
 *  - Active tab and page are persisted via the URL (`?tab=pending&page=1`).
 */

import { Suspense } from 'react';
import { ReviewModerationTabs } from '@/components/admin/reviews/ReviewModerationTabs';
import { AdminReviewsSkeleton } from '@/components/admin/reviews/AdminReviewsSkeleton';

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Product reviews</h1>
        <p className="text-sm text-muted-foreground">
          Triage the pending queue, resolve reported reviews, and moderate in bulk.
        </p>
      </div>

      <Suspense fallback={<AdminReviewsSkeleton />}>
        <ReviewModerationTabs />
      </Suspense>
    </div>
  );
}
