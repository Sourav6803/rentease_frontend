
// app/vendor/profile/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Building2, Mail, Phone, MapPin, Calendar,
  Shield, CheckCircle, XCircle, Clock, Edit2, Save,
  Upload, Camera, FileText, Star, TrendingUp,
  Package, DollarSign, Award,
  Bell, Truck, CreditCard,
  Trash2, RefreshCw,
  ArrowUp, ArrowDown, Boxes, BadgeCheck, Sparkles,
  ChevronRight, BarChart3, Wallet, ShoppingCart,
  Globe, Settings, Tag, Percent, Store, Zap, Lock,
  Eye, AlertTriangle
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

// ─── Types matching actual API response ────────────────────────────────────
interface ApiDocument {
  type: string
  url: string
  _id: string
}

interface ServiceableCity {
  city: string
  state: string
  isActive: boolean
  _id: string
}

interface RegisteredOffice {
  addressLine1: string
  city: string
  state: string
  pincode: string
  country: string
  isVerified: boolean
}

interface VendorProfile {
  _id: string
  vendorId: string
  user: {
    _id: string
    email: string
    phone: string
    profile: {
      firstName: string
      lastName: string
      avatar?: string
    }
    verification: {
      kyc: { status: string }
    }
  }
  business: {
    name: string
    description?: string
    website?: string
    logo?: string
    gstin?: string
    panNumber?: string
    yearEstablished?: number
    employeeCount?: number
    businessType?: string
  }
  contact: {
    primaryPhone: string
    secondaryPhone?: string
    primaryEmail: string
    supportEmail?: string
  }
  addresses: {
    registeredOffice: RegisteredOffice
    serviceableCities: ServiceableCity[]
    warehouse: any[]
    serviceablePincodes: string[]
  }
  verification: {
    status: 'pending' | 'verified' | 'rejected'
    documents: ApiDocument[]
    verifiedAt?: string
    rejectionReason?: string
  }
  bankDetails: {
    accountHolderName: string
    ifscCode: string
    bankName: string
    branchName: string
    accountType: string
    upiId: string
    verified: boolean
  }
  commission: {
    rate: number
    type: string
  }
  performance: {
    rating: {
      average: number
      count: number
    }
    metrics: {
      totalRentals: number
      completedRentals: number
      cancelledRentals: number
      totalRevenue: number
      averageRentalValue: number
      customerSatisfaction: number
      responseRate: number
      fulfillmentRate: number
      onTimeDelivery: number
    }
  }
  subscription: {
    plan: string
    validUntil: string
    autoRenew: boolean
    limits: {
      maxProducts: number
      maxRentalsPerMonth: number
      maxInventoryItems: number
      prioritySupport: boolean
      analyticsAccess: boolean
    }
  }
  settings: {
    autoConfirmBookings: boolean
    instantBooking: boolean
    advanceNotice: number
    minRentalDuration: number
    maxRentalDuration: number
    cancellationPolicy: string
    businessHours: any[]
    notificationPreferences: {
      newRentals: boolean
      cancellations: boolean
      payments: boolean
      reviews: boolean
      dailyDigest: boolean
    }
  }
  payments: {
    pending: number
    paid: number
    payoutSchedule: string
  }
  products: {
    total: number
    active: number
    rented: number
    available: number
  }
  status: {
    isActive: boolean
    isBlocked: boolean
    isOnboarded: boolean
    onboardedAt?: string
  }
  stats: {
    totalProducts: number
    totalRentals: number
    totalRevenue: number
    averageRating: number
    joinedDate: string
  }
  createdAt: string
  updatedAt: string
}

// ─── Helper: get document by type ──────────────────────────────────────────
function getDoc(docs: ApiDocument[], type: string) {
  return docs?.find(d => d.type === type)
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({
  title, value, icon: Icon, color, sub, trend
}: {
  title: string; value: string | number; icon: any
  color: string; sub?: string; trend?: { value: number; up: boolean }
}) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="relative bg-white rounded-2xl border border-slate-100 p-5 overflow-hidden group cursor-default"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 80% 20%, ${color}08 0%, transparent 60%)` }}
      />
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              trend.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
            }`}
          >
            {trend.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {trend.value}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      <p className="text-xs font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">{title}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </motion.div>
  )
}

