import type { Period, PeriodParams } from '@/types/admin-intelligence.types'

export function periodToParams(
  period: Period,
  customRange?: { startDate: string; endDate: string },
): PeriodParams {
  if (period === 'custom' && customRange?.startDate && customRange?.endDate) {
    return {
      period: 'custom',
      startDate: customRange.startDate,
      endDate: customRange.endDate,
    }
  }
  return { period }
}

export function defaultDateRange(period: Period = '30d'): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()

  switch (period) {
    case 'today':
      break
    case 'yesterday':
      start.setDate(start.getDate() - 1)
      end.setDate(end.getDate() - 1)
      break
    case '7d':
      start.setDate(start.getDate() - 7)
      break
    case '15d':
      start.setDate(start.getDate() - 15)
      break
    case '30d':
      start.setDate(start.getDate() - 30)
      break
    case 'quarter':
      start.setMonth(start.getMonth() - 3)
      break
    case 'year':
      start.setFullYear(start.getFullYear() - 1)
      break
    default:
      start.setDate(start.getDate() - 30)
  }

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}
