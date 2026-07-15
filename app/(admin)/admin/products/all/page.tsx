// // src/app/admin/products/all/page.tsx
// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { useRouter } from 'next/navigation'
// import { useSession } from 'next-auth/react'
// import { motion } from 'framer-motion'
// import {
//   Package,
//   Search,
//   Filter,
//   RefreshCw,
//   Eye,
//   Edit,
//   Trash2,
//   MoreVertical,
//   CheckCircle,
//   XCircle,
//   Star,
//   StarOff,
//   TrendingUp,
//   DollarSign,
//   Truck,
//   AlertCircle,
//   Loader2,
//   ChevronLeft,
//   ChevronRight,
//   Download,
//   Upload,
//   Plus
// } from 'lucide-react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Badge } from '@/components/ui/badge'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from '@/components/ui/dialog'
// import { Textarea } from '@/components/ui/textarea'
// import { Label } from '@/components/ui/label'
// import { toast } from 'sonner'
// import { format } from 'date-fns'
// import axios from 'axios'
// import Image from 'next/image'
// import Link from 'next/link'
// import Loading from '@/app/loading'

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// interface Product {
//   _id: string
//   basicInfo: {
//     name: string
//     slug: string
//     brand?: string
//     sku: string
//   }
//   pricing: { monthlyRent: number }
//   media?: { images?: Array<{ url: string; thumbnail: string; isPrimary: boolean }> }
//   ratings?: { average: number; count: number }
//   inventory: { availableQuantity: number; totalQuantity: number }
//   condition: string
//   category: { _id: string; name: string; slug: string }
//   vendor?: { _id: string; business: { name: string } }
//   status: {
//     isActive: boolean
//     isFeatured: boolean
//     approvalStatus: 'pending' | 'approved' | 'rejected'
//   }
//   createdAt: string
// }

// interface ProductStats {
//   total: number
//   active: number
//   inactive: number
//   pendingApproval: number
//   featured: number
//   outOfStock: number
// }

// // Status Badge Component
// function StatusBadge({ status, isActive }: { status: string; isActive: boolean }) {
//   if (!isActive) {
//     return <Badge variant="outline" className="bg-gray-100 text-gray-600">Inactive</Badge>
//   }
//   switch (status) {
//     case 'approved':
//       return <Badge className="bg-green-100 text-green-700">Approved</Badge>
//     case 'pending':
//       return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
//     case 'rejected':
//       return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
//     default:
//       return <Badge variant="outline">{status}</Badge>
//   }
// }

// // Stock Badge Component
// function StockBadge({ quantity }: { quantity: number }) {
//   if (quantity === 0) {
//     return <Badge variant="outline" className="bg-red-100 text-red-700">Out of Stock</Badge>
//   }
//   if (quantity < 5) {
//     return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Low Stock ({quantity})</Badge>
//   }
//   return <Badge variant="outline" className="bg-green-100 text-green-700">In Stock ({quantity})</Badge>
// }

// export default function AdminAllProductsPage() {
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const [products, setProducts] = useState<Product[]>([])
//   const [stats, setStats] = useState<ProductStats | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [statusFilter, setStatusFilter] = useState('all')
//   const [stockFilter, setStockFilter] = useState('all')
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(1)
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
//   const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
//   const [rejectionReason, setRejectionReason] = useState('')
//   const [isProcessing, setIsProcessing] = useState(false)

//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.push('/admin/login')
//     }
//     if (status === 'authenticated') {
//       fetchProducts()
//       fetchStats()
//     }
//   }, [status, currentPage, statusFilter, stockFilter, searchQuery])

//   const fetchProducts = async () => {
//     setIsLoading(true)
//     try {
//       const response = await axios.get(`${BASE_URL}/api/v1/products/admin/all`, {
//         params: {
//           page: currentPage,
//           limit: 20,
//           search: searchQuery || undefined,
//           status: statusFilter !== 'all' ? statusFilter : undefined,
//           stock: stockFilter !== 'all' ? stockFilter : undefined
//         },
//         headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
//       })
//       if (response.data.success) {
//         setProducts(response.data.data.products)
//         setTotalPages(response.data.data.pagination?.pages || 1)
//       }
//     } catch (error) {
//       console.error('Error fetching products:', error)
//       toast.error('Failed to load products')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const fetchStats = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/v1/admin/dashboard/stats`, {
//         headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
//       })
//       if (response.data.success) {
//         setStats(response.data.data)
//       }
//     } catch (error) {
//       console.error('Error fetching stats:', error)
//     }
//   }

