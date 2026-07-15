'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Workflow, Zap, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAutomationWorkflows } from './interests.utils'
import { cn } from '@/lib/utils'

interface AutomationPanelProps {
  className?: string
}

export function AutomationPanel({ className }: AutomationPanelProps) {
  const [workflows, setWorkflows] = useState(() => getAutomationWorkflows())

  const toggle = (id: string) =>
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)),
    )

  const enabledCount = workflows.filter((w) => w.enabled).length

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <Workflow className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Interest → Automation</h3>
            <p className="text-xs text-slate-500">
              Whenever the <code className="rounded bg-slate-100 px-1 text-[10px]">interest_detected</code>{' '}
              event fires, workflows trigger automatically.
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700"
        >
          {enabledCount} active
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {workflows.map((w, i) => {
          const Icon = w.icon
          return (
            <motion.button
              key={w.id}
              type="button"
              onClick={() => toggle(w.id)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition',
                w.enabled
                  ? 'border-indigo-200 bg-indigo-50/60'
                  : 'border-slate-200 bg-white hover:border-slate-300',
              )}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: `${w.color}18` }}
              >
                <Icon className="h-4 w-4" style={{ color: w.color }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700">{w.label}</p>
                <p className="truncate text-[10px] text-slate-400">{w.description}</p>
              </div>
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  w.enabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400',
                )}
              >
                {w.enabled ? <Check className="h-3 w-3" /> : null}
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 p-3.5 text-white">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" />
          <p className="text-xs font-medium">
            {enabledCount} automation{enabledCount === 1 ? '' : 's'} running on interest detection
          </p>
        </div>
        <Button
          size="sm"
          className="h-7 gap-1 bg-white text-slate-900 hover:bg-slate-100"
          asChild
        >
          <Link href="/admin/intelligence/marketing">
            Open Workflows
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default AutomationPanel
