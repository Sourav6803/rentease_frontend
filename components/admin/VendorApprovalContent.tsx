


// src/app/admin/vendors/approval/page.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Search, Eye, CheckCircle, XCircle, Clock, AlertCircle,
  Download, Mail, Phone, MapPin, Building2, FileText, Banknote,
  Shield, Calendar, TrendingUp, RefreshCw, Loader2,
  FileCheck, AlertTriangle, ChevronRight, Activity,
  ShieldCheck, Info, HelpCircle, ArrowUpRight, ArrowDownRight,
  Star, Package, DollarSign, Users, Award, Zap, ExternalLink,
  Image as ImageIcon, X, ChevronLeft,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'
import Image from 'next/image'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Types
interface VendorDocument {
  type: string
  url: string
  _id: string
}

interface VendorBankDetails {
  accountHolderName: string
  bankName: string
  ifscCode: string
  branchName: string
  accountType: string
  upiId?: string
  verified: boolean
}

interface VendorBusiness {
  name: string
  gstin?: string
  panNumber?: string
  businessType?: string
}

interface VendorContact {
  primaryPhone: string
  primaryEmail: string
  supportEmail?: string
}

interface VendorAddress {
  registeredOffice: {
    addressLine1: string
    city: string
    state: string
    pincode: string
    country: string
  }
  serviceableCities: Array<{ city: string; state: string; isActive: boolean; _id: string }>
  serviceablePincodes: string[]
}

interface VendorVerification {
  status: 'pending' | 'verified' | 'rejected' | 'suspended'
  documents: VendorDocument[]
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: string
}

interface VendorUser {
  _id: string
  email: string
  phone: string
  profile: {
    firstName: string
    lastName: string
  }
}

interface Vendor {
  _id: string
  vendorId: string
  user: VendorUser
  business: VendorBusiness
  contact: VendorContact
  addresses: VendorAddress
  verification: VendorVerification
  bankDetails: VendorBankDetails
  performance: {
    rating: { average: number; count: number }
    metrics: { totalRevenue: number; totalRentals: number }
  }
  subscription: { plan: string }
  createdAt: string
  status: { isActive: boolean; isBlocked: boolean }
}

interface VendorStats {
  totalVendors: number
  pendingApproval: number
  verified: number
  rejected: number
  suspended: number
  approvalRate: number
}

// API Service
const api = axios.create({ baseURL: BASE_URL, withCredentials: true })

