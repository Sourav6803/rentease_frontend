'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MessageSquare, Smartphone, AppWindow, MessageCircle } from 'lucide-react'
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { BroadcastPayload } from '@/types/admin-intelligence.types'

export interface PreviewPanelProps {
  payload?: Partial<BroadcastPayload>
  className?: string
}

const CHANNELS: { key: BroadcastPayload['type']; label: string; icon: typeof Mail; color: string }[] = [
  { key: 'email', label: 'Email', icon: Mail, color: '#4f46e5' },
  { key: 'push', label: 'Push', icon: Smartphone, color: '#7c3aed' },
  { key: 'sms', label: 'SMS', icon: MessageSquare, color: '#059669' },
  { key: 'in_app', label: 'In-App', icon: AppWindow, color: '#2563eb' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#d97706' },
]

function timeLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function PreviewPanel({ payload, className }: PreviewPanelProps) {
  const [active, setActive] = useState<BroadcastPayload['type']>(payload?.type ?? 'email')
  const title = payload?.title?.trim() || 'Notification title'
  const message = payload?.message?.trim() || 'Your notification message will be previewed here as it appears to recipients.'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}
    >
      <CardHeader className="border-b border-slate-100 p-5">
        <CardTitle className="text-sm font-semibold text-slate-900">Live preview</CardTitle>
        <CardDescription className="text-xs">How recipients see your message</CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        <Tabs value={active} onValueChange={(v) => setActive(v as BroadcastPayload['type'])}>
          <TabsList className="mb-4 grid w-full grid-cols-5">
            {CHANNELS.map((c) => {
              const Icon = c.icon
              return (
                <TabsTrigger key={c.key} value={c.key} className="gap-1 text-[11px]">
                  <Icon className="h-3.5 w-3.5" style={{ color: c.color }} />
                  <span className="hidden sm:inline">{c.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {CHANNELS.map((c) => (
            <TabsContent key={c.key} value={c.key} className="mt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {c.key === 'email' && (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                        <div className="flex gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <span className="ml-2 text-[11px] text-slate-400">RentEase · {timeLabel()}</span>
                      </div>
                      <div className="bg-white p-5">
                        <p className="text-base font-bold text-slate-900">{title}</p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>
                        {payload?.htmlBody ? (
                          <div
                            className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500"
                            dangerouslySetInnerHTML={{ __html: payload.htmlBody }}
                          />
                        ) : null}
                        <button
                          className="mt-4 rounded-lg px-4 py-2 text-xs font-semibold text-white"
                          style={{ background: c.color }}
                        >
                          View in app
                        </button>
                      </div>
                    </div>
                  )}

                  {c.key === 'push' && (
                    <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4">
                      <div className="flex items-start gap-3 rounded-xl bg-white/10 p-3 backdrop-blur">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: c.color }}
                        >
                          <Smartphone className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">{title}</p>
                          <p className="mt-0.5 line-clamp-3 text-xs text-slate-300">{message}</p>
                          <p className="mt-1 text-[10px] text-slate-400">now · RentEase</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {c.key === 'sms' && (
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-500">
                        <MessageSquare className="h-3.5 w-3.5" style={{ color: c.color }} />
                        SMS · RentEase
                      </div>
                      <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white" style={{ background: c.color }}>
                        <p className="font-semibold">{title}</p>
                        <p className="mt-0.5 text-white/90">{message}</p>
                        <p className="mt-1 text-right text-[10px] text-white/60">{timeLabel()}</p>
                      </div>
                    </div>
                  )}

                  {c.key === 'in_app' && (
                    <div className="rounded-2xl bg-slate-50 p-6">
                      <motion.div
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="ml-auto flex max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: `${c.color}18`, color: c.color }}
                        >
                          <AppWindow className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">{title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{message}</p>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {c.key === 'whatsapp' && (
                    <div className="rounded-2xl bg-[#e9f3ec] p-4" style={{ background: '#e9f3ec' }}>
                      <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-500">
                        <MessageCircle className="h-3.5 w-3.5" style={{ color: c.color }} />
                        WhatsApp · RentEase
                      </div>
                      <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm">
                        <p className="font-semibold">{title}</p>
                        <p className="mt-0.5 text-slate-600">{message}</p>
                        <p className="mt-1 text-right text-[10px] text-slate-400">{timeLabel()} ✓✓</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </motion.div>
  )
}

export default PreviewPanel
