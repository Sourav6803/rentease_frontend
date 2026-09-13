'use client'

/**
 * frontend/hooks/useVendorProfile.ts
 *
 * Read the vendor's own profile through the shared React Query cache.
 *
 * Use this hook instead of calling GET /vendor/profile/me directly. Because the
 * key comes from `vendorProfileQueryOptions`, every component that asks for the
 * profile within the 60s freshness window is served from cache — no matter how
 * many of them mount during a navigation.
 */

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import {
  vendorProfileQueryOptions,
  type VendorProfile,
} from '@/lib/api/vendorProfile'

export interface UseVendorProfileOptions {
  /**
   * Extra gate on top of the auth check. The vendor layout uses this to skip
   * the request on public routes (`/vendor/login`, `/vendor/register`, ...)
   * where the profile is never rendered.
   */
  enabled?: boolean
}

export interface UseVendorProfileResult {
  profile: VendorProfile | null
  /** True only while authenticated and still waiting on the first load. */
  isLoading: boolean
  error: unknown
  /** Stable identity — safe to use in dependency arrays. */
  refetch: () => Promise<void>
}

export function useVendorProfile(options?: UseVendorProfileOptions): UseVendorProfileResult {
  const { status } = useSession()
  const queryClient = useQueryClient()
  const isAuthed = status === 'authenticated'
  const enabled = isAuthed && (options?.enabled ?? true)

  const query = useQuery<VendorProfile | null>({
    ...vendorProfileQueryOptions,
    enabled,
  })

  // Stable identity (queryClient never changes) so consumers can safely put
  // `refetch` in a dependency array. A no-op when nothing is cached yet.
  const refetch = useCallback(async (): Promise<void> => {
    await queryClient.refetchQueries({
      queryKey: vendorProfileQueryOptions.queryKey,
      type: 'all',
    })
  }, [queryClient])

  return {
    profile: query.data ?? null,
    // Mirrors the hand-written call sites: loading only counts once we are
    // actually allowed to fetch, so unauthenticated/idle never shows a spinner.
    isLoading: enabled && query.isPending,
    error: query.error,
    refetch,
  }
}
