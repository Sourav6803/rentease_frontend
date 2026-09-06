/**
 * lib/api/behavior.ts
 *
 * Customer-facing behavior tracking + wishlist client.
 * Mirrors the conventions in `lib/api/reviews.ts` / `lib/api/coupons.ts`:
 *  - axios instance with session-aware auth interceptor
 *  - responses unwrapped from the shared `{ success, message, data }` envelope
 *
 * Backend contract:
 *  - POST /behavior/events       { eventType, productId?, categoryId?, sessionId?, metadata? }
 *  - GET  /behavior/wishlist     -> { items }
 *  - POST /behavior/wishlist     { productId }                      -> { item }
 *  - DELETE /behavior/wishlist/:productId                          -> 200
 */

import axios from 'axios'
import { getSession } from 'next-auth/react'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data?: T
}

const behaviorClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
  timeout: 20000,
})

behaviorClient.interceptors.request.use(async (config) => {
  const session = await getSession()
  const token = (session?.user as { accessToken?: string })?.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let _manualToken = ''
export function setBehaviorToken(token: string) {
  _manualToken = token
}

behaviorClient.interceptors.request.use((config) => {
  if (_manualToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${_manualToken}`
  }
  return config
})

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>, fallback: T): Promise<T> {
  try {
    const { data } = await promise
    return (data.data as T) ?? fallback
  } catch {
    return fallback
  }
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type BehaviorEventType =
  | 'product_view'
  | 'product_scroll'
  | 'product_compare'
  | 'product_zoom'
  | 'search'
  | 'category_browse'
  | 'add_to_wishlist'
  | 'remove_from_wishlist'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_started'
  | 'checkout_completed'
  | 'rental_cancelled'
  | 'rental_extended'
  | 'review_submitted'
  | 'brochure_download'
  | 'availability_check'
  | 'page_view'

export interface BehaviorMetadata {
  query?: string
  scrollDepth?: number
  timeSpentSeconds?: number
  device?: string
  browser?: string
  location?: {
    city?: string
    state?: string
    country?: string
  }
  trafficSource?: string
  referrer?: string
  pageUrl?: string
  cartValue?: number
  rentalId?: string
}

export interface TrackEventPayload {
  eventType: BehaviorEventType
  productId?: string
  categoryId?: string
  sessionId?: string
  metadata?: BehaviorMetadata
}

export interface BehaviorEvent {
  _id: string
  user?: string
  sessionId: string
  eventType: BehaviorEventType
  product?: string
  category?: string
  metadata: BehaviorMetadata
  createdAt: string
  updatedAt: string
}

export interface WishlistItem {
  _id: string
  user: string
  product: {
    _id: string
    basicInfo: {
      name: string
      slug: string
    }
    pricing: {
      monthlyRent: number
    }
    seo?: {
      slug: string
    }
    ratings?: {
      average: number
    }
    images?: Array<{
      url: string
    }>
  }
  source?: string
  addedAt: string
}

/* -------------------------------------------------------------------------- */
/*  API functions                                                             */
/* -------------------------------------------------------------------------- */

export async function trackEvent(payload: TrackEventPayload): Promise<BehaviorEvent | null> {
  return unwrap(
    behaviorClient.post('/behavior/events', payload),
    null,
  )
}

export async function getWishlist(): Promise<WishlistItem[]> {
  return unwrap(
    behaviorClient.get('/behavior/wishlist'),
    [],
  )
}

export async function addToWishlist(productId: string): Promise<WishlistItem | null> {
  return unwrap(
    behaviorClient.post('/behavior/wishlist', { productId }),
    null,
  )
}

export async function removeFromWishlist(productId: string): Promise<boolean> {
  try {
    await behaviorClient.delete(`/behavior/wishlist/${productId}`)
    return true
  } catch {
    return false
  }
}
