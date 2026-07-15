

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Search, RefreshCw, Eye, CheckCircle, XCircle,
  Clock, Loader2, ChevronLeft, ChevronRight, AlertCircle,
  Shield, Truck, Star, DollarSign, Calendar, User,
  Tag, BarChart2, Info, ChevronRight as ChevronRightIcon,
  Zap, Activity, ArrowRight, Building2, Hash, Box,
  CheckCheck, Ban, SlidersHorizontal, LayoutGrid,
  LayoutList, Layers, BadgeCheck, Timer
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import Link from 'next/link'
import Loading from '@/app/loading'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

/* ─────────────────────── Types ─────────────────────────────── */
interface PendingProduct {
  _id: string
  basicInfo: { name: string; slug: string; brand?: string; sku: string; description: string }
  pricing: { monthlyRent: number; securityDeposit: number }
  media?: { images?: Array<{ url: string; thumbnail: string; isPrimary: boolean }> }
  inventory: { totalQuantity: number }
  category: { _id: string; name: string }
  condition?: string
  vendor: {
    _id: string
    business: { name: string }
    user?: { email: string; profile?: { firstName: string; lastName: string } }
  }
  createdAt: string
}

/* ─────────────────────── Static content ─────────────────────── */
const REVIEW_GUIDELINES = [
  { icon: Shield, title: 'Verify Authenticity', desc: 'Ensure product images are original and match the description.' },
  { icon: DollarSign, title: 'Check Pricing', desc: 'Confirm rent and deposit align with category standards.' },
  { icon: Star, title: 'Quality Standards', desc: 'Only approve items in good to excellent condition.' },
  { icon: Truck, title: 'Delivery Viability', desc: 'Confirm the vendor can fulfil delivery in their region.' },
]

const QUICK_REJECT_REASONS = [
  'Images are blurry or unclear',
  'Pricing is not competitive',
  'Incomplete product description',
  'Wrong category selected',
  'Condition mismatch',
  'Missing security deposit details',
]

const CONDITION_META: Record<string, { label: string; color: string }> = {
  new:      { label: 'Brand New',  color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  like_new: { label: 'Like New',   color: 'text-sky-700 bg-sky-50 border-sky-200' },
  good:     { label: 'Good',       color: 'text-blue-700 bg-blue-50 border-blue-200' },
  fair:     { label: 'Fair',       color: 'text-amber-700 bg-amber-50 border-amber-200' },
  poor:     { label: 'Poor',       color: 'text-red-700 bg-red-50 border-red-200' },
}

/* ─────────────────────── Helpers ────────────────────────────── */
function timeAgo(date: string) {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }) } catch { return '—' }
}

