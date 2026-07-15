'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { Banner } from '@/hooks/useHomeData'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

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
    image: { url: 'https://images.unsplash.com/photo-1601599963565-b7f49deb352e?w=600&h=400&fit=crop', alt: '' },
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
]

function trackClick(id: string) {
  if (id.startsWith('p')) return
  fetch(`${BASE_URL}/api/v1/banners/${id}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'click' }),
  }).catch(() => {})
}

export function PromoGrid({ promos }: { promos: Banner[] }) {
  const cards = promos.length > 0 ? promos : FALLBACK
  if (!cards.length) return null

  return (
    <section className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.slice(0, 6).map((c, i) => {
          const isFallback = c._id.startsWith('p')
          
          return (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={c.cta?.link || '/products'}
                onClick={() => trackClick(c._id)}
                className="group relative block h-40 sm:h-44 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
              >
                {c.image?.url && (
                  <img
                    src={c.image.url}
                    alt={c.image.alt || c.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                
                {/* Only add overlay for fallback cards without images */}
                {isFallback && !c.image?.url && (
                  <div className={`absolute inset-0 bg-gradient-to-tr ${c.theme?.gradient || 'from-blue-700 to-indigo-700'} opacity-85`} />
                )}
                
                {/* Subtle dark overlay for better text readability on all cards */}
                <div className="absolute inset-0 bg-black/20" />
                
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
                    <h3 className="text-lg sm:text-xl font-black leading-tight" style={{ color: c.theme?.textColor || '#fff' }}>
                      {c.title}
                    </h3>
                    {c.subtitle && (
                      <p className="text-xs sm:text-sm font-medium opacity-90 mt-0.5" style={{ color: c.theme?.textColor || '#fff' }}>
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