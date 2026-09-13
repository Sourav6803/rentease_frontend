/**
 * frontend/lib/api/vendorBusinessHours.ts
 *
 * Single source of truth for the vendor's weekly business hours.
 *
 * Backend contract (verified against the API source):
 *   - Route:   PUT /api/v1/vendor/business-hours  (vendor-authenticated)
 *   - Body:    { businessHours: [{ day, isOpen, openTime, closeTime, breaks: [{ start, end }] }] }
 *   - `day`    must be one of monday..sunday (lowercase) — Vendor.model.js enum
 *   - times    are 24h "HH:MM" strings; the model stores them as plain Strings
 *   - breaks   the model supports [{ start, end }] and the API echoes the saved array
 *   - There is NO dedicated GET endpoint. Hours are read from
 *     GET /vendor/profile/me -> data.profile.settings.businessHours, which is
 *     served through the shared React Query cache (`vendorProfileQueryOptions`).
 *
 * Because the stored array is only loosely validated server-side, everything the
 * UI renders goes through `normalizeBusinessHours` first, so a shuffled, partial
 * or legacy document can never crash the page or silently drop a day.
 */

import apiClient from '@/lib/api/client'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data?: T
}

// ── Canonical week ─────────────────────────────────────────────────────────────

export const WEEK_DAYS = [
  { id: 'monday', label: 'Monday', short: 'Mon', isWeekend: false },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue', isWeekend: false },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed', isWeekend: false },
  { id: 'thursday', label: 'Thursday', short: 'Thu', isWeekend: false },
  { id: 'friday', label: 'Friday', short: 'Fri', isWeekend: false },
  { id: 'saturday', label: 'Saturday', short: 'Sat', isWeekend: true },
  { id: 'sunday', label: 'Sunday', short: 'Sun', isWeekend: true },
] as const

export type WeekDay = (typeof WEEK_DAYS)[number]['id']

export const DAY_IDS: readonly WeekDay[] = WEEK_DAYS.map((d) => d.id)

const DAY_META = new Map(WEEK_DAYS.map((d) => [d.id, d]))