api.interceptors.request.use(async (config) => {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`
  }
  return config
})

// Helper function to get city name
const getCityName = (city: any): string => {
  if (!city) return 'N/A'
  if (typeof city === 'string') return city
  return city.city || city.name || 'N/A'
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    suspended: "bg-slate-100 text-slate-700 border-slate-200",
  }
  const icons: Record<string, any> = {
    pending: Clock,
    verified: CheckCircle,
    rejected: XCircle,
    suspended: Shield,
  }
  const Icon = icons[status] || Clock
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend, onClick }: any) => (
  <motion.div whileHover={{ y: -2 }} onClick={onClick} className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-lg transition-all hover:border-primary/30">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      {trend && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trend.value}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-slate-800 mt-3">{value.toLocaleString()}</p>
    <p className="text-xs text-slate-500 mt-1">{title}</p>
  </motion.div>
)

// Vendor Card Component for Pending Vendors
const PendingVendorCard = ({ vendor, onView, onApprove, onReject }: any) => {
  const registeredAddress = vendor.addresses?.registeredOffice
  const cityName = getCityName(registeredAddress?.city || vendor.addresses?.serviceableCities?.[0])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all"
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {vendor.business?.name?.charAt(0) || 'V'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-800">{vendor.business?.name}</h3>
                <StatusBadge status={vendor.verification?.status || 'pending'} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">ID: {vendor.vendorId}</p>
            </div>
          </div>
          <button onClick={() => onView(vendor)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
            <Eye className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Mail className="h-3.5 w-3.5" />
            <span className="text-xs truncate">{vendor.user?.email || vendor.contact?.primaryEmail || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Phone className="h-3.5 w-3.5" />
            <span className="text-xs">{vendor.contact?.primaryPhone || vendor.user?.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-xs">{cityName || 'Location N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs">Applied {new Date(vendor.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-600">{vendor.business?.businessType || 'Business'}</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-600">{vendor.verification?.documents?.length || 0} Documents</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => onApprove(vendor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-all">
            <CheckCircle className="h-3.5 w-3.5" /> Approve
          </button>
          <button onClick={() => onReject(vendor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 transition-all">
            <XCircle className="h-3.5 w-3.5" /> Reject
          </button>
          <button onClick={() => onView(vendor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all">
            <Eye className="h-3.5 w-3.5" /> Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Vendor Details Modal
const VendorDetailsModal = ({ vendor, onClose, onApprove, onReject }: any) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'business'>('overview')
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<VendorDocument | null>(null)

  if (!vendor) return null

  const registeredAddress = vendor.addresses?.registeredOffice
  const handleApprove = async () => {
    setIsProcessing(true)
    await onApprove(vendor)
    setIsProcessing(false)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return
    setIsProcessing(true)
    await onReject(vendor, rejectionReason)
    setIsProcessing(false)
    setShowRejectConfirm(false)
    setRejectionReason('')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs">Pending Approval</p>
                <h3 className="text-xl font-bold text-white">{vendor.business?.name}</h3>
                <p className="text-white/80 text-sm mt-1">ID: {vendor.vendorId}</p>
              </div>
              <button onClick={onClose} className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <XCircle className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 px-6 bg-white">
            <div className="flex gap-6 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: Building2 },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'business', label: 'Business Details', icon: Shield }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-3 border-b-2 transition-all ${activeTab === tab.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2"><Building2 className="h-4 w-4" /> Business Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Business Type:</span><span className="capitalize">{vendor.business?.businessType || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">GSTIN:</span><span>{vendor.business?.gstin || 'Not provided'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">PAN:</span><span>{vendor.business?.panNumber ? `XXXXX${vendor.business.panNumber.slice(-4)}` : 'Not provided'}</span></div>
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2"><Mail className="h-4 w-4" /> Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /><span>{vendor.user?.email || vendor.contact?.primaryEmail}</span></div>
                      <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /><span>{vendor.contact?.primaryPhone || vendor.user?.phone}</span></div>
                    </div>
                  </div>
                </div>

                {registeredAddress && (
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-semibold text-amber-800 mb-3">Registered Address</h4>
                    <p>{registeredAddress.addressLine1}</p>
                    <p>{registeredAddress.city}, {registeredAddress.state} - {registeredAddress.pincode}</p>
                    <p>{registeredAddress.country || 'India'}</p>
                  </div>
                )}

                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-800 mb-3">Service Areas</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-sm font-medium text-slate-600">Cities:</span>
                    {vendor.addresses?.serviceableCities?.map((city: any) => (
                      <span key={city._id} className="px-2 py-0.5 bg-white rounded-full text-xs">{getCityName(city)}</span>
                    ))}
                  </div>
                  {vendor.addresses?.serviceablePincodes && vendor.addresses.serviceablePincodes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm font-medium text-slate-600">Pincodes:</span>
                      {vendor.addresses.serviceablePincodes.slice(0, 8).map((pincode: string) => (
                        <span key={pincode} className="px-2 py-0.5 bg-white rounded-full text-xs font-mono">{pincode}</span>
                      ))}
                    </div>
                  )}
                </div>

                {vendor.bankDetails && (
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-semibold text-amber-800 mb-3">Bank Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-slate-500">Account Holder:</span><p className="font-medium">{vendor.bankDetails.accountHolderName}</p></div>
                      <div><span className="text-slate-500">Bank Name:</span><p className="font-medium">{vendor.bankDetails.bankName}</p></div>
                      <div><span className="text-slate-500">IFSC Code:</span><p className="font-mono">{vendor.bankDetails.ifscCode}</p></div>
                      <div><span className="text-slate-500">Account Type:</span><p className="capitalize">{vendor.bankDetails.accountType}</p></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendor.verification?.documents?.map((doc: VendorDocument, idx: number) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-slate-800 capitalize">{doc.type.replace(/_/g, ' ')}</p>
                      <button onClick={() => setSelectedDocument(doc)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                        <Eye className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 truncate">Click to preview</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'business' && (
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Verification Summary</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Application Date</span>
                      <span className="text-sm font-medium">{new Date(vendor.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Documents Submitted</span>
                      <span className="text-sm font-medium">{vendor.verification?.documents?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Subscription Plan</span>
                      <span className="text-sm font-medium capitalize">{vendor.subscription?.plan || 'Basic'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-800">Review Checklist</p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>✓ Verify PAN card authenticity</li>
                        <li>✓ Cross-check GSTIN with business name</li>
                        <li>✓ Validate bank account details</li>
                        <li>✓ Confirm registered address</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 sticky bottom-0">
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowRejectConfirm(true)} className="px-4 py-2 bg-rose-500 text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors">
                <XCircle className="h-4 w-4 inline mr-2" /> Reject
              </button>
              <button onClick={handleApprove} disabled={isProcessing} className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50">
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> : <CheckCircle className="h-4 w-4 inline mr-2" />}
                Approve Vendor
              </button>
              <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-white transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold capitalize">{selectedDocument.type.replace(/_/g, ' ')}</h3>
              <button onClick={() => setSelectedDocument(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[60vh]">
              {selectedDocument.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={selectedDocument.url} alt="Document" className="max-w-full rounded-lg" />
              ) : (
                <iframe src={selectedDocument.url} className="w-full h-[500px]" title="Document" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><AlertCircle className="h-5 w-5 text-rose-500" /> Reject Vendor</h3>
            <p className="text-sm text-slate-500 mb-4">Please provide a reason for rejecting <span className="font-semibold">{vendor.business?.name}</span></p>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/30" placeholder="Enter rejection reason..." />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowRejectConfirm(false); setRejectionReason(''); }} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700">Cancel</button>
              <button onClick={handleReject} disabled={isProcessing || !rejectionReason.trim()} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg font-semibold disabled:opacity-50">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main Component
export  function VendorApprovalContent() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const toast = useToast()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  const getAuthHeaders = useCallback(() => {
    const token = session?.user?.accessToken
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }, [session])

  const fetchPendingVendors = useCallback(async () => {
    if (sessionStatus !== 'authenticated') return
    setIsLoading(true)
    try {
      const response = await api.get('/api/v1/admin/vendors', {
        params: { status: 'pending', page: currentPage, limit: itemsPerPage },
        headers: getAuthHeaders(),
      })
      if (response.data.success) {
        setVendors(response.data.data.vendors || [])
        setTotalPages(response.data.data.pagination?.pages || 1)
      }
    } catch (error) {
      toast.error('Failed to load pending vendors')
    } finally {
      setIsLoading(false)
    }
  }, [sessionStatus, getAuthHeaders, currentPage, toast])

  const fetchStats = useCallback(async () => {
    if (sessionStatus !== 'authenticated') return
    try {
      const response = await api.get('/api/v1/admin/vendors/stats', { headers: getAuthHeaders() })
      if (response.data.success) {
        const overview = response.data.data.overview?.[0] || {}
        setStats({
          totalVendors: overview.totalVendors || 0,
          pendingApproval: overview.pendingApproval || 0,
          verified: overview.verified || 0,
          rejected: overview.rejected || 0,
          suspended: overview.suspended || 0,
          approvalRate: overview.totalVendors > 0 ? Math.round((overview.verified / overview.totalVendors) * 100) : 0,
        })
      }
    } catch (error) {
      console.error(error)
    }
  }, [sessionStatus, getAuthHeaders])

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchPendingVendors()
      fetchStats()
    } else if (sessionStatus === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [sessionStatus, fetchPendingVendors, fetchStats, router])

  const handleApprove = async (vendor: Vendor) => {
    try {
      await api.post(`/api/v1/admin/vendors/${vendor._id}/approve`, {}, { headers: getAuthHeaders() })
      toast.success(`${vendor.business.name} approved successfully`)
      fetchPendingVendors()
      fetchStats()
      setShowDetailsModal(false)
    } catch (error) {
      toast.error('Failed to approve vendor')
    }
  }

  const handleReject = async (vendor: Vendor, reason: string) => {
    try {
      await api.post(`/api/v1/admin/vendors/${vendor._id}/reject`, { reason }, { headers: getAuthHeaders() })
      toast.success(`${vendor.business.name} rejected`)
      fetchPendingVendors()
      fetchStats()
      setShowDetailsModal(false)
    } catch (error) {
      toast.error('Failed to reject vendor')
    }
  }

  const filteredVendors = useMemo(() => {
    if (!searchQuery) return vendors
    const q = searchQuery.toLowerCase()
    return vendors.filter(v =>
      v.business?.name?.toLowerCase().includes(q) ||
      v.vendorId?.toLowerCase().includes(q) ||
      v.user?.email?.toLowerCase().includes(q)
    )
  }, [vendors, searchQuery])

  const statCards = [
    { title: 'Total Vendors', value: stats?.totalVendors || 0, icon: Users, color: '#2874f0' },
    { title: 'Pending Approval', value: stats?.pendingApproval || 0, icon: Clock, color: '#f59e0b' },
    { title: 'Verified', value: stats?.verified || 0, icon: CheckCircle, color: '#21a056' },
    { title: 'Approval Rate', value: `${stats?.approvalRate || 0}%`, icon: TrendingUp, color: '#8b5cf6' },
  ]

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Vendor Approval</h1>
            <p className="text-slate-500 mt-1">Review and approve pending vendor applications</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchPendingVendors()} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card, i) => <StatsCard key={i} {...card} />)}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name, vendor ID, or email..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Pending Vendors List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No Pending Vendors</h3>
            <p className="text-sm text-slate-500 mt-1">All vendor applications have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVendors.map(vendor => (
              <PendingVendorCard
                key={vendor._id}
                vendor={vendor}
                onView={(v: Vendor) => { setSelectedVendor(v); setShowDetailsModal(true) }}
                onApprove={handleApprove}
                onReject={(v: Vendor) => handleReject(v, '')}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-1.5">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedVendor && (
        <VendorDetailsModal
          vendor={selectedVendor}
          onClose={() => { setShowDetailsModal(false); setSelectedVendor(null) }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  )
}