'use client'

// Colourful, animated backdrop shared by every login screen.
// Kept decorative only — nothing here affects layout or the form.

import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

// Soft multi-hue wash. Opacities stay low so the login card keeps its contrast.
const MESH = [
  'radial-gradient(at 6% 4%, rgba(40,116,240,0.30) 0px, transparent 55%)',
  'radial-gradient(at 94% 8%, rgba(139,92,246,0.28) 0px, transparent 50%)',
  'radial-gradient(at 80% 95%, rgba(245,158,11,0.24) 0px, transparent 52%)',
  'radial-gradient(at 14% 90%, rgba(6,182,212,0.26) 0px, transparent 50%)',
  'radial-gradient(at 50% 45%, rgba(236,72,153,0.12) 0px, transparent 60%)',
].join(', ')

/** Full-bleed colourful backdrop: mesh wash + drifting blobs + a faint dot grid. */
export function AuroraBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {/* pastel mesh wash */}
      <div className="absolute inset-0" style={{ backgroundImage: MESH }} />

      {/* drifting colour blobs */}
      <motion.div
        className="absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-brand/25 blur-3xl"
        animate={{ x: [0, 38, 0], y: [0, 26, 0], scale: [1, 1.07, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-28 top-1/4 h-[28rem] w-[28rem] rounded-full bg-violet-400/25 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 34, 0], scale: [1, 1.09, 1] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-28 left-1/4 h-[24rem] w-[24rem] rounded-full bg-amber-300/25 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -24, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* faint dot grid for texture */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.13) 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
      />
    </div>
  )
}

/**
 * Animated colour aura that sits BEHIND the login card.
 * Render it as the first child of a `relative` wrapper, before the Card.
 */
export function CardAura() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute -inset-5 rounded-[2.75rem] opacity-70 blur-2xl"
      style={{
        background:
          'conic-gradient(from 0deg, rgba(40,116,240,0.45), rgba(139,92,246,0.45), rgba(245,158,11,0.35), rgba(6,182,212,0.40), rgba(40,116,240,0.45))',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    />
  )
}

/**
 * Gradient-border + coloured shadow for the login card.
 * `background-clip: padding-box, border-box` keeps the card surface opaque while
 * the conic gradient only shows through the 1.5px border ring.
 */
export const GRADIENT_CARD_STYLE: CSSProperties = {
  border: '1.5px solid transparent',
  backgroundImage:
    'linear-gradient(var(--card), var(--card)), conic-gradient(from 140deg, var(--brand), #8b5cf6, #f59e0b, #06b6d4, var(--brand))',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box',
  boxShadow: '0 24px 55px -24px rgba(40,116,240,0.45)',
}
