// hooks/useHomeData.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSession } from 'next-auth/react'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export interface HomeProduct {
  _id: string
  basicInfo: { name: string; slug: string; brand?: string }
  pricing: { monthlyRent: number; securityDeposit: number; originalPrice?: number }
  media?: { images?: Array<{ url: string; isPrimary: boolean }> }
  ratings?: { average: number; count: number }
  condition?: string
}

export interface Banner {
  _id: string
  title: string
  subtitle?: string
  description?: string
  type: 'hero' | 'promo' | 'strip' | 'deal'
  image: { url: string; mobileUrl?: string; alt?: string }
  cta: { label: string; link: string }
  theme: { gradient: string; textColor: string; bgColor: string; accent: string }
  badge?: string
  discountCode?: string
  targetCategory?: { _id: string; name: string; slug: string } | null
}

export interface HomeCategory {
  _id: string
  name: string
  slug: string
  icon?: string
  image?: { url: string }
  productCount: number
  level: number
  children?: HomeCategory[]
}

interface HomeData {
  banners: { hero: Banner[]; promo: Banner[]; strip: Banner[]; deal: Banner[] }
  featured: HomeProduct[]
  trending: HomeProduct[]
  newArrivals: HomeProduct[]
  mostPopular: HomeProduct[]
  recommendations: HomeProduct[]
  categories: HomeCategory[]
}

const EMPTY: HomeData = {
  banners: { hero: [], promo: [], strip: [], deal: [] },
  featured: [], trending: [], newArrivals: [], mostPopular: [], recommendations: [], categories: [],
}

// Resolve to a safe fallback instead of rejecting, so one failed section
// never blanks the whole homepage.
const safe = (p: Promise<any>, fallback: any): Promise<any> => p.then(r => r).catch(() => fallback)

export function useHomeData() {
  const [data, setData] = useState<HomeData>(EMPTY)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)

    // Personalized recommendations need the bearer token when available.
    let authHeader: Record<string, string> = {}
    try {
      const session = await getSession()
      if (session?.user?.accessToken) authHeader = { Authorization: `Bearer ${session.user.accessToken}` }
    } catch { /* ignore */ }

    const get = (url: string, cfg: any = {}) => axios.get(`${BASE_URL}${url}`, cfg)

    const [banners, featured, trending, newArrivals, mostPopular, recommendations, categories] = await Promise.all([
      safe(get('/api/v1/banners'), { data: { data: { banners: EMPTY.banners } } }),
      safe(get('/api/v1/products/featured?limit=12'), { data: { data: { products: [] } } }),
      safe(get('/api/v1/products/trending?limit=12'), { data: { data: { products: [] } } }),
      safe(get('/api/v1/products/new-arrivals?limit=12'), { data: { data: { products: [] } } }),
      safe(get('/api/v1/products/most-popular?limit=12'), { data: { data: { products: [] } } }),
      safe(get('/api/v1/products/recommendations?limit=12', { headers: authHeader }), { data: { data: { recommendations: [] } } }),
      safe(get('/api/v1/categories/tree'), { data: { data: { categories: [] } } }),
    ])

    setData({
      banners: banners.data?.data?.banners || EMPTY.banners,
      featured: featured.data?.data?.products || [],
      trending: trending.data?.data?.products || [],
      newArrivals: newArrivals.data?.data?.products || [],
      mostPopular: mostPopular.data?.data?.products || [],
      recommendations: recommendations.data?.data?.recommendations || [],
      categories: categories.data?.data?.categories || [],
    })
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { ...data, isLoading, refetch: fetchAll }
}

/**
 * Infinite "For You" feed backed by the paginated /products/search endpoint.
 * Works today at 1k+ products (offset pagination).
 */
export function useInfiniteFeed(pageSize = 24) {
  const [items, setItems] = useState<HomeProduct[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/products/search`, {
        params: { page, limit: pageSize, sort: 'popularity', inStock: true },
      })
      if (res.data?.success) {
        const newItems: HomeProduct[] = res.data.data.products || []
        const pages = res.data.data.pagination?.pages ?? 1
        setItems(prev => {
          // De-dupe defensively in case of overlapping pages.
          const seen = new Set(prev.map(p => p._id))
          return [...prev, ...newItems.filter(p => !seen.has(p._id))]
        })
        setHasMore(page < pages)
        setPage(p => p + 1)
      } else {
        setHasMore(false)
      }
    } catch {
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, isLoading, hasMore])

  return { items, loadMore, hasMore, isLoading }
}
