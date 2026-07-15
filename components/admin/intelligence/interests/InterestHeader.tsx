'use client'

import Link from 'next/link'
import { RefreshCw, Download, Megaphone, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface InterestHeaderProps {
  onRefresh: () => void
  onExport: () => void
  onOpenRules: () => void
  loading?: boolean
  lastUpdated?: string
  className?: string
}

export function InterestHeader({
  onRefresh,
  onExport,
  onOpenRules,
  loading = false,
  lastUpdated,
  className,
}: InterestHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {lastUpdated && (
        <span className="mr-1 hidden items-center gap-1.5 text-[11px] text-slate-400 lg:inline-flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live · {lastUpdated}
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
        Refresh
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={onExport}>
        <Download className="h-3.5 w-3.5" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" asChild>
        <Link href="/admin/intelligence/marketing">
          <Megaphone className="h-3.5 w-3.5" />
          Open Marketing Automation
        </Link>
      </Button>
      <Button
        size="sm"
        className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:brightness-105"
        onClick={onOpenRules}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Interest Rules
      </Button>
    </div>
  )
}

export default InterestHeader
