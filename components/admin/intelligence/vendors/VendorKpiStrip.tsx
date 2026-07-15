'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { KpiCard } from '../kpi/KpiCard'
import type { KpiStat } from '../kpi/KpiCard'
import { cn } from '@/lib/utils'

interface VendorKpiStripProps {
  kpis: KpiStat[]
  className?: string
}

export function VendorKpiStrip({ kpis, className }: VendorKpiStripProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
          className,
        )}
      >
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.key} kpi={kpi} index={i} />
        ))}
      </div>
    </TooltipProvider>
  )
}

export default VendorKpiStrip
