// app/admin/categories/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Edit3, ExternalLink, Copy, Trash2,
  Package, TrendingUp, BarChart3, Layers, Tag,
  Eye, EyeOff, Star, ChevronRight, Clock, User,
  Calendar, Hash, Globe, Image as ImageIcon,
  AlertTriangle, CheckCircle, Info, Zap,
  Search, Filter, MoreVertical, Plus,
  ChevronDown, ChevronUp, Loader2, RefreshCw,
  Smartphone, ShoppingBag, ArrowUpRight,
  FileText, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'
import { useSession } from 'next-auth/react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface CategoryDetail {
  _id: string
  name: string
  slug: string
  description: string
  parent: {
    _id: string
    name: string
    slug: string
  } | null
  level: number
  icon: string
  image: {
    url: string
    thumbnail: string
  }
  displayOrder: number
  isActive: boolean
  isFeatured: boolean
  meta: {
    title: string
    description: string
    keywords: string[]
  }
  attributes: Array<{
    _id?: string
    name: string
    type: string
    required: boolean
    filterable: boolean
    options: string[]
    unit: string
  }>
  productCount: number
  children: Array<{
    _id: string
    name: string
    slug: string
    productCount: number
    isActive: boolean
    icon: string
  }>
  ancestors: Array<{
    _id: string
    name: string
    slug: string
    level: number
  }>
  breadcrumbs: Array<{
    _id: string
    name: string
    slug: string
  }>
  createdAt: string
  updatedAt: string
  metadata: {
    createdBy?: string
    updatedBy?: string
    aiGenerated?: boolean
    generatedAt?: string
  }
}

interface CategoryStats {
  totalProducts: number
  rentedProducts: number
  rentRate: number | string
  level: number
  isLeaf: boolean
}

interface CategoryTrend {
  date: string
  views: number
  rentals: number
  revenue: number
}

interface CategoryRecommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  action: string
}

// ─── Constants ───────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const levelConfig = {
  0: { label: 'L1', name: 'Parent Category', color: '#2874F0', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  1: { label: 'L2', name: 'Subcategory', color: '#FF6161', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  2: { label: 'L3', name: 'Sub-subcategory', color: '#FF9F00', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  3: { label: 'L4', name: 'Leaf Category', color: '#26A541', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

// Breadcrumb Component
function Breadcrumb({ ancestors, currentName }: { ancestors: CategoryDetail['ancestors']; currentName: string }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs">
      <button className="text-blue-600 font-medium hover:underline transition-all">
        Dashboard
      </button>
      <ChevronRight className="h-3 w-3 text-gray-400" />
      <button className="text-blue-600 font-medium hover:underline transition-all">
        Categories
      </button>
      {ancestors?.map((ancestor, index) => (
        <span key={ancestor._id} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <button className="text-blue-600 font-medium hover:underline transition-all">
            {ancestor.name}
          </button>
        </span>
      ))}
      <ChevronRight className="h-3 w-3 text-gray-400" />
      <span className="font-semibold text-gray-900 truncate max-w-[200px]">
        {currentName}
      </span>
    </nav>
  )
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  color, 
  bgColor,
  trend 
}: { 
  icon: any
  label: string
  value: string | number
  subValue?: string
  color: string
  bgColor: string
  trend?: { value: number; isPositive: boolean }
}) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 border-gray-100">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          {trend && (
            <span className={`flex items-center gap-1 text-xs font-semibold ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <ArrowUpRight className={`h-3 w-3 ${!trend.isPositive && 'rotate-180'}`} />
              {trend.value}%
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subValue && (
            <p className="text-xs text-gray-400 mt-1">{subValue}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Attribute Badge Component
function AttributeBadge({ attribute }: { attribute: CategoryDetail['attributes'][0] }) {
  const typeColors: Record<string, string> = {
    select: 'bg-purple-50 text-purple-700 border-purple-200',
    multiselect: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    text: 'bg-blue-50 text-blue-700 border-blue-200',
    number: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    boolean: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }

  return (
    <div className={`px-4 py-3 rounded-lg border ${typeColors[attribute.type] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{attribute.name}</span>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {attribute.type}
          </Badge>
          {attribute.required && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-red-600 border-red-200 bg-red-50">
              Required
            </Badge>
          )}
          {attribute.filterable && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-blue-600 border-blue-200 bg-blue-50">
              Filterable
            </Badge>
          )}
        </div>
      </div>
      {attribute.options && attribute.options.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {attribute.options.map((option, idx) => (
            <span key={idx} className="px-2 py-0.5 text-[11px] rounded-md bg-white border border-gray-200 text-gray-600">
              {option}
            </span>
          ))}
        </div>
      )}
      {attribute.unit && (
        <p className="text-[11px] text-gray-400 mt-2">Unit: {attribute.unit}</p>
      )}
    </div>
  )
}

