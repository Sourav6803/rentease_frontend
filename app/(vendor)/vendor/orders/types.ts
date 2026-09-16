// app/vendor/orders/types.ts
export interface Rental {
  _id: string
  rentalNumber: string
  status: RentalStatus
  user: {
    _id: string
    profile: { firstName: string; lastName: string }
    email: string
    phone: string
  }
  product: {
    _id: string
    basicInfo: { name: string; sku: string }
    media: { images: Array<{ url: string; thumbnail: string ; isPrimary: boolean}> }
  }
  rentalDetails: {
    startDate: string
    endDate: string
    actualEndDate?: string
    tenureMonths: number
    monthlyRent: number
    securityDeposit: number
    deliveryCharges: number
    subtotal: number
    tax: number
    totalAmount: number
  }
  payment: {
    status: 'pending' | 'partial' | 'completed' | 'refunded'
    paidAmount: number
    dueAmount: number
    nextDueDate?: string
  }
  address: {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
  }
  delivery?: {
    status: string
    scheduledDate?: string
    actualDate?: string
  }
  pickup?: {
    status: string
    scheduledDate?: string
    actualDate?: string
  }
  /**
   * Extension requests raised by the customer. `GET /rentals/vendor/me` returns the
   * full rental document, so this is populated. The approve/reject endpoints address
   * a request by its index in this array, so the dialog must send the index of the
   * pending entry — not a hardcoded 0, which would target an older request.
   */
  extensions?: Array<{
    _id?: string
    requestedDate?: string
    newEndDate?: string
    additionalMonths?: number
    additionalAmount?: number
    status?: 'pending' | 'approved' | 'rejected'
  }>
  ratings: {
    productRating?: number
    average?: number
    count?: number
  }
  timeline: Array<{
    status: string
    timestamp: string
    note: string
  }>
  createdAt: string
  updatedAt: string
}

export type RentalStatus = 
  | 'pending'
  | 'confirmed'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'active'
  | 'extension_requested'
  | 'return_initiated'
  | 'out_for_pickup'
  | 'completed'
  | 'cancelled'
  | 'overdue'
  | 'disputed'

/**
 * Which actions the VENDOR may take at each stage.
 *
 * This list is the single source of truth for every button rendered on the vendor
 * orders screen, so it must only contain actions the vendor both owns and that the
 * backend exposes a vendor-scoped route for. Anything else renders a button that
 * does nothing but raise an error toast.
 *
 * Shape of a rental, from the vendor's seat (rental.service.js is the source):
 *
 *   pending ──vendor: confirm──▶ confirmed
 *   confirmed ──delivery partner delivers──▶ delivered
 *   delivered ──vendor: activate──▶ active
 *   active ──customer: extend──▶ extension_requested ──vendor: approve/reject──▶ active
 *   active ──customer: return──▶ return_initiated ──vendor: complete return──▶ completed
 *
 * Notes on actions deliberately REMOVED from this map:
 *
 *  - `extend` / `initiate_return` were on `active`. Both are CUSTOMER actions
 *    (`POST /rentals/:id/extend`, `POST /rentals/:id/return/initiate`). Those routes
 *    are not vendor-scoped, and the services filter by `user: userId`, so a vendor
 *    calling them got "Active rental not found" (404). The order list did not even
 *    get that far — it fell through to the "action not implemented" branch.
 *    An active rental needs no vendor action; the customer drives the next step.
 *
 *  - `mark_delivery` / `mark_delivered` / `dispatch`. Delivery is a separate
 *    `Delivery` document with its own status machine, worked by a delivery partner
 *    who has their own app. The partner's completion proof (OTP + signature +
 *    photos, delivery.service.js markAsDelivered) is what flips the RENTAL to
 *    `delivered`. The vendor's `POST /vendor/:id/deliver` was a second, unverified
 *    path that skipped the partner entirely, and its button label said "Mark for
 *    Delivery" while the endpoint actually marked the rental *delivered*.
 *    The vendor's real job after confirming is to arrange that delivery, which the
 *    Deliveries screen does.
 *
 *  - `ready_for_delivery`, `out_for_delivery`, `out_for_pickup` exist in the Rental
 *    status enum but nothing in rental.service.js ever assigns them, so no buttons.
 *
 *  - `send_reminder` (overdue) and `resolve` (disputed) have no endpoint at all.
 *
 *  - `cancel` on `pending`: the service supports a vendor-initiated cancel, but for
 *    `userRole === 'vendor'` it stores `refundAmount: 0` and starts no refund. A
 *    vendor rejecting an order the customer already paid for would silently keep
 *    their money, so no Reject button until the refund path is decided.
 */
export const STATUS_CONFIG: Record<RentalStatus, { label: string; color: string; bg: string; actions: string[] }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', actions: ['confirm'] },
  // Nothing to do here: the rental is waiting on the delivery partner.
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', actions: ['arrange_delivery'] },
  ready_for_delivery: { label: 'Ready for Delivery', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', actions: [] },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', actions: [] },
  delivered: { label: 'Delivered', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200', actions: ['activate'] },
  active: { label: 'Active', color: 'text-green-700', bg: 'bg-green-50 border-green-200', actions: [] },
  extension_requested: { label: 'Extension Requested', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', actions: ['approve_extension', 'reject_extension'] },
  return_initiated: { label: 'Return Initiated', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', actions: ['complete_return'] },
  out_for_pickup: { label: 'Out for Pickup', color: 'text-fuchsia-700', bg: 'bg-fuchsia-50 border-fuchsia-200', actions: ['complete_return'] },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', actions: ['view_receipt'] },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200', actions: [] },
  overdue: { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-50 border-red-200', actions: [] },
  disputed: { label: 'Disputed', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200', actions: [] },
}
