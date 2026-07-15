// app/vendor/payments/layout.tsx
'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, History, Building2, FileText, CreditCard,
  DollarSign, TrendingUp, Wallet, Calendar, Download, Settings,
  Shield, ChevronRight, CircleDollarSign, Receipt, Banknote
} from 'lucide-react'

const navItems = [
  { 
    name: 'Overview', 
    href: '/vendor/payments', 
    icon: LayoutDashboard,
    description: 'Payment summary & analytics'
  },
  { 
    name: 'Payout History', 
    href: '/vendor/payments/payout-history', 
    icon: History,
    description: 'View all your payouts'
  },
  { 
    name: 'Bank Details', 
    href: '/vendor/payments/bank-details', 
    icon: Building2,
    description: 'Manage your bank account'
  },
  { 
    name: 'Invoices', 
    href: '/vendor/payments/invoices', 
    icon: FileText,
    description: 'Download payment receipts'
  },
]

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/vendor/dashboard" className="hover:text-[#2874f0]">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-800 font-medium">Payments & Payouts</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments & Payouts</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage your earnings, payouts, and banking information
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Secure Payments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-1 mb-6">
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href === '/vendor/payments' && pathname === '/vendor/payments')
              
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

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}