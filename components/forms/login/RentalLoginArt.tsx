'use client'

// Rental-themed decorative art for the login screen.
// Everything here is presentational only — no auth logic lives in this file.

import { motion } from 'framer-motion'
import { MapPin, Truck, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * A frosted-glass tile holding a rental-related icon.
 * It gently floats in a loop so the panel feels alive without pulling focus
 * away from the login form.
 */
export function FloatingRentalTile({
  icon: Icon,
  label,
  className,
  delay = 0,
  float = 9,
  compact = false,
}: {
  icon: LucideIcon
  label?: string
  className?: string
  delay?: number
  float?: number
  compact?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1, y: [0, -float, 0] }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { type: 'spring', stiffness: 220, damping: 16, delay },
        y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay },
      }}
      className={cn(
        'pointer-events-none absolute z-20 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/95 shadow-lg shadow-black/20',
        compact ? 'p-2' : 'px-3 py-2',
        className,
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <Icon className="h-4 w-4" />
      </span>
      {!compact && label ? (
        <span className="pr-1 text-xs font-semibold text-brand">{label}</span>
      ) : null}
    </motion.div>
  )
}

/**
 * Decorative "delivery route": a dashed path with pulsing location pins and a
 * truck that loops across it. Pure SVG + motion, coloured with white / brand.
 */
export function DeliveryRouteArt({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-8 w-full', className)} aria-hidden="true">
      <svg
        viewBox="0 0 400 64"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        <path
          d="M4 42 C 60 42, 84 18, 150 18 S 250 46, 310 30 396 42, 396 42"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="2 9"
        />
      </svg>

      {[12, 48, 84].map((left, i) => (
        <span
          key={left}
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: `${left}%` }}
        >
          <motion.span
            className="block"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
          >
            <MapPin className="h-3.5 w-3.5 text-white/80" />
          </motion.span>
        </span>
      ))}

      <motion.span
        className="absolute top-1/2 -translate-y-1/2"
        animate={{ left: ['5%', '86%'] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand shadow-lg shadow-black/20">
          <Truck className="h-4 w-4" />
        </span>
      </motion.span>
    </div>
  )
}

/**
 * A slow, looping "rent → use → return" ring drawn as two chasing dashed arcs
 * with a revolving key. Sits behind the hero illustration.
 */
export function RentCycleArt({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 120 120"
      className={cn('h-full w-full', className)}
      fill="none"
      aria-hidden="true"
      animate={{ rotate: 360 }}
      transition={{ duration: 46, repeat: Infinity, ease: 'linear' }}
    >
      <circle
        cx="60"
        cy="60"
        r="52"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
        strokeDasharray="4 10"
      />
      <circle
        cx="60"
        cy="60"
        r="40"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="1"
        strokeDasharray="2 14"
      />
    </motion.svg>
  )
}
