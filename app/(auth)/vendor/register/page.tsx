// src/app/(auth)/vendor/register/page.tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, Boxes, CheckCircle2, Clock, Headphones, HelpCircle,
  IndianRupee, LifeBuoy, PackageCheck, ShieldCheck, Store, Truck, UserPlus, Wallet,
} from 'lucide-react'

import { VendorRegistrationForm } from '@/components/vendor/VendorRegistrationForm'
import { VendorRegistrationBanner } from '@/components/vendor/VendorRegistrationBanner'
import { ValuePropositionGrid } from '@/components/vendor/ValuePropositionGrid'
import { OnboardingChecklist } from '@/components/vendor/Onboardingchecklist'
import { VendorFAQAccordion } from '@/components/vendor/Vendorfaqaccordion'
import { TrustBadges } from '@/components/vendor/Trustbadges'
import { RentEaseLogo } from '@/components/brand/RentEaseLogo'
import { AuroraBackdrop } from '@/components/forms/login/AuroraBackdrop'

export const metadata: Metadata = {
  title: 'Become a Vendor | RentEase',
  description:
    'Join RentEase as a vendor and grow your rental business. Reach thousands of customers and maximise your revenue.',
  robots: 'noindex, nofollow', // Only for the registration page
}

const BRAND_GRADIENT =
  'bg-[linear-gradient(135deg,var(--brand-gradient-from),var(--brand-gradient-to))]'

// ─── Static content ──────────────────────────────────────────────
const HERO_STATS = [
  { value: '10 Lakh+', label: 'Active renters' },
  { value: '₹0', label: 'Listing fee' },
  { value: '14 days', label: 'Payout cycle' },
  { value: '4.8/5', label: 'Vendor rating' },
]

const TRUST_CHIPS = [
  { icon: ShieldCheck, label: 'GST & PAN verified' },
  { icon: Truck, label: 'We handle delivery' },
  { icon: Headphones, label: 'Dedicated manager' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Register your business',
    desc: 'Add your business name, category and the cities you serve. Takes about 10 minutes.',
    points: ['Business & contact details', 'PAN, GST and address proof', 'Bank account for payouts'],
  },
  {
    step: '02',
    icon: PackageCheck,
    title: 'List your rental stock',
    desc: 'Add products with photos, monthly rent and availability. Publish instantly to 10 lakh+ renters.',
    points: ['Unlimited product listings', 'Set your own monthly price', 'Manage availability any time'],
  },
  {
    step: '03',
    icon: Wallet,
    title: 'Fulfil orders and get paid',
    desc: 'Confirm pickups and deliveries, then receive settlements straight to your bank every 14 days.',
    points: ['Bi-weekly bank settlements', 'Transparent, itemised invoices', 'Zero hidden deductions'],
  },
]

const WORKFLOW_STRIP = [
  { icon: Boxes, label: 'Inventory listed' },
  { icon: Truck, label: 'Order delivered' },
  { icon: IndianRupee, label: 'Rent collected' },
  { icon: Wallet, label: 'Payout settled' },
]

const FOOTER_LINKS = [
  { label: 'How it works', href: '/vendor/pricing' },
  { label: 'Pricing', href: '/vendor/pricing' },
  { label: 'Success stories', href: '/vendor/success-stories' },
  { label: 'Help centre', href: 'mailto:vendor-support@rentease.in' },
]

// ─── Small building blocks ───────────────────────────────────────
function RegisterHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <RentEaseLogo size={34} withRing />
          <span className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-foreground">RentEase</span>
            <span className="rounded bg-[var(--brand-accent)]/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
              Seller Hub
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <a
            href="mailto:vendor-support@rentease.in"
            className="hidden items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-brand sm:flex"
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </a>
          <Link
            href="/vendor/login"
            className="rounded-lg border border-brand/35 px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft"
          >
            Vendor login
          </Link>
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-lg bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand/10 md:flex"
          >
            <Store className="h-3.5 w-3.5" />
            Switch to shopping
          </Link>
        </div>
      </div>
    </header>
  )
}

function RegisterFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <RentEaseLogo size={32} />
              <span className="text-base font-bold tracking-tight text-foreground">RentEase</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              India&apos;s rental marketplace for furniture, electronics and appliances. List once,
              earn every month.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-7 gap-y-2 text-xs font-medium text-muted-foreground">
            {FOOTER_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="transition-colors hover:text-brand">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-700">
              Vendor onboarding open
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-5 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© 2025 RentEase Technologies Pvt. Ltd. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-brand" />
            PCI-DSS L1 · ISO 27001 · Data stored in India
          </span>
        </div>
      </div>
    </footer>
  )
}

