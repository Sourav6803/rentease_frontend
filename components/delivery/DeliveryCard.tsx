// components/delivery/DeliveryCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Package, MapPin, Clock, Navigation, Phone, Star } from 'lucide-react'
import Link from 'next/link'

interface DeliveryCardProps {
  delivery: {
    id: string
    deliveryNumber: string
    customer: string
    address: string
    time: string
    slot: string
    distance: string
    status: 'pending' | 'in_progress' | 'completed'
    rating?: number
    items?: Array<{ name: string; quantity: number }>
  }
  onStart?: (id: string) => void
  showActions?: boolean
}

export function DeliveryCard({ delivery, onStart, showActions = true }: DeliveryCardProps) {
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700' }
  }

  const config = statusConfig[delivery.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-mono text-slate-400">{delivery.deliveryNumber}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
              {config.label}
            </span>
          </div>
          <h4 className="font-medium text-slate-800">{delivery.customer}</h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            <span>{delivery.address}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{delivery.time}</span>
            <span className="flex items-center gap-1"><Navigation className="h-3 w-3" />{delivery.distance}</span>
          </div>
          {delivery.items && delivery.items.length > 0 && (
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <Package className="h-3 w-3" />
              <span>{delivery.items.length} item(s)</span>
            </div>
          )}
          {delivery.rating && (
            <div className="mt-2 flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium">{delivery.rating}</span>
            </div>
          )}
        </div>
        {showActions && delivery.status === 'pending' && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onStart?.(delivery.id)}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold"
            >
              Start
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Call
            </button>
          </div>
        )}
        {showActions && delivery.status === 'in_progress' && (
          <Link
            href={`/delivery/active/${delivery.id}`}
            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold"
          >
            Continue
          </Link>
        )}
      </div>
    </motion.div>
  )
}