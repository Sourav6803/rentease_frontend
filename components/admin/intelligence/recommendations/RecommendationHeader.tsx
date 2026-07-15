'use client'

import Link from 'next/link'
import { RefreshCw, Download, BookOpen, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RecommendationHeaderProps {
  onRefresh: () => void
  onExport: () => void
  onOpenDocs: () => void
  loading?: boolean
  lastUpdated?: string
  className?: string
}

export function RecommendationHeader({
  onRefresh,
  onExport,
  onOpenDocs,
  loading = false,
  lastUpdated,
  className,
}: RecommendationHeaderProps) {
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
        Export Preview
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={onOpenDocs}
      >
        <BookOpen className="h-3.5 w-3.5" />
        Recommendation Docs
      </Button>
      <Button
        size="sm"
        className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:brightness-105"
        asChild
      >
        <Link href="/admin/intelligence">
          <Sparkles className="h-3.5 w-3.5" />
          Intelligence Hub
        </Link>
      </Button>
    </div>
  )
}

export default RecommendationHeader
