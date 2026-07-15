// src/app/admin/settings/payments/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  CheckCircle,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Copy,
  Check,
  Zap,
  BarChart3,
  Wallet,
  Repeat,
  Percent,
  HelpCircle,
  Building2,
  Trash2,
  Plus,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import axios from 'axios'
import { cn } from '@/lib/utils'
import type { CommissionSettings, PaymentStats as PaymentStatsType, PayoutSettings, RazorpaySettings, RefundSettings, StripeSettings } from '@/types/payment.types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const TAB_THEMES: Record<string, { grad: string; tint: string; text: string }> = {
  razorpay: { grad: 'from-blue-500 to-indigo-500', tint: 'bg-blue-50', text: 'text-blue-600' },
  stripe: { grad: 'from-violet-500 to-purple-500', tint: 'bg-violet-50', text: 'text-violet-600' },
  commission: { grad: 'from-amber-500 to-orange-500', tint: 'bg-amber-50', text: 'text-amber-600' },
  payout: { grad: 'from-emerald-500 to-teal-500', tint: 'bg-emerald-50', text: 'text-emerald-600' },
  refund: { grad: 'from-rose-500 to-red-500', tint: 'bg-rose-50', text: 'text-rose-600' },
  stats: { grad: 'from-cyan-500 to-blue-500', tint: 'bg-cyan-50', text: 'text-cyan-600' },
  webhooks: { grad: 'from-fuchsia-500 to-pink-500', tint: 'bg-fuchsia-50', text: 'text-fuchsia-600' },
}

