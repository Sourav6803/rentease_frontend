// app/vendor/payments/payout-history/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History, Download, ChevronLeft, ChevronRight, RefreshCw,
  CheckCircle, Clock, XCircle, Calendar, DollarSign,
  TrendingUp, Wallet, FileText, Eye, Search, Filter,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

interface Payout {
  _id: string
  payoutNumber: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  method: string
  period: { start: string; end: string }
  transactions: Array<{ paymentId: string; amount: number }>
  processedAt?: string
  completedAt?: string
  failureReason?: string
  bankDetails: {
    accountNumber: string
    bankName: string
    ifscCode: string
  }
  createdAt: string
}

const statusConfig = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: RefreshCw },
  completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle },
  failed: { label: 'Failed', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: XCircle },
}

function PayoutCard({ payout, onViewDetails }: { payout: Payout; onViewDetails: (payout: Payout) => void }) {
  const config = statusConfig[payout.status]
  const Icon = config.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all"
    >
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <p className="text-xs font-mono text-slate-400">{payout.payoutNumber}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.bg} ${config.color}`}>
              <Icon className="h-2.5 w-2.5" />
              {config.label}
            </span>
          </div>
          <h3 className="font-semibold text-slate-800">₹{payout.amount.toLocaleString()}</h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(payout.period.start), 'dd MMM')} - {format(new Date(payout.period.end), 'dd MMM yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              {payout.method}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {payout.transactions.length} transaction{payout.transactions.length !== 1 ? 's' : ''} included
          </p>
        </div>
        <div className="text-right">
          {payout.completedAt && (
            <p className="text-xs text-green-600 mb-2">
              Completed {format(new Date(payout.completedAt), 'dd MMM yyyy')}
            </p>
          )}
          <button
            onClick={() => onViewDetails(payout)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function PayoutDetailsModal({ payout, onClose }: { payout: Payout; onClose: () => void }) {
  const config = statusConfig[payout.status]
  const Icon = config.icon
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
          <div className={`sticky top-0 px-6 py-4 border-b ${
            payout.status === 'completed' ? 'bg-green-50' :
            payout.status === 'pending' ? 'bg-amber-50' :
            payout.status === 'failed' ? 'bg-red-50' : 'bg-blue-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  payout.status === 'completed' ? 'bg-green-100' :
                  payout.status === 'pending' ? 'bg-amber-100' :
                  payout.status === 'failed' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-mono">{payout.payoutNumber}</p>
                  <h2 className="text-xl font-bold text-slate-900">Payout {config.label}</h2>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/50">
                <XCircle className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Amount */}
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">Total Amount</p>
              <p className="text-4xl font-bold text-slate-900">₹{payout.amount.toLocaleString()}</p>
            </div>
            
            {/* Timeline */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Timeline</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Payout Initiated</p>
                    <p className="text-xs text-slate-500">{format(new Date(payout.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                </div>
                {payout.processedAt && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Processing</p>
                      <p className="text-xs text-slate-500">{format(new Date(payout.processedAt), 'dd MMM yyyy, hh:mm a')}</p>
                    </div>
                  </div>
                )}
                {payout.completedAt && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Completed</p>
                      <p className="text-xs text-slate-500">{format(new Date(payout.completedAt), 'dd MMM yyyy, hh:mm a')}</p>
                    </div>
                  </div>
                )}
                {payout.failureReason && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-700">Failed</p>
                      <p className="text-xs text-red-600">{payout.failureReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bank Details */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Bank Account Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank Name:</span>
                  <span className="font-medium">{payout.bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Number:</span>
                  <span className="font-mono">XXXX{payout.bankDetails.accountNumber.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IFSC Code:</span>
                  <span className="font-mono">{payout.bankDetails.ifscCode}</span>
                </div>
              </div>
            </div>
            
            {/* Transactions */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Included Transactions</h3>
              <div className="space-y-2">
                {payout.transactions.map((tx, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-500 font-mono">{tx.paymentId}</span>
                    <span className="font-medium">₹{tx.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="sticky bottom-0 border-t border-slate-200 px-6 py-4 bg-white">
            <button
              onClick={() => window.open(`/api/v1/payouts/${payout._id}/receipt`, '_blank')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PayoutHistoryPage() {
  const { data: session, status } = useSession()
  const toast = useToast()
  
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPayouts, setTotalPayouts] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  
  const fetchPayouts = useCallback(async () => {
    if (status !== 'authenticated') return
    
    try {
      const headers = await getAuthHeaders()
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', '10')
      if (statusFilter !== 'all') params.set('status', statusFilter)
      
      const res = await fetch(`${BASE_URL}/api/v1/vendor/payouts?${params.toString()}`, { headers })
      const data = await res.json()
      
      if (data.success) {
        setPayouts(data.data.payouts || [])
        setTotalPages(data.data.pagination?.pages || 1)
        setTotalPayouts(data.data.pagination?.total || 0)
        setTotalAmount(data.data.totalAmount || 0)
      } else {
        toast.error(data.message || 'Failed to load payouts')
      }
    } catch (error) {
      toast.error('Failed to load payouts')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, statusFilter, status, toast])
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchPayouts()
    }
  }, [fetchPayouts, status])
  
  const stats = [
    { label: 'Total Payouts', value: totalPayouts, icon: History, color: '#2874f0' },
    { label: 'Total Amount', value: `₹${(totalAmount / 1000).toFixed(1)}K`, icon: DollarSign, color: '#21a056' },
    { label: 'Avg. Payout', value: `₹${totalPayouts > 0 ? Math.round(totalAmount / totalPayouts).toLocaleString() : 0}`, icon: TrendingUp, color: '#fb641b' },
  ]
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading payout history...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}10` }}>
                  <Icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by payout ID..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
      
      {/* Payouts List */}
      <AnimatePresence mode="popLayout">
        {payouts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <Wallet className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">No Payouts Yet</h3>
            <p className="text-sm text-slate-500 mt-1">Payouts will appear here once processed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map(payout => (
              <PayoutCard key={payout._id} payout={payout} onViewDetails={setSelectedPayout} />
            ))}
          </div>
        )}
      </AnimatePresence>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Details Modal */}
      {selectedPayout && (
        <PayoutDetailsModal payout={selectedPayout} onClose={() => setSelectedPayout(null)} />
      )}
    </div>
  )
}