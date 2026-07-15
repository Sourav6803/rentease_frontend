/**
 * frontend/lib/crm/crm-utils.ts
 *
 * Pure helpers for the Enterprise CRM module. The backend customer list
 * returns only core user fields, so segment, health score, status and
 * recommended action are derived client-side from available signals.
 */

import type { CrmCustomer } from '@/types/admin-intelligence.types'

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type CustomerSegmentKey =
  | 'vip'
  | 'frequent'
  | 'loyal'
  | 'new'
  | 'returning'
  | 'at_risk'
  | 'inactive'
  | 'high_value'

export type SegmentFilter = 'all' | CustomerSegmentKey

export interface SegmentMeta {
  key: SegmentFilter
  label: string
  color: string
  bg: string
}

export type HealthBand = 'excellent' | 'good' | 'average' | 'poor' | 'critical'

export const CUSTOMER_SEGMENTS: SegmentMeta[] = [
  { key: 'all', label: 'All', color: '#334155', bg: '#f1f5f9' },
  { key: 'vip', label: 'VIP', color: '#7c3aed', bg: '#f3e8ff' },
  { key: 'frequent', label: 'Frequent', color: '#0ea5e9', bg: '#e0f2fe' },
  { key: 'loyal', label: 'Loyal', color: '#059669', bg: '#dcfce7' },
  { key: 'new', label: 'New', color: '#2563eb', bg: '#dbeafe' },
  { key: 'returning', label: 'Returning', color: '#0891b2', bg: '#cffafe' },
  { key: 'at_risk', label: 'At Risk', color: '#d97706', bg: '#fef3c7' },
  { key: 'inactive', label: 'Inactive', color: '#64748b', bg: '#f1f5f9' },
  { key: 'high_value', label: 'High Value', color: '#db2777', bg: '#fce7f3' },
]

export const HEALTH_BAND_META: Record<HealthBand, { label: string; color: string; bg: string }> = {
  excellent: { label: 'Excellent', color: '#047857', bg: '#d1fae5' },
  good: { label: 'Good', color: '#0891b2', bg: '#cffafe' },
  average: { label: 'Average', color: '#b45309', bg: '#fef3c7' },
  poor: { label: 'Poor', color: '#c2410c', bg: '#ffedd5' },
  critical: { label: 'Critical', color: '#b91c1c', bg: '#fee2e2' },
}

/* -------------------------------------------------------------------------- */
/* Safe accessors                                                              */
/* -------------------------------------------------------------------------- */

function num(v: unknown, fallback = 0): number {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number)
  return Number.isFinite(n) ? (n as number) : fallback
}

export function customerName(c: CrmCustomer): string {
  const p = c.profile
  return [p?.firstName, p?.lastName].filter(Boolean).join(' ').trim() || c.email || 'Unknown Customer'
}

export function avatarUrl(c: CrmCustomer): string | undefined {
  return c.profile?.avatar
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function customerStats(c: CrmCustomer) {
  const s = (c.stats ?? {}) as Record<string, unknown>
  return {
    totalRentals: num(s.totalRentals),
    activeRentals: num(s.activeRentals),
    totalSpent: num(s.totalSpent),
    memberSince: (s.memberSince as string) || c.createdAt,
    lastActive: (s.lastActive as string) || undefined,
  }
}

export function getVerificationStatus(c: CrmCustomer): 'verified' | 'partial' | 'unverified' {
  const v = (c.verification ?? {}) as Record<string, unknown>
  const email = !!v.email
  const phone = !!v.phone
  const kyc = (v.kyc as { status?: string })?.status === 'approved'
  const verified = email && phone && kyc
  const any = email || phone || kyc
  if (verified) return 'verified'
  if (any) return 'partial'
  return 'unverified'
}

export function getCustomerStatus(c: CrmCustomer): { label: string; variant: 'active' | 'inactive' | 'default' | 'exhausted' } {
  const st = (c.status ?? {}) as Record<string, unknown>
  if (st.isBlocked) return { label: 'Blocked', variant: 'exhausted' }
  if (st.isActive === false) return { label: 'Inactive', variant: 'inactive' }
  return { label: 'Active', variant: 'active' }
}

function daysSince(iso?: string): number | null {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diff)) return null
  return Math.floor(diff / 86_400_000)
}

function accountAgeDays(c: CrmCustomer): number {
  const iso = customerStats(c).memberSince
  const d = daysSince(iso)
  return d ?? 0
}

/* -------------------------------------------------------------------------- */
/* Derived intelligence                                                        */
/* -------------------------------------------------------------------------- */

