// src/app/admin/settings/sms/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Settings,
  Send,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Eye,
  Edit,
  Copy,
  Search,
  DollarSign,
  BarChart3,
  Shield,
  EyeOff,
  Bell,
  TrendingUp,
  Sparkles,
  Lock,
  Zap,
  Hash
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import axios from 'axios'
import { cn } from '@/lib/utils'
import type { SMSUsage } from '@/types/sms.types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const DEFAULT_TWILIO = {
  accountSid: '',
  authToken: '',
  messagingServiceSid: '',
  fromNumber: '',
  statusCallbackUrl: '',
  testMode: true
}

const smsTemplates = [
  { id: 'otp-verification', name: 'OTP Verification', description: 'Sent for phone number verification', body: 'Your RentEase verification code is: {{otp}}. This code expires in {{expiry}} minutes.', variables: ['otp', 'expiry'], category: 'verification', characterCount: 78 },
  { id: 'rental-confirmation', name: 'Rental Confirmation', description: 'Sent when rental is confirmed', body: 'Your rental for {{productName}} has been confirmed! Rental #{{rentalNumber}}. Delivery on {{deliveryDate}}.', variables: ['productName', 'rentalNumber', 'deliveryDate'], category: 'notification', characterCount: 112 },
  { id: 'delivery-update', name: 'Delivery Update', description: 'Sent when delivery status changes', body: 'Your order #{{orderNumber}} is {{status}}! Track your delivery: {{trackingUrl}}', variables: ['orderNumber', 'status', 'trackingUrl'], category: 'notification', characterCount: 95 },
  { id: 'payment-receipt', name: 'Payment Receipt', description: 'Sent after successful payment', body: 'Payment of ₹{{amount}} received for rental #{{rentalNumber}}. Thank you for using RentEase!', variables: ['amount', 'rentalNumber'], category: 'notification', characterCount: 85 },
  { id: 'overdue-rental', name: 'Overdue Rental Alert', description: 'Sent when rental is overdue', body: 'Rental #{{rentalNumber}} is overdue by {{days}} days. Please return the item or contact support.', variables: ['rentalNumber', 'days'], category: 'alert', characterCount: 92 },
  { id: 'maintenance-scheduled', name: 'Maintenance Scheduled', description: 'Sent when maintenance is scheduled', body: 'Maintenance scheduled for {{date}} at {{time}}. Please ensure product availability.', variables: ['date', 'time'], category: 'alert', characterCount: 75 },
  { id: 'promo-offer', name: 'Promotional Offer', description: 'Sent for marketing campaigns', body: 'Special offer! Get {{discount}}% off on your next rental. Use code: {{code}}. Valid till {{validTill}}.', variables: ['discount', 'code', 'validTill'], category: 'promotional', characterCount: 105 },
  { id: 'welcome-sms', name: 'Welcome SMS', description: 'Sent to new users', body: 'Welcome to RentEase, {{name}}! Start renting products at amazing prices. Download the app: {{appUrl}}', variables: ['name', 'appUrl'], category: 'notification', characterCount: 98 }
]

const templateCategories = [
  { id: 'all', label: 'All Templates', icon: FileText, grad: 'from-slate-500 to-slate-600' },
  { id: 'verification', label: 'Verification', icon: Shield, grad: 'from-blue-500 to-indigo-500' },
  { id: 'notification', label: 'Notifications', icon: Bell, grad: 'from-emerald-500 to-teal-500' },
  { id: 'alert', label: 'Alerts', icon: AlertCircle, grad: 'from-rose-500 to-red-500' },
  { id: 'promotional', label: 'Promotional', icon: TrendingUp, grad: 'from-amber-500 to-orange-500' },
]

const categoryBadgeTint: Record<string, { bg: string; text: string }> = {
  verification: { bg: 'bg-blue-50', text: 'text-blue-600' },
  notification: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  alert: { bg: 'bg-rose-50', text: 'text-rose-600' },
  promotional: { bg: 'bg-amber-50', text: 'text-amber-600' },
}

