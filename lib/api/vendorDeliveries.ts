/**
 * frontend/lib/api/vendorDeliveries.ts
 *
 * Vendor-facing delivery management client.
 *
 * Verified API contract (backend/src/api/routes/v1/delivery.routes.js, mounted at
 * /api/v1/deliveries by routes/v1/index.js:83):
 *
 *   GET  /vendor/me?page&limit&status&type&deliveryPerson&startDate&endDate
 *        -> data: { deliveries, summary, pagination }
 *   GET  /vendor/summary
 *        -> data: { scheduled, assigned, out_for_delivery, in_transit, delivered,
 *                   failed, cancelled, total, today, ...any other status bucket }
 *        NOTE: the service swallows its own errors and returns {} — normalised here.
 *   GET  /vendor/analytics?startDate&endDate   (BOTH dates required, else 400)
 *   POST /vendor/:id/assign        body { deliveryPersonId, team?, vehicle? }
 *        The service only matches deliveries whose status is 'scheduled'.
 *   POST /vendor/:id/reschedule    body { newDate, newSlot?, reason }
 *        The service only matches status scheduled | assigned | failed.
 *   POST /rental/:rentalId         body { type, scheduledDate, scheduledSlot, addressId?, items?, notes? }
 *
 * All vendor-scoped: `req.vendor._id` is the Vendor document id, because
 * Rental.vendor / Product.vendor store that (not the User id).
 *
 * There is deliberately no personnel-listing call here — the whole
 * /api/v1/delivery-personnel API is admin-only, so a vendor has no way to look up
 * a delivery person's id. `assignDeliveryPerson` therefore takes an id.
 */

import apiClient from '@/lib/api/client'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data?: T
}

// ── Enumerations (mirror backend/src/models/Delivery.model.js) ─────────────────

export const DELIVERY_STATUSES = [
  'scheduled',
  'batched',
  'assigned',
  'out_for_delivery',
  'in_transit',
  'reached',
  'delivered',
  'picked_up',
  'failed',
  'cancelled',
  'rescheduled',
  'returned_to_warehouse',
] as const
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number]

export const DELIVERY_TYPES = ['delivery', 'pickup', 'exchange', 'return', 'maintenance'] as const
export type DeliveryType = (typeof DELIVERY_TYPES)[number]

export const DELIVERY_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type DeliveryPriority = (typeof DELIVERY_PRIORITIES)[number]

/** Which bucket a status belongs to, used to group the UI without hard-coding. */
export type StatusGroup = 'open' | 'active' | 'done' | 'problem'

export interface StatusMeta {
  label: string
  /** Tailwind classes for the status pill. */
  tone: string
  group: StatusGroup
}

export const STATUS_META: Record<DeliveryStatus, StatusMeta> = {
  scheduled: { label: 'Scheduled', tone: 'bg-blue-50 text-blue-600 border-blue-100', group: 'open' },
  batched: { label: 'Batched', tone: 'bg-indigo-50 text-indigo-600 border-indigo-100', group: 'open' },
  assigned: { label: 'Assigned', tone: 'bg-violet-50 text-violet-600 border-violet-100', group: 'open' },
  out_for_delivery: {
    label: 'Out for delivery',
    tone: 'bg-amber-50 text-amber-700 border-amber-100',
    group: 'active',
  },
  in_transit: { label: 'In transit', tone: 'bg-amber-50 text-amber-700 border-amber-100', group: 'active' },
  reached: { label: 'Reached', tone: 'bg-cyan-50 text-cyan-700 border-cyan-100', group: 'active' },
  picked_up: { label: 'Picked up', tone: 'bg-cyan-50 text-cyan-700 border-cyan-100', group: 'active' },
  delivered: {
    label: 'Delivered',
    tone: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    group: 'done',
  },
  returned_to_warehouse: {
    label: 'Returned to warehouse',
    tone: 'bg-slate-100 text-slate-600 border-slate-200',
    group: 'done',
  },
  rescheduled: {
    label: 'Rescheduled',
    tone: 'bg-orange-50 text-orange-700 border-orange-100',
    group: 'problem',
  },
  failed: { label: 'Failed', tone: 'bg-red-50 text-red-600 border-red-100', group: 'problem' },
  cancelled: { label: 'Cancelled', tone: 'bg-slate-100 text-slate-500 border-slate-200', group: 'problem' },
}

