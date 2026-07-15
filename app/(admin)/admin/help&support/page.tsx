// app/(admin)/admin/help&support/page.tsx
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LifeBuoy,
  MessageSquare,
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Send,
  X,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  RefreshCw,
  User,
  Building2,
  DollarSign,
  Settings,
  Shield,
  Zap,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Timer,
  Gauge,
  Inbox,
  Truck,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import {
  supportApi,
  personName,
  type SupportTicket,
  type DashboardStats,
  type TicketStatus,
  type TicketPriority,
  type TicketType,
} from '@/lib/api/support'

/* ────────────────────────────────────────────────────────────────────────── */
/*                              Presentation config                            */
/* ────────────────────────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; text: string; bg: string; ring: string; icon: any }
> = {
  open: { label: 'Open', text: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-200', icon: Inbox },
  assigned: { label: 'Assigned', text: 'text-violet-700', bg: 'bg-violet-50', ring: 'ring-violet-200', icon: User },
  in_progress: { label: 'In Progress', text: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200', icon: Clock },
  pending: { label: 'Pending', text: 'text-orange-700', bg: 'bg-orange-50', ring: 'ring-orange-200', icon: Timer },
  resolved: { label: 'Resolved', text: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200', icon: CheckCircle2 },
  closed: { label: 'Closed', text: 'text-slate-600', bg: 'bg-slate-100', ring: 'ring-slate-200', icon: XCircle },
  reopened: { label: 'Reopened', text: 'text-rose-700', bg: 'bg-rose-50', ring: 'ring-rose-200', icon: AlertCircle },
  escalated: { label: 'Escalated', text: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-200', icon: ShieldAlert },
}

const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; text: string; bg: string; dot: string; bar: string }
> = {
  low: { label: 'Low', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  medium: { label: 'Medium', text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500', bar: 'bg-blue-500' },
  high: { label: 'High', text: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500', bar: 'bg-orange-500' },
  urgent: { label: 'Urgent', text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500', bar: 'bg-red-500' },
  critical: { label: 'Critical', text: 'text-purple-700', bg: 'bg-purple-50', dot: 'bg-purple-500', bar: 'bg-purple-500' },
}

const TYPE_CONFIG: Record<TicketType, { label: string; icon: any }> = {
  user_issue: { label: 'User Issue', icon: User },
  vendor_issue: { label: 'Vendor Issue', icon: Building2 },
  rental_dispute: { label: 'Rental Dispute', icon: Truck },
  payment_dispute: { label: 'Payment Dispute', icon: DollarSign },
  technical_issue: { label: 'Technical Issue', icon: Settings },
  content_moderation: { label: 'Content Moderation', icon: Shield },
  account_issue: { label: 'Account Issue', icon: User },
  feature_request: { label: 'Feature Request', icon: Zap },
  complaint: { label: 'Complaint', icon: AlertCircle },
  other: { label: 'Other', icon: HelpCircle },
}

const STATUS_OPTIONS: TicketStatus[] = [
  'open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'reopened', 'escalated',
]
const PRIORITY_OPTIONS: TicketPriority[] = ['low', 'medium', 'high', 'urgent', 'critical']
const TYPE_OPTIONS = Object.keys(TYPE_CONFIG) as TicketType[]

/* ────────────────────────────────────────────────────────────────────────── */
/*                                Small helpers                                */
/* ────────────────────────────────────────────────────────────────────────── */

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cfg.bg} ${cfg.text} ${cfg.ring}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function TypeBadge({ type }: { type: TicketType }) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.other
  const Icon = cfg.icon
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*                                  KPI cards                                  */
/* ────────────────────────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  gradient,
  accent,
  delay,
}: {
  label: string
  value: number | string
  suffix?: string
  icon: any
  gradient: string
  accent: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 ${gradient}`} />
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
        {suffix ? <span className="ml-1 text-base font-semibold text-slate-400">{suffix}</span> : null}
      </p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </motion.div>
  )
}

function StatsRow({ stats, loading }: { stats: DashboardStats | null; loading: boolean }) {
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[132px] rounded-2xl" />
        ))}
      </div>
    )
  }
  if (!stats) return null
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Open Tickets" value={stats.open} icon={Inbox} gradient="bg-blue-500" accent="bg-blue-50 text-blue-600" delay={0.02} />
      <StatCard label="Pending Review" value={stats.pending} icon={Timer} gradient="bg-orange-500" accent="bg-orange-50 text-orange-600" delay={0.06} />
      <StatCard label="Resolved Today" value={stats.resolvedToday} icon={CheckCircle2} gradient="bg-emerald-500" accent="bg-emerald-50 text-emerald-600" delay={0.1} />
      <StatCard label="Avg. Response" value={stats.avgResponseHours} suffix="h" icon={Gauge} gradient="bg-violet-500" accent="bg-violet-50 text-violet-600" delay={0.14} />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*                              Knowledge base data                            */
