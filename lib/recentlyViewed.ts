// lib/recentlyViewed.ts
// Client-side "recently viewed" products, persisted in localStorage.
// No backend required — works for guests and logged-in users alike.

export interface RecentProduct {
  _id: string
  name: string
  slug: string
  image?: string
  monthlyRent?: number
  viewedAt: number
}

const KEY = 'rentease_recently_viewed'
const MAX = 12

function read(): RecentProduct[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as RecentProduct[]) : []
  } catch {
    return []
  }
}

export function getRecentlyViewed(): RecentProduct[] {
  return read().sort((a, b) => b.viewedAt - a.viewedAt)
}

export function addRecentlyViewed(p: Omit<RecentProduct, 'viewedAt'>) {
  if (typeof window === 'undefined' || !p?._id) return
  try {
    const list = read().filter(x => x._id !== p._id)
    list.unshift({ ...p, viewedAt: Date.now() })
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    /* ignore quota / serialization errors */
  }
}

export function clearRecentlyViewed() {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
