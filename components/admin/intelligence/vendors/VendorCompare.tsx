'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Truck, Ban, Star, DollarSign, Package, TrendingUp, Users, Percent } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { formatCompactINR } from '@/lib/api/admin-intelligence'
import type { VendorOverviewItem } from '@/types/admin-intelligence.types'
import { aggregateStatuses } from './vendor.utils'

interface CompareMetric {
  key: string
  label: string
  icon: typeof DollarSign
  get: (i: VendorOverviewItem) => number
  format: (v: number) => string
  higherIsBetter: boolean
}

const METRICS: CompareMetric[] = [
  { key: 'revenue', label: 'Revenue', icon: DollarSign, get: (i) => i.kpi.revenue.current, format: (v) => formatCompactINR(v), higherIsBetter: true },
  { key: 'rentals', label: 'Rentals', icon: Package, get: (i) => i.kpi.rentals.current, format: (v) => v.toLocaleString('en-IN'), higherIsBetter: true },
  { key: 'growth', label: 'Growth', icon: TrendingUp, get: (i) => i.kpi.revenue.growth, format: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`, higherIsBetter: true },
  { key: 'fulfillment', label: 'Fulfillment', icon: Percent, get: (i) => aggregateStatuses([i]).fulfillmentRate, format: (v) => `${v.toFixed(1)}%`, higherIsBetter: true },
  { key: 'rating', label: 'Rating', icon: Star, get: (i) => i.kpi.averageRating, format: (v) => `${v.toFixed(2)}★`, higherIsBetter: true },
  { key: 'customers', label: 'Customers', icon: Users, get: (i) => i.kpi.totalCustomers, format: (v) => v.toLocaleString('en-IN'), higherIsBetter: true },
  { key: 'late', label: 'Late Deliveries', icon: Truck, get: (i) => aggregateStatuses([i]).late, format: (v) => String(v), higherIsBetter: false },
  { key: 'cancellation', label: 'Cancellation', icon: Ban, get: (i) => aggregateStatuses([i]).cancellationRate, format: (v) => `${v.toFixed(1)}%`, higherIsBetter: false },
]

function VendorSelect({
  value,
  exclude,
  items,
  onChange,
}: {
  value: string | undefined
  exclude?: string
  items: VendorOverviewItem[]
  onChange: (id: string) => void
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-full text-xs">
        <SelectValue placeholder="Select vendor" />
      </SelectTrigger>
      <SelectContent>
        {items
          .filter((i) => i.vendorId !== exclude)
          .map((i) => (
            <SelectItem key={i.vendorId} value={i.vendorId} className="text-xs">
              {i.businessName ?? 'Unnamed Vendor'}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}

export function VendorCompare({ items }: { items: VendorOverviewItem[] }) {
  const [aId, setAId] = useState<string | undefined>(items[0]?.vendorId)
  const [bId, setBId] = useState<string | undefined>(items[1]?.vendorId)

  const a = useMemo(() => items.find((i) => i.vendorId === aId), [items, aId])
  const b = useMemo(() => items.find((i) => i.vendorId === bId), [items, bId])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <VendorSelect value={aId} exclude={bId} items={items} onChange={setAId} />
        <span className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">vs</span>
        <VendorSelect value={bId} exclude={aId} items={items} onChange={setBId} />
      </div>

      {!a || !b ? (
        <p className="py-8 text-center text-sm text-slate-400">Select two vendors to compare.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 text-left">Metric</th>
                <th className="px-3 py-2 text-right">{a.businessName ?? 'Vendor A'}</th>
                <th className="px-3 py-2 text-right">{b.businessName ?? 'Vendor B'}</th>
                <th className="px-3 py-2 text-center">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {METRICS.map((m) => {
                const av = m.get(a)
                const bv = m.get(b)
                const aWins = m.higherIsBetter ? av >= bv : av <= bv
                const tie = av === bv
                const Icon = m.icon
                return (
                  <motion.tr key={m.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Icon className="h-3.5 w-3.5 text-slate-400" />
                        {m.label}
                      </span>
                    </td>
                    <td className={cn('px-3 py-3 text-right font-semibold', aWins && !tie ? 'text-emerald-700' : 'text-slate-800')}>
                      {m.format(av)}
                    </td>
                    <td className={cn('px-3 py-3 text-right font-semibold', !aWins && !tie ? 'text-emerald-700' : 'text-slate-800')}>
                      {m.format(bv)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {tie ? (
                        <span className="text-[11px] font-bold text-slate-400">Tie</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <Crown className="h-3 w-3" />
                          {aWins ? (a.businessName ?? 'A') : (b.businessName ?? 'B')}
                        </span>
                      )}
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

export default VendorCompare
