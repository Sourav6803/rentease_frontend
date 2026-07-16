

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Sun,
  Moon,
  SunMoon,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  X,
  Coffee,
  Zap,
  TrendingUp,
  Users,
  Copy,
  RotateCcw,
  Info,
  Sparkles,
  BadgeCheck,
  ChevronDown,
  Building2,
  Star,
  Timer,
  Globe,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ── Constants ──────────────────────────────────────────────────────────────────
const DAYS = [
  { id: 'monday',    label: 'Monday',    short: 'Mon', weekend: false },
  { id: 'tuesday',   label: 'Tuesday',   short: 'Tue', weekend: false },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed', weekend: false },
  { id: 'thursday',  label: 'Thursday',  short: 'Thu', weekend: false },
  { id: 'friday',    label: 'Friday',    short: 'Fri', weekend: false },
  { id: 'saturday',  label: 'Saturday',  short: 'Sat', weekend: true  },
  { id: 'sunday',    label: 'Sunday',    short: 'Sun', weekend: true  },
]

// 15-min slots from 00:00 → 23:45
const TIME_SLOTS = Array.from({ length: 24 * 4 }, (_, i) => {
  const h = Math.floor(i / 4).toString().padStart(2, '0')
  const m = ((i % 4) * 15).toString().padStart(2, '0')
  return `${h}:${m}`
})

const QUICK_PRESETS = [
  { label: 'Standard (Mon–Fri)', icon: Building2, apply: (hours: BusinessHour[]) =>
      hours.map(h => ({ ...h, isOpen: !DAYS.find(d => d.id === h.day)?.weekend, openTime: '09:00', closeTime: '18:00' }))
  },
  { label: 'Retail (Mon–Sat)', icon: Star, apply: (hours: BusinessHour[]) =>
      hours.map(h => ({ ...h, isOpen: h.day !== 'sunday', openTime: '10:00', closeTime: '20:00' }))
  },
  { label: 'Always Open (7 days)', icon: Globe, apply: (hours: BusinessHour[]) =>
      hours.map(h => ({ ...h, isOpen: true, openTime: '08:00', closeTime: '22:00' }))
  },
  { label: 'Half Day (9 AM–1 PM)', icon: Sun, apply: (hours: BusinessHour[]) =>
      hours.map(h => ({ ...h, isOpen: !DAYS.find(d => d.id === h.day)?.weekend, openTime: '09:00', closeTime: '13:00' }))
  },
]

const DEFAULT_HOURS = DAYS.map(d => ({
  day: d.id,
  isOpen: d.id !== 'sunday',
  openTime: '09:00',
  closeTime: '18:00',
  breaks: [] as { start: string; end: string }[],
}))

