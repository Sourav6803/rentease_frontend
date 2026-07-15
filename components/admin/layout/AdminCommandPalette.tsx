'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, CornerDownLeft, Command } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import menuItems from '@/components/admin/layout/MenuItemsData'
import type { LucideIcon } from 'lucide-react'

interface PaletteEntry {
  name: string
  href: string
  description?: string
  icon?: LucideIcon
  group: string
}

function flattenMenu(): PaletteEntry[] {
  const out: PaletteEntry[] = []
  const seen = new Set<string>()
  const walk = (items: Array<Record<string, unknown>>, group: string) => {
    for (const it of items) {
      const name = it.name as string
      const href = it.href as string | undefined
      const children = it.children as Array<Record<string, unknown>> | undefined
      if (children?.length) {
        walk(children, name)
        continue
      }
      if (!href || seen.has(href)) continue
      seen.add(href)
      out.push({
        name,
        href,
        description: it.description as string | undefined,
        icon: it.icon as LucideIcon | undefined,
        group,
      })
    }
  }
  for (const role of Object.keys(menuItems)) {
    walk(menuItems[role as keyof typeof menuItems] as Array<Record<string, unknown>>, role)
  }
  return out
}

export function AdminCommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const entries = useMemo(() => flattenMenu(), [])
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries.slice(0, 12)
    return entries
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.description ?? '').toLowerCase().includes(q) ||
          e.group.toLowerCase().includes(q),
      )
      .slice(0, 12)
  }, [entries, query])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActive(0)
  }, [])

  const go = useCallback(
    (href: string) => {
      close()
      router.push(href)
    },
    [router, close],
  )

  // Global shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Reset active index when query changes
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[active]) go(results[active].href)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="flex items-center gap-2 border-b border-slate-100 px-4">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0) }}
            onKeyDown={onListKey}
            placeholder="Search modules, pages, actions…"
            className="h-12 border-0 px-0 text-sm shadow-none focus-visible:ring-0"
          />
          <kbd className="hidden shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">No matching modules.</p>
          ) : (
            results.map((r, i) => {
              const Icon = r.icon
              return (
                <button
                  key={r.href}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r.href)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-left transition',
                    i === active ? 'bg-indigo-50' : 'hover:bg-slate-50',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      i === active ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : <Command className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">{r.name}</span>
                    {r.description && (
                      <span className="block truncate text-xs text-slate-400">{r.description}</span>
                    )}
                  </span>
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                    {r.group}
                  </span>
                  {i === active && (
                    <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                  )}
                </button>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Command className="h-3 w-3" /> Command palette
          </span>
          <span>↑↓ to navigate · ↵ to open</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AdminCommandPalette
