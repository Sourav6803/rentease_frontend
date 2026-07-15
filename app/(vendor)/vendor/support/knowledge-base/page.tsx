// app/vendor/support/knowledge-base/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Search, BookOpen, ChevronRight, Video, FileText,
  TrendingUp, Users, DollarSign, Package, AlertCircle,
  Settings, Shield, CreditCard, Truck, Star, HelpCircle
} from 'lucide-react'

const categories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: BookOpen,
    color: '#2874f0',
    articles: [
      { title: 'How to set up your vendor profile', views: 1234, helpful: 98 },
      { title: 'Understanding your vendor dashboard', views: 892, helpful: 95 },
      { title: 'Complete your KYC verification', views: 2456, helpful: 92 },
      { title: 'Setting up payout methods', views: 1567, helpful: 96 },
    ]
  },
  {
    id: 'products',
    name: 'Product Management',
    icon: Package,
    color: '#21a056',
    articles: [
      { title: 'How to add new products', views: 3421, helpful: 97 },
      { title: 'Best practices for product listings', views: 1876, helpful: 94 },
      { title: 'Managing inventory efficiently', views: 2345, helpful: 93 },
      { title: 'Product pricing strategies', views: 987, helpful: 91 },
    ]
  },
  {
    id: 'orders',
    name: 'Order Management',
    icon: Truck,
    color: '#fb641b',
    articles: [
      { title: 'Processing customer orders', views: 2987, helpful: 96 },
      { title: 'Managing returns and exchanges', views: 1543, helpful: 94 },
      { title: 'Understanding order statuses', views: 876, helpful: 97 },
      { title: 'Delivery and tracking setup', views: 1234, helpful: 93 },
    ]
  },
  {
    id: 'payments',
    name: 'Payments & Payouts',
    icon: DollarSign,
    color: '#9c27b0',
    articles: [
      { title: 'How payouts work', views: 4567, helpful: 98 },
      { title: 'Understanding payment holds', views: 2345, helpful: 92 },
      { title: 'Tax and GST information', views: 1876, helpful: 89 },
      { title: 'Resolution of payment disputes', views: 987, helpful: 91 },
    ]
  },
  {
    id: 'maintenance',
    name: 'Maintenance Requests',
    icon: Settings,
    color: '#06b6d4',
    articles: [
      { title: 'Handling maintenance requests', views: 765, helpful: 95 },
      { title: 'Assigning technicians', views: 543, helpful: 93 },
      { title: 'SLA and response times', views: 432, helpful: 96 },
      { title: 'Cost calculation and billing', views: 321, helpful: 92 },
    ]
  },
  {
    id: 'support',
    name: 'Support & Disputes',
    icon: Shield,
    color: '#ef4444',
    articles: [
      { title: 'How to escalate an issue', views: 876, helpful: 94 },
      { title: 'Customer dispute resolution', views: 654, helpful: 91 },
      { title: 'Fraud protection measures', views: 543, helpful: 97 },
      { title: 'Vendor protection policies', views: 432, helpful: 96 },
    ]
  }
]

const trendingArticles = [
  { title: 'How to increase your sales on RentEase', views: 5678, helpful: 98 },
  { title: 'Understanding the new cancellation policy', views: 4321, helpful: 95 },
  { title: 'Tips for getting 5-star reviews', views: 3987, helpful: 97 },
  { title: 'Seasonal demand patterns for rentals', views: 2876, helpful: 93 },
]

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.articles.some(article => article.title.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2874f0] to-[#00a0e3] rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">How can we help you?</h2>
          <p className="text-white/80 mb-6">Search our knowledge base for instant answers</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for articles, guides, and FAQs..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Popular Topics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.slice(0, 4).map((category) => {
          const Icon = category.icon
          return (
            <motion.button
              key={category.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedCategory(category.id)}
              className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${category.color}10` }}>
                <Icon className="h-6 w-6" style={{ color: category.color }} />
              </div>
              <p className="font-semibold text-slate-800">{category.name}</p>
            </motion.button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories & Articles */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCategory ? (
            // Single Category View
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-sm text-[#2874f0] hover:underline mb-2 inline-flex items-center gap-1"
                  >
                    <ChevronRight className="h-3 w-3 rotate-180" />
                    Back to all topics
                  </button>
                  <h3 className="text-lg font-bold text-slate-900">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </h3>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {categories.find(c => c.id === selectedCategory)?.articles.map((article, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800 group-hover:text-[#2874f0] transition-colors">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span>{article.views} views</span>
                          <span>{article.helpful}% helpful</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#2874f0] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // All Categories View
            filteredCategories.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${category.color}10` }}>
                      <Icon className="h-5 w-5" style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{category.name}</h3>
                      <p className="text-xs text-slate-500">{category.articles.length} articles</p>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {category.articles.slice(0, 3).map((article, idx) => (
                      <div key={idx} className="px-6 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                        <p className="text-sm text-slate-700 hover:text-[#2874f0] transition-colors">
                          {article.title}
                        </p>
                      </div>
                    ))}
                    {category.articles.length > 3 && (
                      <div className="px-6 py-3 bg-slate-50">
                        <button
                          onClick={() => setSelectedCategory(category.id)}
                          className="text-sm text-[#2874f0] hover:underline flex items-center gap-1"
                        >
                          View all {category.articles.length} articles
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Sidebar - Trending & Video Guides */}
        <div className="space-y-6">
          {/* Trending Articles */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-slate-800">Trending Articles</h3>
            </div>
            <div className="space-y-3">
              {trendingArticles.map((article, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <p className="text-sm text-slate-700 group-hover:text-[#2874f0] transition-colors">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>{article.views} views</span>
                    <span>{article.helpful}% helpful</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Guides */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Video className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-slate-800">Video Guides</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-all">
                <p className="text-sm font-medium text-slate-800">Getting Started as a Vendor</p>
                <p className="text-xs text-slate-500 mt-1">5:23 min • Beginner</p>
              </div>
              <div className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-all">
                <p className="text-sm font-medium text-slate-800">How to Manage Orders</p>
                <p className="text-xs text-slate-500 mt-1">8:15 min • Intermediate</p>
              </div>
              <div className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-all">
                <p className="text-sm font-medium text-slate-800">Optimizing Your Listings</p>
                <p className="text-xs text-slate-500 mt-1">12:04 min • Advanced</p>
              </div>
            </div>
          </div>

          {/* Still Need Help */}
          <div className="bg-[#f1f3f6] rounded-xl p-5 text-center">
            <HelpCircle className="h-10 w-10 mx-auto text-[#2874f0] mb-3" />
            <h3 className="font-semibold text-slate-800 mb-1">Still need help?</h3>
            <p className="text-sm text-slate-500 mb-3">Can't find what you're looking for?</p>
            <Link
              href="/vendor/support/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors"
            >
              Contact Support
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}