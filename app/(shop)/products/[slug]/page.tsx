
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Clock,
  CheckCircle,
  Loader2,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Twitter,
  Facebook,
  Copy,
  Check,
  ThumbsUp,
  Flag,
  Package,
  Award,
  Zap,
  MessageCircle,
  MapPin,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Info,
  ChevronDown,
  Eye,
  TrendingUp,
  Gift,
  Headphones,
  Wallet,
  HelpCircle,
  Tag,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import axios from 'axios'

import { addRecentlyViewed } from '@/lib/recentlyViewed'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { getPublicCoupons, type PublicCoupon } from '@/lib/api/coupons'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Shared premium button style — blue gradient, used everywhere instead of black
const PRIMARY_BTN =
  'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-sm shadow-blue-500/25'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  _id: string
  basicInfo: { name: string; slug: string; brand?: string; description: string; sku: string }
  pricing: {
    monthlyRent: number
    securityDeposit: number
    deliveryCharges: number
    rentalOptions: Array<{ months: number; discount: number; monthlyPrice: number; totalPrice: number }>
  }
  media?: {
    images?: Array<{ url: string; thumbnail: string; isPrimary: boolean; _id?: string }>
    videos?: Array<{ url: string; thumbnail: string; title: string }>
  }
  inventory: { availableQuantity: number; totalQuantity: number }
  ratings: { average: number; count: number; distribution: { 1: number; 2: number; 3: number; 4: number; 5: number } }
  condition: string
  category: { _id: string; name: string; slug: string }
  vendor: {
    _id: string
    business: { name: string; description?: string }
    performance: { rating: { average: number; count: number }; metrics: { completedRentals: number; responseRate: number } }
  }
  specifications?: Record<string, any>
  rentalTerms: {
    minRentalMonths: number
    maxRentalMonths: number
    cancellationPolicy: string
    deliveryAvailable: boolean
    pickupAvailable: boolean
    serviceablePincodes: string[]
  }
  features: string[]
  status: { isActive: boolean }
}

interface Review {
  _id: string
  user: { _id: string; profile?: { firstName?: string; lastName?: string; avatar?: string } }
  rating: number
  title?: string
  content?: string
  images?: string[]
  helpful?: number
  createdAt: string
  vendorResponse?: { content: string; createdAt: string; vendor?: { name: string } }
}

interface ReviewSummary {
  average?: number
  total?: number
  distribution?: { 1: number; 2: number; 3: number; 4: number; 5: number }
  sentiment?: { positive: number; neutral: number; negative: number }
}

interface RelatedProduct {
  _id: string
  basicInfo: { name: string; slug: string }
  pricing: { monthlyRent: number }
  media?: { images?: Array<{ url: string; thumbnail: string; isPrimary: boolean }> }
  ratings: { average: number; count: number }
}

// ─── Utility Components ──────────────────────────────────────────────────────

const StarRating = ({ rating, size = 16, showText = false, count = 0 }: {
  rating: number; size?: number; showText?: boolean; count?: number
}) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className="inline-flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) return <Star key={i} className="fill-amber-500 text-amber-500" style={{ width: size, height: size }} />
        if (i === fullStars && hasHalfStar) {
          return (
            <div key={i} className="relative" style={{ width: size, height: size }}>
              <Star className="absolute text-slate-300" style={{ width: size, height: size }} />
              <Star className="absolute text-amber-500" style={{ width: size * 0.5, height: size, overflow: 'hidden' }} />
            </div>
          )
        }
        return <Star key={i} className="text-slate-300" style={{ width: size, height: size }} />
      })}
      {showText && (
        <span className="text-sm text-slate-500 ml-1">
          {rating.toFixed(1)} ({count?.toLocaleString('en-IN') || 0})
        </span>
      )}
    </div>
  )
}

const formatINR = (n: number) => (!n && n !== 0) ? '0' : n.toLocaleString('en-IN')

const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return (first + last).toUpperCase() || 'U'
}

