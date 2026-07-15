// app/admin/analytics/vendors/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Users, Store, Package, DollarSign,
  Calendar, Download, RefreshCw, ChevronLeft, ChevronRight,
  Star, Clock, CheckCircle, XCircle, Ban, Award, Zap,
  BarChart3, PieChart, LineChart, Activity, Target,
  Crown, Rocket, Sparkles, Shield, Building2, Mail,
  Phone, MapPin, Eye, ThumbsUp, ArrowUpRight, ArrowDownRight,
  Filter, Search, Loader2, AlertCircle, Info, HelpCircle
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  BarChart, Bar, Legend, LineChart as ReLineChart, Line
} from 'recharts'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Types
interface VendorStatsData {
  overview: Array<{
    totalVendors: number
    activeVendors: number
    pendingApproval: number
    verified: number
    rejected: number
    suspended: number
  }>
  byPlan: Array<{ _id: string; count: number }>
  recentRegistrations: Array<{
    _id: string
    vendorId: string
    businessName: string
    email: string
    phone: string
    status: string
    createdAt: string
  }>
}

interface ChartDataPoint {
  name: string
  value: number
  color: string
}

interface TrendDataPoint {
  month: string
  registrations: number
  approvals: number
  revenue: number
}

// API Service
const api = axios.create({ baseURL: BASE_URL, withCredentials: true })