function HowItWorksSection() {
  return (
    <section className="border-y border-border bg-muted/30 px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-[1240px]">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
            <BadgeCheck className="h-3 w-3" />
            How renting works
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
            From sign-up to your first payout
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Three steps. Most vendors go live within 48 hours of submitting documents.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {HOW_IT_WORKS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lg hover:shadow-brand/10"
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-1 ${BRAND_GRADIENT}`}
                />
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${BRAND_GRADIENT}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-2xl font-black tabular-nums text-brand/15">
                    {item.step}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>

                <ul className="mt-4 space-y-1.5">
                  {item.points.map((p) => (
                    <li key={p} className="flex items-start gap-1.5 text-[11px] text-foreground/80">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-brand" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* rental lifecycle strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-3 rounded-2xl border border-border bg-card px-6 py-4">
          {WORKFLOW_STRIP.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] font-bold text-foreground">{s.label}</span>
                </div>
                {i < WORKFLOW_STRIP.length - 1 && (
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────
export default function VendorRegisterPage() {
  return (
    // Full-bleed: (auth) layout wraps children in a `max-w-6xl px-4 py-8`
    // container, which would inset every section. Escaping it keeps the
    // sticky header and tinted bands edge-to-edge.
    <div className="fixed inset-0 z-0 h-screen w-screen overflow-y-auto overflow-x-hidden bg-background">
      <AuroraBackdrop className="h-[720px]" />

      <RegisterHeader />

      <main className="relative">
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="px-4 pb-12 pt-10 sm:px-6 sm:pt-14">
          <div className="mx-auto grid max-w-[1240px] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            {/* copy */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
                <BadgeCheck className="h-3 w-3" />
                Vendor onboarding
              </span>

              <h1 className="mt-4 text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-[2.5rem]">
                Rent out your products.
                <br />
                <span className="text-brand">Earn every month.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                List your furniture, electronics and appliances on RentEase. We handle discovery,
                delivery, payments and returns — you focus on growing your rental business.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {TRUST_CHIPS.map((c) => {
                  const Icon = c.icon
                  return (
                    <span
                      key={c.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground/80"
                    >
                      <Icon className="h-3.5 w-3.5 text-brand" />
                      {c.label}
                    </span>
                  )
                })}
              </div>

              {/* static stats */}
              <dl className="mt-8 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
                {HERO_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-border bg-card px-3 py-2.5 text-center shadow-sm"
                  >
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {s.label}
                    </dt>
                    <dd className="mt-0.5 text-lg font-black tabular-nums text-brand">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* illustration */}
            <div className="relative">
              <div className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-brand/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
                <Image
                  src="/images/vendor-onboarding.png"
                  alt="A vendor photographing a sofa to list it for rent on RentEase"
                  width={1200}
                  height={900}
                  priority
                  className="h-auto w-full object-cover"
                />
                <div className={`absolute inset-x-0 top-0 h-1 ${BRAND_GRADIENT}`} />

                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-[11px] font-bold text-brand shadow-sm backdrop-blur">
                    <Boxes className="h-3.5 w-3.5" />
                    List in minutes
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-[11px] font-bold text-brand shadow-sm backdrop-blur">
                    <Wallet className="h-3.5 w-3.5" />
                    Get paid every 14 days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUE PROPS ──────────────────────────────────────── */}
        <section className="px-4 pb-12 sm:px-6">
          <div className="mx-auto max-w-[1240px]">
            <ValuePropositionGrid />
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <HowItWorksSection />

        {/* ── WIZARD + SIDEBAR ─────────────────────────────────── */}
        <section className="px-4 py-12 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-[1240px]">
            <div className="mb-6 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Start your vendor application
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Five short steps — you can go back and edit any step before submitting.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
              {/* wizard */}
              <div className="order-2 min-w-0 lg:order-1">
                <VendorRegistrationForm />
              </div>

              {/* sidebar */}
              <aside className="order-1 space-y-5 lg:order-2 lg:sticky lg:top-20">
                <OnboardingChecklist activeStep={1} />
                <VendorRegistrationBanner />
                <TrustBadges />
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2">
                    <LifeBuoy className="h-4 w-4 text-brand" />
                    <h3 className="text-sm font-bold text-foreground">Need a hand?</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Our vendor success team helps with documents, pricing and your first listing.
                  </p>
                  <a
                    href="mailto:vendor-support@rentease.in"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                  >
                    vendor-support@rentease.in
                    <ArrowRight className="h-3 w-3" />
                  </a>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Replies within 4 working hours
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="border-t border-border bg-muted/30 px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Vendor questions, answered
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Everything about listing, verification and payouts.
              </p>
            </div>
            <VendorFAQAccordion />
          </div>
        </section>

        {/* ── CTA BAND ─────────────────────────────────────────── */}
        <section className="px-4 py-12 sm:px-6">
          <div
            className={`mx-auto max-w-[1240px] overflow-hidden rounded-3xl ${BRAND_GRADIENT} px-6 py-10 text-center text-white sm:px-12`}
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to start earning from your inventory?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/85">
              Join 50,000+ vendors renting out furniture, electronics and appliances across India.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Start registration
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/vendor/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                I already have an account
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-white/80">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> No listing fee
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Cancel any time
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Data stored in India
              </span>
            </div>
          </div>
        </section>
      </main>

      <RegisterFooter />
    </div>
  )
}
