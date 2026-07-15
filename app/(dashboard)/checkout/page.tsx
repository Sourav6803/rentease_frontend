'use client'

/**
 * CHECKOUT PAGE — Razorpay-only, payment-first architecture
 *
 * FLOW (safe, Flipkart-style):
 *  1. User selects address + delivery slot
 *  2. User clicks "Proceed to Pay"
 *  3. Reserve cart items (short lock, e.g. 15 min)
 *  4. Init payment with gateway → get orderId
 *  5. Open Razorpay modal
 *     ✅ On success → verify → create rental → redirect
 *     ❌ On dismiss/failure → release reservation → show error
 *
 *  Rental is NEVER created until payment is verified.
 */

import { useState, useEffect, useCallback } from 'react'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Home, Building2, Clock, Truck, Shield, Lock,
  CheckCircle, Loader2, Plus, Edit2, Trash2, Tag,
  Banknote, ArrowRight, ChevronRight, ChevronDown, Package,
  AlertCircle, X, Star, Zap, HelpCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { computeRentalPayableFromCart, loadRazorpayScript } from '@/lib/checkoutPayment'
import { applyCartCoupon, removeCartCoupon } from '@/lib/api/coupons'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
  _id: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
  type: 'home' | 'office' | 'other'
  contactDetails?: { name?: string; phone?: string }
}

interface CartItem {
  _id: string
  product: {
    _id: string
    basicInfo: { name: string; slug: string }
    media?: { images?: Array<{ url: string; thumbnail: string; isPrimary: boolean }> }
    pricing: { monthlyRent: number; securityDeposit: number; deliveryCharges: number }
    rentalTerms: { minRentalMonths: number; maxRentalMonths: number }
  }
  quantity: number
  rentalMonths: number
  totals: {
    monthlySubtotal: number
    tenureSubtotal: number
    securityDepositTotal: number
    deliveryChargesTotal: number
    lineTotal: number
  }
}

