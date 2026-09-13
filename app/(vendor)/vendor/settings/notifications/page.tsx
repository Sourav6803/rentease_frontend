'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { vendorProfileQueryOptions } from '@/lib/api/vendorProfile'
import { vendorQueryKeys } from '@/lib/api/queryKeys'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  BellRing,
  Mail,
  Smartphone,
  MessageSquare,
  Package,
  AlertCircle,
  DollarSign,
  Star,
  Wrench,
  Calendar,
  Save,
  Loader2,
  ShieldCheck,
  Inbox,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ── Backend shapes ──────────────────────────────────────────────────────────────
// Channel prefs  → user.preferences.notifications  (enforced in notification.service)
// Event prefs    → vendor.settings.notificationPreferences (flat booleans)

interface ChannelPrefs {
  email: boolean
  sms: boolean
  push: boolean
  in_app: boolean
}

type VendorEventKey =
  | 'newRentals'
  | 'cancellations'
  | 'maintenanceRequests'
  | 'payments'
  | 'reviews'
  | 'dailyDigest'

type VendorPrefs = Record<VendorEventKey, boolean>

const DEFAULT_CHANNELS: ChannelPrefs = {
  email: true,
  sms: true,
  push: true,
  in_app: true,
}

const DEFAULT_VENDOR_PREFS: VendorPrefs = {
  newRentals: true,
  cancellations: true,
  maintenanceRequests: true,
  payments: true,
  reviews: true,
  dailyDigest: false,
}

// ── Config ──────────────────────────────────────────────────────────────────────
const CHANNELS: { key: keyof ChannelPrefs; label: string; icon: React.ElementType; description: string; color: string }[] = [
  {
    key: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Transactional and update emails to your registered address',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'push',
    label: 'Push',
    icon: Smartphone,
    description: 'Real-time push alerts on your mobile or desktop device',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    key: 'sms',
    label: 'SMS',
    icon: MessageSquare,
    description: 'Critical text alerts to your registered phone number',
    color: 'bg-emerald-50 text-emerald-600',
  },
]

const EVENT_PREFS: { key: VendorEventKey; label: string; icon: React.ElementType; description: string; color: string }[] = [
  { key: 'newRentals', label: 'New Rental Orders', icon: Package, description: 'When a customer books your product', color: 'bg-blue-50 text-blue-600' },
  { key: 'cancellations', label: 'Order Cancellations', icon: AlertCircle, description: 'When a rental is cancelled or refunded', color: 'bg-red-50 text-red-500' },
  { key: 'payments', label: 'Payments & Payouts', icon: DollarSign, description: 'Payment confirmations and payout credits', color: 'bg-emerald-50 text-emerald-600' },
  { key: 'maintenanceRequests', label: 'Maintenance Requests', icon: Wrench, description: 'Customer-raised maintenance or damage reports', color: 'bg-amber-50 text-amber-600' },
  { key: 'reviews', label: 'Customer Reviews', icon: Star, description: 'New ratings and feedback left by renters', color: 'bg-yellow-50 text-yellow-600' },
  { key: 'dailyDigest', label: 'Daily Activity Digest', icon: Calendar, description: 'Morning summary of the previous day activity', color: 'bg-indigo-50 text-indigo-600' },
]

const getAuthHeaders = (token: string) => ({ Authorization: `Bearer ${token}` })

// ── UI helpers ──────────────────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card className="border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
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

