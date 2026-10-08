'use client'

// Shared portal switcher used by every login screen (customer, vendor, admin).
//
// Instead of a row of four look-alike cards, the current portal is stated
// plainly and the others live behind a compact "Other portals" dropdown. That
// keeps the card calm, states the default (you are on Customer / Vendor /
// Admin) and makes switching a deliberate, discoverable action.

import { useRouter } from 'next/navigation'
import { ChevronDown, Shield, Store, Truck, User, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const BRAND_GRADIENT =
  'bg-[linear-gradient(135deg,var(--brand-gradient-from),var(--brand-gradient-to))]'

export type PortalKey = 'user' | 'vendor' | 'admin' | 'delivery'

interface Portal {
  key: PortalKey
  label: string
  desc: string
  icon: LucideIcon
  href: string
}

const PORTALS: Portal[] = [
  { key: 'user', label: 'Customer', desc: 'Rent products at affordable monthly rates', icon: User, href: '/login' },
  { key: 'vendor', label: 'Vendor', desc: 'List your products and earn every month', icon: Store, href: '/vendor/login' },
  { key: 'admin', label: 'Admin', desc: 'Manage vendors, payouts and analytics', icon: Shield, href: '/admin/login' },
  { key: 'delivery', label: 'Delivery', desc: 'Deliver and pick up rental orders', icon: Truck, href: '/delivery/auth/login' },
]

export function RoleSelector({
  active,
  className,
}: {
  /** Which portal this screen signs in to */
  active: PortalKey
  className?: string
}) {
  const router = useRouter()

  const current = PORTALS.find((p) => p.key === active) ?? PORTALS[0]
  const others = PORTALS.filter((p) => p.key !== active)
  const CurrentIcon = current.icon

  return (
    <div
      className={cn(
        'mb-5 flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 p-2.5',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white',
            BRAND_GRADIENT,
          )}
        >
          <CurrentIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold leading-none text-foreground">
            {current.label} login
          </p>
          <p className="mt-1 truncate text-[11px] leading-none text-muted-foreground">
            {current.desc}
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 rounded-xl border-brand/30 text-[11px] font-semibold text-brand hover:bg-brand-soft"
          >
            <span className="hidden sm:inline">Other portals</span>
            <span className="sm:hidden">Switch</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 rounded-xl p-1.5">
          <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Switch sign-in portal
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {others.map((portal) => {
            const Icon = portal.icon
            return (
              <DropdownMenuItem
                key={portal.key}
                onSelect={() => router.push(portal.href)}
                className="cursor-pointer items-start gap-2.5 rounded-lg p-2"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-foreground">
                    {portal.label} login
                  </span>
                  <span className="block text-[11px] leading-snug text-muted-foreground">
                    {portal.desc}
                  </span>
                </span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
