// app/vendor/orders/completed/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, CheckCircle, ChevronLeft, ChevronRight,
  RefreshCw, Star, Download, Eye, Calendar, DollarSign,
  TrendingUp, Users, Award, FileText, Receipt, ThumbsUp,
  XCircle
} from 'lucide-react'
import { Rental } from '../types'
import { OrderStatusBadge } from '@/components/vendor/orders/OrderStatusBadge'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

// Completed Order Card Component
function CompletedOrderCard({ 
  rental, 
  onViewDetails,
  onDownloadInvoice
}: { 
  rental: Rental
  onViewDetails: (rental: Rental) => void
  onDownloadInvoice: (rental: Rental) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const primaryImage = rental.product.media.images?.find(img => img.isPrimary) || rental.product.media.images?.[0]
  const actualEndDate = rental.rentalDetails.actualEndDate || rental.rentalDetails.endDate
  const rentalDuration = Math.ceil(
    (new Date(actualEndDate).getTime() - new Date(rental.rentalDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all"
    >
      <div className="p-4">
        <div className="flex flex-wrap gap-4">
          {/* Product Image */}
          <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100">
            {primaryImage ? (
              <img 
                src={primaryImage.thumbnail || primaryImage.url} 
                alt={rental.product.basicInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-8 w-8 text-slate-300" />
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs text-slate-400 font-mono">{rental.rentalNumber}</p>
                  <OrderStatusBadge status={rental.status} />
                  {rental.ratings?.average > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                      <Star className="h-2.5 w-2.5 fill-green-600" />
                      {rental.ratings.average.toFixed(1)} ({rental.ratings.count})
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 mt-1">{rental.product.basicInfo.name}</h3>
                <p className="text-sm text-slate-500">
                  {rental.user.profile.firstName} {rental.user.profile.lastName}
                </p>
              </div>
            </div>
            
            {/* Rental Details */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(rental.rentalDetails.startDate), 'dd MMM yyyy')} - {format(new Date(actualEndDate), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Package className="h-3.5 w-3.5" />
                <span>{rentalDuration} days</span>
              </div>
            </div>
          </div>
          
          {/* Amount & Actions */}
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-slate-900">₹{rental.rentalDetails.totalAmount.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-0.5">Completed</p>
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onDownloadInvoice(rental)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Invoice
              </button>
              <button
                onClick={() => onViewDetails(rental)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2874f0] text-white hover:bg-[#1a5fd4] transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                Details
              </button>
            </div>
          </div>
        </div>
        
        {/* Expandable Section */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-slate-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Summary</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total:</span>
                    <span>₹{rental.rentalDetails.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Deposit:</span>
                    <span>₹{rental.rentalDetails.securityDeposit.toLocaleString()}</span>
                  </div>
                  {(rental as any).depositRefund !== undefined && (
                    <div className="flex justify-between text-green-600">
                      <span>Deposit Refund:</span>
                      <span>₹{(rental as any).depositRefund.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Return Info</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Return Date:</span>
                    <span>{format(new Date(actualEndDate), 'dd MMM yyyy')}</span>
                  </div>
                  {(rental as any).returnCondition && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Condition:</span>
                      <span className="capitalize">{(rental as any).returnCondition}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer Rating</p>
                {rental.ratings?.average > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{rental.ratings.average.toFixed(1)}</span>
                    <span className="text-slate-400 text-sm">({rental.ratings.count} reviews)</span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No rating yet</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Expand/Collapse Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 flex items-center gap-1 text-xs text-[#2874f0] hover:underline"
        >
          {isExpanded ? 'Show less' : 'Show details'}
          <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
      </div>
    </motion.div>
  )
}

// Completed Orders Filter Component
function CompletedFilters({ 
  searchTerm, 
  onSearchChange,
  dateRange,
  onDateRangeChange
}: { 
  searchTerm: string
  onSearchChange: (value: string) => void
  dateRange: { start: string; end: string }
  onDateRangeChange: (range: { start: string; end: string }) => void
}) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order ID, product, or customer..."
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0] bg-[#fafafa]"
          />
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-[#fafafa] hover:bg-slate-50"
          >
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">
              {dateRange.start && dateRange.end 
                ? `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
                : 'Filter by completion date'}
            </span>
          </button>
          
          {showDatePicker && (
            <div className="absolute right-0 top-full mt-2 z-10 bg-white rounded-lg border border-slate-200 shadow-lg p-4 min-w-[300px]">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="w-full px-3 py-2 bg-[#2874f0] text-white rounded-lg text-sm font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Order Details Modal for Completed Orders
function CompletedOrderDetailsModal({ 
  rental, 
  onClose,
  onDownloadInvoice
}: { 
  rental: Rental
  onClose: () => void
  onDownloadInvoice: (rental: Rental) => void
}) {
  const primaryImage = rental.product.media.images?.find(img => img.isPrimary) || rental.product.media.images?.[0]
  const actualEndDate = rental.rentalDetails.actualEndDate || rental.rentalDetails.endDate
  const totalDays = Math.ceil(
    (new Date(actualEndDate).getTime() - new Date(rental.rentalDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs font-mono">{rental.rentalNumber}</p>
                <h2 className="text-xl font-bold text-white">Completed Order</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-full bg-white/20 hover:bg-white/30">
                <XCircle className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Completion Banner */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Order Completed Successfully</p>
                  <p className="text-sm text-green-700">
                    Completed on {format(new Date(actualEndDate), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Product Info */}
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                {primaryImage ? (
                  <img src={primaryImage.thumbnail || primaryImage.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-slate-300" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{rental.product.basicInfo.name}</h3>
                <p className="text-sm text-slate-500">SKU: {rental.product.basicInfo.sku}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-slate-500">Monthly Rent:</span>
                  <span className="font-semibold">₹{rental.rentalDetails.monthlyRent.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#2874f0]" />
                  Rental Period
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Start Date:</span>
                    <span>{format(new Date(rental.rentalDetails.startDate), 'dd MMM yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">End Date:</span>
                    <span>{format(new Date(actualEndDate), 'dd MMM yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Duration:</span>
                    <span>{totalDays} days ({rental.rentalDetails.tenureMonths} months)</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#2874f0]" />
                  Financial Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Rent:</span>
                    <span>₹{rental.rentalDetails.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Deposit:</span>
                    <span>₹{rental.rentalDetails.securityDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery Charges:</span>
                    <span>₹{rental.rentalDetails.deliveryCharges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold">
                    <span>Total Paid:</span>
                    <span className="text-green-600">₹{rental.payment.paidAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Customer Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-2">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p><span className="text-slate-500 w-24 inline-block">Name:</span> {rental.user.profile.firstName} {rental.user.profile.lastName}</p>
                <p><span className="text-slate-500 w-24 inline-block">Email:</span> {rental.user.email}</p>
                <p><span className="text-slate-500 w-24 inline-block">Phone:</span> {rental.user.phone || 'Not provided'}</p>
              </div>
            </div>
            
            {/* Timeline Preview */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-2">Order Timeline</h4>
              <div className="space-y-2">
                {rental.timeline.slice(-5).map((event, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className="w-24 shrink-0">
                      <p className="text-xs text-slate-400">{format(new Date(event.timestamp), 'dd MMM')}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 capitalize">{event.status.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="sticky bottom-0 border-t border-slate-200 px-6 py-4 bg-white">
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => onDownloadInvoice(rental)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Completed Orders Page
export default function CompletedOrdersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const toast = useToast()
  
  const [rentals, setRentals] = useState<Rental[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  const fetchCompletedOrders = useCallback(async () => {
    if (status !== 'authenticated') return
    
    try {
      const headers = await getAuthHeaders()
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', '12')
      params.set('status', 'completed')
      if (searchTerm) params.set('search', searchTerm)
      if (dateRange.start) params.set('startDate', dateRange.start)
      if (dateRange.end) params.set('endDate', dateRange.end)
      
      const res = await fetch(`${BASE_URL}/api/v1/rentals/vendor/me?${params.toString()}`, { headers })
      const data = await res.json()
      
      if (data.success) {
        setRentals(data.data.rentals || [])
        setTotalPages(data.data.pagination?.pages || 1)
        setTotalOrders(data.data.pagination?.total || 0)
        
        // Calculate total revenue from completed orders
        const revenue = (data.data.rentals || []).reduce((sum: number, r: Rental) => sum + r.rentalDetails.totalAmount, 0)
        setTotalRevenue(revenue)
      } else {
        toast.error(data.message || 'Failed to load completed orders')
      }
    } catch (error) {
      toast.error('Failed to load completed orders')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm, dateRange, status, toast])
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchCompletedOrders()
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [fetchCompletedOrders, status, router])
  
  const handleDownloadInvoice = async (rental: Rental) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/rentals/${rental._id}/invoice/download`, {
        headers
      })
      
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${rental.rentalNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Invoice downloaded successfully')
      } else {
        toast.error('Failed to download invoice')
      }
    } catch (error) {
      toast.error('Failed to download invoice')
    }
  }
  
  const stats = [
    { label: 'Completed Orders', value: totalOrders, icon: CheckCircle, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}K`, icon: TrendingUp, color: '#2874f0', bg: '#ebf3fb' },
    { label: 'Avg. Order Value', value: `₹${totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}`, icon: DollarSign, color: '#8b5cf6', bg: '#f3e8ff' },
  ]
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading completed orders...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-lg">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Completed Orders</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {totalOrders} successfully completed rentals
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.bg }}>
                    <Icon className="h-4 w-4" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>
        
        {/* Success Banner */}
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Great job!</p>
              <p className="text-sm text-green-700">
                You've successfully completed {totalOrders} rental{totalOrders !== 1 ? 's' : ''}. 
                Keep up the excellent service!
              </p>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <CompletedFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        
        {/* Orders List */}
        <AnimatePresence mode="popLayout">
          {rentals.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-16 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#ebf3fb] rounded-full flex items-center justify-center mb-5">
                <CheckCircle className="h-9 w-9 text-[#2874f0]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1.5">
                No Completed Orders Yet
              </h3>
              <p className="text-sm text-slate-500 max-w-xs">
                Completed rentals will appear here once customers return products and orders are finalized.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rentals.map(rental => (
                <CompletedOrderCard
                  key={rental._id}
                  rental={rental}
                  onViewDetails={(r) => { setSelectedRental(r); setShowDetailsModal(true) }}
                  onDownloadInvoice={handleDownloadInvoice}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Details Modal */}
      {showDetailsModal && selectedRental && (
        <CompletedOrderDetailsModal
          rental={selectedRental}
          onClose={() => { setShowDetailsModal(false); setSelectedRental(null) }}
          onDownloadInvoice={handleDownloadInvoice}
        />
      )}
    </div>
  )
}