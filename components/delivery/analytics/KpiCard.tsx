// components/delivery/analytics/KpiCard.tsx
'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  icon: any;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: { value: number; isPositive: boolean };
  color?: 'orange' | 'emerald' | 'blue' | 'purple' | 'red';
  className?: string;
}

const colorClasses = {
  orange: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600',
  blue: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600',
  purple: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600',
  red: 'bg-red-50 dark:bg-red-950/20 text-red-600',
};

export function KpiCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext, 
  trend, 
  color = 'orange',
  className 
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("h-full", className)}
    >
      <Card className="p-4 h-full hover:shadow-lg transition-all duration-300 border-orange-100/60 dark:border-orange-900/30 dark:bg-[#1a0900]">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2 rounded-xl", colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.isPositive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
            )}>
              {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}%
            </div>
          )}
        </div>
        <p className="text-2xl font-black tabular-nums text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </Card>
    </motion.div>
  );
}