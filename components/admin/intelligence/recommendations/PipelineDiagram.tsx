'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowDown } from 'lucide-react'
import { RECOMMENDATION_PIPELINE } from './recommendations.utils'
import { cn } from '@/lib/utils'

export function PipelineDiagram({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      <h3 className="text-sm font-semibold text-slate-900">Recommendation Pipeline</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        From raw customer activity to personalized touchpoints.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0 lg:items-stretch">
        {RECOMMENDATION_PIPELINE.map((step, i) => {
          const Icon = step.icon
          const isLast = i === RECOMMENDATION_PIPELINE.length - 1
          return (
            <div key={step.id} className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="flex w-full flex-col items-center rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                  style={{ background: step.color }}
                >
                  <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                </span>
                <p className="mt-2 text-xs font-semibold text-slate-800">{step.label}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-slate-400">{step.description}</p>
              </motion.div>

              {!isLast && (
                <div className="my-1 flex items-center text-slate-300 lg:mx-1 lg:my-0 lg:self-center">
                  <ArrowRight className="hidden h-4 w-4 lg:block" />
                  <ArrowDown className="h-4 w-4 lg:hidden" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PipelineDiagram
