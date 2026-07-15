// // src/app/categories/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { motion } from 'framer-motion'
// import { ChevronRight, FolderTree } from 'lucide-react'
// import { Card, CardContent } from '@/components/ui/card'
// import { Skeleton } from '@/components/ui/skeleton'
// import axios from 'axios'

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// interface Category {
//   _id: string
//   name: string
//   slug: string
//   icon: string
//   description?: string
//   productCount: number
//   children?: Category[]
// }

// export default function CategoriesPage() {
//   const [categories, setCategories] = useState<Category[]>([])
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     fetchCategories()
//   }, [])

//   const fetchCategories = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/v1/categories/tree`)
//       if (response.data.success) {
//         setCategories(response.data.data.categories)
//       }
//     } catch (error) {
//       console.error('Error fetching categories:', error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   if (isLoading) {
//     return <CategoriesSkeleton />
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
//             <FolderTree className="h-8 w-8 text-primary" />
//           </div>
//           <h1 className="text-3xl md:text-4xl font-bold mb-3">All Categories</h1>
//           <p className="text-muted-foreground max-w-2xl mx-auto">
//             Browse our wide range of rental products across multiple categories
//           </p>
//         </div>

//         {/* Categories Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {categories.map((category, idx) => (
//             <motion.div
//               key={category._id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: idx * 0.05 }}
//             >
//               <Link href={`/products?category=${category.slug}`}>
//                 <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden">
//                   <CardContent className="p-6">
//                     <div className="flex items-start justify-between">
//                       <div>
//                         <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
//                           {category.icon || '📦'}
//                         </div>
//                         <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
//                         <p className="text-sm text-muted-foreground line-clamp-2">
//                           {category.description || `Explore our collection of ${category.name} available for rent`}
//                         </p>
//                         <div className="mt-3 flex items-center text-primary text-sm font-medium">
//                           Shop Now <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
//                         </div>
//                       </div>
//                       {category.productCount > 0 && (
//                         <div className="bg-primary/10 rounded-full px-3 py-1">
//                           <span className="text-sm font-semibold text-primary">{category.productCount}</span>
//                           <span className="text-xs text-muted-foreground"> items</span>
//                         </div>
//                       )}
//                     </div>

