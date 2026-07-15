// app/admin/delivery/analytics/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Package, Truck, Clock, Star,
  Users, MapPin, Calendar, Download, RefreshCw, Filter,
  ChevronLeft, ChevronRight, Activity, Target, Award,
  BarChart3, PieChart, LineChart, AreaChart,
  DollarSign, CheckCircle, XCircle, AlertCircle,
  Zap, Rocket, Crown, Sparkles, Heart, Eye
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import {
  AreaChart as ReAreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, LineChart as ReLineChart,
  Line, PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Mock Analytics Data
const deliveryTrendData = [
  { month: 'Jan', deliveries: 145, onTime: 135, failed: 10, revenue: 18750 },
  { month: 'Feb', deliveries: 168, onTime: 158, failed: 10, revenue: 22450 },
  { month: 'Mar', deliveries: 189, onTime: 179, failed: 10, revenue: 25600 },
  { month: 'Apr', deliveries: 210, onTime: 200, failed: 10, revenue: 29800 },
  { month: 'May', deliveries: 234, onTime: 222, failed: 12, revenue: 34200 },
  { month: 'Jun', deliveries: 256, onTime: 244, failed: 12, revenue: 38900 },
]

const zonePerformance = [
  { zone: 'North', deliveries: 342, successRate: 96.5, avgTime: 32, rating: 4.8 },
  { zone: 'South', deliveries: 287, successRate: 94.8, avgTime: 38, rating: 4.7 },
  { zone: 'East', deliveries: 198, successRate: 93.2, avgTime: 42, rating: 4.6 },
  { zone: 'West', deliveries: 156, successRate: 95.1, avgTime: 35, rating: 4.7 },
  { zone: 'Central', deliveries: 89, successRate: 97.2, avgTime: 28, rating: 4.9 },
]

const personnelPerformance = [
  { name: 'Rahul Sharma', deliveries: 156, rating: 4.9, onTime: 98, revenue: 18750 },
  { name: 'Priya Singh', deliveries: 98, rating: 4.8, onTime: 97, revenue: 12450 },
  { name: 'Amit Kumar', deliveries: 87, rating: 4.7, onTime: 96, revenue: 11200 },
  { name: 'Suresh Reddy', deliveries: 45, rating: 4.6, onTime: 95, revenue: 8900 },
  { name: 'Neha Gupta', deliveries: 34, rating: 4.5, onTime: 94, revenue: 6700 },
]

const peakHoursData = [
  { hour: '9 AM', deliveries: 45 },
  { hour: '10 AM', deliveries: 78 },
  { hour: '11 AM', deliveries: 92 },
  { hour: '12 PM', deliveries: 85 },
  { hour: '1 PM', deliveries: 56 },
  { hour: '2 PM', deliveries: 48 },
  { hour: '3 PM', deliveries: 62 },
  { hour: '4 PM', deliveries: 84 },
  { hour: '5 PM', deliveries: 96 },
  { hour: '6 PM', deliveries: 72 },
]

const api = axios.create({ baseURL: BASE_URL, withCredentials: true })

api.interceptors.request.use(async (config) => {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`
  }
  return config
})

// Components
const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }: any) => (
  <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      {trend && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend.value}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-slate-800 mt-3">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{title}</p>
    {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
  </motion.div>
)

const ZoneCard = ({ zone }: { zone: any }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-slate-800">{zone.zone} Zone</h3>
      <div className="flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        <span className="text-sm font-semibold">{zone.rating}</span>
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">Deliveries</span>
        <span className="font-semibold">{zone.deliveries}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">Success Rate</span>
        <span className="font-semibold text-green-600">{zone.successRate}%</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">Avg Time</span>
        <span className="font-semibold">{zone.avgTime} min</span>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${zone.successRate}%` }} />
      </div>
    </div>
  </div>
)

const TopPerformerCard = ({ person, rank }: { person: any; rank: number }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-white hover:shadow-md transition-all">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
        {rank}
      </div>
      <div>
        <p className="font-medium text-slate-800">{person.name}</p>
        <p className="text-xs text-slate-500">{person.deliveries} deliveries</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        <span className="text-sm font-semibold">{person.rating}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5 text-green-500" />
        <span className="text-sm font-semibold">{person.onTime}%</span>
      </div>
      <div className="flex items-center gap-1">
        <DollarSign className="h-3.5 w-3.5 text-primary" />
        <span className="text-sm font-semibold">₹{(person.revenue / 1000).toFixed(0)}K</span>
      </div>
    </div>
  </div>
)

