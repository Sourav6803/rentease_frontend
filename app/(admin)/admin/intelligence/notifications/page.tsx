'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  RefreshCw,
  Download,
  Send,
  Bell,
  Settings,
  Activity,
  Zap,
  Mail,
  MessageSquare,
  Smartphone,
  AppWindow,
  MessageCircle,
  Plus,
  Trash2,
  Copy,
  Eye,
  Play,
  Pause,
  Search,
  Filter,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  MousePointerClick,
  Inbox,
  LayoutTemplate,
  Server,
  Globe,
  ExternalLink,
  TestTube2,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  notificationApi,
  getNotificationOverview,
  sendTestNotification,
  resendFailedNotification,
  cleanupOldNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/api/admin-intelligence'
import {
  IntelligencePageShell,
  KpiGrid,
  ChartCard,
  DataTable,
  StatusBadge,
  EmptyState,
  DateRangePicker,
  TrendPill,
  NotificationSkeleton,
  NotificationEmptyState,
  NotificationFilterBar,
  ChannelStatusPanel,
  ComposePanel,
  PreviewPanel,
  TemplateGrid,
  TemplateEditor,
  NotificationTable,
  NotificationDrawer,
  AnalyticsPanel,
  CampaignDrawer,
} from '@/components/admin/intelligence'
import type {
  NotificationRecordExtended,
  NotificationOverview,
  NotificationFilter,
  NotificationTemplate,
  NotificationPreference,
  BroadcastPayload,
  ChannelStatus,
  CampaignPerformance,
  DeliveryTimelinePoint,
  Period,
  KpiCardItem,
} from '@/types/admin-intelligence.types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const CHANNEL_META = {
  email: { label: 'Email', color: '#4f46e5', icon: Mail },
  sms: { label: 'SMS', color: '#059669', icon: MessageSquare },
  push: { label: 'Push', color: '#7c3aed', icon: Smartphone },
  in_app: { label: 'In-App', color: '#2563eb', icon: AppWindow },
  whatsapp: { label: 'WhatsApp', color: '#d97706', icon: MessageCircle },
} as const

type ChannelKey = keyof typeof CHANNEL_META

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '15d', label: '15 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
  { value: 'custom', label: 'Custom' },
]

function fmtDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.round(seconds % 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function fmt(n: number) {
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const STATIC_CHANNEL_STATUS: ChannelStatus[] = [
  { channel: 'email', status: 'connected', lastSync: new Date(Date.now() - 120000).toISOString(), latency: 240, errors24h: 0, queuedMessages: 12, successRate: 99.2 },
  { channel: 'sms', status: 'connected', lastSync: new Date(Date.now() - 180000).toISOString(), latency: 310, errors24h: 1, queuedMessages: 3, successRate: 98.7 },
  { channel: 'push', status: 'connected', lastSync: new Date(Date.now() - 60000).toISOString(), latency: 85, errors24h: 0, queuedMessages: 0, successRate: 99.9 },
  { channel: 'in_app', status: 'connected', lastSync: new Date(Date.now() - 30000).toISOString(), latency: 12, errors24h: 0, queuedMessages: 0, successRate: 100 },
  { channel: 'whatsapp', status: 'beta', lastSync: new Date(Date.now() - 300000).toISOString(), latency: 450, errors24h: 3, queuedMessages: 7, successRate: 94.5 },
]

const STATIC_OVERVIEW: NotificationOverview = {
  totalSent: 18420,
  delivered: 17580,
  opened: 11240,
  clicked: 4210,
  failed: 450,
  ctr: 23.8,
  deliveryRate: 95.4,
  avgDeliveryTimeSeconds: 1.8,
  pendingQueue: 23,
}

const STATIC_TIMELINE: DeliveryTimelinePoint[] = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
  sent: 800 + Math.round(Math.random() * 400),
  delivered: 750 + Math.round(Math.random() * 350),
  failed: Math.round(Math.random() * 30),
}))

