'use client'

import { useMemo, useState } from 'react'
import type { Period } from '@/types/admin-intelligence.types'
import type { DateRangeValue } from '@/components/admin/intelligence'
import { periodToParams } from '@/lib/intelligence/period-utils'

export function useIntelligencePeriod(initial: Period = '30d') {
  const [period, setPeriod] = useState<Period>(initial)
  const [customRange, setCustomRange] = useState<DateRangeValue>({ startDate: '', endDate: '' })

  const params = useMemo(
    () => periodToParams(period, customRange),
    [period, customRange],
  )

  return {
    period,
    setPeriod,
    customRange,
    setCustomRange,
    params,
    isCustom: period === 'custom',
  }
}
