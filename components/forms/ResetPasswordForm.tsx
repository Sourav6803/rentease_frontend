// 'use client'

// import Link from 'next/link'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { FormEvent, useMemo, useState } from 'react'
// import { motion, type Variants } from 'framer-motion'
// import {
//   ArrowLeft,
//   CheckCircle2,
//   Circle,
//   Eye,
//   EyeOff,
//   Loader2,
//   Lock,
//   LockKeyhole,
//   ShieldCheck,
//   TriangleAlert,
// } from 'lucide-react'

// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { useToast } from '@/hooks/useToast'
// import { authApi } from '@/lib/api/auth'

// // Shared design tokens (matches RentEase Flipkart-style light-mode system)
// const PRIMARY_BTN =
//   'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'

// const formVariants: Variants = {
//   hidden: { opacity: 0, y: 16 },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.45, ease: 'easeOut', staggerChildren: 0.05 },
//   },
// }

// const fieldVariants: Variants = {
//   hidden: { opacity: 0, y: 10 },
//   show: { opacity: 1, y: 0 },
// }

// // Mirrors backend password policy (validation.middleware.js commonValidators.password)
// const PASSWORD_RULES = [
//   { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
//   { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
//   { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
//   { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
//   { label: 'One special character (@$!%*?&)', test: (p: string) => /[@$!%*?&]/.test(p) },
// ]

// function PasswordChecklist({ password }: { password: string }) {
//   if (!password) return null

//   return (
//     <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
//       {PASSWORD_RULES.map((rule) => {
//         const ok = rule.test(password)
//         return (
//           <li
//             key={rule.label}
//             className={`flex items-center gap-1.5 text-xs transition-colors ${
//               ok ? 'text-emerald-600' : 'text-muted-foreground'
//             }`}
//           >
//             {ok ? (
//               <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
//             ) : (
//               <Circle className="h-3.5 w-3.5 shrink-0" />
//             )}
//             {rule.label}
//           </li>
//         )
//       })}
//     </ul>
//   )
// }

// export function ResetPasswordForm() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const toast = useToast()

//   const token = searchParams.get('token') ?? ''

//   const [password, setPassword] = useState('')
//   const [confirmPassword, setConfirmPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirm, setShowConfirm] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [succeeded, setSucceeded] = useState(false)
//   const [errorMessage, setErrorMessage] = useState('')

//   const passwordOk = useMemo(
//     () => PASSWORD_RULES.every((rule) => rule.test(password)),
//     [password]
//   )
//   const passwordsMatch = useMemo(
//     () => password.length > 0 && password === confirmPassword,
//     [password, confirmPassword]
//   )
//   const canSubmit = Boolean(token) && passwordOk && passwordsMatch && !isSubmitting

//   async function handleSubmit(e: FormEvent<HTMLFormElement>) {
//     e.preventDefault()
//     setErrorMessage('')
//     if (!canSubmit) return

//     try {
//       setIsSubmitting(true)
//       await authApi.resetPassword({ token, password, confirmPassword })
//       setSucceeded(true)
//       toast.success('Password reset successful! Please login.')
//       setTimeout(() => {
//         router.push('/login')
//         router.refresh()
//       }, 2000)
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Unable to reset password'
//       setErrorMessage(message)
//       toast.error(message)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   // Missing or empty token — the link is broken/incomplete
//   if (!token) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, scale: 0.97 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.35, ease: 'easeOut' }}
//         className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-7 text-center shadow-xl shadow-slate-900/5 sm:p-9"
//       >
//         <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
//           <TriangleAlert className="h-8 w-8 text-amber-500" />
//         </div>
//         <h2 className="text-2xl font-bold tracking-tight text-slate-900">Invalid reset link</h2>
//         <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
//           This password reset link is missing or malformed. Please request a new one — links
//           also expire after 10 minutes.
//         </p>
//         <Link href="/forgot-password">
//           <Button className={`mt-6 w-full ${PRIMARY_BTN} text-white`}>
//             Request a new link
//           </Button>
//         </Link>
//         <p className="mt-4 text-center text-sm text-muted-foreground">
//           <Link
//             href="/login"
//             className="inline-flex items-center gap-1 font-medium text-blue-600 underline-offset-4 hover:underline"
//           >
//             <ArrowLeft className="h-3.5 w-3.5" />
//             Back to login
//           </Link>
//         </p>
//       </motion.div>
//     )
//   }

