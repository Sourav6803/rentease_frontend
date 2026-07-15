

'use client'

import { useState, useMemo } from 'react'
import { LayoutTemplate, Eye, Pencil, Send, Loader2, Check } from 'lucide-react'
import {
  EMAIL_TEMPLATE_LIBRARY, applyTemplateVariables,
  type EmailTemplateDef, type EmailTemplateCategory,
} from '@/lib/crm/email-templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const CATEGORY_LABEL: Record<EmailTemplateCategory, string> = {
  transactional: 'Transactional',
  marketing: 'Marketing',
  offer: 'Offer',
  reminder: 'Reminder',
  newsletter: 'Newsletter',
  automation: 'Automation',
}

const CATEGORY_COLOR: Record<EmailTemplateCategory, string> = {
  transactional: '#0891b2',
  marketing: '#7c3aed',
  offer: '#db2777',
  reminder: '#d97706',
  newsletter: '#2563eb',
  automation: '#059669',
}

const SAMPLE_VARS: Record<string, string> = {
  firstName: 'Rahul',
  lastName: 'Sharma',
  fullName: 'Rahul Sharma',
  city: 'Mumbai',
  ltv: '92,000',
  offerCode: 'RENTEASE20',
  expiryDate: '31 Dec 2025',
  rentalId: 'RNT10042',
  productName: 'Canon EOS R5',
  amount: '4,500',
  dueDate: '15 Jul 2025',
  segment: 'VIP',
}

export interface EmailComposerProps {
  recipientName?: string
  ltv?: string
  loading?: boolean
  submitLabel?: string
  onSubmit: (subject: string, body: string) => void
}

export function EmailComposer({ recipientName, ltv, loading, submitLabel = 'Send', onSubmit }: EmailComposerProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [mode, setMode] = useState<'design' | 'preview'>('design')
  const [vars, setVars] = useState<Record<string, string>>(() => ({
    ...SAMPLE_VARS,
    firstName: recipientName?.split(' ')[0] || SAMPLE_VARS.firstName,
    fullName: recipientName || SAMPLE_VARS.fullName,
    ltv: ltv || SAMPLE_VARS.ltv,
  }))

  const selected: EmailTemplateDef | undefined = useMemo(
    () => EMAIL_TEMPLATE_LIBRARY.find((t) => t.key === selectedKey),
    [selectedKey],
  )

  const loadTemplate = (t: EmailTemplateDef) => {
    setSelectedKey(t.key)
    setSubject(t.subject)
    setBody(t.htmlBody)
    setMode('design')
  }

  const previewHtml = useMemo(
    () => (mode === 'preview' ? applyTemplateVariables(body, vars) : ''),
    [mode, body, vars],
  )

  // Wrap the preview in a minimal, self-contained document so the template's
  // own markup/styles render exactly as an email client would show them,
  // without leaking into (or being clobbered by) the app's own CSS.
  const previewSrcDoc = useMemo(() => {
    if (!previewHtml) return ''
    return `<!DOCTYPE html><html><head><meta charset="utf-8" />
      <base target="_blank" />
      <style>
        html,body{margin:0;padding:16px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;color:#1e293b;}
        img{max-width:100%;height:auto;}
        table{max-width:100%;}
      </style>
      </head><body>${previewHtml}</body></html>`
  }, [previewHtml])

  const handleSubmit = () => {
    const finalSubject = applyTemplateVariables(subject, vars)
    const finalBody = applyTemplateVariables(body, vars)
    onSubmit(finalSubject, finalBody)
  }

  const canSubmit = subject.trim().length > 0 && body.trim().length > 0 && !loading

  return (
    // Fixed-height flex shell: header (template gallery) stays put,
    // the middle section scrolls, and the footer (Send button) is always visible.
    <div className="flex max-h-[75vh] min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pb-1 pt-1">
        {/* Template gallery */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <LayoutTemplate className="h-3.5 w-3.5" /> Template Library
          </div>
          <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
            {EMAIL_TEMPLATE_LIBRARY.map((t) => {
              const active = t.key === selectedKey
              const color = CATEGORY_COLOR[t.category]
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => loadTemplate(t)}
                  className="flex flex-col rounded-xl border p-3 text-left transition hover:shadow-sm"
                  style={{
                    borderColor: active ? color : '#e2e8f0',
                    background: active ? `${color}0d` : '#fff',
                  }}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold leading-snug text-slate-800">{t.name}</span>
                    {active && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color }} />}
                  </div>
                  <p className="mb-2 line-clamp-2 text-[11px] leading-snug text-slate-500">{t.description}</p>
                  <span
                    className="mt-auto w-fit rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: `${color}1a`, color }}
                  >
                    {CATEGORY_LABEL[t.category]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Variable inputs (only when a template with variables is chosen) */}
        {selected && selected.variables.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-500">Preview variables</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {selected.variables.map((v) => (
                <div key={v} className="space-y-1">
                  <Label className="text-[11px]">{`{{${v}}}`}</Label>
                  <Input
                    value={vars[v] ?? ''}
                    onChange={(e) => setVars((prev) => ({ ...prev, [v]: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subject */}
        <div className="space-y-1">
          <Label>Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" />
        </div>

        {/* Body: design / preview toggle */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label>Message</Label>
            <div className="flex gap-1 rounded-md bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setMode('design')}
                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition ${
                  mode === 'design' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button
                type="button"
                onClick={() => setMode('preview')}
                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition ${
                  mode === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Eye className="h-3 w-3" /> Preview
              </button>
            </div>
          </div>
          {mode === 'design' ? (
            <Textarea
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message… (HTML supported)"
              className="min-h-[220px] resize-y font-mono text-xs"
            />
          ) : body.trim() ? (
            <iframe
              title="Email preview"
              srcDoc={previewSrcDoc}
              sandbox=""
              className="h-[280px] w-full rounded-lg border border-slate-200 bg-white"
            />
          ) : (
            <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
              Nothing to preview yet
            </div>
          )}
        </div>
      </div>

      {/* Sticky footer — always visible, never pushed off-screen */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
        <p className="text-[11px] text-slate-400">
          {selected ? `Template: ${selected.name}` : 'No template selected — write from scratch'}
        </p>
        <Button className="gap-1.5 bg-indigo-600 hover:bg-indigo-700" disabled={!canSubmit} onClick={handleSubmit}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {submitLabel}
        </Button>
      </div>
    </div>
  )
}

export default EmailComposer