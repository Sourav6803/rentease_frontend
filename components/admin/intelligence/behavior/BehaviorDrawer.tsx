'use client'

import { format } from 'date-fns'
import {
  X,
  Clock,
  Monitor,
  MapPin,
  Globe,
  User,
  Fingerprint,
  ArrowRight,
  ArrowLeft,
  Route,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { JsonPayloadViewer } from './JsonPayloadViewer'
import type { BehaviorDrawerEvent } from '@/types/admin-intelligence.types'

interface BehaviorDrawerProps {
  event: BehaviorDrawerEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock
  label: string
  value?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-sm text-slate-800">{value ?? '—'}</p>
      </div>
    </div>
  )
}

function JourneyStep({ event, position }: { event: BehaviorDrawerEvent; position: 'prev' | 'next' }) {
  const Icon = position === 'prev' ? ArrowLeft : ArrowRight
  const tone = position === 'prev' ? 'text-slate-400' : 'text-indigo-500'
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2">
      <Icon className={`h-3.5 w-3.5 ${tone}`} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium capitalize text-slate-700">
          {event.eventType.replace(/_/g, ' ')}
        </p>
        <p className="text-[11px] text-slate-400">
          {format(new Date(event.timestamp), 'dd MMM yyyy HH:mm:ss')}
        </p>
      </div>
    </div>
  )
}

export function BehaviorDrawer({ event, open, onOpenChange }: BehaviorDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        {event && (
          <>
            <SheetHeader className="space-y-2 border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="rounded-full border-indigo-200 bg-indigo-50 text-[11px] font-bold uppercase text-indigo-700"
                >
                  {event.eventType.replace(/_/g, ' ')}
                </Badge>
                <SheetTitle className="sr-only">Event detail</SheetTitle>
                <SheetDescription className="sr-only">
                  Detailed view of a single storefront event
                </SheetDescription>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Event detail</h2>
                <p className="mt-0.5 font-mono text-xs text-slate-400">{event._id}</p>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="space-y-5 p-5">
                <div className="grid grid-cols-1 gap-4">
                  <Field icon={Clock} label="Timestamp" value={format(new Date(event.timestamp), 'dd MMM yyyy, HH:mm:ss')} />
                  <Field icon={User} label="User" value={event.userId ? event.userId : 'Guest (anonymous)'} />
                  <Field icon={Fingerprint} label="Session" value={event.sessionId} />
                  <Field icon={Monitor} label="Device" value={event.device} />
                  <Field icon={Globe} label="Browser" value={event.browser} />
                  <Field icon={MapPin} label="Location" value={event.location} />
                  <Field
                    icon={Globe}
                    label="Traffic source"
                    value={event.trafficSource ? `${event.trafficSource}${event.referrer ? ` · ${event.referrer}` : ''}` : undefined}
                  />
                  <Field icon={Route} label="Page" value={event.pageUrl} />
                </div>

                <Separator />

                {(event.previousEvent || event.nextEvent) && (
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Context
                    </p>
                    <div className="space-y-1.5">
                      {event.previousEvent && <JourneyStep event={event.previousEvent} position="prev" />}
                      {event.nextEvent && <JourneyStep event={event.nextEvent} position="next" />}
                    </div>
                  </div>
                )}

                {event.sessionJourney && event.sessionJourney.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Session journey ({event.sessionJourney.length})
                    </p>
                    <div className="space-y-1.5">
                      {event.sessionJourney.map((je) => (
                        <div
                          key={je._id}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                            je._id === event._id
                              ? 'border-indigo-200 bg-indigo-50/60'
                              : 'border-slate-100 bg-slate-50/70'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium capitalize text-slate-700">
                              {je.eventType.replace(/_/g, ' ')}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {format(new Date(je.timestamp), 'HH:mm:ss')}
                            </p>
                          </div>
                          {je._id === event._id && (
                            <Badge variant="outline" className="border-indigo-200 bg-white text-[10px] font-bold text-indigo-600">
                              Current
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Metadata payload
                  </p>
                  <JsonPayloadViewer value={event.metadata} />
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default BehaviorDrawer
