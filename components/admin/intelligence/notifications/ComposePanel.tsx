'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Eye, Clock, Paperclip, Sparkles } from 'lucide-react'
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { BroadcastPayload } from '@/types/admin-intelligence.types'

export const CHANNEL_OPTIONS = ['email', 'sms', 'push', 'in_app', 'whatsapp'] as const
export const TARGET_OPTIONS = ['all', 'users', 'vendors', 'partners', 'specific'] as const
export const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'] as const

export interface ComposePanelProps {
  value?: Partial<BroadcastPayload>
  onChange?: (value: Partial<BroadcastPayload>) => void
  onSend?: (payload: BroadcastPayload) => void
  onPreview?: (payload: BroadcastPayload) => void
  sending?: boolean
  className?: string
}

function titleCase(v: string) {
  return v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const DEFAULT_PAYLOAD: BroadcastPayload = {
  title: '',
  message: '',
  type: 'email',
  category: 'transactional',
  target: 'all',
  priority: 'medium',
}

export function ComposePanel({
  value,
  onChange,
  onSend,
  onPreview,
  sending = false,
  className,
}: ComposePanelProps) {
  const [draft, setDraft] = useState<BroadcastPayload>({ ...DEFAULT_PAYLOAD, ...value })
  const [schedule, setSchedule] = useState(false)

  const update = (patch: Partial<BroadcastPayload>) => {
    const next = { ...draft, ...patch }
    setDraft(next)
    onChange?.(next)
  }

  const canSend = draft.title.trim().length > 0 && draft.message.trim().length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}
    >
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-slate-100 p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10">
            <Sparkles className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">Compose broadcast</CardTitle>
            <CardDescription className="text-xs">Send to your audience across channels</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Channel</Label>
            <Select value={draft.type} onValueChange={(v) => update({ type: v as BroadcastPayload['type'] })}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {titleCase(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Audience</Label>
            <Select value={draft.target} onValueChange={(v) => update({ target: v as BroadcastPayload['target'] })}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TARGET_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {titleCase(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Title / Subject</Label>
          <Input
            value={draft.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="e.g. Your weekend rental deal is here"
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Message</Label>
          <Textarea
            value={draft.message}
            onChange={(e) => update({ message: e.target.value })}
            placeholder="Write your notification copy…"
            className="min-h-[110px] resize-none text-sm"
          />
          <p className="text-[11px] text-slate-400">{draft.message.length} characters</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Category</Label>
            <Select
              value={draft.category ?? 'transactional'}
              onValueChange={(v) => update({ category: v })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['transactional', 'marketing', 'reminders', 'promotional', 'security'].map((c) => (
                  <SelectItem key={c} value={c}>
                    {titleCase(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Priority</Label>
            <Select
              value={draft.priority ?? 'medium'}
              onValueChange={(v) => update({ priority: v as BroadcastPayload['priority'] })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {titleCase(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {draft.type === 'email' && (
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Paperclip className="h-3.5 w-3.5" />
              HTML body (optional)
            </Label>
            <Textarea
              value={draft.htmlBody ?? ''}
              onChange={(e) => update({ htmlBody: e.target.value })}
              placeholder="<h1>Rich HTML version…</h1>"
              className="min-h-[80px] resize-none font-mono text-xs"
            />
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-xs font-medium text-slate-700">Schedule for later</p>
              <p className="text-[11px] text-slate-400">Send now if disabled</p>
            </div>
          </div>
          <Switch checked={schedule} onCheckedChange={setSchedule} />
        </div>

        {schedule && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-1.5"
          >
            <Label className="text-xs font-medium text-slate-600">Send at</Label>
            <Input
              type="datetime-local"
              className="h-9"
              onChange={(e) => update({ scheduledFor: e.target.value })}
            />
          </motion.div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button
            className="flex-1 gap-1.5 bg-indigo-600 hover:bg-indigo-700"
            disabled={!canSend || sending}
            onClick={() => onSend?.(draft)}
          >
            <Send className="h-4 w-4" />
            {sending ? 'Sending…' : schedule ? 'Schedule' : 'Send now'}
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => onPreview?.(draft)}>
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </CardContent>
    </motion.div>
  )
}

export default ComposePanel
