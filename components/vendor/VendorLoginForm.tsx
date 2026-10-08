'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Shield, Building2, TrendingUp,
  Package, BarChart2, RefreshCw, Monitor, ShieldCheck, Star, ArrowRight, BadgeCheck,
  Clock, TriangleAlert, ChevronRight, ChevronDown, X, Quote, Wallet, Headphones,
  Sparkles, Zap, Globe, Crown, Gift, Rocket, PlayCircle, Boxes, Truck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import { DeliveryRouteArt, FloatingRentalTile, RentCycleArt } from '@/components/forms/login/RentalLoginArt'
import { RoleSelector } from '@/components/forms/login/RoleSelector'
import { RentEaseLogo } from '@/components/brand/RentEaseLogo'
import {
  AuroraBackdrop,
  CardAura,
  GRADIENT_CARD_STYLE,
} from '@/components/forms/login/AuroraBackdrop'

// ── Schema ────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  rememberMe: z.boolean(),
})
type LoginFormValues = z.infer<typeof loginSchema>

// Theme-adaptive brand helpers — the whole page re-skins with the site accent.
const BRAND_GRADIENT =
  'bg-[linear-gradient(135deg,var(--brand-gradient-from),var(--brand-gradient-to))]'
const BRAND_SOFT_SHADOW = 'shadow-[0_16px_40px_-14px_var(--brand)]'
// Flipkart-signature yellow, used for the primary "sell with us" CTAs.
const BRAND_ACCENT_BG = 'bg-[var(--brand-accent)]'
const BRAND_ACCENT_TEXT = 'text-[var(--brand)]'

// ── Navigation ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Success stories', href: '/success-stories' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Support', href: '/support' },
]

// ── Vendor capabilities ───────────────────────────────────────────────────────
const VENDOR_BENEFITS = [
  { icon: Package, title: 'Product & Inventory', desc: 'Add, edit, and track all your rental products with real-time availability.' },
  { icon: TrendingUp, title: 'Rentals & Revenue', desc: 'Monitor active rentals, upcoming bookings, and daily earnings.' },
  { icon: BarChart2, title: 'Business Analytics', desc: 'Deep insights into performance, top products, peak seasons & behaviour.' },
  { icon: ShieldCheck, title: 'Secure Vendor Portal', desc: 'Enterprise-grade security with session management & encrypted payouts.' },
  { icon: Wallet, title: 'Fast Encrypted Payouts', desc: 'Paid in 2–3 days to your bank via UPI & NEFT. Zero hidden fees.' },
  { icon: Headphones, title: '24/7 Vendor Support', desc: 'Dedicated relationship manager, phone/WhatsApp & vendor help centre.' },
]

// ── Stats ─────────────────────────────────────────────────────────────────────
const VENDOR_STATS = [
  { value: 50000, prefix: '', suffix: '+', label: 'Active Vendors' },
  { value: 120, prefix: '₹', suffix: 'Cr+', label: 'Monthly GMV' },
  { value: 4.8, prefix: '', suffix: '★', label: 'Vendor Rating' },
  { value: 3, prefix: '', suffix: ' Days', label: 'Payout Cycle' },
]

// ── Trusted-by brands (static) ─────────────────────────────────────────────────
const TRUSTED_BRANDS = [
  'FurnitureRent Co.', 'UrbanLadder Pro', 'RentKart', 'HomeEssentials',
  'DecorHub', 'ApplianceMart', 'Eventify', 'Rentomojo', 'CityFurnish',
]

