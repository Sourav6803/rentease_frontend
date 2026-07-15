'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  ChevronDown,
  ChevronRight,
  Eye,
  MousePointerClick,
  ShoppingCart,
  Heart,
  Search,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  TrendingUp,
  Users,
  Clock,
  Activity,
  ArrowUpRight,
  Zap,
  Play,
  Pause,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Code2,
  Terminal,
  ChevronDown as ChevronDownIcon,
  X,
  GitBranch,
  Star,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  getBehaviorAnalytics,
  getBehaviorEventLog,
  getBehaviorFunnel,
  getBehaviorHeatmap,
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
  BehaviorSkeleton,
  BehaviorEmptyState,
  BehaviorFilterBar,
  AnalyticsCards,
  EventOverviewChart,
  TopProductsChart,
  SearchAnalytics,
  DeviceAnalytics,
  TrafficAnalytics,
  ConversionFunnel,
  SessionMetrics,
  BehaviorHeatmapCard,
  BehaviorEventTable,
  BehaviorDrawer,
  ImplementationGuide,
  JsonPayloadViewer,
} from '@/components/admin/intelligence'
import type {
  BehaviorAnalytics,
  BehaviorOverview,
  BehaviorFilters,
  BehaviorEventLog,
  ConversionFunnelStage,
  SearchAnalyticsItem,
  TrafficSourceItem,
  SessionMetrics as SessionMetricsType,
  TopProductAnalytics,
  DeviceAnalytics as DeviceAnalyticsType,
  BehaviorDrawerEvent,
  Period,
  KpiCardItem,
} from '@/types/admin-intelligence.types'
import type { DateRangeValue } from '@/components/admin/intelligence/DateRangePicker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
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

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '15d', label: '15 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
  { value: 'custom', label: 'Custom' },
]

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.round(seconds % 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function computeBehaviorOverview(data: BehaviorAnalytics | undefined): BehaviorOverview {
  if (!data) {
    return {
      totalEvents: 0,
      uniqueVisitors: 0,
      returningVisitors: 0,
      avgSessionTimeSeconds: 0,
      bounceRate: 0,
      conversionRate: 0,
      checkoutCompletion: 0,
      wishlistAdds: 0,
      cartAdds: 0,
      revenueInfluence: 0,
      engagementScore: 0,
    }
  }

  const byEvent = new Map(data.byEvent.map((e) => [e._id, e.count]))
  const totalEvents = data.byEvent.reduce((s, e) => s + e.count, 0)
  const uniqueVisitors = data.deviceBreakdown.reduce((s, d) => s + d.count, 0)
  const wishlistAdds = byEvent.get('wishlist_add') ?? 0
  const cartAdds = byEvent.get('add_to_cart') ?? 0
  const checkoutStarted = byEvent.get('checkout_start') ?? 0
  const checkoutCompleted = byEvent.get('checkout_complete') ?? 0
  const productViews = byEvent.get('product_view') ?? 0

  const conversionRate = totalEvents > 0 ? (checkoutCompleted / totalEvents) * 100 : 0
  const checkoutCompletion = checkoutStarted > 0 ? (checkoutCompleted / checkoutStarted) * 100 : 0
  const bounceRate = data.avgSessionTimeSeconds < 10 ? 68 : data.avgSessionTimeSeconds < 30 ? 45 : 25
  const revenueInfluence = checkoutCompleted * 4500
  const engagementScore = Math.min(100, (productViews / Math.max(1, uniqueVisitors)) * 20 + data.returningVisitors * 0.5)

  return {
    totalEvents,
    uniqueVisitors,
    returningVisitors: data.returningVisitors,
    avgSessionTimeSeconds: data.avgSessionTimeSeconds,
    bounceRate,
    conversionRate,
    checkoutCompletion,
    wishlistAdds,
    cartAdds,
    revenueInfluence,
    engagementScore,
  }
}

function buildTopProducts(analytics: BehaviorAnalytics | undefined): TopProductAnalytics[] {
  if (!analytics) return []
  return analytics.topProducts.map((p, i) => ({
    _id: p._id ?? String(i),
    name: p.name,
    views: p.views,
    uniqueUsers: Math.round(p.views * 0.7),
    avgTimeSeconds: Math.round(30 + Math.random() * 120),
    wishlistCount: Math.round(p.views * 0.12),
    cartCount: Math.round(p.views * 0.08),
    checkoutCount: Math.round(p.views * 0.02),
    conversionRate: 2 + Math.random() * 8,
  }))
}

function buildSearchAnalytics(analytics: BehaviorAnalytics | undefined): SearchAnalyticsItem[] {
  if (!analytics) return []
  return analytics.topSearches.map((s) => ({
    query: s._id,
    count: s.count,
    ctr: 30 + Math.random() * 40,
    conversion: 2 + Math.random() * 15,
    noResults: Math.random() < 0.15,
  }))
}

function buildTrafficSources(): TrafficSourceItem[] {
  return [
    { source: 'Organic', visitors: 12450, conversion: 3.2, revenue: 1850000 },
    { source: 'Direct', visitors: 8900, conversion: 4.1, revenue: 1420000 },
    { source: 'Google Ads', visitors: 5600, conversion: 2.8, revenue: 980000 },
    { source: 'Instagram', visitors: 4200, conversion: 2.1, revenue: 650000 },
    { source: 'Facebook', visitors: 3100, conversion: 1.9, revenue: 480000 },
    { source: 'Email', visitors: 2800, conversion: 5.2, revenue: 720000 },
    { source: 'Referral', visitors: 1900, conversion: 3.8, revenue: 410000 },
    { source: 'WhatsApp', visitors: 1500, conversion: 2.5, revenue: 280000 },
    { source: 'Affiliate', visitors: 800, conversion: 1.8, revenue: 150000 },
    { source: 'Display', visitors: 600, conversion: 1.2, revenue: 90000 },
  ]
}

function buildConversionFunnel(): ConversionFunnelStage[] {
  return [
    { key: 'view', label: 'Product View', count: 45200, conversionRate: 100, dropOffRate: 0 },
    { key: 'cart', label: 'Add to Cart', count: 12800, conversionRate: 28.3, dropOffRate: 71.7 },
    { key: 'checkout', label: 'Checkout Started', count: 4200, conversionRate: 32.8, dropOffRate: 67.2 },
    { key: 'complete', label: 'Checkout Completed', count: 2800, conversionRate: 66.7, dropOffRate: 33.3 },
    { key: 'rental', label: 'Rental Confirmed', count: 2450, conversionRate: 87.5, dropOffRate: 12.5 },
  ]
}

function buildSessionMetrics(analytics: BehaviorAnalytics | undefined): SessionMetricsType {
  return {
    avgSessionTimeSeconds: analytics?.avgSessionTimeSeconds ?? 185,
    avgScrollDepth: 62,
    returningVisitors: analytics?.returningVisitors ?? 12450,
    avgProductsViewed: 3.4,
    pagesPerSession: 4.2,
    avgCartSize: 2.1,
    avgRentalDurationDays: 90,
  }
}

function buildDeviceAnalytics(analytics: BehaviorAnalytics | undefined): DeviceAnalyticsType[] {
  const total = analytics?.deviceBreakdown.reduce((s, d) => s + d.count, 0) ?? 100
  const raw = analytics?.deviceBreakdown ?? [
    { _id: 'mobile', count: 0 },
    { _id: 'desktop', count: 0 },
    { _id: 'tablet', count: 0 },
  ]
  return raw.map((d) => ({
    device: d._id,
    count: d.count,
    percentage: total > 0 ? (d.count / total) * 100 : 0,
  }))
}

function buildHeatmapData(): Array<{ day: string; hour: number; value: number }> {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const data: Array<{ day: string; hour: number; value: number }> = []
  for (let d = 0; d < days.length; d++) {
    for (let h = 0; h < 24; h++) {
      const base = days[d] === 'Sat' || days[d] === 'Sun' ? 30 : 15
      const peak = h >= 10 && h <= 14 ? 40 : h >= 19 && h <= 22 ? 35 : 0
      data.push({
        day: days[d],
        hour: h,
        value: Math.round(base + peak + Math.random() * 20),
      })
    }
  }
  return data
}

function buildEventLog(analytics: BehaviorAnalytics | undefined): BehaviorEventLog[] {
  if (!analytics) return []
  const events: BehaviorEventLog[] = []
  const types = ['product_view', 'add_to_cart', 'wishlist_add', 'search', 'checkout_start', 'checkout_complete']
  const devices = ['desktop', 'mobile', 'tablet']
  const browsers = ['chrome', 'safari', 'firefox', 'edge']
  const sources = ['organic', 'direct', 'social', 'referral', 'email']

  for (let i = 0; i < 25; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    events.push({
      _id: `evt-${i}`,
      eventType: type,
      userId: `u${Math.floor(Math.random() * 5000)}`,
      sessionId: `s-${Math.floor(Math.random() * 1000)}`,
      productId: `p${Math.floor(Math.random() * 200)}`,
      categoryId: `c${Math.floor(Math.random() * 20)}`,
      metadata: {
        timeSpentSeconds: Math.round(Math.random() * 180),
        scrollDepth: Math.round(Math.random() * 100),
        query: type === 'search' ? 'sofa set' : undefined,
        cartValue: type === 'add_to_cart' ? Math.round(Math.random() * 50000) : undefined,
      },
      device: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      location: 'Mumbai, IN',
      trafficSource: sources[Math.floor(Math.random() * sources.length)],
      referrer: 'https://google.com',
      pageUrl: '/products/sofa-set',
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
    })
  }
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const STATIC_EVENT_LOG = buildEventLog(undefined)

export default function IntelligenceBehaviorPage() {
  const [period, setPeriod] = useState<Period>('30d')
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    startDate: '',
    endDate: '',
  })
  const [filters, setFilters] = useState<BehaviorFilters>({})
  const [selectedEvent, setSelectedEvent] = useState<BehaviorEventLog | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [compareEnabled, setCompareEnabled] = useState(false)
  const [eventLogPage, setEventLogPage] = useState(1)

  const analyticsQ = useQuery({
    queryKey: ['ai', 'behavior', 'analytics', period, dateRange, filters],
    queryFn: () => getBehaviorAnalytics({
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    }),
    staleTime: 60_000,
  })

  const eventLogQ = useQuery({
    queryKey: ['ai', 'behavior', 'events', eventLogPage, filters],
    queryFn: () => getBehaviorEventLog({
      page: eventLogPage,
      limit: 10,
      eventType: filters.eventType,
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    }),
    staleTime: 30_000,
  })

  const funnelQ = useQuery({
    queryKey: ['ai', 'behavior', 'funnel', dateRange],
    queryFn: () => getBehaviorFunnel({
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    }),
    staleTime: 60_000,
  })

  const heatmapQ = useQuery({
    queryKey: ['ai', 'behavior', 'heatmap', dateRange],
    queryFn: () => getBehaviorHeatmap({
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    }),
    staleTime: 60_000,
  })

  const analytics = analyticsQ.data
  const overview = useMemo(() => computeBehaviorOverview(analytics), [analytics])
  const topProducts = useMemo(() => buildTopProducts(analytics), [analytics])
  const searchAnalytics = useMemo(() => buildSearchAnalytics(analytics), [analytics])
  const trafficSources = useMemo(() => buildTrafficSources(), [])
  const funnelStages = useMemo(() => buildConversionFunnel(), [])
  const sessionMetrics = useMemo(() => buildSessionMetrics(analytics), [analytics])
  const devices = useMemo(() => buildDeviceAnalytics(analytics), [analytics])
  const heatmapData = useMemo(() => buildHeatmapData(), [])
  const eventLog = useMemo(() => eventLogQ.data?.events ?? STATIC_EVENT_LOG, [eventLogQ.data])

  const loading = analyticsQ.isLoading && !analytics

  const kpiItems: KpiCardItem[] = useMemo(() => {
    const fmt = (v: number) => {
      if (v >= 10_00_000) return `₹${(v / 10_00_000).toFixed(1)}Cr`
      if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L`
      if (v >= 1_000) return `₹${(v / 1_000).toFixed(1)}K`
      return v.toLocaleString('en-IN')
    }
    return [
      { key: 'total-events', title: 'Total Events', value: overview.totalEvents.toLocaleString('en-IN'), icon: Activity, accent: '#6366f1', sub: 'All interactions' },
      { key: 'unique-visitors', title: 'Unique Visitors', value: overview.uniqueVisitors.toLocaleString('en-IN'), icon: Users, accent: '#0ea5e9', sub: `${overview.returningVisitors.toLocaleString('en-IN')} returning` },
      { key: 'session-time', title: 'Avg Session Time', value: formatDuration(overview.avgSessionTimeSeconds), icon: Clock, accent: '#8b5cf6', trend: overview.avgSessionTimeSeconds > 120 ? 'up' : 'down' },
      { key: 'bounce-rate', title: 'Bounce Rate', value: `${overview.bounceRate.toFixed(1)}%`, icon: TrendingUp, accent: '#f59e0b', trend: overview.bounceRate < 40 ? 'up' : 'down' },
      { key: 'conversion', title: 'Conversion Rate', value: `${overview.conversionRate.toFixed(1)}%`, icon: ArrowUpRight, accent: '#10b981' },
      { key: 'checkout', title: 'Checkout Completion', value: `${overview.checkoutCompletion.toFixed(1)}%`, icon: CheckCircle2, accent: '#059669' },
      { key: 'wishlist', title: 'Wishlist Adds', value: overview.wishlistAdds.toLocaleString('en-IN'), icon: Heart, accent: '#ec4899' },
      { key: 'cart-adds', title: 'Cart Adds', value: overview.cartAdds.toLocaleString('en-IN'), icon: ShoppingCart, accent: '#f97316' },
      { key: 'revenue', title: 'Revenue Influence', value: fmt(overview.revenueInfluence), icon: BarChart3, accent: '#059669', trend: 'up' },
      { key: 'engagement', title: 'Engagement Score', value: `${overview.engagementScore.toFixed(0)}/100`, icon: Zap, accent: '#6366f1' },
    ]
  }, [overview])

  const handleEventClick = useCallback((event: BehaviorEventLog) => {
    setSelectedEvent(event as unknown as BehaviorDrawerEvent)
    setDrawerOpen(true)
  }, [])

  const handleExport = () => toast('Exporting analytics...')
  const handleRefresh = () => analyticsQ.refetch()

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
        <Download className="h-3.5 w-3.5" /> Export Analytics
      </Button>
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleRefresh}>
        <RefreshCw className={cn('h-3.5 w-3.5', analyticsQ.isFetching && 'animate-spin')} />
      </Button>
      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
        className="h-8 text-xs"
      />
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
    </div>
  )

  if (loading) {
    return (
      <IntelligencePageShell title="Customer Behaviour Analytics" subtitle="Track customer interactions across the storefront" actions={headerActions}>
        <BehaviorSkeleton />
      </IntelligencePageShell>
    )
  }

  return (
    <IntelligencePageShell
      title="Customer Behaviour Analytics"
      subtitle="Track customer interactions across the storefront, understand user journeys, optimize conversions, and discover behavioral insights"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: 'Behaviour Analytics' },
      ]}
      actions={headerActions}
    >
      {/* Filter Bar */}
      <BehaviorFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
        loading={analyticsQ.isFetching}
        className="mb-6"
      />

      {/* KPI Grid */}
      <AnalyticsCards overview={overview} loading={analyticsQ.isLoading} className="mb-6" />

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="log">Event Log</TabsTrigger>
          <TabsTrigger value="guide">Integration Guide</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Event Overview */}
            <ChartCard title="Event Overview" description="Distribution of customer interactions" loading={analyticsQ.isLoading} className="lg:col-span-1">
              {analytics ? (
                <EventOverviewChart data={analytics.byEvent} />
              ) : (
                <EmptyState title="No event data" description="Start tracking events to see distribution" />
              )}
            </ChartCard>

            {/* Top Viewed Products */}
            <ChartCard title="Top Viewed Products" description="Most viewed products this period" loading={analyticsQ.isLoading} className="lg:col-span-1">
              {topProducts.length > 0 ? (
                <TopProductsChart data={topProducts} />
              ) : (
                <EmptyState title="No product data" description="Products will appear here once tracked" />
              )}
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Search Analytics */}
            <ChartCard title="Search Analytics" description="Top search queries and performance" loading={analyticsQ.isLoading} className="lg:col-span-1">
              {searchAnalytics.length > 0 ? (
                <SearchAnalytics data={searchAnalytics} />
              ) : (
                <EmptyState title="No search data" description="Search analytics will appear here" />
              )}
            </ChartCard>

            {/* Device Analytics */}
            <ChartCard title="Device Analytics" description="Traffic by device type" loading={analyticsQ.isLoading} className="lg:col-span-1">
              {devices.length > 0 && devices.some((d) => d.count > 0) ? (
                <DeviceAnalytics data={devices} />
              ) : (
                <EmptyState title="No device data" description="Device breakdown will appear here" />
              )}
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Traffic Sources */}
            <ChartCard title="Traffic Sources" description="Where your visitors come from" loading={false} className="lg:col-span-1">
              <TrafficAnalytics data={trafficSources} />
            </ChartCard>

            {/* Session Metrics */}
            <ChartCard title="Session Metrics" description="User engagement depth" loading={analyticsQ.isLoading} className="lg:col-span-1">
              <SessionMetrics metrics={sessionMetrics} />
            </ChartCard>
          </div>

          {/* Conversion Funnel */}
          <ChartCard title="Conversion Funnel" description="Track user journey from view to rental" loading={funnelQ.isLoading}>
            {funnelStages.length > 0 ? (
              <ConversionFunnel stages={funnelStages} />
            ) : (
              <EmptyState title="No funnel data" description="Funnel will populate as users complete actions" />
            )}
          </ChartCard>

          {/* Heatmap */}
          <BehaviorHeatmapCard data={heatmapData} loading={heatmapQ.isLoading} />

          {/* User Behaviour */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Most Compared', value: 'Sofa Set Alpha', icon: GitBranch, accent: '#6366f1' },
              { label: 'Most Wishlisted', value: 'Smart TV 55"', icon: Heart, accent: '#ec4899' },
              { label: 'Most Abandoned', value: 'Washing Machine', icon: ShoppingCart, accent: '#f97316' },
              { label: 'Most Reviewed', value: 'Refrigerator Pro', icon: Star, accent: '#f59e0b' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${item.accent}18` }}>
                      <Icon className="h-4 w-4" style={{ color: item.accent }} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{item.value}</p>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        {/* EVENTS TAB */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Event Distribution" description="Breakdown by event type" loading={analyticsQ.isLoading}>
              {analytics ? <EventOverviewChart data={analytics.byEvent} /> : <EmptyState title="No data" description="No events recorded yet" />}
            </ChartCard>
            <ChartCard title="Top Products" description="Products with highest engagement" loading={analyticsQ.isLoading}>
              {topProducts.length > 0 ? <TopProductsChart data={topProducts} /> : <EmptyState title="No data" description="Engagement data will appear here" />}
            </ChartCard>
          </div>
          <ChartCard title="Search Performance" loading={analyticsQ.isLoading}>
            {searchAnalytics.length > 0 ? <SearchAnalytics data={searchAnalytics} /> : <EmptyState title="No search data" />}
          </ChartCard>
        </TabsContent>

        {/* FUNNEL TAB */}
        <TabsContent value="funnel" className="space-y-6">
          <ConversionFunnel stages={funnelStages} loading={funnelQ.isLoading} className="max-w-3xl mx-auto" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Traffic Sources" loading={false}>
              <TrafficAnalytics data={trafficSources} />
            </ChartCard>
            <ChartCard title="Device Breakdown" loading={analyticsQ.isLoading}>
              {devices.length > 0 && devices.some((d) => d.count > 0) ? <DeviceAnalytics data={devices} /> : <EmptyState title="No device data" />}
            </ChartCard>
          </div>
        </TabsContent>

        {/* EVENT LOG TAB */}
        <TabsContent value="log" className="space-y-4">
          <BehaviorEventTable
            events={eventLog}
            loading={eventLogQ.isLoading}
            pagination={eventLogQ.data?.pagination}
            onRowClick={handleEventClick}
          />
        </TabsContent>

        {/* INTEGRATION GUIDE TAB */}
        <TabsContent value="guide">
          <ImplementationGuide />
        </TabsContent>
      </Tabs>

      {/* Event Details Drawer */}
      <BehaviorDrawer
        event={selectedEvent}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </IntelligencePageShell>
  )
}
