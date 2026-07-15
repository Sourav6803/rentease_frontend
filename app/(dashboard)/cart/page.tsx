

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingCart,
  Trash2,
  Loader2,
  ArrowRight,
  CreditCard,
  Shield,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Tag,
  Sparkles,
  ChevronRight,
  Package,
  CheckCircle2,
  Info,
  Star,
  Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { applyCartCoupon, removeCartCoupon, getPublicCoupons, type PublicCoupon } from '@/lib/api/coupons'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ─── Types ─────────────────────────────────────────────────────────────────

interface ProductImage {
  url: string
  thumbnail: string
  isPrimary: boolean
}

interface CartItemProduct {
  _id: string
  basicInfo: {
    name: string
    slug: string
  }
  media?: {
    images?: ProductImage[]
  }
  pricing: {
    monthlyRent: number
    securityDeposit: number
    deliveryCharges: number
  }
  inventory: {
    availableQuantity: number
  }
  status: {
    isActive: boolean
  }
  rentalTerms: {
    minRentalMonths: number
    maxRentalMonths: number
  }
}

interface CartItemTotals {
  monthlySubtotal: number
  tenureSubtotal: number
  securityDepositTotal: number
  deliveryChargesTotal: number
  lineTotal: number
}

interface CartItemPricing {
  discountPercent?: number
}

interface CartItem {
  _id: string
  product: CartItemProduct
  quantity: number
  rentalMonths: number
  totals: CartItemTotals
  pricing?: CartItemPricing
}

interface CartSummary {
  itemsCount: number
  totalQuantity: number
  monthlyRentTotal: number
  securityDepositTotal: number
  deliveryChargesTotal: number
  subtotal?: number
  discountAmount?: number
  grandTotal: number
}

interface CartCoupon {
  code: string
  type?: string
  value?: number
  discountAmount?: number
  isValid?: boolean
}

interface Cart {
  _id: string
  items: CartItem[]
  summary: CartSummary
  coupon?: CartCoupon | null
}

// ─── Duration Selector ──────────────────────────────────────────────────────

