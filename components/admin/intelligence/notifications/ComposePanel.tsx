'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
  Send,
  Eye,
  Clock,
  Paperclip,
  Sparkles,
  Image as ImageIcon,
  Link2,
  Loader2,
  UploadCloud,
  X,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
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

const UPLOAD_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

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
  const [uploading, setUploading] = useState<'hero' | 'carousel' | null>(null)
  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken

  const update = (patch: Partial<BroadcastPayload>) => {
    const next = { ...draft, ...patch }
    setDraft(next)
    onChange?.(next)
  }

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
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
    if (!url) throw new Error('Upload failed')
    return url as string
  }

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    return file
  }

  const validateImage = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload JPG, PNG, WebP, GIF, or SVG.'
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'File too large. Maximum size is 5MB.'
    }
    return null
  }

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = pickImage(e)
    if (!file) return
    const error = validateImage(file)
    if (error) {
      toast.error(error)
      return
    }
    setUploading('hero')
    try {
      const url = await uploadImageToCloudinary(file)
      update({ imageUrl: url })
      toast.success('Hero image added')
    } catch (err) {
      toast.error('Image upload failed. Please try again.')
    } finally {
      setUploading(null)
    }
  }

  const handleCarouselUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = pickImage(e)
    if (!file) return
    const error = validateImage(file)
    if (error) {
      toast.error(error)
      return
    }
    setUploading('carousel')
    try {
      const url = await uploadImageToCloudinary(file)
      update({ images: [...(draft.images ?? []), url] })
      toast.success('Image added to carousel')
    } catch (err) {
      toast.error('Image upload failed. Please try again.')
    } finally {
      setUploading(null)
    }
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

        {draft.template?.slug && (
          <div className="space-y-1 rounded-xl border border-violet-200 bg-violet-50/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-700">
                <Sparkles className="h-3.5 w-3.5" />
                Dynamic template:
                <span className="font-mono">{draft.template.slug}</span>
              </p>
              <button
                type="button"
                onClick={() => update({ template: undefined })}
                className="shrink-0 text-[10px] font-medium text-violet-500 underline-offset-2 hover:underline"
              >
                Remove
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-violet-600">
              Personalized per recipient — {'{{firstName}}'}, {'{{name}}'}, {'{{cartCount}}'} &amp;{' '}
              {'{{cartItems}}'} auto-fill on send. Cart templates attach the user's product images.
            </p>
          </div>
        )}

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

        {(draft.type === 'push' || draft.type === 'in_app') && (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div>
              <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <ImageIcon className="h-3.5 w-3.5 text-violet-600" />
                Rich media
              </Label>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Hero image, carousel and tap-through link — Flipkart/Amazon style
              </p>
            </div>

            {/* Hero image */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Hero image</Label>
              {draft.imageUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draft.imageUrl} alt="Hero" className="h-36 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => update({ imageUrl: undefined })}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                    aria-label="Remove hero image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-6 text-center transition hover:border-violet-400 hover:bg-violet-50/40">
                  {uploading === 'hero' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                  ) : (
                    <UploadCloud className="h-5 w-5 text-slate-400" />
                  )}
                  <span className="text-xs font-medium text-slate-500">
                    {uploading === 'hero' ? 'Uploading…' : 'Click to upload hero image'}
                  </span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WebP · max 5MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
                </label>
              )}
            </div>

            {/* Carousel images */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Carousel images ({(draft.images ?? []).length})
              </Label>
              {(draft.images ?? []).length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {(draft.images ?? []).map((url, idx) => (
                    <div key={`${url}-${idx}`} className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Carousel ${idx + 1}`}
                        className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => update({ images: (draft.images ?? []).filter((_, i) => i !== idx) })}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                        aria-label={`Remove carousel image ${idx + 1}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-violet-400 hover:text-violet-600">
                {uploading === 'carousel' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                {uploading === 'carousel' ? 'Uploading…' : 'Add carousel image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleCarouselUpload} />
              </label>
            </div>

            {/* Deep link */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <Link2 className="h-3.5 w-3.5" />
                  Open on tap (deep link)
                </Label>
                <Input
                  value={draft.actionUrl ?? ''}
                  onChange={(e) => update({ actionUrl: e.target.value })}
                  placeholder="/products/electronics or https://…"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Button label</Label>
                <Input
                  value={draft.actionLabel ?? ''}
                  onChange={(e) => update({ actionLabel: e.target.value })}
                  placeholder="Shop now"
                  className="h-9"
                />
              </div>
            </div>
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
