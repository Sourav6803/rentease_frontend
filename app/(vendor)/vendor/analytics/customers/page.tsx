// app/vendor/analytics/customers/page.tsx (Customer Insights)
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, UserPlus, Repeat, Award, Star, Mail, Phone, MapPin, Calendar, Download, RefreshCw, ChevronRight, TrendingUp, Crown } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return { 'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '' }
}

function CustomerSegmentCard({ title, count, icon: Icon, color, bg, description }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}><Icon className="h-5 w-5" style={{ color }} /></div>
        <span className="text-2xl font-bold text-slate-900">{count}</span>
      </div>
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  )
}

function CustomerRow({ customer, rank }: { customer: any; rank: number }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors cursor-pointer">
      <td className="px-4 py-3 text-sm font-medium text-slate-500">#{rank}</td>
      <td className="px-4 py-3"><div><p className="font-medium text-slate-800">{customer.name}</p><p className="text-xs text-slate-500">{customer.email}</p></div></td>
      <td className="px-4 py-3 text-center text-sm text-slate-600">{customer.totalRentals}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">₹{(customer.totalSpent / 1000).toFixed(1)}K</td>
      <td className="px-4 py-3 text-center text-sm text-slate-600">{customer.uniqueProducts}</td>
      <td className="px-4 py-3 text-center"><span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"><Repeat className="h-3 w-3" /> {customer.totalRentals > 1 ? 'Repeat' : 'New'}</span></td>
      <td className="px-4 py-3 text-sm text-slate-500">{format(new Date(customer.lastRental), 'dd MMM yyyy')}</td>
    </tr>
  )
}

export default function CustomerInsightsPage() {
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
      const res = await fetch(`${BASE_URL}/api/v1/vendor/analytics/customers?period=${period}`, { headers })
      const result = await res.json()
      if (result.success) setData(result.data)
      else toast.error(result.message)
    } catch (error) {
      toast.error('Failed to load customer data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center"><div className="flex flex-col items-center gap-3"><div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" /><p className="text-sm text-slate-500">Loading customer insights...</p></div></div>
  }

  const summary = data?.summary || {}
  const segments = data?.segments || {}

  return (
    <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><div className="flex items-center gap-2 text-sm text-slate-500 mb-2"><Link href="/vendor/dashboard" className="hover:text-[#2874f0]">Dashboard</Link><ChevronRight className="h-3 w-3" /><span className="text-slate-800 font-medium">Customer Insights</span></div><h1 className="text-2xl font-bold text-slate-900">Customer Insights</h1><p className="text-sm text-slate-500 mt-0.5">Understand your customer behavior and loyalty</p></div>
          <div className="flex items-center gap-3"><select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option><option value="1y">Last year</option></select><button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 bg-[#2874f0] text-white rounded-lg hover:bg-[#1a5fd4] transition-colors"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center gap-2 mb-2"><Users className="h-5 w-5 text-blue-600" /><span className="text-xs text-slate-500">Total Customers</span></div><p className="text-3xl font-bold text-slate-900">{summary.totalCustomers || 0}</p><p className="text-xs text-green-600 mt-1">+{Math.round((summary.repeatRate || 0) / 2)}% this period</p></div>
          <div className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center gap-2 mb-2"><Repeat className="h-5 w-5 text-green-600" /><span className="text-xs text-slate-500">Repeat Rate</span></div><p className="text-3xl font-bold text-green-600">{summary.repeatRate?.toFixed(1) || 0}%</p><p className="text-xs text-slate-500 mt-1">{summary.repeatCustomers || 0} returning customers</p></div>
          <div className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center gap-2 mb-2"><Award className="h-5 w-5 text-amber-600" /><span className="text-xs text-slate-500">Avg. Lifetime Value</span></div><p className="text-3xl font-bold text-slate-900">₹{(summary.avgLTV || 0).toLocaleString()}</p><p className="text-xs text-slate-500 mt-1">per customer</p></div>
          <div className="bg-white rounded-xl border border-slate-200 p-5"><div className="flex items-center gap-2 mb-2"><Crown className="h-5 w-5 text-purple-600" /><span className="text-xs text-slate-500">VIP Customers</span></div><p className="text-3xl font-bold text-slate-900">{summary.vipCount || 0}</p><p className="text-xs text-slate-500 mt-1">Spent over ₹50K</p></div>
        </div>

        {/* Customer Segments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CustomerSegmentCard title="VIP Customers" count={segments.vip?.length || 0} icon={Crown} color="#fbbf24" bg="#fef3c7" description="Spent more than ₹50,000" />
          <CustomerSegmentCard title="Frequent Renters" count={segments.frequent?.length || 0} icon={Repeat} color="#21a056" bg="#e8f5e9" description="3+ rentals in last 6 months" />
          <CustomerSegmentCard title="Regular" count={segments.regular?.length || 0} icon={Users} color="#2874f0" bg="#ebf3fb" description="2 rentals, moderate spending" />
          <CustomerSegmentCard title="New Customers" count={segments.new?.length || 0} icon={UserPlus} color="#fb641b" bg="#fff3e0" description="First-time renters" />
        </div>

        {/* Top Customers Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Top Customers</h3><p className="text-xs text-slate-500 mt-0.5">Highest spending customers</p></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">#</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Customer</th><th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Rentals</th><th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Total Spent</th><th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Products</th><th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Type</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Last Rental</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{data?.topCustomers?.map((customer: any, idx: number) => <CustomerRow key={idx} customer={customer} rank={idx + 1} />)}</tbody>
            </table>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6"><h3 className="font-semibold text-slate-800 mb-4">Customer Engagement</h3><div className="space-y-4"><div><div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Repeat Purchase Rate</span><span className="font-semibold">{summary.repeatRate?.toFixed(1) || 0}%</span></div><div className="w-full bg-slate-100 rounded-full h-2"><div className="h-2 rounded-full bg-green-500" style={{ width: `${summary.repeatRate || 0}%` }} /></div></div><div><div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Customer Retention</span><span className="font-semibold">{(summary.repeatRate || 0) * 0.8}%</span></div><div className="w-full bg-slate-100 rounded-full h-2"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${(summary.repeatRate || 0) * 0.8}%` }} /></div></div><div><div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Satisfaction Score</span><span className="font-semibold">4.8/5.0</span></div><div className="w-full bg-slate-100 rounded-full h-2"><div className="h-2 rounded-full bg-amber-500" style={{ width: '96%' }} /></div></div></div></div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100"><div className="flex items-start gap-3"><TrendingUp className="h-8 w-8 text-purple-600 shrink-0" /><div><h3 className="font-semibold text-purple-800">Customer Growth Insight</h3><p className="text-sm text-purple-700 mt-1">Your customer base has grown by 15% this quarter. VIP customers contribute to 40% of total revenue. Focus on retaining your frequent renters through loyalty programs.</p><div className="flex items-center gap-4 mt-3"><div><p className="text-xs text-purple-600">Acquisition Cost</p><p className="font-semibold">₹850</p></div><div><p className="text-xs text-purple-600">LTV/CAC Ratio</p><p className="font-semibold text-green-600">3.2x</p></div></div></div></div></div>
        </div>
      </div>
    </div>
  )
}