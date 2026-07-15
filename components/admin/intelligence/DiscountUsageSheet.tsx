'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { History, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { discountApi, formatINR } from '@/lib/api/admin-intelligence'
import type { Discount } from '@/types/admin-intelligence.types'
import { EmptyState } from './EmptyState'

interface DiscountUsageSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  discount?: Discount | null
}

const PAGE_SIZE = 15

export function DiscountUsageSheet({ open, onOpenChange, discount }: DiscountUsageSheetProps) {
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['ai', 'coupons', 'usage', discount?._id, page],
    queryFn: () => discountApi.usage(discount!._id, { page, limit: PAGE_SIZE }),
    enabled: open && !!discount?._id,
    staleTime: 30_000,
  })

  const usage = data?.usage ?? []
  const pagination = data?.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, pages: 1 }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) setPage(1)
        onOpenChange(o)
      }}
    >
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-slate-100 p-5">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
            <History className="h-5 w-5 text-violet-600" />
            Redemption History
          </SheetTitle>
          <SheetDescription>
            {discount ? (
              <>
                <span className="font-semibold text-slate-700">{discount.code}</span> ·{' '}
                {pagination.total} redemption{pagination.total === 1 ? '' : 's'}
              </>
            ) : (
              'Usage history'
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="p-5">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : usage.length === 0 ? (
            <EmptyState
              title="No redemptions yet"
              description="This coupon has not been used by any customer."
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Date</th>
                    <th className="px-3 py-2 font-semibold">User</th>
                    <th className="px-3 py-2 text-right font-semibold">Order</th>
                    <th className="px-3 py-2 text-right font-semibold">Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usage.map((u, i) => (
                    <tr key={`${u.user ?? 'u'}-${u.usedAt}-${i}`} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-600">
                        {u.usedAt ? new Date(u.usedAt).toLocaleString('en-IN') : '—'}
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-500">
                        {u.user ? `${String(u.user).slice(-6)}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {u.orderValue != null ? formatINR(u.orderValue) : '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-emerald-600">
                        {u.discountAmount != null ? `−${formatINR(u.discountAmount)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.pages || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default DiscountUsageSheet
