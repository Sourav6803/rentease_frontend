
// // src/components/home/CategoryGrid.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
// import Link from 'next/link'
// import { ChevronRight } from 'lucide-react'
// import { Card, CardContent } from '@/components/ui/card'
// import { Skeleton } from '@/components/ui/skeleton'
// import axios from 'axios'

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// interface Category {
//   _id: string
//   name: string
//   slug: string
//   icon: string
//   image?: { url: string }
//   productCount: number
//   level: number
//   children?: Category[]
// }

// export function CategoryGrid() {
//   const [parentCategories, setParentCategories] = useState<Category[]>([])
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     fetchParentCategories()
//   }, [])

//   const fetchParentCategories = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/v1/categories?level=0&limit=8`)
//       if (response.data.success) {
//         setParentCategories(response.data.data.categories)
//       }
//     } catch (error) {
//       console.error('Error fetching categories:', error)
//     } finally {
//       setIsLoading(false)
//     }
//   }
//   console.log("parent categories", parentCategories)


//   const categoryIcons: Record<string, string> = {
//     Furniture: '🛋️',
//     Electronics: '📱',
//     'Home Appliances': '🔌',
//     'Kids & Baby': '👶',
//     'Sports & Fitness': '⚽',
//     'Party & Events': '🎉',
//     'Tools & Equipment': '🔧',
//     'Books & Media': '📚',
//   }

//   if (isLoading) {
//     return (
//       <div className="py-8 px-4">
//         <div className="flex justify-between items-center mb-6">
//           <Skeleton className="h-8 w-40" />
//           <Skeleton className="h-5 w-24" />
//         </div>
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
//           {[...Array(8)].map((_, i) => (
//             <Skeleton key={i} className="h-24 rounded-lg" />
//           ))}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="py-8 px-4 max-w-7xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl md:text-2xl font-bold">Shop by Category</h2>
//         <Link href="/categories" className="text-primary text-sm hover:underline flex items-center gap-1">
//           View All <ChevronRight className="h-4 w-4" />
//         </Link>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
//         {parentCategories.map((category, idx) => (
//           <motion.div
//             key={category._id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: idx * 0.05 }}
//           >
//             <Link href={`/products?category=${category.slug}`}>
//               <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0">
//                 <CardContent className="p-4 text-center">
//                   <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
//                     {category.icon || categoryIcons[category.name] || '📦'}
//                   </div>
//                   <p className="text-sm font-medium line-clamp-1">{category.name}</p>
//                   <p className="text-xs text-muted-foreground mt-1">{category.productCount || 0} items</p>
//                 </CardContent>
//               </Card>
//             </Link>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   )
// }



// src/components/home/CategoryGrid.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

interface Category {
  _id: string
  name: string
  slug: string
  icon: string
  image?: { url: string }
  productCount: number
  level: number
  children?: Category[]
}

const categoryIcons: Record<string, string> = {
  Furniture: '🛋️',
  Electronics: '📱',
  'Home Appliances': '🔌',
  'Kids & Baby': '👶',
  'Sports & Fitness': '⚽',
  'Party & Events': '🎉',
  'Tools & Equipment': '🔧',
  'Books & Media': '📚',
}

// Deterministic color themes cycled per card — scales to any category count/order
const THEMES = [
  { from: '#eff6ff', to: '#e0e7ff', ring: '#c7d2fe' },
  { from: '#fff7ed', to: '#ffedd5', ring: '#fed7aa' },
  { from: '#ecfdf5', to: '#d1fae5', ring: '#a7f3d0' },
  { from: '#fff1f2', to: '#ffe4e6', ring: '#fecdd3' },
  { from: '#f0f9ff', to: '#e0f2fe', ring: '#bae6fd' },
  { from: '#f5f3ff', to: '#ede9fe', ring: '#ddd6fe' },
  { from: '#f0fdfa', to: '#ccfbf1', ring: '#99f6e4' },
  { from: '#fefce8', to: '#fef9c3', ring: '#fef08a' },
] as const

export function CategoryGrid() {
  const [parentCategories, setParentCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchParentCategories()
  }, [])

  const fetchParentCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/categories?level=0&limit=8`)
      if (response.data.success) {
        setParentCategories(response.data.data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-6 sm:py-8 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-5 sm:mb-6">
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-40" />
          <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
        </div>

        {/* Mobile skeleton: horizontal row of circles */}
        <div className="flex sm:hidden gap-4 overflow-hidden px-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 w-16">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-2.5 w-12 rounded" />
            </div>
          ))}
        </div>

        {/* Desktop/tablet skeleton: grid */}
        <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 sm:py-8 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">Shop by Category</h2>
        <Link
          href="/categories"
          className="text-blue-700 text-xs sm:text-sm font-semibold hover:text-blue-800 flex items-center gap-1 transition-colors"
        >
          View All <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Link>
      </div>

      {/* MOBILE: Flipkart-style horizontal scroll, circular icons only */}
      <div
        className="flex sm:hidden gap-3 overflow-x-auto pb-2 px-1 -mx-1 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {parentCategories.map((category, idx) => {
          const theme = THEMES[idx % THEMES.length]
          return (
            <Link
              key={category._id}
              href={`/products?category=${category.slug}`}
              className="flex flex-col items-center gap-1.5 shrink-0 w-[72px] snap-start active:scale-95 transition-transform"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl ring-1 shrink-0"
                style={{
                  background: `linear-gradient(145deg, ${theme.from}, ${theme.to})`,
                  // @ts-expect-error css var for ring color
                  '--tw-ring-color': theme.ring,
                }}
              >
                {category.icon || categoryIcons[category.name] || '📦'}
              </div>
              <p className="text-[10px] font-medium text-slate-700 leading-tight text-center truncate min-h-[2.4rem] flex items-center justify-center w-full px-0.5">
                {category.name}
              </p>
            </Link>
          )
        })}
      </div>

      {/* TABLET/DESKTOP: original grid of cards */}
      <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {parentCategories.map((category, idx) => {
          const theme = THEMES[idx % THEMES.length]
          return (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.35) }}
            >
              <Link href={`/products?category=${category.slug}`} className="block h-full">
                <Card className="group cursor-pointer h-full border border-slate-200/70 hover:border-transparent hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ring-1 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                      style={{
                        background: `linear-gradient(145deg, ${theme.from}, ${theme.to})`,
                        // @ts-expect-error css var for ring color
                        '--tw-ring-color': theme.ring,
                      }}
                    >
                      {category.icon || categoryIcons[category.name] || '📦'}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight line-clamp-1">
                      {category.name}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      {category.productCount || 0} items
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}