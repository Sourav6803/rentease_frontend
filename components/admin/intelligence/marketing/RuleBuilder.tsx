'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, GitBranch, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { SegmentRule } from '@/types/admin-intelligence.types'

interface RuleBuilderProps {
  rules: SegmentRule[]
  onChange: (rules: SegmentRule[]) => void
  className?: string
}

const FIELDS: { value: string; label: string; type: 'text' | 'number' | 'date' }[] = [
  { value: 'totalSpent', label: 'Total spent', type: 'number' },
  { value: 'rentalCount', label: 'Rental count', type: 'number' },
  { value: 'avgOrderValue', label: 'Avg order value', type: 'number' },
  { value: 'lastActiveDays', label: 'Days since active', type: 'number' },
  { value: 'signupDate', label: 'Signup date', type: 'date' },
  { value: 'city', label: 'City', type: 'text' },
  { value: 'plan', label: 'Plan', type: 'text' },
  { value: 'tags', label: 'Tags', type: 'text' },
]

const OPERATORS: { value: string; label: string }[] = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'greater_than', label: 'greater than' },
  { value: 'less_than', label: 'less than' },
  { value: 'in_last_days', label: 'in last days' },
  { value: 'before', label: 'before' },
  { value: 'after', label: 'after' },
  { value: 'exists', label: 'exists' },
]

function fieldType(field: string): 'text' | 'number' | 'date' {
  return FIELDS.find((f) => f.value === field)?.type ?? 'text'
}

function newRule(): SegmentRule {
  return {
    id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    field: 'totalSpent',
    operator: 'greater_than',
    value: 0,
    logic: 'and',
  }
}

export function RuleBuilder({ rules, onChange, className }: RuleBuilderProps) {
  const update = (id: string, patch: Partial<SegmentRule>) =>
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  const remove = (id: string) => onChange(rules.filter((r) => r.id !== id))

  const add = () => {
    const next = newRule()
    if (rules.length > 0) next.logic = 'and'
    onChange([...rules, next])
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Filter className="h-3.5 w-3.5" />
        Rules
      </div>

      <AnimatePresence initial={false}>
        {rules.map((rule, idx) => {
          const type = fieldType(rule.field)
          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5"
            >
              {idx > 0 && (
                <button
                  onClick={() =>
                    update(rule.id, { logic: rule.logic === 'and' ? 'or' : 'and' })
                  }
                  className={cn(
                    'inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-bold uppercase transition-colors',
                    rule.logic === 'and'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700',
                  )}
                >
                  <GitBranch className="h-3 w-3" />
                  {rule.logic ?? 'and'}
                </button>
              )}

              <select
                value={rule.field}
                onChange={(e) => update(rule.id, { field: e.target.value })}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400"
              >
                {FIELDS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>

              <select
                value={rule.operator}
                onChange={(e) => update(rule.id, { operator: e.target.value })}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-indigo-400"
              >
                {OPERATORS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <Input
                type={type}
                value={String(rule.value)}
                onChange={(e) =>
                  update(rule.id, {
                    value: type === 'number' ? Number(e.target.value) : e.target.value,
                  })
                }
                placeholder="value"
                className="h-8 w-32 text-xs"
              />

              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto text-slate-400 hover:text-red-600"
                onClick={() => remove(rule.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {rules.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5 text-center text-sm text-slate-400">
          No rules yet. Add a condition to define this segment.
        </p>
      )}

      <Button variant="outline" size="sm" className="gap-1.5" onClick={add}>
        <Plus className="h-4 w-4" />
        Add rule
      </Button>
    </div>
  )
}

export default RuleBuilder
