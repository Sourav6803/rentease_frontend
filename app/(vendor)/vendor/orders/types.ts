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

export const STATUS_CONFIG: Record<RentalStatus, { label: string; color: string; bg: string; actions: string[] }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', actions: ['confirm', 'cancel'] },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', actions: ['mark_delivery'] },
  ready_for_delivery: { label: 'Ready for Delivery', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', actions: ['dispatch'] },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', actions: ['mark_delivered'] },
  delivered: { label: 'Delivered', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200', actions: ['activate'] },
  active: { label: 'Active', color: 'text-green-700', bg: 'bg-green-50 border-green-200', actions: ['extend', 'initiate_return'] },
  extension_requested: { label: 'Extension Requested', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', actions: ['approve_extension', 'reject_extension'] },
  return_initiated: { label: 'Return Initiated', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', actions: ['schedule_pickup'] },
  out_for_pickup: { label: 'Out for Pickup', color: 'text-fuchsia-700', bg: 'bg-fuchsia-50 border-fuchsia-200', actions: ['complete_return'] },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', actions: ['view_receipt'] },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200', actions: [] },
  overdue: { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-50 border-red-200', actions: ['send_reminder'] },
  disputed: { label: 'Disputed', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200', actions: ['resolve'] },
}