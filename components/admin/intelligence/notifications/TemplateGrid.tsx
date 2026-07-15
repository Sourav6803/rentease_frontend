'use client'

import { motion } from 'framer-motion'
import {
  LayoutTemplate,
  Pencil,
  Copy,
  Trash2,
  Eye,
  Power,
  Send,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { NotificationTemplate } from '@/types/admin-intelligence.types'
import { NotificationEmptyState } from './NotificationEmptyState'

export interface TemplateGridProps {
  templates: NotificationTemplate[]
  loading?: boolean
  onUse?: (template: NotificationTemplate) => void
  onEdit?: (template: NotificationTemplate) => void
  onDuplicate?: (template: NotificationTemplate) => void
  onDelete?: (template: NotificationTemplate) => void
  onToggle?: (template: NotificationTemplate, next: boolean) => void
  onPreview?: (template: NotificationTemplate) => void
  onCreate?: () => void
  className?: string
}

const CATEGORY_TONE: Record<string, { bg: string; text: string; border: string }> = {
  transactional: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  marketing: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  reminders: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  promotional: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  security: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  lifecycle: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
}

function categoryTone(category?: string) {
  return CATEGORY_TONE[(category ?? 'transactional').toLowerCase()] ?? CATEGORY_TONE.transactional
}

function channelLabel(ch: string) {
  return ch.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function TemplateGrid({
  templates,
  loading = false,
  onUse,
  onEdit,
  onDuplicate,
  onDelete,
  onToggle,
  onPreview,
  onCreate,
  className,
}: TemplateGridProps) {
  if (!loading && templates.length === 0) {
    return <NotificationEmptyState variant="no-templates" onAction={onCreate} className={className} />
  }

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))
        : templates.map((template, i) => {
            const tone = categoryTone(template.category)
            return (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                whileHover={{ y: -3 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-24 overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-blue-50">
                  <div className="flex h-full w-full items-center justify-center">
                    <LayoutTemplate className="h-8 w-8 text-indigo-300" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/70 to-transparent" />
                  <Badge
                    variant="outline"
                    className={cn('absolute left-3 top-3 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', tone.bg, tone.text, tone.border)}
                  >
                    {template.category}
                  </Badge>
                  <button
                    onClick={() => onToggle?.(template, !template.isActive)}
                    className={cn(
                      'absolute right-3 top-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      template.isActive
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-slate-500/80 text-white',
                    )}
                    aria-label="Toggle template"
                  >
                    <Power className="h-3 w-3" />
                    {template.isActive ? 'Active' : 'Off'}
                  </button>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="truncate text-sm font-semibold text-slate-900">{template.name}</h3>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{template.subject}</p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.channels.slice(0, 3).map((ch) => (
                      <span
                        key={ch}
                        className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
                      >
                        {channelLabel(ch)}
                      </span>
                    ))}
                    {template.channels.length > 3 && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                        +{template.channels.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2 text-center">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{template.usageCount}</p>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Uses</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{template.variables.length}</p>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Vars</p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center gap-1.5 pt-4">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => onUse?.(template)}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Use
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => onPreview?.(template)} aria-label="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => onEdit?.(template)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => onDuplicate?.(template)} aria-label="Duplicate">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onDelete?.(template)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-1 border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  Updated {new Date(template.updatedAt).toLocaleDateString()}
                </div>
              </motion.div>
            )
          })}
    </div>
  )
}

export default TemplateGrid