export const TYPE_LABEL: Record<DeliveryType, string> = {
  delivery: 'Delivery',
  pickup: 'Pickup',
  exchange: 'Exchange',
  return: 'Return',
  maintenance: 'Maintenance',
}

export const PRIORITY_META: Record<DeliveryPriority, { label: string; tone: string }> = {
  low: { label: 'Low', tone: 'bg-slate-100 text-slate-500' },
  medium: { label: 'Medium', tone: 'bg-blue-50 text-blue-600' },
  high: { label: 'High', tone: 'bg-amber-50 text-amber-700' },
  urgent: { label: 'Urgent', tone: 'bg-red-50 text-red-600' },
}

/** Mirrors `this.timeSlots` in backend/src/services/delivery.service.js. */
export const DELIVERY_SLOT_OPTIONS = [
  { start: '09:00', end: '12:00', label: 'Morning (9 AM – 12 PM)' },
  { start: '12:00', end: '15:00', label: 'Afternoon (12 PM – 3 PM)' },
  { start: '15:00', end: '18:00', label: 'Evening (3 PM – 6 PM)' },
  { start: '18:00', end: '21:00', label: 'Night (6 PM – 9 PM)' },
] as const

// ── Response shapes ───────────────────────────────────────────────────────────

export interface DeliveryAddress {
  _id?: string
  type?: string
  addressLine1?: string
  addressLine2?: string
  landmark?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
  deliveryInstructions?: string
  coordinates?: { type?: string; coordinates?: [number, number] }
  contactDetails?: { name?: string; phone?: string; email?: string }
}

export interface DeliveryContact {
  name?: string
  phone?: string
  alternatePhone?: string
  email?: string
}

export interface DeliveryItem {
  name?: string
  sku?: string
  quantity?: number
  condition?: string
  notes?: string
}

export interface DeliveryTimelineEntry {
  status?: string
  timestamp?: string
  note?: string
  location?: { coordinates?: [number, number]; address?: string }
}

export interface DeliverySchedule {
  requestedDate?: string
  scheduledDate?: string
  scheduledSlot?: { start?: string; end?: string } | null
  confirmedDate?: string
  confirmedSlot?: string
  rescheduledCount?: number
  rescheduleReason?: string
  deadline?: string
}

export interface DeliveryPersonRef {
  _id?: string
  profile?: { firstName?: string; lastName?: string; avatar?: string }
  phone?: string
}

export interface VendorDelivery {
  _id: string
  deliveryNumber: string
  rental?: {
    _id?: string
    rentalNumber?: string
    user?: {
      _id?: string
      phone?: string
      email?: string
      profile?: { firstName?: string; lastName?: string }
    }
  }
  type: string
  status: string
  priority: string
  schedule?: DeliverySchedule
  address?: DeliveryAddress | null
  contact?: DeliveryContact | null
  items?: DeliveryItem[]
  deliveryPerson?: DeliveryPersonRef | string | null
  vehicle?: { type?: string; number?: string; assignedAt?: string }
  tracking?: {
    currentLocation?: { coordinates?: [number, number]; updatedAt?: string }
    timeline?: DeliveryTimelineEntry[]
    estimatedArrival?: string
    actualArrival?: string
  }
  charges?: {
    baseCharge?: number
    distanceCharge?: number
    weightCharge?: number
    specialCharge?: number
    totalCharge?: number
    paymentMethod?: string
    paymentStatus?: string
  }
  proof?: {
    deliveredTo?: string
    photos?: Array<{ url?: string; caption?: string; timestamp?: string }>
    otp?: { verifiedAt?: string }
  }
  issues?: Array<{ type?: string; description?: string; reportedAt?: string; resolvedAt?: string }>
  createdAt?: string
  updatedAt?: string
}

/**
 * Every status bucket, always present. The service returns `{}` when its
 * aggregation throws (it swallows the error), so the page must not have to
 * guard every field.
 */
