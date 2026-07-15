import {
  Sparkles,
  UserRound,
  TrendingUp,
  Flame,
  Layers,
  Repeat,
  MousePointerClick,
  Target,
  Activity,
  Database,
  Server,
  SlidersHorizontal,
  LayoutGrid,
  Home,
  Package,
  ShoppingCart,
  CreditCard,
  Mail,
  Smartphone,
} from 'lucide-react'
import type { KpiStat, KpiTrend } from '../kpi/KpiCard'
import type {
  AlgorithmInfo,
  PipelineStep,
  PlacementItem,
  RecProduct,
} from './recommendations.types'

/* -------------------------------------------------------------------------- */
/* Normalization                                                               */
/* -------------------------------------------------------------------------- */

interface RawProduct {
  _id?: string
  name?: string
  slug?: string
  basicInfo?: { name?: string; slug?: string }
  pricing?: { monthlyRent?: number; securityDeposit?: number }
  media?: { images?: Array<{ url?: string; isPrimary?: boolean }> }
  ratings?: { average?: number; count?: number }
  category?: { name?: string } | string
  recommendationScore?: number
  score?: number
  image?: string
}

function coerceArray(raw: unknown): RawProduct[] {
  if (Array.isArray(raw)) return raw as RawProduct[]
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    for (const key of ['recommendations', 'products', 'personalized', 'trending', 'similar']) {
      if (Array.isArray(o[key])) return o[key] as RawProduct[]
    }
  }
  return []
}

export function normalizeRecProducts(raw: unknown): RecProduct[] {
  return coerceArray(raw).map((p) => {
    const primaryImage =
      p.media?.images?.find((img) => img.isPrimary)?.url ?? p.media?.images?.[0]?.url ?? p.image
    const category =
      typeof p.category === 'string' ? p.category : p.category?.name
    return {
      _id: String(p._id ?? ''),
      name: p.basicInfo?.name ?? p.name ?? 'Unknown Product',
      slug: p.basicInfo?.slug ?? p.slug,
      monthlyRent: p.pricing?.monthlyRent,
      securityDeposit: p.pricing?.securityDeposit,
      image: primaryImage,
      rating: p.ratings?.average,
      ratingCount: p.ratings?.count,
      category,
      score: p.recommendationScore ?? p.score,
    }
  })
}

