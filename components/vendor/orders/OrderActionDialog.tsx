// components/vendor/orders/OrderActionDialog.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  X, RefreshCw, CheckCircle, AlertCircle, Package, Truck, Ban,
  Calendar, User, Plus, Trash2, Info,
} from 'lucide-react'
import { format } from 'date-fns'
import { Rental } from '@/app/(vendor)/vendor/orders/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

export type OrderAction =
  | 'confirm'
  | 'activate'
  | 'complete_return'
  | 'approve_extension'
  | 'reject_extension'

interface OrderActionDialogProps {
  rental: Rental
  action: OrderAction
  onClose: () => void
  /** Called after the action succeeded, so the list can be refetched. */
  onSuccess: (message: string) => void
}

type Condition = 'good' | 'fair' | 'damaged'

interface DamageRow {
  description: string
  charge: string
}

/**
 * Copy per action. `title` is phrased as the thing that is about to happen, and
 * `consequence` spells out what changes, because these actions are not reversible
 * from this screen.
 */
const ACTION_COPY: Record<
  OrderAction,
  {
    title: string
    cta: string
    progress: string
    consequence: string
    danger?: boolean
    icon: typeof CheckCircle
  }
> = {
  confirm: {
    title: 'Accept this order?',
    cta: 'Accept order',
    progress: 'Accepting order…',
    consequence:
      'The customer is notified that you have accepted. You are expected to arrange delivery for the rental period shown below; the delivery partner confirms hand-over.',
    icon: CheckCircle,
  },
  activate: {
    title: 'Start this rental?',
    cta: 'Start rental',
    progress: 'Starting rental…',
    consequence:
      'The rental period starts now, the item is marked as rented and monthly payment reminders are scheduled for the customer.',
    icon: Package,
  },
  complete_return: {
    title: 'Complete this return?',
    cta: 'Complete return',
    progress: 'Completing return…',
    consequence:
      'The rental is closed, inventory goes back to available, and the security deposit refund is calculated from the condition you record here.',
    icon: Truck,
  },
  approve_extension: {
    title: 'Approve this extension?',
    cta: 'Approve extension',
    progress: 'Approving extension…',
    consequence:
      'The rental end date and tenure are extended by the requested months and the additional amount is added to the order total.',
    icon: CheckCircle,
  },
  reject_extension: {
    title: 'Reject this extension?',
    cta: 'Reject extension',
    progress: 'Rejecting extension…',
    consequence:
      'The extension request is declined and the rental goes back to its original end date. The customer is notified.',
    danger: true,
    icon: Ban,
  },
}

