'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { HomeProduct } from '@/hooks/useHomeData'

interface Props {
  title: string
  subtitle?: string
  products: HomeProduct[]
  isLoading: boolean
  viewAllHref?: string
  icon?: React.ReactNode
  accentBar?: boolean
}

export function ProductCarousel({ title, subtitle, products, isLoading, viewAllHref, icon, accentBar = true }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <section className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-4">
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-5">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-[180px] shrink-0 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products.length) return null

  return (
    <section className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-4">
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {accentBar && <div className="h-1 w-full bg-gradient-to-r from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)]" />}

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <span className="h-9 w-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center shrink-0">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-extrabold text-foreground truncate">{title}</h2>
              {subtitle && <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-brand hover:gap-2 transition-all"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className="h-8 w-8 rounded-full border border-border bg-background hover:bg-brand-soft hover:text-brand text-muted-foreground flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className="h-8 w-8 rounded-full border border-border bg-background hover:bg-brand-soft hover:text-brand text-muted-foreground flex items-center justify-center transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Track */}
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto px-4 sm:px-5 pb-5 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              className="min-w-[160px] w-[160px] sm:min-w-[200px] sm:w-[200px] snap-start"
            >
              <ProductCard product={p as any} />
            </motion.div>
          ))}

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="min-w-[120px] w-[120px] snap-start flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border hover:border-brand hover:bg-brand-soft transition-colors text-muted-foreground hover:text-brand"
            >
              <ArrowRight className="h-6 w-6" />
              <span className="text-xs font-bold">View all</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