export interface DeliverySummary {
  scheduled: number
  batched: number
  assigned: number
  out_for_delivery: number
  in_transit: number
  reached: number
  delivered: number
  picked_up: number
  failed: number
  cancelled: number
  rescheduled: number
  returned_to_warehouse: number
  today: number
  total: number
  /** Number of deliveries that are neither delivered nor cancelled. */
  open: number
}

export interface DeliveryPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface VendorDeliveryPage {
  deliveries: VendorDelivery[]
  summary: DeliverySummary
  pagination: DeliveryPagination
}

export interface VendorDeliveryQuery {
  page?: number
  limit?: number
  status?: string
  type?: string
  deliveryPerson?: string
  startDate?: string
  endDate?: string
}

// ── Normalisers ───────────────────────────────────────────────────────────────

function toCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

/**
 * Fill every bucket so the UI never renders `undefined`. `raw` is whatever the
 * API returned — including the `{}` it produces when the aggregation fails.
 */
export function normalizeSummary(raw: unknown): DeliverySummary {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  const summary: DeliverySummary = {
    scheduled: toCount(source.scheduled),
    batched: toCount(source.batched),
    assigned: toCount(source.assigned),
    out_for_delivery: toCount(source.out_for_delivery),
    in_transit: toCount(source.in_transit),
    reached: toCount(source.reached),
    delivered: toCount(source.delivered),
    picked_up: toCount(source.picked_up),
    failed: toCount(source.failed),
    cancelled: toCount(source.cancelled),
    rescheduled: toCount(source.rescheduled),
    returned_to_warehouse: toCount(source.returned_to_warehouse),
    today: toCount(source.today),
    total: toCount(source.total),
    open: 0,
  }

  summary.open =
    summary.scheduled +
    summary.batched +
    summary.assigned +
    summary.out_for_delivery +
    summary.in_transit +
    summary.reached +
    summary.picked_up +
    summary.rescheduled

  return summary
}

function normalizePagination(raw: unknown, fallbackLimit: number): DeliveryPagination {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const total = toCount(source.total)
  const limit = toCount(source.limit) || fallbackLimit

  return {
    page: toCount(source.page) || 1,
    limit,
    total,
    pages: toCount(source.pages) || (total > 0 ? Math.ceil(total / limit) : 0),
  }
}

function normalizeDeliveries(raw: unknown): VendorDelivery[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (entry): entry is VendorDelivery =>
      Boolean(entry) && typeof entry === 'object' && typeof (entry as VendorDelivery)._id === 'string'
  )
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getVendorDeliveries(
  query: VendorDeliveryQuery = {}
): Promise<VendorDeliveryPage> {
  const limit = query.limit ?? 10

  const params: Record<string, string | number> = {
    page: query.page ?? 1,
    limit,
  }
  if (query.status) params.status = query.status
  if (query.type) params.type = query.type
  if (query.deliveryPerson) params.deliveryPerson = query.deliveryPerson
  if (query.startDate) params.startDate = query.startDate
  if (query.endDate) params.endDate = query.endDate

  const res = await apiClient.get<
    ApiEnvelope<{ deliveries: unknown; summary: unknown; pagination: unknown }>
  >('/deliveries/vendor/me', { params })

  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Failed to load deliveries')
  }

  const payload = res.data.data

  return {
    deliveries: normalizeDeliveries(payload?.deliveries),
    summary: normalizeSummary(payload?.summary),
    pagination: normalizePagination(payload?.pagination, limit),
  }
}

export async function getDeliverySummary(): Promise<DeliverySummary> {
  const res = await apiClient.get<ApiEnvelope<unknown>>('/deliveries/vendor/summary')

  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Failed to load the delivery summary')
  }

  return normalizeSummary(res.data.data)
}

export interface AssignDeliveryPersonPayload {
  deliveryPersonId: string
  /** Free-text team/vehicle notes the service accepts. */
  vehicle?: { type?: string; number?: string }
}

export async function assignDeliveryPerson(
  deliveryId: string,
  payload: AssignDeliveryPersonPayload
): Promise<VendorDelivery> {
  const res = await apiClient.post<ApiEnvelope<{ delivery: VendorDelivery }>>(
    `/deliveries/vendor/${deliveryId}/assign`,
    payload
  )

  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Failed to assign the delivery person')
  }

  return res.data.data?.delivery as VendorDelivery
}

