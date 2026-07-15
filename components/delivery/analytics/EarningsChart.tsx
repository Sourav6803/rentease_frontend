// components/delivery/analytics/EarningsChart.tsx
'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import type { EarningsBreakdownItem } from '@/lib/api/delivery';
import type { Period } from './PeriodSelector';

interface EarningsChartProps {
  data: EarningsBreakdownItem[];
  period: Period;
}

export function EarningsChart({ data, period }: EarningsChartProps) {
  const [expanded, setExpanded] = useState(false);
  
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const grouped = data.reduce((acc, item) => {
      const date = format(parseISO(item.date), 'MMM dd');
      acc[date] = (acc[date] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
  }, [data]);
  
  const maxAmount = Math.max(...chartData.map(d => d.amount), 0);
  const totalEarnings = data.reduce((sum, item) => sum + item.amount, 0);
  const displayData = expanded ? chartData : chartData.slice(-7);
  
  if (chartData.length === 0) {
    return (
      <Card className="p-8 text-center border-orange-100/60 dark:border-orange-900/30 dark:bg-[#1a0900]">
        <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No earnings data for this period</p>
        <p className="text-sm text-gray-400">Complete deliveries to see earnings</p>
      </Card>
    );
  }
  
  return (
    <Card className="p-4 border-orange-100/60 dark:border-orange-900/30 dark:bg-[#1a0900]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Earnings Overview</h3>
          <p className="text-sm text-gray-500">Daily earnings for this {period}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">₹{totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total {period}</p>
        </div>
      </div>
      
      <div className="relative h-48 md:h-64 mb-4">
        <div className="absolute inset-0 flex items-end gap-1 md:gap-2">
          {displayData.map((item, idx) => {
            const height = (item.amount / maxAmount) * 100;
            return (
              <motion.div
                key={idx}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: idx * 0.02 }}
                className="flex-1 bg-gradient-to-t from-orange-500 to-amber-500 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer group relative"
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ₹{item.amount}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        {displayData.map((item, idx) => (
          <span key={idx} className="text-center flex-1 truncate">{item.date}</span>
        ))}
      </div>
      
      {chartData.length > 7 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4"
        >
          {expanded ? (
            <>Show Less <ChevronUp className="w-4 h-4 ml-1" /></>
          ) : (
            <>Show All {chartData.length} Days <ChevronDown className="w-4 h-4 ml-1" /></>
          )}
        </Button>
      )}
    </Card>
  );
}