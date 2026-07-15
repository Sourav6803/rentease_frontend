'use client'

import { useEffect, useRef } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { ProductCard } from './ProductCard'
import { useInfiniteFeed } from '@/hooks/useHomeData'

/**
 * Infinite "For You" feed. Backed by the paginated /products/search endpoint,
 * so it scales to 1k+ products today via offset pagination. Auto-loads the
 * next page when the sentinel scrolls into view.
 */
export function InfiniteFeed() {
  const { items, loadMore, hasMore, isLoading } = useInfiniteFeed(24)
  const sentinel = useRef<HTMLDivElement>(null)

  // Initial page.
  useEffect(() => { loadMore() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '600px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [loadMore])

  if (!isLoading && items.length === 0) return null

  return (
    <section className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-4">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="h-9 w-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-foreground">Recommended for you</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Keep scrolling — there's more to explore</p>
        </div>
      </div>

      <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((p, i) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min((i % 12) * 0.03, 0.3) }}
          >
            <ProductCard product={p as any} />
          </motion.div>
        ))}
      </div>

      {/* Sentinel + loader */}
      <div ref={sentinel} className="h-10" />
      {isLoading && (
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm font-medium">Loading more…</span>
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">You've reached the end 🎉</p>
      )}
    </section>
  )
}
