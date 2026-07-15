'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, IndianRupee, ShoppingBag, Activity, Crown, AlertTriangle, RefreshCw,
  Search, Mail, Tag, Award, Gift, CalendarClock, Download, CheckCheck, X,
  MoreHorizontal, Eye, ShieldCheck, ShieldAlert, Star, Loader2,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  listCrmCustomers, sendBulkEmail, sendCustomerEmail, createCampaign,
  discountApi, toCsv, downloadCsv,
} from '@/lib/api/admin-intelligence'
import type {
  CrmCustomer, DiscountPayload, Campaign,
} from '@/types/admin-intelligence.types'
import {
  IntelligencePageShell, KpiGrid, StatusBadge,
} from '@/components/admin/intelligence'
import { EmailComposer } from '@/components/admin/intelligence/crm/EmailComposer'
import type { KpiCardItem } from '@/types/admin-intelligence.types'
import {
  CUSTOMER_SEGMENTS, deriveCustomerFields, customerName, initials,
  formatCompactINR, formatDate, formatRelative,
  HEALTH_BAND_META, segmentMeta,
  type SegmentFilter, type DerivedCustomer, type CustomerSegmentKey,
} from '@/lib/crm/crm-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'

const PAGE_SIZE = 20
const TAGS_KEY = 'rentease:crm:tags'
const SEGMENTS_KEY = 'rentease:crm:segments'

const STATIC_CUSTOMERS: CrmCustomer[] = [
  { _id: '1', email: 'rahul.sharma@email.com', phone: '+919812345670', profile: { firstName: 'Rahul', lastName: 'Sharma', avatar: '' }, stats: { totalRentals: 14, activeRentals: 2, totalSpent: 92000, memberSince: '2024-01-15T00:00:00Z', lastActive: new Date(Date.now() - 2 * 86400000).toISOString() }, verification: { email: true, phone: true, kyc: { status: 'approved' } }, status: { isActive: true }, createdAt: '2024-01-15T00:00:00Z' },
  { _id: '2', email: 'priya.patel@email.com', phone: '+919812345671', profile: { firstName: 'Priya', lastName: 'Patel' }, stats: { totalRentals: 6, activeRentals: 1, totalSpent: 31000, memberSince: '2024-05-20T00:00:00Z', lastActive: new Date(Date.now() - 12 * 86400000).toISOString() }, verification: { email: true, phone: true, kyc: { status: 'pending' } }, status: { isActive: true }, createdAt: '2024-05-20T00:00:00Z' },
  { _id: '3', email: 'amit.kumar@email.com', phone: '+919812345672', profile: { firstName: 'Amit', lastName: 'Kumar' }, stats: { totalRentals: 0, activeRentals: 0, totalSpent: 0, memberSince: '2025-06-10T00:00:00Z', lastActive: new Date(Date.now() - 120 * 86400000).toISOString() }, verification: { email: true, phone: false }, status: { isActive: false }, createdAt: '2025-06-10T00:00:00Z' },
  { _id: '4', email: 'neha.gupta@email.com', phone: '+919812345673', profile: { firstName: 'Neha', lastName: 'Gupta' }, stats: { totalRentals: 21, activeRentals: 3, totalSpent: 145000, memberSince: '2023-11-02T00:00:00Z', lastActive: new Date(Date.now() - 1 * 86400000).toISOString() }, verification: { email: true, phone: true, kyc: { status: 'approved' } }, status: { isActive: true }, createdAt: '2023-11-02T00:00:00Z' },
  { _id: '5', email: 'karan.singh@email.com', phone: '+919812345674', profile: { firstName: 'Karan', lastName: 'Singh' }, stats: { totalRentals: 3, activeRentals: 0, totalSpent: 12000, memberSince: '2024-09-18T00:00:00Z', lastActive: new Date(Date.now() - 45 * 86400000).toISOString() }, verification: { email: false, phone: true }, status: { isActive: true }, createdAt: '2024-09-18T00:00:00Z' },
]

const STATIC_RESPONSE = { customers: STATIC_CUSTOMERS, pagination: { page: 1, limit: PAGE_SIZE, total: STATIC_CUSTOMERS.length, pages: 1 } }

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

