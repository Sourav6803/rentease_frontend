// 'use client'

// import { motion } from 'framer-motion'
// import { cn } from '@/lib/utils'
// import type { KpiCardItem } from '@/types/admin-intelligence.types'
// import { TrendPill } from './TrendPill'

// interface KpiGridProps {
//   items: KpiCardItem[]
//   columns?: 2 | 3 | 4 | 6
//   className?: string
// }

// const colClass: Record<number, string> = {
//   2: 'sm:grid-cols-2',
//   3: 'sm:grid-cols-2 lg:grid-cols-3',
//   4: 'sm:grid-cols-2 lg:grid-cols-4',
//   6: 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
// }

// export function KpiGrid({ items, columns = 4, className }: KpiGridProps) {
//   return (
//     <div className={cn('grid grid-cols-1 gap-4', colClass[columns], className)}>
//       {items.map((item, index) => {
//         const Icon = item.icon
//         const accent = item.accent ?? '#2563eb'

//         return (
//           <motion.div
//             key={item.key}
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.04, duration: 0.35 }}
//             className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
//           >
//             <div
//               className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-bl-[80px] opacity-60"
//               style={{ background: `${accent}15` }}
//             />
//             <div className="mb-3 flex items-start justify-between">
//               {Icon && (
//                 <div
//                   className="flex h-10 w-10 items-center justify-center rounded-xl"
//                   style={{ background: `${accent}18` }}
//                 >
//                   <Icon className="h-5 w-5" style={{ color: accent }} />
//                 </div>
//               )}
//               {item.change !== undefined && (
//                 <TrendPill value={item.change} trend={item.trend} />
//               )}
//             </div>
//             {item.loading ? (
//               <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
//             ) : (
//               <p className="text-2xl font-extrabold tracking-tight text-slate-900">{item.value}</p>
//             )}
//             <p className="mt-1 text-sm font-medium text-slate-600">{item.title}</p>
//             {item.sub && <p className="mt-0.5 text-xs text-slate-400">{item.sub}</p>}
//           </motion.div>
//         )
//       })}
//     </div>
//   )
// }

// export default KpiGrid



// 'use client'

// import { motion } from 'framer-motion'
// import { cn } from '@/lib/utils'
// import type { KpiCardItem } from '@/types/admin-intelligence.types'
// import { TrendPill } from './TrendPill'

// interface KpiGridProps {
//   items: KpiCardItem[]
//   columns?: 2 | 3 | 4 | 6
//   className?: string
// }

// const colClass: Record<number, string> = {
//   2: 'sm:grid-cols-2',
//   3: 'sm:grid-cols-2 lg:grid-cols-3',
//   4: 'sm:grid-cols-2 lg:grid-cols-4',
//   6: 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
// }

// export function KpiGrid({ items, columns = 4, className }: KpiGridProps) {
//   return (
//     <div className={cn('grid grid-cols-1 gap-3 sm:gap-4', colClass[columns], className)}>
//       {items.map((item, index) => {
//         const Icon = item.icon
//         const accent = item.accent ?? '#2563eb'

//         return (
//           <motion.div
//             key={item.key}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             whileHover={{ y: -3 }}
//             transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
//             className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm ring-1 ring-transparent transition-all duration-300 hover:border-transparent hover:shadow-lg sm:p-4 lg:p-4.5"
//             style={{
//               // subtle accent-tinted hover ring, applied via CSS var so Tailwind arbitrary values stay clean
//               // @ts-expect-error custom property
//               '--accent-ring': `${accent}33`,
//             }}
//           >
//             {/* animated gradient top bar */}
//             <div
//               className="absolute inset-x-0 top-0 h-[3px] scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
//               style={{ background: `linear-gradient(90deg, ${accent}, ${accent}99)` }}
//             />

//             {/* soft glow blob */}
//             <div
//               className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-40"
//               style={{ background: accent }}
//             />
//             <div
//               className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 rounded-bl-[64px] opacity-50 transition-opacity duration-300 group-hover:opacity-70"
//               style={{ background: `${accent}12` }}
//             />

//             <div className="relative mb-2 flex items-start justify-between gap-2 sm:mb-2.5">
//               {Icon && (
//                 <div
//                   className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10"
//                   style={{
//                     background: `linear-gradient(135deg, ${accent}22, ${accent}0d)`,
//                     boxShadow: `inset 0 0 0 1px ${accent}20`,
//                   }}
//                 >
//                   <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" style={{ color: accent }} />
//                 </div>
//               )}
//               {item.change !== undefined && (
//                 <TrendPill value={item.change} trend={item.trend} />
//               )}
//             </div>

