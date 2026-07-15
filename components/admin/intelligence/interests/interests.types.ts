import type { LucideIcon } from 'lucide-react'
import type { InterestItem } from '@/types/admin-intelligence.types'

/* -------------------------------------------------------------------------- */
/* Signal definitions                                                          */
/* -------------------------------------------------------------------------- */

export interface SignalDefinition {
  type: string
  label: string
  weight: number
  description: string
  icon: LucideIcon
  color: string
}

export type SignalMeta = {
  label: string
  icon: LucideIcon
  color: string
}

/* -------------------------------------------------------------------------- */
/* Score tiers                                                                 */
/* -------------------------------------------------------------------------- */

export type InterestTierKey = 'low' | 'moderate' | 'high' | 'critical'

export interface InterestTier {
  key: InterestTierKey
  label: string
  /** text color class */
  text: string
  /** soft background class */
  bg: string
  /** border class */
  border: string
  /** css gradient for bars/gauges */
  gradient: string
  /** solid accent color */
  color: string
  /** inclusive range */
  range: [number, number]
}

/* -------------------------------------------------------------------------- */
/* KPI strip                                                                   */
/* -------------------------------------------------------------------------- */

export interface InterestKpi {
  key: string
  title: string
  value: string
  raw: number
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  accent: string
  /** small inline sparkline data (real, derived from daily trend) */
  sparkline: number[]
  tooltip: string
  sub?: string
}

/* -------------------------------------------------------------------------- */
/* Analytics aggregates                                                        */
/* -------------------------------------------------------------------------- */

export interface ProductInterestAgg {
  productId: string
  name: string
  count: number
  avgScore: number
  monthlyRent?: number
  category?: string
}

export interface CategoryInterestAgg {
  category: string
  count: number
  avgScore: number
}

export interface DailyTrendPoint {
  date: string
  label: string
  count: number
  avgScore: number
}

export interface ScoreBucket {
  tier: InterestTierKey
  label: string
  count: number
  color: string
}

export interface ConversionDatum {
  label: string
  value: number
  total: number
}

export interface InterestAnalytics {
  topProducts: ProductInterestAgg[]
  topCategories: CategoryInterestAgg[]
  dailyTrend: DailyTrendPoint[]
  scoreDistribution: ScoreBucket[]
  marketingConversion: ConversionDatum[]
  rentalConversion: ConversionDatum[]
}

/* -------------------------------------------------------------------------- */
/* Drawer / detail view-models                                                 */
/* -------------------------------------------------------------------------- */

export interface SignalTimelineEntry {
  id: string
  time: string
  label: string
  description: string
  icon: LucideIcon
  color: string
  scoreDelta: number
  isScoreUpdate?: boolean
}

export type TriggerChannel =
  | 'email'
  | 'push'
  | 'discount'
  | 'reminder'
  | 'campaign'
  | 'coupon'
  | 'price_drop'
  | 'back_in_stock'
  | 'wishlist'

export type TriggerStatus = 'delivered' | 'sent' | 'opened' | 'clicked' | 'failed'

export interface TriggerEvent {
  id: string
  channel: TriggerChannel
  title: string
  status: TriggerStatus
  at: string
  detail?: string
}

export interface RecommendationCard {
  id: string
  title: string
  action: string
  confidence: number
  reason: string
  icon: LucideIcon
  color: string
  productName?: string
  customerName?: string
}

/* -------------------------------------------------------------------------- */
/* Filter state                                                                */
/* -------------------------------------------------------------------------- */

export type InterestSortKey =
  | 'score_desc'
  | 'score_asc'
  | 'recent'
  | 'views'
  | 'time'

export interface InterestFilters {
  search: string
  category: string
  user: string
  returning: boolean
  signalType: string
  marketingTriggered: string // 'all' | 'triggered' | 'none'
  sortBy: InterestSortKey
  startDate: string
  endDate: string
}

/* -------------------------------------------------------------------------- */
/* Automation                                                                  */
/* -------------------------------------------------------------------------- */

export interface AutomationWorkflow {
  id: string
  event: string
  label: string
  description: string
  icon: LucideIcon
  color: string
  enabled: boolean
}

/* -------------------------------------------------------------------------- */
/* Convenience re-export                                                       */
/* -------------------------------------------------------------------------- */

export type { InterestItem }
