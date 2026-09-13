import type { ReactNode } from 'react'
import { Wallet } from 'lucide-react'

/**
 * Thin section layout for the admin Payments area (/admin/payments/*).
 *
 * It intentionally does no data fetching and renders no navigation: the five
 * sibling pages (transactions, payouts, refunds, gateway, tax) each own their
 * own content and, where useful, their own tabs. This layout only provides the
 * shared page container with consistent responsive padding and the section
 * heading so every page in the area starts at the same rhythm.
 */
export default function PaymentsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <header className="mb-5 flex items-start gap-3 sm:mb-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Payments</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Transactions, refunds, payouts, gateway health and tax — all in one place.
          </p>
        </div>
      </header>

      {children}
    </div>
  )
}