//   if (succeeded) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, scale: 0.97 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.35, ease: 'easeOut' }}
//         className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-7 text-center shadow-xl shadow-slate-900/5 sm:p-9"
//       >
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
//           className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"
//         >
//           <CheckCircle2 className="h-8 w-8 text-emerald-500" />
//         </motion.div>
//         <h2 className="text-2xl font-bold tracking-tight text-slate-900">Password updated</h2>
//         <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
//           Your password has been reset successfully. Redirecting you to login…
//         </p>
//         <Link href="/login">
//           <Button className={`mt-6 w-full ${PRIMARY_BTN} text-white`}>
//             Continue to login
//           </Button>
//         </Link>
//       </motion.div>
//     )
//   }

//   return (
//     <motion.div
//       variants={formVariants}
//       initial="hidden"
//       animate="show"
//       className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9"
//     >
//       <motion.div variants={fieldVariants} className="mb-7 flex items-start justify-between">
//         <div className="space-y-1.5">
//           <h2 className="text-2xl font-bold tracking-tight text-slate-900">Set a new password</h2>
//           <p className="text-sm text-muted-foreground">
//             Choose a strong password you haven&apos;t used on RentEase before.
//           </p>
//         </div>
//         <div className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:flex ${PRIMARY_BTN}`}>
//           <LockKeyhole className="h-5 w-5 text-white" strokeWidth={2} />
//         </div>
//       </motion.div>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <motion.div variants={fieldVariants} className="space-y-1.5">
//           <Label htmlFor="password">New password</Label>
//           <div className="relative">
//             <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//             <Input
//               id="password"
//               type={showPassword ? 'text' : 'password'}
//               placeholder="Min 8 characters"
//               value={password}
//               onChange={(ev) => setPassword(ev.target.value)}
//               autoComplete="new-password"
//               className="pl-9 pr-9"
//               autoFocus
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword((v) => !v)}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//               aria-label={showPassword ? 'Hide password' : 'Show password'}
//             >
//               {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//             </button>
//           </div>
//           <PasswordChecklist password={password} />
//         </motion.div>

//         <motion.div variants={fieldVariants} className="space-y-1.5">
//           <Label htmlFor="confirmPassword">Confirm new password</Label>
//           <div className="relative">
//             <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//             <Input
//               id="confirmPassword"
//               type={showConfirm ? 'text' : 'password'}
//               placeholder="Re-enter new password"
//               value={confirmPassword}
//               onChange={(ev) => setConfirmPassword(ev.target.value)}
//               autoComplete="new-password"
//               className={`pl-9 pr-9 ${confirmPassword && !passwordsMatch ? 'ring-1 ring-red-300' : ''}`}
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowConfirm((v) => !v)}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//               aria-label={showConfirm ? 'Hide password' : 'Show password'}
//             >
//               {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//             </button>
//           </div>
//           {confirmPassword && !passwordsMatch ? (
//             <p className="text-xs text-red-500">Passwords don&apos;t match</p>
//           ) : null}
//         </motion.div>

//         {errorMessage ? (
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
//           >
//             {errorMessage}
//           </motion.p>
//         ) : null}

//         <motion.div variants={fieldVariants}>
//           <Button
//             type="submit"
//             className={`w-full ${PRIMARY_BTN} text-white shadow-sm transition-shadow hover:shadow-md disabled:opacity-60`}
//             disabled={!canSubmit}
//           >
//             {isSubmitting ? (
//               <span className="flex items-center gap-2">
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 Resetting password...
//               </span>
//             ) : (
//               'Reset password'
//             )}
//           </Button>
//         </motion.div>
//       </form>

//       <motion.div
//         variants={fieldVariants}
//         className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
//       >
//         <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
//         You can&apos;t reuse any of your last 5 passwords
//       </motion.div>

