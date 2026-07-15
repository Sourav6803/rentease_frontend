'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Search,
  ShoppingBag,
  CalendarRange,
  Truck,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Headphones,
  BadgeCheck,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Zap,
  Sofa,
  Refrigerator,
  Tv,
  Dumbbell,
  Utensils,
  Baby,
  Star,
  MapPin,
  Users,
  Package,
  IndianRupee,
  Quote,
  Percent,
  Clock,
} from 'lucide-react'
import { Eyebrow, FAQAccordion, CTABand } from '@/components/marketing/Marketing'

// ---------------------------------------------------------------------------
// Flipkart-style brand tokens
//   Primary blue #2874F0 · Yellow accent #FFE11B · Savings green #388E3C
//   Page background #F1F3F6 · Deep navy text #172337
// ---------------------------------------------------------------------------

const FK = {
  blue: '#2874F0',
  blueDark: '#1a5fd0',
  yellow: '#FFE11B',
  green: '#388E3C',
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const OFFERS = [
  'Free delivery in 50+ cities',
  'Zero-cost setup & installation',
  '100% refundable security deposit',
  'Flat 25% off on 12-month plans',
  'No-cost swaps within 7 days',
]

const CATEGORIES = [
  { icon: Sofa, name: 'Furniture', count: '8,200+ items', from: 'from-blue-500', to: 'to-indigo-600' },
  { icon: Refrigerator, name: 'Appliances', count: '4,500+ items', from: 'from-sky-500', to: 'to-blue-600' },
  { icon: Tv, name: 'Electronics', count: '3,800+ items', from: 'from-violet-500', to: 'to-purple-600' },
  { icon: Dumbbell, name: 'Fitness', count: '1,200+ items', from: 'from-emerald-500', to: 'to-teal-600' },
  { icon: Utensils, name: 'Kitchen', count: '2,100+ items', from: 'from-amber-500', to: 'to-orange-600' },
  { icon: Baby, name: 'Baby & Kids', count: '900+ items', from: 'from-rose-500', to: 'to-pink-600' },
]

const STATS = [
  { icon: Package, value: '20,000+', label: 'Verified products' },
  { icon: MapPin, value: '50+', label: 'Cities served' },
  { icon: Users, value: '1.2 Lakh+', label: 'Happy renters' },
  { icon: Star, value: '4.8/5', label: 'Average rating' },
]

const STEPS = [
  {
    step: '01',
    title: 'Browse & shortlist',
    time: 'A few minutes',
    icon: Search,
    desc: 'Explore furniture, appliances, and electronics by category or city. Filter by budget, rental tenure, and availability to find the perfect fit.',
    points: ['20,000+ verified products', 'Filter by city & budget', 'Save favourites to your wishlist'],
  },
  {
    step: '02',
    title: 'Pick a plan & book',
    time: 'Self-paced',
    icon: CalendarRange,
    desc: 'Choose a rental tenure from 3 to 12 months — longer plans unlock bigger discounts. Pay a fully refundable security deposit and your first month’s rent to confirm.',
    points: ['Flexible 3–12 month plans', 'Bigger discounts for longer tenures', 'Refundable security deposit'],
  },
  {
    step: '03',
    title: 'Free delivery & setup',
    time: '3–5 business days',
    icon: Truck,
    desc: 'Our partner delivers to your doorstep and handles basic installation. Track every order live from your dashboard — most cities get free delivery.',
    points: ['Free doorstep delivery', 'Basic installation included', 'Live order tracking'],
  },
  {
    step: '04',
    title: 'Use it, then return or renew',
    time: 'Ongoing',
    icon: RotateCcw,
    desc: 'Enjoy your rental with zero maintenance worries. At the end of the tenure, schedule a pickup or renew instantly. Your deposit is refunded after inspection.',
    points: ['Hassle-free returns', 'One-tap renewal', 'Deposit refunded after pickup'],
  },
]

const PLANS = [
  {
    name: 'Starter',
    tenure: '3 months',
    discount: '0%',
    tagline: 'Great for short stays & trials',
    popular: false,
    features: ['Refundable deposit', 'Free delivery', 'Basic installation', 'Standard support'],
  },
  {
    name: 'Popular',
    tenure: '6 months',
    discount: '15% off',
    tagline: 'The sweet spot most renters choose',
    popular: true,
    features: ['Everything in Starter', '15% lower monthly rent', 'Priority delivery slot', 'Free 1 swap'],
  },
  {
    name: 'Best value',
    tenure: '12 months',
    discount: '25% off',
    tagline: 'Maximum savings for long stays',
    popular: false,
    features: ['Everything in Popular', '25% lower monthly rent', 'Dedicated relationship manager', 'Free 2 swaps'],
  },
]

const PERKS = [
  { icon: Zap, title: 'Flexible plans', desc: 'Rent for as little as 3 months or stay as long as you like — upgrade or return anytime.' },
  { icon: Truck, title: 'Free delivery', desc: 'No hidden logistics charges. We deliver and pick up across major Indian cities.' },
  { icon: Wallet, title: 'No lump-sum cost', desc: 'Skip the upfront purchase price. Pay small monthly rents instead of one big bill.' },
  { icon: ShieldCheck, title: 'Refundable deposit', desc: 'Your security deposit is 100% refundable after a quick end-of-tenure inspection.' },
  { icon: BadgeCheck, title: 'Verified products', desc: 'Every item is quality-checked and sanitized before it reaches your home.' },
  { icon: Headphones, title: '24/7 support', desc: 'Real people on chat, WhatsApp, and phone whenever you need help.' },
]

const TESTIMONIALS = [
  { name: 'Ananya Sharma', city: 'Bengaluru', rating: 5, text: 'Furnished my entire 1BHK in a week without spending a fortune. Delivery was on time and the sofa looked brand new.' },
  { name: 'Rohit Verma', city: 'Pune', rating: 5, text: 'Renting the fridge and washing machine saved me from a huge upfront bill. Returning at the end was completely hassle-free.' },
  { name: 'Meera Nair', city: 'Hyderabad', rating: 4, text: 'Loved the flexibility. I upgraded my study desk mid-tenure with a single tap and the deposit was refunded fast.' },
]

const FAQ = [
  { q: 'Do I need to pay the full price of the product?', a: 'No. You only pay a refundable security deposit plus the first month’s rent to start. The remaining rent is spread across your chosen tenure.' },
  { q: 'How long does delivery take?', a: 'Most orders are delivered and set up within 3–5 business days. You can track the exact status from your dashboard.' },
  { q: 'What is the minimum rental period?', a: 'The minimum tenure is 3 months, with options up to 12 months. Longer plans come with higher discounts.' },
  { q: 'When do I get my security deposit back?', a: 'Your deposit is refunded in full after the product is picked up and passes a standard condition check.' },
  { q: 'What if something breaks during the rental?', a: 'Normal wear and tear is on us. For accidental damage, our support team helps you raise a claim against the security deposit.' },
]

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
}

