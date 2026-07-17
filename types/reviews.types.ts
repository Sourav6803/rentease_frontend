/**
 * app/(vendor)/vendor/reviews/types.ts
 *
 * UI-facing types for the Vendor Reviews page. Re-exports the API contract
 * types from lib/api/reviews so components can import from a single local
 * path, plus a couple of view-only types used for client-side filtering.
 */

export type {
  RatingDistribution,
  VendorReviewsResponse,
  ReviewProductRef,
  ReviewRentalRef,
} from '@/lib/api/reviews'

export type StarFilter = 'all' | '5' | '4' | '3' | '2' | '1'

export type StatusFilter = 'all' | 'approved' | 'pending' | 'flagged' | 'rejected'

export type ReplyFilter = 'all' | 'needs-reply' | 'replied'

export type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'most-helpful'

export interface ReviewFiltersState {
  search: string
  star: StarFilter
  status: StatusFilter
  reply: ReplyFilter
  sort: SortOption
}

export const DEFAULT_FILTERS: ReviewFiltersState = {
  search: '',
  star: 'all',
  status: 'all',
  reply: 'all',
  sort: 'newest',
}

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

/** Status a single review can be moderated to (superset used by ModerateDialog). */
export type SingleModerationAction = 'approved' | 'rejected' | 'flagged';

/** Status bulk-moderation supports. NOTE: backend does not allow 'flagged' in bulk. */
export type BulkModerationAction = 'approved' | 'rejected';

export interface Person {
  _id: string;
  email?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export interface PopulatedProduct {
  _id: string;
  basicInfo?: { name?: string };
}

export interface PopulatedVendor {
  _id: string;
  business?: { name?: string };
}

export interface PopulatedRental {
  _id: string;
  rentalNumber?: string;
}

export interface ReportedReason {
  user: string;
  reason: string;
  reportedAt: string;
  status?: string;
}

export interface ReviewAttachment {
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

export interface ReviewResponse {
  isVendorResponse: boolean;
  content: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  reviewNumber: string;
  user: Person;
  product: string | PopulatedProduct;
  vendor: string | PopulatedVendor;
  rental?: string | PopulatedRental;
  ratings: {
    overall: number;
    product?: Record<string, number>;
    vendor?: Record<string, number>;
    delivery?: Record<string, number>;
  };
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  attachments?: ReviewAttachment[];
  helpful: { count: number };
  helpfulPercentage?: number;
  reported?: {
    count: number;
    reasons?: ReportedReason[];
  };
  responses?: ReviewResponse[];
  verification?: { isVerifiedPurchase?: boolean };
  moderation: {
    status: ModerationStatus;
    rejectionReason?: string;
    moderationNotes?: string;
    reviewedAt?: string;
  };
  sentiment?: {
    sentiment?: 'positive' | 'neutral' | 'negative';
    score?: number;
  };
  status: 'active' | 'hidden' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ReviewListResult {
  reviews: Review[];
  pagination: Pagination;
}

export interface AnalyticsOverview {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  rejectedReviews: number;
  flaggedReviews: number;
  averageRating: number;
  totalHelpful: number;
  totalReports: number;
}

export const ZERO_OVERVIEW: AnalyticsOverview = {
  totalReviews: 0,
  approvedReviews: 0,
  pendingReviews: 0,
  rejectedReviews: 0,
  flaggedReviews: 0,
  averageRating: 0,
  totalHelpful: 0,
  totalReports: 0,
};

export interface RatingBucket {
  _id: number;
  count: number;
}

export interface SentimentBucket {
  _id: 'positive' | 'neutral' | 'negative' | null;
  count: number;
}

export interface DailyBucket {
  _id: { year: number; month: number; day: number };
  count: number;
  averageRating: number;
}

export interface TopProduct {
  _id: string;
  productName: string;
  count: number;
  averageRating: number;
}

/**
 * Raw analytics payload as returned by the API.
 * IMPORTANT: `overview` is an ARRAY (aggregation `$facet` shape), not an object.
 * Always read `overview[0]`, falling back to ZERO_OVERVIEW when the range has no data.
 */
export interface ReviewAnalyticsRaw {
  overview: AnalyticsOverview[];
  byRating: RatingBucket[];
  bySentiment: SentimentBucket[];
  daily: DailyBucket[];
  topProducts: TopProduct[];
}

export type ModerationTab = 'pending' | 'flagged' | 'analytics';

export const MODERATION_TABS: { value: ModerationTab; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'analytics', label: 'Analytics' },
];

/** Narrow a possibly-populated product/vendor field down to a display name. */
export function productName(product: Review['product'], fallback = 'Unknown product'): string {
  if (typeof product === 'object' && product !== null) {
    return product.basicInfo?.name || fallback;
  }
  return fallback;
}

export function vendorName(vendor: Review['vendor'], fallback = 'Unknown vendor'): string {
  if (typeof vendor === 'object' && vendor !== null) {
    return vendor.business?.name || fallback;
  }
  return fallback;
}

export function productId(product: Review['product']): string {
  return typeof product === 'object' && product !== null ? product._id : product;
}
