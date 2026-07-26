// app/admin/categories/analytics/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, TrendingUp, TrendingDown, Package, 
  BarChart3, PieChart, Activity, DollarSign,
  Star, Eye, ShoppingCart, Users, Target,
  Zap, AlertCircle, CheckCircle, Info,
  ChevronRight, ChevronDown, ChevronUp,
  Download, Filter, Calendar, RefreshCw,
  Search, MoreVertical, ExternalLink,
  Layers, Tag, Clock, Loader2,
  ArrowUpRight, ArrowDownRight, Minus,
  Globe, Smartphone, Award, Flame,
  Building2, Store, BadgePercent,
  ThumbsUp, ThumbsDown, MessageSquare,
  Share2, Bookmark, Flag,
  ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'
import { useSession } from 'next-auth/react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface CategoryAnalytics {
  _id: string
  name: string
  slug: string
  level: number
  icon: string
  isActive: boolean
  stats: {
    totalProducts: number
    activeProducts: number
    rentedProducts: number
    totalViews: number
    uniqueVisitors: number
    conversionRate: number
    averageRentPrice: number
    totalRevenue: number
    averageRentalDuration: number
    returnRate: number
  }
  trends: {
    viewsTrend: number
    rentalsTrend: number
    revenueTrend: number
    productsTrend: number
  }
}

interface TopCategory {
  _id: string
  name: string
  slug: string
  icon: string
  level: number
  productCount: number
  rentedCount: number
  rentRate: number
  revenue: number
  trend: number
}

interface CategoryPerformance {
  categoryId: string
  categoryName: string
  slug: string
  icon: string
  metrics: {
    views: number
    rentals: number
    revenue: number
    conversion: number
    avgDuration: number
  }
  trends: {
    daily: Array<{ date: string; value: number }>
    weekly: Array<{ date: string; value: number }>
    monthly: Array<{ date: string; value: number }>
  }
}

interface CategoryInsight {
  id: string
  type: 'opportunity' | 'warning' | 'success' | 'info'
  title: string
  description: string
  metric: string
  change: number
  actionable: boolean
  action?: string
}

// ─── Constants ───────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const timeRanges = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '12m', label: 'Last 12 Months' },
  { value: 'all', label: 'All Time' },
]

const metricTypes = [
  { value: 'views', label: 'Views', icon: Eye, color: '#2874F0' },
  { value: 'rentals', label: 'Rentals', icon: ShoppingCart, color: '#26A541' },
  { value: 'revenue', label: 'Revenue', icon: DollarSign, color: '#FF9F00' },
  { value: 'conversion', label: 'Conversion', icon: Target, color: '#9C27B0' },
]

// ─── Mock Data Generator (Replace with real API data) ───────────────────────
const generateMockTrendData = (days: number, baseValue: number, volatility: number) => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    const randomFactor = 0.7 + Math.random() * 0.6
    const trend = Math.sin(i / (days / 4)) * volatility
    return {
      date: date.toISOString().split('T')[0],
      value: Math.max(0, Math.round(baseValue * randomFactor + trend))
    }
  })
}

const mockTopCategories: TopCategory[] = [
  {
    _id: '1', name: 'Smartphones', slug: 'smartphones', icon: '📱', level: 2,
    productCount: 156, rentedCount: 89, rentRate: 57.1, revenue: 245000, trend: 12.5
  },
  {
    _id: '2', name: 'Laptops', slug: 'laptops', icon: '💻', level: 2,
    productCount: 124, rentedCount: 67, rentRate: 54.0, revenue: 198000, trend: 8.3
  },
  {
    _id: '3', name: 'Sofas', slug: 'sofas', icon: '🛋️', level: 3,
    productCount: 98, rentedCount: 45, rentRate: 45.9, revenue: 156000, trend: -2.1
  },
  {
    _id: '4', name: 'Refrigerators', slug: 'refrigerators', icon: '❄️', level: 3,
    productCount: 87, rentedCount: 34, rentRate: 39.1, revenue: 125000, trend: 5.7
  },
  {
    _id: '5', name: 'Gaming Consoles', slug: 'gaming-consoles', icon: '🎮', level: 3,
    productCount: 62, rentedCount: 28, rentRate: 45.2, revenue: 89000, trend: 15.2
  },
]

