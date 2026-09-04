'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Search, RefreshCw, Eye, MoreVertical,
  CheckCircle, XCircle, Clock, AlertCircle, Truck,
  Download, ChevronLeft, ChevronRight, Filter, TrendingUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

interface Rental {
  _id: string
  rentalNumber: string
  status: string
  product: {
    _id: string
    basicInfo: { name: string; sku?: string }
  }
  user: {
    _id: string
    profile?: { firstName?: string; lastName?: string; email?: string }
  }
  vendor: {
    _id: string
    business?: { name?: string }
    vendorId?: string
  }
  rentalDetails: {
    startDate: string
    endDate: string
    tenureMonths: number
    monthlyRent: number
    securityDeposit: number
    totalAmount: number
  }
  payment: {
    status: string
    paidAmount: number
    dueAmount: number
  }
  createdAt: string
}

interface ApiResponse {
  success: boolean
  data: {
    rentals: Rental[]
    summary?: Record<string, number>
    pagination: { page: number; limit: number; total: number; pages: number }
  }
  message?: string
}

const STATUS_CONFIG: Record<string, { label: string; text: string; chip: string; hex: string; icon: any }> = {
  pending: { label: 'Pending', text: 'text-amber-700', chip: 'bg-amber-50 border-amber-200', hex: '#D97706', icon: Clock },
  confirmed: { label: 'Confirmed', text: 'text-blue-700', chip: 'bg-blue-50 border-blue-200', hex: '#2563EB', icon: CheckCircle },
  ready_for_delivery: { label: 'Ready for delivery', text: 'text-indigo-700', chip: 'bg-indigo-50 border-indigo-200', hex: '#4F46E5', icon: Package },
  out_for_delivery: { label: 'Out for delivery', text: 'text-violet-700', chip: 'bg-violet-50 border-violet-200', hex: '#7C3AED', icon: Truck },
  delivered: { label: 'Delivered', text: 'text-teal-700', chip: 'bg-teal-50 border-teal-200', hex: '#0D9488', icon: CheckCircle },
  active: { label: 'Active', text: 'text-emerald-700', chip: 'bg-emerald-50 border-emerald-200', hex: '#059669', icon: CheckCircle },
  extension_requested: { label: 'Extension requested', text: 'text-orange-700', chip: 'bg-orange-50 border-orange-200', hex: '#EA580C', icon: Clock },
  return_initiated: { label: 'Return initiated', text: 'text-cyan-700', chip: 'bg-cyan-50 border-cyan-200', hex: '#0891B2', icon: Truck },
  out_for_pickup: { label: 'Out for pickup', text: 'text-pink-700', chip: 'bg-pink-50 border-pink-200', hex: '#DB2777', icon: Truck },
  completed: { label: 'Completed', text: 'text-emerald-700', chip: 'bg-emerald-50 border-emerald-200', hex: '#059669', icon: CheckCircle },
  cancelled: { label: 'Cancelled', text: 'text-rose-700', chip: 'bg-rose-50 border-rose-200', hex: '#E11D48', icon: XCircle },
  overdue: { label: 'Overdue', text: 'text-rose-700', chip: 'bg-rose-50 border-rose-200', hex: '#DC2626', icon: AlertCircle },
  disputed: { label: 'Disputed', text: 'text-orange-700', chip: 'bg-orange-50 border-orange-200', hex: '#EA580C', icon: AlertCircle },
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.chip} ${cfg.text}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

interface AdminRentalListProps {
  statusFilter?: string
  title?: string
  subtitle?: string
}

