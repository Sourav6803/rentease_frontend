// // src/app/vendor/settings/notifications/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import { toast } from 'sonner'
// import { motion } from 'framer-motion'
// import {
//   Bell,
//   Mail,
//   MessageSquare,
//   Package,
//   Truck,
//   DollarSign,
//   Star,
//   Wrench,
//   Calendar,
//   AlertCircle,
//   Save,
//   Loader2,
//   CheckCircle,
//   Smartphone,
//   Monitor,
//   BellRing,
//   BellOff
// } from 'lucide-react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Label } from '@/components/ui/label'
// import { Switch } from '@/components/ui/switch'
// import { Separator } from '@/components/ui/separator'
// import { Badge } from '@/components/ui/badge'
// import axios from 'axios'

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// interface NotificationPreferences {
//   email: {
//     newRentals: boolean
//     cancellations: boolean
//     maintenanceRequests: boolean
//     payments: boolean
//     reviews: boolean
//     dailyDigest: boolean
//     weeklyReport: boolean
//   }
//   push: {
//     enabled: boolean
//     newRentals: boolean
//     cancellations: boolean
//     maintenanceRequests: boolean
//     payments: boolean
//   }
// }

// export default function NotificationsPage() {
//   const { data: session } = useSession()
//   const [preferences, setPreferences] = useState<NotificationPreferences>({
//     email: {
//       newRentals: true,
//       cancellations: true,
//       maintenanceRequests: true,
//       payments: true,
//       reviews: true,
//       dailyDigest: false,
//       weeklyReport: true
//     },
//     push: {
//       enabled: false,
//       newRentals: true,
//       cancellations: true,
//       maintenanceRequests: true,
//       payments: true
//     }
//   })
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSaving, setIsSaving] = useState(false)

//   useEffect(() => {
//     fetchPreferences()
//   }, [])

//   const fetchPreferences = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/v1/vendor/profile/me`, {
//         headers: {
//           Authorization: `Bearer ${session?.user?.accessToken}`
//         }
//       })
//       if (response.data.success) {
//         const profile = response.data.data.profile
//         if (profile?.settings?.notificationPreferences) {
//           setPreferences(profile.settings.notificationPreferences)
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching notification preferences:', error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const updateEmailPreference = (key: keyof NotificationPreferences['email'], value: boolean) => {
//     setPreferences(prev => ({
//       ...prev,
//       email: { ...prev.email, [key]: value }
//     }))
//   }

//   const updatePushPreference = (key: keyof NotificationPreferences['push'], value: boolean) => {
//     setPreferences(prev => ({
//       ...prev,
//       push: { ...prev.push, [key]: value }
//     }))
//   }

//   const handleSave = async () => {
//     setIsSaving(true)
//     try {
//       const response = await axios.put(
//         `${BASE_URL}/api/v1/vendor/notification-preferences`,
//         preferences,
//         {
//           headers: {
//             Authorization: `Bearer ${session?.user?.accessToken}`
//           }
//         }
//       )

