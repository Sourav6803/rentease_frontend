/**
 * lib/api/reviews.ts
 *
 * Typed API client for the Vendor Reviews feature.
 * Mirrors the conventions established in `lib/api/support.ts`:
 *  - single axios instance with a session-aware auth interceptor
 *  - every response is unwrapped from the shared `ApiEnvelope<T>` shape
 *  - a `clean()` helper strips empty query params before they hit axios
 *
 * Backend contract notes (see task spec for full detail):
 *  - GET /vendor/reviews only supports `page` / `limit` server-side. Rating,
 *    status, reply-state, search and sort are all applied client-side over
 *    the currently-fetched page (see ReviewFilters / page.tsx).
 *  - GET /vendor/reviews returns reviews of ALL moderation statuses
 *    (pending/approved/rejected/flagged) — the UI must show a status badge
 *    rather than assuming everything is live.
 *  - `responses.user` is NOT populated on GET /vendor/reviews (raw ObjectId).
 *    Since only the current vendor can author `isVendorResponse` replies on
 *    their own reviews, we render the reply author from the vendor's own
 *    session identity instead of trying to resolve the ObjectId.
 *  - POST /vendor/reviews/:id/reply does not block duplicate replies on the
 *    backend, so the UI must derive `hasVendorReply` and hide/disable the
 *    reply composer once a vendor response already exists.
 */

import axios, { type InternalAxiosRequestConfig } from 'axios'
import { getSession } from 'next-auth/react'

// ---------------------------------------------------------------------------
// Envelope + shared types
// ---------------------------------------------------------------------------

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  timestamp?: string
  data?: T
}

export interface Person {
  _id: string
  email?: string
  role?: string
  profile?: {
    firstName?: string
    lastName?: string
    avatar?: string
  }
}

export interface ReviewResponse {
  _id: string
  user: string | Person
  content: string
  isVendorResponse: boolean
  createdAt: string
  updatedAt?: string
  helpful: unknown[]
}

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged'

export interface ReviewProductRef {
  _id: string
  basicInfo?: { name?: string; slug?: string }
  media?: { images?: string[] }
}

export interface ReviewRentalRef {
  _id: string
  rentalNumber?: string
}

export interface Review {
  _id: string
  reviewNumber: string
  rental: string | ReviewRentalRef
  user: Person
  product: string | ReviewProductRef
  vendor: string
  ratings: {
    overall: number
    product?: {
      quality?: number
      condition?: number
      valueForMoney?: number
      matchesDescription?: number
    }
    vendor?: {
      communication?: number
      deliveryTimeliness?: number
      professionalism?: number
      support?: number
    }
    delivery?: {
      timeliness?: number
      packaging?: number
      handling?: number
    }
  }
  title: string
  content: string
  pros?: string[]
  cons?: string[]
  tips?: string
  attachments?: { type: 'image' | 'video'; url: string; caption?: string; isVerified?: boolean }[]
  helpful: { count: number; users?: unknown[] }
  reported?: { count: number }
  responses: ReviewResponse[]
  verification?: { isVerifiedPurchase?: boolean }
  moderation: { status: ModerationStatus; rejectionReason?: string }
  sentiment?: { score?: number; sentiment?: 'positive' | 'neutral' | 'negative'; keywords?: string[] }
  status: 'active' | 'hidden' | 'deleted'
  createdAt: string
  updatedAt: string
  helpfulPercentage?: number
  timeSincePosted?: string
}

export interface RatingDistribution {
  '1': number
  '2': number
  '3': number
  '4': number
  '5': number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface VendorReviewsResponse {
  reviews: Review[]
  distribution: RatingDistribution
  pagination: Pagination
}

export interface ReplyResponsePayload {
  response: ReviewResponse
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
  timeout: 20000,
})

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = await getSession()
  const token = (session?.user as { accessToken?: string } | undefined)?.accessToken
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strips undefined/null/'' values from a params object before sending. */
function clean<T extends Record<string, unknown>>(params: T): Partial<T> {
  const out: Partial<T> = {}
  for (const key in params) {
    const value = params[key]
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value
    }
  }
  return out
}

/**
 * Composes a display name for a Person-like ref.
 * Priority: profile.firstName + lastName -> email -> fallback.
 */
export function personName(p: Person | string | null | undefined, fallback = 'RentEase user'): string {
  if (!p || typeof p === 'string') return fallback
  const first = p.profile?.firstName?.trim()
  const last = p.profile?.lastName?.trim()
  const full = [first, last].filter(Boolean).join(' ').trim()
  if (full) return full
  if (p.email) return p.email
  return fallback
}

const EMPTY_DISTRIBUTION: RatingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }

// ---------------------------------------------------------------------------
// API surface
// ---------------------------------------------------------------------------

export const reviewsApi = {
  /**
   * Fetches a page of the current vendor's reviews.
   * Server only understands `page`/`limit` — everything else is client-side.
   */
  async listVendorReviews(params: { page?: number; limit?: number }): Promise<VendorReviewsResponse> {
    const res = await api.get<ApiEnvelope<VendorReviewsResponse>>('/api/v1/vendor/reviews', {
      params: clean({ page: params.page ?? 1, limit: params.limit ?? 10 }),
    })
    return (
      res.data.data ?? {
        reviews: [],
        distribution: EMPTY_DISTRIBUTION,
        pagination: { page: 1, limit: params.limit ?? 10, total: 0, pages: 0 },
      }
    )
  },

  /**
   * Posts the vendor's reply to a review.
   * Note: backend does not guard against duplicate replies — callers must
   * check `hasVendorReply` before invoking this.
   */
  async replyToReview(reviewId: string, reply: string): Promise<ReplyResponsePayload> {
    const res = await api.post<ApiEnvelope<ReplyResponsePayload>>(
      `/api/v1/vendor/reviews/${reviewId}/reply`,
      { reply }
    )
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to submit reply')
    }
    return res.data.data
  },
}

export default reviewsApi