//             <div className="relative">
//               {item.loading ? (
//                 <div className="h-7 w-20 animate-pulse rounded-md bg-slate-100 sm:h-8 sm:w-24" />
//               ) : (
//                 <p className="text-xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-2xl">
//                   {item.value}
//                 </p>
//               )}
//               <p className="mt-1 text-[13px] font-medium leading-snug text-slate-600 sm:text-sm">
//                 {item.title}
//               </p>
//               {item.sub && (
//                 <p className="mt-0.5 text-[11px] leading-snug text-slate-400 sm:text-xs">
//                   {item.sub}
//                 </p>
//               )}
//             </div>
//           </motion.div>
//         )
//       })}
//     </div>
//   )
// }

// export default KpiGrid






'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { KpiCardItem } from '@/types/admin-intelligence.types'
import { TrendPill } from './TrendPill'
import { useState } from 'react'

interface KpiGridProps {
  items: KpiCardItem[]
  columns?: 2 | 3 | 4 | 6
  className?: string
  variant?: 'default' | 'compact' | 'spacious'
  showHoverEffect?: boolean
}

const colClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  6: 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
}

const variantClasses = {
  default: {
    card: 'p-3.5 sm:p-4 lg:p-5',
    icon: 'h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12',
    iconInner: 'h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5',
    value: 'text-lg sm:text-xl lg:text-2xl xl:text-3xl',
    title: 'text-[11px] sm:text-xs lg:text-sm',
    sub: 'text-[10px] sm:text-[11px] lg:text-xs',
    gap: 'gap-2 sm:gap-3 lg:gap-4',
  },
  compact: {
    card: 'p-2.5 sm:p-3 lg:p-3.5',
    icon: 'h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9',
    iconInner: 'h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-4.5 lg:w-4.5',
    value: 'text-base sm:text-lg lg:text-xl',
    title: 'text-[10px] sm:text-[11px] lg:text-xs',
    sub: 'text-[9px] sm:text-[10px] lg:text-[11px]',
    gap: 'gap-1.5 sm:gap-2 lg:gap-3',
  },
  spacious: {
    card: 'p-4 sm:p-5 lg:p-6',
    icon: 'h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14',
    iconInner: 'h-4.5 w-4.5 sm:h-5 sm:w-5 lg:h-6 lg:w-6',
    value: 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl',
    title: 'text-xs sm:text-sm lg:text-base',
    sub: 'text-[11px] sm:text-xs lg:text-sm',
    gap: 'gap-2.5 sm:gap-3.5 lg:gap-5',
  },
}

