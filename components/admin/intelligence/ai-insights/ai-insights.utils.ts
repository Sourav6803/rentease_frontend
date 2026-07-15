import type { LucideIcon } from 'lucide-react'
import {
  MousePointerClick,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Package,
  ShoppingCart,
  RefreshCw,
  Users,
  AlertTriangle,
} from 'lucide-react'
import type {
  AiInsightsResponse,
  AiInsight,
  ProductRow,
} from '@/types/admin-intelligence.types'
import { formatINR } from '@/lib/api/admin-intelligence'

export type InsightPriority = 'High' | 'Medium' | 'Low'

export interface DerivedInsight {
  id: string
  type: string
  title: string
  description: string
  recommendation?: string
  priority: InsightPriority
  /** 0..1 */
  confidence: number
  source: 'Behavior' | 'Inventory' | 'Vendor' | 'Marketing' | 'CRM' | 'Operations' | 'Marketplace'
  icon: LucideIcon
  generatedBy: string
  timestamp?: string
}

interface TypeMeta {
  title: string
  source: DerivedInsight['source']
  icon: LucideIcon
}

const TYPE_META: Record<string, TypeMeta> = {
  conversion_gap: { title: 'Low conversion on high-traffic product', source: 'Behavior', icon: MousePointerClick },
  category_trend: { title: 'Category revenue leader', source: 'Inventory', icon: TrendingUp },
  quality_alert: { title: 'Product quality risk', source: 'Vendor', icon: ShieldAlert },
}

const FALLBACK_META: TypeMeta = { title: 'AI-generated insight', source: 'Marketplace', icon: Sparkles }

export function deriveInsights(resp: AiInsightsResponse): DerivedInsight[] {
  return (resp.insights ?? []).map((it: AiInsight, i) => {
    const meta = TYPE_META[it.type] ?? FALLBACK_META
    const confidence = typeof it.confidence === 'number' ? it.confidence : 0
    const priority: InsightPriority =
      confidence >= 0.85 ? 'High' : confidence >= 0.7 ? 'Medium' : 'Low'
    return {
      id: it.productId ?? `${it.type}-${i}`,
      type: it.type,
      title: meta.title,
      description: it.message,
      recommendation: it.recommendedAction,
      priority,
      confidence,
      source: meta.source,
      icon: meta.icon,
      generatedBy: 'AI Engine',
      timestamp: resp.generatedAt ? new Date(resp.generatedAt).toLocaleString('en-IN') : undefined,
    }
  })
}

export function confidenceMeta(c: number): { color: string; bg: string; label: string } {
  if (c >= 0.85) return { color: '#16a34a', bg: '#dcfce7', label: 'High confidence' }
  if (c >= 0.7) return { color: '#d97706', bg: '#fef3c7', label: 'Medium confidence' }
  return { color: '#dc2626', bg: '#fee2e2', label: 'Low confidence' }
}

export function priorityMeta(p: InsightPriority): { color: string; bg: string } {
  switch (p) {
    case 'High':
      return { color: '#dc2626', bg: '#fee2e2' }
    case 'Medium':
      return { color: '#d97706', bg: '#fef3c7' }
    default:
      return { color: '#64748b', bg: '#f1f5f9' }
  }
}

export function avgConfidence(list: DerivedInsight[]): number {
  if (!list.length) return 0
  return list.reduce((a, b) => a + b.confidence, 0) / list.length
}

export interface Opportunity {
  key: string
  label: string
  value: string
  detail: string
  icon: LucideIcon
  accent: string
  hint?: string
}