/* ────────────────────────────────────────────────────────────────────────── */

const KB_ARTICLES = [
  { id: 1, title: 'How to reset an account password', category: 'Account', views: 1234, helpful: 98, content: 'Walk users through the secure password-reset flow: request a reset link from the login screen, follow the emailed one-time link (valid for 1 hour), and set a new password that meets the strength policy.' },
  { id: 2, title: 'Understanding rental terms & conditions', category: 'Rentals', views: 892, helpful: 95, content: 'A breakdown of rental tenure, security deposits, damage policies, and auto-renewal rules so agents can answer disputes consistently.' },
  { id: 3, title: 'Payment methods, refunds & payouts', category: 'Payments', views: 756, helpful: 92, content: 'Accepted payment methods, refund SLAs, and how vendor payouts are calculated after commission.' },
  { id: 4, title: 'Vendor onboarding & approval checklist', category: 'Vendors', views: 654, helpful: 96, content: 'Document verification, GSTIN checks, commission setup, and the steps to approve or reject a vendor application.' },
  { id: 5, title: 'Resolving rental disputes fairly', category: 'Disputes', views: 432, helpful: 88, content: 'The escalation ladder, evidence collection, and how to record resolutions on the ticket timeline.' },
  { id: 6, title: 'SLA policy & priority definitions', category: 'Operations', views: 389, helpful: 94, content: 'How response and resolution SLAs are derived from ticket priority, and what counts as a breach.' },
]

const CONTACT_CHANNELS = [
  { icon: Mail, tint: 'bg-blue-50 text-blue-600', title: 'Email Support', value: 'support@rentease.com', note: 'Response within 24 hours' },
  { icon: Phone, tint: 'bg-emerald-50 text-emerald-600', title: 'Phone Support', value: '+91 98765 43210', note: '9 AM – 6 PM IST, Mon–Sat' },
  { icon: MessageCircle, tint: 'bg-violet-50 text-violet-600', title: 'Live Chat', value: 'Start a conversation', note: 'Available 24 / 7' },
]

/* ────────────────────────────────────────────────────────────────────────── */
/*                                    Page                                     */
/* ────────────────────────────────────────────────────────────────────────── */

const PAGE_LIMIT = 10

