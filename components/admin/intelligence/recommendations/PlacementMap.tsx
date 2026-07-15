'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { RECOMMENDATION_PLACEMENTS } from './recommendations.utils'

export function PlacementMap({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      <h3 className="text-sm font-semibold text-slate-900">Placement Map</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        Where recommendation modules render across the customer journey.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {RECOMMENDATION_PLACEMENTS.map((p, i) => {
          const Icon = p.icon
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-2.5 rounded-xl border border-slate-200 p-3"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${p.color}18` }}
              >
                <Icon className="h-4 w-4" style={{ color: p.color }} />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">{p.label}</p>
                <p className="text-[10px] leading-snug text-slate-400">{p.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default PlacementMap
