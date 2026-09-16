// app/vendor/payments/payout-history/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History, Download, ChevronLeft, ChevronRight, RefreshCw,
  CheckCircle, Clock, XCircle, Calendar, DollarSign,
  TrendingUp, Wallet, FileText, Eye, Search, Filter,
  AlertCircle, Banknote
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

/**
 * Mirrors the Payout model (backend/src/models/Payout.model.js).
 *
 * This page previously described a completely different shape — `status:
 * 'completed'`, `period.start/end`, `transactions`, `bankDetails` — none of which
 * the API returns. The API sends `paid`, `periodStart/periodEnd`, `entryIds` and
 * `bankAccountSnapshot`, so rows were rendered from `undefined` and the first
 * property access ("Cannot read properties of undefined") blanked the page.
 */
type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled'

interface Payout {
  _id: string
  payoutNumber: string
  amount: number
  currency?: string
  status: PayoutStatus
  method: string
  /** Populated by the receipt endpoint (`getPayout` populates name + vendorId). */
  vendor?: {
    business?: { name?: string }
    vendorId?: string
  }
  periodStart?: string
  periodEnd?: string
  entryIds?: string[]
  deductions?: {
    grossAmount?: number
    commission?: number
    platformFee?: number
    tax?: number
    processingFee?: number
    netAmount?: number
  }
  bankAccountSnapshot?: {
    accountHolderName?: string
    accountNumberMasked?: string
    ifscCode?: string
    bankName?: string
    upiId?: string
  }
  gateway?: {
    payoutId?: string
    utr?: string
    failureReason?: string
    attempts?: number
    mode?: string
  }
  requiresManualTransfer?: boolean
  receiptNumber?: string
  processedAt?: string
  createdAt: string
}

const statusConfig: Record<
  PayoutStatus,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: RefreshCw },
  paid: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle },
  failed: { label: 'Failed', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', icon: XCircle },
}

/**
 * Never returns undefined. A status the frontend does not know about (a future
 * one added on the backend) must degrade to a neutral badge, not crash the page.
 */
function getStatusConfig(status: string) {
  return statusConfig[status as PayoutStatus] ?? statusConfig.pending
}

/** One ledger entry settled by this payout, as returned inside the receipt. */
interface ReceiptEntry {
  _id: string
  type?: string
  direction?: string
  amount?: number
  status?: string
  description?: string
  createdAt?: string
}

