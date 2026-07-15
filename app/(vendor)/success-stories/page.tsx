'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Star, Quote, TrendingUp, Package, MapPin, Clock,
  BookOpen, ArrowUpRight, Award, Users,
} from 'lucide-react'
import { SiteHeader, HeaderSpacer, SiteFooter, CTABand, Eyebrow, Carousel } from '../shared'
import { cn } from '@/lib/utils'

const STATS = [
  { value: '50,000+', label: 'Active vendors' },
  { value: '₹120Cr+', label: 'Monthly GMV' },
  { value: '4.8★', label: 'Avg. vendor rating' },
  { value: '2–3 days', label: 'Avg. payout cycle' },
]

const FEATURED_STORIES = [
  {
    name: 'Rajesh Kumar',
    business: 'FurnitureRent Co.',
    location: 'Bengaluru',
    avatar: 'R',
    quote: "RentEase transformed my small furniture rental shop into a full-fledged business. We went from 12 products to over 300 in ten months, and the dashboard analytics tell us exactly what to stock before every season.",
    metric1: { label: 'Revenue growth', value: '4.2x', icon: TrendingUp },
    metric2: { label: 'Products listed', value: '312', icon: Package },
    metric3: { label: 'Time on platform', value: '14 months', icon: Clock },
  },
  {
    name: 'Priya Sharma',
    business: 'Home Appliances Hub',
    location: 'Mumbai',
    avatar: 'P',
    quote: "Payouts are always on time, usually within 2 days. I've expanded from 30 to 200+ products since joining, and the multi-location tools let me run two warehouses from one login.",
    metric1: { label: 'Product catalogue', value: '30 → 200+', icon: Package },
    metric2: { label: 'Payout cycle', value: '2 days', icon: Clock },
    metric3: { label: 'Cities served', value: '3', icon: MapPin },
  },
  {
    name: 'Amit Patel',
    business: 'Decor & Events Rentals',
    location: 'Ahmedabad',
    avatar: 'A',
    quote: "The customer reach is incredible — I get booking enquiries from across the city that I never could have generated on my own. 2FA and the verified-vendor badge give both me and my customers peace of mind.",
    metric1: { label: 'Monthly bookings', value: '+180%', icon: TrendingUp },
    metric2: { label: 'Vendor rating', value: '4.9★', icon: Star },
    metric3: { label: 'Repeat customers', value: '61%', icon: Users },
  },
]

const MORE_TESTIMONIALS = [
  { name: 'Sneha Reddy', business: 'ElectroRent Hyderabad', rating: 5, text: 'Onboarding took less than a day. Support answered every question over WhatsApp.' },
  { name: 'Vikram Singh', business: 'CityFurnish Delhi', rating: 5, text: 'The analytics dashboard alone is worth the Growth plan. We now know our slow seasons in advance.' },
  { name: 'Neha Joshi', business: 'FitGear Rentals Pune', rating: 5, text: 'Switched from a competitor and payouts became noticeably faster and more predictable.' },
  { name: 'Karan Mehta', business: 'EventStyle Chennai', rating: 4, text: 'Great platform overall. Would love faster same-day payouts on the Growth tier too.' },
  { name: 'Ritu Verma', business: 'HomeEssentials Jaipur', rating: 5, text: 'Verified-vendor badge noticeably increased our booking conversion rate within weeks.' },
  { name: 'Arjun Nair', business: 'Rentomojo Partner, Kochi', rating: 5, text: 'Multi-location support let us manage three branches without three separate logins.' },
]

const BLOG_POSTS = [
  {
    category: 'Vendor Tips',
    title: 'Seven photo tricks that increased our vendors\u2019 bookings by 30%',
    excerpt: 'Small changes in lighting, background, and angle make a measurable difference in how often a listing gets booked.',
    readTime: '5 min read',
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    category: 'Growth',
    title: 'How to price rentals for peak wedding and festival season',
    excerpt: 'A practical framework for adjusting daily rates without scaring off regular customers.',
    readTime: '7 min read',
    accent: 'from-pink-500 to-amber-500',
  },
  {
    category: 'Operations',
    title: 'Managing inventory across multiple cities without spreadsheets',
    excerpt: 'A look at how three vendors consolidated multi-location stock tracking into one dashboard.',
    readTime: '6 min read',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    category: 'Payments',
    title: 'Understanding your payout cycle and how to speed it up',
    excerpt: 'What determines payout timing, and the account settings that can shave a day off your cycle.',
    readTime: '4 min read',
    accent: 'from-violet-500 to-fuchsia-500',
  },
]

