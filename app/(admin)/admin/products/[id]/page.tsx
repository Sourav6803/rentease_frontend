'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, ChevronLeft, CheckCircle, XCircle, Star, StarOff,
  Edit, Trash2, Loader2, AlertCircle, Shield, Truck, Clock,
  DollarSign, Tag, Hash, Box, Building2, User, Mail,
  Calendar, BarChart2, Eye, ArrowUpRight, Info, Ban,
  BadgeCheck, Activity, Layers, ChevronRight, ZoomIn,
  MapPin, Phone, Globe, TrendingUp, RefreshCw, Download,
  ToggleLeft, ToggleRight, Image as ImageIcon, FileText,
  Settings, MessageSquare, Award, Zap, X, Check,
  ChevronLeft as ChevLeft, ChevronRight as ChevRight
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import Link from 'next/link'
import Loading from '@/app/loading'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

/* ───────────────────────────── Types ────────────────────────────── */
interface ProductImage { url: string; thumbnail: string; isPrimary: boolean; _id?: string }

interface ProductDetail {
  _id: string
  basicInfo: {
    name: string; slug: string; brand?: string; sku: string
    description?: string; shortDescription?: string
  }
  pricing: { monthlyRent: number; securityDeposit: number; weeklyRent?: number; dailyRent?: number }
  media?: { images?: ProductImage[]; videos?: string[] }
  ratings?: { average: number; count: number }
  inventory: { availableQuantity: number; totalQuantity: number; reservedQuantity?: number }
  condition: string
  specifications?: Array<{ key: string; value: string }>
  features?: string[]
  category: { _id: string; name: string; slug: string }
  subCategory?: { _id: string; name: string }
  vendor?: {
    _id: string
    business: { name: string; phone?: string; address?: { city?: string; state?: string } }
    user?: { email: string; profile?: { firstName: string; lastName: string; phone?: string } }
  }
  status: {
    isActive: boolean; isFeatured: boolean
    approvalStatus: 'pending' | 'approved' | 'rejected'
    rejectionReason?: string
  }
  rentalHistory?: { totalRentals: number; totalRevenue: number; avgRentalDuration: number }
  createdAt: string
  updatedAt: string
}

/* ───────────────────── Static / helpers ─────────────────────────── */
const CONDITION_META: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  new:      { label: 'Brand New',  dot: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  like_new: { label: 'Like New',   dot: 'bg-sky-500',     bg: 'bg-sky-50',      text: 'text-sky-700'     },
  good:     { label: 'Good',       dot: 'bg-blue-500',    bg: 'bg-blue-50',     text: 'text-blue-700'    },
  fair:     { label: 'Fair',       dot: 'bg-amber-500',   bg: 'bg-amber-50',    text: 'text-amber-700'   },
  poor:     { label: 'Poor',       dot: 'bg-red-500',     bg: 'bg-red-50',      text: 'text-red-700'     },
}

const TABS = [
  { key: 'overview',    label: 'Overview',      icon: FileText   },
  { key: 'specs',       label: 'Specifications', icon: Settings  },
  { key: 'inventory',   label: 'Inventory',      icon: Box       },
  { key: 'vendor',      label: 'Vendor',         icon: Building2 },
  { key: 'analytics',   label: 'Analytics',      icon: BarChart2 },
]

function timeAgo(d: string) {
  try { return formatDistanceToNow(new Date(d), { addSuffix: true }) } catch { return '—' }
}

function StarRow({ value, count }: { value: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
        ))}
      </div>
      <span className="text-sm font-bold text-slate-800">{value.toFixed(1)}</span>
      <span className="text-xs text-slate-400">({count} reviews)</span>
    </div>
  )
}