const STATIC_CAMPAIGNS: CampaignPerformance[] = [
  { _id: '1', title: 'Summer Sale Blast', type: 'email', totalSent: 12450, delivered: 12120, opened: 8430, clicked: 2108, failed: 120, deliveryRate: 97.3, openRate: 69.5, clickRate: 17.4, sentAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { _id: '2', title: 'Flash Sale Weekend', type: 'push', totalSent: 8900, delivered: 8850, opened: 6230, clicked: 1890, failed: 50, deliveryRate: 99.4, openRate: 70.4, clickRate: 23.1, sentAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  { _id: '3', title: 'New Arrivals', type: 'email', totalSent: 5600, delivered: 5420, opened: 3240, clicked: 890, failed: 180, deliveryRate: 96.8, openRate: 59.8, clickRate: 15.9, sentAt: new Date(Date.now() - 86400000 * 12).toISOString() },
]

const STATIC_TEMPLATES: NotificationTemplate[] = [
  { _id: 't1', name: 'Welcome Email', slug: 'welcome-email', subject: 'Welcome to RentEase, {{firstName}}!', message: 'Start renting premium furniture today.', htmlBody: '<p>Welcome to RentEase, {{firstName}}!</p>', channels: ['email'], category: 'onboarding', variables: ['firstName'], usageCount: 12450, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { _id: 't2', name: 'Cart Abandoned', slug: 'cart-abandoned', subject: 'Your cart is waiting', message: 'Complete your rental before it expires.', htmlBody: '<p>Your cart is waiting, {{firstName}}</p>', channels: ['email', 'push'], category: 'reminder', variables: ['firstName', 'cartItems'], usageCount: 8900, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-05-15T00:00:00Z' },
  { _id: 't3', name: 'Flash Sale Alert', slug: 'flash-sale', subject: 'Flash Sale: {{discount}}% off', message: 'Hurry, sale ends soon!', htmlBody: '<p>Flash Sale: {{discount}}% off all items</p>', channels: ['email', 'sms', 'push'], category: 'promotional', variables: ['discount', 'endTime'], usageCount: 5600, isActive: true, createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-06-10T00:00:00Z' },
  { _id: 't4', name: 'Booking Confirmed', slug: 'booking-confirmed', subject: 'Booking #{{bookingId}} confirmed', message: 'Your rental has been confirmed.', htmlBody: '<p>Booking #{{bookingId}} confirmed</p>', channels: ['email', 'sms', 'in_app'], category: 'transactional', variables: ['bookingId', 'deliveryDate'], usageCount: 34200, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-04-20T00:00:00Z' },
  { _id: 't5', name: 'Delivery Update', slug: 'delivery-update', subject: 'Your order is out for delivery', message: 'Track your delivery in real-time.', htmlBody: '<p>Your order is out for delivery</p>', channels: ['sms', 'in_app'], category: 'alert', variables: ['trackingId'], usageCount: 21000, isActive: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-03-01T00:00:00Z' },
]

function buildEventLog(): NotificationRecordExtended[] {
  const events: NotificationRecordExtended[] = []
  const types: ChannelKey[] = ['email', 'sms', 'push', 'in_app', 'whatsapp']
  const statuses = ['sent', 'delivered', 'read', 'clicked', 'failed', 'pending', 'queued']
  const audiences = ['all', 'users', 'vendors', 'partners']
  const senders = ['System', 'Admin', 'Marketing', 'Support']

  for (let i = 0; i < 35; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    events.push({
      _id: `not-${i}`,
      user: `u${Math.floor(Math.random() * 5000)}`,
      type,
      title: `${CHANNEL_META[type].label} notification #${i + 1}`,
      message: 'Sample notification message body.',
      status,
      isRead: status === 'read' || status === 'clicked',
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 604800000)).toISOString(),
      channel: type,
      recipient: `user${i}@example.com`,
      subject: `Notification #${i + 1}`,
      scheduledAt: status === 'pending' || status === 'queued' ? new Date(Date.now() + Math.floor(Math.random() * 86400000)).toISOString() : undefined,
      sentAt: ['sent', 'delivered', 'read', 'clicked', 'failed'].includes(status) ? new Date(Date.now() - Math.floor(Math.random() * 604800000)).toISOString() : undefined,
      deliveredAt: ['delivered', 'read', 'clicked'].includes(status) ? new Date(Date.now() - Math.floor(Math.random() * 604800000)).toISOString() : undefined,
      readAt: ['read', 'clicked'].includes(status) ? new Date(Date.now() - Math.floor(Math.random() * 604800000)).toISOString() : undefined,
      failedAt: status === 'failed' ? new Date(Date.now() - Math.floor(Math.random() * 604800000)).toISOString() : undefined,
      failureReason: status === 'failed' ? 'Invalid recipient address' : undefined,
      retryCount: status === 'failed' ? Math.floor(Math.random() * 3) : undefined,
      priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as NotificationRecordExtended['priority'],
      category: ['transactional', 'promotional', 'reminder', 'alert'][Math.floor(Math.random() * 4)],
      audience: audiences[Math.floor(Math.random() * audiences.length)],
      sender: senders[Math.floor(Math.random() * senders.length)],
    })
  }
  return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

const STATIC_EVENT_LOG = buildEventLog()

export default function IntelligenceNotificationsPage() {
  const queryClient = useQueryClient()
  const [period, setPeriod] = useState<Period>('30d')
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' })
  const [filters, setFilters] = useState<NotificationFilter>({})
  const [selectedRecord, setSelectedRecord] = useState<NotificationRecordExtended | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignPerformance | null>(null)
  const [campaignDrawerOpen, setCampaignDrawerOpen] = useState(false)
  const [editorTemplate, setEditorTemplate] = useState<NotificationTemplate | null>(null)
  const [composePayload, setComposePayload] = useState<Partial<BroadcastPayload>>({
    title: '',
    message: '',
    type: 'email',
    category: 'transactional',
    target: 'all',
    priority: 'medium',
  })
  const [isComposing, setIsComposing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [testType, setTestType] = useState('in_app')
  const [activeTab, setActiveTab] = useState('inbox')

  const overviewQ = useQuery({
    queryKey: ['ai', 'notifications', 'overview'],
    queryFn: getNotificationOverview,
    staleTime: 60_000,
  })

  const listQ = useQuery({
    queryKey: ['ai', 'notifications', 'list', filters, dateRange],
    queryFn: () => notificationApi.listAll({ page: 1, limit: 20, ...filters }),
    staleTime: 30_000,
  })

  const analyticsQ = useQuery({
    queryKey: ['ai', 'notifications', 'analytics'],
    queryFn: () => notificationApi.getAnalytics(),
    staleTime: 60_000,
  })

  const preferencesQ = useQuery({
    queryKey: ['ai', 'notifications', 'preferences'],
    queryFn: getNotificationPreferences,
    staleTime: 60_000,
  })

  const overview = overviewQ.data ?? STATIC_OVERVIEW
  const events = listQ.data?.notifications ?? STATIC_EVENT_LOG
  const analytics = analyticsQ.data
  const preferences = preferencesQ.data

  const kpiItems: KpiCardItem[] = useMemo(() => [
    { key: 'sent', title: 'Notifications Sent', value: fmt(overview.totalSent), icon: Send, accent: '#6366f1', sub: `${overview.delivered} delivered` },
    { key: 'delivered', title: 'Delivered', value: fmt(overview.delivered), icon: CheckCircle2, accent: '#10b981', sub: `${overview.deliveryRate.toFixed(1)}% rate` },
    { key: 'opened', title: 'Opened', value: fmt(overview.opened), icon: Eye, accent: '#8b5cf6', sub: `${overview.clicked} clicked` },
    { key: 'clicked', title: 'Clicked', value: fmt(overview.clicked), icon: MousePointerClick, accent: '#2563eb', trend: overview.ctr > 20 ? 'up' : 'down' },
    { key: 'failed', title: 'Failed', value: fmt(overview.failed), icon: XCircle, accent: '#ef4444', trend: 'down' },
    { key: 'ctr', title: 'Click Rate', value: `${overview.ctr.toFixed(1)}%`, icon: TrendingUp, accent: '#7c3aed' },
    { key: 'delivery', title: 'Delivery Rate', value: `${overview.deliveryRate.toFixed(1)}%`, icon: Activity, accent: '#059669' },
    { key: 'avg-time', title: 'Avg Delivery Time', value: fmtDuration(overview.avgDeliveryTimeSeconds), icon: Clock, accent: '#f59e0b' },
    { key: 'queue', title: 'Pending Queue', value: overview.pendingQueue, icon: Inbox, accent: '#d97706', sub: 'Awaiting send' },
  ], [overview])

  const sendTestM = useMutation({
    mutationFn: () => sendTestNotification(testType),
    onSuccess: () => toast.success('Test notification sent'),
    onError: () => toast.error('Failed to send test notification'),
  })

  const resendM = useMutation({
    mutationFn: (id: string) => resendFailedNotification(id),
    onSuccess: () => {
      toast.success('Resend initiated')
      listQ.refetch()
    },
  })

  const cleanupM = useMutation({
    mutationFn: (days: number) => cleanupOldNotifications(days),
    onSuccess: () => {
      toast.success('Old notifications cleaned up')
      listQ.refetch()
    },
  })

  const preferencesM = useMutation({
    mutationFn: (prefs: Partial<NotificationPreference>) => updateNotificationPreferences(prefs),
    onSuccess: () => {
      toast.success('Preferences updated')
      preferencesQ.refetch()
    },
  })

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            {PERIOD_OPTIONS.find((p) => p.value === period)?.label} <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {PERIOD_OPTIONS.map((p) => (
            <DropdownMenuItem key={p.value} onClick={() => setPeriod(p.value)}>
              {p.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DateRangePicker value={dateRange} onChange={setDateRange} className="h-8 text-xs" />
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => cleanupM.mutate(30)}>
        <Trash2 className="h-3.5 w-3.5" /> Cleanup
      </Button>
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => queryClient.invalidateQueries({ queryKey: ['ai', 'notifications'] })}>
        <RefreshCw className={cn('h-3.5 w-3.5', overviewQ.isFetching && 'animate-spin')} />
      </Button>
    </div>
  )

  const loading = overviewQ.isLoading && !overviewQ.data

  if (loading) {
    return (
      <IntelligencePageShell title="Notifications" subtitle="Monitor and manage all notifications across channels" actions={headerActions}>
        <NotificationSkeleton />
      </IntelligencePageShell>
    )
  }

  return (
    <IntelligencePageShell
      title="Notification Management"
      subtitle="Monitor delivery health, compose broadcasts, manage templates, and analyze engagement across all channels"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: 'Notifications' },
      ]}
      actions={headerActions}
    >
      {/* System Health Banner */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-blue-50 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">System Health</h3>
              <p className="text-xs text-slate-500">Real-time channel connectivity &amp; queue status</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {STATIC_CHANNEL_STATUS.map((ch) => {
              const meta = CHANNEL_META[ch.channel as ChannelKey] ?? CHANNEL_META.email
              const Icon = meta.icon
              const tone = ch.status === 'connected' ? '#059669' : ch.status === 'beta' ? '#d97706' : '#dc2626'
              return (
                <div key={ch.channel} className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-2 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${meta.color}18` }}>
                    <Icon className="h-4 w-4" style={{ color: meta.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{meta.label}</p>
                    <p className="text-[10px] font-medium" style={{ color: tone }}>{ch.status === 'connected' ? 'Connected' : ch.status === 'beta' ? 'Beta' : 'Down'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-white/60 bg-white/70 p-4 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Channel Details</p>
          <ChannelStatusPanel channels={STATIC_CHANNEL_STATUS} />
        </div>
      </div>

      {/* KPI Grid */}
      <KpiGrid items={kpiItems} columns={6} className="mb-6" />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-10 rounded-xl bg-slate-100 p-1">
            <TabsTrigger value="inbox" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <Inbox className="h-3.5 w-3.5" /> Inbox &amp; History
            </TabsTrigger>
            <TabsTrigger value="compose" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <Send className="h-3.5 w-3.5" /> Compose &amp; Broadcast
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <LayoutTemplate className="h-3.5 w-3.5" /> Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <BarChart3 className="h-3.5 w-3.5" /> Analytics
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIsComposing(true)}>
              <Plus className="h-3.5 w-3.5" /> New Broadcast
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => preferencesM.mutate({ email: !preferences?.email })}>
                  <Mail className="mr-2 h-3.5 w-3.5" /> Toggle Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => preferencesM.mutate({ sms: !preferences?.sms })}>
                  <MessageSquare className="mr-2 h-3.5 w-3.5" /> Toggle SMS
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => preferencesM.mutate({ push: !preferences?.push })}>
                  <Smartphone className="mr-2 h-3.5 w-3.5" /> Toggle Push
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* INBOX TAB */}
        <TabsContent value="inbox" className="space-y-4">
          <NotificationFilterBar
            value={filters}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onChange={setFilters}
            onReset={() => setFilters({})}
          />
          <NotificationTable
            records={events as NotificationRecordExtended[]}
            loading={listQ.isLoading}
            onRowClick={(r: NotificationRecordExtended) => { setSelectedRecord(r); setDrawerOpen(true) }}
            onResend={(r: NotificationRecordExtended) => resendM.mutate(r._id)}
            onCopyId={(r: NotificationRecordExtended) => { navigator.clipboard.writeText(r._id); toast('ID copied') }}
          />
          <NotificationDrawer
            record={selectedRecord}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
          />
        </TabsContent>

        {/* COMPOSE TAB */}
        <TabsContent value="compose" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ComposePanel
              value={composePayload}
              onChange={setComposePayload}
              onSend={(payload: BroadcastPayload) => {
                toast.success(`Broadcast sent to ${payload.target}`)
                setComposePayload({ title: '', message: '', type: 'email', category: 'transactional', target: 'all', priority: 'medium' })
              }}
              onPreview={(payload: BroadcastPayload) => { setComposePayload(payload); setShowPreview(true) }}
            />
            <PreviewPanel payload={composePayload} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setTestType('in_app')}>
              <TestTube2 className="h-3.5 w-3.5" /> Test In-App
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setTestType('email')}>
              <TestTube2 className="h-3.5 w-3.5" /> Test Email
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setTestType('push')}>
              <TestTube2 className="h-3.5 w-3.5" /> Test Push
            </Button>
            <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700" disabled={sendTestM.isPending} onClick={() => sendTestM.mutate()}>
              {sendTestM.isPending ? <Clock className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Send Test
            </Button>
          </div>
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="space-y-4">
          <TemplateGrid
            templates={STATIC_TEMPLATES}
            onUse={(t: NotificationTemplate) => toast(`Using template: ${t.name}`)}
            onEdit={(t: NotificationTemplate) => setEditorTemplate(t)}
            onDuplicate={(t: NotificationTemplate) => toast('Template duplicated')}
            onDelete={(t: NotificationTemplate) => toast('Template deleted')}
            onToggle={(t: NotificationTemplate, next: boolean) => toast(`${t.name} ${next ? 'activated' : 'paused'}`)}
            onPreview={(t: NotificationTemplate) => toast(`Preview: ${t.name}`)}
            onCreate={() => setEditorTemplate(null)}
          />
          <TemplateEditor
            template={editorTemplate}
            open={!!editorTemplate}
            onOpenChange={(o: boolean) => !o && setEditorTemplate(null)}
            onSave={(_t: NotificationTemplate) => {
              toast(editorTemplate ? 'Template updated' : 'Template created')
              setEditorTemplate(null)
            }}
          />
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsPanel
            overview={overview}
            timeline={STATIC_TIMELINE}
            campaigns={STATIC_CAMPAIGNS}
          />
          <CampaignDrawer
            campaign={selectedCampaign}
            open={campaignDrawerOpen}
            onOpenChange={setCampaignDrawerOpen}
            onResend={(c: CampaignPerformance) => toast(`Resend ${c.title}`)}
            onDuplicate={(c: CampaignPerformance) => toast(`Duplicate ${c.title}`)}
          />
        </TabsContent>
      </Tabs>
    </IntelligencePageShell>
  )
}