const mockInsights: CategoryInsight[] = [
  {
    id: '1', type: 'opportunity', title: 'High Demand Category',
    description: 'Smartphones category shows 12.5% growth in rentals. Consider adding more premium brands.',
    metric: 'rentals', change: 12.5, actionable: true,
    action: 'Add more products to Smartphones'
  },
  {
    id: '2', type: 'warning', title: 'Declining Interest',
    description: 'Sofas category has seen a 2.1% decline in rentals over the last 30 days.',
    metric: 'rentals', change: -2.1, actionable: true,
    action: 'Review pricing strategy for Sofas'
  },
  {
    id: '3', type: 'success', title: 'Revenue Milestone',
    description: 'Electronics categories have crossed ₹5L in total revenue this quarter.',
    metric: 'revenue', change: 18.0, actionable: false
  },
  {
    id: '4', type: 'info', title: 'New Category Opportunity',
    description: '"Standing Desks" searches increased 45%. Consider adding this as a new category.',
    metric: 'views', change: 45.0, actionable: true,
    action: 'Create Standing Desks category'
  },
  {
    id: '5', type: 'opportunity', title: 'Conversion Optimization',
    description: 'Gaming Consoles have 45% rent rate but low product count. High conversion potential.',
    metric: 'conversion', change: 8.0, actionable: true,
    action: 'Expand Gaming Consoles inventory'
  },
]

// ─── Sub-Components ──────────────────────────────────────────────────────────

