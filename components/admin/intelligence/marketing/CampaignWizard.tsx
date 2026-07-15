'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Mail,
  CalendarClock,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Loader2,
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
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type {
  CampaignWizardData,
  CustomerSegment,
  EmailTemplate,
} from '@/types/admin-intelligence.types'

interface CampaignWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates?: EmailTemplate[]
  segments?: CustomerSegment[]
  creating?: boolean
  onCreate: (data: CampaignWizardData) => void
}

const STEPS = [
  { key: 'audience', label: 'Audience', icon: Users },
  { key: 'content', label: 'Content', icon: Mail },
  { key: 'schedule', label: 'Schedule', icon: CalendarClock },
  { key: 'review', label: 'Review', icon: ClipboardCheck },
] as const

const FREQ_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

function emptyData(): CampaignWizardData {
  return {
    name: '',
    description: '',
    audience: { type: 'all' },
    scheduleType: 'immediate',
    timezone:
      typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : 'Asia/Kolkata',
  }
}

export function CampaignWizard({
  open,
  onOpenChange,
  templates = [],
  segments = [],
  creating = false,
  onCreate,
}: CampaignWizardProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<CampaignWizardData>(emptyData)

  const set = <K extends keyof CampaignWizardData>(key: K, value: CampaignWizardData[K]) =>
    setData((d) => ({ ...d, [key]: value }))

  const setAudience = <K extends keyof CampaignWizardData['audience']>(
    key: K,
    value: CampaignWizardData['audience'][K],
  ) => setData((d) => ({ ...d, audience: { ...d.audience, [key]: value } }))

  const canAdvance = useMemo(() => {
    if (step === 0) return !!data.name.trim()
    if (step === 1) return !!(data.subject?.trim() || data.templateId)
    if (step === 2)
      return data.scheduleType !== 'scheduled' || !!data.scheduledAt
    return true
  }, [step, data])

  const reset = () => {
    setStep(0)
    setData(emptyData())
  }

  const handleClose = (next: boolean) => {
    onOpenChange(next)
    if (!next) setTimeout(reset, 250)
  }

  const handleCreate = () => onCreate(data)

  const selectedTemplate = templates.find((t) => t._id === data.templateId)

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="space-y-0 border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-slate-900">
                Create campaign
              </SheetTitle>
              <SheetDescription>
                Launch a targeted email campaign in four steps.
              </SheetDescription>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-4 flex items-center">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const active = i === step
              const done = i < step
              return (
                <div key={s.key} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-colors',
                        active && 'border-indigo-500 bg-indigo-500 text-white',
                        done && 'border-emerald-500 bg-emerald-500 text-white',
                        !active && !done && 'border-slate-200 bg-white text-slate-400',
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-medium',
                        active ? 'text-indigo-600' : 'text-slate-400',
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'mx-1 h-px flex-1 transition-colors',
                        done ? 'bg-emerald-400' : 'bg-slate-200',
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {step === 0 && (
                  <div className="space-y-4">
                    <Field label="Campaign name" required>
                      <Input
                        value={data.name}
                        onChange={(e) => set('name', e.target.value)}
                        placeholder="e.g. Monsoon rental revival"
                      />
                    </Field>
                    <Field label="Description">
                      <Textarea
                        value={data.description ?? ''}
                        onChange={(e) => set('description', e.target.value)}
                        placeholder="Internal note about this campaign"
                        className="min-h-[80px]"
                      />
                    </Field>
                    <Field label="Audience">
                      <Select
                        value={data.audience.type}
                        onValueChange={(v) =>
                          setAudience('type', v as CampaignWizardData['audience']['type'])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All customers</SelectItem>
                          <SelectItem value="selected">Manual list (CSV)</SelectItem>
                          <SelectItem value="segment">Existing segment</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    {data.audience.type === 'segment' && (
                      <Field label="Segment">
                        <Select
                          value={data.audience.segmentId ?? ''}
                          onValueChange={(v) => setAudience('segmentId', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a segment" />
                          </SelectTrigger>
                          <SelectContent>
                            {segments.map((seg) => (
                              <SelectItem key={seg._id} value={seg._id}>
                                {seg.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}

                    {data.audience.type === 'selected' && (
                      <Field label="Recipients (CSV)">
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40">
                          <Upload className="h-4 w-4" />
                          {data.audience.csvFile?.name ?? 'Upload CSV of user IDs'}
                          <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) =>
                              setAudience('csvFile', e.target.files?.[0])
                            }
                          />
                        </label>
                      </Field>
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <Field label="Use a template (optional)">
                      <Select
                        value={data.templateId ?? ''}
                        onValueChange={(v) => set('templateId', v || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Start from blank" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((t) => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    {selectedTemplate && (
                      <div className="rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2 text-xs text-slate-600">
                        Using <span className="font-semibold">{selectedTemplate.name}</span>
                        {' — '}
                        {selectedTemplate.subject}
                      </div>
                    )}
                    <Field label="Subject line" required>
                      <Input
                        value={data.subject ?? ''}
                        onChange={(e) => set('subject', e.target.value)}
                        placeholder="Your monsoon rental is waiting"
                      />
                    </Field>
                    <Field label="Email body (HTML)">
                      <Textarea
                        value={data.htmlBody ?? ''}
                        onChange={(e) => set('htmlBody', e.target.value)}
                        placeholder="<p>Hi there,</p>..."
                        className="min-h-[160px] font-mono text-xs"
                      />
                    </Field>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <Field label="Delivery">
                      <Select
                        value={data.scheduleType}
                        onValueChange={(v) =>
                          set('scheduleType', v as CampaignWizardData['scheduleType'])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Send immediately</SelectItem>
                          <SelectItem value="scheduled">Schedule for later</SelectItem>
                          <SelectItem value="recurring">Recurring</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    {data.scheduleType === 'scheduled' && (
                      <Field label="Send at" required>
                        <Input
                          type="datetime-local"
                          value={data.scheduledAt ?? ''}
                          onChange={(e) => set('scheduledAt', e.target.value)}
                        />
                      </Field>
                    )}

                    {data.scheduleType === 'recurring' && (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Frequency">
                          <Select
                            value={data.recurrence?.frequency ?? 'weekly'}
                            onValueChange={(v) =>
                              set('recurrence', {
                                frequency: v,
                                interval: data.recurrence?.interval ?? 1,
                                endDate: data.recurrence?.endDate,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FREQ_OPTIONS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                  {f.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Interval (every N)">
                          <Input
                            type="number"
                            min={1}
                            value={data.recurrence?.interval ?? 1}
                            onChange={(e) =>
                              set('recurrence', {
                                frequency: data.recurrence?.frequency ?? 'weekly',
                                interval: Number(e.target.value) || 1,
                                endDate: data.recurrence?.endDate,
                              })
                            }
                          />
                        </Field>
                      </div>
                    )}

                    <Field label="Timezone">
                      <Input
                        value={data.timezone}
                        onChange={(e) => set('timezone', e.target.value)}
                      />
                    </Field>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">Review &amp; launch</p>
                    <ReviewRow label="Name" value={data.name} />
                    <ReviewRow
                      label="Audience"
                      value={
                        data.audience.type === 'segment'
                          ? segments.find((s) => s._id === data.audience.segmentId)?.name ??
                            'Segment'
                          : data.audience.type === 'selected'
                            ? 'Manual CSV list'
                            : 'All customers'
                      }
                    />
                    <ReviewRow label="Subject" value={data.subject ?? '—'} />
                    <ReviewRow
                      label="Template"
                      value={selectedTemplate?.name ?? 'Custom / blank'}
                    />
                    <ReviewRow
                      label="Schedule"
                      value={
                        data.scheduleType === 'immediate'
                          ? 'Immediate'
                          : data.scheduleType === 'recurring'
                            ? `Recurring ${data.recurrence?.frequency}`
                            : data.scheduledAt
                              ? new Date(data.scheduledAt).toLocaleString()
                              : 'Scheduled'
                      }
                    />
                    <Separator />
                    <div className="flex items-start gap-2 rounded-xl bg-indigo-50/60 px-3 py-2.5 text-xs text-indigo-700">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Review the details above. You can go back to make changes before launching.
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 p-4">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? handleClose(false) : setStep((s) => s - 1))}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => canAdvance && setStep((s) => s + 1)}
              disabled={!canAdvance}
              className="gap-1 bg-indigo-600 hover:bg-indigo-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={creating || !canAdvance}
              className="gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Launch campaign
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-white px-3 py-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="max-w-[60%] truncate text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  )
}

export default CampaignWizard
