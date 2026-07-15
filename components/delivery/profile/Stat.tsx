// components/delivery/profile/Stat.tsx
'use client';

import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';

export function Stat({
  label,
  value,
  trend,
  trendUp,
  icon: Icon,
  accent = 'orange',
  spark,
}: {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ElementType;
  accent?: 'orange' | 'emerald' | 'blue' | 'violet' | 'rose';
  spark?: number[];
}) {
  const accents = {
    orange: 'from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400',
    emerald: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
    blue: 'from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400',
    violet: 'from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400',
    rose: 'from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400',
  };
  const sparkColor = {
    orange: '#f97316',
    emerald: '#10b981',
    blue: '#3b82f6',
    violet: '#8b5cf6',
    rose: '#f43f5e',
  }[accent];

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 shadow-sm shadow-gray-900/[0.02] hover:shadow-md hover:shadow-gray-900/[0.04] hover:border-gray-300 dark:hover:border-gray-700 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-gray-900 dark:text-white">
            {value}
          </div>
          {trend && (
            <div
              className={cn(
                'mt-1 text-xs font-semibold inline-flex items-center gap-1',
                trendUp
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {trendUp ? '↑' : '↓'} {trend}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0',
              accents[accent]
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {spark && (
        <div className="mt-3 -mb-1">
          <Sparkline data={spark} color={sparkColor} height={36} />
        </div>
      )}
    </div>
  );
}
