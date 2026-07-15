'use client'

import { motion } from 'framer-motion'
import { clampScore, scoreTier } from './interests.utils'
import { cn } from '@/lib/utils'

interface InterestGaugeProps {
  score: number
  size?: number
  className?: string
}

export function InterestGauge({ score, size = 200, className }: InterestGaugeProps) {
  const s = clampScore(score)
  const tier = scoreTier(s)

  const stroke = size <= 160 ? 12 : 16
  const radius = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius
  const arcFraction = 0.75
  const arcLen = circumference * arcFraction
  const filled = arcLen * (s / 100)

  const recommendation =
    s >= 81
      ? 'Launch high-intent nurture with a rental discount.'
      : s >= 61
        ? 'Send a personalised offer and add to campaign.'
        : s >= 31
          ? 'Retarget with reminder + price-drop alert.'
          : 'Keep warming up with content and availability.'

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-[0deg]">
          <defs>
            <linearGradient id="interestGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="35%" stopColor="#facc15" />
              <stop offset="70%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <g transform={`rotate(135 ${cx} ${cy})`}>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${arcLen} ${circumference}`}
            />
            <motion.circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="url(#interestGaugeGradient)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circumference}`}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${filled} ${circumference}` }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-4xl font-extrabold tabular-nums', tier.text)}>{s}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            / 100
          </span>
        </div>
      </div>
      <div className={cn('mt-2 rounded-full px-3 py-1 text-xs font-semibold', tier.bg, tier.text, tier.border, 'border')}>
        {tier.label}
      </div>
      <p className="mt-3 max-w-[220px] text-center text-xs text-slate-500">{recommendation}</p>
    </div>
  )
}

export default InterestGauge