function loadMap(key: string): Record<string, string[]> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(key) || '{}')
  } catch {
    return {}
  }
}

export default function IntelligenceCrmPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [rawSearch, setRawSearch] = useState('')
  const search = useDebounced(rawSearch, 350)
  const [segment, setSegment] = useState<SegmentFilter>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [singleEmail, setSingleEmail] = useState<string | null>(null)
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false)
  const [tagOpen, setTagOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [segOpen, setSegOpen] = useState(false)
  const [segPick, setSegPick] = useState<CustomerSegmentKey>('loyal')
  const [offerOpen, setOfferOpen] = useState(false)
  const [campaignOpen, setCampaignOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [tagsMap, setTagsMap] = useState<Record<string, string[]>>(() => loadMap(TAGS_KEY))
  const [segOverride, setSegOverride] = useState<Record<string, CustomerSegmentKey>>(() => loadMap(SEGMENTS_KEY) as unknown as Record<string, CustomerSegmentKey>)

  const listQ = useQuery({
    queryKey: ['ai', 'crm', 'customers', page, search],
    queryFn: () => listCrmCustomers({ page, limit: PAGE_SIZE, search: search || undefined }),
    staleTime: 30_000,
  })

  const demoMode = listQ.isError
  const lastUpdated = useMemo(
    () =>
      listQ.dataUpdatedAt
        ? new Date(listQ.dataUpdatedAt).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : undefined,
    [listQ.dataUpdatedAt],
  )
  const response = (demoMode ? STATIC_RESPONSE : (listQ.data ?? STATIC_RESPONSE)) as { customers: CrmCustomer[]; pagination: { page: number; limit: number; total: number; pages: number } }

  const derived: DerivedCustomer[] = useMemo(() => {
    return response.customers.map((c) => {
      const d = deriveCustomerFields(c)
      const ov = segOverride[d.id]
      if (ov) d.segment = ov
      const meta = segmentMeta(ov || d.segment)
      if (meta) d.segmentLabel = meta.label
      d.name = customerName(c)
      return d
    })
  }, [response.customers, segOverride])

  const filtered = useMemo(
    () => (segment === 'all' ? derived : derived.filter((d) => d.segment === segment)),
    [derived, segment],
  )

  const selectedDerived = useMemo(() => derived.filter((d) => selected.has(d.id)), [derived, selected])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }, [])

  /* ----- KPI summary (computed on loaded page) ----- */
  const kpiItems: KpiCardItem[] = useMemo(() => {
    const total = response.pagination.total
    const active = derived.filter((d) => d.status.variant === 'active').length
    const vip = derived.filter((d) => d.segment === 'vip' || d.segment === 'high_value').length
    const atRisk = derived.filter((d) => d.segment === 'at_risk' || d.segment === 'inactive').length
    const returning = derived.filter((d) => d.segment === 'returning' || d.segment === 'loyal' || d.segment === 'frequent').length
    const avgLtv = derived.length ? derived.reduce((s, d) => s + d.ltv, 0) / derived.length : 0
    const avgRentals = derived.length ? derived.reduce((s, d) => s + d.totalRentals, 0) / derived.length : 0
    const avgOrder = derived.reduce((s, d) => s + d.ltv, 0) / Math.max(1, derived.reduce((s, d) => s + d.totalRentals, 0))
    return [
      { key: 'total', title: 'Total Customers', value: total.toLocaleString('en-IN'), icon: Users, accent: '#2563eb', loading: listQ.isLoading },
      { key: 'active', title: 'Active', value: active.toLocaleString('en-IN'), icon: Activity, accent: '#059669', loading: listQ.isLoading },
      { key: 'vip', title: 'VIP / High Value', value: vip.toLocaleString('en-IN'), icon: Crown, accent: '#7c3aed', loading: listQ.isLoading },
      { key: 'atrisk', title: 'At Risk', value: atRisk.toLocaleString('en-IN'), icon: AlertTriangle, accent: '#d97706', loading: listQ.isLoading },
      { key: 'returning', title: 'Returning', value: returning.toLocaleString('en-IN'), icon: Users, accent: '#0891b2', loading: listQ.isLoading },
      { key: 'ltv', title: 'Avg LTV', value: formatCompactINR(Math.round(avgLtv)), icon: IndianRupee, accent: '#db2777', loading: listQ.isLoading },
      { key: 'rentals', title: 'Avg Rentals', value: avgRentals.toFixed(1), icon: ShoppingBag, accent: '#0ea5e9', loading: listQ.isLoading },
      { key: 'aov', title: 'Avg Order Value', value: formatCompactINR(Math.round(avgOrder)), icon: IndianRupee, accent: '#16a34a', loading: listQ.isLoading },
    ]
  }, [derived, response.pagination.total, listQ.isLoading])

  /* ----- Selection ----- */
  const allVisibleSelected = filtered.length > 0 && filtered.every((d) => selected.has(d.id))
  const someSelected = filtered.some((d) => selected.has(d.id))

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) filtered.forEach((d) => next.delete(d.id))
      else filtered.forEach((d) => next.add(d.id))
      return next
    })
  }
  const clearSelection = () => setSelected(new Set())

  const exportSelected = () => {
    const rows = selectedDerived.map((d) => ({
      id: d.id, name: d.name, email: d.email, phone: d.phone ?? '', segment: d.segmentLabel,
      status: d.status.label, ltv: d.ltv, totalRentals: d.totalRentals, activeRentals: d.activeRentals,
      completedRentals: d.completedRentals, health: d.health.score, verification: d.verification,
      lastActive: d.lastActive ?? '', memberSince: d.memberSince,
    }))
    downloadCsv(`crm-selected-${selectedDerived.length}.csv`, toCsv(rows, ['id', 'name', 'email', 'phone', 'segment', 'status', 'ltv', 'totalRentals', 'activeRentals', 'completedRentals', 'health', 'verification', 'lastActive', 'memberSince']))
  }

  /* ----- Mutations ----- */
  const bulkEmailM = useMutation({
    mutationFn: (vars: { subject: string; body: string }) =>
      sendBulkEmail({ userIds: selectedDerived.map((d) => d.id), subject: vars.subject, htmlBody: vars.body }),
    onSuccess: (r) => { const res = r as { sent?: number; failed?: number }; showToast(`Email queued: ${res.sent ?? 0} sent, ${res.failed ?? 0} failed`); setBulkEmailOpen(false) },
    onError: () => showToast('Failed to send bulk email'),
  })

  const singleEmailM = useMutation({
    mutationFn: (vars: { id: string; subject: string; body: string }) =>
      sendCustomerEmail(vars.id, { subject: vars.subject, htmlBody: vars.body }),
    onSuccess: () => { showToast('Email sent'); setSingleEmail(null) },
    onError: () => showToast('Failed to send email'),
  })

  const saveTags = () => {
    if (!tagInput.trim() || selected.size === 0) return
    const next = { ...tagsMap }
    selected.forEach((id) => { next[id] = Array.from(new Set([...(next[id] || []), tagInput.trim()])) })
    setTagsMap(next)
    if (typeof window !== 'undefined') window.localStorage.setItem(TAGS_KEY, JSON.stringify(next))
    setTagInput(''); setTagOpen(false)
    showToast(`Tag "${tagInput.trim()}" added to ${selected.size} customer(s)`)
  }

  const saveSegment = () => {
    if (selected.size === 0) return
    const next = { ...segOverride }
    selected.forEach((id) => { next[id] = segPick })
    setSegOverride(next)
    if (typeof window !== 'undefined') window.localStorage.setItem(SEGMENTS_KEY, JSON.stringify(next))
    setSegOpen(false)
    showToast(`Segment "${segmentMeta(segPick)?.label}" assigned to ${selected.size} customer(s)`)
  }

  const offerM = useMutation({
    mutationFn: (vars: { name: string; code: string; type: string; value: number; days: number }) => {
      const payload: DiscountPayload = {
        name: vars.name, code: vars.code, type: vars.type as DiscountPayload['type'],
        value: vars.value, validity: { startDate: new Date().toISOString(), endDate: new Date(Date.now() + vars.days * 86400000).toISOString() },
      }
      return discountApi.create(payload)
    },
    onSuccess: () => { showToast('Offer created'); setOfferOpen(false) },
    onError: () => showToast('Failed to create offer'),
  })

  const campaignM = useMutation({
    mutationFn: (vars: { name: string; date?: string }) =>
      createCampaign({ name: vars.name, audience: { type: 'selected', userIds: selectedDerived.map((d) => d.id) } } as Partial<Campaign>).then((c) =>
        vars.date ? Promise.resolve(c) : Promise.resolve(c)),
    onSuccess: () => { showToast(`Campaign draft created for ${selectedDerived.length} customers`); setCampaignOpen(false) },
    onError: () => showToast('Failed to create campaign'),
  })

  const segCount = useMemo(() => {
    const counts: Record<string, number> = { all: derived.length }
    CUSTOMER_SEGMENTS.filter((s) => s.key !== 'all').forEach((s) => { counts[s.key] = 0 })
    derived.forEach((d) => { counts[d.segment] = (counts[d.segment] || 0) + 1 })
    return counts
  }, [derived])

  const healthMeta = (band: DerivedCustomer['health']['band']) => HEALTH_BAND_META[band]

  return (
    <IntelligencePageShell
      title="Customer CRM"
      subtitle="Enterprise customer management, segmentation & outreach"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: 'CRM' },
      ]}
      demoMode={demoMode}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {lastUpdated && (
            <span className="hidden text-xs text-slate-400 lg:inline">{lastUpdated}</span>
          )}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search name, email, phone…"
              value={rawSearch}
              onChange={(e) => { setRawSearch(e.target.value); setPage(1) }}
              className="h-9 w-56 pl-8 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['ai', 'crm'] })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${listQ.isFetching ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      }
    >
      <KpiGrid items={kpiItems} columns={4} className="mb-6" />

      {/* Segment filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {CUSTOMER_SEGMENTS.map((s) => {
          const active = segment === s.key
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSegment(s.key)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition"
              style={{
                borderColor: active ? s.color : '#e2e8f0',
                background: active ? s.bg : '#fff',
                color: active ? s.color : '#475569',
              }}
            >
              {s.label}
              <span className="rounded-full bg-white/70 px-1.5 text-[10px] font-bold" style={{ color: s.color }}>{segCount[s.key] ?? 0}</span>
            </button>
          )
        })}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
          <span className="text-sm font-semibold text-indigo-900">{selected.size} selected</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" className="h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={() => setBulkEmailOpen(true)}><Mail className="h-3.5 w-3.5" /> Send Email</Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setSegOpen(true)}><Award className="h-3.5 w-3.5" /> Assign Segment</Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setTagOpen(true)}><Tag className="h-3.5 w-3.5" /> Add Tag</Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setOfferOpen(true)}><Gift className="h-3.5 w-3.5" /> Create Offer</Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setCampaignOpen(true)}><CalendarClock className="h-3.5 w-3.5" /> Schedule Campaign</Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={exportSelected}><Download className="h-3.5 w-3.5" /> Export</Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-slate-500" onClick={clearSelection}><X className="h-3.5 w-3.5" /> Clear</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full min-w-[1400px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-10 px-3 py-3"><Checkbox checked={allVisibleSelected ? true : (someSelected ? 'indeterminate' : false)} onCheckedChange={toggleAll} aria-label="Select all" /></th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Segment</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">LTV</th>
                <th className="px-3 py-3 text-right">Rentals</th>
                <th className="px-3 py-3 text-right">Active</th>
                <th className="px-3 py-3 text-right">Completed</th>
                <th className="px-3 py-3">Last Active</th>
                <th className="px-3 py-3">Member Since</th>
                <th className="px-3 py-3">Verification</th>
                <th className="px-3 py-3">Health</th>
                <th className="px-3 py-3">Recommended Action</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listQ.isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 15 }).map((__, j) => (
                      <td key={j} className="px-3 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={15} className="px-3 py-16 text-center text-sm text-slate-400">No customers match the current filters.</td></tr>
              ) : (
                filtered.map((d) => {
                  const hm = healthMeta(d.health.band)
                  const tags = tagsMap[d.id] || []
                  return (
                    <tr key={d.id} className={selected.has(d.id) ? 'bg-indigo-50/40 hover:bg-indigo-50' : 'hover:bg-slate-50'}>
                      <td className="px-3 py-3"><Checkbox checked={selected.has(d.id)} onCheckedChange={() => toggleOne(d.id)} aria-label={`Select ${d.name}`} /></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            {d.avatar ? <AvatarImage src={d.avatar} alt={d.name} /> : null}
                            <AvatarFallback className="bg-indigo-100 text-indigo-700">{initials(d.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <Link href={`/admin/intelligence/crm/${d.id}`} className="block truncate font-semibold text-slate-900 hover:text-indigo-600">{d.name}</Link>
                            <div className="truncate text-xs text-slate-500">{d.email}</div>
                            {tags.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {tags.map((t) => <Badge key={t} variant="secondary" className="px-1.5 py-0 text-[10px]">{t}</Badge>)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{d.phone ?? '—'}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: segmentMeta(d.segment)?.bg, color: segmentMeta(d.segment)?.color }}>{d.segmentLabel}</span>
                      </td>
                      <td className="px-3 py-3"><StatusBadge status={d.status.variant === 'exhausted' ? 'blocked' : d.status.variant} /></td>
                      <td className="px-3 py-3 text-right font-semibold text-slate-800">{formatCompactINR(d.ltv)}</td>
                      <td className="px-3 py-3 text-right text-slate-700">{d.totalRentals}</td>
                      <td className="px-3 py-3 text-right text-slate-700">{d.activeRentals}</td>
                      <td className="px-3 py-3 text-right text-slate-700">{d.completedRentals}</td>
                      <td className="px-3 py-3 text-slate-600">{formatRelative(d.lastActive)}</td>
                      <td className="px-3 py-3 text-slate-600">{formatDate(d.memberSince)}</td>
                      <td className="px-3 py-3">
                        {d.verification === 'verified' ? <span className="inline-flex items-center gap-1 text-emerald-600"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span>
                          : d.verification === 'partial' ? <span className="inline-flex items-center gap-1 text-amber-600"><ShieldAlert className="h-3.5 w-3.5" /> Partial</span>
                          : <span className="text-slate-400">Unverified</span>}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full" style={{ width: `${d.health.score}%`, background: hm.color }} />
                          </div>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: hm.bg, color: hm.color }}>{hm.label}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                          {d.recommendedAction.priority === 'high' ? <AlertTriangle className="h-3 w-3 text-rose-500" /> : <Star className="h-3 w-3 text-amber-500" />}
                          {d.recommendedAction.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild><Link href={`/admin/intelligence/crm/${d.id}`}><Eye className="h-4 w-4" /> View 360 Profile</Link></DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSingleEmail(d.id)}><Mail className="h-4 w-4" /> Send Email</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => { setSelected(new Set([d.id])); setTagOpen(true) }}><Tag className="h-4 w-4" /> Add Tag</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => { setSelected(new Set([d.id])); setSegOpen(true) }}><Award className="h-4 w-4" /> Assign Segment</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {response.pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">Page {response.pagination.page} of {response.pagination.pages} · {response.pagination.total} customers</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /> Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= response.pagination.pages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <CheckCheck className="h-4 w-4 text-emerald-400" /> {toast}
        </div>
      )}

      {/* Single email dialog */}
      <EmailDialog
        open={!!singleEmail}
        onOpenChange={(o) => !o && setSingleEmail(null)}
        title="Send Email"
        recipientName={derived.find((d) => d.id === singleEmail)?.name}
        ltv={derived.find((d) => d.id === singleEmail) ? String(Math.round(derived.find((d) => d.id === singleEmail)!.ltv)) : undefined}
        submitLabel="Send"
        loading={singleEmailM.isPending}
        onSubmit={(subject, body) => singleEmail && singleEmailM.mutate({ id: singleEmail, subject, body })}
      />

      {/* Bulk email dialog */}
      <EmailDialog
        open={bulkEmailOpen}
        onOpenChange={setBulkEmailOpen}
        title={`Bulk Email (${selectedDerived.length} customers)`}
        submitLabel={bulkEmailM.isPending ? 'Sending…' : 'Send to All'}
        loading={bulkEmailM.isPending}
        onSubmit={(subject, body) => bulkEmailM.mutate({ subject, body })}
      />

      {/* Add tag */}
      <Dialog open={tagOpen} onOpenChange={setTagOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Tag</DialogTitle><DialogDescription>Tag applies to {selected.size} selected customer(s). Stored locally for v1.</DialogDescription></DialogHeader>
          <Input placeholder="e.g. VIP-2025" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagOpen(false)}>Cancel</Button>
            <Button onClick={saveTags} disabled={!tagInput.trim()} className="bg-indigo-600 hover:bg-indigo-700">Add Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign segment */}
      <Dialog open={segOpen} onOpenChange={setSegOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Segment</DialogTitle><DialogDescription>Override derived segment for {selected.size} selected customer(s). Stored locally for v1.</DialogDescription></DialogHeader>
          <div className="space-y-1">
            <Label>Segment</Label>
            <Select value={segPick} onValueChange={(v) => setSegPick(v as CustomerSegmentKey)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CUSTOMER_SEGMENTS.filter((s) => s.key !== 'all').map((s) => (
                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSegOpen(false)}>Cancel</Button>
            <Button onClick={saveSegment} className="bg-indigo-600 hover:bg-indigo-700">Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create offer */}
      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Personalized Offer</DialogTitle><DialogDescription>Creates a discount for {selected.size} selected customer(s) audience.</DialogDescription></DialogHeader>
          <CreateOfferView loading={offerM.isPending} onSubmit={(v) => offerM.mutate(v)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfferOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule campaign */}
      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Campaign</DialogTitle><DialogDescription>Creates a campaign draft targeting {selectedDerived.length} selected customer(s).</DialogDescription></DialogHeader>
          <CreateCampaignView loading={campaignM.isPending} onSubmit={(v) => campaignM.mutate(v)} />
        </DialogContent>
      </Dialog>
    </IntelligencePageShell>
  )
}