// Subcategory Card Component
function SubcategoryCard({ subcategory, onView }: { 
  subcategory: CategoryDetail['children'][0]
  onView: (id: string) => void 
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl border border-gray-100">
          {subcategory.icon || '📁'}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{subcategory.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{subcategory.slug}</span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Package className="h-3 w-3" />
              {subcategory.productCount || 0} products
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={subcategory.isActive ? 'default' : 'secondary'} className="text-[10px]">
          {subcategory.isActive ? 'Active' : 'Inactive'}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(subcategory._id)}
          className="text-gray-400 hover:text-gray-600"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// SEO Preview Component
function SEOPreview({ title, description, slug }: { title: string; description: string; slug: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Google Search Preview
      </p>
      <p className="text-base text-[#1A0DAB] font-normal leading-tight mb-1 font-arial">
        {title || 'Category Title'}
      </p>
      <p className="text-[13px] text-[#006621] leading-tight mb-1 font-arial">
        https://yourstore.com/category/{slug || 'category'}
      </p>
      <p className="text-sm text-[#545454] leading-relaxed font-arial">
        {description || 'Add a meta description to preview how your category will appear in search results.'}
      </p>
    </div>
  )
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function CategoryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string
  const toast = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState<CategoryDetail | null>(null)
  const [stats, setStats] = useState<CategoryStats | null>(null)
  const [trends, setTrends] = useState<CategoryTrend[]>([])
  const [recommendations, setRecommendations] = useState<CategoryRecommendation[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken

  const levelInfo = category ? levelConfig[category.level as keyof typeof levelConfig] || levelConfig[0] : levelConfig[0]

  // ─── Data Fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCategoryData()
    fetchCategoryStats()
    fetchCategoryTrends()
    fetchRecommendations()
  }, [categoryId])

  const fetchCategoryData = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${BASE_URL}/api/v1/categories/admin/${categoryId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })

      if (response.data.success) {
        const data = response.data.data.category || response.data.data
        setCategory(data)
      }
    } catch (error: any) {
      toast.error('Failed to load category', {
        description: error.response?.data?.message || 'Category not found'
      })
      router.push('/admin/categories')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategoryStats = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/ai-category/track/${categoryId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchCategoryTrends = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/ai-category/trends/${categoryId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (response.data.success) {
        setTrends(response.data.data?.trends || [])
      }
    } catch (error) {
      console.error('Failed to fetch trends:', error)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/ai-category/recommendations/${categoryId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (response.data.success) {
        setRecommendations(response.data.data?.recommendations || [])
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    }
  }

  // ─── Actions ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await axios.delete(`${BASE_URL}/api/v1/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (response.data.success) {
        toast.success('Category deleted successfully')
        router.push('/admin/categories')
        router.refresh()
      }
    } catch (error: any) {
      toast.error('Failed to delete', {
        description: error.response?.data?.message || 'Cannot delete this category'
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  // ─── Loading State ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading category details...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
          <p className="mt-4 text-base font-semibold text-gray-900">Category Not Found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/admin/categories')}
          >
            Back to Categories
          </Button>
        </div>
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F1F3F6]">
      {/* ── Header ───────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/admin/categories')}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-2xl border border-gray-100">
                  {category.icon || '📁'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-900">{category.name}</h1>
                    <Badge className={levelInfo.bg + ' ' + levelInfo.text + ' border ' + levelInfo.border}>
                      {levelInfo.label}
                    </Badge>
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {category.isFeatured && (
                      <Badge className="bg-amber-50 text-amber-600 border border-amber-200">
                        <Star className="h-3 w-3 mr-1 fill-amber-500" /> Featured
                      </Badge>
                    )}
                    {category.metadata?.aiGenerated && (
                      <Badge className="bg-purple-50 text-purple-600 border border-purple-200">
                        <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">/{category.slug}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/category/${category.slug}`, '_blank')}
                      className="text-gray-600"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Store
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview on storefront</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(category.slug)}
                className="text-gray-600"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Slug
              </Button>

              <Button
                onClick={() => router.push(`/admin/categories/${categoryId}/edit`)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Category
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/admin/categories/${categoryId}/edit`)}>
                    <Edit3 className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/admin/categories/new?parent=${categoryId}`)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Subcategory
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ─────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <Breadcrumb ancestors={category.ancestors || []} currentName={category.name} />
      </div>

      {/* ── Main Content ───────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 pb-10">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats?.totalProducts || category.productCount || 0}
            subValue="In this category"
            color="#2874F0"
            bgColor="bg-blue-50"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            icon={TrendingUp}
            label="Currently Rented"
            value={stats?.rentedProducts || 0}
            subValue="Active rentals"
            color="#26A541"
            bgColor="bg-green-50"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            icon={BarChart3}
            label="Rent Rate"
            value={`${stats?.rentRate || 0}%`}
            subValue="Conversion rate"
            color="#FF9F00"
            bgColor="bg-amber-50"
            trend={{ value: 3, isPositive: false }}
          />
          <StatCard
            icon={Layers}
            label="Subcategories"
            value={category.children?.length || 0}
            subValue={`${levelInfo.label} - ${levelInfo.name}`}
            color="#9C27B0"
            bgColor="bg-purple-50"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="attributes" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              Attributes
            </TabsTrigger>
            <TabsTrigger value="children" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              Subcategories ({category.children?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              SEO & Meta
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              Insights
            </TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ──────────────────────────── */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Category Info */}
              <Card className="lg:col-span-2 border-gray-100">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Category Information</CardTitle>
                  <CardDescription>Basic details and metadata</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Description */}
                  {category.description && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{category.description}</p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Display Order</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{category.displayOrder || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Level</p>
                      <Badge className={`mt-1 ${levelInfo.bg} ${levelInfo.text} border ${levelInfo.border}`}>
                        {levelInfo.label} - {levelInfo.name}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {category.isActive ? (
                          <Badge className="bg-green-50 text-green-600 border border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" /> Inactive
                          </Badge>
                        )}
                        {category.isFeatured && (
                          <Badge className="bg-amber-50 text-amber-600 border border-amber-200">
                            <Star className="h-3 w-3 mr-1 fill-amber-500" /> Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Product Count</p>
                      <p className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-1">
                        <Package className="h-4 w-4 text-blue-600" />
                        {category.productCount || 0}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Category Path */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Category Path</h4>
                    <div className="flex items-center gap-1 flex-wrap">
                      {category.breadcrumbs?.map((crumb, idx) => (
                        <span key={crumb._id} className="flex items-center gap-1">
                          <span className="text-sm text-blue-600 font-medium">{crumb.name}</span>
                          {idx < (category.breadcrumbs?.length || 0) - 1 && (
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Created
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        {new Date(category.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Last Updated
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        {new Date(category.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Image */}
                <Card className="border-gray-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold">Category Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {category.image?.url ? (
                      <div className="relative group rounded-lg overflow-hidden">
                        <img
                          src={category.image.url}
                          alt={category.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => router.push(`/admin/categories/${categoryId}/edit`)}
                          >
                            <Edit3 className="h-3 w-3 mr-1" /> Change
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 text-gray-300 mx-auto" />
                          <p className="text-xs text-gray-400 mt-2">No image uploaded</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Info */}
                <Card className="border-gray-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold">Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">ID</span>
                      <span className="text-gray-900 font-mono text-xs">{category._id?.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Slug</span>
                      <button 
                        onClick={() => copyToClipboard(category.slug)}
                        className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                      >
                        {category.slug}
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Icon</span>
                      <span className="text-xl">{category.icon || '📁'}</span>
                    </div>
                    {category.parent && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Parent</span>
                        <span className="text-blue-600 font-medium">{category.parent.name}</span>
                      </div>
                    )}
                    <Separator />
                    {stats?.isLeaf ? (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs font-semibold text-amber-800">🍃 Leaf Category</p>
                        <p className="text-[11px] text-amber-700 mt-1">Products are directly assigned here</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-800">📁 Parent Category</p>
                        <p className="text-[11px] text-blue-700 mt-1">Can have subcategories</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-gray-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm"
                      onClick={() => router.push(`/admin/categories/${categoryId}/edit`)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" /> Edit Category
                    </Button>
                    {!stats?.isLeaf && (
                      <Button
                        variant="outline"
                        className="w-full justify-start text-sm"
                        onClick={() => router.push(`/admin/categories/new?parent=${categoryId}`)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Subcategory
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full justify-start text-sm"
                      onClick={() => window.open(`/category/${category.slug}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" /> View on Store
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── Attributes Tab ─────────────────────────── */}
          <TabsContent value="attributes">
            <Card className="border-gray-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">Category Attributes</CardTitle>
                    <CardDescription>
                      Filterable specifications for products ({category.attributes?.length || 0} total)
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push(`/admin/categories/${categoryId}/edit`)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" /> Manage Attributes
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {category.attributes && category.attributes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.attributes.map((attr, idx) => (
                      <AttributeBadge key={attr._id || idx} attribute={attr} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Tag className="h-10 w-10 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500 mt-3 font-medium">No attributes defined</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {category.level === 0 
                        ? 'Parent categories cannot have attributes' 
                        : category.level >= 3 
                          ? 'Leaf categories use parent attributes' 
                          : 'Add attributes to help customers filter products'}
                    </p>
                    {(category.level === 1 || category.level === 2) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => router.push(`/admin/categories/${categoryId}/edit`)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Attributes
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Subcategories Tab ──────────────────────── */}
          <TabsContent value="children">
            <Card className="border-gray-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">Subcategories</CardTitle>
                    <CardDescription>
                      {category.children?.length || 0} direct subcategories
                    </CardDescription>
                  </div>
                  {!stats?.isLeaf && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push(`/admin/categories/new?parent=${categoryId}`)}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Subcategory
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {category.children && category.children.length > 0 ? (
                  <div className="space-y-2">
                    {category.children.map((child) => (
                      <SubcategoryCard
                        key={child._id}
                        subcategory={child}
                        onView={(id) => router.push(`/admin/categories/${id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Layers className="h-10 w-10 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-500 mt-3 font-medium">No subcategories</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {stats?.isLeaf 
                        ? 'This is a leaf category and cannot have subcategories' 
                        : 'Add subcategories to organize your products'}
                    </p>
                    {!stats?.isLeaf && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => router.push(`/admin/categories/new?parent=${categoryId}`)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Subcategory
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SEO Tab ────────────────────────────────── */}
          <TabsContent value="seo">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-gray-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold">SEO Metadata</CardTitle>
                      <CardDescription>Search engine optimization settings</CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/categories/${categoryId}/edit`)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Meta Title</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {category.meta?.title || 'Not set'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {(category.meta?.title?.length || 0)}/60 characters
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Meta Description</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {category.meta?.description || 'Not set'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {(category.meta?.description?.length || 0)}/160 characters
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Meta Keywords</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {category.meta?.keywords && category.meta.keywords.length > 0 ? (
                        category.meta.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[11px]">
                            {keyword}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">No keywords set</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-100">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Search Preview</CardTitle>
                  <CardDescription>How it appears on Google</CardDescription>
                </CardHeader>
                <CardContent>
                  <SEOPreview
                    title={category.meta?.title || category.name}
                    description={category.meta?.description || category.description || ''}
                    slug={category.slug}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Insights Tab ───────────────────────────── */}
          <TabsContent value="recommendations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-gray-100">
                <CardHeader>
                  <CardTitle className="text-base font-bold">AI Recommendations</CardTitle>
                  <CardDescription>Smart suggestions to improve this category</CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              rec.priority === 'high' ? 'bg-red-500' :
                              rec.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-gray-900">{rec.title}</p>
                                <Badge variant="outline" className={`text-[10px] ${
                                  rec.priority === 'high' ? 'text-red-600 border-red-200' :
                                  rec.priority === 'medium' ? 'text-amber-600 border-amber-200' :
                                  'text-blue-600 border-blue-200'
                                }`}>
                                  {rec.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600">{rec.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Zap className="h-10 w-10 text-gray-300 mx-auto" />
                      <p className="text-sm text-gray-500 mt-3 font-medium">No recommendations yet</p>
                      <p className="text-xs text-gray-400 mt-1">Check back later for AI-powered insights</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-gray-100">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Performance Tips</CardTitle>
                  <CardDescription>Optimize your category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      icon: ImageIcon,
                      title: 'Add a category image',
                      description: 'Categories with images get 40% more clicks',
                      done: !!category.image?.url
                    },
                    {
                      icon: FileText,
                      title: 'Complete meta description',
                      description: 'Improve SEO ranking with a compelling description',
                      done: !!category.meta?.description
                    },
                    {
                      icon: Tag,
                      title: 'Add filter attributes',
                      description: 'Help customers find products faster',
                      done: category.attributes && category.attributes.length > 0
                    },
                    {
                      icon: Layers,
                      title: 'Organize subcategories',
                      description: 'Well-organized categories improve navigation',
                      done: category.children && category.children.length > 0
                    }
                  ].map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        tip.done ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        <tip.icon className={`h-4 w-4 ${tip.done ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{tip.title}</p>
                          {tip.done && (
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Delete Confirmation Dialog ─────────────────── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-bold">Delete Category?</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-600">
              Are you sure you want to delete <strong className="text-gray-900">"{category.name}"</strong>? 
              This action cannot be undone and may affect subcategories and products.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</>
              ) : (
                <><Trash2 className="h-4 w-4 mr-2" /> Delete Category</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}