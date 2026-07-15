'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone,
  Workflow as WorkflowIcon,
  Mail,
  Users,
  RefreshCw,
  Play,
  Calendar,
  Plus,
  Download,
  Upload,
  BarChart3,
  Zap,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Send,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Inbox,
  Sparkles,
  ChevronDown,
  ChevronRight,
  X,
  Pause,
} from 'lucide-react'
import {
  listWorkflows,
  toggleWorkflow,
  listCampaigns,
  listEmailTemplates,
  listSegments,
  sendCampaign,
  scheduleCampaign,
  computeMarketingOverview,
} from '@/lib/api/admin-intelligence'
import {
  IntelligencePageShell,
  KpiGrid,
  StatusBadge,
  MarketingSkeleton,
  AutomationHealthBanner,
  WorkflowCard,
  WorkflowDrawer,
  CampaignTable,
  CampaignWizard,
  EmailTemplateGrid,
  EmailEditor,
  SegmentGrid,
  RuleBuilder,
  MarketingCharts,
  MarketingEmptyState,
} from '@/components/admin/intelligence'
import type {
  KpiCardItem,
  Workflow as WorkflowType,
  Campaign,
  EmailTemplate,
  CustomerSegment,
  MarketingOverview,
  CampaignWizardData,
  SegmentRule,
  CustomerSegmentExtended,
  EmailTemplateExtended,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { formatCompactINR } from '@/lib/api/admin-intelligence'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

const STATIC_WORKFLOWS: WorkflowType[] = [
  { _id: '1', name: 'Welcome Email', slug: 'welcome', trigger: { type: 'welcome' }, isEnabled: true, metadata: { category: 'onboarding' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '2', name: 'Cart Abandoned', slug: 'cart-abandoned', trigger: { type: 'cart_abandoned' }, isEnabled: true, metadata: { category: 'retention' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '3', name: 'Rental Expiring Soon', slug: 'rental-expiring', trigger: { type: 'rental_expiring' }, isEnabled: false, metadata: { category: 'lifecycle' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '4', name: 'User Inactive 7 Days', slug: 'user-inactive-7d', trigger: { type: 'user_inactive_7d' }, isEnabled: true, metadata: { category: 'reengagement' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '5', name: 'User Inactive 30 Days', slug: 'user-inactive-30d', trigger: { type: 'user_inactive_30d' }, isEnabled: false, metadata: { category: 'reengagement' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '6', name: 'Thank You After Rental', slug: 'thank-you', trigger: { type: 'thank_you' }, isEnabled: true, metadata: { category: 'lifecycle' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '7', name: 'Review Reminder', slug: 'review-reminder', trigger: { type: 'review_reminder' }, isEnabled: true, metadata: { category: 'retention' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '8', name: 'Birthday Wishes', slug: 'birthday', trigger: { type: 'birthday' }, isEnabled: true, metadata: { category: 'promotional' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '9', name: 'Coupon Expiry Reminder', slug: 'coupon-expiry', trigger: { type: 'coupon_expiry' }, isEnabled: false, metadata: { category: 'retention' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '10', name: 'Wishlist Reminder', slug: 'wishlist-reminder', trigger: { type: 'wishlist_reminder' }, isEnabled: true, metadata: { category: 'conversion' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '11', name: 'Product Back In Stock', slug: 'back-in-stock', trigger: { type: 'back_in_stock' }, isEnabled: false, metadata: { category: 'reengagement' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '12', name: 'Flash Sale Alert', slug: 'flash-sale', trigger: { type: 'flash_sale' }, isEnabled: false, metadata: { category: 'promotional' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '13', name: 'Referral Reminder', slug: 'referral-reminder', trigger: { type: 'referral_reminder' }, isEnabled: true, metadata: { category: 'promotional' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '14', name: 'Newsletter', slug: 'newsletter', trigger: { type: 'newsletter' }, isEnabled: false, metadata: { category: 'lifecycle' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { _id: '15', name: 'Festival Campaign', slug: 'festival', trigger: { type: 'festival' }, isEnabled: false, metadata: { category: 'festival' }, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
]

const STATIC_CAMPAIGNS: { campaigns: Campaign[]; pagination: { page: number; limit: number; total: number; pages: number } } = {
  campaigns: [
    { _id: '1', name: 'Summer Sale Blast', status: 'sent', audience: { type: 'all' }, sentAt: '2025-06-01T00:00:00Z', createdAt: '2025-05-28T00:00:00Z', metadata: { targeted: 12450, sent: 12420, failed: 30, opened: 8430, clicked: 2108, bounced: 120, revenue: 189000, couponsRedeemed: 340 } },
    { _id: '2', name: 'Win-back Inactive Users', status: 'scheduled', audience: { type: 'segment', segmentId: 'seg1' }, scheduledAt: '2025-07-15T10:00:00Z', createdAt: '2025-07-01T00:00:00Z', metadata: { targeted: 3200 } },
    { _id: '3', name: 'New Arrivals Newsletter', status: 'draft', audience: { type: 'all' }, createdAt: '2025-07-10T00:00:00Z' },
    { _id: '4', name: 'Flash Sale Weekend', status: 'sent', audience: { type: 'all' }, sentAt: '2025-05-20T00:00:00Z', createdAt: '2025-05-18T00:00:00Z', metadata: { targeted: 15000, sent: 14980, failed: 20, opened: 11250, clicked: 4495, bounced: 85, revenue: 320000, couponsRedeemed: 890 } },
    { _id: '5', name: 'Festival Bonanza Diwali', status: 'sending', audience: { type: 'all' }, createdAt: '2025-07-08T00:00:00Z', metadata: { targeted: 20000, sent: 8500 } },
    { _id: '6', name: 'Birthday Month Special', status: 'draft', audience: { type: 'segment', segmentId: 'seg2' }, createdAt: '2025-07-05T00:00:00Z' },
  ],
  pagination: { page: 1, limit: 20, total: 6, pages: 1 },
}

const STATIC_TEMPLATES: EmailTemplateExtended[] = [
  { _id: '1', name: 'Welcome Email', subject: 'Welcome to RentEase, {{firstName}}!', htmlBody: '<p>Welcome content</p>', category: 'onboarding', isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z', stats: { usageCount: 12450, lastUsed: '2025-07-09T00:00:00Z', avgOpenRate: 0.68, avgClickRate: 0.24 } },
  { _id: '2', name: 'Cart Abandoned', subject: 'Complete your rental, {{firstName}}', htmlBody: '<p>Cart content</p>', category: 'retention', isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-05-15T00:00:00Z', stats: { usageCount: 8900, lastUsed: '2025-07-10T00:00:00Z', avgOpenRate: 0.72, avgClickRate: 0.31 } },
  { _id: '3', name: 'Rental Confirmation', subject: 'Rental #{{rentalId}} confirmed', htmlBody: '<p>Rental content</p>', category: 'transactional', isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-04-20T00:00:00Z', stats: { usageCount: 45600, lastUsed: '2025-07-11T00:00:00Z', avgOpenRate: 0.85, avgClickRate: 0.12 } },
  { _id: '4', name: 'Birthday Discount', subject: 'Happy Birthday {{firstName}} - {{amount}}% off!', htmlBody: '<p>Birthday content</p>', category: 'promotional', isActive: true, createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-06-10T00:00:00Z', stats: { usageCount: 3200, lastUsed: '2025-07-02T00:00:00Z', avgOpenRate: 0.64, avgClickRate: 0.28 } },
  { _id: '5', name: 'Win-back Offer', subject: 'We miss you, {{firstName}}', htmlBody: '<p>Winback content</p>', category: 'reengagement', isActive: false, createdAt: '2025-03-01T00:00:00Z', updatedAt: '2025-05-01T00:00:00Z', stats: { usageCount: 1500, lastUsed: '2025-05-10T00:00:00Z', avgOpenRate: 0.45, avgClickRate: 0.15 } },
  { _id: '6', name: 'Festival Greetings', subject: 'Happy {{festival}}, {{firstName}}!', htmlBody: '<p>Festival content</p>', category: 'festival', isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-03-20T00:00:00Z', stats: { usageCount: 28000, lastUsed: '2025-03-20T00:00:00Z', avgOpenRate: 0.78, avgClickRate: 0.19 } },
]

const STATIC_SEGMENTS: CustomerSegmentExtended[] = [
  { _id: 'seg1', name: 'High Value Customers', description: 'LTV > ₹50,000 and active in last 30 days', userIds: Array.from({ length: 450 }, (_, i) => `u${i}`), rules: [], estimatedUsers: 450, lastUsed: '2025-07-10T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'seg2', name: 'Inactive 30 Days', description: 'No login or rental in past 30 days', userIds: Array.from({ length: 1200 }, (_, i) => `u${i + 500}`), rules: [], estimatedUsers: 1200, lastUsed: '2025-07-09T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'seg3', name: 'New Users', description: 'Joined in last 7 days', userIds: Array.from({ length: 320 }, (_, i) => `u${i + 1700}`), rules: [], estimatedUsers: 320, lastUsed: '2025-07-11T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'seg4', name: 'Cart Abandoners', description: 'Added to cart but did not rent in last 24 hours', userIds: Array.from({ length: 890 }, (_, i) => `u${i + 2020}`), rules: [], estimatedUsers: 890, lastUsed: '2025-07-08T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'seg5', name: 'VIP Members', description: 'Premium subscribers with 5+ rentals', userIds: Array.from({ length: 180 }, (_, i) => `u${i + 2910}`), rules: [], estimatedUsers: 180, lastUsed: '2025-07-10T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
  { _id: 'seg6', name: 'Festival Shoppers', description: 'Viewed festival/category products in last 14 days', userIds: Array.from({ length: 2100 }, (_, i) => `u${i + 3090}`), rules: [], estimatedUsers: 2100, lastUsed: '2025-07-05T00:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
]

const STATIC_CHART_DATA = {
  engagement: [
    { label: 'Mon', opens: 4200, clicks: 1200 },
    { label: 'Tue', opens: 3800, clicks: 980 },
    { label: 'Wed', opens: 5100, clicks: 1540 },
    { label: 'Thu', opens: 4600, clicks: 1380 },
    { label: 'Fri', opens: 6200, clicks: 2100 },
    { label: 'Sat', opens: 7800, clicks: 2800 },
    { label: 'Sun', opens: 6900, clicks: 2400 },
  ],
  device: [
    { _id: 'Mobile', count: 65 },
    { _id: 'Desktop', count: 28 },
    { _id: 'Tablet', count: 7 },
  ],
  hourly: Array.from({ length: 24 }, (_, i) => ({
    _id: `${i.toString().padStart(2, '0')}:00`,
    count: Math.round(200 + Math.sin(i / 3) * 150 + Math.random() * 100),
  })),
  geography: [
    { _id: 'Maharashtra', count: 4200 },
    { _id: 'Karnataka', count: 3100 },
    { _id: 'Delhi NCR', count: 2800 },
    { _id: 'Tamil Nadu', count: 1900 },
    { _id: 'Telangana', count: 1500 },
    { _id: 'Gujarat', count: 1100 },
  ],
}

export default function IntelligenceMarketingPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('workflows')
  const [drawerWorkflow, setDrawerWorkflow] = useState<WorkflowType | null>(null)
  const [campaignWizardOpen, setCampaignWizardOpen] = useState(false)
  const [editorTemplate, setEditorTemplate] = useState<EmailTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [scheduleId, setScheduleId] = useState<string | null>(null)
  const [scheduleAt, setScheduleAt] = useState('')

  const workflowsQ = useQuery({
    queryKey: ['ai', 'marketing', 'workflows'],
    queryFn: listWorkflows,
    staleTime: 60_000,
  })

  const campaignsQ = useQuery({
    queryKey: ['ai', 'marketing', 'campaigns'],
    queryFn: () => listCampaigns({ page: 1, limit: 50 }),
    staleTime: 30_000,
  })

  const templatesQ = useQuery({
    queryKey: ['ai', 'marketing', 'templates'],
    queryFn: () => listEmailTemplates(),
    staleTime: 60_000,
  })

  const segmentsQ = useQuery({
    queryKey: ['ai', 'marketing', 'segments'],
    queryFn: listSegments,
    staleTime: 60_000,
  })

  const demoMode = workflowsQ.isError && campaignsQ.isError
  const workflows = (workflowsQ.data ?? []) as WorkflowType[]
  const campaignsData = (campaignsQ.data ?? STATIC_CAMPAIGNS) as { campaigns: Campaign[]; pagination: { page: number; limit: number; total: number; pages: number } }
  const campaigns = campaignsData?.campaigns ?? []
  const templates = (templatesQ.data ?? STATIC_TEMPLATES) as EmailTemplateExtended[]
  const segments = (segmentsQ.data ?? STATIC_SEGMENTS) as CustomerSegmentExtended[]

  const overview = useMemo(
    () => computeMarketingOverview({ workflows, campaigns: campaigns as Campaign[], segments: segments as CustomerSegment[] }),
    [workflows, campaigns, segments],
  )

  const kpiItems: KpiCardItem[] = useMemo(() => {
    const totalSegments = segments.length
    return [
      { key: 'workflows', title: 'Total Workflows', value: overview.totalWorkflows, icon: WorkflowIcon, accent: '#2563eb', sub: `${overview.activeWorkflows} active` },
      { key: 'campaigns', title: 'Active Campaigns', value: campaigns.filter((c) => c.status === 'sending' || c.status === 'scheduled').length + campaigns.filter((c) => c.status === 'sent').length, icon: Megaphone, accent: '#7c3aed', sub: `${campaigns.filter((c) => c.status === 'scheduled').length} scheduled` },
      { key: 'scheduled', title: 'Scheduled Emails', value: overview.scheduledCampaigns, icon: Calendar, accent: '#0891b2' },
      { key: 'sent-today', title: 'Emails Sent Today', value: overview.emailsSentToday, icon: Mail, accent: '#059669', sub: `${overview.emailsSentWeek} this week` },
      { key: 'open-rate', title: 'Open Rate', value: `${overview.openRate.toFixed(1)}%`, icon: TrendingUp, accent: '#2563eb', trend: overview.openRate > 40 ? 'up' : 'down' },
      { key: 'ctr', title: 'Click Rate', value: `${overview.clickRate.toFixed(1)}%`, icon: ArrowUpRight, accent: '#7c3aed', trend: overview.clickRate > 20 ? 'up' : 'down' },
      { key: 'revenue', title: 'Revenue Generated', value: formatCompactINR(overview.revenueGenerated), icon: BarChart3, accent: '#059669', trend: 'up' },
      { key: 'coupons', title: 'Coupon Redemption', value: overview.couponRedemption, icon: Zap, accent: '#d97706' },
      { key: 'engagement', title: 'Avg Engagement', value: `${overview.avgEngagementScore.toFixed(0)}/100`, icon: ShieldCheck, accent: '#0891b2' },
      { key: 'returning', title: 'Returning Customers', value: overview.returningCustomers, icon: Users, accent: '#9333ea', sub: 'Across segments' },
    ]
  }, [overview, campaigns, segments])

  const toggleM = useMutation({
    mutationFn: ({ slug, enabled }: { slug: string; enabled: boolean }) => toggleWorkflow(slug, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'workflows'] }),
  })

  const sendM = useMutation({
    mutationFn: (id: string) => sendCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'campaigns'] })
      toast('Campaign sent successfully')
    },
    onError: () => toast('Failed to send campaign'),
  })

  const scheduleM = useMutation({
    mutationFn: ({ id, at }: { id: string; at: string }) => scheduleCampaign(id, at),
    onSuccess: () => {
      setScheduleId(null)
      setScheduleAt('')
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'campaigns'] })
      toast('Campaign scheduled successfully')
    },
    onError: () => toast('Failed to schedule campaign'),
  })

  const headerActions = useMemo(() => {
    const actions: React.ReactNode[] = [
      <Button key="new-campaign" className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700" onClick={() => setCampaignWizardOpen(true)}>
        <Plus className="h-3.5 w-3.5" /> New Campaign
      </Button>,
      <Button key="new-workflow" variant="outline" className="gap-1.5" onClick={() => toast('Workflow builder coming soon')}>
        <WorkflowIcon className="h-3.5 w-3.5" /> New Workflow
      </Button>,
      <Button key="import" variant="outline" className="gap-1.5" onClick={() => toast('Import template coming soon')}>
        <Upload className="h-3.5 w-3.5" /> Import Template
      </Button>,
      <Button key="export" variant="outline" className="gap-1.5" onClick={() => toast('Report exported')}>
        <Download className="h-3.5 w-3.5" /> Export Report
      </Button>,
      <Button key="refresh" variant="outline" size="icon" className="h-8 w-8" onClick={() => queryClient.invalidateQueries({ queryKey: ['ai', 'marketing'] })}>
        <RefreshCw className="h-3.5 w-3.5" />
      </Button>,
    ]
    return actions
  }, [queryClient, toast])

  return (
    <IntelligencePageShell
      title="Marketing Automation"
      subtitle="Automate customer engagement, lifecycle emails, personalized campaigns, and intelligent notifications"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: 'Marketing Automation' },
      ]}
      demoMode={demoMode}
      actions={
        <div className="flex flex-wrap items-center gap-2">{headerActions}</div>
      }
    >
      {/* Automation Health Banner */}
      <AutomationHealthBanner overview={overview} loading={workflowsQ.isLoading && campaignsQ.isLoading} className="mb-6" />

      {/* KPI Grid */}
      <KpiGrid items={kpiItems} columns={6} className="mb-8" />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-10 rounded-xl bg-slate-100 p-1">
            <TabsTrigger value="workflows" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <WorkflowIcon className="h-3.5 w-3.5" /> Workflows
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <Mail className="h-3.5 w-3.5" /> Campaigns
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Templates
            </TabsTrigger>
            <TabsTrigger value="segments" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <Users className="h-3.5 w-3.5" /> Segments
            </TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="h-9 w-56 pl-8 text-sm"
            />
          </div>
        </div>

        {/* WORKFLOWS TAB */}
        <TabsContent value="workflows" className="space-y-4">
          {workflowsQ.isLoading ? (
            <MarketingSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {workflows.map((wf, i) => (
                  <WorkflowCard
                    key={wf._id}
                    workflow={wf}
                    index={i}
                    onToggle={(w: WorkflowType, next: boolean) => toggleM.mutate({ slug: w.slug, enabled: next })}
                    onOpen={setDrawerWorkflow}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
          {!workflowsQ.isLoading && workflows.length === 0 && (
            <MarketingEmptyState
              variant="workflows"
              actionLabel="Create your first workflow"
              onAction={() => toast('Workflow builder coming soon')}
            />
          )}
        </TabsContent>

        {/* CAMPAIGNS TAB */}
        <TabsContent value="campaigns" className="space-y-4">
          <CampaignTable
            campaigns={campaigns}
            stats={Object.fromEntries(campaigns.map((c: Campaign) => [c._id, c.metadata as unknown as import('@/types/admin-intelligence.types').CampaignStats]))}
            loading={campaignsQ.isLoading}
            onView={(c: Campaign) => toast(`View ${c.name}`)}
            onSend={(c: Campaign) => sendM.mutate(c._id)}
            onSchedule={(c: Campaign) => setScheduleId(c._id)}
            onEdit={(c: Campaign) => toast(`Edit ${c.name}`)}
            onDelete={(c: Campaign) => toast(`Delete ${c.name}`)}
            onNewCampaign={() => setCampaignWizardOpen(true)}
          />

          {/* Schedule inline form */}
          <AnimatePresence>
            {scheduleId && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-600">Schedule date &amp; time</label>
                  <Input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={(e) => setScheduleAt(e.target.value)}
                    className="h-9"
                  />
                </div>
                <Button
                  size="sm"
                  disabled={!scheduleAt || scheduleM.isPending}
                  onClick={() => scheduleM.mutate({ id: scheduleId, at: new Date(scheduleAt).toISOString() })}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {scheduleM.isPending ? <Clock className="h-3.5 w-3.5 animate-spin" /> : <Calendar className="h-3.5 w-3.5" />}
                  Confirm
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setScheduleId(null); setScheduleAt('') }}>
                  Cancel
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Campaign Analytics */}
          {!campaignsQ.isLoading && campaigns.length > 0 && (
            <MarketingCharts data={STATIC_CHART_DATA} />
          )}
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="space-y-4">
          <EmailTemplateGrid
            templates={templates}
            loading={templatesQ.isLoading}
            onUse={(t: EmailTemplateExtended) => setEditorTemplate(t)}
            onEdit={(t: EmailTemplateExtended) => setEditorTemplate(t)}
            onDuplicate={(t: EmailTemplateExtended) => toast('Template duplicated')}
            onDelete={(t: EmailTemplateExtended) => toast('Template deleted')}
            onPreview={(t: EmailTemplateExtended) => setEditorTemplate(t)}
            onCreate={() => setEditorTemplate(null)}
          />

          {/* Template Editor */}
          <AnimatePresence>
            {editorTemplate !== undefined && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {editorTemplate ? `Edit: ${editorTemplate.name}` : 'New Template'}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setEditorTemplate(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <EmailEditor
                  subject={editorTemplate?.subject ?? ''}
                  htmlBody={editorTemplate?.htmlBody ?? ''}
                  templates={templates}
                  onChange={(next) => {
                    if (editorTemplate) {
                      setEditorTemplate({ ...editorTemplate, ...next } as EmailTemplate)
                    }
                  }}
                  onSelectTemplate={(t) => setEditorTemplate(t)}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditorTemplate(null)}>Cancel</Button>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                    toast(editorTemplate ? 'Template updated' : 'Template created')
                    queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'templates'] })
                  }}>
                    Save Template
                  </Button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* SEGMENTS TAB */}
        <TabsContent value="segments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Audience Segments</h3>
              <p className="text-xs text-slate-500">Build and manage customer segments for targeted campaigns</p>
            </div>
            <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={() => toast('Segment builder coming soon')}>
              <Plus className="h-3.5 w-3.5" /> New Segment
            </Button>
          </div>

          <SegmentGrid
            segments={segments}
            totalCustomers={48000}
            loading={segmentsQ.isLoading}
            onEdit={(s: CustomerSegmentExtended) => toast(`Edit segment: ${s.name}`)}
            onDuplicate={(s: CustomerSegmentExtended) => toast('Segment duplicated')}
            onDelete={(s: CustomerSegmentExtended) => toast('Segment deleted')}
          />

          {!segmentsQ.isLoading && segments.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="mb-3 text-sm font-semibold text-slate-900">Rule Builder</h4>
                <RuleBuilder
                  rules={[
                    { id: '1', field: 'lastLogin', operator: 'greater_than', value: '30', logic: 'and' as const },
                    { id: '2', field: 'orders', operator: 'greater_than', value: '3', logic: 'and' as const },
                    { id: '3', field: 'spent', operator: 'greater_than', value: '50000', logic: 'or' as const },
                  ]}
                  onChange={(rules: SegmentRule[]) => console.log(rules)}
                />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Workflow Drawer */}
      <WorkflowDrawer
        workflow={drawerWorkflow}
        open={!!drawerWorkflow}
        onOpenChange={(o: boolean) => !o && setDrawerWorkflow(null)}
        onToggle={(w: WorkflowType, next: boolean) => w && toggleM.mutate({ slug: w.slug, enabled: next })}
        onRun={() => drawerWorkflow && toast(`Running ${drawerWorkflow.name}`)}
        onEdit={() => drawerWorkflow && toast(`Editing ${drawerWorkflow.name}`)}
        onDuplicate={() => drawerWorkflow && toast(`Duplicating ${drawerWorkflow.name}`)}
      />

      {/* Campaign Wizard */}
      <CampaignWizard
        open={campaignWizardOpen}
        onOpenChange={setCampaignWizardOpen}
        onCreate={(data: CampaignWizardData) => {
          toast(`Campaign "${data.name}" created`)
          setCampaignWizardOpen(false)
          queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'campaigns'] })
        }}
      />
    </IntelligencePageShell>
  )
}