const getAccentColor = (accent?: string, opacity?: number) => {
  if (!accent) return `rgba(37, 99, 235, ${opacity || 1})`
  // Handle hex colors
  if (accent.startsWith('#')) {
    const r = parseInt(accent.slice(1, 3), 16)
    const g = parseInt(accent.slice(3, 5), 16)
    const b = parseInt(accent.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity || 1})`
  }
  return accent
}

export function KpiGrid({ 
  items, 
  columns = 4, 
  className,
  variant = 'default',
  showHoverEffect = true,
}: KpiGridProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const styles = variantClasses[variant]

  return (
    <div className={cn(
      'grid grid-cols-1 gap-3 sm:gap-4', 
      colClass[columns], 
      styles.gap,
      className
    )}>
      {items.map((item, index) => {
        const Icon = item.icon
        const accent = item.accent ?? '#2563eb'
        const accentColor = getAccentColor(accent)
        const isHovered = hoveredIndex === index

        // Generate gradient from accent color
        const gradientFrom = getAccentColor(accent, 0.15)
        const gradientTo = getAccentColor(accent, 0.05)
        const borderColor = getAccentColor(accent, 0.2)

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={showHoverEffect ? { 
              y: -4,
              scale: 1.01,
              transition: { duration: 0.2, ease: 'easeOut' }
            } : undefined}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            transition={{ 
              delay: index * 0.05, 
              duration: 0.4, 
              ease: [0.22, 1, 0.36, 1]
            }}
            className={cn(
              'group relative overflow-hidden rounded-2xl',
              'bg-white/80 backdrop-blur-sm',
              'border transition-all duration-300',
              'shadow-sm hover:shadow-xl',
              styles.card,
              {
                'border-slate-200/80': !isHovered,
                'hover:border-transparent': showHoverEffect,
                'ring-2 ring-offset-2 ring-offset-white': isHovered,
              }
            )}
            style={{
              borderColor: isHovered ? accentColor : undefined,
              boxShadow: isHovered 
                ? `0 20px 40px -12px ${getAccentColor(accent, 0.3)}`
                : undefined,
            }}
          >
            {/* Animated gradient background */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at 30% 20%, ${getAccentColor(accent, 0.12)} 0%, transparent 70%)`,
              }}
            />

            {/* Top accent bar with shimmer */}
            <div className="absolute inset-x-0 top-0 h-1 overflow-hidden">
              <div 
                className="h-full w-full transition-transform duration-500 group-hover:scale-x-100 scale-x-0 origin-left"
                style={{ 
                  background: `linear-gradient(90deg, ${accentColor}, ${getAccentColor(accent, 0.4)})`,
                }}
              />
              <div 
                className="absolute inset-0 h-full w-20 animate-shimmer"
                style={{
                  background: `linear-gradient(90deg, transparent, ${getAccentColor(accent, 0.3)}, transparent)`,
                  transform: 'skewX(-20deg)',
                }}
              />
            </div>

            {/* Decorative glow orbs */}
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-40"
              style={{ background: accentColor }}
            />
            <div
              className="pointer-events-none absolute -left-8 -bottom-8 h-24 w-24 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-30"
              style={{ background: getAccentColor(accent, 0.6) }}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {Icon && (
                    <div
                      className={cn(
                        'relative flex shrink-0 items-center justify-center rounded-xl',
                        'transition-all duration-300',
                        styles.icon,
                        {
                          'shadow-lg': isHovered,
                          'shadow-md': !isHovered,
                        }
                      )}
                      style={{
                        background: isHovered 
                          ? `linear-gradient(135deg, ${getAccentColor(accent, 0.25)}, ${getAccentColor(accent, 0.1)})`
                          : `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                        boxShadow: isHovered
                          ? `0 8px 24px ${getAccentColor(accent, 0.25)}`
                          : `inset 0 0 0 1px ${borderColor}`,
                      }}
                    >
                      <Icon 
                        className={cn(
                          'transition-transform duration-300',
                          styles.iconInner,
                          {
                            'scale-110': isHovered,
                          }
                        )} 
                        style={{ 
                          color: isHovered ? accentColor : getAccentColor(accent, 0.8),
                        }} 
                      />
                      
                      {/* Icon pulse ring */}
                      {isHovered && (
                        <div 
                          className="absolute inset-0 rounded-xl animate-ping-slow"
                          style={{
                            border: `2px solid ${getAccentColor(accent, 0.3)}`,
                          }}
                        />
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    {item.loading ? (
                      <div className="h-6 w-20 animate-pulse rounded bg-slate-100 sm:h-7 sm:w-24" />
                    ) : (
                      <motion.p 
                        className={cn(
                          'font-extrabold tracking-tight text-slate-900',
                          styles.value,
                          {
                            'bg-gradient-to-r bg-clip-text text-transparent': isHovered,
                          }
                        )}
                        style={{
                          backgroundImage: isHovered 
                            ? `linear-gradient(135deg, ${accentColor}, ${getAccentColor(accent, 0.6)})`
                            : undefined,
                        }}
                      >
                        {item.value}
                      </motion.p>
                    )}
                    <p className={cn(
                      'font-medium text-slate-600',
                      styles.title,
                      {
                        'text-slate-700': isHovered,
                      }
                    )}>
                      {item.title}
                    </p>
                  </div>
                </div>

                {item.change !== undefined && (
                  <TrendPill 
                    value={item.change} 
                    trend={item.trend}
                  />
                )}
              </div>

              {item.sub && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={cn(
                    'mt-1.5 text-slate-400',
                    styles.sub,
                    {
                      'text-slate-500': isHovered,
                    }
                  )}
                >
                  {item.sub}
                </motion.p>
              )}
            </div>

            {/* Bottom progress indicator */}
            <div 
              className="absolute bottom-0 left-0 h-0.5 transition-all duration-500"
              style={{
                width: isHovered ? '100%' : '0%',
                background: `linear-gradient(90deg, ${accentColor}, ${getAccentColor(accent, 0.3)})`,
              }}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

// Add shimmer animation to global CSS or tailwind.config.js
// @keyframes shimmer {
//   0% { transform: translateX(-100%) skewX(-20deg); }
//   100% { transform: translateX(200%) skewX(-20deg); }
// }
// .animate-shimmer {
//   animation: shimmer 2s infinite;
// }
// .animate-ping-slow {
//   animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
// }

export default KpiGrid