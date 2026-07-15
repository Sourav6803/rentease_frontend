'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, Code2, LayoutTemplate, Wand2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { EmailTemplate } from '@/types/admin-intelligence.types'

interface EmailEditorProps {
  subject: string
  htmlBody: string
  templates?: EmailTemplate[]
  onChange: (next: { subject?: string; htmlBody?: string }) => void
  onSelectTemplate?: (template: EmailTemplate) => void
  className?: string
}

const SAMPLE_BODY = `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fff;border-radius:16px">
  <h1 style="font-size:20px;color:#1e293b;margin:0 0 12px">Hi there,</h1>
  <p style="color:#475569;line-height:1.6;margin:0 0 16px">Your rental journey just got better. Explore curated picks picked for you.</p>
  <a href="#" style="display:inline-block;background:#6366f1;color:#fff;padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:600">Shop now</a>
</div>`

export function EmailEditor({
  subject,
  htmlBody,
  templates = [],
  onChange,
  onSelectTemplate,
  className,
}: EmailEditorProps) {
  const [mode, setMode] = useState<'preview' | 'code'>('preview')

  const previewHtml = useMemo(() => {
    if (htmlBody.trim()) return htmlBody
    return `<div style="padding:40px;text-align:center;color:#94a3b8;font-family:Inter,Arial,sans-serif">Start typing your email body to see a live preview.</div>`
  }, [htmlBody])

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 lg:grid-cols-2',
        className,
      )}
    >
      {/* Editor pane */}
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 p-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Wand2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-slate-800">Compose</span>
          </div>
          {templates.length > 0 && (
            <Select
              value=""
              onValueChange={(v) => {
                const t = templates.find((x) => x._id === v)
                if (t) onSelectTemplate?.(t)
              }}
            >
              <SelectTrigger className="h-8 w-auto gap-1.5 px-2.5 text-xs">
                <LayoutTemplate className="h-3.5 w-3.5" />
                <SelectValue placeholder="Insert template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Subject line</Label>
            <Input
              value={subject}
              onChange={(e) => onChange({ subject: e.target.value })}
              placeholder="Your subject line"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-slate-600">Email body (HTML)</Label>
              <button
                onClick={() => setMode((m) => (m === 'preview' ? 'code' : 'preview'))}
                className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700"
              >
                {mode === 'preview' ? (
                  <>
                    <Code2 className="h-3.5 w-3.5" /> Code
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </>
                )}
              </button>
            </div>
            <Textarea
              value={htmlBody}
              onChange={(e) => onChange({ htmlBody: e.target.value })}
              placeholder={SAMPLE_BODY}
              className="min-h-[320px] font-mono text-xs leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Preview pane */}
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Eye className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-slate-800">Preview</span>
          </div>
          <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500">
            {subject || 'No subject'}
          </Badge>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {mode === 'preview' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div
                className="overflow-hidden rounded-xl"
                // Preview is admin-authored HTML; rendered in an isolated container.
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </motion.div>
          ) : (
            <pre className="overflow-auto rounded-xl border border-slate-200 bg-slate-900 p-4 text-xs leading-relaxed text-slate-200">
              {htmlBody || '// HTML source will appear here'}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmailEditor
