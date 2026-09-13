'use client'

/**
 * app/(vendor)/vendor/delivery/page.tsx
 *
 * Vendor delivery management — the page the sidebar's "Delivery"
 * (href /vendor/delivery) has always pointed at but which never existed.
 *
 * Everything on screen is driven by the API:
 *   GET /deliveries/vendor/me  -> { deliveries, summary, pagination }
 * The summary returned alongside the list is already vendor-wide (the service
 * ignores the list filters when building it), so one request powers both the
 * stat cards and the table — no second round trip.
 *
 * Date filters are sent as explicit UTC instants (`T00:00:00.000Z` /
 * `T23:59:59.999Z`) because the service passes them straight into `new Date()`;
 * a bare "YYYY-MM-DD" would mean UTC midnight and drop the whole end day.
 *
 * Actions are gated on the statuses the API actually accepts:
 *   assign      -> status === 'scheduled'   (service query hard-codes it)
 *   reschedule  -> scheduled | assigned | failed
 */

import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Copy,
  FileText,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Package,
  PackageCheck,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  Timer,
  Truck,
  User,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { vendorQueryKeys } from '@/lib/api/queryKeys'
import {
  DELIVERY_SLOT_OPTIONS,
  DELIVERY_STATUSES,
  DELIVERY_TYPES,
  assignDeliveryPerson,
  formatAddress,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatSchedule,
  formatSlot,
  getAssignedPersonId,
  getAssignedPersonName,
  getCustomerName,
  getCustomerPhone,
  getDeliveryErrorMessage,
  getPriorityMeta,
  getStatusMeta,
  getTypeLabel,
  getVendorDeliveries,
  isAssignable,
  isReschedulable,
  rescheduleDelivery,
  type VendorDelivery,
} from '@/lib/api/vendorDeliveries'

const PAGE_SIZE = 8
const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/

// ── Small presentational pieces ────────────────────────────────────────────────

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
            {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
          </div>
        </div>
        {headerExtra}
      </header>
      <div className="px-5 py-5">{children}</div>
    </section>
  )
}

function StatusPill({ status }: { status: string }) {
  const meta = getStatusMeta(status)
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.tone}`}
    >
      {meta.label}
    </span>
  )
}

function Field({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{label}</p>
        <p className={`text-xs text-slate-700 ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  )
}