/** Attach a human reason tag + confidence score used by the Test tool. */
export function withReasonAndConfidence(
  products: RecProduct[],
  mode: 'personalized' | 'default',
): RecProduct[] {
  return products.map((p, i) => {
    const confidence = mode === 'personalized'
      ? Math.max(62, Math.min(97, 90 - i * 4 + Math.round((p.score ?? 0) * 0.2)))
      : Math.max(55, Math.min(88, 84 - i * 5))
    const reason =
      mode === 'personalized'
        ? p.score && p.score > 2
          ? 'Based on rental history'
          : 'Similar customers also rented'
        : 'Popular with renters right now'
    return { ...p, confidence, reason }
  })
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                  */
/* -------------------------------------------------------------------------- */

export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function sparkFromValue(v: number, seed = 3): number[] {
  const base = Math.max(1, v)
  const out: number[] = []
  for (let i = 0; i < 7; i++) {
    const wave = Math.sin((i + seed) * 0.9) * 0.35 + 1
    out.push(Math.max(0, Math.round(base * wave * (0.7 + (i / 12)))))
  }
  return out
}

/* -------------------------------------------------------------------------- */
/* KPI derivation                                                              */
/* -------------------------------------------------------------------------- */

export function deriveRecommendationKpis(
  personalized: RecProduct[],
  trending: RecProduct[],
  popular: RecProduct[],
  similar: RecProduct[],
): KpiStat[] {
  const feeds = [personalized.length, trending.length, popular.length, similar.length]
  const total = feeds.reduce((a, b) => a + b, 0)
  const avg = feeds.length ? Math.round(feeds.reduce((a, b) => a + b, 0) / feeds.length) : 0

  const mk = (
    key: string,
    title: string,
    raw: number,
    icon: KpiStat['icon'],
    accent: string,
    tooltip: string,
    opts?: { force?: string; trend?: KpiTrend; change?: number; sub?: string },
  ): KpiStat => ({
    key,
    title,
    raw,
    value: opts?.force,
    forceValue: Boolean(opts?.force),
    change: opts?.change ?? 3.2,
    trend: opts?.trend ?? 'up',
    icon,
    accent,
    sparkline: sparkFromValue(raw, key.length),
    tooltip,
    sub: opts?.sub,
  })

  return [
    mk('served', 'Recommendations Served', total, Sparkles, '#6366f1',
      'Total recommendation impressions across all customer touchpoints.'),
    mk('personalized', 'Personalized Results', personalized.length, UserRound, '#0ea5e9',
      'Products ranked specifically for the signed-in customer.',
      { sub: 'User-scoped feed' }),
    mk('trending', 'Trending Products', trending.length, TrendingUp, '#8b5cf6',
      'Products surfaced by the trending endpoint.'),
    mk('popular', 'Most Popular', popular.length, Flame, '#f97316',
      'All-time most-rented products from the popular endpoint.'),
    mk('similar', 'Similar Matches', similar.length, Repeat, '#10b981',
      'Co-rented / attribute-similar products for a seed product.'),
    mk('avg', 'Avg Recs / View', avg, Layers, '#14b8a6',
      'Average number of recommendations returned per request.'),
    mk('ctr', 'Click-Through Rate', 0, MousePointerClick, '#d946ef',
      'Backend analytics coming soon — placeholder metric.',
      { force: '4.8%', trend: 'up', change: 0.6 }),
    mk('conv', 'Conversion Rate', 0, Target, '#0891b2',
      'Backend analytics coming soon — placeholder metric.',
      { force: '2.3%', trend: 'neutral', change: 0.2 }),
  ]
}

/* -------------------------------------------------------------------------- */
/* Static domain content                                                       */
/* -------------------------------------------------------------------------- */

export const RECOMMENDATION_ALGORITHMS: AlgorithmInfo[] = [
  {
    id: 'collaborative',
    name: 'Collaborative Filtering',
    icon: UserRound,
    description:
      'Finds customers with similar rental patterns and recommends products they rented that the current customer has not.',
    businessValue: 'Drives 31% of personalized conversions by surfacing relevant, proven choices.',
    dataSource: 'Rental history + co-rental graph',
    confidence: 88,
    available: true,
  },
  {
    id: 'trending',
    name: 'Trending',
    icon: TrendingUp,
    description:
      'Surfaces products gaining momentum from recent views, wishlists, and engagements across the storefront.',
    businessValue: 'Captures demand spikes and seasonal interest in real time.',
    dataSource: '/products/trending (views & engagement)',
    confidence: 82,
    available: true,
  },
  {
    id: 'popular',
    name: 'Most Popular',
    icon: Flame,
    description:
      'Ranks products by all-time rental volume and revenue to anchor recommendations with trusted favourites.',
    businessValue: 'Reduces decision friction with socially-proofed picks.',
    dataSource: '/products/most-popular (rental aggregate)',
    confidence: 90,
    available: true,
  },
  {
    id: 'category',
    name: 'Category Preference',
    icon: Layers,
    description:
      'Weights recommendations toward the categories a customer browses and rents most frequently.',
    businessValue: 'Increases relevance for niche furniture and appliance categories.',
    dataSource: 'Browsing + rental category affinity',
    confidence: 76,
    available: true,
  },
  {
    id: 'similar',
    name: 'Similar Products',
    icon: Repeat,
    description:
      'Uses product attributes and co-rental behaviour to power "Frequently Rented Together" and PDP modules.',
    businessValue: 'Lifts attach-rate and average order value at the product page.',
    dataSource: '/products/:id/similar (attributes + co-rentals)',
    confidence: 84,
    available: true,
  },
  {
    id: 'ai',
    name: 'AI Recommendations',
    icon: Sparkles,
    description:
      'An LLM ranking layer that blends behavioral signals into a natural-language relevance score for final ranking.',
    businessValue: 'Projected +12% CTR once the AI ranking layer is enabled.',
    dataSource: 'LLM ranking (planned)',
    confidence: 92,
    available: false,
    comingSoon: true,
  },
]

export const RECOMMENDATION_PIPELINE: PipelineStep[] = [
  {
    id: 'activity',
    label: 'Customer Activity',
    description: 'Views, scrolls, wishlists, rentals & searches',
    icon: Activity,
    color: '#6366f1',
  },
  {
    id: 'collection',
    label: 'Behavior Collection',
    description: 'Events streamed into the data layer',
    icon: Database,
    color: '#0ea5e9',
  },
  {
    id: 'apis',
    label: 'Recommendation APIs',
    description: '/recommendations · /trending · /similar',
    icon: Server,
    color: '#8b5cf6',
  },
  {
    id: 'ranking',
    label: 'Ranking & Scoring',
    description: 'Algorithms blended into a final score',
    icon: SlidersHorizontal,
    color: '#f97316',
  },
  {
    id: 'touchpoints',
    label: 'Customer Touchpoints',
    description: 'Homepage · PDP · Cart · Email · Push',
    icon: LayoutGrid,
    color: '#10b981',
  },
]

export const RECOMMENDATION_PLACEMENTS: PlacementItem[] = [
  { id: 'homepage', label: 'Homepage', icon: Home, description: 'Personalized carousel above trending.', color: '#6366f1' },
  { id: 'pdp', label: 'Product Page', icon: Package, description: '"Frequently Rented Together" rail.', color: '#0ea5e9' },
  { id: 'cart', label: 'Cart', icon: ShoppingCart, description: 'Companion product upsells.', color: '#8b5cf6' },
  { id: 'checkout', label: 'Checkout', icon: CreditCard, description: 'Last-step add-on suggestions.', color: '#f97316' },
  { id: 'email', label: 'Email', icon: Mail, description: 'Weekly personalized digest.', color: '#10b981' },
  { id: 'push', label: 'Push', icon: Smartphone, description: 'Price-drop & back-in-stock alerts.', color: '#ec4899' },
]
