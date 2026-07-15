
'use client'

import { useState, useEffect, useCallback } from 'react'
import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home, Grid3X3, List, ChevronRight,
  SlidersHorizontal, X, ChevronDown, ChevronUp,
  Search, Check
} from 'lucide-react'
import { ProductCard } from '@/components/home/ProductCard'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category {
  _id: string; name: string; slug: string; level: number
  description?: string; parent?: string | { _id: string; name: string; slug: string }
  children?: Category[]; productCount: number; image?: { url: string }; icon?: string
}
interface Product {
  _id: string
  basicInfo: { name: string; slug: string; brand?: string }
  pricing: { monthlyRent: number; securityDeposit: number; originalPrice?: number }
  media?: { images?: Array<{ url: string; isPrimary: boolean }> }
  ratings?: { average: number; count: number }
  condition?: string
}
interface FilterOptions {
  brands: string[]; priceRange: { min: number; max: number }; conditions: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const findCategoryBySlug = (cats: Category[], slug: string): Category | null => {
  for (const c of cats) {
    if (c.slug === slug) return c
    if (c.children?.length) { const f = findCategoryBySlug(c.children, slug); if (f) return f }
  }
  return null
}

const buildBreadcrumbPath = (cats: Category[], id: string, path: Category[] = []): Category[] | null => {
  for (const c of cats) {
    const cur = [...path, c]
    if (c._id === id) return cur
    if (c.children?.length) { const r = buildBreadcrumbPath(c.children, id, cur); if (r) return r }
  }
  return null
}

// ─── Category icon map (colors are data-driven, kept as inline style — see note) ──
const CAT_ICONS: Record<string, { emoji: string; bg: string; color: string }> = {
  'Furniture':         { emoji: '🛋️', bg: '#eff6ff', color: '#1d4ed8' },
  'Electronics':       { emoji: '📱', bg: '#f0fdf4', color: '#15803d' },
  'Home Appliances':   { emoji: '🔌', bg: '#fff7ed', color: '#c2410c' },
  'Kids & Baby':       { emoji: '👶', bg: '#fdf4ff', color: '#7e22ce' },
  'Sports & Fitness':  { emoji: '⚽', bg: '#f0fdfa', color: '#0f766e' },
  'Party & Events':    { emoji: '🎉', bg: '#fef9c3', color: '#a16207' },
  'Tools & Equipment': { emoji: '🔧', bg: '#f8fafc', color: '#475569' },
  'Books & Media':     { emoji: '📚', bg: '#fff1f2', color: '#be123c' },
}
const getCatMeta = (name: string) =>
  CAT_ICONS[name] ?? { emoji: '📦', bg: '#f8fafc', color: '#475569' }

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProductsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-[1340px] mx-auto px-4 pt-4 flex items-center gap-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-2" />
        <Skeleton className="h-3.5 w-24" />
      </div>
      <div className="max-w-[1340px] mx-auto px-4 mt-4 flex gap-4 items-start">
        <aside className="hidden lg:block w-60 shrink-0 bg-white rounded-xl border border-slate-200 p-4">
          <Skeleton className="h-5 w-2/3 mb-5" />
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-9 rounded-md mb-2.5" />
          ))}
        </aside>
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-40 rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Collapsible filter section ───────────────────────────────────────────────
function FilterSection({
  title, children, defaultOpen = true,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span>{title}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 pt-0.5">{children}</div>}
    </div>
  )
}

