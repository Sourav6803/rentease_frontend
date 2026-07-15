// src/components/vendor/VendorStats.tsx
'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Users, DollarSign, Award, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stat {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ReactNode
  color: string
}

const stats: Stat[] = [
  {
    label: 'Active Vendors',
    value: '10,000+',
    change: '+25%',
    trend: 'up',
    icon: <Users className="h-5 w-5" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    label: 'Monthly Rentals',
    value: '50,000+',
    change: '+40%',
    trend: 'up',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'from-green-500 to-emerald-500',
  },
  {
    label: 'Avg. Vendor Earnings',
    value: '₹85,000',
    change: '+18%',
    trend: 'up',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    label: 'Customer Rating',
    value: '4.8/5',
    change: '+0.3',
    trend: 'up',
    icon: <Award className="h-5 w-5" />,
    color: 'from-orange-500 to-red-500',
  },
]

export function VendorStats() {
  const [animatedValues, setAnimatedValues] = useState<number[]>(stats.map(() => 0))

  useEffect(() => {
    const timers = stats.map((stat, index) => {
      const targetValue = parseInt(stat.value.replace(/[^0-9]/g, '')) || 0
      let currentValue = 0
      
      const timer = setInterval(() => {
        if (currentValue < targetValue) {
          currentValue += Math.ceil(targetValue / 50)
          setAnimatedValues(prev => {
            const newValues = [...prev]
            newValues[index] = currentValue
            return newValues
          })
        } else {
          clearInterval(timer)
        }
      }, 30)
      
      return timer
    })
    
    return () => timers.forEach(timer => clearInterval(timer))
  }, [])

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={stat.label}
          className="group relative overflow-hidden rounded-2xl border bg-card p-4 transition-all hover:shadow-lg"
        >
          {/* Gradient Background on Hover */}
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r",
            stat.color
          )} />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className={cn(
                "rounded-lg bg-gradient-to-r p-2",
                stat.color
              )}>
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                <ArrowUp className="h-3 w-3" />
                <span>{stat.change}</span>
              </div>
            </div>
            
            <div className="text-2xl font-bold">
              {stat.label === 'Customer Rating' 
                ? stat.value 
                : animatedValues[idx].toLocaleString() + (stat.value.includes('+') ? '+' : '')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}