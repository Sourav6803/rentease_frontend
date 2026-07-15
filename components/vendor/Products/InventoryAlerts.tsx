'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Package, Wrench, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { InventoryStats } from '../VendorInventory'
import { Button } from '@/components/ui/button'

interface InventoryAlertsProps {
  stats: InventoryStats | null
}

export function InventoryAlerts({ stats }: InventoryAlertsProps) {
  if (!stats) return null
  
  const alerts = []
  
  if (stats.lowStockItems > 0) {
    alerts.push({
      type: 'warning',
      icon: Package,
      title: 'Low Stock Alert',
      message: `${stats.lowStockItems} items are running low on stock. Restock soon to avoid shortages.`,
      action: 'View Items',
      link: '/vendor/inventory?filter=low-stock'
    })
  }
  
  if (stats.maintenance > 5) {
    alerts.push({
      type: 'info',
      icon: Wrench,
      title: 'Maintenance Queue',
      message: `${stats.maintenance} items are in maintenance. Schedule inspections to reduce backlog.`,
      action: 'View Queue',
      link: '/vendor/inventory?status=maintenance'
    })
  }
  
  if (stats.utilizationRate < 50) {
    alerts.push({
      type: 'info',
      icon: TrendingUp,
      title: 'Low Utilization',
      message: `Inventory utilization is at ${stats.utilizationRate}%. Consider promotions to increase rentals.`,
      action: 'View Analytics',
      link: '/vendor/analytics'
    })
  }
  
  if (alerts.length === 0) return null
  
  return (
    <div className="mt-4 space-y-3">
      {alerts.map((alert, idx) => (
        <motion.div
          key={alert.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className={`border-l-4 ${alert.type === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500'} shadow-sm`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-blue-50 dark:bg-blue-950/30'}`}>
                  <alert.icon className={`h-5 w-5 ${alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{alert.title}</h4>
                    <Badge variant={alert.type === 'warning' ? 'destructive' : 'secondary'} className="text-[10px]">
                      Attention Needed
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
                <Button variant="link" className="text-primary" asChild>
                  {alert.action} →
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}