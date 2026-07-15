'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Loader2, Flame, UserRound } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTestRecommendation } from './useRecommendations'
import type { RecProduct } from './recommendations.types'
import { cn } from '@/lib/utils'

export function TestRecommendationTool({ className }: { className?: string }) {
  const [userId, setUserId] = useState('')
  const [productId, setProductId] = useState('')
  const [params, setParams] = useState<{ userId?: string; productId?: string }>({})

  const query = useTestRecommendation(params)
  const hasInput = Boolean(userId.trim() || productId.trim())

  const run = () => {
    const next = {
      userId: userId.trim() || undefined,
      productId: productId.trim() || undefined,
    }
    if (!next.userId && !next.productId) return
    setParams(next)
  }

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      <h3 className="text-sm font-semibold text-slate-900">Test Recommendation Tool</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        Enter a userId for personalized results, or leave blank to preview default recommendations.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-500">User ID (optional)</label>
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="64f…rental user id"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-500">Product ID (optional)</label>
          <Input
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="64f…product id"
            className="h-9 text-sm"
          />
        </div>
        <Button
          className="mt-auto h-9 gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          onClick={run}
          disabled={!hasInput || query.isFetching}
        >
          {query.isFetching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          Run Test
        </Button>
      </div>

      <div className="mt-4">
        {query.isFetching ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : query.data && query.data.length ? (
          <ol className="space-y-2">
            {query.data.map((p, i) => (
              <RankedRow key={p._id} product={p} rank={i + 1} />
            ))}
          </ol>
        ) : query.isError ? (
          <p className="rounded-lg bg-red-50 px-3 py-3 text-xs text-red-600">
            Could not fetch recommendations. Verify the IDs and API connectivity.
          </p>
        ) : (
          <p className="py-6 text-center text-sm text-slate-400">
            Run a test to see ranked recommendations with reason tags and confidence.
          </p>
        )}
      </div>
    </div>
  )
}

function RankedRow({ product, rank }: { product: RecProduct; rank: number }) {
  const confidence = product.confidence ?? 0
  const color = confidence >= 85 ? '#10b981' : confidence >= 70 ? '#6366f1' : '#f59e0b'
  return (
    <motion.li
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.04 }}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-800">{product.name}</p>
          <Badge
            variant="outline"
            className="shrink-0 gap-1 border-slate-200 bg-white text-[10px] font-bold text-slate-500"
          >
            {product.reason === 'Based on rental history' ? (
              <UserRound className="h-3 w-3" />
            ) : (
              <Flame className="h-3 w-3" />
            )}
            {product.reason}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full"
              style={{ width: `${confidence}%`, background: color }}
            />
          </div>
          <span className="text-[10px] font-bold" style={{ color }}>
            {confidence}%
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs font-bold text-blue-700">
          ₹{(product.monthlyRent ?? 0).toLocaleString('en-IN')}
        </p>
        <p className="text-[10px] text-slate-400">/month</p>
      </div>
    </motion.li>
  )
}

export default TestRecommendationTool
