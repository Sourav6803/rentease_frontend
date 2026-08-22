'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import type { Banner } from '@/hooks/useHomeData'
import { Skeleton } from '@/components/ui/skeleton'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Static fallback slides — used until an admin adds hero banners via the API.
const FALLBACK: Banner[] = [
  {
    _id: 'f1', type: 'hero', title: 'Rent Premium Furniture', subtitle: 'Up to 40% off first month',
    description: 'Furnish your home the flexible way. No huge deposits, free delivery, easy returns.',
    image: { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&h=520&fit=crop', alt: 'Furniture' },
    cta: { label: 'Shop Furniture', link: '/products?category=furniture' },
    theme: { gradient: 'from-blue-600 to-indigo-600', textColor: '#fff', bgColor: '#2874F0', accent: '#FFD400' },
    badge: 'HOT DEAL',
  },
  {
    _id: 'f2', type: 'hero', title: 'Latest Electronics on Rent', subtitle: 'Zero deposit plans',
    description: 'Laptops, TVs, and gadgets delivered to your door. Upgrade anytime.',
    image: { url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&h=520&fit=crop', alt: 'Electronics' },
    cta: { label: 'Explore Electronics', link: '/products?category=electronics' },
    theme: { gradient: 'from-orange-500 to-red-500', textColor: '#fff', bgColor: '#F97316', accent: '#FDE047' },
    badge: 'NEW',
  },
  {
    _id: 'f3', type: 'hero', title: 'Home Appliances Made Easy', subtitle: 'Flexible monthly plans',
    description: 'Washing machines, refrigerators & more — rent with zero maintenance worries.',
    image: { url: 'https://images.unsplash.com/photo-1583947581924-860bda6e8b7e?w=1600&h=520&fit=crop', alt: 'Appliances' },
    cta: { label: 'View Appliances', link: '/products?category=appliances' },
    theme: { gradient: 'from-emerald-600 to-teal-600', textColor: '#fff', bgColor: '#059669', accent: '#FBBF24' },
    badge: 'POPULAR',
  },
]

function trackClick(id: string) {
  if (id.startsWith('f')) return
  fetch(`${BASE_URL}/api/v1/banners/${id}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'click' }),
  }).catch(() => {})
}

export function HeroCarousel({ banners, isLoading }: { banners: Banner[]; isLoading: boolean }) {
  const slides = banners.length > 0 ? banners : FALLBACK
  const [index, setIndex] = useState(0)
  const [auto, setAuto] = useState(true)

  // Clamp during render: when the list shrinks (e.g. 5 → 2), the effect below
  // only resets the index AFTER paint — this guard prevents `slides[staleIndex]`
  // from being undefined and crashing on `slide._id`.
  const safeIndex = slides.length > 0 ? Math.min(index, slides.length - 1) : 0
  const slide = slides.length > 0 ? slides[safeIndex] : undefined
  // Fallback is FALLBACK — never guess from the id prefix (real Mongo ObjectIds
  // are hex and can legitimately start with 'f', e.g. "f0a1…").
  const isFallback = banners.length === 0
  const slideId = slide?._id ?? ''
  const slideKey = slideId || `slide-${safeIndex}`

  const next = useCallback(() => {
    setIndex(i => (slides.length > 1 ? (i + 1) % slides.length : 0))
  }, [slides.length])

  const prev = useCallback(() => {
    setAuto(false)
    setIndex(i => (slides.length > 1 ? (i - 1 + slides.length) % slides.length : 0))
  }, [slides.length])

  useEffect(() => {
    if (!auto || slides.length <= 1) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [auto, next, slides.length])

  // Keep the index within bounds whenever the slide set changes. Clamp instead
  // of hard-resetting so a refetch with the same count keeps the user's spot.
  useEffect(() => {
    setIndex(i => (slides.length > 0 ? Math.min(i, slides.length - 1) : 0))
  }, [slides.length])

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 pt-3">
        <Skeleton className="w-full h-[220px] sm:h-[320px] lg:h-[400px] rounded-2xl" />
      </div>
    )
  }

  // Defensive: no slides at all — render nothing instead of crashing on slide._id.
  if (!slide) {
    return null
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 pt-3">
      <div
        className="relative w-full h-[220px] sm:h-[320px] lg:h-[400px] rounded-2xl overflow-hidden group shadow-lg"
        onMouseEnter={() => setAuto(false)}
        onMouseLeave={() => setAuto(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slideKey}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            {/* Background image */}
            {slide.image?.url && (
              <img
                src={slide.image.url}
                alt={slide.image.alt || slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Overlay - Only for fallback slides or when no image exists */}
            {!slide.image?.url || isFallback ? (
              // Gradient overlay for fallback slides
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.theme?.gradient || 'from-blue-700 to-indigo-700'} opacity-85`} />
            ) : (
              // Dark overlay for real banner images to improve text readability
              <div className="absolute inset-0 bg-black/30" />
            )}

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="px-6 sm:px-10 lg:px-16 max-w-2xl">
                {slide.badge && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="inline-block text-[10px] sm:text-xs font-black px-3 py-1 rounded-full mb-3 shadow"
                    style={{ backgroundColor: slide.theme?.accent || '#FFD400', color: '#0D47A1' }}
                  >
                    {slide.badge}
                  </motion.span>
                )}
                <motion.h2
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-xl sm:text-3xl lg:text-5xl font-black leading-tight mb-2"
                  style={{ color: slide.theme?.textColor || '#fff' }}
                >
                  {slide.title}
                </motion.h2>
                {slide.subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-sm sm:text-lg lg:text-xl font-semibold mb-2 opacity-95"
                    style={{ color: slide.theme?.textColor || '#fff' }}
                  >
                    {slide.subtitle}
                  </motion.p>
                )}
                {slide.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="hidden sm:block text-sm lg:text-base mb-5 opacity-90 max-w-lg"
                    style={{ color: slide.theme?.textColor || '#fff' }}
                  >
                    {slide.description}
                  </motion.p>
                )}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <Link
                    href={slide.cta?.link || '/products'}
                    onClick={() => {
                      if (!isFallback && slideId) trackClick(slideId)
                    }}
                    className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    style={{ backgroundColor: slide.theme?.accent || '#FFD400', color: '#0D47A1' }}
                  >
                    {slide.cta?.label || 'Shop Now'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5 text-slate-800" />
            </button>
            <button
              onClick={() => { setAuto(false); next() }}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5 text-slate-800" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setAuto(false); setIndex(i) }}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === safeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}