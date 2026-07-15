'use client'

import { useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { EmptyState } from './EmptyState'

export interface DataTableColumn<T> {
  key: string
  header: string
  sortable?: boolean
  className?: string
  render?: (row: T) => React.ReactNode
  accessor?: (row: T) => string | number | null | undefined
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
  emptyTitle?: string
  emptyDescription?: string
  getRowKey?: (row: T, index: number) => string
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search…',
  pageSize = 10,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting filters or date range.',
  getRowKey,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let rows = [...data]
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter((row) =>
        columns.some((col) => {
          const val = col.accessor ? col.accessor(row) : row[col.key]
          return String(val ?? '').toLowerCase().includes(q)
        }),
      )
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey)
      rows.sort((a, b) => {
        const av = col?.accessor ? col.accessor(a) : a[sortKey]
        const bv = col?.accessor ? col.accessor(b) : b[sortKey]
        const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [data, search, sortKey, sortDir, columns])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  if (!loading && !filtered.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    )
  }

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>
      {searchable && (
        <div className="border-b border-slate-100 p-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder={searchPlaceholder}
              className="h-9 pl-8 text-sm"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wide text-slate-400',
                    col.sortable && 'cursor-pointer select-none',
                    col.className,
                  )}
                  onClick={() => toggleSort(col.key, col.sortable)}
                >
                  {col.header}
                  {sortKey === col.key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={columns.length}>
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    </TableCell>
                  </TableRow>
                ))
              : pageRows.map((row, i) => (
                  <TableRow key={getRowKey?.(row, i) ?? String(i)} className="hover:bg-slate-50/60">
                    {columns.map((col) => (
                      <TableCell key={col.key} className={cn('text-sm text-slate-700', col.className)}>
                        {col.render
                          ? col.render(row)
                          : String(col.accessor ? col.accessor(row) ?? '—' : row[col.key] ?? '—')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages} · {filtered.length} rows
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
