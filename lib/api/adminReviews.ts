/**
 * lib/api/adminReviews.ts
 * -----------------------------------------------------------------------------
 * Admin "Product Reviews" moderation API client.
 * Mirrors the shape/conventions of lib/api/support.ts:
 *   - single axios instance, Bearer token injected from the NextAuth session
 *   - all endpoints return an ApiEnvelope<T>; callers unwrap `res.data.data`
 *   - `clean()` strips empty/undefined query params before they're sent
 *
 * KNOWN BACKEND RISK (see task doc §5): the moderate / bulk-moderate / analytics
 * endpoints can currently respond with HTTP 500 because `req.admin` is undefined
 * server-side on some deployments. Callers must NOT assume success optimistically
 * for these three endpoints — always wait for the mutation to resolve before
 * mutating local/query state. TODO(backend): fix `req.admin` population in the
 * admin auth middleware for the reviews router.
 * -----------------------------------------------------------------------------
 */

import axios, { type AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';
import type {
  ModerationStatus,
  Review,
  ReviewAnalyticsRaw,
  ReviewListResult,
} from '@/types/reviews.types';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  timestamp?: string;
  data?: T;
}

/** Strip undefined/null/'' values so we never send noisy empty query params. */
export function clean<T extends Record<string, unknown>>(params: T): Partial<T> {
  const out: Partial<T> = {};
  (Object.keys(params) as (keyof T)[]).forEach((key) => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value;
    }
  });
  return out;
}

/** Build a display name for a person, falling back gracefully when unpopulated. */
export function personName(p?: { email?: string; profile?: { firstName?: string; lastName?: string } } | null, fallback = 'Unknown user'): string {
  if (!p) return fallback;
  const first = p.profile?.firstName?.trim();
  const last = p.profile?.lastName?.trim();
  const full = [first, last].filter(Boolean).join(' ').trim();
  return full || p.email || fallback;
}

const adminReviewsClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
  timeout: 20000,
});

adminReviewsClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  const token = session?.user?.accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ListParams {
  page?: number;
  limit?: number;
}

export interface ModeratePayload {
  status: ModerationStatus extends infer S ? Extract<S, 'approved' | 'rejected' | 'flagged'> : never;
  /** Required, 5–500 chars, iff status === 'rejected'. */
  reason?: string;
  /** Optional, <=500 chars. */
  notes?: string;
}

export interface BulkModeratePayload {
  reviewIds: string[];
  /** Bulk only supports approved/rejected — 'flagged' is intentionally excluded. */
  status: 'approved' | 'rejected';
  reason?: string;
}

export interface BulkModerateResult {
  successful: string[];
  failed: { id: string; reason: string }[];
}

export interface AnalyticsParams {
  /** YYYY-MM-DD, required */
  startDate: string;
  /** YYYY-MM-DD, required */
  endDate: string;
}

const EMPTY_LIST: ReviewListResult = {
  reviews: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
};

const EMPTY_ANALYTICS: ReviewAnalyticsRaw = {
  overview: [],
  byRating: [],
  bySentiment: [],
  daily: [],
  topProducts: [],
};

export const adminReviewsApi = {
  /** Oldest-first pending queue. */
  async listPending({ page = 1, limit = 20 }: ListParams = {}): Promise<ReviewListResult> {
    const res = await adminReviewsClient.get<ApiEnvelope<ReviewListResult>>(
      '/api/v1/reviews/admin/pending',
      { params: clean({ page, limit }) }
    );
    return res.data.data ?? EMPTY_LIST;
  },

  /** Flagged/reported reviews, sorted by report count desc server-side. */
  async listFlagged({ page = 1, limit = 20 }: ListParams = {}): Promise<ReviewListResult> {
    const res = await adminReviewsClient.get<ApiEnvelope<ReviewListResult>>(
      '/api/v1/reviews/admin/flagged',
      { params: clean({ page, limit }) }
    );
    return res.data.data ?? EMPTY_LIST;
  },

  /** Moderate a single review. `reason` is required (5-500 chars) iff status === 'rejected'. */
  async moderate(id: string, payload: ModeratePayload): Promise<{ review: Review }> {
    const res = await adminReviewsClient.post<ApiEnvelope<{ review: Review }>>(
      `/api/v1/reviews/admin/${id}/moderate`,
      payload
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Moderation failed — no data returned');
    }
    return res.data.data;
  },

  /** Bulk moderate. Only 'approved' | 'rejected' are valid — never send 'flagged' here. */
  async bulkModerate(payload: BulkModeratePayload): Promise<BulkModerateResult> {
    const res = await adminReviewsClient.post<ApiEnvelope<BulkModerateResult>>(
      '/api/v1/reviews/admin/bulk/moderate',
      payload
    );
    return res.data.data ?? { successful: [], failed: [] };
  },

  /** Both startDate and endDate are required by the backend (400 otherwise). */
  async getAnalytics({ startDate, endDate }: AnalyticsParams): Promise<ReviewAnalyticsRaw> {
    const res = await adminReviewsClient.get<ApiEnvelope<ReviewAnalyticsRaw>>(
      '/api/v1/reviews/admin/analytics',
      { params: clean({ startDate, endDate }) }
    );
    return res.data.data ?? EMPTY_ANALYTICS;
  },

  /** Fully populated single review, used by the detail drawer. */
  async getReview(id: string): Promise<Review> {
    const res = await adminReviewsClient.get<ApiEnvelope<{ review: Review }>>(
      `/api/v1/reviews/${id}`
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Review not found');
    }
    return res.data.data.review;
  },
};

export default adminReviewsApi;
