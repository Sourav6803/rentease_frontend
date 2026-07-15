// src/components/home/FeaturedProducts.tsx
'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from './ProductCard'
import { Skeleton } from '@/components/ui/skeleton'

interface FeaturedProductsProps {
  title: string
  subtitle?: string
  products: any[]
  isLoading: boolean
  bgColor?: string
}

export function FeaturedProducts({ title, subtitle, products, isLoading, bgColor = 'bg-gray-50' }: FeaturedProductsProps) {
  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById(`scroll-${title.replace(/\s/g, '')}`)
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return (
      <div className={`py-8 px-4 ${bgColor}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className={`py-8 px-4 ${bgColor}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollContainer('left')}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollContainer('right')}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Horizontal Scroll Products */}
        <div
          id={`scroll-${title.replace(/\s/g, '')}`}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product._id} className="min-w-[200px] w-[200px] md:min-w-[220px] md:w-[220px] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}