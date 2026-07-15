'use client'

import { motion } from 'framer-motion'
import { Package, MoreVertical, Edit, Eye, Truck, Wrench, AlertTriangle, MapPin, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { InventoryItem } from '../VendorInventory'

interface InventoryListViewProps {
  items: InventoryItem[]
  onViewDetails: (item: InventoryItem) => void
  onAdjustStock: (item: InventoryItem) => void
  onTransferItem: (item: InventoryItem) => void
  getStatusConfig: (status: string) => { label: string; color: string; bgColor: string }
  getConditionConfig: (condition: string) => { label: string; color: string }
}

export function InventoryListView({
  items,
  onViewDetails,
  onAdjustStock,
  onTransferItem,
  getStatusConfig,
  getConditionConfig
}: InventoryListViewProps) {
  return (
    <div className="space-y-3 p-4">
      {items.map((item, index) => {
        const statusConfig = getStatusConfig(item.status)
        const conditionConfig = getConditionConfig(item.condition.status)
        const primaryImage = item.product.media.images?.find(img => img.isPrimary) || item.product.media.images?.[0]
        const isLowStock = item.product.inventory?.availableQuantity < 5
        
        return (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.3) }}
          >
            <Card className="hover:shadow-md transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Image */}
                  <div className="relative w-full lg:w-24 h-24 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                    {primaryImage ? (
                      <img
                        src={primaryImage.thumbnail || primaryImage.url}
                        alt={item.product.basicInfo.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                    {isLowStock && (
                      <div className="absolute top-1 right-1">
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent>Low stock! Only {item.product.inventory?.availableQuantity} left</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.product.basicInfo.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.sku} • Brand: {item.product.basicInfo.brand}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`${statusConfig.bgColor} rounded-lg px-2 py-1`}>
                          <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${conditionConfig.color} border-current`}>
                          {conditionConfig.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.location.city} • {item.location.warehouse} - {item.location.shelf}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Available: {item.product.inventory?.availableQuantity || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">Rentals: {item.rentalHistory?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Value: ₹{item.depreciation?.currentValue || item.purchaseInfo?.price}</span>
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-4">
                        {item.currentRental && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Rented until: {new Date(item.currentRental.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {item.condition.nextInspectionDate && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Wrench className="h-4 w-4" />
                            <span>Next inspection: {new Date(item.condition.nextInspectionDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewDetails(item)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAdjustStock(item)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Adjust
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onTransferItem(item)}>
                              <Truck className="h-4 w-4 mr-2" /> Transfer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              navigator.clipboard.writeText(item.sku)
                              // toast.success('SKU copied')
                            }}>
                              <Package className="h-4 w-4 mr-2" /> Copy SKU
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}