// app/vendor/orders/pending/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Clock, AlertCircle, ChevronLeft, ChevronRight,
  RefreshCw, CheckCircle, Ban, Eye, Truck, XCircle
} from 'lucide-react'
import { Rental, RentalStatus } from '../types'
import { OrderStatusBadge } from '@/components/vendor/orders/OrderStatusBadge'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

// Pending Order Card Component
function PendingOrderCard({ 
  rental, 
  onConfirm, 
  onCancel, 
  onViewDetails 
}: { 
  rental: Rental
  onConfirm: (rental: Rental) => void
  onCancel: (rental: Rental) => void
  onViewDetails: (rental: Rental) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null)
  
  const primaryImage = rental.product.media.images?.find(img => img.isPrimary) || rental.product.media.images?.[0]
  const daysUntilStart = Math.ceil(
    (new Date(rental.rentalDetails.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  
  const handleConfirm = async () => {
    setIsActionLoading('confirm')
    await onConfirm(rental)
    setIsActionLoading(null)
  }
  
  const handleCancel = async () => {
    setIsActionLoading('cancel')
    await onCancel(rental)
    setIsActionLoading(null)
  }
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl border-l-4 border-l-amber-500 border border-slate-200 overflow-hidden hover:shadow-md transition-all"
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
                  {daysUntilStart <= 2 && daysUntilStart > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-semibold rounded-full">
                      <AlertCircle className="h-2.5 w-2.5" />
                      Urgent: Starts in {daysUntilStart} day{daysUntilStart !== 1 ? 's' : ''}
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
                <Clock className="h-3.5 w-3.5" />
                <span>Starts: {format(new Date(rental.rentalDetails.startDate), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Package className="h-3.5 w-3.5" />
                <span>{rental.rentalDetails.tenureMonths} months</span>
              </div>
            </div>
          </div>
          
          {/* Amount & Actions */}
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-slate-900">₹{rental.rentalDetails.totalAmount.toLocaleString()}</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Payment {rental.payment.paidAmount > 0 ? 'Partial' : 'Pending'}
            </p>
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleConfirm}
                disabled={isActionLoading !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isActionLoading === 'confirm' ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                Confirm
              </button>
              <button
                onClick={handleCancel}
                disabled={isActionLoading !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isActionLoading === 'cancel' ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Ban className="h-3.5 w-3.5" />
                )}
                Cancel
              </button>
              <button
                onClick={() => onViewDetails(rental)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer Details</p>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="text-slate-500 w-24">Name:</span>
                    <span>{rental.user.profile.firstName} {rental.user.profile.lastName}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-slate-500 w-24">Email:</span>
                    <span className="text-sm">{rental.user.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-slate-500 w-24">Phone:</span>
                    <span>{rental.user.phone || 'Not provided'}</span>
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Delivery Address</p>
                <div className="text-sm text-slate-600">
                  <p>{rental.address.addressLine1}</p>
                  {rental.address.addressLine2 && <p>{rental.address.addressLine2}</p>}
                  <p>{rental.address.city}, {rental.address.state} - {rental.address.pincode}</p>
                </div>
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

// Pending Orders Filter Component
function PendingFilters({ 
  searchTerm, 
  onSearchChange,
  urgencyFilter,
  onUrgencyFilterChange
}: { 
  searchTerm: string
  onSearchChange: (value: string) => void
  urgencyFilter: 'all' | 'urgent' | 'normal'
  onUrgencyFilterChange: (value: 'all' | 'urgent' | 'normal') => void
}) {
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
        
        <div className="flex gap-2">
          <button
            onClick={() => onUrgencyFilterChange('all')}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              urgencyFilter === 'all'
                ? 'bg-[#2874f0] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onUrgencyFilterChange('urgent')}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              urgencyFilter === 'urgent'
                ? 'bg-red-500 text-white'
                : 'bg-white border border-slate-200 text-red-600 hover:bg-red-50'
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            Urgent
          </button>
          <button
            onClick={() => onUrgencyFilterChange('normal')}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              urgencyFilter === 'normal'
                ? 'bg-[#2874f0] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Normal
          </button>
        </div>
      </div>
    </div>
  )
}

// Order Details Modal (reuse from previous implementation)
function PendingOrderDetailsModal({ 
  rental, 
  onClose, 
  onConfirm, 
  onCancel 
}: { 
  rental: Rental
  onClose: () => void
  onConfirm: (rental: Rental) => void
  onCancel: (rental: Rental) => void
}) {
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null)
  
  const handleConfirm = async () => {
    setIsActionLoading('confirm')
    await onConfirm(rental)
    setIsActionLoading(null)
  }
  
  const handleCancel = async () => {
    setIsActionLoading('cancel')
    await onCancel(rental)
    setIsActionLoading(null)
  }
  
  const primaryImage = rental.product.media.images?.find(img => img.isPrimary) || rental.product.media.images?.[0]
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs font-mono">{rental.rentalNumber}</p>
                <h2 className="text-xl font-bold text-white">Pending Order</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-full bg-white/20 hover:bg-white/30">
                <XCircle className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
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
                <p className="text-sm text-slate-500 mt-1">Monthly Rent: ₹{rental.rentalDetails.monthlyRent.toLocaleString()}</p>
              </div>
            </div>
            
            {/* Rental Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-2">Rental Period</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Start Date:</span>
                    <span>{format(new Date(rental.rentalDetails.startDate), 'dd MMM yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">End Date:</span>
                    <span>{format(new Date(rental.rentalDetails.endDate), 'dd MMM yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tenure:</span>
                    <span>{rental.rentalDetails.tenureMonths} months</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-2">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Amount:</span>
                    <span className="font-semibold">₹{rental.rentalDetails.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Paid:</span>
                    <span className="text-green-600">₹{rental.payment.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Due:</span>
                    <span className="text-orange-600">₹{rental.payment.dueAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Customer Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-2">Customer Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-slate-500 w-24 inline-block">Name:</span> {rental.user.profile.firstName} {rental.user.profile.lastName}</p>
                <p><span className="text-slate-500 w-24 inline-block">Email:</span> {rental.user.email}</p>
                <p><span className="text-slate-500 w-24 inline-block">Phone:</span> {rental.user.phone || 'Not provided'}</p>
              </div>
            </div>
            
            {/* Delivery Address */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-2">Delivery Address</h4>
              <p className="text-sm text-slate-600">
                {rental.address.addressLine1}<br />
                {rental.address.addressLine2 && <>{rental.address.addressLine2}<br /></>}
                {rental.address.city}, {rental.address.state} - {rental.address.pincode}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="sticky bottom-0 border-t border-slate-200 px-6 py-4 bg-white">
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={isActionLoading !== null}
                className="flex items-center gap-2 px-6 py-2.5 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isActionLoading === 'cancel' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                Cancel Order
              </button>
              <button
                onClick={handleConfirm}
                disabled={isActionLoading !== null}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isActionLoading === 'confirm' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Pending Orders Page
export default function PendingOrdersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const  toast  = useToast()
  
  const [rentals, setRentals] = useState<Rental[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'urgent' | 'normal'>('all')
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  const fetchPendingOrders = useCallback(async () => {
    if (status !== 'authenticated') return
    
    try {
      const headers = await getAuthHeaders()
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', '12')
      params.set('status', 'pending')
      if (searchTerm) params.set('search', searchTerm)
      
      const res = await fetch(`${BASE_URL}/api/v1/rentals/vendor/me?${params.toString()}`, { headers })
      const data = await res.json()
      
      if (data.success) {
        let filteredRentals = data.data.rentals || []
        
        // Apply urgency filter
        if (urgencyFilter === 'urgent') {
          filteredRentals = filteredRentals.filter((r: Rental) => {
            const daysUntilStart = Math.ceil(
              (new Date(r.rentalDetails.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )
            return daysUntilStart <= 2 && daysUntilStart > 0
          })
        } else if (urgencyFilter === 'normal') {
          filteredRentals = filteredRentals.filter((r: Rental) => {
            const daysUntilStart = Math.ceil(
              (new Date(r.rentalDetails.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )
            return daysUntilStart > 2
          })
        }
        
        setRentals(filteredRentals)
        setTotalPages(data.data.pagination?.pages || 1)
        setTotalOrders(data.data.pagination?.total || 0)
      } else {
        toast.error(data.message || 'Failed to load pending orders')
      }
    } catch (error) {
      toast.error('Failed to load pending orders')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm, urgencyFilter, status, toast])
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchPendingOrders()
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [fetchPendingOrders, status, router])
  
  const handleConfirm = async (rental: Rental) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/rentals/vendor/${rental._id}/confirm`, {
        method: 'POST',
        headers
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success(`Order ${rental.rentalNumber} confirmed successfully`)
        fetchPendingOrders()
        setShowDetailsModal(false)
        setSelectedRental(null)
      } else {
        toast.error(data.message || 'Failed to confirm order')
      }
    } catch (error) {
      toast.error('Failed to confirm order')
    }
  }
  
  const handleCancel = async (rental: Rental) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/rentals/${rental._id}/cancel`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason: 'Cancelled by vendor' })
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success(`Order ${rental.rentalNumber} cancelled`)
        fetchPendingOrders()
        setShowDetailsModal(false)
        setSelectedRental(null)
      } else {
        toast.error(data.message || 'Failed to cancel order')
      }
    } catch (error) {
      toast.error('Failed to cancel order')
    }
  }
  
  const stats = [
    { label: 'Total Pending', value: totalOrders, color: '#fb641b', bg: '#fff3e0' },
    { label: 'Urgent (≤2 days)', value: rentals.filter(r => {
      const days = Math.ceil((new Date(r.rentalDetails.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return days <= 2 && days > 0
    }).length, color: '#ef4444', bg: '#fef2f2' },
    { label: 'Normal (>2 days)', value: rentals.filter(r => {
      const days = Math.ceil((new Date(r.rentalDetails.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return days > 2
    }).length, color: '#22c55e', bg: '#f0fdf4' },
  ]
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading pending orders...</p>
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
            <h1 className="text-2xl font-bold text-slate-900">Pending Orders</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Orders awaiting your confirmation
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Info Banner */}
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">Action Required</p>
              <p className="text-sm text-amber-700">
                Confirm pending orders to proceed with delivery. Orders not confirmed within 48 hours may be automatically cancelled.
              </p>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <PendingFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          urgencyFilter={urgencyFilter}
          onUrgencyFilterChange={setUrgencyFilter}
        />
        
        {/* Orders List */}
        <AnimatePresence mode="popLayout">
          {rentals.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-16 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#ebf3fb] rounded-full flex items-center justify-center mb-5">
                <CheckCircle className="h-9 w-9 text-[#2874f0]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1.5">
                No Pending Orders
              </h3>
              <p className="text-sm text-slate-500 max-w-xs">
                All caught up! New orders will appear here when customers place them.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rentals.map(rental => (
                <PendingOrderCard
                  key={rental._id}
                  rental={rental}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                  onViewDetails={(r) => { setSelectedRental(r); setShowDetailsModal(true) }}
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
        <PendingOrderDetailsModal
          rental={selectedRental}
          onClose={() => { setShowDetailsModal(false); setSelectedRental(null) }}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}