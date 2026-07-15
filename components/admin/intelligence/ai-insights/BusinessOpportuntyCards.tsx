import { ArrowUpRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { deriveOpportunities, type Opportunity } from './ai-insights.utils'

import type { ProductRow } from '@/types/admin-intelligence.types'

interface BusinessOpportuntyCardsProps {
  categoryRevenue: Array<{ _id: string; revenue: number; count: number }>
  highViewsLowRentals: ProductRow[]
}

export function BusinessOpportuntyCards({
  categoryRevenue,
  highViewsLowRentals,
}: BusinessOpportuntyCardsProps) {
  const ops = deriveOpportunities(categoryRevenue, highViewsLowRentals)
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <ArrowUpRight className="h-3 w-3" />
        </span>
        <h3 className="text-sm font-semibold text-slate-900">Business Opportunities</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ops.map((o: Opportunity) => {
          const Icon: LucideIcon = o.icon
          return (
            <div key={o.key} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${o.accent}1a`, color: o.accent }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{o.label}</p>
              </div>
              <p className="mt-2 text-xl font-extrabold text-slate-900">{o.value}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{o.detail}</p>
              {o.hint && <p className="mt-1 text-[10px] italic text-slate-400">{o.hint}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BusinessOpportuntyCards
