'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Smartphone, Star, Package, Sparkles } from 'lucide-react'
import { ProductCard } from '@/components/home/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EmptyState } from '../EmptyState'
import { useSimilarProducts } from './useRecommendations'
import type { RecProduct } from './recommendations.types'
import { cn } from '@/lib/utils'

interface ProductCardShape {
  _id: string
  basicInfo: { name: string; slug: string }
  pricing: { monthlyRent: number; securityDeposit: number }
  media?: { images?: Array<{ url: string; isPrimary: boolean }> }
  ratings?: { average: number; count: number }
  condition?: string
}

function toCardShape(p: RecProduct): ProductCardShape {
  return {
    _id: p._id,
    basicInfo: { name: p.name, slug: p.slug ?? p._id },
    pricing: { monthlyRent: p.monthlyRent ?? 0, securityDeposit: p.securityDeposit ?? 0 },
    media: p.image ? { images: [{ url: p.image, isPrimary: true }] } : undefined,
    ratings: { average: p.rating ?? 0, count: p.ratingCount ?? 0 },
  }
}

function ProductCarousel({
  title,
  subtitle,
  products,
  loading,
  variant = 'default',
  accent = '#6366f1',
}: {
  title: string
  subtitle?: string
  products: RecProduct[]
  loading?: boolean
  variant?: 'default' | 'compact'
  accent?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <Badge
          variant="outline"
          className="border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500"
        >
          Live preview
        </Badge>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-44 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : products.length ? (
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {products.map((p) => (
            <div
              key={p._id}
              className={cn('shrink-0', variant === 'compact' ? 'w-40' : 'w-44')}
            >
              <ProductCard product={toCardShape(p)} variant={variant} />
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-slate-400">
          No products returned for this surface yet.
        </p>
      )}
    </div>
  )
}

function EmailPreview({
  products,
  loading,
}: {
  products: RecProduct[]
  loading?: boolean
}) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const seed = products[0]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Email Preview</h3>
          <p className="mt-0.5 text-xs text-slate-500">How recommendation blocks render in emails.</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
          <Button
            size="icon-sm"
            variant={device === 'desktop' ? 'default' : 'ghost'}
            className="h-7 w-7"
            onClick={() => setDevice('desktop')}
            aria-label="Desktop preview"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            size="icon-sm"
            variant={device === 'mobile' ? 'default' : 'ghost'}
            className="h-7 w-7"
            onClick={() => setDevice('mobile')}
            aria-label="Mobile preview"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          className={cn(
            'overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all',
            device === 'desktop' ? 'w-full max-w-md' : 'w-64',
          )}
        >
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-white">
            <p className="text-xs font-semibold">RentEase</p>
            <p className="text-[10px] text-indigo-100">Curated just for you</p>
          </div>
          <div className="space-y-3 p-4">
            <p className="text-xs font-medium text-slate-600">
              {seed ? `Because you rented ${seed.name}…` : 'Because you rented with us…'}
            </p>
            {loading ? (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-lg" />
                ))}
              </div>
            ) : products.length ? (
              <div className={cn('grid gap-2', device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2')}>
                {products.slice(0, device === 'mobile' ? 2 : 4).map((p) => (
                  <div
                    key={p._id}
                    className="flex gap-2 rounded-lg border border-slate-200 bg-white p-2"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-5 w-5 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-slate-700">{p.name}</p>
                      <p className="text-[10px] text-blue-700">₹{(p.monthlyRent ?? 0).toLocaleString('en-IN')}/mo</p>
                      {p.rating != null && (
                        <p className="flex items-center gap-0.5 text-[10px] text-slate-400">
                          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                          {p.rating.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-[11px] text-slate-400">
                No recommendation content yet.
              </p>
            )}
            <div className="rounded-lg bg-indigo-600 py-2 text-center text-[11px] font-semibold text-white">
              Shop your picks
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface LivePreviewPanelsProps {
  personalized: RecProduct[]
  trending: RecProduct[]
  popular: RecProduct[]
  isLoading?: boolean
}

export function LivePreviewPanels({
  personalized,
  trending,
  popular,
  isLoading,
}: LivePreviewPanelsProps) {
  const seedOptions = useMemo(() => {
    const map = new Map<string, RecProduct>()
    for (const p of [...personalized, ...trending, ...popular]) map.set(p._id, p)
    return [...map.values()].slice(0, 24)
  }, [personalized, trending, popular])

  const [seedId, setSeedId] = useState<string | undefined>(undefined)
  const activeSeed = seedId ?? seedOptions[0]?._id
  const similarQ = useSimilarProducts(activeSeed)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-900">Live Preview Panels</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProductCarousel
          title="Homepage"
          subtitle="Personalized carousel · /recommendations"
          products={personalized}
          loading={isLoading}
        />
        <ProductCarousel
          title="Trending"
          subtitle="Momentum surfaced · /trending"
          products={trending}
          loading={isLoading}
          accent="#8b5cf6"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Product Detail</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                “Frequently Rented Together” · /similar
              </p>
            </div>
            <Select value={activeSeed} onValueChange={setSeedId}>
              <SelectTrigger className="h-9 w-[200px] text-xs">
                <SelectValue placeholder="Select seed product" />
              </SelectTrigger>
              <SelectContent>
                {seedOptions.map((p) => (
                  <SelectItem key={p._id} value={p._id} className="text-xs">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {similarQ.isLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-56 w-36 shrink-0 rounded-xl" />
              ))}
            </div>
          ) : similarQ.data && similarQ.data.length ? (
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
              {similarQ.data.map((p) => (
                <div key={p._id} className="w-36 shrink-0">
                  <ProductCard product={toCardShape(p)} variant="compact" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No similar products"
              description="Pick a seed product to preview co-rented items."
              className="border-0 shadow-none"
            />
          )}
        </div>

        <EmailPreview products={personalized} loading={isLoading} />
      </div>

      <ProductCarousel
        title="Most Popular"
        subtitle="All-time favourites · /most-popular"
        products={popular}
        loading={isLoading}
        accent="#f97316"
      />
    </div>
  )
}

export default LivePreviewPanels
