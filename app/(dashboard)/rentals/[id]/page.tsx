


// app/rentals/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Package, Truck, CheckCircle, XCircle, Clock, MapPin, CreditCard,
  AlertCircle, Download, RefreshCw, RotateCcw, AlertTriangle,
  MessageCircle, Phone, Mail, Home, Zap, ArrowLeft, Wallet, Receipt,
  LucideIcon, HelpCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { format } from 'date-fns'
import { enIN } from 'date-fns/locale'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { InvoiceModal } from '@/components/rental/InvoiceModal'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Shared premium button style — blue gradient, used everywhere instead of
// the default shadcn Button (which renders near-black on this theme) or
// plain solid indigo.
const PRIMARY_BTN = 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-sm shadow-blue-500/25'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PaymentHistory {
  _id: string
  paymentNumber: string
  amount: number
  type: string
  method: string
  status: string
  paymentDetails: { gateway: string; transactionId?: string }
  timestamps: { initiated: string; completed?: string }
  createdAt: string
}

interface TimelineEvent {
  status: string
  timestamp: string
  note?: string
  updatedBy?: string
  metadata?: { paymentId?: string; amount?: number }
}

interface InventoryItem {
  _id: string
  sku: string
  status: string
  condition: { status: string }
}

interface Address {
  _id: string
  type: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country: string
  contactDetails: { name: string; phone: string }
}

interface Product {
  _id: string
  basicInfo: { name: string; slug: string; brand: string; description: string }
  pricing: { monthlyRent: number; securityDeposit: number; deliveryCharges: number; lateFeePerDay: number }
  media: { images: Array<{ url: string; thumbnail: string; isPrimary: boolean }> }
  specifications: Record<string, string>
}

interface RentalDetails {
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

interface PaymentInfo {
  status: 'pending' | 'partial' | 'completed' | 'refunded'
  paidAmount: number
  dueAmount: number
  nextDueDate?: string
  paymentHistory: PaymentHistory[]
}

interface Rental {
  _id: string
  rentalNumber: string
  status: string
  product: Product
  inventory: InventoryItem[]
  address: Address
  rentalDetails: RentalDetails
  payment: PaymentInfo
  timeline: TimelineEvent[]
  extensions: any[]
  damages: any[]
  createdAt: string
  updatedAt: string
  user?: { _id: string; email: string; phone: string; profile: { firstName: string; lastName: string } }
  vendor?: { _id: string; business?: { name: string }; profile?: { firstName: string; lastName: string } } | null
  cancellation?: { reason: string; cancellationCharge: number; refundAmount: number; status: string }
  delivery?: { scheduledDate?: string; actualDate?: string; status: string; trackingNumber?: string }
  pickup?: { scheduledDate?: string; actualDate?: string; status: string }
}

// ─── Status Configuration ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: LucideIcon; description: string }> = {
  pending: { label: 'Pending Confirmation', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock, description: 'Your rental request is awaiting vendor confirmation.' },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: CheckCircle, description: 'Vendor has confirmed your rental. Preparing for delivery.' },
  ready_for_delivery: { label: 'Ready for Delivery', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: Package, description: 'Product is ready and will be dispatched soon.' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', icon: Truck, description: 'Your product is out for delivery.' },
  delivered: { label: 'Delivered', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', icon: Home, description: 'Product has been delivered to your address.' },
  active: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: Zap, description: 'Your rental is active and ongoing.' },
  extension_requested: { label: 'Extension Requested', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: RotateCcw, description: 'Extension request pending vendor approval.' },
  return_initiated: { label: 'Return Initiated', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200', icon: RotateCcw, description: 'Return request submitted. Awaiting pickup.' },
  out_for_pickup: { label: 'Out for Pickup', color: 'text-pink-700', bg: 'bg-pink-50 border-pink-200', icon: Truck, description: 'Pickup is scheduled for your return.' },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle, description: 'Rental completed successfully. Thank you!' },
  cancelled: { label: 'Cancelled', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: XCircle, description: 'This rental has been cancelled.' },
  overdue: { label: 'Overdue', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: AlertTriangle, description: 'Rental period has ended. Please initiate return.' },
  disputed: { label: 'Disputed', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: AlertCircle, description: 'There is a dispute on this rental.' },
}

