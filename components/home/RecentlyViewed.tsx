'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { History, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import { getRecentlyViewed, clearRecentlyViewed, type RecentProduct } from '@/lib/recentlyViewed'

const fmt = (n?: number) => (n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '')

/**
 * "Recently viewed" — client-side, from localStorage. Renders nothing when empty.
 * Products are recorded by the product detail page via addRecentlyViewed().
 */
export function RecentlyViewed() {
  const [items, setItems] = useState<RecentProduct[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setItems(getRecentlyViewed())
  }, [])

  if (!items.length) return null

  const clear = () => { clearRecentlyViewed(); setItems([]) }
  const scroll = (dir: 'left' | 'right') =>
    ref.current?.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' })

  return (
    <section className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-4">
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
              <History className="h-4 w-4" />
            </span>
            <h2 className="text-base sm:text-xl font-extrabold text-foreground">Recently viewed</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clear}
              className="text-xs font-semibold text-muted-foreground hover:text-rose-500 inline-flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
            <button onClick={() => scroll('left')} aria-label="Scroll left" className="h-8 w-8 rounded-full border border-border bg-background hover:bg-brand-soft hover:text-brand text-muted-foreground flex items-center justify-center transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scroll('right')} aria-label="Scroll right" className="h-8 w-8 rounded-full border border-border bg-background hover:bg-brand-soft hover:text-brand text-muted-foreground flex items-center justify-center transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={ref} className="flex gap-3 overflow-x-auto px-4 sm:px-5 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <Link
                href={`/products/${p.slug}`}
                className="block w-[140px] sm:w-[160px] rounded-xl border border-border overflow-hidden hover:border-brand hover:shadow-md transition-all group"
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <History className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug min-h-[2rem]">{p.name}</p>
                  {p.monthlyRent != null && (
                    <p className="text-sm font-bold text-brand mt-1">{fmt(p.monthlyRent)}<span className="text-[10px] text-muted-foreground font-normal">/mo</span></p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