// Main Component
export default function DeliveryAnalyticsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const toast = useToast()
  const [period, setPeriod] = useState('month')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [sessionStatus, router])

  const totalStats = {
    totalDeliveries: deliveryTrendData.reduce((sum, d) => sum + d.deliveries, 0),
    totalRevenue: deliveryTrendData.reduce((sum, d) => sum + d.revenue, 0),
    avgOnTime: (deliveryTrendData.reduce((sum, d) => sum + d.onTime, 0) / deliveryTrendData.length).toFixed(1),
    successRate: ((deliveryTrendData.reduce((sum, d) => sum + (d.deliveries - d.failed), 0) / 
                  deliveryTrendData.reduce((sum, d) => sum + d.deliveries, 0)) * 100).toFixed(1)
  }

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/admin/delivery" className="hover:text-primary transition-colors">Delivery Management</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">Analytics</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Delivery Analytics</h1>
              <p className="text-slate-500 mt-1">Comprehensive insights into delivery performance and trends</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="quarter">Last 90 days</option>
                <option value="year">Last year</option>
              </select>
              <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50">
                <Download className="h-4 w-4" /> Export Report
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Deliveries" value={totalStats.totalDeliveries} icon={Package} color="#2874f0" trend={{ value: 12, isPositive: true }} subtitle="Last 30 days" />
          <StatCard title="Success Rate" value={`${totalStats.successRate}%`} icon={CheckCircle} color="#21a056" trend={{ value: 3, isPositive: true }} subtitle="Vs previous period" />
          <StatCard title="Avg On-Time" value={`${totalStats.avgOnTime}%`} icon={Clock} color="#8b5cf6" trend={{ value: 2, isPositive: true }} subtitle="Delivery punctuality" />
          <StatCard title="Total Revenue" value={`₹${(totalStats.totalRevenue / 1000).toFixed(0)}K`} icon={DollarSign} color="#fb641b" trend={{ value: 18, isPositive: true }} subtitle="From deliveries" />
        </div>

        {/* Delivery Trends Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Delivery Performance Trends</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly delivery metrics and success rates</p>
            </div>
            <LineChart className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={deliveryTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="deliveries" stroke="#2874f0" strokeWidth={2} name="Total Deliveries" />
                <Line yAxisId="left" type="monotone" dataKey="onTime" stroke="#21a056" strokeWidth={2} name="On-Time Deliveries" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#fb641b" strokeWidth={2} name="Revenue (₹)" />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Zone Performance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">Zone Performance</h3>
                <p className="text-xs text-slate-500 mt-0.5">Delivery metrics by service zone</p>
              </div>
              <MapPin className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {zonePerformance.map((zone, idx) => (
                <ZoneCard key={idx} zone={zone} />
              ))}
            </div>
          </div>

          {/* Peak Hours Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">Peak Delivery Hours</h3>
                <p className="text-xs text-slate-500 mt-0.5">Delivery volume by time of day</p>
              </div>
              <Activity className="h-5 w-5 text-slate-400" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="deliveries" fill="#2874f0" radius={[4, 4, 0, 0]}>
                    {peakHoursData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.deliveries > 80 ? '#fb641b' : entry.deliveries > 50 ? '#f59e0b' : '#2874f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#fb641b]" />High Volume (&gt;80)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#f59e0b]" />Medium Volume (50-80)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#2874f0]" />Low Volume (&lt;50)</div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Top Performing Personnel</h3>
              <p className="text-xs text-slate-500 mt-0.5">Highest rated and most productive delivery staff</p>
            </div>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-2">
            {personnelPerformance.map((person, idx) => (
              <TopPerformerCard key={idx} person={person} rank={idx + 1} />
            ))}
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">94.5%</p>
                <p className="text-xs text-slate-500">Fulfillment Rate</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">↑ 2.3% from last month</p>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-blue-600" style={{ width: '94.5%' }} /></div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">38 min</p>
                <p className="text-xs text-slate-500">Avg Delivery Time</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">↓ 5 min improvement</p>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-green-600" style={{ width: '65%' }} /></div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">4.8 ★</p>
                <p className="text-xs text-slate-500">Customer Satisfaction</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">Based on 1,234 reviews</p>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-purple-600" style={{ width: '96%' }} /></div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-primary-800">Key Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Peak Performance Hour</p>
                  <p className="text-lg font-bold text-slate-800">5:00 PM - 6:00 PM</p>
                  <p className="text-xs text-green-600 mt-1">96 deliveries in this slot</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Best Performing Zone</p>
                  <p className="text-lg font-bold text-slate-800">Central Zone</p>
                  <p className="text-xs text-green-600 mt-1">97.2% success rate</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Growth Opportunity</p>
                  <p className="text-lg font-bold text-slate-800">West Zone</p>
                  <p className="text-xs text-amber-600 mt-1">+15% potential growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}