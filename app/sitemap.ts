/**
 * app/sitemap.ts — Next.js metadata route.
 * Served at /sitemap.xml: lists public shop URLs for search engines.
 * Static pages are always included; product and category URLs are fetched
 * from the backend at request time (revalidated daily) and silently skipped
 * if the API is unreachable, so builds and deploys never fail on it.
 */
import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  'http://localhost:3000'

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'

const REVALIDATE_SECONDS = 86400 // refresh dynamic entries daily

interface SitemapProduct {
  basicInfo?: { slug?: string }
  updatedAt?: string
}

interface SitemapCategory {
  slug?: string
  children?: SitemapCategory[]
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

async function getProductEntries(): Promise<MetadataRoute.Sitemap> {
  const json = await fetchJson<{
    success: boolean
    data?: { products?: SitemapProduct[] }
  }>(`${API_URL}/api/v1/products/search?limit=100&inStock=true`)

  const products = json?.data?.products ?? []
  return products
    .filter((p) => p.basicInfo?.slug)
    .map((p) => ({
      url: `${SITE_URL}/products/${p.basicInfo!.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
}

function flattenCategorySlugs(categories: SitemapCategory[]): string[] {
  const slugs: string[] = []
  for (const cat of categories) {
    if (cat.slug) slugs.push(cat.slug)
    if (cat.children?.length) slugs.push(...flattenCategorySlugs(cat.children))
  }
  return slugs
}

async function getCategoryEntries(): Promise<MetadataRoute.Sitemap> {
  const json = await fetchJson<{
    success: boolean
    data?: { categories?: SitemapCategory[] }
  }>(`${API_URL}/api/v1/categories/tree`)

  const slugs = flattenCategorySlugs(json?.data?.categories ?? [])
  return slugs.map((slug) => ({
    url: `${SITE_URL}/categories/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const [productEntries, categoryEntries] = await Promise.all([
    getProductEntries(),
    getCategoryEntries(),
  ])

  return [...staticEntries, ...categoryEntries, ...productEntries]
}
