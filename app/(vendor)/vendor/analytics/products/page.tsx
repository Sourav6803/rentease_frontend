// app/vendor/analytics/products/page.tsx (Product Performance)
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, TrendingUp, Star, Eye, ShoppingCart, Download, RefreshCw, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return { 'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '' }
}

function ProductRow({ product, rank }: { product: any; rank: number }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-slate-500">#{rank}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
            {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : <Package className="h-5 w-5 m-2.5 text-slate-400" />}
          </div>
          <div><p className="font-medium text-slate-800">{product.name}</p><p className="text-xs text-slate-500">₹{product.monthlyRent}/mo</p></div>
        </div>
      </td>
      <td className="px-4 py-3 text-center text-sm text-slate-600">{product.totalRentals}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">₹{(product.totalRevenue / 1000).toFixed(1)}K</td>
      <td className="px-4 py-3 text-center text-sm text-slate-600">{product.uniqueCustomers}</td>
      <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /><span className="text-sm text-slate-600">{product.rating || 'New'}</span></div></td>
      <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1"><Eye className="h-3 w-3 text-slate-400" /><span className="text-sm text-slate-600">{product.views || 0}</span></div></td>
      <td className="px-4 py-3 text-center"><span className={`inline-flex items-center gap-1 text-xs font-semibold ${product.conversionRate > 5 ? 'text-green-600' : product.conversionRate > 2 ? 'text-amber-600' : 'text-red-500'}`}>{product.conversionRate?.toFixed(1)}%</span></td>
    </tr>
  )
}

export default function ProductPerformancePage() {
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
      const res = await fetch(`${BASE_URL}/api/v1/vendor/analytics/products?period=${period}`, { headers })
      const result = await res.json()
      if (result.success) setData(result.data)
      else toast.error(result.message)
    } catch (error) {
      toast.error('Failed to load product data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center"><div className="flex flex-col items-center gap-3"><div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" /><p className="text-sm text-slate-500">Loading product data...</p></div></div>
  }

  const inventory = data?.inventoryStatus || {}

  return (
    <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><div className="flex items-center gap-2 text-sm text-slate-500 mb-2"><Link href="/vendor/dashboard" className="hover:text-[#2874f0]">Dashboard</Link><ChevronRight className="h-3 w-3" /><span className="text-slate-800 font-medium">Product Performance</span></div><h1 className="text-2xl font-bold text-slate-900">Product Performance</h1><p className="text-sm text-slate-500 mt-0.5">Track your product metrics and inventory</p></div>
          <div className="flex items-center gap-3"><select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option><option value="1y">Last year</option></select><button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 bg-[#2874f0] text-white rounded-lg hover:bg-[#1a5fd4] transition-colors"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-2xl font-bold text-slate-900">{data?.totalProducts || 0}</p><p className="text-xs text-slate-500">Total Products</p></div>
          <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-2xl font-bold text-green-600">{data?.activeProducts || 0}</p><p className="text-xs text-slate-500">Active Products</p></div>
          <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-2xl font-bold text-blue-600">{inventory.totalInventory || 0}</p><p className="text-xs text-slate-500">Total Inventory</p></div>
          <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-2xl font-bold text-amber-600">{inventory.availableInventory || 0}</p><p className="text-xs text-slate-500">Available Stock</p></div>
          <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-2xl font-bold text-purple-600">{inventory.utilizationRate?.toFixed(1) || 0}%</p><p className="text-xs text-slate-500">Utilization Rate</p></div>
        </div>

        {/* Alerts */}
        {(inventory.lowStockProducts > 0 || inventory.outOfStockProducts > 0) && <div className="bg-amber-50 rounded-xl p-4 border border-amber-200"><div className="flex items-start gap-3"><AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /><div><p className="font-semibold text-amber-800">Inventory Alert</p><p className="text-sm text-amber-700">{inventory.lowStockProducts} products are low on stock (less than 5 units) and {inventory.outOfStockProducts} are out of stock.</p></div></div></div>}

        {/* Top Products Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Top Performing Products</h3><p className="text-xs text-slate-500 mt-0.5">Ranked by revenue</p></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">#</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Product</th><th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Rentals</th><th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Revenue</th><th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Customers</th><th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Rating</th><th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Views</th><th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Conv. Rate</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{data?.topProducts?.map((product: any, idx: number) => <ProductRow key={idx} product={product} rank={idx + 1} />)}</tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6"><h3 className="font-semibold text-slate-800 mb-4">Sales by Category</h3><div className="space-y-3">{data?.categoryBreakdown?.map((item: any, idx: number) => (<div key={idx}><div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{item._id}</span><span className="font-semibold">₹{(item.totalRevenue / 1000).toFixed(1)}K ({item.totalRentals} rentals)</span></div><div className="w-full bg-slate-100 rounded-full h-2"><div className="h-2 rounded-full bg-gradient-to-r from-[#2874f0] to-[#00a0e3]" style={{ width: `${(item.totalRevenue / (data.categoryBreakdown[0]?.totalRevenue || 1)) * 100}%` }} /></div></div>))}</div></div>
          <div className="bg-white rounded-xl border border-slate-200 p-6"><h3 className="font-semibold text-slate-800 mb-4">Performance Insights</h3><div className="space-y-4"><div className="flex items-center justify-between p-3 bg-green-50 rounded-lg"><div><p className="text-sm font-medium text-green-800">Best Performing Category</p><p className="text-xs text-green-700">{data?.categoryBreakdown?.[0]?._id || 'N/A'}</p></div><TrendingUp className="h-5 w-5 text-green-600" /></div><div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"><div><p className="text-sm font-medium text-blue-800">Highest Rated Product</p><p className="text-xs text-blue-700">{data?.topProducts?.find((p: any) => p.rating > 4.5)?.name || 'N/A'}</p></div><Star className="h-5 w-5 text-amber-400 fill-amber-400" /></div><div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"><div><p className="text-sm font-medium text-purple-800">Most Viewed Product</p><p className="text-xs text-purple-700">{data?.topProducts?.reduce((max: any, p: any) => (p.views > (max?.views || 0) ? p : max), null)?.name || 'N/A'}</p></div><Eye className="h-5 w-5 text-purple-600" /></div></div></div>
        </div>
      </div>
    </div>
  )
}