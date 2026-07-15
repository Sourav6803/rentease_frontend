'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Layers, UserRound, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RecommendationHeroProps {
  onOpenDocs: () => void
  className?: string
}

export function RecommendationHero({ onOpenDocs, className }: RecommendationHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-lg sm:p-8 ${className ?? ''}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-fuchsia-300/20 blur-2xl" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Read-Only Preview & Monitoring
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            How Recommendations Reach Customers
          </h2>
          <p className="mt-2 max-w-xl text-sm text-indigo-100">
            The engine blends <span className="font-semibold text-white">behavior</span>,{' '}
            <span className="font-semibold text-white">rental history</span>, and{' '}
            <span className="font-semibold text-white">product similarity</span> into a ranked feed
            shown across the storefront, email, and push. This console previews exactly what customers
            see — no tuning required.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { icon: UserRound, label: 'Rental History' },
              { icon: Layers, label: 'Category Signals' },
              { icon: Repeat, label: 'Product Similarity' },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="flex items-center gap-2 text-sm text-indigo-50">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  {s.label}
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="sm"
              className="gap-1.5 bg-white text-indigo-700 shadow hover:bg-indigo-50"
              onClick={onOpenDocs}
            >
              View Pipeline
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Pipeline illustration */}
        <div className="relative hidden justify-center lg:flex">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            {[
              { t: 'Customer Activity', s: 'views · rentals · wishlists' },
              { t: 'Behavior Collection', s: 'events → data layer' },
              { t: 'Recommendation APIs', s: '/recommendations · /similar' },
              { t: 'Ranking & Scoring', s: 'blended final score' },
              { t: 'Customer Touchpoints', s: 'home · email · push' },
            ].map((step, i) => (
              <div key={step.t}>
                <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{step.t}</p>
                    <p className="text-[11px] text-indigo-100">{step.s}</p>
                  </div>
                </div>
                {i < 4 && (
                  <div className="ml-[22px] h-4 w-px bg-white/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default RecommendationHero
