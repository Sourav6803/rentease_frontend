'use client'

import { motion } from 'framer-motion'
import { clampScore, scoreTier } from './interests.utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface InterestScoreBarProps {
  score: number
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function InterestScoreBar({
  score,
  showLabel = true,
  size = 'md',
  className,
}: InterestScoreBarProps) {
  const s = clampScore(score)
  const tier = scoreTier(s)
  const height = size === 'sm' ? 'h-1.5' : 'h-2'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('flex items-center gap-2', className)}>
          <div
            className={cn('relative w-full max-w-[170px] overflow-hidden rounded-full bg-slate-100', height)}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: tier.gradient }}
              initial={{ width: 0 }}
              animate={{ width: `${s}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
          {showLabel && (
            <span className={cn('shrink-0 text-xs font-bold tabular-nums', tier.text)}>{s}</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        Interest Score {s}/100 · {tier.label}
      </TooltipContent>
    </Tooltip>
  )
}

export default InterestScoreBar
