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

export interface TrackEventResponse {
  success: boolean
  message: string
  data?: {
    event: BehaviorEvent
  }
}

export interface WishlistResponse {
  success: boolean
  message: string
  data?: {
    items: WishlistItem[]
  }
}

export interface DeviceInfo {
  device: string
  browser: string
  os: string
}
