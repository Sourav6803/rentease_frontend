// src/app/page.tsx
'use client'

import { TrendingUp, Zap, Sparkles, Clock, Flame } from 'lucide-react'

import { useHomeData } from '@/hooks/useHomeData'

// New premium home sections
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { CategoryRail } from '@/components/home/CategoryRail'
import { PromoGrid } from '@/components/home/PromoGrid'
import { ProductCarousel } from '@/components/home/ProductCarousel'
import { CartStrip } from '@/components/home/CartStrip'
import { RecentActivity } from '@/components/home/RecentActivity'
import { RecentlyViewed } from '@/components/home/RecentlyViewed'
import { InfiniteFeed } from '@/components/home/InfiniteFeed'
import { ThemeSwitcher } from '@/components/home/ThemeSwitcher'

// Reused existing sections
import { ServiceStrip } from '@/components/home/ServiceStrip'
import { BrandStrip } from '@/components/home/BrandStrip'
import { Newsletter } from '@/components/home/Newsletter'
import { AIChatAssistant } from '@/components/ui/AIChatAssistant'

export default function Home() {
  const {
    banners, featured, trending, newArrivals, mostPopular, recommendations, categories, isLoading,
  } = useHomeData()

  return (
    <main className="min-h-screen bg-background accent-transition">
      {/* 1 · Hero carousel (dynamic banners → static fallback) */}
      <HeroCarousel banners={banners.hero} isLoading={isLoading} />

      {/* 2 · Category quick-access rail */}
      <CategoryRail categories={categories} isLoading={isLoading} />

      {/* 3 · Promotional offer grid (dynamic promo banners → fallback) */}
      <PromoGrid promos={banners.promo} />

      {/* 4 · "Still in your cart" nudge (logged-in, non-empty) */}
      <CartStrip />

      {/* 5 · Trust / service strip */}
      <ServiceStrip />

      {/* 6 · Trending now */}
      <ProductCarousel
        title="Trending Now"
        subtitle="Most popular this week"
        products={trending}
        isLoading={isLoading}
        viewAllHref="/products?sort=popularity"
        icon={<Flame className="h-4 w-4" />}
      />

      {/* 7 · Personalized recommendations */}
      <ProductCarousel
        title="Recommended for you"
        subtitle="Picked based on popular choices"
        products={recommendations}
        isLoading={isLoading}
        viewAllHref="/products"
        icon={<Sparkles className="h-4 w-4" />}
      />

      {/* 8 · Recently viewed (client-side localStorage) */}
      <RecentlyViewed />

      {/* 9 · Featured */}
      <ProductCarousel
        title="Featured Products"
        subtitle="Handpicked just for you"
        products={featured}
        isLoading={isLoading}
        viewAllHref="/products?featured=true"
        icon={<Zap className="h-4 w-4" />}
      />

      {/* 10 · Your recent activity (logged-in) */}
      <RecentActivity />

      {/* 11 · New arrivals */}
      <ProductCarousel
        title="New Arrivals"
        subtitle="Fresh from the warehouse"
        products={newArrivals}
        isLoading={isLoading}
        viewAllHref="/products?sort=newest"
        icon={<Clock className="h-4 w-4" />}
      />

      {/* 12 · Brand strip */}
      <BrandStrip />

      {/* 13 · Most popular */}
      <ProductCarousel
        title="Most Popular"
        subtitle="All-time favourites"
        products={mostPopular}
        isLoading={isLoading}
        viewAllHref="/products?sort=popularity"
        icon={<TrendingUp className="h-4 w-4" />}
      />

      {/* 14 · Infinite "For You" feed — scales to 1k+ products */}
      <InfiniteFeed />

      {/* 15 · Newsletter */}
      <Newsletter />

      {/* Floating widgets */}
      {/* <ThemeSwitcher /> */}
      <AIChatAssistant />
    </main>
  )
}