// Payment Stats Component
function PaymentStats({ stats }: { stats: PaymentStatsType | null }) {
  if (!stats) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50">
          <BarChart3 className="h-8 w-8 text-cyan-300" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-800">No statistics yet</h3>
        <p className="text-sm text-slate-500">Transaction data will appear here once payments start flowing</p>
      </div>
    )
  }

  const maxDailyCount = Math.max(...stats.dailyStats.map(s => s.count), 1)

  const statTiles = [
    { label: 'Total Transactions', value: stats.totalTransactions.toLocaleString(), tint: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Total Amount', value: `₹${(stats.totalAmount / 100000).toFixed(1)}L`, tint: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Success Rate', value: `${stats.successRate}%`, tint: 'bg-violet-50', text: 'text-violet-600' },
    { label: 'Avg Transaction', value: `₹${stats.averageTransaction.toLocaleString()}`, tint: 'bg-amber-50', text: 'text-amber-600' },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {statTiles.map((tile) => (
          <div key={tile.label} className={cn('rounded-xl p-4 text-center', tile.tint)}>
            <p className={cn('text-xl font-extrabold tracking-tight sm:text-2xl', tile.text)}>{tile.value}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{tile.label}</p>
          </div>
        ))}
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <CardHeader className="px-5 pb-2 pt-4 sm:px-6">
          <CardTitle className="text-sm font-semibold text-slate-800">Daily Transaction Volume</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6">
          <div className="space-y-2.5">
            {stats.dailyStats.slice(0, 7).map((stat) => (
              <div key={stat.date} className="flex items-center gap-3">
                <span className="w-20 shrink-0 truncate text-xs text-slate-500">{stat.date}</span>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      style={{ width: `${(stat.count / maxDailyCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-xs font-semibold text-slate-700">{stat.count} txn</span>
                  <span className="w-16 shrink-0 text-right text-xs text-slate-400">₹{(stat.amount / 1000).toFixed(1)}K</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardHeader className="px-5 pb-2 pt-4 sm:px-6">
          <CardTitle className="text-sm font-semibold text-slate-800">Payment Method Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-5 pb-5 sm:px-6">
          {stats.methodBreakdown.map((method) => (
            <div key={method.method}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium capitalize text-slate-700">{method.method}</span>
                <span className="text-slate-500">₹{(method.amount / 1000).toFixed(1)}K ({method.count} txn)</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                  style={{ width: `${(method.amount / stats.totalAmount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// Razorpay Logo Component
function RazorpayLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D2B42] shadow-sm">
        <span className="text-sm font-bold text-white">R</span>
      </div>
      <span className="font-semibold text-[#0D2B42]">Razorpay</span>
    </div>
  )
}

// Stripe Logo Component
function StripeLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635BFF] shadow-sm">
        <span className="text-sm font-bold text-white">S</span>
      </div>
      <span className="font-semibold text-[#635BFF]">Stripe</span>
    </div>
  )
}

export default function PaymentSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('razorpay')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showKeySecret, setShowKeySecret] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const [razorpaySettings, setRazorpaySettings] = useState<RazorpaySettings>({
    keyId: '',
    keySecret: '',
    webhookSecret: '',
    enabled: false,
    testMode: true
  })

  const [stripeSettings, setStripeSettings] = useState<StripeSettings>({
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    enabled: false,
    testMode: true
  })

  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>({
    defaultRate: 10,
    maxRate: 25,
    minRate: 5,
    type: 'percentage',
    vendorTiers: [
      { minRentals: 0, maxRentals: 50, rate: 12 },
      { minRentals: 51, maxRentals: 200, rate: 10 },
      { minRentals: 201, maxRentals: 500, rate: 8 },
      { minRentals: 501, maxRentals: 1000, rate: 7 }
    ],
    categoryRates: []
  })

  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>({
    schedule: 'weekly',
    minimumAmount: 500,
    processingFee: 0,
    taxRate: 18,
    autoPayout: true,
    payoutDay: 1,
    holdPeriod: 7
  })

  const [refundSettings, setRefundSettings] = useState<RefundSettings>({
    autoRefundPeriod: 7,
    maxRefundAmount: 50000,
    refundReasonRequired: true,
    approvalRequired: false,
    refundFee: 0
  })

  const [stats, setStats] = useState<PaymentStatsType | null>(null)

  const fetchPaymentSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/settings/payments`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        const data = response.data.data
        if (data.razorpay) setRazorpaySettings(data.razorpay)
        if (data.stripe) setStripeSettings(data.stripe)
        if (data.commission) setCommissionSettings(data.commission)
        if (data.payout) setPayoutSettings(data.payout)
        if (data.refund) setRefundSettings(data.refund)
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error)
      toast.error('Failed to load payment settings')
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const fetchPaymentStats = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/payments/stats`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error)
    }
  }, [session])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    if (status === 'authenticated') {
      fetchPaymentSettings()
      fetchPaymentStats()
    }
  }, [status, router, fetchPaymentSettings, fetchPaymentStats])

  const handleSaveRazorpay = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put(`${BASE_URL}/api/v1/admin/settings/payments/razorpay`, razorpaySettings, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) toast.success('Razorpay settings saved successfully')
    } catch (error: any) {
      console.error('Error saving Razorpay settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveStripe = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put(`${BASE_URL}/api/v1/admin/settings/payments/stripe`, stripeSettings, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) toast.success('Stripe settings saved successfully')
    } catch (error: any) {
      console.error('Error saving Stripe settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCommission = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put(`${BASE_URL}/api/v1/admin/settings/payments/commission`, commissionSettings, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) toast.success('Commission settings saved successfully')
    } catch (error: any) {
      console.error('Error saving commission settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePayout = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put(`${BASE_URL}/api/v1/admin/settings/payments/payout`, payoutSettings, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) toast.success('Payout settings saved successfully')
    } catch (error: any) {
      console.error('Error saving payout settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveRefund = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put(`${BASE_URL}/api/v1/admin/settings/payments/refund`, refundSettings, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) toast.success('Refund settings saved successfully')
    } catch (error: any) {
      console.error('Error saving refund settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-xl" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-blue-600" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading payment settings…</p>
      </div>
    )
  }

  return (
    // No h-screen / vertical overflow here — the admin <main> shell owns the only
    // scrollbar. overflow-x-hidden stops the hero blobs (and the wide 7-tab list on
    // small screens) from creating a second, horizontal scrollbar.
    <div className="w-full max-w-full space-y-6 px-1 pb-2 sm:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Payment Gateway Settings</h2>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-0.5 text-sm text-slate-600">
              Configure payment gateways, commission rates, and payout settings
            </p>
          </div>
        </div>
      </div>

      {/* Payment Status Card */}
      <Card className="overflow-hidden border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm">
        <CardContent className="p-4 sm:p-4.5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">Payment System Status</p>
                <p className="text-sm text-emerald-700">
                  {razorpaySettings.enabled || stripeSettings.enabled ? 'Active' : 'No gateway configured'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {razorpaySettings.enabled && (
                <Badge className="gap-1 border-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
                  <CheckCircle className="h-3 w-3" />
                  Razorpay Active
                </Badge>
              )}
              {stripeSettings.enabled && (
                <Badge className="gap-1 border-0 bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                  <CheckCircle className="h-3 w-3" />
                  Stripe Active
                </Badge>
              )}
              {!razorpaySettings.enabled && !stripeSettings.enabled && (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                  No active gateway
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="-mx-1 overflow-x-auto px-1">
          <TabsList className="grid min-w-[640px] grid-cols-7 gap-1 bg-slate-100 p-1">
            {Object.entries(TAB_THEMES).map(([key, theme]) => {
              const icons: Record<string, any> = {
                razorpay: Building2, stripe: CreditCard, commission: Percent,
                payout: Wallet, refund: Repeat, stats: BarChart3, webhooks: Zap
              }
              const labels: Record<string, string> = {
                razorpay: 'Razorpay', stripe: 'Stripe', commission: 'Commission',
                payout: 'Payout', refund: 'Refund', stats: 'Statistics', webhooks: 'Webhooks'
              }
              const Icon = icons[key]
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className={cn(
                    'gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:text-white',
                    `data-[state=active]:${theme.grad}`
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {labels[key]}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Razorpay Tab */}
        <TabsContent value="razorpay" className="mt-6 space-y-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                    <RazorpayLogo />
                    Configuration
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    Configure Razorpay payment gateway integration
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn('border-0', razorpaySettings.testMode ? 'bg-blue-100 text-blue-700' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white')}>
                    {razorpaySettings.testMode ? 'Test Mode' : 'Live Mode'}
                  </Badge>
                  <Switch
                    checked={razorpaySettings.enabled}
                    onCheckedChange={(checked) => setRazorpaySettings({ ...razorpaySettings, enabled: checked })}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="razorpayKeyId">Key ID *</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="razorpayKeyId"
                      value={razorpaySettings.keyId}
                      onChange={(e) => setRazorpaySettings({ ...razorpaySettings, keyId: e.target.value })}
                      placeholder="rzp_test_xxxxxxxxxxxxxxxx"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(razorpaySettings.keyId, 'keyId')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600"
                    >
                      {copiedKey === 'keyId' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="razorpayKeySecret">Key Secret *</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="razorpayKeySecret"
                      type={showKeySecret ? 'text' : 'password'}
                      value={razorpaySettings.keySecret}
                      onChange={(e) => setRazorpaySettings({ ...razorpaySettings, keySecret: e.target.value })}
                      placeholder="••••••••••••••••••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeySecret(!showKeySecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600"
                    >
                      {showKeySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="razorpayWebhookSecret">Webhook Secret</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="razorpayWebhookSecret"
                      type={showWebhookSecret ? 'text' : 'password'}
                      value={razorpaySettings.webhookSecret}
                      onChange={(e) => setRazorpaySettings({ ...razorpaySettings, webhookSecret: e.target.value })}
                      placeholder="••••••••••••••••••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600"
                    >
                      {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <div>
                    <Label className="mb-0">Test Mode</Label>
                    <p className="text-xs text-slate-500">Use Razorpay test keys</p>
                  </div>
                  <Switch
                    checked={razorpaySettings.testMode}
                    onCheckedChange={(checked) => setRazorpaySettings({ ...razorpaySettings, testMode: checked })}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveRazorpay}
                  disabled={isSaving}
                  className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Razorpay Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Razorpay Setup Guide */}
          <Card className="overflow-hidden border-blue-200 bg-blue-50 shadow-sm">
            <CardContent className="p-4 sm:p-4.5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <HelpCircle className="h-4.5 w-4.5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800">Razorpay Setup Guide</p>
                  <p className="mt-1 text-sm leading-relaxed text-blue-700">
                    1. Log in to your Razorpay Dashboard<br />
                    2. Go to Settings → API Keys<br />
                    3. Copy your Key ID and Key Secret<br />
                    4. Set up webhook URL: <code className="rounded bg-blue-100 px-1.5 py-0.5">{`${BASE_URL}/api/v1/webhooks/razorpay`}</code><br />
                    5. Enable webhook events: payment.captured, payment.failed, refund.created
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stripe Tab */}
        <TabsContent value="stripe" className="mt-6 space-y-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                    <StripeLogo />
                    Configuration
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    Configure Stripe payment gateway integration
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn('border-0', stripeSettings.testMode ? 'bg-violet-100 text-violet-700' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white')}>
                    {stripeSettings.testMode ? 'Test Mode' : 'Live Mode'}
                  </Badge>
                  <Switch
                    checked={stripeSettings.enabled}
                    onCheckedChange={(checked) => setStripeSettings({ ...stripeSettings, enabled: checked })}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-600 data-[state=checked]:to-purple-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="stripePublishableKey">Publishable Key *</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="stripePublishableKey"
                      value={stripeSettings.publishableKey}
                      onChange={(e) => setStripeSettings({ ...stripeSettings, publishableKey: e.target.value })}
                      placeholder="pk_test_xxxxxxxxxxxxxxxx"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(stripeSettings.publishableKey, 'publishableKey')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-violet-600"
                    >
                      {copiedKey === 'publishableKey' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="stripeSecretKey">Secret Key *</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="stripeSecretKey"
                      type={showKeySecret ? 'text' : 'password'}
                      value={stripeSettings.secretKey}
                      onChange={(e) => setStripeSettings({ ...stripeSettings, secretKey: e.target.value })}
                      placeholder="sk_test_xxxxxxxxxxxxxxxx"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeySecret(!showKeySecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-violet-600"
                    >
                      {showKeySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="stripeWebhookSecret">Webhook Secret</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="stripeWebhookSecret"
                      type={showWebhookSecret ? 'text' : 'password'}
                      value={stripeSettings.webhookSecret}
                      onChange={(e) => setStripeSettings({ ...stripeSettings, webhookSecret: e.target.value })}
                      placeholder="whsec_xxxxxxxxxxxxxxxx"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-violet-600"
                    >
                      {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <div>
                    <Label className="mb-0">Test Mode</Label>
                    <p className="text-xs text-slate-500">Use Stripe test keys</p>
                  </div>
                  <Switch
                    checked={stripeSettings.testMode}
                    onCheckedChange={(checked) => setStripeSettings({ ...stripeSettings, testMode: checked })}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-600 data-[state=checked]:to-purple-600"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveStripe}
                  disabled={isSaving}
                  className="gap-2 border-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25 hover:from-violet-700 hover:to-purple-700"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Stripe Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stripe Setup Guide */}
          <Card className="overflow-hidden border-violet-200 bg-violet-50 shadow-sm">
            <CardContent className="p-4 sm:p-4.5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                  <HelpCircle className="h-4.5 w-4.5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-violet-800">Stripe Setup Guide</p>
                  <p className="mt-1 text-sm leading-relaxed text-violet-700">
                    1. Log in to your Stripe Dashboard<br />
                    2. Go to Developers → API Keys<br />
                    3. Copy your Publishable Key and Secret Key<br />
                    4. Set up webhook endpoint: <code className="rounded bg-violet-100 px-1.5 py-0.5">{`${BASE_URL}/api/v1/webhooks/stripe`}</code><br />
                    5. Select events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Tab */}
        <TabsContent value="commission" className="mt-6 space-y-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
                  <Percent className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900">Commission Settings</CardTitle>
                  <CardDescription className="mt-0.5">
                    Configure platform commission rates for vendors
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="defaultRate">Default Rate (%)</Label>
                  <Input
                    id="defaultRate"
                    type="number"
                    value={commissionSettings.defaultRate}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, defaultRate: parseFloat(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="minRate">Minimum Rate (%)</Label>
                  <Input
                    id="minRate"
                    type="number"
                    value={commissionSettings.minRate}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, minRate: parseFloat(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="maxRate">Maximum Rate (%)</Label>
                  <Input
                    id="maxRate"
                    type="number"
                    value={commissionSettings.maxRate}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, maxRate: parseFloat(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Commission Type</Label>
                  <Select
                    value={commissionSettings.type}
                    onValueChange={(v: 'percentage' | 'fixed') => setCommissionSettings({ ...commissionSettings, type: v })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-700">Performance-Based Tiers</h4>
                <div className="space-y-2.5">
                  {commissionSettings.vendorTiers.map((tier: any, index: number) => (
                    <div key={index} className="flex flex-wrap items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50/50 p-2.5">
                      <Input
                        type="number"
                        placeholder="Min Rentals"
                        value={tier?.minRentals}
                        onChange={(e) => {
                          const newTiers = [...commissionSettings.vendorTiers]
                          newTiers[index] = { ...newTiers[index], minRentals: parseInt(e.target.value) || 0 }
                          setCommissionSettings({ ...commissionSettings, vendorTiers: newTiers })
                        }}
                        className="w-28 bg-white"
                      />
                      <span className="text-slate-400">–</span>
                      <Input
                        type="number"
                        placeholder="Max Rentals"
                        value={tier.maxRentals}
                        onChange={(e) => {
                          const newTiers = [...commissionSettings.vendorTiers]
                          newTiers[index] = { ...newTiers[index], maxRentals: parseInt(e.target.value) || 0 }
                          setCommissionSettings({ ...commissionSettings, vendorTiers: newTiers })
                        }}
                        className="w-28 bg-white"
                      />
                      <Input
                        type="number"
                        placeholder="Rate (%)"
                        value={tier.rate}
                        onChange={(e) => {
                          const newTiers = [...commissionSettings.vendorTiers]
                          newTiers[index] = { ...newTiers[index], rate: parseFloat(e.target.value) || 0 }
                          setCommissionSettings({ ...commissionSettings, vendorTiers: newTiers })
                        }}
                        className="w-24 bg-white"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-8 w-8 text-rose-500 hover:bg-rose-100 hover:text-rose-600"
                        onClick={() => {
                          // Bug fix: filter's callback is (element, index, array) — not a
                          // destructured {_, i} object. The old code silently matched nothing.
                          const newTiers = commissionSettings.vendorTiers.filter((_, i) => i !== index)
                          setCommissionSettings({ ...commissionSettings, vendorTiers: newTiers })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={() => setCommissionSettings({
                      ...commissionSettings,
                      vendorTiers: [...commissionSettings.vendorTiers, { minRentals: 0, maxRentals: 0, rate: 0 }]
                    })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tier
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveCommission}
                  disabled={isSaving}
                  className="gap-2 border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Commission Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout Tab */}
        <TabsContent value="payout" className="mt-6 space-y-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900">Payout Settings</CardTitle>
                  <CardDescription className="mt-0.5">
                    Configure vendor payout schedules and minimum amounts
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="schedule">Payout Schedule</Label>
                  <Select
                    value={payoutSettings.schedule}
                    onValueChange={(v: any) => setPayoutSettings({ ...payoutSettings, schedule: v })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="minimumAmount">Minimum Payout Amount (₹)</Label>
                  <Input
                    id="minimumAmount"
                    type="number"
                    value={payoutSettings.minimumAmount}
                    onChange={(e) => setPayoutSettings({ ...payoutSettings, minimumAmount: parseInt(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="processingFee">Processing Fee (₹)</Label>
                  <Input
                    id="processingFee"
                    type="number"
                    value={payoutSettings.processingFee}
                    onChange={(e) => setPayoutSettings({ ...payoutSettings, processingFee: parseFloat(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={payoutSettings.taxRate}
                    onChange={(e) => setPayoutSettings({ ...payoutSettings, taxRate: parseFloat(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="holdPeriod">Hold Period (days)</Label>
                  <Input
                    id="holdPeriod"
                    type="number"
                    value={payoutSettings.holdPeriod}
                    onChange={(e) => setPayoutSettings({ ...payoutSettings, holdPeriod: parseInt(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <div>
                    <Label className="mb-0">Auto Payout</Label>
                    <p className="text-xs text-slate-500">Automatically process payouts</p>
                  </div>
                  <Switch
                    checked={payoutSettings.autoPayout}
                    onCheckedChange={(checked) => setPayoutSettings({ ...payoutSettings, autoPayout: checked })}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-600 data-[state=checked]:to-teal-600"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={handleSavePayout}
                  disabled={isSaving}
                  className="gap-2 border-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Payout Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refund Tab */}
        <TabsContent value="refund" className="mt-6 space-y-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-rose-500 to-red-500" />
            <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-500 shadow-sm">
                  <Repeat className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900">Refund Settings</CardTitle>
                  <CardDescription className="mt-0.5">
                    Configure refund policies and auto-refund rules
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="autoRefundPeriod">Auto-Refund Period (days)</Label>
                  <Input
                    id="autoRefundPeriod"
                    type="number"
                    value={refundSettings.autoRefundPeriod}
                    onChange={(e) => setRefundSettings({ ...refundSettings, autoRefundPeriod: parseInt(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="maxRefundAmount">Maximum Refund Amount (₹)</Label>
                  <Input
                    id="maxRefundAmount"
                    type="number"
                    value={refundSettings.maxRefundAmount}
                    onChange={(e) => setRefundSettings({ ...refundSettings, maxRefundAmount: parseInt(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="refundFee">Refund Processing Fee (₹)</Label>
                  <Input
                    id="refundFee"
                    type="number"
                    value={refundSettings.refundFee}
                    onChange={(e) => setRefundSettings({ ...refundSettings, refundFee: parseFloat(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <Label className="mb-0">Require Refund Reason</Label>
                  <Switch
                    checked={refundSettings.refundReasonRequired}
                    onCheckedChange={(checked) => setRefundSettings({ ...refundSettings, refundReasonRequired: checked })}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-rose-600 data-[state=checked]:to-red-600"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 md:col-span-2">
                  <Label className="mb-0">Require Admin Approval</Label>
                  <Switch
                    checked={refundSettings.approvalRequired}
                    onCheckedChange={(checked) => setRefundSettings({ ...refundSettings, approvalRequired: checked })}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-rose-600 data-[state=checked]:to-red-600"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveRefund}
                  disabled={isSaving}
                  className="gap-2 border-0 bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/25 hover:from-rose-700 hover:to-red-700"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Refund Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="mt-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
            <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-sm">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900">Payment Statistics</CardTitle>
                  <CardDescription className="mt-0.5">
                    Overview of payment transactions and revenue
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6">
              <PaymentStats stats={stats} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="mt-6 space-y-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-fuchsia-500 to-pink-500" />
            <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-sm">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900">Webhook Configuration</CardTitle>
                  <CardDescription className="mt-0.5">
                    Configure webhook endpoints for payment events
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-sm font-medium text-slate-700">Razorpay Webhook URL</p>
                    <code className="block truncate rounded bg-white px-2 py-1 text-xs text-blue-700">
                      {`${BASE_URL}/api/v1/webhooks/razorpay`}
                    </code>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`${BASE_URL}/api/v1/webhooks/razorpay`, 'razorpayWebhook')}
                    className="text-blue-600 hover:bg-blue-100"
                  >
                    {copiedKey === 'razorpayWebhook' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/60 p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-sm font-medium text-slate-700">Stripe Webhook URL</p>
                    <code className="block truncate rounded bg-white px-2 py-1 text-xs text-violet-700">
                      {`${BASE_URL}/api/v1/webhooks/stripe`}
                    </code>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`${BASE_URL}/api/v1/webhooks/stripe`, 'stripeWebhook')}
                    className="text-violet-600 hover:bg-violet-100"
                  >
                    {copiedKey === 'stripeWebhook' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700">Required Webhook Events</h4>
                <div className="space-y-1.5">
                  {[
                    'payment.captured / payment_intent.succeeded',
                    'payment.failed / payment_intent.payment_failed',
                    'refund.created / charge.refunded',
                    'order.paid / checkout.session.completed',
                  ].map((event) => (
                    <div key={event} className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-400" />
                      {event}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}