function VerificationBadge({ status }: { status: string }) {
  const map = {
    verified: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: BadgeCheck, label: 'Verified Seller' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'Pending Verification' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'Verification Failed' },
  }
  const cfg = map[status as keyof typeof map] || map.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  )
}

function MetricBar({ label, value, max = 100, color, suffix = '%' }: {
  label: string; value: number; max?: number; color: string; suffix?: string
}) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className="text-xs font-black text-slate-800">{value}{suffix}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  )
}

function DocCard({
  label, docType, docs, onUpload
}: {
  label: string; docType: string; docs: ApiDocument[]; onUpload: (type: string, file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const doc = getDoc(docs, docType)

  return (
    <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-200 transition-colors bg-slate-50/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        {doc ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <CheckCircle className="h-3 w-3" /> Uploaded
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            <AlertTriangle className="h-3 w-3" /> Required
          </span>
        )}
      </div>
      {doc ? (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 truncate">Document on file</p>
            <button
              onClick={() => window.open(doc.url, '_blank')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 mt-0.5"
            >
              <Eye className="h-3 w-3" /> View
            </button>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            title="Replace"
          >
            <RefreshCw className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
        >
          <Upload className="h-5 w-5 mx-auto text-slate-400 group-hover:text-blue-500 mb-1.5 transition-colors" />
          <p className="text-xs font-semibold text-slate-600">Click to upload</p>
          <p className="text-xs text-slate-400">PDF, JPG, PNG · Max 5MB</p>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={e => e.target.files?.[0] && onUpload(docType, e.target.files[0])}
      />
    </div>
  )
}

// ─── Rental Promotion Banner ────────────────────────────────────────────────
function RentalPromoBanner() {
  const perks = [
    { icon: DollarSign, title: 'Earn More', desc: 'Turn idle inventory into consistent monthly income' },
    { icon: Shield, title: 'Fully Insured', desc: 'Every rental is covered by our protection policy' },
    { icon: Truck, title: 'We Handle Logistics', desc: 'Pickup, delivery & returns managed for you' },
    { icon: BarChart3, title: 'Live Analytics', desc: 'Track earnings, demand & performance in real time' },
  ]
  return (
    <div className="relative rounded-2xl overflow-hidden border border-blue-100">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f2fff] via-[#2874f0] to-[#00c6ff]" />
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      <div className="relative p-6 md:p-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-yellow-300" />
          <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest">New Feature</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
          List Products.<br />Start Earning Today.
        </h2>
        <p className="text-blue-100 text-sm mb-6 max-w-md">
          Join 10,000+ vendors already renting out equipment, appliances, tools & more.
          Zero upfront cost. You set the price.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {perks.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
              <Icon className="h-5 w-5 text-white mb-2" />
              <p className="text-white font-bold text-sm">{title}</p>
              <p className="text-blue-100 text-xs mt-0.5 leading-tight">{desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="/vendor/products/add" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-lg">
            <Package className="h-4 w-4" />
            Add Your First Product
            <ChevronRight className="h-4 w-4" />
          </a>
          <a href="/vendor/how-it-works" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white font-bold rounded-xl text-sm hover:bg-white/25 transition-colors border border-white/30">
            How It Works
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Category spotlight ──────────────────────────────────────────────────────
function CategorySpotlight() {
  const cats = [
    { emoji: '🏗️', name: 'Construction Tools', demand: 'High', earning: '₹2,000–8,000/mo' },
    { emoji: '📸', name: 'Camera & Lenses', demand: 'Very High', earning: '₹3,000–15,000/mo' },
    { emoji: '🎵', name: 'Musical Instruments', demand: 'Medium', earning: '₹1,500–6,000/mo' },
    { emoji: '🏕️', name: 'Camping Gear', demand: 'Seasonal', earning: '₹800–4,000/mo' },
    { emoji: '🖥️', name: 'Electronics & Gadgets', demand: 'High', earning: '₹2,500–12,000/mo' },
    { emoji: '👗', name: 'Designer Wear', demand: 'High', earning: '₹1,000–10,000/mo' },
  ]
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-black text-slate-900 text-lg">Top Rental Categories</h3>
          <p className="text-xs text-slate-500 mt-0.5">Highest demand in your area right now</p>
        </div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Live Demand</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cats.map(c => (
          <motion.div
            key={c.name}
            whileHover={{ scale: 1.02 }}
            className="border border-slate-100 rounded-xl p-3 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
          >
            <span className="text-2xl">{c.emoji}</span>
            <p className="text-sm font-bold text-slate-800 mt-1.5 leading-tight">{c.name}</p>
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                c.demand === 'Very High' ? 'bg-emerald-50 text-emerald-700' :
                c.demand === 'High' ? 'bg-blue-50 text-blue-700' :
                c.demand === 'Seasonal' ? 'bg-amber-50 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>{c.demand}</span>
              <span className="text-xs text-slate-500 font-medium">{c.earning}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Plan comparison ──────────────────────────────────────────────────────────
function SubscriptionCard({ subscription }: { subscription: VendorProfile['subscription'] }) {
  const plans = [
    { id: 'basic', label: 'Basic', color: '#64748b', price: 'Free', features: ['50 products', '100 rentals/mo', 'Standard support'] },
    { id: 'standard', label: 'Standard', color: '#2874f0', price: '₹499/mo', features: ['200 products', '500 rentals/mo', 'Analytics', 'Priority support'] },
    { id: 'premium', label: 'Premium', color: '#9333ea', price: '₹999/mo', features: ['Unlimited products', 'Unlimited rentals', 'Advanced analytics', 'Dedicated manager'] },
  ]
  const currentIdx = plans.findIndex(p => p.id === subscription.plan)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Award className="h-5 w-5 text-purple-500" />
        <h3 className="font-black text-slate-900">Subscription Plan</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {plans.map((plan, i) => {
          const isCurrent = plan.id === subscription.plan
          return (
            <div
              key={plan.id}
              className={`rounded-xl p-4 border-2 transition-all ${
                isCurrent ? 'border-current shadow-lg' : 'border-slate-100 opacity-60'
              }`}
              style={{ borderColor: isCurrent ? plan.color : undefined }}
            >
              {isCurrent && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white mb-2 inline-block" style={{ backgroundColor: plan.color }}>
                  Current
                </span>
              )}
              <p className="font-black text-slate-900">{plan.label}</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: plan.color }}>{plan.price}</p>
              <ul className="mt-3 space-y-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" style={{ color: plan.color }} />
                    {f}
                  </li>
                ))}
              </ul>
              {!isCurrent && i > currentIdx && (
                <button
                  className="w-full mt-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors"
                  style={{ backgroundColor: plan.color }}
                >
                  Upgrade
                </button>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-slate-400 mt-4 text-center">
        Valid until {format(new Date(subscription.validUntil), 'dd MMM yyyy')}
        {subscription.autoRenew ? ' · Auto-renews' : ''}
      </p>
    </div>
  )
}

// ─── Tabs ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: Store },
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'documents', label: 'KYC Docs', icon: Shield },
  { id: 'banking', label: 'Banking', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

type TabId = typeof TABS[number]['id']

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function VendorProfilePage() {
  const { data: session, status } = useSession()
  const toast = useToast()

  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [editForm, setEditForm] = useState<any>({})

  const fetchProfile = useCallback(async () => {
    if (status !== 'authenticated') return
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/profile/me`, { headers })
      const data = await res.json()
      if (data.success) {
        setProfile(data.data.profile)
        setEditForm(data.data.profile)
      }
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [status])

  useEffect(() => { if (status === 'authenticated') fetchProfile() }, [fetchProfile, status])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ business: editForm.business, contact: editForm.contact, addresses: editForm.addresses })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Profile updated')
        setProfile(editForm)
        setIsEditing(false)
        fetchProfile()
      } else toast.error(data.message || 'Update failed')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDocUpload = async (type: string, file: File) => {
    const formData = new FormData()
    formData.append('document', file)
    formData.append('type', type)
    try {
      const { getSession } = await import('next-auth/react')
      const sess = await getSession()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sess?.user?.accessToken}` },
        body: formData
      })
      const data = await res.json()
      if (data.success) { toast.success('Document uploaded'); fetchProfile() }
      else toast.error(data.message || 'Upload failed')
    } catch {
      toast.error('Upload failed')
    }
  }

  // ── Loading / Error states ────────────────────────────────────────────────
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-4 border-[#2874f0] border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-semibold text-slate-500 tracking-wide">Loading your profile…</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl border border-slate-100 p-10 shadow-sm max-w-sm w-full">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Profile Unavailable</h3>
          <p className="text-sm text-slate-500 mt-1 mb-5">We couldn't load your vendor profile.</p>
          <button onClick={fetchProfile} className="px-6 py-2.5 bg-[#2874f0] text-white rounded-xl font-bold text-sm hover:bg-[#1a5fd4] transition-colors">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const addr = profile.addresses.registeredOffice
  const docs = profile.verification.documents || []
  const fullName = `${profile.user.profile.firstName} ${profile.user.profile.lastName}`

  return (
    <div className="min-h-screen bg-[#f4f6fb]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vendor Profile</h1>
              <VerificationBadge status={profile.verification.status} />
            </div>
            <p className="text-sm text-slate-500">
              {profile.vendorId} · Last updated {format(new Date(profile.updatedAt), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => { setIsEditing(false); setEditForm(profile) }}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#2874f0] text-white rounded-xl font-bold text-sm hover:bg-[#1a5fd4] transition-colors shadow-sm shadow-blue-200"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard title="Total Products" value={profile.products?.total ?? profile.stats?.totalProducts ?? 0} icon={Package} color="#2874f0" />
          <StatCard title="Active Listings" value={profile.products?.active ?? 0} icon={Boxes} color="#0891b2" />
          <StatCard title="Total Rentals" value={profile.stats?.totalRentals ?? 0} icon={ShoppingCart} color="#f97316" />
          <StatCard title="Revenue" value={`₹${((profile.stats?.totalRevenue ?? 0) / 1000).toFixed(1)}K`} icon={Wallet} color="#16a34a" />
          <StatCard title="Rating" value={(profile.stats?.averageRating ?? 0).toFixed(1) || '—'} icon={Star} color="#f59e0b" />
          <StatCard title="Commission" value={`${profile.commission?.rate ?? 10}%`} icon={Percent} color="#8b5cf6" sub={profile.commission?.type} />
        </div>

        {/* ── Body Grid ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-5">

            {/* Identity card */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-[#2874f0] to-[#0ea5e9] relative">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }}
                />
              </div>
              <div className="px-5 pb-5">
                <div className="relative -mt-10 mb-3 flex items-end justify-between">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl ring-4 ring-white bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-md overflow-hidden">
                      {profile.user?.profile?.avatar
                        ? <img src={profile.user.profile.avatar} alt="" className="w-full h-full object-cover" />
                        : <span className="text-3xl font-black text-slate-500">{profile.user.profile.firstName[0]}</span>
                      }
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2874f0] rounded-lg flex items-center justify-center shadow-md hover:bg-[#1a5fd4] transition-colors">
                      <Camera className="h-3 w-3 text-white" />
                    </button>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    profile.status.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {profile.status.isActive ? '● Active' : '● Inactive'}
                  </div>
                </div>
                <h2 className="font-black text-slate-900 text-xl leading-tight">{profile.business.name}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{fullName}</p>

                <div className="mt-4 space-y-2.5">
                  {[
                    { icon: Mail, val: profile.user.email },
                    { icon: Phone, val: profile.contact.primaryPhone },
                    { icon: MapPin, val: `${addr?.city}, ${addr?.state}` },
                    { icon: Calendar, val: `Since ${format(new Date(profile.createdAt), 'MMM yyyy')}` },
                  ].map(({ icon: Icon, val }) => (
                    <div key={val} className="flex items-center gap-2.5 text-sm">
                      <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-600 truncate">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 rounded-xl p-2.5">
                    <p className="text-lg font-black text-slate-900">{profile.products?.rented ?? 0}</p>
                    <p className="text-xs text-slate-500 font-semibold">Rented Out</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5">
                    <p className="text-lg font-black text-slate-900">{profile.products?.available ?? 0}</p>
                    <p className="text-xs text-slate-500 font-semibold">Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#2874f0]" />
                Performance
              </h3>
              <div className="space-y-4">
                <MetricBar label="On-Time Delivery" value={profile.performance?.metrics?.onTimeDelivery ?? 0} color="#16a34a" />
                <MetricBar label="Response Rate" value={profile.performance?.metrics?.responseRate ?? 0} color="#2874f0" />
                <MetricBar label="Fulfillment Rate" value={profile.performance?.metrics?.fulfillmentRate ?? 0} color="#f97316" />
                <MetricBar label="Customer Satisfaction" value={profile.performance?.metrics?.customerSatisfaction ?? 0} color="#8b5cf6" />
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Overall Rating</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(profile.performance?.rating?.average ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span className="font-black text-slate-900">{(profile.performance?.rating?.average ?? 0).toFixed(1)}</span>
                  <span className="text-slate-400 text-xs">({profile.performance?.rating?.count ?? 0})</span>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Quick Actions
              </h3>
              <div className="space-y-1">
                {[
                  { href: '/vendor/products/add', icon: Package, label: 'Add New Product', color: '#2874f0' },
                  { href: '/vendor/rentals', icon: ShoppingCart, label: 'View Rentals', color: '#16a34a' },
                  { href: '/vendor/payments', icon: Wallet, label: 'Payments & Payouts', color: '#8b5cf6' },
                  { href: '/vendor/analytics', icon: BarChart3, label: 'Analytics Dashboard', color: '#f97316' },
                ].map(({ href, icon: Icon, label, color }) => (
                  <a
                    key={href}
                    href={href}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 flex-1">{label}</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Main Content ────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-5">

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-100 p-1.5 flex gap-1 overflow-x-auto">
              {TABS.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-1 justify-center ${
                      active ? 'bg-[#2874f0] text-white shadow-sm shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              {/* ── Overview ───────────────────────────────────────────────── */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
                  {/* Show promo if no products yet */}
                  {(profile.products?.total ?? 0) === 0 && <RentalPromoBanner />}

                  <CategorySpotlight />

                  {/* Address + Support */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                      <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#2874f0]" />
                        Registered Address
                      </h3>
                      <div className="space-y-1 text-sm text-slate-600 leading-relaxed">
                        <p className="font-semibold text-slate-800">{addr?.addressLine1}</p>
                        <p>{addr?.city}, {addr?.state}</p>
                        <p>PIN: {addr?.pincode}</p>
                        <p>{addr?.country}</p>
                        <div className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          addr?.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {addr?.isVerified ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {addr?.isVerified ? 'Address Verified' : 'Verification Pending'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                      <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-[#2874f0]" />
                        Serviceable Areas
                      </h3>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cities</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {profile.addresses.serviceableCities?.length > 0
                            ? profile.addresses.serviceableCities.map(c => (
                              <span key={c._id} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                c.isActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500 line-through'
                              }`}>
                                {c.city}
                              </span>
                            ))
                            : <span className="text-xs text-slate-400">No cities added yet</span>
                          }
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pincodes</p>
                        <p className="text-xs text-slate-400">
                          {profile.addresses.serviceablePincodes?.length > 0
                            ? profile.addresses.serviceablePincodes.join(', ')
                            : 'No pincodes specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <SubscriptionCard subscription={profile.subscription} />

                  {/* How renting works — static educational */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h3 className="font-black text-slate-900 mb-1">How Renting Out Works</h3>
                    <p className="text-sm text-slate-500 mb-5">Get started in 4 simple steps</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { step: '01', icon: Package, title: 'List Your Items', desc: 'Add photos, description & set your rental price per day/week/month', color: '#2874f0' },
                        { step: '02', icon: Bell, title: 'Receive Requests', desc: 'Get notified when customers book. Review and confirm in one click', color: '#0891b2' },
                        { step: '03', icon: Truck, title: 'Deliver or Hand Over', desc: 'Ship or hand-deliver the item. Mark as dispatched in the app', color: '#16a34a' },
                        { step: '04', icon: Wallet, title: 'Get Paid', desc: 'Payment released to your bank account after successful rental', color: '#8b5cf6' },
                      ].map(s => (
                        <div key={s.step} className="relative">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${s.color}15` }}>
                            <s.icon className="h-4 w-4" style={{ color: s.color }} />
                          </div>
                          <span className="absolute top-0 right-0 text-xs font-black text-slate-200">{s.step}</span>
                          <p className="font-bold text-slate-900 text-sm">{s.title}</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Business ───────────────────────────────────────────────── */}
              {activeTab === 'business' && (
                <motion.div key="business" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { label: 'Business Name', key: 'name', path: 'business', value: profile.business.name },
                        { label: 'GSTIN', key: 'gstin', path: 'business', value: profile.business.gstin || 'Not provided' },
                        { label: 'PAN Number', key: 'panNumber', path: 'business', value: profile.business.panNumber ? `XXXXX${profile.business.panNumber.slice(-4)}` : 'Not provided' },
                        { label: 'Support Email', key: 'supportEmail', path: 'contact', value: profile.contact.supportEmail || profile.contact.primaryEmail },
                        { label: 'Website', key: 'website', path: 'business', value: profile.business.website || 'Not provided' },
                        { label: 'Year Established', key: 'yearEstablished', path: 'business', value: profile.business.yearEstablished?.toString() || 'Not specified' },
                      ].map(({ label, key, path, value }) => (
                        <div key={key}>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                          {isEditing ? (
                            <input
                              type="text"
                              defaultValue={(profile as any)[path]?.[key] ?? ''}
                              onChange={e => setEditForm((f: any) => ({
                                ...f,
                                [path]: { ...(f[path] ?? {}), [key]: e.target.value }
                              }))}
                              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0]"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-slate-800 py-2.5">{value}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">Business Description</label>
                      {isEditing ? (
                        <textarea
                          defaultValue={profile.business.description || ''}
                          onChange={e => setEditForm((f: any) => ({ ...f, business: { ...(f.business ?? {}), description: e.target.value } }))}
                          rows={4}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0] resize-none"
                          placeholder="Tell customers about your business, what you offer, and why they should rent from you…"
                        />
                      ) : (
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {profile.business.description || (
                            <span className="italic text-slate-400">No description yet. Click Edit Profile to add one — businesses with descriptions get 3× more inquiries.</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Documents ──────────────────────────────────────────────── */}
              {activeTab === 'documents' && (
                <motion.div key="documents" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
                  {profile.verification.status === 'verified' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                      <BadgeCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-emerald-800 text-sm">KYC Verified</p>
                        <p className="text-xs text-emerald-600">Verified on {profile.verification.verifiedAt ? format(new Date(profile.verification.verifiedAt), 'dd MMM yyyy') : '—'}</p>
                      </div>
                    </div>
                  )}
                  {profile.verification.status === 'pending' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                      <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-bold text-amber-800 text-sm">Verification Under Review</p>
                        <p className="text-xs text-amber-600">Documents are being reviewed. Usually takes 1–2 business days.</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h3 className="font-black text-slate-900 mb-1 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#2874f0]" />
                      KYC Documents
                    </h3>
                    <p className="text-xs text-slate-500 mb-5">Required for verification and payouts</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DocCard label="GST Certificate" docType="gst_certificate" docs={docs} onUpload={handleDocUpload} />
                      <DocCard label="PAN Card" docType="pan_card" docs={docs} onUpload={handleDocUpload} />
                      <DocCard label="Business Registration" docType="business_registration" docs={docs} onUpload={handleDocUpload} />
                      <DocCard label="Address Proof" docType="address_proof" docs={docs} onUpload={handleDocUpload} />
                      <DocCard label="Bank Statement" docType="bank_statement" docs={docs} onUpload={handleDocUpload} />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500 leading-relaxed">
                        All documents are encrypted and stored securely. We use bank-grade 256-bit SSL encryption.
                        Your documents are only used for identity verification and are never shared with third parties.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Banking ────────────────────────────────────────────────── */}
              {activeTab === 'banking' && (
                <motion.div key="banking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
                  <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-black text-slate-900 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-[#2874f0]" />
                          Bank Account
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Payouts are sent to this account</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        profile.bankDetails?.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {profile.bankDetails?.verified ? '✓ Verified' : '⏳ Unverified'}
                      </span>
                    </div>

                    {profile.bankDetails ? (
                      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-16 translate-x-16" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-10 -translate-x-10" />
                        <div className="relative">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Account Holder</p>
                          <p className="text-xl font-black">{profile.bankDetails.accountHolderName}</p>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-slate-400">Bank</p>
                              <p className="text-sm font-bold">{profile.bankDetails.bankName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Branch</p>
                              <p className="text-sm font-bold">{profile.bankDetails.branchName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">IFSC Code</p>
                              <p className="text-sm font-mono font-bold">{profile.bankDetails.ifscCode}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Account Type</p>
                              <p className="text-sm font-bold capitalize">{profile.bankDetails.accountType}</p>
                            </div>
                          </div>
                          {profile.bankDetails.upiId && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <p className="text-xs text-slate-400">UPI ID</p>
                              <p className="text-sm font-mono font-bold">{profile.bankDetails.upiId}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                        <CreditCard className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                        <p className="font-bold text-slate-700">No bank account linked</p>
                        <p className="text-sm text-slate-500 mt-1 mb-4">Add your bank details to receive payouts</p>
                        <button className="px-5 py-2.5 bg-[#2874f0] text-white rounded-xl font-bold text-sm hover:bg-[#1a5fd4] transition-colors">
                          Add Bank Account
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Pending Payout', value: `₹${profile.payments?.pending ?? 0}`, icon: Clock, color: '#f97316' },
                      { label: 'Total Paid Out', value: `₹${profile.payments?.paid ?? 0}`, icon: CheckCircle, color: '#16a34a' },
                      { label: 'Payout Schedule', value: profile.payments?.payoutSchedule ?? 'Weekly', icon: Calendar, color: '#2874f0' },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
                        <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                          <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                        <p className="font-black text-slate-900">{value}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Settings ───────────────────────────────────────────────── */}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
                  <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h3 className="font-black text-slate-900 mb-5 flex items-center gap-2">
                      <Settings className="h-4 w-4 text-[#2874f0]" />
                      Rental Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { label: 'Advance Notice Required', value: `${profile.settings?.advanceNotice ?? 24} hours`, icon: Clock },
                        { label: 'Min Rental Duration', value: `${profile.settings?.minRentalDuration ?? 3} months`, icon: Calendar },
                        { label: 'Max Rental Duration', value: `${profile.settings?.maxRentalDuration ?? 12} months`, icon: Calendar },
                        { label: 'Cancellation Policy', value: profile.settings?.cancellationPolicy ?? 'Moderate', icon: Tag },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</p>
                            <p className="text-sm font-bold text-slate-900 capitalize mt-0.5">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Toggles */}
                    <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
                      {[
                        { key: 'autoConfirmBookings', label: 'Auto-confirm Bookings', desc: 'Automatically confirm rental requests without manual review' },
                        { key: 'instantBooking', label: 'Instant Booking', desc: 'Allow customers to book immediately without approval' },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{label}</p>
                            <p className="text-xs text-slate-500">{desc}</p>
                          </div>
                          <div className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                            (profile.settings as any)?.[key] ? 'bg-[#2874f0]' : 'bg-slate-200'
                          }`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                              (profile.settings as any)?.[key] ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h3 className="font-black text-slate-900 mb-5 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-[#2874f0]" />
                      Notification Preferences
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'newRentals', label: 'New Rental Requests', desc: 'Get notified when a customer places a rental order' },
                        { key: 'cancellations', label: 'Cancellations', desc: 'Alert when a customer cancels their booking' },
                        { key: 'payments', label: 'Payment Updates', desc: 'Notifications on payouts and payment status' },
                        { key: 'reviews', label: 'Customer Reviews', desc: 'Get alerted when you receive a new review' },
                        { key: 'dailyDigest', label: 'Daily Summary Digest', desc: 'A daily email summary of your account activity' },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{label}</p>
                            <p className="text-xs text-slate-500">{desc}</p>
                          </div>
                          <div className={`relative w-11 h-6 rounded-full transition-colors ${
                            (profile.settings?.notificationPreferences as any)?.[key] ? 'bg-[#2874f0]' : 'bg-slate-200'
                          }`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                              (profile.settings?.notificationPreferences as any)?.[key] ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                    {isEditing && (
                      <p className="text-xs text-slate-400 mt-4 italic">Click save to apply notification changes.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}