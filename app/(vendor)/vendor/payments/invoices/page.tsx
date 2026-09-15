// app/vendor/payments/invoices/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  FileText, Download, ChevronLeft, ChevronRight, Search,
  Calendar, DollarSign, Package, User, Mail, Phone,
  Filter, Eye, CheckCircle, Printer, Share2
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

/**
 * Matches what GET /api/v1/vendor/invoices actually returns.
 *
 * The page previously declared a different shape — flat `subtotal` / `tax` / `total`
 * and a line-item `items[]` array — none of which the API sends. There IS no line-item
 * model for an invoice either: a rental is a single product, so the honest breakdown
 * is the rental's charge fields, which is what `amounts` holds.
 */
interface Invoice {
  _id: string
  invoiceNumber: string
  rentalNumber: string
  rentalId?: string
  type: string
  status: 'paid' | 'pending' | 'overdue'
  rentalStatus?: string
  customer: {
    name: string
    email?: string | null
    phone?: string | null
  }
  product: {
    name: string
    sku?: string | null
  }
  rentalPeriod: {
    start?: string | null
    end?: string | null
  }
  amounts: {
    subtotal: number
    discount: number
    securityDeposit: number
    deliveryCharges: number
    total: number
    paid: number
    due: number
  }
  /** Flattened equivalents of amounts.total / paid / due. */
  amount: number
  paidAmount: number
  dueAmount: number
  createdAt: string
  dueDate?: string | null
}

