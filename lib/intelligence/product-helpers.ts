import type { ProductRow } from '@/types/admin-intelligence.types'

export function productName(row: ProductRow | Record<string, unknown>): string {
  if (typeof row.name === 'string' && row.name) return row.name
  const basic = row.basicInfo as { name?: string } | undefined
  return basic?.name ?? 'Unknown product'
}

export function productViews(row: Record<string, unknown>): number {
  const views = row.views
  if (typeof views === 'number') return views
  if (views && typeof views === 'object' && 'count' in views) {
    return Number((views as { count?: number }).count ?? 0)
  }
  return 0
}

export function chartDayLabel(point: Record<string, unknown>): string {
  const id = point._id as { day?: number; month?: number; year?: number } | undefined
  if (id?.day && id?.month) return `${id.day}/${id.month}`
  if (typeof point.label === 'string') return point.label
  if (typeof point.date === 'string') return point.date
  return '—'
}