export function getDayMeta(day: WeekDay) {
  // Safe by construction: WeekDay is derived from WEEK_DAYS.
  return DAY_META.get(day) ?? WEEK_DAYS[0]
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TimeRange {
  start: string
  end: string
}

export interface BusinessHour {
  day: WeekDay
  isOpen: boolean
  openTime: string
  closeTime: string
  breaks: TimeRange[]
}

export const DEFAULT_OPEN_TIME = '09:00'
export const DEFAULT_CLOSE_TIME = '18:00'

const MINUTES_PER_DAY = 24 * 60

/**
 * Accepted by the API validator: `[0-1]?[0-9] | 2[0-3]` then `:[0-5][0-9]`.
 * Intentionally loose so legacy single-digit values like "9:00" are preserved
 * and re-emitted as "09:00" rather than being silently replaced by a default.
 */
const LOOSE_TIME_PATTERN = /^([0-1]?\d|2[0-3]):([0-5]\d)$/

/** Strict 24h "HH:MM" that this module always emits. */
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

/** 15-minute slots, 00:00 → 23:45. */
export const TIME_SLOTS: readonly string[] = Array.from({ length: MINUTES_PER_DAY / 15 }, (_, i) => {
  const h = Math.floor(i / 4)
    .toString()
    .padStart(2, '0')
  const m = ((i % 4) * 15).toString().padStart(2, '0')
  return `${h}:${m}`
})

// ── Primitives ─────────────────────────────────────────────────────────────────

/** "HH:MM" → minutes from midnight. Returns 0 for unusable input. */
export function toMinutes(time: string): number {
  const match = LOOSE_TIME_PATTERN.exec(time)
  if (!match) return 0
  return Number(match[1]) * 60 + Number(match[2])
}

/** Any stored time value → strict "HH:MM", or `fallback` if unusable. */
function coerceTime(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const match = LOOSE_TIME_PATTERN.exec(value.trim())
  if (!match) return fallback
  return `${match[1].padStart(2, '0')}:${match[2]}`
}

/** "18:30" → "6:30 PM" */
export function formatTime12(time: string): string {
  const total = toMinutes(time)
  const h = Math.floor(total / 60)
  const m = total % 60
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${m.toString().padStart(2, '0')} ${suffix}`
}

/** 480 → "8h", 450 → "7.5h", 30 → "30m", 0 → "0h" */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0h'
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = minutes / 60
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1).replace(/\.0$/, '')}h`
}

/**
 * The open window as minutes-since-midnight. When `closeTime` is not after
 * `openTime` the window is treated as running past midnight, so its length
 * exceeds 24h-worth of clock — e.g. 22:00→02:00 is a 240 minute window.
 */
export function getWindow(hour: BusinessHour): { start: number; length: number } {
  const start = toMinutes(hour.openTime)
  let end = toMinutes(hour.closeTime)
  if (end <= start) end += MINUTES_PER_DAY
  return { start, length: end - start }
}

/** Offset of a clock time inside the open window, or null when outside it. */
function offsetInWindow(time: string, window: { start: number; length: number }): number | null {
  let value = toMinutes(time)
  if (value < window.start) value += MINUTES_PER_DAY
  const offset = value - window.start
  return offset >= 0 && offset <= window.length ? offset : null
}

/**
 * Net open minutes for a day (open window minus breaks).
 * Never negative, never NaN — safe to call on partially-configured or
 * deliberately invalid input while the user is still editing.
 */
export function getDayMinutes(hour: BusinessHour): number {
  if (!hour.isOpen) return 0
  const window = getWindow(hour)
  let minutes = window.length

  for (const brk of hour.breaks) {
    const startOffset = offsetInWindow(brk.start, window)
    if (startOffset === null) continue
    const endOffset = offsetInWindow(brk.end, window)
    const end = endOffset === null ? window.length : endOffset
    minutes -= Math.max(0, Math.min(end, window.length) - Math.min(startOffset, window.length))
  }

  return Math.max(0, minutes)
}

/** True when the day's window runs past midnight. */
export function isOvernight(hour: BusinessHour): boolean {
  return hour.isOpen && toMinutes(hour.closeTime) <= toMinutes(hour.openTime)
}

// ── Defaults & normalization ───────────────────────────────────────────────────

export function buildDefaultBusinessHours(): BusinessHour[] {
  return WEEK_DAYS.map((day) => ({
    day: day.id,
    isOpen: day.id !== 'sunday',
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    breaks: [],
  }))
}

/**
 * Coerce whatever the API stored into exactly 7 canonical days, Monday → Sunday.
 *
 * - unknown/duplicate/`null` entries are dropped
 * - a missing day falls back to the default schedule so it stays configurable
 * - `breaks` is always an array, and unusable break rows are discarded
 * - `isOpen` tolerates the string "true"/"false"
 */
export function normalizeBusinessHours(raw: unknown): BusinessHour[] {
  const defaults = buildDefaultBusinessHours()
  const byDay = new Map<WeekDay, BusinessHour>()

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (!entry || typeof entry !== 'object') continue

      const record = entry as Record<string, unknown>
      if (typeof record.day !== 'string') continue

      const day = record.day.trim().toLowerCase() as WeekDay
      if (!DAY_IDS.includes(day) || byDay.has(day)) continue

      const breaks: TimeRange[] = []
      if (Array.isArray(record.breaks)) {
        for (const brk of record.breaks) {
          if (!brk || typeof brk !== 'object') continue
          const range = brk as Record<string, unknown>
          const start = coerceTime(range.start, '')
          const end = coerceTime(range.end, '')
          if (start && end) breaks.push({ start, end })
        }
      }

      byDay.set(day, {
        day,
        isOpen:
          record.isOpen === undefined
            ? true
            : record.isOpen === true || record.isOpen === 'true',
        openTime: coerceTime(record.openTime, DEFAULT_OPEN_TIME),
        closeTime: coerceTime(record.closeTime, DEFAULT_CLOSE_TIME),
        breaks,
      })
    }
  }

  return defaults.map((fallback) => byDay.get(fallback.day) ?? fallback)
}

