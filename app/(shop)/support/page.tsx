'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import {
  Search,
  Phone,
  Mail,
  MessageCircle,
  MessagesSquare,
  ArrowRight,
  Sparkles,
  Package,
  Wallet,
  Truck,
  RotateCcw,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  CalendarRange,
  Star,
  Quote,
  MapPin,
  Users,
  Headphones,
} from 'lucide-react'
import { Eyebrow, FAQAccordion, CTABand } from '@/components/marketing/Marketing'

// ---------------------------------------------------------------------------
// Flipkart-style brand tokens
//   Primary blue #2874F0 · Yellow accent #FFE11B · Success green #388E3C
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

const SLA_TICKER = [
  'Avg. first response in 12 minutes',
  '98% tickets resolved within 24 hours',
  'Support available 7 days a week',
  'Real humans on WhatsApp & live chat',
]

const POPULAR_SEARCHES = ['Refund status', 'Track order', 'Delivery slot', 'Deposit', 'Returns']

const QUICK_ACTIONS = [
  { icon: Package, title: 'Track order', desc: 'Live status & ETA', action: '/account/orders' },
  { icon: CalendarRange, title: 'Reschedule delivery', desc: 'Pick a new slot', action: '/account/orders' },
  { icon: Wallet, title: 'Request refund', desc: 'Deposit & rent', action: '/account/refunds' },
  { icon: FileText, title: 'Download invoice', desc: 'Tax & billing', action: '/account/invoices' },
]

const CONTACT_CHANNELS = [
  { icon: Phone, title: 'Call us', detail: '1800-123-4567', sub: 'Mon–Sat, 9am–8pm IST', action: 'tel:18001234567', cta: 'Call now', accent: 'from-blue-500 to-indigo-600' },
  { icon: MessageCircle, title: 'WhatsApp', detail: '+91 98765 43210', sub: 'Fastest response, usually < 15 min', action: 'https://wa.me/919876543210', cta: 'Message us', accent: 'from-emerald-500 to-teal-600' },
  { icon: Mail, title: 'Email', detail: 'support@rentease.com', sub: 'Replies within 24 hours', action: 'mailto:support@rentease.com', cta: 'Send email', accent: 'from-amber-500 to-orange-600' },
  { icon: MessagesSquare, title: 'Live chat', detail: 'Chat with our care team', sub: 'Available from your account', action: '#', cta: 'Start chat', accent: 'from-sky-500 to-blue-600' },
]

const STATS = [
  { icon: Clock, value: '12 min', label: 'Avg. first response' },
  { icon: ShieldCheck, value: '98%', label: 'Resolved in 24 hrs' },
  { icon: Star, value: '4.8/5', label: 'Support rating' },
  { icon: FileText, value: '200+', label: 'Help articles' },
]

const HELP_TOPICS = [
  { icon: Package, title: 'Orders & Tracking', desc: 'Check status, reschedule, and manage bookings', count: 12 },
  { icon: Wallet, title: 'Payments & Refunds', desc: 'Rent, deposits, and refund timelines', count: 9 },
  { icon: Truck, title: 'Delivery & Pickup', desc: 'Slots, cities, and installation', count: 8 },
  { icon: RotateCcw, title: 'Returns & Damage', desc: 'End-of-tenure returns and claims', count: 7 },
  { icon: ShieldCheck, title: 'Account & Security', desc: 'Login, password, and 2FA', count: 6 },
  { icon: FileText, title: 'Policies & Terms', desc: 'Rental agreement and marketplace rules', count: 5 },
]

const HELP_ARTICLES = [
  { title: 'How to track your ongoing rental order', category: 'Orders', readTime: '3 min' },
  { title: 'When will my security deposit be refunded?', category: 'Payments', readTime: '4 min' },
  { title: 'What to expect on delivery day', category: 'Delivery', readTime: '3 min' },
  { title: 'How to return a product at end of tenure', category: 'Returns', readTime: '4 min' },
  { title: 'Resetting your password and enabling 2FA', category: 'Security', readTime: '2 min' },
]

const REVIEWS = [
  { name: 'Kabir Menon', city: 'Chennai', rating: 5, text: 'Raised a delivery reschedule on WhatsApp and got a reply in under 10 minutes. Genuinely the smoothest support I’ve used.' },
  { name: 'Sara Iqbal', city: 'Delhi', rating: 5, text: 'My deposit refund was processed exactly when they said. The care team even followed up to confirm it landed.' },
  { name: 'Devansh Rao', city: 'Mumbai', rating: 4, text: 'Live chat walked me through returning my washing machine step by step. Clear, patient, and no hold music!' },
]

