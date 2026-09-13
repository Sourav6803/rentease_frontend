'use client'

/**
 * app/(vendor)/vendor/settings/business-hours/page.tsx
 *
 * Weekly business hours editor.
 *
 * Data flow:
 *   read  → shared React Query cache (GET /vendor/profile/me →
 *           settings.businessHours) so this page reuses the layout/sidebar/header
 *           request instead of issuing its own.
 *   write → PUT /vendor/business-hours via `updateVendorBusinessHours`, then the
 *           shared profile key is invalidated so every consumer repaints.
 *
 * Every value rendered here comes from that document and is normalised by
 * `normalizeBusinessHours` first, so a shuffled, partial or legacy array can
 * never crash the page or hide a day. The document is only loosely validated by
 * the API, so the same module also owns the client-side time/break validation
 * that gates the Save button.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Coffee,
  Copy,
  Globe,
  Info,
  Loader2,
  Moon,
  Plus,
  RotateCcw,
  Save,
  Star,
  Sun,
  Timer,
  Trash2,
  TriangleAlert,
  Undo2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useQueryClient } from '@tanstack/react-query'
import { vendorProfileQueryOptions } from '@/lib/api/vendorProfile'
import { vendorQueryKeys } from '@/lib/api/queryKeys'
import {
  DAY_IDS,
  TIME_SLOTS,
  buildDefaultBusinessHours,
  businessHoursEqual,
  countInvalidDays,
  formatDuration,
  formatTime12,
  getBusinessHoursErrorMessage,
  getDayMeta,
  getDayMinutes,
  getLiveStatus,
  getWindow,
  hasStoredHours,
  isOvernight,
  normalizeBusinessHours,
  toMinutes,
  updateVendorBusinessHours,
  validateBusinessHours,
  type BusinessHour,
  type WeekDay,
} from '@/lib/api/vendorBusinessHours'

const MINUTES_PER_DAY = 24 * 60

/**
 * Nine evenly-spaced axis markers across the 24-hour strip: 12a, 3a, 6a, 9a,
 * 12p, 3p, 6p, 9p, 12a. Derived rather than hard-coded so the labels cannot
 * drift out of step with the 3-hour spacing.
 */
