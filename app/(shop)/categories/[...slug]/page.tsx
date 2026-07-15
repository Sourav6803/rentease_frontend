

// src/app/categories/[...slug]/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { motion } from 'framer-motion'
import { 
  Home, 
  ChevronRight, 
  Grid3X3, 
  List, 
  Filter, 
  SlidersHorizontal,
  Star,
  Truck,
  RotateCcw,
  Shield
} from 'lucide-react'

import { ProductCard } from '@/components/home/ProductCard'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Types
interface Category {
  _id: string
  name: string
  slug: string
  level: number
  description?: string
  productCount: number
  image?: { url: string }
  parent?: Category
  children?: Category[]
}

interface Product {
  _id: string
  basicInfo: { name: string; slug: string; brand?: string }
  pricing: { monthlyRent: number; securityDeposit: number; originalPrice?: number }
  media?: { images?: Array<{ url: string; isPrimary: boolean }> }
  ratings?: { average: number; count: number }
  condition?: string
  isFeatured?: boolean
}

interface FilterOptions {
  brands: string[]
  priceRange: { min: number; max: number }
  conditions: string[]
  ratings: number[]
}

export default function NestedCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const slugPath = params.slug as string[] || []
  const currentSlug = slugPath[slugPath.length - 1]
  
  const [category, setCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [siblingCategories, setSiblingCategories] = useState<Category[]>([])
  const [breadcrumbs, setBreadcrumbs] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    brands: [],
    priceRange: { min: 0, max: 100000 },
    conditions: ['New', 'Like New', 'Good', 'Fair'],
    ratings: [4, 3, 2, 1]
  })
  const [showFilters, setShowFilters] = useState(false)

  // Fetch category data based on slug path
  const fetchCategoryData = useCallback(async () => {
    if (!slugPath.length) return

    setLoading(true)
    try {
      // Get the full category path
      const categoryRes = await axios.get(`${BASE_URL}/api/v1/categories/path`, {
        params: { slugs: slugPath.join('/') }
      })
      
      if (categoryRes.data.success) {
        const categoryData = categoryRes.data.data
        setCategory(categoryData.category)
        setSubcategories(categoryData.category.children || [])
        setSiblingCategories(categoryData.siblings || [])
        setBreadcrumbs(categoryData.breadcrumbs || [])
        setFilterOptions(categoryData.filterOptions || filterOptions)
        
        // Set price range from available products
        if (categoryData.priceRange) {
          setPriceRange([categoryData.priceRange.min, categoryData.priceRange.max])
        }
      }
      
      // Fetch products for this category path
      const productsRes = await axios.get(`${BASE_URL}/api/v1/products`, {
        params: {
          categoryPath: slugPath.join('/'),
          includeSubcategories: true,
          sort: sortBy,
          limit: 48
        }
      })
      
      if (productsRes.data.success) {
        setProducts(productsRes.data.data.products || [])
        setFilteredProducts(productsRes.data.data.products || [])
        
        // Extract unique brands for filter
        const brands = [...new Set(productsRes.data.data.products.map((p: Product) => p.basicInfo.brand).filter(Boolean))]
        setFilterOptions((prev:any) => ({ ...prev, brands }))
      }
    } catch (error) {
      console.error('Failed to load category page:', error)
    } finally {
      setLoading(false)
    }
  }, [slugPath, sortBy])

  useEffect(() => {
    fetchCategoryData()
  }, [fetchCategoryData])

  // Apply filters
  useEffect(() => {
    let filtered = [...products]
    
    // Apply brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => p.basicInfo.brand && selectedBrands.includes(p.basicInfo.brand))
    }
    
    // Apply price filter
    filtered = filtered.filter(p => 
      p.pricing.monthlyRent >= priceRange[0] && p.pricing.monthlyRent <= priceRange[1]
    )
    
    // Apply condition filter
    if (selectedConditions.length > 0) {
      filtered = filtered.filter(p => p.condition && selectedConditions.includes(p.condition))
    }
    
    // Apply rating filter
    if (selectedRatings.length > 0) {
      const minRating = Math.min(...selectedRatings)
      filtered = filtered.filter(p => (p.ratings?.average || 0) >= minRating)
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.pricing.monthlyRent - b.pricing.monthlyRent)
        break
      case 'price_desc':
        filtered.sort((a, b) => b.pricing.monthlyRent - a.pricing.monthlyRent)
        break
      case 'rating':
        filtered.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0))
        break
      case 'popularity':
        filtered.sort((a, b) => (b.ratings?.count || 0) - (a.ratings?.count || 0))
        break
      default:
        // newest first
        break
    }
    
    setFilteredProducts(filtered)
  }, [products, selectedBrands, priceRange, selectedConditions, selectedRatings, sortBy])

  const handleSubcategoryClick = (subcategorySlug: string) => {
    router.push(`/categories/${slugPath.join('/')}/${subcategorySlug}`)
  }

  const handleSiblingClick = (siblingSlug: string) => {
    const newPath = [...slugPath.slice(0, -1), siblingSlug]
    router.push(`/categories/${newPath.join('/')}`)
  }

  const getBreadcrumbHref = (index: number) => {
    const partialPath = breadcrumbs.slice(0, index + 1).map((crumb) => crumb.slug).join('/')
    return `/categories/${partialPath}`
  }

  const clearAllFilters = () => {
    setSelectedBrands([])
    setPriceRange([filterOptions.priceRange.min, filterOptions.priceRange.max])
    setSelectedConditions([])
    setSelectedRatings([])
  }

  if (loading) {
    return <CategoryPageSkeleton />
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Category Not Found</h1>
          <p className="text-muted-foreground mb-4">The category you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  const isLeafCategory = subcategories.length === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
          </BreadcrumbItem>
          
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb._id} className="flex items-center">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={getBreadcrumbHref(index)}
                  className={index === breadcrumbs.length - 1 ? 'font-semibold text-primary' : ''}
                >
                  {crumb.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </div>
          ))}
        </Breadcrumb>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-muted-foreground max-w-3xl">{category.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <Badge variant="secondary" className="text-sm">
              {category.productCount || products.length} Products
            </Badge>
            {isLeafCategory && (
              <Badge variant="outline" className="text-sm border-green-500 text-green-600">
                Leaf Category
              </Badge>
            )}
          </div>
        </div>

        {/* Sibling Categories Navigation (Horizontal Scroll) */}
        {siblingCategories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Related Categories</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {siblingCategories.map((sibling) => (
                <button
                  key={sibling._id}
                  onClick={() => handleSiblingClick(sibling.slug)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium border ${
                    sibling.slug === currentSlug
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white border-gray-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {sibling.name}
                  {sibling.productCount > 0 && (
                    <span className="ml-1 text-xs">({sibling.productCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subcategories Grid */}
        {subcategories.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Shop by Subcategory</h2>
              <span className="text-sm text-muted-foreground">{subcategories.length} categories</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {subcategories.map((subcat, idx) => (
                <motion.button
                  key={subcat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleSubcategoryClick(subcat.slug)}
                  className="group relative rounded-xl border bg-white p-4 text-left transition-all hover:shadow-lg hover:border-primary overflow-hidden"
                >
                  {subcat.image?.url && (
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-10 group-hover:opacity-20 transition-opacity">
                      <img src={subcat.image.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {subcat.name}
                      </h3>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {subcat.description || `Browse ${subcat.name} products`}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{subcat.productCount || 0} products</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Products Section */}
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                {(selectedBrands.length > 0 || selectedConditions.length > 0 || selectedRatings.length > 0) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <Separator />
              
              {/* Price Range Filter */}
              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    step={500}
                    className="mb-4"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Brand Filter */}
              {filterOptions.brands.length > 0 && (
                <>
                  <div>
                    <h4 className="font-medium mb-3">Brand</h4>
                    <div className="space-y-2">
                      {filterOptions.brands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={selectedBrands.includes(brand)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedBrands([...selectedBrands, brand])
                              } else {
                                setSelectedBrands(selectedBrands.filter(b => b !== brand))
                              }
                            }}
                          />
                          <span className="text-sm">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}
              
              {/* Condition Filter */}
              <div>
                <h4 className="font-medium mb-3">Condition</h4>
                <div className="space-y-2">
                  {filterOptions.conditions.map((condition) => (
                    <label key={condition} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedConditions.includes(condition)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedConditions([...selectedConditions, condition])
                          } else {
                            setSelectedConditions(selectedConditions.filter(c => c !== condition))
                          }
                        }}
                      />
                      <span className="text-sm">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Rating Filter */}
              <div>
                <h4 className="font-medium mb-3">Customer Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedRatings.includes(rating)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRatings([...selectedRatings, rating])
                          } else {
                            setSelectedRatings(selectedRatings.filter(r => r !== rating))
                          }
                        }}
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-sm ml-1">& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Main Content */}
          <div className="flex-1">
            {/* Sorting and View Options */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} products in {category.name}
              </p>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-6">
                      {/* Mobile filters content - same as desktop sidebar */}
                      <div>
                        <h4 className="font-medium mb-3">Price Range</h4>
                        <Slider
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                          min={filterOptions.priceRange.min}
                          max={filterOptions.priceRange.max}
                          step={500}
                        />
                      </div>
                      {/* Add other filters... */}
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex rounded-lg border overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${
                      viewMode === 'grid'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white hover:bg-muted'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${
                      viewMode === 'list'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white hover:bg-muted'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedBrands.length > 0 || selectedConditions.length > 0 || selectedRatings.length > 0 || priceRange[0] > filterOptions.priceRange.min || priceRange[1] < filterOptions.priceRange.max) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {priceRange[0] > filterOptions.priceRange.min && (
                  <Badge variant="secondary" className="gap-1">
                    ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                    <button onClick={() => setPriceRange([filterOptions.priceRange.min, filterOptions.priceRange.max])}>×</button>
                  </Badge>
                )}
                {selectedBrands.map(brand => (
                  <Badge key={brand} variant="secondary" className="gap-1">
                    Brand: {brand}
                    <button onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))}>×</button>
                  </Badge>
                ))}
                {selectedConditions.map(condition => (
                  <Badge key={condition} variant="secondary" className="gap-1">
                    Condition: {condition}
                    <button onClick={() => setSelectedConditions(selectedConditions.filter(c => c !== condition))}>×</button>
                  </Badge>
                ))}
                {selectedRatings.map(rating => (
                  <Badge key={rating} variant="secondary" className="gap-1">
                    {rating}★ & up
                    <button onClick={() => setSelectedRatings(selectedRatings.filter(r => r !== rating))}>×</button>
                  </Badge>
                ))}
                <button onClick={clearAllFilters} className="text-sm text-primary hover:underline">Clear All</button>
              </div>
            )}

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border bg-white py-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or browse other categories
                </p>
                <Button onClick={clearAllFilters} variant="outline">Clear all filters</Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 1) }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
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

// Skeleton Loader
function CategoryPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <Skeleton className="h-4 w-24" />
      </div>
      
      <Skeleton className="h-10 w-80 mb-3" />
      <Skeleton className="h-4 w-full max-w-2xl mb-8" />
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      
      <div className="flex gap-6">
        <Skeleton className="hidden lg:block w-72 h-96 rounded-xl" />
        <div className="flex-1">
          <div className="flex justify-between mb-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
