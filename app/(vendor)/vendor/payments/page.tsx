// app/vendor/payments/page.tsx (Overview)
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, Wallet, Calendar, ArrowUp, ArrowDown,
  CreditCard, Banknote, Zap, Shield, ChevronRight, Download,
  Eye, Clock, CheckCircle, XCircle, AlertCircle, Package
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

interface PaymentStats {
  totalRevenue: number
  totalPayments: number
  averagePayment: number
  pendingPayout: number
  thisMonthRevenue: number
  lastMonthRevenue: number
  growth: number
}

interface RecentPayment {
  _id: string
  paymentNumber: string
  amount: number
  type: string
  method: string
  status: string
  createdAt: string
  rental: { rentalNumber: string }
  user: { profile: { firstName: string; lastName: string } }
}

interface MonthlyTrend {
  month: string
  revenue: number
  count: number
}

export default function PaymentsOverviewPage() {
  const { data: session, status } = useSession()
  const  toast  = useToast()
  
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalPayments: 0,
    averagePayment: 0,
    pendingPayout: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    growth: 0
  })
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  
  const fetchPaymentData = useCallback(async () => {
    if (status !== 'authenticated') return
    
    try {
      const headers = await getAuthHeaders()
      
      // Fetch payment stats
      const statsRes = await fetch(`${BASE_URL}/api/v1/payments/stats?period=${selectedPeriod}`, { headers })
      const statsData = await statsRes.json()
      
      // Fetch recent payments
      const paymentsRes = await fetch(`${BASE_URL}/api/v1/payments/vendor/me?limit=5`, { headers })
      const paymentsData = await paymentsRes.json()
      
      // Fetch monthly trends
      const trendsRes = await fetch(`${BASE_URL}/api/v1/payments/vendor/me?limit=100`, { headers })
      const trendsData = await trendsRes.json()
      
      if (statsData.success) {
        const overview = statsData.data.overview?.[0] || {}
        setStats({
          totalRevenue: overview.totalAmount || 0,
          totalPayments: overview.totalCount || 0,
          averagePayment: overview.averageAmount || 0,
          pendingPayout: 0,
          thisMonthRevenue: 0,
          lastMonthRevenue: 0,
          growth: 12.5
        })
      }
      
      if (paymentsData.success) {
        setRecentPayments(paymentsData.data.payments || [])
      }
      
      if (trendsData.success) {
        // Process monthly trends from payments
        const payments = trendsData.data.payments || []
        const monthlyMap = new Map()
        
        payments.forEach((payment: any) => {
          const date = new Date(payment.createdAt)
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
          const monthName = format(date, 'MMM yyyy')
          
          if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, { month: monthName, revenue: 0, count: 0 })
          }
          const entry = monthlyMap.get(monthKey)
          entry.revenue += payment.amount
          entry.count += 1
        })
        
        const trends = Array.from(monthlyMap.values()).slice(-6)
        setMonthlyTrends(trends)
      }
    } catch (error) {
      toast.error('Failed to load payment data')
    } finally {
      setIsLoading(false)
    }
  }, [status, selectedPeriod, toast])
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchPaymentData()
    }
  }, [fetchPaymentData, status])
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'success': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }
  
  const getPaymentTypeIcon = (type: string) => {
    switch(type) {
      case 'rent': return <Calendar className="h-3.5 w-3.5" />
      case 'security_deposit': return <Shield className="h-3.5 w-3.5" />
      case 'delivery': return <Package className="h-3.5 w-3.5" />
      default: return <DollarSign className="h-3.5 w-3.5" />
    }
  }
  
  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(stats.totalRevenue / 1000).toFixed(1)}K`,
      subtitle: `from ${stats.totalPayments} transactions`,
      icon: DollarSign,
      color: '#2874f0',
      bg: '#ebf3fb',
      trend: `+${stats.growth}%`,
      trendUp: true
    },
    {
      title: 'Avg. Transaction',
      value: `₹${Math.round(stats.averagePayment).toLocaleString()}`,
      subtitle: 'per payment',
      icon: TrendingUp,
      color: '#21a056',
      bg: '#e8f5e9',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Pending Payout',
      value: `₹${(stats.pendingPayout / 1000).toFixed(1)}K`,
      subtitle: 'to be settled',
      icon: Wallet,
      color: '#fb641b',
      bg: '#fff3e0',
      trend: '-5%',
      trendUp: false
    },
    {
      title: 'Success Rate',
      value: '98.5%',
      subtitle: 'payment success',
      icon: CheckCircle,
      color: '#9c27b0',
      bg: '#f3e5f5',
      trend: '+2%',
      trendUp: true
    }
  ]
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading payment data...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                  <Icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                  card.trendUp ? 'text-green-600' : 'text-red-500'
                }`}>
                  {card.trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {card.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500 mt-1">{card.title}</p>
              <p className="text-[10px] text-slate-400 mt-1">{card.subtitle}</p>
            </motion.div>
          )
        })}
      </div>
      
      {/* Period Selector & Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <h2 className="font-semibold text-slate-800">Revenue Trend</h2>
            <p className="text-xs text-slate-500 mt-0.5">Monthly payment history</p>
          </div>
          <div className="flex gap-2">
            {['month', 'quarter', 'year'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedPeriod === period
                    ? 'bg-[#2874f0] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Simple Bar Chart */}
        <div className="h-64 flex items-end gap-3">
          {monthlyTrends.length > 0 ? (
            monthlyTrends.map((trend, idx) => {
              const maxRevenue = Math.max(...monthlyTrends.map(t => t.revenue), 1)
              const height = (trend.revenue / maxRevenue) * 200
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-[#2874f0]/10 rounded-t-lg transition-all duration-500 relative group">
                    <div 
                      className="w-full bg-gradient-to-t from-[#2874f0] to-[#00a0e3] rounded-t-lg transition-all duration-500"
                      style={{ height: `${height}px` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{(trend.revenue / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">{trend.month}</p>
                </div>
              )
            })
          ) : (
            <div className="w-full text-center text-slate-400 py-10">
              No transaction data available
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Recent Transactions</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest payment activities</p>
          </div>
          <button className="text-xs text-[#2874f0] hover:underline flex items-center gap-1">
            View All
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        
        <div className="divide-y divide-slate-100">
          {recentPayments.length > 0 ? (
            recentPayments.map((payment, idx) => (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2874f0]/10 flex items-center justify-center">
                    {getPaymentTypeIcon(payment.type)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {payment.type === 'rent' ? 'Monthly Rent' : 
                       payment.type === 'security_deposit' ? 'Security Deposit' :
                       payment.type === 'delivery' ? 'Delivery Charges' : 'Payment'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-400 font-mono">{payment.paymentNumber}</p>
                      <span className="text-xs text-slate-300">•</span>
                      <p className="text-xs text-slate-400">
                        {payment.user.profile.firstName} {payment.user.profile.lastName}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">₹{payment.amount.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {format(new Date(payment.createdAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="px-5 py-12 text-center">
              <Wallet className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No transactions yet</p>
              <p className="text-xs text-slate-400 mt-1">Payments will appear here once customers make purchases</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
              <Download className="h-5 w-5 text-[#2874f0]" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Download Statement</p>
              <p className="text-xs text-slate-500">Get complete payment history</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
              <Banknote className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Payout Settings</p>
              <p className="text-xs text-slate-500">Update bank details</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Tax Reports</p>
              <p className="text-xs text-slate-500">GST & TDS statements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}