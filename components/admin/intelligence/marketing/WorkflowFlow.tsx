'use client'

import { Fragment } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Zap,
  GitBranch,
  Mail,
  MessageSquare,
  UserPlus,
  Tag,
  Timer,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WorkflowStep {
  id: string
  label: string
  detail?: string
  icon?: LucideIcon
  status?: 'completed' | 'running' | 'pending' | 'failed'
}

interface WorkflowFlowProps {
  triggerLabel: string
  triggerDetail?: string
  steps?: WorkflowStep[]
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

const STEP_ICONS: LucideIcon[] = [Mail, MessageSquare, UserPlus, Tag, Timer]

function statusTone(status?: WorkflowStep['status']): string {
  switch (status) {
    case 'completed':
      return '#059669'
    case 'running':
      return '#2563eb'
    case 'failed':
      return '#dc2626'
    default:
      return '#64748b'
  }
}

export function WorkflowFlow({
  triggerLabel,
  triggerDetail,
  steps = [],
  orientation = 'vertical',
  className,
}: WorkflowFlowProps) {
  const isHorizontal = orientation === 'horizontal'

  const nodes: Array<{ id: string; label: string; detail?: string; icon: LucideIcon; kind: 'trigger' | 'step'; status?: WorkflowStep['status'] }> = [
    { id: 'trigger', label: triggerLabel, detail: triggerDetail, icon: Zap, kind: 'trigger', status: 'completed' },
    ...steps.map((s, i) => ({
      id: s.id,
      label: s.label,
      detail: s.detail,
      icon: s.icon ?? STEP_ICONS[i % STEP_ICONS.length],
      kind: 'step' as const,
      status: s.status,
    })),
  ]

  if (isHorizontal) {
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        {nodes.map((node, i) => {
          const tone = node.kind === 'trigger' ? '#7c3aed' : statusTone(node.status)
          const Icon = node.icon
          return (
            <Fragment key={node.id}>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${tone}16` }}
                >
                  <Icon className="h-4 w-4" style={{ color: tone }} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">{node.label}</p>
                  {node.detail && (
                    <p className="truncate text-[10px] text-slate-400">{node.detail}</p>
                  )}
                </div>
              </div>
              {i < nodes.length - 1 && (
                <GitBranch className="h-4 w-4 shrink-0 text-slate-300" />
              )}
            </Fragment>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {nodes.map((node, i) => {
        const isTrigger = node.kind === 'trigger'
        const tone = isTrigger ? '#7c3aed' : statusTone(node.status)
        const Icon = node.icon
        const isLast = i === nodes.length - 1
        return (
          <div key={node.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span className="absolute left-[15px] top-9 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-slate-200 to-slate-100" />
            )}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white"
              style={{ background: `${tone}16` }}
            >
              <Icon className="h-4 w-4" style={{ color: tone }} />
            </motion.div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-800">{node.label}</p>
                {isTrigger && (
                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                    Trigger
                  </span>
                )}
                {!isTrigger && node.status && (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-medium"
                    style={{ color: tone }}
                  >
                    {node.status === 'completed' ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                    {node.status}
                  </span>
                )}
              </div>
              {node.detail && (
                <p className="mt-0.5 text-xs text-slate-500">{node.detail}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default WorkflowFlow