/** Response body of GET /api/v1/vendor/payouts/:id/receipt. */
interface PayoutReceiptPayload {
  payout?: Payout
  entries?: ReceiptEntry[]
  receiptNumber?: string
  generatedAt?: string
  isPaid?: boolean
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatINR(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n)
    ? `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
    : '—'
}

function safeDate(value?: string | null, pattern = 'dd MMM yyyy') {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : format(d, pattern)
}

/**
 * Standalone, print-ready receipt document.
 *
 * Rendered into a new tab from the API payload instead of a client-side PDF so the
 * numbers on the receipt are exactly the numbers the server stored (gross, every
 * deduction, the net, the UTR and the bank snapshot as at payout time).
 */
function buildReceiptHtml(receipt: PayoutReceiptPayload, fallback: Payout) {
  const p: Payout = receipt?.payout ?? fallback
  const entries = Array.isArray(receipt?.entries) ? receipt.entries : []
  const d = p.deductions || {}
  const bank = p.bankAccountSnapshot || {}
  const gateway = p.gateway || {}

  const vendorName = p.vendor?.business?.name || 'Vendor'
  const vendorCode = p.vendor?.vendorId || ''
  const receiptNumber = receipt?.receiptNumber || p.receiptNumber || '—'
  const netAmount = d.netAmount ?? p.amount ?? 0
  const isTestMode = gateway.mode === 'test'

  const metaRow = (label: string, value: string) =>
    `<div class="row"><span class="k">${escapeHtml(label)}</span><span class="v">${value}</span></div>`

  const deductionRows = (
    [
      ['Gross earnings', d.grossAmount],
      ['Platform commission', d.commission],
      ['Platform fee', d.platformFee],
      ['Tax deducted', d.tax],
      ['Payout processing fee', d.processingFee],
    ] as Array<[string, number | undefined]>
  )
    .map(
      ([label, value]) =>
        `<tr><td>${escapeHtml(label)}</td><td class="num">${escapeHtml(formatINR(value ?? 0))}</td></tr>`,
    )
    .join('')

  const entryRows = entries.length
    ? entries
        .map(
          (entry) => `<tr>
            <td>${escapeHtml(safeDate(entry.createdAt))}</td>
            <td>${escapeHtml(entry.type || '—')}${
              entry.direction ? ` <span class="muted">(${escapeHtml(entry.direction)})</span>` : ''
            }</td>
            <td>${escapeHtml(entry.description || '—')}</td>
            <td>${escapeHtml(entry.status || '—')}</td>
            <td class="num">${escapeHtml(formatINR(entry.amount ?? 0))}</td>
          </tr>`,
        )
        .join('')
    : '<tr><td colspan="5" class="muted">No ledger entries are linked to this payout.</td></tr>'

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Payout receipt ${escapeHtml(p.payoutNumber)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 32px; background: #fff; }
  .sheet { max-width: 780px; margin: 0 auto; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2874f0; padding-bottom: 16px; }
  .brand { font-size: 22px; font-weight: 700; color: #2874f0; }
  .brand small { display: block; font-size: 11px; font-weight: 400; color: #64748b; margin-top: 2px; }
  .doc { text-align: right; }
  .doc h1 { font-size: 15px; letter-spacing: 1.5px; margin: 0 0 4px; color: #334155; }
  .doc .no { font-family: ui-monospace, "Cascadia Mono", Consolas, monospace; font-size: 13px; color: #0f172a; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 26px 0 8px; }
  .grid { display: flex; gap: 24px; flex-wrap: wrap; }
  .grid > div { flex: 1 1 300px; }
  .row { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
  .k { color: #64748b; }
  .v { font-weight: 600; text-align: right; word-break: break-word; }
  .mono { font-family: ui-monospace, "Cascadia Mono", Consolas, monospace; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; background: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; padding: 9px 10px; }
  td { padding: 9px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .muted { color: #94a3b8; }
  tr.net td { font-weight: 700; border-top: 2px solid #0f172a; border-bottom: none; }
  .paid-box { margin-top: 22px; display: flex; justify-content: space-between; align-items: center; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 16px 18px; }
  .paid-box .label { font-size: 12px; color: #047857; text-transform: uppercase; letter-spacing: .5px; }
  .paid-box .value { font-size: 26px; font-weight: 700; }
  .flag { margin-top: 18px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; border-radius: 8px; padding: 10px 12px; font-size: 12px; }
  .foot { margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; }
  .actions { max-width: 780px; margin: 0 auto 20px; display: flex; gap: 8px; }
  .actions button { font: inherit; font-weight: 600; padding: 9px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; }
  .actions button.primary { background: #2874f0; border-color: #2874f0; color: #fff; }
  @media print { .actions { display: none; } body { padding: 0; } }
</style>
</head>
<body>
<div class="actions">
  <button class="primary" onclick="window.print()">Print / Save as PDF</button>
  <button onclick="window.close()">Close</button>
</div>
<div class="sheet">
  <div class="head">
    <div class="brand">RentEase<small>Furniture &amp; Appliance Rentals</small></div>
    <div class="doc">
      <h1>PAYOUT RECEIPT</h1>
      <div class="no">${escapeHtml(receiptNumber)}</div>
      <div class="muted" style="font-size:11px;margin-top:4px;">Generated ${escapeHtml(
        safeDate(receipt?.generatedAt || new Date().toISOString(), 'dd MMM yyyy, hh:mm a'),
      )}</div>
    </div>
  </div>

  <h2>Paid to</h2>
  <div class="grid">
    <div>
      ${metaRow('Vendor', escapeHtml(vendorName))}
      ${vendorCode ? metaRow('Vendor ID', `<span class="mono">${escapeHtml(vendorCode)}</span>`) : ''}
      ${metaRow('Payout number', `<span class="mono">${escapeHtml(p.payoutNumber)}</span>`)}
      ${metaRow('Payout status', escapeHtml(getStatusConfig(p.status).label))}
    </div>
    <div>
      ${metaRow('Method', escapeHtml(p.method))}
      ${metaRow('Earnings period', `${
        p.periodStart && p.periodEnd
          ? `${escapeHtml(safeDate(p.periodStart))} – ${escapeHtml(safeDate(p.periodEnd))}`
          : '—'
      }`)}
      ${metaRow('Initiated', escapeHtml(safeDate(p.createdAt, 'dd MMM yyyy, hh:mm a')))}
      ${metaRow('Settled', escapeHtml(safeDate(p.processedAt, 'dd MMM yyyy, hh:mm a')))}
    </div>
  </div>

  <h2>Bank reference</h2>
  <div class="grid">
    <div>
      ${metaRow('Account holder', escapeHtml(bank.accountHolderName || '—'))}
      ${metaRow('Bank', escapeHtml(bank.bankName || '—'))}
      ${metaRow('Account number', `<span class="mono">${escapeHtml(bank.accountNumberMasked || '—')}</span>`)}
    </div>
    <div>
      ${metaRow('IFSC', `<span class="mono">${escapeHtml(bank.ifscCode || '—')}</span>`)}
      ${bank.upiId ? metaRow('UPI ID', `<span class="mono">${escapeHtml(bank.upiId)}</span>`) : ''}
      ${metaRow('UTR', `<span class="mono">${escapeHtml(gateway.utr || '—')}</span>`)}
      ${gateway.payoutId ? metaRow('Gateway payout ID', `<span class="mono">${escapeHtml(gateway.payoutId)}</span>`) : ''}
    </div>
  </div>

  <h2>How this amount was arrived at</h2>
  <table>
    <thead><tr><th>Item</th><th class="num">Amount</th></tr></thead>
    <tbody>
      ${deductionRows}
      <tr class="net"><td>Net amount paid</td><td class="num">${escapeHtml(formatINR(netAmount))}</td></tr>
    </tbody>
  </table>

  <div class="paid-box">
    <div class="label">${receipt?.isPaid === false ? 'Amount applied' : 'Amount transferred'}</div>
    <div class="value">${escapeHtml(formatINR(netAmount))}</div>
  </div>

  ${isTestMode ? '<div class="flag"><strong>Test mode.</strong> This payout was processed against RazorpayX test keys — no real money moved.</div>' : ''}
  ${
    p.requiresManualTransfer
      ? '<div class="flag"><strong>Manual transfer.</strong> The gateway integration was off, so this payout was settled by a bank transfer outside RazorpayX.</div>'
      : ''
  }

  <h2>Settled earnings (${entries.length})</h2>
  <table>
    <thead>
      <tr><th>Date</th><th>Type</th><th>Description</th><th>Status</th><th class="num">Amount</th></tr>
    </thead>
    <tbody>${entryRows}</tbody>
  </table>

  <div class="foot">
    This is a system-generated payout receipt for ${escapeHtml(p.payoutNumber)}. Retain it for your
    records. Any discrepancy should be raised with RentEase support within 7 days of the settlement
    date shown above.
  </div>
</div>
<script>setTimeout(function () { try { window.print(); } catch (e) {} }, 400);</script>
</body>
</html>`
}