export default function SuccessStoriesPage() {
  return (
    <div className="fixed inset-0 z-0 w-screen h-screen overflow-y-auto overflow-x-hidden bg-white" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div className="flex flex-col min-h-full w-full">
        <SiteHeader active="/success-stories" />
        <HeaderSpacer />

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 py-20 px-6">
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 85% 15%, rgba(236,72,153,0.22), transparent 42%), radial-gradient(circle at 10% 85%, rgba(99,102,241,0.35), transparent 50%)' }} />
          <div className="relative max-w-[900px] mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-violet-100 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-5">
                <Award className="h-3 w-3" /> 50,000+ vendors and growing
              </span>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
                Real vendors.<br />
                <span className="bg-gradient-to-r from-amber-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">Real growth.</span>
              </h1>
              <p className="text-violet-100/80 mt-5 text-lg leading-relaxed max-w-xl mx-auto">
                From single-city shops to multi-location businesses — see how vendors are building on RentEase.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto">
              {STATS.map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/15 py-4 px-2">
                  <p className="text-xl lg:text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-[11px] text-violet-200/70 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── FEATURED STORY CAROUSEL ─────────────────────────────────── */}
        <section className="w-full py-20 px-6 bg-white">
          <div className="max-w-[900px] mx-auto text-center mb-10">
            <Eyebrow icon={Star} tone="amber">Featured stories</Eyebrow>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">In their own words</h2>
          </div>
          <div className="max-w-[820px] mx-auto">
            <Carousel
              ariaLabel="Featured vendor success stories"
              items={FEATURED_STORIES}
              interval={7000}
              renderItem={(story:any) => (
                <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-3xl border border-slate-100 p-8 lg:p-10">
                  <Quote className="h-8 w-8 text-indigo-400 mb-4" />
                  <p className="text-lg lg:text-xl text-slate-800 leading-relaxed font-medium">{story.quote}</p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">{story.avatar}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{story.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {story.business} · {story.location}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-7 pt-6 border-t border-slate-200">
                    {[story.metric1, story.metric2, story.metric3].map(m => {
                      const Icon = m.icon
                      return (
                        <div key={m.label} className="text-center">
                          <Icon className="h-4 w-4 text-indigo-500 mx-auto mb-1.5" />
                          <p className="text-base lg:text-lg font-extrabold text-slate-900">{m.value}</p>
                          <p className="text-[11px] text-slate-500">{m.label}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            />
          </div>
        </section>

        {/* ── MORE TESTIMONIALS GRID ──────────────────────────────────── */}
        <section className="w-full py-16 px-6 bg-slate-50">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900">More vendors, more stories</h2>
              <p className="text-sm text-slate-500 mt-1">A sample of the reviews that come in every week.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {MORE_TESTIMONIALS.map((t, i) => (
                <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-0.5 mb-3">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
                  <p className="text-sm text-slate-600 leading-relaxed">"{t.text}"</p>
                  <p className="text-sm font-bold text-slate-900 mt-4">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.business}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BLOG ─────────────────────────────────────────────────────── */}
        <section className="w-full py-20 px-6 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <Eyebrow icon={BookOpen} tone="violet">Vendor blog</Eyebrow>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Guides for growing your rental business</h2>
              </div>
              <Link href="/support" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 shrink-0">
                Browse all articles <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {BLOG_POSTS.map((post, i) => (
                <motion.article key={post.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                  <div className={cn('h-32 bg-gradient-to-br relative flex items-center justify-center', post.accent)}>
                    <BookOpen className="h-8 w-8 text-white/40" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-800 px-2.5 py-1 rounded-full">{post.category}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">{post.excerpt}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-4">{post.readTime}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <CTABand title="Write your own success story" subtitle="Join 50,000+ vendors already growing their rental business on RentEase." />
        <SiteFooter />
      </div>
    </div>
  )
}