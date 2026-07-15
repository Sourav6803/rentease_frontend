// components/delivery/analytics/MetricBar.tsx
'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MetricBarProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: 'orange' | 'emerald' | 'blue';
  subtitle?: string;
}

const colorClasses = {
  orange: 'bg-gradient-to-r from-orange-500 to-amber-500',
  emerald: 'bg-gradient-to-r from-emerald-500 to-green-500',
  blue: 'bg-gradient-to-r from-blue-500 to-indigo-500',
};

export function MetricBar({ 
  label, 
  value, 
  max = 100, 
  unit = '%', 
  color = 'orange',
  subtitle 
}: MetricBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}{unit}
        </span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClasses[color])}
        />
      </div>
    </div>
  );
}