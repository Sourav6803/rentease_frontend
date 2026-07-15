'use client'

import { useState, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  ArrowLeft, Mail, Gift, Ticket, Download, CalendarClock, StickyNote,
  Tag, Award, Phone, ShieldCheck, ShieldAlert, Activity,
  ShoppingBag, CreditCard, LifeBuoy, Heart, Eye, Sparkles, Loader2, CheckCheck,
} from 'lucide-react'
import {
  getCrmCustomer, sendCustomerEmail, discountApi, toCsv, downloadCsv,
} from '@/lib/api/admin-intelligence'
import type { CustomerCRM, CrmCustomer, DiscountPayload } from '@/types/admin-intelligence.types'
import {
  IntelligencePageShell, StatusBadge,
} from '@/components/admin/intelligence'
import {
  CUSTOMER_SEGMENTS, deriveCustomerFields, customerName, initials,
  formatCompactINR, formatINR, formatDate, formatRelative,
  HEALTH_BAND_META, segmentMeta, type CustomerSegmentKey,
} from '@/lib/crm/crm-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { EmailComposer } from '@/components/admin/intelligence/crm/EmailComposer'

const NOTES_KEY = (id: string) => `rentease:crm:notes:${id}`
const TAGS_KEY = (id: string) => `rentease:crm:tags:${id}`
const SEG_KEY = (id: string) => `rentease:crm:segment:${id}`
const FOLLOW_KEY = (id: string) => `rentease:crm:followups:${id}`

/* ----------------------------- local shapes ----------------------------- */
interface RentalDoc {
  _id: string
  product?: { basicInfo?: { name?: string }; category?: string }
  rentalDetails?: { startDate?: string; endDate?: string; totalAmount?: number; monthlyRent?: number; deposit?: number }
  status?: string
  payment?: { status?: string }
  delivery?: { status?: string }
  return?: { status?: string }
  paymentStatus?: string
  deliveryStatus?: string
  returnStatus?: string
  createdAt?: string
}
interface PaymentDoc {
  _id: string; amount?: number; status?: string; invoice?: string; method?: string; transactionId?: string; refundStatus?: string; createdAt?: string
}
interface TicketDoc {
  _id: string; subject?: string; priority?: string; status?: string; assignedAgent?: string; createdAt?: string
}
interface WishDoc {
  _id: string; product?: { basicInfo?: { name?: string }; pricing?: { monthlyRent?: number }; media?: Array<{ url?: string }> }
}
interface ViewDoc { _id: string; name?: string; lastViewed?: string; views?: number }
interface EventDoc { _id: string; eventType?: string; createdAt?: string; metadata?: Record<string, unknown> }

const STATUS_COLOR: Record<string, string> = {
  active: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  completed: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  sent: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  paid: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  success: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  scheduled: 'text-violet-700 bg-violet-50 border-violet-200',
  failed: 'text-rose-700 bg-rose-50 border-rose-200',
  cancelled: 'text-rose-700 bg-rose-50 border-rose-200',
  open: 'text-blue-700 bg-blue-50 border-blue-200',
  resolved: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  closed: 'text-slate-600 bg-slate-100 border-slate-200',
  approved: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  rejected: 'text-rose-700 bg-rose-50 border-rose-200',
  in_transit: 'text-blue-700 bg-blue-50 border-blue-200',
  delivered: 'text-emerald-700 bg-emerald-50 border-emerald-200',
}
function pill(status?: string) {
  const key = (status || '').toLowerCase()
  const cls = STATUS_COLOR[key] || 'text-slate-600 bg-slate-100 border-slate-200'
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}>{status || '—'}</span>
}

