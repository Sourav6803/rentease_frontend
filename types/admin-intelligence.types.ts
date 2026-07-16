import type { LucideIcon } from 'lucide-react'

/* -------------------------------------------------------------------------- */
/* Shared primitives                                                          */
/* -------------------------------------------------------------------------- */

export type Period =
  | 'today'
  | 'yesterday'
  | '7d'
  | '15d'
  | '30d'
  | '90d'
  | 'quarter'
  | 'year'
  | '1y'
  | 'custom'

export interface DateRange {
  start: string | Date
  end: string | Date
}

export interface PeriodParams {
  period?: Period
  startDate?: string
  endDate?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  timestamp?: string
  data?: T
}

/* -------------------------------------------------------------------------- */
/* Module 1 — Overview & Analytics                                            */
/* -------------------------------------------------------------------------- */

export interface OverviewCards {
  totalRevenue: number
  mrr: number
  totalRentals: number
  activeRentals: number
  returnedRentals: number
  pendingDeliveries: number
  activeUsers: number
  newUsersThisMonth: number
  vendors: number
  products: number
  availableInventory: number
  outOfStockProducts: number
  currency: string
  timestamp: string | Date
}

export interface AdminDashboardStats {
  users: { total: number; active: number; newToday: number; newThisMonth: number; byRole: Array<{ _id: string; count: number }> }
  vendors: { total: number; verified: number; pending: number; newToday: number; byPlan: Array<{ _id: string; count: number; avgRating?: number }> }
  products: { total: number; active: number; pending: number; byCategory: Array<{ _id: string; count: number }> }
  rentals: { total: number; active: number; completed: number; cancelled: number; overdue: number; today: number; revenue: { total: number; today: number; thisMonth: number } }
  pending: { vendors: number; products: number; reviews: number; maintenance: number }
  timestamp?: string | Date
}

export interface ChartSeriesPoint {
  label?: string
  month?: string
  date?: string
  _id?: string
  name?: string
  category?: string
  count?: number
  total?: number
  revenue?: number
  value?: number
  growth?: number
  utilization?: number
  percentage?: number
  [key: string]: unknown
}

export interface RentalCharts {
  period: string
  dateRange: DateRange
  rentalsByMonth: ChartSeriesPoint[]
  rentalsByWeek: ChartSeriesPoint[]
  rentalsByCategory: ChartSeriesPoint[]
  revenueTrends: ChartSeriesPoint[]
  rentalGrowth: ChartSeriesPoint[]
  productUtilization: ChartSeriesPoint[]
}

export interface ProductRow {
  _id?: string
  name: string
  rentalCount?: number
  revenue?: number
  ratings?: { average?: number; count?: number }
  views?: number | { count?: number }
  wishlistCount?: number
  slug?: string
  inventory?: { availableQuantity?: number; totalQuantity?: number }
  createdAt?: string
  /** Index signature so ProductRow satisfies DataTable's Record constraint. */
  [key: string]: unknown
}

export interface TopProducts {
  mostRented: ProductRow[]
  highestRevenue: ProductRow[]
  highestRated: ProductRow[]
  mostViewed: ProductRow[]
  mostWishlisted: ProductRow[]
  highestConversion?: ProductRow[]
}

export interface LeastProducts {
  zeroRentals: ProductRow[]
  noRentals7d: ProductRow[]
  noRentals30d: ProductRow[]
  lowRating: ProductRow[]
  lowStock: ProductRow[]
}

export interface CustomerSpender {
  _id?: string
  name: string
  email?: string
  totalSpent: number
  orders: number
}

export interface ActiveCustomer {
  _id?: string
  name: string
  rentalCount: number
}

export interface CustomerAnalytics {
  topSpendingCustomers: CustomerSpender[]
  mostActiveCustomers: ActiveCustomer[]
  repeatCustomers: number
  averageRentalDurationDays: number
  [key: string]: unknown
}

/* -------------------------------------------------------------------------- */
/* Module 2 — Coupons                                                         */
/* -------------------------------------------------------------------------- */

export interface CouponOverview {
  totalDiscounts: number
  activeDiscounts: number
  totalUsage: number
  totalDiscountAmount: number
}