/** True when the stored document actually contained usable hour rows. */
export function hasStoredHours(raw: unknown): boolean {
  if (!Array.isArray(raw)) return false
  return raw.some(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      typeof (entry as Record<string, unknown>).day === 'string' &&
      DAY_IDS.includes(((entry as Record<string, unknown>).day as string).trim().toLowerCase() as WeekDay)
  )
}

// ── Live status ("what a customer sees right now") ─────────────────────────────

export interface LiveOpenStatus {
  day: WeekDay
  isOpen: boolean
  /** Short human summary, e.g. "Open now · closes 6 PM". */
  detail: string
  /** True when this status was produced while the venue is on a break. */
  onBreak: boolean
}

/** Monday-first index (0..6) for a JS date, whose own weekday index uses Sunday = 0. */
function dayIndexFor(when: Date): number {
  return (when.getDay() + 6) % 7
}

/** Minutes since this day's window opened. Clock times before the opening time
 *  are read as belonging to the following day, so 01:00 sits 3h after a 22:00
 *  opening (which is how overnight breaks are expressed). */
function windowOffset(hour: BusinessHour, minutesOfDay: number): number {
  const start = toMinutes(hour.openTime)
  return (minutesOfDay < start ? minutesOfDay + MINUTES_PER_DAY : minutesOfDay) - start
}

/** Every break, normalised to minutes-from-window-start so comparisons are safe
 *  for overnight windows. */
function breaksAsOffsets(hour: BusinessHour): Array<{ start: number; end: number }> {
  return hour.breaks.map((brk) => {
    const start = windowOffset(hour, toMinutes(brk.start))
    let end = windowOffset(hour, toMinutes(brk.end))
    if (end <= start) end += MINUTES_PER_DAY
    return { start, end }
  })
}

/** Open according to this day's own window (a post-midnight spill is handled by
 *  the previous day's entry, so it is deliberately excluded here). */
function withinOwnWindow(hour: BusinessHour, minutesOfDay: number): boolean {
  if (!hour.isOpen) return false
  const start = toMinutes(hour.openTime)
  const close = toMinutes(hour.closeTime)
  if (close > start) return minutesOfDay >= start && minutesOfDay < close
  return minutesOfDay >= start
}

function activeBreak(hour: BusinessHour, minutesOfDay: number) {
  const offset = windowOffset(hour, minutesOfDay)
  return breaksAsOffsets(hour).find((brk) => offset >= brk.start && offset < brk.end) ?? null
}

/** The next opening within the coming 7 days, used for the closed-state label. */
function findNextOpening(hours: BusinessHour[], currentIndex: number, minutesOfDay: number) {
  for (let ahead = 0; ahead < 7; ahead += 1) {
    const day = DAY_IDS[(currentIndex + ahead) % 7]
    const hour = hours.find((item) => item.day === day)
    if (!hour?.isOpen) continue
    // Today only counts when its opening time has not already passed.
    if (ahead === 0 && minutesOfDay >= toMinutes(hour.openTime)) continue
    return { day, time: hour.openTime, daysAhead: ahead }
  }
  return null
}

/**
 * Whether the venue is open at `when`, plus a caption for the live badge.
 * Handles breaks, days that are closed, and windows that run past midnight.
 */
