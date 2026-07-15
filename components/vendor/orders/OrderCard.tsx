// components/vendor/orders/OrderCard.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Package, DollarSign, ChevronRight, Eye, Truck, CheckCircle, XCircle } from 'lucide-react'
// import { Rental, STATUS_CONFIG } from "@/app/(vendor)/orders/types"
import { OrderStatusBadge } from './OrderStatusBadge'
import { format } from 'date-fns'
import { Rental, STATUS_CONFIG } from '@/app/(vendor)/vendor/orders/types'

interface OrderCardProps {
  rental: Rental
  onViewDetails: (rental: Rental) => void
  onAction: (rental: Rental, action: string) => void
}

export function OrderCard({ rental, onViewDetails, onAction }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const config = STATUS_CONFIG[rental.status]
  
  const primaryImage = rental.product.media.images?.find(img => img.isPrimary) || rental.product.media.images?.[0]
  
  const getActionIcon = (action: string) => {
    switch(action) {
      case 'confirm': return <CheckCircle className="h-3.5 w-3.5" />
      case 'mark_delivery': return <Truck className="h-3.5 w-3.5" />
      case 'mark_delivered': return <CheckCircle className="h-3.5 w-3.5" />
      case 'activate': return <Package className="h-3.5 w-3.5" />
      case 'initiate_return': return <Package className="h-3.5 w-3.5" />
      case 'complete_return': return <CheckCircle className="h-3.5 w-3.5" />
      default: return <Eye className="h-3.5 w-3.5" />
    }
  }
  
  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      confirm: 'Confirm Order',
      cancel: 'Cancel',
      mark_delivery: 'Mark for Delivery',
      dispatch: 'Dispatch',
      mark_delivered: 'Mark Delivered',
      activate: 'Activate',
      extend: 'Extend',
      initiate_return: 'Initiate Return',
      schedule_pickup: 'Schedule Pickup',
      complete_return: 'Complete Return',
      approve_extension: 'Approve',
      reject_extension: 'Reject',
      view_receipt: 'View Receipt',
      send_reminder: 'Send Reminder',
      resolve: 'Resolve',
    }
    return labels[action] || action
  }
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all"
    >
      {/* Main Row */}
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
                <p className="text-xs text-slate-400 font-mono">{rental.rentalNumber}</p>
                <h3 className="font-semibold text-slate-900 mt-0.5">{rental.product.basicInfo.name}</h3>
                <p className="text-sm text-slate-500">{rental.user.profile.firstName} {rental.user.profile.lastName}</p>
              </div>
              <OrderStatusBadge status={rental.status} />
            </div>
            
            {/* Rental Details */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(rental.rentalDetails.startDate), 'dd MMM yyyy')} - {format(new Date(rental.rentalDetails.endDate), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <DollarSign className="h-3.5 w-3.5" />
                <span>₹{rental.rentalDetails.monthlyRent}/mo</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                <span>{rental.address.city}, {rental.address.state}</span>
              </div>
            </div>
          </div>
          
          {/* Amount & Actions */}
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-slate-900">₹{rental.rentalDetails.totalAmount.toLocaleString()}</p>
            <p className="text-xs text-slate-400">
              Paid: ₹{rental.payment.paidAmount.toLocaleString()} | Due: ₹{rental.payment.dueAmount.toLocaleString()}
            </p>
            
            <div className="flex gap-2 mt-3">
              {config.actions.slice(0, 2).map(action => (
                <button
                  key={action}
                  onClick={() => onAction(rental, action)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2874f0] text-white hover:bg-[#1a5fd4] transition-colors"
                >
                  {getActionIcon(action)}
                  {getActionLabel(action)}
                </button>
              ))}
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
            {/* Timeline preview, payment info, etc. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Breakdown</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Rent ({rental.rentalDetails.tenureMonths} months)</span>
                    <span className="font-medium">₹{rental.rentalDetails.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Deposit</span>
                    <span className="font-medium">₹{rental.rentalDetails.securityDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery Charges</span>
                    <span className="font-medium">₹{rental.rentalDetails.deliveryCharges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tax (18% GST)</span>
                    <span className="font-medium">₹{rental.rentalDetails.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-semibold">
                    <span>Total</span>
                    <span className="text-[#2874f0]">₹{rental.rentalDetails.totalAmount.toLocaleString()}</span>
                  </div>
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