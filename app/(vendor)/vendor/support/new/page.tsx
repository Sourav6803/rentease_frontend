// app/(vendor)/vendor/support/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  ArrowLeft,
  Send,
  RefreshCw,
  User,
  Store,
  Calendar,
  DollarSign,
  AlertCircle,
  Shield,
  Star,
  HelpCircle,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Content-Type': 'application/json',
    Authorization: session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

const TICKET_TYPES = [
  { value: 'vendor_issue', label: 'Vendor Issue', icon: Store, color: '#fb641b', desc: 'Store, listings, account settings' },
  { value: 'rental_dispute', label: 'Rental Dispute', icon: Calendar, color: '#9c27b0', desc: 'Disagreement over a rental order' },
  { value: 'payment_dispute', label: 'Payment / Payout', icon: DollarSign, color: '#21a056', desc: 'Payouts, commissions, refunds' },
  { value: 'technical_issue', label: 'Technical Issue', icon: AlertCircle, color: '#ef4444', desc: 'Bugs, errors, something broken' },
  { value: 'content_moderation', label: 'Content / Policy', icon: Shield, color: '#8b5cf6', desc: 'Listing approvals, policy questions' },
  { value: 'feature_request', label: 'Feature Request', icon: Star, color: '#fbbf24', desc: 'Suggest an improvement' },
  { value: 'account_issue', label: 'Account Issue', icon: User, color: '#06b6d4', desc: 'Login, profile, verification' },
  { value: 'other', label: 'Other', icon: HelpCircle, color: '#64748b', desc: 'Anything else' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low', hint: 'General inquiry', color: '#64748b', bg: '#f1f5f9' },
  { value: 'medium', label: 'Medium', hint: 'Minor issue', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'high', label: 'High', hint: 'Urgent matter', color: '#f59e0b', bg: '#fef3c7' },
  { value: 'urgent', label: 'Urgent', hint: 'Business impact', color: '#ef4444', bg: '#fef2f2' },
  { value: 'critical', label: 'Critical', hint: 'System down', color: '#7f1d1d', bg: '#fee2e2' },
]

const SUBJECT_MIN = 5
const SUBJECT_MAX = 200
const DESC_MIN = 10
const DESC_MAX = 5000

export default function NewTicketPage() {
  const router = useRouter()
  const toast = useToast()

  const [form, setForm] = useState({
    type: 'vendor_issue',
    priority: 'medium',
    subject: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)

  const subjectValid = form.subject.trim().length >= SUBJECT_MIN && form.subject.trim().length <= SUBJECT_MAX
  const descValid = form.description.trim().length >= DESC_MIN && form.description.trim().length <= DESC_MAX
  const canSubmit = subjectValid && descValid && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!subjectValid || !descValid) {
      toast.error('Please fix the highlighted fields before submitting')
      return
    }

    setSubmitting(true)
    try {
      const headers = await getAuthHeaders()
      // Only send fields the backend expects. `relatedTo` is intentionally
      // omitted — sending empty strings fails backend validation (isIn / isMongoId).
      const res = await fetch(`${BASE_URL}/api/v1/support/tickets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: form.type,
          priority: form.priority,
          subject: form.subject.trim(),
          description: form.description.trim(),
        }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        const ticketNo = data.data?.ticket?.ticketNumber
        toast.success(ticketNo ? `Ticket ${ticketNo} created successfully` : 'Support ticket created successfully')
        router.push('/vendor/support')
      } else {
        const firstErr = Array.isArray(data.errors) && data.errors.length ? data.errors[0].message : null
        toast.error(firstErr || data.message || 'Failed to create ticket')
      }
    } catch {
      toast.error('Failed to create ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedType = TICKET_TYPES.find((t) => t.value === form.type)

  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Breadcrumb + back */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/vendor/support" className="hover:text-[#2874f0]">
            Support Center
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-800">New Ticket</span>
        </div>
        <Link
          href="/vendor/support"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#2874f0]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="bg-gradient-to-r from-[#2874f0] to-[#00a0e3] px-6 py-5">
              <h1 className="text-xl font-bold text-white">Create a Support Ticket</h1>
              <p className="mt-1 text-sm text-white/80">
                Tell us what’s going on and our team will get back to you — typically within 2–4 hours.
              </p>
            </div>

            <div className="space-y-6 p-6">
              {/* Type */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  What do you need help with? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {TICKET_TYPES.map((t) => {
                    const Icon = t.icon
                    const active = form.type === t.value
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm({ ...form, type: t.value })}
                        className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all ${
                          active
                            ? 'border-[#2874f0] bg-[#2874f0]/5 ring-1 ring-[#2874f0]/30'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${t.color}1a` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: t.color }} />
                        </span>
                        <span className="text-xs font-semibold text-slate-800">{t.label}</span>
                      </button>
                    )
                  })}
                </div>
                {selectedType && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Info className="h-3.5 w-3.5" />
                    {selectedType.desc}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Priority <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {PRIORITIES.map((p) => {
                    const active = form.priority === p.value
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setForm({ ...form, priority: p.value })}
                        className={`rounded-xl border p-2.5 text-center transition-all ${
                          active ? 'border-transparent ring-2' : 'border-slate-200 hover:border-slate-300'
                        }`}
                        style={active ? { backgroundColor: p.bg, boxShadow: `0 0 0 2px ${p.color}` } : undefined}
                      >
                        <span className="block text-sm font-semibold" style={{ color: active ? p.color : '#334155' }}>
                          {p.label}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-slate-400">{p.hint}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Subject */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs ${form.subject.length > SUBJECT_MAX ? 'text-red-500' : 'text-slate-400'}`}>
                    {form.subject.length}/{SUBJECT_MAX}
                  </span>
                </div>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  maxLength={SUBJECT_MAX + 20}
                  placeholder="Brief summary of your issue"
                  className={`w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 ${
                    touched && !subjectValid
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-slate-200 focus:ring-[#2874f0]/30'
                  }`}
                />
                {touched && !subjectValid && (
                  <p className="mt-1 text-xs text-red-500">Subject must be between {SUBJECT_MIN} and {SUBJECT_MAX} characters.</p>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs ${form.description.length > DESC_MAX ? 'text-red-500' : 'text-slate-400'}`}>
                    {form.description.length}/{DESC_MAX}
                  </span>
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={6}
                  maxLength={DESC_MAX + 100}
                  placeholder="Please provide detailed information — include order numbers, dates, and any relevant details so we can help faster."
                  className={`w-full resize-none rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 ${
                    touched && !descValid
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-slate-200 focus:ring-[#2874f0]/30'
                  }`}
                />
                {touched && !descValid && (
                  <p className="mt-1 text-xs text-red-500">Description must be between {DESC_MIN} and {DESC_MAX} characters.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <Link
                  href="/vendor/support"
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2874f0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a5fd4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? 'Submitting…' : 'Submit Ticket'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Sidebar tips */}
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-4"
        >
          <div className="rounded-2xl border border-[#2874f0]/20 bg-gradient-to-br from-[#2874f0]/5 to-[#00a0e3]/5 p-5">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#2874f0]" />
              <h3 className="font-semibold text-slate-800">Tips for a faster resolution</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-600">
              {[
                'Be specific — include order/rental numbers where relevant.',
                'Choose the priority that matches real business impact.',
                'Describe what you expected vs. what actually happened.',
                'Mention steps you already tried.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#21a056]" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-1 font-semibold text-slate-800">Need instant answers?</h3>
            <p className="text-sm text-slate-500">
              Many common questions are already answered in our{' '}
              <Link href="/vendor/support/knowledge-base" className="font-medium text-[#2874f0] hover:underline">
                Knowledge Base
              </Link>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-2 font-semibold text-slate-800">Response times</h3>
            <div className="space-y-1.5 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Critical</span><span className="font-semibold text-red-600">~1 hour</span></div>
              <div className="flex items-center justify-between"><span>Urgent</span><span className="font-semibold text-orange-600">~4 hours</span></div>
              <div className="flex items-center justify-between"><span>High</span><span className="font-semibold text-amber-600">~8 hours</span></div>
              <div className="flex items-center justify-between"><span>Medium</span><span className="font-semibold text-blue-600">~24 hours</span></div>
              <div className="flex items-center justify-between"><span>Low</span><span className="font-semibold text-slate-500">~48 hours</span></div>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
