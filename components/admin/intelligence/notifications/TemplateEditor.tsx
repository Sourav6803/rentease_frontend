'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
  LayoutTemplate,
  Save,
  Trash2,
  X,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react'
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

const UPLOAD_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const THEME_PRESETS: { label: string; from: string; to: string }[] = [
  { label: 'Diwali', from: '#f59e0b', to: '#b45309' },
  { label: 'Holi', from: '#ec4899', to: '#8b5cf6' },
  { label: 'Christmas', from: '#dc2626', to: '#047857' },
  { label: 'India', from: '#ff9933', to: '#138808' },
  { label: 'Royal', from: '#7c3aed', to: '#4c1d95' },
  { label: 'Ocean', from: '#2563eb', to: '#1e3a8a' },
  { label: 'Teal', from: '#0d9488', to: '#134e4a' },
  { label: 'Rose', from: '#e11d48', to: '#881337' },
]

const TEMPLATE_TYPES = ['promotion', 'welcome', 'cart', 'booking', 'delivery', 'reminder', 'alert'] as const

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
  const [imageUrl, setImageUrl] = useState(template.imageUrl ?? '')
  const [theme, setTheme] = useState(template.theme)
  const [templateType, setTemplateType] = useState(template.templateType ?? 'promotion')
  const [uploading, setUploading] = useState(false)
  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken

  const toggleChannel = (ch: string) => {
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'].includes(file.type)) {
      return
    }
    if (file.size > 5 * 1024 * 1024) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', 'notifications')
      const response = await axios.post(
        `${UPLOAD_BASE_URL}/api/v1/categories/upload/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      const url = response.data?.data?.url
      if (url) setImageUrl(url as string)
    } finally {
      setUploading(false)
    }
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
      imageUrl: imageUrl || undefined,
      theme: theme ?? template.theme,
      templateType,
      withCart: templateType === 'cart',
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

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Sparkles className="h-3.5 w-3.5" />
            Template type
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_TYPES.map((tt) => (
              <button
                key={tt}
                onClick={() => setTemplateType(tt)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                  templateType === tt
                    ? 'border-violet-300 bg-violet-50 text-violet-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
                )}
              >
                {tt}
              </button>
            ))}
          </div>
          {templateType === 'cart' && (
            <p className="text-[11px] text-amber-600">
              Cart template — each user's cart products (images + titles) auto-inject on send.
            </p>
          )}
          {templateType === 'welcome' && (
            <p className="text-[11px] text-blue-600">
              Welcome template — {'{{firstName}}'} / {'{{name}}'} resolve to each recipient's real name on
              send.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <ImageIcon className="h-3.5 w-3.5" />
            Banner image
          </Label>
          {imageUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Banner" className="h-28 w-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                aria-label="Remove banner image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs font-medium text-slate-500 transition hover:border-violet-400 hover:text-violet-600">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              {uploading ? 'Uploading…' : 'Upload festive banner'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Festive theme</Label>
          <div className="flex flex-wrap gap-1.5">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setTheme({ from: preset.from, to: preset.to, badge: '#ffffff' })}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                  theme?.from === preset.from
                    ? 'border-slate-400 bg-slate-50 text-slate-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
                )}
                aria-label={`Theme ${preset.label}`}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                />
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => setTheme(undefined)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                !theme ? 'border-slate-400 bg-slate-50 text-slate-700' : 'border-slate-200 bg-white text-slate-500',
              )}
            >
              None
            </button>
          </div>
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
