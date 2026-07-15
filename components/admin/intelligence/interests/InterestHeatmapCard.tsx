'use client'

import { Grid3x3 } from 'lucide-react'
import { ChartCard } from '../ChartCard'

interface InterestHeatmapCardProps {
  loading?: boolean
  className?: string
}

export function InterestHeatmapCard({ loading = false, className }: InterestHeatmapCardProps) {
  return (
    <ChartCard
      title="Customer Intent Heatmap"
      description="Engagement intensity by day & hour"
      loading={loading}
      height={260}
      className={className}
      actions={
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
          Coming Soon
        </span>
      }
    >
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <Grid3x3 className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Customer Intent Heatmap</p>
        <p className="mt-1 max-w-xs text-xs text-slate-400">
          A future feature that visualises where and when high-intent engagement peaks across your
          storefront.
        </p>
      </div>
    </ChartCard>
  )
}

export default InterestHeatmapCard
