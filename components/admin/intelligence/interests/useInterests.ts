'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listInterests } from '@/lib/api/admin-intelligence'
import type { InterestListResponse } from '@/types/admin-intelligence.types'

export interface UseInterestsParams {
  page?: number
  limit?: number
  minScore?: number
}

export function useInterests({ page = 1, limit = 12, minScore }: UseInterestsParams) {
  return useQuery<InterestListResponse>({
    queryKey: ['ai', 'interests', 'list', { page, limit, minScore }],
    queryFn: () =>
      listInterests({
        page,
        limit,
        ...(minScore !== undefined && minScore > 0 ? { minScore } : {}),
      }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}
