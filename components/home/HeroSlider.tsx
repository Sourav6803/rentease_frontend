// // src/components/home/HeroSlider.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { ChevronLeft, ChevronRight, Circle, CircleDot } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import Image from 'next/image'
// import Link from 'next/link'

// const slides = [
//   {
//     id: 1,
//     title: "Premium Furniture",
//     subtitle: "Up to 40% off",
//     description: "Transform your home with our premium furniture collection. Flexible rental plans available.",
//     image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=400&fit=crop",
//     cta: "Shop Now",
//     link: "/products?category=furniture",
//     color: "from-blue-600 to-purple-600"
//   },
//   {
//     id: 2,
//     title: "Electronics Sale",
//     subtitle: "Latest Gadgets",
//     description: "Rent the latest electronics at unbeatable prices. Free delivery on first order.",
//     image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=400&fit=crop",
//     cta: "Explore Now",
//     link: "/products?category=electronics",
//     color: "from-orange-500 to-red-500"
//   },
//   {
//     id: 3,
//     title: "Home Appliances",
//     subtitle: "Easy EMI Available",
//     description: "Get home appliances on rent with zero deposit. Flexible monthly plans.",
//     image: "https://images.unsplash.com/photo-1583947581924-860bda6e8b7e?w=1200&h=400&fit=crop",
//     cta: "View Collection",
//     link: "/products?category=appliances",
//     color: "from-green-600 to-teal-600"
//   }
// ]

// export function HeroSlider() {
//   const [currentIndex, setCurrentIndex] = useState(0)
//   const [isAutoPlaying, setIsAutoPlaying] = useState(true)

//   useEffect(() => {
//     if (!isAutoPlaying) return
//     const interval = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % slides.length)
//     }, 5000)
//     return () => clearInterval(interval)
//   }, [isAutoPlaying])

//   const goToPrevious = () => {
//     setIsAutoPlaying(false)
//     setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
//   }

//   const goToNext = () => {
//     setIsAutoPlaying(false)
//     setCurrentIndex((prev) => (prev + 1) % slides.length)
//   }

//   const goToSlide = (index: number) => {
//     setIsAutoPlaying(false)
//     setCurrentIndex(index)
//   }

//   const currentSlide = slides[currentIndex]

//   return (
//     <div className="relative overflow-hidden rounded-none md:rounded-xl mx-0 md:mx-4 lg:mx-8 mt-0 md:mt-4">
//       {/* Slide Container */}
//       <div className="relative h-[300px] md:h-[400px] lg:h-[450px]">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={currentIndex}
//             initial={{ opacity: 0, scale: 1.05 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.95 }}
//             transition={{ duration: 0.5 }}
//             className="absolute inset-0"
//           >
//             {/* Background Image */}
//             <div className="absolute inset-0 bg-black/40 z-10" />
//             <Image
//               src={currentSlide.image}
//               alt={currentSlide.title}
//               fill
//               className="object-cover"
//               priority
//             />
            
//             {/* Content */}
//             <div className="relative z-20 h-full flex items-center justify-start px-6 md:px-12 lg:px-20">
//               <div className="max-w-xl text-white">
//                 <motion.p
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.2 }}
//                   className="text-sm md:text-base font-semibold uppercase tracking-wider text-yellow-400"
//                 >
//                   {currentSlide.subtitle}
//                 </motion.p>
//                 <motion.h1
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.3 }}
//                   className="text-2xl md:text-4xl lg:text-5xl font-bold mt-2 mb-3"
//                 >
//                   {currentSlide.title}
//                 </motion.h1>
//                 <motion.p
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.4 }}
//                   className="text-sm md:text-base text-white/90 mb-6 line-clamp-2"
//                 >
//                   {currentSlide.description}
//                 </motion.p>
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.5 }}
//                 >
//                   <Link href={currentSlide.link}>
//                     <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8">
//                       {currentSlide.cta}
//                     </Button>
//                   </Link>
//                 </motion.div>
//               </div>
//             </div>
//           </motion.div>
//         </AnimatePresence>
//       </div>

//       {/* Navigation Arrows */}
//       <button
//         onClick={goToPrevious}
//         className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all"
//         aria-label="Previous slide"
//       >
//         <ChevronLeft className="h-5 w-5 text-white" />
//       </button>
//       <button
//         onClick={goToNext}
//         className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all"
//         aria-label="Next slide"
//       >
//         <ChevronRight className="h-5 w-5 text-white" />
//       </button>

