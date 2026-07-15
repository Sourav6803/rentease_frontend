'use client'

import { motion } from 'framer-motion'
import { Sparkles, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RecommendationEmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function RecommendationEmptyState({
  title = 'No recommendations to preview yet',
  description = 'Once customers browse and rent products, the recommendation engine will populate these previews with live data.',
  actionLabel,
  onAction,
  className,
}: RecommendationEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white px-6 py-20 text-center ${className ?? ''}`}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg"
      >
        <Sparkles className="h-11 w-11 text-white" />
        <motion.span
          className="absolute inset-0 rounded-3xl border-2 border-white/40"
          animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-5 gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white" onClick={onAction}>
          <SearchX className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default RecommendationEmptyState
