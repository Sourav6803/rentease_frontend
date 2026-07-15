'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface RecommendationDocsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/products/recommendations',
    desc: 'Personalized feed for the signed-in user (falls back to popular when anonymous).',
  },
  {
    method: 'GET',
    path: '/api/v1/products/trending',
    desc: 'Products gaining momentum from recent views, wishlists, and engagements.',
  },
  {
    method: 'GET',
    path: '/api/v1/products/most-popular',
    desc: 'All-time most-rented products ranked by rental volume and revenue.',
  },
  {
    method: 'GET',
    path: '/api/v1/products/:id/similar',
    desc: 'Attribute- and co-rental-similar products for a seed product.',
  },
]

export function RecommendationDocsModal({ open, onOpenChange }: RecommendationDocsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recommendation Engine — API Reference</DialogTitle>
          <DialogDescription>
            This console is a read-only preview. It consumes the existing product recommendation
            endpoints below; no recommendation logic is computed here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700"
                >
                  {e.method}
                </Badge>
                <code className="text-xs font-semibold text-slate-700">{e.path}</code>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{e.desc}</p>
            </div>
          ))}
        </div>

        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Weight tuning, AI ranking, and backend CTR/conversion analytics are planned and shown as
          “Coming Soon” placeholders throughout this console.
        </p>
      </DialogContent>
    </Dialog>
  )
}

export default RecommendationDocsModal
