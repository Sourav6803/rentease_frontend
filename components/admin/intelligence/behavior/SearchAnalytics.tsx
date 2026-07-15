'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search as SearchIcon, TrendingUp, TrendingDown, Ban } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { SearchAnalyticsItem } from '@/types/admin-intelligence.types'

interface SearchAnalyticsProps {
  data: SearchAnalyticsItem[]
  loading?: boolean
  className?: string
}

function pct(value: number): number {
  return Math.round(value * 100)
}

export function SearchAnalytics({ data, loading = false, className }: SearchAnalyticsProps) {
  const [sortKey, setSortKey] = useState<keyof SearchAnalyticsItem>('count')

  const rows = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') return bv - av
      return String(av).localeCompare(String(bv))
    })
    return sorted.slice(0, 12)
  }, [data, sortKey])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <SearchIcon className="h-4 w-4 text-blue-500" />
            Search analytics
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">Query volume, click-through and conversion</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wide text-slate-400"
                onClick={() => setSortKey('query')}
              >
                Query
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right text-xs font-semibold uppercase tracking-wide text-slate-400"
                onClick={() => setSortKey('count')}
              >
                Searches
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right text-xs font-semibold uppercase tracking-wide text-slate-400"
                onClick={() => setSortKey('ctr')}
              >
                CTR
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right text-xs font-semibold uppercase tracking-wide text-slate-400"
                onClick={() => setSortKey('conversion')}
              >
                Conversion
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-4 w-full rounded" />
                    </TableCell>
                  </TableRow>
                ))
              : rows.map((row, i) => (
                  <motion.tr
                    key={row.query}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/70"
                  >
                    <TableCell className="max-w-[220px] truncate py-2.5 text-sm font-medium text-slate-800">
                      {row.query}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm font-semibold text-slate-700">
                      {row.count.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="ml-auto flex max-w-[120px] flex-col items-end gap-1">
                        <span className="text-xs font-semibold text-slate-700">{pct(row.ctr)}%</span>
                        <Progress value={pct(row.ctr)} className="h-1.5 w-full" />
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        {row.conversion >= 0.1 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-slate-400" />
                        )}
                        {pct(row.conversion)}%
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      {row.noResults ? (
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-[10px] font-bold uppercase text-red-600">
                          <Ban className="mr-1 h-3 w-3" />
                          No results
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] font-bold uppercase text-emerald-600">
                          Matched
                        </Badge>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
          </TableBody>
        </Table>
      </div>

      {!loading && rows.length === 0 && (
        <div className="py-10 text-center text-sm text-slate-400">No search queries tracked yet.</div>
      )}
    </motion.div>
  )
}

export default SearchAnalytics