const FAQ = [
  { q: 'How can I track my order?', a: 'Open your account, go to “My Rentals”, and select the order. You’ll see live delivery status and estimated arrival.' },
  { q: 'When is my security deposit refunded?', a: 'Your deposit is refunded in full after the product is picked up and passes a standard condition check — usually within 5–7 business days.' },
  { q: 'Can I change my rental plan mid-tenure?', a: 'Yes. You can upgrade, extend, or renew from “My Rentals”. Downgrades take effect at the start of the next billing cycle.' },
  { q: 'What if I’m not home for delivery?', a: 'You can reschedule the slot from your order page up to 24 hours before the slot. Our partner will coordinate a convenient time.' },
]

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SupportPage() {
  const [query, setQuery] = useState('')
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  const filteredTopics = HELP_TOPICS.filter((t) =>
    `${t.title} ${t.desc}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="w-full overflow-x-hidden bg-[#f1f3f6]" style={{ fontFamily: "'Roboto','Segoe UI',sans-serif" }}>
      {/* ── SLA TICKER STRIP ─────────────────────────────────────────── */}
      <div className="w-full text-white text-xs sm:text-sm" style={{ backgroundColor: FK.blueDark }}>
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-6 py-2 font-medium">
          {SLA_TICKER.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" style={{ color: FK.yellow }} /> {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO + SEARCH ────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden py-16 lg:py-20 px-6" style={{ backgroundColor: FK.blue }}>
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(circle at 88% 12%, rgba(255,225,27,0.18), transparent 40%), radial-gradient(circle at 8% 90%, rgba(255,255,255,0.18), transparent 45%)',
          }}
        />
        <div className="relative max-w-[760px] mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-5">
              <Sparkles className="h-3 w-3" style={{ color: FK.yellow }} /> 24/7 customer support
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">How can we help?</h1>
            <p className="text-white/85 mt-4 text-base lg:text-lg">Search our help centre, or reach a real person in minutes.</p>

            {/* Search bar (Flipkart signature) */}
            <div className="relative mt-8 max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, e.g. 'deposit refund'"
                className="h-14 pl-12 pr-4 rounded-xl bg-white border-0 shadow-xl shadow-blue-900/25 text-slate-800 text-base placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-white/60"
              />
            </div>

            {/* Popular searches */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-white/70 font-medium">Popular:</span>
              {POPULAR_SEARCHES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setQuery(p)}
                  className="rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1 text-xs font-medium text-white transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/80 text-sm">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> Replies in ~12 min</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> 1.2 Lakh+ helped</span>
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4" style={{ color: FK.yellow, fill: FK.yellow }} /> 4.8/5 support</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── QUICK SELF-SERVICE ACTIONS ───────────────────────────────── */}
      <section className="w-full px-6 -mt-8 relative z-10">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((a, i) => {
            const Icon = a.icon
            return (
              <motion.div key={a.title} {...fadeUp} transition={{ delay: i * 0.06 }}>
                <Link
                  href={a.action}
                  className="group flex items-center gap-3 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-200/50 p-4 hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#eaf1ff' }}>
                    <Icon className="h-5 w-5" style={{ color: FK.blue }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-tight">{a.title}</p>
                    <p className="text-xs text-slate-500 truncate">{a.desc}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-[#2874F0] transition-colors" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── CONTACT CHANNELS ─────────────────────────────────────────── */}
      <section className="w-full py-16 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-10">
            <Eyebrow icon={Headphones}>Talk to us</Eyebrow>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Reach a real person</h2>
            <p className="text-sm text-slate-500 mt-1">Pick whatever’s easiest — we’re quick on every channel.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CONTACT_CHANNELS.map((c, i) => {
              const Icon = c.icon
              return (
                <motion.a
                  key={c.title}
                  href={c.action}
                  target={c.action.startsWith('http') ? '_blank' : undefined}
                  rel={c.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                  {...fadeUp}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 p-6 hover:-translate-y-1.5 hover:shadow-xl transition-all group"
                >
                  <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4', c.accent)}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                  <p className="text-sm text-slate-700 font-medium mt-1">{c.detail}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {c.sub}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold mt-4 group-hover:gap-1.5 transition-all" style={{ color: FK.blue }}>
                    {c.cta} <ArrowRight className="h-3 w-3" />
                  </span>
                </motion.a>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────────── */}
      <section className="w-full px-6 pb-4">
        <div
          className="max-w-[1100px] mx-auto rounded-3xl px-6 py-10 lg:py-12 shadow-xl shadow-blue-500/20"
          style={{ background: `linear-gradient(135deg, ${FK.blue}, ${FK.blueDark})` }}
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

      {/* ── HELP TOPICS ──────────────────────────────────────────────── */}
      <section className="w-full py-16 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-10">
            <Eyebrow icon={FileText} tone="violet">Browse by topic</Eyebrow>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Popular help topics</h2>
            {query && (
              <p className="text-sm text-slate-500 mt-1">
                Showing results for “<span className="font-semibold text-slate-700">{query}</span>”
                <button type="button" onClick={() => setQuery('')} className="ml-2 font-semibold" style={{ color: FK.blue }}>Clear</button>
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTopics.map((t, i) => {
              const Icon = t.icon
              return (
                <motion.div
                  key={t.title}
                  {...fadeUp}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: '#eaf1ff' }}>
                      <Icon className="h-5 w-5" style={{ color: FK.blue }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{t.count} articles</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-4 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    {t.title}
                    <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-[#2874F0] transition-colors" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{t.desc}</p>
                </motion.div>
              )
            })}
            {filteredTopics.length === 0 && (
              <div className="col-span-full flex flex-col items-center text-center py-12">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#eaf1ff' }}>
                  <Search className="h-7 w-7" style={{ color: FK.blue }} />
                </div>
                <p className="text-sm text-slate-500">No topics match “{query}”. Try a different keyword or contact us directly.</p>
                <button type="button" onClick={() => setQuery('')} className="mt-3 text-sm font-bold" style={{ color: FK.blue }}>Clear search</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURED ARTICLES ────────────────────────────────────────── */}
      <section className="w-full py-16 px-6 bg-white">
        <div className="max-w-[720px] mx-auto text-center mb-10">
          <Eyebrow icon={FileText}>Featured articles</Eyebrow>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Most-read this week</h2>
        </div>
        <div className="max-w-[640px] mx-auto space-y-3">
          {HELP_ARTICLES.map((article, i) => (
            <motion.div
              key={article.title}
              {...fadeUp}
              transition={{ delay: i * 0.05 }}
              className="bg-[#f7f9fc] rounded-2xl border border-slate-100 p-5 flex items-start gap-4 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${FK.blue}, ${FK.blueDark})` }}>
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: FK.blue }}>{article.category}</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{article.title}</h3>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {article.readTime} read
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300 shrink-0 mt-1 group-hover:text-[#2874F0] transition-colors" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SUPPORT REVIEWS ──────────────────────────────────────────── */}
      <section className="w-full py-16 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-10">
            <Eyebrow icon={Star}>Loved by customers</Eyebrow>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Support people actually rave about</h2>
            <div className="mt-3 inline-flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5" style={{ color: FK.yellow, fill: FK.yellow }} />
              ))}
              <span className="ml-2 text-sm font-semibold text-slate-600">4.8/5 · 12,000+ reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <motion.div
                key={r.name}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all"
              >
                <Quote className="absolute top-5 right-5 h-8 w-8 text-blue-100" />
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4" style={{ color: s < r.rating ? FK.yellow : '#e2e8f0', fill: s < r.rating ? FK.yellow : '#e2e8f0' }} />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">“{r.text}”</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: FK.blue }}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{r.name}</p>
                    <p className="text-xs text-slate-500 inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SLA STRIP ────────────────────────────────────────────────── */}
      <section className="w-full py-10 px-6">
        <div className="max-w-[1000px] mx-auto rounded-3xl border border-blue-100 px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4" style={{ background: 'linear-gradient(135deg, #eaf1ff, #f5f8ff)' }}>
          {['Avg. first response: 12 min', '98% tickets resolved in 24 hrs', 'Support available 7 days a week'].map((s) => (
            <span key={s} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
              <CheckCircle2 className="h-4 w-4" style={{ color: FK.green }} /> {s}
            </span>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="w-full py-16 px-6 bg-white">
        <div className="max-w-[720px] mx-auto">
          <div className="text-center mb-8">
            <Eyebrow icon={Sparkles}>FAQ</Eyebrow>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Frequently asked questions</h2>
          </div>
          <FAQAccordion items={FAQ} defaultOpen={openFAQ} />
        </div>
      </section>

      <CTABand title="Still stuck? We're one message away." subtitle="Our care team replies on WhatsApp and live chat in minutes, every day of the week." />
    </div>
  )
}
