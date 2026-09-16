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

/**
 * ₹35,000 → "₹35.0K", ₹900 → "₹900", ₹0 → "₹0".
 *
 * The cards previously always rendered `(value / 1000).toFixed(1) + 'K'`, which
 * turned any amount below ₹1,000 into "₹0.0K" — indistinguishable from no money at
 * all. A `0` here now means genuinely nothing, not "rounded down".
 */
function formatCompactINR(value: number) {
  const n = Number(value) || 0
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

interface PaymentStats {
  /**
   * Account totals, computed by the API WITHOUT the period filter. These are what
   * the "Total Revenue" / "Avg. Transaction" cards mean.
   *
   * They used to read the period-scoped `overview`, while this page defaults the
   * period to "month" — so a vendor whose successful payments all fell outside the
   * current calendar month saw ₹0 revenue and ₹0 average, however much history the
   * account had.
   */
  allTime: {
    totalAmount: number
    totalCount: number
    averageAmount: number
  }
  pendingPayout: number
  thisMonthRevenue: number
  lastMonthRevenue: number
  /** null when there is no previous month to compare against. */
  growth: number | null
  /** null when the account has no payments to rate. */
  successRate: number | null
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
    allTime: { totalAmount: 0, totalCount: 0, averageAmount: 0 },
    pendingPayout: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    growth: null,
    successRate: null,
  })
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  
  const fetchPaymentData = useCallback(async () => {
    if (status !== 'authenticated') return
    
    try {
      const headers = await getAuthHeaders()
      
      // Stats first: it tells us whether the API already provides the period-scoped
      // `trend` series, which decides whether the second payments call is needed.
      const statsRes = await fetch(`${BASE_URL}/api/v1/payments/stats?period=${selectedPeriod}`, { headers })
      if (!statsRes.ok) {
        throw new Error(`Payment stats request failed with HTTP ${statsRes.status}`)
      }
      const statsData = await statsRes.json()
      const raw = statsData?.data || {}
      
      // An older backend has no `trend`, so fall back to deriving the monthly
      // buckets from the recent payments — otherwise the chart renders blank.
      const trendFromApi: MonthlyTrend[] | null = Array.isArray(raw.trend) ? raw.trend : null
      
      const [paymentsRes, trendsRes] = await Promise.all([
        // Fetch recent payments
        fetch(`${BASE_URL}/api/v1/payments/vendor/me?limit=5`, { headers }),
        trendFromApi
          ? Promise.resolve(null)
          : fetch(`${BASE_URL}/api/v1/payments/vendor/me?limit=100`, { headers }),
      ])
      
      if (statsData.success) {
        // `allTime` is the account total — the correct source for the KPI cards.
        // `overview` is period-scoped and only serves as a fallback for an older
        // backend that does not send `allTime` yet.
        const allTime = raw.allTime || raw.overview?.[0] || {}
        setStats({
          allTime: {
            totalAmount: allTime.totalAmount || 0,
            totalCount: allTime.totalCount || 0,
            averageAmount: allTime.averageAmount || 0,
          },
          // These used to be hardcoded — the monthly figures and pending payout to 0,
          // and growth to a fabricated 12.5 — so the cards showed numbers unrelated to
          // the account. The API now returns real values.
          pendingPayout: raw.pendingPayout || 0,
          thisMonthRevenue: raw.thisMonthRevenue || 0,
          lastMonthRevenue: raw.lastMonthRevenue || 0,
          growth: typeof raw.growth === 'number' ? raw.growth : null,
          successRate: typeof raw.successRate === 'number' ? raw.successRate : null,
        })
        
        if (trendFromApi) {
          setMonthlyTrends(trendFromApi)
        }
      }
      
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        if (paymentsData.success) {
          setRecentPayments(paymentsData.data?.payments || [])
        }
      }
      
      if (trendsRes && trendsRes.ok) {
        const trendsData = await trendsRes.json()
        if (trendsData.success) {
          // Process monthly trends from payments
          const payments = trendsData.data?.payments || []
          const monthlyMap = new Map<string, MonthlyTrend>()
          
          payments.forEach((payment: any) => {
            const date = new Date(payment.createdAt)
            // A payment with a missing/invalid date would land in an "Invalid Date"
            // bucket, so skip it rather than render a garbage axis label.
            if (Number.isNaN(date.getTime())) return
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
            const monthName = format(date, 'MMM yyyy')
            
            if (!monthlyMap.has(monthKey)) {
              monthlyMap.set(monthKey, { month: monthName, revenue: 0, count: 0 })
            }
            const entry = monthlyMap.get(monthKey)!
            entry.revenue += Number(payment.amount) || 0
            entry.count += 1
          })
          
          setMonthlyTrends(Array.from(monthlyMap.values()).slice(-6))
        }
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
  
  // `trend` is only ever a real figure. It previously carried fabricated
  // percentages ("+8%", "-5%", "+2%") and the Success Rate card a hardcoded
  // "98.5%" — none of which came from the account's data.
  const statCards: Array<{
    title: string
    value: string
    subtitle: string
    icon: typeof DollarSign
    color: string
    bg: string
    trend?: string
    trendUp?: boolean
    /** Why the badge is there — the badge alone is ambiguous next to an all-time total. */
    trendTitle?: string
  }> = [
    {
      title: 'Total Revenue',
      value: formatCompactINR(stats.allTime.totalAmount),
      subtitle: `all time · ${stats.allTime.totalCount} transaction${
        stats.allTime.totalCount === 1 ? '' : 's'
      }`,
      icon: DollarSign,
      color: '#2874f0',
      bg: '#ebf3fb',
      // The badge is month-over-month, while the card value is all-time — so it
      // carries a title explaining exactly which two figures it compares.
      ...(stats.growth !== null
        ? {
            trend: `${stats.growth >= 0 ? '+' : ''}${stats.growth}%`,
            trendUp: stats.growth >= 0,
            trendTitle: `Month over month: ${formatCompactINR(
              stats.thisMonthRevenue,
            )} this month vs ${formatCompactINR(stats.lastMonthRevenue)} last month`,
          }
        : {}),
    },
    {
      title: 'Avg. Transaction',
      value: `₹${Math.round(stats.allTime.averageAmount).toLocaleString('en-IN')}`,
      subtitle: 'per payment, all time',
      icon: TrendingUp,
      color: '#21a056',
      bg: '#e8f5e9',
    },
    {
      title: 'Pending Payout',
      value: formatCompactINR(stats.pendingPayout),
      subtitle: 'awaiting settlement',
      icon: Wallet,
      color: '#fb641b',
      bg: '#fff3e0',
    },
    {
      title: 'Success Rate',
      value: stats.successRate !== null ? `${stats.successRate}%` : '—',
      subtitle: 'payment success',
      icon: CheckCircle,
      color: '#9c27b0',
      bg: '#f3e5f5',
    },
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
                {card.trend && (
                  <span
                    title={card.trendTitle}
                    className={`text-xs font-semibold flex items-center gap-0.5 ${
                      card.trendUp ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {card.trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {card.trend}
                  </span>
                )}
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
            {/* The period buttons below scope THIS chart only — the KPI cards above
                are all-time totals and deliberately do not move with them. */}
            <p className="text-xs text-slate-500 mt-0.5">
              Successful payments per month, for the selected period
            </p>
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
              No successful payments in this period
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