const statusConfig = {
  paid: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  overdue: { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
}

/**
 * Never returns undefined. A direct `statusConfig[status]` lookup threw
 * "Cannot read properties of undefined" the moment the API returned a status this
 * map does not know about, blanking the whole list.
 */
function getInvoiceStatusConfig(status: string) {
  return statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending
}

function InvoiceCard({ invoice, onDownload, onView }: { 
  invoice: Invoice; 
  onDownload: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
}) {
  const config = getInvoiceStatusConfig(invoice.status)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all"
    >
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <p className="text-xs font-mono text-slate-400">{invoice.invoiceNumber}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.bg} ${config.color}`}>
              {config.label}
            </span>
          </div>
          <h3 className="font-semibold text-slate-800">{invoice.product.name}</h3>
          <p className="text-sm text-slate-500 mt-1">{invoice.customer.name}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(invoice.createdAt), 'dd MMM yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              SKU: {invoice.product.sku}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-slate-900">₹{(invoice.amount ?? 0).toLocaleString()}</p>
          {invoice.dueAmount > 0 ? (
            <p className="text-xs text-amber-600 mt-1">
              ₹{invoice.dueAmount.toLocaleString()} due
            </p>
          ) : (
            <p className="text-xs text-green-600 mt-1">Fully paid</p>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onView(invoice)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="View Invoice"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDownload(invoice)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function InvoiceDetailsModal({ invoice, onClose, onDownload }: { 
  invoice: Invoice; 
  onClose: () => void;
  onDownload: (invoice: Invoice) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-[#2874f0] to-[#00a0e3] px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs mb-1">INVOICE</p>
                <p className="text-2xl font-bold">{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">RentEase</p>
                <p className="text-xs text-white/80">Furniture & Appliance Rentals</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Status Banner */}
            <div className={`rounded-xl p-4 border ${
              invoice.status === 'paid' ? 'bg-green-50 border-green-200' :
              invoice.status === 'pending' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {invoice.status === 'paid' && <CheckCircle className="h-5 w-5 text-green-600" />}
                <div>
                  <p className={`font-semibold ${
                    invoice.status === 'paid' ? 'text-green-800' :
                    invoice.status === 'pending' ? 'text-amber-800' : 'text-red-800'
                  }`}>
                    Invoice {invoice.status === 'paid' ? 'Paid' : invoice.status === 'pending' ? 'Pending Payment' : 'Overdue'}
                  </p>
                  {/* No `paidAt` exists on a rental invoice, so the paid figure is
                      shown instead of a timestamp that was never sent. */}
                  {invoice.rentalPeriod?.end && (
                    <p className="text-xs mt-0.5 text-slate-600">
                      Rental ends {format(new Date(invoice.rentalPeriod.end), 'dd MMM yyyy')}
                    </p>
                  )}
                  {invoice.paidAmount > 0 && (
                    <p className="text-xs mt-0.5 text-green-700">
                      ₹{invoice.paidAmount.toLocaleString()} received
                      {invoice.dueAmount > 0
                        ? `, ₹${invoice.dueAmount.toLocaleString()} outstanding`
                        : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Bill To & Rental Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
                <p className="font-medium text-slate-800">{invoice.customer.name}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3" />
                  {invoice.customer.email}
                </p>
                {invoice.customer.phone && (
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {invoice.customer.phone}
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Rental Details</h3>
                <p className="text-sm text-slate-600">Rental #{invoice.rentalNumber}</p>
                <p className="text-sm text-slate-600 mt-1">
                  {invoice.rentalPeriod?.start && invoice.rentalPeriod?.end
                    ? `${format(new Date(invoice.rentalPeriod.start), 'dd MMM yyyy')} - ${format(
                        new Date(invoice.rentalPeriod.end),
                        'dd MMM yyyy',
                      )}`
                    : 'Dates unavailable'}
                </p>
              </div>
            </div>
            
            {/* Items Table */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Invoice Items</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Item</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 text-slate-700">
                        {invoice.product.name}
                        {invoice.rentalPeriod?.start && invoice.rentalPeriod?.end && (
                          <span className="block text-xs text-slate-400 mt-0.5">
                            {format(new Date(invoice.rentalPeriod.start), 'dd MMM yyyy')} -{' '}
                            {format(new Date(invoice.rentalPeriod.end), 'dd MMM yyyy')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ₹{invoice.amounts.subtotal.toLocaleString()}
                      </td>
                    </tr>
                    {invoice.amounts.deliveryCharges > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-slate-700">Delivery charges</td>
                        <td className="px-4 py-3 text-right">
                          ₹{invoice.amounts.deliveryCharges.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    {invoice.amounts.securityDeposit > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-slate-700">Security deposit</td>
                        <td className="px-4 py-3 text-right">
                          ₹{invoice.amounts.securityDeposit.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    {invoice.amounts.discount > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-slate-700">Discount</td>
                        <td className="px-4 py-3 text-right text-green-700">
                          -₹{invoice.amounts.discount.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-[#2874f0]">
                        ₹{invoice.amounts.total.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-right font-medium">Paid</td>
                      <td className="px-4 py-3 text-right text-green-700">
                        ₹{invoice.amounts.paid.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-right font-medium">Due</td>
                      <td className="px-4 py-3 text-right text-amber-700">
                        ₹{invoice.amounts.due.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            {/* Notes */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">
                <span className="font-semibold">Note:</span> This is a system-generated invoice.
                For any discrepancies, please contact support within 7 days.
              </p>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="sticky bottom-0 border-t border-slate-200 px-6 py-4 bg-white flex gap-3 justify-end">
            <button
              onClick={() => onDownload(invoice)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InvoicesPage() {
  const { data: session, status } = useSession()
  const toast = useToast()
  
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalInvoices, setTotalInvoices] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  
  const fetchInvoices = useCallback(async () => {
    if (status !== 'authenticated') return
    
    try {
      const headers = await getAuthHeaders()
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', '10')
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchTerm) params.set('search', searchTerm)
      
      const res = await fetch(`${BASE_URL}/api/v1/vendor/invoices?${params.toString()}`, { headers })

      // A non-JSON error body (404/500 from a proxy, a maintenance page) used to hit
      // res.json(), throw, and surface only a generic "Failed to load invoices" —
      // with the list then rendering as though the vendor simply had no invoices.
      // Handle it explicitly so a real outage never looks like an empty account.
      if (!res.ok) {
        setInvoices([])
        setTotalPages(1)
        setTotalInvoices(0)
        setTotalAmount(0)
        toast.error(
          `Could not load invoices (server returned ${res.status}). This is not an empty list.`,
        )
        return
      }

      const data = await res.json()

      if (data.success) {
        setInvoices(data.data.invoices || [])
        setTotalPages(data.data.pagination?.pages || 1)
        setTotalInvoices(data.data.pagination?.total || 0)
        setTotalAmount(data.data.totalAmount || 0)
      } else {
        toast.error(data.message || 'Failed to load invoices')
      }
    } catch (error) {
      toast.error('Failed to load invoices')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, statusFilter, searchTerm, status, toast])
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchInvoices()
    }
  }, [fetchInvoices, status])
  
  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/invoices/${invoice._id}/download`, { headers })
      
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${invoice.invoiceNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Invoice downloaded')
      } else {
        toast.error('Failed to download invoice')
      }
    } catch (error) {
      toast.error('Download failed')
    }
  }
  
  const stats = [
    { label: 'Total Invoices', value: totalInvoices, icon: FileText, color: '#2874f0' },
    { label: 'Total Amount', value: `₹${(totalAmount / 1000).toFixed(1)}K`, icon: DollarSign, color: '#21a056' },
    { label: 'Paid Invoices', value: invoices.filter(i => i.status === 'paid').length, icon: CheckCircle, color: '#fb641b' },
  ]
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading invoices...</p>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice number, rental ID, or customer..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>
      
      {/* Invoices List */}
      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">No Invoices Found</h3>
          <p className="text-sm text-slate-500 mt-1">Invoices will appear here once you have completed rentals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(invoice => (
            <InvoiceCard
              key={invoice._id}
              invoice={invoice}
              onDownload={handleDownloadInvoice}
              onView={setSelectedInvoice}
            />
          ))}
        </div>
      )}
      
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
      
      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onDownload={handleDownloadInvoice}
        />
      )}
    </div>
  )
}