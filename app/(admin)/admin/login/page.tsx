'use client'

// app/(admin)/admin/login/page.tsx
//
// Admin console sign-in. Shares the visual language of the customer (/login) and
// vendor (/vendor/login) screens: brand-token driven, blue gradient showcase
// panel + shadcn login card, with the shared RoleSelector. Supporting content
// (trust strip, capability grid, footer) sits below the fold.

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail, Smartphone, Lock, Eye, EyeOff, Loader2, AlertCircle, Shield, ShieldCheck,
  ArrowRight, Clock, CheckCircle2, Zap, Headphones, Award, Users, Package,
  TrendingUp, ShoppingBag, Wallet, Activity, Truck, RefreshCcw, MapPin,
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
const loginSchema = z
  .object({
    email: z.string().email('Invalid email address').or(z.literal('')).optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').or(z.literal('')).optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email'],
  })

type LoginFormValues = z.infer<typeof loginSchema>

const BRAND_GRADIENT =
  'bg-[linear-gradient(135deg,var(--brand-gradient-from),var(--brand-gradient-to))]'
const BRAND_SOFT_SHADOW = 'shadow-[0_16px_40px_-14px_var(--brand)]'

// ── Platform snapshot ─────────────────────────────────────────────────────────
const adminStats = [
  { label: 'Active Vendors', value: '2,345', change: '+12.5%', icon: Users },
  { label: 'Products Listed', value: '12,456', change: '+23.1%', icon: Package },
  { label: 'Monthly Revenue', value: '₹45.2L', change: '+18.7%', icon: TrendingUp },
  { label: 'Active Rentals', value: '3,421', change: '+8.3%', icon: ShoppingBag },
]

// ── Why RentEase Admin? ───────────────────────────────────────────────────────
const highlights = [
  { icon: Zap, title: 'Instant Analytics', desc: 'Real-time platform insights' },
  { icon: Shield, title: 'Secure Access', desc: 'Enterprise-grade protection' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always-on operations team' },
  { icon: Award, title: 'Top Rated', desc: '#1 rental management platform' },
]

// ── Trust strip ───────────────────────────────────────────────────────────────
const trustBadges = [
  { icon: Truck, text: 'Pan-India Coverage' },
  { icon: RefreshCcw, text: 'Real-time Sync' },
  { icon: MapPin, text: '500+ Cities' },
  { icon: Award, text: 'Trusted by 2,000+ Vendors' },
]

const recentActivity = [
  { text: 'Vendor "TechRent Delhi" onboarded', time: '2m ago', dot: '#00b96b' },
  { text: 'Payout of ₹1.2L processed', time: '18m ago', dot: '#2874f0' },
  { text: '47 new rental orders today', time: '1h ago', dot: '#ff9f00' },
  { text: 'Platform uptime: 99.97%', time: '2h ago', dot: '#00b96b' },
]

const securedBadges = [
  { icon: Shield, label: '256-bit SSL' },
  { icon: CheckCircle2, label: '2FA Ready' },
  { icon: Clock, label: 'Auto Logout' },
]

const glanceStats = [
  { label: 'Vendors', value: '2.3K+' },
  { label: 'Cities', value: '500+' },
  { label: 'Uptime', value: '99.9%' },
]

// ── Live activity ticker ──────────────────────────────────────────────────────
function ActivityTicker() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % recentActivity.length), 3500)
    return () => clearInterval(t)
  }, [])

  const item = recentActivity[idx]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-1.5">
        <Activity className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/80">
          Live Activity
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2.5"
        >
          <span className="relative flex h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.dot }}>
            <span
              className="absolute inline-flex h-2 w-2 animate-ping rounded-full opacity-60"
              style={{ backgroundColor: item.dot }}
            />
          </span>
          <p className="flex-1 truncate text-[12px] text-white/90">{item.text}</p>
          <span className="shrink-0 text-[10px] text-white/55">{item.time}</span>
        </motion.div>
      </AnimatePresence>

      <div className="mt-2.5 flex gap-1.5">
        {recentActivity.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`View activity ${i + 1}`}
            className={cn(
              'h-1 rounded-full transition-all',
              i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50',
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ── Sticky console header ─────────────────────────────────────────────────────
function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-7">
        <div className="flex items-center gap-2.5">
          <RentEaseLogo size={34} withRing />
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-foreground">RentEase</span>
            <span className="hidden text-[11px] font-medium text-muted-foreground sm:inline">
              Admin Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="mailto:support@rentease.com"
            className="hidden items-center gap-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-brand md:flex"
          >
            <Headphones className="h-3.5 w-3.5" /> support@rentease.com
          </a>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold text-emerald-700">All Systems Operational</span>
          </div>
        </div>
      </div>
    </header>
  )
}

