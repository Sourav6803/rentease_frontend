// components/delivery/analytics/PeriodSelector.tsx
'use client';

import { cn } from '@/lib/utils';

export type Period = 'week' | 'month' | 'year';

interface PeriodSelectorProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  className?: string;
}

export function PeriodSelector({ period, onPeriodChange, className }: PeriodSelectorProps) {
  return (
    <div className={cn("flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1", className)}>
      {(['week', 'month', 'year'] as Period[]).map(p => (
        <button
          key={p}
          onClick={() => onPeriodChange(p)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-all capitalize",
            period === p 
              ? "bg-white dark:bg-gray-900 text-orange-600 dark:text-orange-500 shadow-sm" 
              : "text-gray-600 dark:text-gray-400 hover:bg-white/50"
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}