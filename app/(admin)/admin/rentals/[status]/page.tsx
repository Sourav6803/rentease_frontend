'use client'

import { useParams } from 'next/navigation'
import AdminRentalList from '@/components/admin/rentals/AdminRentalList'

const STATUS_META: Record<string, { title: string; subtitle: string }> = {
  active: { title: 'Active Rentals', subtitle: 'Currently rented products in delivery or in-use' },
  pending: { title: 'Pending Rentals', subtitle: 'Awaiting vendor confirmation or payment' },
  disputed: { title: 'Disputed Rentals', subtitle: 'Rentals with customer or vendor disputes' },
  overdue: { title: 'Overdue Rentals', subtitle: 'Rentals past their return deadline' },
  completed: { title: 'Completed Rentals', subtitle: 'Successfully returned and closed rentals' },
  cancelled: { title: 'Cancelled Rentals', subtitle: 'Rentals cancelled by user, vendor, or admin' },
}

export default function AdminRentalStatusPage() {
  const params = useParams()
  const status = (params?.status as string) || 'all'
  const meta = STATUS_META[status] || { title: 'Rentals', subtitle: '' }

  return <AdminRentalList statusFilter={status} title={meta.title} subtitle={meta.subtitle} />
}
