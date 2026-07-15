'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

export type Accent = 'blue' | 'indigo' | 'emerald' | 'rose' | 'violet' | 'amber'

export const ACCENTS: { id: Accent; label: string; swatch: string }[] = [
  { id: 'blue',    label: 'Ocean',   swatch: '#2874f0' },
  { id: 'indigo',  label: 'Indigo',  swatch: '#4f46e5' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669' },
  { id: 'violet',  label: 'Violet',  swatch: '#7c3aed' },
  { id: 'rose',    label: 'Rose',    swatch: '#e11d48' },
  { id: 'amber',   label: 'Sunset',  swatch: '#d97706' },
]

const STORAGE_KEY = 'rentease_accent'

interface AccentContextValue {
  accent: Accent
  setAccent: (a: Accent) => void
}

const AccentContext = createContext<AccentContextValue>({ accent: 'blue', setAccent: () => {} })

export function AccentThemeProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<Accent>('blue')

  // Restore persisted accent on mount and apply it to <html>.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Accent | null
      if (saved) {
        setAccentState(saved)
        document.documentElement.dataset.accent = saved
      }
    } catch { /* ignore */ }
  }, [])

  const setAccent = useCallback((a: Accent) => {
    setAccentState(a)
    try { localStorage.setItem(STORAGE_KEY, a) } catch { /* ignore */ }
    document.documentElement.dataset.accent = a
  }, [])

  return (
    <AccentContext.Provider value={{ accent, setAccent }}>
      {children}
    </AccentContext.Provider>
  )
}

export function useAccent() {
  return useContext(AccentContext)
}
