'use client'

import { motion } from 'framer-motion'
import { Package, MoreVertical, Edit, Eye, Truck, Wrench, AlertTriangle, TrendingUp, DollarSign, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

interface InventoryGridViewProps {
  items: InventoryItem[]
  onViewDetails: (item: InventoryItem) => void
  onAdjustStock: (item: InventoryItem) => void
  onTransferItem: (item: InventoryItem) => void
  getStatusConfig: (status: string) => { label: string; color: string; bgColor: string }
  getConditionConfig: (condition: string) => { label: string; color: string }
}

export function InventoryGridView({
  items,
  onViewDetails,
  onAdjustStock,
  onTransferItem,
  getStatusConfig,
  getConditionConfig
}: InventoryGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-5">
      {items.map((item, index) => {
        const statusConfig = getStatusConfig(item.status)
        const conditionConfig = getConditionConfig(item.condition.status)
        const primaryImage = item.product.media.images?.find(img => img.isPrimary) || item.product.media.images?.[0]
        const isLowStock = item.product?.inventory?.availableQuantity < 5
        
        return (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.05, 0.5) }}
            whileHover={{ y: -4 }}
            className="group relative"
          >
            <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
              {/* Image Container */}
              <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {primaryImage ? (
                  <img
                    src={primaryImage.thumbnail || primaryImage.url}
                    alt={item.product.basicInfo.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-slate-300" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className={`absolute top-3 left-3 ${statusConfig.bgColor} rounded-lg px-2 py-1`}>
                  <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                </div>
                
                {/* Low Stock Warning */}
                {isLowStock && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute top-3 right-3">
                        <div className="bg-amber-500 rounded-full p-1.5 shadow-lg">
                          <AlertTriangle className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Low stock alert! Only {item.product.inventory?.availableQuantity} left</TooltipContent>
                  </Tooltip>
                )}
                
                {/* Quick Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onViewDetails(item)}
                    className="h-8 px-3"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onAdjustStock(item)}
                    className="h-8 px-3"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Adjust
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                {/* Product Info */}
                <div className="mb-2">
                  <h3 className="font-semibold text-base line-clamp-1">{item.product.basicInfo.name}</h3>
                  <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                </div>
                
                {/* Condition & Value */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className={`text-[10px] ${conditionConfig.color} border-current`}>
                    {conditionConfig.label}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">₹{item.depreciation?.currentValue || item.purchaseInfo?.price}</span>
                  </div>
                </div>
                
                {/* Location */}
                <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{item.location.city} • {item.location.warehouse}</span>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-help">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{item.product.inventory?.availableQuantity || 0} left</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Available quantity</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-help">
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs">+{item.rentalHistory?.length || 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Total rentals</TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onViewDetails(item)}>
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdjustStock(item)}>
                        <Edit className="h-4 w-4 mr-2" /> Adjust Stock
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTransferItem(item)}>
                        <Truck className="h-4 w-4 mr-2" /> Transfer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        navigator.clipboard.writeText(item.sku)
                        // toast.success('SKU copied')
                      }}>
                        <Package className="h-4 w-4 mr-2" /> Copy SKU
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}