//       if (response.data.success) {
//         toast.success('Notification preferences updated successfully')
//       }
//     } catch (error: any) {
//       console.error('Error updating notification preferences:', error)
//       toast.error(error.response?.data?.message || 'Failed to update preferences')
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const emailNotifications = [
//     { key: 'newRentals', label: 'New Rentals', icon: Package, description: 'Get notified when a customer rents your product' },
//     { key: 'cancellations', label: 'Cancellations', icon: AlertCircle, description: 'Receive alerts when a rental is cancelled' },
//     { key: 'maintenanceRequests', label: 'Maintenance Requests', icon: Wrench, description: 'Get notified about product maintenance needs' },
//     { key: 'payments', label: 'Payments', icon: DollarSign, description: 'Receive payment confirmation and payout updates' },
//     { key: 'reviews', label: 'Reviews', icon: Star, description: 'Get notified when customers leave reviews' },
//     { key: 'dailyDigest', label: 'Daily Digest', icon: Calendar, description: 'Receive a summary of daily activities' },
//     { key: 'weeklyReport', label: 'Weekly Report', icon: Bell, description: 'Get weekly performance reports' },
//   ]

//   const pushNotifications = [
//     { key: 'newRentals', label: 'New Rentals', icon: Package },
//     { key: 'cancellations', label: 'Cancellations', icon: AlertCircle },
//     { key: 'maintenanceRequests', label: 'Maintenance', icon: Wrench },
//     { key: 'payments', label: 'Payments', icon: DollarSign },
//   ]

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-semibold">Notification Preferences</h2>
//           <p className="text-sm text-muted-foreground">
//             Choose how you want to receive updates and alerts
//           </p>
//         </div>
//         <Button onClick={handleSave} disabled={isSaving} className="gap-2">
//           {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
//           Save Preferences
//         </Button>
//       </div>

//       {/* Email Notifications */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center gap-2">
//             <Mail className="h-5 w-5 text-primary" />
//             <CardTitle className="text-lg">Email Notifications</CardTitle>
//           </div>
//           <CardDescription>
//             Receive updates directly to your registered email address
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {emailNotifications.map((notif, idx) => {
//             const Icon = notif.icon
//             const isEnabled = preferences.email[notif.key as keyof typeof preferences.email]
//             return (
//               <motion.div
//                 key={notif.key}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: idx * 0.05 }}
//                 className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
//                     <Icon className="h-4 w-4 text-primary" />
//                   </div>
//                   <div>
//                     <p className="font-medium">{notif.label}</p>
//                     <p className="text-xs text-muted-foreground">{notif.description}</p>
//                   </div>
//                 </div>
//                 <Switch
//                   checked={isEnabled}
//                   onCheckedChange={(checked) => updateEmailPreference(notif.key as keyof NotificationPreferences['email'], checked)}
//                 />
//               </motion.div>
//             )
//           })}
//         </CardContent>
//       </Card>

//       {/* Push Notifications */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between flex-wrap gap-4">
//             <div className="flex items-center gap-2">
//               <Smartphone className="h-5 w-5 text-primary" />
//               <CardTitle className="text-lg">Push Notifications</CardTitle>
//             </div>
//             <div className="flex items-center gap-2">
//               <Badge variant={preferences.push.enabled ? "default" : "secondary"}>
//                 {preferences.push.enabled ? 'Enabled' : 'Disabled'}
//               </Badge>
//               <Switch
//                 checked={preferences.push.enabled}
//                 onCheckedChange={(checked) => updatePushPreference('enabled', checked)}
//               />
//             </div>
//           </div>
//           <CardDescription>
//             Get real-time notifications on your device
//           </CardDescription>
//         </CardHeader>
//         {preferences.push.enabled && (
//           <CardContent className="space-y-4">
//             {pushNotifications.map((notif, idx) => {
//               const Icon = notif.icon
//               const isEnabled = preferences.push[notif.key as keyof typeof preferences.push]
//               return (
//                 <motion.div
//                   key={notif.key}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: idx * 0.05 }}
//                   className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
//                       <Icon className="h-4 w-4 text-primary" />
//                     </div>
//                     <p className="font-medium">{notif.label}</p>
//                   </div>
//                   <Switch
//                     checked={isEnabled}
//                     onCheckedChange={(checked) => updatePushPreference(notif.key as keyof NotificationPreferences['push'], checked)}
//                   />
//                 </motion.div>
//               )
//             })}
//           </CardContent>
//         )}
//         {!preferences.push.enabled && (
//           <CardContent>
//             <div className="text-center py-8">
//               <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
//               <p className="text-sm text-muted-foreground">
//                 Push notifications are disabled. Enable them to receive real-time updates.
//               </p>
//             </div>
//           </CardContent>
//         )}
//       </Card>

//       {/* Info Note */}
//       <Card className="bg-blue-50 border-blue-200">
//         <CardContent className="p-4">
//           <div className="flex items-start gap-3">
//             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
//               <BellRing className="h-4 w-4 text-blue-600" />
//             </div>
//             <div>
//               <p className="font-medium text-blue-800">Stay Updated</p>
//               <p className="text-sm text-blue-700 mt-1">
//                 Enable email and push notifications to never miss important updates about your rentals, payments, and customer inquiries.
//               </p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  BellRing,
  BellOff,
  Mail,
  Smartphone,
  Package,
  Truck,
  DollarSign,
  Star,
  Wrench,
  Calendar,
  AlertCircle,
  Save,
  Loader2,
  CheckCircle,
  Monitor,
  MessageSquare,
  Zap,
  Clock,
  BarChart2,
  RefreshCw,
  Info,
  Sparkles,
  ChevronRight,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  ShieldCheck,
  BadgeCheck,
  TrendingUp,
  Users,
  Megaphone,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ── Types ──────────────────────────────────────────────────────────────────────
interface NotificationPreferences {
  email: {
    newRentals: boolean
    cancellations: boolean
    maintenanceRequests: boolean
    payments: boolean
    reviews: boolean
    dailyDigest: boolean
    weeklyReport: boolean
    promotions: boolean
    systemUpdates: boolean
  }
  push: {
    enabled: boolean
    newRentals: boolean
    cancellations: boolean
    maintenanceRequests: boolean
    payments: boolean
    reviews: boolean
  }
  sms: {
    enabled: boolean
    newRentals: boolean
    payments: boolean
    criticalAlerts: boolean
  }
  quietHours: {
    enabled: boolean
    from: string
    to: string
  }
}

const DEFAULT_PREFS: NotificationPreferences = {
  email: {
    newRentals: true,
    cancellations: true,
    maintenanceRequests: true,
    payments: true,
    reviews: true,
    dailyDigest: false,
    weeklyReport: true,
    promotions: false,
    systemUpdates: true,
  },
  push: {
    enabled: false,
    newRentals: true,
    cancellations: true,
    maintenanceRequests: true,
    payments: true,
    reviews: false,
  },
  sms: {
    enabled: true,
    newRentals: true,
    payments: true,
    criticalAlerts: true,
  },
  quietHours: {
    enabled: false,
    from: '22:00',
    to: '08:00',
  },
}

// ── Static config ──────────────────────────────────────────────────────────────
const EMAIL_NOTIFICATIONS = [
  {
    key: 'newRentals',
    label: 'New Rental Orders',
    icon: Package,
    description: 'Instant alert when a customer books your product',
    priority: 'high',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'cancellations',
    label: 'Order Cancellations',
    icon: AlertCircle,
    description: 'Get notified when a rental is cancelled or refunded',
    priority: 'high',
    color: 'bg-red-50 text-red-500',
  },
  {
    key: 'payments',
    label: 'Payments & Payouts',
    icon: DollarSign,
    description: 'Payment confirmations, settlements, and payout credits',
    priority: 'high',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    key: 'maintenanceRequests',
    label: 'Maintenance Requests',
    icon: Wrench,
    description: 'Customer-raised maintenance or damage reports',
    priority: 'medium',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    key: 'reviews',
    label: 'Customer Reviews',
    icon: Star,
    description: 'New ratings and feedback left by renters',
    priority: 'medium',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    key: 'dailyDigest',
    label: 'Daily Activity Digest',
    icon: Calendar,
    description: 'Morning summary of previous day\'s activity',
    priority: 'low',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    key: 'weeklyReport',
    label: 'Weekly Performance Report',
    icon: BarChart2,
    description: 'Revenue, rentals, and rating trends every Monday',
    priority: 'low',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    key: 'promotions',
    label: 'Platform Promotions',
    icon: Megaphone,
    description: 'Sales campaigns, featured listings, and offers',
    priority: 'low',
    color: 'bg-pink-50 text-pink-500',
  },
  {
    key: 'systemUpdates',
    label: 'System & Policy Updates',
    icon: ShieldCheck,
    description: 'Important platform updates, policy changes, maintenance',
    priority: 'medium',
    color: 'bg-slate-100 text-slate-600',
  },
]

const PUSH_NOTIFICATIONS = [
  { key: 'newRentals', label: 'New Rentals', icon: Package, description: 'Instant booking alerts' },
  { key: 'cancellations', label: 'Cancellations', icon: AlertCircle, description: 'Order cancellation alerts' },
  { key: 'payments', label: 'Payments', icon: DollarSign, description: 'Payment & payout updates' },
  { key: 'maintenanceRequests', label: 'Maintenance', icon: Wrench, description: 'Product maintenance requests' },
  { key: 'reviews', label: 'New Reviews', icon: Star, description: 'Customer review notifications' },
]

const SMS_NOTIFICATIONS = [
  { key: 'newRentals', label: 'New Rental Orders', icon: Package, description: 'SMS on every new booking' },
  { key: 'payments', label: 'Payments Received', icon: DollarSign, description: 'SMS on payment confirmation' },
  { key: 'criticalAlerts', label: 'Critical Alerts Only', icon: AlertCircle, description: 'Urgent account or security alerts' },
]

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  high: { label: 'High', className: 'bg-red-50 text-red-600 border-red-100' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-600 border-amber-100' },
  low: { label: 'Low', className: 'bg-slate-100 text-slate-500 border-slate-200' },
}

const CHANNEL_STATS = [
  { icon: Mail, label: 'Email Delivered', value: '98.4%', sub: 'delivery rate', color: 'bg-blue-50 text-blue-600' },
  { icon: Smartphone, label: 'Push Success', value: '94.1%', sub: 'open rate', color: 'bg-violet-50 text-violet-600' },
  { icon: MessageSquare, label: 'SMS Reach', value: '99.9%', sub: 'delivery rate', color: 'bg-emerald-50 text-emerald-600' },
  { icon: Zap, label: 'Avg. Delivery', value: '< 2s', sub: 'latency', color: 'bg-amber-50 text-amber-600' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  description,
  badge,
  badgeClass,
  headerExtra,
  children,
}: {
  icon: React.ElementType
  title: string
  description?: string
  badge?: string
  badgeClass?: string
  headerExtra?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className="border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#2874f0]/10 rounded-lg p-1.5">
              <Icon className="h-4 w-4 text-[#2874f0]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-slate-700">{title}</CardTitle>
                {badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {badge}
                  </span>
                )}
              </div>
              {description && <CardDescription className="text-xs mt-0.5">{description}</CardDescription>}
            </div>
          </div>
          {headerExtra}
        </div>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  )
}

function NotifRow({
  icon: Icon,
  iconClass,
  label,
  description,
  priority,
  checked,
  onCheckedChange,
  delay,
}: {
  icon: React.ElementType
  iconClass: string
  label: string
  description?: string
  priority?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  delay: number
}) {
  const pCfg = priority ? PRIORITY_CONFIG[priority] : null
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all
        ${checked ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50/50 border-slate-100 opacity-70'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800">{label}</p>
            {pCfg && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${pCfg.className}`}>
                {pCfg.label}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </motion.div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const hasFetched = useRef(false)

  // ── Fixed: single fetch once session is ready ──────────────────────────────
  const fetchPreferences = useCallback(async (token: string) => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${BASE_URL}/api/v1/vendor/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        const profile = response.data.data.profile
        if (profile?.settings?.notificationPreferences) {
          setPreferences({ ...DEFAULT_PREFS, ...profile.settings.notificationPreferences })
        }
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    const token = session?.user?.accessToken
    if (!token || hasFetched.current) return
    hasFetched.current = true
    fetchPreferences(token)
  }, [status, session?.user?.accessToken, fetchPreferences])

  const updateEmail = (key: keyof NotificationPreferences['email'], value: boolean) => {
    setPreferences((p) => ({ ...p, email: { ...p.email, [key]: value } }))
    setHasChanges(true)
  }
  const updatePush = (key: keyof NotificationPreferences['push'], value: boolean) => {
    setPreferences((p) => ({ ...p, push: { ...p.push, [key]: value } }))
    setHasChanges(true)
  }
  const updateSms = (key: keyof NotificationPreferences['sms'], value: boolean) => {
    setPreferences((p) => ({ ...p, sms: { ...p.sms, [key]: value } }))
    setHasChanges(true)
  }
  const updateQuietHours = (key: keyof NotificationPreferences['quietHours'], value: any) => {
    setPreferences((p) => ({ ...p, quietHours: { ...p.quietHours, [key]: value } }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put(
        `${BASE_URL}/api/v1/vendor/notification-preferences`,
        preferences,
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      )
      if (response.data.success) {
        toast.success('Notification preferences saved')
        setHasChanges(false)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const enabledEmailCount = Object.values(preferences.email).filter(Boolean).length
  const enabledPushCount = Object.values(preferences.push).filter(Boolean).length

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

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2e6c] via-[#2874f0] to-[#0f52c4] text-white p-6 shadow-xl shadow-[#2874f0]/25">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-4 right-28 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm">
              <BellRing className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Notification Preferences</h1>
              <p className="text-blue-200 text-sm mt-0.5">
                Control how, when, and where you receive updates
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-xs font-semibold px-3 py-1 rounded-full text-blue-100">
                  <Mail className="h-3 w-3" />
                  {enabledEmailCount} email alerts on
                </span>
                <span className={`flex items-center gap-1.5 border text-xs font-semibold px-3 py-1 rounded-full
                  ${preferences.push.enabled ? 'bg-emerald-400/20 border-emerald-300/30 text-emerald-200' : 'bg-white/10 border-white/20 text-blue-100'}`}>
                  <Smartphone className="h-3 w-3" />
                  Push {preferences.push.enabled ? 'enabled' : 'disabled'}
                </span>
                <span className={`flex items-center gap-1.5 border text-xs font-semibold px-3 py-1 rounded-full
                  ${preferences.sms.enabled ? 'bg-emerald-400/20 border-emerald-300/30 text-emerald-200' : 'bg-white/10 border-white/20 text-blue-100'}`}>
                  <MessageSquare className="h-3 w-3" />
                  SMS {preferences.sms.enabled ? 'active' : 'off'}
                </span>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  size="sm"
                  className="bg-white text-[#2874f0] hover:bg-blue-50 font-semibold gap-2 shadow-none"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Channel Stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CHANNEL_STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* ── Email Notifications ───────────────────────────────────────────────── */}
      <SectionCard
        icon={Mail}
        title="Email Notifications"
        description="Sent to your registered email address"
        badge={`${enabledEmailCount} active`}
        badgeClass="bg-blue-50 text-blue-600 border-blue-100"
        headerExtra={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-500 hover:text-[#2874f0] h-7 px-2"
              onClick={() => {
                const allOn = Object.values(preferences.email).every(Boolean)
                const newVal = !allOn
                setPreferences(p => ({
                  ...p,
                  email: Object.fromEntries(Object.keys(p.email).map(k => [k, newVal])) as any,
                }))
                setHasChanges(true)
              }}
            >
              {Object.values(preferences.email).every(Boolean) ? 'Disable All' : 'Enable All'}
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          {EMAIL_NOTIFICATIONS.map((n, i) => (
            <NotifRow
              key={n.key}
              icon={n.icon}
              iconClass={n.color}
              label={n.label}
              description={n.description}
              priority={n.priority}
              checked={preferences.email[n.key as keyof typeof preferences.email]}
              onCheckedChange={(v) => updateEmail(n.key as keyof NotificationPreferences['email'], v)}
              delay={i * 0.04}
            />
          ))}
        </div>
      </SectionCard>

      {/* ── Push Notifications ────────────────────────────────────────────────── */}
      <SectionCard
        icon={Smartphone}
        title="Push Notifications"
        description="Real-time alerts on your mobile or desktop device"
        headerExtra={
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border
              ${preferences.push.enabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              {preferences.push.enabled ? 'On' : 'Off'}
            </span>
            <Switch
              checked={preferences.push.enabled}
              onCheckedChange={(v) => updatePush('enabled', v)}
            />
          </div>
        }
      >
        <AnimatePresence mode="wait">
          {preferences.push.enabled ? (
            <motion.div
              key="push-on"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <p className="text-xs font-medium text-emerald-700">
                  Push notifications are active — you'll receive real-time alerts on this device
                </p>
              </div>
              {PUSH_NOTIFICATIONS.map((n, i) => (
                <NotifRow
                  key={n.key}
                  icon={n.icon}
                  iconClass="bg-violet-50 text-violet-600"
                  label={n.label}
                  description={n.description}
                  checked={preferences.push[n.key as keyof typeof preferences.push] as boolean}
                  onCheckedChange={(v) => updatePush(n.key as keyof NotificationPreferences['push'], v)}
                  delay={i * 0.05}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="push-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 gap-3 text-center"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                <BellOff className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Push Notifications Disabled</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Enable push notifications to get real-time updates on new orders, cancellations, and payments directly on your device.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => updatePush('enabled', true)}
                className="bg-[#2874f0] hover:bg-[#1a55c4] text-white gap-2 rounded-xl mt-1"
              >
                <Zap className="h-4 w-4" /> Enable Push Notifications
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* ── SMS Notifications ─────────────────────────────────────────────────── */}
      <SectionCard
        icon={MessageSquare}
        title="SMS Notifications"
        description="Text messages sent to your registered mobile number"
        badge="₹0 extra"
        badgeClass="bg-emerald-50 text-emerald-600 border-emerald-100"
        headerExtra={
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border
              ${preferences.sms.enabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              {preferences.sms.enabled ? 'Active' : 'Off'}
            </span>
            <Switch
              checked={preferences.sms.enabled}
              onCheckedChange={(v) => updateSms('enabled', v)}
            />
          </div>
        }
      >
        <AnimatePresence mode="wait">
          {preferences.sms.enabled ? (
            <motion.div
              key="sms-on"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                SMS uses your registered phone number. Standard messaging rates may apply per carrier.
              </p>
              {SMS_NOTIFICATIONS.map((n, i) => (
                <NotifRow
                  key={n.key}
                  icon={n.icon}
                  iconClass="bg-emerald-50 text-emerald-600"
                  label={n.label}
                  description={n.description}
                  checked={preferences.sms[n.key as keyof typeof preferences.sms] as boolean}
                  onCheckedChange={(v) => updateSms(n.key as keyof NotificationPreferences['sms'], v)}
                  delay={i * 0.05}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="sms-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 gap-2 text-center"
            >
              <VolumeX className="h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">SMS notifications are turned off</p>
              <p className="text-xs text-slate-400">Toggle above to enable SMS alerts for critical events</p>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* ── Quiet Hours ───────────────────────────────────────────────────────── */}
      <SectionCard
        icon={Moon}
        title="Quiet Hours"
        description="Pause non-critical notifications during specific hours"
        headerExtra={
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border
              ${preferences.quietHours.enabled ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              {preferences.quietHours.enabled ? 'Active' : 'Off'}
            </span>
            <Switch
              checked={preferences.quietHours.enabled}
              onCheckedChange={(v) => updateQuietHours('enabled', v)}
            />
          </div>
        }
      >
        <AnimatePresence mode="wait">
          {preferences.quietHours.enabled ? (
            <motion.div
              key="quiet-on"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-600 shrink-0" />
                <p className="text-xs font-medium text-indigo-700">
                  Non-critical emails and push notifications will be silenced during quiet hours. Critical alerts like payments and security events are always delivered.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                    <Moon className="h-3 w-3" /> Do Not Disturb From
                  </Label>
                  <input
                    type="time"
                    value={preferences.quietHours.from}
                    onChange={(e) => updateQuietHours('from', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0] bg-white"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                    <Sun className="h-3 w-3" /> Resume At
                  </Label>
                  <input
                    type="time"
                    value={preferences.quietHours.to}
                    onChange={(e) => updateQuietHours('to', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0] bg-white"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Currently set: silence from <strong className="text-slate-600">{preferences.quietHours.from}</strong> to <strong className="text-slate-600">{preferences.quietHours.to}</strong>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="quiet-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 py-4"
            >
              <Volume2 className="h-8 w-8 text-slate-300" />
              <div>
                <p className="text-sm font-semibold text-slate-500">All notifications delivered anytime</p>
                <p className="text-xs text-slate-400 mt-0.5">Enable quiet hours to pause non-critical alerts at night</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* ── Why Notifications Matter ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-[#2874f0]" />
          <h3 className="text-sm font-semibold text-slate-700">Why Stay Notified?</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              icon: TrendingUp,
              title: 'Faster Response = More Revenue',
              desc: 'Vendors who respond to bookings within 5 minutes see 3× higher conversion rates.',
              color: 'text-emerald-600', bg: 'bg-emerald-50',
            },
            {
              icon: Users,
              title: 'Retain Customers',
              desc: 'Timely review responses improve your rating and attract repeat renters.',
              color: 'text-blue-600', bg: 'bg-blue-50',
            },
            {
              icon: ShieldCheck,
              title: 'Stay Secure',
              desc: 'Immediate alerts on suspicious activity keep your account and payouts safe.',
              color: 'text-violet-600', bg: 'bg-violet-50',
            },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`${item.bg} rounded-lg p-2 w-fit mb-3`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Platform Delivery Statement ───────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <div className="bg-white/10 rounded-lg p-2 shrink-0">
            <BadgeCheck className="h-5 w-5 text-green-300" />
          </div>
          <div>
            <p className="font-semibold text-sm">Reliable Notification Delivery</p>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
              Our notification pipeline runs on a <strong className="text-white">multi-region infrastructure</strong> with
              99.9% uptime SLA. Emails are sent via dedicated IP with SPF/DKIM/DMARC configured to ensure inbox
              delivery — not spam. Push notifications use <strong className="text-white">FCM & APNs</strong> with retry
              logic for offline devices.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['99.9% Uptime', 'SPF/DKIM/DMARC', 'FCM + APNs', 'Retry Logic', 'Multi-region', 'Opt-out Compliant'].map((tag) => (
                <span key={tag} className="text-[10px] font-semibold bg-white/10 border border-white/20 px-2 py-0.5 rounded-full text-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Save Footer ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-slate-100 -mx-4 px-4 py-4 flex items-center justify-between rounded-b-2xl shadow-lg"
          >
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              You have unsaved changes
            </p>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#2874f0] hover:bg-[#1a55c4] text-white font-semibold gap-2 px-8 rounded-xl shadow-md shadow-[#2874f0]/30"
            >
              {isSaving
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                : <><Save className="h-4 w-4" /> Save Preferences</>
              }
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}