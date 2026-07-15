'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Gift, Rocket, Crown, Globe, ArrowRight, BadgeCheck, Sparkles, Check, Minus,
  Quote, Star,
} from 'lucide-react'
import { SiteHeader, HeaderSpacer, SiteFooter, CTABand, FAQItem, Eyebrow, Carousel } from '../shared'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    name: 'Starter',
    icon: Rocket,
    monthly: 0,
    annual: 0,
    tagline: 'For vendors testing the waters',
    features: ['Up to 30 products', 'Basic analytics', 'Standard payouts (3 days)', 'Email support', 'Single location'],
    accent: 'from-slate-600 to-slate-800',
    highlight: false,
  },
  {
    name: 'Growth',
    icon: Crown,
    monthly: 999,
    annual: 799,
    tagline: 'Most popular for scaling vendors',
    features: ['Unlimited products', 'Advanced analytics', 'Priority payouts (2 days)', 'Multi-location', 'WhatsApp support', 'Featured placement boost'],
    accent: 'from-indigo-600 to-violet-600',
    highlight: true,
  },
  {
    name: 'Enterprise',
    icon: Globe,
    monthly: null,
    annual: null,
    tagline: 'Dedicated infrastructure & SLA',
    features: ['White-label storefront', 'API access', 'Same-day payouts', 'Dedicated account manager', 'Custom integrations', 'Priority dispute resolution'],
    accent: 'from-amber-600 to-pink-600',
    highlight: false,
  },
]

