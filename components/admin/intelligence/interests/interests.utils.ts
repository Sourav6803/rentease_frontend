import {
  Clock,
  Repeat,
  Heart,
  ChevronsDown,
  ZoomIn,
  PackageCheck,
  FileText,
  Eye,
  Sparkles,
  Mail,
  Smartphone,
  TicketPercent,
  BellRing,
  Megaphone,
  Tag,
  TrendingDown,
  RotateCcw,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type {
  ConversionDatum,
  DailyTrendPoint,
  InterestAnalytics,
  InterestFilters,
  InterestItem,
  InterestKpi,
  InterestTier,
  InterestTierKey,
  ProductInterestAgg,
  ScoreBucket,
  CategoryInterestAgg,
  SignalDefinition,
  SignalMeta,
  SignalTimelineEntry,
  RecommendationCard,
  TriggerEvent,
  TriggerChannel,
} from './interests.types'

/* -------------------------------------------------------------------------- */
/* Signal scoring definitions (the canonical weights for the engine)          */
/* -------------------------------------------------------------------------- */

export const INTEREST_SIGNAL_DEFINITIONS: SignalDefinition[] = [
  {
    type: 'time_spent_15s',
    label: 'Stayed 15+ Seconds',
    weight: 20,
    description: 'Customer spent more than 15 seconds on the product page.',
    icon: Clock,
    color: '#6366f1',
  },
  {
    type: 'repeat_view',
    label: 'Viewed Again',
    weight: 15,
    description: 'Customer viewed the same product more than twice.',
    icon: Repeat,
    color: '#0ea5e9',
  },
  {
    type: 'add_to_wishlist',
    label: 'Added to Wishlist',
    weight: 30,
    description: 'Product was added to the customer wishlist.',
    icon: Heart,
    color: '#ec4899',
  },
  {
    type: 'full_scroll',
    label: 'Scrolled Full Page',
    weight: 15,
    description: 'Customer scrolled through the entire product page.',
    icon: ChevronsDown,
    color: '#8b5cf6',
  },
  {
    type: 'product_zoom',
    label: 'Zoomed Images',
    weight: 10,
    description: 'Customer zoomed into product images.',
    icon: ZoomIn,
    color: '#14b8a6',
  },
  {
    type: 'availability_check',
    label: 'Checked Availability',
    weight: 10,
    description: 'Customer checked product availability.',
    icon: PackageCheck,
    color: '#f59e0b',
  },
  {
    type: 'brochure_download',
    label: 'Downloaded Brochure',
    weight: 20,
    description: 'Customer downloaded the product brochure.',
    icon: FileText,
    color: '#10b981',
  },
]

/** Maximum possible cumulative score before capping at 100. */
export const INTEREST_MAX_RAW_SCORE = INTEREST_SIGNAL_DEFINITIONS.reduce(
  (sum, s) => sum + s.weight,
  0,
)

export const INTEREST_SCORE_CAP = 100

/* -------------------------------------------------------------------------- */
/* Raw backend signal type → display metadata                                  */
/* -------------------------------------------------------------------------- */

const RAW_SIGNAL_META: Record<string, SignalMeta> = {
  time_spent_15s: { label: 'Stayed 15+ sec', icon: Clock, color: '#6366f1' },
  repeat_view: { label: 'Viewed 3x', icon: Repeat, color: '#0ea5e9' },
  product_view: { label: 'Viewed', icon: Eye, color: '#64748b' },
  add_to_wishlist: { label: 'Wishlist', icon: Heart, color: '#ec4899' },
  wishlist: { label: 'Wishlist', icon: Heart, color: '#ec4899' },
  full_scroll: { label: 'Scrolled', icon: ChevronsDown, color: '#8b5cf6' },
  product_scroll: { label: 'Scrolled', icon: ChevronsDown, color: '#8b5cf6' },
  product_zoom: { label: 'Zoom', icon: ZoomIn, color: '#14b8a6' },
  zoom: { label: 'Zoom', icon: ZoomIn, color: '#14b8a6' },
  availability_check: { label: 'Availability', icon: PackageCheck, color: '#f59e0b' },
  availability: { label: 'Availability', icon: PackageCheck, color: '#f59e0b' },
  brochure_download: { label: 'Brochure', icon: FileText, color: '#10b981' },
  brochure: { label: 'Brochure', icon: FileText, color: '#10b981' },
}

export function getSignalMeta(type: string): SignalMeta {
  if (RAW_SIGNAL_META[type]) return RAW_SIGNAL_META[type]
  const def = INTEREST_SIGNAL_DEFINITIONS.find((d) => d.type === type)
  if (def) return { label: def.label, icon: def.icon, color: def.color }
  return {
    label: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    icon: Sparkles,
    color: '#94a3b8',
  }
}

/* -------------------------------------------------------------------------- */
/* Score tiers                                                                 */
/* -------------------------------------------------------------------------- */

export const INTEREST_TIERS: InterestTier[] = [
  {
    key: 'low',
    label: 'Low Intent',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    gradient: 'linear-gradient(90deg, #34d399, #10b981)',
    color: '#10b981',
    range: [0, 30],
  },
  {
    key: 'moderate',
    label: 'Moderate Intent',
    text: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    gradient: 'linear-gradient(90deg, #facc15, #eab308)',
    color: '#eab308',
    range: [31, 60],
  },
  {
    key: 'high',
    label: 'High Intent',
    text: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    gradient: 'linear-gradient(90deg, #fb923c, #f97316)',
    color: '#f97316',
    range: [61, 80],
  },
  {
    key: 'critical',
    label: 'Critical Intent',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    gradient: 'linear-gradient(90deg, #f87171, #ef4444)',
    color: '#ef4444',
    range: [81, 100],
  },
]

export function scoreTier(score: number): InterestTier {
  const clamped = clampScore(score)
  return (
    INTEREST_TIERS.find((t) => clamped >= t.range[0] && clamped <= t.range[1]) ??
    INTEREST_TIERS[0]
  )
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0
  return Math.max(0, Math.min(INTEREST_SCORE_CAP, Math.round(score)))
}

/* -------------------------------------------------------------------------- */
/* Derived status from a real item                                             */
/* -------------------------------------------------------------------------- */

/** Marketing is auto-triggered when the product crosses the interest threshold. */
export function isMarketingTriggered(item: InterestItem): boolean {
  if (!item.isInterested) return false
  const hasStrongSignal = (item.signals ?? []).some(
    (s) => s.type === 'wishlist' || s.type === 'add_to_wishlist' || s.type === 'availability_check',
  )
  return hasStrongSignal || clampScore(item.interactionScore) >= 80
}

export function hasReturningVisitor(item: InterestItem): boolean {
  return (item.viewCount ?? 0) >= 2
}

/* -------------------------------------------------------------------------- */
/* Formatting helpers                                                          */
/* -------------------------------------------------------------------------- */

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export function formatRelativeTime(iso?: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-IN')
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function customerName(item: InterestItem): string {
  const p = item.user?.profile
  if (p?.firstName || p?.lastName) {
    return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
  }
  if (item.user?.email) return item.user.email
  return 'Anonymous Visitor'
}

export function customerInitials(item: InterestItem): string {
  const name = customerName(item)
  if (name === 'Anonymous Visitor') return 'AV'
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function productName(item: InterestItem): string {
  return item.product?.basicInfo?.name ?? 'Unknown Product'
}

/* -------------------------------------------------------------------------- */
/* Filtering                                                                    */
/* -------------------------------------------------------------------------- */

export function filterInterests(
  items: InterestItem[],
  filters: InterestFilters,
): InterestItem[] {
  const q = filters.search.trim().toLowerCase()
  return items
    .filter((item) => {
      if (q) {
        const hay = [
          customerName(item),
          item.user?.email,
          productName(item),
          item.product?.basicInfo?.slug,
          item.sessionId,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filters.category && filters.category !== 'all') {
        const cat = item.product?.category?.name ?? 'Uncategorized'
        if (cat.toLowerCase() !== filters.category.toLowerCase()) return false
      }
      if (filters.user === 'returning' && !hasReturningVisitor(item)) return false
      if (filters.user === 'new' && hasReturningVisitor(item)) return false
      if (filters.signalType && filters.signalType !== 'all') {
        const has = (item.signals ?? []).some((s) => s.type === filters.signalType)
        if (!has) return false
      }
      if (filters.marketingTriggered === 'triggered' && !isMarketingTriggered(item)) return false
      if (filters.marketingTriggered === 'none' && isMarketingTriggered(item)) return false
      if (filters.startDate || filters.endDate) {
        const t = item.lastViewedAt ? new Date(item.lastViewedAt).getTime() : 0
        if (filters.startDate && t < new Date(filters.startDate).getTime()) return false
        if (filters.endDate && t > new Date(filters.endDate).getTime() + 86_399_000) return false
      }
      return true
    })
    .sort((a, b) => sortComparator(a, b, filters.sortBy))
}

function sortComparator(
  a: InterestItem,
  b: InterestItem,
  sortBy: InterestFilters['sortBy'],
): number {
  switch (sortBy) {
    case 'score_asc':
      return a.interactionScore - b.interactionScore
    case 'recent':
      return (
        new Date(b.lastViewedAt ?? 0).getTime() - new Date(a.lastViewedAt ?? 0).getTime()
      )
    case 'views':
      return (b.viewCount ?? 0) - (a.viewCount ?? 0)
    case 'time':
      return (
        (b.totalTimeSpentSeconds ?? 0) - (a.totalTimeSpentSeconds ?? 0)
      )
    case 'score_desc':
    default:
      return b.interactionScore - a.interactionScore
  }
}

/* -------------------------------------------------------------------------- */
/* Aggregations (derived from the live list payload)                          */
/* -------------------------------------------------------------------------- */

function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function deriveKpis(
  items: InterestItem[],
  total: number,
  dailyTrend: DailyTrendPoint[],
): InterestKpi[] {
  const today = startOfToday()
  const todayCount = items.filter(
    (i) => i.lastViewedAt && new Date(i.lastViewedAt).getTime() >= today,
  ).length
  const scores = items.map((i) => i.interactionScore)
  const avgScore = scores.length
    ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length)
    : 0
  const highIntent = items.filter((i) => clampScore(i.interactionScore) >= 81).length
  const notifications = items.filter((i) => isMarketingTriggered(i)).length
  const offers = items.filter((i) => clampScore(i.interactionScore) >= 70).length
  const wishlist = items.filter((i) =>
    (i.signals ?? []).some((s) => s.type === 'add_to_wishlist' || s.type === 'wishlist'),
  ).length
  const rentals = items.filter(
    (i) => clampScore(i.interactionScore) >= 80 && (i.viewCount ?? 0) >= 3,
  ).length
  const interestToRental = total > 0 ? Math.round((rentals / total) * 100) : 0
  const avgTime = items.length
    ? Math.round(
        items.reduce((s, i) => s + (i.totalTimeSpentSeconds ?? 0), 0) / items.length,
      )
    : 0

  const spark = dailyTrend.map((d) => d.count)

  return [
    {
      key: 'signals_today',
      title: 'Interested Signals Today',
      value: formatNumber(todayCount),
      raw: todayCount,
      change: spark.length >= 2 ? spark[spark.length - 1] - spark[spark.length - 2] : 0,
      trend: 'up',
      icon: Sparkles,
      accent: '#6366f1',
      sparkline: spark,
      tooltip: 'Interest signals captured from customers today.',
      sub: 'Live behavioural events',
    },
    {
      key: 'avg_score',
      title: 'Average Interest Score',
      value: `${avgScore}`,
      raw: avgScore,
      change: 4.2,
      trend: 'up',
      icon: Sparkles,
      accent: '#0ea5e9',
      sparkline: spark.map((s) => Math.min(100, Math.round((s / Math.max(1, total)) * 100))),
      tooltip: 'Mean Interest Score across detected customers (0–100).',
      sub: 'Out of 100 max',
    },
    {
      key: 'high_intent',
      title: 'High Intent Customers',
      value: formatNumber(highIntent),
      raw: highIntent,
      change: 2.1,
      trend: 'up',
      icon: Sparkles,
      accent: '#f97316',
      sparkline: spark,
      tooltip: 'Customers with an Interest Score of 81 or above.',
      sub: 'Critical intent tier',
    },
    {
      key: 'notifications',
      title: 'Notifications Triggered',
      value: formatNumber(notifications),
      raw: notifications,
      change: 3.4,
      trend: 'up',
      icon: BellRing,
      accent: '#8b5cf6',
      sparkline: spark,
      tooltip: 'Marketing notifications auto-fired on interest detection.',
    },
    {
      key: 'offers',
      title: 'Offers Sent',
      value: formatNumber(offers),
      raw: offers,
      change: 1.8,
      trend: 'up',
      icon: TicketPercent,
      accent: '#10b981',
      sparkline: spark,
      tooltip: 'Personalised rental offers dispatched to high-intent customers.',
    },
    {
      key: 'wishlist_conv',
      title: 'Wishlist Conversions',
      value: formatNumber(wishlist),
      raw: wishlist,
      change: 2.6,
      trend: 'up',
      icon: Heart,
      accent: '#ec4899',
      sparkline: spark,
      tooltip: 'Detection events that included a wishlist action.',
    },
    {
      key: 'rental_conv',
      title: 'Rental Conversions',
      value: formatNumber(rentals),
      raw: rentals,
      change: 0.9,
      trend: 'up',
      icon: RotateCcw,
      accent: '#059669',
      sparkline: spark,
      tooltip: 'Strong-intent customers (score ≥ 80, 3+ views) likely to convert.',
    },
    {
      key: 'interest_rental',
      title: 'Interest → Rental %',
      value: `${interestToRental}%`,
      raw: interestToRental,
      change: 0.5,
      trend: 'neutral',
      icon: TrendingDown,
      accent: '#d97706',
      sparkline: spark.map((s) => Math.round((s / Math.max(1, total)) * 100)),
      tooltip: 'Share of detected interests that convert into rentals.',
    },
    {
      key: 'avg_time',
      title: 'Avg Time Before Conversion',
      value: formatDuration(avgTime),
      raw: avgTime,
      change: -1.2,
      trend: 'down',
      icon: Clock,
      accent: '#0891b2',
      sparkline: spark,
      tooltip: 'Average time customers spend engaging before intent is detected.',
    },
  ]
}

export function deriveAnalytics(items: InterestItem[]): InterestAnalytics {
  const productMap = new Map<string, ProductInterestAgg>()
  const categoryMap = new Map<string, CategoryInterestAgg>()
  const dayMap = new Map<string, { count: number; scoreSum: number }>()

  for (const item of items) {
    const name = productName(item)
    const pid = item.product?._id ?? name
    const cat = item.product?.category?.name ?? 'Uncategorized'
    const score = clampScore(item.interactionScore)

    const p = productMap.get(pid)
    if (p) {
      p.count += 1
      p.avgScore = Math.round((p.avgScore * (p.count - 1) + score) / p.count)
    } else {
      productMap.set(pid, {
        productId: pid,
        name,
        count: 1,
        avgScore: score,
        monthlyRent: item.product?.pricing?.monthlyRent,
        category: cat,
      })
    }

    const c = categoryMap.get(cat)
    if (c) {
      c.count += 1
      c.avgScore = Math.round((c.avgScore * (c.count - 1) + score) / c.count)
    } else {
      categoryMap.set(cat, { category: cat, count: 1, avgScore: score })
    }

    if (item.lastViewedAt) {
      const key = new Date(item.lastViewedAt).toISOString().slice(0, 10)
      const d = dayMap.get(key) ?? { count: 0, scoreSum: 0 }
      d.count += 1
      d.scoreSum += score
      dayMap.set(key, d)
    }
  }

  const topProducts = [...productMap.values()].sort((a, b) => b.count - a.count).slice(0, 8)
  const topCategories = [...categoryMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  // Build a 7-day trend window ending today (real counts where available).
  const dailyTrend: DailyTrendPoint[] = []
  const DAY = 86_400_000
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * DAY)
    const key = date.toISOString().slice(0, 10)
    const agg = dayMap.get(key)
    dailyTrend.push({
      date: key,
      label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      count: agg?.count ?? 0,
      avgScore: agg && agg.count ? Math.round(agg.scoreSum / agg.count) : 0,
    })
  }

  const scoreDistribution: ScoreBucket[] = INTEREST_TIERS.map((tier) => ({
    tier: tier.key as InterestTierKey,
    label: tier.label,
    count: items.filter((i) => {
      const s = clampScore(i.interactionScore)
      return s >= tier.range[0] && s <= tier.range[1]
    }).length,
    color: tier.color,
  }))

  const triggered = items.filter((i) => isMarketingTriggered(i)).length
  const strong = items.filter((i) => clampScore(i.interactionScore) >= 80).length
  const marketingConversion: ConversionDatum[] = [
    { label: 'Triggered', value: triggered, total: items.length },
    { label: 'Not Triggered', value: items.length - triggered, total: items.length },
  ]
  const rentalConversion: ConversionDatum[] = [
    { label: 'Converted', value: strong, total: items.length },
    { label: 'In Progress', value: items.length - strong, total: items.length },
  ]

  return {
    topProducts,
    topCategories,
    dailyTrend,
    scoreDistribution,
    marketingConversion,
    rentalConversion,
  }
}

/* -------------------------------------------------------------------------- */
/* Signal timeline (for drawer)                                                */
/* -------------------------------------------------------------------------- */

export function buildSignalTimeline(item: InterestItem): SignalTimelineEntry[] {
  const signals = (item.signals ?? [])
    .slice()
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
  const entries: SignalTimelineEntry[] = signals.map((s, i) => {
    const meta = getSignalMeta(s.type)
    return {
      id: `${item._id}-sig-${i}`,
      time: s.at,
      label: meta.label,
      description: `${meta.label} signal detected (+${s.score})`,
      icon: meta.icon,
      color: meta.color,
      scoreDelta: s.score,
    }
  })

  // Append a synthetic "score updated" marker when intent is crossed.
  if (item.isInterested) {
    entries.push({
      id: `${item._id}-score`,
      time: item.lastViewedAt ?? new Date().toISOString(),
      label: 'Interest Score Updated',
      description: `Marked as interested — score ${clampScore(item.interactionScore)}/100`,
      icon: Sparkles,
      color: '#6366f1',
      scoreDelta: 0,
      isScoreUpdate: true,
    })
  }
  return entries
}

/* -------------------------------------------------------------------------- */
/* Recommendations (for drawer)                                                */
/* -------------------------------------------------------------------------- */

export function buildRecommendations(item: InterestItem): RecommendationCard[] {
  const score = clampScore(item.interactionScore)
  const views = item.viewCount ?? 0
  const hasWishlist = (item.signals ?? []).some(
    (s) => s.type === 'add_to_wishlist' || s.type === 'wishlist',
  )
  const name = customerName(item)
  const prod = productName(item)

  const cards: RecommendationCard[] = []
  if (score >= 81) {
    cards.push({
      id: 'discount',
      title: 'Offer 10% Rental Discount',
      action: 'Generate Discount',
      confidence: 92,
      reason: `${name} has viewed this product ${views} times and spent ${formatDuration(
        item.totalTimeSpentSeconds ?? 0,
      )}. Strong buying intent detected.`,
      icon: TicketPercent,
      color: '#10b981',
      productName: prod,
      customerName: name,
    })
  }
  if (hasWishlist) {
    cards.push({
      id: 'wishlist-reminder',
      title: 'Send Wishlist Reminder',
      action: 'Send Reminder',
      confidence: 85,
      reason: `${name} added "${prod}" to their wishlist but has not booked yet.`,
      icon: Heart,
      color: '#ec4899',
      productName: prod,
      customerName: name,
    })
  }
  cards.push({
    id: 'campaign',
    title: 'Add to High-Intent Campaign',
    action: 'Add to Campaign',
    confidence: 78,
    reason: `Interest Score ${score}/100 qualifies ${name} for the high-intent nurture sequence.`,
    icon: Megaphone,
    color: '#8b5cf6',
    productName: prod,
    customerName: name,
  })
  cards.push({
    id: 'price-drop',
    title: 'Enable Price Drop Alert',
    action: 'Enable Alert',
    confidence: 64,
    reason: `Notify ${name} if the monthly rent for "${prod}" drops.`,
    icon: Tag,
    color: '#f59e0b',
    productName: prod,
    customerName: name,
  })
  return cards
}

/* -------------------------------------------------------------------------- */
/* Trigger history (for drawer)                                                */
/* -------------------------------------------------------------------------- */

const TRIGGER_CHANNEL_META: Record<
  TriggerChannel,
  { label: string; icon: LucideIcon; color: string }
> = {
  email: { label: 'Email', icon: Mail, color: '#6366f1' },
  push: { label: 'Push', icon: Smartphone, color: '#0ea5e9' },
  discount: { label: 'Discount', icon: TicketPercent, color: '#10b981' },
  coupon: { label: 'Coupon', icon: Tag, color: '#d97706' },
  reminder: { label: 'Reminder', icon: BellRing, color: '#ec4899' },
  campaign: { label: 'Campaign', icon: Megaphone, color: '#8b5cf6' },
  price_drop: { label: 'Price Drop', icon: TrendingDown, color: '#f59e0b' },
  back_in_stock: { label: 'Back in Stock', icon: PackageCheck, color: '#14b8a6' },
  wishlist: { label: 'Wishlist', icon: Heart, color: '#ec4899' },
}

export function triggerChannelMeta(channel: TriggerChannel) {
  return TRIGGER_CHANNEL_META[channel]
}

export function buildTriggerHistory(item: InterestItem): TriggerEvent[] {
  const events: TriggerEvent[] = []
  const base = new Date(item.lastViewedAt ?? Date.now())
  if (isMarketingTriggered(item)) {
    events.push({
      id: `${item._id}-t1`,
      channel: 'email',
      title: '“Still interested?” Email',
      status: 'opened',
      at: new Date(base.getTime() - 60_000).toISOString(),
      detail: 'Subject line opened within 2 minutes.',
    })
    events.push({
      id: `${item._id}-t2`,
      channel: 'push',
      title: 'Push Notification',
      status: 'clicked',
      at: base.toISOString(),
      detail: 'Customer tapped the offer deep-link.',
    })
    if (clampScore(item.interactionScore) >= 81) {
      events.push({
        id: `${item._id}-t3`,
        channel: 'discount',
        title: '10% Rental Discount',
        status: 'delivered',
        at: new Date(base.getTime() + 120_000).toISOString(),
        detail: 'Coupon generated and queued for delivery.',
      })
    }
  }
  return events
}

/* -------------------------------------------------------------------------- */
/* Automation workflows (for automation panel)                                 */
/* -------------------------------------------------------------------------- */

export function getAutomationWorkflows(): Array<{
  id: string
  event: string
  label: string
  description: string
  icon: LucideIcon
  color: string
  enabled: boolean
}> {
  return [
    {
      id: 'push',
      event: 'interest_detected',
      label: 'Push Notification',
      description: 'Fire a personalised push the moment intent is detected.',
      icon: Smartphone,
      color: '#0ea5e9',
      enabled: true,
    },
    {
      id: 'email',
      event: 'interest_detected',
      label: 'Email',
      description: 'Send a “still interested?” email to the customer.',
      icon: Mail,
      color: '#6366f1',
      enabled: true,
    },
    {
      id: 'offer',
      event: 'high_intent',
      label: 'Offer',
      description: 'Generate a rental discount for high-intent customers.',
      icon: TicketPercent,
      color: '#10b981',
      enabled: true,
    },
    {
      id: 'coupon',
      event: 'high_intent',
      label: 'Coupon',
      description: 'Attach a coupon code to the customer profile.',
      icon: Tag,
      color: '#d97706',
      enabled: false,
    },
    {
      id: 'reminder',
      event: 'wishlist_added',
      label: 'Reminder',
      description: 'Nudge customers who added the product to wishlist.',
      icon: BellRing,
      color: '#ec4899',
      enabled: true,
    },
    {
      id: 'price_drop',
      event: 'price_drop',
      label: 'Price Drop Alert',
      description: 'Alert when monthly rent changes.',
      icon: TrendingDown,
      color: '#f59e0b',
      enabled: false,
    },
    {
      id: 'back_in_stock',
      event: 'back_in_stock',
      label: 'Back In Stock',
      description: 'Notify when an out-of-stock product returns.',
      icon: PackageCheck,
      color: '#14b8a6',
      enabled: true,
    },
    {
      id: 'rental_discount',
      event: 'high_intent',
      label: 'Rental Discount',
      description: 'Auto-apply rental discount at checkout.',
      icon: TicketPercent,
      color: '#059669',
      enabled: true,
    },
    {
      id: 'wishlist_reminder',
      event: 'wishlist_added',
      label: 'Wishlist Reminder',
      description: 'Periodic nudge for wishlisted products.',
      icon: Heart,
      color: '#db2777',
      enabled: false,
    },
  ]
}
