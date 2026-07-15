'use client'

import { motion } from 'framer-motion'
import {
  Play,
  Pencil,
  Copy,
  Power,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  MARKETING_WORKFLOW_CATEGORIES,
  type Workflow,
  type WorkflowStats,
  type WorkflowExecution,
} from '@/types/admin-intelligence.types'
import { WorkflowFlow } from './WorkflowFlow'

interface WorkflowDrawerProps {
  workflow: Workflow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  stats?: WorkflowStats
  executions?: WorkflowExecution[]
  steps?: Parameters<typeof WorkflowFlow>[0]['steps']
  onToggle?: (workflow: Workflow, next: boolean) => void
  onRun?: (workflow: Workflow) => void
  onEdit?: (workflow: Workflow) => void
  onDuplicate?: (workflow: Workflow) => void
}

function categoryOf(workflow: Workflow) {
  const key = (workflow.metadata?.category as string) ?? 'transactional'
  return (
    MARKETING_WORKFLOW_CATEGORIES.find((c) => c.key === key) ??
    MARKETING_WORKFLOW_CATEGORIES[MARKETING_WORKFLOW_CATEGORIES.length - 1]
  )
}

const EXEC_STATUS: Record<
  WorkflowExecution['status'],
  { label: string; tone: string; icon: typeof CheckCircle2 }
> = {
  completed: { label: 'Completed', tone: '#059669', icon: CheckCircle2 },
  running: { label: 'Running', tone: '#2563eb', icon: Clock },
  pending: { label: 'Pending', tone: '#d97706', icon: Clock },
  failed: { label: 'Failed', tone: '#dc2626', icon: XCircle },
}

export function WorkflowDrawer({
  workflow,
  open,
  onOpenChange,
  stats,
  executions = [],
  steps,
  onToggle,
  onRun,
  onEdit,
  onDuplicate,
}: WorkflowDrawerProps) {
  if (!workflow) return null
  const cat = categoryOf(workflow)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="space-y-0 border-b border-slate-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-white/60"
                style={{ background: `linear-gradient(135deg, ${cat.color}1f, ${cat.color}0a)` }}
              >
                <Power className="h-5 w-5" style={{ color: cat.color }} />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-slate-900">
                  {workflow.name}
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  /{workflow.slug}
                </SheetDescription>
              </div>
            </div>
            <Switch
              checked={workflow.isEnabled}
              aria-label="Toggle workflow"
              onCheckedChange={(v) => onToggle?.(workflow, v)}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ background: `${cat.color}14`, color: cat.color, border: 0 }}
            >
              {cat.label}
            </Badge>
            <Badge variant="outline" className="rounded-full border-slate-200 text-slate-600">
              {String(workflow.trigger?.type ?? 'unknown').replace(/_/g, ' ')}
            </Badge>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                workflow.isEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
              )}
            >
              {workflow.isEnabled ? 'Live' : 'Paused'}
            </span>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-5">
            {stats && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat label="Total runs" value={stats.totalRuns} tone="#2563eb" />
                <MiniStat label="Completed" value={stats.completed} tone="#059669" />
                <MiniStat label="Failed" value={stats.failed} tone="#dc2626" />
                <MiniStat
                  label="Success"
                  value={`${Math.round(stats.successRate * 100)}%`}
                  tone="#7c3aed"
                />
              </div>
            )}

            <section>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Flow
              </h4>
              <WorkflowFlow
                triggerLabel={String(workflow.trigger?.type ?? 'Trigger')}
                triggerDetail="Workflow entry point"
                steps={steps}
              />
            </section>

            <Separator />

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Recent executions
                </h4>
                <span className="text-xs text-slate-400">{executions.length} shown</span>
              </div>
              {executions.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-400">
                  No executions recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {executions.map((ex) => {
                    const s = EXEC_STATUS[ex.status]
                    const Icon = s.icon
                    return (
                      <motion.div
                        key={ex._id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0" style={{ color: s.tone }} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {ex.workflowName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {new Date(ex.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: `${s.tone}12`, color: s.tone }}
                        >
                          {s.label}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 border-t border-slate-100 p-4">
          <Button className="flex-1 gap-1.5" onClick={() => onRun?.(workflow)}>
            <Play className="h-4 w-4" />
            Run now
          </Button>
          <Button variant="outline" size="icon" onClick={() => onEdit?.(workflow)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onDuplicate?.(workflow)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a href={`/admin/intelligence/workflows/${workflow._id}`} className="flex items-center">
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone: string
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold" style={{ color: tone }}>
        {value}
      </p>
    </div>
  )
}

export default WorkflowDrawer
