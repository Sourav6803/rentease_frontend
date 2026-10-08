// src/app/(auth)/register/page.tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, ShieldCheck, Sofa, Star, Truck } from 'lucide-react'

import { RegisterForm } from '@/components/forms/RegisterForm'
import { RentEaseLogo } from '@/components/brand/RentEaseLogo'
import { AuroraBackdrop, CardAura } from '@/components/forms/login/AuroraBackdrop'

export const metadata: Metadata = {
  title: 'Create your account | RentEase',
  description:
    'Create a RentEase account to rent furniture and appliances on flexible monthly plans.',
}

const BRAND_GRADIENT =
  'bg-[linear-gradient(135deg,var(--brand-gradient-from),var(--brand-gradient-to))]'

const benefits = [
  {
    Icon: ShieldCheck,
    title: 'Protected by design',
    description: 'Secure sessions and transparent account controls.',
  },
  {
    Icon: BadgeCheck,
    title: 'Flexible monthly plans',
    description: 'Choose furniture and appliances that fit your stay.',
  },
  {
    Icon: Truck,
    title: 'Doorstep delivery',
    description: 'Free delivery, installation, and easy pickup on returns.',
  },
]

export default function RegisterPage() {
  return (
    // Escapes the (auth) layout's `max-w-6xl px-4 py-8` wrapper so the two
    // columns can run edge to edge, exactly like /login.
    <div className="fixed inset-0 z-0 h-screen w-screen overflow-x-hidden overflow-y-auto bg-background">
      <AuroraBackdrop className="h-screen" />

      <div className="relative mx-auto flex min-h-screen w-full items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-[1400px] items-stretch gap-6 lg:grid-cols-2 lg:gap-7">
          {/* ══ LEFT — brand showcase ══════════════════════════════════════ */}
          <section className="relative hidden flex-col justify-between overflow-hidden rounded-3xl p-8 text-white lg:flex">
            <div className={`absolute inset-0 ${BRAND_GRADIENT}`} />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)',
                backgroundSize: '38px 38px',
              }}
            />
            <div aria-hidden className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div aria-hidden className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[var(--brand-accent)]/20 blur-3xl" />

            {/* brand + headline */}
            <div className="relative z-10 space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <RentEaseLogo size={44} withRing />
                <span>
                  <span className="block text-lg font-bold leading-none">RentEase</span>
                  <span className="mt-1 block text-[11px] text-white/70">Rent more. Own less.</span>
                </span>
              </Link>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 ring-1 ring-white/20 backdrop-blur-sm">
                <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                <span className="text-[11px] font-semibold">Rated 4.6 by 10,000+ renters</span>
              </div>

              <h1 className="max-w-lg text-[1.75rem] font-bold leading-[1.2] tracking-tight sm:text-3xl">
                Create an account and settle in with ease.
              </h1>
              <p className="max-w-lg text-sm leading-relaxed text-white/80">
                Discover quality furniture and appliances on flexible monthly plans — without the
                stress of buying, moving, or reselling.
              </p>
            </div>

            {/* illustration */}
            <div className="relative z-10 my-5 flex min-h-0 flex-1 items-center justify-center">
              <div className="relative h-[12.5rem] w-full max-w-[24rem]">
                <div className="relative h-full w-full overflow-hidden rounded-3xl ring-1 ring-white/25 shadow-2xl shadow-black/25">
                  <Image
                    src="/images/rental-login-hero.png"
                    alt="Renting furniture, electronics and appliances made easy"
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="pointer-events-none absolute -left-5 top-7 z-20 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/95 px-3 py-2 shadow-lg shadow-black/20">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Sofa className="h-4 w-4" />
                  </span>
                  <span className="pr-1 text-xs font-semibold text-brand">Furniture</span>
                </div>

                <div className="pointer-events-none absolute -right-4 bottom-8 z-20 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/95 px-3 py-2 shadow-lg shadow-black/20">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Truck className="h-4 w-4" />
                  </span>
                  <span className="pr-1 text-xs font-semibold text-brand">Free delivery</span>
                </div>
              </div>
            </div>

            {/* benefits + sign-in link */}
            <div className="relative z-10 space-y-3">
              <ul className="grid gap-2.5" aria-label="RentEase benefits">
                {benefits.map(({ Icon, title, description }) => (
                  <li
                    key={title}
                    className="flex gap-2.5 rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/15 backdrop-blur-sm"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-[12px] font-bold">{title}</strong>
                      <span className="mt-0.5 block text-[11px] leading-snug text-white/70">
                        {description}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-white/75">
                Already a member?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
                >
                  Sign in to your account
                </Link>
              </p>
            </div>
          </section>

          {/* ══ RIGHT — signup card ════════════════════════════════════════ */}
          <div className="relative mx-auto flex w-full min-w-0 max-w-md flex-col lg:mx-0 lg:max-w-none">
            {/* The showcase panel is desktop-only, so small screens get the
                brand + illustration as a banner above the form instead. */}
            <div className="mb-4 lg:hidden">
              <div className="flex items-center gap-2.5">
                <RentEaseLogo size={40} />
                <div>
                  <p className="text-base font-bold leading-none text-foreground">RentEase</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Rent more. Own less.</p>
                </div>
              </div>

              <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-2xl ring-1 ring-border">
                <Image
                  src="/images/rental-login-hero.png"
                  alt="Renting furniture, electronics and appliances made easy"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </div>

            <CardAura />
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}
