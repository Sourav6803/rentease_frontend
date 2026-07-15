// src/components/home/BrandStrip.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const brands = [
  { name: 'Samsung', logo: '/brands/samsung.png' },
  { name: 'Apple', logo: '/brands/apple.png' },
  { name: 'Sony', logo: '/brands/sony.png' },
  { name: 'LG', logo: '/brands/lg.png' },
  { name: 'Whirlpool', logo: '/brands/whirlpool.png' },
  { name: 'Godrej', logo: '/brands/godrej.png' },
  { name: 'Voltas', logo: '/brands/voltas.png' },
  { name: 'Dell', logo: '/brands/dell.png' },
]

export function BrandStrip() {
  return (
    <div className="py-6 px-4 bg-white border-y">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm text-muted-foreground mb-4">Trusted by 1000+ brands</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {brands.map((brand, idx) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="grayscale hover:grayscale-0 transition-all duration-300"
            >
              <div className="h-8 w-20 relative">
                {/* Replace with actual brand logos */}
                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs">
                  {brand.name}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}