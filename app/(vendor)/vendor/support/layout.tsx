// app/vendor/support/layout.tsx
'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MessageCircle, FileText, BookOpen, Phone, Mail,
  ChevronRight, Headphones, Clock, Star, Shield,
  HelpCircle, LifeBuoy, FileQuestion, Users
} from 'lucide-react'

const navItems = [
  { name: 'My Tickets', href: '/vendor/support', icon: MessageCircle, description: 'View and manage your support tickets' },
  { name: 'Knowledge Base', href: '/vendor/support/knowledge-base', icon: BookOpen, description: 'FAQs and helpful articles' },
  { name: 'Contact Support', href: '/vendor/support/contact', icon: Headphones, description: 'Get in touch with our team' },
]

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/vendor/dashboard" className="hover:text-[#2874f0]">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-800 font-medium">Support Center</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Center</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Get help with your account, orders, or technical issues
              </p>
            </div>
            <Link
              href="/vendor/support/new"
              className="flex items-center gap-2 px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Create New Ticket
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-1 mb-6">
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href === '/vendor/support' && pathname === '/vendor/support')
              
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

        {/* Quick Support Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">24/7 Phone Support</p>
                <p className="text-xs text-slate-500">Call us anytime at</p>
                <p className="text-sm font-bold text-blue-600">+91 1800 123 4567</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Email Support</p>
                <p className="text-xs text-slate-500">Send us an email at</p>
                <p className="text-sm font-bold text-green-600">vendor@rentease.com</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Response Time</p>
                <p className="text-xs text-slate-500">Avg. response within</p>
                <p className="text-sm font-bold text-amber-600">2-4 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {children}
      </div>
    </div>
  )
}