function ToggleRow({
  icon: Icon,
  iconClass,
  label,
  description,
  checked,
  onCheckedChange,
  delay = 0,
}: {
  icon: React.ElementType
  iconClass: string
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.25 }}
      className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all
        ${checked ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50/50 border-slate-100'}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          {description && <p className="text-xs text-slate-500 mt-0.5 pr-2">{description}</p>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
    </motion.div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()
  const token = session?.user?.accessToken

  const [channels, setChannels] = useState<ChannelPrefs>(DEFAULT_CHANNELS)
  const [eventPrefs, setEventPrefs] = useState<VendorPrefs>(DEFAULT_VENDOR_PREFS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const hasFetched = useRef(false)

  const fetchAll = useCallback(async (accessToken: string) => {
    try {
      setIsLoading(true)

      // 1) Channel preferences — user.preferences.notifications
      const channelRes = await fetch(`${BASE_URL}/api/v1/users/profile`, {
        headers: getAuthHeaders(accessToken),
      }).then((r) => r.json())
      if (channelRes?.success && channelRes.data?.user?.preferences?.notifications) {
        const n = channelRes.data.user.preferences.notifications
        setChannels({
          email: n.email !== false,
          sms: n.sms !== false,
          push: n.push !== false,
          in_app: n.in_app !== false,
        })
      }

      // 2) Event preferences — vendor.settings.notificationPreferences
      // Reads the shared cache. `.catch(() => null)` keeps the original silent
      // failure behaviour so the defaults stay on screen instead of the whole
      // fetchAll throwing.
      const vendorProfile = await queryClient
        .fetchQuery(vendorProfileQueryOptions)
        .catch(() => null)
      const stored = vendorProfile?.settings?.notificationPreferences
      if (stored && typeof stored === 'object') {
        setEventPrefs({
          newRentals: stored.newRentals !== false,
          cancellations: stored.cancellations !== false,
          maintenanceRequests: stored.maintenanceRequests !== false,
          payments: stored.payments !== false,
          reviews: stored.reviews !== false,
          dailyDigest: stored.dailyDigest === true,
        })
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      toast.error('Could not load preferences. Showing defaults.')
    } finally {
      setIsLoading(false)
    }
  }, [queryClient])

  useEffect(() => {
    if (status !== 'authenticated' || !token || hasFetched.current) return
    hasFetched.current = true
    fetchAll(token)
  }, [status, token, fetchAll])

  const patchChannels = (key: keyof ChannelPrefs, value: boolean) => {
    if (key === 'in_app') return // always on, not user-configurable
    setChannels((p) => ({ ...p, [key]: value }))
    setHasChanges(true)
  }

  const patchEvent = (key: VendorEventKey, value: boolean) => {
    setEventPrefs((p) => ({ ...p, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!token) return
    setIsSaving(true)
    try {
      // Channel prefs
      const channelBody = {
        email: channels.email,
        sms: channels.sms,
        push: channels.push,
      }
      const channelRes = await fetch(`${BASE_URL}/api/v1/users/notifications`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify(channelBody),
      }).then((r) => r.json())
      if (!channelRes?.success) {
        throw new Error(channelRes?.message || 'Failed to save channel preferences')
      }

      // Vendor event prefs — flat booleans matching the model exactly
      const vendorRes = await fetch(`${BASE_URL}/api/v1/vendor/notification-preferences`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPrefs),
      }).then((r) => r.json())
      if (!vendorRes?.success) {
        throw new Error(vendorRes?.message || 'Failed to save event preferences')
      }

      toast.success('Notification preferences saved')
      setHasChanges(false)
      // Keep the shared profile cache in sync — the sidebar/header read from it.
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.profile })
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to save preferences. Please try again.'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const enabledChannelCount = CHANNELS.filter((c) => channels[c.key as keyof ChannelPrefs]).length
  const enabledEventCount = EVENT_PREFS.filter((e) => eventPrefs[e.key]).length

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-[#2874f0]/20 border-t-[#2874f0] animate-spin" />
          <Bell className="absolute inset-0 m-auto h-5 w-5 text-[#2874f0]" />
        </div>
        <p className="text-sm text-slate-400 font-medium">Loading notification preferences…</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <Inbox className="h-10 w-10 text-slate-300" />
        <p className="font-semibold text-slate-700">Please sign in to manage preferences</p>
        <p className="text-xs text-slate-400 max-w-xs">Your notification preferences are linked to your account.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6 px-1 sm:px-0">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2e6c] via-[#2874f0] to-[#0f52c4] text-white p-6 shadow-xl shadow-[#2874f0]/25">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm">
              <BellRing className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Notification Preferences</h1>
              <p className="text-blue-200 text-sm mt-0.5">Choose how you receive updates</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-xs font-semibold px-3 py-1 rounded-full text-blue-100">
                  <Bell className="h-3 w-3" />
                  {enabledEventCount} of {EVENT_PREFS.length} event alerts on
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-xs font-semibold px-3 py-1 rounded-full text-blue-100">
                  <Smartphone className="h-3 w-3" />
                  {enabledChannelCount} {enabledChannelCount === 1 ? 'channel' : 'channels'} active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channels */}
      <SectionCard
        icon={Smartphone}
        title="Notification Channels"
        description="Master switches — turning a channel off stops updates on that channel"
      >
        <div className="space-y-2">
          {CHANNELS.map((c, i) => (
            <ToggleRow
              key={c.key}
              icon={c.icon}
              iconClass={c.color}
              label={c.label}
              description={c.description}
              checked={channels[c.key as keyof ChannelPrefs]}
              onCheckedChange={(v) => patchChannels(c.key as keyof ChannelPrefs, v)}
              delay={i * 0.04}
            />
          ))}
          <p className="flex items-start gap-1.5 text-[11px] text-slate-400 px-1 pt-1">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-500" />
            Security and payment-critical alerts are always delivered in-app and cannot be disabled.
          </p>
        </div>
      </SectionCard>

      {/* Event preferences */}
      <SectionCard
        icon={Bell}
        title="Event Preferences"
        description="Pick which activities you want to be notified about"
      >
        <div className="space-y-2">
          {EVENT_PREFS.map((e, i) => (
            <ToggleRow
              key={e.key}
              icon={e.icon}
              iconClass={e.color}
              label={e.label}
              description={e.description}
              checked={eventPrefs[e.key]}
              onCheckedChange={(v) => patchEvent(e.key, v)}
              delay={i * 0.04}
            />
          ))}
        </div>
      </SectionCard>

      {/* Sticky save bar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 inset-x-0 mx-auto max-w-4xl px-4 sm:px-6"
          >
            <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow-lg px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 hidden sm:block">
                You have unsaved changes
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHasChanges(false)
                    if (token) fetchAll(token)
                  }}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#2874f0] hover:bg-[#1a55c4] text-white font-semibold gap-2 px-6 rounded-xl shadow-md shadow-[#2874f0]/30"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Preferences
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
