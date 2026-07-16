

'use client'

import { useState, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Lock,
  Key,
  Smartphone,
  Fingerprint,
  LogOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  Save,
  RefreshCw,
  Mail,
  Monitor,
  Globe,
  Clock,
  History,
  BadgeCheck,
  Zap,
  ChevronRight,
  Info,
  Sparkles,
  Bell,
  Laptop,
  Tablet,
  Cpu,
  Activity,
  UserX,
  Trash2,
  TriangleAlert,
  CircleDot,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ── Helpers ────────────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 text-xs text-red-500 mt-1.5"
    >
      <XCircle className="h-3 w-3 shrink-0" />
      {message}
    </motion.p>
  )
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  className = '',
}: {
  icon: React.ElementType
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={`border border-slate-100 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#2874f0]/10 rounded-lg p-1.5">
            <Icon className="h-4 w-4 text-[#2874f0]" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-700">{title}</CardTitle>
            {description && <CardDescription className="text-xs mt-0.5">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  )
}

// Password strength analyzer
function usePasswordStrength(password: string) {
  return useMemo(() => {
    if (!password) return { score: 0, label: '', color: '', checks: [] }
    const checks = [
      { label: 'At least 8 characters', pass: password.length >= 8 },
      { label: 'Uppercase letter (A–Z)', pass: /[A-Z]/.test(password) },
      { label: 'Lowercase letter (a–z)', pass: /[a-z]/.test(password) },
      { label: 'Number (0–9)', pass: /\d/.test(password) },
      { label: 'Special character (!@#…)', pass: /[^A-Za-z0-9]/.test(password) },
    ]
    const score = checks.filter((c) => c.pass).length
    const map = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-emerald-500' },
    ]
    return { score, ...map[score - 1] || { label: '', color: '' }, checks }
  }, [password])
}

// Static data
const SECURITY_FEATURES = [
  {
    icon: Smartphone,
    label: 'Two-Factor Authentication (2FA)',
    description: 'Require OTP via SMS or authenticator app on every login',
    status: 'disabled',
    statusColor: 'bg-slate-100 text-slate-500',
    action: 'Enable',
    actionColor: 'bg-[#2874f0] text-white hover:bg-[#1a55c4]',
    recommended: true,
  },
  {
    icon: Bell,
    label: 'Security Alerts',
    description: 'Email & SMS notifications on suspicious login attempts',
    status: 'enabled',
    statusColor: 'bg-emerald-50 text-emerald-600',
    action: 'Configure',
    actionColor: '',
    recommended: false,
  },
  {
    icon: History,
    label: 'Login History',
    description: 'Track all access events with IP, device, and location info',
    status: 'available',
    statusColor: 'bg-blue-50 text-blue-600',
    action: 'View Logs',
    actionColor: '',
    recommended: false,
  },
  {
    icon: Globe,
    label: 'IP Allowlist',
    description: 'Restrict account access to specific IP addresses only',
    status: 'disabled',
    statusColor: 'bg-slate-100 text-slate-500',
    action: 'Set Up',
    actionColor: '',
    recommended: false,
  },
]

const ACTIVE_SESSIONS = [
  {
    icon: Monitor,
    device: 'Windows PC — Chrome 124',
    location: 'Kolkata, West Bengal',
    time: 'Active now',
    current: true,
  },
  {
    icon: Smartphone,
    device: 'Android — Chrome Mobile',
    location: 'Haldia, West Bengal',
    time: '2 hours ago',
    current: false,
  },
  {
    icon: Laptop,
    device: 'MacBook — Safari 17',
    location: 'Mumbai, Maharashtra',
    time: '3 days ago',
    current: false,
  },
]

const SECURITY_TIPS = [
  {
    icon: Key,
    tip: 'Use a unique password not used on any other website.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Smartphone,
    tip: 'Enable 2FA to protect against credential leaks.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: RefreshCw,
    tip: 'Rotate your password every 90 days for best practices.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Globe,
    tip: 'Avoid logging in over public Wi-Fi without a VPN.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
]

const COMPLIANCE_BADGES = [
  'ISO 27001', 'SOC 2 Type II', 'OWASP Top 10', 'GDPR Ready', 'IT Act 2000',
]

// ── Score Ring Component ───────────────────────────────────────────────────────
function SecurityScoreRing({ score }: { score: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ

  const color =
    score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444'
  const label =
    score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'At Risk'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="44" cy="44" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${filled} ${circ}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{score}</span>
          <span className="text-[10px] text-slate-400 font-medium">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SecurityPage() {
  const { data: session } = useSession()
  const router = useRouter()

  // Password form state
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false)
  const [showDangerConfirm, setShowDangerConfirm] = useState<'deactivate' | 'delete' | null>(null)
  const [dangerInput, setDangerInput] = useState('')
  const [alertsEnabled, setAlertsEnabled] = useState(true)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const strength = usePasswordStrength(passwordForm.newPassword)

  // Security score (static demo — in production derive from profile flags)
  const securityScore = 65

  const validatePasswordForm = () => {
    let ok = true
    const errors = { currentPassword: '', newPassword: '', confirmPassword: '' }
    if (!passwordForm.currentPassword) { errors.currentPassword = 'Current password is required'; ok = false }
    if (!passwordForm.newPassword) { errors.newPassword = 'New password is required'; ok = false }
    else if (passwordForm.newPassword.length < 8) { errors.newPassword = 'Minimum 8 characters required'; ok = false }
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Must include uppercase, lowercase & number'; ok = false
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'; ok = false
    }
    setPasswordErrors(errors)
    return ok
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePasswordForm()) return
    setIsChangingPassword(true)
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/auth/change-password`,
        { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      )
      if (response.data.success) {
        toast.success('Password changed — signing you out for security')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => signOut({ callbackUrl: '/vendor/login' }), 2000)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogoutAllDevices = async () => {
    setIsLoggingOutAll(true)
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/auth/logout-all`, {},
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      )
      if (response.data.success) {
        toast.success('Logged out from all devices')
        signOut({ callbackUrl: '/vendor/login' })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to logout all devices')
    } finally {
      setIsLoggingOutAll(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2e6c] via-[#2874f0] to-[#0f52c4] text-white p-6 shadow-xl shadow-[#2874f0]/25">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-6 right-32 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Security Settings</h1>
              <p className="text-blue-200 text-sm mt-0.5">Manage authentication, access controls & account safety</p>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {COMPLIANCE_BADGES.map((b) => (
                  <span key={b} className="text-[10px] font-semibold bg-white/10 border border-white/20 px-2 py-0.5 rounded-full text-blue-100">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <SecurityScoreRing score={securityScore} />
        </div>
      </div>

      {/* ── Security Score Breakdown ────────────────────────────────────────── */}
      <SectionCard icon={Activity} title="Security Health Check" description="Actions to improve your account protection score">
        <div className="space-y-3">
          {[
            { label: 'Strong password set', done: true, points: '+20 pts' },
            { label: 'Two-factor authentication', done: false, points: '+25 pts', cta: 'Enable now' },
            { label: 'Security alerts enabled', done: true, points: '+15 pts' },
            { label: 'IP allowlist configured', done: false, points: '+20 pts', cta: 'Set up' },
            { label: 'Verified recovery email', done: true, points: '+20 pts' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-all
                ${item.done ? 'bg-emerald-50/60 border-emerald-100' : 'bg-amber-50/60 border-amber-100'}`}
            >
              <div className="flex items-center gap-3">
                {item.done
                  ? <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  : <CircleDot className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                }
                <span className={`text-sm font-medium ${item.done ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full
                  ${item.done ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {item.points}
                </span>
                {!item.done && item.cta && (
                  <Button size="sm" variant="ghost" className="text-[#2874f0] text-xs font-semibold px-2 h-7 hover:bg-[#2874f0]/10">
                    {item.cta} <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
          <Info className="h-3 w-3" />
          Enable all features to reach a score of 100 and unlock the "Verified Secure" badge
        </p>
      </SectionCard>

      {/* ── Change Password ──────────────────────────────────────────────────── */}
      <SectionCard icon={Key} title="Change Password" description="Use a strong, unique password you don't use elsewhere">
        <form onSubmit={handlePasswordChange} className="space-y-4">

          {/* Current Password */}
          <div>
            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
              Current Password <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type={showCurrentPw ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className={`pl-9 pr-10 ${passwordErrors.currentPassword ? 'border-red-400' : ''}`}
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCurrentPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError message={passwordErrors.currentPassword} />
          </div>

          {/* New Password */}
          <div>
            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
              New Password <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type={showNewPw ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className={`pl-9 pr-10 ${passwordErrors.newPassword ? 'border-red-400' : ''}`}
                placeholder="Create a strong password"
              />
              <button type="button" onClick={() => setShowNewPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError message={passwordErrors.newPassword} />

            {/* Strength bar */}
            {passwordForm.newPassword && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300
                        ${i <= strength.score ? strength.color : 'bg-slate-100'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Strength: <span className="text-slate-700">{strength.label}</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {strength.checks.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      {c.pass
                        ? <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                        : <XCircle className="h-3 w-3 text-slate-300 shrink-0" />
                      }
                      <span className={`text-[11px] ${c.pass ? 'text-emerald-700' : 'text-slate-400'}`}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
              Confirm New Password <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type={showConfirmPw ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className={`pl-9 pr-10 ${passwordErrors.confirmPassword ? 'border-red-400' : ''}`}
                placeholder="Re-enter new password"
                onPaste={(e) => e.preventDefault()}
              />
              <button type="button" onClick={() => setShowConfirmPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError message={passwordErrors.confirmPassword} />
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Paste disabled · You will be signed out after update
            </p>
          </div>

          <Button
            type="submit"
            disabled={isChangingPassword}
            className="bg-[#2874f0] hover:bg-[#1a55c4] text-white gap-2 rounded-xl font-semibold px-7"
          >
            {isChangingPassword
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</>
              : <><Save className="h-4 w-4" /> Update Password</>
            }
          </Button>
        </form>
      </SectionCard>

      {/* ── Security Features ─────────────────────────────────────────────────── */}
      <SectionCard icon={Shield} title="Security Features" description="Configure protection layers for your account">
        <div className="space-y-3">
          {SECURITY_FEATURES.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2874f0]/8 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-[#2874f0]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-slate-800">{feature.label}</p>
                      {feature.recommended && (
                        <Badge className="bg-[#fb641b]/10 text-[#fb641b] border-[#fb641b]/20 text-[10px] font-bold px-2 py-0">
                          <Zap className="h-2.5 w-2.5 mr-0.5" /> Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${feature.statusColor}`}>
                    {feature.status}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs font-semibold rounded-lg h-8 ${feature.actionColor}`}
                  >
                    {feature.action}
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Security Alerts Toggle */}
        <div className="mt-4 flex items-center justify-between bg-slate-50 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Bell className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Instant Security Alerts</p>
              <p className="text-xs text-slate-500">Notified immediately on any suspicious account activity</p>
            </div>
          </div>
          <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
        </div>
      </SectionCard>

      {/* ── Active Sessions ───────────────────────────────────────────────────── */}
      <SectionCard icon={Monitor} title="Active Sessions" description="Devices currently logged into your account">
        <div className="space-y-3 mb-5">
          {ACTIVE_SESSIONS.map((sess, i) => {
            const Icon = sess.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all
                  ${sess.current ? 'bg-blue-50/60 border-blue-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${sess.current ? 'bg-[#2874f0]/15' : 'bg-slate-100'}`}>
                    <Icon className={`h-5 w-5 ${sess.current ? 'text-[#2874f0]' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{sess.device}</p>
                      {sess.current && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          This device
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <Globe className="h-3 w-3" />{sess.location}
                      <span className="text-slate-300">·</span>
                      <Clock className="h-3 w-3" />{sess.time}
                    </p>
                  </div>
                </div>
                {!sess.current && (
                  <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg font-semibold">
                    Revoke
                  </Button>
                )}
              </motion.div>
            )
          })}
        </div>
        <Button
          variant="outline"
          onClick={handleLogoutAllDevices}
          disabled={isLoggingOutAll}
          className="w-full gap-2 rounded-xl font-semibold border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          {isLoggingOutAll
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Logging out…</>
            : <><LogOut className="h-4 w-4" /> Logout from All Devices</>
          }
        </Button>
      </SectionCard>

      {/* ── Security Best Practices ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-[#2874f0]" />
          <h3 className="text-sm font-semibold text-slate-700">Security Best Practices</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {SECURITY_TIPS.map((tip, i) => {
            const Icon = tip.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`${tip.bg} rounded-lg p-2 shrink-0`}>
                  <Icon className={`h-4 w-4 ${tip.color}`} />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{tip.tip}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Platform Security Statement ───────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <div className="bg-white/10 rounded-lg p-2 shrink-0">
            <ShieldCheck className="h-5 w-5 text-green-300" />
          </div>
          <div>
            <p className="font-semibold text-sm">Platform-Level Security Guarantee</p>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
              All vendor sessions are protected by <strong className="text-white">JWT with RS256 signing</strong>, short-lived
              access tokens (15 min), and refresh token rotation. Login events are immutably logged with
              IP, device fingerprint, and geolocation. Brute-force attempts are throttled with progressive
              delays and auto-lockout after 5 failed attempts.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['JWT RS256', 'Token Rotation', 'Brute-Force Guard', 'Geo Logging', 'Rate Limiting', 'CSRF Protection'].map((tag) => (
                <span key={tag} className="text-[10px] font-semibold bg-white/10 border border-white/20 px-2 py-0.5 rounded-full text-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-red-200 overflow-hidden shadow-sm">
        <div className="bg-red-50 border-b border-red-200 px-5 py-4 flex items-center gap-2.5">
          <div className="bg-red-100 rounded-lg p-1.5">
            <TriangleAlert className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-red-800">Danger Zone</p>
            <p className="text-xs text-red-600">Irreversible actions — proceed with extreme caution</p>
          </div>
        </div>
        <div className="bg-white px-5 py-4 space-y-4">

          {/* Deactivate */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-slate-800 flex items-center gap-2">
                <UserX className="h-4 w-4 text-amber-500" />
                Deactivate Account
              </p>
              <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
                Temporarily suspends your vendor profile. Your products will be hidden and no new orders will be accepted. You can reactivate anytime.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowDangerConfirm('deactivate'); setDangerInput('') }}
              className="border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl font-semibold shrink-0"
            >
              Deactivate Account
            </Button>
          </div>

          <Separator className="bg-red-100" />

          {/* Delete */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-slate-800 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-500" />
                Delete Account Permanently
              </p>
              <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
                Permanently erases your vendor account, all products, order history, and bank details. This action cannot be undone and all data is irrecoverable.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => { setShowDangerConfirm('delete'); setDangerInput('') }}
              className="rounded-xl font-semibold shrink-0"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* ── Danger Confirmation Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showDangerConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowDangerConfirm(null) }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 rounded-xl p-2">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {showDangerConfirm === 'delete' ? 'Delete Account?' : 'Deactivate Account?'}
                  </p>
                  <p className="text-xs text-slate-500">This action requires confirmation</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                {showDangerConfirm === 'delete'
                  ? 'All your data will be permanently deleted and cannot be recovered. Type DELETE to confirm.'
                  : 'Your account will be suspended. All listings will be hidden. Type DEACTIVATE to confirm.'
                }
              </p>
              <Input
                value={dangerInput}
                onChange={(e) => setDangerInput(e.target.value)}
                placeholder={showDangerConfirm === 'delete' ? 'Type DELETE' : 'Type DEACTIVATE'}
                className="mb-4 font-mono uppercase tracking-wider border-red-300 focus-visible:ring-red-200"
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowDangerConfirm(null)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={
                    showDangerConfirm === 'delete'
                      ? dangerInput !== 'DELETE'
                      : dangerInput !== 'DEACTIVATE'
                  }
                  className="flex-1 rounded-xl font-semibold"
                  onClick={() => {
                    toast.error(`Account ${showDangerConfirm === 'delete' ? 'deletion' : 'deactivation'} requested`)
                    setShowDangerConfirm(null)
                  }}
                >
                  {showDangerConfirm === 'delete' ? 'Delete Forever' : 'Deactivate'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}