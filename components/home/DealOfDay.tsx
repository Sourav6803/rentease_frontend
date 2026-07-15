// src/components/home/DealOfDay.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const dealProduct = {
  _id: 'deal-1',
  name: 'Premium Leather Sofa',
  originalPrice: 25000,
  dealPrice: 14999,
  discount: 40,
  image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
  link: '/products/premium-leather-sofa',
  endsAt: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours from now
}

export function DealOfDay() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = dealProduct.endsAt.getTime() - now

      if (distance < 0) {
        clearInterval(timer)
        return
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <Card className="overflow-hidden bg-gradient-to-r from-red-500 to-orange-500 text-white">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left Content */}
            <div className="flex-1 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Limited Time Deal</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Deal of the Day</h3>
              <p className="text-white/90 mb-4">{dealProduct.name}</p>
              
              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold">₹{dealProduct.dealPrice.toLocaleString()}</span>
                <span className="text-lg line-through text-white/60">₹{dealProduct.originalPrice.toLocaleString()}</span>
                <span className="bg-white/20 px-2 py-1 rounded text-sm font-semibold">
                  Save {dealProduct.discount}%
                </span>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-4 mb-6">
                <Clock className="h-5 w-5" />
                <div className="flex gap-3">
                  <div className="text-center">
                    <div className="bg-white/20 rounded-lg px-3 py-1 min-w-[50px]">
                      <span className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                    </div>
                    <span className="text-xs">Hours</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-white/20 rounded-lg px-3 py-1 min-w-[50px]">
                      <span className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    </div>
                    <span className="text-xs">Minutes</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-white/20 rounded-lg px-3 py-1 min-w-[50px]">
                      <span className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    </div>
                    <span className="text-xs">Seconds</span>
                  </div>
                </div>
              </div>

              <Link href={dealProduct.link}>
                <Button variant="secondary" size="lg" className="font-semibold">
                  Grab the Deal
                </Button>
              </Link>
            </div>

            {/* Right Image */}
            <div className="relative h-64 md:h-auto md:w-80 bg-white/10">
              <Image
                src={dealProduct.image}
                alt={dealProduct.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}