function mergeTemplatesWithDefaults(backendTemplates: any[]): any[] {
  if (!backendTemplates || backendTemplates.length === 0) {
    return smsTemplates.map(t => ({ ...t, isActive: true }))
  }
  const backendMap = new Map(backendTemplates.map(t => [t.id, t]))
  return smsTemplates.map(t => {
    const existing = backendMap.get(t.id)
    return {
      ...t,
      body: existing?.body || t.body,
      isActive: existing?.isActive !== false
    }
  })
}

function UsageStats({ usage }: { usage: SMSUsage | null }) {
  if (!usage) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <BarChart3 className="h-8 w-8 text-blue-300" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-800">No usage data yet</h3>
        <p className="text-sm text-slate-500">Usage statistics will appear here once SMS messages are sent</p>
      </div>
    )
  }

  const maxCount = usage.dailyStats.length > 0
    ? Math.max(...usage.dailyStats.map((s: any) => s.count))
    : 1

  const statTiles = [
    { label: 'Total SMS Sent', value: (usage.totalSent ?? 0).toLocaleString(), grad: 'from-blue-500 to-indigo-500', tint: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Total Segments', value: (usage.totalSegments ?? 0).toLocaleString(), grad: 'from-emerald-500 to-teal-500', tint: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Total Cost', value: `₹${(usage.totalCost ?? 0).toFixed(2)}`, grad: 'from-violet-500 to-purple-500', tint: 'bg-violet-50', text: 'text-violet-600' },
    { label: 'Success Rate', value: `${usage.successRate ?? 0}%`, grad: 'from-amber-500 to-orange-500', tint: 'bg-amber-50', text: 'text-amber-600' },
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

      {usage.dailyStats.length > 0 && (
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="px-5 pb-2 pt-4 sm:px-6">
            <CardTitle className="text-sm font-semibold text-slate-800">Daily Usage (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6">
            <div className="space-y-2.5">
              {usage.dailyStats.slice(0, 7).map((stat: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 truncate text-xs text-slate-500">{stat.date || '-'}</span>
                  <div className="flex flex-1 items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${(stat.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs font-semibold text-slate-700">{stat.count} SMS</span>
                    <span className="w-20 shrink-0 text-right text-xs text-slate-400">₹{(stat.cost ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function SMSSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('twilio')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [twilioSettings, setTwilioSettings] = useState(DEFAULT_TWILIO)
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false)
  const [isTestSMSOpen, setIsTestSMSOpen] = useState(false)
  const [templateCategory, setTemplateCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAuthToken, setShowAuthToken] = useState(false)
  const [usage, setUsage] = useState<SMSUsage | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [testSMSData, setTestSMSData] = useState({
    to: '',
    template: 'otp-verification',
    body: '',
    variables: {} as Record<string, string>
  })

  const isConfigured = !!(twilioSettings.accountSid && twilioSettings.authToken && twilioSettings.fromNumber)

  const fetchSMSSettings = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/settings/sms`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        const data = response.data.data
        setTwilioSettings({
          ...DEFAULT_TWILIO,
          ...(data.twilio || {})
        })
        setTemplates(mergeTemplatesWithDefaults(data.templates))
      }
    } catch (error: any) {
      console.error('Error fetching SMS settings:', error)
      setFetchError(error.response?.data?.message || 'Failed to load SMS settings')
      toast.error(error.response?.data?.message || 'Failed to load SMS settings')
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const fetchSMSUsage = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/settings/sms`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        const usageData = response.data.data.usage || {
          totalSent: 0,
          totalSegments: 0,
          totalCost: 0,
          successRate: 0,
          dailyStats: []
        }
        setUsage(usageData)
      }
    } catch (error) {
      console.error('Error fetching SMS usage:', error)
    }
  }, [session])

  const handleSaveTwilioSettings = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put(`${BASE_URL}/api/v1/admin/settings/sms/twilio`, twilioSettings, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Twilio settings saved successfully')
      }
    } catch (error: any) {
      console.error('Error saving Twilio settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestSMS = async () => {
    if (!testSMSData.to) {
      toast.error('Please enter a test phone number')
      return
    }

    setIsTesting(true)
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/admin/settings/sms/test`, testSMSData, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Test SMS sent successfully!')
        if (response.data.data?.sid) {
          toast.info(`Message SID: ${response.data.data.sid}`)
        }
        setIsTestSMSOpen(false)
      }
    } catch (error: any) {
      console.error('Error sending test SMS:', error)
      toast.error(error.response?.data?.message || 'Failed to send test SMS')
    } finally {
      setIsTesting(false)
    }
  }

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return

    setIsSaving(true)
    try {
      const response = await axios.put(`${BASE_URL}/api/v1/admin/settings/sms/templates/${selectedTemplate.id}`, {
        body: selectedTemplate.body
      }, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Template updated successfully')
        setIsTemplateEditorOpen(false)
        const updatedTemplate = response.data.data?.template
        if (updatedTemplate) {
          setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? { ...t, ...updatedTemplate } : t))
        }
      }
    } catch (error: any) {
      console.error('Error updating template:', error)
      toast.error(error.response?.data?.message || 'Failed to update template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCheckBalance = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/sms/balance`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        const balance = response.data.data?.balance ?? 0
        const currency = response.data.data?.currency || 'USD'
        toast.success(`Available balance: ${currency} ${balance.toFixed(2)}`)
      }
    } catch (error: any) {
      console.error('Error checking balance:', error)
      toast.error(error.response?.data?.message || 'Failed to check balance')
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    if (status === 'authenticated') {
      fetchSMSSettings()
      fetchSMSUsage()
    }
  }, [status, router, fetchSMSSettings, fetchSMSUsage])

  const filteredTemplates = templates.filter(template => {
    if (templateCategory !== 'all' && template.category !== templateCategory) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return template.name.toLowerCase().includes(query) ||
             template.description.toLowerCase().includes(query)
    }
    return true
  })

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-xl" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-blue-600" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading SMS settings…</p>
      </div>
    )
  }

  return (
    // No h-screen / no vertical overflow here — the admin <main> shell owns the only
    // scrollbar. overflow-x-hidden guards the hero blobs from causing a horizontal one.
    <div className="w-full max-w-full space-y-6 px-1 pb-2 sm:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">SMS Settings</h2>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                Configure Twilio SMS provider, manage templates, and monitor usage
              </p>
            </div>
          </div>

          {isConfigured ? (
            <Badge className="gap-1 border-0 bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-white shadow-sm">
              <CheckCircle className="h-3.5 w-3.5" />
              Twilio Configured
            </Badge>
          ) : (
            <Badge className="gap-1 border-0 bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-white shadow-sm">
              <AlertCircle className="h-3.5 w-3.5" />
              Not Configured
            </Badge>
          )}
        </div>
      </div>

      {fetchError && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">Error loading SMS settings</p>
              <p className="text-sm text-red-700">{fetchError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSMSSettings}
              className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status Card */}
      <Card
        className={cn(
          'overflow-hidden border shadow-sm',
          isConfigured ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50' : 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50'
        )}
      >
        <CardContent className="p-4 sm:p-4.5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shadow-sm', isConfigured ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-amber-500 to-orange-500')}>
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className={cn('font-semibold', isConfigured ? 'text-emerald-800' : 'text-amber-800')}>
                  SMS Service Status
                </p>
                <p className={cn('text-sm', isConfigured ? 'text-emerald-700' : 'text-amber-700')}>
                  {isConfigured ? 'Twilio configuration detected' : 'No Twilio configuration found'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  'gap-1 border-0',
                  twilioSettings.testMode ? 'bg-blue-100 text-blue-700' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                )}
              >
                {twilioSettings.testMode ? <Zap className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                {twilioSettings.testMode ? 'Test Mode' : 'Live Mode'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckBalance}
                className="gap-2 border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                <DollarSign className="h-4 w-4" />
                Check Balance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3 bg-slate-100 p-1">
          <TabsTrigger
            value="twilio"
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4" />
            Twilio Config
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="usage"
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <BarChart3 className="h-4 w-4" />
            Usage
          </TabsTrigger>
        </TabsList>

        {/* Twilio Settings Tab */}
        <TabsContent value="twilio" className="mt-6 space-y-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900">Twilio Configuration</CardTitle>
                  <CardDescription className="mt-0.5">
                    Configure your Twilio account settings for sending SMS
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="accountSid">Account SID *</Label>
                  <div className="relative mt-1.5">
                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                    <Input
                      id="accountSid"
                      value={twilioSettings.accountSid}
                      onChange={(e) => setTwilioSettings({ ...twilioSettings, accountSid: e.target.value })}
                      placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      className="pl-9"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Find your Account SID in the Twilio Console
                  </p>
                </div>
                <div>
                  <Label htmlFor="authToken">Auth Token *</Label>
                  <div className="relative mt-1.5">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                    <Input
                      id="authToken"
                      type={showAuthToken ? 'text' : 'password'}
                      value={twilioSettings.authToken}
                      onChange={(e) => setTwilioSettings({ ...twilioSettings, authToken: e.target.value })}
                      placeholder="••••••••••••••••••••••••"
                      className="pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthToken(!showAuthToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600"
                    >
                      {showAuthToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="messagingServiceSid">Messaging Service SID (Optional)</Label>
                  <Input
                    id="messagingServiceSid"
                    value={twilioSettings.messagingServiceSid}
                    onChange={(e) => setTwilioSettings({ ...twilioSettings, messagingServiceSid: e.target.value })}
                    placeholder="MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="fromNumber">From Phone Number *</Label>
                  <Input
                    id="fromNumber"
                    value={twilioSettings.fromNumber}
                    onChange={(e) => setTwilioSettings({ ...twilioSettings, fromNumber: e.target.value })}
                    placeholder="+1234567890"
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Must be a Twilio phone number in E.164 format
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="statusCallbackUrl">Status Callback URL (Optional)</Label>
                  <Input
                    id="statusCallbackUrl"
                    value={twilioSettings.statusCallbackUrl}
                    onChange={(e) => setTwilioSettings({ ...twilioSettings, statusCallbackUrl: e.target.value })}
                    placeholder="https://api.rentease.com/webhooks/sms-status"
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 md:col-span-2">
                  <div>
                    <Label className="mb-0">Test Mode</Label>
                    <p className="text-xs text-slate-500">Use Twilio test credentials</p>
                  </div>
                  <Switch
                    checked={twilioSettings.testMode}
                    onCheckedChange={(checked) => setTwilioSettings({ ...twilioSettings, testMode: checked })}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleSaveTwilioSettings}
                  disabled={isSaving}
                  className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsTestSMSOpen(true)}
                  className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <Send className="h-4 w-4" />
                  Send Test SMS
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-sm">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">SMS Templates</CardTitle>
                    <CardDescription className="mt-0.5">
                      Manage SMS templates for different notifications
                    </CardDescription>
                  </div>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6">
              <div className="mb-6 flex flex-wrap gap-2">
                {templateCategories.map((category) => {
                  const Icon = category.icon
                  const isActive = templateCategory === category.id
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setTemplateCategory(category.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
                        isActive
                          ? cn('bg-gradient-to-r text-white shadow-sm', category.grad)
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {category.label}
                    </button>
                  )
                })}
              </div>

              <div className="grid gap-3.5">
                {filteredTemplates.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50">
                      <FileText className="h-8 w-8 text-violet-300" />
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-slate-800">No templates found</h3>
                    <p className="text-sm text-slate-500">Try a different search term or category</p>
                  </div>
                ) : (
                  filteredTemplates.map((template, idx) => {
                    const tint = categoryBadgeTint[template.category] ?? { bg: 'bg-slate-100', text: 'text-slate-600' }
                    const overLimit = template.body?.length > 160
                    return (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.25 }}
                        className="rounded-xl border border-slate-200 p-4 transition-all hover:border-violet-200 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-slate-800">{template.name}</h4>
                              <Badge className={cn('border-0 text-xs font-medium', tint.bg, tint.text)}>
                                {template.category}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn('text-xs', overLimit ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500')}
                              >
                                {template.characterCount} chars
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500">{template.description}</p>
                            <p className="mt-2 rounded-lg bg-slate-50 p-2.5 font-mono text-sm text-slate-700">
                              {template.body}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {template.variables.map((variable: string) => (
                                <code key={variable} className="rounded bg-violet-50 px-1.5 py-0.5 text-xs text-violet-600">
                                  {`{{${variable}}}`}
                                </code>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                                    onClick={() => {
                                      setSelectedTemplate(template)
                                      setIsTemplateEditorOpen(true)
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Template</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    onClick={() => {
                                      setTestSMSData({
                                        to: '',
                                        template: template.id,
                                        body: '',
                                        variables: {}
                                      })
                                      setIsTestSMSOpen(true)
                                    }}
                                  >
                                    <Send className="h-4 w-4" />
                                    Test
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Send Test SMS</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 border-violet-200 text-violet-700 hover:bg-violet-50"
                                    onClick={() => {
                                      const duplicated = {
                                        ...template,
                                        id: `${template.id}-copy-${Date.now()}`,
                                        name: `${template.name} (Copy)`
                                      }
                                      setTemplates(prev => [...prev, duplicated])
                                      setSelectedTemplate(duplicated)
                                      setIsTemplateEditorOpen(true)
                                      toast.success('Template duplicated — save to confirm')
                                    }}
                                  >
                                    <Copy className="h-4 w-4" />
                                    Duplicate
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Duplicate Template</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="mt-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900">SMS Usage Statistics</CardTitle>
                  <CardDescription className="mt-0.5">
                    Monitor your SMS sending activity and costs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6">
              <UsageStats usage={usage} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test SMS Dialog */}
      <Dialog open={isTestSMSOpen} onOpenChange={setIsTestSMSOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                <Send className="h-4 w-4 text-white" />
              </div>
              Send Test SMS
            </DialogTitle>
            <DialogDescription>
              Send a test SMS to verify your Twilio configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="testTo">Recipient Phone Number *</Label>
              <Input
                id="testTo"
                value={testSMSData.to}
                onChange={(e) => setTestSMSData({ ...testSMSData, to: e.target.value })}
                placeholder="+919876543210"
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-slate-400">
                Use E.164 format (e.g., +919876543210)
              </p>
            </div>
            <div>
              <Label>Template</Label>
              <Select
                value={testSMSData.template}
                onValueChange={(v) => setTestSMSData({ ...testSMSData, template: v, body: '', variables: {} })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {testSMSData.template && (
              <div>
                <Label>Message Preview</Label>
                <div className="mt-1.5 rounded-lg bg-slate-50 p-3">
                  <p className="text-sm text-slate-700">
                    {templates.find(t => t.id === testSMSData.template)?.body || smsTemplates.find(t => t.id === testSMSData.template)?.body}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestSMSOpen(false)} className="border-slate-300 text-slate-600 hover:bg-slate-50">
              Cancel
            </Button>
            <Button
              onClick={handleTestSMS}
              disabled={isTesting}
              className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Test SMS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Editor Dialog */}
      <Dialog open={isTemplateEditorOpen} onOpenChange={setIsTemplateEditorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                <FileText className="h-4 w-4 text-white" />
              </div>
              Edit SMS Template
            </DialogTitle>
            <DialogDescription>
              Edit the SMS template for {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Template Name</Label>
                <Input value={selectedTemplate.name} readOnly className="mt-1.5 bg-slate-50" />
              </div>
              <div>
                <Label>Message Body</Label>
                <Textarea
                  value={selectedTemplate.body}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })}
                  rows={5}
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Character count: {selectedTemplate.body?.length || 0} / 160
                </p>
                {selectedTemplate.body?.length > 160 && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    Will be sent as {Math.ceil((selectedTemplate.body?.length || 0) / 153)} segments
                  </p>
                )}
              </div>
              <div>
                <Label>Available Variables</Label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {selectedTemplate.variables?.map((variable: string) => (
                    <code key={variable} className="rounded bg-violet-50 px-2 py-1 text-xs text-violet-600">
                      {`{{${variable}}}`}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateEditorOpen(false)} className="border-slate-300 text-slate-600 hover:bg-slate-50">
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTemplate}
              disabled={isSaving}
              className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}