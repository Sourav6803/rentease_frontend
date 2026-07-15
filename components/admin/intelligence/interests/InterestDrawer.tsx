'use client'

import { useMemo } from 'react'
import {
  Mail,
  Smartphone,
  TicketPercent,
  KeyRound,
  BellRing,
  PackageCheck,
  TrendingDown,
  Megaphone,
  Workflow,
  UserRound,
  Package,
  Repeat,
  Sparkles,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { InterestGauge } from './InterestGauge'
import { SignalTimeline } from './SignalTimeline'
import { RecommendationPanel } from './RecommendationPanel'
import { TriggerHistory } from './TriggerHistory'
import {
  buildRecommendations,
  buildSignalTimeline,
  buildTriggerHistory,
  customerInitials,
  customerName,
  formatDuration,
  formatRelativeTime,
  getAutomationWorkflows,
  isMarketingTriggered,
  productName,
} from './interests.utils'
import type { InterestItem, RecommendationCard } from './interests.types'

export type DrawerAction = 'email' | 'push' | 'discount' | 'rental' | 'reminder' | 'stock' | 'price' | 'campaign' | 'automation' | 'customer'

interface InterestDrawerProps {
  item: InterestItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (action: DrawerAction, item: InterestItem) => void
  onApplyRecommendation: (card: RecommendationCard, item: InterestItem) => void
}

const MARKETING_ACTIONS: {
  key: DrawerAction
  label: string
  icon: React.ElementType
  color: string
}[] = [
  { key: 'email', label: 'Send Email', icon: Mail, color: '#6366f1' },
  { key: 'push', label: 'Send Push', icon: Smartphone, color: '#0ea5e9' },
  { key: 'discount', label: 'Generate Discount', icon: TicketPercent, color: '#10b981' },
  { key: 'rental', label: 'Rental Offer', icon: KeyRound, color: '#059669' },
  { key: 'reminder', label: 'Wishlist Reminder', icon: BellRing, color: '#ec4899' },
  { key: 'stock', label: 'Back In Stock', icon: PackageCheck, color: '#14b8a6' },
  { key: 'price', label: 'Price Drop Alert', icon: TrendingDown, color: '#f59e0b' },
  { key: 'campaign', label: 'Add To Campaign', icon: Megaphone, color: '#8b5cf6' },
  { key: 'automation', label: 'Create Automation', icon: Workflow, color: '#7c3aed' },
]

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-slate-400" />
      <h4 className="text-sm font-semibold text-slate-700">{children}</h4>
    </div>
  )
}

export function InterestDrawer({
  item,
  open,
  onOpenChange,
  onAction,
  onApplyRecommendation,
}: InterestDrawerProps) {
  const timeline = useMemo(() => (item ? buildSignalTimeline(item) : []), [item])
  const recommendations = useMemo(() => (item ? buildRecommendations(item) : []), [item])
  const triggers = useMemo(() => (item ? buildTriggerHistory(item) : []), [item])
  const workflows = useMemo(() => getAutomationWorkflows(), [])
  const enabledCount = workflows.filter((w) => w.enabled).length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-xl"
      >
        {item ? (
          <>
            <SheetHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50/40">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-sm font-bold text-white">
                  {customerInitials(item)}
                </div>
                <div>
                  <SheetTitle className="text-base">{customerName(item)}</SheetTitle>
                  <SheetDescription className="text-xs">
                    {item.user?.email ?? 'Guest session'} ·{' '}
                    {formatRelativeTime(item.lastViewedAt)}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="space-y-6 p-5">
                {/* Customer + Product summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <SectionTitle icon={UserRound}>Customer</SectionTitle>
                    <p className="text-sm font-semibold text-slate-800">{customerName(item)}</p>
                    <p className="text-xs text-slate-500">{item.user?.phone ?? 'No phone'}</p>
                    <p className="mt-2 text-[11px] text-slate-400">
                      Session {(item.sessionId ?? item._id).slice(-8)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <SectionTitle icon={Package}>Product</SectionTitle>
                    <p className="text-sm font-semibold text-slate-800">{productName(item)}</p>
                    <p className="text-xs text-slate-500">
                      {item.product?.category?.name ?? 'Uncategorized'}
                    </p>
                    {item.product?.pricing?.monthlyRent != null && (
                      <p className="mt-2 text-[11px] font-semibold text-indigo-600">
                        ₹{item.product.pricing.monthlyRent.toLocaleString('en-IN')}/mo
                      </p>
                    )}
                  </div>
                </div>

                {/* Gauge */}
                <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white py-4">
                  <InterestGauge score={item.interactionScore} size={190} />
                </div>

                {/* Signal timeline */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <SectionTitle icon={Sparkles}>Signal Timeline</SectionTitle>
                  <SignalTimeline entries={timeline} />
                </div>

                {/* Interaction history */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <SectionTitle icon={Repeat}>Interaction History</SectionTitle>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <Stat label="Views" value={String(item.viewCount ?? 0)} />
                    <Stat label="Time Spent" value={formatDuration(item.totalTimeSpentSeconds ?? 0)} />
                    <Stat label="Signals" value={String((item.signals ?? []).length)} />
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Max Scroll Depth</span>
                    <span className="font-semibold text-slate-700">
                      {item.maxScrollDepth ?? 0}%
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Interest Status</span>
                    <Badge
                      variant="outline"
                      className={
                        item.isInterested
                          ? 'border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500'
                      }
                    >
                      {item.isInterested ? 'Interested' : 'Monitoring'}
                    </Badge>
                  </div>
                </div>

                {/* Marketing actions */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <SectionTitle icon={Megaphone}>Marketing Actions</SectionTitle>
                    <Badge
                      variant="outline"
                      className={
                        isMarketingTriggered(item)
                          ? 'border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500'
                      }
                    >
                      {isMarketingTriggered(item) ? 'Automation Active' : 'No Automation'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {MARKETING_ACTIONS.map((action) => {
                      const Icon = action.icon
                      return (
                        <Button
                          key={action.key}
                          variant="outline"
                          size="sm"
                          className="h-auto flex-col gap-1 py-2.5 text-[11px] font-medium"
                          onClick={() => onAction(action.key, item)}
                        >
                          <Icon className="h-4 w-4" style={{ color: action.color }} />
                          {action.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Trigger history */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <SectionTitle icon={BellRing}>Trigger History</SectionTitle>
                  <TriggerHistory events={triggers} />
                </div>

                {/* Recommendations */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <SectionTitle icon={Sparkles}>Recommendation Engine</SectionTitle>
                  <RecommendationPanel
                    recommendations={recommendations}
                    onApply={(card) => onApplyRecommendation(card, item)}
                  />
                </div>

                {/* Automation status footer */}
                <div className="flex items-center justify-between rounded-xl bg-slate-900 p-3.5 text-white">
                  <div>
                    <p className="text-xs font-semibold">Marketing Automation</p>
                    <p className="text-[11px] text-slate-300">
                      {enabledCount}/{workflows.length} workflows enabled
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 gap-1 bg-white text-slate-900 hover:bg-slate-100"
                    onClick={() => onAction('automation', item)}
                  >
                    <Workflow className="h-3.5 w-3.5" />
                    Manage
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <p className="text-base font-bold text-slate-800 tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  )
}

export default InterestDrawer
