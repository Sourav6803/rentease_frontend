'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Home, ChevronRight, Search as SearchIcon, SlidersHorizontal, X,
  ChevronDown, ChevronUp, Check, Grid3X3, List, Star,
} from 'lucide-react'
import axios from 'axios'

import { ProductCard } from '@/components/home/ProductCard'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ─── Types (mirrors the /products/search response) ────────────────────────────
interface Product {
  _id: string
  basicInfo: { name: string; slug: string; brand?: string }
  pricing: { monthlyRent: number; securityDeposit: number; originalPrice?: number }
  media?: { images?: Array<{ url: string; isPrimary: boolean }> }
  ratings?: { average: number; count: number }
  condition?: string
  available?: boolean
}
interface Aggregations {
  price: { min: number; max: number }
  brands: Array<{ name: string; count: number }>
  conditions: Array<{ name: string; count: number }>
  categories: Array<{ _id: string; name: string; slug: string; count: number }>
}
interface Pagination { page: number; limit: number; total: number; pages: number }

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'popularity', label: 'Popularity' },
]

const RATING_TIERS = [4, 3, 2, 1]
const PAGE_SIZE = 24

// ─── Collapsible filter section ───────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
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

// ─── Filters (shared desktop rail + mobile sheet) ─────────────────────────────
interface FilterState {
  brands: string[]
  conditions: string[]
  price: [number, number]
  rating: number
}
function FiltersContent({
  agg, bounds, filters, setFilters, clearAll, activeCount,
}: {
  agg: Aggregations | null
  bounds: [number, number]
  filters: FilterState
  setFilters: (f: FilterState) => void
  clearAll: () => void
  activeCount: number
}) {
  const toggle = (key: 'brands' | 'conditions', v: string) => {
    const list = filters[key]
    setFilters({ ...filters, [key]: list.includes(v) ? list.filter(x => x !== v) : [...list, v] })
  }

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

      {/* Price */}
      <FilterSection title="Price / Month">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1">
            ₹{filters.price[0].toLocaleString('en-IN')}
          </span>
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1">
            ₹{filters.price[1].toLocaleString('en-IN')}
          </span>
        </div>
        <div className="px-1 pb-2">
          <Slider
            value={filters.price}
            onValueChange={v => setFilters({ ...filters, price: v as [number, number] })}
            min={bounds[0]}
            max={bounds[1]}
            step={500}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
          <span>₹{bounds[0].toLocaleString('en-IN')}</span>
          <span>₹{bounds[1].toLocaleString('en-IN')}</span>
        </div>
      </FilterSection>

      {/* Customer rating */}
      <FilterSection title="Customer Rating">
        <div className="flex flex-col gap-0.5">
          {RATING_TIERS.map(r => (
            <label
              key={r}
              className="flex items-center gap-2.5 py-1.5 px-1 rounded-md hover:bg-slate-50 cursor-pointer"
              onClick={() => setFilters({ ...filters, rating: filters.rating === r ? 0 : r })}
            >
              <span className={`h-4 w-4 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                filters.rating === r ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
              }`}>
                {filters.rating === r && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-slate-600">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {r} & above
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brands (server aggregation) */}
      {agg && agg.brands.length > 0 && (
        <FilterSection title="Brand">
          <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto pr-1">
            {agg.brands.map(b => (
              <label
                key={b.name}
                className="flex items-center gap-2.5 py-1.5 px-1 rounded-md hover:bg-slate-50 cursor-pointer"
                onClick={() => toggle('brands', b.name)}
              >
                <span className={`h-4 w-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                  filters.brands.includes(b.name) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                }`}>
                  {filters.brands.includes(b.name) && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </span>
                <span className="text-[12.5px] font-medium text-slate-600 flex-1 truncate">{b.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">{b.count}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Conditions (server aggregation) */}
      {agg && agg.conditions.length > 0 && (
        <FilterSection title="Condition">
          <div className="flex flex-col gap-0.5">
            {agg.conditions.map(c => (
              <label
                key={c.name}
                className="flex items-center gap-2.5 py-1.5 px-1 rounded-md hover:bg-slate-50 cursor-pointer"
                onClick={() => toggle('conditions', c.name)}
              >
                <span className={`h-4 w-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                  filters.conditions.includes(c.name) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                }`}>
                  {filters.conditions.includes(c.name) && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </span>
                <span className="text-[12.5px] font-medium text-slate-600 capitalize flex-1 truncate">
                  {String(c.name).replace(/-/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{c.count}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SearchSkeleton() {
  return (
    <div className="max-w-[1340px] mx-auto px-4 mt-4 flex gap-4 items-start">
      <aside className="hidden lg:block w-60 shrink-0 bg-white rounded-xl border border-slate-200 p-4">
        <Skeleton className="h-5 w-2/3 mb-5" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-9 rounded-md mb-2.5" />)}
      </aside>
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

const emptyFilters: FilterState = { brands: [], conditions: [], price: [0, 100000], rating: 0 }

// ─── Inner component (wrapped in Suspense for useSearchParams) ─────────────────
function SearchInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = (searchParams.get('q') || '').trim()

  const [products, setProducts] = useState<Product[]>([])
  const [agg, setAgg] = useState<Aggregations | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const [sort, setSort] = useState('relevance')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const [bounds, setBounds] = useState<[number, number]>([0, 100000])
  const [filters, setFilters] = useState<FilterState>(emptyFilters)
  // Committed filters actually sent to the API (price commits on release, not every drag).
  const [applied, setApplied] = useState<FilterState>(emptyFilters)

  const priceCommitRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset everything when the query term changes.
  useEffect(() => {
    setFilters(emptyFilters)
    setApplied(emptyFilters)
    setSort('relevance')
    setPage(1)
  }, [query])

  // Debounce price into `applied` (checkboxes/rating apply immediately).
  useEffect(() => {
    if (priceCommitRef.current) clearTimeout(priceCommitRef.current)
    priceCommitRef.current = setTimeout(() => {
      setApplied(prev => ({ ...prev, price: filters.price }))
      setPage(1)
    }, 500)
    return () => { if (priceCommitRef.current) clearTimeout(priceCommitRef.current) }
  }, [filters.price])

  useEffect(() => {
    setApplied(prev => ({ ...prev, brands: filters.brands, conditions: filters.conditions, rating: filters.rating }))
    setPage(1)
  }, [filters.brands, filters.conditions, filters.rating])

  const fetchResults = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const params: Record<string, any> = { page, limit: PAGE_SIZE, sort, inStock: true }
      if (query) params.q = query
      if (applied.brands.length) params.brand = applied.brands
      if (applied.conditions.length) params.condition = applied.conditions
      if (applied.rating) params.rating = applied.rating
      if (applied.price[0] > bounds[0]) params.minPrice = applied.price[0]
      if (applied.price[1] < bounds[1]) params.maxPrice = applied.price[1]

      const res = await axios.get(`${BASE_URL}/api/v1/products/search`, {
        params,
        // Serialize repeated keys as brand=a&brand=b (backend reads arrays).
        paramsSerializer: { indexes: null },
      })

      if (res.data?.success) {
        const data = res.data.data
        setProducts(data.products || [])
        setAgg(data.aggregations || null)
        setPagination(data.pagination || null)

        // Initialise the slider bounds once from the unfiltered aggregation.
        const p = data.aggregations?.price
        if (p && bounds[0] === 0 && bounds[1] === 100000 && (p.min || p.max)) {
          const nb: [number, number] = [Math.floor(p.min || 0), Math.ceil(p.max || 100000)]
          setBounds(nb)
          setFilters(prev => ({ ...prev, price: nb }))
          setApplied(prev => ({ ...prev, price: nb }))
        }
      } else {
        setProducts([]); setPagination(null)
      }
    } catch (e) {
      console.error('Search error:', e)
      setIsError(true)
      setProducts([]); setPagination(null)
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort, page, applied])

  useEffect(() => { fetchResults() }, [fetchResults])

  const clearAll = () => {
    const reset: FilterState = { ...emptyFilters, price: bounds }
    setFilters(reset)
    setApplied(reset)
    setPage(1)
  }

  const activeCount = useMemo(() =>
    applied.brands.length + applied.conditions.length +
    (applied.rating ? 1 : 0) +
    (applied.price[0] > bounds[0] || applied.price[1] < bounds[1] ? 1 : 0)
  , [applied, bounds])

  const total = pagination?.total ?? 0
  const totalPages = pagination?.pages ?? 1

  const removeChip = (kind: 'brand' | 'condition' | 'rating' | 'price', value?: string) => {
    if (kind === 'brand') setFilters(f => ({ ...f, brands: f.brands.filter(b => b !== value) }))
    else if (kind === 'condition') setFilters(f => ({ ...f, conditions: f.conditions.filter(c => c !== value) }))
    else if (kind === 'rating') setFilters(f => ({ ...f, rating: 0 }))
    else if (kind === 'price') setFilters(f => ({ ...f, price: bounds }))
  }

  const hasChips = applied.brands.length > 0 || applied.conditions.length > 0 || applied.rating > 0 ||
    applied.price[0] > bounds[0] || applied.price[1] < bounds[1]

  return (
    <div className="max-w-[1340px] mx-auto px-4 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 flex-wrap pt-4 text-xs text-slate-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-700 font-medium"><Home className="h-3 w-3" /></Link>
        <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
        <Link href="/products" className="text-slate-500 hover:text-blue-700 font-medium">Products</Link>
        <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
        <span className="text-slate-900 font-bold">Search</span>
      </nav>

      {/* Result header */}
      <div className="mt-3">
        {query ? (
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
            Results for <span className="text-blue-700">“{query}”</span>
          </h1>
        ) : (
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">Browse all products</h1>
        )}
        {!isLoading && (
          <p className="text-[13px] text-slate-500 mt-0.5">
            {total.toLocaleString('en-IN')} {total === 1 ? 'product' : 'products'} found
          </p>
        )}
      </div>

      {/* Suggested categories (from aggregation) */}
      {agg && agg.categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {agg.categories.slice(0, 8).map(c => (
            <Link
              key={c._id}
              href={`/products?category=${c.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                         bg-white border border-slate-200 text-slate-600 transition-all
                         hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 hover:-translate-y-0.5"
            >
              {c.name}
              <span className="text-[10px] text-slate-400 font-medium">({c.count})</span>
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-4 mt-4 items-start">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 shrink-0 sticky top-[76px]">
          <FiltersContent agg={agg} bounds={bounds} filters={filters} setFilters={setFilters} clearAll={clearAll} activeCount={activeCount} />
        </aside>

        {/* Results column */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2.5 flex-wrap mb-3">
            <div className="flex items-center gap-2.5">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <button className="lg:hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                    {activeCount > 0 && (
                      <Badge className="bg-blue-600 hover:bg-blue-600 text-white h-[18px] min-w-[18px] px-1.5 rounded-full text-[10px] font-bold">
                        {activeCount}
                      </Badge>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0 overflow-y-auto">
                  <div className="px-4 pt-4">
                    <SheetTitle className="text-base font-extrabold text-slate-900">Filter Results</SheetTitle>
                  </div>
                  <div className="p-3">
                    <FiltersContent agg={agg} bounds={bounds} filters={filters} setFilters={setFilters} clearAll={clearAll} activeCount={activeCount} />
                    <div className="px-1 pt-3">
                      <Button
                        onClick={() => setShowFilters(false)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold"
                      >
                        Show {total} Results
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <span className="text-[13px] text-slate-500 font-medium hidden sm:block">
                Showing <strong className="text-slate-900 font-extrabold">{products.length}</strong> of {total.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={v => { setSort(v); setPage(1) }}>
                <SelectTrigger className="h-9 min-w-[170px] text-xs font-semibold border-slate-200 bg-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <div className="hidden sm:flex border border-slate-200 rounded-lg overflow-hidden">
                <button
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  onClick={() => setViewMode('grid')} aria-label="Grid view"
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                </button>
                <button
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  onClick={() => setViewMode('list')} aria-label="List view"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active chips */}
          {hasChips && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {(applied.price[0] > bounds[0] || applied.price[1] < bounds[1]) && (
                <Chip label={`₹${applied.price[0].toLocaleString('en-IN')}–₹${applied.price[1].toLocaleString('en-IN')}`} onClear={() => removeChip('price')} />
              )}
              {applied.rating > 0 && <Chip label={`${applied.rating}★ & above`} onClear={() => removeChip('rating')} />}
              {applied.brands.map(b => <Chip key={b} label={b} onClear={() => removeChip('brand', b)} />)}
              {applied.conditions.map(c => <Chip key={c} label={String(c).replace(/-/g, ' ')} onClear={() => removeChip('condition', c)} />)}
              <button onClick={clearAll} className="text-[11px] font-bold text-rose-500 hover:text-rose-600 px-1">Clear all</button>
            </div>
          )}

          {/* Body */}
          {isLoading ? (
            <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" style={{ animationDelay: `${i * 50}ms` }} />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              title="Something went wrong"
              subtitle="We couldn't complete your search. Please try again."
              actionLabel="Retry"
              onAction={fetchResults}
            />
          ) : products.length === 0 ? (
            <EmptyState
              title={query ? `No results for “${query}”` : 'No products found'}
              subtitle={activeCount > 0
                ? 'Try removing some filters, or search for something else.'
                : 'Check your spelling or try a more general term.'}
              actionLabel={activeCount > 0 ? 'Clear filters' : 'Browse all products'}
              onAction={activeCount > 0 ? clearAll : () => router.push('/products')}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {products.map(p => <ProductCard key={p._id} product={p} variant="list" />)}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="px-3 h-9 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let n = i + 1
                if (totalPages > 5) {
                  if (page <= 3) n = i + 1
                  else if (page >= totalPages - 2) n = totalPages - 4 + i
                  else n = page - 2 + i
                }
                return (
                  <button
                    key={n}
                    onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors ${
                      page === n ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {n}
                  </button>
                )
              })}
              <button
                disabled={page >= totalPages}
                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="px-3 h-9 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize">
      {label}
      <button
        className="w-3.5 h-3.5 rounded-full bg-blue-200 hover:bg-blue-600 hover:text-white text-blue-700 flex items-center justify-center text-[10px] font-black transition-colors"
        onClick={onClear}
      >
        ×
      </button>
    </span>
  )
}

function EmptyState({ title, subtitle, actionLabel, onAction }: {
  title: string; subtitle: string; actionLabel: string; onAction: () => void
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <SearchIcon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-[13px] text-slate-400 mb-5 max-w-sm mx-auto">{subtitle}</p>
      <Button
        onClick={onAction}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold gap-1.5"
      >
        <X className="h-3.5 w-3.5" /> {actionLabel}
      </Button>
    </div>
  )
}

// ─── Page (Suspense boundary required for useSearchParams) ────────────────────
export default function SearchPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={<SearchSkeleton />}>
        <SearchInner />
      </Suspense>
    </div>
  )
}
