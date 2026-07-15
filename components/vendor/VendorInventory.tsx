'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Search, Filter, MoreVertical, Edit, Trash2,
  Eye, EyeOff, AlertCircle, CheckCircle, XCircle,
  RefreshCw, Grid3x3, List, ChevronLeft, ChevronRight,
  Warehouse, TrendingUp, DollarSign, Truck, Clock,
  Shield, Award, Zap, Upload, Download, Settings,
  Plus, Minus, AlertTriangle, Info, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/useToast'
import { getSession } from 'next-auth/react'
import Link from 'next/link'
import { InventoryStatsCards } from './Products/InventoryStatsCards'
import { InventoryAlerts } from './Products/InventoryAlerts'
import { InventoryFilters } from './Products/InventoryFilters'
import { InventoryGridView } from './Products/InventoryGridView'
import { InventoryListView } from './Products/InventoryListView'
import { InventoryDetailsModal } from './Products/InventoryDetailsModal'
import { StockAdjustModal } from './Products/StockAdjustModal'
import { BulkTransferModal } from './Products/BulkTransferModal'
// import { InventoryStatsCards } from './InventoryStatsCards'
// import { InventoryFilters } from './InventoryFilters'
// import { InventoryGridView } from './InventoryGridView'
// import { InventoryListView } from './InventoryListView'
// import { InventoryDetailsModal } from './InventoryDetailsModal'
// import { StockAdjustModal } from './StockAdjustModal'
// import { BulkTransferModal } from './BulkTransferModal'
// import { InventoryAlerts } from './InventoryAlerts'

// Types
export interface InventoryItem {
  _id: string
  product: {
    _id: string
    basicInfo: {
      name: string
      brand: string
      sku: string
    }
    pricing: {
      monthlyRent: number
    }
    media: {
      images: Array<{
        url: string
        thumbnail: string
        isPrimary: boolean
      }>
    }
  }
  sku: string
  serialNumber?: string
  qrCode?: string
  status: 'available' | 'rented' | 'maintenance' | 'damaged' | 'reserved' | 'retired'
  condition: {
    status: 'new' | 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
    notes?: string
    lastInspectionDate?: Date
    nextInspectionDate?: Date
  }
  location: {
    warehouse: string
    shelf: string
    city: string
    pincode: string
  }
  currentRental?: {
    _id: string
    rentalNumber: string
    user: {
      name: string
    }
    startDate: Date
    endDate: Date
  }
  purchaseInfo: {
    date: Date
    price: number
    from: string
    invoiceNumber: string
    warrantyExpiry: Date
  }
  depreciation: {
    originalValue: number
    currentValue: number
    monthsUsed: number
    depreciationRate: number
  }
  rentalHistory: Array<{
    rental: string
    startDate: Date
    endDate: Date
    user: string
  }>
  maintenanceHistory: Array<{
    type: string
    date: Date
    cost: number
    notes: string
  }>
  createdAt: string
  updatedAt: string
}

