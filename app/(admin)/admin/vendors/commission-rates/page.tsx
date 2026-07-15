
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Percent, DollarSign, TrendingUp, Users, Package, Award,
  Star, Zap, Plus, Edit, Trash2, Save, X, CheckCircle,
  AlertCircle, Loader2, Search, Filter, ChevronLeft, ChevronRight,
  MoreVertical, Eye, Calendar, Clock, BarChart3, PieChart,
  LineChart, Activity, Shield, Building2, User, Tag, Layers,
  Settings, RefreshCw, Download, Upload, History, AlertTriangle,
  Check, ChevronDown, ArrowUpRight, ArrowDownRight, Sparkles,
  Target, Gem, Crown, Medal, TrendingDown, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ─── Types ────────────────────────────────────────────────────────────────────
interface CommissionSettings {
  defaultRate: number; minRate: number; maxRate: number
  type: 'percentage' | 'fixed'; effectiveFrom: string
}
interface PerformanceTier {
  _id: string; name: string; minRentals: number; maxRentals: number
  rate: number; description?: string; isActive: boolean; createdAt: string
  color: string; icon: string
}
interface CategoryRate {
  _id: string; categoryId: string; categoryName: string; rate: number
  effectiveFrom: string; effectiveTo?: string; isActive: boolean
  createdBy: string; createdAt: string
}
interface VendorRate {
  _id: string; vendorId: string; vendorName: string; businessName: string
  rate: number; type: 'percentage' | 'fixed'; reason?: string
  validFrom: string; validTo?: string; isActive: boolean
  approvedBy: string; createdAt: string
}
interface CommissionStats {
  averageRate: number; totalVendors: number; customRatesCount: number
  defaultRatesCount: number; totalCommissionEarned: number; projectedCommission: number
  monthlyTrend: Array<{ month: string; amount: number; growth: number }>
  categoryBreakdown: Array<{ name: string; rate: number; vendors: number; color: string }>
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const mockCategories = [
  { _id: '1', name: 'Furniture' }, { _id: '2', name: 'Electronics' },
  { _id: '3', name: 'Home Appliances' }, { _id: '4', name: 'Kids & Baby' },
  { _id: '5', name: 'Sports & Fitness' },
]
const mockVendors = [
  { _id: '1', businessName: 'Furniture World', ownerName: 'Rajesh Kumar' },
  { _id: '2', businessName: 'ElectroHub', ownerName: 'Priya Sharma' },
  { _id: '3', businessName: 'Appliance Center', ownerName: 'Amit Patel' },
]
const mockCategoryRates: CategoryRate[] = [
  { _id: '1', categoryId: '1', categoryName: 'Furniture', rate: 12, effectiveFrom: '2024-01-01', isActive: true, createdBy: 'Admin', createdAt: '2024-01-01' },
  { _id: '2', categoryId: '2', categoryName: 'Electronics', rate: 8, effectiveFrom: '2024-02-01', isActive: true, createdBy: 'Admin', createdAt: '2024-02-01' },
  { _id: '3', categoryId: '3', categoryName: 'Home Appliances', rate: 10, effectiveFrom: '2024-01-15', isActive: false, createdBy: 'Admin', createdAt: '2024-01-15' },
]
const mockVendorRates: VendorRate[] = [
  { _id: '1', vendorId: '1', vendorName: 'Rajesh Kumar', businessName: 'Furniture World', rate: 7.5, type: 'percentage', reason: 'Long-term premium partner', validFrom: '2024-01-01', isActive: true, approvedBy: 'Admin', createdAt: '2024-01-01' },
  { _id: '2', vendorId: '2', vendorName: 'Priya Sharma', businessName: 'ElectroHub', rate: 500, type: 'fixed', reason: 'Trial period discount', validFrom: '2024-03-01', validTo: '2024-06-30', isActive: true, approvedBy: 'Admin', createdAt: '2024-03-01' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const tierConfig: Record<string, { gradient: string; glow: string; icon: React.ReactNode }> = {
  Bronze: { gradient: 'from-amber-100 via-amber-50 to-amber-100', glow: 'shadow-amber-500/20', icon: <Medal className="h-5 w-5" /> },
  Silver: { gradient: 'from-slate-100 via-slate-50 to-slate-100', glow: 'shadow-slate-400/20', icon: <Star className="h-5 w-5" /> },
  Gold: { gradient: 'from-yellow-100 via-yellow-50 to-yellow-100', glow: 'shadow-yellow-500/20', icon: <Award className="h-5 w-5" /> },
  Platinum: { gradient: 'from-cyan-100 via-cyan-50 to-cyan-100', glow: 'shadow-cyan-500/20', icon: <Crown className="h-5 w-5" /> },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent, delta }:
  { icon: React.ReactNode; label: string; value: string; sub?: string; accent: string; delta?: { value: string; up: boolean } }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${accent} border border-gray-200 shadow-md`}>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm">{icon}</div>
            {delta && (
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${delta.up ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {delta.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {delta.value}
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
          {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
      </div>
    </motion.div>
  )
}

function TrendChart({ data }: { data: Array<{ month: string; amount: number; growth: number }> }) {
  const max = Math.max(...data.map(d => d.amount))
  return (
    <div className="flex items-end gap-2 h-24 pt-2">
      {data.map((item, i) => {
        const h = Math.round((item.amount / max) * 100)
        const isLast = i === data.length - 1
        return (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-gray-700 shadow-xl">
              ₹{(item.amount / 1000).toFixed(0)}K
              <span className={`ml-1 ${item.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {item.growth >= 0 ? '+' : ''}{item.growth}%
              </span>
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: 'easeOut' }}
              className={`w-full rounded-t-lg ${isLast
                ? 'bg-gradient-to-t from-emerald-600 to-emerald-500 shadow-md shadow-emerald-500/30'
                : 'bg-gradient-to-t from-blue-500/60 to-blue-400/60 group-hover:from-blue-500/80 group-hover:to-blue-400/80'
              } transition-colors cursor-pointer`}
            />
            <span className="text-[10px] text-gray-500 font-medium">{item.month}</span>
          </div>
        )
      })}
    </div>
  )
}

