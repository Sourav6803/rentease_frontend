
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, MoreVertical, Edit, Trash2,
  Copy, Eye, EyeOff, Star,
  Package, TrendingUp, DollarSign, ShoppingBag,
  CheckCircle, RefreshCw, Grid3x3, List,
  ChevronLeft, ChevronRight, Zap, Award,
  Filter, SlidersHorizontal, ArrowUpDown,
  Tag, BarChart2, Layers, Clock, X,
  BadgeCheck, Box, AlertTriangle, ShieldCheck,
  ArrowUp, Sparkles, TrendingDown
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { useToast } from '@/hooks/useToast'
import { useSession, getSession } from 'next-auth/react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  _id: string
  basicInfo: { name: string; slug: string; description: string; brand: string; sku: string }
  pricing: { monthlyRent: number; securityDeposit: number; deliveryCharges: number }
  media: { images: Array<{ url: string; thumbnail: string; isPrimary: boolean }> }
  inventory: { totalQuantity: number; availableQuantity: number }
  condition: string
  ratings: { average: number; count: number }
  status: { isActive: boolean; isVerified: boolean }
  rentalCount?: number
  revenue?: number
  createdAt: string
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const getAuthHeaders = async () => {
  const session = await getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

// ─── Condition config ─────────────────────────────────────────────────────────
const CONDITION_MAP: Record<string, { label: string; color: string; bg: string }> = {
  'new':         { label: 'New',         color: 'text-green-700',   bg: 'bg-green-50 border-green-200' },
  'like-new':    { label: 'Like New',    color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'good':        { label: 'Good',        color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  'fair':        { label: 'Fair',        color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  'refurbished': { label: 'Refurbished', color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200' },
}

// ─── Promo Banners ────────────────────────────────────────────────────────────
const BANNERS = [
  {
    title: 'Festival Season Boost',
    desc: 'Get 3× visibility during sale events. Enroll now.',
    icon: Zap,
    gradient: 'from-[#ff6161] to-[#ff9a3c]',
    cta: 'Enroll Free',
  },
  {
    title: 'Premium Seller Badge',
    desc: 'Unlock trust badges after 10 successful rentals.',
    icon: Award,
    gradient: 'from-[#2874f0] to-[#00a0e3]',
    cta: 'Learn More',
  },
  {
    title: 'Performance Analytics',
    desc: 'See which listings drive the most bookings.',
    icon: BarChart2,
    gradient: 'from-[#21a056] to-[#00c49f]',
    cta: 'View Reports',
  },
]

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  )
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ avg, count }: { avg: number; count: number }) {
  return (
    <div className="inline-flex items-center gap-1 bg-[#388e3c] text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
      <span>{avg > 0 ? avg.toFixed(1) : '—'}</span>
      <Star className="h-2.5 w-2.5 fill-white" />
      <span className="opacity-80 font-normal ml-0.5">({count})</span>
    </div>
  )
}

// ─── Product Card (Grid) ──────────────────────────────────────────────────────
function ProductCard({
  product, onDelete, onToggleStatus,
}: {
  product: Product
  onDelete: (p: Product) => void
  onToggleStatus: (p: Product) => void
}) {
  const cond = CONDITION_MAP[product.condition] || CONDITION_MAP.good
  const img = product.media.images?.find(i => i.isPrimary) || product.media.images?.[0]
  const stockPct = product.inventory.totalQuantity
    ? Math.round((product.inventory.availableQuantity / product.inventory.totalQuantity) * 100)
    : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.22 }}
      className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#f5f5f5] overflow-hidden">
        {img ? (
          <img
            src={img.thumbnail || img.url}
            alt={product.basicInfo.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-slate-300" />
          </div>
        )}

        {/* Inactive ribbon */}
        {!product.status.isActive && (
          <div className="absolute top-0 left-0 right-0 bg-red-500/90 text-white text-[10px] font-bold text-center py-0.5 tracking-wider">
            INACTIVE
          </div>
        )}

        {/* Verified */}
        {product.status.isVerified && (
          <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow">
            <BadgeCheck className="h-4 w-4 text-[#2874f0]" />
          </div>
        )}

        {/* Hover overlay actions */}
        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-4 gap-2">
          <Link
            href={`/vendor/products/edit/${product._id}`}
            className="flex items-center gap-1.5 bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow hover:bg-[#2874f0] hover:text-white transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <Edit className="h-3 w-3" />Edit
          </Link>
          <button
            onClick={e => { e.stopPropagation(); onToggleStatus(product) }}
            className="flex items-center gap-1.5 bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow hover:bg-slate-700 hover:text-white transition-colors"
          >
            {product.status.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {product.status.isActive ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5">
        {/* Title + menu */}
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate leading-snug">{product.basicInfo.name}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{product.basicInfo.brand}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="shrink-0 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <MoreVertical className="h-4 w-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-sm">
              <DropdownMenuLabel className="text-xs text-slate-500">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/vendor/products/edit/${product._id}`}><Edit className="h-3.5 w-3.5 mr-2" />Edit Product</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(product)}>
                {product.status.isActive ? <EyeOff className="h-3.5 w-3.5 mr-2" /> : <Eye className="h-3.5 w-3.5 mr-2" />}
                {product.status.isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(product.basicInfo.sku || product._id) }}>
                <Copy className="h-3.5 w-3.5 mr-2" />Copy SKU
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(product)} className="text-red-600 focus:text-red-600">
                <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Rating */}
        <div className="my-1.5">
          <StarRating avg={product.ratings.average || 0} count={product.ratings.count || 0} />
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-base font-bold text-slate-900">₹{product.pricing.monthlyRent.toLocaleString()}</span>
          <span className="text-[11px] text-slate-500 font-normal">/mo</span>
        </div>
        <p className="text-[11px] text-slate-400 mb-2">Deposit ₹{product.pricing.securityDeposit.toLocaleString()}</p>

        {/* Condition + rentals */}
        <div className="flex items-center justify-between mb-2.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${cond.color} ${cond.bg}`}>
            {cond.label}
          </span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShoppingBag className="h-3 w-3" />{product.rentalCount || 0} rented
          </span>
        </div>

        {/* Stock bar */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>{product.inventory.availableQuantity} of {product.inventory.totalQuantity} available</span>
            <span className={stockPct < 20 ? 'text-red-500 font-semibold' : 'text-slate-400'}>{stockPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                stockPct < 20 ? 'bg-red-400' : stockPct < 50 ? 'bg-amber-400' : 'bg-[#2874f0]'
              }`}
              style={{ width: `${stockPct}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Product Row (List) ───────────────────────────────────────────────────────
function ProductRow({
  product, onDelete, onToggleStatus,
}: {
  product: Product
  onDelete: (p: Product) => void
  onToggleStatus: (p: Product) => void
}) {
  const cond = CONDITION_MAP[product.condition] || CONDITION_MAP.good
  const img = product.media.images?.find(i => i.isPrimary) || product.media.images?.[0]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className="group bg-white border border-slate-200 rounded-xl hover:border-[#2874f0]/30 hover:shadow-md transition-all duration-200"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="flex gap-4 p-4 items-center">
        {/* Image */}
        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-[#f5f5f5]">
          {img ? (
            <img src={img.thumbnail || img.url} alt={product.basicInfo.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-7 w-7 text-slate-300" />
            </div>
          )}
          {!product.status.isActive && (
            <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center">
              <EyeOff className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Name + brand */}
        <div className="w-52 min-w-0 shrink-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate">{product.basicInfo.name}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{product.basicInfo.brand}</p>
          <div className="mt-1.5">
            <StarRating avg={product.ratings.average || 0} count={product.ratings.count || 0} />
          </div>
        </div>

        {/* Price */}
        <div className="w-32 shrink-0">
          <p className="text-base font-bold text-slate-900">₹{product.pricing.monthlyRent.toLocaleString()}<span className="text-[11px] font-normal text-slate-500">/mo</span></p>
          <p className="text-[11px] text-slate-400">Dep: ₹{product.pricing.securityDeposit.toLocaleString()}</p>
        </div>

        {/* Condition */}
        <div className="w-24 shrink-0 hidden md:block">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${cond.color} ${cond.bg}`}>{cond.label}</span>
        </div>

        {/* Inventory */}
        <div className="w-28 shrink-0 hidden lg:block">
          <p className="text-xs text-slate-700 font-medium">{product.inventory.availableQuantity} / {product.inventory.totalQuantity}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">available</p>
        </div>

        {/* Stats */}
        <div className="flex-1 hidden xl:flex gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-800">{product.rentalCount || 0}</p>
            <p className="text-[10px] text-slate-400">Rentals</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">₹{((product.revenue || 0) / 1000).toFixed(0)}K</p>
            <p className="text-[10px] text-slate-400">Revenue</p>
          </div>
        </div>

        {/* Status */}
        <div className="w-20 shrink-0 hidden sm:flex justify-center">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${product.status.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {product.status.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          <Link href={`/vendor/products/edit/${product._id}`}
            className="flex items-center gap-1 text-[11px] font-semibold border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-[#2874f0] hover:text-white hover:border-[#2874f0] transition-all">
            <Edit className="h-3 w-3" />Edit
          </Link>
          <button
            onClick={() => onToggleStatus(product)}
            className="flex items-center gap-1 text-[11px] font-semibold border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-700 hover:text-white hover:border-slate-700 transition-all">
            {product.status.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {product.status.isActive ? 'Hide' : 'Show'}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                <MoreVertical className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-sm">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.basicInfo.sku || product._id)}>
                <Copy className="h-3.5 w-3.5 mr-2" />Copy SKU
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(product)} className="text-red-600 focus:text-red-600">
                <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorProductsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [statsData, setStatsData] = useState({ total: 0, active: 0, rentals: 0, revenue: 0 , joinDate: ''})
  const isFetchingRef = useRef(false)
  const toast = useToast()

  // Aggregate stats from products
  const stats = (() => {
    const active = products.filter(p => p.status.isActive).length
    
    return [
      { label: 'Total Listed', value: totalProducts, icon: Package, suffix: '', color: '#2874f0', light: '#ebf3fb', trend: '+12%', up: true },
      { label: 'Active', value: active, icon: CheckCircle, suffix: '', color: '#21a056', light: '#e8f5e9', trend: '+5%', up: true },
      { label: 'Total Rentals', value: statsData.rentals, icon: ShoppingBag, suffix: '', color: '#fb641b', light: '#fff3e0', trend: '+23%', up: true },
      { label: 'Revenue', value: statsData.revenue, icon: DollarSign, suffix: '₹', color: '#9c27b0', light: '#f3e5f5', trend: '+18%', up: true },
    ]
  })()

  const fetchProducts = useCallback(async (showLoading = true) => {
    if (isFetchingRef.current || status === 'loading') return
    if (!session?.user?.accessToken) { setIsLoading(false); return }
    isFetchingRef.current = true
    if (showLoading) setIsLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(
        `${BASE_URL}/api/v1/vendor/products?page=${currentPage}&limit=12&search=${encodeURIComponent(searchTerm)}&sort=${sortBy}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`,
        { headers }
      )

      const stats = await fetch(`${BASE_URL}/api/v1/vendor/stats`, { headers })
      const statsData = await stats.json()
      // console.log('statsData-->', statsData)
      setStatsData({total: statsData.data.stats.totalProducts, active: statsData.data.stats.activeProducts, rentals: statsData.data.stats.totalRentals, revenue: statsData.data.stats.totalRevenue, joinDate: statsData.data.stats.joinDate})

      const data = await res.json()
      if (data.success) {
        setProducts(data.data.products || [])
        setTotalPages(data.data.pagination?.pages || 1)
        setTotalProducts(data.data.pagination?.total || 0)
      } else {
        if (res.status === 401) { router.push('/vendor/login'); return }
        toast.error(data.message || 'Failed to load products')
      }
    } catch { toast.error('Failed to load products') }
    finally { setIsLoading(false); isFetchingRef.current = false }
  }, [currentPage, searchTerm, statusFilter, sortBy, session?.user?.accessToken, status, router, toast])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.accessToken) fetchProducts(true)
    else if (status === 'unauthenticated') router.push('/login')
  }, [fetchProducts, status, session?.user?.accessToken])

  const handleDelete = async () => {
    if (!selectedProduct) return
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/products/${selectedProduct._id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (data.success) { toast.success('Product deleted'); fetchProducts(true) }
      else toast.error(data.message || 'Delete failed')
    } catch { toast.error('Delete failed') }
    finally { setDeleteDialogOpen(false); setSelectedProduct(null) }
  }

  const handleToggleStatus = async (product: Product) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/products/${product._id}/status`, {
        method: 'PATCH', headers, body: JSON.stringify({ isActive: !product.status.isActive })
      })
      const data = await res.json()
      if (data.success) { toast.success(`Product ${product.status.isActive ? 'deactivated' : 'activated'}`); fetchProducts(false) }
      else toast.error(data.message || 'Status update failed')
    } catch { toast.error('Status update failed') }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f3f6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-sm text-slate-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const hasActiveSearch = searchTerm || statusFilter !== 'all'

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Listings</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {totalProducts} product{totalProducts !== 1 ? 's' : ''} · Manage your rental inventory
              </p>
            </div>
            <button
              onClick={() => router.push('/vendor/products/add')}
              className="inline-flex items-center gap-2 bg-[#fb641b] hover:bg-[#e55c18] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </button>
          </div>

          {/* ── Stats Bar ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s, i) => {
              const Icon = s.icon
              const displayValue = s.label === 'Revenue'
                ? `₹${s.value > 1000 ? ((s.value as number) / 1000).toFixed(0) + 'K' : s.value}`
                : s.value.toString()
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-xl border border-slate-200 p-4 relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 w-16 h-16 rounded-bl-full opacity-10" style={{ background: s.color }} />
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.light }}>
                      <Icon className="h-4 w-4" style={{ color: s.color }} />
                    </div>
                    <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${s.up ? 'text-[#21a056]' : 'text-red-500'}`}>
                      {s.up ? <ArrowUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {s.trend}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">{displayValue}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
                </motion.div>
              )
            })}
          </div>

          {/* ── Promo Banners ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {BANNERS.map((b, i) => {
              const Icon = b.icon
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${b.gradient} p-4 text-white cursor-pointer group hover:scale-[1.015] transition-transform shadow-sm`}
                >
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
                  <div className="absolute -right-2 -bottom-6 w-28 h-28 bg-white/5 rounded-full" />
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm leading-snug">{b.title}</p>
                      <p className="text-[11px] text-white/80 mt-0.5 leading-snug">{b.desc}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold bg-white/20 hover:bg-white/30 transition-colors px-2 py-1 rounded-full whitespace-nowrap">
                      {b.cta} →
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* ── Filter / Search Bar ── */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                  placeholder="Search by name, brand, SKU…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0] bg-[#fafafa]"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-700" />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                  className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); setCurrentPage(1) }}
                  className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="popular">Most Popular</option>
                </select>

                {/* View toggle */}
                <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-[#fafafa]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2.5 transition-colors ${viewMode === 'grid' ? 'bg-[#2874f0] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2.5 transition-colors ${viewMode === 'list' ? 'bg-[#2874f0] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => { setIsRefreshing(true); fetchProducts(true); setTimeout(() => setIsRefreshing(false), 1200) }}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border border-slate-200 rounded-lg bg-[#fafafa] hover:bg-slate-100 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[#2874f0]' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline text-slate-600">Refresh</span>
                </button>
              </div>
            </div>

            {/* Active filter pills */}
            {hasActiveSearch && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 bg-[#ebf3fb] text-[#2874f0] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    "{searchTerm}" <button onClick={() => setSearchTerm('')}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-[#ebf3fb] text-[#2874f0] text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize">
                    {statusFilter} <button onClick={() => setStatusFilter('all')}><X className="h-3 w-3" /></button>
                  </span>
                )}
                <button onClick={() => { setSearchTerm(''); setStatusFilter('all') }} className="text-[11px] text-slate-500 hover:text-red-500 underline ml-1">
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* ── List view column headers ── */}
          {viewMode === 'list' && !isLoading && products.length > 0 && (
            <div className="hidden lg:flex items-center gap-4 px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <div className="w-20 shrink-0" />
              <div className="w-52 shrink-0">Product</div>
              <div className="w-32 shrink-0">Price</div>
              <div className="w-24 shrink-0">Condition</div>
              <div className="w-28 shrink-0">Inventory</div>
              <div className="flex-1">Stats</div>
              <div className="w-20 shrink-0 text-center">Status</div>
              <div className="ml-auto">Actions</div>
            </div>
          )}

          {/* ── Products Content ── */}
          {isLoading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}>
              {[...Array(8)].map((_, i) => (
                viewMode === 'grid' ? <SkeletonCard key={i} /> : (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-4">
                    <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-5 w-1/4" />
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-slate-200 py-20 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-[#ebf3fb] rounded-full flex items-center justify-center mb-5">
                <Package className="h-9 w-9 text-[#2874f0]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1.5">
                {hasActiveSearch ? 'No products match your filters' : 'No products listed yet'}
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mb-6">
                {hasActiveSearch
                  ? 'Try adjusting your search or remove filters to see all products.'
                  : 'Start adding products to your inventory and earn from rentals.'}
              </p>
              {hasActiveSearch ? (
                <button onClick={() => { setSearchTerm(''); setStatusFilter('all') }}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  Clear Filters
                </button>
              ) : (
                <button onClick={() => router.push('/vendor/products/add')}
                  className="flex items-center gap-2 bg-[#2874f0] hover:bg-[#1a5fd4] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all">
                  <Plus className="h-4 w-4" />Add First Product
                </button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map(p => (
                    <ProductCard key={p._id} product={p}
                      onDelete={p => { setSelectedProduct(p); setDeleteDialogOpen(true) }}
                      onToggleStatus={handleToggleStatus} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {products.map(p => (
                    <ProductRow key={p._id} product={p}
                      onDelete={p => { setSelectedProduct(p); setDeleteDialogOpen(true) }}
                      onToggleStatus={handleToggleStatus} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && !isLoading && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">
                Page <span className="font-semibold text-slate-800">{currentPage}</span> of <span className="font-semibold text-slate-800">{totalPages}</span>
                <span className="hidden sm:inline"> · {totalProducts} total products</span>
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-600" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = currentPage - 2 + i
                  if (p < 1) p = i + 1
                  if (p > totalPages) return null
                  return (
                    <button
                      key={p}
                      onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                        currentPage === p
                          ? 'bg-[#2874f0] text-white shadow-sm'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}

                <button
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}

          {/* ── Bottom info strip ── */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div className="flex flex-wrap gap-6">
                {[
                  [ShieldCheck, 'Seller Protection Active', 'text-[#21a056]'],
                  [Sparkles, 'Quality Score: Good', 'text-[#fb641b]'],
                  [Clock, 'Orders auto-expire in 72hr', 'text-slate-500'],
                ].map(([Icon, label, cls]) => (
                  <div key={String(label)} className="flex items-center gap-2">
                    {/* @ts-ignore */}
                    <Icon className={`h-4 w-4 ${cls}`} />
                    <span className={`text-xs font-medium ${cls}`}>{String(label)}</span>
                  </div>
                ))}
              </div>
              <Link href="/vendor/products/add" className="text-xs font-semibold text-[#2874f0] hover:underline flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" />Add another product
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ── Delete Dialog ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <AlertDialogTitle className="text-lg font-bold">Delete Product?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-slate-500 pl-13">
              <span className="font-semibold text-slate-700">"{selectedProduct?.basicInfo.name}"</span> will be permanently removed. This cannot be undone and all associated data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel className="rounded-xl font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-sm"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}