export function getLiveStatus(hours: BusinessHour[], when: Date): LiveOpenStatus {
  const index = dayIndexFor(when)
  const todayId = DAY_IDS[index]
  const minutes = when.getHours() * 60 + when.getMinutes()

  const today = hours.find((hour) => hour.day === todayId)
  if (today && withinOwnWindow(today, minutes)) {
    const brk = activeBreak(today, minutes)
    if (brk) {
      return {
        day: todayId,
        isOpen: false,
        onBreak: true,
        detail: `On break · back in ${formatDuration(brk.end - windowOffset(today, minutes))}`,
      }
    }
    return {
      day: todayId,
      isOpen: true,
      onBreak: false,
      detail: `Open now · closes ${formatTime12(today.closeTime)}${
        isOvernight(today) ? ' tomorrow' : ''
      }`,
    }
  }

  // Yesterday's overnight window may still be running into this morning.
  const previousId = DAY_IDS[(index + 6) % 7]
  const previous = hours.find((hour) => hour.day === previousId)
  if (previous && isOvernight(previous) && minutes < toMinutes(previous.closeTime)) {
    const brk = activeBreak(previous, minutes)
    if (brk) {
      return {
        day: previousId,
        isOpen: false,
        onBreak: true,
        detail: `On break · back in ${formatDuration(brk.end - windowOffset(previous, minutes))}`,
      }
    }
    return {
      day: previousId,
      isOpen: true,
      onBreak: false,
      detail: `Open now · closes ${formatTime12(previous.closeTime)}`,
    }
  }

  const next = findNextOpening(hours, index, minutes)
  let detail = 'Closed · no opening hours configured'
  if (next) {
    const prefix =
      next.daysAhead === 0 ? '' : next.daysAhead === 1 ? 'tomorrow ' : `${getDayMeta(next.day).label} `
    detail = `Closed · opens ${prefix}at ${formatTime12(next.time)}`
  }

  return { day: todayId, isOpen: false, onBreak: false, detail }
}

// ── Validation ─────────────────────────────────────────────────────────────────

export interface DayValidation {
  hasError: boolean
  openTime?: string
  closeTime?: string
  /** Index-aligned with the day's break list. */
  breaks: Array<string | undefined>
  /** First problem, for the collapsed day row. */
  summary?: string
}

export type BusinessHoursValidation = Record<WeekDay, DayValidation>

/**
 * Field-level validation for every day. Closed days are skipped — their stored
 * times are preserved but not enforced.
 *
 * The backend's own time guard is ineffective (it compares a boolean `isOpen`
 * against the string 'true', so it never runs) and `breaks` is not validated at
 * all, which is why this has to be enforced client-side.
 */
export function validateBusinessHours(hours: BusinessHour[]): BusinessHoursValidation {
  const result = {} as BusinessHoursValidation

  for (const id of DAY_IDS) {
    result[id] = { hasError: false, breaks: [] }
  }

  for (const hour of hours) {
    const day: DayValidation = { hasError: false, breaks: [] }
    const present = hour.breaks.map((brk) => ({ ...brk }))

    if (hour.isOpen) {
      const openValid = TIME_PATTERN.test(hour.openTime)
      const closeValid = TIME_PATTERN.test(hour.closeTime)

      if (!openValid) day.openTime = 'Enter a valid opening time'
      if (!closeValid) day.closeTime = 'Enter a valid closing time'

      if (openValid && closeValid && hour.openTime === hour.closeTime) {
        day.closeTime = "Closing time can't be the same as opening time"
      }

      if (openValid && closeValid) {
        const window = getWindow(hour)

        // A break must sit fully inside the open window.
        const offsets: Array<{ start: number; end: number }> = []

        present.forEach((brk, index) => {
          if (!TIME_PATTERN.test(brk.start) || !TIME_PATTERN.test(brk.end)) {
            day.breaks[index] = 'Enter a valid break time'
            return
          }

          const startOffset = offsetInWindow(brk.start, window)
          const endOffset = offsetInWindow(brk.end, window)

          if (startOffset === null || endOffset === null) {
            day.breaks[index] = 'Break must fall inside your opening hours'
            return
          }

          // 22:00→02:00 style break: the end is expressed on the next day.
          const resolvedEnd = endOffset <= startOffset ? endOffset + MINUTES_PER_DAY : endOffset

          if (resolvedEnd - startOffset < 1) {
            day.breaks[index] = 'Break end must be after its start'
            return
          }

          if (resolvedEnd > window.length) {
            day.breaks[index] = 'Break must fall inside your opening hours'
            return
          }

          offsets.push({ start: startOffset, end: resolvedEnd })
        })

        // Overlap check on the breaks that are individually valid.
        const sorted = [...offsets].sort((a, b) => a.start - b.start)
        for (let i = 1; i < sorted.length; i += 1) {
          if (sorted[i].start < sorted[i - 1].end) {
            const index = offsets.findIndex((o) => o.start === sorted[i].start)
            if (index >= 0 && !day.breaks[index]) {
              day.breaks[index] = 'Breaks overlap each other'
            }
          }
        }

        // A full-day break leaves nothing open.
        if (getDayMinutes({ ...hour, breaks: present }) === 0) {
          day.closeTime = 'This leaves no open hours — shorten the break or the day'
        }
      }
    }

    day.hasError =
      Boolean(day.openTime || day.closeTime) || day.breaks.some((message) => Boolean(message))
    day.summary = day.openTime || day.closeTime || day.breaks.find(Boolean)

    result[hour.day] = day
  }

  return result
}

