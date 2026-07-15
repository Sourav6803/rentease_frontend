


// src/app/(dashboard)/rentals/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Fraunces, Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google'
import {
  Package, Truck, CheckCircle, XCircle, Clock, Calendar, MapPin, CreditCard,
  AlertCircle, Download, Eye, RefreshCw, Search, TrendingUp, Zap,
  FileText, RotateCcw, AlertTriangle, ArrowUpRight, ArrowDownRight, Home,
} from 'lucide-react'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { format } from 'date-fns'
import { enIN } from 'date-fns/locale'

// UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination'
import { InvoiceModal } from '@/components/rental/InvoiceModal'

// ─── Fonts ──────────────────────────────────────────────────────────────────
const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-display' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-mono' })

// ─── Design tokens (matches the Profile page system — light, colorful) ─────
const T = {
  page: 'bg-slate-50 text-slate-900',
  surface: 'bg-white border border-slate-200',
  surfaceHover: 'hover:bg-slate-50 hover:border-slate-300',
  textPrimary: 'text-slate-900',
  textSecondary: 'text-slate-500',
  textTertiary: 'text-slate-400',
  mono: 'font-[family-name:var(--font-mono)] tabular-nums',
  display: 'font-[family-name:var(--font-display)]',
}

// Reusable button treatments — blue gradient primary, no black buttons anywhere.
const btnPrimary = 'rounded-xl font-semibold border-0 transition-all shadow-sm shadow-blue-500/25 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
const btnSecondary = 'rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all'
const btnGhost = `rounded-xl ${T.textSecondary} hover:text-slate-900 hover:bg-slate-50 transition-all`
const btnDanger = 'rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all'
const btnWarning = 'rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 transition-all'

// Types
interface Rental {
  _id: string
  rentalNumber: string
  status: 'pending' | 'confirmed' | 'ready_for_delivery' | 'out_for_delivery' | 'delivered' | 'active' | 'extension_requested' | 'return_initiated' | 'out_for_pickup' | 'completed' | 'cancelled' | 'overdue' | 'disputed'
  product: {
    _id: string
    basicInfo: { name: string; slug: string; brand?: string }
    media: { images: Array<{ url: string; isPrimary: boolean }> }
    pricing: { monthlyRent: number; securityDeposit: number }
  }
  vendor: {
    _id: string
    profile?: { firstName: string; lastName: string; avatar?: string }
    business?: { name: string }
  }
  rentalDetails: {
    startDate: string
    endDate: string
    actualEndDate?: string
    tenureMonths: number
    monthlyRent: number
    securityDeposit: number
    deliveryCharges: number
    discount?: { amount: number; couponCode?: string }
    subtotal: number
    totalAmount: number
  }
  payment: {
    status: 'pending' | 'partial' | 'completed' | 'refunded'
    paidAmount: number
    dueAmount: number
    nextDueDate?: string
    paymentHistory?: Array<{ _id: string; amount: number; status: string; method: string; createdAt: string }>
  }
  address: { addressLine1: string; addressLine2?: string; city: string; state: string; pincode: string; landmark?: string }
  timeline: Array<{ status: string; timestamp: string; note?: string }>
  delivery?: { scheduledDate?: string; actualDate?: string; status: string; trackingNumber?: string }
  pickup?: { scheduledDate?: string; actualDate?: string; status: string }
  cancellation?: { reason: string; cancellationCharge: number; refundAmount: number; requestedAt: string; status: string }
  extensions?: Array<{ additionalMonths: number; additionalAmount: number; newEndDate: string; status: string; requestedDate: string }>
  createdAt: string
  updatedAt: string
}

interface RentalStats {
  total: number; active: number; completed: number; cancelled: number
  overdue: number; totalSpent: number; averageRentalValue: number
}

// Raw faceted aggregation returned by GET /api/v1/rentals/stats
interface RentalStatsResponse {
  overview?: Array<{
    totalRentals: number
    totalSpent: number
    averageValue: number
    activeCount: number
    completedCount: number
    cancelledCount: number
  }>
  byMonth?: Array<{ _id: { year: number; month: number }; count: number; amount: number }>
  byStatus?: Array<{ _id: string; count: number; amount: number }>
  byCategory?: Array<{ _id: string; count: number; amount: number }>
}