//   const handleToggleFeatured = async (productId: string, currentStatus: boolean) => {
//     setIsProcessing(true)
//     try {
//       const response = await axios.patch(
//         `${BASE_URL}/api/v1/products/admin/${productId}/feature`,
//         { isFeatured: !currentStatus },
//         { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
//       )
//       if (response.data.success) {
//         toast.success(`Product ${!currentStatus ? 'featured' : 'unfeatured'} successfully`)
//         fetchProducts()
//         fetchStats()
//       }
//     } catch (error: any) {
//       console.error('Error toggling featured:', error)
//       toast.error(error.response?.data?.message || 'Failed to update featured status')
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   const handleApproveProduct = async (productId: string) => {
//     setIsProcessing(true)
//     try {
//       const response = await axios.post(
//         `${BASE_URL}/api/v1/products/admin/${productId}/approve`,
//         {},
//         { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
//       )
//       if (response.data.success) {
//         toast.success('Product approved successfully')
//         fetchProducts()
//         fetchStats()
//       }
//     } catch (error: any) {
//       console.error('Error approving product:', error)
//       toast.error(error.response?.data?.message || 'Failed to approve product')
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   const handleRejectProduct = async () => {
//     if (!selectedProduct || !rejectionReason.trim()) {
//       toast.error('Please provide a rejection reason')
//       return
//     }

//     setIsProcessing(true)
//     try {
//       const response = await axios.post(
//         `${BASE_URL}/api/v1/products/admin/${selectedProduct._id}/reject`,
//         { reason: rejectionReason },
//         { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
//       )
//       if (response.data.success) {
//         toast.success('Product rejected successfully')
//         setIsRejectModalOpen(false)
//         setSelectedProduct(null)
//         setRejectionReason('')
//         fetchProducts()
//         fetchStats()
//       }
//     } catch (error: any) {
//       console.error('Error rejecting product:', error)
//       toast.error(error.response?.data?.message || 'Failed to reject product')
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   const statsCards = [
//     { label: 'Total Products', value: stats?.total || 0, icon: Package, color: 'from-blue-500 to-blue-600' },
//     { label: 'Active', value: stats?.active || 0, icon: CheckCircle, color: 'from-green-500 to-green-600' },
//     { label: 'Inactive', value: stats?.inactive || 0, icon: XCircle, color: 'from-red-500 to-red-600' },
//     { label: 'Pending Approval', value: stats?.pendingApproval || 0, icon: AlertCircle, color: 'from-yellow-500 to-yellow-600' },
//     { label: 'Featured', value: stats?.featured || 0, icon: Star, color: 'from-purple-500 to-purple-600' },
//     { label: 'Out of Stock', value: stats?.outOfStock || 0, icon: Truck, color: 'from-orange-500 to-orange-600' },
//   ]

//   if (status === 'loading' || isLoading) {
//     return (
//       <Loading />
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
//       <div className="max-w-7xl mx-auto p-6 space-y-6">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
//             <p className="text-muted-foreground mt-1">
//               Manage all products across all vendors
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button variant="outline" onClick={() => fetchProducts()} className="gap-2">
//               <RefreshCw className="h-4 w-4" />
//               Refresh
//             </Button>
//             <Button variant="outline" className="gap-2">
//               <Download className="h-4 w-4" />
//               Export
//             </Button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//           {statsCards.map((stat) => {
//             const Icon = stat.icon
//             return (
//               <motion.div
//                 key={stat.label}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="relative group"
//               >
//                 <Card className="overflow-hidden hover:shadow-lg transition-all">
//                   <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
//                   <CardContent className="p-4">
//                     <div className="flex items-center justify-between">
//                       <Icon className="h-5 w-5 text-muted-foreground" />
//                       <span className="text-2xl font-bold">{stat.value}</span>
//                     </div>
//                     <p className="text-xs text-muted-foreground mt-2">{stat.label}</p>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             )
//           })}
//         </div>

//         {/* Filters */}
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex flex-col md:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search by product name, SKU, or vendor..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//               <Select value={statusFilter} onValueChange={setStatusFilter}>
//                 <SelectTrigger className="w-full md:w-[180px]">
//                   <SelectValue placeholder="Approval Status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Status</SelectItem>
//                   <SelectItem value="approved">Approved</SelectItem>
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="rejected">Rejected</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Select value={stockFilter} onValueChange={setStockFilter}>
//                 <SelectTrigger className="w-full md:w-[180px]">
//                   <SelectValue placeholder="Stock Status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Stock</SelectItem>
//                   <SelectItem value="in_stock">In Stock</SelectItem>
//                   <SelectItem value="low_stock">Low Stock</SelectItem>
//                   <SelectItem value="out_of_stock">Out of Stock</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Button variant="outline" onClick={fetchProducts} className="gap-2">
//                 <Filter className="h-4 w-4" />
//                 Apply Filters
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Products Table */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-lg">Products</CardTitle>
//             <CardDescription>
//               {products.length} product{products.length !== 1 ? 's' : ''} found
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {products.length === 0 ? (
//               <div className="text-center py-12">
//                 <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                 <h3 className="text-lg font-semibold mb-2">No products found</h3>
//                 <p className="text-muted-foreground">
//                   {searchQuery ? 'Try adjusting your search' : 'Products will appear here'}
//                 </p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b">
//                       <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Product</th>
//                       <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Vendor</th>
//                       <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Price</th>
//                       <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Stock</th>
//                       <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
//                       <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Featured</th>
//                       <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {products.map((product, idx) => {
//                       const primaryImage = product.media?.images?.find(img => img.isPrimary)?.thumbnail || product.media?.images?.[0]?.thumbnail
                      
//                       return (
//                         <tr key={product._id} className="border-b hover:bg-muted/50 transition-colors">
//                           <td className="py-3 px-4">
//                             <div className="flex items-center gap-3">
//                               <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
//                                 {primaryImage ? (
//                                   <img src={primaryImage} alt={product.basicInfo.name} className="w-full h-full object-cover" />
//                                 ) : (
//                                   <Package className="h-5 w-5 text-muted-foreground" />
//                                 )}
//                               </div>
//                               <div>
//                                 <p className="font-medium text-sm">{product.basicInfo.name}</p>
//                                 <p className="text-xs text-muted-foreground">SKU: {product.basicInfo.sku}</p>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="py-3 px-4 text-sm">
//                             {product.vendor?.business?.name || 'N/A'}
//                           </td>
//                           <td className="py-3 px-4">
//                             <span className="font-semibold">₹{product.pricing.monthlyRent.toLocaleString()}</span>
//                             <span className="text-xs text-muted-foreground">/month</span>
//                           </td>
//                           <td className="py-3 px-4">
//                             <StockBadge quantity={product.inventory.availableQuantity} />
//                           </td>
//                           <td className="py-3 px-4">
//                             <StatusBadge status={product.status.approvalStatus} isActive={product.status.isActive} />
//                           </td>
//                           <td className="py-3 px-4">
//                             <button
//                               onClick={() => handleToggleFeatured(product._id, product.status.isFeatured)}
//                               disabled={isProcessing}
//                               className="p-1 rounded-lg hover:bg-muted transition-colors"
//                             >
//                               {product.status.isFeatured ? (
//                                 <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
//                               ) : (
//                                 <StarOff className="h-4 w-4 text-muted-foreground" />
//                               )}
//                             </button>
//                           </td>
//                           <td className="py-3 px-4">
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button variant="ghost" size="icon" className="h-8 w-8">
//                                   <MoreVertical className="h-4 w-4" />
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent align="end">
//                                 <DropdownMenuItem asChild>
//                                   <Link href={`/admin/products/${product._id}`}>
//                                     <Eye className="h-4 w-4 mr-2" />
//                                     View Details
//                                   </Link>
//                                 </DropdownMenuItem>
//                                 {product.status.approvalStatus === 'pending' && (
//                                   <>
//                                     <DropdownMenuItem onClick={() => handleApproveProduct(product._id)}>
//                                       <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
//                                       Approve
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem onClick={() => {
//                                       setSelectedProduct(product)
//                                       setIsRejectModalOpen(true)
//                                     }}>
//                                       <XCircle className="h-4 w-4 mr-2 text-red-600" />
//                                       Reject
//                                     </DropdownMenuItem>
//                                   </>
//                                 )}
//                                 <DropdownMenuItem asChild>
//                                   <Link href={`/admin/products/${product._id}/edit`}>
//                                     <Edit className="h-4 w-4 mr-2" />
//                                     Edit
//                                   </Link>
//                                 </DropdownMenuItem>
//                                 <DropdownMenuSeparator />
//                                 <DropdownMenuItem className="text-red-600">
//                                   <Trash2 className="h-4 w-4 mr-2" />
//                                   Delete
//                                 </DropdownMenuItem>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </td>
//                         </tr>
//                       )
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex items-center justify-between mt-4 pt-4 border-t">
//                 <p className="text-xs text-muted-foreground">
//                   Page {currentPage} of {totalPages}
//                 </p>
//                 <div className="flex items-center gap-1.5">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                     disabled={currentPage === 1}
//                   >
//                     <ChevronLeft className="h-4 w-4" />
//                   </Button>
//                   <span className="px-3 py-1.5 text-sm font-medium">
//                     {currentPage} / {totalPages}
//                   </span>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                     disabled={currentPage === totalPages}
//                   >
//                     <ChevronRight className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Reject Modal */}
//       <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <XCircle className="h-5 w-5 text-red-500" />
//               Reject Product
//             </DialogTitle>
//             <DialogDescription>
//               Please provide a reason for rejecting this product. This will be shared with the vendor.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <div className="space-y-2">
//               <Label htmlFor="rejectionReason">Rejection Reason *</Label>
//               <Textarea
//                 id="rejectionReason"
//                 placeholder="Enter detailed reason for rejection..."
//                 value={rejectionReason}
//                 onChange={(e) => setRejectionReason(e.target.value)}
//                 rows={4}
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
//               Cancel
//             </Button>
//             <Button variant="destructive" onClick={handleRejectProduct} disabled={isProcessing || !rejectionReason.trim()}>
//               {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
//               Reject Product
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }


'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Search, Filter, RefreshCw, Eye, Edit, Trash2,
  MoreVertical, CheckCircle, XCircle, Star, StarOff,
  TrendingUp, DollarSign, Truck, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, Download, Upload, Plus,
  Calendar, Tag, BarChart2, Clock, Shield, Zap, Grid,
  List, ArrowUpDown, SlidersHorizontal, Info, X,
  ChevronDown, Check, Box, Activity, Users, Layers
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { format } from 'date-fns'
import axios from 'axios'
import Link from 'next/link'
import Loading from '@/app/loading'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

/* ─────────────────────────── Types ─────────────────────────── */
interface Product {
  _id: string
  basicInfo: { name: string; slug: string; brand?: string; sku: string }
  pricing: { monthlyRent: number }
  media?: { images?: Array<{ url: string; thumbnail: string; isPrimary: boolean }> }
  ratings?: { average: number; count: number }
  inventory: { availableQuantity: number; totalQuantity: number }
  condition: string
  category: { _id: string; name: string; slug: string }
  vendor?: { _id: string; business: { name: string } }
  status: { isActive: boolean; isFeatured: boolean; approvalStatus: 'pending' | 'approved' | 'rejected' }
  createdAt: string
}

interface ProductStats {
  total: number; active: number; inactive: number
  pendingApproval: number; featured: number; outOfStock: number
}

/* ─────────────────────── Static enrich data ─────────────────── */
const RENTAL_TIPS = [
  { icon: Shield, title: 'Quality Assurance', desc: 'Every product goes through a 12-point inspection before listing.' },
  { icon: Clock, title: 'Flexible Tenures', desc: 'Monthly, quarterly, and annual rental plans available.' },
  { icon: Truck, title: 'Free Delivery', desc: 'Free delivery and pickup on all rentals above ₹999/month.' },
  { icon: Zap, title: 'Quick Approval', desc: 'Products reviewed within 24 hours of submission.' },
]

const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  like_new: { label: 'Like New', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  good: { label: 'Good', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  fair: { label: 'Fair', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  poor: { label: 'Poor', color: 'bg-red-100 text-red-700 border-red-200' },
}

/* ───────────────────────── Sub-components ───────────────────── */
function StatusBadge({ status, isActive }: { status: string; isActive: boolean }) {
  if (!isActive) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />Inactive
    </span>
  )
  const map: Record<string, { dot: string; bg: string; text: string; label: string }> = {
    approved: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Approved' },
    pending:  { dot: 'bg-amber-400',  bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Pending'  },
    rejected: { dot: 'bg-red-500',    bg: 'bg-red-50',     text: 'text-red-700',     label: 'Rejected' },
  }
  const s = map[status] || map.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.bg} ${s.text} border-current/20`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />{s.label}
    </span>
  )
}

function StockBadge({ quantity }: { quantity: number }) {
  if (quantity === 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-600 border border-red-200">Out of Stock</span>
  if (quantity < 5) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">Low · {quantity} left</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">In Stock · {quantity}</span>
}

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} />
      ))}
    </span>
  )
}

/* ──────────────────────── Main Component ────────────────────── */
export default function AdminAllProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
    if (status === 'authenticated') { fetchProducts(); fetchStats() }
  }, [status, currentPage, statusFilter, stockFilter, searchQuery, activeTab])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const approvalStatus = activeTab !== 'all' ? activeTab : statusFilter !== 'all' ? statusFilter : undefined
      const response = await axios.get(`${BASE_URL}/api/v1/products/admin/all`, {
        params: { page: currentPage, limit: 20, search: searchQuery || undefined, status: approvalStatus, stock: stockFilter !== 'all' ? stockFilter : undefined },
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        setProducts(response.data.data.products)
        setTotalPages(response.data.data.pagination?.pages || 1)
      }
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) setStats(response.data.data)
    } catch {}
  }

  const handleToggleFeatured = async (productId: string, current: boolean) => {
    setIsProcessing(true)
    try {
      await axios.patch(`${BASE_URL}/api/v1/products/admin/${productId}/feature`, { isFeatured: !current }, { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } })
      toast.success(`Product ${!current ? 'featured' : 'unfeatured'}`)
      fetchProducts(); fetchStats()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setIsProcessing(false) }
  }

  const handleApproveProduct = async () => {
    if (!selectedProduct) return
    setIsProcessing(true)
    try {
      await axios.post(`${BASE_URL}/api/v1/products/admin/${selectedProduct._id}/approve`, {}, { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } })
      toast.success('Product approved successfully')
      setIsApproveModalOpen(false); setSelectedProduct(null)
      fetchProducts(); fetchStats()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setIsProcessing(false) }
  }

  const handleRejectProduct = async () => {
    if (!selectedProduct || !rejectionReason.trim()) { toast.error('Please provide a reason'); return }
    setIsProcessing(true)
    try {
      await axios.post(`${BASE_URL}/api/v1/products/admin/${selectedProduct._id}/reject`, { reason: rejectionReason }, { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } })
      toast.success('Product rejected')
      setIsRejectModalOpen(false); setSelectedProduct(null); setRejectionReason('')
      fetchProducts(); fetchStats()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setIsProcessing(false) }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return
    setIsProcessing(true)
    try {
      await axios.delete(`${BASE_URL}/api/v1/products/admin/${selectedProduct._id}`, { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } })
      toast.success('Product deleted')
      setIsDeleteModalOpen(false); setSelectedProduct(null)
      fetchProducts(); fetchStats()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setIsProcessing(false) }
  }

  const statsCards = [
    { label: 'Total Products', value: stats?.total ?? 0, icon: Package, gradient: 'from-[#6366f1] to-[#8b5cf6]', light: 'bg-violet-50', text: 'text-violet-600', change: '+12 this week' },
    { label: 'Active Listings', value: stats?.active ?? 0, icon: CheckCircle, gradient: 'from-[#10b981] to-[#059669]', light: 'bg-emerald-50', text: 'text-emerald-600', change: '+5 today' },
    { label: 'Pending Review', value: stats?.pendingApproval ?? 0, icon: Clock, gradient: 'from-[#f59e0b] to-[#d97706]', light: 'bg-amber-50', text: 'text-amber-600', change: 'Needs attention' },
    { label: 'Featured Items', value: stats?.featured ?? 0, icon: Star, gradient: 'from-[#ec4899] to-[#db2777]', light: 'bg-pink-50', text: 'text-pink-600', change: 'Premium slots' },
    { label: 'Out of Stock', value: stats?.outOfStock ?? 0, icon: AlertCircle, gradient: 'from-[#ef4444] to-[#dc2626]', light: 'bg-red-50', text: 'text-red-600', change: 'Action needed' },
    { label: 'Inactive', value: stats?.inactive ?? 0, icon: XCircle, gradient: 'from-[#64748b] to-[#475569]', light: 'bg-slate-50', text: 'text-slate-600', change: 'Paused listings' },
  ]

  if (status === 'loading' || isLoading) return <Loading />

  // console.log("slected product-->", selectedProduct)

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
      {/* ── Top accent bar ── */}
      <div className="h-1 w-full bg-linear-to-r from-violet-500 via-indigo-500 to-cyan-400" />

      <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">

        {/* ─── Header ─── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">
              <span>Admin</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-indigo-600">Products</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Product Catalogue</h1>
            <p className="text-slate-500 text-sm">Manage, approve, and curate rental listings across all vendors</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm hover:border-slate-300 transition-all shadow-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <Link href="/admin/products/new" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-200 transition-all">
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          </div>
        </div>

        {/* ─── Rental Tips Banner ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {RENTAL_TIPS.map((tip) => {
            const Icon = tip.icon
            return (
              <div key={tip.title} className="flex items-start gap-3 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{tip.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── Stats Grid ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsCards.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 260 }}
              >
                <div className="group relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-default">
                  <div className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl ${stat.light} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${stat.text}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{stat.value.toLocaleString()}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{stat.label}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{stat.change}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ─── Main Panel ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Tab bar + Filters */}
          <div className="border-b border-slate-100 px-6 pt-5 pb-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4">
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1 self-start">
                {[
                  { key: 'all', label: 'All Products' },
                  { key: 'pending', label: `Pending${stats?.pendingApproval ? ` (${stats.pendingApproval})` : ''}` },
                  { key: 'approved', label: 'Approved' },
                  { key: 'rejected', label: 'Rejected' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setCurrentPage(1) }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.key ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg border transition-all ${viewMode === 'table' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}><List className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg border transition-all ${viewMode === 'grid' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}><Grid className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Search + Filters row */}
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/60">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by product name, SKU, vendor…"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-300 transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={stockFilter}
                onChange={e => { setStockFilter(e.target.value); setCurrentPage(1) }}
                className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 cursor-pointer"
              >
                <option value="all">All Stock</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <button onClick={fetchProducts} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-100">
                <SlidersHorizontal className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>

          {/* ── Table View ── */}
          <AnimatePresence mode="wait">
            {viewMode === 'table' ? (
              <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {products.length === 0 ? (
                  <EmptyState searchQuery={searchQuery} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                          <th className="text-left py-3.5 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                          <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Vendor</th>
                          <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rent / Month</th>
                          <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                          <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Condition</th>
                          <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Rating</th>
                          <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Feature</th>
                          <th className="text-right py-3.5 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {products.map((product, idx) => {
                          const img = product.media?.images?.find(i => i.isPrimary)?.thumbnail || product.media?.images?.[0]?.thumbnail
                          const cond = CONDITION_LABELS[product.condition] ?? { label: product.condition, color: 'bg-slate-100 text-slate-600 border-slate-200' }
                          return (
                            <motion.tr
                              key={product._id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className="hover:bg-indigo-50/30 transition-colors group"
                            >
                              {/* Product */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 group-hover:border-indigo-200 transition-colors">
                                    {img ? (
                                      <img src={img} alt={product.basicInfo.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-5 h-5 text-slate-300" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm text-slate-800 truncate max-w-45">{product.basicInfo.name}</p>
                                    <p className="text-[11px] text-slate-400 font-mono">SKU: {product.basicInfo.sku}</p>
                                    {product.basicInfo.brand && <p className="text-[11px] text-indigo-500">{product.basicInfo.brand}</p>}
                                  </div>
                                </div>
                              </td>

                              {/* Vendor */}
                              <td className="py-4 px-4 hidden md:table-cell">
                                <span className="text-sm text-slate-600 font-medium">{product.vendor?.business?.name || <span className="text-slate-300 italic">Unassigned</span>}</span>
                              </td>

                              {/* Price */}
                              <td className="py-4 px-4">
                                <div>
                                  <span className="text-sm font-bold text-slate-900">₹{product.pricing.monthlyRent.toLocaleString('en-IN')}</span>
                                  <span className="text-[10px] text-slate-400 ml-0.5">/mo</span>
                                </div>
                                <p className="text-[10px] text-slate-400">≈ ₹{Math.round(product.pricing.monthlyRent * 3).toLocaleString('en-IN')}/qtr</p>
                              </td>

                              {/* Stock */}
                              <td className="py-4 px-4 hidden sm:table-cell">
                                <StockBadge quantity={product.inventory.availableQuantity} />
                              </td>

                              {/* Status */}
                              <td className="py-4 px-4">
                                <StatusBadge status={product.status.approvalStatus} isActive={product.status.isActive} />
                              </td>

                              {/* Condition */}
                              <td className="py-4 px-4 hidden lg:table-cell">
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cond.color}`}>{cond.label}</span>
                              </td>

                              {/* Rating */}
                              <td className="py-4 px-4 hidden lg:table-cell">
                                {product.ratings && product.ratings.count > 0 ? (
                                  <div className="space-y-0.5">
                                    <StarRating value={product.ratings.average} />
                                    <p className="text-[10px] text-slate-400">{product.ratings.count} reviews</p>
                                  </div>
                                ) : <span className="text-xs text-slate-300">—</span>}
                              </td>

                              {/* Feature toggle */}
                              <td className="py-4 px-4">
                                <button
                                  onClick={() => handleToggleFeatured(product._id, product.status.isFeatured)}
                                  disabled={isProcessing}
                                  title={product.status.isFeatured ? 'Unfeature' : 'Feature this product'}
                                  className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors group/star"
                                >
                                  <Star className={`w-4 h-4 transition-colors ${product.status.isFeatured ? 'fill-amber-400 text-amber-400' : 'text-slate-300 group-hover/star:text-amber-400'}`} />
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {product.status.approvalStatus === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => { setSelectedProduct(product); setIsApproveModalOpen(true) }}
                                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" title="Approve"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => { setSelectedProduct(product); setIsRejectModalOpen(true) }}
                                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Reject"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => { setSelectedProduct(product); setIsViewModalOpen(true) }}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="View"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl border-slate-100">
                                      <DropdownMenuLabel className="text-xs text-slate-400">Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem asChild>
                                        <Link href={`/admin/products/${product._id}`} className="flex items-center gap-2 text-sm">
                                          <Eye className="w-3.5 h-3.5" /> View Details
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem asChild>
                                        <Link href={`/admin/products/${product._id}/edit`} className="flex items-center gap-2 text-sm">
                                          <Edit className="w-3.5 h-3.5" /> Edit Product
                                        </Link>
                                      </DropdownMenuItem>
                                      {product.status.approvalStatus === 'pending' && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem onClick={() => { setSelectedProduct(product); setIsApproveModalOpen(true) }} className="text-emerald-600 text-sm gap-2">
                                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => { setSelectedProduct(product); setIsRejectModalOpen(true) }} className="text-red-600 text-sm gap-2">
                                            <XCircle className="w-3.5 h-3.5" /> Reject
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => { setSelectedProduct(product); setIsDeleteModalOpen(true) }}
                                        className="text-red-600 text-sm gap-2"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </motion.tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            ) : (
              /* ── Grid View ── */
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                {products.length === 0 ? <EmptyState searchQuery={searchQuery} /> : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product, idx) => {
                      const img = product.media?.images?.find(i => i.isPrimary)?.thumbnail || product.media?.images?.[0]?.thumbnail
                      const cond = CONDITION_LABELS[product.condition] ?? { label: product.condition, color: 'bg-slate-100 text-slate-600 border-slate-200' }
                      return (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.04 }}
                          className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                          <div className="relative aspect-4/3 bg-slate-50 overflow-hidden">
                            {img ? (
                              <img src={img} alt={product.basicInfo.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                                <Package className="w-10 h-10" />
                                <span className="text-xs mt-2">No image</span>
                              </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                              <button onClick={() => handleToggleFeatured(product._id, product.status.isFeatured)} className="p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm">
                                <Star className={`w-3.5 h-3.5 ${product.status.isFeatured ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2">
                              <StatusBadge status={product.status.approvalStatus} isActive={product.status.isActive} />
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            <div>
                              <p className="font-bold text-sm text-slate-900 truncate">{product.basicInfo.name}</p>
                              <p className="text-xs text-slate-400">{product.vendor?.business?.name || 'Unassigned'}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-base font-extrabold text-indigo-700">₹{product.pricing.monthlyRent.toLocaleString('en-IN')}</span>
                                <span className="text-[10px] text-slate-400">/mo</span>
                              </div>
                              <StockBadge quantity={product.inventory.availableQuantity} />
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cond.color}`}>{cond.label}</span>
                              <div className="flex gap-1">
                                {product.status.approvalStatus === 'pending' && (
                                  <>
                                    <button onClick={() => { setSelectedProduct(product); setIsApproveModalOpen(true) }} className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => { setSelectedProduct(product); setIsRejectModalOpen(true) }} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                                <button onClick={() => { setSelectedProduct(product); setIsViewModalOpen(true) }} className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <Link href={`/admin/products/${product._id}/edit`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                  <Edit className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/50">
              <p className="text-xs text-slate-400">Page <span className="font-semibold text-slate-600">{currentPage}</span> of <span className="font-semibold text-slate-600">{totalPages}</span></p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage + i - 2
                  if (page < 1 || page > totalPages) return null
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page === currentPage ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600'}`}
                    >{page}</button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Bottom rental context ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-linear-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -right-2 -bottom-10 w-32 h-32 rounded-full bg-white/5" />
            <div className="relative">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">Platform Health</span>
              <h3 className="text-xl font-bold mb-1">Your rental catalogue is performing well</h3>
              <p className="text-indigo-200 text-sm mb-4">Ensure all pending products are reviewed promptly to maximize vendor satisfaction and rental revenue.</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Avg Rent', value: `₹${stats ? Math.round(((stats.active || 0) * 1200) / Math.max(stats.total || 1, 1)).toLocaleString('en-IN') : '—'}` },
                  { label: 'Approval Rate', value: stats ? `${Math.round(((stats.active || 0) / Math.max(stats.total || 1, 1)) * 100)}%` : '—' },
                  { label: 'Active Vendors', value: '24' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-lg font-black">{s.value}</p>
                    <p className="text-indigo-300 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
              {stats?.pendingApproval && stats.pendingApproval > 0 ? (
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-400/20 border border-amber-400/30 rounded-xl text-amber-200 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {stats.pendingApproval} product{stats.pendingApproval > 1 ? 's' : ''} awaiting review
                </div>
              ) : null}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <p className="font-bold text-sm text-slate-800 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-500" /> Quick Actions</p>
            {[
              { label: 'Review Pending Products', href: '#', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100', count: stats?.pendingApproval },
              { label: 'Manage Featured Slots', href: '#', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100', count: stats?.featured },
              { label: 'Low Stock Alerts', href: '#', color: 'bg-red-50 text-red-700 hover:bg-red-100', count: stats?.outOfStock },
              { label: 'Export Product Report', href: '#', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
            ].map(a => (
              <Link key={a.label} href={a.href} className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${a.color}`}>
                <span>{a.label}</span>
                {a.count !== undefined && a.count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-bold">{a.count}</span>
                )}
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* ═══════════════════════ MODALS ═══════════════════════ */}

      {/* View Product Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Box className="w-5 h-5 text-indigo-500" /> Product Details
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-5">
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                {selectedProduct.media?.images?.[0]?.url ? (
                  <img src={selectedProduct.media.images[0].url} className="w-full h-full object-cover" alt={selectedProduct.basicInfo.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-12 h-12" /></div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900">{selectedProduct.basicInfo.name}</h3>
                  {selectedProduct.basicInfo.brand && <p className="text-sm text-indigo-600">{selectedProduct.basicInfo.brand}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'SKU', value: selectedProduct.basicInfo.sku },
                    { label: 'Monthly Rent', value: `₹${selectedProduct.pricing.monthlyRent.toLocaleString('en-IN')}` },
                    { label: 'Category', value: selectedProduct.category.name },
                    { label: 'Condition', value: selectedProduct.condition },
                    { label: 'Available', value: `${selectedProduct.inventory.availableQuantity} / ${selectedProduct.inventory.totalQuantity}` },
                    { label: 'Vendor', value: selectedProduct.vendor?.business.name || 'N/A' },
                  ].map(f => (
                    <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[11px] text-slate-400 font-medium">{f.label}</p>
                      <p className="font-semibold text-slate-800 mt-0.5 text-xs">{f.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedProduct.status.approvalStatus} isActive={selectedProduct.status.isActive} />
                  {selectedProduct.status.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-500" /> Featured
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">Listed on {format(new Date(selectedProduct.createdAt), 'dd MMM yyyy')}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Close</button>
            {selectedProduct && (
              <Link href={`/admin/products/${selectedProduct._id}`} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors">
                Full Details →
              </Link>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="max-w-md rounded-2xl border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" /> Approve Product
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              This product will be listed as active on the platform and visible to customers.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-emerald-100">
                {selectedProduct.media?.images?.[0]?.thumbnail ? (
                  <img src={selectedProduct.media.images[0].thumbnail} className="w-full h-full object-cover" />
                ) : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-slate-300" /></div>}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{selectedProduct.basicInfo.name}</p>
                <p className="text-xs text-slate-500">{selectedProduct.vendor?.business.name || 'Unknown vendor'}</p>
                <p className="text-sm font-bold text-emerald-700 mt-1">₹{selectedProduct.pricing.monthlyRent.toLocaleString('en-IN')}/mo</p>
              </div>
            </div>
          )}
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>The vendor will be notified via email once this product is approved.</span>
          </div>
          <DialogFooter>
            <button onClick={() => setIsApproveModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button
              onClick={handleApproveProduct}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve Product
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="max-w-md rounded-2xl border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" /> Reject Product
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Provide a clear reason so the vendor can improve and resubmit.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-red-100">
                {selectedProduct.media?.images?.[0]?.thumbnail ? (
                  <img src={selectedProduct.media.images[0].thumbnail} className="w-full h-full object-cover" />
                ) : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-slate-300" /></div>}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{selectedProduct.basicInfo.name}</p>
                <p className="text-xs text-slate-500">{selectedProduct.vendor?.business.name || 'Unknown vendor'}</p>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Rejection Reason <span className="text-red-500">*</span></label>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="e.g. Product images are unclear, pricing is not competitive for this category, condition description is inaccurate…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none transition-all"
            />
            <p className="text-[11px] text-slate-400">This message will be sent to the vendor via email.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['Images too dark/blurry', 'Pricing mismatch', 'Incomplete description', 'Wrong category'].map(r => (
              <button key={r} onClick={() => setRejectionReason(prev => prev ? `${prev}. ${r}` : r)} className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 text-[11px] border border-slate-200 hover:border-red-200 transition-all">
                + {r}
              </button>
            ))}
          </div>
          <DialogFooter>
            <button onClick={() => { setIsRejectModalOpen(false); setRejectionReason('') }} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button
              onClick={handleRejectProduct}
              disabled={isProcessing || !rejectionReason.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject Product
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md rounded-2xl border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" /> Delete Product
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-sm text-red-800 font-semibold">{selectedProduct.basicInfo.name}</p>
              <p className="text-xs text-red-600 mt-0.5">SKU: {selectedProduct.basicInfo.sku}</p>
            </div>
          )}
          <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>All rental history, bookings, and inventory data associated with this product will also be removed.</span>
          </div>
          <DialogFooter>
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button
              onClick={handleDeleteProduct}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Permanently
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ── Empty State ── */
function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-indigo-300" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">No products found</h3>
      <p className="text-sm text-slate-400 max-w-xs">
        {searchQuery
          ? `No results for "${searchQuery}". Try different keywords or adjust your filters.`
          : 'Products listed by vendors will appear here once submitted.'}
      </p>
    </div>
  )
}