//       <motion.p variants={fieldVariants} className="mt-4 text-center text-sm text-muted-foreground">
//         <Link
//           href="/login"
//           className="inline-flex items-center gap-1 font-medium text-blue-600 underline-offset-4 hover:underline"
//         >
//           <ArrowLeft className="h-3.5 w-3.5" />
//           Back to login
//         </Link>
//       </motion.p>
//     </motion.div>
//   )
// }





'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
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

// Mirrors backend password policy (validation.middleware.js commonValidators.password)
const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character (@$!%*?&)', test: (p: string) => /[@$!%*?&]/.test(p) },
]

const COMMON_WEAK_PATTERNS = ['password', '12345678', 'qwerty', 'letmein', 'admin123', 'welcome1']

const STRENGTH_META = [
  { label: 'Very weak', color: 'bg-red-500', text: 'text-red-600' },
  { label: 'Weak', color: 'bg-red-500', text: 'text-red-600' },
  { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' },
  { label: 'Good', color: 'bg-amber-500', text: 'text-amber-600' },
  { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' },
  { label: 'Very strong', color: 'bg-emerald-500', text: 'text-emerald-600' },
] as const

/** Lightweight local strength heuristic — no external scoring library required. */
function scorePasswordStrength(password: string) {
  if (!password) return { score: 0, ...STRENGTH_META[0] }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[@$!%*?&#^()_+\-=[\]{};':"|,.<>/?]/.test(password)) score++

  const lower = password.toLowerCase()
  if (COMMON_WEAK_PATTERNS.some((pattern) => lower.includes(pattern))) score = Math.max(0, score - 2)
  if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 1) // 3+ repeated chars in a row

  const clamped = Math.max(0, Math.min(score, 5))
  return { score: clamped, ...STRENGTH_META[clamped] }
}

/** Cryptographically random password generator — always satisfies PASSWORD_RULES. */
function generateStrongPassword(length = 14) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // no ambiguous I/O
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const digits = '23456789'
  const symbols = '@$!%*?&'
  const all = upper + lower + digits + symbols

  const randomIndex = (max: number) => crypto.getRandomValues(new Uint32Array(1))[0] % max
  const pick = (set: string) => set[randomIndex(set.length)]

  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)]
  while (chars.length < length) chars.push(pick(all))

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label, color, text } = useMemo(() => scorePasswordStrength(password), [password])
  if (!password) return null

  return (
    <div role="status" aria-live="polite" className="mt-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? color : 'bg-slate-150 bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className={`mt-1.5 text-xs font-medium ${text}`}>{label}</p>
    </div>
  )
}

