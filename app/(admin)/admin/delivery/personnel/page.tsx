
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Search, Plus, Eye, Edit, Trash2,
  Phone, Mail, MapPin, Clock, Star, Package,
  Shield, CheckCircle, XCircle, AlertCircle,
  ChevronLeft, ChevronRight, Truck, UserPlus,
  Activity, BarChart3, RefreshCw, TrendingUp,
  Bike, Car, Navigation, Loader2, ChevronDown,
  SlidersHorizontal, Award, Zap, MoreHorizontal
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'

// ─── Config ─────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const api = axios.create({ baseURL: BASE_URL, withCredentials: true })
api.interceptors.request.use(async (config) => {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  if ((session as any)?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${(session as any).user.accessToken}`
  }
  return config
})

// ─── Types ───────────────────────────────────────────────────────────────────

interface DeliveryPerson {
  _id: string
  employeeId: string
  user: {
    _id: string
    email: string
    phone: string
    profile: { firstName: string; lastName: string; avatar?: string | null }
  }
  vehicle: { type: string; number: string; model: string; registrationNumber?: string }
  zone: string
  serviceablePincodes: string[]
  availability: {
    isAvailable: boolean
    isOnDuty: boolean
    currentLocation?: { coordinates: number[] }
    shifts?: { start: string; end: string; workingDays: string[] }
  }
  performance: {
    totalDeliveries: number
    completedDeliveries: number
    failedDeliveries: number
    cancelledDeliveries?: number
    averageRating: number
    onTimeRate: number
    totalDistance: number
    totalEarnings: number
  }
  bankDetails?: {
    accountHolderName?: string
    bankName?: string
    upiId?: string
  }
  maxConcurrentDeliveries?: number
  status: { isActive: boolean; isVerified?: boolean; verificationStatus: string }
  documents: Array<{ type: string; verified: boolean; url: string }>
  currentAssignments: Array<{ delivery: string; status: string }>
  metadata?: { hiredAt?: string }
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const vehicleIcon = (type: string) => {
  const icons: Record<string, string> = {
    bike: '🏍️', scooter: '🛵', car: '🚗', van: '🚐', truck: '🚚'
  }
  return icons[type.toLowerCase()] ?? '🚗'
}

const zoneColor = (zone: string): { bg: string; text: string; dot: string } => {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    north:   { bg: 'bg-sky-50',     text: 'text-sky-700',    dot: '#0ea5e9' },
    south:   { bg: 'bg-emerald-50', text: 'text-emerald-700',dot: '#10b981' },
    east:    { bg: 'bg-violet-50',  text: 'text-violet-700', dot: '#8b5cf6' },
    west:    { bg: 'bg-rose-50',    text: 'text-rose-700',   dot: '#f43f5e' },
    central: { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: '#f59e0b' },
  }
  return map[zone.toLowerCase()] ?? { bg: 'bg-slate-50', text: 'text-slate-700', dot: '#64748b' }
}

const initials = (p: DeliveryPerson) =>
  `${p.user.profile.firstName.charAt(0)}${p.user.profile.lastName.charAt(0)}`.toUpperCase()

const avatarGradient = (id: string) => {
  const gradients = [
    'from-indigo-500 to-violet-600',
    'from-rose-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-sky-500 to-blue-600',
  ]
  return gradients[id.charCodeAt(id.length - 1) % gradients.length]
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, gradient, trend,
}: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; gradient: string; trend?: number
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-slate-100 p-5 overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      {/* ambient */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className="flex items-start justify-between relative">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend !== undefined && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-3 tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {value}
      </p>
      <p className="text-[12px] text-slate-500 mt-0.5 font-medium">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
    verified: { label: 'Verified',  cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', icon: CheckCircle },
    pending:  { label: 'Pending KYC', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',    icon: Clock },
    rejected: { label: 'Rejected',  cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',        icon: XCircle },
  }
  const c = cfg[status] ?? cfg.pending
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${c.cls}`}>
      <Icon className="h-2.5 w-2.5" />
      {c.label}
    </span>
  )
}

