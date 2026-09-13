/**
 * frontend/lib/api/vendorCustomers.ts
 *
 * Vendor customer directory client.
 *
 * New endpoints (added with this page — no vendor-facing customer API existed
 * before; the only prior options were the admin-only
 * /admin-intelligence/crm/customers and the analytics-only
 * GET /vendor/analytics/customers):
 *
 *   GET /vendor/customers?page&limit&search&segment&sort
 *        -> data: { customers, pagination, stats, segments }
 *   GET /vendor/customers/:customerId
 *        -> data: { customer, rentals }
 *
 * There is no Customer collection. A vendor's customers are the distinct
 * Rental.user values for that vendor, so a customer who has never rented from
 * this vendor returns 404 rather than a profile.
 */
import apiClient from '@/lib/api/client'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data?: T
}

// ── Segments ──────────────────────────────────────────────────────────────────

export const CUSTOMER_SEGMENTS = [
  'all',
  'vip',
  'frequent',
  'regular',
  'new',
  'inactive',
] as const

export type CustomerSegment = (typeof CUSTOMER_SEGMENTS)[number]

export interface SegmentMeta {
  label: string
  description: string
  /** Tailwind classes for the chip when selected. */
  activeTone: string
  /** Tailwind classes for the count pill. */
  countTone: string
}

export const SEGMENT_META: Record<CustomerSegment, SegmentMeta> = {
  all: {
    label: 'All',
    description: 'Everyone who has ever rented from you',
    activeTone: 'border-[#2874f0] bg-[#2874f0] text-white',
    countTone: 'bg-white/20 text-white',
  },
  vip: {
    label: 'VIP',
    description: 'Spent ₹50,000 or more with you',
    activeTone: 'border-amber-400 bg-amber-500 text-white',
    countTone: 'bg-white/20 text-white',
  },
  frequent: {
    label: 'Frequent',
    description: '3 or more rentals',
    activeTone: 'border-emerald-500 bg-emerald-600 text-white',
    countTone: 'bg-white/20 text-white',
  },
  regular: {
    label: 'Regular',
    description: '2 rentals',
    activeTone: 'border-sky-500 bg-sky-600 text-white',
    countTone: 'bg-white/20 text-white',
  },
  new: {
    label: 'New',
    description: 'Their first rental with you',
    activeTone: 'border-violet-500 bg-violet-600 text-white',
    countTone: 'bg-white/20 text-white',
  },
  inactive: {
    label: 'Inactive',
    description: 'No rental in the last 90 days',
    activeTone: 'border-slate-400 bg-slate-600 text-white',
    countTone: 'bg-white/20 text-white',
  },
}

export const CUSTOMER_SORT_OPTIONS = [
  { value: 'totalSpent', label: 'Highest spend' },
  { value: 'totalRentals', label: 'Most rentals' },
  { value: 'lastRentalAt', label: 'Most recent rental' },
  { value: 'firstRentalAt', label: 'Newest customer' },
  { value: 'name', label: 'Name (A–Z)' },
] as const

export type CustomerSort = (typeof CUSTOMER_SORT_OPTIONS)[number]['value']

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VendorCustomer {
  customerId: string
  firstName?: string | null
  lastName?: string | null
  fullName?: string
  email?: string | null
  phone?: string | null
  avatar?: string | null
  /** When the User account was created. */
  customerSince?: string | null
  /** User.status is an object in this schema, not a string. */
  accountStatus?: { isActive?: boolean; isBlocked?: boolean } | null
  totalRentals: number
  totalSpent: number
  completedRentals: number
  cancelledRentals: number
  activeRentals: number
  firstRentalAt?: string | null
  lastRentalAt?: string | null
  lastRentalNumber?: string | null
  lastRentalStatus?: string | null
  lastRentalId?: string | null
  uniqueProducts: number
  avgOrderValue: number
  segment: CustomerSegment
}