// ─── Helper Functions ────────────────────────────────────────────────────────

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

const formatDate = (date: string): string => format(new Date(date), 'dd MMM yyyy', { locale: enIN })
const formatDateTime = (date: string): string => format(new Date(date), 'dd MMM yyyy, hh:mm a', { locale: enIN })

const getDaysRemaining = (endDate: string): number => {
  const today = new Date()
  const end = new Date(endDate)
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const getProgressPercentage = (startDate: string, endDate: string): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()
  if (today < start) return 0
  if (today > end) return 100
  const totalDuration = end.getTime() - start.getTime()
  const elapsed = today.getTime() - start.getTime()
  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
}

// ─── Timeline Component ──────────────────────────────────────────────────────

function RentalTimeline({ timeline }: { timeline: TimelineEvent[] }) {
  const sortedTimeline = [...timeline].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400 via-slate-200 to-transparent" />
      <div className="space-y-6">
        {sortedTimeline.map((event, index) => {
          const config = STATUS_CONFIG[event.status] || { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100 border-slate-200', label: undefined, description: '' }
          const Icon = config.icon
          return (
            <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="relative pl-10">
              <div className={`absolute left-0 p-1.5 rounded-full ${config.bg} border-2 border-white shadow-sm`}>
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-900">
                    {(config as any).label || event.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-xs text-slate-400">{formatDateTime(event.timestamp)}</span>
                </div>
                {event.note && <p className="text-sm text-slate-600 mt-1">{event.note}</p>}
                {event.metadata?.amount && (
                  <p className="text-xs text-blue-700 font-medium mt-1">Amount: {formatCurrency(event.metadata.amount)}</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Payment History Component ───────────────────────────────────────────────

function PaymentHistory({ payments }: { payments: PaymentHistory[] }) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No payment history available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {payments.map(payment => (
        <div key={payment._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{payment.paymentNumber}</p>
              <p className="text-xs text-slate-500">{formatDateTime(payment.createdAt)}</p>
              <p className="text-xs text-slate-400 capitalize">{payment.method?.replace(/_/g, ' ')} • {payment.type}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">{formatCurrency(payment.amount)}</p>
            <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px]">{payment.status}</Badge>
            {payment.paymentDetails?.transactionId && (
              <p className="text-[10px] text-slate-400 mt-1 font-mono">TXN: {payment.paymentDetails.transactionId.slice(-8)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RentalDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const rentalId = params.id as string

  const [rental, setRental] = useState<Rental | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showExtendDialog, setShowExtendDialog] = useState(false)
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showDamageDialog, setShowDamageDialog] = useState(false)

  const [cancelReason, setCancelReason] = useState('')
  const [extensionMonths, setExtensionMonths] = useState(1)
  const [returnCondition, setReturnCondition] = useState('good')
  const [returnNotes, setReturnNotes] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [returnSlot] = useState('')
  const [damageDescription, setDamageDescription] = useState('')
  const [damageImages, setDamageImages] = useState<File[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push(`/login?callbackUrl=/rentals/${rentalId}`)
  }, [status, router, rentalId])

  const fetchRental = useCallback(async () => {
    if (status !== 'authenticated' || !rentalId) return
    setIsLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/rentals/${rentalId}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      })
      if (response.data.success) {
        setRental(response.data.data.rental)
      } else {
        toast.error('Failed to load rental details')
        router.push('/rentals')
      }
    } catch (error) {
      console.error('Error fetching rental:', error)
      toast.error('Failed to load rental details')
      router.push('/rentals')
    } finally {
      setIsLoading(false)
    }
  }, [status, session, rentalId, router])

  useEffect(() => { fetchRental() }, [fetchRental])

  const handleCancelRental = async () => {
    if (!rental) return
    setIsSubmitting(true)
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/rentals/${rental._id}/cancel`, { reason: cancelReason },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } },
      )
      if (response.data.success) { toast.success('Rental cancelled successfully'); setShowCancelDialog(false); fetchRental() }
    } catch (error) {
      const axiosError = error as AxiosError<any>
      toast.error(axiosError.response?.data?.message || 'Failed to cancel rental')
    } finally { setIsSubmitting(false) }
  }

  const handleExtendRental = async () => {
    if (!rental) return
    setIsSubmitting(true)
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/rentals/${rental._id}/extend`, { extensionMonths },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } },
      )
      if (response.data.success) { toast.success(`Extension request sent for ${extensionMonths} month(s)`); setShowExtendDialog(false); fetchRental() }
    } catch (error) {
      const axiosError = error as AxiosError<any>
      toast.error(axiosError.response?.data?.message || 'Failed to request extension')
    } finally { setIsSubmitting(false) }
  }

  const handleReturnRental = async () => {
    if (!rental) return
    setIsSubmitting(true)
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/rentals/${rental._id}/return/initiate`,
        { condition: returnCondition, notes: returnNotes, returnDate: returnDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), returnSlot: returnSlot || '9 AM - 12 PM' },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } },
      )
      if (response.data.success) { toast.success('Return request initiated successfully'); setShowReturnDialog(false); fetchRental() }
    } catch (error) {
      const axiosError = error as AxiosError<any>
      toast.error(axiosError.response?.data?.message || 'Failed to initiate return')
    } finally { setIsSubmitting(false) }
  }

  const handleDownloadInvoice = async () => {
    if (!rental) return
    setShowInvoiceModal(true)
  }

  if (status === 'loading' || isLoading) return <RentalDetailsSkeleton />
  if (!rental) return null

  const statusConfig = STATUS_CONFIG[rental.status] || STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon
  const daysRemaining = rental.status === 'active' ? getDaysRemaining(rental.rentalDetails.endDate) : 0
  const isOverdue = daysRemaining < 0
  const progress = getProgressPercentage(rental.rentalDetails.startDate, rental.rentalDetails.endDate)
  const primaryImage = rental.product.media.images.find(img => img.isPrimary) || rental.product.media.images[0]

  const showCancel = ['pending', 'confirmed'].includes(rental.status)
  const showExtend = rental.status === 'active' && !isOverdue
  const showReturn = rental.status === 'active'
  const showContact = true

  const extensionCost = rental.rentalDetails.monthlyRent * extensionMonths

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4 mr-1" />Back
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{rental.product.basicInfo.name}</h1>
                <Badge className={`${statusConfig.bg} ${statusConfig.color} border px-3 py-1`}>
                  <StatusIcon className="h-3 w-3 mr-1" />{statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1">Rental #{rental.rentalNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={handleDownloadInvoice}>
              <Download className="h-4 w-4 mr-1" />Invoice
            </Button>
            <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => fetchRental()}>
              <RefreshCw className="h-4 w-4 mr-1" />Refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product & Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-slate-200">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 relative">
                {primaryImage ? (
                  <img src={primaryImage.url} alt={rental.product.basicInfo.name} className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-20 w-20 text-blue-300" />
                  </div>
                )}
              </div>
              {rental.product.media.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto border-t border-slate-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {rental.product.media.images.slice(0, 6).map((img, idx) => (
                    <button key={idx} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all flex-shrink-0">
                      <img src={img.thumbnail} alt={`${rental.product.basicInfo.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-slate-100">
                <TabsTrigger value="overview" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Overview</TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Timeline</TabsTrigger>
                <TabsTrigger value="payments" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Payments</TabsTrigger>
                <TabsTrigger value="support" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Support</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <Card className="border-slate-200">
                  <CardHeader><CardTitle className="text-lg text-slate-900">Product Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Brand</p>
                        <p className="font-medium text-slate-900">{rental.product.basicInfo.brand || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Monthly Rent</p>
                        <p className="font-semibold text-blue-700">{formatCurrency(rental.rentalDetails.monthlyRent)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Security Deposit</p>
                        <p className="font-medium text-slate-900">{formatCurrency(rental.rentalDetails.securityDeposit)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Late Fee</p>
                        <p className="font-medium text-slate-900">{formatCurrency(rental.product.pricing.lateFeePerDay)}/day</p>
                      </div>
                    </div>
                    {rental.product.basicInfo.description && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Description</p>
                        <p className="text-sm text-slate-600">{rental.product.basicInfo.description}</p>
                      </div>
                    )}
                    {Object.keys(rental.product.specifications).length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-2">Specifications</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(rental.product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-slate-500">{key}:</span>
                              <span className="font-medium text-slate-900">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader><CardTitle className="text-lg text-slate-900">Rental Period</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Start Date</p>
                        <p className="font-medium text-slate-900">{formatDate(rental.rentalDetails.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">End Date</p>
                        <p className="font-medium text-slate-900">{formatDate(rental.rentalDetails.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Tenure</p>
                        <p className="font-medium text-slate-900">{rental.rentalDetails.tenureMonths} months</p>
                      </div>
                      {rental.payment.nextDueDate && (
                        <div>
                          <p className="text-xs text-slate-500">Next Payment Due</p>
                          <p className="font-medium text-slate-900">{formatDate(rental.payment.nextDueDate)}</p>
                        </div>
                      )}
                    </div>

                    {rental.status === 'active' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Rental Progress</span>
                          <span className="font-medium text-slate-900">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-slate-500">
                          {isOverdue ? (
                            <span className="text-rose-600 font-medium">Overdue by {Math.abs(daysRemaining)} days</span>
                          ) : (
                            <span>{daysRemaining} days remaining</span>
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader><CardTitle className="text-lg text-slate-900">Delivery Address</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{rental.address.contactDetails.name}</p>
                        <p className="text-sm text-slate-600">{rental.address.addressLine1}</p>
                        {rental.address.addressLine2 && <p className="text-sm text-slate-600">{rental.address.addressLine2}</p>}
                        <p className="text-sm text-slate-600">{rental.address.city}, {rental.address.state} - {rental.address.pincode}</p>
                        <p className="text-sm text-slate-600 mt-1">📞 {rental.address.contactDetails.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="mt-6">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">Activity Timeline</CardTitle>
                    <CardDescription>Track the journey of your rental</CardDescription>
                  </CardHeader>
                  <CardContent><RentalTimeline timeline={rental.timeline} /></CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments" className="mt-6">
                <Card className="border-slate-200">
                  <CardHeader><CardTitle className="text-lg text-slate-900">Payment Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-900">Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Subtotal ({rental.rentalDetails.tenureMonths} months)</span>
                          <span className="text-slate-900">{formatCurrency(rental.rentalDetails.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Security Deposit</span>
                          <span className="text-slate-900">{formatCurrency(rental.rentalDetails.securityDeposit)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Delivery Charges</span>
                          <span className="text-slate-900">{formatCurrency(rental.rentalDetails.deliveryCharges)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">GST (18%)</span>
                          <span className="text-slate-900">{formatCurrency(rental.rentalDetails.tax)}</span>
                        </div>
                        <Separator className="bg-slate-100" />
                        <div className="flex justify-between font-semibold text-slate-900">
                          <span>Total Amount</span>
                          <span>{formatCurrency(rental.rentalDetails.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600">
                          <span>Paid Amount</span>
                          <span>{formatCurrency(rental.payment.paidAmount)}</span>
                        </div>
                        {rental.payment.dueAmount > 0 && (
                          <div className="flex justify-between text-rose-600">
                            <span>Due Amount</span>
                            <span>{formatCurrency(rental.payment.dueAmount)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 mb-3">Payment History</h4>
                      <PaymentHistory payments={rental.payment.paymentHistory} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="support" className="mt-6">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">Need Help?</CardTitle>
                    <CardDescription>Get assistance with your rental</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-3 border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => setShowContactDialog(true)}>
                      <MessageCircle className="h-4 w-4 text-blue-600" />Contact Vendor
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => window.open('/support', '_blank')}>
                      <HelpCircle className="h-4 w-4 text-blue-600" />Visit Help Center
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => setShowDamageDialog(true)}>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />Report Damage / Issue
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Actions & Summary */}
          <div className="space-y-6">
            <Card className={`border-2 ${statusConfig.bg}`}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-4">
                  <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{statusConfig.label}</h3>
                <p className="text-sm text-slate-600">{statusConfig.description}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader><CardTitle className="text-lg text-slate-900">Price Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Monthly Rent</span>
                  <span className="font-semibold text-blue-700">{formatCurrency(rental.rentalDetails.monthlyRent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Security Deposit</span>
                  <span className="font-medium text-slate-900">{formatCurrency(rental.rentalDetails.securityDeposit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Paid</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(rental.payment.paidAmount)}</span>
                </div>
                {rental.payment.dueAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Due Now</span>
                    <span className="font-medium text-rose-600">{formatCurrency(rental.payment.dueAmount)}</span>
                  </div>
                )}
              </CardContent>
              {rental.payment.dueAmount > 0 && (
                <CardFooter>
                  <Button className={`w-full ${PRIMARY_BTN}`}>
                    <CreditCard className="h-4 w-4 mr-2" />Pay Now
                  </Button>
                </CardFooter>
              )}
            </Card>

            <Card className="border-slate-200">
              <CardHeader><CardTitle className="text-lg text-slate-900">Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {showExtend && (
                  <Button variant="outline" className="w-full justify-start gap-3 border-blue-200 hover:bg-blue-50 text-slate-700" onClick={() => setShowExtendDialog(true)}>
                    <RotateCcw className="h-4 w-4 text-blue-600" />Extend Rental Period
                  </Button>
                )}
                {showReturn && (
                  <Button variant="outline" className="w-full justify-start gap-3 border-orange-200 hover:bg-orange-50 text-slate-700" onClick={() => setShowReturnDialog(true)}>
                    <Truck className="h-4 w-4 text-orange-600" />Initiate Return
                  </Button>
                )}
                {showCancel && (
                  <Button variant="outline" className="w-full justify-start gap-3 border-rose-200 hover:bg-rose-50 text-slate-700" onClick={() => setShowCancelDialog(true)}>
                    <XCircle className="h-4 w-4 text-rose-600" />Cancel Rental
                  </Button>
                )}
                {showContact && (
                  <Button variant="outline" className="w-full justify-start gap-3 border-slate-200 hover:bg-slate-50 text-slate-700" onClick={() => setShowContactDialog(true)}>
                    <MessageCircle className="h-4 w-4 text-blue-600" />Contact Support
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader><CardTitle className="text-lg text-slate-900">Product Information</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">SKU</span>
                  <span className="font-mono text-slate-900">{rental.inventory[0]?.sku || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Inventory Status</span>
                  <Badge variant="outline" className="text-xs border-slate-200 text-slate-700">{rental.inventory[0]?.status || 'Unknown'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Condition</span>
                  <span className="capitalize text-slate-900">{rental.inventory[0]?.condition?.status || 'Good'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-white border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Cancel Rental?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Are you sure you want to cancel this rental? Cancellation charges may apply based on our policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label className="text-slate-700">Reason for cancellation *</Label>
            <Textarea
              placeholder="Please provide a reason..."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              rows={3}
              className="mt-1.5 border-slate-200 focus-visible:border-blue-400"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 text-slate-700 hover:bg-slate-50">No, Keep It</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelRental} disabled={isSubmitting || !cancelReason} className="bg-rose-600 hover:bg-rose-700 text-white">
              {isSubmitting ? 'Cancelling...' : 'Yes, Cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Extend Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Extend Rental Period</DialogTitle>
            <DialogDescription className="text-slate-500">
              Extend your rental for additional months. The request will be sent to the vendor for approval.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="text-slate-700">Additional Months</Label>
              <Select value={extensionMonths.toString()} onValueChange={v => setExtensionMonths(parseInt(v))}>
                <SelectTrigger className="border-slate-200 mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="1">1 Month</SelectItem>
                  <SelectItem value="2">2 Months</SelectItem>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-slate-600">Additional cost:</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(extensionCost)}</p>
              <p className="text-xs text-slate-500 mt-1">Will be charged upon approval</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => setShowExtendDialog(false)}>Cancel</Button>
            <Button className={PRIMARY_BTN} onClick={handleExtendRental} disabled={isSubmitting}>
              {isSubmitting ? 'Requesting...' : 'Request Extension'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Initiate Return</DialogTitle>
            <DialogDescription className="text-slate-500">
              Please provide the condition of the product and any additional notes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="text-slate-700">Product Condition *</Label>
              <Select value={returnCondition} onValueChange={setReturnCondition}>
                <SelectTrigger className="border-slate-200 mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="excellent">Excellent - Like New</SelectItem>
                  <SelectItem value="good">Good - Normal Wear</SelectItem>
                  <SelectItem value="fair">Fair - Minor Issues</SelectItem>
                  <SelectItem value="damaged">Damaged - Needs Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-700">Return Date (Optional)</Label>
              <Input
                type="date"
                value={returnDate}
                onChange={e => setReturnDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border-slate-200 mt-1.5"
              />
            </div>
            <div>
              <Label className="text-slate-700">Additional Notes (Optional)</Label>
              <Textarea
                placeholder="Any issues or comments about the product..."
                value={returnNotes}
                onChange={e => setReturnNotes(e.target.value)}
                rows={3}
                className="border-slate-200 mt-1.5"
              />
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Important</p>
                  <p className="text-xs text-amber-700">
                    The product will be inspected upon pickup. Any damages beyond normal wear and tear may incur additional charges.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => setShowReturnDialog(false)}>Cancel</Button>
            <Button className={PRIMARY_BTN} onClick={handleReturnRental} disabled={isSubmitting}>
              {isSubmitting ? 'Initiating...' : 'Initiate Return'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Contact Support</DialogTitle>
            <DialogDescription className="text-slate-500">Get help with your rental from our support team.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-slate-900">Email Support</p>
                <p className="text-sm text-slate-600">support@rentease.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Phone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-slate-900">Phone Support</p>
                <p className="text-sm text-slate-600">+91 1800-123-4567</p>
                <p className="text-xs text-slate-400">Mon-Sat, 10 AM - 7 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-slate-900">Live Chat</p>
                <p className="text-sm text-slate-600">Available 24/7</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className={PRIMARY_BTN} onClick={() => setShowContactDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Damage Dialog */}
      <Dialog open={showDamageDialog} onOpenChange={setShowDamageDialog}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Report Issue / Damage</DialogTitle>
            <DialogDescription className="text-slate-500">
              Describe the issue with the product. Our team will review and get back to you.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="text-slate-700">Description of Issue *</Label>
              <Textarea
                placeholder="Please describe the issue in detail..."
                value={damageDescription}
                onChange={e => setDamageDescription(e.target.value)}
                rows={4}
                className="border-slate-200 mt-1.5"
              />
            </div>
            <div>
              <Label className="text-slate-700">Upload Photos (Optional)</Label>
              <Input type="file" multiple accept="image/*" onChange={e => setDamageImages(Array.from(e.target.files || []))} className="border-slate-200 mt-1.5" />
              <p className="text-xs text-slate-500 mt-1">Upload clear photos of the damage</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => setShowDamageDialog(false)}>Cancel</Button>
            <Button
              className={PRIMARY_BTN}
              onClick={() => {
                toast.success('Issue reported successfully. Our team will contact you soon.')
                setShowDamageDialog(false)
                setDamageDescription('')
                setDamageImages([])
              }}
              disabled={!damageDescription}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InvoiceModal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        rentalId={rental._id}
        rentalNumber={rental.rentalNumber}
        accessToken={session?.user?.accessToken || ''}
      />
    </div>
  )
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function RentalDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] rounded-xl" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}