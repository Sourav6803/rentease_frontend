'use client'

/**
 * Production-grade push/notification toast — Flipkart / Amazon style.
 *
 * Rendered via `toast.custom(...)` so it fully owns its markup (sonner's
 * default title/description slots are bypassed). Call `showPushToast(...)`
 * from anywhere; it returns the toast id so callers can dismiss early.
 *
 * Visual language matches the app's brand tokens (globals.css):
 *   --brand / --brand-600 / --brand-soft / --brand-gradient-from|to
 * so it automatically follows the user's selected accent theme.
 */

import { toast } from 'sonner'
import Image from 'next/image'

export interface PushToastOptions {
  title: string
  body?: string
  /** Route pushed when the user clicks the card or "View". */
  url?: string
  /** Category label shown as a small eyebrow (e.g. "Order", "Payment"). */
  category?: string
  /** Optional large media image (product/banner), like e-commerce push. */
  image?: string
  /** Auto-dismiss duration in ms. Default 6000. */
  duration?: number
  onView?: (url: string) => void
}

function PushToastCard({
  id,
  title,
  body,
  url = '/notifications',
  category,
  image,
  duration = 6000,
  onView,
}: PushToastOptions & { id: string | number }) {
  const handleView = () => {
    onView?.(url)
    toast.dismiss(id)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleView}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleView()
      }}
      className="group relative w-[380px] max-w-[calc(100vw-2rem)] cursor-pointer overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_-8px_rgba(0,0,0,0.28)] ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-0.5 dark:bg-zinc-900 dark:ring-white/10"
    >
      {/* Brand accent rail */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{
          background:
            'linear-gradient(to bottom, var(--brand-gradient-from), var(--brand-gradient-to))',
        }}
      />

      <div className="flex items-start gap-3 p-3.5 pl-4">
        {/* Logo badge */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm"
          style={{
            background:
              'linear-gradient(135deg, var(--brand-gradient-from), var(--brand-gradient-to))',
          }}
        >
          <Image
            src="/logo.png"
            alt="RentEase"
            width={28}
            height={28}
            className="h-7 w-7 rounded-md"
          />
        </div>

        {/* Text block */}
        <div className="min-w-0 flex-1">
          {category ? (
            <p
              className="mb-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--brand)' }}
            >
              {category}
            </p>
          ) : (
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              RentEase
            </p>
          )}

          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </p>
          {body ? (
            <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-zinc-500 dark:text-zinc-400">
              {body}
            </p>
          ) : null}

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleView()
              }}
              className="inline-flex h-7 items-center rounded-lg px-3 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              View
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toast.dismiss(id)
              }}
              className="inline-flex h-7 items-center rounded-lg px-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Optional media thumbnail */}
        {image ? (
          <div className="ml-1 hidden h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/5 sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}

        {/* Close (×) */}
        <button
          type="button"
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation()
            toast.dismiss(id)
          }}
          className="absolute right-2 top-2 rounded-md p-1 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-600 group-hover:opacity-100 dark:hover:bg-zinc-800"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-0.5 origin-left"
        style={{
          backgroundColor: 'var(--brand)',
          animation: `push-toast-progress ${duration}ms linear forwards`,
          width: '100%',
        }}
      />
    </div>
  )
}

/** Fire a branded push toast. Returns the sonner toast id. */
export function showPushToast(opts: PushToastOptions) {
  const duration = opts.duration ?? 6000
  return toast.custom(
    (id) => <PushToastCard id={id} {...opts} duration={duration} />,
    { duration }
  )
}