export interface RescheduleDeliveryPayload {
  /** ISO date string — the API validates it with isISO8601. */
  newDate: string
  /** "HH:MM-HH:MM" or { start, end }; omitted means "leave the slot untouched". */
  newSlot?: string
  reason: string
}

export async function rescheduleDelivery(
  deliveryId: string,
  payload: RescheduleDeliveryPayload
): Promise<VendorDelivery> {
  const body: Record<string, unknown> = { newDate: payload.newDate, reason: payload.reason }
  if (payload.newSlot) body.newSlot = payload.newSlot

  const res = await apiClient.post<ApiEnvelope<{ delivery: VendorDelivery }>>(
    `/deliveries/vendor/${deliveryId}/reschedule`,
    body
  )

  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Failed to reschedule the delivery')
  }

  return res.data.data?.delivery as VendorDelivery
}

// ── UI helpers (pure, so the page stays presentational) ───────────────────────

export function getStatusMeta(status: string): StatusMeta {
  return (
    STATUS_META[status as DeliveryStatus] ?? {
      label: status ? status.replace(/_/g, ' ') : 'Unknown',
      tone: 'bg-slate-100 text-slate-500 border-slate-200',
      group: 'open',
    }
  )
}

export function getTypeLabel(type: string): string {
  return TYPE_LABEL[type as DeliveryType] ?? (type ? type.replace(/_/g, ' ') : 'Delivery')
}

export function getPriorityMeta(priority: string) {
  return PRIORITY_META[priority as DeliveryPriority] ?? PRIORITY_META.medium
}

/** The service only lets a person be assigned while the status is 'scheduled'. */
export function isAssignable(status: string): boolean {
  return status === 'scheduled'
}

/** The service only reschedules scheduled | assigned | failed. */
export function isReschedulable(status: string): boolean {
  return status === 'scheduled' || status === 'assigned' || status === 'failed'
}

export function getCustomerName(delivery: VendorDelivery): string {
  const fromContact = delivery.contact?.name
  if (fromContact) return fromContact

  const profile = delivery.rental?.user?.profile
  const full = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
  return full || 'Unknown customer'
}

export function getCustomerPhone(delivery: VendorDelivery): string {
  return delivery.contact?.phone || delivery.rental?.user?.phone || ''
}

export function formatAddress(address?: DeliveryAddress | null): string {
  if (!address) return 'No address on record'

  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
  ].filter((part): part is string => Boolean(part && part.trim()))

  return parts.length > 0 ? parts.join(', ') : 'No address on record'
}

export function getAssignedPersonName(delivery: VendorDelivery): string | null {
  const person = delivery.deliveryPerson
  if (!person || typeof person === 'string') return null

  const full = [person.profile?.firstName, person.profile?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return full || null
}

export function getAssignedPersonId(delivery: VendorDelivery): string | null {
  const person = delivery.deliveryPerson
  if (!person) return null
  return typeof person === 'string' ? person : (person._id ?? null)
}

/** "Tue, 16 Sep 2026 · Morning (9 AM – 12 PM)" */
export function formatSchedule(delivery: VendorDelivery): string {
  const schedule = delivery.schedule
  const date = schedule?.scheduledDate || schedule?.requestedDate || delivery.createdAt
  const dateLabel = formatDate(date)
  const slot = formatSlot(schedule?.scheduledSlot)

  return slot ? `${dateLabel} · ${slot}` : dateLabel
}

export function formatDate(value?: string | null): string {
  if (!value) return 'Not scheduled'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not scheduled'

  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatSlot(slot?: { start?: string; end?: string } | null): string | null {
  if (!slot) return null
  if (!slot.start && !slot.end) return null

  const match = DELIVERY_SLOT_OPTIONS.find(
    (option) => option.start === slot.start && option.end === slot.end
  )
  if (match) return match.label

  const parts = [slot.start, slot.end].filter(Boolean)
  return parts.join(' – ')
}

export function formatCurrency(value?: number | null): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return `₹${value.toLocaleString('en-IN')}`
}

/** Type-safe message extraction — avoids an `any` catch. */
export function getDeliveryErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
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
