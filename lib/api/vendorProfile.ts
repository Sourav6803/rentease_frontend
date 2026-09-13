/**
 * frontend/lib/api/vendorProfile.ts
 *
 * Single source of truth for the vendor's own profile document.
 *
 * Every consumer (vendor layout, sidebar, header, settings pages, profile page)
 * resolves it through `vendorProfileQueryOptions`, so they all share ONE React
 * Query cache entry and dedupe into one in-flight request instead of each
 * firing their own GET /vendor/profile/me.
 *
 * Error contract (deliberately mirrors the old hand-written call sites):
 *   - HTTP / network failure  -> the queryFn THROWS (axios semantics), so
 *     callers that used to `try/catch` still receive the rejection and can
 *     toast. Callers that used to swallow it can `.catch(() => null)`.
 *   - 200 with `success: false` -> resolves to `null` (no throw), matching the
 *     old `if (response.data.success)` guards.
 */

import apiClient from '@/lib/api/client'
import { vendorQueryKeys } from '@/lib/api/queryKeys'

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export interface VendorStats {
  totalRevenue?: number
  totalRentals?: number
  completedRentals?: number
  cancelledRentals?: number
  averageRating?: number
  reviewCount?: number
  totalProducts?: number
  products?: { total?: number }
}

/**
 * Unrestricted JSON value for the page-specific profile slices below.
 *
 * Those fragments reach the UI through local component state and
 * react-hook-form defaults, and each settings page only reads the handful of
 * keys it owns. Modelling them precisely would force a cast at every call site
 * (e.g. `bankDetails.accountType` is a zod enum in the form but an arbitrary
 * string in the document), so they keep exactly the untyped shape they had when
 * every page called axios on its own.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = any

/**
 * The profile document as returned by GET /vendor/profile/me.
 *
 * The strongly-typed members below are the ones the sidebar, header and vendor
 * layout rely on. The remaining slices are page-specific (each settings page
 * only ever touches its own fragment) and were previously read straight off an
 * untyped `axios` response — they deliberately stay loosely typed so migrating
 * a call site to the shared cache cannot introduce a type error, and so no page
 * needs a cast that would have to be maintained separately.
 */
export interface VendorProfile {
  // ── Typed slices (sidebar / header / layout) ──────────────────────────────
  stats?: VendorStats
  products?: { total?: number }
  business?: {
    name?: string
    description?: string
    website?: string
    logo?: { url?: string; publicId?: string }
    bannerImage?: { url?: string; publicId?: string }
  }
  vendorId?: string
  verification?: { status?: string }
  subscription?: { plan?: string; limits?: { maxProducts?: number } }
  performance?: { rating?: { average?: number; count?: number } }

  // ── Loose slices (page-specific, previously untyped) ─────────────────────
  /** `user.profile.*` — name, avatar, etc. */
  user?: JsonValue
  /** `contact.*` — secondaryPhone, supportEmail, supportPhone */
  contact?: JsonValue
  /** `addresses.*` — serviceableCities, serviceablePincodes */
  addresses?: JsonValue
  /** `bankDetails.*` — payout account fields */
  bankDetails?: JsonValue
  /** `settings.*` — businessHours, notificationPreferences */
  settings?: JsonValue
}

/** Shared freshness window; matches the app-wide QueryProvider default. */
export const VENDOR_PROFILE_STALE_TIME = 60 * 1000

export async function fetchVendorProfile(): Promise<VendorProfile | null> {
  const res = await apiClient.get<ApiResponse<{ profile: VendorProfile }>>('/vendor/profile/me')
  if (!res.data?.success) return null
  return res.data.data?.profile ?? null
}

/**
 * Drop-in query options. Share this object (or at least `queryKey`) with every
 * caller so the cache stays coherent.
 *
 * `retry: 0` keeps the previous single-attempt behaviour — this refactor removes
 * duplicate requests, it does not add new ones.
 */
export const vendorProfileQueryOptions = {
  queryKey: vendorQueryKeys.profile,
  queryFn: fetchVendorProfile,
  staleTime: VENDOR_PROFILE_STALE_TIME,
  retry: 0,
} as const
