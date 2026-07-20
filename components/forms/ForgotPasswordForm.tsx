'use client'

import Link from 'next/link'
import { FormEvent, useMemo, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  MailCheck,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/useToast'
import { authApi } from '@/lib/api/auth'

// Shared design tokens (matches RentEase Flipkart-style light-mode system)
const PRIMARY_BTN =
  'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'

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

export function ForgotPasswordForm() {
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage('')
    if (!emailOk || isSubmitting) return

    try {
      setIsSubmitting(true)
      await authApi.forgotPassword({ email: email.trim().toLowerCase() })
      setSubmitted(true)
      toast.success('Reset link sent! Check your inbox.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send reset link'
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-7 text-center shadow-xl shadow-slate-900/5 sm:p-9"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"
        >
          <MailCheck className="h-8 w-8 text-emerald-500" />
        </motion.div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Check your email</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          If an account exists for <span className="font-medium text-slate-700">{email.trim()}</span>,
          we&apos;ve sent a password reset link. The link is valid for{' '}
          <span className="font-medium text-slate-700">10 minutes</span>.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
          <p className="text-xs font-medium text-slate-700">Didn&apos;t get the email?</p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
              Check your spam or junk folder
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
              Make sure you entered the email you registered with
            </li>
          </ul>
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-6 w-full"
          onClick={() => setSubmitted(false)}
        >
          Try a different email
        </Button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-medium text-blue-600 underline-offset-4 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9"
    >
      <motion.div variants={fieldVariants} className="mb-7 flex items-start justify-between">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Forgot password?</h2>
          <p className="text-sm text-muted-foreground">
            No worries — enter your registered email and we&apos;ll send you a reset link.
          </p>
        </div>
        <div className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:flex ${PRIMARY_BTN}`}>
          <KeyRound className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div variants={fieldVariants} className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              autoComplete="email"
              className="pl-9"
              autoFocus
              required
            />
          </div>
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
            disabled={!emailOk || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending reset link...
              </span>
            ) : (
              'Send reset link'
            )}
          </Button>
        </motion.div>
      </form>

      <motion.div
        variants={fieldVariants}
        className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        Reset links expire after 10 minutes for your security
      </motion.div>

      <motion.p variants={fieldVariants} className="mt-4 text-center text-sm text-muted-foreground">
        Remembered your password?{' '}
        <Link href="/login" className="font-medium text-blue-600 underline-offset-4 hover:underline">
          Back to login
        </Link>
      </motion.p>
    </motion.div>
  )
}
