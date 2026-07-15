// components/vendor/orders/OrderDetailsModal.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Calendar, MapPin, Package, DollarSign, Truck, CheckCircle,
  Clock, User, Phone, Mail, FileText, Download, Printer,
  MessageCircle, AlertCircle, ChevronRight, CreditCard,
  Building2, Hash, Tag, Eye, RefreshCw, Send, Check, Ban,
  Shield, Home, Navigation, Star, FileCheck, Receipt
} from 'lucide-react'
import { Rental, STATUS_CONFIG, RentalStatus } from '@/app/(vendor)/vendor/orders/types'
import { OrderStatusBadge } from './OrderStatusBadge'
import { format } from 'date-fns'

interface OrderDetailsModalProps {
  rental: Rental
  onClose: () => void
  onAction: (rental: Rental, action: string) => Promise<void>
}

const STATUS_STEPS: RentalStatus[] = [
  'pending',
  'confirmed',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'active',
  'return_initiated',
  'out_for_pickup',
  'completed'
]

const STATUS_ICONS: Record<RentalStatus, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  ready_for_delivery: Package,
  out_for_delivery: Truck,
  delivered: Home,
  active: CheckCircle,
  extension_requested: RefreshCw,
  return_initiated: Package,
  out_for_pickup: Truck,
  completed: CheckCircle,
  cancelled: Ban,
  overdue: AlertCircle,
  disputed: AlertCircle
}

