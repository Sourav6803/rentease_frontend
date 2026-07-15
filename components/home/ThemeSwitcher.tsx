'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Sun, Moon, Laptop, X, Check } from 'lucide-react'
import { useAccent, ACCENTS } from '@/components/providers/AccentThemeProvider'
import { cn } from '@/lib/utils'

const MODES = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'Auto', icon: Laptop },
]

/**
 * Floating theme customizer — lets the visitor pick a light/dark mode and a
 * brand accent. Both persist (next-themes + AccentThemeProvider) and re-skin
 * the whole storefront instantly via CSS variables.
 */
export function ThemeSwitcher() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { accent, setAccent } = useAccent()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Customize theme"
        className="fixed right-4 bottom-24 z-40 h-12 w-12 rounded-full shadow-lg flex items-center justify-center text-white
                   bg-[linear-gradient(135deg,var(--brand-gradient-from),var(--brand-gradient-to))]
                   hover:scale-105 active:scale-95 transition-transform ring-2 ring-white/40"
      >
        <Palette className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 24, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 24, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="fixed right-4 bottom-40 z-50 w-72 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-brand" />
                  <span className="text-sm font-bold text-foreground">Personalize</span>
                </div>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Mode */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Appearance</p>
                  <div className="grid grid-cols-3 gap-2">
                    {MODES.map(m => {
                      const Icon = m.icon
                      const active = theme === m.id
                      return (
                        <button
                          key={m.id}
                          onClick={() => setTheme(m.id)}
                          className={cn(
                            'flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all',
                            active ? 'border-brand bg-brand-soft' : 'border-border hover:border-brand/40'
                          )}
                        >
                          <Icon className={cn('h-4 w-4', active ? 'text-brand' : 'text-muted-foreground')} />
                          <span className={cn('text-[11px] font-semibold', active ? 'text-brand' : 'text-muted-foreground')}>
                            {m.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Accent */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Accent color</p>
                  <div className="grid grid-cols-6 gap-2">
                    {ACCENTS.map(a => (
                      <button
                        key={a.id}
                        onClick={() => setAccent(a.id)}
                        aria-label={a.label}
                        title={a.label}
                        className={cn(
                          'relative h-9 w-9 rounded-full transition-transform hover:scale-110 ring-2 ring-offset-2 ring-offset-card',
                          accent === a.id ? 'ring-foreground/60' : 'ring-transparent'
                        )}
                        style={{ backgroundColor: a.swatch }}
                      >
                        {accent === a.id && <Check className="h-4 w-4 text-white absolute inset-0 m-auto" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
