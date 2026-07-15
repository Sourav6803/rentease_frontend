/**
 * lib/api/coupons.ts
 *
 * Customer-facing coupon/discount client. Mirrors the conventions in
 * `lib/api/reviews.ts` / `lib/api/support.ts`:
 *  - single axios instance with a session-aware auth interceptor
 *  - responses unwrapped from the shared `{ success, message, data }` envelope
 *
 * Backend contract (unified `Discount` system):
 *  - POST /cart/apply-coupon   { couponCode }        -> { cart }
 *  - POST /cart/remove-coupon                         -> { cart }
 *  - POST /discounts/validate/:code { amount, ... }   -> { valid, discountAmount, ... }
 *  - GET  /discounts/public   ?productId&categoryId   -> { discounts }
 */

import axios, { type InternalAxiosRequestConfig } from 'axios'
import { getSession } from 'next-auth/react'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data?: T
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface PublicCoupon {
  code: string
  name: string
  description?: string
  type: string
  value?: number
  maxDiscountAmount?: number
  minOrderValue?: number
  endDate?: string
}

export interface CartCouponSummary {
  itemsCount?: number
  totalQuantity?: number
  subtotal?: number
  discountAmount?: number
  securityDepositTotal?: number
  deliveryChargesTotal?: number
  grandTotal?: number
}

export interface CartCoupon {
  code: string
  type: string
  value?: number
  maxDiscount?: number
  discountAmount?: number
  isValid?: boolean
}

export interface CartWithCoupon {
  _id: string
  summary: CartCouponSummary
  coupon?: CartCoupon | null
  [key: string]: unknown
}

export interface CouponValidationResult {
  valid: boolean
  reason?: string
  discountAmount?: number
  finalAmount?: number
  discount?: { code: string; name: string; type: string; value?: number }
}

/* -------------------------------------------------------------------------- */
/* Axios instance                                                             */
/* -------------------------------------------------------------------------- */

const client = axios.create({ baseURL: BASE_URL, withCredentials: true, timeout: 30000 })

client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = await getSession()
  const token = (session?.user as { accessToken?: string } | undefined)?.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

function clean(params: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Record<string, string>
}

async function unwrap<T>(p: Promise<{ data: ApiEnvelope<T> }>, fallback?: T): Promise<T> {
  const res = await p
  if (res.data.data !== undefined) return res.data.data
  if (fallback !== undefined) return fallback
  throw new Error(res.data.message || 'Empty response')
}

/* -------------------------------------------------------------------------- */
/* API                                                                        */
/* -------------------------------------------------------------------------- */

/** Apply a coupon to the current user's cart. Throws with the server message on failure. */
export async function applyCartCoupon(couponCode: string): Promise<CartWithCoupon> {
  const data = await unwrap<{ cart: CartWithCoupon }>(
    client.post(`/api/v1/cart/apply-coupon`, { couponCode }),
  )
  return data.cart
}

/** Remove the coupon from the current user's cart. */
export async function removeCartCoupon(): Promise<CartWithCoupon> {
  const data = await unwrap<{ cart: CartWithCoupon }>(client.post(`/api/v1/cart/remove-coupon`))
  return data.cart
}

/** Validate a code against an order without applying it (e.g. quick check). */
export async function validateCoupon(
  code: string,
  payload: { amount: number; productIds?: string[]; rentalMonths?: number; vendorId?: string },
): Promise<CouponValidationResult> {
  return unwrap<CouponValidationResult>(
    client.post(`/api/v1/discounts/validate/${encodeURIComponent(code)}`, payload),
  )
}

/** Publicly displayable coupons for a product/category (storefront). */
export async function getPublicCoupons(params?: {
  productId?: string
  categoryId?: string
}): Promise<PublicCoupon[]> {
  const data = await unwrap<{ discounts: PublicCoupon[] }>(
    client.get(`/api/v1/discounts/public`, {
      params: params ? clean(params as Record<string, unknown>) : undefined,
    }),
    { discounts: [] },
  )
  return data.discounts ?? []
}

export const couponsApi = {
  applyCartCoupon,
  removeCartCoupon,
  validateCoupon,
  getPublicCoupons,
}

export default couponsApi
