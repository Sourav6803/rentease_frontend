'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff, Shield, ArrowRight, Smartphone, User,
  CheckCircle2, Loader2, Clock, Star, Bike, Camera, Laptop,
  Refrigerator, Sofa, Sparkles, Quote, BadgeCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/useToast'
import { DeliveryRouteArt, FloatingRentalTile, RentCycleArt } from '@/components/forms/login/RentalLoginArt'
import { RoleSelector } from '@/components/forms/login/RoleSelector'
import { RentEaseLogo } from '@/components/brand/RentEaseLogo'
import {
  AuroraBackdrop,
  CardAura,
  GRADIENT_CARD_STYLE,
} from '@/components/forms/login/AuroraBackdrop'
import {
  GOOGLE_LOGIN_ENABLED,
  GoogleSignInButton,
} from '@/components/forms/login/SocialLoginButtons'

type LoginMode = 'email' | 'phone'

// Theme-adaptive brand helpers — these follow --brand tokens, so the page re-skins
// with the site's accent switcher instead of hard-coding a colour.
const BRAND_GRADIENT =
  'bg-[linear-gradient(135deg,var(--brand-gradient-from),var(--brand-gradient-to))]'
const BRAND_SOFT_SHADOW = 'shadow-[0_16px_40px_-14px_var(--brand)]'

// What people rent — the signature category strip.
const RENTAL_CATEGORIES = [
  { icon: Sofa, label: 'Furniture' },
  { icon: Laptop, label: 'Electronics' },
  { icon: Refrigerator, label: 'Appliances' },
  { icon: Camera, label: 'Cameras' },
  { icon: Bike, label: 'Bikes' },
]

const TRUST_STATS = [
  { label: 'Happy renters', value: 52000, suffix: '+' },
  { label: 'Products listed', value: 12500, suffix: '+' },
  { label: 'Cities covered', value: 480, suffix: '+' },
]

const TESTIMONIALS = [
  {
    name: 'Rahul Mehta',
    role: 'Verified renter',
    content: 'Rented a laptop for my WFH setup — smooth delivery and great condition.',
    rating: 5,
  },
  {
    name: 'Sneha Sharma',
    role: 'Premium member',
    content: 'The rental process is so easy. I can upgrade my furniture anytime.',
    rating: 5,
  },
  {
    name: 'Vikram Singh',
    role: 'Regular customer',
    content: 'Best rental platform in India. Support is quick and genuinely helpful.',
    rating: 5,
  },
]

// Lightweight count-up hook for the trust stats.
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
      setValue(Math.floor(eased * target))
      if (progress < 1) rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration, start])

  return value
}

function TrustStat({
  value,
  suffix,
  label,
  delay,
}: {
  value: number
  suffix: string
  label: string
  delay: number
}) {
  const [started, setStarted] = useState(false)
  const count = useCountUp(value, 1600, started)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div>
      <p className="text-base font-bold tabular-nums text-white">
        {count.toLocaleString('en-IN')}
        {suffix}
      </p>
      <p className="mt-0.5 text-[11px] text-white/70">{label}</p>
    </div>
  )
}