// ── Pricing teaser ────────────────────────────────────────────────────────────
const PRICING_TEASERS = [
  {
    name: 'Starter',
    price: '₹0',
    period: '/mo',
    tagline: 'List up to 30 products',
    features: ['Basic analytics', 'Standard payouts (3 days)', 'Email support', 'Single location'],
    highlight: false,
  },
  {
    name: 'Growth',
    price: '₹999',
    period: '/mo',
    tagline: 'Most popular for scaling vendors',
    features: ['Unlimited products', 'Advanced analytics', 'Priority payouts (2 days)', 'Multi-location', 'WhatsApp support'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    tagline: 'Dedicated infrastructure & SLA',
    features: ['White-label portal', 'API access', 'Same-day payouts', 'Dedicated manager', 'Custom integrations'],
    highlight: false,
  },
]

// ── Integrations strip ─────────────────────────────────────────────────────────
const INTEGRATIONS = [
  { name: 'Razorpay', icon: Wallet },
  { name: 'Stripe', icon: ShieldCheck },
  { name: 'WhatsApp', icon: Headphones },
  { name: 'GST Suite', icon: BarChart2 },
  { name: 'Shiprocket', icon: Package },
  { name: 'Google Analytics', icon: TrendingUp },
]

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Rajesh Kumar', business: 'FurnitureRent Co.', location: 'Bengaluru', rating: 5, text: 'RentEase transformed my small furniture rental shop into a full-fledged business. The dashboard analytics are a game-changer.' },
  { name: 'Priya Sharma', business: 'Home Appliances Hub', location: 'Mumbai', rating: 5, text: 'Payouts are always on time, usually within 2 days. I\u2019ve expanded from 30 to 200+ products since joining.' },
  { name: 'Amit Patel', business: 'Decor & Events Rentals', location: 'Ahmedabad', rating: 5, text: 'The customer reach is incredible \u2014 I get booking enquiries from across the city. 2FA gives me peace of mind.' },
]

// ── FAQ ────────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: 'How do I become a RentEase vendor?', a: 'Click "Become a Vendor", complete the 3-step registration (business details \u2192 KYC \u2192 bank info), and our team approves vendors within 24\u201348 hours.' },
  { q: 'When and how do I receive payouts?', a: 'Payouts are processed every 2\u20133 business days directly to your bank account via UPI, NEFT, or IMPS. Track payout status from your dashboard.' },
  { q: 'Is my business data secure?', a: 'Yes. We use 256-bit SSL encryption, PCI-DSS L1 compliance, and ISO 27001 certified infrastructure. Session monitoring protects your account.' },
  { q: 'What items can I rent out?', a: 'Furniture, appliances, electronics, decor, fitness equipment, event supplies, and more \u2014 as long as they comply with our marketplace policy.' },
  { q: 'Do you offer a free plan?', a: 'Yes! The Starter plan is free forever and lets you list up to 30 products with standard payouts and email support.' },
]

const TRUST_BADGES = ['PCI-DSS L1', 'ISO 27001', 'RBI Compliant', 'SOC 2 Type II']

// ── Live activity ticker feed ──────────────────────────────────────────────────
const LIVE_ACTIVITIES = [
  'Rajesh K. listed 3 new sofas in Bengaluru',
  'Priya S. received ₹12,400 payout',
  'Amit P. got 8 new booking enquiries',
  'DecorHub crossed ₹1 Lakh monthly GMV',
  'UrbanLadder Pro added a new warehouse location',
  'RentKart hit 4.9★ vendor rating',
]

// ── 3-step onboarding ─────────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  { title: 'Register your business', desc: 'Add your business name, category, and the cities you plan to serve.', icon: Building2 },
  { title: 'Get verified in 24–48 hrs', desc: 'Upload KYC, PAN, and bank details. Our team reviews and approves your account.', icon: ShieldCheck },
  { title: 'List products & start earning', desc: 'Publish your catalogue, go live, and receive your first payout within days.', icon: TrendingUp },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1600, start = false) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    let rafId: number
    let startTime: number | null = null

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(eased * target)
      if (progress < 1) rafId = requestAnimationFrame(step)
      else setValue(target)
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration, start])

  return value
}

function generateCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  return { question: `${a} + ${b} = ?`, answer: String(a + b) }
}

function getDeviceInfo() {
  if (typeof window === 'undefined') return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' }
  const ua = navigator.userAgent
  const device = /Mobi|Android/i.test(ua) ? 'Mobile' : /Tablet|iPad/i.test(ua) ? 'Tablet' : 'Desktop'
  const browser = /Chrome/i.test(ua)
    ? 'Chrome'
    : /Firefox/i.test(ua)
      ? 'Firefox'
      : /Safari/i.test(ua)
        ? 'Safari'
        : /Edg/i.test(ua)
          ? 'Edge'
          : 'Browser'
  const os = /Windows/i.test(ua)
    ? 'Windows'
    : /Mac/i.test(ua)
      ? 'macOS'
      : /Linux/i.test(ua)
        ? 'Linux'
        : /Android/i.test(ua)
          ? 'Android'
          : /iOS|iPhone|iPad/i.test(ua)
            ? 'iOS'
            : 'Unknown OS'
  return { device, browser, os }
}