//       {/* Dot Indicators */}
//       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
//         {slides.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => goToSlide(index)}
//             className="transition-all"
//             aria-label={`Go to slide ${index + 1}`}
//           >
//             {index === currentIndex ? (
//               <CircleDot className="h-3 w-3 text-white" />
//             ) : (
//               <Circle className="h-2 w-2 text-white/60 hover:text-white/80" />
//             )}
//           </button>
//         ))}
//       </div>
//     </div>
//   )
// }

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// ─── Slide Data ────────────────────────────────────────────────────────────────
const slides = [
  {
    id: 1,
    tag: 'Limited Time Offer',
    title: 'Premium Furniture',
    highlight: 'Up to 40% Off',
    description: 'Transform your living space with our curated furniture collection. Flexible rental plans starting at ₹499/mo.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&h=420&fit=crop&q=85',
    cta: 'Shop Furniture',
    link: '/products?category=furniture',
    badge: '🛋️ Free Delivery',
    accentFrom: '#1a6de0',
    accentTo: '#0d4fa0',
    tagColor: '#fbbf24',
  },
  {
    id: 2,
    tag: 'Latest Gadgets',
    title: 'Electronics & Gadgets',
    highlight: 'Zero Deposit Rental',
    description: 'Rent the newest electronics — laptops, cameras, TVs and more. Free delivery on your first order.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1400&h=420&fit=crop&q=85',
    cta: 'Explore Electronics',
    link: '/products?category=electronics',
    badge: '⚡ Same-Day Delivery',
    accentFrom: '#c2410c',
    accentTo: '#9a3412',
    tagColor: '#fb923c',
  },
  {
    id: 3,
    tag: 'Easy EMI Available',
    title: 'Home Appliances',
    highlight: 'Starting ₹299/Month',
    description: 'Fridges, washing machines, ACs on rent — zero deposit, hassle-free doorstep installation.',
    image: 'https://images.unsplash.com/photo-1583947581924-860bda6e8b7e?w=1400&h=420&fit=crop&q=85',
    cta: 'View Appliances',
    link: '/products?category=appliances',
    badge: '🔧 Free Installation',
    accentFrom: '#047857',
    accentTo: '#065f46',
    tagColor: '#34d399',
  },
  {
    id: 4,
    tag: 'Work From Home',
    title: 'Office & Study Setup',
    highlight: 'Corporate Plans Available',
    description: 'Ergonomic chairs, desks, monitors — everything for your perfect workstation, on rent.',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&h=420&fit=crop&q=85',
    cta: 'Build My Setup',
    link: '/products?category=office',
    badge: '💼 GST Invoice',
    accentFrom: '#6d28d9',
    accentTo: '#4c1d95',
    tagColor: '#a78bfa',
  },
]

const AUTOPLAY_DELAY = 4500

