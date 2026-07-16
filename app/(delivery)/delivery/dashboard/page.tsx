'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  Package,
  Truck,
  Clock,
  Star,
  Calendar,
  MapPin,
  TrendingUp,
  DollarSign,
  Award,
  Zap,
  CheckCircle,
  ArrowRight,
  Navigation,
  Phone,
  Activity,
  Sparkles,
  Shield,
  ThumbsUp,
  Headphones,
  Wifi,
  WifiOff,
  Target,
  Crown,
  CircleAlert,
  RefreshCw,
  Route,
  Gift,
  BadgeCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext'
import type { ActivityItem, PartnerDelivery } from '@/lib/api/delivery'

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  subtitle,
  loading,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
  trend?: { value: number; isPositive: boolean }
  subtitle?: string
  loading?: boolean
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-orange-100/80 bg-white p-5 shadow-sm transition-all hover:shadow-lg dark:border-orange-900/30 dark:bg-[#1a0900]"
    >
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10" style={{ backgroundColor: color }} />
      <div className="flex items-center justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        {trend && !loading && (
          <span
            className={`flex items-center gap-0.5 text-xs font-bold ${
              trend.isPositive ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            <TrendingUp className={`h-3 w-3 ${!trend.isPositive ? 'rotate-180' : ''}`} />
            {trend.value}%
          </span>
        )}
      </div>
      {loading ? (
        <div className="mt-4 h-8 w-24 animate-pulse rounded-lg bg-orange-50 dark:bg-orange-950/30" />
      ) : (
        <p className="mt-4 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      )}
      <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
      {subtitle && !loading && (
        <p className="mt-0.5 text-[10px] text-orange-500/70">{subtitle}</p>
      )}
    </motion.div>
  )
}

function DeliveryCard({
  delivery,
  onStart,
  variant = 'today',
}: {
  delivery: PartnerDelivery
  onStart: (id: string) => void
  variant?: 'today' | 'active'
}) {
  const priorityConfig = {
    high: { color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300', icon: Zap },
    medium: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', icon: Clock },
    low: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', icon: CheckCircle },
    urgent: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300', icon: CircleAlert },
  }
  const cfg = priorityConfig[delivery.priority] ?? priorityConfig.medium
  const PriorityIcon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      className="cursor-pointer rounded-2xl border border-orange-100/80 bg-white p-4 transition-all hover:border-orange-200 hover:shadow-md dark:border-orange-900/30 dark:bg-[#1a0900] dark:hover:border-orange-800/50"
      onClick={() => onStart(delivery._id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <p className="font-mono text-[11px] text-gray-400">{delivery.deliveryNumber}</p>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.color}`}>
              <PriorityIcon className="h-2.5 w-2.5" />
              {delivery.priority.toUpperCase()}
            </span>
            {variant === 'active' && (
              <Badge className="border-0 bg-emerald-500 text-[10px] font-bold text-white">IN PROGRESS</Badge>
            )}
            <span className="text-[10px] capitalize text-gray-400">{delivery.type}</span>
          </div>
          <h4 className="truncate font-bold text-gray-900 dark:text-white">{delivery.address.contactName}</h4>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3 w-3 shrink-0 text-orange-500" />
            <span className="truncate">
              {delivery.address.addressLine1}, {delivery.address.city}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {delivery.schedule.scheduledSlot}
            </span>
            {delivery.distance != null && (
              <span className="flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                {delivery.distance} km
              </span>
            )}
            {delivery.earnings != null && (
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <DollarSign className="h-3 w-3" />₹{delivery.earnings}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Button
            size="sm"
            className="h-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-xs font-bold text-white shadow-md shadow-orange-900/20 hover:from-orange-600 hover:to-amber-600"
            onClick={(e) => {
              e.stopPropagation()
              onStart(delivery._id)
            }}
          >
            {variant === 'active' ? 'Continue' : 'Start'}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
          <a
            href={`tel:${delivery.address.contactPhone}`}
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 transition-colors hover:text-orange-500"
          >
            <Phone className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.div>
  )
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const statusConfig = {
    success: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-950/40' },
    pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-950/40' },
    warning: { icon: CircleAlert, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950/40' },
    failed: { icon: CircleAlert, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-950/40' },
    cancelled: { icon: CircleAlert, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-900/40' },
  }
  const cfg = statusConfig[activity.status]
  const StatusIcon = cfg.icon

  return (
    <div className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-orange-50/50 dark:hover:bg-orange-950/20">
      <div className={`rounded-xl p-2 ${cfg.bg}`}>
        <StatusIcon className={`h-4 w-4 ${cfg.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{activity.action}</p>
        <p className="text-xs text-gray-500">{activity.customer}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400">{activity.time}</p>
        {activity.earnings != null && (
          <p className="text-xs font-bold text-emerald-600">+₹{activity.earnings}</p>
        )}
        {activity.rating != null && (
          <div className="flex items-center justify-end gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold">{activity.rating}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function DeliveryDashboardPage() {
  const { status: sessionStatus } = useSession()
  const router = useRouter()
  const toast = useToast()
  const {
    profile,
    stats,
    todayDeliveries,
    activeDeliveries,
    activities,
    isLoading,
    isUsingFallback,
    refresh,
    toggleOnDuty,
  } = useDeliveryPartner()

  const [networkOnline, setNetworkOnline] = useState(true)
  const [greeting, setGreeting] = useState('Good Morning')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    const on = () => setNetworkOnline(true)
    const off = () => setNetworkOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/delivery/auth/login')
    }
  }, [sessionStatus, router])

  const fullName = profile
    ? `${profile.user.profile.firstName} ${profile.user.profile.lastName}`.trim()
    : 'Delivery Partner'

  const isOnDuty = profile?.availability.isOnDuty ?? false

  const statCards = useMemo(
    () => [
      {
        title: "Today's Deliveries",
        value: `${stats?.completedToday ?? 0}/${stats?.todayDeliveries ?? 0}`,
        icon: Package,
        color: '#f97316',
        subtitle: `${stats?.pendingToday ?? 0} remaining`,
      },
      {
        title: 'Today Earnings',
        value: `₹${(stats?.todayEarnings ?? stats?.thisWeekEarnings ?? 0).toLocaleString()}`,
        icon: DollarSign,
        color: '#10b981',
        trend: { value: 12, isPositive: true },
        subtitle: 'Keep going!',
      },
      {
        title: 'Rating',
        value: `${stats?.rating ?? profile?.performance.averageRating ?? 0} ★`,
        icon: Star,
        color: '#fbbf24',
        subtitle: `${stats?.totalDeliveries ?? 0} total trips`,
      },
      {
        title: 'On-Time Rate',
        value: `${stats?.onTimeRate ?? 0}%`,
        icon: Target,
        color: '#8b5cf6',
        trend: { value: 2, isPositive: true },
        subtitle: 'Performance score',
      },
    ],
    [stats, profile],
  )

  const handleStartDelivery = (deliveryId: string) => {
    router.push(`/delivery/active/${deliveryId}`)
  }

  const handleToggleAvailability = async () => {
    await toggleOnDuty()
    toast.success(isOnDuty ? 'You are now off duty' : 'You are now on duty')
  }

  if (sessionStatus === 'loading' || (isLoading && !profile)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-sm font-medium text-gray-500">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Demo data banner */}
      <AnimatePresence>
        {isUsingFallback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 dark:border-amber-900/40 dark:from-amber-950/30 dark:to-orange-950/20"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Showing demo data — connect to backend for live stats
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              className="h-8 rounded-xl border-amber-300 text-xs font-semibold text-amber-800 hover:bg-amber-100"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline banner */}
      <AnimatePresence>
        {!networkOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl bg-red-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <WifiOff className="h-4 w-4" />
              You are offline. Some features may be unavailable.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 p-6 text-white shadow-xl shadow-orange-900/25 md:p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-amber-300/20 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-orange-100">{greeting}!</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">{fullName}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className="border-0 bg-white/20 text-white backdrop-blur-sm">
                ID: {profile?.employeeId}
              </Badge>
              <Badge className={`border-0 ${isOnDuty ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
                {isOnDuty ? 'On Duty' : 'Off Duty'}
              </Badge>
              {profile?.zone && (
                <Badge className="border-0 bg-white/15 text-orange-100 capitalize">
                  {profile.zone} zone
                </Badge>
              )}
            </div>
            <p className="mt-3 max-w-lg text-sm text-orange-100/90">
              {isOnDuty
                ? `You're on track today. ${stats?.pendingToday ?? 0} deliveries remaining — earn up to ₹${((stats?.pendingToday ?? 0) * 85).toLocaleString()} more.`
                : 'Go on duty to start receiving delivery assignments in your zone.'}
            </p>
            <p className="mt-2 text-xs text-orange-200/70">
              {format(new Date(), 'EEEE, MMMM d · hh:mm a')}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-center backdrop-blur-md">
              <p className="text-2xl font-black">₹{(stats?.totalEarnings ?? profile?.performance.totalEarnings ?? 0).toLocaleString()}</p>
              <p className="text-xs text-orange-100/80">Lifetime earnings</p>
            </div>
            <Button
              onClick={handleToggleAvailability}
              className={`h-12 rounded-2xl px-6 font-bold shadow-lg ${
                isOnDuty
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {isOnDuty ? (
                <>
                  <WifiOff className="mr-2 h-4 w-4" />
                  Go Off Duty
                </>
              ) : (
                <>
                  <Wifi className="mr-2 h-4 w-4" />
                  Go On Duty
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card, idx) => (
          <StatCard key={idx} {...card} loading={isLoading} />
        ))}
      </div>

      {/* Quick actions strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: '/delivery/orders', icon: Package, label: 'Active Orders', count: activeDeliveries.length },
          { href: '/delivery/navigate', icon: Route, label: 'Navigate', count: null },
          { href: '/delivery/earnings', icon: DollarSign, label: 'Earnings', count: null },
          { href: '/delivery/schedule', icon: Calendar, label: 'Schedule', count: null },
        ].map(({ href, icon: Icon, label, count }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 rounded-2xl border border-orange-100/80 bg-white p-4 transition-all hover:border-orange-300 hover:shadow-md dark:border-orange-900/30 dark:bg-[#1a0900]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 transition-colors group-hover:bg-orange-100 dark:bg-orange-950/40">
              <Icon className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
              {count != null && count > 0 && (
                <p className="text-xs text-orange-500">{count} active</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Active deliveries */}
      {activeDeliveries.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 dark:text-white">
              <Truck className="h-5 w-5 text-emerald-500" />
              Active Now
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                {activeDeliveries.length}
              </span>
            </h2>
            <Link href="/delivery/orders" className="text-xs font-semibold text-orange-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {activeDeliveries.map((d) => (
              <DeliveryCard key={d._id} delivery={d} onStart={handleStartDelivery} variant="active" />
            ))}
          </div>
        </section>
      )}

      {/* Shift + vehicle row */}
      <div className="grid gap-4 md:grid-cols-2">
        {profile?.availability.shifts && (
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 dark:border-blue-900/30 dark:from-blue-950/30 dark:to-indigo-950/20">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-900/20">
                <Clock className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-blue-900 dark:text-blue-100">Shift Schedule</p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  Today: {profile.availability.shifts.start} – {profile.availability.shifts.end}
                </p>
                <p className="mt-1 text-xs text-blue-600/80 dark:text-blue-400/80">
                  {profile.availability.shifts.workingDays
                    .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
                    .join(' · ')}
                </p>
              </div>
              <Link href="/delivery/schedule">
                <Button size="sm" variant="outline" className="rounded-xl border-blue-200 text-blue-700">
                  View
                </Button>
              </Link>
            </div>
          </div>
        )}

        {profile?.vehicle && (
          <div className="rounded-2xl border border-orange-100 bg-white p-5 dark:border-orange-900/30 dark:bg-[#1a0900]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/40">
                <Truck className="h-6 w-6 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white">Your Vehicle</p>
                <p className="truncate text-sm text-gray-500">
                  {profile.vehicle.type.charAt(0).toUpperCase() + profile.vehicle.type.slice(1)} ·{' '}
                  {profile.vehicle.number}
                  {profile.vehicle.model ? ` · ${profile.vehicle.model}` : ''}
                </p>
              </div>
              <Link href="/delivery/profile" className="text-xs font-semibold text-orange-600 hover:underline">
                Update
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Today's deliveries */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 dark:text-white">
            <Calendar className="h-5 w-5 text-orange-500" />
            Today&apos;s Deliveries
            {todayDeliveries.length > 0 && (
              <span className="text-sm font-medium text-gray-400">({todayDeliveries.length})</span>
            )}
          </h2>
          <Link href="/delivery/orders" className="text-xs font-semibold text-orange-600 hover:underline">
            View all →
          </Link>
        </div>
        {todayDeliveries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/30 py-14 text-center dark:border-orange-900/40 dark:bg-orange-950/10">
            <Package className="mx-auto mb-3 h-12 w-12 text-orange-300" />
            <p className="font-semibold text-gray-600 dark:text-gray-300">No deliveries scheduled</p>
            <p className="mt-1 text-xs text-gray-400">Stay on duty — new orders appear here automatically</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayDeliveries.map((d) => (
              <DeliveryCard key={d._id} delivery={d} onStart={handleStartDelivery} />
            ))}
          </div>
        )}
      </section>

      {/* Activity + sidebar content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-gray-900 dark:text-white">
            <Activity className="h-5 w-5 text-orange-500" />
            Recent Activity
          </h2>
          <div className="divide-y divide-orange-50 rounded-2xl border border-orange-100/80 bg-white dark:divide-orange-900/20 dark:border-orange-900/30 dark:bg-[#1a0900]">
            {activities.map((a) => (
              <ActivityRow key={a.id} activity={a} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Performance badges */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:border-amber-900/40 dark:from-amber-950/30 dark:to-orange-950/20">
            <div className="flex items-start gap-3">
              <Crown className="h-8 w-8 text-amber-500" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-100">Partner Badges</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(stats?.onTimeRate ?? 0) >= 95 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-sm dark:bg-black/20">
                      <BadgeCheck className="h-3 w-3 text-emerald-600" /> Punctual Pro
                    </span>
                  )}
                  {(stats?.rating ?? 0) >= 4.8 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-sm dark:bg-black/20">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Top Rated
                    </span>
                  )}
                  {(stats?.acceptanceRate ?? 0) >= 95 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-sm dark:bg-black/20">
                      <ThumbsUp className="h-3 w-3 text-emerald-600" /> Reliable
                    </span>
                  )}
                  {(stats?.totalDeliveries ?? 0) >= 100 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-sm dark:bg-black/20">
                      <Award className="h-3 w-3 text-amber-600" /> Century Club
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bonus promo */}
          <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-500/10 to-amber-500/5 p-5 dark:border-orange-800/40">
            <div className="flex items-start gap-3">
              <Gift className="h-6 w-6 text-orange-500" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Weekend Bonus</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  Complete 5 more deliveries today to unlock a ₹200 bonus. Peak hours 5–8 PM pay 1.5× in your zone.
                </p>
              </div>
            </div>
          </div>

          {/* Safety tip */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-900 dark:text-emerald-100">Safety First</p>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                  Always verify customer ID for high-value items. Use in-app navigation and keep your phone charged.
                </p>
              </div>
            </div>
          </div>

          {/* Support */}
          <Link
            href="/delivery/support"
            className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-white p-4 transition-all hover:shadow-md dark:border-orange-900/30 dark:bg-[#1a0900]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
              <Headphones className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white">Need Help?</p>
              <p className="text-xs text-gray-500">24/7 partner support</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  )
}