export function deriveOpportunities(
  categoryRevenue: Array<{ _id: string; revenue: number; count: number }>,
  highViewsLowRentals: ProductRow[],
): Opportunity[] {
  const out: Opportunity[] = []
  const topCat = [...categoryRevenue].sort((a, b) => b.revenue - a.revenue)[0]
  if (topCat) {
    out.push({
      key: 'revenue',
      label: 'Revenue Opportunity',
      value: formatINR(topCat.revenue),
      detail: `${topCat._id} leads category revenue`,
      icon: TrendingUp,
      accent: '#7c3aed',
    })
  }
  if (highViewsLowRentals.length) {
    const views = highViewsLowRentals.reduce((a, p) => a + (typeof p.views === 'number' ? p.views : (p.views as { count?: number })?.count ?? 0), 0)
    out.push({
      key: 'conversion',
      label: 'Conversion / Upsell',
      value: `${highViewsLowRentals.length} products`,
      detail: `${views.toLocaleString('en-IN')} views with low rentals — optimize pricing & photos`,
      icon: MousePointerClick,
      accent: '#0ea5e9',
    })
  }
  // Honest placeholders for signals not present in the AI-insights payload.
  const placeholder = (key: string, label: string, icon: LucideIcon, accent: string): Opportunity => ({
    key,
    label,
    value: '—',
    detail: 'No signal in the current AI-insights window',
    icon,
    accent,
    hint: 'Available in dedicated analytics modules',
  })
  out.push(placeholder('renewals', 'Renewals', RefreshCw, '#8b5cf6'))
  out.push(placeholder('inactive', 'Inactive Users', Users, '#0891b2'))
  out.push(placeholder('inventory', 'Inventory Risks', Package, '#f59e0b'))
  out.push(placeholder('crosssell', 'Cross Sell', ShoppingCart, '#10b981'))
  return out
}

export interface RiskItem {
  id: string
  level: 'critical' | 'warning'
  title: string
  detail: string
}

export function deriveRisks(insights: DerivedInsight[]): RiskItem[] {
  const out: RiskItem[] = []
  for (const it of insights) {
    if (it.type === 'quality_alert') {
      out.push({ id: it.id, level: 'critical', title: 'Vendor / quality risk', detail: it.description })
    } else if (it.type === 'conversion_gap') {
      out.push({ id: it.id, level: 'warning', title: 'Revenue / conversion risk', detail: it.description })
    }
  }
  if (out.length === 0) {
    out.push({
      id: 'clear',
      level: 'warning',
      title: 'No critical risks detected',
      detail: 'Marketplace signals are within healthy thresholds for this window.',
    })
  }
  return out
}

export const RISK_META: Record<string, { color: string; bg: string; border: string; icon: LucideIcon }> = {
  critical: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertTriangle },
  warning: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle },
}

export const AI_DEMO: AiInsightsResponse = {
  executiveSummary:
    '6 actionable insights generated. Top priority: address high-view low-conversion products and restock the leading revenue category.',
  generatedAt: new Date().toISOString(),
  insights: [
    {
      type: 'conversion_gap',
      message: '"Sofa Set XL" has 312 views but only 2 rentals — consider pricing or photos.',
      confidence: 0.82,
      productId: 'demo-1',
      recommendedAction: 'Review pricing, images, and run a targeted offer',
    },
    {
      type: 'category_trend',
      message: 'Furniture category leads with ₹8,40,000 revenue.',
      confidence: 0.9,
      recommendedAction: 'Increase inventory in top category',
    },
    {
      type: 'quality_alert',
      message: '"Washing Machine 7kg" has low rating (2.4) — quality review needed.',
      confidence: 0.88,
      productId: 'demo-2',
      recommendedAction: 'Contact vendor for quality audit',
    },
  ],
  highViewsLowRentals: [
    { _id: 'demo-1', name: 'Sofa Set XL', views: 312, rentalCount: 2 },
    { _id: 'demo-3', name: 'Dining Table', views: 148, rentalCount: 1 },
  ],
  categoryRevenue: [
    { _id: 'Furniture', revenue: 840000, count: 120 },
    { _id: 'Appliances', revenue: 610000, count: 90 },
    { _id: 'Electronics', revenue: 430000, count: 64 },
  ],
}