/* ───────────────────────── Main Component ───────────────────────── */
export default function AdminProductDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [activeImg, setActiveImg] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Modals
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isToggleOpen, setIsToggleOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
    if (status === 'authenticated' && productId) fetchProduct()
  }, [status, productId])

  const fetchProduct = async () => {
    setIsLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/products/${productId}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (res.data.success) setProduct(res.data.data.product)
    } catch { toast.error('Failed to load product') }
    finally { setIsLoading(false) }
  }

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await axios.post(`${BASE_URL}/api/v1/products/admin/${productId}/approve`, {}, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      toast.success('Product approved and live!')
      setIsApproveOpen(false); fetchProduct()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setIsProcessing(false) }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) { toast.error('Provide a reason'); return }
    setIsProcessing(true)
    try {
      await axios.post(`${BASE_URL}/api/v1/products/admin/${productId}/reject`, { reason: rejectionReason }, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      toast.success('Product rejected. Vendor notified.')
      setIsRejectOpen(false); setRejectionReason(''); fetchProduct()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setIsProcessing(false) }
  }

  const handleToggleFeatured = async () => {
    if (!product) return
    setIsProcessing(true)
    try {
      await axios.patch(`${BASE_URL}/api/v1/products/admin/${productId}/feature`,
        { isFeatured: !product.status.isFeatured },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      )
      toast.success(`Product ${!product.status.isFeatured ? 'featured' : 'unfeatured'}`)
      setIsToggleOpen(false); fetchProduct()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setIsProcessing(false) }
  }

  const handleToggleActive = async () => {
    if (!product) return
    setIsProcessing(true)
    try {
      await axios.patch(`${BASE_URL}/api/v1/products/admin/${productId}/toggle-status`,
        { isActive: !product.status.isActive },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      )
      toast.success(`Product ${!product.status.isActive ? 'activated' : 'deactivated'}`)
      fetchProduct()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setIsProcessing(false) }
  }

  const handleDelete = async () => {
    setIsProcessing(true)
    try {
      await axios.delete(`${BASE_URL}/api/v1/products/admin/${productId}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      toast.success('Product deleted')
      router.push('/admin/products/all')
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setIsProcessing(false) }
  }

  if (status === 'loading' || isLoading) return <Loading />
  if (!product) return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
          <Package className="w-8 h-8 text-slate-300" />
        </div>
        <p className="font-bold text-slate-700">Product not found</p>
        <Link href="/admin/products/all" className="text-sm text-indigo-600 hover:underline">← Back to all products</Link>
      </div>
    </div>
  )

  const images = product.media?.images || []
  const primaryImg = images.find(i => i.isPrimary) || images[0]
  const cond = CONDITION_META[product.condition] || { label: product.condition, dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600' }

  return (
    <div className="min-h-screen bg-[#f8f9fc]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">

        {/* ── Breadcrumb + Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
              <Link href="/admin/products/all" className="hover:text-indigo-600 transition-colors">Products</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-indigo-600 truncate max-w-[240px]">{product?.basicInfo?.name}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => router.back()} className="p-2 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 text-slate-500 transition-all shadow-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{product?.basicInfo?.name}</h1>
              {/* Status pill */}
              <ApprovalBadge status={product?.status?.approvalStatus} />
              {product?.status?.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                  <Star className="w-3 h-3 fill-amber-500" /> Featured
                </span>
              )}
              {!product?.status?.isActive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold">Inactive</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={fetchProduct} className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggleActive}
              disabled={isProcessing}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all shadow-sm ${product?.status?.isActive ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
            >
              {product?.status?.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
              {product?.status?.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={() => setIsToggleOpen(true)} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all shadow-sm ${product?.status?.isFeatured ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'}`}>
              <Star className={`w-4 h-4 ${product?.status?.isFeatured ? 'fill-amber-500' : ''}`} />
              {product?.status?.isFeatured ? 'Unfeature' : 'Feature'}
            </button>
            <Link href={`/admin/products/${productId}/edit`} className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm">
              <Edit className="w-4 h-4" /> Edit
            </Link>
            {product?.status?.approvalStatus === 'pending' && (
              <>
                <button onClick={() => setIsApproveOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-100">
                  <BadgeCheck className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => setIsRejectOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all shadow-lg shadow-red-100">
                  <Ban className="w-4 h-4" /> Reject
                </button>
              </>
            )}
            <button onClick={() => setIsDeleteOpen(true)} className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-all shadow-sm" title="Delete product">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Rejection reason banner ── */}
        {product.status.approvalStatus === 'rejected' && product.status.rejectionReason && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 text-sm">Rejection Reason</p>
              <p className="text-red-700 text-sm mt-1">{product.status.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            HERO SECTION — Image Gallery Left + Key Info Right
        ════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Gallery ── */}
          <div className="lg:col-span-3 space-y-3">
            {/* Main image */}
            <div
              className="relative aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden group cursor-zoom-in shadow-xl"
              onClick={() => { if (images.length) setIsLightboxOpen(true) }}
            >
              {images[activeImg]?.url ? (
                <img src={images[activeImg].url} alt={product.basicInfo.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-slate-700" />
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {/* Zoom hint */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                  <ZoomIn className="w-3.5 h-3.5" /> Click to enlarge
                </div>
              </div>
              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-xl bg-black/60 backdrop-blur text-white text-xs font-bold">
                  {activeImg + 1} / {images.length}
                </div>
              )}
              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); setActiveImg(i => Math.max(0, i - 1)) }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center text-slate-700 hover:bg-white shadow-lg transition-all opacity-0 group-hover:opacity-100">
                    <ChevLeft className="w-4 h-4" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setActiveImg(i => Math.min(images.length - 1, i + 1)) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center text-slate-700 hover:bg-white shadow-lg transition-all opacity-0 group-hover:opacity-100">
                    <ChevRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImg === i ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-transparent hover:border-slate-300'}`}>
                    <img src={img.thumbnail || img.url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Key Info Panel ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Price card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Rent</p>
                  <p className="text-4xl font-black text-slate-900 mt-1">
                    ₹{product.pricing.monthlyRent.toLocaleString('en-IN')}
                    <span className="text-base font-normal text-slate-400">/mo</span>
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${cond.bg} ${cond.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cond.dot}`} />
                  {cond.label}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Security Deposit', value: `₹${product.pricing.securityDeposit?.toLocaleString('en-IN') || '—'}` },
                  { label: 'Quarterly', value: `₹${(product.pricing.monthlyRent * 3).toLocaleString('en-IN')}` },
                  { label: 'Half-yearly', value: `₹${(product.pricing.monthlyRent * 6).toLocaleString('en-IN')}` },
                  { label: 'Annual', value: `₹${(product.pricing.monthlyRent * 11).toLocaleString('en-IN')}` },
                ].map(p => (
                  <div key={p.label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">{p.label}</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{p.value}</p>
                  </div>
                ))}
              </div>

              {/* Rating */}
              {product.ratings && product.ratings.count > 0 && (
                <div className="pt-2 border-t border-slate-50">
                  <StarRow value={product.ratings.average} count={product.ratings.count} />
                </div>
              )}
            </div>

            {/* Quick meta */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Info</p>
              {[
                { icon: Hash,    label: 'SKU',       value: product.basicInfo.sku },
                { icon: Tag,     label: 'Category',  value: product.category.name },
                { icon: Package, label: 'Brand',     value: product.basicInfo.brand || '—' },
                { icon: Box,     label: 'Stock',     value: `${product.inventory.availableQuantity} / ${product.inventory.totalQuantity} units` },
                { icon: Calendar,label: 'Listed',    value: timeAgo(product.createdAt) },
                { icon: RefreshCw,label:'Updated',   value: timeAgo(product.updatedAt) },
              ].map(f => {
                const Icon = f.icon
                return (
                  <div key={f.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-400 font-medium"><Icon className="w-3.5 h-3.5" /> {f.label}</span>
                    <span className="font-semibold text-slate-800 text-right max-w-[160px] truncate">{f.value}</span>
                  </div>
                )
              })}
            </div>

            {/* Vendor quick card */}
            {product.vendor && (
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5 space-y-3">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Vendor</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{product.vendor.business.name}</p>
                    {product.vendor.user?.email && <p className="text-xs text-indigo-600 truncate">{product.vendor.user.email}</p>}
                  </div>
                </div>
                {product.vendor.business.address?.city && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="w-3 h-3 text-indigo-400" />{product.vendor.business.address.city}, {product.vendor.business.address.state}</p>
                )}
                <Link href={`/admin/vendors/${product.vendor._id}`} className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                  View vendor profile <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            TABBED SECTION
        ════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Tab nav */}
          <div className="border-b border-slate-100 px-6 pt-1">
            <div className="flex gap-0 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${activeTab === tab.key ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200'}`}>
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">

              {/* ── Overview ── */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  {product.basicInfo.description && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Description</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">{product.basicInfo.description}</p>
                    </div>
                  )}

                  {product.features && product.features.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Key Features</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {product.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-indigo-600" />
                            </div>
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rental value cards */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Rental Value Overview</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Daily Equivalent', value: `₹${Math.round(product.pricing.monthlyRent / 30).toLocaleString('en-IN')}`, sub: 'per day' },
                        { label: 'Weekly Estimate', value: `₹${Math.round(product.pricing.monthlyRent / 4.3).toLocaleString('en-IN')}`, sub: 'per week' },
                        { label: 'Annual Cost', value: `₹${(product.pricing.monthlyRent * 11).toLocaleString('en-IN')}`, sub: '11-month plan' },
                        { label: 'vs. Buying', value: `${Math.round((product.pricing.monthlyRent * 12) / (product.pricing.monthlyRent * 24) * 100)}%`, sub: 'of purchase cost/yr' },
                      ].map(c => (
                        <div key={c.label} className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-xl border border-slate-100 p-4">
                          <p className="text-lg font-black text-slate-900">{c.value}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">{c.label}</p>
                          <p className="text-[10px] text-slate-400">{c.sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Activity Timeline</h3>
                    <div className="space-y-2">
                      {[
                        { icon: Package, label: 'Product created', time: product.createdAt, color: 'text-indigo-600 bg-indigo-50' },
                        { icon: RefreshCw, label: 'Last updated', time: product.updatedAt, color: 'text-slate-500 bg-slate-50' },
                        ...(product.status.approvalStatus === 'approved' ? [{ icon: BadgeCheck, label: 'Approved & published', time: product.updatedAt, color: 'text-emerald-600 bg-emerald-50' }] : []),
                        ...(product.status.approvalStatus === 'rejected' ? [{ icon: Ban, label: 'Rejected', time: product.updatedAt, color: 'text-red-600 bg-red-50' }] : []),
                      ].map((ev, i) => {
                        const Icon = ev.icon
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${ev.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                              <p className="text-sm font-medium text-slate-700">{ev.label}</p>
                              <p className="text-xs text-slate-400">{timeAgo(ev.time)}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Specifications ── */}
              {activeTab === 'specs' && (
                <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                  {product.specifications && product.specifications.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Technical Specifications</h3>
                      <div className="rounded-xl border border-slate-100 overflow-hidden">
                        {product.specifications.map((spec, i) => (
                          <div key={i} className={`flex items-center justify-between px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            <span className="font-semibold text-slate-500 w-1/2">{spec.key}</span>
                            <span className="font-bold text-slate-800 text-right w-1/2">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyTabState icon={Settings} message="No specifications added yet." />
                  )}

                  {/* Condition details */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Condition Details</h3>
                    <div className={`flex items-center gap-4 p-4 rounded-xl border ${cond.bg}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cond.bg}`}>
                        <span className={`w-5 h-5 rounded-full ${cond.dot}`} />
                      </div>
                      <div>
                        <p className={`font-bold text-lg ${cond.text}`}>{cond.label}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {product.condition === 'new' && 'Brand new, unused, in original packaging.'}
                          {product.condition === 'like_new' && 'Used very gently, no visible wear or tear.'}
                          {product.condition === 'good' && 'Minor signs of use but fully functional.'}
                          {product.condition === 'fair' && 'Noticeable wear but works perfectly.'}
                          {product.condition === 'poor' && 'Heavy wear; functional but cosmetically imperfect.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Inventory ── */}
              {activeTab === 'inventory' && (
                <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Quantity',     value: product.inventory.totalQuantity,     icon: Box,        color: 'text-indigo-600 bg-indigo-50' },
                      { label: 'Available',           value: product.inventory.availableQuantity, icon: CheckCircle,color: 'text-emerald-600 bg-emerald-50' },
                      { label: 'Reserved / Rented',  value: product.inventory.reservedQuantity ?? (product.inventory.totalQuantity - product.inventory.availableQuantity), icon: Clock, color: 'text-amber-600 bg-amber-50' },
                      { label: 'Utilisation Rate',   value: `${Math.round(((product.inventory.totalQuantity - product.inventory.availableQuantity) / Math.max(product.inventory.totalQuantity, 1)) * 100)}%`, icon: TrendingUp, color: 'text-violet-600 bg-violet-50' },
                    ].map(s => {
                      const Icon = s.icon
                      return (
                        <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color.split(' ')[1]}`}>
                            <Icon className={`w-4 h-4 ${s.color.split(' ')[0]}`} />
                          </div>
                          <p className="text-2xl font-black text-slate-900">{s.value}</p>
                          <p className="text-xs font-semibold text-slate-400 mt-1">{s.label}</p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Stock bar */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3 shadow-sm">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-600">Stock Availability</span>
                      <span className="font-bold text-slate-900">{product.inventory.availableQuantity} / {product.inventory.totalQuantity} units</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(product.inventory.availableQuantity / Math.max(product.inventory.totalQuantity, 1)) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      />
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Available</span>
                      <span className="flex items-center gap-1.5 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-400" /> Rented Out</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Vendor ── */}
              {activeTab === 'vendor' && (
                <motion.div key="vendor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                  {product.vendor ? (
                    <>
                      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                            <Building2 className="w-7 h-7 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-slate-900 text-lg">{product.vendor.business.name}</h3>
                            {product.vendor.user?.profile && (
                              <p className="text-sm text-indigo-700 font-medium">
                                {product.vendor.user.profile.firstName} {product.vendor.user.profile.lastName}
                              </p>
                            )}
                            <Link href={`/admin/vendors/${product.vendor._id}`} className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 mt-1 font-semibold">
                              View full profile <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { icon: Mail,  label: 'Email',    value: product.vendor.user?.email },
                            { icon: Phone, label: 'Phone',    value: product.vendor.business.phone || product.vendor.user?.profile?.phone },
                            { icon: MapPin,label: 'City',     value: product.vendor.business.address?.city },
                            { icon: Globe, label: 'State',    value: product.vendor.business.address?.state },
                          ].filter(f => f.value).map(f => {
                            const Icon = f.icon
                            return (
                              <div key={f.label} className="bg-white/70 rounded-xl px-4 py-3 flex items-center gap-2.5">
                                <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                                <div>
                                  <p className="text-[10px] font-semibold text-slate-400">{f.label}</p>
                                  <p className="text-sm font-bold text-slate-800">{f.value}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  ) : <EmptyTabState icon={Building2} message="No vendor information available." />}
                </motion.div>
              )}

              {/* ── Analytics ── */}
              {activeTab === 'analytics' && (
                <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                  {product.rentalHistory ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { icon: Activity, label: 'Total Rentals',       value: product.rentalHistory.totalRentals,  suffix: 'orders', color: 'from-indigo-500 to-violet-600' },
                        { icon: DollarSign,label:'Total Revenue',       value: `₹${product.rentalHistory.totalRevenue.toLocaleString('en-IN')}`, suffix: 'earned', color: 'from-emerald-500 to-teal-600' },
                        { icon: Clock,     label: 'Avg Rental Duration', value: product.rentalHistory.avgRentalDuration, suffix: 'days avg', color: 'from-amber-500 to-orange-600' },
                      ].map(s => {
                        const Icon = s.icon
                        return (
                          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}>
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                              <Icon className="w-4 h-4" />
                            </div>
                            <p className="text-2xl font-black">{s.value}</p>
                            <p className="text-sm font-semibold opacity-80 mt-0.5">{s.label}</p>
                            <p className="text-xs opacity-60">{s.suffix}</p>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { icon: Activity,   label: 'Total Rentals',        value: '—', color: 'bg-indigo-50 text-indigo-600' },
                        { icon: DollarSign, label: 'Total Revenue',        value: '—', color: 'bg-emerald-50 text-emerald-600' },
                        { icon: Clock,      label: 'Avg Rental Duration',  value: '—', color: 'bg-amber-50 text-amber-600' },
                      ].map(s => {
                        const Icon = s.icon
                        return (
                          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color.split(' ')[0]}`}>
                              <Icon className={`w-4 h-4 ${s.color.split(' ')[1]}`} />
                            </div>
                            <p className="text-2xl font-black text-slate-900">{s.value}</p>
                            <p className="text-xs font-semibold text-slate-400 mt-1">{s.label}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Rental performance notes */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-700">Performance Insights</h3>
                    {[
                      `Monthly rent of ₹${product.pricing.monthlyRent.toLocaleString('en-IN')} placed this product in its category pricing tier.`,
                      `${product.inventory.availableQuantity} of ${product.inventory.totalQuantity} units currently available for new rentals.`,
                      product.ratings && product.ratings.count > 0 ? `Customer satisfaction: ${product.ratings.average.toFixed(1)}/5 from ${product.ratings.count} rentals.` : 'No customer reviews yet — first rental will establish credibility.',
                    ].map((insight, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        {insight}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* ═══════════════════════════ MODALS ════════════════════════════ */}

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && images.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <button onClick={e => { e.stopPropagation(); setActiveImg(i => Math.max(0, i - 1)) }}
              className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <ChevLeft className="w-5 h-5" />
            </button>
            <motion.img
              key={activeImg}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={images[activeImg]?.url}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button onClick={e => { e.stopPropagation(); setActiveImg(i => Math.min(images.length - 1, i + 1)) }}
              className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <ChevRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActiveImg(i) }}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? 'bg-white w-6' : 'bg-white/40'}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve Modal */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="max-w-md rounded-2xl border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <BadgeCheck className="w-5 h-5 text-emerald-500" /> Approve Product
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              This listing will go live and be visible to all customers immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-emerald-100 bg-white">
                {primaryImg ? <img src={primaryImg.thumbnail || primaryImg.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-slate-300" /></div>}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{product.basicInfo.name}</p>
                <p className="text-xs text-slate-500">{product.vendor?.business?.name} · {product.category.name}</p>
                <p className="text-sm font-extrabold text-emerald-700 mt-1">₹{product.pricing.monthlyRent.toLocaleString('en-IN')}/mo</p>
              </div>
            </div>
            <div className="space-y-2">
              {['Product goes live immediately', 'Vendor gets an email notification', 'Customers can start booking now'].map(s => (
                <div key={s} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> {s}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsApproveOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleApprove} disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors disabled:opacity-60 shadow-lg shadow-emerald-100">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
              Confirm Approval
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md rounded-2xl border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <Ban className="w-5 h-5 text-red-500" /> Reject Product
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              This feedback will be sent to the vendor so they can improve and resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white border border-red-100">
                {primaryImg ? <img src={primaryImg.thumbnail || primaryImg.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-slate-300" /></div>}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{product.basicInfo.name}</p>
                <p className="text-xs text-slate-500">{product.vendor?.business?.name}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Quick reasons:</p>
              <div className="flex flex-wrap gap-1.5">
                {['Unclear images', 'Pricing mismatch', 'Incomplete description', 'Wrong category', 'Condition mismatch'].map(r => (
                  <button key={r} onClick={() => setRejectionReason(p => p ? `${p}. ${r}` : r)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 text-[11px] font-medium border border-slate-200 hover:border-red-200 transition-all">
                    + {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Reason <span className="text-red-500">*</span></label>
              <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={4}
                placeholder="Describe what the vendor needs to fix…"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none transition-all" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => { setIsRejectOpen(false); setRejectionReason('') }} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleReject} disabled={isProcessing || !rejectionReason.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-50 shadow-lg shadow-red-100">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
              Send Rejection
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feature Toggle Modal */}
      <Dialog open={isToggleOpen} onOpenChange={setIsToggleOpen}>
        <DialogContent className="max-w-sm rounded-2xl border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <Star className={`w-5 h-5 ${product.status.isFeatured ? 'text-slate-400' : 'text-amber-500 fill-amber-500'}`} />
              {product.status.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              {product.status.isFeatured
                ? 'This product will no longer appear in the featured section on the homepage.'
                : 'This product will be highlighted on the homepage and category pages for maximum visibility.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setIsToggleOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleToggleFeatured} disabled={isProcessing}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-60 shadow-lg ${product.status.isFeatured ? 'bg-slate-600 hover:bg-slate-700 shadow-slate-100' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-100'}`}>
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              {product.status.isFeatured ? 'Remove Featured' : 'Mark as Featured'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md rounded-2xl border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <Trash2 className="w-5 h-5 text-red-500" /> Delete Product
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="font-bold text-red-900 text-sm">{product.basicInfo.name}</p>
              <p className="text-xs text-red-600 mt-0.5">SKU: {product.basicInfo.sku}</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              All rental history, bookings, reviews, and inventory data associated with this product will be permanently removed.
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleDelete} disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-60 shadow-lg shadow-red-100">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Permanently
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

/* ── Helpers ── */
function ApprovalBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    approved: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500 animate-pulse', label: 'Approved' },
    pending:  { bg: 'bg-amber-50 border-amber-200',     text: 'text-amber-700',   dot: 'bg-amber-400 animate-pulse',   label: 'Pending'  },
    rejected: { bg: 'bg-red-50 border-red-200',         text: 'text-red-700',     dot: 'bg-red-500',                   label: 'Rejected' },
  }
  const s = map[status] || map.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} /> {s.label}
    </span>
  )
}

function EmptyTabState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-slate-300" />
      </div>
      <p className="text-sm font-semibold text-slate-500">{message}</p>
    </div>
  )
}