// ─── Sidebar filters content (shared between desktop rail + mobile sheet) ─────
function FiltersContent({
  filterOptions, priceRange, setPriceRange,
  selectedBrands, setSelectedBrands,
  selectedConditions, setSelectedConditions,
  clearAll, activeCount,
}: {
  filterOptions: FilterOptions; priceRange: [number, number]
  setPriceRange: (v: [number, number]) => void; selectedBrands: string[]
  setSelectedBrands: (v: string[]) => void; selectedConditions: string[]
  setSelectedConditions: (v: string[]) => void; clearAll: () => void; activeCount: number
}) {
  const CONDITIONS = ['New', 'Like New', 'Good', 'Fair']
  const toggleBrand = (b: string) =>
    setSelectedBrands(selectedBrands.includes(b) ? selectedBrands.filter(x => x !== b) : [...selectedBrands, b])
  const toggleCond = (c: string) =>
    setSelectedConditions(selectedConditions.includes(c) ? selectedConditions.filter(x => x !== c) : [...selectedConditions, c])

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-800" />
          <span className="text-[13px] font-extrabold text-slate-900">Filters</span>
          {activeCount > 0 && (
            <Badge className="bg-blue-600 hover:bg-blue-600 text-white h-[18px] min-w-[18px] px-1.5 rounded-full text-[10px] font-bold">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <button className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition-colors" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range / Month">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1">
            ₹{priceRange[0].toLocaleString('en-IN')}
          </span>
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1">
            ₹{priceRange[1].toLocaleString('en-IN')}
          </span>
        </div>
        <div className="px-1 pb-2">
          <Slider
            value={priceRange}
            onValueChange={v => setPriceRange(v as [number, number])}
            min={filterOptions.priceRange.min}
            max={filterOptions.priceRange.max}
            step={500}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
          <span>₹{filterOptions.priceRange.min.toLocaleString('en-IN')}</span>
          <span>₹{filterOptions.priceRange.max.toLocaleString('en-IN')}</span>
        </div>
      </FilterSection>

      {/* Brands */}
      {filterOptions.brands.length > 0 && (
        <FilterSection title="Brand">
          <div className="flex flex-col gap-0.5">
            {filterOptions.brands.map(b => (
              <label
                key={b}
                className="flex items-center gap-2.5 py-1.5 px-1 rounded-md hover:bg-slate-50 cursor-pointer"
                onClick={() => toggleBrand(b)}
              >
                <span
                  className={`h-4 w-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                    selectedBrands.includes(b) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                  }`}
                >
                  {selectedBrands.includes(b) && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </span>
                <span className="text-[12.5px] font-medium text-slate-600">{b}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Condition */}
      <FilterSection title="Condition">
        <div className="flex flex-col gap-0.5">
          {CONDITIONS.map(c => (
            <label
              key={c}
              className="flex items-center gap-2.5 py-1.5 px-1 rounded-md hover:bg-slate-50 cursor-pointer"
              onClick={() => toggleCond(c)}
            >
              <span
                className={`h-4 w-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                  selectedConditions.includes(c) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                }`}
              >
                {selectedConditions.includes(c) && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
              </span>
              <span className="text-[12.5px] font-medium text-slate-600">{c}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categorySlug = searchParams.get('category')

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [breadcrumbs, setBreadcrumbs] = useState<Category[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)

  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    brands: [], priceRange: { min: 0, max: 100000 }, conditions: ['New', 'Like New', 'Good', 'Fair'],
  })

  const fetchCategories = useCallback(async () => {
    try {
      const catRes = await axios.get(`${BASE_URL}/api/v1/categories/tree`)
      if (catRes.data?.success) {
        const allCats: Category[] = catRes.data.data.categories || []
        setCategories(allCats)

        if (categorySlug) {
          const found = findCategoryBySlug(allCats, categorySlug)
          setSelectedCategory(found || null)
          setSubcategories(found?.children?.length ? found.children : [])
          setBreadcrumbs(found ? buildBreadcrumbPath(allCats, found._id) || [] : [])
          setCategoryId(found?._id || null)
        } else {
          setSelectedCategory(null)
          setSubcategories([])
          setBreadcrumbs([])
          setCategoryId(null)
        }
      }
    } catch (e) {
      console.error('Error fetching categories:', e)
    }
  }, [categorySlug])

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const prodRes = await axios.get(`${BASE_URL}/api/v1/products/search`, {
        params: { category: categoryId, sort: sortBy, limit: 48, inStock: true },
      })

      if (prodRes.data?.success) {
        const list: Product[] = prodRes.data.data.products || []
        setProducts(list)
        setFilteredProducts(list)

        const brands = [...new Set(list.map(p => p.basicInfo.brand).filter(Boolean))] as string[]
        setFilterOptions(prev => ({ ...prev, brands }))

        if (list.length > 0) {
          const prices = list.map(p => p.pricing.monthlyRent)
          const mn = Math.min(...prices), mx = Math.max(...prices)
          setFilterOptions(prev => ({ ...prev, priceRange: { min: mn, max: mx } }))
          setPriceRange([mn, mx])
        }
      } else {
        setProducts([])
        setFilteredProducts([])
      }
    } catch (e) {
      console.error('Error fetching products:', e)
      setProducts([])
      setFilteredProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [categoryId, sortBy])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  useEffect(() => {
    if (categorySlug && !categoryId) return
    fetchProducts()
  }, [fetchProducts, categoryId])

  useEffect(() => {
    let f = [...products]
    if (selectedBrands.length) f = f.filter(p => p.basicInfo.brand && selectedBrands.includes(p.basicInfo.brand))
    f = f.filter(p => p.pricing.monthlyRent >= priceRange[0] && p.pricing.monthlyRent <= priceRange[1])
    if (selectedConditions.length) f = f.filter(p => p.condition && selectedConditions.includes(p.condition))
    if (sortBy === 'price_asc') f.sort((a, b) => a.pricing.monthlyRent - b.pricing.monthlyRent)
    else if (sortBy === 'price_desc') f.sort((a, b) => b.pricing.monthlyRent - a.pricing.monthlyRent)
    else if (sortBy === 'rating') f.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0))
    else if (sortBy === 'popularity') f.sort((a, b) => (b.ratings?.count || 0) - (a.ratings?.count || 0))
    setFilteredProducts(f)
  }, [products, selectedBrands, priceRange, selectedConditions, sortBy])

  const clearAllFilters = () => {
    setSelectedBrands([]); setSelectedConditions([])
    setPriceRange([filterOptions.priceRange.min, filterOptions.priceRange.max])
  }

  const activeFilterCount =
    selectedBrands.length + selectedConditions.length +
    (priceRange[0] > filterOptions.priceRange.min || priceRange[1] < filterOptions.priceRange.max ? 1 : 0)

  const hasActiveChips =
    selectedBrands.length > 0 || selectedConditions.length > 0 ||
    priceRange[0] > filterOptions.priceRange.min || priceRange[1] < filterOptions.priceRange.max

  if (isLoading) return <ProductsSkeleton />

  const topCategories = categories.slice(0, 10)

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* ── Top Category Nav Bar ─────────────────────────────────────────── */}
      {/* {topCategories.length > 0 && (
        <div className="sticky top-0 z-40 bg-white border-b border-slate-100 [mask-image:linear-gradient(90deg,transparent,black_24px,black_calc(100%-24px),transparent)] lg:[mask-image:none]">
          <div
            className="max-w-[1280px] mx-auto flex items-start gap-1.5 px-4 py-3 overflow-x-auto overflow-y-hidden
                       [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [scroll-snap-type:x_proximity]
                       sm:gap-2.5 sm:py-3.5 sm:px-5 sm:flex-wrap sm:justify-center sm:overflow-visible"
          >
            <Link
              href="/products"
              className="flex-none [scroll-snap-align:start] w-[72px] sm:w-[84px] flex flex-col items-center gap-1.5
                         px-1 pt-2 pb-2.5 rounded-2xl relative transition-transform hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <div
                className="w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] rounded-2xl flex items-center justify-center text-2xl sm:text-[27px] shrink-0 ring-1 ring-black/5 transition-transform group-hover:scale-105"
                style={{ background: !categorySlug ? '#eff6ff' : '#f1f5f9' }}
              >
                🏠
              </div>
              <span className={`text-[11.5px] sm:text-[12.5px] font-semibold text-center leading-tight line-clamp-2 ${
                !categorySlug ? 'text-blue-700 font-bold' : 'text-slate-600'
              }`}>
                All
              </span>
              {!categorySlug && (
                <span className="absolute bottom-0 left-4 right-4 h-[2.5px] rounded-t bg-gradient-to-r from-blue-500 to-indigo-500" />
              )}
            </Link>

            {topCategories.map(cat => {
              const meta = getCatMeta(cat.name)
              const isActive = categorySlug === cat.slug
              return (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat.slug}`}
                  className="flex-none [scroll-snap-align:start] w-[72px] sm:w-[84px] flex flex-col items-center gap-1.5
                             px-1 pt-2 pb-2.5 rounded-2xl relative transition-transform hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <div
                    className="w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] rounded-2xl flex items-center justify-center text-2xl sm:text-[27px] shrink-0 ring-1 ring-black/5 transition-transform hover:scale-105"
                    style={{
                      background: meta.bg,
                      boxShadow: isActive ? `0 6px 14px -6px ${meta.color}66` : undefined,
                    }}
                  >
                    {cat.icon || meta.emoji}
                  </div>
                  <span className={`text-[11.5px] sm:text-[12.5px] font-semibold text-center leading-tight line-clamp-2 ${
                    isActive ? 'text-blue-700 font-bold' : 'text-slate-600'
                  }`}>
                    {cat.name}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2.5px] rounded-t bg-gradient-to-r from-blue-500 to-indigo-500" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )} */}

      {topCategories.length > 0 && (
        <div className="sticky top-0 z-40 bg-white border-b border-slate-100 [mask-image:linear-gradient(90deg,transparent,black_24px,black_calc(100%-24px),transparent)] lg:[mask-image:none]">
          <div
            className="max-w-[1280px] mx-auto flex items-start gap-1.5 px-4 py-3 overflow-x-auto overflow-y-hidden
                      [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [scroll-snap-type:x_proximity]
                      sm:gap-2.5 sm:py-3.5 sm:px-5 sm:flex-wrap sm:justify-center sm:overflow-visible"
          >
            <Link
              href="/products"
              className="flex-none [scroll-snap-align:start] w-[68px] sm:w-[84px] flex flex-col items-center gap-1.5
                        px-1 pt-2 pb-2.5 rounded-2xl relative transition-transform hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <div
                className="w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] rounded-2xl flex items-center justify-center text-2xl sm:text-[27px] shrink-0 ring-1 ring-black/5 transition-transform group-hover:scale-105"
                style={{ background: !categorySlug ? '#eff6ff' : '#f1f5f9' }}
              >
                🏠
              </div>
              <span className={`text-[9.5px] sm:text-[12.5px] font-semibold text-center leading-tight truncate w-full px-0.5 ${
                !categorySlug ? 'text-blue-700 font-bold' : 'text-slate-600'
              }`}>
                All
              </span>
              {!categorySlug && (
                <span className="absolute bottom-0 left-4 right-4 h-[2.5px] rounded-t bg-gradient-to-r from-blue-500 to-indigo-500" />
              )}
            </Link>

            {topCategories.map(cat => {
              const meta = getCatMeta(cat.name)
              const isActive = categorySlug === cat.slug
              return (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat.slug}`}
                  className="flex-none [scroll-snap-align:start] w-[68px] sm:w-[84px] flex flex-col items-center gap-1.5
                            px-1 pt-2 pb-2.5 rounded-2xl relative transition-transform hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <div
                    className="w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] rounded-2xl flex items-center justify-center text-2xl sm:text-[27px] shrink-0 ring-1 ring-black/5 transition-transform hover:scale-105"
                    style={{
                      background: meta.bg,
                      boxShadow: isActive ? `0 6px 14px -6px ${meta.color}66` : undefined,
                    }}
                  >
                    {cat.icon || meta.emoji}
                  </div>
                  <span className={`text-[9.5px] sm:text-[12.5px] font-semibold text-center leading-tight truncate w-full px-0.5 ${
                    isActive ? 'text-blue-700 font-bold' : 'text-slate-600'
                  }`}>
                    {cat.name}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2.5px] rounded-t bg-gradient-to-r from-blue-500 to-indigo-500" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="max-w-[1340px] mx-auto px-4">
        {/* ── Breadcrumb ────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1 flex-wrap pt-3 text-xs text-slate-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-blue-700 font-medium"><Home className="h-3 w-3" /></Link>
          <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
          <Link href="/products" className="text-slate-500 hover:text-blue-700 font-medium">Products</Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb._id}>
              <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-slate-900 font-bold">{crumb.name}</span>
              ) : (
                <Link href={`/products?category=${crumb.slug}`} className="text-slate-500 hover:text-blue-700 font-medium">
                  {crumb.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* ── Category Hero ─────────────────────────────────────────────── */}
        {selectedCategory && (() => {
          const meta = getCatMeta(selectedCategory.name)
          return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 px-6 py-5 mt-3.5 flex items-center gap-4">
              <div className="absolute -right-5 -top-5 w-36 h-36 rounded-full bg-white/[0.04]" />
              <div className="absolute right-10 -bottom-7 w-24 h-24 rounded-full bg-white/[0.03]" />
              <div className="relative w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-2xl shrink-0">
                {selectedCategory.icon || meta.emoji}
              </div>
              <div className="relative flex-1">
                <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight mb-1">
                  {selectedCategory.name}
                </h1>
                {selectedCategory.description && (
                  <p className="text-[13px] text-white/55 leading-snug">{selectedCategory.description}</p>
                )}
                <div className="flex gap-2 mt-2.5">
                  <span className="text-[11px] font-semibold text-white/80 bg-white/10 backdrop-blur border border-white/10 rounded-full px-3 py-1">
                    {selectedCategory.productCount || filteredProducts.length} Products
                  </span>
                  {selectedCategory.level === 0 && (
                    <span className="text-[11px] font-semibold text-white/80 bg-white/10 backdrop-blur border border-white/10 rounded-full px-3 py-1">
                      Main Category
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {/* ── Subcategory Pills ─────────────────────────────────────────── */}
        {subcategories.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 mt-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Browse subcategories</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/products?category=${selectedCategory?.slug}`}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  !searchParams.get('sub')
                    ? 'bg-blue-600 border border-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 hover:-translate-y-0.5'
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                All {selectedCategory?.name}
              </Link>
              {subcategories.map(sub => {
                const meta = getCatMeta(sub.name)
                return (
                  <Link
                    key={sub._id}
                    href={`/products?category=${sub.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap
                               bg-slate-50 border border-slate-200 text-slate-600 transition-all
                               hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 hover:-translate-y-0.5"
                  >
                    <span className="text-sm leading-none">{sub.icon || meta.emoji}</span>
                    {sub.name}
                    {sub.productCount > 0 && <span className="text-[10px] text-slate-400 font-medium">({sub.productCount})</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Main Layout ──────────────────────────────────────────────── */}
        <div className="flex gap-4 mt-3.5 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0 sticky top-[76px]">
            <FiltersContent
              filterOptions={filterOptions}
              priceRange={priceRange} setPriceRange={setPriceRange}
              selectedBrands={selectedBrands} setSelectedBrands={setSelectedBrands}
              selectedConditions={selectedConditions} setSelectedConditions={setSelectedConditions}
              clearAll={clearAllFilters} activeCount={activeFilterCount}
            />
          </aside>

          {/* Products Area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2.5 flex-wrap mb-3">
              <div className="flex items-center gap-2.5">
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <button className="lg:hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="bg-blue-600 hover:bg-blue-600 text-white h-[18px] min-w-[18px] px-1.5 rounded-full text-[10px] font-bold">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto">
                    <div className="px-4 pt-4">
                      <SheetTitle className="text-base font-extrabold text-slate-900">Filter Products</SheetTitle>
                    </div>
                    <div className="p-3">
                      <FiltersContent
                        filterOptions={filterOptions}
                        priceRange={priceRange} setPriceRange={setPriceRange}
                        selectedBrands={selectedBrands} setSelectedBrands={setSelectedBrands}
                        selectedConditions={selectedConditions} setSelectedConditions={setSelectedConditions}
                        clearAll={clearAllFilters} activeCount={activeFilterCount}
                      />
                      <div className="px-1 pt-3">
                        <Button
                          onClick={() => setShowFilters(false)}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold"
                        >
                          Show {filteredProducts.length} Results
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <span className="text-[13px] text-slate-500 font-medium">
                  Showing <strong className="text-slate-900 font-extrabold">{filteredProducts.length}</strong>{' '}
                  product{filteredProducts.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 min-w-[160px] text-xs font-semibold border-slate-200 bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    className={`w-9 h-9 flex items-center justify-center transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className={`w-9 h-9 flex items-center justify-center transition-colors ${
                      viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {hasActiveChips && (
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {(priceRange[0] > filterOptions.priceRange.min || priceRange[1] < filterOptions.priceRange.max) && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    ₹{priceRange[0].toLocaleString('en-IN')}–₹{priceRange[1].toLocaleString('en-IN')}
                    <button
                      className="w-3.5 h-3.5 rounded-full bg-blue-200 hover:bg-blue-600 hover:text-white text-blue-700 flex items-center justify-center text-[10px] font-black transition-colors"
                      onClick={() => setPriceRange([filterOptions.priceRange.min, filterOptions.priceRange.max])}
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedBrands.map(b => (
                  <span key={b} className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    {b}
                    <button
                      className="w-3.5 h-3.5 rounded-full bg-blue-200 hover:bg-blue-600 hover:text-white text-blue-700 flex items-center justify-center text-[10px] font-black transition-colors"
                      onClick={() => setSelectedBrands(selectedBrands.filter(x => x !== b))}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {selectedConditions.map(c => (
                  <span key={c} className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    {c}
                    <button
                      className="w-3.5 h-3.5 rounded-full bg-blue-200 hover:bg-blue-600 hover:text-white text-blue-700 flex items-center justify-center text-[10px] font-black transition-colors"
                      onClick={() => setSelectedConditions(selectedConditions.filter(x => x !== c))}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-600 px-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl py-16 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">No products found</h3>
                <p className="text-[13px] text-slate-400 mb-5">
                  Try adjusting your filters or explore other categories.
                </p>
                <Button
                  onClick={clearAllFilters}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold gap-1.5"
                >
                  <X className="h-3.5 w-3.5" /> Clear filters
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} variant="list" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}