const TIMELINE_TICKS = Array.from({ length: 9 }, (_, index) => {
  const hour = index * 3
  const suffix = hour < 12 || hour === MINUTES_PER_DAY / 60 ? 'a' : 'p'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}${suffix}`
})

// ── Presets ────────────────────────────────────────────────────────────────────

interface Preset {
  id: string
  label: string
  hint: string
  icon: React.ElementType
  /** Returns a brand-new complete week — never mutate existing state. */
  build: () => BusinessHour[]
}

const PRESETS: Preset[] = [
  {
    id: 'standard',
    label: 'Standard week',
    hint: 'Mon–Fri · 9 AM – 6 PM',
    icon: Building2,
    build: () =>
      buildDefaultBusinessHours().map((hour) => ({
        ...hour,
        isOpen: !getDayMeta(hour.day).isWeekend,
        openTime: '09:00',
        closeTime: '18:00',
        breaks: [],
      })),
  },
  {
    id: 'retail',
    label: 'Retail week',
    hint: 'Mon–Sat · 10 AM – 8 PM',
    icon: Star,
    build: () =>
      buildDefaultBusinessHours().map((hour) => ({
        ...hour,
        isOpen: hour.day !== 'sunday',
        openTime: '10:00',
        closeTime: '20:00',
        breaks: [],
      })),
  },
  {
    id: 'extended',
    label: 'Extended hours',
    hint: 'All 7 days · 8 AM – 10 PM',
    icon: Globe,
    build: () =>
      buildDefaultBusinessHours().map((hour) => ({
        ...hour,
        isOpen: true,
        openTime: '08:00',
        closeTime: '22:00',
        breaks: [],
      })),
  },
  {
    id: 'half-day',
    label: 'Half day',
    hint: 'Mon–Fri · 9 AM – 1 PM',
    icon: Sun,
    build: () =>
      buildDefaultBusinessHours().map((hour) => ({
        ...hour,
        isOpen: !getDayMeta(hour.day).isWeekend,
        openTime: '09:00',
        closeTime: '13:00',
        breaks: [],
      })),
  },
]

// ── Small building blocks ──────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  description,
  headerExtra,
  children,
}: {
  icon: React.ElementType
  title: string
  description?: string
  headerExtra?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="rounded-lg bg-[#2874f0]/10 p-1.5">
            <Icon className="h-4 w-4 text-[#2874f0]" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-700">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            ) : null}
          </div>
        </div>
        {headerExtra}
      </header>
      <div className="px-5 py-5">{children}</div>
    </section>
  )
}

function TimeSelect({
  value,
  onChange,
  label,
  invalid = false,
}: {
  value: string
  onChange: (next: string) => void
  label: string
  invalid?: boolean
}) {
  const morning = TIME_SLOTS.filter((slot) => toMinutes(slot) < 12 * 60)
  const afternoon = TIME_SLOTS.filter((slot) => toMinutes(slot) >= 12 * 60)

  return (
    <select
      aria-label={label}
      aria-invalid={invalid || undefined}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`cursor-pointer rounded-lg border bg-white px-2 py-1.5 font-mono text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-[#2874f0]/30 ${
        invalid
          ? 'border-red-300 focus:border-red-400'
          : 'border-slate-200 focus:border-[#2874f0]'
      }`}
    >
      <optgroup label="AM">
        {morning.map((slot) => (
          <option key={slot} value={slot}>
            {formatTime12(slot)}
          </option>
        ))}
      </optgroup>
      <optgroup label="PM">
        {afternoon.map((slot) => (
          <option key={slot} value={slot}>
            {formatTime12(slot)}
          </option>
        ))}
      </optgroup>
    </select>
  )
}

/**
 * Split an absolute [from, to) minute range into segments that each stay within
 * a single calendar day, so an overnight window (or a break that crosses
 * midnight) still renders inside the 24-hour strip.
 *
 * Every returned `from` is a 0..1439 clock minute, and segments are guaranteed
 * non-empty so callers cannot render a zero-width bar or loop forever.
 */
function daySegments(from: number, to: number): Array<{ from: number; to: number }> {
  const segments: Array<{ from: number; to: number }> = []
  let cursor = Math.max(0, from)

  while (cursor < to) {
    const dayIndex = Math.floor(cursor / MINUTES_PER_DAY)
    const sliceEnd = Math.min(to, (dayIndex + 1) * MINUTES_PER_DAY)
    const length = sliceEnd - cursor
    if (length <= 0) break

    const start = cursor - dayIndex * MINUTES_PER_DAY
    segments.push({ from: start, to: start + length })
    cursor = sliceEnd
  }

  return segments
}

function pct(minutes: number) {
  return (minutes / MINUTES_PER_DAY) * 100
}

function DayTimeline({ hour }: { hour: BusinessHour }) {
  if (!hour.isOpen) {
    return (
      <div className="flex h-2 w-full items-center justify-center rounded-full bg-slate-100">
        <span className="text-[9px] font-semibold tracking-wider text-slate-400">CLOSED</span>
      </div>
    )
  }

  // Same window maths as `getWindow`: a close time that is not after the open
  // time means the day runs past midnight.
  const openMinutes = toMinutes(hour.openTime)
  const rawClose = toMinutes(hour.closeTime)
  const closeMinutes = rawClose <= openMinutes ? rawClose + MINUTES_PER_DAY : rawClose

  const bars: Array<{ from: number; to: number; tone: 'open' | 'break' }> = []
  for (const segment of daySegments(openMinutes, closeMinutes)) {
    bars.push({ ...segment, tone: 'open' })
  }

  // Breaks are drawn last so they sit on top of the open bar. Anything outside
  // the window (invalid input) is clamped away rather than rendered wrongly.
  hour.breaks.forEach((brk) => {
    const start = toMinutes(brk.start)
    const rawEnd = toMinutes(brk.end)
    const absoluteStart = start < openMinutes ? start + MINUTES_PER_DAY : start
    const absoluteEnd = rawEnd <= start ? rawEnd + MINUTES_PER_DAY : rawEnd

    const clampedStart = Math.max(absoluteStart, openMinutes)
    const clampedEnd = Math.min(absoluteEnd, closeMinutes)
    if (clampedEnd <= clampedStart) return

    for (const segment of daySegments(clampedStart, clampedEnd)) {
      bars.push({ ...segment, tone: 'break' })
    }
  })

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
      {bars.map((bar, index) => (
        <div
          key={`${bar.tone}-${index}`}
          className={`absolute h-full ${
            bar.tone === 'break' ? 'bg-amber-300' : 'bg-gradient-to-r from-[#2874f0] to-[#5b9bf8]'
          }`}
          style={{ left: `${pct(bar.from)}%`, width: `${pct(bar.to - bar.from)}%` }}
        />
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function BusinessHoursPage() {
  const { status } = useSession()
  const queryClient = useQueryClient()

  const [draft, setDraft] = useState<BusinessHour[]>(buildDefaultBusinessHours)
  const [saved, setSaved] = useState<BusinessHour[]>(buildDefaultBusinessHours)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [neverConfigured, setNeverConfigured] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [expandedDay, setExpandedDay] = useState<WeekDay | null>(null)
  const [now, setNow] = useState<Date | null>(null)

  // Confirmation dialog. The request is kept separately from the open flag so
  // the copy does not blank out while the dialog animates closed.
  const [confirmRequest, setConfirmRequest] = useState<{
    title: string
    description: string
    confirmLabel: string
    onConfirm: () => void
  } | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const requestConfirm = useCallback(
    (request: NonNullable<typeof confirmRequest>) => {
      setConfirmRequest(request)
      setConfirmOpen(true)
    },
    []
  )

  // ── Load ────────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setLoadError(false)
      // Served from the shared vendor-profile cache when fresh — no extra request.
      const profile = await queryClient.fetchQuery(vendorProfileQueryOptions)
      const raw = profile?.settings?.businessHours
      const normalized = normalizeBusinessHours(raw)

      setDraft(normalized)
      setSaved(normalized)
      setNeverConfigured(!hasStoredHours(raw))
    } catch (error) {
      console.error('[business-hours] load failed:', error)
      toast.error('Failed to load business hours')
      // Deliberately do NOT fall back to a default schedule: saving that over
      // real hours would silently destroy the vendor's configuration.
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [queryClient])

  const loadedRef = useRef(false)

  useEffect(() => {
    // Load once per mount, so a session refresh can never clobber unsaved edits.
    if (status !== 'authenticated' || loadedRef.current) return
    loadedRef.current = true
    void load()
  }, [status, load])

  // Live clock for the "what customers see now" badge. Starts null so the
  // server render and the first client render agree.
  useEffect(() => {
    setNow(new Date())
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  // ── Derived state ───────────────────────────────────────────────────────────

  const validation = useMemo(() => validateBusinessHours(draft), [draft])
  const invalidDays = useMemo(() => countInvalidDays(validation), [validation])
  const firstInvalidDay = useMemo(
    () => DAY_IDS.find((id) => validation[id]?.hasError) ?? null,
    [validation]
  )

  const isDirty = useMemo(() => !businessHoursEqual(draft, saved), [draft, saved])

  const openDays = useMemo(() => draft.filter((hour) => hour.isOpen).length, [draft])
  const allClosed = openDays === 0
  const weeklyMinutes = useMemo(
    () => draft.reduce((total, hour) => total + getDayMinutes(hour), 0),
    [draft]
  )
  const averageMinutes = openDays > 0 ? Math.round(weeklyMinutes / openDays) : 0
  const breakCount = useMemo(
    () => draft.reduce((total, hour) => total + hour.breaks.length, 0),
    [draft]
  )

  const liveStatus = useMemo(() => (now ? getLiveStatus(saved, now) : null), [saved, now])

  useEffect(() => {
    if (!isDirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // ── Edits ───────────────────────────────────────────────────────────────────

  const patchDay = useCallback((day: WeekDay, patch: Partial<BusinessHour>) => {
    setDraft((previous) =>
      previous.map((hour) => (hour.day === day ? { ...hour, ...patch } : hour))
    )
  }, [])

  const addBreak = useCallback((day: WeekDay) => {
    setDraft((previous) =>
      previous.map((hour) => {
        if (hour.day !== day) return hour
        const window = getWindow(hour)
        // Seed the break inside the open window so it starts valid.
        const startOffset = Math.min(12 * 60, Math.max(0, Math.round(window.length / 2) - 30))
        const startMinutes = (window.start + startOffset) % MINUTES_PER_DAY
        const endMinutes = (startMinutes + 30) % MINUTES_PER_DAY
        const toClock = (value: number) =>
          `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60)
            .toString()
            .padStart(2, '0')}`
        return {
          ...hour,
          breaks: [...hour.breaks, { start: toClock(startMinutes), end: toClock(endMinutes) }],
        }
      })
    )
  }, [])

  const patchBreak = useCallback(
    (day: WeekDay, index: number, patch: Partial<{ start: string; end: string }>) => {
      setDraft((previous) =>
        previous.map((hour) =>
          hour.day === day
            ? {
                ...hour,
                breaks: hour.breaks.map((brk, i) => (i === index ? { ...brk, ...patch } : brk)),
              }
            : hour
        )
      )
    },
    []
  )

  const removeBreak = useCallback((day: WeekDay, index: number) => {
    setDraft((previous) =>
      previous.map((hour) =>
        hour.day === day
          ? { ...hour, breaks: hour.breaks.filter((_, i) => i !== index) }
          : hour
      )
    )
  }, [])

  const revertDay = useCallback(
    (day: WeekDay) => {
      const original = saved.find((hour) => hour.day === day)
      if (!original) return
      setDraft((previous) =>
        previous.map((hour) =>
          hour.day === day ? { ...original, breaks: original.breaks.map((b) => ({ ...b })) } : hour
        )
      )
      toast(`Reverted ${getDayMeta(day).label} to the saved hours`)
    },
    [saved]
  )

  const applyPreset = useCallback((preset: Preset) => {
    setDraft(preset.build())
    setExpandedDay(null)
    toast.success(`Applied preset: ${preset.label}`)
  }, [])

  const copyDayToAll = useCallback(
    (day: WeekDay) => {
      const source = draft.find((hour) => hour.day === day)
      if (!source) return
      setDraft((previous) =>
        previous.map((hour) => ({
          ...hour,
          isOpen: source.isOpen,
          openTime: source.openTime,
          closeTime: source.closeTime,
          breaks: source.breaks.map((brk) => ({ ...brk })),
        }))
      )
      toast.success(`${getDayMeta(day).label}'s hours copied to all 7 days`)
    },
    [draft]
  )

  const revertAll = useCallback(() => {
    setDraft(saved.map((hour) => ({ ...hour, breaks: hour.breaks.map((b) => ({ ...b })) })))
    setExpandedDay(null)
    toast('Reverted to the last saved hours')
  }, [saved])

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (invalidDays > 0) {
      setExpandedDay(firstInvalidDay)
      toast.error(
        `Fix ${invalidDays} day${invalidDays === 1 ? '' : 's'} before saving your hours`
      )
      return
    }

    setIsSaving(true)
    try {
      const result = await updateVendorBusinessHours(draft)
      // Adopt the server's canonical copy — it is the source of truth.
      setDraft(result)
      setSaved(result)
      setNeverConfigured(false)
      setLastSavedAt(new Date())

      toast.success('Business hours saved successfully')
      // Keep the shared cache in sync — the sidebar/header read from it.
      await queryClient.invalidateQueries({ queryKey: vendorQueryKeys.profile })
    } catch (error) {
      console.error('[business-hours] save failed:', error)
      toast.error(getBusinessHoursErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }, [draft, firstInvalidDay, invalidDays, queryClient])

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLoading || status === 'loading') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#2874f0]/20 border-t-[#2874f0]" />
          <Clock className="absolute inset-0 m-auto h-5 w-5 text-[#2874f0]" aria-hidden />
        </div>
        <p className="text-sm font-medium text-slate-400">Loading business hours…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <span className="rounded-2xl bg-red-50 p-4">
          <AlertCircle className="h-7 w-7 text-red-500" aria-hidden />
        </span>
        <div>
          <p className="font-semibold text-slate-800">Couldn&apos;t load your business hours</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            A default schedule is deliberately not shown here — saving one would overwrite the
            hours you actually have. Check your connection and try again.
          </p>
        </div>
        <Button
          onClick={() => {
            setLoadError(false)
            void load()
          }}
          className="gap-2 rounded-xl bg-[#2874f0] font-semibold text-white hover:bg-[#1a55c4]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2e6c] via-[#2874f0] to-[#0f52c4] p-6 text-white shadow-xl shadow-[#2874f0]/25">
        <div className="pointer-events-none absolute -top-8 -right-8 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 -left-8 h-36 w-36 rounded-full bg-white/5" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15 backdrop-blur-sm">
              <Clock className="h-7 w-7 text-white" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Business Hours</h1>
              <p className="mt-0.5 text-sm text-blue-200">
                Set your weekly operating schedule · Shown to customers
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {liveStatus ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        liveStatus.isOpen
                          ? 'bg-green-300'
                          : liveStatus.onBreak
                            ? 'bg-amber-300'
                            : 'bg-slate-300'
                      }`}
                    />
                    {liveStatus.detail}
                  </span>
                ) : null}
                <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                  <CheckCircle className="h-3 w-3 text-green-300" aria-hidden />
                  {openDays} / 7 days open
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                  <Timer className="h-3 w-3" aria-hidden />
                  {formatDuration(weeklyMinutes)} / week
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <AnimatePresence>
              {isDirty ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="gap-2 bg-white font-semibold text-[#2874f0] shadow-none hover:bg-blue-50"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Save className="h-4 w-4" aria-hidden />
                    )}
                    Save hours
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
            {lastSavedAt ? (
              <span className="text-[11px] text-blue-200">
                Saved at{' '}
                {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Blocking validation summary ──────────────────────────────────────── */}
      {invalidDays > 0 ? (
        <div
          role="alert"
          className="flex flex-wrap items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <span className="rounded-lg bg-red-100 p-2">
            <AlertCircle className="h-5 w-5 text-red-600" aria-hidden />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-red-800">
              {invalidDays} day{invalidDays === 1 ? '' : 's'} need attention
            </p>
            <p className="mt-1 text-sm leading-relaxed text-red-700">
              Opening and closing times, and break periods, must be consistent before your hours
              can be saved.
            </p>
            {firstInvalidDay ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setExpandedDay(firstInvalidDay)}
                className="mt-3 rounded-lg border-red-300 text-xs font-semibold text-red-800 hover:bg-red-100"
              >
                Show {getDayMeta(firstInvalidDay).label}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ── First-time / all-closed notices ──────────────────────────────────── */}
      {neverConfigured ? (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <span className="rounded-lg bg-blue-100 p-2">
            <Info className="h-5 w-5 text-blue-600" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-blue-900">Suggested schedule</p>
            <p className="mt-1 text-sm leading-relaxed text-blue-700">
              You haven&apos;t saved business hours yet, so a common default is shown (Mon–Sat
              9&nbsp;AM–6&nbsp;PM, Sunday closed). Adjust it and save to publish your real hours.
            </p>
          </div>
        </div>
      ) : null}

      {allClosed && !neverConfigured ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <span className="rounded-lg bg-amber-100 p-2">
            <TriangleAlert className="h-5 w-5 text-amber-600" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-amber-900">All 7 days are closed</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-700">
              Customers will see your store as closed and no rental requests can be accepted while
              every day is switched off.
            </p>
          </div>
        </div>
      ) : null}

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            icon: CheckCircle,
            label: 'Open days',
            value: String(openDays),
            tone: 'bg-emerald-50 text-emerald-600',
          },
          {
            icon: X,
            label: 'Closed days',
            value: String(7 - openDays),
            tone: 'bg-red-50 text-red-500',
          },
          {
            icon: Timer,
            label: 'Hours / week',
            value: formatDuration(weeklyMinutes),
            tone: 'bg-blue-50 text-blue-600',
          },
          {
            icon: Coffee,
            label: 'Break periods',
            value: String(breakCount),
            tone: 'bg-amber-50 text-amber-600',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${stat.tone}`}>
              <stat.icon className="h-4 w-4" aria-hidden />
            </div>
            <p className="text-xl font-bold tracking-tight text-slate-800">{stat.value}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Presets ──────────────────────────────────────────────────────────── */}
      <SectionCard
        icon={Clock}
        title="Quick presets"
        description="Replace the whole week with a template, then fine-tune each day"
        headerExtra={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!isDirty}
            onClick={revertAll}
            className="h-7 gap-1.5 px-2 text-xs text-slate-500 hover:text-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Revert unsaved
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PRESETS.map((preset, index) => (
            <motion.button
              key={preset.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              onClick={() =>
                requestConfirm({
                  title: `Apply “${preset.label}”?`,
                  description: `This replaces all 7 days, including any breaks you have set, with ${preset.hint}. Nothing is saved until you press Save hours.`,
                  confirmLabel: 'Apply preset',
                  onConfirm: () => applyPreset(preset),
                })
              }
              className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-center transition-all hover:border-[#2874f0] hover:bg-[#2874f0]/5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-[#2874f0]/10">
                <preset.icon
                  className="h-5 w-5 text-slate-500 transition-colors group-hover:text-[#2874f0]"
                  aria-hidden
                />
              </span>
              <span className="text-xs font-semibold leading-tight text-slate-600 transition-colors group-hover:text-[#2874f0]">
                {preset.label}
              </span>
              <span className="text-[10px] leading-tight text-slate-400">{preset.hint}</span>
            </motion.button>
          ))}
        </div>
      </SectionCard>

      {/* ── Week at a glance ─────────────────────────────────────────────────── */}
      <SectionCard
        icon={Calendar}
        title="Week at a glance"
        description="24-hour timeline · blue = open, amber = break"
      >
        <div className="space-y-3">
          <div className="mb-1 flex px-0 font-mono text-[9px] text-slate-300">
            {TIMELINE_TICKS.map((tick, index) => (
              // Index keys are correct here: these markers are static, evenly
              // spaced and never reordered — and two of them legitimately share
              // the label "12a" (the start and the end of the strip), so the
              // label itself is not a unique key.
              <span key={index} className="flex-1 text-center">
                {tick}
              </span>
            ))}
          </div>

          {draft.map((hour, index) => {
            const meta = getDayMeta(hour.day)
            return (
              <motion.div
                key={hour.day}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex items-center gap-3"
              >
                <span
                  className={`w-9 shrink-0 text-[11px] font-bold ${
                    meta.isWeekend ? 'text-amber-500' : 'text-slate-500'
                  }`}
                >
                  {meta.short}
                </span>
                <div className="flex-1">
                  <DayTimeline hour={hour} />
                </div>
                <span className="w-28 shrink-0 text-right text-[10px] font-medium text-slate-400">
                  {hour.isOpen
                    ? `${formatTime12(hour.openTime)} – ${formatTime12(hour.closeTime)}`
                    : 'Closed'}
                </span>
              </motion.div>
            )
          })}

          <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-2">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="inline-block h-2 w-3 rounded-sm bg-gradient-to-r from-[#2874f0] to-[#5b9bf8]" />
              Open hours
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="inline-block h-2 w-3 rounded-sm bg-amber-300" />
              Break time
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="inline-block h-2 w-3 rounded-sm bg-slate-200" />
              Closed
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ── Weekly editor ────────────────────────────────────────────────────── */}
      <SectionCard
        icon={Clock}
        title="Weekly schedule"
        description="Expand a day to set its hours and breaks"
        headerExtra={
          <span className="text-xs font-medium text-slate-400">
            {formatDuration(averageMinutes)} avg/day · {formatDuration(weeklyMinutes)} per week
          </span>
        }
      >
        <div className="space-y-2">
          {draft.map((hour, index) => {
            const meta = getDayMeta(hour.day)
            const dayValidation = validation[hour.day]
            const isExpanded = expandedDay === hour.day
            const savedDay = saved.find((item) => item.day === hour.day)
            const dayDirty = !savedDay || !businessHoursEqual([hour], [savedDay])
            const minutes = getDayMinutes(hour)
            const panelId = `business-hours-panel-${hour.day}`

            return (
              <motion.div
                key={hour.day}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`overflow-hidden rounded-xl border transition-all ${
                  hour.isOpen ? 'border-slate-100 bg-white shadow-sm' : 'border-slate-100 bg-slate-50/60'
                } ${isExpanded ? 'border-[#2874f0]/30 ring-2 ring-[#2874f0]/20' : ''}`}
              >
                <div className="flex items-center gap-3 px-3 py-3">
                  <button
                    type="button"
                    onClick={() => setExpandedDay(isExpanded ? null : hour.day)}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[#2874f0]/40"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        hour.isOpen
                          ? meta.isWeekend
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-[#2874f0]/10 text-[#2874f0]'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {meta.short}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold capitalize text-slate-800">
                          {meta.label}
                        </span>
                        {meta.isWeekend ? (
                          <span className="rounded-full border border-amber-100 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
                            Weekend
                          </span>
                        ) : null}
                        {dayDirty ? (
                          <span className="rounded-full border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            Unsaved
                          </span>
                        ) : null}
                        {dayValidation?.hasError ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                            <AlertCircle className="h-3 w-3" aria-hidden />
                            Check times
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-400">
                        {hour.isOpen
                          ? `${formatTime12(hour.openTime)} – ${formatTime12(hour.closeTime)}${
                              isOvernight(hour) ? ' (next day)' : ''
                            }${hour.breaks.length > 0 ? ` · ${hour.breaks.length} break${hour.breaks.length === 1 ? '' : 's'}` : ''}`
                          : 'Closed all day'}
                      </span>
                    </span>

                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      aria-hidden
                    />
                  </button>

                  <div className="flex shrink-0 items-center gap-3">
                    {hour.isOpen ? (
                      <span className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600 sm:inline-flex">
                        {formatDuration(minutes)}
                      </span>
                    ) : null}
                    <Switch
                      checked={hour.isOpen}
                      onCheckedChange={(checked) => {
                        patchDay(hour.day, { isOpen: checked })
                        setExpandedDay(checked ? hour.day : null)
                      }}
                      aria-label={`${meta.label} ${hour.isOpen ? 'open' : 'closed'}`}
                    />
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded ? (
                    <motion.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 border-t border-slate-100 px-4 pt-3 pb-4">
                        {hour.isOpen ? (
                          <>
                            {/* Operating hours */}
                            <div>
                              <p className="mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                                Operating hours
                              </p>
                              <div className="flex flex-wrap items-center gap-3">
                                <div
                                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                                    dayValidation?.openTime
                                      ? 'border-red-200 bg-red-50'
                                      : 'border-slate-200 bg-slate-50'
                                  }`}
                                >
                                  <Sun className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                                  <span className="text-xs font-medium text-slate-500">Opens</span>
                                  <TimeSelect
                                    value={hour.openTime}
                                    onChange={(next) => patchDay(hour.day, { openTime: next })}
                                    label={`${meta.label} opening time`}
                                    invalid={Boolean(dayValidation?.openTime)}
                                  />
                                </div>

                                <span className="text-sm font-bold text-slate-300" aria-hidden>
                                  →
                                </span>

                                <div
                                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                                    dayValidation?.closeTime
                                      ? 'border-red-200 bg-red-50'
                                      : 'border-slate-200 bg-slate-50'
                                  }`}
                                >
                                  <Moon className="h-4 w-4 shrink-0 text-indigo-400" aria-hidden />
                                  <span className="text-xs font-medium text-slate-500">Closes</span>
                                  <TimeSelect
                                    value={hour.closeTime}
                                    onChange={(next) => patchDay(hour.day, { closeTime: next })}
                                    label={`${meta.label} closing time`}
                                    invalid={Boolean(dayValidation?.closeTime)}
                                  />
                                </div>

                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                  {formatDuration(minutes)} open
                                </span>
                              </div>

                              {isOvernight(hour) ? (
                                <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                                  <Info className="h-3.5 w-3.5" aria-hidden />
                                  Closing time is earlier than opening — this day runs past
                                  midnight.
                                </p>
                              ) : null}

                              {dayValidation?.openTime ? (
                                <p className="mt-2 text-xs font-medium text-red-600">
                                  {dayValidation.openTime}
                                </p>
                              ) : null}
                              {dayValidation?.closeTime ? (
                                <p className="mt-1 text-xs font-medium text-red-600">
                                  {dayValidation.closeTime}
                                </p>
                              ) : null}
                            </div>

                            {/* Breaks */}
                            <div>
                              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                                <Coffee className="h-3 w-3 text-amber-500" aria-hidden />
                                Break periods
                              </p>

                              {hour.breaks.length === 0 ? (
                                <p className="text-xs text-slate-400">
                                  No breaks — this day is open for the whole window.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {hour.breaks.map((brk, breakIndex) => (
                                    <div key={breakIndex}>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <div
                                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                                            dayValidation?.breaks[breakIndex]
                                              ? 'border-red-200 bg-red-50'
                                              : 'border-amber-100 bg-amber-50'
                                          }`}
                                        >
                                          <Coffee
                                            className="h-3.5 w-3.5 shrink-0 text-amber-500"
                                            aria-hidden
                                          />
                                          <TimeSelect
                                            value={brk.start}
                                            onChange={(next) =>
                                              patchBreak(hour.day, breakIndex, { start: next })
                                            }
                                            label={`${meta.label} break ${breakIndex + 1} start`}
                                            invalid={Boolean(dayValidation?.breaks[breakIndex])}
                                          />
                                          <span className="text-xs text-slate-400">to</span>
                                          <TimeSelect
                                            value={brk.end}
                                            onChange={(next) =>
                                              patchBreak(hour.day, breakIndex, { end: next })
                                            }
                                            label={`${meta.label} break ${breakIndex + 1} end`}
                                            invalid={Boolean(dayValidation?.breaks[breakIndex])}
                                          />
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => removeBreak(hour.day, breakIndex)}
                                          aria-label={`Remove break ${breakIndex + 1} on ${meta.label}`}
                                          className="h-8 w-8 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4" aria-hidden />
                                        </Button>
                                      </div>
                                      {dayValidation?.breaks[breakIndex] ? (
                                        <p className="mt-1 text-xs font-medium text-red-600">
                                          {dayValidation.breaks[breakIndex]}
                                        </p>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addBreak(hour.day)}
                                className="h-8 gap-1.5 rounded-lg border-amber-200 text-xs text-amber-700 hover:bg-amber-50"
                              >
                                <Plus className="h-3.5 w-3.5" aria-hidden />
                                Add break
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  requestConfirm({
                                    title: `Copy ${meta.label} to every day?`,
                                    description: `All 7 days will use ${formatTime12(hour.openTime)} – ${formatTime12(hour.closeTime)} and the same ${hour.breaks.length} break${hour.breaks.length === 1 ? '' : 's'}, replacing what other days currently have. Nothing is saved until you press Save hours.`,
                                    confirmLabel: 'Copy to all days',
                                    onConfirm: () => copyDayToAll(hour.day),
                                  })
                                }
                                className="h-8 gap-1.5 rounded-lg border-[#2874f0]/30 text-xs text-[#2874f0] hover:bg-[#2874f0]/5"
                              >
                                <Copy className="h-3.5 w-3.5" aria-hidden />
                                Copy to all days
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!dayDirty}
                                onClick={() => revertDay(hour.day)}
                                className="h-8 gap-1.5 rounded-lg text-xs text-slate-600"
                              >
                                <Undo2 className="h-3.5 w-3.5" aria-hidden />
                                Undo this day
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p className="flex items-center gap-2 text-xs text-slate-400">
                            <Info className="h-3.5 w-3.5" aria-hidden />
                            Closed all day — turn the switch on to set opening hours.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </SectionCard>

      {/* ── Guidance ─────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Why accurate hours matter</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: CheckCircle,
              title: 'Customers know when to visit',
              description:
                'Publishing real hours avoids wasted trips and the complaints that follow them.',
              tone: 'bg-emerald-50 text-emerald-600',
            },
            {
              icon: Clock,
              title: 'Fewer missed enquiries',
              description:
                'Requests that arrive while you are closed are the easiest ones to lose track of.',
              tone: 'bg-blue-50 text-blue-600',
            },
            {
              icon: Star,
              title: 'Complete listings rank better',
              description:
                'A fully configured profile signals an active store to buyers and to search.',
              tone: 'bg-amber-50 text-amber-600',
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className={`mb-3 block w-fit rounded-lg p-2 ${item.tone}`}>
                <item.icon className="h-4 w-4" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Holiday hours ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <span className="shrink-0 rounded-lg bg-amber-100 p-2">
            <Calendar className="h-5 w-5 text-amber-600" aria-hidden />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">Holiday &amp; date-specific hours</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-700">
              This page manages your regular weekly schedule. For a one-off closure or special
              festival hours, raise a request with Vendor Support and we&apos;ll apply the dates to
              your storefront.
            </p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="mt-3 gap-1.5 rounded-lg border-amber-300 text-xs font-semibold text-amber-800 hover:bg-amber-100"
            >
              <Link href="/vendor/support">
                <Calendar className="h-3.5 w-3.5" aria-hidden />
                Request holiday hours
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Platform note ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-5 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <span className="shrink-0 rounded-lg bg-white/10 p-2">
            <Globe className="h-5 w-5 text-blue-300" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold">Where these hours are used</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Your saved schedule drives the availability shown on your product listings and is
              applied when rental requests are checked against your opening window. Times are read
              in the timezone of your registered address.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Product listings', 'Request checks', 'Support context', 'Search indexing'].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-200"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky save bar ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isDirty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-slate-100 bg-white/95 px-4 py-4 shadow-lg backdrop-blur"
          >
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              {invalidDays > 0 ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" aria-hidden />
                  {invalidDays} day{invalidDays === 1 ? '' : 's'} need fixing before you can save
                </>
              ) : (
                <>
                  <Info className="h-3.5 w-3.5" aria-hidden />
                  Unsaved changes
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={revertAll}
                className="rounded-xl font-semibold"
              >
                Discard
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || invalidDays > 0}
                className="gap-2 rounded-xl bg-[#2874f0] px-8 font-semibold text-white shadow-md shadow-[#2874f0]/30 hover:bg-[#1a55c4]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" aria-hidden />
                    Save business hours
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Confirmation dialog ──────────────────────────────────────────────── */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmRequest?.title ?? ''}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRequest?.description ?? ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmRequest?.onConfirm()}>
              {confirmRequest?.confirmLabel ?? 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
