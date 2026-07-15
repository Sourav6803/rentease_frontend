// app/vendor/security/layout.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield, Lock, Key, Fingerprint, Bell, Eye,
  Smartphone, AlertTriangle, CheckCircle, ChevronRight
} from 'lucide-react'

const securityNav = [
  { name: 'Security Overview', href: '/vendor/security', icon: Shield },
  { name: 'Two-Factor Authentication', href: '/vendor/security/2fa', icon: Smartphone },
  { name: 'Login Activity', href: '/vendor/security/login-activity', icon: Eye },
  { name: 'API Access', href: '/vendor/security/api', icon: Key },
  { name: 'Security Logs', href: '/vendor/security/logs', icon: Bell },
]

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/vendor/dashboard" className="hover:text-[#2874f0]">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-800 font-medium">Security Center</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Shield className="h-6 w-6 text-[#2874f0]" />
                Security Center
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Protect your account and business from unauthorized access
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Security Score: 92/100</span>
            </div>
          </div>
        </div>

        {/* Security Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 p-1 mb-6 overflow-x-auto">
          <nav className="flex gap-1 min-w-max">
            {securityNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
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

        {/* Security Tips Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Security Tip of the Day</p>
              <p className="text-sm text-amber-700">
                Never share your OTP or password with anyone. RentEase will never ask for your password or sensitive information via email or phone.
              </p>
            </div>
            <button className="text-xs text-amber-700 hover:text-amber-800 font-medium whitespace-nowrap">
              More Tips →
            </button>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}