function PayoutCard({ payout, onViewDetails }: { payout: Payout; onViewDetails: (payout: Payout) => void }) {
  const config = getStatusConfig(payout.status)
  const Icon = config.icon
  const entryCount = payout.entryIds?.length ?? 0
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all"
    >
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <p className="text-xs font-mono text-slate-400">{payout.payoutNumber}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.bg} ${config.color}`}>
              <Icon className="h-2.5 w-2.5" />
              {config.label}
            </span>
          </div>
          <h3 className="font-semibold text-slate-800">₹{payout.amount.toLocaleString()}</h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {payout.periodStart && payout.periodEnd
                ? `${format(new Date(payout.periodStart), 'dd MMM')} - ${format(
                    new Date(payout.periodEnd),
                    'dd MMM yyyy',
                  )}`
                : '—'}
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              {payout.method}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {entryCount} transaction{entryCount !== 1 ? 's' : ''} included
          </p>
        </div>
        <div className="text-right">
          {payout.processedAt && (
            <p className="text-xs text-green-600 mb-2">
              {payout.status === 'paid' ? 'Paid' : 'Processed'}{' '}
              {format(new Date(payout.processedAt), 'dd MMM yyyy')}
            </p>
          )}
          <button
            onClick={() => onViewDetails(payout)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function PayoutDetailsModal({ payout, onClose }: { payout: Payout; onClose: () => void }) {
  const toast = useToast()
  const config = getStatusConfig(payout.status)
  const Icon = config.icon
  const bank = payout.bankAccountSnapshot
  const entryCount = payout.entryIds?.length ?? 0
  const [isReceiptLoading, setIsReceiptLoading] = useState(false)

  /**
   * Fetch this payout's receipt from the vendor-scoped endpoint and render it as a
   * printable document.
   *
   * The button used to be permanently disabled: the backend only exposed
   * `GET /api/v1/admin/payouts/:id/receipt` (admin-only), and the original link
   * pointed at `/api/v1/payouts/:id/receipt` — no such route, and resolved against
   * the frontend origin, so it always 404'd.
   */
  const openReceipt = async () => {
    setIsReceiptLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(
        `${BASE_URL}/api/v1/vendor/payouts/${payout._id}/receipt`,
        { headers },
      )
      const body = await res.json().catch(() => null)

      if (!res.ok || !body?.success) {
        toast.error(body?.message || `Could not load the receipt (HTTP ${res.status})`)
        return
      }

      const win = window.open('', '_blank')
      if (!win) {
        // Pop-up blocked — the fetch succeeded, so tell the user exactly what to do.
        toast.error('Allow pop-ups for this site to open the receipt')
        return
      }

      win.document.write(buildReceiptHtml(body.data || {}, payout))
      win.document.close()
    } catch {
      toast.error('Could not load the receipt')
    } finally {
      setIsReceiptLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
          <div className={`sticky top-0 px-6 py-4 border-b ${
            payout.status === 'paid' ? 'bg-green-50' :
            payout.status === 'pending' ? 'bg-amber-50' :
            payout.status === 'failed' ? 'bg-red-50' :
            payout.status === 'cancelled' ? 'bg-slate-50' : 'bg-blue-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  payout.status === 'paid' ? 'bg-green-100' :
                  payout.status === 'pending' ? 'bg-amber-100' :
                  payout.status === 'failed' ? 'bg-red-100' :
                  payout.status === 'cancelled' ? 'bg-slate-100' : 'bg-blue-100'
                }`}>
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-mono">{payout.payoutNumber}</p>
                  <h2 className="text-xl font-bold text-slate-900">Payout {config.label}</h2>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/50">
                <XCircle className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Amount */}
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">Total Amount</p>
              <p className="text-4xl font-bold text-slate-900">₹{payout.amount.toLocaleString()}</p>
            </div>
            
            {/* Timeline */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Timeline</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Payout Initiated</p>
                    <p className="text-xs text-slate-500">{format(new Date(payout.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                </div>
                {payout.processedAt && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Processing</p>
                      <p className="text-xs text-slate-500">{format(new Date(payout.processedAt), 'dd MMM yyyy, hh:mm a')}</p>
                    </div>
                  </div>
                )}
                {payout.processedAt && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {payout.status === 'paid' ? 'Paid' : 'Processed'}
                      </p>
                      <p className="text-xs text-slate-500">{format(new Date(payout.processedAt), 'dd MMM yyyy, hh:mm a')}</p>
                    </div>
                  </div>
                )}
                {payout.gateway?.utr && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <Banknote className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Bank Reference (UTR)</p>
                      <p className="text-xs text-slate-500 font-mono">{payout.gateway.utr}</p>
                    </div>
                  </div>
                )}
                {/* Only surface a failure when the payout actually failed — a
                    successful retry leaves the previous failureReason on the
                    record, and showing it next to "Paid" reads as a contradiction. */}
                {payout.status === 'failed' && payout.gateway?.failureReason && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-700">Failed</p>
                      <p className="text-xs text-red-600">{payout.gateway.failureReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Bank Details */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Bank Account Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank Name:</span>
                  <span className="font-medium">{bank?.bankName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Number:</span>
                  {/* Already masked server-side in bankAccountSnapshot. */}
                  <span className="font-mono">{bank?.accountNumberMasked || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IFSC Code:</span>
                  <span className="font-mono">{bank?.ifscCode || '-'}</span>
                </div>
                {bank?.upiId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">UPI ID:</span>
                    <span className="font-mono">{bank.upiId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Deductions */}
            {payout.deductions && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-semibold text-slate-800 mb-3">Breakdown</h3>
                <div className="space-y-2 text-sm">
                  {([
                    ['Gross Earnings', payout.deductions.grossAmount],
                    ['Platform Commission', payout.deductions.commission],
                    ['Platform Fee', payout.deductions.platformFee],
                    ['Tax Deducted', payout.deductions.tax],
                    ['Payout Processing Fee', payout.deductions.processingFee],
                  ] as Array<[string, number | undefined]>).map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-medium">
                        ₹{Number(value ?? 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="font-semibold text-slate-700">Net Amount Paid</span>
                    <span className="font-bold text-slate-900">
                      ₹{Number(payout.deductions.netAmount ?? payout.amount ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Settled ledger entries. The payout document carries entry ids only,
                not per-entry amounts, so no amount is shown per row. */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-3">
                Settled Earnings ({entryCount})
              </h3>
              {entryCount === 0 ? (
                <p className="text-sm text-slate-500">No ledger entries linked to this payout.</p>
              ) : (
                <div className="space-y-1">
                  {(payout.entryIds ?? []).map((entryId) => (
                    <p key={entryId} className="text-xs text-slate-500 font-mono truncate">
                      {entryId}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="sticky bottom-0 border-t border-slate-200 px-6 py-4 bg-white">
            <button
              type="button"
              onClick={openReceipt}
              disabled={isReceiptLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1e5fc4] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {isReceiptLoading ? 'Preparing receipt…' : 'Download Receipt'}
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">
              Opens a printable receipt for{' '}
              <span className="font-mono">{payout.payoutNumber}</span>
              {payout.receiptNumber ? (
                <>
                  {' '}
                  (receipt <span className="font-mono">{payout.receiptNumber}</span>)
                </>
              ) : null}
              . Use Print → Save as PDF to keep a copy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PayoutHistoryPage() {
  const { data: session, status } = useSession()
  const toast = useToast()
  
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPayouts, setTotalPayouts] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  // `searchInput` is what the user types; `search` is what we actually query with.
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  
  // Debounced so a payout number is not queried once per keystroke. Resets to page 1
  // so a narrowed result set can never leave the user stranded on an empty page.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])
  
  const fetchPayouts = useCallback(async () => {
    if (status !== 'authenticated') return
    
    try {
      // `isLoading` drives the full-page spinner, so it is only ever true for the
      // first load. Re-fetches (page / filter / search) must not blank the page.
      const headers = await getAuthHeaders()
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', '10')
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      
      const res = await fetch(`${BASE_URL}/api/v1/vendor/payouts?${params.toString()}`, { headers })
      const data = await res.json()
      
      if (data.success) {
        setPayouts(data.data.payouts || [])
        setTotalPages(data.data.pagination?.pages || 1)
        setTotalPayouts(data.data.pagination?.total || 0)
        setTotalAmount(data.data.totalAmount || 0)
      } else {
        toast.error(data.message || 'Failed to load payouts')
      }
    } catch (error) {
      toast.error('Failed to load payouts')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, statusFilter, search, status, toast])
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchPayouts()
    }
  }, [fetchPayouts, status])
  
  const stats = [
    { label: 'Total Payouts', value: totalPayouts, icon: History, color: '#2874f0' },
    { label: 'Total Amount', value: `₹${(totalAmount / 1000).toFixed(1)}K`, icon: DollarSign, color: '#21a056' },
    { label: 'Avg. Payout', value: `₹${totalPayouts > 0 ? Math.round(totalAmount / totalPayouts).toLocaleString() : 0}`, icon: TrendingUp, color: '#fb641b' },
  ]
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading payout history...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}10` }}>
                  <Icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by payout ID..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              // A narrowed list is usually shorter, so start from the first page
              // instead of leaving the user on a page that no longer exists.
              setCurrentPage(1)
            }}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
          >
            {/* Values must match the Payout model's status enum. This list offered
                "completed", which is not one of them — the API silently ignored the
                value, so choosing it showed every payout rather than only the paid
                ones. "cancelled" was missing entirely. */}
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {/* Payouts List */}
      <AnimatePresence mode="popLayout">
        {payouts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <Wallet className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            {/* "No Payouts Yet" was shown even when a filter or search was simply
                excluding everything, which reads as "you have never been paid". */}
            {statusFilter !== 'all' || search ? (
              <>
                <h3 className="text-lg font-semibold text-slate-800">No matching payouts</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Nothing matches the current filter{search ? ' and search' : ''}. Clear them to
                  see your full history.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-slate-800">No Payouts Yet</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Payouts will appear here once processed
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map(payout => (
              <PayoutCard key={payout._id} payout={payout} onViewDetails={setSelectedPayout} />
            ))}
          </div>
        )}
      </AnimatePresence>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Details Modal */}
      {selectedPayout && (
        <PayoutDetailsModal payout={selectedPayout} onClose={() => setSelectedPayout(null)} />
      )}
    </div>
  )
}