function RentalDurationSelector({
  minMonths,
  maxMonths,
  value,
  onChange,
  monthlyRent,
  disabled,
}: {
  minMonths: number
  maxMonths: number
  value: number
  onChange: (months: number) => void
  monthlyRent: number
  disabled?: boolean
}) {
  const durations: number[] = []
  for (let i = minMonths; i <= maxMonths; i += 3) {
    durations.push(i)
  }
  if (!durations.includes(maxMonths)) durations.push(maxMonths)

  const getDiscount = (months: number) => {
    if (months >= 12) return 20
    if (months >= 9) return 15
    if (months >= 6) return 10
    return 0
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {durations.map((months) => {
        const discount = getDiscount(months)
        const isSelected = value === months

        return (
          <button
            key={months}
            onClick={() => !disabled && onChange(months)}
            disabled={disabled}
            aria-pressed={isSelected}
            className={`
              relative px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
              ${
                isSelected
                  ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50/50'
              }
              ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {months}mo
            {discount > 0 && (
              <span className="absolute -top-2.5 -right-1.5 text-[9px] font-bold bg-emerald-500 text-white rounded-full px-1.5 py-0.5 leading-none shadow-sm">
                -{discount}%
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Quantity Selector ──────────────────────────────────────────────────────

function QuantitySelector({
  quantity,
  available,
  onChange,
  disabled,
}: {
  quantity: number
  available: number
  onChange: (qty: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
      <button
        onClick={() => onChange(Math.max(1, quantity - 1))}
        disabled={disabled || quantity <= 1}
        aria-label="Decrease quantity"
        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-9 text-center text-sm font-semibold text-slate-800 select-none">
        {quantity}
      </span>
      <button
        onClick={() => onChange(Math.min(available, quantity + 1))}
        disabled={disabled || quantity >= available}
        aria-label="Increase quantity"
        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

// ─── Cart Item ──────────────────────────────────────────────────────────────

function CartItemCard({
  item,
  onUpdate,
  onRemove,
  isUpdating,
}: {
  item: CartItem
  onUpdate: (itemId: string, data: { quantity?: number; rentalMonths?: number }) => void
  onRemove: (itemId: string) => void
  isUpdating: boolean
}) {
  const [removing, setRemoving] = useState(false)
  const product = item.product
  const primaryImage =
    product.media?.images?.find((img) => img.isPrimary)?.thumbnail ||
    product.media?.images?.[0]?.thumbnail

  const monthlyPrice = item.quantity > 0 ? item.totals.monthlySubtotal / item.quantity : 0
  const discountPercent = item.pricing?.discountPercent ?? 0
  const effectiveMonthly = monthlyPrice * (1 - discountPercent / 100)

  const handleRemove = async () => {
    setRemoving(true)
    await onRemove(item._id)
    // parent will remove the item from list; keep removing=true to let exit animate
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: removing ? 0 : 1, y: 0, scale: removing ? 0.97 : 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative"
    >
      <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200">
        {/* Image */}
        <Link href={`/products/${product.basicInfo.slug}`} className="shrink-0 block">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden border border-slate-100 relative">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.basicInfo.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-8 w-8 text-slate-300" />
              </div>
            )}
            {discountPercent > 0 && (
              <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[9px] font-bold rounded-md px-1.5 py-0.5">
                -{discountPercent}%
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/products/${product.basicInfo.slug}`} className="min-w-0">
              <h3 className="font-semibold text-slate-900 hover:text-amber-600 transition-colors text-sm sm:text-base leading-snug line-clamp-2">
                {product.basicInfo.name}
              </h3>
            </Link>

            {/* Price – desktop */}
            <div className="hidden sm:block text-right shrink-0 ml-2">
              <p className="text-lg font-bold text-slate-900">
                ₹{item.totals.lineTotal.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400 whitespace-nowrap">
                ₹{effectiveMonthly.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/mo ×{' '}
                {item.rentalMonths}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-0.5">
            ₹{product.pricing.monthlyRent.toLocaleString('en-IN')}/month base rent
          </p>

          <div className="mt-3 flex flex-wrap items-end gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                Duration
              </p>
              <RentalDurationSelector
                minMonths={product.rentalTerms?.minRentalMonths || 1}
                maxMonths={product.rentalTerms?.maxRentalMonths || 12}
                value={item.rentalMonths}
                onChange={(months) => onUpdate(item._id, { rentalMonths: months })}
                monthlyRent={product.pricing.monthlyRent}
                disabled={isUpdating}
              />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                Qty
              </p>
              <QuantitySelector
                quantity={item.quantity}
                available={product.inventory.availableQuantity}
                onChange={(qty) => onUpdate(item._id, { quantity: qty })}
                disabled={isUpdating}
              />
            </div>
          </div>

          {/* Price – mobile */}
          <div className="flex items-center justify-between mt-3 sm:hidden">
            <p className="font-bold text-slate-900 text-base">
              ₹{item.totals.lineTotal.toLocaleString('en-IN')}
            </p>
            <button
              onClick={handleRemove}
              disabled={isUpdating}
              aria-label="Remove item"
              className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>

        {/* Desktop remove */}
        <div className="hidden sm:flex flex-col items-end justify-between ml-2 shrink-0">
          <button
            onClick={handleRemove}
            disabled={isUpdating}
            aria-label="Remove item"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-150 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {product.inventory.availableQuantity <= 5 && (
            <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
              <Zap className="h-2.5 w-2.5" />
              Only {product.inventory.availableQuantity} left
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Order Summary ──────────────────────────────────────────────────────────

function OrderSummary({
  cart,
  onCheckout,
  onCartUpdate,
}: {
  cart: Cart
  onCheckout: () => void
  onCartUpdate: (cart: Cart) => void
}) {
  const couponApplied = !!cart.coupon?.isValid
  const [coupon, setCoupon] = useState(cart.coupon?.code ?? '')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [offers, setOffers] = useState<PublicCoupon[]>([])

  useEffect(() => {
    let active = true
    getPublicCoupons()
      .then((list) => { if (active) setOffers(list) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  const deliveryCharges = cart.summary.deliveryChargesTotal
  const itemsSubtotal = cart.summary.subtotal ?? cart.summary.grandTotal
  const discount = cart.summary.discountAmount ?? 0
  const netItems = itemsSubtotal - discount
  const gst = Math.round(netItems * 0.18)
  const grandTotal = netItems + cart.summary.securityDepositTotal + deliveryCharges + gst

  const handleApplyCoupon = async (codeOverride?: string) => {
    const codeToUse = (codeOverride ?? coupon).trim()
    if (!codeToUse) return
    setCoupon(codeToUse)
    setApplyingCoupon(true)
    try {
      const updated = await applyCartCoupon(codeToUse)
      onCartUpdate(updated as unknown as Cart)
      const saved = Number(updated.summary?.discountAmount ?? 0)
      toast.success(saved > 0 ? `Coupon applied! You saved ₹${saved.toLocaleString('en-IN')}` : 'Coupon applied!')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      toast.error(error.response?.data?.message || error.message || 'Invalid or expired coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = async () => {
    setApplyingCoupon(true)
    try {
      const updated = await removeCartCoupon()
      onCartUpdate(updated as unknown as Cart)
      setCoupon('')
      toast.success('Coupon removed')
    } catch {
      toast.error('Failed to remove coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const lineItems = [
    {
      label: `Subtotal (${cart.summary.itemsCount} item${cart.summary.itemsCount > 1 ? 's' : ''})`,
      value: itemsSubtotal,
      highlight: false,
    },
    {
      label: 'Security Deposit',
      value: cart.summary.securityDepositTotal,
      highlight: false,
      note: 'Refundable',
    },
    {
      label: 'Delivery Charges',
      value: deliveryCharges,
      highlight: false,
      free: deliveryCharges === 0,
    },
    { label: 'GST (18%)', value: gst, highlight: false },
  ]

  if (discount > 0) {
    lineItems.push({ label: 'Coupon Discount', value: -discount, highlight: true })
  }

  return (
    <div className="space-y-4 sticky top-6">
      {/* Promo banner */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 flex items-start gap-3">
        <div className="mt-0.5 w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Save up to 20% more!</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Choose 12-month rentals to unlock maximum savings on your order.
          </p>
        </div>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Order Summary</h2>
        </div>

        <div className="px-5 py-4 space-y-3">
          {lineItems.map((item) => (
            <div key={item.label} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5">
                <span className={item.highlight ? 'text-emerald-600 font-medium' : 'text-slate-500'}>
                  {item.label}
                </span>
                {item.note && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5 font-semibold">
                    {item.note}
                  </span>
                )}
              </div>
              <span
                className={`font-semibold ${
                  item.highlight
                    ? 'text-emerald-600'
                    : item.value < 0
                    ? 'text-emerald-600'
                    : 'text-slate-800'
                }`}
              >
                {item.free ? (
                  <span className="text-emerald-600 font-bold text-xs uppercase tracking-wide">
                    FREE
                  </span>
                ) : (
                  `${item.value < 0 ? '-' : ''}₹${Math.abs(item.value).toLocaleString('en-IN')}`
                )}
              </span>
            </div>
          ))}

          <Separator className="my-1" />

          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-slate-900">Total Payable</span>
            <div className="text-right">
              <span className="text-xl font-black text-slate-900">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 flex items-start gap-1">
            <Info className="h-3 w-3 shrink-0 mt-0.5" />
            Security deposit is fully refundable after inspection at the end of your rental period.
          </p>
        </div>

        {/* Coupon */}
        <div className="px-5 pb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                className="pl-8 h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                disabled={couponApplied}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={couponApplied ? handleRemoveCoupon : () => handleApplyCoupon()}
              disabled={applyingCoupon || (!couponApplied && !coupon.trim())}
              className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              {applyingCoupon ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : couponApplied ? (
                'Remove'
              ) : (
                'Apply'
              )}
            </Button>
          </div>
          {couponApplied && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {cart.coupon?.code} applied — you saved ₹{discount.toLocaleString('en-IN')}
            </div>
          )}

          {!couponApplied && offers.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Available offers</p>
              <div className="flex flex-wrap gap-1.5">
                {offers.map((o) => (
                  <button
                    key={o.code}
                    onClick={() => handleApplyCoupon(o.code)}
                    disabled={applyingCoupon}
                    className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 hover:bg-amber-100 transition-colors disabled:opacity-50"
                  >
                    {o.code}
                    {o.value ? (o.type === 'percentage' ? ` · ${o.value}%` : ` · ₹${o.value}`) : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onCheckout}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md shadow-amber-200 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <CreditCard className="h-4 w-4" />
            Proceed to Checkout
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        </div>
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Shield, label: 'Secure Pay', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: Truck, label: 'Free Delivery', color: 'text-sky-600', bg: 'bg-sky-50' },
          { icon: RotateCcw, label: 'Easy Return', color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map(({ icon: Icon, label, color, bg }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white border border-slate-100 text-center"
          >
            <div className={`w-7 h-7 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`h-3.5 w-3.5 ${color}`} />
            </div>
            <p className="text-[10px] font-semibold text-slate-500 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Rating blurb */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-100 px-4 py-3">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-xs text-slate-500 font-medium">
          4.9/5 — <span className="text-slate-700">50,000+ happy renters</span>
        </p>
      </div>
    </div>
  )
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyCart({ isGuest = false }: { isGuest?: boolean }) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-20 px-4"
    >
      <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
        <ShoppingCart className="h-12 w-12 text-amber-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">
        {isGuest ? 'Your cart is waiting' : 'Your cart is empty'}
      </h2>
      <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
        {isGuest
          ? 'Log in to view items you saved or to start renting your favorites.'
          : "Looks like you haven't added anything yet. Explore our curated collection!"}
      </p>
      {isGuest ? (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => router.push('/login?callbackUrl=/cart')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-200 transition-all duration-200 hover:scale-105 active:scale-100"
          >
            Login
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push('/products')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all duration-200"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <button
          onClick={() => router.push('/products')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-200 transition-all duration-200 hover:scale-105 active:scale-100"
        >
          Browse Products
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  )
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function CartSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white">
          <Skeleton className="w-24 h-24 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <div className="flex gap-3 mt-4">
              <Skeleton className="h-9 w-40 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2 items-end hidden sm:flex flex-col">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      setCart(null)
      setIsLoading(false)
    }
    if (status === 'authenticated') {
      fetchCart()
    }
  }, [status])

  const fetchCart = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/cart/me`, {
        headers: { Authorization: `Bearer ${(session?.user?.accessToken)}` },
      })
      if (response.data.success) {
        setCart(response.data.data.cart)
      }
    } catch {
      toast.error('Failed to load your cart', { description: 'Please refresh and try again.' })
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const handleUpdateItem = useCallback(
    async (itemId: string, data: { quantity?: number; rentalMonths?: number }) => {
      setIsUpdating(true)
      try {
        const response = await axios.put(
          `${BASE_URL}/api/v1/cart/items/${itemId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${(session?.user?.accessToken)}`,
            },
          }
        )
        if (response.data.success) {
          setCart(response.data.data.cart)
          toast.success('Cart updated')
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        toast.error(error.response?.data?.message || 'Failed to update cart')
      } finally {
        setIsUpdating(false)
      }
    },
    [session]
  )

  const handleRemoveItem = useCallback(
    async (itemId: string) => {
      setIsUpdating(true)
      try {
        const response = await axios.delete(`${BASE_URL}/api/v1/cart/item/${itemId}`, {
          headers: {
            Authorization: `Bearer ${(session?.user as { accessToken?: string })?.accessToken}`,
          },
        })
        if (response.data.success) {
          setCart(response.data.data.cart)
          toast.success('Item removed')
        }
      } catch {
        toast.error('Failed to remove item')
      } finally {
        setIsUpdating(false)
      }
    },
    [session]
  )

  const handleCheckout = () => router.push('/checkout')

  // ── Loading state ──
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Skeleton className="h-8 w-48 mb-8 rounded-xl" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartSkeleton />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Empty state ──
  if (!cart || cart.items.length === 0) {
    const isGuest = status === 'unauthenticated'
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <EmptyCart isGuest={isGuest} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              My Cart
              <span className="ml-2 text-base font-semibold text-slate-400">
                ({cart.summary.itemsCount} item{cart.summary.itemsCount > 1 ? 's' : ''})
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Review your items before checkout</p>
          </div>

          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-amber-600 transition-colors"
          >
            ← Continue Shopping
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* Items column */}
          <div className="lg:col-span-2 space-y-3">
            {/* Updating overlay */}
            <AnimatePresence>
              {isUpdating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-sm text-amber-600 font-medium bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5"
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating your cart…
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {cart.items.map((item) => (
                <CartItemCard
                  key={item._id}
                  item={item}
                  onUpdate={handleUpdateItem}
                  onRemove={handleRemoveItem}
                  isUpdating={isUpdating}
                />
              ))}
            </AnimatePresence>

            {/* Mobile: continue shopping */}
            <Link
              href="/products"
              className="sm:hidden flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-amber-600 transition-colors py-2"
            >
              ← Continue Shopping
            </Link>

            {/* Delivery info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 mt-2"
            >
              <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">
                Your order qualifies for{' '}
                <span className="font-bold">free delivery</span> — items delivered within 3–5 business days.
              </p>
            </motion.div>
          </div>

          {/* Summary column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <OrderSummary cart={cart} onCheckout={handleCheckout} onCartUpdate={setCart} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}