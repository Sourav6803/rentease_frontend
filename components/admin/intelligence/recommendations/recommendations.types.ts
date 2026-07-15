import type { LucideIcon } from 'lucide-react'
import type { KpiStat } from '../kpi/KpiCard'
import type { RecommendationItem } from '@/types/admin-intelligence.types'

/* -------------------------------------------------------------------------- */
/* Normalized product                                                          */
/* -------------------------------------------------------------------------- */

export interface RecProduct {
  _id: string
  name: string
  slug?: string
  monthlyRent?: number
  securityDeposit?: number
  image?: string
  rating?: number
  ratingCount?: number
  category?: string
  reason?: string
  confidence?: number
  score?: number
}

/* -------------------------------------------------------------------------- */
/* Algorithm overview                                                          */
/* -------------------------------------------------------------------------- */

export interface AlgorithmInfo {
  id: string
  name: string
  icon: LucideIcon
  description: string
  businessValue: string
  dataSource: string
  confidence: number
  available: boolean
  comingSoon?: boolean
}

/* -------------------------------------------------------------------------- */
/* Pipeline + placement                                                        */
/* -------------------------------------------------------------------------- */

export interface PipelineStep {
  id: string
  label: string
  description: string
  icon: LucideIcon
  color: string
}

export interface PlacementItem {
  id: string
  label: string
  icon: LucideIcon
  description: string
  color: string
}

/* -------------------------------------------------------------------------- */
/* API health                                                                  */
/* -------------------------------------------------------------------------- */

export type ApiHealthStatus = 'connected' | 'loading' | 'unavailable'

export interface ApiEndpointHealth {
  id: string
  label: string
  path: string
  status: ApiHealthStatus
  latencyMs?: number
}

/* -------------------------------------------------------------------------- */
/* Re-exports                                                                   */
/* -------------------------------------------------------------------------- */

export type { KpiStat }
export type { RecommendationItem }