interface ApiResponse<T = any> { success: boolean; message: string; data: T }

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Status configuration — light chip colors (bg/text/border) + a solid hex
// for chart/progress-bar fills, since those can't consume Tailwind classes.
const STATUS_CONFIG: Record<string, { label: string; text: string; chip: string; hex: string; icon: any; progress: number }> = {
  pending: { label: 'Pending', text: 'text-amber-700', chip: 'bg-amber-50 border-amber-200', hex: '#D97706', icon: Clock, progress: 10 },
  confirmed: { label: 'Confirmed', text: 'text-blue-700', chip: 'bg-blue-50 border-blue-200', hex: '#2563EB', icon: CheckCircle, progress: 25 },
  ready_for_delivery: { label: 'Ready for delivery', text: 'text-indigo-700', chip: 'bg-indigo-50 border-indigo-200', hex: '#4F46E5', icon: Package, progress: 40 },
  out_for_delivery: { label: 'Out for delivery', text: 'text-violet-700', chip: 'bg-violet-50 border-violet-200', hex: '#7C3AED', icon: Truck, progress: 55 },
  delivered: { label: 'Delivered', text: 'text-teal-700', chip: 'bg-teal-50 border-teal-200', hex: '#0D9488', icon: Home, progress: 70 },
  active: { label: 'Active', text: 'text-emerald-700', chip: 'bg-emerald-50 border-emerald-200', hex: '#059669', icon: Zap, progress: 80 },
  extension_requested: { label: 'Extension requested', text: 'text-orange-700', chip: 'bg-orange-50 border-orange-200', hex: '#EA580C', icon: RotateCcw, progress: 85 },
  return_initiated: { label: 'Return initiated', text: 'text-cyan-700', chip: 'bg-cyan-50 border-cyan-200', hex: '#0891B2', icon: RotateCcw, progress: 90 },
  out_for_pickup: { label: 'Out for pickup', text: 'text-pink-700', chip: 'bg-pink-50 border-pink-200', hex: '#DB2777', icon: Truck, progress: 95 },
  completed: { label: 'Completed', text: 'text-emerald-700', chip: 'bg-emerald-50 border-emerald-200', hex: '#059669', icon: CheckCircle, progress: 100 },
  cancelled: { label: 'Cancelled', text: 'text-rose-700', chip: 'bg-rose-50 border-rose-200', hex: '#E11D48', icon: XCircle, progress: 0 },
  overdue: { label: 'Overdue', text: 'text-rose-700', chip: 'bg-rose-50 border-rose-200', hex: '#DC2626', icon: AlertCircle, progress: 80 },
  disputed: { label: 'Disputed', text: 'text-orange-700', chip: 'bg-orange-50 border-orange-200', hex: '#EA580C', icon: AlertTriangle, progress: 50 },
}

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'cancelled', label: 'Cancelled' },
]

// Helper functions
const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

const formatDate = (date: string): string => format(new Date(date), 'dd MMM yyyy', { locale: enIN })
const formatDateTime = (date: string): string => format(new Date(date), 'dd MMM yyyy, hh:mm a', { locale: enIN })