export default function CrmCustomerProfilePage() {
  const params = useParams<{ userId: string }>()
  const userId = params?.userId as string

  const detailQ = useQuery({
    queryKey: ['ai', 'crm', 'customer', userId],
    queryFn: () => getCrmCustomer(userId),
    enabled: !!userId,
    staleTime: 30_000,
  })

  const data = (detailQ.data as CustomerCRM | undefined)
  const profile: CrmCustomer | undefined = data?.profile

  // Build a CrmCustomer-like object so health/segment derivation works
  const derived = useMemo(() => {
    if (!data || !profile) return null
    const pseudo: CrmCustomer = {
      _id: profile._id,
      email: profile.email,
      phone: profile.phone,
      profile: profile.profile,
      verification: profile.verification,
      status: profile.status,
      createdAt: profile.createdAt,
      stats: {
        totalSpent: data.lifetimeValue,
        totalRentals: data.totalOrders,
        activeRentals: (data.rentalHistory as RentalDoc[])?.filter((r) => r.status === 'active' || r.status === 'confirmed').length ?? 0,
        memberSince: profile.createdAt,
      },
    }
    return deriveCustomerFields(pseudo)
  }, [data, profile])

  const rentals = (data?.rentalHistory as RentalDoc[]) ?? []
  const payments = (data?.paymentHistory as PaymentDoc[]) ?? []
  const tickets = (data?.supportTickets as TicketDoc[]) ?? []
  const wishlist = (data?.wishlist as WishDoc[]) ?? []
  const favorites = (data?.favoriteProducts as WishDoc[]) ?? []
  const recent = (data?.recentlyViewed as ViewDoc[]) ?? []
  const events = (data?.recentBehavior as EventDoc[]) ?? []

  /* ----- right panel state ----- */
  const [notes, setNotes] = useState(() => (userId ? (localStorage.getItem(NOTES_KEY(userId)) || '') : ''))
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(() => (userId ? JSON.parse(localStorage.getItem(TAGS_KEY(userId)) || '[]') : []))
  const [segPick, setSegPick] = useState<CustomerSegmentKey>(() => {
    const s = userId ? (localStorage.getItem(SEG_KEY(userId)) as CustomerSegmentKey | null) : null
    return s || 'loyal'
  })
  const [followups, setFollowups] = useState<string[]>(() => (userId ? JSON.parse(localStorage.getItem(FOLLOW_KEY(userId)) || '[]') : []))
  const [followInput, setFollowInput] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [emailOpen, setEmailOpen] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)

  const showToast = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(null), 3500) }, [])

  const saveNotes = () => { if (!userId) return; localStorage.setItem(NOTES_KEY(userId), notes); showToast('Internal note saved') }
  const addTag = () => {
    if (!tagInput.trim() || !userId) return
    const next = Array.from(new Set([...tags, tagInput.trim()]))
    setTags(next); localStorage.setItem(TAGS_KEY(userId), JSON.stringify(next)); setTagInput(''); showToast(`Tag "${tagInput.trim()}" added`)
  }
  const assignSegment = () => { if (!userId) return; localStorage.setItem(SEG_KEY(userId), segPick); showToast(`Segment set to ${segmentMeta(segPick)?.label}`) }
  const addFollowup = () => { if (!followInput.trim() || !userId) return; const next = [...followups, followInput.trim()]; setFollowups(next); localStorage.setItem(FOLLOW_KEY(userId), JSON.stringify(next)); setFollowInput(''); showToast('Follow-up scheduled') }

  const emailM = useMutation({
    mutationFn: (v: { subject: string; body: string }) => sendCustomerEmail(userId, { subject: v.subject, htmlBody: v.body }),
    onSuccess: () => { showToast('Email sent'); setEmailOpen(false) },
    onError: () => showToast('Failed to send email'),
  })
  const offerM = useMutation({
    mutationFn: (v: { name: string; code: string; type: string; value: number; days: number }) => {
      const payload: DiscountPayload = {
        name: v.name, code: v.code, type: v.type as DiscountPayload['type'],
        value: v.value, validity: { startDate: new Date().toISOString(), endDate: new Date(Date.now() + v.days * 86400000).toISOString() },
      }
      return discountApi.create(payload)
    },
    onSuccess: () => { showToast('Offer / coupon created'); setOfferOpen(false) },
    onError: () => showToast('Failed to create offer'),
  })

  const exportCustomer = () => {
    if (!derived) return
    const rows = [
      { field: 'Name', value: derived.name },
      { field: 'Email', value: derived.email },
      { field: 'Phone', value: derived.phone ?? '' },
      { field: 'Segment', value: derived.segmentLabel },
      { field: 'Status', value: derived.status.label },
      { field: 'LTV', value: derived.ltv },
      { field: 'Total Rentals', value: derived.totalRentals },
      { field: 'Active Rentals', value: derived.activeRentals },
      { field: 'Completed Rentals', value: derived.completedRentals },
      { field: 'Health', value: `${derived.health.score} (${derived.health.band})` },
      { field: 'Verification', value: derived.verification },
      { field: 'Member Since', value: derived.memberSince },
      { field: 'Recommended Action', value: derived.recommendedAction.label },
    ]
    downloadCsv(`customer-${derived.id}.csv`, toCsv(rows, ['field', 'value']))
  }

  const segLabel = (derived?.segment && segmentMeta(derived.segment)?.label) || '—'
  const hm = derived ? HEALTH_BAND_META[derived.health.band] : null

  if (detailQ.isLoading) {
    return (
      <IntelligencePageShell title="Customer Profile" subtitle="Loading…" breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Intelligence', href: '/admin/intelligence' }, { label: 'CRM', href: '/admin/intelligence/crm' }, { label: 'Profile' }]}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr_300px]">
          {[0, 1, 2].map((i) => (<div key={i} className="h-96 animate-pulse rounded-2xl bg-slate-100" />))}
        </div>
      </IntelligencePageShell>
    )
  }

  if (detailQ.isError || !data || !profile) {
    return (
      <IntelligencePageShell title="Customer Not Found" subtitle="We couldn't load this profile" breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Intelligence', href: '/admin/intelligence' }, { label: 'CRM', href: '/admin/intelligence/crm' }, { label: 'Profile' }]}>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">The customer profile could not be loaded. They may not exist or the API is unreachable.</p>
          <Link href="/admin/intelligence/crm" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600"><ArrowLeft className="h-4 w-4" /> Back to CRM</Link>
        </div>
      </IntelligencePageShell>
    )
  }

  const name = derived?.name ?? customerName(profile)

  return (
    <IntelligencePageShell
      title={name}
      subtitle={`Customer since ${formatDate(derived?.memberSince)}`}
      breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Intelligence', href: '/admin/intelligence' }, { label: 'CRM', href: '/admin/intelligence/crm' }, { label: name }]}
      actions={
        <Link href="/admin/intelligence/crm" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr_300px]">
        {/* ---------------- LEFT: identity ---------------- */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20">
                {profile.profile?.avatar ? <AvatarImage src={profile.profile.avatar} alt={name} /> : null}
                <AvatarFallback className="bg-indigo-100 text-2xl text-indigo-700">{initials(name)}</AvatarFallback>
              </Avatar>
              <h2 className="mt-3 text-lg font-bold text-slate-900">{name}</h2>
              <p className="text-sm text-slate-500">{profile.email}</p>
              {profile.phone && <p className="mt-0.5 text-sm text-slate-500"><Phone className="mr-1 inline h-3.5 w-3.5" />{profile.phone}</p>}
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {derived && <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: segmentMeta(derived.segment)?.bg, color: segmentMeta(derived.segment)?.color }}>{segLabel}</span>}
                {derived && <StatusBadge status={derived.status.variant === 'exhausted' ? 'blocked' : derived.status.variant} />}
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-gradient-to-br from-indigo-50 to-white p-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">Lifetime Value</p>
              <p className="text-2xl font-extrabold text-indigo-700">{formatINR(derived?.ltv ?? data.lifetimeValue)}</p>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between"><dt className="text-slate-500">Health</dt><dd className="flex items-center gap-2">{hm && (<><div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full" style={{ width: `${derived?.health.score}%`, background: hm.color }} /></div><span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: hm.bg, color: hm.color }}>{hm.label}</span></>)}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-500">Total Rentals</dt><dd className="font-semibold text-slate-800">{data.totalOrders}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-500">Active Rentals</dt><dd className="font-semibold text-slate-800">{derived?.activeRentals ?? '—'}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-500">Verification</dt><dd>{derived?.verification === 'verified' ? <span className="inline-flex items-center gap-1 text-emerald-600"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span> : derived?.verification === 'partial' ? <span className="inline-flex items-center gap-1 text-amber-600"><ShieldAlert className="h-3.5 w-3.5" /> Partial</span> : <span className="text-slate-400">Unverified</span>}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-500">Last Active</dt><dd className="text-slate-700">{formatRelative(derived?.lastActive)}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-500">Member Since</dt><dd className="text-slate-700">{formatDate(derived?.memberSince)}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-500">Preferred Payment</dt><dd className="text-slate-400">—</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-500">Preferred Category</dt><dd className="text-slate-400">—</dd></div>
            </dl>

            {derived && (
              <div className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                <Sparkles className="mr-1 inline h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold text-slate-700">Suggested:</span> {derived.recommendedAction.label}
              </div>
            )}
          </div>
        </aside>

        {/* ---------------- CENTER: tabs ---------------- */}
        <section className="min-w-0">
          <Tabs defaultValue="rentals" className="w-full">
            <TabsList className="mb-4 flex flex-wrap gap-1">
              <TabsTrigger value="rentals"><ShoppingBag className="mr-1 h-3.5 w-3.5" />Rentals ({rentals.length})</TabsTrigger>
              <TabsTrigger value="payments"><CreditCard className="mr-1 h-3.5 w-3.5" />Payments ({payments.length})</TabsTrigger>
              <TabsTrigger value="tickets"><LifeBuoy className="mr-1 h-3.5 w-3.5" />Tickets ({tickets.length})</TabsTrigger>
              <TabsTrigger value="wishlist"><Heart className="mr-1 h-3.5 w-3.5" />Wishlist ({wishlist.length})</TabsTrigger>
              <TabsTrigger value="favorites"><Heart className="mr-1 h-3.5 w-3.5" />Favorites ({favorites.length})</TabsTrigger>
              <TabsTrigger value="recent"><Eye className="mr-1 h-3.5 w-3.5" />Viewed ({recent.length})</TabsTrigger>
              <TabsTrigger value="activity"><Activity className="mr-1 h-3.5 w-3.5" />Activity ({events.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="rentals">
              <RentalTimeline rentals={rentals} />
            </TabsContent>
            <TabsContent value="payments">
              <SimpleTable
                empty="No payments yet"
                headers={['Date', 'Amount', 'Invoice', 'Method', 'Transaction ID', 'Status', 'Refund']}
                rows={payments.map((p) => [formatDate(p.createdAt), formatINR(p.amount ?? 0), p.invoice ?? '—', p.method ?? '—', p.transactionId ?? '—', pill(p.status), p.refundStatus ?? '—'])}
              />
            </TabsContent>
            <TabsContent value="tickets">
              <SimpleTable
                empty="No support tickets"
                headers={['Subject', 'Priority', 'Status', 'Assigned Agent', 'Created']}
                rows={tickets.map((t) => [t.subject ?? '—', pill(t.priority), pill(t.status), t.assignedAgent ?? 'Unassigned', formatDate(t.createdAt)])}
              />
            </TabsContent>
            <TabsContent value="wishlist"><ProductGrid items={wishlist} empty="No wishlist items" /></TabsContent>
            <TabsContent value="favorites"><ProductGrid items={favorites} empty="No favorite products" /></TabsContent>
            <TabsContent value="recent">
              {recent.length ? (
                <ul className="space-y-2">
                  {recent.map((v) => (
                    <li key={v._id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
                      <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Eye className="h-4 w-4" /></div><span className="font-medium text-slate-800">{v.name ?? 'Product'}</span></div>
                      <div className="text-right text-xs text-slate-500"><p>{v.views ?? 0} views</p><p>{formatRelative(v.lastViewed)}</p></div>
                    </li>
                  ))}
                </ul>
              ) : <EmptyHint text="No recently viewed products" />}
            </TabsContent>
            <TabsContent value="activity">
              {events.length ? (
                <ul className="space-y-0">
                  {events.map((e) => (
                    <li key={e._id} className="flex gap-3 border-l-2 border-indigo-100 py-3 pl-4">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                      <div><p className="text-sm font-medium text-slate-800">{String(e.eventType ?? 'event').replace(/_/g, ' ')}</p><p className="text-xs text-slate-400">{formatRelative(e.createdAt)}</p></div>
                    </li>
                  ))}
                </ul>
              ) : <EmptyHint text="No recent activity" />}
            </TabsContent>
          </Tabs>
        </section>

        {/* ---------------- RIGHT: actions ---------------- */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button className="w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => setEmailOpen(true)}><Mail className="h-4 w-4" /> Send Email</Button>
              <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setOfferOpen(true)}><Gift className="h-4 w-4" /> Create Personalized Offer</Button>
              <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setOfferOpen(true)}><Ticket className="h-4 w-4" /> Create Coupon</Button>
              <Button className="w-full justify-start gap-2" variant="outline" onClick={exportCustomer}><Download className="h-4 w-4" /> Export Customer</Button>
              <Button className="w-full justify-start gap-2" variant="outline" onClick={addFollowup}><CalendarClock className="h-4 w-4" /> Schedule Follow-up</Button>
              <Button className="w-full justify-start gap-2" variant="outline" onClick={() => document.getElementById('crm-note')?.focus()}><StickyNote className="h-4 w-4" /> Add Internal Note</Button>
              <Button className="w-full justify-start gap-2" variant="outline" onClick={assignSegment}><Award className="h-4 w-4" /> Assign Segment</Button>
              <div className="flex gap-2">
                <Input placeholder="Add tag…" value={tagInput} onChange={(e) => setTagInput(e.target.value)} className="h-9 text-sm" />
                <Button size="sm" variant="outline" onClick={addTag}><Tag className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            {tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1"><Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{tags.join(', ')}</Badge></div>}
            <div className="mt-3">
              <Label className="text-xs">Segment</Label>
              <Select value={segPick} onValueChange={(v) => setSegPick(v as CustomerSegmentKey)}>
                <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{CUSTOMER_SEGMENTS.filter((s) => s.key !== 'all').map((s) => (<SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900"><StickyNote className="h-4 w-4 text-indigo-500" /> Internal Notes</h3>
            <Textarea id="crm-note" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Private notes (stored locally)…" className="text-sm" />
            <Button size="sm" className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700" onClick={saveNotes}>Save Note</Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900"><CalendarClock className="h-4 w-4 text-indigo-500" /> Follow-ups</h3>
            <div className="flex gap-2">
              <Input placeholder="e.g. Call on Mon" value={followInput} onChange={(e) => setFollowInput(e.target.value)} className="h-9 text-sm" />
              <Button size="sm" variant="outline" onClick={addFollowup}><CalendarClock className="h-3.5 w-3.5" /></Button>
            </div>
            {followups.length > 0 && <ul className="mt-2 space-y-1 text-xs text-slate-600">{followups.map((f, i) => (<li key={i} className="rounded bg-slate-50 px-2 py-1">• {f}</li>))}</ul>}
          </div>
        </aside>
      </div>

      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg"><CheckCheck className="h-4 w-4 text-emerald-400" /> {toast}</div>}

      {/* Email dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Send Email to {name}</DialogTitle><DialogDescription>{profile.email}</DialogDescription></DialogHeader>
          <EmailComposer
            recipientName={name}
            ltv={derived ? String(Math.round(derived.ltv)) : undefined}
            loading={emailM.isPending}
            submitLabel="Send Email"
            onSubmit={(s, b) => emailM.mutate({ subject: s, body: b })}
          />
        </DialogContent>
      </Dialog>

      {/* Offer / coupon dialog */}
      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Offer / Coupon</DialogTitle><DialogDescription>For customer {name}</DialogDescription></DialogHeader>
          <OfferForm loading={offerM.isPending} onSubmit={(v) => offerM.mutate(v)} />
        </DialogContent>
      </Dialog>
    </IntelligencePageShell>
  )
}

/* ----------------------------- sub-components ----------------------------- */
function EmptyHint({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">{text}</div>
}

function SimpleTable({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (!rows.length) return <EmptyHint text={empty} />
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>{headers.map((h) => (<th key={h} className="whitespace-nowrap px-4 py-3">{h}</th>))}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{rows.map((r, i) => (<tr key={i}>{r.map((c, j) => (<td key={j} className="whitespace-nowrap px-4 py-3 text-slate-700">{c}</td>))}</tr>))}</tbody>
      </table>
    </div>
  )
}

function ProductGrid({ items, empty }: { items: WishDoc[]; empty: string }) {
  if (!items.length) return <EmptyHint text={empty} />
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((w) => {
        const p = w.product
        return (
          <div key={w._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex h-24 items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 text-2xl font-bold text-indigo-300">{initials(p?.basicInfo?.name || 'P')}</div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold text-slate-800">{p?.basicInfo?.name ?? 'Product'}</p>
              <p className="mt-0.5 text-xs text-slate-500">{formatCompactINR(p?.pricing?.monthlyRent ?? 0)}/mo</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RentalTimeline({ rentals }: { rentals: RentalDoc[] }) {
  if (!rentals.length) return <EmptyHint text="No rentals yet" />
  return (
    <div className="space-y-3">
      {rentals.map((r) => (
        <div key={r._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-indigo-500" />
              <span className="font-semibold text-slate-800">{r.product?.basicInfo?.name ?? 'Rental'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {pill(r.status)}
              {pill(r.paymentStatus || r.payment?.status)}
              {pill(r.deliveryStatus || r.delivery?.status)}
              {pill(r.returnStatus || r.return?.status)}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4">
            <div><span className="block font-medium text-slate-400">Period</span>{formatDate(r.rentalDetails?.startDate)} – {formatDate(r.rentalDetails?.endDate)}</div>
            <div><span className="block font-medium text-slate-400">Amount</span>{formatINR(r.rentalDetails?.totalAmount ?? 0)}</div>
            <div><span className="block font-medium text-slate-400">Deposit</span>{formatINR(r.rentalDetails?.deposit ?? 0)}</div>
            <div><span className="block font-medium text-slate-400">Created</span>{formatDate(r.createdAt)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function OfferForm({ loading, onSubmit }: { loading: boolean; onSubmit: (v: { name: string; code: string; type: string; value: number; days: number }) => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('percentage')
  const [value, setValue] = useState(10)
  const [days, setDays] = useState(30)
  const code = name ? name.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 12) : ''
  return (
    <div className="space-y-3">
      <div className="space-y-1"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Saver" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Type</Label>
          <Select value={type} onValueChange={setType}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed</SelectItem><SelectItem value="free_delivery">Free Delivery</SelectItem><SelectItem value="first_rental">First Rental</SelectItem>
          </SelectContent></Select>
        </div>
        <div className="space-y-1"><Label>{type === 'fixed' ? 'Amount (₹)' : 'Value (%)'}</Label><Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} /></div>
      </div>
      <div className="space-y-1"><Label>Validity (days)</Label><Input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} /></div>
      <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-500">Code: <span className="font-semibold text-slate-700">{code || '—'}</span></div>
      <Button className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={!name || loading} onClick={() => onSubmit({ name, code, type, value, days })}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />} Create</Button>
    </div>
  )
}
