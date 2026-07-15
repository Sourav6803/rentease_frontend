'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { INTEREST_SIGNAL_DEFINITIONS, INTEREST_MAX_RAW_SCORE, INTEREST_SCORE_CAP } from './interests.utils'

interface ScoringModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScoringModal({ open, onOpenChange }: ScoringModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            How Interest Scoring Works
          </DialogTitle>
          <DialogDescription>
            Each behavioral signal contributes weighted points toward a cumulative{' '}
            <span className="font-semibold text-slate-700">Interest Score</span> (0–100). A product is
            marked <span className="font-semibold text-emerald-600">Interested</span> once the score
            crosses the detection threshold.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Signal
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Description
                </th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Weight
                </th>
              </tr>
            </thead>
            <tbody>
              {INTEREST_SIGNAL_DEFINITIONS.map((s) => {
                const Icon = s.icon
                return (
                  <tr key={s.type} className="border-t border-slate-100">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-lg"
                          style={{ background: `${s.color}18` }}
                        >
                          <Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                        </span>
                        <span className="font-medium text-slate-700">{s.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{s.description}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge
                        variant="outline"
                        className="border-indigo-200 bg-indigo-50 text-[11px] font-bold text-indigo-700"
                      >
                        +{s.weight}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoCard label="Max Raw Score" value={`${INTEREST_MAX_RAW_SCORE}`} hint="Sum of all signal weights" />
          <InfoCard label="Score Cap" value={`${INTEREST_SCORE_CAP}`} hint="Cumulative score is capped" />
          <InfoCard label="Detection Threshold" value="50" hint="Marked Interested ≥ 50" />
        </div>

        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Scores are cumulative — a customer stacking multiple signals (e.g. wishlist + 15s dwell +
          repeat view) can reach the maximum. The engine caps every score at 100 so tiers stay
          comparable across products.
        </p>
      </DialogContent>
    </Dialog>
  )
}

function InfoCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-2xl font-extrabold text-slate-800">{value}</p>
      <p className="text-[11px] text-slate-400">{hint}</p>
    </div>
  )
}

export default ScoringModal