interface Cart {
  _id: string
  items: CartItem[]
  coupon?: { code?: string } | null
  summary: {
    itemsCount: number
    totalQuantity: number
    monthlyRentTotal: number
    securityDepositTotal: number
    deliveryChargesTotal: number
    grandTotal: number
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

// ─── Step Pill (desktop header) ────────────────────────────────────────────────

function StepPill({ n, label, done, active }: { n: number; label: string; done: boolean; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
        done ? 'bg-[#388e3c] text-white' : active ? 'bg-[#2874f0] text-white' : 'bg-[#d0d4db] text-white'
      }`}>
        {done ? <CheckCircle className="w-4 h-4" /> : n}
      </div>
      <span className={`text-xs font-semibold uppercase tracking-wide ${active ? 'text-[#2874f0]' : done ? 'text-[#388e3c]' : 'text-[#9ea3ae]'}`}>
        {label}
      </span>
    </div>
  )
}

// ─── Mobile Progress Bar ───────────────────────────────────────────────────────

function MobileStepper({ activeStep }: { activeStep: 'address' | 'slot' | 'payment' }) {
  const steps: { id: 'address' | 'slot' | 'payment'; label: string }[] = [
    { id: 'address', label: 'Address' },
    { id: 'slot', label: 'Delivery' },
    { id: 'payment', label: 'Payment' },
  ]
  const activeIdx = steps.findIndex(s => s.id === activeStep)

  return (
    <div className="sm:hidden flex items-center gap-1.5 mt-2.5">
      {steps.map((s, i) => (
        <div key={s.id} className="flex-1 flex flex-col gap-1">
          <div className={`h-1 rounded-full transition-all duration-300 ${
            i < activeIdx ? 'bg-[#388e3c]' : i === activeIdx ? 'bg-[#2874f0]' : 'bg-[#e0e0e0]'
          }`} />
          <span className={`text-[10px] font-bold uppercase tracking-wide ${
            i < activeIdx ? 'text-[#388e3c]' : i === activeIdx ? 'text-[#2874f0]' : 'text-[#aaa]'
          }`}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Address Card ─────────────────────────────────────────────────────────────

function AddressCard({ address, isSelected, onSelect, onDelete }: {
  address: Address; isSelected: boolean
  onSelect: () => void; onDelete: () => void
}) {
  const icons = { home: Home, office: Building2, other: MapPin }
  const Icon = icons[address.type] || MapPin

  return (
    <div
      onClick={onSelect}
      className={`relative p-3.5 sm:p-4 rounded-lg cursor-pointer border-2 transition-all duration-150 ${
        isSelected ? 'border-[#2874f0] bg-[#f0f5ff] shadow-sm' : 'border-[#e0e0e0] bg-white hover:border-[#2874f0]/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#2874f0]' : 'bg-[#f5f5f5]'}`}>
            <Icon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-[#888]'}`} />
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-[#2874f0]' : 'text-[#444]'}`}>
            {address.type}
          </span>
          {address.isDefault && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#fff3e0] text-[#e65100] border border-[#ffcc80]">
              DEFAULT
            </span>
          )}
        </div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-[#2874f0] flex items-center justify-center shrink-0">
            <CheckCircle className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>
      <p className="text-sm text-[#333] font-medium leading-snug">
        {address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}
      </p>
      <p className="text-sm text-[#717786] mt-0.5">
        {address.city}, {address.state} – {address.pincode}
      </p>
      {address.contactDetails?.phone && (
        <p className="text-xs text-[#888] mt-1">📞 {address.contactDetails.phone}</p>
      )}
      <div className="flex gap-3 mt-3">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="text-xs font-semibold text-[#2874f0] hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> REMOVE
        </button>
      </div>
    </div>
  )
}

// ─── Add Address Modal ────────────────────────────────────────────────────────

function AddAddressModal({ open, onClose, onSave }: {
  open: boolean; onClose: () => void
  onSave: (address: object) => Promise<void>
}) {
  const [form, setForm] = useState({
    addressType: 'home' as 'home' | 'work' | 'other',
    addressLine1: '', addressLine2: '', area: '',
    city: '', state: '', pincode: '',
    contactDetails: { name: '', phone: '' },
    isDefault: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.addressLine1) e.addressLine1 = 'Required'
    if (!form.city) e.city = 'Required'
    if (!form.state) e.state = 'Required'
    if (!/^[1-9][0-9]{5}$/.test(form.pincode)) e.pincode = 'Valid 6-digit pincode required'
    if (!/^[6-9]\d{9}$/.test(form.contactDetails.phone)) e.phone = 'Valid 10-digit phone required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setSaving(true)
    try { await onSave(form); onClose() } finally { setSaving(false) }
  }

  const field = (key: string, label: string, placeholder: string, required = false, extra?: object) => (
    <div>
      <label className="text-xs font-semibold text-[#666] uppercase tracking-wide block mb-1">
        {label}{required && ' *'}
      </label>
      <input
        className={`w-full border rounded px-3 py-2.5 text-sm outline-none focus:border-[#2874f0] transition-colors ${
          errors[key] ? 'border-red-400 bg-red-50' : 'border-[#e0e0e0]'
        }`}
        placeholder={placeholder}
        value={(form as Record<string, unknown>)[key] as string || ''}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        {...extra}
      />
      {errors[key] && <p className="text-[11px] text-red-500 mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[calc(100%-1.5rem)] sm:w-full rounded-xl sm:rounded-xl border-0 shadow-2xl max-h-[92vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-[#2874f0] to-[#1a5fd0] px-5 sm:px-6 py-4 text-white rounded-t-xl">
          <h2 className="font-bold text-base sm:text-lg">Add New Address</h2>
          <p className="text-xs text-blue-200 mt-0.5">Fill in the details for delivery</p>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Type selector */}
          <div>
            <label className="text-xs font-semibold text-[#666] uppercase tracking-wide block mb-2">Address Type *</label>
            <div className="flex gap-2">
              {(['home', 'work', 'other'] as const).map((t) => {
                const IcMap = { home: Home, work: Building2, other: MapPin }
                const Ic = IcMap[t]
                return (
                  <button key={t} onClick={() => setForm({ ...form, addressType: t })}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 text-xs sm:text-sm font-semibold border-2 rounded-lg transition-all ${
                      form.addressType === t ? 'border-[#2874f0] bg-[#f0f5ff] text-[#2874f0]' : 'border-[#e0e0e0] text-[#666]'
                    }`}>
                    <Ic className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {field('addressLine1', 'House / Flat / Floor No.', 'e.g. 42, Sunrise Apartments', true)}
          {field('addressLine2', 'Street / Landmark', 'e.g. Near City Mall')}
          {field('area', 'Area / Colony / Sector', 'e.g. Koramangala', true)}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#666] uppercase tracking-wide block mb-1">City *</label>
              <input className={`w-full border rounded px-3 py-2.5 text-sm outline-none focus:border-[#2874f0] ${errors.city ? 'border-red-400' : 'border-[#e0e0e0]'}`}
                placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              {errors.city && <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-[#666] uppercase tracking-wide block mb-1">State *</label>
              <input className={`w-full border rounded px-3 py-2.5 text-sm outline-none focus:border-[#2874f0] ${errors.state ? 'border-red-400' : 'border-[#e0e0e0]'}`}
                placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              {errors.state && <p className="text-[11px] text-red-500 mt-1">{errors.state}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#666] uppercase tracking-wide block mb-1">Pincode *</label>
            <input className={`w-full border rounded px-3 py-2.5 text-sm outline-none focus:border-[#2874f0] ${errors.pincode ? 'border-red-400' : 'border-[#e0e0e0]'}`}
              placeholder="6-digit pincode" maxLength={6} value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} />
            {errors.pincode && <p className="text-[11px] text-red-500 mt-1">{errors.pincode}</p>}
          </div>

          <div className="border-t border-[#f0f0f0] pt-4 space-y-3">
            <p className="text-xs font-bold text-[#333] uppercase tracking-wide">Contact Details</p>
            <div>
              <label className="text-xs font-semibold text-[#666] block mb-1">Full Name (Optional)</label>
              <input className="w-full border border-[#e0e0e0] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2874f0]"
                placeholder="Recipient name" value={form.contactDetails.name}
                onChange={(e) => setForm({ ...form, contactDetails: { ...form.contactDetails, name: e.target.value } })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#666] block mb-1">Phone Number *</label>
              <input className={`w-full border rounded px-3 py-2.5 text-sm outline-none focus:border-[#2874f0] ${errors.phone ? 'border-red-400' : 'border-[#e0e0e0]'}`}
                placeholder="10-digit mobile" maxLength={10} value={form.contactDetails.phone}
                onChange={(e) => setForm({ ...form, contactDetails: { ...form.contactDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10) } })} />
              {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-[#f9f9f9] border border-[#e8e8e8]">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="w-4 h-4 accent-[#2874f0] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#333]">Make this my default address</p>
              <p className="text-xs text-[#888]">Auto-selected at checkout next time</p>
            </div>
          </label>
        </div>

        <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-lg border-2 border-[#e0e0e0] text-sm font-bold text-[#666] hover:bg-[#f5f5f5] transition-all">
            CANCEL
          </button>
          <button onClick={submit} disabled={saving}
            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-[#2874f0] to-[#1a5fd0] text-white text-sm font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            SAVE ADDRESS
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delivery Slot ────────────────────────────────────────────────────────────

// function DeliverySlotPicker({ onSelect }: { onSelect: (slot: string) => void }) {
//   const today = new Date()
//   const [selDay, setSelDay] = useState(0)
//   const [selTime, setSelTime] = useState<string | null>(null)

//   const days = Array.from({ length: 6 }, (_, i) => {
//     const d = new Date(today)
//     d.setDate(today.getDate() + i)
//     return {
//       date: d,
//       label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
//       num: d.getDate(),
//       mon: d.toLocaleDateString('en-IN', { month: 'short' }),
//       slots: [
//         { t: '7 AM – 11 AM', avail: true },
//         { t: '11 AM – 3 PM', avail: true },
//         { t: '3 PM – 7 PM', avail: i > 0 },
//         { t: '7 PM – 10 PM', avail: i > 1 },
//       ],
//     }
//   })

//   const pick = (t: string) => {
//     setSelTime(t)
//     onSelect(`${days[selDay].date.toISOString()}|${t}`)
//   }

//   return (
//     <div className="space-y-4">
//       {/* Day scroll */}
//       <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
//         {days.map((d, i) => (
//           <button key={i} onClick={() => { setSelDay(i); setSelTime(null) }}
//             className={`flex flex-col items-center px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-lg shrink-0 border-2 font-semibold transition-all min-w-[60px] sm:min-w-[68px] ${
//               selDay === i
//                 ? 'border-[#2874f0] bg-[#2874f0] text-white'
//                 : 'border-[#e0e0e0] text-[#555] hover:border-[#2874f0]/50'
//             }`}>
//             <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider ${selDay === i ? 'text-blue-100' : 'text-[#999]'}`}>{d.label}</span>
//             <span className="text-lg sm:text-xl font-black leading-tight">{d.num}</span>
//             <span className={`text-[9px] sm:text-[10px] ${selDay === i ? 'text-blue-100' : 'text-[#aaa]'}`}>{d.mon}</span>
//           </button>
//         ))}
//       </div>

//       {/* Time slots */}
//       <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2">
//         {days[selDay].slots.map((s, i) => (
//           <button key={i} disabled={!s.avail} onClick={() => s.avail && pick(s.t)}
//             className={`px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-lg border-2 text-left transition-all ${
//               selTime === s.t
//                 ? 'border-[#2874f0] bg-[#f0f5ff]'
//                 : s.avail
//                 ? 'border-[#e0e0e0] hover:border-[#2874f0]/50 bg-white'
//                 : 'border-[#f0f0f0] bg-[#fafafa] cursor-not-allowed'
//             }`}>
//             <div className="flex items-center gap-2">
//               <Clock className={`w-3.5 h-3.5 shrink-0 ${selTime === s.t ? 'text-[#2874f0]' : s.avail ? 'text-[#999]' : 'text-[#ccc]'}`} />
//               <span className={`text-xs sm:text-sm font-semibold ${selTime === s.t ? 'text-[#2874f0]' : s.avail ? 'text-[#333]' : 'text-[#ccc]'}`}>
//                 {s.t}
//               </span>
//             </div>
//             {!s.avail && <p className="text-[10px] text-[#ccc] mt-0.5 pl-5">Not available</p>}
//             {selTime === s.t && <p className="text-[10px] text-[#2874f0] mt-0.5 pl-5 font-semibold">Selected ✓</p>}
//           </button>
//         ))}
//       </div>
//     </div>
//   )
// }

function DeliverySlotPicker({ onSelect }: { onSelect: (slot: string) => void }) {
  const today = new Date()
  const [selDay, setSelDay] = useState(0)
  const [selTime, setSelTime] = useState<string | null>(null)

  const days = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return {
      date: d,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
      num: d.getDate(),
      mon: d.toLocaleDateString('en-IN', { month: 'short' }),
      slots: [
        { t: '7 AM – 11 AM', short: '7–11 AM', avail: true },
        { t: '11 AM – 3 PM', short: '11 AM–3 PM', avail: true },
        { t: '3 PM – 7 PM', short: '3–7 PM', avail: i > 0 },
        { t: '7 PM – 10 PM', short: '7–10 PM', avail: i > 1 },
      ],
    }
  })

  const pick = (t: string) => {
    setSelTime(t)
    onSelect(`${days[selDay].date.toISOString()}|${t}`)
  }

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Day scroll */}
      <div
        className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {days.map((d, i) => (
          <button key={i} onClick={() => { setSelDay(i); setSelTime(null) }}
            className={`flex flex-col items-center justify-center px-2.5 sm:px-4 py-2 sm:py-3 rounded-lg shrink-0 border-2 font-semibold transition-all w-[54px] sm:w-[68px] ${
              selDay === i
                ? 'border-[#2874f0] bg-[#2874f0] text-white'
                : 'border-[#e0e0e0] text-[#555] hover:border-[#2874f0]/50'
            }`}>
            <span className={`text-[8px] sm:text-[10px] uppercase tracking-wide leading-tight ${selDay === i ? 'text-blue-100' : 'text-[#999]'}`}>{d.label}</span>
            <span className="text-base sm:text-xl font-black leading-tight">{d.num}</span>
            <span className={`text-[8px] sm:text-[10px] leading-tight ${selDay === i ? 'text-blue-100' : 'text-[#aaa]'}`}>{d.mon}</span>
          </button>
        ))}
      </div>

      {/* Time slots */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        {days[selDay].slots.map((s, i) => (
          <button key={i} disabled={!s.avail} onClick={() => s.avail && pick(s.t)}
            className={`px-2.5 sm:px-4 py-2.5 sm:py-3.5 rounded-lg border-2 text-left transition-all min-h-[56px] sm:min-h-0 flex flex-col justify-center ${
              selTime === s.t
                ? 'border-[#2874f0] bg-[#f0f5ff]'
                : s.avail
                ? 'border-[#e0e0e0] hover:border-[#2874f0]/50 bg-white'
                : 'border-[#f0f0f0] bg-[#fafafa] cursor-not-allowed'
            }`}>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${selTime === s.t ? 'text-[#2874f0]' : s.avail ? 'text-[#999]' : 'text-[#ccc]'}`} />
              <span className={`text-[11px] sm:text-sm font-semibold whitespace-nowrap sm:whitespace-normal ${selTime === s.t ? 'text-[#2874f0]' : s.avail ? 'text-[#333]' : 'text-[#ccc]'}`}>
                <span className="sm:hidden">{s.short}</span>
                <span className="hidden sm:inline">{s.t}</span>
              </span>
            </div>
            {!s.avail && <p className="text-[9px] sm:text-[10px] text-[#ccc] mt-0.5 pl-4 sm:pl-5">Not available</p>}
            {selTime === s.t && <p className="text-[9px] sm:text-[10px] text-[#2874f0] mt-0.5 pl-4 sm:pl-5 font-semibold">Selected ✓</p>}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Section Block (Flipkart-style collapsible step) ─────────────────────────

function StepBlock({
  stepNum, title, subtitle, isActive, isDone, onEdit,
  children, donePreview,
}: {
  stepNum: number; title: string; subtitle?: string
  isActive: boolean; isDone: boolean
  onEdit?: () => void; children: React.ReactNode
  donePreview?: React.ReactNode
}) {
  return (
    <div className={`border-2 rounded-xl overflow-hidden transition-all duration-200 ${
      isActive ? 'border-[#2874f0] shadow-sm' : isDone ? 'border-[#e0e0e0]' : 'border-[#e0e0e0] opacity-60'
    }`}>
      {/* Header */}
      <div className={`px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-2.5 sm:gap-3 ${isActive ? 'bg-gradient-to-r from-[#2874f0] to-[#1a5fd0]' : 'bg-[#f7f7f7]'}`}>
        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
          isActive ? 'bg-white text-[#2874f0]' : isDone ? 'bg-[#388e3c] text-white' : 'bg-[#d0d4db] text-white'
        }`}>
          {isDone ? <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : stepNum}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-black text-xs sm:text-sm uppercase tracking-wide ${isActive ? 'text-white' : 'text-[#333]'}`}>{title}</p>
          {isActive && subtitle && <p className="text-[11px] sm:text-xs text-blue-100 mt-0.5 hidden sm:block">{subtitle}</p>}
          {isDone && donePreview && <div className="mt-0.5 truncate">{donePreview}</div>}
        </div>
        {isDone && onEdit && (
          <button onClick={onEdit}
            className="text-[11px] sm:text-xs font-bold text-[#2874f0] border border-[#2874f0] px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-[#f0f5ff] transition-all shrink-0">
            CHANGE
          </button>
        )}
      </div>
      {/* Body */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 py-4 sm:py-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Order Summary Card ───────────────────────────────────────────────────────

function PriceSummary({ cart, couponDiscount }: { cart: Cart; couponDiscount: number }) {
  const platformFee = 49
  const tax = Math.round(cart.summary.grandTotal * 0.18)
  const total = cart.summary.grandTotal + cart.summary.securityDepositTotal + cart.summary.deliveryChargesTotal + platformFee + tax - couponDiscount

  const rows = [
    { label: `Rental Amount (${cart.summary.totalQuantity} item${cart.summary.totalQuantity > 1 ? 's' : ''})`, val: fmt(cart.summary.grandTotal) },
    { label: 'Security Deposit', val: fmt(cart.summary.securityDepositTotal), note: 'Refundable' },
    { label: 'Delivery Charges', val: cart.summary.deliveryChargesTotal === 0 ? '🎉 FREE' : fmt(cart.summary.deliveryChargesTotal), free: cart.summary.deliveryChargesTotal === 0 },
    { label: 'Platform Fee', val: fmt(platformFee) },
    { label: 'GST (18%)', val: fmt(tax) },
  ]

  return (
    <div className="space-y-1.5 text-xs sm:text-sm">
      {rows.map(({ label, val, note, free }) => (
        <div key={label} className="flex justify-between items-center py-0.5 gap-2">
          <span className="text-[#555] flex items-center gap-1.5 flex-wrap">
            {label}
            {note && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e8f5e9] text-[#388e3c] shrink-0">{note}</span>}
          </span>
          <span className={`font-semibold shrink-0 ${free ? 'text-[#388e3c]' : 'text-[#333]'}`}>{val}</span>
        </div>
      ))}
      {couponDiscount > 0 && (
        <div className="flex justify-between items-center py-0.5 text-[#388e3c]">
          <span className="flex items-center gap-1.5"><Tag className="w-3 h-3" /> Coupon Discount</span>
          <span className="font-bold">−{fmt(couponDiscount)}</span>
        </div>
      )}
      <div className="border-t border-dashed border-[#e0e0e0] pt-3 mt-1 flex justify-between items-center">
        <span className="font-black text-[#333] text-sm sm:text-base">Total Amount</span>
        <span className="font-black text-[#333] text-lg sm:text-xl">{fmt(total)}</span>
      </div>
      <p className="text-[11px] text-[#388e3c] font-semibold">✅ You save {fmt(cart.summary.securityDepositTotal)} on deposit (refundable)</p>
    </div>
  )
}

// ─── Coupon Box ───────────────────────────────────────────────────────────────

function CouponBox({ onApply, initialCode }: { onApply: (code: string, discount: number) => void; initialCode?: string }) {
  const [code, setCode] = useState(initialCode || '')
  const [applied, setApplied] = useState(Boolean(initialCode))
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')

  const apply = async () => {
    if (!code) return
    setApplying(true); setError('')
    try {
      const cart = await applyCartCoupon(code.trim())
      const discount = Number(cart.summary?.discountAmount ?? 0)
      setApplied(true)
      onApply(code.trim().toUpperCase(), discount)
      toast.success(discount > 0 ? `Coupon applied! ₹${discount.toLocaleString('en-IN')} saved 🎉` : 'Coupon applied!')
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? String((err.response?.data as { message?: string })?.message || 'Invalid or expired coupon code')
        : 'Invalid or expired coupon code'
      setError(msg)
      toast.error(msg)
    } finally {
      setApplying(false)
    }
  }

  const remove = async () => {
    try {
      await removeCartCoupon()
    } catch {
      // non-critical; clear locally regardless
    }
    setApplied(false); setCode(''); onApply('', 0); setError('')
  }

  return (
    <div className={`flex gap-2 p-3 rounded-lg border-2 transition-all ${applied ? 'border-[#388e3c] bg-[#f1f8f1]' : 'border-[#e0e0e0]'}`}>
      <Tag className={`w-4 h-4 mt-2.5 shrink-0 ${applied ? 'text-[#388e3c]' : 'text-[#bbb]'}`} />
      <div className="flex-1 min-w-0">
        <input
          className="w-full bg-transparent outline-none text-sm font-semibold placeholder:text-[#bbb] text-[#333]"
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={applied}
        />
        {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      </div>
      {!applied ? (
        <button onClick={apply} disabled={applying || !code}
          className="text-xs sm:text-sm font-black text-[#2874f0] hover:text-[#1a5fd0] disabled:text-[#ccc] transition-all whitespace-nowrap shrink-0">
          {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'APPLY'}
        </button>
      ) : (
        <button onClick={remove} className="text-xs sm:text-sm font-black text-red-500 hover:text-red-600 whitespace-nowrap shrink-0">
          REMOVE
        </button>
      )}
    </div>
  )
}

// ─── FAQ Accordion (static trust content) ──────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'When will my security deposit be refunded?',
    a: 'Your full security deposit is refunded within 5–7 business days after the rented item is picked up and inspected at the end of your rental period, provided there is no damage beyond normal wear and tear.',
  },
  {
    q: 'Can I extend or cancel my rental later?',
    a: 'Yes. You can extend your rental tenure anytime from "My Rentals" before it ends. Cancellations made before the item is dispatched are fully refundable; once dispatched, standard cancellation charges may apply.',
  },
  {
    q: 'What if the product arrives damaged or faulty?',
    a: 'Every item is inspected and sanitized before dispatch. If you receive a damaged or faulty product, report it within 24 hours of delivery for a free replacement or full refund — no questions asked.',
  },
  {
    q: 'Is my payment information safe?',
    a: 'All payments are processed by Razorpay over a 256-bit encrypted connection. We never store your card, UPI, or bank details on our servers.',
  },
]

function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] overflow-hidden">
      <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#f0f0f0] flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-[#2874f0]" />
        <h3 className="font-black text-[#333] text-xs sm:text-sm uppercase tracking-wide">Common Questions</h3>
      </div>
      <div className="divide-y divide-[#f5f5f5]">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIdx === i
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left"
              >
                <span className="text-xs sm:text-sm font-semibold text-[#333]">{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-[#888] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2874f0]' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs sm:text-sm text-[#666] leading-relaxed px-4 sm:px-5 pb-4">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Processing Overlay ───────────────────────────────────────────────────────

function ProcessingOverlay({ step }: { step: string }) {
  const steps = [
    { id: 'reserve', label: 'Reserving items for you' },
    { id: 'rental',  label: 'Creating your order' },
    { id: 'payment', label: 'Initializing secure payment' },
    { id: 'opening', label: 'Opening payment window' },
    { id: 'verify',  label: 'Verifying your payment' },
  ]
  const cur = steps.findIndex(s => s.id === step)

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#f0f5ff] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#2874f0] animate-spin" />
          </div>
          <p className="font-black text-[#333] text-base sm:text-lg">Please wait…</p>
          <p className="text-xs sm:text-sm text-[#888] mt-1">Do not press back or close this window</p>
        </div>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-3 transition-all ${i < cur ? 'opacity-40' : i === cur ? 'opacity-100' : 'opacity-20'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${i < cur ? 'bg-[#388e3c]' : i === cur ? 'bg-[#2874f0]' : 'bg-[#e0e0e0]'}`}>
                {i < cur
                  ? <CheckCircle className="w-3 h-3 text-white" />
                  : i === cur
                  ? <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  : <div className="w-2 h-2 rounded-full bg-[#bbb]" />}
              </div>
              <span className={`text-xs sm:text-sm font-semibold ${i === cur ? 'text-[#2874f0]' : 'text-[#666]'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type CheckoutStep = 'address' | 'slot' | 'payment'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [cart, setCart] = useState<Cart | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [deliverySlot, setDeliverySlot] = useState<string | null>(null)
  const [specialRequests, setSpecialRequests] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [activeStep, setActiveStep] = useState<CheckoutStep>('address')

  const [isLoading, setIsLoading] = useState(true)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [processingStep, setProcessingStep] = useState<string | null>(null)

  const getToken = useCallback(async () => {
    const s = await getSession()
    return s?.user?.accessToken || session?.user?.accessToken || null
  }, [session])

  useEffect(() => {
    // if (status === 'unauthenticated') router.push('/login?callbackUrl=/checkout')
    if (status === 'authenticated') loadData()
  }, [status])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const token = await getToken()
      // if (!token) { router.push('/login?callbackUrl=/checkout'); return }

      const [cartRes, addrRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/v1/cart/me`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BASE_URL}/api/v1/users/addresses`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      if (cartRes.data.success) {
        const c = cartRes.data.data.cart
        if (!c.items.length) { router.push('/cart'); return }
        setCart(c)
        // Reflect a coupon already applied on the cart page (set server-side).
        if (c.summary?.discountAmount) {
          setCouponDiscount(Number(c.summary.discountAmount))
        }
      }
      if (addrRes.data.success) {
        const addrs: Address[] = addrRes.data.data.addresses
        setAddresses(addrs)
        const def = addrs.find(a => a.isDefault)
        if (def) { setSelectedAddressId(def._id); setActiveStep('slot') }
      }
    } catch {
      toast.error('Failed to load checkout. Please refresh.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAddress = async (address: object) => {
    const token = await getToken()
    if (!token) throw new Error('Session expired')
    const res = await axios.post(`${BASE_URL}/api/v1/users/addresses`, address, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.data.success) {
      const newAddr = res.data.data.address || res.data.data.addresses
      setAddresses(prev => [...prev, ...(Array.isArray(newAddr) ? newAddr : [newAddr])])
      toast.success('Address saved!')
    }
  }

  const confirmAddress = () => {
    if (!selectedAddressId) { toast.error('Please select a delivery address'); return }
    setActiveStep('slot')
  }

  const confirmSlot = () => {
    if (!deliverySlot) { toast.error('Please select a delivery slot'); return }
    setActiveStep('payment')
  }

  /**
   * SAFE CHECKOUT FLOW (works with existing backend that requires rentalId):
   *
   *  1.  Reserve cart items (short lock ~15 min)
   *  2.  Create rental in "pending_payment" status
   *  3.  Initiate payment → sends rentalId → get Razorpay order_id
   *  4.  Load & open Razorpay modal
   *
   *      ✅ PAYMENT SUCCESS:
   *        a. Verify signature with backend → rental moves to "confirmed"
   *        b. Redirect to success page
   *
   *      ❌ PAYMENT CANCELLED or FAILED:
   *        a. Cancel the rental (rollback to "cancelled" status)
   *        b. Release cart reservation
   *        c. Show error — user stays on page and can retry
   *
   *  Key: rental is created in a PENDING state. It only becomes real
   *  after verify succeeds. If anything goes wrong we cancel it so
   *  inventory is never incorrectly locked.
   */
  const handleProceedToPay = async () => {
    if (!selectedAddressId || !deliverySlot || !cart) {
      toast.error('Please complete all steps')
      return
    }

    const token = await getToken()
    // if (!token) { toast.error('Session expired'); router.push('/login?callbackUrl=/checkout'); return }

    // Razorpay key — must be defined in .env.local as NEXT_PUBLIC_RAZORPAY_KEY_ID
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!key || key === 'undefined') {
      toast.error('Razorpay key is missing. Check your .env.local file.')
      console.error('[Checkout] NEXT_PUBLIC_RAZORPAY_KEY_ID is', key)
      return
    }

    // Track what was created so we can rollback cleanly
    let reserved = false
    let rentalId: string | null = null
    let paymentRecordId: string | null = null

    // ── Helper: full rollback ─────────────────────────────────────────────────
    const rollback = async (reason: 'cancelled' | 'failed') => {
      const t = await getToken()
      if (!t) return
      const headers = { Authorization: `Bearer ${t}` }

      // 1. Cancel the rental (sets status → "cancelled", frees inventory)
      if (rentalId) {
        try {
          await axios.patch(
            `${BASE_URL}/api/v1/rentals/${rentalId}/cancel`,
            { reason: `Payment ${reason} by user` },
            { headers }
          )
        } catch {
          // Non-critical: backend can auto-expire pending rentals by TTL
        }
      }

      // 2. Release the cart reservation lock
      if (reserved) {
        try {
          await axios.post(`${BASE_URL}/api/v1/cart/release`, {}, { headers })
        } catch {
          // Non-critical
        }
      }
    }

    try {
      // ── Step 1: Reserve cart items ─────────────────────────────────────────
      setProcessingStep('reserve')
      const reserveRes = await axios.post(
        `${BASE_URL}/api/v1/cart/reserve`,
        { reservationMinutes: 15 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!reserveRes.data.success) throw new Error('Items could not be reserved. Please try again.')
      reserved = true

      // ── Step 2: Create rental (status = "pending_payment") ─────────────────
      setProcessingStep('rental')
      const rentalRes = await axios.post(
        `${BASE_URL}/api/v1/rentals/from-cart`,
        {
          cartId: cart._id,
          addressId: selectedAddressId,
          deliverySlot,
          specialRequests,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!rentalRes.data.success) throw new Error('Could not create order. Please try again.')
      const rental = rentalRes.data.data.rental
      rentalId = rental._id
      

      // ── Step 3: Use backend's authoritative amount ─────────────────────────
      // NEVER recalculate on the frontend — rounding (Math.round etc.) causes
      // mismatches with the backend's exact decimal figure → "Invalid rent amount"
      setProcessingStep('payment')
      // const amountDue: number =
      //   rental.rentalDetails?.totalAmount ??
      //   rental.pricing?.totalAmount ??
      //   rental.totalAmount ??
      //   rental.amount

            const amountDue = typeof rental.rentalDetails?.totalAmount === 'number'
        ? rental.rentalDetails.totalAmount
        : computeRentalPayableFromCart(cart!).total

      if (!amountDue) throw new Error('Could not determine payment amount. Please try again.')

      const payInitRes = await axios.post(
        `${BASE_URL}/api/v1/payments/initiate`,
        {
          rentalId,
          amount: amountDue,
          paymentType: 'rent',
          paymentMethod: 'credit_card',
          gateway: 'razorpay',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!payInitRes.data.success) throw new Error('Payment initialization failed. Please try again.')

      const { payment, gatewayOrder } = payInitRes.data.data as {
        payment: { _id: string }
        gatewayOrder: { id: string }
      }
      paymentRecordId = payment._id

      if (!gatewayOrder?.id) throw new Error('Payment gateway did not respond. Please try again.')

      // ── Step 4: Load Razorpay SDK & open modal ─────────────────────────────
      setProcessingStep('opening')
      const rzLoaded = await loadRazorpayScript()
      if (!rzLoaded) throw new Error('Could not load payment SDK. Check your internet connection and try again.')
      setProcessingStep(null) // Hide overlay — Razorpay modal takes over the UI

      await new Promise<void>((resolve, reject) => {
        let settled = false

        const Rz = (window as unknown as {
          Razorpay: new (o: Record<string, unknown>) => { open: () => void }
        }).Razorpay

        const rzp = new Rz({
          key,
          order_id: gatewayOrder.id,
          currency: 'INR',
          name: 'RentEase',
          description: 'Rental Payment',
          notes: { rentalId: String(rentalId) },
          prefill: {
            email: (session?.user as { email?: string } | undefined)?.email,
            name:  (session?.user as { name?: string }  | undefined)?.name,
          },
          theme: { color: '#2874f0' },

          // ✅ USER PAID — Razorpay calls this synchronously after payment
          // IMPORTANT: handler must be synchronous (not async). We kick off an
          // async IIFE inside it so Razorpay doesn't receive a Promise return value.
          handler: (response: {
            razorpay_payment_id: string
            razorpay_order_id: string
            razorpay_signature: string
          }) => {
            if (settled) return
            settled = true

            // Run async work inside a non-async wrapper so Razorpay is unaffected
            ;(async () => {
              try {
                setProcessingStep('verify')

                // Always get a fresh token — the one in outer closure may be stale
                // after the user spent time on the Razorpay modal
                const freshToken = await getToken()
                if (!freshToken) {
                  reject(new Error('Session expired during payment. Please log in again.'))
                  return
                }

                console.log('[Checkout] Verifying payment:', {
                  paymentRecordId: payment._id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                })

                const verifyRes = await axios.post(
                  `${BASE_URL}/api/v1/payments/${payment._id}/verify`,
                  {
                    gateway: 'razorpay',
                    orderId:   response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                  },
                  { headers: { Authorization: `Bearer ${freshToken}` } }
                )

                console.log('[Checkout] Verify response:', verifyRes.data)

                if (!verifyRes.data.success) {
                  throw new Error(
                    verifyRes.data?.message ||
                    verifyRes.data?.error?.message ||
                    'Payment verification failed'
                  )
                }

                // ✅ All done — go to success page
                router.push(`/checkout/success?orderId=${rentalId}`)
                resolve()
              } catch (err: unknown) {
                const msg = axios.isAxiosError(err)
                  ? String((err.response?.data as { message?: string; error?: { message?: string } })?.message
                      || (err.response?.data as { error?: { message?: string } })?.error?.message
                      || 'Verification request failed')
                  : err instanceof Error ? err.message : 'Verification failed'
                console.error('[Checkout] Verify error:', msg, err)
                reject(new Error(msg))
              }
            })()
          },

          // ❌ USER CLOSED MODAL without paying
          modal: {
            ondismiss: () => {
              if (!settled) {
                settled = true
                reject(new Error('CANCELLED'))
              }
            },
          },
        })

        rzp.open()
      })

    } catch (err: unknown) {
      setProcessingStep(null)
      const msg = err instanceof Error ? err.message : 'Something went wrong'

      if (msg === 'CANCELLED') {
        toast.info('Payment cancelled. Your order has not been placed.')
        await rollback('cancelled')
      } else {
        toast.error(msg || 'Payment failed. Please try again.')
        await rollback('failed')
      }
    } finally {
      setProcessingStep(null)
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedAddress = addresses.find(a => a._id === selectedAddressId)

  const platformFee = 49
  const tax = cart ? Math.round(cart.summary.grandTotal * 0.18) : 0
  const grandTotal = cart
    ? cart.summary.grandTotal + cart.summary.securityDepositTotal + cart.summary.deliveryChargesTotal + platformFee + tax - couponDiscount
    : 0

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
          <Skeleton className="h-7 sm:h-8 w-40 sm:w-48 mb-6" />
          <div className="grid lg:grid-cols-[1fr_360px] gap-4">
            <div className="space-y-4">
              <Skeleton className="h-40 sm:h-48 rounded-xl" />
              <Skeleton className="h-36 sm:h-40 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-72 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!cart) return null

  return (
    <>
      {processingStep && <ProcessingOverlay step={processingStep} />}

      <div className="min-h-screen bg-[#f1f3f6] font-sans pb-24 lg:pb-0">
        {/* Top bar */}
        <div className="bg-white border-b border-[#e0e0e0] px-4 py-3 sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h1 className="text-[#2874f0] font-black text-xl sm:text-2xl tracking-tight">RentEase</h1>
                <div className="hidden sm:flex items-center gap-4">
                  <StepPill n={1} label="Address" done={activeStep !== 'address'} active={activeStep === 'address'} />
                  <ChevronRight className="w-4 h-4 text-[#ccc]" />
                  <StepPill n={2} label="Delivery" done={activeStep === 'payment'} active={activeStep === 'slot'} />
                  <ChevronRight className="w-4 h-4 text-[#ccc]" />
                  <StepPill n={3} label="Payment" done={false} active={activeStep === 'payment'} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#888]">
                <Lock className="w-3 h-3 text-[#388e3c]" />
                <span className="font-semibold text-[#388e3c] hidden xs:inline">Secure Checkout</span>
                <span className="font-semibold text-[#388e3c] xs:hidden">Secure</span>
              </div>
            </div>
            <MobileStepper activeStep={activeStep} />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 sm:py-6">
          <div className="grid lg:grid-cols-[1fr_360px] gap-3 sm:gap-4 items-start">

            {/* ── LEFT: Steps ─────────────────────────────────────────────── */}
            <div className="space-y-3">

              {/* STEP 1: Address */}
              <StepBlock
                stepNum={1} title="DELIVERY ADDRESS"
                subtitle="Choose where to deliver your rental"
                isActive={activeStep === 'address'}
                isDone={activeStep !== 'address'}
                onEdit={() => setActiveStep('address')}
                donePreview={selectedAddress && (
                  <p className="text-[11px] sm:text-xs text-[#555] mt-0.5">
                    {selectedAddress.addressLine1}, {selectedAddress.city} – {selectedAddress.pincode}
                  </p>
                )}
              >
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 bg-[#f0f5ff] rounded-full flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 text-[#2874f0]" />
                    </div>
                    <p className="text-sm font-semibold text-[#333] mb-1">No saved addresses</p>
                    <p className="text-xs text-[#888] mb-4">Add an address to receive your rental</p>
                    <button onClick={() => setShowAddAddress(true)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2874f0] to-[#1a5fd0] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                      <Plus className="w-4 h-4" /> ADD NEW ADDRESS
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                      {addresses.map(a => (
                        <AddressCard key={a._id} address={a}
                          isSelected={selectedAddressId === a._id}
                          onSelect={() => setSelectedAddressId(a._id)}
                          onDelete={() => {}} // implement as needed
                        />
                      ))}
                      <button onClick={() => setShowAddAddress(true)}
                        className="border-2 border-dashed border-[#d0d4db] rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-[#888] hover:border-[#2874f0] hover:text-[#2874f0] hover:bg-[#f0f5ff] transition-all min-h-[90px] sm:min-h-[100px]">
                        <Plus className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wide">Add New Address</span>
                      </button>
                    </div>
                    <button onClick={confirmAddress} disabled={!selectedAddressId}
                      className="w-full sm:w-auto bg-[#fb641b] hover:bg-[#f4591f] disabled:bg-[#f5a58a] disabled:cursor-not-allowed text-white font-black text-sm px-8 py-3.5 rounded-lg transition-all flex items-center justify-center gap-2">
                      DELIVER HERE <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </StepBlock>

              {/* STEP 2: Delivery Slot */}
              <StepBlock
                stepNum={2} title="DELIVERY SLOT"
                subtitle="Pick a convenient delivery window"
                isActive={activeStep === 'slot'}
                isDone={activeStep === 'payment'}
                onEdit={() => setActiveStep('slot')}
                donePreview={deliverySlot && (
                  <p className="text-[11px] sm:text-xs text-[#555] mt-0.5">
                    {new Date(deliverySlot.split('|')[0]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {deliverySlot.split('|')[1]}
                  </p>
                )}
              >
                <DeliverySlotPicker onSelect={setDeliverySlot} />

                <div className="mt-4">
                  <label className="text-xs font-semibold text-[#666] uppercase tracking-wide block mb-2">
                    Special Instructions <span className="font-normal text-[#aaa] normal-case">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border border-[#e0e0e0] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2874f0] resize-none"
                    placeholder="e.g. Call before delivery · Leave at security desk"
                    value={specialRequests}
                    onChange={e => setSpecialRequests(e.target.value)}
                  />
                </div>

                <button onClick={confirmSlot} disabled={!deliverySlot}
                  className="mt-4 w-full sm:w-auto bg-[#fb641b] hover:bg-[#f4591f] disabled:bg-[#f5a58a] disabled:cursor-not-allowed text-white font-black text-sm px-8 py-3.5 rounded-lg transition-all flex items-center justify-center gap-2">
                  CONFIRM SLOT <ArrowRight className="w-4 h-4" />
                </button>
              </StepBlock>

              {/* STEP 3: Payment */}
              <StepBlock
                stepNum={3} title="PAYMENT"
                subtitle="Review your order and pay securely"
                isActive={activeStep === 'payment'}
                isDone={false}
              >
                {/* Coupon */}
                <div className="mb-5">
                  <p className="text-xs font-bold text-[#333] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#2874f0]" /> Apply Coupon
                  </p>
                  <CouponBox initialCode={cart?.coupon?.code} onApply={(_, d) => setCouponDiscount(d)} />
                </div>

                {/* Price summary */}
                <div className="bg-[#f7f7f7] rounded-lg p-4 mb-5 border border-[#e0e0e0]">
                  <p className="text-xs font-bold text-[#333] uppercase tracking-wide mb-3">Price Details</p>
                  <PriceSummary cart={cart} couponDiscount={couponDiscount} />
                </div>

                {/* Pay button — hidden on mobile, shown via sticky bottom bar instead */}
                <div className="space-y-3 hidden lg:block">
                  <button onClick={handleProceedToPay}
                    className="w-full bg-gradient-to-r from-[#fb641b] to-[#f4591f] hover:shadow-xl hover:shadow-orange-500/25 text-white font-black text-base py-4 rounded-lg flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.99]">
                    <Zap className="w-5 h-5" />
                    PAY {fmt(grandTotal)} SECURELY
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <div className="flex items-center justify-center gap-6 text-[11px] text-[#888]">
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-[#388e3c]" /> 256-bit SSL</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-[#388e3c]" /> PCI DSS</span>
                    <span className="flex items-center gap-1"><Banknote className="w-3 h-3 text-[#388e3c]" /> Deposit refundable</span>
                  </div>
                </div>

                {/* Mobile: compact trust strip only (button lives in sticky bar) */}
                <div className="flex lg:hidden items-center justify-center flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-[#888] mb-1">
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-[#388e3c]" /> 256-bit SSL</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-[#388e3c]" /> PCI DSS</span>
                  <span className="flex items-center gap-1"><Banknote className="w-3 h-3 text-[#388e3c]" /> Refundable</span>
                </div>

                <div className="flex items-center gap-2 bg-[#fff8e1] border border-[#ffe082] rounded-lg p-3 mt-3">
                  <AlertCircle className="w-4 h-4 text-[#f57c00] shrink-0" />
                  <p className="text-[11px] sm:text-xs text-[#795548]">
                    <strong>Rental will only be created after successful payment.</strong> Cancelling payment will not place any order.
                  </p>
                </div>

                {/* Accepted payment methods */}
                <div className="mt-4 pt-4 border-t border-[#e0e0e0]">
                  <p className="text-[11px] text-[#888] mb-2 text-center">Powered by Razorpay · Accepted methods:</p>
                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#666]">
                    {['💳 Credit Card', '💳 Debit Card', '📱 UPI', '🏦 Net Banking', '👛 Wallets', '💰 EMI'].map(m => (
                      <span key={m} className="px-2 sm:px-2.5 py-1 rounded bg-white border border-[#e0e0e0] font-medium">{m}</span>
                    ))}
                  </div>
                </div>
              </StepBlock>

              {/* Static trust content: FAQ */}
              <FAQAccordion />
            </div>

            {/* ── RIGHT: Order summary ────────────────────────────────────── */}
            <div className="lg:sticky lg:top-[88px] space-y-3">
              {/* Items */}
              <div className="bg-white rounded-xl border border-[#e0e0e0] overflow-hidden">
                <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#f0f0f0] flex items-center justify-between">
                  <h3 className="font-black text-[#333] text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#2874f0]" />
                    Your Rental ({cart.summary.itemsCount})
                  </h3>
                </div>
                <div className="divide-y divide-[#f5f5f5] max-h-64 overflow-y-auto">
                  {cart.items.map(item => (
                    <div key={item._id} className="px-4 sm:px-5 py-3.5 flex gap-3 items-center">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded bg-[#f5f5f5] overflow-hidden shrink-0 border border-[#e8e8e8]">
                        {item.product.media?.images?.[0]?.thumbnail && (
                          <img src={item.product.media.images[0].thumbnail}
                            alt={item.product.basicInfo.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[#333] truncate">{item.product.basicInfo.name}</p>
                        <p className="text-[11px] sm:text-xs text-[#888] mt-0.5">Qty {item.quantity} · {item.rentalMonths} months</p>
                      </div>
                      <p className="text-xs sm:text-sm font-black text-[#333] shrink-0">{fmt(item.totals.lineTotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price summary card */}
              <div className="bg-white rounded-xl border border-[#e0e0e0] overflow-hidden">
                <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#f0f0f0]">
                  <h3 className="font-black text-[#333] text-xs sm:text-sm uppercase tracking-wide">Price Details</h3>
                </div>
                <div className="px-4 sm:px-5 py-4">
                  <PriceSummary cart={cart} couponDiscount={couponDiscount} />
                </div>
              </div>

              {/* Trust badges */}
              <div className="bg-white rounded-xl border border-[#e0e0e0] px-4 sm:px-5 py-4 space-y-2.5">
                {[
                  { icon: Shield, text: 'Safe & Secure Payments', sub: '100% authentic products' },
                  { icon: Banknote, text: 'Deposit 100% Refundable', sub: 'Returned at end of rental' },
                  { icon: Star, text: 'Quality Guaranteed', sub: 'Professionally serviced items' },
                  { icon: Truck, text: 'On-Time Delivery', sub: 'Track your order live' },
                ].map(({ icon: Ic, text, sub }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f0f5ff] flex items-center justify-center shrink-0">
                      <Ic className="w-4 h-4 text-[#2874f0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#333]">{text}</p>
                      <p className="text-[11px] text-[#888]">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile pay bar — only visible during the payment step on small screens */}
      <AnimatePresence>
        {activeStep === 'payment' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-[#e0e0e0] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-3 py-2.5"
            style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <p className="text-[10px] text-[#888] font-medium uppercase tracking-wide">Total</p>
                <p className="text-base font-black text-[#333] leading-tight">{fmt(grandTotal)}</p>
              </div>
              <button onClick={handleProceedToPay}
                className="flex-1 bg-gradient-to-r from-[#fb641b] to-[#f4591f] active:scale-[0.98] text-white font-black text-sm py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all">
                <Zap className="w-4 h-4" />
                PAY SECURELY
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddAddressModal open={showAddAddress} onClose={() => setShowAddAddress(false)} onSave={handleAddAddress} />
    </>
  )
}