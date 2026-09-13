'use client'

/**
 * frontend/components/admin/payments/PaymentPrimitives.tsx
 *
 * Presentation primitives shared by every page in the admin Payments section.
 * They exist so the five pages look and behave identically — card styling, status
 * pills, loading/empty/error states and pagination are defined once here rather
 * than re-invented per page.
 *
 * All components are presentational: they take data and callbacks, and never
 * fetch. That keeps the data layer in lib/api/adminPayments.ts and the query
 * wiring in the pages.
 */
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  RefreshCw,
  type LucideIcon as Icon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getStatusMeta } from './payment-format'

// ── Status pill ──────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string | null | undefined
  kind?: 'payment' | 'payout' | 'ledger' | 'ledgerType'
  className?: string
}

export function StatusBadge({ status, kind = 'payment', className }: StatusBadgeProps) {
  const meta = getStatusMeta(kind, status)
  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        meta.className,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', meta.dotClassName)} aria-hidden />
      {meta.label}
    </Badge>
  )
}

// ── KPI card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  /** Tailwind text colour for the icon, e.g. 'text-emerald-600'. */
  accent?: string
  /** Tailwind bg for the icon tile, e.g. 'bg-emerald-50'. */
  accentBg?: string
  loading?: boolean
  /** Draws attention (used for the failures / needs-action cards). */
  tone?: 'default' | 'warning' | 'danger'
  className?: string
}

export function StatCard({
  label,
  value,
  sub,
  icon: IconComponent,
  accent = 'text-slate-600',
  accentBg = 'bg-slate-100',
  loading,
  tone = 'default',
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden p-4 shadow-sm transition-shadow hover:shadow-md',
        tone === 'warning' && 'border-amber-200',
        tone === 'danger' && 'border-rose-200',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-slate-500">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-24" />
          ) : (
            <p className="mt-1 truncate text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">
              {value}
            </p>
          )}
          {sub && !loading && <p className="mt-1 truncate text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', accentBg)}>
          <IconComponent className={cn('h-4 w-4', accent)} />
        </div>
      </div>
    </Card>
  )
}

/** Responsive KPI grid: 1 col on phones, 2 on small, 3-6 on larger screens. */
export function StatGrid({
  children,
  columns = 4,
  className,
}: {
  children: ReactNode
  columns?: 2 | 3 | 4 | 5 | 6
  className?: string
}) {
  const colClass: Record<number, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }
  return <div className={cn('grid grid-cols-1 gap-3 sm:gap-4', colClass[columns], className)}>{children}</div>
}

// ── Page section ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  /** Removes inner padding — for tables that need to reach the card edge. */
  flush?: boolean
  className?: string
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  flush,
  className,
}: SectionCardProps) {
  return (
    <Card className={cn('overflow-hidden shadow-sm', className)}>
      {(title || actions) && (
        <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={flush ? '' : 'p-4'}>{children}</div>
    </Card>
  )
}

/** Label/value line used by the detail sheets and receipts. */
export function DetailRow({
  label,
  value,
  emphasis,
  className,
}: {
  label: string
  value: ReactNode
  emphasis?: 'total' | 'muted'
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 py-1.5 text-sm',
        emphasis === 'total' && 'border-t border-slate-200 pt-2.5 font-semibold text-slate-900',
        className,
      )}
    >
      <span className={cn('text-slate-500', emphasis === 'total' && 'text-slate-700')}>{label}</span>
      <span
        className={cn(
          'text-right tabular-nums text-slate-900',
          emphasis === 'muted' && 'text-slate-500',
          emphasis === 'total' && 'text-base',
        )}
      >
        {value}
      </span>
    </div>
  )
}

// ── States ───────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title: string
  description?: string
  icon?: Icon
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, icon: IconComponent = Inbox, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <IconComponent className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
        <AlertCircle className="h-6 w-6 text-rose-500" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">Something went wrong</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">
        {message || 'The request could not be completed. Please try again.'}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  )
}

/** Table skeleton that mirrors the real column count so nothing jumps on load. */
export function TableSkeleton({ rows = 6, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      <div className="hidden border-b border-slate-100 px-4 py-3 md:flex md:gap-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn('h-4', colIndex === 0 ? 'w-32' : 'w-20', 'md:flex-1')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Card-shaped skeleton for the mobile stacked layout. */
export function CardListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border border-slate-100 p-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-3 w-40" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

/** Inline spinner with a label, for buttons and small blocking areas. */
export function InlineLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  )
}

// ── Pagination ───────────────────────────────────────────────────────────────

interface PaginationBarProps {
  page: number
  pages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  className?: string
}

export function PaginationBar({
  page,
  pages,
  total,
  limit,
  onPageChange,
  className,
}: PaginationBarProps) {
  if (total === 0) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row',
        className,
      )}
    >
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-700">{from.toLocaleString('en-IN')}</span>–
        <span className="font-medium text-slate-700">{to.toLocaleString('en-IN')}</span> of{' '}
        <span className="font-medium text-slate-700">{total.toLocaleString('en-IN')}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Previous</span>
        </Button>
        <span className="px-1 text-xs font-medium text-slate-600">
          Page {page} / {Math.max(1, pages)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ── Filter bar ───────────────────────────────────────────────────────────────

/** Responsive filter container. Children should be label+control pairs. */
export function FilterBar({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  )
}

// ── Responsive table helpers ─────────────────────────────────────────────────

/**
 * Wraps a desktop `<table>` so it scrolls horizontally on narrow screens rather
 * than squashing columns. Pages that need a true card layout on mobile render a
 * separate list (see MobileCardList) and hide the table below `md`.
 */
export function TableScroll({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div className="min-w-[720px]">{children}</div>
    </div>
  )
}

/**
 * A stacked record card for mobile. Rendered instead of the table under `md`.
 */
export function MobileCard({
  title,
  subtitle,
  status,
  statusKind = 'payment',
  amount,
  rows,
  onClick,
  actions,
}: {
  title: ReactNode
  subtitle?: ReactNode
  status?: string
  statusKind?: 'payment' | 'payout' | 'ledger' | 'ledgerType'
  amount?: ReactNode
  rows?: Array<{ label: string; value: ReactNode }>
  onClick?: () => void
  actions?: ReactNode
}) {
  const clickable = Boolean(onClick)
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-3.5 transition-colors',
        clickable && 'cursor-pointer hover:border-slate-300 hover:bg-slate-50',
      )}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">{title}</div>
          {subtitle && <div className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</div>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {status && <StatusBadge status={status} kind={statusKind} />}
          {amount && <div className="text-sm font-semibold tabular-nums text-slate-900">{amount}</div>}
        </div>
      </div>
      {rows && rows.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-slate-100 pt-2.5">
          {rows.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="truncate text-[11px] text-slate-400">{row.label}</dt>
              <dd className="truncate text-xs font-medium text-slate-700">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {actions && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5" onClick={(event) => event.stopPropagation()}>
          {actions}
        </div>
      )}
    </div>
  )
}

/** Table header cell with consistent styling. */
export function Th({
  children,
  align = 'left',
  className,
}: {
  children?: ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className,
      )}
    >
      {children}
    </th>
  )
}

/** Table body cell with consistent styling. */
export function Td({
  children,
  align = 'left',
  className,
}: {
  children?: ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}) {
  return (
    <td
      className={cn(
        'whitespace-nowrap px-4 py-3 text-sm text-slate-700',
        align === 'right' && 'text-right tabular-nums',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </td>
  )
}
