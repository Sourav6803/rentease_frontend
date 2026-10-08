'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/useToast'
import { authApi } from '@/lib/api/auth'

// Shared design tokens (matches RentEase Flipkart-style light-mode system)
const PRIMARY_BTN =
  'bg-[linear-gradient(135deg,var(--brand-gradient-from),var(--brand-gradient-to))] hover:opacity-90'

const formVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut', staggerChildren: 0.05 },
  },
}

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

function PasswordStrength({ password }: { password: string }) {
  const score = useMemo(() => {
    let s = 0
    if (password.length >= 6) s++
    if (password.length >= 10) s++
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return Math.min(s, 4)
  }, [password])

  if (!password) return null

  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-blue-500', 'bg-emerald-500']

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? colors[score - 1] : 'bg-muted'
            }`}
          />
        ))}
      </div>
      {score > 0 && <p className="text-xs text-muted-foreground">{labels[score - 1]} password</p>}
    </div>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const passwordOk = useMemo(() => password.trim().length >= 6, [password])
  const phoneOk = useMemo(() => /^[6-9]\d{9}$/.test(phone.trim()), [phone])
  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email])
  const namesOk = useMemo(
    () => firstName.trim().length >= 2 && lastName.trim().length >= 2,
    [firstName, lastName]
  )
  const passwordsMatch = useMemo(
    () => password.length > 0 && password === confirmPassword,
    [password, confirmPassword]
  )

  const canSubmit = useMemo(() => {
    if (!emailOk || !phoneOk || !passwordOk || !namesOk) return false
    if (password !== confirmPassword) return false
    if (!agreedToTerms) return false
    return true
  }, [emailOk, phoneOk, passwordOk, namesOk, password, confirmPassword, agreedToTerms])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage('')
    if (!canSubmit) return

    try {
      setIsSubmitting(true)

      await authApi.register({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: 'user',
      })

      toast.success('Account created! Please verify your email.')
      router.push('/login')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to register'
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="show"
      className="form-scope relative flex w-full flex-1 flex-col justify-center rounded-3xl border border-border bg-card p-7 shadow-xl shadow-black/5 sm:p-9 lg:max-w-none"
    >
      <motion.div variants={fieldVariants} className="mb-7 flex items-start justify-between">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h2>
          <p className="text-sm text-muted-foreground">
            Join RentEase to rent furniture &amp; appliances on flexible monthly plans.
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div variants={fieldVariants} className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="Rahul"
              value={firstName}
              onChange={(ev) => setFirstName(ev.target.value)}
              autoComplete="given-name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Sharma"
              value={lastName}
              onChange={(ev) => setLastName(ev.target.value)}
              autoComplete="family-name"
              required
            />
          </div>
        </motion.div>

        <motion.div variants={fieldVariants} className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              autoComplete="email"
              className="pl-9"
              required
            />
          </div>
        </motion.div>

        <motion.div variants={fieldVariants} className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              +91
            </span>
            <Input
              id="phone"
              type="tel"
              placeholder="10-digit mobile"
              value={phone}
              onChange={(ev) => setPhone(ev.target.value.replace(/\D/g, '').slice(0, 10))}
              autoComplete="tel"
              className="pl-16"
              required
            />
          </div>
        </motion.div>

        <motion.div variants={fieldVariants} className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 6 characters"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              autoComplete="new-password"
              className="pl-9 pr-9"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </motion.div>

        <motion.div variants={fieldVariants} className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
              autoComplete="new-password"
              className={`pl-9 pr-9 ${confirmPassword && !passwordsMatch ? 'ring-1 ring-red-300' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-600"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch ? (
            <p className="text-xs text-red-500">Passwords don&apos;t match</p>
          ) : null}
        </motion.div>

        <motion.div variants={fieldVariants} className="flex items-start gap-2.5 pt-1">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(v) => setAgreedToTerms(v === true)}
            className="mt-0.5"
          />
          <Label
            htmlFor="terms"
            className="flex min-w-0 flex-col gap-2 text-xs font-normal leading-relaxed text-muted-foreground"
          >
            <span>I agree to RentEase&apos;s</span>

            {/* Separate chips so the two policy names keep their own tap
                targets and can never wrap mid-phrase on a narrow screen. */}
            <span className="flex flex-wrap items-center gap-2">
              <Link
                href="/terms"
                className="inline-flex items-center whitespace-nowrap rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-[11px] font-semibold text-brand transition-colors hover:border-brand/40 hover:bg-brand-soft"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center whitespace-nowrap rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-[11px] font-semibold text-brand transition-colors hover:border-brand/40 hover:bg-brand-soft"
              >
                Privacy Policy
              </Link>
            </span>
          </Label>
        </motion.div>

        {errorMessage ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errorMessage}
          </motion.p>
        ) : null}

        <motion.div variants={fieldVariants}>
          <Button
            type="submit"
            className={`w-full ${PRIMARY_BTN} text-white shadow-sm transition-shadow hover:shadow-md disabled:opacity-60`}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </Button>
        </motion.div>
      </form>

      <motion.div
        variants={fieldVariants}
        className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        Your data is encrypted and never shared
      </motion.div>

      <motion.p variants={fieldVariants} className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand underline-offset-4 hover:underline">
          Login
        </Link>
      </motion.p>
    </motion.div>
  )
}