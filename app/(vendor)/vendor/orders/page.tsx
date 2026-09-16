// app/vendor/orders/page.tsx - All Orders (Main Page)
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, TrendingUp, DollarSign, Clock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { OrderCard } from '@/components/vendor/orders/OrderCard'
import { OrderFilters } from '@/components/vendor/orders/OrderFilters'
import { OrderStatusBadge } from '@/components/vendor/orders/OrderStatusBadge'
import { Rental, RentalStatus, STATUS_CONFIG } from './types'
import { useToast } from '@/hooks/useToast'
import { OrderDetailsModal } from '@/components/vendor/orders/OrderDetailsModal'
import { OrderActionDialog, OrderAction } from '@/components/vendor/orders/OrderActionDialog'
import { toast } from 'sonner'

/**
 * Actions that must go through the confirmation dialog. Accepting an order, closing
 * a return or ruling on an extension all change money or custody, so none of them
 * should be a single unguarded click — and two of them require a request body that
 * the API validates.
 */
const DIALOG_ACTIONS: OrderAction[] = [
  'confirm',
  'activate',
  'complete_return',
  'approve_extension',
  'reject_extension',
]

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

export default function VendorOrdersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
//   const { toast } = useToast()
  
  const [rentals, setRentals] = useState<Rental[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [summary, setSummary] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dialog, setDialog] = useState<{ rental: Rental; action: OrderAction } | null>(null)
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null)
  
  const fetchRentals = useCallback(async (showLoading = true) => {
    if (status !== 'authenticated') return
    
    if (showLoading) setIsLoading(true)
    
    try {
      const headers = await getAuthHeaders()
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', '12')
      if (searchTerm) params.set('search', searchTerm)
      if (dateRange.start) params.set('startDate', dateRange.start)
      if (dateRange.end) params.set('endDate', dateRange.end)
      
      const res = await fetch(`${BASE_URL}/api/v1/rentals/vendor/me?${params.toString()}`, { headers })
      const data = await res.json()
      
      if (data.success) {
        setRentals(data.data.rentals || [])
        setTotalPages(data.data.pagination?.pages || 1)
        setTotalOrders(data.data.pagination?.total || 0)
        setSummary(data.data.summary)
      } else {
        toast.error(data.message || 'Failed to load orders')
      }
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [currentPage, searchTerm, dateRange, status, toast])
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchRentals()
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [fetchRentals, status, router])
  
  /**
   * Download this rental's invoice PDF through the vendor-scoped route.
   *
   * Used by the `view_receipt` action on completed orders. The endpoint is scoped to
   * the logged-in vendor server-side, so the ids in the URL cannot be swapped to
   * read another vendor's invoice.
   */
  const downloadInvoice = async (rental: Rental) => {
    setReceiptLoadingId(rental._id)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/invoices/${rental._id}/download`, {
        headers,
      })

      if (!res.ok) {
        // Error bodies are usually JSON, but a proxy failure will not be — never
        // let a failed `.json()` mask the real status code.
        const body = await res.json().catch(() => null)
        toast.error(body?.message || `Could not download the invoice (HTTP ${res.status})`)
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${rental.rentalNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch {
      toast.error('Could not download the invoice')
    } finally {
      setReceiptLoadingId(null)
    }
  }

  const handleAction = async (rental: Rental, action: string) => {
    // Money/custody changes go through the dialog, never straight from the row.
    if (DIALOG_ACTIONS.includes(action as OrderAction)) {
      setShowDetailsModal(false)
      setDialog({ rental, action: action as OrderAction })
      return
    }

    if (action === 'arrange_delivery') {
      // Delivery is arranged on its own screen — the vendor does not mark the order
      // delivered, the delivery partner does that with proof of hand-over.
      router.push('/vendor/delivery')
      return
    }

    if (action === 'view_receipt') {
      await downloadInvoice(rental)
      return
    }

    // Every action in STATUS_CONFIG is wired; this only fires if a future status
    // ships a button before its handler does.
    toast.error(`Action "${action}" is not available for this order`)
  }
  
  const stats = [
    { label: 'Total Orders', value: totalOrders, icon: Package, color: '#2874f0', bg: '#ebf3fb' },
    { label: 'Total Revenue', value: `₹${(summary?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: '#21a056', bg: '#e8f5e9' },
    { label: 'Active Rentals', value: summary?.activeCount || 0, icon: Clock, color: '#fb641b', bg: '#fff3e0' },
    { label: 'Pending Actions', value: summary?.pendingCount || 0, icon: DollarSign, color: '#9c27b0', bg: '#f3e5f5' },
  ]
  
  const hasActiveFilters = searchTerm !== '' || dateRange.start !== '' || dateRange.end !== ''
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading orders...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">All Orders</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {totalOrders} order{totalOrders !== 1 ? 's' : ''} · Manage customer rentals
            </p>
          </div>
          <button
            onClick={() => { setIsRefreshing(true); fetchRentals(true); setTimeout(() => setIsRefreshing(false), 1000) }}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.bg }}>
                    <Icon className="h-4 w-4" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>
        
        {/* Filters */}
        <OrderFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onClearFilters={() => { setSearchTerm(''); setDateRange({ start: '', end: '' }) }}
          hasActiveFilters={hasActiveFilters}
        />
        
        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : rentals.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#ebf3fb] rounded-full flex items-center justify-center mb-5">
              <Package className="h-9 w-9 text-[#2874f0]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1.5">
              {hasActiveFilters ? 'No orders match your filters' : 'No orders yet'}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              {hasActiveFilters
                ? 'Try adjusting your search or remove filters to see all orders.'
                : 'When customers place orders, they will appear here.'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {rentals.map(rental => (
                <OrderCard
                  key={rental._id}
                  rental={rental}
                  onViewDetails={(r) => { setSelectedRental(r); setShowDetailsModal(true) }}
                  onAction={handleAction}
                  actingAction={receiptLoadingId === rental._id ? 'view_receipt' : null}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-800">{currentPage}</span> of <span className="font-semibold text-slate-800">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
                    onClick={() => setCurrentPage(p)}
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
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Order Details Modal */}
      {showDetailsModal && selectedRental && (
        <OrderDetailsModal
          rental={selectedRental}
          onClose={() => { setShowDetailsModal(false); setSelectedRental(null) }}
          onAction={handleAction}
        />
      )}

      {/* Confirmation dialog for actions that change money or custody */}
      {dialog && (
        <OrderActionDialog
          rental={dialog.rental}
          action={dialog.action}
          onClose={() => setDialog(null)}
          onSuccess={(message) => {
            setDialog(null)
            toast.success(message)
            fetchRentals(false)
          }}
        />
      )}
    </div>
  )
}