// app/vendor/analytics/sales/page.tsx (Sales Report)
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, ShoppingBag, Calendar, Download,
  RefreshCw, ChevronRight, ArrowUp, ArrowDown, CreditCard,
  Banknote, Wallet, PieChart, BarChart3, Users
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

export default function SalesReportPage() {
  const { data: session, status } = useSession()
  const toast = useToast()
  const [period, setPeriod] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (status === 'authenticated') fetchData()
  }, [status, period])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/analytics/sales?period=${period}`, { headers })
      const result = await res.json()
      if (result.success) setData(result.data)
      else toast.error(result.message)
    } catch (error) {
      toast.error('Failed to load sales report')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/analytics/sales/export?period=${period}`, { headers })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sales-report-${period}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Report downloaded')
    } catch (error) {
      toast.error('Export failed')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading sales data...</p>
        </div>
      </div>
    )
  }

  const summary = data?.summary || {}
  const maxRevenue = Math.max(...(data?.dailyRevenue?.map((d: any) => d.amount) || [1]), 1)

  return (
    <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Link href="/vendor/dashboard" className="hover:text-[#2874f0]">Dashboard</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-800 font-medium">Sales Report</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Sales Report</h1>
            <p className="text-sm text-slate-500 mt-0.5">Track your revenue and order metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white transition-colors">
              <Download className="h-4 w-4" /> Export
            </button>
            <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 bg-[#2874f0] text-white rounded-lg hover:bg-[#1a5fd4] transition-colors">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2"><DollarSign className="h-5 w-5 text-green-600" /><span className="text-xs text-slate-500">Total Revenue</span></div>
            <p className="text-2xl font-bold text-slate-900">₹{(summary.totalRevenue / 1000).toFixed(1)}K</p>
            <p className="text-xs text-slate-500 mt-1">from {summary.totalOrders} orders</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2"><ShoppingBag className="h-5 w-5 text-blue-600" /><span className="text-xs text-slate-500">Avg Order Value</span></div>
            <p className="text-2xl font-bold text-slate-900">₹{Math.round(summary.averageOrderValue || 0).toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">per transaction</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2"><Users className="h-5 w-5 text-purple-600" /><span className="text-xs text-slate-500">Unique Customers</span></div>
            <p className="text-2xl font-bold text-slate-900">{summary.uniqueCustomers || 0}</p>
            <p className="text-xs text-slate-500 mt-1">this period</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-5 w-5 text-orange-600" /><span className="text-xs text-slate-500">Growth</span></div>
            <p className="text-2xl font-bold text-green-600">+{data?.summary?.growth || 0}%</p>
            <p className="text-xs text-slate-500 mt-1">vs previous period</p>
          </div>
        </div>

        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-5">Daily Revenue</h3>
          <div className="h-64 flex items-end gap-2">
            {data?.dailyRevenue?.map((item: any, idx: number) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative">
                  <div className="w-full bg-gradient-to-t from-[#2874f0] to-[#00a0e3] rounded-t-lg" style={{ height: `${(item.amount / maxRevenue) * 200}px` }} />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">₹{(item.amount / 1000).toFixed(1)}K</div>
                </div>
                {/* <p className="text-[10px] text-slate-400">{format(new Date(item.date), 'dd MMM')}</p> */}
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Revenue by Type</h3>
            <div className="space-y-3">
              {data?.revenueByType?.map((item: any, idx: number) => {
                const colors = ['#21a056', '#2874f0', '#fb641b', '#9c27b0']
                const total = data.revenueByType.reduce((s: number, i: any) => s + i.amount, 0)
                const percentage = total ? (item.amount / total) * 100 : 0
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-slate-600">{item._id.replace(/_/g, ' ')}</span>
                      <span className="font-semibold">₹{(item.amount / 1000).toFixed(1)}K ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2"><div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: colors[idx % colors.length] }} /></div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Payment Methods</h3>
            <div className="grid grid-cols-2 gap-3">
              {data?.revenueByMethod?.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-50 rounded-lg p-3 text-center">
                  <CreditCard className="h-6 w-6 mx-auto text-[#2874f0] mb-2" />
                  <p className="text-lg font-bold text-slate-800">₹{(item.amount / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-slate-500 capitalize">{item._id.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-slate-400">{item.count} transactions</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Monthly Trends</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Month</th><th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Revenue</th><th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Orders</th><th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Growth</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {data?.monthlyTrends?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{item._id}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">₹{(item.revenue / 1000).toFixed(1)}K</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">{item.orders}</td>
                    <td className="px-4 py-3 text-right text-sm"><span className={`inline-flex items-center gap-1 text-xs ${item.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>{item.growth >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}{Math.abs(item.growth)}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}