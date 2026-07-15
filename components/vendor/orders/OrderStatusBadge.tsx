// components/vendor/orders/OrderStatusBadge.tsx
// import { RentalStatus, STATUS_CONFIG } from '@/app/vendor/orders/types'

import { RentalStatus, STATUS_CONFIG } from "@/app/(vendor)/vendor/orders/types"

export function OrderStatusBadge({ status }: { status: RentalStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')}`} />
      {config.label}
    </span>
  )
}