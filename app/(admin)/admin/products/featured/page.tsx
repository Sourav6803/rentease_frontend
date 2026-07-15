// src/app/admin/products/featured/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Star,
  StarOff,
  Package,
  Search,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import axios from 'axios'
import Link from 'next/link'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

interface FeaturedProduct {
  _id: string
  basicInfo: { name: string; slug: string; brand?: string }
  pricing: { monthlyRent: number }
  media?: { images?: Array<{ url: string; thumbnail: string; isPrimary: boolean }> }
  ratings?: { average: number; count: number }
  inventory: { availableQuantity: number }
  status: { isFeatured: boolean }
  featuredAt?: string
}

export default function AdminFeaturedProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<FeaturedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
    if (status === 'authenticated') {
      fetchFeaturedProducts()
    }
  }, [status, currentPage, searchQuery])

  const fetchFeaturedProducts = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/products/featured`, {
        params: {
          page: currentPage,
          limit: 20,
          search: searchQuery || undefined
        },
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        setProducts(response.data.data.products)
        setTotalPages(response.data.data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Error fetching featured products:', error)
      toast.error('Failed to load featured products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFeatured = async (productId: string, currentStatus: boolean) => {
    setIsProcessing(true)
    try {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/products/admin/${productId}/feature`,
        { isFeatured: !currentStatus },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      )
      if (response.data.success) {
        toast.success(`Product ${!currentStatus ? 'featured' : 'unfeatured'} successfully`)
        fetchFeaturedProducts()
      }
    } catch (error: any) {
      console.error('Error toggling featured:', error)
      toast.error(error.response?.data?.message || 'Failed to update featured status')
    } finally {
      setIsProcessing(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Featured Products</h1>
                <p className="text-muted-foreground mt-1">
                  Manage products featured on the homepage
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" onClick={fetchFeaturedProducts} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">About Featured Products</p>
                <p className="text-sm text-blue-700 mt-1">
                  Featured products appear on the homepage and get prioritized in search results.
                  Choose products that are high-quality, in-demand, and represent your brand well.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, idx) => {
            const primaryImage = product.media?.images?.find(img => img.isPrimary)?.thumbnail || product.media?.images?.[0]?.thumbnail
            
            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`overflow-hidden hover:shadow-lg transition-all ${product.status.isFeatured ? 'ring-2 ring-yellow-400' : ''}`}>
                  <div className="relative h-48 bg-muted">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={product.basicInfo.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {product.status.isFeatured && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500 text-white gap-1">
                        <Star className="h-3 w-3 fill-white" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg line-clamp-1">{product.basicInfo.name}</h3>
                        {product.basicInfo.brand && (
                          <p className="text-sm text-muted-foreground">{product.basicInfo.brand}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-bold text-primary">₹{product.pricing.monthlyRent.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">/month</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium ml-1">{product.ratings?.average?.toFixed(1) || '0'}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">({product.ratings?.count || 0} reviews)</span>
                      </div>
                      <StockBadge quantity={product.inventory.availableQuantity} />
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.status.isFeatured}
                          onCheckedChange={() => handleToggleFeatured(product._id, product.status.isFeatured)}
                          disabled={isProcessing}
                        />
                        <Label className="text-sm cursor-pointer">
                          {product.status.isFeatured ? 'Featured' : 'Set as Featured'}
                        </Label>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/products/${product._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No featured products</h3>
            <p className="text-muted-foreground">Toggle the switch above to feature products</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1.5 text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Stock Badge Component
function StockBadge({ quantity }: { quantity: number }) {
  if (quantity === 0) {
    return <Badge variant="outline" className="bg-red-100 text-red-700">Out of Stock</Badge>
  }
  if (quantity < 5) {
    return <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Low Stock ({quantity})</Badge>
  }
  return <Badge variant="outline" className="bg-green-100 text-green-700">In Stock ({quantity})</Badge>
}