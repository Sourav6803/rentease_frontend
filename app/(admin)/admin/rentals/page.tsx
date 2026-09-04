'use client'

import AdminRentalList from '@/components/admin/rentals/AdminRentalList'

export default function AdminAllRentalsPage() {
  return <AdminRentalList statusFilter="all" title="All Rentals" subtitle="Manage and monitor all rental orders across the platform" />
}
