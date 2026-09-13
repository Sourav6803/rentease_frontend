'use client'

/**
 * frontend/hooks/useVendorRealtimeStats.ts
 *
 * Vendor sidebar/header live-stats hook.
 *
 * Migrated from raw `apiClient.get` + `useState`/`useEffect` to React Query.
 * The public return shape is unchanged, so consumers (VendorSidebar,
 * VendorHeader) need no edits.
 *
 * Why this matters: the sidebar and the header BOTH call this hook, and it used
 * to hold its own `useState` per instance — so a single vendor page load fired
 * `profile/me` + `dashboard` + `unread/count` twice (6 requests), and every one
 * of the 10 socket events refetched all three endpoints from both instances.
 * React Query dedupes identical keys into one in-flight request and one cache
 * entry, and coalesces simultaneous invalidations.
 *
 * The query keys come from `@/lib/api/queryKeys` and are shared with
 * `useVendorProfile`, so the vendor layout and settings pages reuse this same
 * cache instead of fetching the profile again.
 */

import { useCallback, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/components/providers/SocketProvider'
import apiClient from '@/lib/api/client'
import { vendorQueryKeys } from '@/lib/api/queryKeys'
import {
  vendorProfileQueryOptions,
  VENDOR_PROFILE_STALE_TIME,
  type VendorProfile,
  type VendorStats,
} from '@/lib/api/vendorProfile'

// Re-exported for backwards compatibility with existing importers.
export type { VendorProfile, VendorStats }

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export interface DashboardResponse {
  revenue?: { totalRevenue?: number }
  rentals?: { active?: number }
  pendingRequests?: { total?: number }
  products?: { total?: number }
  vendor?: { rating?: number; totalReviews?: number }
}

export interface VendorRealtimeStats {
  totalSales: number
  activeOrders: number
  pendingOrders: number
  products: number
  rating: number
  reviewCount: number
  unreadNotifications: number
}

interface UseVendorRealtimeStatsResult extends VendorRealtimeStats {
  profile: VendorProfile | null
  dashboard: DashboardResponse | null
  isLoading: boolean
  refetch: () => Promise<void>
}

const SOCKET_EVENTS = [
  'rental:created',
  'rental:confirmed',
  'rental:delivered',
  'rental:cancelled',
  'rental:status',
  'payment:success',
  'payment:failed',
  'review:created',
  'review:approved',
  'notification:receive',
] as const

type SocketEvent = (typeof SOCKET_EVENTS)[number]

export function useVendorRealtimeStats(): UseVendorRealtimeStatsResult {
  const { status } = useSession()
  const { socket, isConnected } = useSocket()
  const queryClient = useQueryClient()

  const isAuthed = status === 'authenticated'

  // Uses the shared options object so the key AND the queryFn match every other
  // profile reader — that is what makes React Query dedupe the sidebar and the
  // header into one request.
  const profileQuery = useQuery<VendorProfile | null>({
    ...vendorProfileQueryOptions,
    enabled: isAuthed,
  })

  // `retry: 0` keeps the previous single-attempt behaviour — this migration is
  // about removing duplicate requests, not adding new ones.
  const dashboardQuery = useQuery<DashboardResponse | null>({
    queryKey: vendorQueryKeys.dashboard,
    enabled: isAuthed,
    staleTime: VENDOR_PROFILE_STALE_TIME,
    retry: 0,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<DashboardResponse>>('/vendor/dashboard')
      return res.data?.data ?? null
    },
  })

  const unreadQuery = useQuery<number>({
    queryKey: vendorQueryKeys.unreadCount,
    enabled: isAuthed,
    staleTime: VENDOR_PROFILE_STALE_TIME,
    retry: 0,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ count: number }>>(
        '/notifications/unread/count'
      )
      const count = res.data?.data?.count
      return typeof count === 'number' ? count : 0
    },
  })

  const profile = profileQuery.data ?? null
  const dashboard = dashboardQuery.data ?? null

  const stats = useMemo<VendorRealtimeStats>(() => {
    const pStats = profile?.stats
    const dVendor = dashboard?.vendor

    // Identical arithmetic to the previous implementation, kept verbatim so
    // displayed numbers do not shift.
    const pendingFromStats =
      (pStats?.totalRentals ?? 0) -
      (pStats?.completedRentals ?? 0) -
      (pStats?.cancelledRentals ?? 0)

    return {
      totalSales: dashboard?.revenue?.totalRevenue ?? pStats?.totalRevenue ?? 0,
      activeOrders: dashboard?.rentals?.active ?? 0,
      pendingOrders: dashboard?.pendingRequests?.total ?? pendingFromStats,
      products: dashboard?.products?.total ?? pStats?.totalProducts ?? 0,
      rating: dVendor?.rating ?? pStats?.averageRating ?? 0,
      reviewCount: dVendor?.totalReviews ?? pStats?.reviewCount ?? 0,
      unreadNotifications: unreadQuery.data ?? 0,
    }
  }, [profile, dashboard, unreadQuery.data])

  // Preserves the old semantics: `true` only on the very first load, and only
  // for an authenticated vendor. Background refetches no longer flip this back
  // to `true`, so the sidebar no longer flickers to a skeleton on every socket
  // event (previously every event set isLoading -> true).
  const isLoading =
    isAuthed && (profileQuery.isPending || dashboardQuery.isPending || unreadQuery.isPending)

  // Stable identity (queryClient never changes) so consumers can safely put
  // `refetch` in a dependency array.
  const refetch = useCallback(async (): Promise<void> => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: vendorQueryKeys.profile, type: 'all' }),
      queryClient.refetchQueries({ queryKey: vendorQueryKeys.dashboard, type: 'all' }),
      queryClient.refetchQueries({ queryKey: vendorQueryKeys.unreadCount, type: 'all' }),
    ])
  }, [queryClient])

  useEffect(() => {
    if (!socket) return

    const handler = () => {
      // invalidateQueries (not refetch) so overlapping events from the sidebar
      // AND the header collapse into a single in-flight fetch per key.
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.profile })
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.dashboard })
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.unreadCount })
    }

    const events: readonly SocketEvent[] = SOCKET_EVENTS
    events.forEach((event) => socket.on(event, handler))

    return () => {
      events.forEach((event) => socket.off(event, handler))
    }
  }, [socket, isConnected, queryClient])

  return { ...stats, profile, dashboard, isLoading, refetch }
}
