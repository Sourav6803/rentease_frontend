// components/delivery/DeliveryStatusBadge.tsx
'use client'

import { CheckCircle, Clock, Truck, Package, XCircle } from 'lucide-react'

interface DeliveryStatusBadgeProps {
  status: 'pending' | 'assigned' | 'out_for_delivery' | 'in_transit' | 'delivered' | 'failed' | 'cancelled'
  size?: 'sm' | 'md' | 'lg'
}

export function DeliveryStatusBadge({ status, size = 'md' }: DeliveryStatusBadgeProps) {
  const config = {
    pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    assigned: { label: 'Assigned', icon: Package, color: 'bg-blue-100 text-blue-700' },
    out_for_delivery: { label: 'Out for Delivery', icon: Truck, color: 'bg-purple-100 text-purple-700' },
    in_transit: { label: 'In Transit', icon: Package, color: 'bg-indigo-100 text-indigo-700' },
    delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    failed: { label: 'Failed', icon: XCircle, color: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-slate-100 text-slate-700' }
  }

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm'
  }

  const Icon = config[status].icon

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${config[status].color} ${sizeClasses[size]}`}>
      <Icon className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      {config[status].label}
    </span>
  )
}