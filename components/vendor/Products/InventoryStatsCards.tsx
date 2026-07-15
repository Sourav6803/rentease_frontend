'use client'

import { motion } from 'framer-motion'
import { Package, CheckCircle, ShoppingBag, AlertTriangle, Wrench, Trash2, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { InventoryStats } from '../VendorInventory'

interface InventoryStatsCardsProps {
  stats: InventoryStats
}

export function InventoryStatsCards({ stats }: InventoryStatsCardsProps) {
  const cards = [
    {
      label: 'Total Items',
      value: stats.totalItems,
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      trend: '+8%',
      tooltip: 'Total number of inventory items'
    },
    {
      label: 'Available',
      value: stats.available,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-500',
      trend: '+5%',
      tooltip: 'Items ready for rent'
    },
    {
      label: 'Rented',
      value: stats.rented,
      icon: ShoppingBag,
      color: 'from-purple-500 to-pink-500',
      trend: '+12%',
      tooltip: 'Currently rented items'
    },
    {
      label: 'Maintenance',
      value: stats.maintenance,
      icon: Wrench,
      color: 'from-amber-500 to-orange-500',
      trend: '-2%',
      tooltip: 'Items under maintenance'
    },
    {
      label: 'Damaged',
      value: stats.damaged,
      icon: AlertTriangle,
      color: 'from-red-500 to-rose-500',
      trend: '-1%',
      tooltip: 'Items needing repair'
    },
    {
      label: 'Total Value',
      value: `₹${(stats.totalValue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'from-indigo-500 to-purple-500',
      trend: '+15%',
      tooltip: 'Total inventory value'
    }
  ]

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="relative overflow-hidden hover:shadow-md transition-shadow cursor-help">
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.color} opacity-10 rounded-bl-full`} />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <card.icon className="h-5 w-5 text-primary" />
                      <span className={`text-xs font-medium ${card.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                        {card.trend}
                      </span>
                    </div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>{card.tooltip}</TooltipContent>
            </Tooltip>
          </motion.div>
        ))}
      </div>
      
      {/* Utilization Rate */}
      <div className="mt-4">
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Inventory Utilization Rate</span>
              </div>
              <span className="text-sm font-semibold text-primary">{stats.utilizationRate}%</span>
            </div>
            <Progress value={stats.utilizationRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.utilizationRate >= 80 
                ? 'Excellent utilization! Consider expanding inventory.'
                : stats.utilizationRate >= 60
                ? 'Good utilization. Keep up the momentum!'
                : 'Low utilization. Consider promotional offers to increase rentals.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}