const ProductGallery = ({ images }: { images?: Array<{ url: string; thumbnail: string; isPrimary: boolean; _id?: string }> }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const safeImages = images?.filter(img => img?.url) || []

  if (safeImages.length === 0) {
    return (
      <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Package className="w-16 h-16 text-blue-300" strokeWidth={1.25} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <img
          src={safeImages[selectedIndex]?.url}
          alt="Product"
          className={`w-full h-full object-cover transition-transform duration-500 ${isZoomed ? 'scale-110' : 'scale-100'}`}
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-sm">
          <Eye className="w-3 h-3" />
          {selectedIndex + 1} / {safeImages.length}
        </div>
        {safeImages.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex(prev => Math.max(0, prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-lg p-2 shadow-md hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={() => setSelectedIndex(prev => Math.min(safeImages.length - 1, prev + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-lg p-2 shadow-md hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {safeImages.map((img, idx) => (
            <button
              key={img._id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`flex-shrink-0 w-[72px] h-[72px] rounded-lg overflow-hidden border-2 transition-all ${
                idx === selectedIndex ? 'border-blue-600' : 'border-transparent'
              }`}
            >
              <img src={img.thumbnail || img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Rental Options ──────────────────────────────────────────────────────────

const RentalOptions = ({ product, onSelect }: { product: Product; onSelect: (months: number) => void }) => {
  const [selectedMonths, setSelectedMonths] = useState<number | null>(null)
  const durations = [3, 6, 9, 12]

  const getOption = (months: number) => product.pricing.rentalOptions?.find(o => o.months === months)
  const getMonthlyPrice = (months: number) => getOption(months)?.monthlyPrice ?? product.pricing.monthlyRent
  const getTotalPrice = (months: number) => getOption(months)?.totalPrice ?? product.pricing.monthlyRent * months
  const getDiscount = (months: number) => getOption(months)?.discount ?? 0
  const isAvailable = (months: number) =>
    months >= product.rentalTerms.minRentalMonths && months <= product.rentalTerms.maxRentalMonths

  const handleSelect = (months: number) => {
    if (!isAvailable(months)) return
    setSelectedMonths(months)
    onSelect(months)
  }

  const selectedTotal = selectedMonths ? getTotalPrice(selectedMonths) : 0
  const selectedMonthly = selectedMonths ? getMonthlyPrice(selectedMonths) : 0

  return (
    <div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Rental Duration</div>
      <div className="grid grid-cols-4 gap-2.5">
        {durations.map(months => {
          const avail = isAvailable(months)
          const discount = getDiscount(months)
          return (
            <div
              key={months}
              onClick={() => avail && handleSelect(months)}
              className={`relative p-3 rounded-xl border-2 text-center transition-all cursor-pointer
                ${!avail ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''}
                ${selectedMonths === months ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300'}`}
            >
              {discount > 0 && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {discount}% OFF
                </div>
              )}
              <div className="text-xl font-bold text-slate-900">{months}</div>
              <div className="text-[11px] text-slate-400 mb-1">months</div>
              <div className="text-sm font-semibold text-slate-700">
                ₹{formatINR(getMonthlyPrice(months))}
                <span className="text-[10px] font-normal text-slate-400">/mo</span>
              </div>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedMonths && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-blue-700 mb-1">TOTAL FOR {selectedMonths} MONTHS</div>
                <div className="text-3xl font-extrabold text-slate-900">₹{formatINR(selectedTotal)}</div>
                <div className="text-xs text-slate-500 mt-1">
                  ₹{formatINR(selectedMonthly)}/month × {selectedMonths} months
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Security Deposit</div>
                <div className="text-xl font-bold text-slate-900">₹{formatINR(product.pricing.securityDeposit)}</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">✓ 100% Refundable</div>
              </div>
            </div>
            {product.pricing.deliveryCharges > 0 && (
              <div className="mt-2 pt-2 border-t border-dashed border-blue-200 text-xs text-blue-700">
                + ₹{formatINR(product.pricing.deliveryCharges)} one-time delivery charges
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Rent vs Buy static value card ───────────────────────────────────────────

const RentVsBuySavings = ({ monthlyRent }: { monthlyRent: number }) => {
  const estimatedBuyPrice = monthlyRent * 22 // rough illustrative multiplier
  const yearlyRent = monthlyRent * 12
  const savings = Math.max(estimatedBuyPrice - yearlyRent, 0)
  const savingsPct = estimatedBuyPrice > 0 ? Math.round((savings / estimatedBuyPrice) * 100) : 0

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
        <Wallet className="w-4.5 h-4.5" />
      </div>
      <div className="text-sm">
        <p className="font-semibold text-emerald-800">
          Rent smart, save big
        </p>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
          Renting for a year costs roughly <strong>₹{formatINR(yearlyRent)}</strong> vs an estimated{' '}
          <strong>₹{formatINR(estimatedBuyPrice)}</strong> to buy new — that's about{' '}
          <span className="text-emerald-700 font-bold">{savingsPct}% saved</span>, with zero maintenance hassle.
        </p>
      </div>
    </div>
  )
}

// ─── Review Summary Panel ────────────────────────────────────────────────────

const ReviewSummaryPanel = ({ summary }: { summary: ReviewSummary | null }) => {
  const total = summary?.total || 0
  const average = summary?.average || 0
  const distribution = summary?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  if (total === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-6 text-center">
          <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No reviews yet</p>
          <p className="text-sm text-slate-400 mt-1">Be the first to review</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200">
      <CardContent className="p-6">
        <div className="text-center mb-5">
          <div className="text-5xl font-extrabold text-slate-900">{average.toFixed(1)}</div>
          <div className="my-2"><StarRating rating={average} size={20} /></div>
          <div className="text-sm text-slate-500">Based on {total.toLocaleString('en-IN')} reviews</div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(star => {
            const count = distribution[star as keyof typeof distribution] || 0
            const percentage = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="w-5 text-right text-xs font-semibold text-slate-500">{star}</div>
                <Star className="w-3 h-3 fill-amber-500 text-amber-500 flex-shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
                <div className="w-8 text-right text-xs text-slate-400">{count}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Reviews List ────────────────────────────────────────────────────────────

const ReviewsList = ({ reviews, onHelpful, onReport }: {
  reviews: Review[]; onHelpful: (id: string) => void; onReport: (id: string) => void
}) => {
  if (!reviews.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <MessageCircle className="w-12 h-12 mx-auto mb-3" />
        <div className="font-semibold text-slate-600 mb-1">No reviews yet</div>
        <div className="text-sm">Be the first to share your experience</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <Card key={review._id} className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3 items-center">
                <Avatar className="w-10 h-10 bg-blue-100 text-blue-700">
                  <AvatarFallback>{getInitials(review.user?.profile?.firstName, review.user?.profile?.lastName)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm text-slate-900">
                    {review.user?.profile?.firstName || 'User'} {review.user?.profile?.lastName || ''}
                  </div>
                  <StarRating rating={review.rating} size={12} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-rose-500" onClick={() => onReport(review._id)}>
                  <Flag className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {review.title && <div className="font-semibold text-base text-slate-900 mb-1">{review.title}</div>}
            {review.content && <div className="text-sm text-slate-600 leading-relaxed">{review.content}</div>}

            {review.images?.length ? (
              <div className="flex gap-2 mt-3">
                {review.images.slice(0, 3).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                ))}
              </div>
            ) : null}

            {review.vendorResponse && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-[3px] border-l-blue-600">
                <div className="text-xs font-bold text-blue-700 mb-1">
                  VENDOR RESPONSE · {review.vendorResponse.vendor?.name || 'Vendor'}
                </div>
                <div className="text-sm text-slate-700">{review.vendorResponse.content}</div>
              </div>
            )}

            <div className="mt-3">
              <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-200" onClick={() => onHelpful(review._id)}>
                <ThumbsUp className="w-3 h-3" />
                Helpful {review.helpful && review.helpful > 0 ? `(${review.helpful})` : ''}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Pincode Checker ─────────────────────────────────────────────────────────

const PincodeChecker = ({ pincodes }: { pincodes?: string[] }) => {
  const [pincode, setPincode] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const safePincodes = pincodes || []

  const checkAvailability = () => {
    if (pincode.length !== 6) return
    setIsAvailable(safePincodes.includes(pincode))
  }

  return (
    <div>
      <div className="text-sm font-semibold text-slate-700 mb-2">Check Delivery Availability</div>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 border-2 border-slate-200 rounded-xl px-3 py-2 bg-white focus-within:border-blue-400 transition-colors">
          <MapPin className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={pincode}
            onChange={e => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setIsAvailable(null) }}
            placeholder="Enter pincode"
            maxLength={6}
            onKeyDown={e => e.key === 'Enter' && checkAvailability()}
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
        <Button onClick={checkAvailability} className={PRIMARY_BTN}>Check</Button>
      </div>
      <AnimatePresence>
        {isAvailable !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 text-sm font-medium flex items-center gap-2 ${isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}
          >
            {isAvailable ? (<><CheckCircle className="w-4 h-4" />Delivery available in your area</>) : (<><Info className="w-4 h-4" />Delivery not available yet</>)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Accordion Component ─────────────────────────────────────────────────────

const AccordionItem = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-100">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full py-4 text-left font-medium text-slate-900 hover:text-blue-700 transition-colors">
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pb-4 text-sm text-slate-600 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Vendor Card ─────────────────────────────────────────────────────────────

const VendorCard = ({ vendor }: { vendor: Product['vendor'] }) => {
  const rating = vendor?.performance?.rating?.average || 0
  const ratingCount = vendor?.performance?.rating?.count || 0
  const completedRentals = vendor?.performance?.metrics?.completedRentals || 0
  const responseRate = vendor?.performance?.metrics?.responseRate || 0

  return (
    <Card className="border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
            {vendor?.business?.name?.charAt(0) || 'V'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900">{vendor?.business?.name || 'Vendor'}</span>
              <BadgeCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="mt-1"><StarRating rating={rating} size={14} showText count={ratingCount} /></div>
          </div>
        </div>

        {vendor?.business?.description && (
          <div className="text-sm text-slate-600 leading-relaxed mb-5 pb-5 border-b border-slate-100">
            {vendor.business.description}
          </div>
        )}

        <div className="grid grid-cols-3 gap-0 mb-5 text-center">
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{completedRentals}+</div>
            <div className="text-xs text-slate-500">Rentals Done</div>
          </div>
          <div className="border-x border-slate-100">
            <div className="text-2xl font-extrabold text-slate-900">{responseRate}%</div>
            <div className="text-xs text-slate-500">Response Rate</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{rating.toFixed(1)}</div>
            <div className="text-xs text-slate-500">Avg Rating</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2 border-slate-200">
            <MessageCircle className="w-4 h-4" />
            Chat with Vendor
          </Button>
          <Button variant="outline" size="icon" className="border-slate-200">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Trust Badges (colorful) ─────────────────────────────────────────────────

const TrustBadges = () => {
  const items = [
    { icon: Shield, title: 'Verified Quality', sub: 'Inspected before every rental', bg: 'bg-blue-50', color: 'text-blue-700' },
    { icon: RotateCcw, title: '7-Day Returns', sub: 'Hassle-free return policy', bg: 'bg-orange-50', color: 'text-orange-700' },
    { icon: Truck, title: 'Fast Delivery', sub: 'Doorstep in 2–3 days', bg: 'bg-emerald-50', color: 'text-emerald-700' },
    { icon: Headphones, title: '24/7 Support', sub: 'Always here to help', bg: 'bg-purple-50', color: 'text-purple-700' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 rounded-xl overflow-hidden mt-8">
      {items.map((item, i) => (
        <div key={i} className="bg-white p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0`}>
            <item.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{item.title}</div>
            <div className="text-xs text-slate-500">{item.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Why Rent Section (colorful) ─────────────────────────────────────────────

const WhyRentSection = () => {
  const points = [
    { icon: Zap, title: 'Zero Ownership Stress', body: 'Repairs, maintenance, and upgrades — all handled by us.', bg: 'bg-blue-50', color: 'text-blue-700' },
    { icon: TrendingUp, title: 'Upgrade Anytime', body: 'Switch to a newer model at the end of your rental term.', bg: 'bg-emerald-50', color: 'text-emerald-700' },
    { icon: Gift, title: 'Free Relocation', body: 'Moving? We will relocate your rented item at no extra cost.', bg: 'bg-purple-50', color: 'text-purple-700' },
    { icon: Award, title: 'Premium Brands Only', body: 'Every product is from a top-tier brand, curated for quality.', bg: 'bg-amber-50', color: 'text-amber-700' },
  ]

  return (
    <Card className="border-slate-200">
      <CardContent className="p-6">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Why Choose RentEase</div>
        <div className="text-xl font-bold text-slate-900 mb-5">Rent smarter, live better</div>
        <div className="space-y-4">
          {points.map((point, i) => (
            <div key={i} className="flex gap-3">
              <div className={`w-10 h-10 rounded-xl ${point.bg} ${point.color} flex items-center justify-center flex-shrink-0`}>
                <point.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900 mb-0.5">{point.title}</div>
                <div className="text-xs text-slate-600">{point.body}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Promo Banner ────────────────────────────────────────────────────────────

const PromoBanner = () => (
  <div className="mt-8 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-amber-700" />
        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Limited Offer</span>
      </div>
      <div className="text-xl font-bold text-slate-900">
        First-time renters get <span className="text-amber-700">₹500 off</span> their first order
      </div>
      <div className="text-sm text-slate-600 mt-1">
        Use code <strong className="text-slate-900">FIRST500</strong> at checkout
      </div>
    </div>
    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white whitespace-nowrap gap-2 border-0 shadow-sm shadow-amber-500/25">
      Claim Offer
      <ArrowRight className="w-4 h-4" />
    </Button>
  </div>
)

// ─── Available Offers (real discounts from the Discount system) ──────────────

const ProductOffers = ({ coupons }: { coupons: PublicCoupon[] }) => {
  if (!coupons || coupons.length === 0) return null

  return (
    <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Available Offers</span>
      </div>
      <div className="space-y-2.5">
        {coupons.map((c) => {
          const isPercent = c.type === 'percentage'
          const isFixed = c.type === 'fixed'
          return (
            <div
              key={c.code}
              className="flex items-center justify-between gap-3 rounded-xl bg-white border border-slate-100 p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{c.name}</span>
                  {isPercent && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                      {c.value}% OFF
                    </Badge>
                  )}
                  {isFixed && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                      ₹{formatINR(c.value || 0)} OFF
                    </Badge>
                  )}
                </div>
                {c.description && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{c.description}</p>
                )}
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                  {c.minOrderValue ? <span>Min order ₹{formatINR(c.minOrderValue)}</span> : null}
                  {c.endDate ? (
                    <span>Valid till {new Date(c.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  ) : null}
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(c.code)
                  toast.success(`Copied ${c.code} — apply it at checkout`)
                }}
                className="shrink-0 flex items-center gap-1.5 border-2 border-dashed border-blue-300 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {c.code}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Related Products ────────────────────────────────────────────────────────

const RelatedProducts = ({ products }: { products: RelatedProduct[] }) => {
  if (!products.length) return null
  return (
    <div className="mt-14">
      <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">You May Also Like</div>
      <div className="text-2xl font-bold text-slate-900 mb-5">Similar Products</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(product => {
          const primaryImage = product.media?.images?.find(img => img.isPrimary)
          const thumbnail = primaryImage?.thumbnail || product.media?.images?.[0]?.thumbnail
          return (
            <Link key={product._id} href={`/products/${product.basicInfo.slug}`} className="group block">
              <Card className="overflow-hidden border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all group-hover:-translate-y-1">
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                  {thumbnail ? (
                    <img src={thumbnail} alt={product.basicInfo.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-blue-300" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="font-semibold text-sm text-slate-900 truncate">{product.basicInfo.name}</div>
                  <div className="mt-1">
                    <StarRating rating={product.ratings?.average || 0} size={12} showText count={product.ratings?.count || 0} />
                  </div>
                  <div className="text-lg font-bold text-blue-700 mt-2">
                    ₹{formatINR(product.pricing.monthlyRent)}
                    <span className="text-xs font-normal text-slate-500">/mo</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

const PDPSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <Skeleton className="aspect-square rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
)

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const slug = params.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<ReviewSummary | null>(null)
  const [related, setRelated] = useState<RelatedProduct[]>([])
  const [publicCoupons, setPublicCoupons] = useState<PublicCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTenure, setSelectedTenure] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [shareUrl, setShareUrl] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 0, title: '', content: '' })

  useEffect(() => { setShareUrl(window.location.href) }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const productRes = await axios.get(`${BASE_URL}/api/v1/products/${slug}`)
      if (!productRes.data.success) { router.push('/404'); return }

      const productData = productRes.data.data.product
      setProduct(productData)
      const productId = productData._id

      // Record for the homepage "Recently viewed" rail (localStorage).
      addRecentlyViewed({
        _id: productData._id,
        name: productData.basicInfo?.name,
        slug: productData.basicInfo?.slug,
        image: productData.media?.images?.find((i: any) => i.isPrimary)?.url || productData.media?.images?.[0]?.url,
        monthlyRent: productData.pricing?.monthlyRent,
      })

      const [reviewsRes, summaryRes, relatedRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/v1/reviews/product/${productId}?limit=10`),
        axios.get(`${BASE_URL}/api/v1/reviews/product/${productId}/summary`),
        axios.get(`${BASE_URL}/api/v1/products/${productId}/similar?limit=4`),
      ])

      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.data?.reviews || [])
        const reviewsData = reviewsRes.data.data
        if (reviewsData?.distribution) {
          setSummary({
            distribution: reviewsData.distribution,
            total: reviewsData.pagination?.total || 0,
            average: Object.entries(reviewsData.distribution).reduce((acc, [stars, count]) =>
              acc + (parseInt(stars) * (count as number)), 0) / (reviewsData.pagination?.total || 1),
            sentiment: reviewsData.summary?.sentiment,
          })
        } else {
          setSummary({ distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, total: 0, average: 0 })
        }
      } else {
        setSummary({ distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, total: 0, average: 0 })
      }

      if (summaryRes.data.success && summaryRes.data.data?.average) {
        setSummary(prev => ({ ...prev, average: summaryRes.data.data.average, ...summaryRes.data.data }))
      }

      if (relatedRes.data.success) setRelated(relatedRes.data.data?.products || [])

      // Surface real, storefront-safe discounts for this product/category.
      try {
        const offers = await getPublicCoupons({
          productId,
          categoryId: productData.category?._id,
        })
        setPublicCoupons(offers)
      } catch {
        // Offers are non-critical — never block the product page on them.
      }
    } catch (error) {
      console.error('Error fetching product data:', error)
      router.push('/404')
    } finally {
      setLoading(false)
    }
  }, [slug, router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addToCart = async () => {
    if (!session) { toast.error('Please login to continue'); router.push('/login'); return }
    if (!selectedTenure) { toast.error('Please select a rental duration'); return }
    if (!product) return

    setIsAddingToCart(true)
    try {
      await axios.post(
        `${BASE_URL}/api/v1/cart/add`,
        { productId: product._id, quantity, rentalMonths: selectedTenure },
        { headers: { Authorization: `Bearer ${session.user?.accessToken}` } }
      )
      toast.success('Added to cart successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const toggleWishlist = async () => {
    if (!session) { toast.error('Please login to continue'); router.push('/login'); return }
    if (!product) return
    try {
      if (isWishlisted) {
        await axios.delete(`${BASE_URL}/api/v1/wishlist/${product._id}`, { headers: { Authorization: `Bearer ${session.user?.accessToken}` } })
        toast.success('Removed from wishlist')
        setIsWishlisted(false)
      } else {
        await axios.post(`${BASE_URL}/api/v1/wishlist/add`, { productId: product._id }, { headers: { Authorization: `Bearer ${session.user?.accessToken}` } })
        toast.success('Added to wishlist')
        setIsWishlisted(true)
      }
    } catch (error) {
      toast.error('Failed to update wishlist')
    }
  }

  const markHelpful = async (reviewId: string) => {
    if (!session) { toast.error('Please login to continue'); return }
    try {
      await axios.post(`${BASE_URL}/api/v1/reviews/${reviewId}/helpful`, {}, { headers: { Authorization: `Bearer ${session.user?.accessToken}` } })
      toast.success('Thanks for your feedback!')
      fetchAll()
    } catch (error) {
      toast.error('Failed to mark as helpful')
    }
  }

  const reportReview = async (reviewId: string) => {
    if (!session) { toast.error('Please login to continue'); return }
    const reason = prompt('Please provide a reason for reporting this review:')
    if (!reason) return
    try {
      await axios.post(`${BASE_URL}/api/v1/reviews/${reviewId}/report`, { reason }, { headers: { Authorization: `Bearer ${session.user?.accessToken}` } })
      toast.success('Report submitted successfully')
    } catch (error) {
      toast.error('Failed to submit report')
    }
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast.success('Link copied to clipboard!')
  }

  const submitReview = async () => {
    if (!session) { toast.error('Please login to continue'); return }
    if (newReview.rating === 0) { toast.error('Please select a rating'); return }
    if (!product) return
    try {
     // await axios.post(`${BASE_URL}/api/v1/reviews/product/${product._id}`, newReview, { headers: { Authorization: `Bearer ${session.user?.accessToken}` } })
      await axios.post(`${BASE_URL}/api/v1/reviews/product/${product._id}`, newReview, { headers: { Authorization: `Bearer ${session.user?.accessToken}` } })
      toast.success('Review submitted successfully!')
      setIsReviewModalOpen(false)
      setNewReview({ rating: 0, title: '', content: '' })
      fetchAll()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    }
  }

  if (loading) return <PDPSkeleton />
  if (!product) return null

  const isInStock = product.inventory.availableQuantity > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
        <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <Link href="/products" className="hover:text-blue-700 transition-colors">Products</Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-blue-700 transition-colors">
          {product.category.name}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-slate-900 font-semibold truncate">{product.basicInfo.name}</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <ProductGallery images={product.media?.images} />
          <div className="flex items-center justify-between mt-4 px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">47 people</span> viewed this today
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="w-8 h-8 border-slate-200" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')}>
                <Twitter className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="w-8 h-8 border-slate-200" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}>
                <Facebook className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="w-8 h-8 border-slate-200" onClick={copyShareLink}>
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
          <div className="flex flex-wrap gap-2 mb-3">
            {product.basicInfo.brand && <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0">{product.basicInfo.brand}</Badge>}
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1"><Sparkles className="w-3 h-3" />Premium Listed</Badge>
            {isInStock ? (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"><CheckCircle className="w-3 h-3" />In Stock</Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2">{product.basicInfo.name}</h1>

          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <StarRating rating={product.ratings.average} size={16} showText count={product.ratings.count} />
            <span className="text-xs text-slate-300">|</span>
            <button onClick={() => setActiveTab('reviews')} className="text-sm text-blue-600 font-semibold hover:underline">Read reviews</button>
            <span className="text-xs text-slate-300">|</span>
            <span className="text-sm text-slate-500">SKU: {product.basicInfo.sku}</span>
          </div>

          <div className="pb-5 border-b border-slate-100 mb-5">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-blue-700">₹{formatINR(product.pricing.monthlyRent)}</span>
              <span className="text-base text-slate-500">/month</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {product.pricing.securityDeposit > 0 && (
                <span className="text-sm text-slate-500">+ ₹{formatINR(product.pricing.securityDeposit)} refundable deposit</span>
              )}
              <span className="text-sm text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />No hidden charges
              </span>
            </div>
          </div>

          <div className="mb-5"><RentalOptions product={product} onSelect={setSelectedTenure} /></div>

          {/* Static value-add: rent vs buy */}
          <div className="mb-6"><RentVsBuySavings monthlyRent={product.pricing.monthlyRent} /></div>

          <div className="flex items-center gap-6 mb-6 flex-wrap">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quantity</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="w-9 h-9 rounded-lg border-slate-200" onClick={() => setQuantity(prev => Math.max(1, prev - 1))} disabled={quantity <= 1}>
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="w-12 text-center font-semibold text-slate-900">{quantity}</span>
                <Button variant="outline" size="icon" className="w-9 h-9 rounded-lg border-slate-200" onClick={() => setQuantity(prev => Math.min(product.inventory.availableQuantity, prev + 1))} disabled={quantity >= product.inventory.availableQuantity}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              <span className="text-emerald-600 font-bold">{product.inventory.availableQuantity}</span> units available
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button className={`flex-1 h-12 text-base gap-2 ${PRIMARY_BTN}`} onClick={addToCart} disabled={isAddingToCart || !selectedTenure || !isInStock}>
              {isAddingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 border-slate-200" onClick={toggleWishlist}>
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
            </Button>
          </div>

          {product.rentalTerms.serviceablePincodes && product.rentalTerms.serviceablePincodes.length > 0 && (
            <div className="mb-6"><PincodeChecker pincodes={product.rentalTerms.serviceablePincodes} /></div>
          )}

          <div>
            <AccordionItem title="Rental Terms & Cancellation Policy" defaultOpen>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Min rental: {product.rentalTerms.minRentalMonths} months · Max: {product.rentalTerms.maxRentalMonths} months</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>{product.rentalTerms.deliveryAvailable ? 'Doorstep delivery available' : 'Delivery not available'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>{product.rentalTerms.cancellationPolicy}</span>
                </div>
              </div>
            </AccordionItem>
            <AccordionItem title="Condition & Quality">
              <p>This product is listed as <strong className="text-slate-900">{product.condition}</strong>. Every item undergoes a thorough multi-point quality inspection before it is dispatched. Any functional or cosmetic issues are disclosed upfront.</p>
            </AccordionItem>
            <AccordionItem title="What if the product gets damaged during rental?">
              <p>Minor wear and tear is expected and covered. For accidental damage beyond normal use, charges are assessed against the security deposit as per the vendor's damage policy — full details are shared before checkout, never as a surprise.</p>
            </AccordionItem>
            <AccordionItem title="Can I extend my rental period?">
              <p>Yes — you can extend directly from your dashboard before the rental term ends, usually at the same discounted monthly rate as your original plan, subject to availability.</p>
            </AccordionItem>
          </div>
        </motion.div>
      </div>

      <TrustBadges />
      <PromoBanner />
      <ProductOffers coupons={publicCoupons} />

      {/* Tabs Section */}
      <div className="mt-12">
        <div className="flex gap-0 border-b border-slate-200 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {['description', 'specifications', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab ? 'text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'reviews' ? `Reviews (${summary?.total || 0})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="pt-6">
          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div key="description" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap mb-8">{product.basicInfo.description}</div>
                  {product.features && product.features.length > 0 && (
                    <div>
                      <div className="font-semibold text-base text-slate-900 mb-3">Key Features</div>
                      <div className="flex flex-wrap gap-2">
                        {product.features.map((feature, i) => (
                          <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 gap-1 border-0">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Static FAQ block */}
                  <div className="mt-8 rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Good to know</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      All rentals include free doorstep setup and a walkthrough on first use. Need help mid-rental?
                      Our support team responds within a few hours, every day of the week.
                    </p>
                  </div>
                </div>
                <div><WhyRentSection /></div>
              </motion.div>
            )}

            {activeTab === 'specifications' && (
              <motion.div key="specifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <Card className="border-slate-200">
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-500 w-2/5">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-sm font-medium text-slate-900 w-3/5">{String(value)}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3" />
                    <div>No specifications available</div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
                <div className="space-y-4">
                  <ReviewSummaryPanel summary={summary} />
                  <Button className={`w-full gap-2 ${PRIMARY_BTN}`} onClick={() => setIsReviewModalOpen(true)}>
                    <MessageCircle className="w-4 h-4" />
                    Write a Review
                  </Button>
                </div>
                <div><ReviewsList reviews={reviews} onHelpful={markHelpful} onReport={reportReview} /></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Vendor Section */}
      <div className="mt-12">
        <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Sold & Managed by</div>
        <div className="text-2xl font-bold text-slate-900 mb-4">Vendor Profile</div>
        <VendorCard vendor={product.vendor} />
      </div>

      <RelatedProducts products={related} />

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 p-3 flex items-center gap-3 shadow-lg md:hidden">
        <div className="flex-1">
          <div className="font-bold text-lg text-blue-700">
            ₹{formatINR(product.pricing.monthlyRent)}
            <span className="text-xs font-normal text-slate-500">/mo</span>
          </div>
          {isInStock ? <div className="text-xs text-emerald-600 font-medium">In Stock</div> : <div className="text-xs text-rose-600 font-medium">Out of Stock</div>}
        </div>
        <Button className={`flex-shrink-0 gap-2 ${PRIMARY_BTN}`} onClick={addToCart} disabled={isAddingToCart || !selectedTenure || !isInStock}>
          <ShoppingCart className="w-4 h-4" />
          Rent Now
        </Button>
      </div>

      {/* Write Review Dialog */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Write a Review</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Your Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setNewReview(prev => ({ ...prev, rating: star }))} className="focus:outline-none">
                    <Star className={`w-7 h-7 ${star <= newReview.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review-title">Title</Label>
              <Input id="review-title" placeholder="Summarise your experience" value={newReview.title} onChange={e => setNewReview(prev => ({ ...prev, title: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="review-content">Review</Label>
              <Textarea id="review-content" placeholder="Share details about your rental experience..." rows={4} value={newReview.content} onChange={e => setNewReview(prev => ({ ...prev, content: e.target.value }))} className="mt-1" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 border-slate-200" onClick={() => setIsReviewModalOpen(false)}>Cancel</Button>
              <Button className={`flex-[2] ${PRIMARY_BTN}`} onClick={submitReview}>Submit Review</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}