function CategoryBreakdownChart({ data }: { data: Array<{ name: string; rate: number; vendors: number; color: string }> }) {
  const total = data.reduce((sum, d) => sum + d.vendors, 0)
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.name} className="group">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${item.color}`} />
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{item.vendors} vendors</span>
              <span className="text-sm font-bold text-gray-900">{item.rate}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.vendors / total) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${item.color.replace('bg-', 'bg-')}`}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommissionRatesPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [settings, setSettings] = useState<CommissionSettings>({
    defaultRate: 10, minRate: 5, maxRate: 25,
    type: 'percentage', effectiveFrom: new Date().toISOString().split('T')[0]
  })

  const [tiers, setTiers] = useState<PerformanceTier[]>([
    { _id: '1', name: 'Bronze', minRentals: 0, maxRentals: 50, rate: 12, description: 'New vendors starting their journey', isActive: true, createdAt: new Date().toISOString(), color: 'amber', icon: 'medal' },
    { _id: '2', name: 'Silver', minRentals: 51, maxRentals: 200, rate: 10, description: 'Growing vendors building momentum', isActive: true, createdAt: new Date().toISOString(), color: 'slate', icon: 'star' },
    { _id: '3', name: 'Gold', minRentals: 201, maxRentals: 500, rate: 8, description: 'Established high-performing vendors', isActive: true, createdAt: new Date().toISOString(), color: 'yellow', icon: 'award' },
    { _id: '4', name: 'Platinum', minRentals: 501, maxRentals: 9999, rate: 6, description: 'Elite top-tier vendors', isActive: true, createdAt: new Date().toISOString(), color: 'cyan', icon: 'crown' },
  ])

  const [categoryRates, setCategoryRates] = useState<CategoryRate[]>(mockCategoryRates)
  const [vendorRates, setVendorRates] = useState<VendorRate[]>(mockVendorRates)
  const [stats, setStats] = useState<CommissionStats>({
    averageRate: 9.5, totalVendors: 156, customRatesCount: 23, defaultRatesCount: 133,
    totalCommissionEarned: 2450000, projectedCommission: 3200000,
    monthlyTrend: [
      { month: 'Jan', amount: 180000, growth: 0 },
      { month: 'Feb', amount: 195000, growth: 8.3 },
      { month: 'Mar', amount: 210000, growth: 7.7 },
      { month: 'Apr', amount: 228000, growth: 8.6 },
      { month: 'May', amount: 245000, growth: 7.5 },
      { month: 'Jun', amount: 268000, growth: 9.4 },
    ],
    categoryBreakdown: [
      { name: 'Furniture', rate: 12, vendors: 42, color: 'bg-amber-500' },
      { name: 'Electronics', rate: 8, vendors: 38, color: 'bg-blue-500' },
      { name: 'Appliances', rate: 10, vendors: 31, color: 'bg-purple-500' },
      { name: 'Kids & Baby', rate: 11, vendors: 25, color: 'bg-pink-500' },
      { name: 'Sports', rate: 9, vendors: 20, color: 'bg-emerald-500' },
    ]
  })

  // Modal states
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false)
  const [isEditTierModalOpen, setIsEditTierModalOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<PerformanceTier | null>(null)

  const [newCategoryRate, setNewCategoryRate] = useState({ categoryId: '', rate: 10, effectiveFrom: new Date().toISOString().split('T')[0] })
  const [newVendorRate, setNewVendorRate] = useState({ vendorId: '', rate: 10, type: 'percentage' as 'percentage' | 'fixed', reason: '', validFrom: new Date().toISOString().split('T')[0], validTo: '' })
  const [newTier, setNewTier] = useState({ name: '', minRentals: 0, maxRentals: 0, rate: 10, description: '' })

  const handleSaveSettings = async () => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 900))
    toast.success('Commission settings updated successfully')
    setIsSaving(false)
  }

  const handleAddCategoryRate = () => {
    if (!newCategoryRate.categoryId) { toast.error('Please select a category'); return }
    const cat = mockCategories.find(c => c._id === newCategoryRate.categoryId)
    const newRate: CategoryRate = {
      _id: Date.now().toString(), categoryId: newCategoryRate.categoryId,
      categoryName: cat?.name || '', rate: newCategoryRate.rate,
      effectiveFrom: newCategoryRate.effectiveFrom, isActive: true,
      createdBy: 'Admin', createdAt: new Date().toISOString()
    }
    setCategoryRates(prev => [...prev, newRate])
    toast.success('Category rate added')
    setIsAddCategoryModalOpen(false)
    setNewCategoryRate({ categoryId: '', rate: 10, effectiveFrom: new Date().toISOString().split('T')[0] })
  }

  const handleAddVendorRate = () => {
    if (!newVendorRate.vendorId) { toast.error('Please select a vendor'); return }
    const v = mockVendors.find(v => v._id === newVendorRate.vendorId)
    const newRate: VendorRate = {
      _id: Date.now().toString(), vendorId: newVendorRate.vendorId,
      vendorName: v?.ownerName || '', businessName: v?.businessName || '',
      rate: newVendorRate.rate, type: newVendorRate.type, reason: newVendorRate.reason,
      validFrom: newVendorRate.validFrom, validTo: newVendorRate.validTo || undefined,
      isActive: true, approvedBy: 'Admin', createdAt: new Date().toISOString()
    }
    setVendorRates(prev => [...prev, newRate])
    toast.success('Vendor rate added')
    setIsAddVendorModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900">
      <div className="relative z-10 p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
                <Percent className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Revenue Operations</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
              Commission Rate Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Configure platform earnings, performance tiers, and vendor incentives</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm"
              className="gap-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all">
              <Download className="h-3.5 w-3.5" /> Export Report
            </Button>
            <Button size="sm"
              className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white border-0 shadow-md shadow-emerald-500/20 transition-all">
              <Sparkles className="h-3.5 w-3.5" /> Auto-Optimize
            </Button>
          </div>
        </motion.div>

        {/* ── Alert Banner ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs">Rate changes take effect immediately. Ensure tier thresholds don't overlap. Always set an <strong>Effective From</strong> date for audit compliance.</p>
          <button className="ml-auto shrink-0 text-amber-600/60 hover:text-amber-700"><X className="h-3.5 w-3.5" /></button>
        </motion.div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Percent className="h-5 w-5 text-gray-700" />} label="Platform Avg. Rate" value={`${stats.averageRate}%`} sub="Across all vendors" accent="from-blue-100 via-blue-50 to-indigo-100" delta={{ value: '0.3%', up: true }} />
          <StatCard icon={<Users className="h-5 w-5 text-gray-700" />} label="Active Vendors" value={`${stats.totalVendors}`} sub={`${stats.customRatesCount} on custom rates`} accent="from-violet-100 via-violet-50 to-purple-100" delta={{ value: '12 new', up: true }} />
          <StatCard icon={<TrendingUp className="h-5 w-5 text-gray-700" />} label="Commission Earned" value={`₹${(stats.totalCommissionEarned / 100000).toFixed(1)}L`} sub="All time total" accent="from-emerald-100 via-emerald-50 to-teal-100" delta={{ value: '18.3%', up: true }} />
          <StatCard icon={<Target className="h-5 w-5 text-gray-700" />} label="Projected (FY)" value={`₹${(stats.projectedCommission / 100000).toFixed(1)}L`} sub="Based on current trend" accent="from-orange-100 via-orange-50 to-rose-100" delta={{ value: '30.6%', up: true }} />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Monthly Trend */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Monthly Commission Revenue</h3>
                <p className="text-xs text-gray-500 mt-0.5">Platform earnings from vendor commissions</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <TrendingUp className="h-3 w-3" /> +9.4% MoM
                </span>
              </div>
            </div>
            <TrendChart data={stats.monthlyTrend} />
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>Hover bars for details</span>
              <span className="flex items-center gap-2">
                <span className="flex items-center gap-1"><div className="h-2 w-3 rounded-sm bg-gradient-to-r from-emerald-600 to-emerald-500" />Latest</span>
                <span className="flex items-center gap-1"><div className="h-2 w-3 rounded-sm bg-blue-500/60" />Previous</span>
              </span>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-1">Category Rate Split</h3>
            <p className="text-xs text-gray-500 mb-5">Commission rates by product type</p>
            <CategoryBreakdownChart data={stats.categoryBreakdown} />
            <div className="mt-5 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Highest rate</span>
                <span className="text-xs font-bold text-amber-600">Furniture — 12%</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">Lowest rate</span>
                <span className="text-xs font-bold text-blue-600">Electronics — 8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Insights ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Revenue at Risk', value: '₹0', desc: 'Expiring rates in 30d', icon: <AlertCircle className="h-4 w-4 text-rose-600" />, color: 'border-rose-200 bg-rose-50' },
            { label: 'Tier Promotions', value: '14', desc: 'Vendors eligible to upgrade', icon: <TrendingUp className="h-4 w-4 text-emerald-600" />, color: 'border-emerald-200 bg-emerald-50' },
            { label: 'Pending Approvals', value: '3', desc: 'Custom rates awaiting review', icon: <Clock className="h-4 w-4 text-amber-600" />, color: 'border-amber-200 bg-amber-50' },
            { label: 'Policy Compliance', value: '98.7%', desc: 'Vendors within allowed range', icon: <Shield className="h-4 w-4 text-blue-600" />, color: 'border-blue-200 bg-blue-50' },
          ].map((insight) => (
            <div key={insight.label} className={`rounded-xl border p-4 ${insight.color}`}>
              <div className="flex items-center gap-2 mb-2">{insight.icon}<span className="text-xs text-gray-600">{insight.label}</span></div>
              <p className="text-xl font-bold text-gray-900">{insight.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{insight.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Main Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100 border border-gray-200 p-1 rounded-xl h-auto gap-1 w-full max-w-3xl">
            {[
              { value: 'overview', icon: <Settings className="h-3.5 w-3.5" />, label: 'Settings' },
              { value: 'tiers', icon: <Award className="h-3.5 w-3.5" />, label: 'Tiers' },
              { value: 'categories', icon: <Layers className="h-3.5 w-3.5" />, label: 'Categories' },
              { value: 'vendors', icon: <Building2 className="h-3.5 w-3.5" />, label: 'Vendors' },
              { value: 'history', icon: <History className="h-3.5 w-3.5" />, label: 'History' },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="flex-1 gap-1.5 text-xs font-medium rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all">
                {tab.icon}{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Overview Tab ── */}
          <TabsContent value="overview" className="mt-6 space-y-5">
            <div className="grid lg:grid-cols-3 gap-5">
              {/* Settings card */}
              <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-1.5 rounded-lg bg-blue-100"><Settings className="h-4 w-4 text-blue-600" /></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Default Commission Configuration</h3>
                    <p className="text-xs text-gray-500">Applied to all vendors without custom rates</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Default Rate (%)', key: 'defaultRate', type: 'number' },
                    { label: 'Minimum Rate (%)', key: 'minRate', type: 'number' },
                    { label: 'Maximum Rate (%)', key: 'maxRate', type: 'number' },
                    { label: 'Effective From', key: 'effectiveFrom', type: 'date' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">{field.label}</label>
                      <input
                        type={field.type}
                        value={(settings as any)[field.key]}
                        onChange={(e) => setSettings({ ...settings, [field.key]: field.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Commission Type</label>
                    <div className="flex gap-2">
                      {(['percentage', 'fixed'] as const).map((t) => (
                        <button key={t} onClick={() => setSettings({ ...settings, type: t })}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${settings.type === t
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 border-emerald-500 text-white'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'}`}>
                          {t === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-5 border-t border-gray-200 flex justify-end">
                  <button onClick={handleSaveSettings} disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-60">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Rate policy card */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-purple-100"><Shield className="h-4 w-4 text-purple-600" /></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Rate Policy</h3>
                    <p className="text-xs text-gray-500">Auto-enforcement rules</p>
                  </div>
                </div>
                {[
                  { label: 'Enforce Rate Boundaries', desc: 'Block rates outside min/max', enabled: true },
                  { label: 'Performance Auto-Tier', desc: 'Auto-assign tiers on milestones', enabled: true },
                  { label: 'Rate Expiry Alerts', desc: 'Notify 7 days before expiry', enabled: true },
                  { label: 'Require Approval', desc: 'For custom vendor rates', enabled: false },
                ].map((rule) => (
                  <div key={rule.label} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-gray-700">{rule.label}</p>
                      <p className="text-xs text-gray-500">{rule.desc}</p>
                    </div>
                    <div className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${rule.enabled ? 'bg-emerald-500' : 'bg-gray-300'} relative`}>
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                ))}

                {/* Rate distribution */}
                <div className="pt-2">
                  <p className="text-xs font-medium text-gray-700 mb-3">Vendor Distribution</p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Default rate — {stats.defaultRatesCount} vendors</span>
                        <span className="text-gray-900 font-medium">85%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Custom rates — {stats.customRatesCount} vendors</span>
                        <span className="text-gray-900 font-medium">15%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} transition={{ duration: 0.8, delay: 0.1 }} className="h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Performance Tiers Tab ── */}
          <TabsContent value="tiers" className="mt-6">
            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">Performance-Based Tiers</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Rewards vendors with lower rates as they scale rental volume</p>
                </div>
                <button onClick={() => { setSelectedTier(null); setIsEditTierModalOpen(true) }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium hover:from-blue-500 hover:to-blue-600 shadow-md transition-all">
                  <Plus className="h-4 w-4" /> Add Tier
                </button>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {tiers.map((tier, i) => {
                  const cfg = tierConfig[tier.name] || tierConfig.Bronze
                  return (
                    <motion.div key={tier._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br ${cfg.gradient} p-5 shadow-md ${cfg.glow} group cursor-pointer`}>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-white/50 rounded-xl shadow-sm">{cfg.icon}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tier.isActive ? 'bg-white/60 text-gray-700' : 'bg-gray-100 text-gray-500'}`}>
                            {tier.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{tier.name}</h4>
                        <p className="text-sm text-gray-600 mt-0.5">{tier.description}</p>
                        <div className="mt-3 pt-3 border-t border-gray-200/50 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">Rentals</p>
                            <p className="text-sm font-semibold text-gray-900">{tier.minRentals}–{tier.maxRentals >= 9999 ? '∞' : tier.maxRentals}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Commission</p>
                            <p className="text-2xl font-bold text-gray-900">{tier.rate}%</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setSelectedTier(tier); setIsEditTierModalOpen(true) }}
                            className="flex-1 py-1.5 rounded-lg bg-white/60 hover:bg-white/80 text-gray-700 text-xs font-medium transition-all flex items-center justify-center gap-1">
                            <Edit className="h-3 w-3" /> Edit
                          </button>
                          <button className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 transition-all">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Tier progression visual */}
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Tier Progression Path</p>
                <div className="flex items-center gap-2">
                  {tiers.map((tier, i) => {
                    const cfg = tierConfig[tier.name] || tierConfig.Bronze
                    return (
                      <div key={tier._id} className="flex items-center gap-2 flex-1">
                        <div className={`flex-1 rounded-lg bg-gradient-to-r ${cfg.gradient} p-3 text-center border border-gray-200`}>
                          <p className="text-xs font-bold text-gray-700">{tier.name}</p>
                          <p className="text-lg font-bold text-gray-900">{tier.rate}%</p>
                          <p className="text-xs text-gray-500">{tier.minRentals}+ rentals</p>
                        </div>
                        {i < tiers.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Categories Tab ── */}
          <TabsContent value="categories" className="mt-6">
            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">Category-Wise Commission Rates</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Override default rate for specific product categories</p>
                </div>
                <button onClick={() => setIsAddCategoryModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium hover:from-purple-500 hover:to-purple-600 shadow-md transition-all">
                  <Plus className="h-4 w-4" /> Add Category Rate
                </button>
              </div>

              {categoryRates.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-4 rounded-2xl bg-gray-100 inline-flex mb-4"><Layers className="h-8 w-8 text-gray-400" /></div>
                  <p className="text-gray-600 font-medium">No category rates configured</p>
                  <p className="text-xs text-gray-500 mt-1">All categories use the default rate of {settings.defaultRate}%</p>
                  <button onClick={() => setIsAddCategoryModalOpen(true)} className="mt-4 px-4 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm hover:border-gray-400 hover:text-gray-900 transition-all">
                    Configure first category rate
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {categoryRates.map((rate) => (
                    <div key={rate._id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 border border-purple-200">
                          <Layers className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{rate.categoryName}</p>
                          <p className="text-xs text-gray-500">Effective {format(new Date(rate.effectiveFrom), 'dd MMM yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{rate.rate}%</p>
                          <p className="text-xs text-gray-500">{rate.rate > settings.defaultRate ? '+' : ''}{(rate.rate - settings.defaultRate).toFixed(1)}% vs default</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${rate.isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-200 text-gray-600'}`}>
                          {rate.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all"><Edit className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setCategoryRates(prev => prev.filter(r => r._id !== rate._id))} className="p-1.5 rounded-lg hover:bg-rose-100 text-gray-500 hover:text-rose-600 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Vendors Tab ── */}
          <TabsContent value="vendors" className="mt-6">
            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">Vendor-Specific Custom Rates</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Override rates for individual vendors — useful for premium partnerships or promotions</p>
                </div>
                <button onClick={() => setIsAddVendorModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-medium hover:from-emerald-500 hover:to-emerald-600 shadow-md transition-all">
                  <Plus className="h-4 w-4" /> Add Vendor Rate
                </button>
              </div>

              {vendorRates.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-4 rounded-2xl bg-gray-100 inline-flex mb-4"><Building2 className="h-8 w-8 text-gray-400" /></div>
                  <p className="text-gray-600 font-medium">No vendor-specific rates</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendorRates.map((rate) => (
                    <div key={rate._id} className="p-5 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-100 to-blue-100 border border-emerald-200 flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-700">{rate.businessName.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{rate.businessName}</p>
                            <p className="text-xs text-gray-500">{rate.vendorName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{rate.rate}{rate.type === 'percentage' ? '%' : '₹'}</p>
                            <span className="text-xs text-gray-500 capitalize">{rate.type} commission</span>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${rate.isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-200 text-gray-600'}`}>
                            {rate.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all"><Edit className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setVendorRates(prev => prev.filter(r => r._id !== rate._id))} className="p-1.5 rounded-lg hover:bg-rose-100 text-gray-500 hover:text-rose-600 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      </div>
                      {rate.reason && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <Info className="h-3 w-3 shrink-0" />
                          <span>{rate.reason}</span>
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />From {format(new Date(rate.validFrom), 'dd MMM yyyy')}</span>
                        {rate.validTo && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Until {format(new Date(rate.validTo), 'dd MMM yyyy')}</span>}
                        {!rate.validTo && <span className="text-emerald-600">No expiry</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── History Tab ── */}
          <TabsContent value="history" className="mt-6">
            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">Commission Change History</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Full audit trail of all rate modifications</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm hover:border-gray-400 hover:text-gray-900 transition-all">
                  <Download className="h-3.5 w-3.5" /> Export Log
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { action: 'Default rate updated', from: '11%', to: '10%', by: 'Admin', time: '2 days ago', type: 'update' },
                  { action: 'Platinum tier added', from: '—', to: '6%', by: 'Admin', time: '1 week ago', type: 'create' },
                  { action: 'Furniture category rate set', from: 'Default', to: '12%', by: 'Admin', time: '2 weeks ago', type: 'create' },
                  { action: 'ElectroHub custom rate added', from: 'Default', to: '8%', by: 'Admin', time: '1 month ago', type: 'create' },
                  { action: 'Minimum rate changed', from: '3%', to: '5%', by: 'Admin', time: '6 weeks ago', type: 'update' },
                ].map((entry, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all">
                    <div className={`p-2 rounded-lg shrink-0 ${entry.type === 'create' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                      {entry.type === 'create' ? <Plus className="h-3.5 w-3.5 text-emerald-600" /> : <Edit className="h-3.5 w-3.5 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                      <p className="text-xs text-gray-500 mt-0.5">By {entry.by} · {entry.time}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs shrink-0">
                      <span className="text-gray-500 px-2 py-1 rounded-md bg-gray-200">{entry.from}</span>
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-900 px-2 py-1 rounded-md bg-emerald-100 text-emerald-700">{entry.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Modal: Add Category Rate ── */}
      <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
        <DialogContent className="bg-white border border-gray-200 text-gray-900 max-w-md shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-purple-100"><Layers className="h-4 w-4 text-purple-600" /></div>
              Add Category Rate
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-xs">Override the default commission for a specific category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Product Category *</label>
              <select value={newCategoryRate.categoryId} onChange={(e) => setNewCategoryRate({ ...newCategoryRate, categoryId: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                <option value="">Select a category…</option>
                {mockCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Commission Rate (%) *</label>
              <input type="number" value={newCategoryRate.rate} onChange={(e) => setNewCategoryRate({ ...newCategoryRate, rate: parseFloat(e.target.value) })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              <p className="text-xs text-gray-500 mt-1">Default rate: {settings.defaultRate}% · Allowed: {settings.minRate}%–{settings.maxRate}%</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Effective From</label>
              <input type="date" value={newCategoryRate.effectiveFrom} onChange={(e) => setNewCategoryRate({ ...newCategoryRate, effectiveFrom: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setIsAddCategoryModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm hover:border-gray-400 hover:text-gray-900 transition-all">Cancel</button>
            <button onClick={handleAddCategoryRate} className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium hover:from-purple-500 hover:to-purple-600 transition-all flex items-center gap-2">
              <Plus className="h-3.5 w-3.5" /> Add Rate
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Add Vendor Rate ── */}
      <Dialog open={isAddVendorModalOpen} onOpenChange={setIsAddVendorModalOpen}>
        <DialogContent className="bg-white border border-gray-200 text-gray-900 max-w-md shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-emerald-100"><Building2 className="h-4 w-4 text-emerald-600" /></div>
              Add Vendor Rate
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-xs">Set a custom commission rate for a specific vendor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Vendor *</label>
              <select value={newVendorRate.vendorId} onChange={(e) => setNewVendorRate({ ...newVendorRate, vendorId: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                <option value="">Select a vendor…</option>
                {mockVendors.map(v => <option key={v._id} value={v._id}>{v.businessName} — {v.ownerName}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">Rate *</label>
                <input type="number" value={newVendorRate.rate} onChange={(e) => setNewVendorRate({ ...newVendorRate, rate: parseFloat(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">Type</label>
                <div className="flex gap-1.5 mt-1">
                  {(['percentage', 'fixed'] as const).map((t) => (
                    <button key={t} onClick={() => setNewVendorRate({ ...newVendorRate, type: t })}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${newVendorRate.type === t ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'}`}>
                      {t === 'percentage' ? '%' : '₹'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Reason (Optional)</label>
              <textarea value={newVendorRate.reason} onChange={(e) => setNewVendorRate({ ...newVendorRate, reason: e.target.value })}
                placeholder="e.g., Long-term partnership discount"
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">Valid From</label>
                <input type="date" value={newVendorRate.validFrom} onChange={(e) => setNewVendorRate({ ...newVendorRate, validFrom: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">Valid To (Optional)</label>
                <input type="date" value={newVendorRate.validTo} onChange={(e) => setNewVendorRate({ ...newVendorRate, validTo: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setIsAddVendorModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm hover:border-gray-400 hover:text-gray-900 transition-all">Cancel</button>
            <button onClick={handleAddVendorRate} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-medium hover:from-emerald-500 hover:to-emerald-600 transition-all flex items-center gap-2">
              <Plus className="h-3.5 w-3.5" /> Add Rate
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Add/Edit Tier ── */}
      <Dialog open={isEditTierModalOpen} onOpenChange={setIsEditTierModalOpen}>
        <DialogContent className="bg-white border border-gray-200 text-gray-900 max-w-md shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-lg bg-amber-100"><Award className="h-4 w-4 text-amber-600" /></div>
              {selectedTier ? 'Edit Performance Tier' : 'Add Performance Tier'}
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-xs">Configure commission rates tied to rental volume milestones</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Tier Name *</label>
              <input value={selectedTier ? selectedTier.name : newTier.name}
                onChange={(e) => selectedTier ? setSelectedTier({ ...selectedTier, name: e.target.value }) : setNewTier({ ...newTier, name: e.target.value })}
                placeholder="e.g., Diamond"
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">Min Rentals</label>
                <input type="number" value={selectedTier ? selectedTier.minRentals : newTier.minRentals}
                  onChange={(e) => selectedTier ? setSelectedTier({ ...selectedTier, minRentals: parseInt(e.target.value) }) : setNewTier({ ...newTier, minRentals: parseInt(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">Max Rentals</label>
                <input type="number" value={selectedTier ? selectedTier.maxRentals : newTier.maxRentals}
                  onChange={(e) => selectedTier ? setSelectedTier({ ...selectedTier, maxRentals: parseInt(e.target.value) }) : setNewTier({ ...newTier, maxRentals: parseInt(e.target.value) })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Commission Rate (%)</label>
              <input type="number" value={selectedTier ? selectedTier.rate : newTier.rate}
                onChange={(e) => selectedTier ? setSelectedTier({ ...selectedTier, rate: parseFloat(e.target.value) }) : setNewTier({ ...newTier, rate: parseFloat(e.target.value) })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Description</label>
              <textarea value={selectedTier ? selectedTier.description : newTier.description}
                onChange={(e) => selectedTier ? setSelectedTier({ ...selectedTier, description: e.target.value }) : setNewTier({ ...newTier, description: e.target.value })}
                placeholder="Brief description of vendor criteria"
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none" rows={2} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setIsEditTierModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm hover:border-gray-400 hover:text-gray-900 transition-all">Cancel</button>
            <button
              onClick={() => {
                if (selectedTier) {
                  setTiers(prev => prev.map(t => t._id === selectedTier._id ? selectedTier : t))
                  toast.success('Tier updated')
                } else {
                  if (!newTier.name) { toast.error('Enter a tier name'); return }
                  setTiers(prev => [...prev, { ...newTier, _id: Date.now().toString(), isActive: true, createdAt: new Date().toISOString(), color: 'blue', icon: 'star' }])
                  toast.success('Tier added')
                }
                setIsEditTierModalOpen(false)
                setSelectedTier(null)
                setNewTier({ name: '', minRentals: 0, maxRentals: 0, rate: 10, description: '' })
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm font-medium hover:from-amber-500 hover:to-amber-600 transition-all flex items-center gap-2">
              <Save className="h-3.5 w-3.5" /> {selectedTier ? 'Save Changes' : 'Add Tier'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}