// ── Animated stat (counts up when scrolled into view) ─────────────────────────
function AnimatedStat({ stat, index }: { stat: (typeof VENDOR_STATS)[number]; index: number }) {
  const [visible, setVisible] = useState(false)
  const count = useCountUp(stat.value, 1600, visible)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 250 + index * 120)
    return () => clearTimeout(timer)
  }, [index])

  const display = stat.value % 1 !== 0 ? count.toFixed(1) : Math.round(count).toLocaleString('en-IN')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.1 }}
      className="flex flex-col items-center text-center"
    >
      <p className="text-lg font-bold tabular-nums text-white">
        {stat.prefix}
        {display}
        {stat.suffix}
      </p>
      <p className="mt-0.5 text-[10px] font-medium text-white/70">{stat.label}</p>
    </motion.div>
  )
}

// ── Testimonial carousel ───────────────────────────────────────────────────────
function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % TESTIMONIALS.length), 6000)
    return () => clearInterval(t)
  }, [])

  const { name, business, location, rating, text } = TESTIMONIALS[current]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
      <Quote className="absolute right-3 top-3 h-7 w-7 text-white/15" />
      <motion.div
        key={current}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10"
      >
        <div className="mb-1.5 flex gap-0.5">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-white text-white" />
          ))}
        </div>
        <p className="text-[13px] italic text-white/85">&ldquo;{text}&rdquo;</p>
        <div className="mt-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-xs font-bold text-white ring-1 ring-white/30">
            {name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{name}</p>
            <p className="text-[10px] text-white/60">
              {business} · {location}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-3 flex gap-1.5">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`View vendor story ${i + 1}`}
            className={cn(
              'h-1 rounded-full transition-all',
              i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50',
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ── FAQ accordion item ────────────────────────────────────────────────────────
function FAQItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof FAQ_ITEMS)[number]
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-brand">
          {item.q}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-4 pr-6 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Flipkart-style site header ────────────────────────────────────────────────
function VendorHeader() {
  return (
    <header className="sticky top-0 z-50 shadow-lg shadow-black/10">
      <div className="w-full bg-brand">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <RentEaseLogo size={40} withRing />
            <div className="leading-tight">
              <span className="block text-lg font-extrabold tracking-tight text-white">RentEase</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                Vendor Portal
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative text-sm font-medium text-white/90 hover:text-white"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-[var(--brand-accent)] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="tel:18001234567" className="hidden items-center gap-1.5 text-xs font-semibold text-white/90 lg:flex">
              <Headphones className="h-3.5 w-3.5" /> 1800-123-4567
            </a>
            <Link href="/vendor/register">
              <Button
                className={cn(
                  'h-9 gap-1.5 rounded-lg px-4 text-sm font-bold shadow-md hover:brightness-105',
                  BRAND_ACCENT_BG,
                  BRAND_ACCENT_TEXT,
                )}
              >
                Become a Vendor <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className={cn('h-0.5 w-full', BRAND_ACCENT_BG)} />
    </header>
  )
}

// ── Live activity ticker ──────────────────────────────────────────────────────
function LiveTicker() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % LIVE_ACTIVITIES.length), 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="w-full overflow-hidden bg-brand-700 px-4 py-2.5 text-white">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3">
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-[var(--brand-accent)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[var(--brand-accent)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--brand-accent)]" />
          </span>
          LIVE
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="truncate text-xs text-white/90"
          >
            {LIVE_ACTIVITIES[idx]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Trusted-by brand marquee ──────────────────────────────────────────────────
function BrandMarquee() {
  return (
    <div className="w-full overflow-hidden border-y border-border bg-card py-6">
      <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Trusted by 50,000+ vendors across India
      </p>
      <div className="relative flex overflow-hidden">
        <motion.div
          className="flex shrink-0 gap-10 pr-10"
          animate={{ x: ['-0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
        >
          {[...TRUSTED_BRANDS, ...TRUSTED_BRANDS].map((b, i) => (
            <span key={i} className="whitespace-nowrap text-base font-bold tracking-tight text-muted-foreground/50">
              {b}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ── Section: vendor capabilities ──────────────────────────────────────────────
function VendorBenefitsSection() {
  return (
    <section className="w-full bg-background py-12 px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
            <Sparkles className="h-3 w-3" /> Vendor toolkit
          </span>
          <h2 className="mt-3 text-2xl font-extrabold text-foreground lg:text-3xl">
            Everything you need to run your rental business
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One dashboard for your catalogue, bookings, analytics and payouts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VENDOR_BENEFITS.map((b, i) => {
            const Icon = b.icon
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-lg"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">{b.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Section: 3-step onboarding ────────────────────────────────────────────────
function OnboardingSteps() {
  return (
    <section className="w-full bg-muted/40 py-14 px-6">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
            <Rocket className="h-3 w-3" /> Getting started
          </span>
          <h2 className="mt-3 text-2xl font-extrabold text-foreground lg:text-3xl">
            From sign-up to your first payout
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Three steps — most vendors are live within two days.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="absolute left-[16.5%] right-[16.5%] top-9 hidden h-px bg-border md:block" />
          {ONBOARDING_STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-2 border-border bg-card shadow-sm">
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-white', BRAND_GRADIENT)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      'absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold shadow',
                      BRAND_ACCENT_BG,
                      BRAND_ACCENT_TEXT,
                    )}
                  >
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{step.title}</h3>
                <p className="mt-1.5 max-w-[240px] text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Section: pricing ──────────────────────────────────────────────────────────
function PricingCard({ plan, i }: { plan: (typeof PRICING_TEASERS)[number]; i: number }) {
  const Icon = [Rocket, Crown, Globe][i] ?? Rocket

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.5 }}
      className={cn(
        'relative rounded-2xl border-2 bg-card p-6',
        plan.highlight ? 'border-brand shadow-xl shadow-brand/10 lg:-mt-3 lg:mb-3' : 'border-border shadow-sm',
      )}
    >
      {plan.highlight && (
        <span
          className={cn(
            'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow',
            BRAND_ACCENT_BG,
            BRAND_ACCENT_TEXT,
          )}
        >
          Most Popular
        </span>
      )}
      <div className={cn('mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-white', BRAND_GRADIENT)}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{plan.tagline}</p>
      <div className="mt-3 flex items-end gap-0.5">
        <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
        <span className="mb-1 text-sm font-semibold text-muted-foreground">{plan.period}</span>
      </div>
      <ul className="mt-4 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {f}
          </li>
        ))}
      </ul>
      <Link href="/vendor/register" className="mt-5 block">
        <Button
          className={cn(
            'h-10 w-full rounded-xl font-semibold',
            plan.highlight
              ? cn('text-white', BRAND_GRADIENT)
              : 'bg-foreground text-background hover:opacity-90',
          )}
        >
          {plan.highlight ? 'Start free trial' : 'Choose plan'} <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </motion.div>
  )
}

function PricingSection() {
  return (
    <section className="w-full bg-background py-12 px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
            <Gift className="h-3 w-3" /> Pricing
          </span>
          <h2 className="mt-3 text-2xl font-extrabold text-foreground lg:text-3xl">
            Plans that scale with your business
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start free and upgrade as you grow. No hidden charges, cancel anytime.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-5 md:grid-cols-3">
          {PRICING_TEASERS.map((p, i) => (
            <PricingCard key={p.name} plan={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Section: integrations ─────────────────────────────────────────────────────
function IntegrationsStrip() {
  return (
    <div className="w-full border-y border-border bg-muted/40 py-8 px-6">
      <div className="mx-auto max-w-[1200px]">
        <p className="mb-5 flex items-center justify-center gap-2 text-center text-sm font-bold text-muted-foreground">
          <Zap className="h-4 w-4 text-brand" /> Integrations that power your business
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {INTEGRATIONS.map((it, i) => {
            const Icon = it.icon
            return (
              <motion.div
                key={it.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 transition-all hover:border-brand/50 hover:shadow-md"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-foreground">{it.name}</span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Section: FAQ ──────────────────────────────────────────────────────────────
function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  return (
    <section className="w-full bg-background py-12 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-extrabold text-foreground">
            <Sparkles className="h-5 w-5 text-brand" /> Frequently asked questions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Still unsure? Email vendors@rentease.com and we&apos;ll help you get started.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-5">
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              isOpen={openFAQ === i}
              onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Section: closing CTA band ─────────────────────────────────────────────────
function CTABand() {
  return (
    <div className={cn('relative w-full overflow-hidden px-6 py-10', BRAND_GRADIENT)}>
      <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 75% 20%, rgba(255,212,0,0.45), transparent 45%), radial-gradient(circle at 15% 85%, rgba(255,255,255,0.3), transparent 45%)' }} />
      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-5 lg:flex-row">
        <div className="text-center lg:text-left">
          <h3 className="text-2xl font-extrabold text-white lg:text-3xl">Ready to grow your rental business?</h3>
          <p className="mt-1 text-sm text-white/80">
            Join 50,000+ vendors earning more with RentEase. Free to start, no credit card required.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link href="/vendor/register">
            <Button className={cn('h-11 gap-2 rounded-xl px-6 font-bold hover:brightness-105', BRAND_ACCENT_BG, BRAND_ACCENT_TEXT)}>
              Become a Vendor <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button variant="outline" className="h-11 gap-2 rounded-xl border-white/40 bg-transparent px-6 text-white hover:bg-white/10">
              <PlayCircle className="h-4 w-4" /> See how it works
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Site footer ───────────────────────────────────────────────────────────────
function SiteFooter() {
  return (
    <footer className="w-full bg-[#172337] px-6 py-10 text-white/60">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 text-sm md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-3 flex items-center gap-2">
            <RentEaseLogo size={36} />
            <span className="text-base font-bold text-white">RentEase</span>
          </div>
          <p className="text-xs leading-relaxed">
            India&apos;s most trusted rental marketplace. Empowering vendors with technology, security and
            visibility.
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white">Platform</p>
          {[['How it works', '/how-it-works'], ['Pricing', '/pricing'], ['Integrations', '/integrations'], ['Success stories', '/success-stories']].map(([l, h]) => (
            <Link key={l} href={h} className="block py-1 transition-colors hover:text-white">{l}</Link>
          ))}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white">Vendor</p>
          {[['Become a Vendor', '/vendor/register'], ['Vendor Login', '/vendor/login'], ['Support', '/support'], ['Vendor Handbook', '/handbook']].map(([l, h]) => (
            <Link key={l} href={h} className="block py-1 transition-colors hover:text-white">{l}</Link>
          ))}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white">Company</p>
          {[['About', '/about'], ['Careers', '/careers'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([l, h]) => (
            <Link key={l} href={h} className="block py-1 transition-colors hover:text-white">{l}</Link>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-[1200px] flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
        <p className="text-xs">© 2026 RentEase Technologies Pvt. Ltd. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-2">
          {TRUST_BADGES.map((b) => (
            <span key={b} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/70">
              <BadgeCheck className="h-3 w-3 text-brand" /> {b}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ── Hero perk chips ───────────────────────────────────────────────────────────
const VENDOR_PERKS = [
  { icon: BadgeCheck, label: 'Zero listing fee' },
  { icon: Wallet, label: 'Payouts in 2–3 days' },
  { icon: Truck, label: 'We handle delivery' },
  { icon: ShieldCheck, label: 'Damage cover' },
]

// ── Main component ────────────────────────────────────────────────────────────
export function VendorLoginForm() {
  const router = useRouter()
  const toast = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captcha, setCaptcha] = useState(generateCaptcha)
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaError, setCaptchaError] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockCountdown, setLockCountdown] = useState(0)
  const [deviceInfo] = useState(getDeviceInfo)
  const [showDeviceBanner, setShowDeviceBanner] = useState(true)
  const [callbackUrl, setCallbackUrl] = useState('/vendor/dashboard')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const rememberMe = watch('rememberMe')
  const watchEmail = watch('email')
  const watchPassword = watch('password')

  // Honour ?callbackUrl= the middleware attaches.
  useEffect(() => {
    try {
      const cb = new URLSearchParams(window.location.search).get('callbackUrl')
      if (cb && cb.startsWith('/')) setCallbackUrl(cb)
    } catch {
      /* ignore */
    }
  }, [])

  // Lockout countdown.
  useEffect(() => {
    if (!isLocked || lockCountdown <= 0) return
    const t = setTimeout(() => {
      setLockCountdown((c) => {
        if (c <= 1) {
          setIsLocked(false)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearTimeout(t)
  }, [isLocked, lockCountdown])

  const regenerateCaptcha = () => {
    setCaptcha(generateCaptcha())
    setCaptchaInput('')
    setCaptchaError(false)
  }

  const onSubmit = async (data: LoginFormValues) => {
    if (isLocked) return
    setError(null)
    setCaptchaError(false)

    if (showCaptcha && captchaInput.trim() !== captcha.answer) {
      setCaptchaError(true)
      regenerateCaptcha()
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        loginType: 'vendor',
        redirect: false,
      })

      if (result?.error) {
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)

        if (newAttempts >= 5) {
          setIsLocked(true)
          setLockCountdown(30)
          setError('Too many failed attempts. Account locked for 30 seconds.')
          toast.error('Account locked', { description: 'Try again in 30 seconds.' })
          return
        }

        if (newAttempts >= 3 && !showCaptcha) {
          setShowCaptcha(true)
          regenerateCaptcha()
        }

        const remaining = 5 - newAttempts
        if (result.error === 'CredentialsSignin') {
          setError(`Invalid email or password. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`)
        } else if (result.error === 'VendorNotApproved') {
          setError('Your vendor account is pending approval.')
        } else if (result.error === 'VendorSuspended') {
          setError('Your account has been suspended. Contact support.')
        } else {
          setError(result.error || 'Login failed. Please try again.')
        }

        toast.error('Login failed', { description: 'Please check your credentials.' })
        return
      }

      const response = await fetch('/api/auth/session')
      const session = await response.json()

      if (session?.user?.role === 'vendor') {
        setLoginAttempts(0)
        toast.success('Welcome back!', { description: 'Redirecting to your dashboard…' })
        router.push(callbackUrl)
        router.refresh()
      } else if (session?.user?.role === 'admin' || session?.user?.role === 'super-admin') {
        toast.info('Admin access detected', { description: 'Redirecting to the admin dashboard…' })
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setError('You do not have vendor access. Please use a vendor account.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(message)
      toast.error('Login error', { description: 'Please try again or contact support.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const email = watch('email')
    if (!email) {
      toast.error('Enter your email first', { description: 'We need your email to send a reset link.' })
      return
    }
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) toast.success('Reset link sent!', { description: 'Check your inbox.' })
      else toast.error('Could not send reset link')
    } catch {
      toast.error('Error', { description: 'Failed to send reset link.' })
    }
  }

  // Mirror the customer login: the CTA only lights up once the form is valid.
  const canSubmit =
    !isLoading &&
    !isLocked &&
    /^\S+@\S+\.\S+$/.test(watchEmail || '') &&
    (watchPassword || '').length >= 6

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-0 h-screen w-screen overflow-y-auto overflow-x-hidden bg-background">
        <VendorHeader />
        <LiveTicker />

        {/* ══ HERO — brand showcase + login ═══════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <AuroraBackdrop />

          <div className="relative mx-auto flex min-h-[calc(100vh-6.5rem)] w-full items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid w-full max-w-[1400px] items-stretch gap-6 lg:grid-cols-2 lg:gap-7">
              {/* ── LEFT — vendor brand panel ── */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  'relative hidden overflow-hidden rounded-[2rem] p-6 text-white lg:flex lg:flex-col',
                  BRAND_GRADIENT,
                  BRAND_SOFT_SHADOW,
                )}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.13]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)',
                    backgroundSize: '38px 38px',
                  }}
                />
                <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

                <div className="relative z-10 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <RentEaseLogo size={44} withRing />
                    <div>
                      <p className="text-lg font-bold leading-none">RentEase Vendor</p>
                      <p className="text-xs text-white/70">Partner portal</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/20">
                      <Sparkles className="h-3 w-3" />
                      Vendor partners
                    </span>
                    <h1 className="text-[1.75rem] font-bold leading-[1.15]">
                      Rent out your products.
                      <br />
                      <span className="text-white/80">Earn every month.</span>
                    </h1>
                    <p className="max-w-sm text-sm text-white/75">
                      List furniture, electronics and appliances. We handle delivery, payments and
                      returns — you grow your rental business.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {VENDOR_PERKS.map((perk, index) => (
                      <motion.span
                        key={perk.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + index * 0.07 }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium text-white ring-1 ring-white/20"
                      >
                        <perk.icon className="h-3.5 w-3.5" />
                        {perk.label}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* illustration */}
                <div className="relative z-10 my-4 flex min-h-0 flex-1 items-center justify-center">
                  <div className="relative h-[12.5rem] w-full max-w-[24rem]">
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2">
                      <RentCycleArt />
                    </div>

                    <div className="relative h-full w-full overflow-hidden rounded-3xl ring-1 ring-white/25 shadow-2xl shadow-black/25">
                      <Image
                        src="/images/vendor-login-hero.png"
                        alt="A RentEase vendor managing rental inventory and earnings"
                        fill
                        priority
                        sizes="(min-width: 1024px) 46vw, 100vw"
                        className="object-cover"
                      />
                      <div className={cn('absolute inset-x-0 top-0 h-1', BRAND_GRADIENT)} />
                    </div>

                    <FloatingRentalTile icon={Boxes} label="List products" delay={0.3} className="-left-5 top-7" />
                    <FloatingRentalTile icon={TrendingUp} compact delay={0.6} className="-right-4 top-3" />
                    <FloatingRentalTile icon={Wallet} label="Grow earnings" delay={0.9} float={11} className="-right-6 bottom-8" />
                    <FloatingRentalTile icon={Truck} compact delay={1.2} className="-left-4 bottom-5" />
                  </div>
                </div>

                {/* stats + testimonial + route */}
                <div className="relative z-10 space-y-2.5">
                  <div className="grid grid-cols-4 gap-2 border-t border-white/15 pt-3.5">
                    {VENDOR_STATS.map((stat, index) => (
                      <AnimatedStat key={stat.label} stat={stat} index={index} />
                    ))}
                  </div>

                  <TestimonialCarousel />

                  <DeliveryRouteArt className="opacity-70" />
                </div>
              </motion.div>

              {/* ── RIGHT — vendor login card ── */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="relative mx-auto flex w-full min-w-0 max-w-md flex-col lg:mx-0 lg:max-w-none"
              >
                <div className="mb-4 lg:hidden">
                  <div className="flex items-center gap-2.5">
                    <RentEaseLogo size={40} />
                    <div>
                      <p className="text-base font-bold leading-none text-foreground">RentEase Vendor</p>
                      <p className="text-[11px] text-muted-foreground">Partner portal</p>
                    </div>
                  </div>
                  <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-2xl ring-1 ring-border">
                    <Image
                      src="/images/vendor-login-hero.png"
                      alt="A RentEase vendor managing rental inventory and earnings"
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                <CardAura />
                <Card className="relative flex flex-1 flex-col overflow-hidden rounded-2xl" style={GRADIENT_CARD_STYLE}>

                  <CardHeader className="space-y-2 pb-5">
                    <CardTitle className="text-center text-2xl lg:text-left">Vendor sign in</CardTitle>
                    <CardDescription className="text-center lg:text-left">
                      Sign in to manage your rental catalogue, bookings and payouts.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col justify-center">
                    <RoleSelector active="vendor" />

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                      <AnimatePresence>
                        {showDeviceBanner && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2.5 rounded-xl border border-brand/20 bg-brand-soft px-3 py-2.5"
                          >
                            <Monitor className="h-4 w-4 shrink-0 text-brand" />
                            <p className="flex-1 text-[11px] text-brand">
                              Signing in on <strong>{deviceInfo.device}</strong> · {deviceInfo.browser} ·{' '}
                              {deviceInfo.os}
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowDeviceBanner(false)}
                              aria-label="Dismiss device notice"
                              className="text-brand/60 transition-colors hover:text-brand"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5"
                          >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                            <p className="text-xs text-red-700">{error}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {isLocked && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5"
                          >
                            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <div>
                              <p className="text-xs font-semibold text-amber-800">Account temporarily locked</p>
                              <p className="text-[11px] text-amber-600">
                                Too many failed attempts. Try again in <strong>{lockCountdown}s</strong>
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {loginAttempts >= 2 && loginAttempts < 5 && !isLocked && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5"
                          >
                            <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                            <p className="text-[11px] text-amber-700">
                              <strong>
                                {5 - loginAttempts} attempt{5 - loginAttempts > 1 ? 's' : ''}
                              </strong>{' '}
                              remaining before lockout.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-2">
                        <Label htmlFor="vendor-email" className="text-foreground">
                          Business email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="vendor-email"
                            type="email"
                            placeholder="vendor@example.com"
                            className={cn(
                              'pl-10 transition-shadow focus-visible:ring-brand',
                              errors.email && 'border-red-400 focus-visible:ring-red-300',
                            )}
                            autoComplete="email"
                            disabled={isLoading || isLocked}
                            {...register('email')}
                          />
                        </div>
                        {errors.email && (
                          <p className="flex items-center gap-1 text-[11px] text-red-500">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="vendor-password" className="text-foreground">
                            Password
                          </Label>
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-[11px] font-semibold text-brand hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="vendor-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={cn(
                              'pl-10 pr-10 transition-shadow focus-visible:ring-brand',
                              errors.password && 'border-red-400 focus-visible:ring-red-300',
                            )}
                            autoComplete="current-password"
                            disabled={isLoading || isLocked}
                            {...register('password')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="flex items-center gap-1 text-[11px] text-red-500">
                            <AlertCircle className="h-3 w-3" />
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      {/* CAPTCHA — appears after repeated failures */}
                      <AnimatePresence>
                        {showCaptcha && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 rounded-xl border border-border bg-muted/50 p-3.5">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-brand" />
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Security verification
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="select-none rounded-lg border-2 border-brand/40 bg-card px-4 py-2 font-mono text-lg font-bold tracking-widest text-foreground">
                                  {captcha.question}
                                </div>
                                <button
                                  type="button"
                                  onClick={regenerateCaptcha}
                                  aria-label="New challenge"
                                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-brand-soft hover:text-brand"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                              </div>
                              <Input
                                placeholder="Enter your answer"
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                                className={cn('h-10 font-mono text-base focus-visible:ring-brand', captchaError && 'border-red-400')}
                                inputMode="numeric"
                              />
                              {captchaError && (
                                <p className="flex items-center gap-1 text-[11px] text-red-500">
                                  <X className="h-3 w-3" /> Incorrect. A new challenge has been generated.
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="vendor-remember"
                          checked={rememberMe}
                          onCheckedChange={(v) => setValue('rememberMe', v as boolean)}
                          disabled={isLoading || isLocked}
                          className="border-border data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                        />
                        <label
                          htmlFor="vendor-remember"
                          className="cursor-pointer select-none text-sm text-muted-foreground"
                        >
                          Keep me signed in
                        </label>
                      </div>

                      <Button
                        type="submit"
                        disabled={!canSubmit}
                        className={cn(
                          'group w-full text-white transition-all hover:opacity-90 disabled:bg-none disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:shadow-none',
                          BRAND_GRADIENT,
                          BRAND_SOFT_SHADOW,
                        )}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in…
                          </>
                        ) : isLocked ? (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            Locked · {lockCountdown}s
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Sign in to Vendor Portal
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>

                      <div className="relative my-1">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-card px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            New to RentEase?
                          </span>
                        </div>
                      </div>

                      <Link
                        href="/vendor/register"
                        className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-border text-sm font-semibold text-foreground transition-all hover:border-brand hover:bg-brand-soft hover:text-brand"
                      >
                        <Building2 className="h-4 w-4" /> Become a Vendor
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </form>

                    <p className="mt-3 text-center text-[11px] text-muted-foreground">
                      Free to list up to 30 products. Approval usually within 24–48 hours.
                    </p>

                    <div className="mt-5 border-t border-border pt-4">
                      <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Secured &amp; compliant
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {TRUST_BADGES.map((b) => (
                          <span
                            key={b}
                            className="flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground"
                          >
                            <BadgeCheck className="h-3 w-3 text-brand" /> {b}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-center text-[11px] text-muted-foreground">
                        Protected by 256-bit SSL encryption · Your data is never shared
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ BELOW THE FOLD ══════════════════════════════════════════════════ */}
        <VendorBenefitsSection />
        <OnboardingSteps />
        <BrandMarquee />
        <PricingSection />
        <IntegrationsStrip />
        <FAQSection />
        <CTABand />
        <SiteFooter />

        {/* dev credentials */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-lg">
            <p className="mb-1 text-xs font-bold text-amber-800">Dev Credentials</p>
            <p className="font-mono text-xs text-amber-700">vendor@rentease.com</p>
            <p className="font-mono text-xs text-amber-700">Vendor@123</p>
            <p className="mt-1 text-[10px] text-amber-600">
              Run <span className="font-mono">npm run seed:demo-vendor</span> in backend first.
            </p>
          </div>
        )}
      </div>
    </MotionConfig>
  )
}
