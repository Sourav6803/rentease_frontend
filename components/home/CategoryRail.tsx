'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { HomeCategory } from '@/hooks/useHomeData'
import { Skeleton } from '@/components/ui/skeleton'

const CAT_META: Record<string, { emoji: string; bg: string }> = {
  Furniture: { emoji: '🛋️', bg: '#eff6ff' },
  Electronics: { emoji: '📱', bg: '#f0fdf4' },
  'Home Appliances': { emoji: '🔌', bg: '#fff7ed' },
  Appliances: { emoji: '🔌', bg: '#fff7ed' },
  'Kids & Baby': { emoji: '👶', bg: '#fdf4ff' },
  'Sports & Fitness': { emoji: '⚽', bg: '#f0fdfa' },
  'Party & Events': { emoji: '🎉', bg: '#fef9c3' },
  'Tools & Equipment': { emoji: '🔧', bg: '#f8fafc' },
  'Books & Media': { emoji: '📚', bg: '#fff1f2' },
}
const meta = (name: string) => CAT_META[name] ?? { emoji: '📦', bg: '#f8fafc' }

export function CategoryRail({ categories, isLoading }: { categories: HomeCategory[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-4">
        <div className="bg-card rounded-2xl border border-border p-4 flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <Skeleton className="w-12 h-3 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!categories.length) return null

  return (
    <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-4">
      <div className="bg-card rounded-2xl border border-border shadow-sm px-2 sm:px-4 py-3">
        <div className="flex items-start gap-1 sm:gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center">
          {categories.slice(0, 12).map((cat, i) => {
            const m = meta(cat.name)
            return (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="flex-none w-[68px] sm:w-[88px] flex flex-col items-center gap-1.5 px-1 pt-1.5 pb-2 rounded-2xl transition-transform hover:-translate-y-1 group"
                >
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ring-1 ring-black/5 group-hover:ring-brand/40 transition-all"
                    style={{ background: m.bg }}
                  >
                    {cat.icon || m.emoji}
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight text-foreground/80 truncate w-full px-0.5 group-hover:text-brand">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