export interface InventoryStats {
  totalItems: number
  available: number
  rented: number
  maintenance: number
  damaged: number
  retired: number
  totalValue: number
  utilizationRate: number
  lowStockItems: number
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const session = await getSession()
  const token = session?.user?.accessToken
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

export function VendorInventory() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [conditionFilter, setConditionFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isFetchingRef = useRef(false)
  const toast = useToast()

  // Fetch inventory data
  const fetchInventory = useCallback(async (showLoading = true) => {
    if (isFetchingRef.current) return
    if (status === 'loading') return
    if (!session?.user?.accessToken) {
      setIsLoading(false)
      return
    }
    
    isFetchingRef.current = true
    if (showLoading) setIsLoading(true)
    
    try {
      const headers = await getAuthHeaders()
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(conditionFilter !== 'all' && { condition: conditionFilter }),
        ...(locationFilter !== 'all' && { location: locationFilter })
      })
      
      const response = await fetch(`${BASE_URL}/api/v1/vendor/inventory?${params}`, { headers })
      const data = await response.json()
      
      if (data.success) {
        setInventory(data.data.items || [])
        setTotalPages(data.data.pagination?.pages || 1)
        setTotalItems(data.data.pagination?.total || 0)
        if (data.data.summary) {
          setStats(data.data.summary)
        }
      } else {
        console.error('API error:', data.message)
        if (data.statusCode === 401) {
          toast.error('Session expired. Please login again.')
          router.push('/login')
        } else {
          toast.error(data.message || 'Failed to load inventory')
        }
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
      toast.error('Failed to load inventory')
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [currentPage, searchTerm, statusFilter, conditionFilter, locationFilter, session?.user?.accessToken, status, router, toast])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.accessToken) {
      fetchInventory(true)
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [fetchInventory, status, session?.user?.accessToken, router])

  const handleRefresh = () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    fetchInventory(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item)
    setShowDetailsModal(true)
  }

  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedItem(item)
    setShowStockModal(true)
  }

  const handleTransferItem = (item: InventoryItem) => {
    setSelectedItem(item)
    setShowTransferModal(true)
  }

  const getStatusConfig = (status: string) => {
    const config: Record<string, { label: string; color: string; bgColor: string }> = {
      'available': { label: 'Available', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30' },
      'rented': { label: 'Rented', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
      'maintenance': { label: 'Maintenance', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
      'damaged': { label: 'Damaged', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/30' },
      'reserved': { label: 'Reserved', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
      'retired': { label: 'Retired', color: 'text-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-950/30' }
    }
    return config[status] || config['available']
  }

  const getConditionConfig = (condition: string) => {
    const config: Record<string, { label: string; color: string }> = {
      'new': { label: 'New', color: 'text-emerald-600' },
      'excellent': { label: 'Excellent', color: 'text-emerald-600' },
      'good': { label: 'Good', color: 'text-blue-600' },
      'fair': { label: 'Fair', color: 'text-amber-600' },
      'poor': { label: 'Poor', color: 'text-orange-600' },
      'damaged': { label: 'Damaged', color: 'text-red-600' }
    }
    return config[condition] || config['good']
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto py-6 px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                    <Warehouse className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                      Inventory Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Track and manage your product inventory across warehouses</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => router.push('/vendor/inventory/import')}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/vendor/inventory/export')}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button 
                  onClick={() => router.push('/vendor/inventory/add')}
                  className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>
            
            {/* Stats Cards */}
            {stats && <InventoryStatsCards stats={stats} />}
            
            {/* Alerts */}
            <InventoryAlerts stats={stats} />
          </div>
          
          {/* Filters */}
          <InventoryFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            conditionFilter={conditionFilter}
            onConditionFilterChange={setConditionFilter}
            locationFilter={locationFilter}
            onLocationFilterChange={setLocationFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
          
          {/* Inventory Content */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : inventory.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Package className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No inventory items found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'Try adjusting your search or filters' : 'Get started by adding your first inventory item'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => router.push('/vendor/inventory/add')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Inventory Item
                    </Button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <InventoryGridView
                  items={inventory}
                  onViewDetails={handleViewDetails}
                  onAdjustStock={handleAdjustStock}
                  onTransferItem={handleTransferItem}
                  getStatusConfig={getStatusConfig}
                  getConditionConfig={getConditionConfig}
                />
              ) : (
                <InventoryListView
                  items={inventory}
                  onViewDetails={handleViewDetails}
                  onAdjustStock={handleAdjustStock}
                  onTransferItem={handleTransferItem}
                  getStatusConfig={getStatusConfig}
                  getConditionConfig={getConditionConfig}
                />
              )}
            </CardContent>
          </Card>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum = currentPage - 2 + i
                  if (pageNum < 1) pageNum = i + 1
                  if (pageNum > totalPages) return null
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      {selectedItem && (
        <>
          <InventoryDetailsModal
            open={showDetailsModal}
            onOpenChange={setShowDetailsModal}
            item={selectedItem}
            getStatusConfig={getStatusConfig}
            getConditionConfig={getConditionConfig}
          />
          <StockAdjustModal
            open={showStockModal}
            onOpenChange={setShowStockModal}
            item={selectedItem}
            onSuccess={() => fetchInventory(true)}
          />
          <BulkTransferModal
            open={showTransferModal}
            onOpenChange={setShowTransferModal}
            item={selectedItem}
            onSuccess={() => fetchInventory(true)}
          />
        </>
      )}
    </TooltipProvider>
  )
}