// ── Amber trust strip — sticks directly under the header ─────────────────────
function TrustStrip() {
  return (
    <div className="sticky top-16 z-40 border-b border-amber-200/70 bg-amber-50/85 px-6 py-2.5 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-x-9 gap-y-2">
        {trustBadges.map((b) => (
          <div key={b.text} className="flex items-center gap-1.5">
            <b.icon className="h-3.5 w-3.5 text-amber-700" />
            <span className="text-[11px] font-bold text-amber-800">{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  const router = useRouter()
  const toast = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email')
  const [mounted, setMounted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', phone: '', password: '' },
    mode: 'onChange',
    shouldUnregister: false,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Switching tab clears the other identifier. We deliberately do NOT force
  // validation here — doing so showed "Either email or phone is required" the
  // instant the page loaded, before the user had typed anything.
  const switchTab = (tab: 'email' | 'phone') => {
    if (tab === activeTab) return
    setActiveTab(tab)
    setValue(tab === 'email' ? 'phone' : 'email', '')
  }

  const watchEmail = watch('email')
  const watchPhone = watch('phone')
  const watchPassword = watch('password')

  // Mirror the other login screens: the CTA lights up only once the form is valid.
  const canSubmit =
    !isLoading &&
    (watchPassword || '').length >= 6 &&
    (activeTab === 'email'
      ? /^\S+@\S+\.\S+$/.test(watchEmail || '')
      : /^[6-9]\d{9}$/.test(watchPhone || ''))

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      if (activeTab === 'email' && !data.email) throw new Error('Please enter your email address')
      if (activeTab === 'phone' && !data.phone) throw new Error('Please enter your phone number')

      const credentials: Record<string, string | boolean> = {
        password: data.password,
        loginType: 'super_admin',
        redirect: false,
        callbackUrl: '/admin/dashboard',
      }
      if (activeTab === 'email') credentials.email = data.email as string
      else credentials.phone = data.phone as string

      const result = await signIn('credentials', credentials)
      if (result?.error) {
        throw new Error(result.error === 'CredentialsSignin' ? 'Invalid credentials' : result.error)
      }
      if (!result?.ok) throw new Error('Login failed. Please try again.')

      toast.success('Login successful!', { description: 'Redirecting to dashboard…' })
      if (rememberMe) localStorage.setItem('admin_remember_me', 'true')
      else localStorage.removeItem('admin_remember_me')
      router.replace('/admin/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid credentials.'
      toast.error('Login failed', { description: message })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative bg-background">
        {/* Colourful wash spans the header + hero screenful */}
        <AuroraBackdrop className="h-screen" />

        <AdminHeader />
        <TrustStrip />

        {/* ══ HERO — admin panel + login card ════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div className="relative mx-auto flex min-h-[calc(100vh-6.5rem)] w-full items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid w-full max-w-[1400px] items-stretch gap-6 lg:grid-cols-2 lg:gap-7">
              {/* ── LEFT — admin brand panel ── */}
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
                      <p className="text-lg font-bold leading-none">RentEase</p>
                      <p className="text-xs text-white/70">Admin Console</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/20">
                      <Award className="h-3 w-3 text-[var(--brand-accent)]" />
                      India&apos;s #1 Rental Platform
                    </span>
                    <h1 className="text-[1.75rem] font-bold leading-[1.15]">
                      Power your rental
                      <br />
                      <span className="text-[var(--brand-accent)]">business forward.</span>
                    </h1>
                    <p className="max-w-sm text-sm text-white/75">
                      Complete control over vendors, inventory, payments, and analytics — all in one
                      intelligent dashboard built for scale.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {highlights.map((h, index) => (
                      <motion.span
                        key={h.title}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + index * 0.07 }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium text-white ring-1 ring-white/20"
                      >
                        <h.icon className="h-3.5 w-3.5" />
                        {h.title}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 my-4 flex min-h-0 flex-1 items-center justify-center">
                  <div className="relative h-[12.5rem] w-full max-w-[24rem]">
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2">
                      <RentCycleArt />
                    </div>

                    <div className="relative h-full w-full overflow-hidden rounded-3xl ring-1 ring-white/25 shadow-2xl shadow-black/25">
                      <Image
                        src="/images/admin-login-hero.png"
                        alt="An administrator managing the RentEase platform dashboard"
                        fill
                        priority
                        sizes="(min-width: 1024px) 46vw, 100vw"
                        className="object-cover"
                      />
                      <div className={cn('absolute inset-x-0 top-0 h-1', BRAND_GRADIENT)} />
                    </div>

                    <FloatingRentalTile icon={Users} label="Vendors" delay={0.3} className="-left-5 top-7" />
                    <FloatingRentalTile icon={Package} compact delay={0.6} className="-right-4 top-3" />
                    <FloatingRentalTile icon={Wallet} label="Payouts" delay={0.9} float={11} className="-right-6 bottom-8" />
                    <FloatingRentalTile icon={ShieldCheck} compact delay={1.2} className="-left-4 bottom-5" />
                  </div>
                </div>

                <div className="relative z-10 space-y-2.5">
                  <div className="grid grid-cols-4 gap-2 border-t border-white/15 pt-3.5">
                    {adminStats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="mb-1 flex items-center gap-1">
                          <stat.icon className="h-3.5 w-3.5 text-white/60" />
                          <span className="rounded-full bg-emerald-400/15 px-1.5 py-px text-[9px] font-bold text-emerald-200">
                            {stat.change}
                          </span>
                        </div>
                        <p className="text-base font-bold tabular-nums text-white">{stat.value}</p>
                        <p className="mt-0.5 text-[10px] font-medium text-white/70">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  <ActivityTicker />

                  <DeliveryRouteArt className="opacity-70" />
                </div>
              </motion.div>

              {/* ── RIGHT — admin login card ── */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="relative mx-auto flex w-full min-w-0 max-w-md flex-col lg:mx-0 lg:max-w-none"
              >
                <div className="mb-4 lg:hidden">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl ring-1 ring-border">
                    <Image
                      src="/images/admin-login-hero.png"
                      alt="An administrator managing the RentEase platform dashboard"
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                <CardAura />
                <Card className="relative flex flex-1 flex-col overflow-hidden rounded-2xl" style={GRADIENT_CARD_STYLE}>

                  <CardHeader className="space-y-2 pb-4">
                    <CardTitle className="text-center text-2xl lg:text-left">Admin Sign In</CardTitle>
                    <CardDescription className="text-center lg:text-left">
                      Secure · Encrypted · Role-based access
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col justify-center">
                    <p className="mb-5 text-center text-xs text-muted-foreground lg:text-left">
                      Enter your credentials to access the RentEase management console.
                    </p>

                    <RoleSelector active="admin" />

                    {/* Email / Phone toggle */}
                    <div className="relative mb-6 grid grid-cols-2 rounded-xl bg-muted p-1">
                      <motion.div
                        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-lg bg-card shadow-sm"
                        animate={{ x: activeTab === 'email' ? 4 : 'calc(100% + 4px)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                      {(['email', 'phone'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => switchTab(tab)}
                          aria-pressed={activeTab === tab}
                          className={cn(
                            'relative z-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            activeTab === tab
                              ? 'text-brand'
                              : 'text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {tab === 'email' ? (
                            <Mail className="mr-2 inline-block h-4 w-4" />
                          ) : (
                            <Smartphone className="mr-2 inline-block h-4 w-4" />
                          )}
                          {tab === 'email' ? 'Email' : 'Phone'}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                      <div className="space-y-2">
                        <Label htmlFor="admin-identifier" className="text-foreground">
                          {activeTab === 'email' ? 'Email Address' : 'Phone Number'}
                        </Label>
                        <AnimatePresence mode="wait">
                          {activeTab === 'email' ? (
                            <motion.div
                              key="admin-email"
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 8 }}
                              transition={{ duration: 0.15 }}
                              className="relative"
                            >
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="admin-identifier"
                                type="email"
                                placeholder="admin@rentease.com"
                                className={cn(
                                  'pl-10 transition-shadow focus-visible:ring-brand',
                                  errors.email && 'border-red-400 focus-visible:ring-red-300',
                                )}
                                autoComplete="email"
                                disabled={isLoading}
                                {...register('email')}
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="admin-phone"
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 8 }}
                              transition={{ duration: 0.15 }}
                              className="relative"
                            >
                              <span className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-muted-foreground">
                                <Smartphone className="h-4 w-4" />
                                <span className="text-xs font-bold">+91</span>
                                <span className="h-3 w-px bg-border" />
                              </span>
                              <Input
                                id="admin-identifier"
                                type="tel"
                                placeholder="9876543210"
                                className={cn(
                                  'pl-[4.5rem] transition-shadow focus-visible:ring-brand',
                                  errors.phone && 'border-red-400 focus-visible:ring-red-300',
                                )}
                                autoComplete="tel"
                                disabled={isLoading}
                                {...register('phone')}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {(errors.email || errors.phone) && (
                          <p className="flex items-center gap-1 text-[11px] text-red-500">
                            <AlertCircle className="h-3 w-3" />
                            {activeTab === 'email' ? errors.email?.message : errors.phone?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="admin-password" className="text-foreground">
                            Password
                          </Label>
                          <a
                            href="/admin/forgot-password"
                            className="text-[11px] font-semibold text-brand hover:underline"
                          >
                            Forgot?
                          </a>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="admin-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className={cn(
                              'pl-10 pr-10 transition-shadow focus-visible:ring-brand',
                              errors.password && 'border-red-400 focus-visible:ring-red-300',
                            )}
                            autoComplete="current-password"
                            disabled={isLoading}
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

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="admin-remember"
                          checked={rememberMe}
                          onCheckedChange={(v) => setRememberMe(v as boolean)}
                          disabled={isLoading}
                          className="border-border data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                        />
                        <label
                          htmlFor="admin-remember"
                          className="cursor-pointer select-none text-sm text-muted-foreground"
                        >
                          Keep me signed in for 30 days
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
                            Authenticating…
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Sign in to Dashboard
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-card px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                            Secured
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center gap-4">
                        {securedBadges.map((b) => (
                          <div key={b.label} className="flex items-center gap-1.5">
                            <b.icon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              {b.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </form>

                    <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-3">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                        Platform at a Glance
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {glanceStats.map((s) => (
                          <div
                            key={s.label}
                            className="rounded-xl border border-brand/15 bg-brand-soft px-2 py-2 text-center"
                          >
                            <p className="text-base font-extrabold text-brand">{s.value}</p>
                            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                              {s.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ WHY RENTEASE ADMIN? ═════════════════════════════════════════════ */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-8 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
                <ShieldCheck className="h-3 w-3" /> Console
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-foreground lg:text-3xl">
                Why RentEase Admin?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Built for teams running a nationwide rental operation — with the controls to match.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((h, i) => {
                const Icon = h.icon
                return (
                  <motion.div
                    key={h.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.45 }}
                    className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-lg"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">{h.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{h.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
        <footer className="border-t border-border bg-card px-6 py-6">
          <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <RentEaseLogo size={28} />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">RentEase</span>
                <span className="text-[10px] text-muted-foreground">
                  © 2025 RentEase Technologies Pvt. Ltd.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {[
                ['Terms', '/terms'],
                ['Privacy', '/privacy'],
                ['Security', '/security'],
                ['Status', '/status'],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="text-[11px] font-semibold text-muted-foreground transition-colors hover:text-brand"
                >
                  {label}
                </a>
              ))}
              <a
                href="mailto:support@rentease.com"
                className="text-[11px] font-semibold text-brand hover:underline"
              >
                support@rentease.com
              </a>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5">
              <ShieldCheck className="h-3 w-3 text-brand" />
              <span className="text-[10px] font-bold text-muted-foreground">
                PCI-DSS L1 · ISO 27001
              </span>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  )
}