export function LoginForm() {
  const router = useRouter()
  const toast = useToast()

  const [mode, setMode] = useState<LoginMode>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [justSucceeded, setJustSucceeded] = useState(false)
  const [callbackUrl, setCallbackUrl] = useState('/')

  // Honour the ?callbackUrl= the middleware attaches, so a user bounced here from a
  // protected page returns to that page instead of the homepage.
  useEffect(() => {
    try {
      const cb = new URLSearchParams(window.location.search).get('callbackUrl')
      if (cb && cb.startsWith('/')) setCallbackUrl(cb)
    } catch {
      /* ignore */
    }
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Restore a remembered identifier (email/phone only — never the password)
  useEffect(() => {
    const savedLogin = localStorage.getItem('user_saved_login')
    if (!savedLogin) return
    try {
      const { email: savedEmail, phone: savedPhone, remember } = JSON.parse(savedLogin)
      if (!remember) return
      if (savedEmail) {
        setEmail(savedEmail)
        setMode('email')
      } else if (savedPhone) {
        setPhone(savedPhone)
        setMode('phone')
      }
      setRememberMe(true)
    } catch {
      /* ignore corrupt storage */
    }
  }, [])

  const canSubmit = useMemo(() => {
    const hasIdentifier =
      mode === 'email'
        ? email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        : /^[6-9]\d{9}$/.test(phone.trim())
    return hasIdentifier && password.trim().length >= 6 && !isLoading
  }, [mode, email, phone, password, isLoading])

  const onSubmit = async () => {
    setIsLoading(true)

    try {
      if (mode === 'email' && !email.trim()) {
        toast.error('Validation Error', { description: 'Please enter your email address' })
        setIsLoading(false)
        return
      }

      if (mode === 'phone' && !phone.trim()) {
        toast.error('Validation Error', { description: 'Please enter your phone number' })
        setIsLoading(false)
        return
      }

      if (!password || password.length < 6) {
        toast.error('Validation Error', { description: 'Password must be at least 6 characters' })
        setIsLoading(false)
        return
      }

      const credentials: Record<string, string | boolean> = {
        password: password.trim(),
        loginType: 'user',
        redirect: false,
        callbackUrl,
      }

      if (mode === 'email') {
        credentials.email = email.trim().toLowerCase()
      } else {
        credentials.phone = phone.trim()
      }

      const result = await signIn('credentials', credentials)

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          throw new Error('Invalid email/phone or password')
        } else if (result.error === 'AccessDenied') {
          throw new Error('Account access denied. Please contact support.')
        } else {
          throw new Error(result.error)
        }
      }

      if (!result?.ok) {
        throw new Error('Login failed. Please try again.')
      }

      toast.success('Login successful!', {
        description: 'Redirecting you now…',
      })

      if (rememberMe) {
        localStorage.setItem(
          'user_saved_login',
          JSON.stringify({
            email: mode === 'email' ? email.trim() : '',
            phone: mode === 'phone' ? phone.trim() : '',
            remember: true,
          }),
        )
      } else {
        localStorage.removeItem('user_saved_login')
      }

      // Brief success moment before navigating away
      setJustSucceeded(true)

      setTimeout(() => {
        router.replace(callbackUrl)
        router.refresh()
      }, 700)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid credentials. Please try again.'
      toast.error('Login failed', { description: message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-0 h-screen w-screen overflow-x-hidden overflow-y-auto bg-background">
        {/* ── Colourful ambient background ───────────────────────────────── */}
        <AuroraBackdrop />

        <div className="relative mx-auto flex min-h-screen w-full items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid w-full max-w-[1400px] items-stretch gap-6 lg:grid-cols-2 lg:gap-7">
            {/* ══ LEFT — brand panel (desktop) ══════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className={`relative hidden overflow-hidden rounded-[2rem] p-6 text-white lg:flex lg:flex-col ${BRAND_GRADIENT} ${BRAND_SOFT_SHADOW}`}
            >
              {/* faint grid + glows */}
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

              {/* ── A · brand + headline ── */}
              <div className="relative z-10 space-y-2.5">
                <div className="flex items-center gap-3">
                  <RentEaseLogo size={44} withRing />
                  <div>
                    <p className="text-lg font-bold leading-none">RentEase</p>
                    <p className="text-xs text-white/70">Rent more. Own less.</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/20">
                    <Sparkles className="h-3 w-3" />
                    Premium rentals
                  </span>
                  <h1 className="text-[1.75rem] font-bold leading-[1.15]">
                    Everything you need,
                    <br />
                    <span className="text-white/80">on affordable rent.</span>
                  </h1>
                  <p className="max-w-sm text-sm text-white/75">
                    Furniture, electronics and appliances delivered to your door — flexible monthly plans,
                    no big upfront cost.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {RENTAL_CATEGORIES.map((category, index) => (
                    <motion.span
                      key={category.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + index * 0.07 }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium text-white ring-1 ring-white/20"
                    >
                      <category.icon className="h-3.5 w-3.5" />
                      {category.label}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* ── B · hero illustration ── */}
              <div className="relative z-10 my-4 flex min-h-0 flex-1 items-center justify-center">
                <div className="relative h-[12.5rem] w-full max-w-[24rem]">
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2">
                    <RentCycleArt />
                  </div>

                  <div className="relative h-full w-full overflow-hidden rounded-3xl ring-1 ring-white/25 shadow-2xl shadow-black/25">
                    <Image
                      src="/images/rental-login-hero.png"
                      alt="Renting furniture, electronics and appliances made easy"
                      fill
                      priority
                      sizes="(min-width: 1024px) 46vw, 100vw"
                      className="object-cover"
                    />
                    <div className={`absolute inset-x-0 top-0 h-1 ${BRAND_GRADIENT}`} />
                  </div>

                  {/* floating rental tiles */}
                  <FloatingRentalTile icon={Sofa} label="Rent a sofa" delay={0.3} className="-left-5 top-8" />
                  <FloatingRentalTile icon={Bike} compact delay={0.6} className="-right-4 top-4" />
                  <FloatingRentalTile icon={Laptop} label="From ₹499/mo" delay={0.9} float={11} className="-right-6 bottom-10" />
                  <FloatingRentalTile icon={Refrigerator} compact delay={1.2} className="-left-4 bottom-6" />
                </div>
              </div>

              {/* ── C · stats, route & testimonial ── */}
              <div className="relative z-10 space-y-2.5">
                <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-3.5">
                  {TRUST_STATS.map((stat, index) => (
                    <TrustStat
                      key={stat.label}
                      value={stat.value}
                      suffix={stat.suffix}
                      label={stat.label}
                      delay={200 + index * 150}
                    />
                  ))}
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/15 backdrop-blur-sm">
                  <Quote className="absolute right-3 top-3 h-7 w-7 text-white/15" />
                  <motion.div
                    key={currentTestimonial}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10"
                  >
                      <div className="mb-2 flex gap-0.5">
                        {[...Array(TESTIMONIALS[currentTestimonial].rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-white text-white" />
                        ))}
                      </div>
                      <p className="text-[13px] italic text-white/85">
                        &ldquo;{TESTIMONIALS[currentTestimonial].content}&rdquo;
                      </p>
                      <div className="mt-3 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 ring-1 ring-white/30">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {TESTIMONIALS[currentTestimonial].name}
                          </p>
                          <p className="text-[10px] text-white/60">
                            {TESTIMONIALS[currentTestimonial].role}
                          </p>
                        </div>
                      </div>
                  </motion.div>

                  <div className="mt-3 flex gap-1.5">
                    {TESTIMONIALS.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentTestimonial(idx)}
                        className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/20"
                        aria-label={`View testimonial ${idx + 1}`}
                      >
                        {idx === currentTestimonial && (
                          <motion.span
                            key={currentTestimonial}
                            className="absolute inset-y-0 left-0 rounded-full bg-white"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 5, ease: 'linear' }}
                          />
                        )}
                        {idx < currentTestimonial && (
                          <span className="absolute inset-0 rounded-full bg-white/70" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <DeliveryRouteArt className="opacity-70" />
              </div>
            </motion.div>

            {/* ══ RIGHT — login card ════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative mx-auto flex w-full min-w-0 max-w-md flex-col lg:mx-0 lg:max-w-none"
            >
              {/* Mobile brand + illustration banner */}
              <div className="mb-4 lg:hidden">
                <div className="flex items-center gap-2.5">
                  <RentEaseLogo size={40} />
                  <div>
                    <p className="text-base font-bold leading-none text-foreground">RentEase</p>
                    <p className="text-[11px] text-muted-foreground">Rent more. Own less.</p>
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
              <Card className="relative flex flex-1 flex-col overflow-hidden rounded-2xl" style={GRADIENT_CARD_STYLE}>

                {/* success overlay */}
                <AnimatePresence>
                  {justSucceeded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-card/95 backdrop-blur-sm"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600"
                      >
                        <CheckCircle2 className="h-9 w-9 text-white" />
                      </motion.div>
                      <p className="font-medium text-foreground">Welcome back!</p>
                      <p className="text-sm text-muted-foreground">Taking you to your dashboard…</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <CardHeader className="space-y-2 pb-5">
                  <CardTitle className="text-center text-2xl lg:text-left">Welcome back</CardTitle>
                  <CardDescription className="text-center lg:text-left">
                    Log in to manage your rentals, payments and profile.
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col justify-center">
                  {/* ── Portal / role selection ── */}
                  <RoleSelector active="user" />

                  {/* ── Social sign-in — renders only when Google is configured ── */}
                  {GOOGLE_LOGIN_ENABLED && (
                    <div className="mb-5 space-y-4">
                      <GoogleSignInButton />
                      <div className="flex items-center gap-3">
                        <span className="h-px flex-1 bg-border" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          or continue with email
                        </span>
                        <span className="h-px flex-1 bg-border" />
                      </div>
                    </div>
                  )}

                  {/* ── Email / Phone toggle ── */}
                  <div className="relative mb-6 grid grid-cols-2 rounded-xl bg-muted p-1">
                    <motion.div
                      className="absolute inset-y-1 w-[calc(50%-4px)] rounded-lg bg-card shadow-sm"
                      animate={{ x: mode === 'email' ? 4 : 'calc(100% + 4px)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                    <button
                      type="button"
                      onClick={() => setMode('email')}
                      aria-pressed={mode === 'email'}
                      className={`relative z-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        mode === 'email' ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Mail className="mr-2 inline-block h-4 w-4" />
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('phone')}
                      aria-pressed={mode === 'phone'}
                      className={`relative z-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        mode === 'phone' ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Smartphone className="mr-2 inline-block h-4 w-4" />
                      Phone
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <AnimatePresence mode="wait">
                      {mode === 'email' ? (
                        <motion.div
                          key="email-field"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="email" className="text-foreground">
                            Email Address
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(event) => setEmail(event.target.value)}
                              className="pl-10 transition-shadow focus-visible:ring-brand"
                              autoComplete="email"
                              disabled={isLoading}
                              required
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="phone-field"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="phone" className="text-foreground">
                            Phone Number
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-muted-foreground">
                              <Smartphone className="h-4 w-4" />
                              <span className="text-xs font-bold">+91</span>
                              <span className="h-3 w-px bg-border" />
                            </span>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="9876543210"
                              value={phone}
                              onChange={(event) =>
                                setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))
                              }
                              className="pl-[4.5rem] transition-shadow focus-visible:ring-brand"
                              autoComplete="tel"
                              disabled={isLoading}
                              required
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="pl-10 pr-10 transition-shadow focus-visible:ring-brand"
                          autoComplete="current-password"
                          disabled={isLoading}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                          className="border-border data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                        />
                        <label
                          htmlFor="remember"
                          className="cursor-pointer select-none text-sm text-muted-foreground"
                        >
                          Remember me
                        </label>
                      </div>
                      <Link href="/forgot-password" className="text-sm font-medium text-brand hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <motion.div
                      whileHover={canSubmit ? { scale: 1.01 } : undefined}
                      whileTap={canSubmit ? { scale: 0.99 } : undefined}
                    >
                      <Button
                        type="submit"
                        className={`group w-full text-white transition-all ${BRAND_GRADIENT} ${BRAND_SOFT_SHADOW} hover:opacity-90 disabled:bg-none disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:shadow-none`}
                        disabled={!canSubmit}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign in
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">New to RentEase?</span>
                    </div>
                  </div>

                  <Link href="/register">
                    <Button
                      variant="outline"
                      className="w-full border-brand/30 text-brand hover:border-brand hover:bg-brand-soft"
                    >
                      Create an account
                    </Button>
                  </Link>

                  {/* Trust badges */}
                  <div className="mt-6 flex justify-center gap-4 border-t border-border pt-4">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      <span>256-bit SSL</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <BadgeCheck className="h-3 w-3" />
                      <span>Verified listings</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>24/7 Support</span>
                    </div>
                  </div>

                  <p className="mt-5 text-center text-xs text-muted-foreground">
                    Need help? Contact our support team at{' '}
                    <a href="mailto:support@rentease.com" className="font-medium text-brand hover:underline">
                      support@rentease.com
                    </a>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}
