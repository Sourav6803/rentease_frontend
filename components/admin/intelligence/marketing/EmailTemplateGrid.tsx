'use client'

import { motion } from 'framer-motion'
import {
  Mail,
  Send,
  Pencil,
  Copy,
  Trash2,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EmailTemplateExtended } from '@/types/admin-intelligence.types'
import { MarketingEmptyState } from './MarketingEmptyState'

interface EmailTemplateGridProps {
  templates: EmailTemplateExtended[]
  loading?: boolean
  onUse?: (template: EmailTemplateExtended) => void
  onEdit?: (template: EmailTemplateExtended) => void
  onDuplicate?: (template: EmailTemplateExtended) => void
  onDelete?: (template: EmailTemplateExtended) => void
  onPreview?: (template: EmailTemplateExtended) => void
  onCreate?: () => void
  className?: string
}

function categoryTone(category?: string): { bg: string; text: string; border: string } {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    onboarding: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    lifecycle: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    retention: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    conversion: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    reengagement: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    promotional: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    transactional: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
    festival: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  }
  return map[(category ?? 'transactional').toLowerCase()] ?? map.transactional
}

export function EmailTemplateGrid({
  templates,
  loading = false,
  onUse,
  onEdit,
  onDuplicate,
  onDelete,
  onPreview,
  onCreate,
  className,
}: EmailTemplateGridProps) {
  if (!loading && templates.length === 0) {
    return (
      <MarketingEmptyState
        variant="templates"
        actionLabel="New template"
        onAction={onCreate}
        className={className}
      />
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
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
                <div className="relative h-28 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                  {template.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Mail className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/70 to-transparent" />
                  <Badge
                    variant="outline"
                    className={cn('absolute left-3 top-3 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', tone.bg, tone.text, tone.border)}
                  >
                    {template.category ?? 'general'}
                  </Badge>
                  {template.isActive === false && (
                    <Badge
                      variant="outline"
                      className="absolute right-3 top-3 rounded-full border-slate-200 bg-white/90 px-2 py-0.5 text-[10px] font-medium text-slate-500"
                    >
                      Inactive
                    </Badge>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="truncate text-sm font-semibold text-slate-900">
                    {template.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-slate-400">{template.subject}</p>

                  {template.stats && (
                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2 text-center">
                      <Stat label="Used" value={template.stats.usageCount} />
                      <Stat label="Open" value={`${Math.round(template.stats.avgOpenRate * 100)}%`} />
                      <Stat label="Click" value={`${Math.round(template.stats.avgClickRate * 100)}%`} />
                    </div>
                  )}

                  <div className="mt-auto flex items-center gap-1.5 pt-4">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 bg-violet-600 hover:bg-violet-700"
                      onClick={() => onUse?.(template)}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Use
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => onPreview?.(template)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => onEdit?.(template)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => onDuplicate?.(template)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onDelete?.(template)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-800">{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  )
}

export default EmailTemplateGrid
