// app/vendor/analytics/page.tsx (Overview)
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Package, Users, Star, Calendar, ArrowUp, ArrowDown,
  Activity, Download, Eye, ShoppingCart, CheckCircle,
  Clock, AlertCircle, BarChart3, PieChart, LineChart
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

interface KPICard {
  title: string
  value: string | number
  change: number
  icon: any
  color: string
  bg: string
}

interface RevenueData {
  date: string
  amount: number
  orders: number
}

interface RentalStatus {
  status: string
  count: number
}

function KPICard({ title, value, change, icon: Icon, color, bg }: KPICard) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-200 p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{title}</p>
    </motion.div>
  )
}

function RevenueChart({ data }: { data: RevenueData[] }) {
    console.log('Revenue data:', data)
  const maxRevenue = Math.max(...data.map(d => d.amount), 1)
  
  return (
    <div className="h-64 flex items-end gap-2">
      {data?.map((item, idx) => {
        const height = (item.amount / maxRevenue) * 200
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="w-full relative">
              <div
                className="w-full bg-gradient-to-t from-[#2874f0] to-[#00a0e3] rounded-t-lg transition-all duration-500 cursor-pointer"
                style={{ height: `${height}px` }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ₹{(item.amount / 1000).toFixed(1)}K
              </div>
            </div>
            {/* <p className="text-[10px] text-slate-400">{format(new Date(item?.date), 'dd MMM')}</p> */}
          </div>
        )
      })}
    </div>
  )
}

function StatusPieChart({ data }: { data: RentalStatus[] }) {
  const colors = ['#2874f0', '#21a056', '#fb641b', '#9c27b0', '#ef4444', '#64748b']
  const total = data.reduce((sum, d) => sum + d.count, 0)
  
  return (
    <div className="space-y-3">
      {data.map((item, idx) => {
        const percentage = total ? (item.count / total) * 100 : 0
        return (
          <div key={item.status} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
            <span className="flex-1 text-sm capitalize text-slate-600">{item.status.replace(/_/g, ' ')}</span>
            <span className="text-sm font-semibold text-slate-800">{item.count}</span>
            <span className="text-xs text-slate-400 w-12">{percentage.toFixed(1)}%</span>
            <div className="w-24 bg-slate-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full" style={{ width: `${percentage}%`, backgroundColor: colors[idx % colors.length] }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AnalyticsOverviewPage() {
  const { data: session, status } = useSession()
  const toast = useToast()
  
  const [kpis, setKpis] = useState<KPICard[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [rentalStatus, setRentalStatus] = useState<RentalStatus[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  console.log('Revenue data:', revenueData)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnalytics()
    }
  }, [status])

  const fetchAnalytics = async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/analytics/overview?period=30d`, { headers })
      const data = await res.json()
      
      if (data.success) {
        const kpiData = data.data.kpi
        setKpis([
          { title: 'Total Revenue', value: `₹${(kpiData.revenue.current / 1000).toFixed(1)}K`, change: kpiData.revenue.growth, icon: DollarSign, color: '#21a056', bg: '#e8f5e9' },
          { title: 'Total Rentals', value: kpiData.rentals.current, change: kpiData.rentals.growth, icon: ShoppingBag, color: '#2874f0', bg: '#ebf3fb' },
          { title: 'Active Products', value: kpiData.activeProducts, change: 0, icon: Package, color: '#fb641b', bg: '#fff3e0' },
          { title: 'Avg Rating', value: kpiData.averageRating.toFixed(1), change: 0, icon: Star, color: '#fbbf24', bg: '#fef3c7' }
        ])
        setRevenueData(data.data.revenueByDay || [])
        setRentalStatus(data.data.rentalsByStatus || [])
        setRecentActivity(data.data.recentActivity || [])
      }
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-800">Revenue Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daily revenue for last 30 days</p>
            </div>
            <TrendingUp className="h-5 w-5 text-[#2874f0]" />
          </div>
          {revenueData.length > 0 ? (
            <RevenueChart data={revenueData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">No data available</div>
          )}
        </div>

        {/* Rental Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-800">Rental Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Distribution by status</p>
            </div>
            <PieChart className="h-5 w-5 text-[#2874f0]" />
          </div>
          {rentalStatus.length > 0 ? (
            <StatusPieChart data={rentalStatus} />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">No data available</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">Recent Activity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest orders and customer actions</p>
            </div>
            <Activity className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2874f0]/10 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-[#2874f0]" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{activity.product || activity.action}</p>
                    <p className="text-xs text-slate-500">
                      {activity.customer} • Order #{activity.id?.slice(-8)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">₹{activity.amount?.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{format(new Date(activity.time), 'dd MMM, hh:mm a')}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-slate-400">No recent activity</div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-slate-800">2,847</p>
              <p className="text-xs text-slate-600">Total Product Views</p>
              <p className="text-xs text-green-600 mt-1">↑ 12% vs last month</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-slate-800">3.2%</p>
              <p className="text-xs text-slate-600">Conversion Rate</p>
              <p className="text-xs text-green-600 mt-1">↑ 0.8% vs last month</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-slate-800">156</p>
              <p className="text-xs text-slate-600">Active Customers</p>
              <p className="text-xs text-green-600 mt-1">↑ 8 new this month</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-slate-800">4.8★</p>
              <p className="text-xs text-slate-600">Customer Rating</p>
              <p className="text-xs text-green-600 mt-1">Based on 234 reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}