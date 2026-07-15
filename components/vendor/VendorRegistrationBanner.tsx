// src/components/vendor/VendorRegistrationBanner.tsx
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, Shield, Gift, Clock, Zap } from 'lucide-react'

const banners = [
  {
    id: 1,
    title: 'Zero Commission for First 3 Months!',
    description: 'Launch your rental business with 0% commission on all rentals',
    icon: Gift,
    color: 'from-orange-500 to-red-500',
    action: 'Limited time offer',
  },
  {
    id: 2,
    title: '₹10,000 Welcome Bonus',
    description: 'Get started with a special welcome bonus for new vendors',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    action: 'Limited slots available',
  },
  {
    id: 3,
    title: 'Free Premium Support',
    description: '24/7 priority support and dedicated account manager',
    icon: Shield,
    color: 'from-blue-500 to-indigo-500',
    action: 'For first 100 vendors',
  },
]

export function VendorRegistrationBanner() {
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const banner = banners[currentBanner]
  const Icon = banner.icon

  return (
    <div className="space-y-6">
      {/* Rotating Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r p-0.5">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-75",
          banner.color
        )} />
        <div className="relative rounded-2xl bg-background p-6 min-h-40">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {banner.action}
              </div>
              <h3 className="text-xl font-bold">{banner.title}</h3>
              <p className="text-sm text-muted-foreground">{banner.description}</p>
              <Button variant="link" className="p-0 h-auto gap-1 text-primary">
                Learn more <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className={cn(
              "rounded-full p-3",
              `bg-linear-to-r ${banner.color}`
            )}>
              <Icon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-4">
          <Clock className="h-8 w-8 text-primary mb-3" />
          <div className="text-lg font-bold">Quick Setup</div>
          <div className="text-xs text-muted-foreground">Get started in 15 minutes</div>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <Zap className="h-8 w-8 text-primary mb-3" />
          <div className="text-lg font-bold">Instant Payouts</div>
          <div className="text-xs text-muted-foreground">Weekly settlements</div>
        </div>
      </div>

      {/* FAQ Preview */}
      <div className="rounded-2xl border bg-card p-6">
        <h4 className="font-semibold mb-3">Quick Questions?</h4>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium">How long does verification take?</p>
            <p className="text-muted-foreground">Typically 2-3 business days</p>
          </div>
          <div>
            <p className="font-medium">What documents are needed?</p>
            <p className="text-muted-foreground">PAN, Bank details, Business proof</p>
          </div>
          <Button variant="ghost" className="w-full mt-2" asChild>
            <a href="/vendor/faq">View all FAQs →</a>
          </Button>
        </div>
      </div>
    </div>
  )
}