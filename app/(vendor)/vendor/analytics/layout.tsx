// app/vendor/analytics/layout.tsx
'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, Package, Users,
  Calendar, Download, RefreshCw, ChevronRight
} from 'lucide-react'

const analyticsNav = [
  { name: 'Overview', href: '/vendor/analytics', icon: LayoutDashboard },
  { name: 'Sales Report', href: '/vendor/analytics/sales', icon: TrendingUp },
  { name: 'Product Performance', href: '/vendor/analytics/products', icon: Package },
  { name: 'Customer Insights', href: '/vendor/analytics/customers', icon: Users },
]

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [period, setPeriod] = useState('30d')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    // Export logic here
    setTimeout(() => setIsExporting(false), 1000)
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/vendor/dashboard" className="hover:text-[#2874f0]">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-800 font-medium">Analytics</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Track your business performance and growth metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white transition-colors disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-[#2874f0] text-white rounded-lg hover:bg-[#1a5fd4] transition-colors">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-1 mb-6">
          <nav className="flex gap-1">
            {analyticsNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href === '/vendor/analytics' && pathname === '/vendor/analytics')
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#2874f0] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Period Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-500">
              Showing data for {period === '7d' ? 'last 7 days' : period === '30d' ? 'last 30 days' : period === '90d' ? 'last 90 days' : 'last year'}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}