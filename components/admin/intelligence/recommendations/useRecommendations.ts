'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getProductRecommendations,
  getTrendingProducts,
  getMostPopularProducts,
  getSimilarProducts,
} from '@/lib/api/admin-intelligence'
import {
  normalizeRecProducts,
  withReasonAndConfidence,
} from './recommendations.utils'
import type { RecProduct } from './recommendations.types'

export interface RecommendationOverview {
  personalized: RecProduct[]
  trending: RecProduct[]
  popular: RecProduct[]
  latencies: {
    recommendations: number
    trending: number
    mostPopular: number
    similar: number
  }
}

export function useRecommendationOverview() {
  return useQuery<RecommendationOverview>({
    queryKey: ['ai', 'recs', 'overview'],
    queryFn: async () => {
      const measure = async <T,>(fn: () => Promise<T>) => {
        const t = performance.now()
        const d = await fn()
        return { d, ms: Math.round(performance.now() - t) }
      }
      const [rec, tr, pop] = await Promise.all([
        measure(() => getProductRecommendations({ limit: 12 })),
        measure(() => getTrendingProducts({ limit: 12 })),
        measure(() => getMostPopularProducts({ limit: 12 })),
      ])
      return {
        personalized: normalizeRecProducts(rec.d),
        trending: normalizeRecProducts(tr.d),
        popular: normalizeRecProducts(pop.d),
        latencies: {
          recommendations: rec.ms,
          trending: tr.ms,
          mostPopular: pop.ms,
          similar: 0,
        },
      }
    },
    staleTime: 60_000,
  })
}

export function useSimilarProducts(productId?: string) {
  return useQuery<RecProduct[]>({
    queryKey: ['ai', 'recs', 'similar', productId],
    enabled: Boolean(productId),
    queryFn: async () =>
      normalizeRecProducts(await getSimilarProducts(productId as string, { limit: 6 })),
    staleTime: 60_000,
  })
}

export function useTestRecommendation(params: { userId?: string; productId?: string }) {
  const enabled = Boolean(params.userId || params.productId)
  return useQuery<RecProduct[]>({
    queryKey: ['ai', 'recs', 'test', params],
    enabled,
    queryFn: async () => {
      const raw = await getProductRecommendations({
        userId: params.userId,
        productId: params.productId,
        limit: 8,
      })
      const arr = normalizeRecProducts(raw)
      return withReasonAndConfidence(arr, params.userId ? 'personalized' : 'default')
    },
    staleTime: 30_000,
  })
}
