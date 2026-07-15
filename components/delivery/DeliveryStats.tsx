// components/delivery/DeliveryStats.tsx
'use client'

import { motion } from 'framer-motion'
import { Package, Clock, Star, TrendingUp } from 'lucide-react'

interface DeliveryStatsProps {
  stats: {
    totalDeliveries: number
    completedToday: number
    rating: number
    onTimeRate: number
    earnings: number
  }
}

export function DeliveryStats({ stats }: DeliveryStatsProps) {
  const statItems = [
    { label: 'Total Deliveries', value: stats.totalDeliveries, icon: Package, color: '#2874f0' },
    { label: 'Today\'s Progress', value: `${stats.completedToday}/?`, icon: Clock, color: '#21a056' },
    { label: 'Rating', value: stats.rating, icon: Star, color: '#fbbf24', suffix: '★' },
    { label: 'On-Time Rate', value: `${stats.onTimeRate}%`, icon: TrendingUp, color: '#8b5cf6' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statItems.map((item, idx) => {
        const Icon = item.icon
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}10` }}>
                <Icon className="h-4 w-4" style={{ color: item.color }} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-800">{item.value}{item.suffix || ''}</p>
            <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
          </motion.div>
        )
      })}
    </div>
  )
}