/* ─────────────────────── Main page ─────────────────────────── */
export default function AdminPendingProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [products, setProducts] = useState<PendingProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // modals
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
    if (status === 'authenticated') fetch()
  }, [status, currentPage, searchQuery])

  const fetch = async () => {
    setIsLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/products/admin/pending`, {
        params: { page: currentPage, limit: 12, search: searchQuery || undefined },
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (res.data.success) {
        setProducts(res.data.data.products)
        setTotalPages(res.data.data.pagination?.pages || 1)
      }
    } catch { toast.error('Failed to load pending products') }
    finally { setIsLoading(false) }
  }

  const handleApprove = async (productId: string) => {
    setIsProcessing(true)
    try {
      await axios.post(`${BASE_URL}/api/v1/products/admin/${productId}/approve`, {}, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      toast.success('Product approved and listed!')
      setIsApproveOpen(false); setSelectedProduct(null)
      fetch()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Approval failed') }
    finally { setIsProcessing(false) }
  }

  const handleReject = async () => {
    if (!selectedProduct || !rejectionReason.trim()) { toast.error('Provide a rejection reason'); return }
    setIsProcessing(true)
    try {
      await axios.post(`${BASE_URL}/api/v1/products/admin/${selectedProduct._id}/reject`, { reason: rejectionReason }, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      toast.success('Product rejected. Vendor notified.')
      setIsRejectOpen(false); setSelectedProduct(null); setRejectionReason('')
      fetch()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Rejection failed') }
    finally { setIsProcessing(false) }
  }

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const handleBulkApprove = async () => {
    setIsProcessing(true)
    try {
      await Promise.all([...selected].map(id =>
        axios.post(`${BASE_URL}/api/v1/products/admin/${id}/approve`, {}, {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
        })
      ))
      toast.success(`${selected.size} products approved!`)
      setSelected(new Set()); fetch()
    } catch { toast.error('Some approvals failed') }
    finally { setIsProcessing(false) }
  }

  if (status === 'loading' || isLoading) return <Loading />

  return (
    <div className="min-h-screen bg-[#f8f9fc]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Top gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">

        {/* ─── Header ─── */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
              <span>Admin</span>
              <ChevronRightIcon className="w-3 h-3" />
              <span>Products</span>
              <ChevronRightIcon className="w-3 h-3" />
              <span className="text-amber-600">Pending Approvals</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pending Approvals</h1>
                <p className="text-slate-500 text-sm mt-0.5">Review and approve vendor rental listings before they go live</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={fetch} className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:border-amber-300 hover:text-amber-600 transition-all shadow-sm">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            {selected.size > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleBulkApprove}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-200 transition-all disabled:opacity-60"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                Approve {selected.size} Selected
              </motion.button>
            )}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutList className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* ─── Alert banner ─── */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-900 text-sm">{products.length} product{products.length > 1 ? 's' : ''} awaiting your review</p>
                <p className="text-amber-700/70 text-xs">Vendors are notified once their listing is approved or rejected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 rounded-xl bg-white border border-amber-200 shadow-sm">
                <p className="text-lg font-black text-amber-700">{products.length}</p>
                <p className="text-[10px] text-amber-500 font-semibold">Pending</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-white border border-amber-200 shadow-sm">
                <p className="text-lg font-black text-slate-800">24h</p>
                <p className="text-[10px] text-slate-400 font-semibold">SLA Target</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Review guidelines ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {REVIEW_GUIDELINES.map((g) => {
            const Icon = g.icon
            return (
              <div key={g.title} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{g.title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{g.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── Search ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by product name, SKU, or vendor…"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
              />
            </div>
            <button onClick={fetch} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-md shadow-amber-100">
              <SlidersHorizontal className="w-4 h-4" /> Search
            </button>
          </div>
        </div>

        {/* ─── Products ─── */}
        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              >
                {products.map((p, idx) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    idx={idx}
                    isSelected={selected.has(p._id)}
                    onToggleSelect={() => toggleSelect(p._id)}
                    onView={() => { setSelectedProduct(p); setIsDetailOpen(true) }}
                    onApprove={() => { setSelectedProduct(p); setIsApproveOpen(true) }}
                    onReject={() => { setSelectedProduct(p); setIsRejectOpen(true) }}
                    isProcessing={isProcessing}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0}}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="w-10 py-3.5 pl-5"></th>
                      <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                      <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Vendor</th>
                      <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rent / mo</th>
                      <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Deposit</th>
                      <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                      <th className="text-right py-3.5 px-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {products.map((p, idx) => {
                      const img = p.media?.images?.find(i => i.isPrimary)?.thumbnail || p.media?.images?.[0]?.thumbnail
                      return (
                        <motion.tr key={p._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                          className="hover:bg-amber-50/30 transition-colors group"
                        >
                          <td className="pl-5 py-4">
                            <input type="checkbox" checked={selected.has(p._id)} onChange={() => toggleSelect(p._id)}
                              className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400" />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 group-hover:border-amber-200 transition-colors">
                                {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-slate-300" /></div>}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-slate-800 max-w-[160px] truncate">{p.basicInfo.name}</p>
                                <p className="text-[11px] text-slate-400 font-mono">SKU: {p.basicInfo.sku}</p>
                                {p.basicInfo.brand && <p className="text-[11px] text-amber-600">{p.basicInfo.brand}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 hidden md:table-cell">
                            <p className="text-sm font-medium text-slate-700">{p.vendor?.business?.name}</p>
                            <p className="text-[11px] text-slate-400">{p.category.name}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-900">₹{p.pricing.monthlyRent.toLocaleString('en-IN')}</span>
                          </td>
                          <td className="py-4 px-4 hidden lg:table-cell">
                            <span className="text-sm text-slate-600">₹{p.pricing.securityDeposit?.toLocaleString('en-IN') || '—'}</span>
                          </td>
                          <td className="py-4 px-4 hidden lg:table-cell">
                            <p className="text-xs text-slate-500">{timeAgo(p.createdAt)}</p>
                            <p className="text-[10px] text-slate-400">{format(new Date(p.createdAt), 'dd MMM yyyy')}</p>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => { setSelectedProduct(p); setIsDetailOpen(true) }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => { setSelectedProduct(p); setIsApproveOpen(true) }} className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={() => { setSelectedProduct(p); setIsRejectOpen(true) }} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Reject"><XCircle className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3.5">
            <p className="text-xs text-slate-400">Page <span className="font-semibold text-slate-600">{currentPage}</span> of <span className="font-semibold text-slate-600">{totalPages}</span></p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-amber-300 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage <= 3 ? i + 1 : currentPage + i - 2
                if (page < 1 || page > totalPages) return null
                return (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page === currentPage ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'border border-slate-200 bg-white text-slate-500 hover:border-amber-300'}`}
                  >{page}</button>
                )
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-amber-300 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Bottom context ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-amber-200 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-10 w-28 h-28 rounded-full bg-white/5" />
            <div className="relative space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold">Review SLA Policy</span>
              <h3 className="text-xl font-bold leading-snug">All pending products must be reviewed within 24 hours</h3>
              <p className="text-amber-100 text-sm">Timely reviews improve vendor trust and platform GMV. Products older than 24h are escalated automatically.</p>
              <div className="grid grid-cols-3 gap-4 pt-2">
                {[
                  { label: 'Avg Review Time', value: '3.2h' },
                  { label: 'Approval Rate', value: '84%' },
                  { label: 'SLA Breaches', value: '2 this wk' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-lg font-black">{s.value}</p>
                    <p className="text-amber-200 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <p className="font-bold text-sm text-slate-800 flex items-center gap-2"><Activity className="w-4 h-4 text-amber-500" /> Approval Checklist</p>
            {[
              'Product images are clear and accurate',
              'Description matches the item',
              'Pricing is within category norms',
              'Vendor has valid KYC',
              'Category is correctly assigned',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <div className="w-4 h-4 rounded-full border-2 border-slate-200 mt-0.5 shrink-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ═══════════════════ MODALS ═══════════════════ */}

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-slate-100 shadow-2xl p-0 overflow-hidden">
          {selectedProduct && (
            <>
              {/* Hero image */}
              <div className="relative h-52 bg-slate-100 overflow-hidden">
                {selectedProduct.media?.images?.[0]?.url ? (
                  <img src={selectedProduct.media.images[0].url} className="w-full h-full object-cover" alt={selectedProduct.basicInfo.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package className="w-14 h-14 text-slate-200" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/90 text-white text-xs font-bold shadow">
                    <Clock className="w-3 h-3" /> Pending Review
                  </span>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors">
                  <XCircle className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{selectedProduct.basicInfo.name}</h2>
                  {selectedProduct.basicInfo.brand && <p className="text-sm text-amber-600 font-semibold">{selectedProduct.basicInfo.brand}</p>}
                  {selectedProduct.basicInfo.description && (
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-3">{selectedProduct.basicInfo.description}</p>
                  )}
                </div>

                {/* Thumbnail strip */}
                {(selectedProduct.media?.images?.length ?? 0) > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedProduct.media!.images!.map((img, i) => (
                      <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                        <img src={img.thumbnail} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: Hash, label: 'SKU', value: selectedProduct.basicInfo.sku },
                    { icon: Tag, label: 'Category', value: selectedProduct.category.name },
                    { icon: DollarSign, label: 'Monthly Rent', value: `₹${selectedProduct.pricing.monthlyRent.toLocaleString('en-IN')}` },
                    { icon: Shield, label: 'Security Deposit', value: `₹${selectedProduct.pricing.securityDeposit?.toLocaleString('en-IN') || '—'}` },
                    { icon: Box, label: 'Qty Available', value: `${selectedProduct.inventory.totalQuantity} units` },
                    { icon: Building2, label: 'Vendor', value: selectedProduct.vendor?.business?.name || 'N/A' },
                  ].map(f => {
                    const Icon = f.icon
                    return (
                      <div key={f.label} className="bg-slate-50 rounded-xl p-3 flex items-start gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400">{f.label}</p>
                          <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Vendor block */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-amber-900">{selectedProduct.vendor?.business?.name}</p>
                    <p className="text-xs text-amber-700">{selectedProduct.vendor?.user?.email}</p>
                    <p className="text-[11px] text-amber-500 mt-0.5">Submitted {timeAgo(selectedProduct.createdAt)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { setIsDetailOpen(false); setIsApproveOpen(true) }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors shadow-lg shadow-emerald-100">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => { setIsDetailOpen(false); setIsRejectOpen(true) }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors shadow-lg shadow-red-100">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <Link href={`/admin/products/${selectedProduct._id}`}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors flex items-center gap-1">
                    Full <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="max-w-md rounded-2xl border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <BadgeCheck className="w-5 h-5 text-emerald-500" /> Approve Product
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              This product will be published and visible to all customers on the platform.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-emerald-100 bg-white">
                  {selectedProduct.media?.images?.[0]?.thumbnail
                    ? <img src={selectedProduct.media.images[0].thumbnail} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-slate-300" /></div>}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{selectedProduct.basicInfo.name}</p>
                  <p className="text-xs text-slate-500">{selectedProduct.vendor?.business?.name} · {selectedProduct.category.name}</p>
                  <p className="text-sm font-extrabold text-emerald-700 mt-1">₹{selectedProduct.pricing.monthlyRent.toLocaleString('en-IN')}/mo</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                {[
                  'Product will appear in search results immediately',
                  'Vendor will be notified via email',
                  'Customers can start booking this item',
                ].map(s => (
                  <div key={s} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                <Info className="w-4 h-4 shrink-0" /> Quarterly estimate: <strong>₹{Math.round(selectedProduct.pricing.monthlyRent * 3).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          )}
          <DialogFooter>
            <button onClick={() => setIsApproveOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={() => selectedProduct && handleApprove(selectedProduct._id)} disabled={isProcessing}
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
              Provide a detailed reason. The vendor will receive this feedback to improve their listing.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-red-100 bg-white">
                  {selectedProduct.media?.images?.[0]?.thumbnail
                    ? <img src={selectedProduct.media.images[0].thumbnail} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-slate-300" /></div>}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{selectedProduct.basicInfo.name}</p>
                  <p className="text-xs text-slate-500">{selectedProduct.vendor?.business?.name}</p>
                </div>
              </div>

              {/* Quick reason chips */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Quick reasons (click to add):</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REJECT_REASONS.map(r => (
                    <button key={r} onClick={() => setRejectionReason(prev => prev ? `${prev}. ${r}` : r)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 text-[11px] font-medium border border-slate-200 hover:border-red-200 transition-all">
                      + {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Rejection Reason <span className="text-red-500">*</span></label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={4}
                  placeholder="Describe clearly what the vendor needs to fix before resubmitting…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none transition-all"
                />
                <p className="text-[11px] text-slate-400">This message is sent directly to the vendor via email.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <button onClick={() => { setIsRejectOpen(false); setRejectionReason('') }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleReject} disabled={isProcessing || !rejectionReason.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-50 shadow-lg shadow-red-100">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
              Send Rejection
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ─────────────────── Product Card ─────────────────────────── */
function ProductCard({
  product, idx, isSelected, onToggleSelect, onView, onApprove, onReject, isProcessing
}: {
  product: PendingProduct; idx: number; isSelected: boolean
  onToggleSelect: () => void; onView: () => void; onApprove: () => void; onReject: () => void; isProcessing: boolean
}) {
  const img = product.media?.images?.find(i => i.isPrimary)?.thumbnail || product.media?.images?.[0]?.thumbnail
  const cond = product.condition ? CONDITION_META[product.condition] : null
  const vendorName = product.vendor?.business?.name || 'Unknown Vendor'
  const submittedAgo = timeAgo(product.createdAt)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200 }}
      className={`group relative bg-white rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col ${isSelected ? 'border-amber-400 shadow-amber-100' : 'border-slate-100'}`}
    >
      {/* Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input type="checkbox" checked={isSelected} onChange={onToggleSelect}
          className="w-4 h-4 rounded border-white/60 text-amber-500 focus:ring-amber-400 bg-white/80 backdrop-blur" />
      </div>

      {/* Image */}
      <div className="relative h-44 bg-slate-50 overflow-hidden">
        {img ? (
          <img src={img} alt={product.basicInfo.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
            <Package className="w-10 h-10" />
            <span className="text-xs mt-2 text-slate-300">No image</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* Pending pill */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur text-white text-[10px] font-bold shadow">
            <Timer className="w-2.5 h-2.5" /> Pending
          </span>
        </div>
        {/* View button on hover */}
        <button onClick={onView}
          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur text-slate-700 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-md flex items-center gap-1">
          <Eye className="w-3 h-3" /> Preview
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Title + brand */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">{product.basicInfo.name}</h3>
          {product.basicInfo.brand && <p className="text-xs text-amber-600 font-medium mt-0.5">{product.basicInfo.brand}</p>}
        </div>

        {/* Meta */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1"><Building2 className="w-3 h-3" /> Vendor</span>
            <span className="font-semibold text-slate-700 truncate max-w-[120px]">{vendorName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1"><Tag className="w-3 h-3" /> Category</span>
            <span className="font-medium text-slate-600">{product.category.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Submitted</span>
            <span className="font-medium text-slate-500">{submittedAgo}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between py-2 border-t border-slate-50">
          <div>
            <p className="text-base font-extrabold text-slate-900">₹{product.pricing.monthlyRent.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/mo</span></p>
            {product.pricing.securityDeposit > 0 && (
              <p className="text-[11px] text-slate-400">Deposit: ₹{product.pricing.securityDeposit.toLocaleString('en-IN')}</p>
            )}
          </div>
          {cond && <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${cond.color}`}>{cond.label}</span>}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button onClick={onApprove} disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-100 disabled:opacity-60">
            <CheckCircle className="w-3.5 h-3.5" /> Approve
          </button>
          <button onClick={onReject} disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition-all disabled:opacity-60">
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
          <button onClick={onView}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors">
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────── Empty State ────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center">
          <CheckCheck className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
          <Star className="w-3.5 h-3.5 text-white fill-white" />
        </div>
      </div>
      <h3 className="text-xl font-extrabold text-slate-800 mb-2">All caught up!</h3>
      <p className="text-slate-400 text-sm max-w-xs">No products are currently pending review. Check back when vendors submit new rental listings.</p>
      <div className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold">
        <Shield className="w-4 h-4" /> Platform quality is maintained
      </div>
    </div>
  )
}