// Stat Card with Trend
function AnalyticsStatCard({ 
  title, value, subtitle, icon: Icon, trend, color, bgColor, format 
}: {
  title: string
  value: number | string
  subtitle?: string
  icon: any
  trend?: number
  color: string
  bgColor: string
  format?: 'currency' | 'percentage' | 'number'
}) {
  const formattedValue = format === 'currency' 
    ? `₹${Number(value).toLocaleString('en-IN')}`
    : format === 'percentage'
      ? `${value}%`
      : value

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-gray-100 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              trend > 0 ? 'text-green-700 bg-green-50' : 
              trend < 0 ? 'text-red-700 bg-red-50' : 
              'text-gray-600 bg-gray-50'
            }`}>
              {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> :
               trend < 0 ? <ArrowDownRight className="h-3 w-3" /> :
               <Minus className="h-3 w-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1.5">{formattedValue}</p>
          {subtitle && (
            <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Mini Bar Chart Component
function MiniBarChart({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((value, idx) => (
        <TooltipProvider key={idx}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex-1 rounded-sm transition-all hover:opacity-80 cursor-pointer"
                style={{
                  height: `${(value / max) * 100}%`,
                  backgroundColor: color,
                  minHeight: 2,
                  opacity: 0.7 + (idx / data.length) * 0.3
                }}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {value}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}

// Top Category Row
function TopCategoryRow({ category, rank }: { category: TopCategory; rank: number }) {
  const router = useRouter()
  
  const rankColors = {
    1: 'bg-amber-100 text-amber-700 border-amber-200',
    2: 'bg-gray-100 text-gray-600 border-gray-200',
    3: 'bg-orange-50 text-orange-600 border-orange-200',
  }

  const rankIcons = {
    1: <Award className="h-4 w-4 text-amber-500" />,
    2: <Award className="h-4 w-4 text-gray-400" />,
    3: <Award className="h-4 w-4 text-orange-400" />,
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white group">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
          rankColors[rank as keyof typeof rankColors] || 'bg-gray-50 text-gray-500 border-gray-200'
        }`}>
          {rank <= 3 ? rankIcons[rank as keyof typeof rankIcons] : rank}
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-lg border border-gray-100 flex-shrink-0">
            {category.icon || '📁'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{category.name}</p>
            <p className="text-xs text-gray-400">{category.slug}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 ml-4">
        <div className="text-center hidden sm:block">
          <p className="text-xs text-gray-500">Products</p>
          <p className="text-sm font-semibold text-gray-900">{category.productCount}</p>
        </div>
        <div className="text-center hidden sm:block">
          <p className="text-xs text-gray-500">Rented</p>
          <p className="text-sm font-semibold text-gray-900">{category.rentedCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Rate</p>
          <p className="text-sm font-bold text-blue-600">{category.rentRate}%</p>
        </div>
        <div className="text-center hidden md:block">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-sm font-semibold text-gray-900">₹{category.revenue.toLocaleString('en-IN')}</p>
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${
          category.trend > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {category.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(category.trend)}%
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/categories/${category._id}`)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Insight Card
function InsightCard({ insight }: { insight: CategoryInsight }) {
  const typeConfig = {
    opportunity: {
      icon: Zap,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      label: 'Opportunity'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      label: 'Warning'
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      badgeColor: 'bg-green-100 text-green-700 border-green-200',
      label: 'Success'
    },
    info: {
      icon: Info,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      label: 'Info'
    },
  }

  const config = typeConfig[insight.type]
  const Icon = config.icon

  return (
    <div className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor} transition-all hover:shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
          <Icon className={`h-4 w-4 ${config.textColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`text-[10px] ${config.badgeColor}`}>
              {config.label}
            </Badge>
            {insight.change !== 0 && (
              <span className={`text-xs font-semibold ${
                insight.change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {insight.change > 0 ? '+' : ''}{insight.change}%
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
          <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
          {insight.actionable && insight.action && (
            <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-2 text-blue-600">
              {insight.action} →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Trend Chart (Simple SVG-based)
function TrendChart({ data, color, height = 200 }: { data: Array<{ date: string; value: number }>; color: string; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const minValue = Math.min(...data.map(d => d.value), 0)
  const range = maxValue - minValue || 1
  const padding = 20
  const chartWidth = 100
  const chartHeight = height - padding * 2

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth
    const y = chartHeight - ((d.value - minValue) / range) * chartHeight + padding
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `${0},${chartHeight + padding} ${points} ${chartWidth},${chartHeight + padding}`

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#gradient-${color})`} />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function CategoryAnalyticsPage() {
  const router = useRouter()
  const toast = useToast()
  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken

  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('rentals')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [topCategories, setTopCategories] = useState<TopCategory[]>(mockTopCategories)
  const [insights, setInsights] = useState<CategoryInsight[]>(mockInsights)
  const [trendData, setTrendData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  // ─── Data Fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Fetch category stats
      const statsResponse = await axios.get(`${BASE_URL}/api/v1/categories/admin/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data || statsResponse.data)
      }

      // Generate mock trend data (replace with real API call)
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
      setTrendData(generateMockTrendData(days, 50, 20))

    } catch (error: any) {
      console.error('Failed to fetch analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Loading State ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-blue-400 mx-auto animate-pulse" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading analytics...</p>
          <div className="flex justify-center mt-3">
            <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F1F3F6]">
      {/* ── Header ───────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1500px] mx-auto px-6">
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
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h1 className="text-lg font-bold text-gray-900">Category Analytics</h1>
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200">Beta</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Performance insights and trends across all categories
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px] h-9 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchAnalyticsData}
                className="text-gray-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-gray-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────── */}
      <div className="max-w-[1500px] mx-auto px-6 py-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <AnalyticsStatCard
            title="Total Categories"
            value={stats?.totals?.totalCategories || stats?.total || 1248}
            subtitle="Across all levels"
            icon={Layers}
            color="#2874F0"
            bgColor="bg-blue-50"
          />
          <AnalyticsStatCard
            title="Active Categories"
            value={stats?.totals?.activeCategories || stats?.active || 1190}
            subtitle={`${stats?.totals?.activeCategories ? ((stats.totals.activeCategories / stats.totals.totalCategories) * 100).toFixed(0) : 95}% of total`}
            icon={CheckCircle}
            color="#26A541"
            bgColor="bg-green-50"
          />
          <AnalyticsStatCard
            title="Total Products"
            value={stats?.totals?.totalProducts || stats?.totalProducts || 4523}
            subtitle="Listed across categories"
            icon={Package}
            color="#FF9F00"
            bgColor="bg-amber-50"
          />
          <AnalyticsStatCard
            title="Avg. Rent Rate"
            value="47.8"
            subtitle="Conversion percentage"
            icon={Target}
            trend={3.2}
            color="#9C27B0"
            bgColor="bg-purple-50"
            format="percentage"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Activity className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Zap className="h-4 w-4 mr-2" />
              Insights ({insights.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ──────────────────────────── */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Top Categories */}
              <Card className="lg:col-span-2 border-gray-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold">Top Performing Categories</CardTitle>
                      <CardDescription>By rental volume and revenue</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topCategories.map((category, idx) => (
                    <TopCategoryRow key={category._id} category={category} rank={idx + 1} />
                  ))}
                </CardContent>
              </Card>

              {/* Insights Panel */}
              <Card className="border-gray-100">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Key Insights</CardTitle>
                  <CardDescription>AI-powered recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                  {insights.slice(0, 4).map(insight => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-gray-100">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Categories by Level</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { level: 'L1 - Parent', count: 12, color: '#2874F0', percent: 15 },
                    { level: 'L2 - Subcategory', count: 38, color: '#FF6161', percent: 45 },
                    { level: 'L3 - Sub-subcategory', count: 24, color: '#FF9F00', percent: 28 },
                    { level: 'L4 - Leaf', count: 10, color: '#26A541', percent: 12 },
                  ].map(item => (
                    <div key={item.level} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 font-medium">{item.level}</span>
                        <span className="text-gray-900 font-semibold">{item.count}</span>
                      </div>
                      <Progress value={item.percent} className="h-2" style={{ '--progress-background': item.color } as any} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-gray-100">
                <CardTitle className="text-sm font-bold p-5 pb-2">Product Distribution</CardTitle>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Electronics', count: 1245, color: '#2874F0', percent: 35 },
                      { label: 'Furniture', count: 856, color: '#FF6161', percent: 24 },
                      { label: 'Appliances', count: 623, color: '#FF9F00', percent: 18 },
                      { label: 'Sports', count: 412, color: '#26A541', percent: 12 },
                      { label: 'Others', count: 387, color: '#9C27B0', percent: 11 },
                    ].map(item => (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="text-gray-900 font-semibold">{item.count}</span>
                        </div>
                        <Progress value={item.percent} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-100">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: Star, label: 'Featured Categories', value: 42, color: '#FF9F00' },
                    { icon: Globe, label: 'Categories with SEO', value: '89%', color: '#2874F0' },
                    { icon: ImageIcon, label: 'With Images', value: '76%', color: '#26A541' },
                    { icon: Tag, label: 'With Attributes', value: '62%', color: '#9C27B0' },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                        <span className="text-xs text-gray-600">{stat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Performance Tab ────────────────────────── */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
              {metricTypes.map(metric => {
                const Icon = metric.icon
                return (
                  <Card
                    key={metric.value}
                    className={`border-gray-100 cursor-pointer transition-all hover:shadow-md ${
                      selectedMetric === metric.value ? 'ring-2 ring-blue-500 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedMetric(metric.value)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Icon className="h-5 w-5" style={{ color: metric.color }} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{metric.label}</p>
                        <p className="text-lg font-bold text-gray-900">
                          {metric.value === 'revenue' ? '₹2.4L' : metric.value === 'conversion' ? '47.8%' : '1,245'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Performance Chart */}
            <Card className="border-gray-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">
                      {metricTypes.find(m => m.value === selectedMetric)?.label} Performance
                    </CardTitle>
                    <CardDescription>Daily trend over selected period</CardDescription>
                  </div>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {metricTypes.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <TrendChart 
                  data={trendData} 
                  color={metricTypes.find(m => m.value === selectedMetric)?.color || '#2874F0'} 
                  height={300} 
                />
                <div className="flex justify-between mt-4 text-xs text-gray-400">
                  {trendData.length > 0 && (
                    <>
                      <span>{trendData[0]?.date}</span>
                      <span>{trendData[Math.floor(trendData.length / 2)]?.date}</span>
                      <span>{trendData[trendData.length - 1]?.date}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category-wise Performance Table */}
            <Card className="border-gray-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">Category Performance Matrix</CardTitle>
                    <CardDescription>Detailed metrics for each category</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 w-[220px] text-sm"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Category</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Level</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Products</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Views</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Rentals</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Conv.</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Revenue</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCategories.map((cat) => (
                        <tr key={cat._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{cat.icon}</span>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                                <p className="text-xs text-gray-400">{cat.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="outline" className="text-[10px]">{cat.level}</Badge>
                          </td>
                          <td className="text-center py-3 px-4 font-medium">{cat.productCount}</td>
                          <td className="text-center py-3 px-4 text-gray-600">--</td>
                          <td className="text-center py-3 px-4 font-medium">{cat.rentedCount}</td>
                          <td className="text-center py-3 px-4">
                            <span className="font-semibold text-blue-600">{cat.rentRate}%</span>
                          </td>
                          <td className="text-center py-3 px-4 font-medium">
                            ₹{cat.revenue.toLocaleString('en-IN')}
                          </td>
                          <td className="text-right py-3 px-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                              cat.trend > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {cat.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {Math.abs(cat.trend)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Trends Tab ─────────────────────────────── */}
          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rental Trends */}
              <Card className="border-gray-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold">Rental Trends</CardTitle>
                      <CardDescription>Month-over-month comparison</CardDescription>
                    </div>
                    <Badge className="bg-green-50 text-green-600 border-green-200">
                      <ArrowUpRight className="h-3 w-3 mr-1" /> +8.2%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <TrendChart 
                    data={generateMockTrendData(30, 45, 15)} 
                    color="#26A541" 
                    height={250} 
                  />
                </CardContent>
              </Card>

              {/* Revenue Trends */}
              <Card className="border-gray-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold">Revenue Trends</CardTitle>
                      <CardDescription>Revenue growth over time</CardDescription>
                    </div>
                    <Badge className="bg-green-50 text-green-600 border-green-200">
                      <ArrowUpRight className="h-3 w-3 mr-1" /> +12.5%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <TrendChart 
                    data={generateMockTrendData(30, 12000, 3000)} 
                    color="#FF9F00" 
                    height={250} 
                  />
                </CardContent>
              </Card>

              {/* Views vs Rentals */}
              <Card className="border-gray-100">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Views vs Rentals</CardTitle>
                  <CardDescription>Conversion funnel analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <TrendChart 
                    data={generateMockTrendData(30, 200, 50)} 
                    color="#2874F0" 
                    height={250} 
                  />
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-xs text-gray-600">Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-xs text-gray-600">Rentals</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Growth */}
              <Card className="border-gray-100">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Category Growth</CardTitle>
                  <CardDescription>New categories added</CardDescription>
                </CardHeader>
                <CardContent>
                  <TrendChart 
                    data={generateMockTrendData(12, 5, 2)} 
                    color="#9C27B0" 
                    height={250} 
                  />
                  <p className="text-xs text-gray-400 text-center mt-2">Monthly (Last 12 months)</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Insights Tab ───────────────────────────── */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {insights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>

            {/* Opportunities */}
            <Card className="border-gray-100">
              <CardHeader>
                <CardTitle className="text-base font-bold">Growth Opportunities</CardTitle>
                <CardDescription>Categories with highest potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'Standing Desks', potential: 'High', searches: '2.4K/mo', competition: 'Low', action: 'Create Category' },
                    { category: 'Electric Scooters', potential: 'Medium', searches: '1.8K/mo', competition: 'Medium', action: 'Add Products' },
                    { category: 'Smart Home Devices', potential: 'High', searches: '3.1K/mo', competition: 'Low', action: 'Expand Category' },
                    { category: 'Camping Gear', potential: 'Medium', searches: '1.2K/mo', competition: 'High', action: 'Optimize SEO' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.category}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500">🔍 {item.searches}</span>
                            <span className="text-xs text-gray-500">🏆 {item.competition} competition</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={
                          item.potential === 'High' ? 'bg-green-50 text-green-600 border-green-200' :
                          'bg-amber-50 text-amber-600 border-amber-200'
                        }>
                          {item.potential} Potential
                        </Badge>
                        <Button size="sm" variant="outline" className="text-xs">
                          {item.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}