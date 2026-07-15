'use client'

import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  description?: string
  loading?: boolean
  empty?: boolean
  emptyLabel?: string
  children: React.ReactNode
  className?: string
  height?: number
  actions?: React.ReactNode
}

export function ChartCard({
  title,
  description,
  loading = false,
  empty = false,
  emptyLabel = 'No data for this period',
  children,
  className,
  height = 260,
  actions,
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        {actions}
      </div>

      {loading ? (
        <Skeleton className="w-full rounded-lg" style={{ height }} />
      ) : empty ? (
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{ height }}
        >
          <BarChart3 className="mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-400">{emptyLabel}</p>
        </div>
      ) : (
        children
      )}
    </motion.div>
  )
}

export default ChartCard
