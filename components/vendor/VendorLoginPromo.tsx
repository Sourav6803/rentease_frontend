// src/components/vendor/VendorLoginPromo.tsx
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Gift, 
  Shield, 
  Zap, 
  ArrowRight, 
  Star,
  Users,
  DollarSign
} from 'lucide-react'

const banners = [
  {
    id: 1,
    title: 'Zero Commission for First 3 Months!',
    description: 'New vendors get 0% commission on all rentals for the first 3 months',
    icon: Gift,
    color: 'from-orange-500 to-red-500',
    cta: 'Start Selling',
    ctaLink: '/vendor/register',
  },
  {
    id: 2,
    title: '₹50,000 Welcome Bonus',
    description: 'Earn up to ₹50,000 in bonuses based on your first month performance',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    cta: 'Learn More',
    ctaLink: '/vendor/bonus',
  },
  {
    id: 3,
    title: 'Premium Support Included',
    description: '24/7 priority support and dedicated account manager for all vendors',
    icon: Shield,
    color: 'from-blue-500 to-indigo-500',
    cta: 'Contact Support',
    ctaLink: '/support',
  },
  {
    id: 4,
    title: 'Instant Payouts',
    description: 'Get paid within 24 hours of rental completion',
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    cta: 'Learn More',
    ctaLink: '/vendor/payouts',
  },
]

export function VendorLoginPromo() {
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const banner = banners[currentBanner]
  const Icon = banner.icon

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r p-[1px] shadow-lg">
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r opacity-75",
        banner.color
      )} />
      <div className="relative rounded-2xl bg-background p-6 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Limited Time Offer
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-bold tracking-tight">
              {banner.title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground">
              {banner.description}
            </p>
            
            {/* CTA Button */}
            <Button 
              variant="ghost" 
              className="gap-2 p-0 h-auto text-primary hover:text-primary/80"
              asChild
            >
              <a href={banner.ctaLink}>
                {banner.cta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
          
          {/* Icon */}
          <div className={cn(
            "rounded-full p-3 bg-gradient-to-r",
            banner.color
          )}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-1 mt-4">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                currentBanner === idx 
                  ? "w-6 bg-primary" 
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}