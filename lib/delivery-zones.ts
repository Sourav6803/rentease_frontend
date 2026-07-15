import type { ZoneType } from '@/lib/api/delivery'

export interface ZoneCatalogEntry {
  id: ZoneType
  label: string
  description: string
  cities: string[]
  color: string
  bg: string
  border: string
  gradient: string
}

export const ZONE_CATALOG: ZoneCatalogEntry[] = [
  {
    id: 'north',
    label: 'North',
    description: 'Northern corridor — high residential density, peak evening demand.',
    cities: ['Salt Lake', 'New Town', 'Rajpur', 'Dum Dum'],
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    id: 'south',
    label: 'South',
    description: 'Southern belt — mixed commercial & residential deliveries.',
    cities: ['Garia', 'Jadavpur', 'Tollygunge', 'Behala'],
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    id: 'east',
    label: 'East',
    description: 'Eastern zone — industrial hubs and apartment clusters.',
    cities: ['EM Bypass', 'Sector V', 'Bidhannagar', 'Rajarhat'],
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'west',
    label: 'West',
    description: 'Western routes — longer distances, higher per-stop earnings.',
    cities: ['Howrah', 'Santragachi', 'Dankuni', 'Belur'],
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'central',
    label: 'Central',
    description: 'City core — shortest routes, highest order frequency.',
    cities: ['Park Street', 'Esplanade', 'Ballygunge', 'Alipore'],
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 'all',
    label: 'All Zones',
    description: 'Full city coverage — flexible assignments across all areas.',
    cities: ['City-wide', 'Flexible routing', 'Max opportunities'],
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    gradient: 'from-indigo-500 to-violet-600',
  },
]

export function getZoneMeta(zone?: string): ZoneCatalogEntry {
  const key = (zone || 'central').toLowerCase() as ZoneType
  return ZONE_CATALOG.find((z) => z.id === key) ?? ZONE_CATALOG[4]
}