function Timeline({ entries }: { entries?: VendorDelivery['tracking'] }) {
  const timeline = entries?.timeline ?? []

  if (timeline.length === 0) {
    return <p className="text-xs text-slate-400">No tracking events recorded yet.</p>
  }

  // Newest first reads better than the stored append order.
  const ordered = [...timeline].reverse()

  return (
    <ol className="space-y-3">
      {ordered.map((entry, index) => (
        <li key={`${entry.status}-${entry.timestamp}-${index}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                index === 0 ? 'bg-[#2874f0]' : 'bg-slate-300'
              }`}
            />
            {index < ordered.length - 1 ? <span className="w-px flex-1 bg-slate-200" /> : null}
          </div>
          <div className="min-w-0 pb-1">
            <p className="text-xs font-semibold text-slate-700">
              {entry.status ? getStatusMeta(entry.status).label : 'Update'}
              <span className="ml-2 font-normal text-slate-400">
                {formatDateTime(entry.timestamp)}
              </span>
            </p>
            {entry.note ? (
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{entry.note}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

// ── Assign dialog ─────────────────────────────────────────────────────────────

function AssignDialog({
  delivery,
  open,
  onOpenChange,
  onAssign,
}: {
  delivery: VendorDelivery | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssign: (delivery: VendorDelivery, personId: string, vehicleNumber: string) => Promise<void>
}) {
  const [personId, setPersonId] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const trimmed = personId.trim()
  const invalid = trimmed.length > 0 && !OBJECT_ID_PATTERN.test(trimmed)

  async function submit() {
    if (!delivery || !OBJECT_ID_PATTERN.test(trimmed)) return

    setSubmitting(true)
    try {
      await onAssign(delivery, trimmed, vehicleNumber.trim())
      onOpenChange(false)
    } catch (error) {
      toast.error(getDeliveryErrorMessage(error, 'Failed to assign the delivery person'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a delivery person</DialogTitle>
          <DialogDescription>
            {delivery ? `Delivery ${delivery.deliveryNumber}` : ''} — the delivery moves to
            &ldquo;Assigned&rdquo; straight away.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden />
            <p className="text-xs leading-relaxed text-blue-700">
              There is no vendor-facing delivery-person directory yet — that API is admin-only — so
              this takes the person&apos;s id directly. Ask your delivery partner for it, or use the
              admin assignment board.
            </p>
          </div>

          <div>
            <label
              htmlFor="assign-person-id"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Delivery person id <span className="text-red-500">*</span>
            </label>
            <input
              id="assign-person-id"
              value={personId}
              onChange={(event) => setPersonId(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="24-character id"
              aria-invalid={invalid || undefined}
              className={`w-full rounded-xl border px-3 py-2 font-mono text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-[#2874f0]/30 ${
                invalid ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-[#2874f0]'
              }`}
            />
            {invalid ? (
              <p className="mt-1 text-xs font-medium text-red-600">
                A delivery person id is 24 hexadecimal characters.
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="assign-vehicle"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Vehicle number <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="assign-vehicle"
              value={vehicleNumber}
              onChange={(event) => setVehicleNumber(event.target.value)}
              autoComplete="off"
              placeholder="e.g. KA01AB1234"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#2874f0] focus:ring-2 focus:ring-[#2874f0]/30"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || !OBJECT_ID_PATTERN.test(trimmed)}
            className="gap-2 bg-[#2874f0] font-semibold text-white hover:bg-[#1a55c4]"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <UserCheck className="h-4 w-4" aria-hidden />
            )}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Reschedule dialog ─────────────────────────────────────────────────────────

function RescheduleDialog({
  delivery,
  open,
  onOpenChange,
  onReschedule,
}: {
  delivery: VendorDelivery | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReschedule: (
    delivery: VendorDelivery,
    newDate: string,
    newSlot: string,
    reason: string
  ) => Promise<void>
}) {
  const [date, setDate] = useState('')
  const [slotIndex, setSlotIndex] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const dateInvalid = date.length > 0 && date < today
  const canSubmit = date.length > 0 && !dateInvalid && reason.trim().length >= 5

  async function submit() {
    if (!delivery || !canSubmit) return

    const slot =
      slotIndex === ''
        ? ''
        : `${DELIVERY_SLOT_OPTIONS[Number(slotIndex)].start}-${DELIVERY_SLOT_OPTIONS[Number(slotIndex)].end}`

    setSubmitting(true)
    try {
      await onReschedule(delivery, date, slot, reason.trim())
      onOpenChange(false)
    } catch (error) {
      toast.error(getDeliveryErrorMessage(error, 'Failed to reschedule the delivery'))
    } finally {
      setSubmitting(false)
    }
  }

  const currentSlot = formatSlot(delivery?.schedule?.scheduledSlot)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule delivery</DialogTitle>
          <DialogDescription>
            {delivery ? `Delivery ${delivery.deliveryNumber}` : ''} — currently{' '}
            {formatDate(delivery?.schedule?.scheduledDate ?? delivery?.schedule?.requestedDate)}
            {currentSlot ? `, ${currentSlot}` : ''}. The customer is notified automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="reschedule-date" className="mb-1.5 block text-xs font-semibold text-slate-600">
              New date <span className="text-red-500">*</span>
            </label>
            <input
              id="reschedule-date"
              type="date"
              value={date}
              min={today}
              onChange={(event) => setDate(event.target.value)}
              aria-invalid={dateInvalid || undefined}
              className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-[#2874f0]/30 ${
                dateInvalid
                  ? 'border-red-300 focus:border-red-400'
                  : 'border-slate-200 focus:border-[#2874f0]'
              }`}
            />
            {dateInvalid ? (
              <p className="mt-1 text-xs font-medium text-red-600">
                Pick today or a later date.
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="reschedule-slot" className="mb-1.5 block text-xs font-semibold text-slate-600">
              Time slot <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <select
              id="reschedule-slot"
              value={slotIndex}
              onChange={(event) => setSlotIndex(event.target.value)}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#2874f0] focus:ring-2 focus:ring-[#2874f0]/30"
            >
              <option value="">Keep the current slot</option>
              {DELIVERY_SLOT_OPTIONS.map((option, index) => (
                <option key={option.start} value={index}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reschedule-reason" className="mb-1.5 block text-xs font-semibold text-slate-600">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reschedule-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="Why is this delivery moving?"
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#2874f0] focus:ring-2 focus:ring-[#2874f0]/30"
            />
            <p className="mt-1 text-xs text-slate-400">
              {reason.trim().length < 5
                ? 'At least 5 characters — this is shared with the customer.'
                : 'Shared with the customer.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || !canSubmit}
            className="gap-2 bg-[#2874f0] font-semibold text-white hover:bg-[#1a55c4]"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Calendar className="h-4 w-4" aria-hidden />
            )}
            Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function VendorDeliveryPage() {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [assignTarget, setAssignTarget] = useState<VendorDelivery | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<VendorDelivery | null>(null)

  const filters = useMemo(
    () => ({ page, limit: PAGE_SIZE, status, type, startDate: fromDate, endDate: toDate }),
    [page, status, type, fromDate, toDate]
  )

  const { data, isPending, isFetching, isError, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: [...vendorQueryKeys.deliveries, filters],
    queryFn: () =>
      getVendorDeliveries({
        page: filters.page,
        limit: filters.limit,
        status: filters.status || undefined,
        type: filters.type || undefined,
        // Explicit UTC bounds so the end day is included, not excluded at midnight.
        startDate: filters.startDate ? `${filters.startDate}T00:00:00.000Z` : undefined,
        endDate: filters.endDate ? `${filters.endDate}T23:59:59.999Z` : undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const summary = data?.summary
  const pagination = data?.pagination

  /**
   * The API has no text-search parameter, so this narrows the rows already
   * loaded. It is labelled as such in the UI rather than pretending to search
   * the whole collection.
   */
  const rows = useMemo(() => {
    const list = data?.deliveries ?? []
    const term = search.trim().toLowerCase()
    if (!term) return list

    return list.filter((delivery) => {
      const haystack = [
        delivery.deliveryNumber,
        delivery.rental?.rentalNumber,
        getCustomerName(delivery),
        getCustomerPhone(delivery),
        delivery.address?.pincode,
        delivery.address?.city,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [data, search])

  const hasFilters = Boolean(status || type || fromDate || toDate || search)

  const resetFilters = useCallback(() => {
    setStatus('')
    setType('')
    setFromDate('')
    setToDate('')
    setSearch('')
    setPage(1)
  }, [])

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: vendorQueryKeys.deliveries })
  }, [queryClient])

  const handleAssign = useCallback(
    async (delivery: VendorDelivery, personId: string, vehicleNumber: string) => {
      await assignDeliveryPerson(delivery._id, {
        deliveryPersonId: personId,
        vehicle: vehicleNumber ? { number: vehicleNumber } : undefined,
      })
      toast.success(`${delivery.deliveryNumber} assigned`)
      await invalidate()
    },
    [invalidate]
  )

  const handleReschedule = useCallback(
    async (delivery: VendorDelivery, newDate: string, newSlot: string, reason: string) => {
      await rescheduleDelivery(delivery._id, {
        newDate: `${newDate}T00:00:00.000Z`,
        newSlot: newSlot || undefined,
        reason,
      })
      toast.success(`${delivery.deliveryNumber} rescheduled`)
      await invalidate()
    },
    [invalidate]
  )

  // ── States ─────────────────────────────────────────────────────────────────

  if (isPending) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#2874f0]/20 border-t-[#2874f0]" />
          <Truck className="absolute inset-0 m-auto h-5 w-5 text-[#2874f0]" aria-hidden />
        </div>
        <p className="text-sm font-medium text-slate-400">Loading deliveries…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <span className="rounded-2xl bg-red-50 p-4">
          <AlertCircle className="h-7 w-7 text-red-500" aria-hidden />
        </span>
        <div>
          <p className="font-semibold text-slate-800">Couldn&apos;t load your deliveries</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {getDeliveryErrorMessage(error, 'The delivery service did not respond.')}
          </p>
        </div>
        <Button
          onClick={() => void refetch()}
          className="gap-2 rounded-xl bg-[#2874f0] font-semibold text-white hover:bg-[#1a55c4]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Try again
        </Button>
      </div>
    )
  }

  const statCards = [
    {
      icon: Clock,
      label: 'Scheduled today',
      value: summary?.today ?? 0,
      tone: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Navigation,
      label: 'In progress',
      value: (summary?.out_for_delivery ?? 0) + (summary?.in_transit ?? 0) + (summary?.reached ?? 0),
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      icon: PackageCheck,
      label: 'Delivered',
      value: summary?.delivered ?? 0,
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: XCircle,
      label: 'Failed / cancelled',
      value: (summary?.failed ?? 0) + (summary?.cancelled ?? 0),
      tone: 'bg-red-50 text-red-500',
    },
  ]

  const breakdown = [
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'batched', label: 'Batched' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'out_for_delivery', label: 'Out for delivery' },
    { key: 'in_transit', label: 'In transit' },
    { key: 'reached', label: 'Reached' },
    { key: 'picked_up', label: 'Picked up' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'rescheduled', label: 'Rescheduled' },
    { key: 'returned_to_warehouse', label: 'Returned' },
    { key: 'failed', label: 'Failed' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  const isEmpty = rows.length === 0

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2e6c] via-[#2874f0] to-[#0f52c4] p-6 text-white shadow-xl shadow-[#2874f0]/25">
        <div className="pointer-events-none absolute -top-8 -right-8 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 -left-8 h-36 w-36 rounded-full bg-white/5" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15 backdrop-blur-sm">
              <Truck className="h-7 w-7 text-white" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Deliveries</h1>
              <p className="mt-0.5 text-sm text-blue-200">
                Track every dispatch, pickup and return on your rentals
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                  <Navigation className="h-3 w-3" aria-hidden />
                  {summary?.open ?? 0} open
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                  <Package className="h-3 w-3" aria-hidden />
                  {summary?.total ?? 0} total
                </span>
                {summary && summary.failed > 0 ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                    <Ban className="h-3 w-3 text-red-200" aria-hidden />
                    {summary.failed} failed
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button
              onClick={() => void refetch()}
              disabled={isFetching}
              size="sm"
              className="gap-2 bg-white font-semibold text-[#2874f0] shadow-none hover:bg-blue-50"
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden />
              )}
              Refresh
            </Button>
            {dataUpdatedAt > 0 ? (
              <span className="text-[11px] text-blue-200">
                Updated{' '}
                {new Date(dataUpdatedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Summary ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statCards.map((stat, index) => (
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

      <SectionCard
        icon={Package}
        title="Status breakdown"
        description="Every delivery on your rentals, by current state"
      >
        <div className="flex flex-wrap gap-2">
          {breakdown.map((item) => {
            const count = summary ? (summary[item.key as keyof typeof summary] as number) : 0
            const meta = getStatusMeta(item.key)
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setStatus(status === item.key ? '' : item.key)
                  setPage(1)
                }}
                aria-pressed={status === item.key}
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  status === item.key
                    ? 'border-[#2874f0] bg-[#2874f0]/5 text-[#2874f0]'
                    : `${meta.tone} hover:border-[#2874f0]/40`
                }`}
              >
                {item.label}
                <span className="rounded-md bg-white/70 px-1.5 py-0.5 font-mono text-[10px]">
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </SectionCard>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <SectionCard
        icon={Search}
        title="Find deliveries"
        description="Filter by status, type and scheduled date range"
        headerExtra={
          hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 gap-1.5 px-2 text-xs text-slate-500 hover:text-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Clear
            </Button>
          ) : null
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label htmlFor="filter-search" className="mb-1 block text-[11px] font-semibold text-slate-500">
              Filter loaded rows
            </label>
            <div className="relative">
              <Search
                className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                id="filter-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Delivery number, customer, pincode…"
                className="w-full rounded-xl border border-slate-200 py-2 pr-8 pl-9 text-sm text-slate-700 outline-none transition focus:border-[#2874f0] focus:ring-2 focus:ring-[#2874f0]/30"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear the search text"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="filter-status" className="mb-1 block text-[11px] font-semibold text-slate-500">
              Status
            </label>
            <select
              id="filter-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value)
                setPage(1)
              }}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#2874f0] focus:ring-2 focus:ring-[#2874f0]/30"
            >
              <option value="">All statuses</option>
              {DELIVERY_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {getStatusMeta(value).label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-type" className="mb-1 block text-[11px] font-semibold text-slate-500">
              Type
            </label>
            <select
              id="filter-type"
              value={type}
              onChange={(event) => {
                setType(event.target.value)
                setPage(1)
              }}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#2874f0] focus:ring-2 focus:ring-[#2874f0]/30"
            >
              <option value="">All types</option>
              {DELIVERY_TYPES.map((value) => (
                <option key={value} value={value}>
                  {getTypeLabel(value)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="filter-from" className="mb-1 block text-[11px] font-semibold text-slate-500">
                From
              </label>
              <input
                id="filter-from"
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value)
                  setPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs text-slate-700 outline-none transition focus:border-[#2874f0] focus:ring-2 focus:ring-[#2874f0]/30"
              />
            </div>
            <div>
              <label htmlFor="filter-to" className="mb-1 block text-[11px] font-semibold text-slate-500">
                To
              </label>
              <input
                id="filter-to"
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value)
                  setPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs text-slate-700 outline-none transition focus:border-[#2874f0] focus:ring-2 focus:ring-[#2874f0]/30"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── List ─────────────────────────────────────────────────────────────── */}
      <SectionCard
        icon={Truck}
        title="Delivery queue"
        description={
          pagination
            ? `${pagination.total} deliver${pagination.total === 1 ? 'y' : 'ies'} matching`
            : undefined
        }
        headerExtra={
          isFetching ? (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Refreshing
            </span>
          ) : null
        }
      >
        {isEmpty ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="rounded-2xl bg-slate-100 p-4">
              <Package className="h-6 w-6 text-slate-400" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {hasFilters ? 'No deliveries match these filters' : 'No deliveries yet'}
              </p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                {hasFilters
                  ? 'Try widening the date range or clearing a filter.'
                  : 'A delivery appears here once one is scheduled against one of your rentals.'}
              </p>
            </div>
            {hasFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="rounded-xl text-xs"
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((delivery, index) => {
              const expanded = expandedId === delivery._id
              const assignable = isAssignable(delivery.status)
              const reschedulable = isReschedulable(delivery.status)
              const personName = getAssignedPersonName(delivery)
              const personId = getAssignedPersonId(delivery)
              const panelId = `delivery-panel-${delivery._id}`
              const priority = getPriorityMeta(delivery.priority)
              const timelineCount = delivery.tracking?.timeline?.length ?? 0

              return (
                <motion.div
                  key={delivery._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index, 6) * 0.04 }}
                  className={`overflow-hidden rounded-xl border transition-all ${
                    expanded
                      ? 'border-[#2874f0]/30 ring-2 ring-[#2874f0]/20'
                      : 'border-slate-100 bg-white shadow-sm'
                  }`}
                >
                  {/* Row header */}
                  <div className="flex flex-wrap items-start gap-3 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : delivery._id)}
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      className="flex min-w-0 flex-1 items-start gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[#2874f0]/40"
                    >
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2874f0]/10">
                        <Truck className="h-4 w-4 text-[#2874f0]" aria-hidden />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-800">
                            {delivery.deliveryNumber}
                          </span>
                          <StatusPill status={delivery.status} />
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {getTypeLabel(delivery.type)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priority.tone}`}
                          >
                            {priority.label}
                          </span>
                          {delivery.schedule?.rescheduledCount ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                              <RotateCcw className="h-2.5 w-2.5" aria-hidden />
                              Rescheduled ×{delivery.schedule.rescheduledCount}
                            </span>
                          ) : null}
                        </span>

                        <span className="mt-1 block truncate text-xs text-slate-600">
                          {getCustomerName(delivery)}
                          {getCustomerPhone(delivery) ? ` · ${getCustomerPhone(delivery)}` : ''}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" aria-hidden />
                            {formatSchedule(delivery)}
                          </span>
                          {delivery.address?.pincode ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" aria-hidden />
                              {delivery.address.city
                                ? `${delivery.address.city} ${delivery.address.pincode}`
                                : delivery.address.pincode}
                            </span>
                          ) : null}
                          {timelineCount > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" aria-hidden />
                              {timelineCount} update{timelineCount === 1 ? '' : 's'}
                            </span>
                          ) : null}
                        </span>
                      </span>

                      <ChevronDown
                        className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                          expanded ? 'rotate-180' : ''
                        }`}
                        aria-hidden
                      />
                    </button>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-xs font-semibold text-slate-700">
                        {formatCurrency(delivery.charges?.totalCharge)}
                      </span>
                      {personName ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                          <UserCheck className="h-3 w-3" aria-hidden />
                          {personName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600">
                          <User className="h-3 w-3" aria-hidden />
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detail */}
                  <AnimatePresence initial={false}>
                    {expanded ? (
                      <motion.div
                        id={panelId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-5 border-t border-slate-100 bg-slate-50/50 px-4 py-4">
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Field
                              icon={Calendar}
                              label="Scheduled"
                              value={`${formatDate(delivery.schedule?.scheduledDate ?? delivery.schedule?.requestedDate)}${
                                formatSlot(delivery.schedule?.scheduledSlot)
                                  ? ` · ${formatSlot(delivery.schedule?.scheduledSlot)}`
                                  : ''
                              }`}
                            />
                            <Field
                              icon={Clock}
                              label="Requested"
                              value={formatDate(delivery.schedule?.requestedDate)}
                            />
                            <Field
                              icon={Timer}
                              label="Deadline"
                              value={formatDate(delivery.schedule?.deadline)}
                            />
                            <Field
                              icon={User}
                              label="Customer"
                              value={
                                <>
                                  {getCustomerName(delivery)}
                                  {getCustomerPhone(delivery) ? (
                                    <a
                                      href={`tel:${getCustomerPhone(delivery)}`}
                                      className="ml-1 text-[#2874f0] hover:underline"
                                    >
                                      {getCustomerPhone(delivery)}
                                    </a>
                                  ) : null}
                                </>
                              }
                            />
                            <Field
                              icon={UserCheck}
                              label="Assigned to"
                              value={
                                personName ? (
                                  personName
                                ) : personId ? (
                                  // Assigned, but the person record was not populated.
                                  <span className="font-mono text-[11px]">{personId}</span>
                                ) : (
                                  <span className="text-amber-600">Not assigned yet</span>
                                )
                              }
                            />
                            <Field
                              icon={Truck}
                              label="Vehicle"
                              value={
                                delivery.vehicle?.number
                                  ? `${delivery.vehicle.number}${
                                      delivery.vehicle.type ? ` · ${delivery.vehicle.type}` : ''
                                    }`
                                  : '—'
                              }
                            />
                            <Field
                              icon={MapPin}
                              label="Delivery address"
                              value={formatAddress(delivery.address)}
                            />
                            <Field
                              icon={Navigation}
                              label="Last tracked"
                              value={formatDateTime(delivery.tracking?.currentLocation?.updatedAt)}
                            />
                            <Field
                              icon={PackageCheck}
                              label="Delivered at"
                              value={formatDateTime(delivery.tracking?.actualArrival)}
                            />
                          </div>

                          {delivery.address?.deliveryInstructions ? (
                            <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
                              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
                              <p className="text-xs leading-relaxed text-amber-800">
                                {delivery.address.deliveryInstructions}
                              </p>
                            </div>
                          ) : null}

                          {/* Items */}
                          <div>
                            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                              <Package className="h-3 w-3" aria-hidden />
                              Items
                            </p>
                            {delivery.items && delivery.items.length > 0 ? (
                              <ul className="space-y-1.5">
                                {delivery.items.map((item, itemIndex) => (
                                  <li
                                    key={`${item.sku ?? item.name ?? 'item'}-${itemIndex}`}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2"
                                  >
                                    <span className="min-w-0 text-xs text-slate-700">
                                      {item.name || 'Unnamed item'}
                                      {item.sku ? (
                                        <span className="ml-2 font-mono text-[10px] text-slate-400">
                                          {item.sku}
                                        </span>
                                      ) : null}
                                    </span>
                                    <span className="flex items-center gap-3 text-[11px] text-slate-500">
                                      {item.condition ? <span>{item.condition}</span> : null}
                                      <span className="font-semibold text-slate-700">
                                        ×{item.quantity ?? 1}
                                      </span>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-slate-400">No items listed.</p>
                            )}
                          </div>

                          {/* Charges */}
                          <div>
                            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                              <FileText className="h-3 w-3" aria-hidden />
                              Charges
                            </p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                              {[
                                { label: 'Base', value: delivery.charges?.baseCharge },
                                { label: 'Distance', value: delivery.charges?.distanceCharge },
                                { label: 'Weight', value: delivery.charges?.weightCharge },
                                { label: 'Special', value: delivery.charges?.specialCharge },
                                { label: 'Total', value: delivery.charges?.totalCharge },
                              ].map((row) => (
                                <div
                                  key={row.label}
                                  className="rounded-lg border border-slate-100 bg-white px-3 py-2"
                                >
                                  <p className="text-[10px] text-slate-400">{row.label}</p>
                                  <p className="text-xs font-semibold text-slate-700">
                                    {formatCurrency(row.value)}
                                  </p>
                                </div>
                              ))}
                            </div>
                            {delivery.charges?.paymentStatus ? (
                              <p className="mt-2 text-[11px] text-slate-500">
                                Payment:{' '}
                                <span className="font-semibold capitalize">
                                  {delivery.charges.paymentStatus}
                                </span>
                                {delivery.charges.paymentMethod
                                  ? ` · ${delivery.charges.paymentMethod}`
                                  : ''}
                              </p>
                            ) : null}
                          </div>

                          {/* Timeline */}
                          <div>
                            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                              <Clock className="h-3 w-3" aria-hidden />
                              Tracking timeline
                            </p>
                            <Timeline entries={delivery.tracking} />
                          </div>

                          {/* Proof */}
                          {delivery.proof &&
                          (delivery.proof.deliveredTo ||
                            (delivery.proof.photos?.length ?? 0) > 0 ||
                            delivery.proof.otp?.verifiedAt) ? (
                            <div>
                              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                                <CheckCircle className="h-3 w-3" aria-hidden />
                                Proof of delivery
                              </p>
                              <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                                {delivery.proof.deliveredTo ? (
                                  <span className="rounded-lg border border-slate-100 bg-white px-2.5 py-1">
                                    Received by {delivery.proof.deliveredTo}
                                  </span>
                                ) : null}
                                {(delivery.proof.photos?.length ?? 0) > 0 ? (
                                  <span className="rounded-lg border border-slate-100 bg-white px-2.5 py-1">
                                    {delivery.proof.photos?.length} photo
                                    {delivery.proof.photos?.length === 1 ? '' : 's'}
                                  </span>
                                ) : null}
                                {delivery.proof.otp?.verifiedAt ? (
                                  <span className="rounded-lg border border-slate-100 bg-white px-2.5 py-1">
                                    OTP verified {formatDateTime(delivery.proof.otp.verifiedAt)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ) : null}

                          {/* Issues */}
                          {delivery.issues && delivery.issues.length > 0 ? (
                            <div>
                              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                                <AlertCircle className="h-3 w-3" aria-hidden />
                                Reported issues
                              </p>
                              <ul className="space-y-1.5">
                                {delivery.issues.map((issue, issueIndex) => (
                                  <li
                                    key={`${issue.type ?? 'issue'}-${issueIndex}`}
                                    className={`rounded-lg border px-3 py-2 text-xs ${
                                      issue.resolvedAt
                                        ? 'border-slate-100 bg-white text-slate-600'
                                        : 'border-red-100 bg-red-50 text-red-700'
                                    }`}
                                  >
                                    <span className="font-semibold capitalize">
                                      {(issue.type ?? 'issue').replace(/_/g, ' ')}
                                    </span>
                                    {issue.description ? <span> — {issue.description}</span> : null}
                                    <span className="mt-0.5 block text-[10px] opacity-70">
                                      {issue.resolvedAt
                                        ? `Resolved ${formatDateTime(issue.resolvedAt)}`
                                        : `Reported ${formatDateTime(issue.reportedAt)}`}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                            <Button
                              type="button"
                              size="sm"
                              disabled={!assignable}
                              title={
                                assignable
                                  ? undefined
                                  : 'Only a scheduled delivery can be assigned a delivery person'
                              }
                              onClick={() => setAssignTarget(delivery)}
                              className="h-8 gap-1.5 rounded-lg bg-[#2874f0] text-xs font-semibold text-white hover:bg-[#1a55c4] disabled:bg-slate-200 disabled:text-slate-400"
                            >
                              <UserCheck className="h-3.5 w-3.5" aria-hidden />
                              {personName ? 'Reassign' : 'Assign person'}
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={!reschedulable}
                              title={
                                reschedulable
                                  ? undefined
                                  : 'Delivered, cancelled or returned deliveries cannot be rescheduled'
                              }
                              onClick={() => setRescheduleTarget(delivery)}
                              className="h-8 gap-1.5 rounded-lg text-xs"
                            >
                              <Calendar className="h-3.5 w-3.5" aria-hidden />
                              Reschedule
                            </Button>

                            {getCustomerPhone(delivery) ? (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 rounded-lg text-xs"
                              >
                                <a href={`tel:${getCustomerPhone(delivery)}`}>
                                  <Phone className="h-3.5 w-3.5" aria-hidden />
                                  Call customer
                                </a>
                              </Button>
                            ) : null}

                            {delivery._id ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  void navigator.clipboard
                                    ?.writeText(delivery.deliveryNumber)
                                    .then(() => toast.success('Delivery number copied'))
                                    .catch(() => toast.error('Could not copy to the clipboard'))
                                }}
                                className="h-8 gap-1.5 rounded-lg text-xs text-slate-500"
                              >
                                <Copy className="h-3.5 w-3.5" aria-hidden />
                                Copy number
                              </Button>
                            ) : null}

                            {delivery.rental?._id ? (
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 rounded-lg text-xs text-slate-500"
                              >
                                <Link href="/vendor/orders">
                                  Open related orders
                                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                                </Link>
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Page <span className="font-semibold text-slate-700">{pagination.page}</span> of{' '}
              {pagination.pages} · {pagination.total} total
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="h-8 gap-1.5 rounded-lg text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages || isFetching}
                onClick={() => setPage((current) => current + 1)}
                className="h-8 gap-1.5 rounded-lg text-xs"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          </div>
        ) : null}
      </SectionCard>

      {/* ── Dialogs ──────────────────────────────────────────────────────────── */}
      <AssignDialog
        key={assignTarget?._id ?? 'no-assign-target'}
        delivery={assignTarget}
        open={assignTarget !== null}
        onOpenChange={(open) => {
          if (!open) setAssignTarget(null)
        }}
        onAssign={handleAssign}
      />

      <RescheduleDialog
        key={rescheduleTarget?._id ?? 'no-reschedule-target'}
        delivery={rescheduleTarget}
        open={rescheduleTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRescheduleTarget(null)
        }}
        onReschedule={handleReschedule}
      />
    </div>
  )
}
