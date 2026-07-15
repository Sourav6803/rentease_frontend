'use client'

import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Eyebrow({
  icon: Icon,
  children,
  tone = 'indigo',
}: {
  icon: any
  children: ReactNode
  tone?: 'indigo' | 'violet' | 'amber' | 'emerald' | 'sky'
}) {
  const tones: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    sky: 'bg-sky-50 text-sky-600',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full',
        tones[tone]
      )}
    >
      <Icon className="h-3 w-3" /> {children}
    </span>
  )
}

export function FAQAccordion({
  items,
  defaultOpen = 0,
}: {
  items: { q: string; a: string }[]
  defaultOpen?: number | null
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-6">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q} className="border-b border-slate-100 last:border-0">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex items-center justify-between w-full py-4 text-left group"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors pr-4">
                {item.q}
              </span>
              <span
                className={cn(
                  'shrink-0 w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 transition-transform',
                  isOpen && 'rotate-45 border-indigo-300 text-indigo-500'
                )}
              >
                +
              </span>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-slate-500 leading-relaxed pb-4 pr-8">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export function CTABand({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="w-full py-12 px-6 bg-gradient-to-r from-indigo-700 via-violet-600 to-pink-600 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 70% 20%, rgba(251,191,36,0.4), transparent 40%), radial-gradient(circle at 20% 80%, rgba(34,211,238,0.3), transparent 40%)',
        }}
      />
      <div className="relative max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-5">
        <div className="text-center lg:text-left">
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white">{title}</h3>
          <p className="text-violet-100 mt-1 text-sm max-w-xl">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
