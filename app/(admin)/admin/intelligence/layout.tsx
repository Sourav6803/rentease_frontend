'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { INTELLIGENCE_MODULES } from '@/components/admin/intelligence'

function isModuleActive(pathname: string, href: string): boolean {
  if (href === '/admin/intelligence') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function IntelligenceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      {/* Sticky module switcher */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Desktop tabs */}
          <nav className="hidden gap-1 overflow-x-auto py-2 md:flex">
            {INTELLIGENCE_MODULES.map((mod) => {
              const active = isModuleActive(pathname, mod.href)
              return (
                <Link
                  key={mod.key}
                  href={mod.href}
                  className={cn(
                    'shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition',
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  {mod.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile scroll pills */}
          <nav className="flex gap-1.5 overflow-x-auto py-2.5 md:hidden scrollbar-none">
            {INTELLIGENCE_MODULES.map((mod) => {
              const active = isModuleActive(pathname, mod.href)
              return (
                <Link
                  key={mod.key}
                  href={mod.href}
                  className={cn(
                    'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition',
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600',
                  )}
                >
                  {mod.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  )
}
