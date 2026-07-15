'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutTemplate, Save, Trash2, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { NotificationTemplate } from '@/types/admin-intelligence.types'

export const TEMPLATE_CHANNELS = ['email', 'sms', 'push', 'in_app', 'whatsapp'] as const
export const TEMPLATE_CATEGORIES = [
  'transactional',
  'marketing',
  'reminders',
  'promotional',
  'security',
  'lifecycle',
] as const

export interface TemplateEditorProps {
  template: NotificationTemplate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (template: NotificationTemplate) => void
  onDelete?: (template: NotificationTemplate) => void
  saving?: boolean
  className?: string
}

function channelLabel(ch: string) {
  return ch.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function TemplateEditor({
  template,
  open,
  onOpenChange,
  onSave,
  onDelete,
  saving = false,
  className,
}: TemplateEditorProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn('flex w-full flex-col gap-0 p-0 sm:max-w-xl', className)}>
        {template && (
          <EditorForm
            key={template._id}
            template={template}
            onSave={onSave}
            onDelete={onDelete}
            onOpenChange={onOpenChange}
            saving={saving}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

interface EditorFormProps {
  template: NotificationTemplate
  onSave?: (template: NotificationTemplate) => void
  onDelete?: (template: NotificationTemplate) => void
  onOpenChange: (open: boolean) => void
  saving: boolean
}

function EditorForm({ template, onSave, onDelete, onOpenChange, saving }: EditorFormProps) {
  const [name, setName] = useState(template.name)
  const [slug, setSlug] = useState(template.slug)
  const [subject, setSubject] = useState(template.subject)
  const [message, setMessage] = useState(template.message)
  const [htmlBody, setHtmlBody] = useState(template.htmlBody ?? '')
  const [category, setCategory] = useState(template.category)
  const [channels, setChannels] = useState<string[]>(template.channels)
  const [variables, setVariables] = useState(template.variables.join(', '))
  const [isActive, setIsActive] = useState(template.isActive)

  const toggleChannel = (ch: string) => {
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]))
  }

  const handleSave = () => {
    onSave?.({
      ...template,
      name,
      slug,
      subject,
      message,
      htmlBody,
      category,
      channels,
      variables: variables
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      isActive,
    })
  }

  const canSave = name.trim().length > 0 && subject.trim().length > 0 && channels.length > 0

  return (
    <>
      <SheetHeader className="space-y-0 border-b border-slate-100 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10">
              <LayoutTemplate className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-slate-900">Edit template</SheetTitle>
              <SheetDescription className="font-mono text-xs">/{template.slug}</SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Active</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
      </SheetHeader>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Template name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Weekend deal alert" className="h-9" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="weekend-deal" className="h-9 font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Category</Label>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                    category === cat
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Subject / Title</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your deal is live" className="h-9" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Message</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi {{name}}, your weekend deal is ready…"
            className="min-h-[90px] resize-none text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">HTML body (email)</Label>
          <Textarea
            value={htmlBody}
            onChange={(e) => setHtmlBody(e.target.value)}
            placeholder="<div>Rich HTML…</div>"
            className="min-h-[80px] resize-none font-mono text-xs"
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-600">Channels</Label>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_CHANNELS.map((ch) => {
              const active = channels.includes(ch)
              return (
                <button
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-[11px] font-medium transition-colors',
                    active
                      ? 'border-violet-300 bg-violet-50 text-violet-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
                  )}
                >
                  {channelLabel(ch)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Variables</Label>
          <Input
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            placeholder="name, product, discount"
            className="h-9"
          />
          <div className="flex flex-wrap gap-1 pt-1">
            {variables
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean)
              .map((v) => (
                <Badge key={v} variant="secondary" className="font-mono text-[10px]">
                  {`{{${v}}}`}
                </Badge>
              ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 border-t border-slate-100 p-4"
      >
        {onDelete && (
          <Button
            variant="outline"
            size="icon"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(template)}
            aria-label="Delete template"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" className="gap-1.5" onClick={() => onOpenChange(false)}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          className="ml-auto gap-1.5 bg-indigo-600 hover:bg-indigo-700"
          disabled={!canSave || saving}
          onClick={handleSave}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save template'}
        </Button>
      </motion.div>
    </>
  )
}

export default TemplateEditor