//                     {/* Subcategories Preview */}
//                     {category.children && category.children.length > 0 && (
//                       <div className="mt-4 pt-4 border-t">
//                         <p className="text-xs text-muted-foreground mb-2">Popular Subcategories:</p>
//                         <div className="flex flex-wrap gap-2">
//                           {category.children.slice(0, 4).map((child) => (
//                             <span
//                               key={child._id}
//                               className="text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
//                             >
//                               {child.name}
//                             </span>
//                           ))}
//                           {category.children.length > 4 && (
//                             <span className="text-xs text-muted-foreground">
//                               +{category.children.length - 4} more
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//               </Link>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// function CategoriesSkeleton() {
//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <div className="text-center mb-10">
//         <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
//         <Skeleton className="h-10 w-64 mx-auto mb-3" />
//         <Skeleton className="h-5 w-96 mx-auto" />
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {[...Array(6)].map((_, i) => (
//           <Skeleton key={i} className="h-48 rounded-xl" />
//         ))}
//       </div>
//     </div>
//   )
// }



// src/app/categories/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  LayoutGrid,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Truck,
  Headphones,
  Package,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

interface Category {
  _id: string
  name: string
  slug: string
  icon: string
  description?: string
  productCount: number
  children?: Category[]
}

// ─── Deterministic color themes cycled per card — scales to any category count ───
const THEMES = [
  { from: '#eef2ff', to: '#e0e7ff', ring: '#c7d2fe', accent: '#4f46e5', text: '#4338ca', chip: '#eef2ff' },
  { from: '#fff7ed', to: '#ffedd5', ring: '#fed7aa', accent: '#ea580c', text: '#c2410c', chip: '#fff7ed' },
  { from: '#ecfdf5', to: '#d1fae5', ring: '#a7f3d0', accent: '#059669', text: '#047857', chip: '#ecfdf5' },
  { from: '#fff1f2', to: '#ffe4e6', ring: '#fecdd3', accent: '#e11d48', text: '#be123c', chip: '#fff1f2' },
  { from: '#f0f9ff', to: '#e0f2fe', ring: '#bae6fd', accent: '#0284c7', text: '#0369a1', chip: '#f0f9ff' },
  { from: '#f5f3ff', to: '#ede9fe', ring: '#ddd6fe', accent: '#7c3aed', text: '#6d28d9', chip: '#f5f3ff' },
  { from: '#f0fdfa', to: '#ccfbf1', ring: '#99f6e4', accent: '#0d9488', text: '#0f766e', chip: '#f0fdfa' },
  { from: '#fefce8', to: '#fef9c3', ring: '#fef08a', accent: '#ca8a04', text: '#a16207', chip: '#fefce8' },
] as const

const trustPoints = [
  { icon: ShieldCheck, label: 'Verified Products' },
  { icon: Truck, label: 'Pan-India Delivery' },
  { icon: Headphones, label: '24/7 Support' },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/categories/tree`)
      if (response.data.success) {
        setCategories(response.data.data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalProducts = useMemo(
    () => categories.reduce((sum, c) => sum + (c.productCount || 0), 0),
    [categories]
  )

  if (isLoading) {
    return <CategoriesSkeleton />
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700">
        <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-16 sm:pt-14 sm:pb-20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-sm text-indigo-100 mb-5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-medium">Categories</span>
          </div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur ring-1 ring-white/20 mb-5 rotate-3">
            <LayoutGrid className="h-8 w-8 text-white -rotate-3" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Rent Everything You Need
          </h1>
          <p className="text-indigo-100 max-w-2xl mx-auto text-sm sm:text-base">
            Browse {categories.length}+ curated categories and thousands of quality-checked products, delivered across India
          </p>

          {/* Stat strip */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <div className="rounded-xl bg-white/10 backdrop-blur ring-1 ring-white/20 px-5 py-3">
              <p className="text-xl font-bold text-white">{categories.length}+</p>
              <p className="text-[11px] text-indigo-100 font-medium">Categories</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur ring-1 ring-white/20 px-5 py-3">
              <p className="text-xl font-bold text-white">{totalProducts.toLocaleString('en-IN')}+</p>
              <p className="text-[11px] text-indigo-100 font-medium">Products</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur ring-1 ring-white/20 px-5 py-3">
              <p className="text-xl font-bold text-white">500+</p>
              <p className="text-[11px] text-indigo-100 font-medium">Cities Served</p>
            </div>
          </div>

          {/* Trust chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {trustPoints.map((t) => {
              const Icon = t.icon
              return (
                <span
                  key={t.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </span>
              )
            })}
          </div>
        </div>

        {/* Wave divider into content */}
        <svg
          className="absolute bottom-0 left-0 w-full text-slate-50"
          viewBox="0 0 1440 60"
          fill="currentColor"
          preserveAspectRatio="none"
          style={{ height: 36 }}
        >
          <path d="M0,32 C240,60 480,0 720,16 C960,32 1200,56 1440,24 L1440,60 L0,60 Z" />
        </svg>
      </div>

      {/* ── Category grid ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
        {categories.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {categories.map((category, idx) => {
              const theme = THEMES[idx % THEMES.length]
              const isTrending = idx < 2 && category.productCount > 0

              return (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                >
                  <Link href={`/products?category=${category.slug}`} className="block h-full">
                    <Card
                      className="group relative h-full cursor-pointer border border-slate-200/70 hover:border-transparent overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                      style={{ boxShadow: undefined }}
                    >
                      {/* Top accent bar */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: theme.accent }}
                      />

                      {isTrending && (
                        <div
                          className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm"
                          style={{ background: theme.accent }}
                        >
                          <TrendingUp className="h-3 w-3" />
                          Trending
                        </div>
                      )}

                      <CardContent className="p-5 sm:p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="flex items-center justify-center w-16 h-16 rounded-2xl text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ring-1"
                            style={{
                              background: `linear-gradient(145deg, ${theme.from}, ${theme.to})`,
                              // @ts-expect-error css var
                              '--tw-ring-color': theme.ring,
                            }}
                          >
                            {category.icon || '📦'}
                          </div>

                          {category.productCount > 0 && (
                            <div
                              className="rounded-full px-3 py-1 shrink-0"
                              style={{ background: theme.chip }}
                            >
                              <span className="text-sm font-bold" style={{ color: theme.text }}>
                                {category.productCount}
                              </span>
                              <span className="text-[10px] text-slate-500"> items</span>
                            </div>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">{category.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                          {category.description || `Explore our collection of ${category.name} available for rent`}
                        </p>

                        <div
                          className="inline-flex items-center gap-1 text-sm font-semibold w-fit"
                          style={{ color: theme.text }}
                        >
                          Shop Now
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>

                        {category.children && category.children.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-[11px] text-slate-400 font-medium mb-2 uppercase tracking-wide">
                              Popular Picks
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {category.children.slice(0, 4).map((child) => (
                                <span
                                  key={child._id}
                                  className="text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors"
                                  style={{ background: theme.chip, color: theme.text }}
                                >
                                  {child.name}
                                </span>
                              ))}
                              {category.children.length > 4 && (
                                <span className="text-[11px] text-slate-400 self-center">
                                  +{category.children.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* ── Static premium content: value proposition band ─────────────────── */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Why RentEase</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
              Renting made simple, transparent and affordable
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-2xl font-extrabold text-white">₹0</p>
                <p className="text-sm text-slate-400 mt-1">Hidden fees — pricing is always upfront in ₹</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">3–12 mo</p>
                <p className="text-sm text-slate-400 mt-1">Flexible tenures on every rental plan</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">48 hrs</p>
                <p className="text-sm text-slate-400 mt-1">Average doorstep delivery time, pan-India</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Package className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">No categories available yet</h3>
      <p className="text-sm text-slate-500 max-w-sm">
        We're onboarding new categories every week. Check back soon or explore all products directly.
      </p>
      <Link
        href="/products"
        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
      >
        Browse All Products
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function CategoriesSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Skeleton className="h-16 w-16 rounded-2xl mx-auto mb-5 bg-white/20" />
          <Skeleton className="h-10 w-72 mx-auto mb-3 bg-white/20" />
          <Skeleton className="h-5 w-96 mx-auto bg-white/20" />
          <div className="mt-8 flex justify-center gap-4">
            <Skeleton className="h-14 w-24 rounded-xl bg-white/20" />
            <Skeleton className="h-14 w-24 rounded-xl bg-white/20" />
            <Skeleton className="h-14 w-24 rounded-xl bg-white/20" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}