/* -------------------------------------------------------------------------- */
/* Shared sub-components                                                       */
/* -------------------------------------------------------------------------- */

// function EmailDialog({
//   open, onOpenChange, title, recipientName, ltv, submitLabel, loading, onSubmit,
// }: {
//   open: boolean; onOpenChange: (o: boolean) => void; title: string; recipientName?: string; ltv?: string;
//   submitLabel: string; loading: boolean; onSubmit: (subject: string, body: string) => void;
// }) {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
//         <EmailComposer
//           recipientName={recipientName}
//           ltv={ltv}
//           loading={loading}
//           submitLabel={submitLabel}
//           onSubmit={onSubmit}
//         />
//       </DialogContent>
//     </Dialog>
//   )
// }

function EmailDialog({
  open, onOpenChange, title, recipientName, ltv, submitLabel, loading, onSubmit,
}: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; recipientName?: string; ltv?: string;
  submitLabel: string; loading: boolean; onSubmit: (subject: string, body: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <EmailComposer
          recipientName={recipientName}
          ltv={ltv}
          loading={loading}
          submitLabel={submitLabel}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function CreateOfferView({ loading, onSubmit }: { loading: boolean; onSubmit: (v: { name: string; code: string; type: string; value: number; days: number }) => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('percentage')
  const [value, setValue] = useState(10)
  const [days, setDays] = useState(30)
  const code = name ? name.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 12) : ''
  return (
    <div className="space-y-3">
      <div className="space-y-1"><Label>Offer Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Saver" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="free_delivery">Free Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>{type === 'fixed' ? 'Amount (₹)' : 'Value (%)'}</Label><Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} /></div>
      </div>
      <div className="space-y-1"><Label>Validity (days)</Label><Input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} /></div>
      <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-500">Code: <span className="font-semibold text-slate-700">{code || '—'}</span></div>
      <Button className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={!name || loading} onClick={() => onSubmit({ name, code, type, value, days })}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />} Create Offer
      </Button>
    </div>
  )
}

function CreateCampaignView({ loading, onSubmit }: { loading: boolean; onSubmit: (v: { name: string; date?: string }) => void }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  return (
    <div className="space-y-3">
      <div className="space-y-1"><Label>Campaign Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Win-back" /></div>
      <div className="space-y-1"><Label>Schedule (optional)</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      <Button className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={!name || loading} onClick={() => onSubmit({ name, date: date || undefined })}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />} Create Campaign
      </Button>
    </div>
  )
}