// ── Types ──────────────────────────────────────────────────────────────────────
interface BusinessHour {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
  breaks: { start: string; end: string }[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
function minutesToHours(m: number) {
  return (m / 60).toFixed(1).replace('.0', '')
}
function fmt12(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}
function getDayHours(hour: BusinessHour) {
  if (!hour.isOpen) return 0
  const total = timeToMinutes(hour.closeTime) - timeToMinutes(hour.openTime)
  const breakMins = hour.breaks.reduce((a, b) => a + timeToMinutes(b.end) - timeToMinutes(b.start), 0)
  return Math.max(0, total - breakMins)
}

function SectionCard({
  icon: Icon,
  title,
  description,
  headerExtra,
  children,
  className = '',
}: {
  icon: React.ElementType
  title: string
  description?: string
  headerExtra?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={`border border-slate-100 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#2874f0]/10 rounded-lg p-1.5">
              <Icon className="h-4 w-4 text-[#2874f0]" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-700">{title}</CardTitle>
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

// Inline time select – lighter than full Select for compact layout
function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1.5 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 focus:border-[#2874f0] bg-white text-slate-700 cursor-pointer"
    >
      {TIME_SLOTS.map((t) => (
        <option key={t} value={t}>{fmt12(t)}</option>
      ))}
    </select>
  )
}

// Visual bar showing open window in a 24h strip
function DayTimeline({ hour }: { hour: BusinessHour }) {
  if (!hour.isOpen) {
    return (
      <div className="h-2 bg-slate-100 rounded-full w-full flex items-center justify-center">
        <span className="text-[9px] text-slate-400 font-semibold tracking-wider">CLOSED</span>
      </div>
    )
  }
  const openPct = (timeToMinutes(hour.openTime) / (24 * 60)) * 100
  const closePct = (timeToMinutes(hour.closeTime) / (24 * 60)) * 100
  const width = closePct - openPct
  return (
    <div className="relative h-2 bg-slate-100 rounded-full w-full overflow-hidden">
      <div
        className="absolute h-full bg-gradient-to-r from-[#2874f0] to-[#5b9bf8] rounded-full"
        style={{ left: `${openPct}%`, width: `${width}%` }}
      />
      {hour.breaks.map((b, i) => {
        const bLeft = (timeToMinutes(b.start) / (24 * 60)) * 100
        const bW = ((timeToMinutes(b.end) - timeToMinutes(b.start)) / (24 * 60)) * 100
        return (
          <div key={i}
            className="absolute h-full bg-amber-300 rounded-full"
            style={{ left: `${bLeft}%`, width: `${bW}%` }}
          />
        )
      })}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function BusinessHoursPage() {
  const { data: session, status } = useSession()
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(DEFAULT_HOURS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const hasFetched = useRef(false)

  // ── Fixed: single fetch once session is ready ─────────────────────────────
  const fetchBusinessHours = useCallback(async (token: string) => {
    try {
      setIsLoading(true)
      const res = await axios.get(`${BASE_URL}/api/v1/vendor/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        const profile = res.data.data.profile
        setBusinessHours(profile?.settings?.businessHours || DEFAULT_HOURS)
      }
    } catch (err) {
      console.error('Error fetching business hours:', err)
      toast.error('Failed to load business hours')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    const token = session?.user?.accessToken
    if (!token || hasFetched.current) return
    hasFetched.current = true
    fetchBusinessHours(token)
  }, [status, session?.user?.accessToken, fetchBusinessHours])

  // ── Mutations ──────────────────────────────────────────────────────────────
  const update = (dayId: string, patch: Partial<BusinessHour>) => {
    setBusinessHours(prev => prev.map(h => h.day === dayId ? { ...h, ...patch } : h))
    setHasChanges(true)
  }
  const addBreak = (dayId: string) => {
    setBusinessHours(prev => prev.map(h =>
      h.day === dayId ? { ...h, breaks: [...h.breaks, { start: '13:00', end: '14:00' }] } : h
    ))
    setHasChanges(true)
  }
  const removeBreak = (dayId: string, idx: number) => {
    setBusinessHours(prev => prev.map(h =>
      h.day === dayId ? { ...h, breaks: h.breaks.filter((_, i) => i !== idx) } : h
    ))
    setHasChanges(true)
  }
  const updateBreak = (dayId: string, idx: number, patch: Partial<{ start: string; end: string }>) => {
    setBusinessHours(prev => prev.map(h =>
      h.day === dayId
        ? { ...h, breaks: h.breaks.map((b, i) => i === idx ? { ...b, ...patch } : b) }
        : h
    ))
    setHasChanges(true)
  }
  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setBusinessHours(h => preset.apply(h))
    setHasChanges(true)
    toast.success(`Applied preset: ${preset.label}`)
  }
  const copyToAll = (sourceDay: string) => {
    const src = businessHours.find(h => h.day === sourceDay)
    if (!src) return
    setBusinessHours(prev => prev.map(h => ({
      ...h, isOpen: src.isOpen, openTime: src.openTime, closeTime: src.closeTime, breaks: [...src.breaks]
    })))
    setHasChanges(true)
    toast.success(`Copied ${sourceDay}'s hours to all days`)
  }
  const resetToDefault = () => {
    setBusinessHours(DEFAULT_HOURS)
    setHasChanges(true)
    toast('Reset to default hours')
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await axios.put(
        `${BASE_URL}/api/v1/vendor/business-hours`,
        { businessHours },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      )
      if (res.data.success) {
        toast.success('Business hours saved successfully')
        setHasChanges(false)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save business hours')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const openDays = businessHours.filter(h => h.isOpen).length
  const totalHoursPerWeek = businessHours.reduce((acc, h) => acc + getDayHours(h), 0)
  const avgDailyHours = openDays > 0 ? (totalHoursPerWeek / openDays).toFixed(1) : '0'

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-[#2874f0]/20 border-t-[#2874f0] animate-spin" />
          <Clock className="absolute inset-0 m-auto h-5 w-5 text-[#2874f0]" />
        </div>
        <p className="text-sm text-slate-400 font-medium">Loading business hours…</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2e6c] via-[#2874f0] to-[#0f52c4] text-white p-6 shadow-xl shadow-[#2874f0]/25">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm">
              <Clock className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Business Hours</h1>
              <p className="text-blue-200 text-sm mt-0.5">
                Control your operational schedule · Visible to all customers
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-xs font-semibold px-3 py-1 rounded-full text-blue-100">
                  <CheckCircle className="h-3 w-3 text-green-300" />
                  {openDays} / 7 days open
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-xs font-semibold px-3 py-1 rounded-full text-blue-100">
                  <Timer className="h-3 w-3" />
                  {minutesToHours(totalHoursPerWeek)}h / week
                </span>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {hasChanges && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  size="sm"
                  className="bg-white text-[#2874f0] hover:bg-blue-50 font-semibold gap-2 shadow-none"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Hours
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: CheckCircle, label: 'Open Days',        value: openDays,                               color: 'bg-emerald-50 text-emerald-600' },
          { icon: X,           label: 'Closed Days',       value: 7 - openDays,                           color: 'bg-red-50 text-red-500'    },
          { icon: Timer,       label: 'Hours / Week',      value: minutesToHours(totalHoursPerWeek) + 'h', color: 'bg-blue-50 text-blue-600'  },
          { icon: Sun,         label: 'Avg Daily Hours',   value: avgDailyHours + 'h',                    color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold text-slate-800 tracking-tight">{s.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* ── Quick Presets ────────────────────────────────────────────────────── */}
      <SectionCard
        icon={Zap}
        title="Quick Presets"
        description="Apply a schedule template instantly — customise afterwards"
        headerExtra={
          <Button variant="ghost" size="sm" onClick={resetToDefault}
            className="text-xs text-slate-500 hover:text-slate-700 gap-1.5 h-7 px-2">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_PRESETS.map((preset, i) => {
            const Icon = preset.icon
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-[#2874f0] hover:bg-[#2874f0]/5 transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-[#2874f0]/10 flex items-center justify-center transition-colors">
                  <Icon className="h-5 w-5 text-slate-500 group-hover:text-[#2874f0] transition-colors" />
                </div>
                <span className="text-xs font-semibold text-slate-600 group-hover:text-[#2874f0] leading-tight transition-colors">
                  {preset.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </SectionCard>

      {/* ── Visual Week Overview ─────────────────────────────────────────────── */}
      <SectionCard icon={Calendar} title="Week at a Glance" description="24-hour timeline — blue = open, amber = break">
        <div className="space-y-3">
          {/* Hour markers */}
          <div className="flex text-[9px] text-slate-300 font-mono px-0 mb-1">
            {['12a','3a','6a','9a','12p','3p','6p','9p','12a'].map((t, i) => (
              <span key={i} className="flex-1 text-center">{t}</span>
            ))}
          </div>
          {businessHours.map((h, i) => {
            const day = DAYS.find(d => d.id === h.day)!
            return (
              <motion.div key={h.day}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3"
              >
                <span className={`w-9 text-[11px] font-bold shrink-0 ${day.weekend ? 'text-amber-500' : 'text-slate-500'}`}>
                  {day.short}
                </span>
                <div className="flex-1">
                  <DayTimeline hour={h} />
                </div>
                <span className="w-20 text-[10px] text-slate-400 font-medium text-right shrink-0">
                  {h.isOpen ? `${fmt12(h.openTime).replace(' ', '')}` : 'Closed'}
                </span>
              </motion.div>
            )
          })}
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-3 h-2 bg-gradient-to-r from-[#2874f0] to-[#5b9bf8] rounded-sm inline-block" />
              Open hours
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-3 h-2 bg-amber-300 rounded-sm inline-block" />
              Break time
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-3 h-2 bg-slate-200 rounded-sm inline-block" />
              Closed
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ── Weekly Schedule Editor ────────────────────────────────────────────── */}
      <SectionCard
        icon={Clock}
        title="Weekly Schedule"
        description="Tap a day to expand and configure hours, breaks, and more"
      >
        <div className="space-y-2">
          {businessHours.map((hour, idx) => {
            const day = DAYS.find(d => d.id === hour.day)!
            const isExpanded = expandedDay === hour.day
            const hoursToday = getDayHours(hour)

            return (
              <motion.div
                key={hour.day}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`rounded-xl border transition-all overflow-hidden
                  ${hour.isOpen
                    ? 'bg-white border-slate-100 shadow-sm'
                    : 'bg-slate-50/60 border-slate-100 opacity-70'
                  }
                  ${isExpanded ? 'ring-2 ring-[#2874f0]/20 border-[#2874f0]/30' : ''}`}
              >
                {/* Day header row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                  onClick={() => setExpandedDay(isExpanded ? null : hour.day)}
                >
                  {/* Day pill */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm
                    ${hour.isOpen
                      ? day.weekend ? 'bg-amber-50 text-amber-600' : 'bg-[#2874f0]/10 text-[#2874f0]'
                      : 'bg-slate-100 text-slate-400'
                    }`}>
                    {day.short}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-800 capitalize">{hour.day}</span>
                      {day.weekend && (
                        <span className="text-[10px] font-semibold text-amber-500 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">
                          Weekend
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {hour.isOpen
                        ? `${fmt12(hour.openTime)} – ${fmt12(hour.closeTime)}${hour.breaks.length > 0 ? ` · ${hour.breaks.length} break` : ''}`
                        : 'Closed all day'
                      }
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {hour.isOpen && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full hidden sm:inline-flex">
                        {minutesToHours(hoursToday)}h
                      </span>
                    )}
                    <Switch
                      checked={hour.isOpen}
                      onCheckedChange={(v) => { update(hour.day, { isOpen: v }); setExpandedDay(v ? hour.day : null) }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && hour.isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4">

                        {/* Open / Close times */}
                        <div>
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Operating Hours</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                              <Sun className="h-4 w-4 text-amber-500 shrink-0" />
                              <span className="text-xs text-slate-500 font-medium">Opens</span>
                              <TimeSelect value={hour.openTime} onChange={(v) => update(hour.day, { openTime: v })} />
                            </div>
                            <span className="text-slate-300 text-sm font-bold">→</span>
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                              <Moon className="h-4 w-4 text-indigo-400 shrink-0" />
                              <span className="text-xs text-slate-500 font-medium">Closes</span>
                              <TimeSelect value={hour.closeTime} onChange={(v) => update(hour.day, { closeTime: v })} />
                            </div>
                          </div>
                        </div>

                        {/* Breaks */}
                        {hour.breaks.length > 0 && (
                          <div>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                              <Coffee className="inline h-3 w-3 mr-1 text-amber-500" />
                              Break Periods
                            </p>
                            <div className="space-y-2">
                              {hour.breaks.map((b, bi) => (
                                <div key={bi} className="flex items-center gap-2 flex-wrap">
                                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                                    <Coffee className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                    <TimeSelect value={b.start} onChange={(v) => updateBreak(hour.day, bi, { start: v })} />
                                    <span className="text-slate-400 text-xs">to</span>
                                    <TimeSelect value={b.end} onChange={(v) => updateBreak(hour.day, bi, { end: v })} />
                                  </div>
                                  <Button type="button" variant="ghost" size="icon"
                                    onClick={() => removeBreak(hour.day, bi)}
                                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action row */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button type="button" variant="outline" size="sm"
                            onClick={() => addBreak(hour.day)}
                            className="text-xs gap-1.5 rounded-lg h-8 border-amber-200 text-amber-700 hover:bg-amber-50">
                            <Coffee className="h-3.5 w-3.5" /> Add Break
                          </Button>
                          <Button type="button" variant="outline" size="sm"
                            onClick={() => copyToAll(hour.day)}
                            className="text-xs gap-1.5 rounded-lg h-8 border-[#2874f0]/30 text-[#2874f0] hover:bg-[#2874f0]/5">
                            <Copy className="h-3.5 w-3.5" /> Copy to All Days
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </SectionCard>

      {/* ── Why Hours Matter ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-[#2874f0]" />
          <h3 className="text-sm font-semibold text-slate-700">Why Accurate Hours Matter</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              icon: TrendingUp, title: 'Higher Booking Rate',
              desc: 'Vendors with accurate hours see 40% more bookings — customers trust businesses that are transparent about availability.',
              color: 'text-emerald-600', bg: 'bg-emerald-50',
            },
            {
              icon: Users, title: 'Better Customer Experience',
              desc: 'Avoid frustrated customers who arrive when you\'re closed. Clear hours reduce negative reviews by up to 25%.',
              color: 'text-blue-600', bg: 'bg-blue-50',
            },
            {
              icon: Star, title: 'Improved Search Ranking',
              desc: 'Businesses with complete profiles and defined hours rank higher in platform search results and discovery feeds.',
              color: 'text-amber-600', bg: 'bg-amber-50',
            },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
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

      {/* ── Holiday & Special Hours Notice ───────────────────────────────────── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 rounded-lg p-2 shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">Holiday & Special Hours</p>
            <p className="text-sm text-amber-700 mt-1 leading-relaxed">
              Planning to close for a festival, maintenance, or local holiday? Contact our Vendor Support team to set
              temporary closure notices or custom date-specific hours. These will appear as banners on your product
              listings so customers are informed in advance.
            </p>
            <Button size="sm" variant="outline"
              className="mt-3 border-amber-300 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-semibold gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Request Holiday Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* ── Platform Statement ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <div className="bg-white/10 rounded-lg p-2 shrink-0">
            <Globe className="h-5 w-5 text-blue-300" />
          </div>
          <div>
            <p className="font-semibold text-sm">Real-Time Availability on Platform</p>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
              Your business hours are reflected <strong className="text-white">live on your product listings</strong> within
              minutes of saving. Customers see an "Open Now" or "Closed" badge in real time, and our booking engine
              automatically blocks rental requests outside your configured hours. Timezone is auto-detected based on your
              registered address.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Live Updates', 'Auto Timezone', 'Booking Gate', 'Customer Visibility', 'Search Indexed'].map((t) => (
                <span key={t} className="text-[10px] font-semibold bg-white/10 border border-white/20 px-2 py-0.5 rounded-full text-slate-200">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Footer ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-slate-100 -mx-4 px-4 py-4 flex items-center justify-between rounded-b-2xl shadow-lg"
          >
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Unsaved changes · Live in &lt; 5 minutes after saving
            </p>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#2874f0] hover:bg-[#1a55c4] text-white font-semibold gap-2 px-8 rounded-xl shadow-md shadow-[#2874f0]/30"
            >
              {isSaving
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                : <><Save className="h-4 w-4" /> Save Business Hours</>
              }
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}