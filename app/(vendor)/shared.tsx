'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Building2, Headphones, ArrowRight, ChevronLeft, ChevronRight as ChevronRightIcon,
  BadgeCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Shared nav / brand data ──────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Success stories', href: '/success-stories' },
  { label: 'Support', href: '/support' },
]

export const TRUST_BADGES = ['PCI-DSS L1', 'ISO 27001', 'RBI Compliant', 'SOC 2 Type II']

// ── Fixed site header (shared across all marketing pages) ───────────────────
export function SiteHeader({ active }: { active?: string }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={cn('fixed top-0 inset-x-0 z-50 transition-shadow duration-300', scrolled && 'shadow-xl shadow-indigo-950/20')}>
      <div className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center ring-1 ring-white/30">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="text-lg font-extrabold text-white tracking-tight block">RentEase</span>
              <span className="text-[10px] font-bold text-violet-100/80 uppercase tracking-[0.18em]">Vendor Portal</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className={cn('text-sm font-medium relative group', active === l.href ? 'text-white' : 'text-violet-50 hover:text-white')}>
                {l.label}
                <span className={cn('absolute -bottom-1 left-0 h-0.5 bg-amber-300 rounded-full transition-all duration-300', active === l.href ? 'w-full' : 'w-0 group-hover:w-full')} />
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href="tel:18001234567" className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-violet-50">
              <Headphones className="h-3.5 w-3.5" /> 1800-123-4567
            </a>
            <Link href="/vendor/login" className="hidden sm:block text-sm font-semibold text-violet-50 hover:text-white transition-colors">Sign in</Link>
            <Link href="/vendor/register">
              <Button variant="secondary" className="h-9 rounded-lg bg-white text-indigo-700 font-semibold text-sm hover:bg-amber-300 hover:text-indigo-900 gap-1.5 shadow-md">
                Become a Vendor <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full h-0.5 bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400" />
    </header>
  )
}

// Spacer to push page content below the fixed header (header is 64px + 2px accent bar)
export function HeaderSpacer() {
  return <div className="h-[66px] shrink-0" aria-hidden="true" />
}

// ── Shared footer ─────────────────────────────────────────────────────────────
export function SiteFooter() {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 py-10 px-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center"><Building2 className="h-4 w-4 text-white" /></div>
            <span className="text-base font-bold text-white">RentEase</span>
          </div>
          <p className="text-xs leading-relaxed">India's most trusted rental marketplace. Empowering vendors with technology, security, and visibility.</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">Platform</p>
          {[['How it works', '/how-it-works'], ['Pricing', '/pricing'], ['Success stories', '/success-stories'], ['Support', '/support']].map(([l, h]) => <Link key={l} href={h} className="block py-1 hover:text-white transition-colors">{l}</Link>)}
        </div>
        <div>
          <p className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">Vendor</p>
          {[['Become a Vendor', '/vendor/register'], ['Vendor Login', '/vendor/login'], ['Support', '/support'], ['Vendor Handbook', '/handbook']].map(([l, h]) => <Link key={l} href={h} className="block py-1 hover:text-white transition-colors">{l}</Link>)}
        </div>
        <div>
          <p className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">Company</p>
          {[['About', '/about'], ['Careers', '/careers'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([l, h]) => <Link key={l} href={h} className="block py-1 hover:text-white transition-colors">{l}</Link>)}
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs">© 2026 RentEase Technologies Pvt. Ltd. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-2">{TRUST_BADGES.map(b => <span key={b} className="flex items-center gap-1 text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-full"><BadgeCheck className="h-3 w-3 text-indigo-400" /> {b}</span>)}</div>
      </div>
    </footer>
  )
}

// ── Reusable carousel (autoplay + manual arrows + dots + keyboard) ──────────
export function Carousel<T>({
  items,
  renderItem,
  interval = 6000,
  ariaLabel,
  slideClassName,
}: {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  interval?: number
  ariaLabel: string
  slideClassName?: string
}) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || items.length <= 1) return
    const t = setInterval(() => setCurrent(c => (c + 1) % items.length), interval)
    return () => clearInterval(t)
  }, [items.length, interval, paused])

  const next = () => setCurrent(c => (c + 1) % items.length)
  const prev = () => setCurrent(c => (c - 1 + items.length) % items.length)

  return (
    <div
      className="relative"
      role="region"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={cn('overflow-hidden', slideClassName)}>
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4 }}>
            {renderItem(items[current], current)}
          </motion.div>
        </AnimatePresence>
      </div>
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button type="button" onClick={prev} aria-label="Previous slide" className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-indigo-300 transition-colors">
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button key={i} type="button" onClick={() => setCurrent(i)} aria-label={`Go to slide ${i + 1}`} className={cn('h-1.5 rounded-full transition-all', i === current ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-300 hover:bg-slate-400')} />
            ))}
          </div>
          <button type="button" onClick={next} aria-label="Next slide" className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:border-indigo-300 transition-colors">
            <ChevronRightIcon className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Generic FAQ accordion item ───────────────────────────────────────────────
export function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button type="button" onClick={onToggle} className="flex items-center justify-between w-full py-4 text-left group" aria-expanded={isOpen}>
        <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors pr-4">{q}</span>
        <span className={cn('shrink-0 w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 transition-transform', isOpen && 'rotate-45 border-indigo-300 text-indigo-500')}>+</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="text-sm text-slate-500 leading-relaxed pb-4 pr-8">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── CTA band (shared closer for every page) ──────────────────────────────────
export function CTABand({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="w-full py-12 px-6 bg-gradient-to-r from-indigo-700 via-violet-600 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(251,191,36,0.4), transparent 40%), radial-gradient(circle at 20% 80%, rgba(34,211,238,0.3), transparent 40%)' }} />
      <div className="relative max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-5">
        <div className="text-center lg:text-left">
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white">{title}</h3>
          <p className="text-violet-100 mt-1 text-sm max-w-xl">{subtitle}</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/vendor/register"><Button className="h-11 px-6 bg-amber-400 hover:bg-amber-300 text-indigo-900 font-bold rounded-xl gap-2">Become a Vendor <ArrowRight className="h-4 w-4" /></Button></Link>
          <Link href="/support"><Button variant="outline" className="h-11 px-6 bg-white/0 border-white/40 text-white hover:bg-white/10 rounded-xl gap-2">Talk to sales</Button></Link>
        </div>
      </div>
    </div>
  )
}

// ── Section eyebrow (small pill label used at the top of most sections) ─────
export function Eyebrow({ icon: Icon, children, tone = 'indigo' }: { icon: any; children: ReactNode; tone?: 'indigo' | 'violet' | 'amber' | 'emerald' }) {
  const tones: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full', tones[tone])}>
      <Icon className="h-3 w-3" /> {children}
    </span>
  )
}