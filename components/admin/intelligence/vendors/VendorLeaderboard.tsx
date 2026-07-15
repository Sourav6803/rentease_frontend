'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpDown, ArrowUp, ArrowDown, Store } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatCompactINR } from '@/lib/api/admin-intelligence'
import type { VendorOverviewItem } from '@/types/admin-intelligence.types'
import { aggregateStatuses, ratingColor, initials } from './vendor.utils'

type SortKey = 'revenue' | 'rentals' | 'rating' | 'growth' | 'fulfillment'

interface VendorLeaderboardProps {
  items: VendorOverviewItem[]
  loading?: boolean
  search?: string
  onSelect: (vendorId: string) => void
}

const COLUMNS: Array<{ key: SortKey; label: string; align?: 'right' }> = [
  { key: 'revenue', label: 'Revenue', align: 'right' },
  { key: 'rentals', label: 'Rentals', align: 'right' },
  { key: 'rating', label: 'Rating', align: 'right' },
  { key: 'fulfillment', label: 'Fulfillment', align: 'right' },
  { key: 'growth', label: 'Growth', align: 'right' },
]

export function VendorLeaderboard({
  items,
  loading = false,
  search = '',
  onSelect,
}: VendorLeaderboardProps) {
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q
      ? items.filter((i) => (i.businessName ?? '').toLowerCase().includes(q))
      : items

    const value = (i: VendorOverviewItem): number => {
      switch (sortKey) {
        case 'revenue':
          return i.kpi.revenue.current
        case 'rentals':
          return i.kpi.rentals.current
        case 'rating':
          return i.kpi.averageRating
        case 'growth':
          return i.kpi.revenue.growth
        case 'fulfillment':
          return aggregateStatuses([i]).fulfillmentRate
      }
    }

    return [...filtered]
      .map((i, idx) => ({ item: i, rank: idx + 1 }))
      .sort((a, b) => (dir === 'desc' ? value(b.item) - value(a.item) : value(a.item) - value(b.item)))
  }, [items, search, sortKey, dir])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else {
      setSortKey(key)
      setDir('desc')
    }
  }

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-40" />
              <div className="ml-auto flex gap-8">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <Store className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-900">Marketplace Leaderboard</h3>
        <span className="ml-auto text-xs text-slate-400">{rows.length} vendors</span>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-16 text-center text-sm text-slate-400">
          No vendors match the current search.
        </p>
      ) : (
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-12 px-5 py-3">#</th>
                <th className="px-3 py-3">Vendor</th>
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    className={cn('px-3 py-3', c.align === 'right' && 'text-right')}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      {c.label}
                      {sortKey === c.key ? (
                        dir === 'desc' ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUp className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  </th>
                ))}
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ item, rank }, i) => {
                const rates = aggregateStatuses([item])
                const tier = rank <= 3 ? ['#f59e0b', '#94a3b8', '#b45309'][rank - 1] : '#cbd5e1'
                const name = item.businessName ?? 'Unnamed Vendor'
                return (
                  <motion.tr
                    key={item.vendorId}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => onSelect(item.vendorId)}
                    className="group cursor-pointer hover:bg-indigo-50/50"
                  >
                    <td className="px-5 py-3">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                        style={{ background: `${tier}1a`, color: tier }}
                      >
                        {rank}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-xs font-bold text-white">
                          {initials(name)}
                        </span>
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-700">
                          {name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-slate-800">
                      {formatCompactINR(item.kpi.revenue.current)}
                    </td>
                    <td className="px-3 py-3 text-right text-slate-700">
                      {item.kpi.rentals.current.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className="font-semibold"
                        style={{ color: ratingColor(item.kpi.averageRating) }}
                      >
                        {item.kpi.averageRating.toFixed(1)}★
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-slate-700">
                      {rates.fulfillmentRate.toFixed(0)}%
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className={cn(
                          'font-semibold',
                          item.kpi.revenue.growth >= 0 ? 'text-emerald-600' : 'text-rose-600',
                        )}
                      >
                        {item.kpi.revenue.growth >= 0 ? '+' : ''}
                        {item.kpi.revenue.growth.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                          item.kpi.revenue.current > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {item.kpi.revenue.current > 0 ? 'Active' : 'Idle'}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default VendorLeaderboard
