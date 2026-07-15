'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RecommendationCard } from './interests.types'
import { cn } from '@/lib/utils'

interface RecommendationPanelProps {
  recommendations: RecommendationCard[]
  onApply: (card: RecommendationCard) => void
  className?: string
}

export function RecommendationPanel({ recommendations, onApply, className }: RecommendationPanelProps) {
  if (!recommendations.length) {
    return (
      <p className="text-sm text-slate-400">
        Not enough signals yet to generate AI recommendations.
      </p>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {recommendations.map((card, i) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-slate-200 bg-white p-3.5 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${card.color}18` }}
              >
                <Icon className="h-4.5 w-4.5" style={{ color: card.color, width: 18, height: 18 }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{card.title}</p>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: `${card.color}18`, color: card.color }}
                  >
                    {card.confidence}% conf.
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{card.reason}</p>
                <Button
                  size="sm"
                  className="mt-2.5 h-7 gap-1 bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => onApply(card)}
                >
                  {card.action}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default RecommendationPanel