export function deriveSegment(c: CrmCustomer): CustomerSegmentKey {
  const { totalRentals, totalSpent } = customerStats(c)
  const recency = daysSince(customerStats(c).lastActive)
  const age = accountAgeDays(c)
  const isActive = getCustomerStatus(c).variant === 'active'

  if (!isActive || (recency !== null && recency > 90)) return 'inactive'
  if (totalSpent >= 75_000) return 'vip'
  if (totalSpent >= 25_000) return 'high_value'
  if (totalRentals >= 10) return 'frequent'
  if (totalRentals >= 4) return 'loyal'
  if (totalRentals === 0 && age < 30) return 'new'
  if (recency !== null && recency > 30) return 'at_risk'
  return 'returning'
}

export function computeHealthScore(c: CrmCustomer): { score: number; band: HealthBand } {
  const { totalRentals, totalSpent } = customerStats(c)
  const recency = daysSince(customerStats(c).lastActive)
  const status = getCustomerStatus(c)
  const v = getVerificationStatus(c)

  let score = 50
  if (status.variant === 'active') score += 10
  else if (status.variant === 'inactive' || status.variant === 'exhausted') score -= 20

  if (v === 'verified') score += 26
  else if (v === 'partial') score += 12

  score += Math.min(totalRentals * 2, 20)
  score += Math.min(totalSpent / 5000, 20)

  if (recency === null) score -= 5
  else if (recency < 7) score += 12
  else if (recency < 30) score += 6
  else if (recency <= 90) score += 0
  else score -= 15

  score = Math.max(0, Math.min(100, Math.round(score)))

  const band: HealthBand =
    score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'average' : score >= 30 ? 'poor' : 'critical'
  return { score, band }
}

export function deriveRecommendedAction(c: CrmCustomer): { label: string; priority: 'high' | 'medium' | 'low' } {
  const segment = deriveSegment(c)
  const { band } = computeHealthScore(c)

  if (band === 'critical' || segment === 'inactive' || segment === 'at_risk') {
    return { label: 'Send Win-back Email', priority: 'high' }
  }
  if (segment === 'vip' || segment === 'high_value') {
    return { label: 'Offer VIP Upgrade', priority: 'high' }
  }
  if (segment === 'loyal' || segment === 'frequent') {
    return { label: 'Give Loyalty Coupon', priority: 'medium' }
  }
  if (segment === 'new') {
    return { label: 'Request Product Review', priority: 'medium' }
  }
  return { label: 'Recommend Similar Products', priority: 'low' }
}

export interface DerivedCustomer {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  segment: CustomerSegmentKey
  segmentLabel: string
  status: { label: string; variant: 'active' | 'inactive' | 'default' | 'exhausted' }
  verification: 'verified' | 'partial' | 'unverified'
  health: { score: number; band: HealthBand }
  ltv: number
  totalRentals: number
  activeRentals: number
  completedRentals: number
  lastActive?: string
  memberSince: string
  recommendedAction: { label: string; priority: 'high' | 'medium' | 'low' }
}

export function deriveCustomerFields(c: CrmCustomer): DerivedCustomer {
  const stats = customerStats(c)
  const segment = deriveSegment(c)
  const segmentMeta = CUSTOMER_SEGMENTS.find((s) => s.key === segment)
  const health = computeHealthScore(c)
  return {
    id: c._id,
    name: customerName(c),
    email: c.email ?? '',
    phone: c.phone,
    avatar: avatarUrl(c),
    segment,
    segmentLabel: segmentMeta?.label ?? segment,
    status: getCustomerStatus(c),
    verification: getVerificationStatus(c),
    health,
    ltv: stats.totalSpent,
    totalRentals: stats.totalRentals,
    activeRentals: stats.activeRentals,
    completedRentals: Math.max(0, stats.totalRentals - stats.activeRentals),
    lastActive: stats.lastActive,
    memberSince: stats.memberSince,
    recommendedAction: deriveRecommendedAction(c),
  }
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                  */
/* -------------------------------------------------------------------------- */

export function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)
}

export function formatCompactINR(n: number): string {
  const v = n || 0
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)}Cr`
  if (v >= 100_000) return `₹${(v / 100_000).toFixed(1)}L`
  if (v >= 1_000) return `₹${(v / 1_000).toFixed(1)}K`
  return formatINR(v)
}

export function formatDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatRelative(iso?: string): string {
  if (!iso) return 'Never'
  const days = daysSince(iso)
  if (days === null) return '—'
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export function segmentMeta(key: SegmentFilter): SegmentMeta | undefined {
  return CUSTOMER_SEGMENTS.find((s) => s.key === key)
}