function PasswordChecklist({ password }: { password: string }) {
  if (!password) return null

  return (
    <ul className="mt-2.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password)
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              ok ? 'text-emerald-600' : 'text-muted-foreground'
            }`}
          >
            {ok ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0" />
            )}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

type LinkErrorReason = 'missing' | 'expired' | 'invalid'

const LINK_ERROR_COPY: Record<LinkErrorReason, { title: string; body: string }> = {
  missing: {
    title: 'Invalid reset link',
    body: 'This password reset link is missing or malformed. Please request a new one — links also expire after 10 minutes.',
  },
  expired: {
    title: 'This link has expired',
    body: 'Reset links are only valid for 10 minutes for your security. Request a new one and we\u2019ll get you back in.',
  },
  invalid: {
    title: 'This link isn\u2019t valid',
    body: 'This reset link has already been used or doesn\u2019t match any pending request. Request a new one to continue.',
  },
}

function classifyResetError(message: string): LinkErrorReason | null {
  const lower = message.toLowerCase()
  if (lower.includes('expired')) return 'expired'
  if (lower.includes('invalid') || lower.includes('not found') || lower.includes('already been used')) {
    return 'invalid'
  }
  return null
}

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [linkError, setLinkError] = useState<LinkErrorReason | null>(token ? null : 'missing')
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [justCopied, setJustCopied] = useState(false)

  const passwordOk = useMemo(
    () => PASSWORD_RULES.every((rule) => rule.test(password)),
    [password]
  )
  const passwordsMatch = useMemo(
    () => password.length > 0 && password === confirmPassword,
    [password, confirmPassword]
  )
  const canSubmit = Boolean(token) && passwordOk && passwordsMatch && !isSubmitting

  function handleCapsLockCheck(e: React.KeyboardEvent<HTMLInputElement>) {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'))
    }
  }

  function handleGeneratePassword() {
    const generated = generateStrongPassword()
    setPassword(generated)
    setConfirmPassword(generated)
    setShowPassword(true)
    setShowConfirm(true)
  }

  async function handleCopyPassword() {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      setJustCopied(true)
      toast.success('Password copied to clipboard')
      setTimeout(() => setJustCopied(false), 2000)
    } catch {
      toast.error('Could not copy — please copy it manually')
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage('')
    if (!canSubmit) return

    try {
      setIsSubmitting(true)
      await authApi.resetPassword({ token, password, confirmPassword })
      setSucceeded(true)
      toast.success('Password reset successful! Please login.')
      setTimeout(() => {
        router.push('/login')
        router.refresh()
      }, 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reset password'
      const reason = classifyResetError(message)
      if (reason) {
        setLinkError(reason)
      } else {
        setErrorMessage(message)
        toast.error(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Missing, expired, or already-used token — dedicated recovery state
  if (linkError) {
    const { title, body } = LINK_ERROR_COPY[linkError]
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-7 text-center shadow-xl shadow-slate-900/5 sm:p-9"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <TriangleAlert className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        <Link href="/forgot-password">
          <Button className={`mt-6 w-full ${PRIMARY_BTN} text-white`}>
            Request a new link
          </Button>
        </Link>
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

  if (succeeded) {
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
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </motion.div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Password updated</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your password has been reset successfully. Redirecting you to login…
        </p>
        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          For your security, sign in again on any other devices too
        </div>
        <Link href="/login">
          <Button className={`mt-4 w-full ${PRIMARY_BTN} text-white`}>
            Continue to login
          </Button>
        </Link>
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Set a new password</h2>
          <p className="text-sm text-muted-foreground">
            Choose a strong password you haven&apos;t used on RentEase before.
          </p>
        </div>
        <div className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:flex ${PRIMARY_BTN}`}>
          <LockKeyhole className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <motion.div variants={fieldVariants} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">New password</Label>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              <Sparkles className="h-3 w-3" />
              Generate strong password
            </button>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              onKeyUp={handleCapsLockCheck}
              autoComplete="new-password"
              className="pl-9 pr-16"
              aria-invalid={password.length > 0 && !passwordOk}
              aria-describedby="password-requirements"
              disabled={isSubmitting}
              autoFocus
              required
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
              {password && (
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="rounded p-1 text-slate-400 hover:text-slate-600"
                  aria-label="Copy password"
                >
                  {justCopied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="rounded p-1 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {capsLockOn && (
            <p className="flex items-center gap-1 text-xs font-medium text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              Caps Lock is on
            </p>
          )}
          <div id="password-requirements">
            <PasswordStrengthMeter password={password} />
            <PasswordChecklist password={password} />
          </div>
        </motion.div>

        <motion.div variants={fieldVariants} className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
              onKeyUp={handleCapsLockCheck}
              autoComplete="new-password"
              className={`pl-9 pr-9 ${confirmPassword && !passwordsMatch ? 'ring-1 ring-red-300' : ''}`}
              aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
              aria-describedby="confirm-password-feedback"
              disabled={isSubmitting}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p id="confirm-password-feedback">
            {confirmPassword && !passwordsMatch ? (
              <span className="text-xs text-red-500">Passwords don&apos;t match</span>
            ) : confirmPassword && passwordsMatch ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Passwords match
              </span>
            ) : null}
          </p>
        </motion.div>

        {errorMessage ? (
          <motion.p
            role="alert"
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
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting password...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Reset password
              </span>
            )}
          </Button>
        </motion.div>
      </form>

      {/* Premium content: security reassurance card */}
      <motion.div
        variants={fieldVariants}
        className="mt-6 space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Keeping your account secure
        </div>
        <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
          <li>• You can&apos;t reuse any of your last 5 passwords</li>
          <li>• We&apos;ll never email or call you to ask for your password</li>
          <li>• Consider a password manager to keep this one unique to RentEase</li>
        </ul>
      </motion.div>

      <motion.p variants={fieldVariants} className="mt-4 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-medium text-blue-600 underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </motion.p>
    </motion.div>
  )
}