export interface VendorCustomerStats {
  totalCustomers: number
  totalRevenue: number
  avgSpendPerCustomer: number
  avgRentalsPerCustomer: number
  returningCustomers: number
  oneTimeCustomers: number
  activeCustomers: number
  newThisMonth: number
  activeLast30Days: number
  vipCount: number
  repeatRate: number
}

export type SegmentCounts = Record<CustomerSegment, number>

export interface VendorCustomersResponse {
  customers: VendorCustomer[]
  pagination: { page: number; limit: number; total: number; pages: number }
  stats: VendorCustomerStats
  segments: SegmentCounts
}

export interface VendorCustomerRental {
  _id: string
  rentalNumber?: string
  status?: string
  createdAt?: string
  rentalDetails?: {
    startDate?: string
    endDate?: string
    tenureMonths?: number
    monthlyRent?: number
    totalAmount?: number
  }
  payment?: {
    status?: string
    paidAmount?: number
    dueAmount?: number
  }
  product?: {
    basicInfo?: { name?: string; images?: string[] }
    pricing?: { monthlyRent?: number }
  } | null
}

export interface VendorCustomerDetailResponse {
  customer: VendorCustomer
  rentals: VendorCustomerRental[]
}

export interface VendorCustomerQuery {
  page?: number
  limit?: number
  search?: string
  segment?: CustomerSegment
  sort?: CustomerSort
}

// ── Normalisation ─────────────────────────────────────────────────────────────

const EMPTY_STATS: VendorCustomerStats = {
  totalCustomers: 0,
  totalRevenue: 0,
  avgSpendPerCustomer: 0,
  avgRentalsPerCustomer: 0,
  returningCustomers: 0,
  oneTimeCustomers: 0,
  activeCustomers: 0,
  newThisMonth: 0,
  activeLast30Days: 0,
  vipCount: 0,
  repeatRate: 0,
}

const EMPTY_SEGMENTS: SegmentCounts = {
  all: 0,
  vip: 0,
  frequent: 0,
  regular: 0,
  new: 0,
  inactive: 0,
}

function toCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

/** The API can legitimately return a partial payload, so fill every field. */
function normalizeStats(raw: unknown): VendorCustomerStats {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_STATS }
  const source = raw as Record<string, unknown>
  return Object.keys(EMPTY_STATS).reduce((acc, key) => {
    acc[key as keyof VendorCustomerStats] = toCount(source[key])
    return acc
  }, { ...EMPTY_STATS })
}

function normalizeSegments(raw: unknown): SegmentCounts {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_SEGMENTS }
  const source = raw as Record<string, unknown>
  return CUSTOMER_SEGMENTS.reduce((acc, key) => {
    acc[key] = toCount(source[key])
    return acc
  }, { ...EMPTY_SEGMENTS })
}

function normalizeAccountStatus(raw: unknown): { isActive?: boolean; isBlocked?: boolean } | null {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Record<string, unknown>
  return {
    isActive: typeof source.isActive === 'boolean' ? source.isActive : undefined,
    isBlocked: typeof source.isBlocked === 'boolean' ? source.isBlocked : undefined,
  }
}

function normalizeCustomer(raw: unknown): VendorCustomer | null {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Record<string, unknown>
  const id = source.customerId
  if (typeof id !== 'string' || !id) return null

  const asNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)
  const asString = (value: unknown) => (typeof value === 'string' ? value : null)
  const segment = source.segment
  const safeSegment = CUSTOMER_SEGMENTS.includes(segment as CustomerSegment)
    ? (segment as CustomerSegment)
    : 'regular'

  return {
    customerId: id,
    firstName: asString(source.firstName),
    lastName: asString(source.lastName),
    fullName: asString(source.fullName) ?? undefined,
    email: asString(source.email),
    phone: asString(source.phone),
    avatar: asString(source.avatar),
    customerSince: asString(source.customerSince),
    accountStatus: normalizeAccountStatus(source.accountStatus),
    totalRentals: asNumber(source.totalRentals),
    totalSpent: asNumber(source.totalSpent),
    completedRentals: asNumber(source.completedRentals),
    cancelledRentals: asNumber(source.cancelledRentals),
    activeRentals: asNumber(source.activeRentals),
    firstRentalAt: asString(source.firstRentalAt),
    lastRentalAt: asString(source.lastRentalAt),
    lastRentalNumber: asString(source.lastRentalNumber),
    lastRentalStatus: asString(source.lastRentalStatus),
    lastRentalId: asString(source.lastRentalId),
    uniqueProducts: asNumber(source.uniqueProducts),
    avgOrderValue: asNumber(source.avgOrderValue),
    segment: safeSegment,
  }
}

