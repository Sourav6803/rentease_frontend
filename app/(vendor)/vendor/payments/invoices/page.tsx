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

interface Invoice {
  _id: string
  invoiceNumber: string
  rentalNumber: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  type: 'rental' | 'payout'
  customer: {
    name: string
    email: string
    phone?: string
  }
  product: {
    name: string
    sku: string
  }
  rentalPeriod: {
    start: string
    end: string
  }
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  createdAt: string
  dueDate?: string
  paidAt?: string
}

const statusConfig = {
  paid: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  overdue: { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
}

function InvoiceCard({ invoice, onDownload, onView }: { 
  invoice: Invoice; 
  onDownload: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
}) {
  const config = statusConfig[invoice.status]
  
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
          <p className="text-xl font-bold text-slate-900">₹{invoice.total.toLocaleString()}</p>
          {invoice.status === 'paid' && invoice.paidAt && (
            <p className="text-xs text-green-600 mt-1">
              Paid {format(new Date(invoice.paidAt), 'dd MMM yyyy')}
            </p>
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
                  {invoice.dueDate && invoice.status !== 'paid' && (
                    <p className="text-xs mt-0.5 text-slate-600">
                      Due by {format(new Date(invoice.dueDate), 'dd MMM yyyy')}
                    </p>
                  )}
                  {invoice.paidAt && (
                    <p className="text-xs mt-0.5 text-green-700">
                      Paid on {format(new Date(invoice.paidAt), 'dd MMM yyyy')}
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
                  {format(new Date(invoice.rentalPeriod.start), 'dd MMM yyyy')} - {format(new Date(invoice.rentalPeriod.end), 'dd MMM yyyy')}
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
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Description</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Unit Price</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-slate-700">{item.description}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-600">₹{item.unitPrice.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-medium">₹{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-medium">Subtotal</td>
                      <td className="px-4 py-3 text-right">₹{invoice.subtotal.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-medium">Tax (18% GST)</td>
                      <td className="px-4 py-3 text-right">₹{invoice.tax.toLocaleString()}</td>
                    </tr>
                    <tr className="border-t border-slate-200">
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-800">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-[#2874f0]">₹{invoice.total.toLocaleString()}</td>
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