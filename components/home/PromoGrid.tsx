'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { Banner } from '@/hooks/useHomeData'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// A soft glyph shadow is used instead of a full-card dark wash: the artwork is
// the point of these cards, so nothing is laid over it — but white copy still
// has to stay readable on a bright photo.
const TEXT_SHADOW = '0 1px 3px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.25)'

// So a pair never sits on one dead-flat line, the second card drops a little.
// The offset is lg-only, so the single- and two-column layouts stay aligned.
const STAGGER = [
  { offset: '', height: 'h-40 sm:h-48' },
  { offset: 'lg:mt-6', height: 'h-40 sm:h-48' },
]

/**
 * Columns follow how many cards this placement actually renders, so a short
 * batch never leaves a ragged empty column behind.
 */
function columnsFor(count: number): string {
  if (count <= 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2'
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
}

// Static fallback promo cards — used until an admin adds `promo` banners.
const FALLBACK: Banner[] = [
  {
    _id: 'p1', type: 'promo', title: 'First Month 40% Off', subtitle: 'New users only',
    image: { url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&h=400&fit=crop', alt: '' },
    cta: { label: 'Grab deal', link: '/products' },
    theme: { gradient: 'from-blue-600 to-indigo-600', textColor: '#fff', bgColor: '#2874F0', accent: '#FFD400' },
    badge: '40% OFF',
  },
  {
    _id: 'p2', type: 'promo', title: 'Free Delivery', subtitle: 'On orders above ₹5,000',
    image: { url: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=600&h=400&fit=crop', alt: '' },
    cta: { label: 'Shop now', link: '/products' },
    theme: { gradient: 'from-emerald-600 to-teal-600', textColor: '#fff', bgColor: '#059669', accent: '#FBBF24' },
    badge: 'FREE SHIP',
  },
  {
    _id: 'p3', type: 'promo', title: 'Zero Deposit Electronics', subtitle: 'Limited period',
    image: { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop', alt: '' },
    cta: { label: 'Explore', link: '/products?category=electronics' },
    theme: { gradient: 'from-orange-500 to-red-500', textColor: '#fff', bgColor: '#F97316', accent: '#FDE047' },
    badge: 'NEW',
  },
  {
    _id: 'p4', type: 'promo', title: 'Sofa Sets on Rent', subtitle: 'From ₹499 / month',
    image: { url: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=600&h=400&fit=crop', alt: '' },
    cta: { label: 'Browse sofas', link: '/products?category=furniture' },
    theme: { gradient: 'from-violet-600 to-purple-600', textColor: '#fff', bgColor: '#7C3AED', accent: '#FDE047' },
    badge: 'FLEXIBLE',
  },
]

function trackClick(id: string) {
  if (id.startsWith('p')) return
  fetch(`${BASE_URL}/api/v1/banners/${id}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'click' }),
  }).catch(() => {})
}

export function PromoGrid({
  promos,
  from = 0,
  take = 2,
}: {
  promos: Banner[]
  /**
   * Index into the resolved list to start at, and how many cards to render.
   * These let the page spread promos down the page in small batches instead of
   * stacking every promo in one strip.
   */
  from?: number
  take?: number
}) {
  const all = promos.length > 0 ? promos : FALLBACK
  const cards = all.slice(from, from + take)

  // Nothing left at this position — render nothing, so the page simply loses
  // that row instead of showing an empty section.
  if (!cards.length) return null

  return (
    <section className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-4">
      <div className={`grid items-start gap-3 sm:gap-4 ${columnsFor(cards.length)}`}>
        {cards.map((c, i) => {
          const isFallback = c._id.startsWith('p')
          const stagger = STAGGER[i % STAGGER.length]

          return (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={stagger.offset}
            >
              <Link
                href={c.cta?.link || '/products'}
                onClick={() => trackClick(c._id)}
                className={`group relative block overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-xl ${stagger.height}`}
              >
                {c.image?.url && (
                  <img
                    src={c.image.url}
                    alt={c.image.alt || c.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Gradient only when a card genuinely has no image, so it never
                    renders as an empty box. Cards WITH artwork stay plain. */}
                {isFallback && !c.image?.url && (
                  <div className={`absolute inset-0 bg-gradient-to-tr ${c.theme?.gradient || 'from-blue-700 to-indigo-700'} opacity-85`} />
                )}

                <div className="relative h-full flex flex-col justify-between p-4">
                  <div>
                    {c.badge && (
                      <span
                        className="inline-block text-[10px] font-black px-2.5 py-1 rounded-full mb-2 shadow"
                        style={{ backgroundColor: c.theme?.accent || '#FFD400', color: '#0D47A1' }}
                      >
                        {c.badge}
                      </span>
                    )}
                    <h3 className="text-lg sm:text-xl font-black leading-tight" style={{ color: c.theme?.textColor || '#fff', textShadow: TEXT_SHADOW }}>
                      {c.title}
                    </h3>
                    {c.subtitle && (
                      <p className="text-xs sm:text-sm font-medium opacity-90 mt-0.5" style={{ color: c.theme?.textColor || '#fff', textShadow: TEXT_SHADOW }}>
                        {c.subtitle}
                      </p>
                    )}
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold w-fit px-3 py-1.5 rounded-lg group-hover:gap-2.5 transition-all"
                    style={{ backgroundColor: c.theme?.accent || '#FFD400', color: '#0D47A1' }}
                  >
                    {c.cta?.label || 'Shop'} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