function AvailabilityDot({ person }: { person: DeliveryPerson }) {
  if (person.availability.isAvailable && person.availability.isOnDuty)
    return <span className="flex items-center gap-1 text-[10.5px] font-medium text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />Available</span>
  if (person.availability.isOnDuty)
    return <span className="flex items-center gap-1 text-[10.5px] font-medium text-amber-600"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />On Duty</span>
  return <span className="flex items-center gap-1 text-[10.5px] font-medium text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />Off Duty</span>
}

function RatingBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  const color = value >= 4.5 ? '#10b981' : value >= 4 ? '#f59e0b' : '#f87171'
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-semibold" style={{ color }}>{value > 0 ? value.toFixed(1) : '—'}</span>
    </div>
  )
}

function PersonCard({
  person, onView, onEdit, onDelete,
}: {
  person: DeliveryPerson
  onView: (p: DeliveryPerson) => void
  onEdit: (p: DeliveryPerson) => void
  onDelete: (p: DeliveryPerson) => void
}) {
  const zc = zoneColor(person.zone)

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Top accent stripe */}
      <div className={`h-1 w-full bg-gradient-to-r ${avatarGradient(person._id)}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarGradient(person._id)} flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0`}>
            {initials(person)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 text-[15px] truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {person.user.profile.firstName} {person.user.profile.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <code className="text-[10.5px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded">
                    {person.employeeId}
                  </code>
                  <AvailabilityDot person={person} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onView(person)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                  title="View"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onEdit(person)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Edit"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(person)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <StatusBadge status={person.status.verificationStatus} />
          <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${zc.bg} ${zc.text}`}>
            {person.zone.charAt(0).toUpperCase() + person.zone.slice(1)} Zone
          </span>
          <span className="text-[10.5px] text-slate-500 flex items-center gap-0.5">
            {vehicleIcon(person.vehicle.type)} {person.vehicle.model || person.vehicle.type}
          </span>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-4 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1.5 min-w-0">
            <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <span className="text-[11.5px] text-slate-600 truncate">{person.user.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <span className="text-[11.5px] text-slate-600 truncate">{person.user.email}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <span className="text-[11.5px] text-slate-500 truncate">
              {person.serviceablePincodes.slice(0, 2).join(', ')}
              {person.serviceablePincodes.length > 2 && ` +${person.serviceablePincodes.length - 2}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Truck className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <span className="text-[11.5px] font-mono text-slate-500 truncate">{person.vehicle.number}</span>
          </div>
        </div>

        {/* Performance metrics */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-50">
          <div className="text-center p-2 rounded-xl bg-slate-50">
            <p className="text-[15px] font-bold text-slate-900">{person.performance.completedDeliveries}</p>
            <p className="text-[9.5px] text-slate-500 mt-0.5 font-medium uppercase tracking-wide">Done</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-slate-50">
            <p className="text-[15px] font-bold text-slate-900">
              {person.performance.onTimeRate > 0 ? `${person.performance.onTimeRate.toFixed(0)}%` : '—'}
            </p>
            <p className="text-[9.5px] text-slate-500 mt-0.5 font-medium uppercase tracking-wide">On-time</p>
          </div>
          <div className="text-center p-2 rounded-xl bg-slate-50">
            <p className="text-[15px] font-bold text-slate-900">
              {person.performance.totalEarnings > 0 ? `₹${(person.performance.totalEarnings / 1000).toFixed(1)}k` : '₹0'}
            </p>
            <p className="text-[9.5px] text-slate-500 mt-0.5 font-medium uppercase tracking-wide">Earned</p>
          </div>
        </div>

        {/* Rating bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] text-slate-400 font-medium">Performance Rating</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className={`h-2.5 w-2.5 ${i <= Math.round(person.performance.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
                />
              ))}
            </div>
          </div>
          <RatingBar value={person.performance.averageRating} />
        </div>

        {/* Active deliveries */}
        {person.currentAssignments.length > 0 && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11.5px] text-indigo-700 font-medium">
              {person.currentAssignments.length} active delivery in progress
            </span>
          </div>
        )}

        {/* Shift info */}
        {person.availability.shifts && (
          <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-slate-400">
            <Clock className="h-3 w-3" />
            <span>{person.availability.shifts.start} – {person.availability.shifts.end}</span>
            <span className="mx-1">·</span>
            <span className="capitalize">{person.availability.shifts.workingDays.slice(0, 3).join(', ')}{person.availability.shifts.workingDays.length > 3 && '…'}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Zone bar chart ──────────────────────────────────────────────────────────

function ZoneBar({ persons }: { persons: DeliveryPerson[] }) {
  const zones = ['north', 'south', 'east', 'west', 'central']
  const counts = zones.map(z => ({
    zone: z,
    count: persons.filter(p => p.zone.toLowerCase() === z).length,
  })).filter(z => z.count > 0)
  const max = Math.max(...counts.map(c => c.count), 1)

  return (
    <div className="space-y-2.5">
      {counts.map(({ zone, count }) => {
        const zc = zoneColor(zone)
        return (
          <div key={zone}>
            <div className="flex justify-between text-[12px] mb-1">
              <span className="font-medium text-slate-700 capitalize">{zone} Zone</span>
              <span className="text-slate-400">{count} {count === 1 ? 'person' : 'people'}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(count / max) * 100}%`, background: zc.dot }}
              />
            </div>
          </div>
        )
      })}
      {counts.length === 0 && <p className="text-[12px] text-slate-400 text-center py-4">No data yet</p>}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DeliveryPersonnelListPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const toast = useToast()

  const [persons, setPersons] = useState<DeliveryPerson[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterZone, setFilterZone] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPersons = useCallback(async (page = 1, showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    else setIsLoading(true)
    try {
      const res = await api.get('/api/v1/delivery-personnel/persons', {
        params: { page, limit: 20 },
      })
      const { persons: data, pagination: pg } = res.data.data
      setPersons(data)
      setPagination(pg)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load delivery personnel'
      toast.error(msg)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchPersons(1) }, [fetchPersons])

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.push('/admin/login')
  }, [sessionStatus, router])

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = persons.filter(p => {
    const name = `${p.user.profile.firstName} ${p.user.profile.lastName}`.toLowerCase()
    const matchSearch =
      name.includes(searchTerm.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user.phone.includes(searchTerm) ||
      p.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchZone = filterZone === 'all' || p.zone.toLowerCase() === filterZone.toLowerCase()
    const matchStatus = filterStatus === 'all' || p.status.verificationStatus === filterStatus
    return matchSearch && matchZone && matchStatus
  })

  const ITEMS = 6
  const paginated = filtered.slice((currentPage - 1) * ITEMS, currentPage * ITEMS)
  const totalPages = Math.ceil(filtered.length / ITEMS)

  const stats = {
    total: persons.length,
    active: persons.filter(p => p.availability.isAvailable && p.availability.isOnDuty).length,
    verified: persons.filter(p => p.status.verificationStatus === 'verified').length,
    pending: persons.filter(p => p.status.verificationStatus === 'pending').length,
    avgRating: persons.length
      ? (persons.reduce((s, p) => s + p.performance.averageRating, 0) / persons.length).toFixed(1)
      : '0.0',
    totalDeliveries: persons.reduce((s, p) => s + p.performance.completedDeliveries, 0),
  }

  const handleDelete = async (p: DeliveryPerson) => {
    if (!confirm(`Remove ${p.user.profile.firstName} ${p.user.profile.lastName}? This cannot be undone.`)) return
    try {
      await api.delete(`/api/v1/delivery-personnel/persons/${p._id}`)
      toast.success('Delivery person removed')
      fetchPersons(1)
    } catch {
      toast.error('Failed to remove delivery person')
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 40%, #faf5ff 100%)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-[13px] text-slate-400 font-medium">Loading personnel…</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #f8faff 0%, #f0f4ff 40%, #faf5ff 100%)",
        fontFamily: "'DM Sans', 'Inter', sans-serif",
      }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #6366f1, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-10 space-y-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-4">
            <Link
              href="/admin"
              className="hover:text-indigo-600 transition-colors"
            >
              Admin
            </Link>
            <span>/</span>
            <Link
              href="/admin/delivery"
              className="hover:text-indigo-600 transition-colors"
            >
              Delivery
            </Link>
            <span>/</span>
            <span className="text-indigo-600 font-medium">Personnel</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <h1
                className="text-[28px] font-bold text-slate-900 tracking-tight leading-none"
                style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
              >
                Delivery Personnel
              </h1>
              <p className="text-[13px] text-slate-400 mt-1.5">
                Manage your fleet · track performance · verify compliance
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => fetchPersons(1, true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[13px] text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-500" : ""}`}
                />
                Refresh
              </button>
              <Link
                href="/admin/delivery/personnel/create"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  boxShadow: "0 6px 20px -4px rgba(99,102,241,0.45)",
                }}
              >
                <UserPlus className="h-4 w-4" />
                Add Personnel
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Total Personnel"
            value={stats.total}
            icon={Users}
            gradient="from-indigo-500 to-violet-600"
            trend={12}
          />
          <StatCard
            label="Active Now"
            value={stats.active}
            icon={Zap}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            label="KYC Verified"
            value={stats.verified}
            icon={Shield}
            gradient="from-sky-500 to-blue-600"
          />
          <StatCard
            label="Pending Approval"
            value={stats.pending}
            icon={Clock}
            gradient="from-amber-500 to-orange-600"
          />
          <StatCard
            label="Avg. Rating"
            value={`${stats.avgRating}★`}
            icon={Star}
            gradient="from-rose-500 to-pink-600"
          />
          <StatCard
            label="Total Deliveries"
            value={stats.totalDeliveries}
            icon={Package}
            gradient="from-violet-500 to-purple-600"
          />
        </div>

        {/* ── Zone distribution + Quick insight ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[14px] font-semibold text-slate-800">
                  Zone Distribution
                </h3>
                <p className="text-[11.5px] text-slate-400 mt-0.5">
                  Personnel spread across service zones
                </p>
              </div>
              <BarChart3
                className="h-4.5 w-4.5 text-slate-300"
                style={{ width: 18, height: 18 }}
              />
            </div>
            <ZoneBar persons={persons} />
          </div>

          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-200">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 70% 30%, white 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <Award className="h-8 w-8 text-indigo-200 mb-4" />
            <h3 className="text-[15px] font-bold mb-1">Fleet Health</h3>
            <p className="text-[12px] text-indigo-200 leading-relaxed">
              {stats.verified > 0
                ? `${Math.round((stats.verified / Math.max(stats.total, 1)) * 100)}% of your team is fully KYC verified.`
                : "No verified personnel yet."}{" "}
              Verified riders get priority assignments & higher-value
              deliveries.
            </p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between text-[11px] text-indigo-200 mb-1.5">
                <span>Verification progress</span>
                <span>
                  {stats.verified}/{stats.total}
                </span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{
                    width: `${stats.total > 0 ? (stats.verified / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, ID, phone, or email…"
                className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:bg-white focus:shadow-sm focus:shadow-indigo-100 transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="flex gap-2.5">
              <div className="relative">
                <select
                  value={filterZone}
                  onChange={(e) => {
                    setFilterZone(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-3.5 pr-8 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700"
                >
                  <option value="all">All Zones</option>
                  {["north", "south", "east", "west", "central"].map((z) => (
                    <option key={z} value={z} className="capitalize">
                      {z.charAt(0).toUpperCase() + z.slice(1)} Zone
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-3.5 pr-8 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>

              {(searchTerm ||
                filterZone !== "all" ||
                filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterZone("all");
                    setFilterStatus("all");
                    setCurrentPage(1);
                  }}
                  className="px-3.5 py-2.5 text-[13px] text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl border border-slate-200 transition-all font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {filtered.length !== persons.length && (
            <p className="text-[11.5px] text-indigo-600 mt-2.5 font-medium">
              Showing {filtered.length} of {persons.length} personnel
            </p>
          )}
        </div>

        {/* ── Grid / Empty ────────────────────────────────────────────────── */}
        {paginated.length === 0 ? (
          <div className="bg-white/80 rounded-2xl border border-slate-100 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-700">
              {persons.length === 0
                ? "No personnel onboarded yet"
                : "No results match your filters"}
            </h3>
            <p className="text-[12.5px] text-slate-400 mt-1.5 max-w-xs mx-auto">
              {persons.length === 0
                ? "Start by adding your first delivery partner to the fleet."
                : "Try clearing the search or changing the filter options."}
            </p>
            {persons.length === 0 ? (
              <Link
                href="/admin/delivery/personnel/create"
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  boxShadow: "0 4px 14px -4px rgba(99,102,241,0.5)",
                }}
              >
                <UserPlus className="h-4 w-4" />
                Add First Personnel
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterZone("all");
                  setFilterStatus("all");
                }}
                className="mt-4 text-[13px] text-indigo-600 hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((person) => (
              <PersonCard
                key={person._id}
                person={person}
                onView={(p) =>
                  router.push(`/admin/delivery/personnel/${p._id}`)
                }
                onEdit={(p) =>
                  router.push(`/admin/delivery/personnel/${p._id}/edit`)
                }
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm px-5 py-3.5">
            <p className="text-[12.5px] text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {(currentPage - 1) * ITEMS + 1}
              </span>
              –
              <span className="font-semibold text-slate-700">
                {Math.min(currentPage * ITEMS, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {filtered.length}
              </span>{" "}
              personnel
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              {/* {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pg = currentPage - 2 + i
                if (pg < 1) pg = i + 1
                if (pg > totalPages) return null
                return (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-lg text-[12.5px] font-semibold transition-all ${
                      currentPage === pg
                        ? 'text-white shadow-md shadow-indigo-200'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    style={currentPage === pg ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' } : {}}
                  >
                    {pg}
                  </button>
                )
              })} */}

              {(() => {
                let startPage = Math.max(currentPage - 2, 1);
                let endPage = Math.min(startPage + 4, totalPages);

                // adjust start if near end
                if (endPage - startPage < 4) {
                  startPage = Math.max(endPage - 4, 1);
                }

                return Array.from(
                  { length: endPage - startPage + 1 },
                  (_, i) => startPage + i,
                ).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-lg text-[12.5px] font-semibold transition-all ${
                      currentPage === pg
                        ? "text-white shadow-md shadow-indigo-200"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                    style={
                      currentPage === pg
                        ? {
                            background:
                              "linear-gradient(135deg, #4f46e5, #7c3aed)",
                          }
                        : {}
                    }
                  >
                    {pg}
                  </button>
                ));
              })()}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}

        {/* ── Pro tip ────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-4 px-6 py-4 bg-white/80 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-100">
            <Award
              className="h-4.5 w-4.5 text-white"
              style={{ width: 18, height: 18 }}
            />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-800">
              Fleet Performance Tip
            </p>
            <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
              Personnel with complete KYC verification receive{" "}
              <strong className="text-slate-700">
                priority delivery assignments
              </strong>{" "}
              and access to high-value orders. Encourage your team to submit all
              required documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}