// ─── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ active, duration }: { active: boolean; duration: number }) {
  return (
    <div className="hs-prog-track">
      <motion.div
        className="hs-prog-fill"
        initial={{ width: '0%' }}
        animate={active ? { width: '100%' } : { width: '0%' }}
        transition={active ? { duration: duration / 1000, ease: 'linear' } : { duration: 0 }}
      />
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [dir, setDir] = useState<'next' | 'prev'>('next')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const total = slides.length

  const goTo = useCallback((index: number, direction: 'next' | 'prev' = 'next') => {
    setDir(direction)
    setCurrent((index + total) % total)
  }, [total])

  const prev = useCallback(() => {
    setPaused(true)
    goTo(current - 1, 'prev')
  }, [current, goTo])

  const next = useCallback(() => {
    setPaused(true)
    goTo(current + 1, 'next')
  }, [current, goTo])

  // Autoplay
  useEffect(() => {
    if (paused) {
      timerRef.current = setTimeout(() => setPaused(false), 6000)
      return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }
    const id = setInterval(() => {
      setDir('next')
      setCurrent(c => (c + 1) % total)
    }, AUTOPLAY_DELAY)
    return () => clearInterval(id)
  }, [paused, total])

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  // Touch swipe
  const touchStartX = useRef(0)
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev()
  }

  const slide = slides[current]

  const variants = {
    enter: (d: 'next' | 'prev') => ({ opacity: 0, x: d === 'next' ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (d: 'next' | 'prev') => ({ opacity: 0, x: d === 'next' ? -60 : 60 }),
  }

  return (
    <>
      {/* ── Scoped Styles ── */}
      <style>{`
        .hs-root {
          position: relative;
          width: 100%;
          background: #0f172a;
          overflow: hidden;
          user-select: none;
          /* Flipkart/Amazon: compact fixed height */
          height: 210px;
        }
        @media (min-width: 480px)  { .hs-root { height: 200px; } }
        @media (min-width: 768px)  { .hs-root { height: 200px; border-radius: 8px; } }
        @media (min-width: 1024px) { .hs-root { height: 280px; border-radius: 10px; } }
        @media (min-width: 1280px) { .hs-root { height: 280px; border-radius: 12px; } }

        /* Slide */
        .hs-slide { position: absolute; inset: 0; }

        /* Gradient overlay — left-heavy like FK/Amazon */
        .hs-overlay {
          position: absolute; inset: 0; z-index: 2;
          background: linear-gradient(
            to right,
            rgba(0,0,0,0.72) 0%,
            rgba(0,0,0,0.48) 38%,
            rgba(0,0,0,0.12) 65%,
            transparent 100%
          );
        }
        @media (max-width: 479px) {
          .hs-overlay {
            background: linear-gradient(
              to top,
              rgba(0,0,0,0.80) 0%,
              rgba(0,0,0,0.50) 50%,
              rgba(0,0,0,0.10) 100%
            );
          }
        }

        /* Content */
        .hs-content {
          position: absolute; inset: 0; z-index: 3;
          display: flex; align-items: flex-end;
          padding: 0 16px 20px;
        }
        @media (min-width: 480px) {
          .hs-content { align-items: center; padding: 0 20px; }
        }
        @media (min-width: 768px) { .hs-content { padding: 0 36px; } }
        @media (min-width: 1024px) { .hs-content { padding: 0 56px; } }

        .hs-text { max-width: 560px; }

        .hs-tag {
          display: inline-block;
          font-size: 10px; font-weight: 700;
          letter-spacing: 1.8px; text-transform: uppercase;
          padding: 3px 10px; border-radius: 4px;
          margin-bottom: 8px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.18);
        }
        @media (min-width: 768px) { .hs-tag { font-size: 11px; margin-bottom: 10px; } }

        .hs-title {
          font-family: 'DM Serif Display', 'Georgia', serif;
          font-size: 22px; font-weight: 700; line-height: 1.15;
          color: #fff; margin: 0 0 4px; letter-spacing: -0.3px;
        }
        @media (min-width: 480px) { .hs-title { font-size: 26px; } }
        @media (min-width: 768px) { .hs-title { font-size: 32px; margin-bottom: 6px; } }
        @media (min-width: 1024px) { .hs-title { font-size: 40px; } }

        .hs-highlight {
          font-size: 13px; font-weight: 600;
          margin-bottom: 8px; display: block;
        }
        @media (min-width: 768px) { .hs-highlight { font-size: 15px; margin-bottom: 10px; } }
        @media (min-width: 1024px) { .hs-highlight { font-size: 17px; } }

        .hs-desc {
          font-size: 12px; color: rgba(255,255,255,0.80);
          line-height: 1.5; margin-bottom: 14px;
          display: none;
        }
        @media (min-width: 640px) { .hs-desc { display: block; font-size: 13px; } }
        @media (min-width: 1024px) { .hs-desc { font-size: 14px; margin-bottom: 18px; } }

        /* CTA row */
        .hs-cta-row {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }

        .hs-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.2px;
          padding: 8px 18px; border-radius: 6px;
          background: #fff; color: #111;
          border: none; cursor: pointer;
          text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.25);
          white-space: nowrap;
        }
        .hs-btn:hover { background: #f1f5f9; transform: translateY(-1px); box-shadow: 0 4px 18px rgba(0,0,0,0.3); }
        .hs-btn:active { transform: scale(0.97); }
        @media (min-width: 768px) { .hs-btn { font-size: 13px; padding: 10px 24px; } }

        .hs-badge {
          font-size: 11px; font-weight: 600;
          padding: 5px 10px; border-radius: 5px;
          background: rgba(255,255,255,0.13);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.22);
          color: #fff; white-space: nowrap;
          display: none;
        }
        @media (min-width: 480px) { .hs-badge { display: inline-flex; align-items: center; gap: 4px; } }

        /* Nav arrows */
        .hs-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 10; width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.92);
          border: none; cursor: pointer;
          display: none; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          transition: background 0.15s, transform 0.15s, opacity 0.15s;
          opacity: 0;
        }
        .hs-root:hover .hs-arrow { opacity: 1; }
        .hs-arrow:hover { background: #fff; transform: translateY(-50%) scale(1.08); }
        .hs-arrow:active { transform: translateY(-50%) scale(0.95); }
        @media (min-width: 768px) {
          .hs-arrow { display: flex; width: 36px; height: 36px; }
        }
        @media (min-width: 1024px) { .hs-arrow { width: 40px; height: 40px; } }
        .hs-arrow-left  { left: 10px; }
        .hs-arrow-right { right: 10px; }
        @media (min-width: 768px) {
          .hs-arrow-left  { left: 14px; }
          .hs-arrow-right { right: 14px; }
        }
        .hs-arrow svg { width: 16px; height: 16px; color: #1e293b; }
        @media (min-width: 1024px) { .hs-arrow svg { width: 18px; height: 18px; } }

        /* Bottom bar — dots + progress */
        .hs-bottom {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 10;
          display: flex; align-items: center; justify-content: center;
          padding: 0 0 10px; gap: 5px;
        }
        @media (min-width: 768px) { .hs-bottom { padding: 0 0 14px; gap: 6px; } }

        /* Dot */
        .hs-dot {
          border: none; cursor: pointer; padding: 0;
          background: none; display: flex; align-items: center;
        }
        .hs-dot-inner {
          height: 3px; border-radius: 2px;
          background: rgba(255,255,255,0.35);
          transition: background 0.25s, width 0.3s cubic-bezier(.4,0,.2,1);
          overflow: hidden; position: relative;
        }
        .hs-dot.active .hs-dot-inner { background: rgba(255,255,255,0.25); }

        /* Progress track inside active dot */
        .hs-prog-track {
          position: absolute; inset: 0; background: transparent;
        }
        .hs-prog-fill {
          height: 100%; background: #fff; border-radius: 2px;
        }
      `}</style>

      <div
        className="hs-root"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-label="Promotional banners"
        aria-roledescription="carousel"
      >
        {/* ── Slides ── */}
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={current}
            className="hs-slide"
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
            aria-label={`Slide ${current + 1} of ${total}: ${slide.title}`}
          >
            {/* Background image */}
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={current === 0}
              sizes="100vw"
            />

            {/* Overlay */}
            <div className="hs-overlay" />

            {/* Content */}
            <div className="hs-content">
              <div className="hs-text">
                {/* Tag */}
                <motion.span
                  className="hs-tag"
                  style={{ color: slide.tagColor, borderColor: `${slide.tagColor}40` }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  {slide.tag}
                </motion.span>

                {/* Title */}
                <motion.h2
                  className="hs-title"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.17, duration: 0.35 }}
                >
                  {slide.title}
                </motion.h2>

                {/* Highlight */}
                <motion.span
                  className="hs-highlight"
                  style={{ color: slide.tagColor }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.23, duration: 0.32 }}
                >
                  {slide.highlight}
                </motion.span>

                {/* Description */}
                <motion.p
                  className="hs-desc"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.3 }}
                >
                  {slide.description}
                </motion.p>

                {/* CTA */}
                <motion.div
                  className="hs-cta-row"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.33, duration: 0.3 }}
                >
                  <Link href={slide.link} className="hs-btn">
                    {slide.cta}
                    <ChevronRight strokeWidth={2.5} style={{ width: 13, height: 13 }} />
                  </Link>
                  <span className="hs-badge">{slide.badge}</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Arrows ── */}
        <button className="hs-arrow hs-arrow-left" onClick={prev} aria-label="Previous slide">
          <ChevronLeft strokeWidth={2.5} />
        </button>
        <button className="hs-arrow hs-arrow-right" onClick={next} aria-label="Next slide">
          <ChevronRight strokeWidth={2.5} />
        </button>

        {/* ── Dot Progress Indicators ── */}
        <div className="hs-bottom" role="tablist" aria-label="Slides">
          {slides.map((_, i) => {
            const isActive = i === current
            return (
              <button
                key={i}
                className={`hs-dot ${isActive ? 'active' : ''}`}
                onClick={() => { setPaused(true); goTo(i, i > current ? 'next' : 'prev') }}
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${i + 1}`}
              >
                <div
                  className="hs-dot-inner"
                  style={{ width: isActive ? 28 : 7 }}
                >
                  {isActive && (
                    <ProgressBar active={!paused} duration={AUTOPLAY_DELAY} />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}