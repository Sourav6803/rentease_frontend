'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadCsv, toCsv } from '@/lib/api/admin-intelligence'
import { analyticsApi } from '@/lib/api/analytics'
import { cn } from '@/lib/utils'

interface ExportButtonProps {
  filename?: string
  rows?: Record<string, unknown>[]
  columns?: string[]
  /** Fallback to GET /api/v1/analytics/export */
  useApiExport?: boolean
  apiParams?: Record<string, unknown>
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'icon'
}

export function ExportButton({
  filename = 'rentease-export.csv',
  rows = [],
  columns = [],
  useApiExport = false,
  apiParams,
  className,
  variant = 'outline',
  size = 'sm',
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      if (rows.length && columns.length) {
        downloadCsv(filename, toCsv(rows, columns))
        return
      }

      if (useApiExport) {
        const blob = await analyticsApi.exportAnalytics({
          ...(apiParams as { period?: '30d'; format?: 'csv' }),
          format: 'csv',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        return
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={loading || (!rows.length && !useApiExport)}
      className={cn('gap-1.5 text-xs font-semibold', className)}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
      Export CSV
    </Button>
  )
}

export default ExportButton