export function OrderDetailsModal({ rental, onClose, onAction }: OrderDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'payments' | 'details'>('overview')
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null)
  const [showExtensionModal, setShowExtensionModal] = useState(false)
  const [extensionMonths, setExtensionMonths] = useState(1)
  
  const currentStepIndex = STATUS_STEPS.indexOf(rental.status)
  const config = STATUS_CONFIG[rental.status]
  
  const primaryImage = rental.product.media.images?.find(img => img.isPrimary) || rental.product.media.images?.[0]
  
  const handleActionClick = async (action: string) => {
    setIsActionLoading(action)
    try {
      await onAction(rental, action)
    } finally {
      setIsActionLoading(null)
    }
  }
  
  const handleExtension = async () => {
    setIsActionLoading('extend')
    try {
      // Call extension API
      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/rentals/${rental._id}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify({ extensionMonths })
      })
      const data = await res.json()
      if (data.success) {
        setShowExtensionModal(false)
        await onAction(rental, 'extend')
      }
    } finally {
      setIsActionLoading(null)
    }
  }
  
  const handleDownloadInvoice = async () => {
    try {
      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/rentals/${rental._id}/invoice/download`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
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
      }
    } catch (error) {
      console.error('Failed to download invoice:', error)
    }
  }
  
  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Backdrop */}
          <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
          
          {/* Modal Panel */}
          <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                className="p-1 rounded-full bg-white/90 hover:bg-white transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2874f0] to-[#00a0e3] px-6 py-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-white/70 text-xs font-mono mb-1">{rental.rentalNumber}</p>
                  <h2 className="text-xl font-bold text-white">{rental.product.basicInfo.name}</h2>
                  <p className="text-white/80 text-sm mt-1">
                    Customer: {rental.user.profile.firstName} {rental.user.profile.lastName}
                  </p>
                </div>
                <OrderStatusBadge status={rental.status} />
              </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-slate-200 px-6">
              <div className="flex gap-6">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'timeline', label: 'Timeline', icon: Clock },
                  { id: 'payments', label: 'Payments', icon: CreditCard },
                  { id: 'details', label: 'Details', icon: FileText },
                ].map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-3 border-b-2 transition-all ${
                        activeTab === tab.id
                          ? 'border-[#2874f0] text-[#2874f0]'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Product & Image */}
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0">
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
                      <div>
                        <p className="text-sm text-slate-500">SKU: {rental.product.basicInfo.sku}</p>
                        <p className="text-sm text-slate-500 mt-1">Monthly Rent: ₹{rental.rentalDetails.monthlyRent.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">Security Deposit: ₹{rental.rentalDetails.securityDeposit.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {/* Rental Period */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#2874f0]" />
                        Rental Period
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-400">Start Date</p>
                          <p className="font-medium">{format(new Date(rental.rentalDetails.startDate), 'dd MMM yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">End Date</p>
                          <p className="font-medium">{format(new Date(rental.rentalDetails.endDate), 'dd MMM yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Tenure</p>
                          <p className="font-medium">{rental.rentalDetails.tenureMonths} months</p>
                        </div>
                        {rental.rentalDetails.actualEndDate && (
                          <div>
                            <p className="text-xs text-slate-400">Actual Return Date</p>
                            <p className="font-medium">{format(new Date(rental.rentalDetails.actualEndDate), 'dd MMM yyyy')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Customer Info */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <User className="h-4 w-4 text-[#2874f0]" />
                        Customer Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">
                            {rental.user.profile.firstName} {rental.user.profile.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{rental.user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{rental.user.phone || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Delivery Address */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#2874f0]" />
                        Delivery Address
                      </h3>
                      <p className="text-sm text-slate-600">
                        {rental.address.addressLine1}<br />
                        {rental.address.addressLine2 && <>{rental.address.addressLine2}<br /></>}
                        {rental.address.city}, {rental.address.state} - {rental.address.pincode}
                      </p>
                    </div>
                    
                    {/* Delivery & Pickup Status */}
                    {(rental.delivery || rental.pickup) && (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                          <Truck className="h-4 w-4 text-[#2874f0]" />
                          Delivery & Pickup
                        </h3>
                        <div className="space-y-2">
                          {rental.delivery && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Delivery Status:</span>
                              <span className="font-medium capitalize">{rental.delivery.status}</span>
                            </div>
                          )}
                          {rental.delivery?.scheduledDate && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Scheduled Delivery:</span>
                              <span>{format(new Date(rental.delivery.scheduledDate), 'dd MMM yyyy')}</span>
                            </div>
                          )}
                          {rental.pickup && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Pickup Status:</span>
                              <span className="font-medium capitalize">{rental.pickup.status}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                  <motion.div
                    key="timeline"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Progress Steps */}
                    <div className="relative">
                      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
                      {STATUS_STEPS.map((status, idx) => {
                        const isCompleted = idx <= currentStepIndex
                        const Icon = STATUS_ICONS[status]
                        const isCurrent = status === rental.status
                        
                        return (
                          <div key={status} className="relative flex gap-4 pb-6 last:pb-0">
                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                              ${isCompleted 
                                ? isCurrent 
                                  ? 'bg-[#2874f0] ring-4 ring-[#2874f0]/20' 
                                  : 'bg-green-500'
                                : 'bg-slate-200'
                              }`}
                            >
                              {isCompleted && !isCurrent ? (
                                <Check className="h-5 w-5 text-white" />
                              ) : (
                                <Icon className={`h-5 w-5 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                              )}
                            </div>
                            <div className="flex-1 pt-1.5">
                              <p className={`font-semibold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                                {STATUS_CONFIG[status]?.label || status}
                              </p>
                              {isCurrent && (
                                <p className="text-xs text-[#2874f0] mt-0.5">Current Status</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Timeline Events */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <h3 className="font-semibold text-slate-800 mb-3">Event History</h3>
                      <div className="space-y-3">
                        {rental.timeline.map((event, idx) => (
                          <div key={idx} className="flex gap-3 text-sm">
                            <div className="w-24 shrink-0">
                              <p className="text-slate-400">{format(new Date(event.timestamp), 'dd MMM, hh:mm a')}</p>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-700 capitalize">{event.status.replace(/_/g, ' ')}</p>
                              {event.note && <p className="text-slate-500 text-xs mt-0.5">{event.note}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Payments Tab */}
                {activeTab === 'payments' && (
                  <motion.div
                    key="payments"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Payment Summary */}
                    <div className="bg-gradient-to-r from-[#2874f0]/5 to-[#00a0e3]/5 rounded-xl p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-slate-400">Total Amount</p>
                          <p className="text-xl font-bold text-slate-900">₹{rental.rentalDetails.totalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Paid Amount</p>
                          <p className="text-xl font-bold text-green-600">₹{rental.payment.paidAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Due Amount</p>
                          <p className="text-xl font-bold text-orange-600">₹{rental.payment.dueAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Payment Status</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1
                            ${rental.payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                              rental.payment.status === 'partial' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}
                          >
                            {rental.payment.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment Breakdown */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-semibold text-slate-800 mb-3">Payment Breakdown</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Monthly Rent ({rental.rentalDetails.tenureMonths} months × ₹{rental.rentalDetails.monthlyRent.toLocaleString()})</span>
                          <span>₹{rental.rentalDetails.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Security Deposit</span>
                          <span>₹{rental.rentalDetails.securityDeposit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Delivery Charges</span>
                          <span>₹{rental.rentalDetails.deliveryCharges.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Tax (18% GST)</span>
                          <span>₹{rental.rentalDetails.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold">
                          <span>Total</span>
                          <span className="text-[#2874f0]">₹{rental.rentalDetails.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Next Due Date */}
                    {rental.payment.nextDueDate && rental.payment.status !== 'completed' && (
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-amber-600" />
                          <p className="text-sm text-amber-800">
                            Next payment due: {format(new Date(rental.payment.nextDueDate), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Invoice Button */}
                    <button
                      onClick={handleDownloadInvoice}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download Invoice
                    </button>
                  </motion.div>
                )}
                
                {/* Details Tab */}
                {activeTab === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                          <Hash className="h-4 w-4 text-[#2874f0]" />
                          Order Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Order ID</span>
                            <span className="font-mono">{rental.rentalNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Created At</span>
                            <span>{format(new Date(rental.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Last Updated</span>
                            <span>{format(new Date(rental.updatedAt), 'dd MMM yyyy, hh:mm a')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                          <Tag className="h-4 w-4 text-[#2874f0]" />
                          Product Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Product ID</span>
                            <span className="font-mono">{rental.product._id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">SKU</span>
                            <span>{rental.product.basicInfo.sku}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Monthly Rent</span>
                            <span>₹{rental.rentalDetails.monthlyRent.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Special Requests */}
                    {(rental as any).specialRequests && (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h3 className="font-semibold text-slate-800 mb-2">Special Requests</h3>
                        <p className="text-sm text-slate-600">{(rental as any).specialRequests}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Action Buttons Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex flex-wrap gap-3 justify-end">
                {config.actions.map(action => {
                  // Special handling for extension
                  if (action === 'extend') {
                    return (
                      <button
                        key={action}
                        onClick={() => setShowExtensionModal(true)}
                        disabled={isActionLoading !== null}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isActionLoading === 'extend' ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Extend Rental
                      </button>
                    )
                  }
                  
                  const actionLabels: Record<string, string> = {
                    confirm: 'Confirm Order',
                    mark_delivery: 'Mark for Delivery',
                    dispatch: 'Dispatch',
                    mark_delivered: 'Mark Delivered',
                    activate: 'Activate Rental',
                    initiate_return: 'Initiate Return',
                    schedule_pickup: 'Schedule Pickup',
                    complete_return: 'Complete Return',
                    approve_extension: 'Approve Extension',
                    reject_extension: 'Reject',
                    view_receipt: 'View Receipt',
                    send_reminder: 'Send Reminder',
                    resolve: 'Resolve Dispute',
                    cancel: 'Cancel Order',
                  }
                  
                  const isDestructive = action === 'cancel' || action === 'reject_extension'
                  
                  return (
                    <button
                      key={action}
                      onClick={() => handleActionClick(action)}
                      disabled={isActionLoading !== null}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50
                        ${isDestructive 
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-[#2874f0] text-white hover:bg-[#1a5fd4]'
                        }`}
                    >
                      {isActionLoading === action ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {action === 'confirm' && <CheckCircle className="h-4 w-4" />}
                          {action === 'mark_delivery' && <Truck className="h-4 w-4" />}
                          {action === 'mark_delivered' && <Check className="h-4 w-4" />}
                          {action === 'activate' && <Package className="h-4 w-4" />}
                          {action === 'initiate_return' && <Package className="h-4 w-4" />}
                          {action === 'complete_return' && <Check className="h-4 w-4" />}
                          {action === 'cancel' && <Ban className="h-4 w-4" />}
                        </>
                      )}
                      {actionLabels[action] || action.replace(/_/g, ' ')}
                    </button>
                  )
                })}
                
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Receipt className="h-4 w-4" />
                  Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Extension Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowExtensionModal(false)} />
          <div className="relative bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Extend Rental</h3>
            <p className="text-sm text-slate-600 mb-4">
              How many additional months would you like to extend this rental?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Extension Period</label>
              <select
                value={extensionMonths}
                onChange={(e) => setExtensionMonths(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
              >
                {[1, 2, 3, 4, 5, 6].map(months => (
                  <option key={months} value={months}>{months} month{months !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span>Additional Cost (₹{rental.rentalDetails.monthlyRent} × {extensionMonths})</span>
                <span className="font-semibold">₹{(rental.rentalDetails.monthlyRent * extensionMonths).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExtensionModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExtension}
                disabled={isActionLoading !== null}
                className="flex-1 px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] disabled:opacity-50"
              >
                {isActionLoading === 'extend' ? 'Processing...' : 'Confirm Extension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}