export function countInvalidDays(validation: BusinessHoursValidation): number {
  return DAY_IDS.reduce((total, id) => total + (validation[id]?.hasError ? 1 : 0), 0)
}

// ── Payload & persistence ──────────────────────────────────────────────────────

/**
 * Clean request body: exactly 7 days in canonical order, containing only the
 * fields the model declares. Deliberately drops anything else the API may have
 * echoed back (e.g. mongoose's `_id` on subdocuments) so it is never re-sent.
 */
export function buildBusinessHoursPayload(hours: BusinessHour[]): {
  businessHours: Array<{
    day: WeekDay
    isOpen: boolean
    openTime: string
    closeTime: string
    breaks: TimeRange[]
  }>
} {
  // Start from a complete canonical week, then overlay what the caller supplied,
  // so a missing day can never produce an undefined entry.
  const merged = buildDefaultBusinessHours().map((baseline) => {
    const current = hours.find((hour) => hour.day === baseline.day)
    return current ?? baseline
  })

  return {
    businessHours: merged.map((hour) => ({
      day: hour.day,
      isOpen: hour.isOpen,
      openTime: hour.openTime,
      closeTime: hour.closeTime,
      breaks: hour.breaks.map((brk) => ({ start: brk.start, end: brk.end })),
    })),
  }
}

/** Field-by-field comparison used for the unsaved-changes indicator. */
export function businessHoursEqual(a: BusinessHour[], b: BusinessHour[]): boolean {
  return DAY_IDS.every((id) => {
    const left = a.find((hour) => hour.day === id)
    const right = b.find((hour) => hour.day === id)
    if (!left || !right) return left === right
    if (left.isOpen !== right.isOpen) return false
    if (left.openTime !== right.openTime) return false
    if (left.closeTime !== right.closeTime) return false
    if (left.breaks.length !== right.breaks.length) return false
    return left.breaks.every(
      (brk, index) => brk.start === right.breaks[index].start && brk.end === right.breaks[index].end
    )
  })
}

/**
 * Persist the schedule and return the server's canonical copy.
 *
 * `apiClient` injects the NextAuth Bearer token and already targets
 * `${API_BASE}/api/v1`, so no URL or token plumbing is needed here.
 */
export async function updateVendorBusinessHours(hours: BusinessHour[]): Promise<BusinessHour[]> {
  const payload = buildBusinessHoursPayload(hours)
  const res = await apiClient.put<ApiEnvelope<{ businessHours: unknown }>>(
    '/vendor/business-hours',
    payload
  )

  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Failed to save business hours')
  }

  const saved = res.data.data?.businessHours
  return normalizeBusinessHours(saved === undefined ? payload.businessHours : saved)
}

/** Type-safe message extraction — avoids an `any` catch. */
export function getBusinessHoursErrorMessage(
  error: unknown,
  fallback = 'Failed to save business hours'
): string {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as {
      response?: { data?: { message?: unknown } }
      message?: unknown
    }
    const apiMessage = candidate.response?.data?.message
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage
    if (typeof candidate.message === 'string' && candidate.message.trim()) {
      return candidate.message
    }
  }
  return fallback
}