export interface CouponAnalytics {
  overview: CouponOverview[]
  byType: Array<{ _id: string; count: number; usage: number }>
  topPerforming: Array<{ _id: string; name: string; code: string; usageCount: number }>
  usageTrend: ChartSeriesPoint[]
  [key: string]: unknown
}

/* -------------------------------------------------------------------------- */
/* Discount admin CRUD (via /api/v1/discounts/admin)                          */
/* -------------------------------------------------------------------------- */

export type DiscountType =
  | 'percentage'
  | 'fixed'
  | 'free_delivery'
  | 'no_deposit'
  | 'cashback'
  | 'referral'
  | 'festival'
  | 'birthday'
  | 'first_rental'
  | 'return_customer'

export type DiscountStatus = 'active' | 'inactive' | 'expired' | 'disabled' | 'exhausted'

export type ApplicableType =
  | 'all'
  | 'category'
  | 'product'
  | 'vendor'
  | 'rental_tenure'
  | 'first_rental'

export type UserEligibilityType = 'all' | 'new' | 'existing' | 'specific'

export interface DiscountApplicableOn {
  type: ApplicableType
  categoryIds?: string[]
  productIds?: string[]
  vendorIds?: string[]
  tenureMonths?: number[]
}

export interface DiscountUserEligibility {
  userType: UserEligibilityType
  userIds?: string[]
  minRentalsCompleted?: number
  minAmountSpent?: number
}

export interface DiscountUsageLimits {
  perUser?: number
  global?: number | null
}

export interface DiscountValidity {
  startDate: string
  endDate: string
  timezone?: string
}

export interface DiscountDisplayConditions {
  showOnCheckout?: boolean
  showOnProduct?: boolean
  autoApply?: boolean
}

export interface Discount {
  _id: string
  code: string
  name: string
  description?: string
  type: DiscountType
  value?: number
  maxDiscountAmount?: number
  minOrderValue?: number
  applicableOn?: DiscountApplicableOn
  userEligibility?: DiscountUserEligibility
  usageLimits?: DiscountUsageLimits
  usageCount?: number
  validity: DiscountValidity
  stackable?: boolean
  priority?: number
  displayConditions?: DiscountDisplayConditions
  status: DiscountStatus
  createdAt?: string
  updatedAt?: string
  /** Index signature so Discount satisfies DataTable's Record constraint. */
  [key: string]: unknown
}

/** Payload for create/update — validity dates are ISO strings. */
export interface DiscountPayload {
  name: string
  code?: string
  description?: string
  type: DiscountType
  value?: number
  maxDiscountAmount?: number
  minOrderValue?: number
  applicableOn?: DiscountApplicableOn
  userEligibility?: DiscountUserEligibility
  usageLimits?: DiscountUsageLimits
  validity: DiscountValidity
  stackable?: boolean
  priority?: number
  displayConditions?: DiscountDisplayConditions
}

export interface DiscountListResponse {
  discounts: Discount[]
  pagination: Pagination
}

export interface DiscountUsageEntry {
  user?: string
  rental?: string
  usedAt: string
  discountAmount?: number
  orderValue?: number
}

export interface DiscountUsageResponse {
  usage: DiscountUsageEntry[]
  pagination: Pagination
}

export interface DiscountStats {
  totalDiscounts?: number
  activeDiscounts?: number
  totalUsage?: number
  averageUsage?: number
  byType?: Array<{ type: string; count: number }>
}

export interface DiscountListParams {
  page?: number
  limit?: number
  status?: string
  type?: string
  search?: string
  active?: boolean
}

/* -------------------------------------------------------------------------- */
/* Module 3 — CRM                                                             */
/* -------------------------------------------------------------------------- */

export interface CrmCustomer {
  _id: string
  email?: string
  phone?: string
  profile?: { firstName?: string; lastName?: string; avatar?: string }
  stats?: Record<string, unknown>
  verification?: Record<string, unknown>
  status?: Record<string, unknown>
  createdAt: string
}

export interface CustomerListResponse {
  customers: CrmCustomer[]
  pagination: Pagination
}

