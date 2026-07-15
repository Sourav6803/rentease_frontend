'use client'

import { SlidersHorizontal, Lock } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const WEIGHTS = [
  { id: 'rentalHistory', label: 'Rental History', value: 40 },
  { id: 'trending', label: 'Trending', value: 25 },
  { id: 'category', label: 'Category Preference', value: 20 },
  { id: 'similar', label: 'Similar Products', value: 15 },
  { id: 'ai', label: 'AI Weight', value: 10 },
]

export function ConfigComingSoon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-900">Weight Tuning</h3>
        <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
          Coming Soon
        </span>
      </div>

      <div className="space-y-4">
        {WEIGHTS.map((w) => (
          <div key={w.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-600">{w.label}</label>
              <Input
                value={w.value}
                disabled
                className="h-7 w-14 text-right text-xs opacity-60"
                readOnly
              />
            </div>
            <Slider value={[w.value]} min={0} max={100} step={5} disabled className="opacity-50" />
          </div>
        ))}
      </div>

      {/* Disabled overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 text-white">
          <Lock className="h-4 w-4" />
        </span>
        <p className="mt-2 text-sm font-semibold text-slate-700">Configuration locked</p>
        <p className="text-xs text-slate-500">Weight tuning ships in a future release.</p>
      </div>
    </div>
  )
}

export default ConfigComingSoon