const COMPARISON_ROWS: { label: string; starter: string | boolean; growth: string | boolean; enterprise: string | boolean }[] = [
  { label: 'Active product listings', starter: 'Up to 30', growth: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Payout cycle', starter: '3 business days', growth: '2 business days', enterprise: 'Same day' },
  { label: 'Service locations', starter: '1', growth: 'Up to 10', enterprise: 'Unlimited' },
  { label: 'Analytics dashboard', starter: 'Basic', growth: 'Advanced', enterprise: 'Advanced + custom reports' },
  { label: 'Support channel', starter: 'Email', growth: 'WhatsApp + Email', enterprise: 'Dedicated manager' },
  { label: 'Two-factor authentication', starter: true, growth: true, enterprise: true },
  { label: 'API access', starter: false, growth: false, enterprise: true },
  { label: 'White-label storefront', starter: false, growth: false, enterprise: true },
]

const PRICING_TESTIMONIALS = [
  { name: 'Rajesh Kumar', business: 'FurnitureRent Co.', text: 'We started on Starter and moved to Growth within two months once bookings picked up. The upgrade took one click, no re-KYC.', rating: 5 },
  { name: 'Priya Sharma', business: 'Home Appliances Hub', text: 'Growth plan payouts landing in 2 days changed our cash flow completely. Worth every rupee for a business our size.', rating: 5 },
  { name: 'Amit Patel', business: 'Decor & Events Rentals', text: 'Enterprise gave us API access to sync inventory with our own booking system. Our dedicated manager responds within the hour.', rating: 5 },
]

const FAQ = [
  { q: 'Can I switch plans later?', a: 'Yes, upgrade or downgrade anytime from Settings → Billing. Changes apply from your next billing cycle, and no re-verification is needed.' },
  { q: 'Is there a setup fee?', a: 'No. There are no setup fees or hidden charges on any plan, including Enterprise.' },
  { q: 'What happens if I exceed 30 products on Starter?', a: "You'll get a notification and a one-click prompt to upgrade to Growth. Your existing listings stay live either way." },
  { q: 'How does annual billing work?', a: 'Annual billing is charged upfront and works out to roughly 20% less than paying monthly. You can still cancel anytime; unused months are refunded pro-rata.' },
]

function PriceCard({ plan, i, annual }: { plan: typeof PLANS[0]; i: number; annual: boolean }) {
  const Icon = plan.icon
  const price = annual ? plan.annual : plan.monthly
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className={cn('relative rounded-2xl p-7 border-2 bg-white flex flex-col', plan.highlight ? 'border-indigo-500 shadow-xl shadow-indigo-200/50 lg:-mt-4 lg:mb-4' : 'border-slate-200 shadow-sm')}>
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">Most Popular</span>
      )}
      <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4', plan.accent)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
      <p className="text-xs text-slate-500 mt-0.5">{plan.tagline}</p>
      <div className="mt-4 flex items-end gap-1">
        {price === null ? (
          <span className="text-3xl font-extrabold text-slate-900">Custom</span>
        ) : (
          <>
            <span className="text-3xl font-extrabold text-slate-900">₹{price}</span>
            <span className="text-sm font-semibold text-slate-400 mb-1">/mo{annual && price > 0 ? ', billed yearly' : ''}</span>
          </>
        )}
      </div>
      <ul className="mt-5 space-y-2.5 flex-1">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
            <BadgeCheck className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" /> {f}
          </li>
        ))}
      </ul>
      <Link href={plan.name === 'Enterprise' ? '/support' : '/vendor/register'} className="w-full mt-6">
        <Button className={cn('w-full h-11 rounded-xl font-semibold', plan.highlight ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 hover:bg-slate-900')}>
          {plan.name === 'Enterprise' ? 'Talk to sales' : plan.highlight ? 'Start free trial' : 'Choose plan'} <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </motion.div>
  )
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(true)
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  return (
    <div className="fixed inset-0 z-0 w-screen h-screen overflow-y-auto overflow-x-hidden bg-white" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div className="flex flex-col min-h-full w-full">
        <SiteHeader active="/pricing" />
        <HeaderSpacer />

        {/* ── HERO + TOGGLE ──────────────────────────────────────────── */}
        <section className="w-full py-16 px-6 bg-gradient-to-b from-indigo-50/60 to-white">
          <div className="max-w-[800px] mx-auto text-center">
            <Eyebrow icon={Gift}>Pricing</Eyebrow>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">Plans that scale with your business</h1>
            <p className="text-slate-500 mt-3 text-base lg:text-lg">Start free and upgrade as you grow. No hidden charges, cancel anytime.</p>

            <div className="mt-8 inline-flex items-center gap-3 bg-slate-100 rounded-full p-1.5">
              <button type="button" onClick={() => setAnnual(false)} className={cn('px-5 py-2 rounded-full text-sm font-semibold transition-all', !annual ? 'bg-white shadow text-slate-900' : 'text-slate-500')}>Monthly</button>
              <button type="button" onClick={() => setAnnual(true)} className={cn('px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2', annual ? 'bg-white shadow text-slate-900' : 'text-slate-500')}>
                Annual <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── PLANS ──────────────────────────────────────────────────── */}
        <section className="w-full pb-16 px-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-center">
            {PLANS.map((p, i) => <PriceCard key={p.name} plan={p} i={i} annual={annual} />)}
          </div>
        </section>

        {/* ── COMPARISON TABLE ──────────────────────────────────────── */}
        <section className="w-full py-16 px-6 bg-slate-50">
          <div className="max-w-[900px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Compare plans in detail</h2>
              <p className="text-sm text-slate-500 mt-1">Everything you get, side by side.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left font-semibold text-slate-500 py-4 px-5">Feature</th>
                    <th className="text-center font-bold text-slate-700 py-4 px-5">Starter</th>
                    <th className="text-center font-bold text-indigo-600 py-4 px-5">Growth</th>
                    <th className="text-center font-bold text-slate-700 py-4 px-5">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={row.label} className={cn('border-b border-slate-50 last:border-0', i % 2 === 1 && 'bg-slate-50/50')}>
                      <td className="py-3.5 px-5 text-slate-600 font-medium">{row.label}</td>
                      {(['starter', 'growth', 'enterprise'] as const).map(key => (
                        <td key={key} className="py-3.5 px-5 text-center">
                          {typeof row[key] === 'boolean'
                            ? row[key] ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <Minus className="h-4 w-4 text-slate-300 mx-auto" />
                            : <span className="text-slate-700">{row[key]}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL CAROUSEL ──────────────────────────────────── */}
        <section className="w-full py-16 px-6 bg-white">
          <div className="max-w-[640px] mx-auto text-center mb-10">
            <Eyebrow icon={Sparkles} tone="violet">Vendor voices</Eyebrow>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">What vendors say about upgrading</h2>
          </div>
          <div className="max-w-[560px] mx-auto">
            <Carousel
              ariaLabel="Vendor pricing testimonials"
              items={PRICING_TESTIMONIALS}
              renderItem={(t) => (
                <div className="bg-slate-50 rounded-2xl p-7 border border-slate-100 text-center">
                  <Quote className="h-6 w-6 text-indigo-400 mx-auto mb-3" />
                  <p className="text-slate-700 leading-relaxed italic">{t.text}</p>
                  <div className="flex justify-center gap-0.5 mt-4">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
                  <p className="text-sm font-bold text-slate-900 mt-3">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.business}</p>
                </div>
              )}
            />
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section className="w-full py-16 px-6 bg-slate-50">
          <div className="max-w-[720px] mx-auto">
            <div className="text-center mb-8">
              <Eyebrow icon={Gift}>Billing FAQ</Eyebrow>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-3">Questions about pricing</h2>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 px-6">
              {FAQ.map((item, i) => <FAQItem key={item.q} q={item.q} a={item.a} isOpen={openFAQ === i} onToggle={() => setOpenFAQ(openFAQ === i ? null : i)} />)}
            </div>
          </div>
        </section>

        <CTABand title="Pick a plan and start listing today" subtitle="Every plan includes secure payouts, buyer protection, and 24/7 platform uptime." />
        <SiteFooter />
      </div>
    </div>
  )
}