export function OrderActionDialog({ rental, action, onClose, onSuccess }: OrderActionDialogProps) {
  const copy = ACTION_COPY[action]
  const Icon = copy.icon

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // complete_return body
  const [condition, setCondition] = useState<Condition>('good')
  const [damages, setDamages] = useState<DamageRow[]>([])
  const [returnNotes, setReturnNotes] = useState('')

  // reject_extension body
  const [reason, setReason] = useState('')

  // `extensions` is an array and the API addresses a request by index, so target the
  // PENDING entry rather than index 0 — a rental can carry earlier approved or
  // rejected requests ahead of the current one.
  const extensions = rental.extensions ?? []
  const pendingIndex = extensions.findIndex(e => e.status === 'pending')
  const effectiveIndex = pendingIndex >= 0 ? pendingIndex : 0
  const pendingExtension = extensions[effectiveIndex]

  const isExtensionAction = action === 'approve_extension' || action === 'reject_extension'
  const missingExtension = isExtensionAction && !pendingExtension

  const addDamageRow = () => setDamages(rows => [...rows, { description: '', charge: '' }])
  const removeDamageRow = (index: number) =>
    setDamages(rows => rows.filter((_, i) => i !== index))
  const updateDamageRow = (index: number, patch: Partial<DamageRow>) =>
    setDamages(rows => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  const submit = async () => {
    setError(null)

    // Build the body the endpoint expects. `confirm` and `activate` take no body —
    // their routes carry no validation middleware and the controllers ignore input.
    let url = ''
    let body: Record<string, unknown> | undefined

    switch (action) {
      case 'confirm':
        url = `/api/v1/rentals/vendor/${rental._id}/confirm`
        break
      case 'activate':
        url = `/api/v1/rentals/vendor/${rental._id}/activate`
        break
      case 'complete_return': {
        // `condition` is required by the validation middleware and restricted to
        // good | fair | damaged; anything else is rejected before it reaches the
        // service, so it can never be omitted here.
        const cleanedDamages = damages
          .map(row => ({ description: row.description.trim(), charge: Number(row.charge) || 0 }))
          .filter(row => row.description.length > 0)

        if (cleanedDamages.some(row => row.charge < 0)) {
          setError('Damage charges cannot be negative.')
          return
        }

        url = `/api/v1/rentals/vendor/${rental._id}/return/complete`
        body = {
          condition,
          damages: cleanedDamages,
          notes: returnNotes.trim() || undefined,
        }
        break
      }
      case 'approve_extension':
        url = `/api/v1/rentals/vendor/${rental._id}/extension/approve`
        body = { extensionIndex: effectiveIndex }
        break
      case 'reject_extension':
        url = `/api/v1/rentals/vendor/${rental._id}/extension/reject`
        body = { extensionIndex: effectiveIndex, reason: reason.trim() || undefined }
        break
    }

    setIsSubmitting(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}${url}`, {
        method: 'POST',
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.success) {
        // Surface the server's own wording — validation errors say exactly which
        // field was wrong, which the user can then fix without guesswork.
        setError(data?.message || `Request failed (HTTP ${res.status})`)
        return
      }

      onSuccess(
        action === 'confirm'
          ? 'Order accepted'
          : action === 'activate'
            ? 'Rental started'
            : action === 'complete_return'
              ? 'Return completed'
              : action === 'approve_extension'
                ? 'Extension approved'
                : 'Extension rejected',
      )
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="fixed inset-0 bg-black/50"
          onClick={isSubmitting ? undefined : onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-200">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                copy.danger ? 'bg-red-100' : 'bg-[#ebf3fb]'
              }`}
            >
              <Icon className={`h-5 w-5 ${copy.danger ? 'text-red-600' : 'text-[#2874f0]'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900">{copy.title}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{rental.rentalNumber}</p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-40"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* What is about to happen */}
            <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">{copy.consequence}</p>
            </div>

            {/* Order summary — the user should see exactly what they are acting on */}
            <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 text-sm">
              <div className="px-3 py-2 flex justify-between gap-3">
                <span className="text-slate-500">Product</span>
                <span className="font-medium text-right">{rental.product.basicInfo.name}</span>
              </div>
              <div className="px-3 py-2 flex justify-between gap-3">
                <span className="text-slate-500 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Customer
                </span>
                <span className="font-medium text-right">
                  {rental.user.profile.firstName} {rental.user.profile.lastName}
                </span>
              </div>
              <div className="px-3 py-2 flex justify-between gap-3">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Period
                </span>
                <span className="font-medium text-right">
                  {format(new Date(rental.rentalDetails.startDate), 'dd MMM yyyy')} –{' '}
                  {format(new Date(rental.rentalDetails.endDate), 'dd MMM yyyy')}
                  <span className="text-slate-400">
                    {' '}
                    ({rental.rentalDetails.tenureMonths} mo)
                  </span>
                </span>
              </div>
              <div className="px-3 py-2 flex justify-between gap-3">
                <span className="text-slate-500">Order total</span>
                <span className="font-bold">₹{rental.rentalDetails.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="px-3 py-2 flex justify-between gap-3">
                <span className="text-slate-500">Paid / Due</span>
                <span className="font-medium text-right">
                  ₹{rental.payment.paidAmount.toLocaleString('en-IN')} paid ·{' '}
                  <span className={rental.payment.dueAmount > 0 ? 'text-orange-600' : ''}>
                    ₹{rental.payment.dueAmount.toLocaleString('en-IN')} due
                  </span>
                </span>
              </div>
            </div>

            {/* complete_return: condition is mandatory */}
            {action === 'complete_return' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Condition on return <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['good', 'fair', 'damaged'] as Condition[]).map(value => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCondition(value)}
                        disabled={isSubmitting}
                        className={`px-3 py-2 rounded-lg border text-sm font-semibold capitalize transition-colors disabled:opacity-60 ${
                          condition === value
                            ? 'border-[#2874f0] bg-[#ebf3fb] text-[#2874f0]'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Recorded against inventory and used for the deposit settlement.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Damage charges <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={addDamageRow}
                      disabled={isSubmitting}
                      className="flex items-center gap-1 text-xs font-semibold text-[#2874f0] hover:underline disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add item
                    </button>
                  </div>

                  {damages.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      Nothing deducted. Leave empty if the item came back clean.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {damages.map((row, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={row.description}
                            onChange={e => updateDamageRow(index, { description: e.target.value })}
                            disabled={isSubmitting}
                            placeholder="e.g. Sofa arm torn"
                            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
                          />
                          <input
                            type="number"
                            min="0"
                            value={row.charge}
                            onChange={e => updateDamageRow(index, { charge: e.target.value })}
                            disabled={isSubmitting}
                            placeholder="₹"
                            className="w-24 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
                          />
                          <button
                            type="button"
                            onClick={() => removeDamageRow(index)}
                            disabled={isSubmitting}
                            className="px-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Notes <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={returnNotes}
                    onChange={e => setReturnNotes(e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    placeholder="Anything the customer or your team should know about this return."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Extension actions */}
            {(action === 'approve_extension' || action === 'reject_extension') && (
              <div className="space-y-3">
                {pendingExtension ? (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm space-y-1">
                    <p className="font-semibold text-orange-800">Requested by the customer</p>
                    <p className="text-orange-700">
                      {pendingExtension.additionalMonths} month
                      {pendingExtension.additionalMonths === 1 ? '' : 's'} more
                    </p>
                    {pendingExtension.newEndDate && (
                      <p className="text-xs text-orange-700">
                        New end date: {format(new Date(pendingExtension.newEndDate), 'dd MMM yyyy')}
                      </p>
                    )}
                    {typeof pendingExtension.additionalAmount === 'number' && (
                      <p className="text-xs text-orange-700">
                        Additional amount: ₹
                        {pendingExtension.additionalAmount.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                ) : (
                  // Reaching here means the status says extension_requested but the
                  // document carries no pending request — surface it instead of
                  // firing an approve/reject that the server would reject anyway.
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    No pending extension request found on this order. Reload the page — the order
                    may have changed since it was loaded.
                  </p>
                )}

                {action === 'reject_extension' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Reason <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      disabled={isSubmitting}
                      rows={3}
                      placeholder="Shared with the customer so they know why."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 resize-none"
                    />
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="flex gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border border-slate-200 bg-white rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting || missingExtension}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                copy.danger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#2874f0] hover:bg-[#1a5fd4]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {copy.progress}
                </>
              ) : (
                copy.cta
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