// ── API ───────────────────────────────────────────────────────────────────────

export async function listVendorCustomers(
  query: VendorCustomerQuery = {},
): Promise<VendorCustomersResponse> {
  const params: Record<string, string | number> = {
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    sort: query.sort ?? 'totalSpent',
    segment: query.segment ?? 'all',
  }
  const search = query.search?.trim()
  if (search) params.search = search

  const response = await apiClient.get<ApiEnvelope<VendorCustomersResponse>>('/vendor/customers', {
    params,
  })

  const payload = response.data?.data
  const customers = Array.isArray(payload?.customers)
    ? payload.customers
        .map(normalizeCustomer)
        .filter((customer): customer is VendorCustomer => customer !== null)
    : []

  const pagination = payload?.pagination

  return {
    customers,
    pagination: {
      page: toCount(pagination?.page) || 1,
      limit: toCount(pagination?.limit) || (query.limit ?? 20),
      total: toCount(pagination?.total),
      pages: Math.max(1, toCount(pagination?.pages) || 1),
    },
    stats: normalizeStats(payload?.stats),
    segments: normalizeSegments(payload?.segments),
  }
}

export async function getVendorCustomerDetail(
  customerId: string,
): Promise<VendorCustomerDetailResponse> {
  const response = await apiClient.get<ApiEnvelope<VendorCustomerDetailResponse>>(
    `/vendor/customers/${customerId}`,
  )

  const payload = response.data?.data
  const customer = normalizeCustomer(payload?.customer)
  if (!customer) {
    throw new Error('Customer not found')
  }

  const rentals = Array.isArray(payload?.rentals)
    ? payload.rentals.filter((rental): rental is VendorCustomerRental => Boolean(rental?._id))
    : []

  return { customer, rentals }
}

// ── Presentation helpers (pure) ───────────────────────────────────────────────

const AVATAR_TONES = [
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
]

/**
 * Deterministic so the same customer always gets the same colour — and so the
 * value cannot differ between the server and client render.
 */
export function getAvatarTone(seed: string): string {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 1_000_000_007
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length]
}

export function getFullName(customer: VendorCustomer): string {
  const fromParts = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim()
  if (fromParts) return fromParts
  if (customer.fullName?.trim()) return customer.fullName.trim()
  if (customer.email) return customer.email.split('@')[0]
  if (customer.phone) return customer.phone
  return 'Unnamed customer'
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatCompactCurrency(value: number): string {
  const amount = Number.isFinite(value) ? value : 0
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return formatCurrency(amount)
}

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** "Today", "Yesterday", "12 days ago" — used for last-rental recency. */
export function formatDaysAgo(value?: string | null): string {
  if (!value) return 'Never'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Never'

  const days = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000))
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  if (days < 60) return 'Last month'
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} months ago`
  const years = Math.floor(days / 365)
  return years === 1 ? 'A year ago' : `${years} years ago`
}

/** Human label for a Rental.status value. */
export function getRentalStatusLabel(status?: string | null): string {
  if (!status) return 'Unknown'
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function isActiveRentalStatus(status?: string | null): boolean {
  return Boolean(status) && status !== 'completed' && status !== 'cancelled'
}

/** Never surfaces a raw axios/Error string to the vendor. */
export function getCustomerErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const candidate = error as {
      response?: { data?: { message?: unknown } }
      message?: unknown
    }
    const apiMessage = candidate.response?.data?.message
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage
    if (typeof candidate.message === 'string' && candidate.message.trim()) {
      return candidate.message
    }
  }
  return fallback
}