// ---------------------------------------------------------------------------
// Step row (Flipkart-blue tile + clean text column)
// ---------------------------------------------------------------------------

function StepRow({ item, index }: { item: (typeof STEPS)[0]; index: number }) {
  const Icon = item.icon
  const reversed = index % 2 === 1
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center', reversed && 'lg:[direction:rtl]')}>
      <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="lg:[direction:ltr]">
        <div
          className="relative rounded-3xl aspect-[4/3] flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/20"
          style={{ background: `linear-gradient(135deg, ${FK.blue}, #1a5fd0)` }}
        >
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.28), transparent 45%), radial-gradient(circle at 85% 85%, rgba(255,225,27,0.25), transparent 45%)',
            }}
          />
          <div className="relative z-10 w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
            <Icon className="h-11 w-11 text-white" />
          </div>
          <span className="absolute top-6 left-6 text-7xl font-black text-white/15 select-none">{item.step}</span>
          <span className="absolute bottom-5 right-6 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <Clock className="h-3 w-3" /> {item.time}
          </span>
        </div>
      </motion.div>
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="lg:[direction:ltr]">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#2874F0] bg-blue-50 px-3 py-1 rounded-full mb-3">
          Step {item.step} · {item.time}
        </span>
        <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900">{item.title}</h3>
        <p className="text-slate-500 mt-3 leading-relaxed">{item.desc}</p>
        <ul className="mt-5 space-y-2.5">
          {item.points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: FK.green }} /> {p}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HowItWorksPage() {
  return (
    <div className="w-full overflow-x-hidden bg-[#f1f3f6]" style={{ fontFamily: "'Roboto','Segoe UI',sans-serif" }}>
      {/* ── OFFER STRIP ──────────────────────────────────────────────── */}
      <div className="w-full text-white text-xs sm:text-sm" style={{ backgroundColor: FK.blueDark }}>
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-6 py-2 font-medium">
          {OFFERS.map((o) => (
            <span key={o} className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" style={{ color: FK.yellow }} /> {o}
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden py-16 lg:py-20 px-6" style={{ backgroundColor: FK.blue }}>
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(circle at 90% 10%, rgba(255,225,27,0.18), transparent 40%), radial-gradient(circle at 5% 90%, rgba(255,255,255,0.18), transparent 45%)',
          }}
        />
        <div className="relative max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-5">
              <Sparkles className="h-3 w-3" style={{ color: FK.yellow }} /> Rent in four simple steps
            </span>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
              From browse to doorstep
              <br />
              <span style={{ color: FK.yellow }}>without the buy</span>
            </h1>
            <p className="text-white/85 mt-5 text-base lg:text-lg leading-relaxed max-w-xl">
              Rent furniture, appliances, and electronics on flexible monthly plans. No big upfront cost, free delivery, and a
              deposit you get back — 100%.
            </p>

            {/* Search-style bar (Flipkart signature) */}
            <div className="mt-7 flex items-center gap-2 bg-white rounded-xl p-1.5 max-w-md shadow-lg shadow-blue-900/20">
              <div className="flex items-center gap-2 pl-3 flex-1 text-slate-400">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search sofas, fridges, laptops…"
                  className="w-full bg-transparent py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <Link href="/products">
                <Button className="h-10 px-5 rounded-lg font-bold gap-1.5 text-white" style={{ backgroundColor: FK.blueDark }}>
                  Search <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link href="/products">
                <Button className="h-12 px-7 font-bold rounded-xl gap-2 text-base text-slate-900 hover:brightness-95" style={{ backgroundColor: FK.yellow }}>
                  Browse products <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="outline" className="h-12 px-7 border-white/40 bg-white/5 text-white hover:bg-white/15 rounded-xl gap-2 text-base">
                  <Headphones className="h-4 w-4" /> Talk to support
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-white/80 text-sm">
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4" style={{ color: FK.yellow, fill: FK.yellow }} /> 4.8/5 rated</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> 1.2 Lakh+ renters</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> 50+ cities</span>
            </div>
          </motion.div>

          {/* Right category preview grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {CATEGORIES.slice(0, 4).map((c) => {
              const Icon = c.icon
              return (
                <div key={c.name} className="rounded-2xl bg-white/95 backdrop-blur p-5 shadow-xl shadow-blue-900/20">
                  <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', c.from, c.to)}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900">{c.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{c.count}</p>
                </div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────── */}
      <section className="w-full bg-white border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
          {[
            { icon: Truck, title: 'Free delivery', sub: 'In 50+ cities' },
            { icon: ShieldCheck, title: '100% refundable', sub: 'Deposit back' },
            { icon: BadgeCheck, title: 'Verified & sanitized', sub: 'Quality checked' },
            { icon: Headphones, title: '24/7 support', sub: 'Chat · call · WhatsApp' },
          ].map((t) => {
            const Icon = t.icon
            return (
              <div key={t.title} className="flex items-center gap-3 px-5 py-5 justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" style={{ color: FK.blue }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.sub}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────── */}
      <section className="w-full py-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <Eyebrow icon={ShoppingBag}>Rent by category</Eyebrow>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Everything for your home</h2>
              <p className="text-sm text-slate-500 mt-1">Hand-picked, quality-checked, delivered free.</p>
            </div>
            <Link href="/products" className="text-sm font-bold inline-flex items-center gap-1 self-start sm:self-auto" style={{ color: FK.blue }}>
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((c, i) => {
              const Icon = c.icon
              return (
                <motion.div key={c.name} {...fadeUp} transition={{ delay: i * 0.05 }}>
                  <Link href="/products" className="group block rounded-2xl bg-white border border-slate-200 p-5 text-center hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all">
                    <div className={cn('w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center mb-3 group-hover:scale-105 transition-transform', c.from, c.to)}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{c.count}</p>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────────── */}
      <section className="w-full px-6 pb-4">
        <div
          className="max-w-[1200px] mx-auto rounded-3xl px-6 py-10 lg:py-12 shadow-xl shadow-blue-500/20"
          style={{ background: `linear-gradient(135deg, ${FK.blue}, #1a5fd0)` }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6" style={{ color: FK.yellow }} />
                  </div>
                  <p className="text-2xl lg:text-4xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs lg:text-sm text-white/75 mt-1">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── STEPS ────────────────────────────────────────────────────── */}
      <section className="w-full py-16 lg:py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14">
            <Eyebrow icon={Zap}>How it works</Eyebrow>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Four steps to a fully-furnished home</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">From the first tap to your doorstep — simple, transparent, and free of surprises.</p>
          </div>
          <div className="space-y-16 lg:space-y-20">
            {STEPS.map((step, i) => (
              <StepRow key={step.step} item={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ────────────────────────────────────────────────────── */}
      <section className="w-full py-16 px-6 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <Eyebrow icon={CalendarRange}>Rental plans</Eyebrow>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Longer you rent, more you save</h2>
            <p className="text-sm text-slate-500 mt-1">Pick a tenure that fits your stay. Switch or return anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'relative rounded-3xl border p-6 lg:p-7 flex flex-col bg-white transition-all hover:shadow-xl',
                  plan.popular ? 'border-transparent shadow-xl md:-translate-y-2' : 'border-slate-200'
                )}
                style={plan.popular ? { boxShadow: '0 20px 45px -20px rgba(40,116,240,0.55)', outline: `2px solid ${FK.blue}` } : undefined}
              >
                {plan.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-900 shadow"
                    style={{ backgroundColor: FK.yellow }}
                  >
                    Most popular
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">{plan.name}</span>
                  {plan.discount !== '0%' ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ backgroundColor: FK.green }}>
                      <Percent className="h-3 w-3" /> {plan.discount}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                      Base rate
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <IndianRupee className="h-5 w-5 text-slate-400" />
                  <span className="text-3xl font-extrabold text-slate-900">{plan.tenure}</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{plan.tagline}</p>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: FK.green }} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/products" className="mt-6">
                  <Button
                    className={cn('w-full h-11 rounded-xl font-bold gap-2', plan.popular ? 'text-white' : '')}
                    variant={plan.popular ? 'default' : 'outline'}
                    style={plan.popular ? { backgroundColor: FK.blue } : { borderColor: FK.blue, color: FK.blue }}
                  >
                    Choose {plan.tenure} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERKS ────────────────────────────────────────────────────── */}
      <section className="w-full py-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <Eyebrow icon={ShieldCheck} tone="emerald">Why RentEase</Eyebrow>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Renting made risk-free</h2>
            <p className="text-sm text-slate-500 mt-1">Everything you need to live comfortably without owning.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERKS.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  {...fadeUp}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${FK.blue}, #1a5fd0)` }}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{f.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="w-full py-16 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <Eyebrow icon={Star}>Loved by renters</Eyebrow>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Rated 4.8/5 by 12,000+ reviews</h2>
            <div className="mt-3 inline-flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5" style={{ color: FK.yellow, fill: FK.yellow }} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-6 hover:shadow-lg transition-all"
              >
                <Quote className="absolute top-5 right-5 h-8 w-8 text-blue-100" />
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4" style={{ color: s < t.rating ? FK.yellow : '#e2e8f0', fill: s < t.rating ? FK.yellow : '#e2e8f0' }} />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">“{t.text}”</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: FK.blue }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500 inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUPPORT STRIP ────────────────────────────────────────────── */}
      <section className="w-full py-14 px-6">
        <div
          className="max-w-[1100px] mx-auto rounded-3xl border border-blue-100 p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-6 justify-between"
          style={{ background: 'linear-gradient(135deg, #eaf1ff, #f5f8ff)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <ShoppingBag className="h-6 w-6" style={{ color: FK.blue }} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Ready to rent your first item?</h3>
              <p className="text-sm text-slate-500 mt-0.5">Browse thousands of verified products and book in minutes.</p>
            </div>
          </div>
          <Link href="/products">
            <Button className="h-11 px-6 rounded-xl gap-2 shrink-0 text-white font-bold" style={{ backgroundColor: FK.blue }}>
              Start browsing <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="w-full py-16 px-6 bg-white">
        <div className="max-w-[720px] mx-auto">
          <div className="text-center mb-8">
            <Eyebrow icon={Sparkles}>FAQ</Eyebrow>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Questions renters ask</h2>
          </div>
          <FAQAccordion items={FAQ} />
        </div>
      </section>

      <CTABand title="Start renting in minutes." subtitle="Thousands of homes already rent with RentEase. Join them today." />
    </div>
  )
}