export default function HelpSupportPage() {
  const [activeTab, setActiveTab] = useState('tickets')

  // Data
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)

  // Filters
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Detail drawer
  const [selected, setSelected] = useState<SupportTicket | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [reply, setReply] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)

  // KB
  const [selectedArticle, setSelectedArticle] = useState<(typeof KB_ARTICLES)[number] | null>(null)

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      setStats(await supportApi.getDashboardStats())
    } catch {
      // stats are non-critical; leave silent
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await supportApi.listTickets({
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
        status: statusFilter !== 'all' ? (statusFilter as TicketStatus) : undefined,
        priority: priorityFilter !== 'all' ? (priorityFilter as TicketPriority) : undefined,
        type: typeFilter !== 'all' ? (typeFilter as TicketType) : undefined,
      })
      setTickets(res.tickets)
      setTotalPages(res.pagination?.pages || 1)
      setTotal(res.pagination?.total || res.tickets.length)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load support tickets')
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, priorityFilter, typeFilter])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const openTicket = useCallback(async (ticket: SupportTicket) => {
    setSelected(ticket)
    setReply('')
    setIsInternal(false)
    setDetailLoading(true)
    try {
      const full = await supportApi.getTicket(ticket._id)
      setSelected(full)
    } catch {
      // fall back to the list row we already have
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const refreshSelected = useCallback(async (id: string) => {
    try {
      setSelected(await supportApi.getTicket(id))
    } catch {
      /* ignore */
    }
  }, [])

  const handleReply = async () => {
    if (!reply.trim() || !selected) return
    setSending(true)
    try {
      await supportApi.replyToTicket(selected._id, reply.trim(), isInternal)
      toast.success(isInternal ? 'Internal note added' : 'Reply sent to customer')
      setReply('')
      await refreshSelected(selected._id)
      fetchTickets()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  const handleStatus = async (status: TicketStatus) => {
    if (!selected) return
    setStatusSaving(true)
    try {
      await supportApi.updateStatus(selected._id, status)
      toast.success(`Ticket marked as ${STATUS_CONFIG[status]?.label ?? status}`)
      await refreshSelected(selected._id)
      fetchTickets()
      fetchStats()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status')
    } finally {
      setStatusSaving(false)
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setTypeFilter('all')
    setPage(1)
  }

  const hasActiveFilters =
    !!search || statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all'

  const maxPriorityCount = useMemo(
    () => Math.max(1, ...(stats?.byPriority?.map((p) => p.count) ?? [1])),
    [stats],
  )

  const isReplyLocked =
    selected?.status === 'closed' || selected?.status === 'resolved'

  /* ─────────────────────────────────────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-6 lg:p-8">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg md:p-8"
      >
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <LifeBuoy className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Help &amp; Support</h1>
              <p className="mt-1 max-w-xl text-sm text-slate-300">
                Manage support tickets, resolve customer &amp; vendor issues, track SLAs and browse
                the knowledge base — all from one console.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs text-slate-400">Total Tickets</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                fetchTickets()
                fetchStats()
              }}
              className="gap-2 bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPI cards */}
      <StatsRow stats={stats} loading={statsLoading} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tickets" className="gap-2">
            <TicketIcon className="h-4 w-4" />
            Support Tickets
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
        </TabsList>

        {/* ───────────────────────────── Tickets tab ─────────────────────────── */}
        <TabsContent value="tickets" className="mt-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Left: list + filters */}
            <div className="space-y-4 xl:col-span-2">
              {/* Filters */}
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[200px] flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search by ticket # or subject…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                      <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1) }}>
                      <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        {PRIORITY_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p}>{PRIORITY_CONFIG[p].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
                      <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {TYPE_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>{TYPE_CONFIG[t].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-slate-500">
                        <X className="h-4 w-4" /> Clear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* List */}
              <Card className="border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-base">Tickets</CardTitle>
                    <CardDescription>
                      {loading ? 'Loading…' : `${total} ticket${total === 1 ? '' : 's'} found`}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-[104px] w-full rounded-xl" />
                    ))
                  ) : tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                        <Inbox className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="font-medium text-slate-700">No tickets found</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {hasActiveFilters ? 'Try adjusting your filters.' : 'New tickets will appear here.'}
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {tickets.map((t, idx) => {
                        const isActive = selected?._id === t._id
                        return (
                          <motion.button
                            key={t._id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => openTicket(t)}
                            className={`w-full rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                              isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs text-slate-400">#{t.ticketNumber}</span>
                              <PriorityBadge priority={t.priority} />
                              <StatusBadge status={t.status} />
                              {t.slaBreached && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-200">
                                  <AlertTriangle className="h-3 w-3" /> SLA Breached
                                </span>
                              )}
                            </div>
                            <h4 className="line-clamp-1 font-semibold text-slate-900">{t.subject}</h4>
                            <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{t.description}</p>
                            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                              <TypeBadge type={t.type} />
                              <span className="inline-flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {personName(t.createdBy, 'Unknown user')}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                              </span>
                              {t.messages?.length > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {t.messages.length}
                                </span>
                              )}
                            </div>
                          </motion.button>
                        )
                      })}
                    </AnimatePresence>
                  )}

                  {/* Pagination */}
                  {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: priority insight + detail */}
            <div className="space-y-4">
              {/* Priority distribution */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Gauge className="h-4 w-4 text-primary" />
                    Tickets by Priority
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading && !stats ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                    </div>
                  ) : stats && stats.byPriority.length > 0 ? (
                    <div className="space-y-3">
                      {[...stats.byPriority]
                        .sort((a, b) => PRIORITY_OPTIONS.indexOf(b._id) - PRIORITY_OPTIONS.indexOf(a._id))
                        .map((p) => {
                          const cfg = PRIORITY_CONFIG[p._id] ?? PRIORITY_CONFIG.medium
                          return (
                            <div key={p._id}>
                              <div className="mb-1 flex items-center justify-between text-xs">
                                <span className={`font-medium ${cfg.text}`}>{cfg.label}</span>
                                <span className="text-slate-400">{p.count}</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(p.count / maxPriorityCount) * 100}%` }}
                                  transition={{ duration: 0.6 }}
                                  className={`h-full rounded-full ${cfg.bar}`}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <p className="py-6 text-center text-sm text-slate-400">No data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Detail panel */}
              {selected ? (
                <TicketDetail
                  ticket={selected}
                  loading={detailLoading}
                  onClose={() => setSelected(null)}
                  reply={reply}
                  setReply={setReply}
                  isInternal={isInternal}
                  setIsInternal={setIsInternal}
                  sending={sending}
                  onReply={handleReply}
                  onStatus={handleStatus}
                  statusSaving={statusSaving}
                  replyLocked={isReplyLocked}
                />
              ) : (
                <Card className="border-dashed border-slate-200">
                  <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                      <Eye className="h-7 w-7 text-slate-300" />
                    </div>
                    <p className="font-medium text-slate-600">Select a ticket</p>
                    <p className="mt-1 text-sm text-slate-400">Click any ticket to view the conversation and take action.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─────────────────────────── Knowledge base tab ────────────────────── */}
        <TabsContent value="knowledge" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {KB_ARTICLES.map((a, idx) => (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => setSelectedArticle(a)}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h4 className="line-clamp-1 font-semibold text-slate-900">{a.title}</h4>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">{a.category}</Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-500">{a.content}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span>{a.views.toLocaleString()} views</span>
                    <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{a.helpful}% helpful</span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </motion.button>
            ))}
          </div>

          {/* Contact channels */}
          <Card className="overflow-hidden border-slate-200">
            <div className="bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Contact Support
                </CardTitle>
                <CardDescription>Can’t find what you need? Reach the RentEase support team directly.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {CONTACT_CHANNELS.map((c) => (
                    <div key={c.title} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/70 p-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${c.tint}`}>
                        <c.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{c.title}</p>
                        <p className="text-sm text-slate-600">{c.value}</p>
                        <p className="text-xs text-slate-400">{c.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Article modal */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {selectedArticle?.title}
            </DialogTitle>
            <DialogDescription>Category: {selectedArticle?.category}</DialogDescription>
          </DialogHeader>
          <p className="leading-relaxed text-slate-600">{selectedArticle?.content}</p>
          <Separator className="my-2" />
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500">Was this article helpful?</p>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success('Thanks for your feedback!')}>
              <ThumbsUp className="h-4 w-4" /> Yes
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => toast('Feedback noted.')}>
              <ThumbsDown className="h-4 w-4" /> No
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*                              Ticket detail card                             */
/* ────────────────────────────────────────────────────────────────────────── */

function TicketDetail({
  ticket,
  loading,
  onClose,
  reply,
  setReply,
  isInternal,
  setIsInternal,
  sending,
  onReply,
  onStatus,
  statusSaving,
  replyLocked,
}: {
  ticket: SupportTicket
  loading: boolean
  onClose: () => void
  reply: string
  setReply: (v: string) => void
  isInternal: boolean
  setIsInternal: (v: boolean) => void
  sending: boolean
  onReply: () => void
  onStatus: (s: TicketStatus) => void
  statusSaving: boolean
  replyLocked: boolean
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden border-primary/20">
        <CardHeader className="space-y-3 bg-primary/5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-primary" />
                #{ticket.ticketNumber}
              </CardTitle>
              <CardDescription>
                Opened {format(new Date(ticket.createdAt), 'dd MMM yyyy, hh:mm a')}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            <TypeBadge type={ticket.type} />
          </div>
          {/* Status control */}
          <div className="flex items-center gap-2 pt-1">
            <Label className="text-xs text-slate-500">Set status</Label>
            <Select value={ticket.status} onValueChange={(v) => onStatus(v as TicketStatus)} disabled={statusSaving}>
              <SelectTrigger className="h-8 w-[150px] bg-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {statusSaving && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              {/* Requester + SLA */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Requester</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {initials(personName(ticket.createdBy, 'U'))}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate font-medium text-slate-700">{personName(ticket.createdBy)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Assigned to</p>
                  <p className="mt-1.5 truncate font-medium text-slate-700">
                    {ticket.assignedTo ? personName(ticket.assignedTo) : 'Unassigned'}
                  </p>
                </div>
                {ticket.sla?.resolutionDue && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400">Resolution due</p>
                    <p className={`mt-1 inline-flex items-center gap-1.5 text-sm font-medium ${ticket.sla.breached ? 'text-red-600' : 'text-slate-700'}`}>
                      <Timer className="h-3.5 w-3.5" />
                      {format(new Date(ticket.sla.resolutionDue), 'dd MMM yyyy, hh:mm a')}
                      {ticket.sla.breached && <span className="text-xs">(breached)</span>}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">Description</p>
                <p className="whitespace-pre-wrap text-sm text-slate-600">{ticket.description}</p>
              </div>

              {/* Conversation */}
              {ticket.messages && ticket.messages.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    Conversation ({ticket.messages.length})
                  </p>
                  <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                    {ticket.messages.map((m, i) => {
                      const isAdmin = m.sender.type === 'admin'
                      return (
                        <div key={m._id ?? i} className={`flex gap-2.5 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarFallback className={`text-[10px] ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-slate-100'}`}>
                              {initials(m.sender.name || m.sender.type)}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                              m.isInternal
                                ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
                                : isAdmin
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="mb-0.5 flex items-center gap-2">
                              <span className="text-[11px] font-medium opacity-80">
                                {m.sender.name || (isAdmin ? 'Support' : 'Customer')}
                              </span>
                              {m.isInternal && (
                                <span className="rounded bg-amber-200/60 px-1 text-[9px] font-semibold uppercase text-amber-800">
                                  Internal
                                </span>
                              )}
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                            <p className="mt-1 text-[10px] opacity-60">
                              {format(new Date(m.createdAt), 'dd MMM, hh:mm a')}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <Separator />

              {/* Reply box */}
              {replyLocked ? (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  This ticket is {ticket.status}. Reopen it to continue the conversation.
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="text-sm">Reply</Label>
                    <div className="flex items-center gap-2">
                      <Switch id="internal" checked={isInternal} onCheckedChange={setIsInternal} />
                      <Label htmlFor="internal" className="cursor-pointer text-xs text-slate-500">
                        Internal note
                      </Label>
                    </div>
                  </div>
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    placeholder={isInternal ? 'Add an internal note (not visible to the customer)…' : 'Type your reply…'}
                    className={isInternal ? 'border-amber-200 bg-amber-50/40 focus-visible:ring-amber-300' : ''}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button onClick={onReply} disabled={!reply.trim() || sending} className="gap-2">
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {isInternal ? 'Add note' : 'Send reply'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Feedback (if resolved) */}
              {ticket.resolution?.feedback?.rating ? (
                <div className="rounded-lg bg-emerald-50 p-3 ring-1 ring-inset ring-emerald-100">
                  <p className="mb-1 text-xs font-medium text-emerald-700">Customer feedback</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < (ticket.resolution?.feedback?.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  {ticket.resolution.feedback.comment && (
                    <p className="mt-1 text-sm text-emerald-800">“{ticket.resolution.feedback.comment}”</p>
                  )}
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
