'use client'

import { motion } from 'framer-motion'
import {
  Workflow as WorkflowIcon,
  Power,
  Play,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  GitBranch,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  MARKETING_WORKFLOW_CATEGORIES,
  type Workflow,
  type WorkflowStats,
} from '@/types/admin-intelligence.types'

interface WorkflowCardProps {
  workflow: Workflow
  stats?: WorkflowStats
  index?: number
  onToggle?: (workflow: Workflow, next: boolean) => void
  onOpen?: (workflow: Workflow) => void
  onRun?: (workflow: Workflow) => void
  className?: string
}

function categoryOf(workflow: Workflow) {
  const key = (workflow.metadata?.category as string) ?? 'transactional'
  return (
    MARKETING_WORKFLOW_CATEGORIES.find((c) => c.key === key) ??
    MARKETING_WORKFLOW_CATEGORIES[MARKETING_WORKFLOW_CATEGORIES.length - 1]
  )
}

function formatTrigger(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function WorkflowCard({
  workflow,
  stats,
  index = 0,
  onToggle,
  onOpen,
  onRun,
  className,
}: WorkflowCardProps) {
  const cat = categoryOf(workflow)
  const successRate = stats ? Math.round(stats.successRate * 100) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-50 blur-2xl"
        style={{ background: `${cat.color}22` }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-white/60"
            style={{ background: `linear-gradient(135deg, ${cat.color}1f, ${cat.color}0a)` }}
          >
            <WorkflowIcon className="h-5 w-5" style={{ color: cat.color }} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {workflow.name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-slate-400">/{workflow.slug}</p>
          </div>
        </div>
        <Switch
          checked={workflow.isEnabled}
          aria-label={`Toggle ${workflow.name}`}
          onCheckedChange={(v) => onToggle?.(workflow, v)}
        />
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="rounded-full border-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ background: `${cat.color}14`, color: cat.color }}
        >
          {cat.label}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-medium text-slate-600"
        >
          {formatTrigger(String(workflow.trigger?.type ?? 'unknown'))}
        </Badge>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
            workflow.isEnabled
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500',
          )}
        >
          <Power className="h-3 w-3" />
          {workflow.isEnabled ? 'Live' : 'Paused'}
        </span>
      </div>

      {stats && (
        <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
          <Stat
            icon={GitBranch}
            label="Runs"
            value={stats.totalRuns}
            tone="#2563eb"
          />
          <Stat
            icon={CheckCircle2}
            label="Success"
            value={successRate !== null ? `${successRate}%` : '—'}
            tone="#059669"
          />
          <Stat
            icon={XCircle}
            label="Failed"
            value={stats.failed}
            tone="#dc2626"
          />
        </div>
      )}

      <div className="relative mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        {stats?.avgCompletionTimeMs ? (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {Math.max(1, Math.round(stats.avgCompletionTimeMs / 1000))}s avg
          </span>
        ) : (
          <span />
        )}
        {onRun && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-emerald-600 opacity-0 transition-opacity hover:text-emerald-700 group-hover:opacity-100"
            onClick={() => onRun(workflow)}
          >
            <Play className="h-3.5 w-3.5" />
            Run
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onOpen?.(workflow)}
        >
          Open
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof GitBranch
  label: string
  value: string | number
  tone: string
}) {
  return (
    <div className="flex flex-col">
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
        <Icon className="h-3 w-3" style={{ color: tone }} />
        {label}
      </span>
      <span className="mt-0.5 text-sm font-bold text-slate-900">{value}</span>
    </div>
  )
}

export default WorkflowCard
