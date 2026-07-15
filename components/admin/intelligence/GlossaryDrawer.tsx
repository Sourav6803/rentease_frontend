'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, ExternalLink, HelpCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Term {
  term: string
  formula: string
  definition: string
}

const GLOSSARY: Term[] = [
  { term: 'MRR', formula: 'Σ active recurring revenue / month', definition: 'Monthly Recurring Revenue — predictable monthly income from active rentals & subscriptions.' },
  { term: 'LTV', formula: 'AOV × purchase frequency × lifespan', definition: 'Lifetime Value (CLV) — total net revenue a customer is expected to generate.' },
  { term: 'Utilization', formula: 'rented units ÷ available inventory', definition: 'Share of available inventory that is actively rented at a point in time.' },
  { term: 'Conversion', formula: 'rentals ÷ product views × 100', definition: 'Percentage of product views that result in a completed rental.' },
  { term: 'Churn', formula: 'churned ÷ customers (period) × 100', definition: 'Share of customers who stopped renting within the selected period.' },
  { term: 'AOV', formula: 'total revenue ÷ order count', definition: 'Average Order Value — mean rental amount per order.' },
  { term: 'Fulfillment Rate', formula: 'completed ÷ total orders × 100', definition: 'Percentage of orders completed or delivered against total orders.' },
  { term: 'CTR', formula: 'clicks ÷ impressions × 100', definition: 'Click-Through Rate — share of recommendation impressions that were clicked.' },
  { term: 'NPS', formula: '% promoters − % detractors', definition: 'Net Promoter Score — customer loyalty and advocacy metric.' },
  { term: 'Growth', formula: '(current − previous) ÷ previous × 100', definition: 'Period-over-period change in a metric versus the previous comparable window.' },
]

export function GlossaryButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={className}
        onClick={() => setOpen(true)}
      >
        <BookOpen className="h-3.5 w-3.5" />
        Glossary
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-500" />
              Metrics Glossary
            </DialogTitle>
            <DialogDescription>
              Plain-language definitions and formulas for the KPIs used across Intelligence.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-2">
            {GLOSSARY.map((t) => (
              <div key={t.term} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{t.term}</p>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                    {t.formula}
                  </code>
                </div>
                <p className="mt-1 text-xs text-slate-500">{t.definition}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-400">Need more help?</p>
            <Link
              href="/admin/help"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              onClick={() => setOpen(false)}
            >
              Help & Support
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GlossaryButton