export default function AdminRentalList({ statusFilter = 'all', title = 'All Rentals', subtitle }: AdminRentalListProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [rentals, setRentals] = useState<Rental[]>([])
  const [summary, setSummary] = useState<Record<string, number> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login')
  }, [status, router])

  useEffect(() => {
    const t = setTimeout(() => { setSearchQuery(searchInput); setCurrentPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const fetchRentals = useCallback(async () => {
    if (status !== 'authenticated') return
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: currentPage.toString(), limit: '15' })
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await axios.get<ApiResponse>(`${BASE_URL}/api/v1/rentals/admin/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      })
      if (response.data.success) {
        setRentals(response.data.data.rentals)
        setSummary(response.data.data.summary || null)
        setTotalPages(response.data.data.pagination.pages)
        setTotal(response.data.data.pagination.total)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load rentals')
    } finally {
      setIsLoading(false)
    }
  }, [status, session, currentPage, statusFilter, searchQuery])

  useEffect(() => {
    if (status === 'authenticated') fetchRentals()
  }, [status, fetchRentals])

  const handleViewDetails = (rentalId: string) => {
    router.push(`/dashboard/rentals/${rentalId}`)
  }

  const handleForceComplete = async (rentalId: string) => {
    try {
      await axios.post(`${BASE_URL}/api/v1/rentals/admin/${rentalId}/force-complete`, {}, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      })
      toast.success('Rental force completed')
      fetchRentals()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to force complete')
    }
  }

  if (status === 'loading') return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>

  const statsCards = [
    { title: 'Total Rentals', value: summary?.totalRentals ?? total ?? 0, icon: Package, accent: 'from-blue-500 to-cyan-500' },
    { title: 'Active', value: summary?.activeCount ?? 0, icon: CheckCircle, accent: 'from-emerald-500 to-green-500' },
    { title: 'Completed', value: summary?.completedCount ?? 0, icon: CheckCircle, accent: 'from-teal-500 to-emerald-600' },
    { title: 'Revenue', value: summary?.totalRevenue ?? 0, icon: TrendingUp, accent: 'from-indigo-500 to-purple-500', prefix: '₹' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={fetchRentals}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((s, i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{s.title}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {s.prefix || ''}{typeof s.value === 'number' ? s.value.toLocaleString('en-IN') : s.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.accent} shadow-md`}>
                  <s.icon className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by rental #, product, user..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-10 rounded-xl border-slate-200"
              />
            </div>
            {statusFilter === 'all' && (
              <Select value={statusFilter} onValueChange={(v) => { /* handled by route */ }}>
                <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold text-slate-600">Rental</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Product</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">User</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Vendor</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Status</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-right">Amount</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Date</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : rentals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <Package className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                      <p className="font-medium">No rentals found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filter</p>
                    </td>
                  </tr>
                ) : (
                  rentals.map((rental) => {
                    const cfg = STATUS_CONFIG[rental.status] || STATUS_CONFIG.pending
                    const userName = rental.user?.profile ? `${rental.user.profile.firstName || ''} ${rental.user.profile.lastName || ''}`.trim() : 'Unknown'
                    const vendorName = rental.vendor?.business?.name || rental.vendor?.vendorId || 'Unknown'
                    const productName = rental.product?.basicInfo?.name || 'Unknown Product'

                    return (
                      <motion.tr
                        key={rental._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-slate-500">#{rental.rentalNumber}</span>
                            <span className="text-xs text-slate-400">{rental.rentalDetails.tenureMonths} months</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-700 truncate block max-w-[200px]">{productName}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-600">{userName}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-600">{vendorName}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={rental.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-slate-900">{formatCurrency(rental.rentalDetails.totalAmount)}</span>
                            <span className="text-xs text-slate-400">Paid: {formatCurrency(rental.payment.paidAmount)}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-500 text-xs">{formatDate(rental.createdAt)}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg border-slate-100">
                              <DropdownMenuLabel className="text-xs text-slate-400">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <button onClick={() => handleViewDetails(rental._id)} className="flex items-center gap-2 text-sm w-full">
                                  <Eye className="h-3.5 w-3.5" /> View Details
                                </button>
                              </DropdownMenuItem>
                              {(rental.status === 'active' || rental.status === 'overdue' || rental.status === 'disputed') && (
                                <DropdownMenuItem onClick={() => handleForceComplete(rental._id)} className="text-rose-600">
                                  <CheckCircle className="h-3.5 w-3.5" /> Force Complete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {(currentPage - 1) * 15 + 1}–{Math.min(currentPage * 15, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) pageNum = i + 1
              else if (currentPage <= 3) pageNum = i + 1
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
              else pageNum = currentPage - 2 + i
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="icon"
                  className={`h-8 w-8 rounded-lg ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600'}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