const getDaysRemaining = (endDate: string): number => {
  const today = new Date()
  const end = new Date(endDate)
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Components ─────────────────────────────────────────────────────────────

function RentalCard({ rental, onViewDetails, onCancel, onExtend, onReturn, onInvoice }: {
  rental: Rental
  onViewDetails: (id: string) => void
  onCancel: (id: string) => void
  onExtend: (id: string) => void
  onReturn: (id: string) => void
  onInvoice: (id: string) => void
}) {
  const cfg = STATUS_CONFIG[rental.status] || STATUS_CONFIG.pending
  const StatusIcon = cfg.icon
  const daysRemaining = rental.status === 'active' ? getDaysRemaining(rental.rentalDetails.endDate) : 0
  const isOverdue = daysRemaining < 0
  const primaryImage = rental.product.media.images.find(img => img.isPrimary) || rental.product.media.images[0]
  const rentalProgress = rental.status === 'active'
    ? ((new Date().getTime() - new Date(rental.rentalDetails.startDate).getTime()) /
       (new Date(rental.rentalDetails.endDate).getTime() - new Date(rental.rentalDetails.startDate).getTime())) * 100
    : 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }} transition={{ duration: 0.3 }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onViewDetails(rental._id)}
        onKeyDown={e => { if (e.key === 'Enter') onViewDetails(rental._id) }}
        className={`relative overflow-hidden rounded-2xl cursor-pointer ${T.surface} ${T.surfaceHover} transition-all duration-300 hover:shadow-md`}
      >
        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-100">
          <div className="h-full transition-all duration-500" style={{ width: `${cfg.progress}%`, backgroundColor: cfg.hex }} />
        </div>

        <div className="p-6 pt-7">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Product Image */}
            <div className="lg:w-32 flex-shrink-0">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border border-slate-100">
                {primaryImage ? (
                  <img src={primaryImage.url} alt={rental.product.basicInfo.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-10 w-10 text-blue-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Rental Details */}
            <div className="flex-1 space-y-4 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-lg font-semibold ${T.textPrimary}`}>{rental.product.basicInfo.name}</h3>
                    {rental.product.basicInfo.brand && (
                      <Badge variant="outline" className={`text-xs ${T.textSecondary} border-slate-200`}>
                        {rental.product.basicInfo.brand}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.chip} ${cfg.text}`}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                    <span className={`text-xs ${T.textTertiary} ${T.mono}`}>#{rental.rentalNumber}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`text-2xl font-bold text-blue-700 ${T.mono}`}>
                    {formatCurrency(rental.rentalDetails.monthlyRent)}
                    <span className={`text-sm font-normal ${T.textTertiary}`}>/mo</span>
                  </p>
                  <p className={`text-xs ${T.textTertiary} mt-0.5`}>Security: {formatCurrency(rental.rentalDetails.securityDeposit)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className={`h-4 w-4 ${T.textTertiary} mt-0.5 flex-shrink-0`} />
                  <div className="min-w-0">
                    <p className={`text-xs ${T.textTertiary}`}>Rental period</p>
                    <p className={`text-sm font-medium ${T.textPrimary}`}>
                      {formatDate(rental.rentalDetails.startDate)} – {formatDate(rental.rentalDetails.endDate)}
                    </p>
                    <p className={`text-xs ${T.textTertiary}`}>{rental.rentalDetails.tenureMonths} months</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className={`h-4 w-4 ${T.textTertiary} mt-0.5 flex-shrink-0`} />
                  <div className="min-w-0">
                    <p className={`text-xs ${T.textTertiary}`}>Delivery address</p>
                    <p className={`text-sm font-medium ${T.textPrimary} truncate`}>
                      {rental.address.addressLine1}, {rental.address.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CreditCard className={`h-4 w-4 ${T.textTertiary} mt-0.5 flex-shrink-0`} />
                  <div className="min-w-0">
                    <p className={`text-xs ${T.textTertiary}`}>Payment</p>
                    <p className={`text-sm font-medium ${T.textPrimary} ${T.mono}`}>Paid {formatCurrency(rental.payment.paidAmount)}</p>
                    {rental.payment.dueAmount > 0 && (
                      <p className={`text-xs text-rose-600 ${T.mono}`}>Due {formatCurrency(rental.payment.dueAmount)}</p>
                    )}
                  </div>
                </div>

                {rental.status === 'active' && (
                  <div className="flex items-start gap-2">
                    <Clock className={`h-4 w-4 ${T.textTertiary} mt-0.5 flex-shrink-0`} />
                    <div>
                      <p className={`text-xs ${T.textTertiary}`}>{isOverdue ? 'Overdue by' : 'Days remaining'}</p>
                      <p className={`text-sm font-medium ${isOverdue ? 'text-rose-600' : 'text-emerald-600'} ${T.mono}`}>
                        {Math.abs(daysRemaining)} days
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {rental.status === 'active' && !isOverdue && (
                <div className="space-y-1.5">
                  <div className={`flex justify-between text-xs ${T.textSecondary}`}>
                    <span>Rental progress</span>
                    <span className={T.mono}>{Math.round(rentalProgress)}%</span>
                  </div>
                  <div className="relative h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${rentalProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Action Buttons — stopPropagation so they don't trigger the card's navigate-on-click */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" className={btnSecondary} onClick={e => { e.stopPropagation(); onViewDetails(rental._id) }}>
                  <Eye className="h-4 w-4 mr-1.5" />View details
                </Button>

                {rental.status === 'active' && !isOverdue && (
                  <>
                    <Button size="sm" className={btnSecondary} onClick={e => { e.stopPropagation(); onExtend(rental._id) }}>
                      <RotateCcw className="h-4 w-4 mr-1.5" />Extend
                    </Button>
                    <Button size="sm" className={btnWarning} variant="outline" onClick={e => { e.stopPropagation(); onReturn(rental._id) }}>
                      <Truck className="h-4 w-4 mr-1.5" />Return
                    </Button>
                  </>
                )}

                {(rental.status === 'pending' || rental.status === 'confirmed') && (
                  <Button size="sm" className={btnDanger} variant="outline" onClick={e => { e.stopPropagation(); onCancel(rental._id) }}>
                    <XCircle className="h-4 w-4 mr-1.5" />Cancel
                  </Button>
                )}

                <Button size="sm" className={btnGhost} variant="ghost" onClick={e => { e.stopPropagation(); onInvoice(rental._id) }}>
                  <FileText className="h-4 w-4 mr-1.5" />Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StatsCard({ title, value, icon: Icon, accent, trend, onClick }: {
  title: string; value: string | number; icon: any; accent: string
  trend?: { value: number; isPositive: boolean }; onClick?: () => void
}) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
      <div className={`relative overflow-hidden rounded-2xl ${T.surface} ${T.surfaceHover} p-5 transition-all duration-300 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${T.textTertiary}`}>{title}</p>
            <p className={`text-2xl font-extrabold ${T.textPrimary} ${T.mono}`}>{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(trend.value)}% from last month
              </div>
            )}
          </div>
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${accent} shadow-md flex-shrink-0`}>
            <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function RentalTimeline({ timeline }: { timeline: Rental['timeline'] }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
      <div className="space-y-6">
        {timeline.map((event, index) => {
          const cfg = STATUS_CONFIG[event.status]
          const Icon = cfg?.icon || Clock
          return (
            <div key={index} className="relative pl-10">
              <div className={`absolute left-0 p-1.5 rounded-full border ${cfg?.chip || 'bg-slate-50 border-slate-200'}`}>
                <Icon className={`h-4 w-4 ${cfg?.text || T.textSecondary}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${T.textPrimary}`}>{cfg?.label || event.status}</p>
                <p className={`text-xs ${T.textTertiary} ${T.mono}`}>{formatDateTime(event.timestamp)}</p>
                {event.note && <p className={`text-sm ${T.textSecondary} mt-1`}>{event.note}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RentalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [rentals, setRentals] = useState<Rental[]>([])
  const [stats, setStats] = useState<RentalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [dateRange] = useState<{ from: Date; to: Date } | null>(null)

  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showExtendDialog, setShowExtendDialog] = useState(false)
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [invoiceRental, setInvoiceRental] = useState<Rental | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [extensionMonths, setExtensionMonths] = useState(1)
  const [returnCondition, setReturnCondition] = useState('good')
  const [returnNotes, setReturnNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => { setSearchQuery(searchInput); setCurrentPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const fetchRentals = useCallback(async () => {
    if (status !== 'authenticated') return
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: currentPage.toString(), limit: '10' })
      if (activeTab !== 'all') params.append('status', activeTab)
      if (searchQuery) params.append('search', searchQuery)
      if (dateRange?.from) params.append('startDate', dateRange.from.toISOString())
      if (dateRange?.to) params.append('endDate', dateRange.to.toISOString())

      const response = await axios.get<ApiResponse<{ rentals: Rental[]; pagination: any; counts: any }>>(
        `${BASE_URL}/api/v1/rentals/user/me?${params.toString()}`,
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } },
      )
      if (response.data.success) {
        setRentals(response.data.data.rentals)
        setTotalPages(response.data.data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching rentals:', error)
      toast.error('Couldn\u2019t load your rentals. Pull to refresh to try again.')
    } finally {
      setIsLoading(false)
    }
  }, [status, session, currentPage, activeTab, searchQuery, dateRange])

  const fetchStats = useCallback(async () => {
    if (status !== 'authenticated') return
    try {
      // The stats API returns a faceted aggregation:
      // { overview: [{ totalRentals, totalSpent, averageValue, activeCount, completedCount, cancelledCount }], byStatus: [{ _id, count }], ... }
      // Flatten it into the shape the stat cards expect.
      const response = await axios.get<ApiResponse<RentalStatsResponse>>(`${BASE_URL}/api/v1/rentals/stats`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      })
      if (response.data.success) {
        const raw = response.data.data
        const overview = raw?.overview?.[0]
        const overdue = raw?.byStatus?.find(s => s._id === 'overdue')?.count ?? 0
        setStats({
          total: overview?.totalRentals ?? 0,
          active: overview?.activeCount ?? 0,
          completed: overview?.completedCount ?? 0,
          cancelled: overview?.cancelledCount ?? 0,
          overdue,
          totalSpent: overview?.totalSpent ?? 0,
          averageRentalValue: overview?.averageValue ?? 0,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [status, session])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/rentals')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') { fetchRentals(); fetchStats() }
  }, [status, fetchRentals, fetchStats])

  const openInvoice = (rental: Rental) => {
    setInvoiceRental(rental)
    setShowInvoiceModal(true)
  }

  // Navigate to the full rental detail page instead of opening an in-page dialog.
  const handleViewDetails = (rentalId: string) => {
    router.push(`/rentals/${rentalId}`)
  }

  const handleCancelRental = async () => {
    if (!selectedRental) return
    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>(
        `${BASE_URL}/api/v1/rentals/${selectedRental._id}/cancel`, { reason: cancelReason },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } },
      )
      if (response.data.success) {
        toast.success('Rental cancelled')
        setShowCancelDialog(false); fetchRentals(); fetchStats(); setCancelReason('')
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || 'Couldn\u2019t cancel this rental.')
    } finally { setIsSubmitting(false) }
  }

  const handleExtendRental = async () => {
    if (!selectedRental) return
    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>(
        `${BASE_URL}/api/v1/rentals/${selectedRental._id}/extend`, { extensionMonths },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } },
      )
      if (response.data.success) {
        toast.success(`Extension request sent for ${extensionMonths} month${extensionMonths > 1 ? 's' : ''}`)
        setShowExtendDialog(false); fetchRentals()
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || 'Couldn\u2019t request an extension.')
    } finally { setIsSubmitting(false) }
  }

  const handleReturnRental = async () => {
    if (!selectedRental) return
    setIsSubmitting(true)
    try {
      // The API requires a future returnDate; default the pickup to tomorrow so
      // it comfortably clears the "cannot be in the past" server-side check.
      const returnDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const response = await axios.post<ApiResponse>(
        `${BASE_URL}/api/v1/rentals/${selectedRental._id}/return/initiate`,
        { condition: returnCondition, notes: returnNotes, returnDate, returnSlot: '9 AM - 12 PM' },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } },
      )
      if (response.data.success) {
        toast.success('Return initiated')
        setShowReturnDialog(false); fetchRentals(); setReturnCondition('good'); setReturnNotes('')
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data?.message || 'Couldn\u2019t initiate the return.')
    } finally { setIsSubmitting(false) }
  }

  if (status === 'loading' || isLoading) return <RentalsSkeleton />

  const statsCards = [
    { title: 'Total rentals', value: stats?.total || 0, icon: Package, accent: 'from-blue-500 to-cyan-500', trend: { value: 12, isPositive: true } },
    { title: 'Active', value: stats?.active || 0, icon: Zap, accent: 'from-emerald-500 to-green-500' },
    { title: 'Completed', value: stats?.completed || 0, icon: CheckCircle, accent: 'from-teal-500 to-emerald-600' },
    { title: 'Total spent', value: formatCurrency(stats?.totalSpent || 0), icon: TrendingUp, accent: 'from-indigo-500 to-purple-500' },
  ]

  return (
    <div className={`min-h-screen ${T.page} ${jakarta.variable} ${fraunces.variable} ${plexMono.variable}`} style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}>
      {/* Ambient background — soft colorful blurs on light bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-200/30 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[400px] rounded-full bg-indigo-200/25 blur-[100px]" />
        <div className="absolute -bottom-40 right-1/3 w-[400px] h-[400px] rounded-full bg-emerald-100/40 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${T.textPrimary} ${T.display}`}>My rentals</h1>
            <p className={`${T.textSecondary} mt-1 text-sm`}>Track deliveries, payments, and returns in one place</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className={btnSecondary} onClick={() => { fetchRentals(); fetchStats() }}>
              <RefreshCw className="h-4 w-4 mr-1.5" />Refresh
            </Button>
            <Button size="sm" className={btnPrimary} onClick={() => router.push('/products')}>
              <Package className="h-4 w-4 mr-1.5" />Rent more
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map(stat => <StatsCard key={stat.title} {...stat} />)}
        </div>

        {/* Filters: search + status tabs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${T.textTertiary}`} />
              <Input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by product name or rental number\u2026"
                className="pl-10 h-11 rounded-xl bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-blue-100"
              />
            </div>
            {/* Status tabs — equal-width on mobile so they never overlap, same fix as Profile page */}
            <div className="flex w-full sm:w-fit overflow-x-auto gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1) }}
                  className={`flex-1 sm:flex-none px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0
                    ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : `${T.textSecondary} hover:text-slate-900 hover:bg-slate-50`}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rentals List */}
          {rentals.length === 0 ? (
            <div className={`text-center py-16 rounded-2xl ${T.surface}`}>
              <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Package className={`h-7 w-7 ${T.textSecondary}`} />
              </div>
              <h3 className={`text-base font-semibold ${T.textPrimary} mb-1.5`}>
                {searchQuery || activeTab !== 'all' ? 'No rentals match these filters' : 'No rentals yet'}
              </h3>
              <p className={`text-sm ${T.textSecondary} mb-5`}>
                {searchQuery || activeTab !== 'all' ? 'Try a different search term or clear the status filter.' : 'Browse the catalog to start your first rental.'}
              </p>
              <Button className={btnPrimary} onClick={() => router.push('/products')}>Browse products</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {rentals.map(rental => (
                  <RentalCard
                    key={rental._id}
                    rental={rental}
                    onViewDetails={handleViewDetails}
                    onCancel={() => { setSelectedRental(rental); setShowCancelDialog(true) }}
                    onExtend={() => { setSelectedRental(rental); setShowExtendDialog(true) }}
                    onReturn={() => { setSelectedRental(rental); setShowReturnDialog(true) }}
                    onInvoice={() => openInvoice(rental)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={`${T.textSecondary} hover:text-slate-900 hover:bg-slate-50 ${currentPage === 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'}`}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage
                  if (totalPages <= 5) pageNum = i + 1
                  else if (currentPage <= 3) pageNum = i + 1
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                  else pageNum = currentPage - 2 + i
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className={currentPage === pageNum ? 'bg-blue-600 text-white border-0 hover:bg-blue-700' : `${T.textSecondary} hover:text-slate-900 hover:bg-slate-50 border-slate-200`}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={`${T.textSecondary} hover:text-slate-900 hover:bg-slate-50 ${currentPage === totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

        {/* ── Details Dialog ── */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto bg-white border-slate-200 rounded-2xl">
            {selectedRental && (
              <>
                <DialogHeader>
                  <DialogTitle className={`flex items-center gap-2 flex-wrap ${T.textPrimary}`}>
                    Rental details
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_CONFIG[selectedRental.status]?.chip} ${STATUS_CONFIG[selectedRental.status]?.text}`}>
                      {STATUS_CONFIG[selectedRental.status]?.label}
                    </span>
                  </DialogTitle>
                  <DialogDescription className={`${T.textSecondary} ${T.mono}`}>#{selectedRental.rentalNumber}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className={`p-5 rounded-2xl ${T.surface}`}>
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${T.textTertiary} mb-4`}>Product</h4>
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 flex-shrink-0">
                        {selectedRental.product.media.images[0] && (
                          <img src={selectedRental.product.media.images[0].url} alt={selectedRental.product.basicInfo.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold ${T.textPrimary}`}>{selectedRental.product.basicInfo.name}</h4>
                        {selectedRental.product.basicInfo.brand && <p className={`text-sm ${T.textSecondary}`}>Brand: {selectedRental.product.basicInfo.brand}</p>}
                        <p className={`text-sm text-blue-700 mt-1 font-semibold ${T.mono}`}>{formatCurrency(selectedRental.rentalDetails.monthlyRent)}/month</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl ${T.surface}`}>
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${T.textTertiary} mb-4`}>Timeline</h4>
                    <RentalTimeline timeline={selectedRental.timeline} />
                  </div>

                  <div className={`p-5 rounded-2xl ${T.surface}`}>
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${T.textTertiary} mb-4`}>Payment summary</h4>
                    <div className={`space-y-3 text-sm ${T.textSecondary}`}>
                      <div className="flex justify-between">
                        <span>Subtotal ({selectedRental.rentalDetails.tenureMonths} months)</span>
                        <span className={`${T.textPrimary} ${T.mono}`}>{formatCurrency(selectedRental.rentalDetails.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Security deposit</span>
                        <span className={`${T.textPrimary} ${T.mono}`}>{formatCurrency(selectedRental.rentalDetails.securityDeposit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery charges</span>
                        <span className={`${T.textPrimary} ${T.mono}`}>{formatCurrency(selectedRental.rentalDetails.deliveryCharges)}</span>
                      </div>
                      {selectedRental.rentalDetails.discount && selectedRental.rentalDetails.discount.amount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount</span>
                          <span className={T.mono}>\u2212{formatCurrency(selectedRental.rentalDetails.discount.amount)}</span>
                        </div>
                      )}
                      <Separator className="bg-slate-100" />
                      <div className={`flex justify-between font-semibold ${T.textPrimary}`}>
                        <span>Total amount</span>
                        <span className={T.mono}>{formatCurrency(selectedRental.rentalDetails.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Paid amount</span>
                        <span className={`text-emerald-600 ${T.mono}`}>{formatCurrency(selectedRental.payment.paidAmount)}</span>
                      </div>
                      {selectedRental.payment.dueAmount > 0 && (
                        <div className="flex justify-between text-rose-600">
                          <span>Due amount</span>
                          <span className={T.mono}>{formatCurrency(selectedRental.payment.dueAmount)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl ${T.surface}`}>
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${T.textTertiary} mb-4`}>Delivery address</h4>
                    <div className="flex gap-2.5">
                      <MapPin className={`h-4 w-4 ${T.textTertiary} mt-0.5 flex-shrink-0`} />
                      <div className={`text-sm ${T.textSecondary} space-y-0.5`}>
                        <p className={T.textPrimary}>{selectedRental.address.addressLine1}</p>
                        {selectedRental.address.addressLine2 && <p>{selectedRental.address.addressLine2}</p>}
                        {selectedRental.address.landmark && <p>Landmark: {selectedRental.address.landmark}</p>}
                        <p>{selectedRental.address.city}, {selectedRental.address.state} \u2013 {selectedRental.address.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2 pt-2">
                  <Button className={btnSecondary} onClick={() => setShowDetailsDialog(false)}>Close</Button>
                  <Button className={btnPrimary} onClick={() => { setShowDetailsDialog(false); openInvoice(selectedRental) }}>
                    <Download className="h-4 w-4 mr-1.5" />View invoice
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Cancel Dialog ── */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent className="bg-white border-slate-200 rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className={T.textPrimary}>Cancel this rental?</AlertDialogTitle>
              <AlertDialogDescription className={T.textSecondary}>
                Cancellation charges may apply depending on the vendor's policy. This can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2 space-y-2">
              <Label className={`text-sm font-medium ${T.textSecondary}`}>Reason for cancellation</Label>
              <Textarea
                placeholder="Let us know why you're cancelling\u2026"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                className="bg-slate-50 border-slate-200 rounded-xl resize-none text-slate-900 focus-visible:border-blue-400"
              />
            </div>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className={`${btnSecondary} border`}>Keep rental</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelRental} disabled={isSubmitting || !cancelReason} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50">
                {isSubmitting ? 'Cancelling\u2026' : 'Yes, cancel'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Extend Dialog ── */}
        <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
          <DialogContent className="max-h-[88vh] overflow-y-auto bg-white border-slate-200 rounded-2xl">
            <DialogHeader>
              <DialogTitle className={T.textPrimary}>Extend rental period</DialogTitle>
              <DialogDescription className={T.textSecondary}>We'll send this request to your vendor for approval.</DialogDescription>
            </DialogHeader>
            <div className="py-2 space-y-4">
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium ${T.textSecondary}`}>Additional months</Label>
                <Select value={extensionMonths.toString()} onValueChange={v => setExtensionMonths(parseInt(v))}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="1">1 month</SelectItem>
                    <SelectItem value="2">2 months</SelectItem>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedRental && (
                <div className={`p-4 rounded-xl ${T.surface}`}>
                  <p className={`text-xs ${T.textTertiary}`}>Additional cost</p>
                  <p className={`text-lg font-bold text-blue-700 ${T.mono}`}>{formatCurrency(selectedRental.rentalDetails.monthlyRent * extensionMonths)}</p>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button className={btnSecondary} onClick={() => setShowExtendDialog(false)}>Cancel</Button>
              <Button className={btnPrimary} onClick={handleExtendRental} disabled={isSubmitting}>
                {isSubmitting ? 'Requesting\u2026' : 'Request extension'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Return Dialog ── */}
        <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
          <DialogContent className="max-h-[88vh] overflow-y-auto bg-white border-slate-200 rounded-2xl">
            <DialogHeader>
              <DialogTitle className={T.textPrimary}>Initiate return</DialogTitle>
              <DialogDescription className={T.textSecondary}>Tell us the product's condition and add any notes for the pickup team.</DialogDescription>
            </DialogHeader>
            <div className="py-2 space-y-4">
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium ${T.textSecondary}`}>Product condition</Label>
                <Select value={returnCondition} onValueChange={setReturnCondition}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="excellent">Excellent \u2013 like new</SelectItem>
                    <SelectItem value="good">Good \u2013 normal wear</SelectItem>
                    <SelectItem value="fair">Fair \u2013 minor issues</SelectItem>
                    <SelectItem value="damaged">Damaged \u2013 needs repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium ${T.textSecondary}`}>Additional notes (optional)</Label>
                <Textarea
                  placeholder="Any issues or comments about the product\u2026"
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  rows={3}
                  className="bg-slate-50 border-slate-200 rounded-xl resize-none text-slate-900 focus-visible:border-blue-400"
                />
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex gap-2.5">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Before you continue</p>
                    <p className="text-xs text-amber-700/80 mt-0.5">
                      The product is inspected at pickup. Damage beyond normal wear may incur extra charges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button className={btnSecondary} onClick={() => setShowReturnDialog(false)}>Cancel</Button>
              <Button className={btnPrimary} onClick={handleReturnRental} disabled={isSubmitting}>
                {isSubmitting ? 'Initiating\u2026' : 'Initiate return'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* \u2500\u2500 Invoice Modal \u2500\u2500 */}
        {invoiceRental && (
          <InvoiceModal
            open={showInvoiceModal}
            onClose={() => setShowInvoiceModal(false)}
            rentalId={invoiceRental._id}
            rentalNumber={invoiceRental.rentalNumber}
            accessToken={session?.user?.accessToken || ''}
          />
        )}
      </div>
    </div>
  )
}

// Skeleton Loader
function RentalsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-14 rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      </div>
    </div>
  )
}