api.interceptors.request.use(async (config) => {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`
  }
  return config
})

// Color Palette
const COLORS = {
  primary: '#2874f0',
  success: '#21a056',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#8b5cf6',
  pending: '#fbbf24',
  verified: '#10b981',
  rejected: '#ef4444',
  suspended: '#6b7280',
  basic: '#64748b',
  standard: '#3b82f6',
  premium: '#8b5cf6',
  enterprise: '#f59e0b'
}

// Helper Components
const StatCard = ({ title, value, icon: Icon, color, trend, subtitle, onClick }: any) => (
  <motion.div whileHover={{ y: -2 }} onClick={onClick} className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-lg transition-all">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      {trend && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trend.value}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-slate-800 mt-3">{value.toLocaleString()}</p>
    <p className="text-xs text-slate-500 mt-1">{title}</p>
    {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
  </motion.div>
)

const PlanDistributionChart = ({ data }: { data: Array<{ _id: string; count: number }> }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const chartData = data.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
    percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
  }))

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Plan Distribution</h3>
        <PieChart className="h-5 w-5 text-slate-400" />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            //   label={({ name, percentage }) => `${name} (${percentage}%)`}
                label={({ name, percent }) =>
                    `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                labelLine={false}
                >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
              ))}
            </Pie>
            <Tooltip />
          </RePieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: Object.values(COLORS)[idx % Object.values(COLORS).length] }} />
            <span className="text-xs text-slate-600">{item.name}</span>
            <span className="text-xs font-semibold text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const RegistrationTrendChart = () => {
  // Mock trend data (would come from API in production)
  const data: TrendDataPoint[] = [
    { month: 'Jan', registrations: 12, approvals: 8, revenue: 45000 },
    { month: 'Feb', registrations: 19, approvals: 14, revenue: 78000 },
    { month: 'Mar', registrations: 15, approvals: 12, revenue: 62000 },
    { month: 'Apr', registrations: 25, approvals: 20, revenue: 125000 },
    { month: 'May', registrations: 22, approvals: 18, revenue: 98000 },
    { month: 'Jun', registrations: 30, approvals: 26, revenue: 156000 },
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800">Registration & Approval Trends</h3>
          <p className="text-xs text-slate-500 mt-0.5">Last 6 months activity</p>
        </div>
        <LineChart className="h-5 w-5 text-slate-400" />
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
            {/* <Tooltip
              contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              formatter={(value: number, name: string) => [`${value}`, name === 'revenue' ? `₹${value.toLocaleString()}` : value]}
            /> */}

            <Tooltip
                contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                }}
                formatter={(value, name) => {
                    const numValue = Number(value || 0)

                    return [
                    name === 'revenue'
                        ? `₹${numValue.toLocaleString()}`
                        : numValue,
                    name
                    ]
                }}
                />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="registrations" stroke={COLORS.primary} strokeWidth={2} dot={{ fill: COLORS.primary }} name="Registrations" />
            <Line yAxisId="left" type="monotone" dataKey="approvals" stroke={COLORS.success} strokeWidth={2} dot={{ fill: COLORS.success }} name="Approvals" />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={COLORS.warning} strokeWidth={2} dot={{ fill: COLORS.warning }} name="Revenue" />
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const StatusDistributionChart = ({ stats }: { stats: VendorStatsData['overview'][0] }) => {
  const data = [
    { name: 'Verified', value: stats?.verified || 0, color: COLORS.verified },
    { name: 'Pending', value: stats?.pendingApproval || 0, color: COLORS.pending },
    { name: 'Rejected', value: stats?.rejected || 0, color: COLORS.rejected },
    { name: 'Suspended', value: stats?.suspended || 0, color: COLORS.suspended },
  ].filter(d => d.value > 0)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Status Distribution</h3>
        <BarChart3 className="h-5 w-5 text-slate-400" />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" stroke="#94a3b8" fontSize={12} />
            <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const RecentRegistrationsTable = ({ registrations }: { registrations: VendorStatsData['recentRegistrations'] }) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'verified': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Recent Registrations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest vendor signups</p>
          </div>
          <Users className="h-5 w-5 text-slate-400" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Business Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Vendor ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registrations?.map((reg) => (
              <tr key={reg._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-800">{reg.businessName}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-mono text-slate-500">{reg.vendorId}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-600">{reg.email}</p>
                    <p className="text-xs text-slate-400">{reg.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(reg.status)}`}>
                    {reg.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-slate-500">{new Date(reg.createdAt).toLocaleDateString()}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Main Component
export default function AdminVendorAnalyticsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const  toast  = useToast()

  const [stats, setStats] = useState<VendorStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all')

  const fetchAnalytics = useCallback(async () => {
    if (sessionStatus !== 'authenticated') return
    setIsLoading(true)
    try {
      const response = await api.get('/api/v1/admin/vendors/stats', {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }, [sessionStatus, session?.user?.accessToken, toast])

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchAnalytics()
    } else if (sessionStatus === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [sessionStatus, fetchAnalytics, router])

  const overview = stats?.overview?.[0] || {
    totalVendors: 0,
    activeVendors: 0,
    pendingApproval: 0,
    verified: 0,
    rejected: 0,
    suspended: 0
  }

  const conversionRate = overview.totalVendors > 0 
    ? ((overview.verified / overview.totalVendors) * 100).toFixed(1)
    : '0'

  const kpiCards = [
    { title: 'Total Vendors', value: overview.totalVendors, icon: Store, color: COLORS.primary, trend: { value: 15, isPositive: true }, subtitle: 'All registered vendors' },
    { title: 'Active Vendors', value: overview.activeVendors, icon: Users, color: COLORS.success, trend: { value: 12, isPositive: true }, subtitle: 'Currently active' },
    { title: 'Pending Approval', value: overview.pendingApproval, icon: Clock, color: COLORS.warning, trend: { value: 8, isPositive: false }, subtitle: 'Awaiting review' },
    { title: 'Conversion Rate', value: `${conversionRate}%`, icon: Target, color: COLORS.info, trend: { value: 5, isPositive: true }, subtitle: 'Verification rate' },
    { title: 'Total Revenue', value: '₹24.5L', icon: DollarSign, color: '#10b981', trend: { value: 22, isPositive: true }, subtitle: 'From vendor commissions' },
    { title: 'Avg. Rating', value: '4.8', icon: Star, color: '#fbbf24', trend: { value: 3, isPositive: true }, subtitle: 'Vendor satisfaction' },
  ]

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-slate-500">Loading vendor analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <span>Admin Dashboard</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-800 font-medium">Vendor Analytics</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Vendor Analytics</h1>
            <p className="text-slate-500 mt-1">Comprehensive insights into vendor ecosystem performance</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
              <option value="year">Last year</option>
            </select>
            <button onClick={fetchAnalytics} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
              <Download className="h-4 w-4" /> Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpiCards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RegistrationTrendChart />
          <PlanDistributionChart data={stats?.byPlan || []} />
        </div>

        {/* Second Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusDistributionChart stats={overview} />
          
          {/* Insights Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-800">Key Insights</h3>
                <p className="text-xs text-indigo-600">Based on current data trends</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-slate-700">Growth Rate</span>
                </div>
                <span className="text-lg font-bold text-green-600">+24%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-slate-700">Avg. Registrations/Month</span>
                </div>
                <span className="text-lg font-bold text-blue-600">22</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-slate-700">Avg. Approval Time</span>
                </div>
                <span className="text-lg font-bold text-emerald-600">2.4 days</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-slate-700">Top Performing Plan</span>
                </div>
                <span className="text-lg font-bold text-amber-600">Premium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <RecentRegistrationsTable registrations={stats?.recentRegistrations || []} />

        {/* Vendor Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Crown className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs text-slate-500">Enterprise Vendors</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">8</p>
            <p className="text-xs text-green-600 mt-1">↑ 2 this month</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Rocket className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-xs text-slate-500">High Performers</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">24</p>
            <p className="text-xs text-green-600 mt-1">↑ 5 this month</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Zap className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-xs text-slate-500">At Risk Vendors</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">3</p>
            <p className="text-xs text-red-600 mt-1">↓ 1 this month</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ThumbsUp className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-xs text-slate-500">Retention Rate</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">94%</p>
            <p className="text-xs text-green-600 mt-1">↑ 2% from last quarter</p>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Need Help Understanding Analytics?</h3>
                <p className="text-sm text-slate-500">Explore documentation or contact support for assistance</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50">
                View Documentation
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Missing icon components
// const Download = ({ className }: { className?: string }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//     <polyline points="7 10 12 15 17 10" />
//     <line x1="12" y1="15" x2="12" y2="3" />
//   </svg>
// )