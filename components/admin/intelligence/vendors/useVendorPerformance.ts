'use client'

import { useQuery } from '@tanstack/react-query'
import { getVendorPerformance } from '@/lib/api/admin-intelligence'
import type {
  Period,
  VendorDetailResponse,
  VendorPerformanceResponse,
} from '@/types/admin-intelligence.types'

export function useVendorOverview(period: Period = '30d') {
  return useQuery<VendorPerformanceResponse>({
    queryKey: ['ai', 'vendors', 'overview', period],
    queryFn: () => getVendorPerformance({ period }) as Promise<VendorPerformanceResponse>,
    staleTime: 60_000,
  })
}

export function useVendorDetail(vendorId?: string, period: Period = '30d') {
  return useQuery<VendorDetailResponse>({
    queryKey: ['ai', 'vendors', 'detail', vendorId, period],
    enabled: Boolean(vendorId),
    queryFn: () =>
      getVendorPerformance({ vendorId, period }) as Promise<VendorDetailResponse>,
    staleTime: 60_000,
  })
}