export interface CustomerCRM {
  profile: CrmCustomer
  rentalHistory: unknown[]
  paymentHistory: unknown[]
  supportTickets: unknown[]
  wishlist: unknown[]
  favoriteProducts: unknown[]
  recentlyViewed: unknown[]
  recentBehavior: unknown[]
  lifetimeValue: number
  totalOrders: number
}

export interface BulkEmailPayload {
  userIds: string[]
  subject: string
  htmlBody: string
}

export interface CustomerEmailPayload {
  subject: string
  htmlBody: string
}

/* -------------------------------------------------------------------------- */
/* Module 4 — Marketing                                                       */
/* -------------------------------------------------------------------------- */

export interface Workflow {
  _id: string
  name: string
  slug: string
  trigger: { type: string; [key: string]: unknown }
  isEnabled: boolean
  metadata?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface EmailTemplate {
  _id: string
  name: string
  subject: string
  htmlBody: string
  category?: string
  isActive?: boolean
  metadata?: Record<string, unknown>
}

export interface CampaignAudience {
  type: 'all' | 'selected' | 'segment'
  userIds?: string[]
  segmentId?: string
}

export interface Campaign {
  _id: string
  name: string
  subject?: string
  htmlBody?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  audience: CampaignAudience
  scheduledAt?: string
  sentAt?: string
  template?: EmailTemplate | string
  metadata?: Record<string, unknown>
  createdAt?: string
}

export interface CustomerSegment {
  _id: string
  name: string
  description?: string
  userIds: string[]
  rules?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface CampaignListResponse {
  campaigns: Campaign[]
  pagination: Pagination
}

export interface WorkflowExecution {
  _id: string
  workflowId: string
  workflowName: string
  userId?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  triggerData?: Record<string, unknown>
  result?: Record<string, unknown>
  error?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
}

export interface WorkflowStats {
  totalRuns: number
  completed: number
  failed: number
  pending: number
  avgCompletionTimeMs: number
  successRate: number
}

export interface WorkflowAnalytics {
  workflowId: string
  stats: WorkflowStats
  recentExecutions: WorkflowExecution[]
}

export interface CampaignStats {
  targeted: number
  sent: number
  failed: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  revenue: number
  openRate: number
  clickRate: number
  bounceRate: number
}

export interface CampaignAnalytics {
  campaignId: string
  stats: CampaignStats
  deliveryTimeline: ChartSeriesPoint[]
  deviceBreakdown: Array<{ _id: string; count: number }>
  geography: Array<{ _id: string; count: number }>
  opensByHour: Array<{ _id: string; count: number }>
}

export interface TemplateStats {
  usageCount: number
  lastUsed: string
  avgOpenRate: number
  avgClickRate: number
}

export interface EmailTemplateExtended extends EmailTemplate {
  stats?: TemplateStats
  thumbnail?: string
  createdAt?: string
  updatedAt?: string
}

export interface SegmentRule {
  id: string
  field: string
  operator: string
  value: string | number | boolean
  logic?: 'and' | 'or'
}

export interface CustomerSegmentExtended extends Omit<CustomerSegment, 'rules'> {
  rules?: SegmentRule[]
  estimatedUsers?: number
  lastUsed?: string
  createdAt?: string
  updatedAt?: string
}

export interface MarketingOverview {
  activeWorkflows: number
  totalWorkflows: number
  scheduledCampaigns: number
  emailsSentToday: number
  emailsSentWeek: number
  openRate: number
  clickRate: number
  bounceRate: number
  conversionRate: number
  revenueGenerated: number
  couponRedemption: number
  avgEngagementScore: number
  returningCustomers: number
}

export interface CampaignWizardData {
  name: string
  description?: string
  audience: {
    type: 'all' | 'selected' | 'segment'
    userIds?: string[]
    segmentId?: string
    csvFile?: File
  }
  templateId?: string
  subject?: string
  htmlBody?: string
  scheduleType: 'immediate' | 'scheduled' | 'recurring'
  scheduledAt?: string
  recurrence?: { frequency: string; interval: number; endDate?: string }
  timezone: string
}

export const MARKETING_WORKFLOW_CATEGORIES = [
  { key: 'onboarding', label: 'Onboarding', color: '#0891b2' },
  { key: 'lifecycle', label: 'Lifecycle', color: '#7c3aed' },
  { key: 'retention', label: 'Retention', color: '#059669' },
  { key: 'conversion', label: 'Conversion', color: '#2563eb' },
  { key: 'reengagement', label: 'Re-engagement', color: '#d97706' },
  { key: 'promotional', label: 'Promotional', color: '#db2777' },
  { key: 'transactional', label: 'Transactional', color: '#64748b' },
  { key: 'festival', label: 'Festival', color: '#dc2626' },
] as const

export type WorkflowCategory = typeof MARKETING_WORKFLOW_CATEGORIES[number]['key']

export interface SendCampaignPayload {
  campaignId: string
}

export interface ScheduleCampaignPayload {
  campaignId: string
  scheduledAt: string
}

/* -------------------------------------------------------------------------- */
/* Module 5 — Product Intelligence                                            */
/* -------------------------------------------------------------------------- */

export interface ProductIntelligence {
  period: string
  dateRange: DateRange
  mostViewed: ProductRow[]
  mostRented: ProductRow[]
  mostAddedToCart: Array<{ _id: string; count: number }>
  mostWishlisted: Array<{ _id: string; count: number }>
  highestRated: ProductRow[]
  highestRevenue: ProductRow[]
  lowestRated: ProductRow[]
  zeroViews: ProductRow[]
  zeroRentals: ProductRow[]
  highViewsLowRentals: ProductRow[]
  interestedProducts: InterestItem[]
}

/* -------------------------------------------------------------------------- */
/* Module 6 — Behavior                                                        */
/* -------------------------------------------------------------------------- */

export interface BehaviorAnalytics {
  dateRange: DateRange
  byEvent: Array<{ _id: string; count: number }>
  topProducts: Array<{ _id?: string; name: string; views: number }>
  topSearches: Array<{ _id: string; count: number }>
  deviceBreakdown: Array<{ _id: string; count: number }>
  avgSessionTimeSeconds: number
  returningVisitors: number
}

export interface BehaviorOverview {
  totalEvents: number
  uniqueVisitors: number
  returningVisitors: number
  avgSessionTimeSeconds: number
  bounceRate: number
  conversionRate: number
  checkoutCompletion: number
  wishlistAdds: number
  cartAdds: number
  revenueInfluence: number
  engagementScore: number
}

export interface BehaviorFilters {
  startDate?: string
  endDate?: string
  compareStartDate?: string
  compareEndDate?: string
  device?: string
  browser?: string
  location?: string
  trafficSource?: string
  category?: string
  product?: string
  userId?: string
  visitorType?: 'all' | 'new' | 'returning'
  eventType?: string
  search?: string
}

export interface BehaviorEventLog {
  _id: string
  eventType: string
  userId?: string
  sessionId: string
  productId?: string
  categoryId?: string
  metadata: Record<string, unknown>
  device?: string
  browser?: string
  location?: string
  trafficSource?: string
  referrer?: string
  pageUrl?: string
  timestamp: string
  createdAt: string
  /** Index signature so BehaviorEventLog satisfies DataTable's Record constraint. */
  [key: string]: unknown
}

export interface BehaviorEventListResponse {
  events: BehaviorEventLog[]
  pagination: Pagination
}

export interface ConversionFunnelStage {
  key: string
  label: string
  count: number
  conversionRate: number
  dropOffRate: number
}

export interface SearchAnalyticsItem {
  query: string
  count: number
  ctr: number
  conversion: number
  noResults: boolean
}

export interface TrafficSourceItem {
  source: string
  visitors: number
  conversion: number
  revenue: number
}

export interface SessionMetrics {
  avgSessionTimeSeconds: number
  avgScrollDepth: number
  returningVisitors: number
  avgProductsViewed: number
  pagesPerSession: number
  avgCartSize: number
  avgRentalDurationDays: number
}

export interface TopProductAnalytics {
  _id: string
  name: string
  views: number
  uniqueUsers: number
  avgTimeSeconds: number
  wishlistCount: number
  cartCount: number
  checkoutCount: number
  conversionRate: number
}

export interface DeviceAnalytics {
  device: string
  count: number
  percentage: number
}

export interface BehaviorDrawerEvent extends BehaviorEventLog {
  previousEvent?: BehaviorEventLog
  nextEvent?: BehaviorEventLog
  sessionJourney?: BehaviorEventLog[]
}

export interface StorefrontEventExample {
  eventType: string
  userId?: string
  productId?: string
  sessionId: string
  timestamp: string
  metadata: Record<string, unknown>
}

/* -------------------------------------------------------------------------- */
/* Module 7 — Interests                                                       */
/* -------------------------------------------------------------------------- */

export interface InterestSignal {
  type: string
  score: number
  at: string
}

export interface InterestProductRef {
  _id?: string
  basicInfo?: { name?: string; slug?: string }
  pricing?: { monthlyRent?: number }
  category?: { name?: string }
}

export interface InterestUserRef {
  _id?: string
  profile?: { firstName?: string; lastName?: string; avatar?: string }
  email?: string
  phone?: string
}

export interface InterestItem {
  _id: string
  user?: InterestUserRef
  sessionId?: string
  product?: InterestProductRef
  interactionScore: number
  isInterested: boolean
  viewCount?: number
  totalTimeSpentSeconds?: number
  maxScrollDepth?: number
  lastViewedAt?: string
  signals?: InterestSignal[]
}

export interface InterestListResponse {
  items: InterestItem[]
  pagination: Pagination
}

/* -------------------------------------------------------------------------- */
/* Module 9 — Vendor Performance                                              */
/* -------------------------------------------------------------------------- */

export interface VendorKpi {
  revenue: { current: number; previous: number; growth: number }
  rentals: { current: number; previous: number; growth: number }
  activeProducts: number
  averageRating: number
  totalCustomers: number
}

export interface VendorRevenueDay {
  _id: string
  amount: number
  count: number
}

export interface VendorRentalStatus {
  _id: string
  count: number
}

export interface VendorActivityItem {
  id: string
  type: string
  action: string
  customer?: string
  product?: string
  amount?: number
  date?: string
}

/** One vendor's performance summary inside the marketplace leaderboard response. */
export interface VendorOverviewItem {
  vendorId: string
  businessName?: string
  period: string
  kpi: VendorKpi
  revenueByDay: VendorRevenueDay[]
  rentalsByStatus: VendorRentalStatus[]
  recentActivity: VendorActivityItem[]
}

/** Populated vendor record returned for the detail view. */
export interface VendorDetail {
  _id: string
  business?: {
    name?: string
    logo?: string
    gstin?: string
    businessType?: string
    address?: Record<string, unknown>
  }
  contact?: {
    primaryPhone?: string
    secondaryPhone?: string
    supportPhone?: string
    email?: string
  }
  verification?: { status?: string }
  subscription?: { plan?: string }
  plan?: string
  status?: { isActive?: boolean; isBlocked?: boolean; isSuspended?: boolean }
  rating?: { average?: number; count?: number; distribution?: Record<string, number> }
  category?: string | { name?: string }
  user?: { email?: string; profile?: { firstName?: string; lastName?: string } }
}

export interface VendorPerformanceResponse {
  period: string
  vendors: VendorOverviewItem[]
}

export interface VendorDetailResponse {
  vendor: VendorDetail
  analytics: VendorOverviewItem
}

export type VendorPerformance = VendorPerformanceResponse | VendorDetailResponse

/* -------------------------------------------------------------------------- */
/* Module 10 — Notifications (via /notifications admin)                     */
/* -------------------------------------------------------------------------- */

export interface NotificationRecord {
  _id: string
  user?: string
  type: string
  title: string
  message: string
  status?: string
  isRead?: boolean
  createdAt: string
}

export interface NotificationAnalytics {
  total: number
  sent: number
  failed: number
  readRate: number
  byType: Array<{ _id: string; count: number }>
  [key: string]: unknown
}

export interface NotificationRecordExtended extends NotificationRecord {
  channel: string
  recipient?: string
  subject?: string
  scheduledAt?: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  failedAt?: string
  failureReason?: string
  retryCount?: number
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  template?: string
  tags?: string[]
  metadata?: Record<string, unknown>
  tracking?: {
    sentAt?: string
    deliveredAt?: string
    readAt?: string
    clickedAt?: string
    openedAt?: string
    failedAt?: string
    failureReason?: string
    retryCount?: number
    events?: Array<{ event: string; timestamp: string; metadata?: Record<string, unknown> }>
  }
  channelDetails?: {
    email?: { messageId?: string }
    sms?: { sid?: string }
    push?: { deviceTokens?: string[] }
  }
  audience?: string
  sender?: string
}

export interface NotificationOverview {
  totalSent: number
  delivered: number
  opened: number
  clicked: number
  failed: number
  ctr: number
  deliveryRate: number
  avgDeliveryTimeSeconds: number
  pendingQueue: number
}

export interface NotificationFilter {
  search?: string
  startDate?: string
  endDate?: string
  status?: string
  channel?: string
  audience?: string
  priority?: string
  deliveryStatus?: string
}

export interface NotificationTemplate {
  _id: string
  name: string
  slug: string
  subject: string
  message: string
  htmlBody?: string
  channels: string[]
  category: string
  variables: string[]
  usageCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationPreference {
  email: boolean
  sms: boolean
  push: boolean
  in_app: boolean
  marketing: boolean
  transactional: boolean
  reminders: boolean
}

export interface BroadcastPayload {
  title: string
  message: string
  type: 'email' | 'sms' | 'push' | 'in_app' | 'whatsapp'
  category?: string
  target: 'all' | 'users' | 'vendors' | 'partners' | 'specific'
  userIds?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  scheduledFor?: string
  htmlBody?: string
}

export interface ChannelStatus {
  channel: string
  status: 'connected' | 'degraded' | 'down' | 'beta'
  lastSync: string
  latency: number
  errors24h: number
  queuedMessages: number
  successRate: number
}

export interface CampaignPerformance {
  _id: string
  title: string
  type: string
  totalSent: number
  delivered: number
  opened: number
  clicked: number
  failed: number
  deliveryRate: number
  openRate: number
  clickRate: number
  sentAt: string
}

export interface DeliveryTimelinePoint {
  date: string
  sent: number
  delivered: number
  failed: number
}

/* -------------------------------------------------------------------------- */
/* Module 11 — Operations                                                     */
/* -------------------------------------------------------------------------- */

export interface OperationsDashboard {
  date: string | Date
  todayDeliveries: number
  todayPickups: number
  lateDeliveries: number
  latePickups: number
  pendingMaintenance: number
  inventoryMovement: Array<{ _id: string; count: number }>
  warehouseStatus: Array<{ _id: string; count: number }>
  activeDrivers: number
  upcomingReturns: number
  upcomingRenewals: number
}

/* -------------------------------------------------------------------------- */
/* Module 12 — AI Insights                                                    */
/* -------------------------------------------------------------------------- */

export interface AiInsight {
  type: string
  message: string
  confidence: number
  productId?: string
  recommendedAction?: string
}

export interface AiInsightsResponse {
  insights: AiInsight[]
  executiveSummary: string
  generatedAt: string | Date
  highViewsLowRentals: ProductRow[]
  categoryRevenue: Array<{ _id: string; revenue: number; count: number }>
}

/* -------------------------------------------------------------------------- */
/* UI helpers                                                                 */
/* -------------------------------------------------------------------------- */

export interface KpiCardItem {
  key: string
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: LucideIcon
  accent?: string
  sub?: string
  loading?: boolean
}

export type StatusVariant =
  | 'open'
  | 'active'
  | 'expired'
  | 'draft'
  | 'scheduled'
  | 'sent'
  | 'cancelled'
  | 'pending'
  | 'resolved'
  | 'closed'
  | 'inactive'
  | 'exhausted'
  | 'disabled'
  | 'default'

export interface IntelligenceModule {
  key: string
  label: string
  href: string
  description?: string
}

/* -------------------------------------------------------------------------- */
/* Module 8 — Recommendations (via /products/recommendations)               */
/* -------------------------------------------------------------------------- */

export interface RecommendationItem {
  _id: string
  name?: string
  basicInfo?: { name?: string; slug?: string }
  pricing?: { monthlyRent?: number }
  ratings?: { average?: number; count?: number }
  score?: number
  reason?: string
}

export interface RecommendationsResponse {
  trending?: RecommendationItem[]
  similar?: RecommendationItem[]
  personalized?: RecommendationItem[]
  [key: string]: unknown
}
