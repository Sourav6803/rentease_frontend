// src/app/admin/settings/email/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Settings,
  Send,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Edit,
  Copy,
  Search,
  MailCheck,
  Server,
  EyeOff,
  Store,
  CreditCard,
  Truck,
  Users,
  Calendar,
  Wrench,
  Eye,
  Sparkles,
  Lock,
  Zap
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

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const DEFAULT_SMTP = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: '',
  password: '',
  fromEmail: 'noreply@rentease.com',
  fromName: 'RentEase',
  replyTo: 'support@rentease.com',
  testMode: true
}

const emailTemplates = [
  { id: 'welcome', name: 'Welcome Email', description: 'Sent when a new user registers', subject: 'Welcome to RentEase! 🎉', variables: ['name', 'email', 'loginUrl', 'exploreUrl', 'year'], category: 'user' },
  { id: 'email-verification', name: 'Email Verification', description: 'Sent to verify user email address', subject: 'Verify Your Email - RentEase', variables: ['name', 'email', 'verificationUrl', 'expiryTime', 'year'], category: 'user' },
  { id: 'password-reset', name: 'Password Reset', description: 'Sent when user requests password reset', subject: 'Reset Your Password - RentEase', variables: ['name', 'email', 'resetUrl', 'expiryTime', 'year'], category: 'user' },
  { id: 'password-changed', name: 'Password Changed', description: 'Confirmation when password is changed', subject: 'Password Changed Successfully - RentEase', variables: ['name', 'email', 'loginUrl', 'supportEmail', 'year'], category: 'user' },
  { id: 'rental-confirmation', name: 'Rental Confirmation', description: 'Sent when rental is confirmed', subject: 'Rental Confirmed #{{rentalNumber}} - RentEase', variables: ['name', 'email', 'rentalNumber', 'productName', 'startDate', 'endDate', 'monthlyRent', 'securityDeposit', 'totalAmount', 'deliveryAddress', 'trackUrl', 'year'], category: 'rental' },
  { id: 'payment-receipt', name: 'Payment Receipt', description: 'Sent after successful payment', subject: 'Payment Receipt #{{paymentNumber}} - RentEase', variables: ['name', 'email', 'paymentNumber', 'rentalNumber', 'amount', 'paymentMethod', 'paymentDate', 'paymentType', 'invoiceUrl', 'year'], category: 'payment' },
  { id: 'vendor-approval', name: 'Vendor Approval', description: 'Sent when vendor application is approved', subject: 'Vendor Account Approved - RentEase', variables: ['name', 'businessName', 'email', 'dashboardUrl', 'year'], category: 'vendor' },
  { id: 'vendor-rejection', name: 'Vendor Rejection', description: 'Sent when vendor application is rejected', subject: 'Vendor Application Update - RentEase', variables: ['name', 'businessName', 'email', 'reason', 'supportEmail', 'year'], category: 'vendor' },
  { id: 'delivery-notification', name: 'Delivery Notification', description: 'Sent when delivery is scheduled', subject: 'Delivery Scheduled #{{deliveryNumber}} - RentEase', variables: ['name', 'email', 'deliveryNumber', 'rentalNumber', 'deliveryDate', 'deliverySlot', 'address', 'trackingUrl', 'year'], category: 'delivery' },
  { id: 'maintenance-confirmation', name: 'Maintenance Request', description: 'Sent when maintenance request is created', subject: 'Maintenance Request #{{requestNumber}} - RentEase', variables: ['name', 'email', 'requestNumber', 'issueType', 'description', 'priority', 'requestedDate', 'trackUrl', 'year'], category: 'maintenance' }
]

const templateCategories = [
  { id: 'all', label: 'All Templates', icon: FileText, grad: 'from-slate-500 to-slate-600' },
  { id: 'user', label: 'User Management', icon: Users, grad: 'from-blue-500 to-indigo-500' },
  { id: 'rental', label: 'Rentals', icon: Calendar, grad: 'from-violet-500 to-purple-500' },
  { id: 'payment', label: 'Payments', icon: CreditCard, grad: 'from-amber-500 to-orange-500' },
  { id: 'vendor', label: 'Vendors', icon: Store, grad: 'from-emerald-500 to-teal-500' },
  { id: 'delivery', label: 'Deliveries', icon: Truck, grad: 'from-cyan-500 to-blue-500' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, grad: 'from-rose-500 to-red-500' },
]

const categoryBadgeTint: Record<string, { bg: string; text: string }> = {
  user: { bg: 'bg-blue-50', text: 'text-blue-600' },
  rental: { bg: 'bg-violet-50', text: 'text-violet-600' },
  payment: { bg: 'bg-amber-50', text: 'text-amber-600' },
  vendor: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  delivery: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
  maintenance: { bg: 'bg-rose-50', text: 'text-rose-600' },
}

const DEFAULT_TEMPLATE_HTML = `<h1>Welcome to RentEase!</h1>
<p>Hello {{name}},</p>
<p>Thank you for joining RentEase. We're excited to have you on board!</p>
<p>Get started by exploring our wide range of products available for rent.</p>
<p>Best regards,<br>The RentEase Team</p>`

function mergeTemplatesWithDefaults(backendTemplates: any[]): any[] {
  if (!backendTemplates || backendTemplates.length === 0) {
    return emailTemplates.map(t => ({
      ...t,
      template: DEFAULT_TEMPLATE_HTML,
      isActive: true
    }))
  }

  const backendMap = new Map(backendTemplates.map(t => [t.id, t]))
  return emailTemplates.map(t => {
    const existing = backendMap.get(t.id)
    return {
      ...t,
      subject: existing?.subject || t.subject,
      template: existing?.html || existing?.template || DEFAULT_TEMPLATE_HTML,
      isActive: existing?.isActive !== false
    }
  })
}

export default function EmailSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('smtp')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [smtpSettings, setSmtpSettings] = useState(DEFAULT_SMTP)
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false)
  const [isTestEmailOpen, setIsTestEmailOpen] = useState(false)
  const [templateCategory, setTemplateCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [testEmailData, setTestEmailData] = useState({
    to: '',
    subject: 'Test Email from RentEase',
    template: 'welcome'
  })

  const isConfigured = !!(smtpSettings.host && smtpSettings.user && (smtpSettings.password || smtpSettings.testMode))

  const fetchEmailSettings = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/settings/email`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        const data = response.data.data
        setSmtpSettings({
          ...DEFAULT_SMTP,
          ...(data.smtp || {}),
          password: data.smtp?.password || DEFAULT_SMTP.password
        })
        setTemplates(mergeTemplatesWithDefaults(data.templates))
      }
    } catch (error: any) {
      console.error('Error fetching email settings:', error)
      setFetchError(error.response?.data?.message || 'Failed to load email settings')
      toast.error(error.response?.data?.message || 'Failed to load email settings')
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const handleSaveSMTPSettings = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put(`${BASE_URL}/api/v1/admin/settings/email/smtp`, smtpSettings, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('SMTP settings saved successfully')
        setSmtpSettings(prev => ({ ...prev, password: response.data.data?.smtp?.password || prev.password }))
      }
    } catch (error: any) {
      console.error('Error saving SMTP settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmailData.to) {
      toast.error('Please enter a test email address')
      return
    }

    setIsTesting(true)
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/admin/settings/email/test`, testEmailData, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Test email sent successfully!')
        setIsTestEmailOpen(false)
      }
    } catch (error: any) {
      console.error('Error sending test email:', error)
      toast.error(error.response?.data?.message || 'Failed to send test email')
    } finally {
      setIsTesting(false)
    }
  }

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return

    setIsSaving(true)
    try {
      const response = await axios.put(`${BASE_URL}/api/v1/admin/settings/email/templates/${selectedTemplate.id}`, {
        subject: selectedTemplate.subject,
        template: selectedTemplate.template
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    if (status === 'authenticated') {
      fetchEmailSettings()
    }
  }, [status, router, fetchEmailSettings])

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
        <p className="text-sm font-medium text-slate-500">Loading email settings…</p>
      </div>
    )
  }

  return (
    // No h-screen / vertical overflow here — the admin <main> shell owns the only
    // scrollbar. overflow-x-hidden stops the hero's blurred blobs from causing a
    // second, horizontal scrollbar.
    <div className="w-full max-w-full space-y-6 px-1 pb-2 sm:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
              <MailCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Email Settings</h2>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                Configure SMTP settings, manage email templates, and test email delivery
              </p>
            </div>
          </div>

          {isConfigured ? (
            <Badge className="gap-1 border-0 bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-white shadow-sm">
              <CheckCircle className="h-3.5 w-3.5" />
              SMTP Configured
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
              <p className="font-medium text-red-800">Error loading email settings</p>
              <p className="text-sm text-red-700">{fetchError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEmailSettings}
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
                <MailCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className={cn('font-semibold', isConfigured ? 'text-emerald-800' : 'text-amber-800')}>
                  Email Service Status
                </p>
                <p className={cn('text-sm', isConfigured ? 'text-emerald-700' : 'text-amber-700')}>
                  {isConfigured ? 'SMTP configuration detected' : 'No SMTP configuration found'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  'gap-1 border-0',
                  smtpSettings.testMode ? 'bg-blue-100 text-blue-700' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                )}
              >
                {smtpSettings.testMode ? <Zap className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                {smtpSettings.testMode ? 'Test Mode' : 'Live Mode'}
              </Badge>
              <Badge variant="outline" className="gap-1 border-slate-300 bg-white/70 text-slate-600">
                <Server className="h-3 w-3" />
                {smtpSettings.host || 'Not set'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 p-1">
          <TabsTrigger
            value="smtp"
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4" />
            SMTP Settings
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
        </TabsList>

        {/* SMTP Settings Tab */}
        <TabsContent value="smtp" className="mt-6 space-y-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900">SMTP Configuration</CardTitle>
                  <CardDescription className="mt-0.5">
                    Configure your email server settings for sending emails
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="host">SMTP Host *</Label>
                  <Input
                    id="host"
                    value={smtpSettings.host}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="port">SMTP Port *</Label>
                  <Input
                    id="port"
                    type="number"
                    value={smtpSettings.port}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, port: parseInt(e.target.value) || 0 })}
                    placeholder="587"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="user">SMTP Username *</Label>
                  <Input
                    id="user"
                    value={smtpSettings.user}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, user: e.target.value })}
                    placeholder="your-email@gmail.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="password">SMTP Password *</Label>
                  <div className="relative mt-1.5">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={smtpSettings.password}
                      onChange={(e) => setSmtpSettings({ ...smtpSettings, password: e.target.value })}
                      placeholder="••••••••"
                      className="pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="fromEmail">From Email *</Label>
                  <Input
                    id="fromEmail"
                    value={smtpSettings.fromEmail}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, fromEmail: e.target.value })}
                    placeholder="noreply@rentease.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="fromName">From Name *</Label>
                  <Input
                    id="fromName"
                    value={smtpSettings.fromName}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, fromName: e.target.value })}
                    placeholder="RentEase"
                    className="mt-1.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="replyTo">Reply-To Email</Label>
                  <Input
                    id="replyTo"
                    value={smtpSettings.replyTo}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, replyTo: e.target.value })}
                    placeholder="support@rentease.com"
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <div>
                    <Label className="mb-0">SSL/TLS</Label>
                    <p className="text-xs text-slate-500">Enable secure connection</p>
                  </div>
                  <Switch
                    checked={smtpSettings.secure}
                    onCheckedChange={(checked) => setSmtpSettings({ ...smtpSettings, secure: checked })}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600"
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <div>
                    <Label className="mb-0">Test Mode</Label>
                    <p className="text-xs text-slate-500">Use ethereal.email for testing</p>
                  </div>
                  <Switch
                    checked={smtpSettings.testMode}
                    onCheckedChange={(checked) => setSmtpSettings({ ...smtpSettings, testMode: checked })}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleSaveSMTPSettings}
                  disabled={isSaving}
                  className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsTestEmailOpen(true)}
                  className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <Send className="h-4 w-4" />
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates Tab */}
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
                    <CardTitle className="text-lg text-slate-900">Email Templates</CardTitle>
                    <CardDescription className="mt-0.5">
                      Manage email templates for different notifications
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
              {/* Category Filters */}
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

              {/* Templates Grid */}
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
                            <div className="mb-1 flex items-center gap-2">
                              <h4 className="font-semibold text-slate-800">{template.name}</h4>
                              <Badge className={cn('border-0 text-xs font-medium', tint.bg, tint.text)}>
                                {template.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500">{template.description}</p>
                            <p className="mt-2 text-xs text-slate-400">
                              <span className="font-medium text-slate-500">Subject:</span> {template.subject}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-1">
                              {template.variables.slice(0, 4).map((variable: string) => (
                                <code key={variable} className="rounded bg-violet-50 px-1.5 py-0.5 text-xs text-violet-600">
                                  {`{{${variable}}}`}
                                </code>
                              ))}
                              {template.variables.length > 4 && (
                                <span className="text-xs text-slate-400">
                                  +{template.variables.length - 4} more
                                </span>
                              )}
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
                                      setTestEmailData({
                                        ...testEmailData,
                                        to: '',
                                        template: template.id
                                      })
                                      setIsTestEmailOpen(true)
                                    }}
                                  >
                                    <Send className="h-4 w-4" />
                                    Test
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Send Test Email</TooltipContent>
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
                                        name: `${template.name} (Copy)`,
                                        template: template.template || DEFAULT_TEMPLATE_HTML
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
      </Tabs>

      {/* Test Email Dialog */}
      <Dialog open={isTestEmailOpen} onOpenChange={setIsTestEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                <Send className="h-4 w-4 text-white" />
              </div>
              Send Test Email
            </DialogTitle>
            <DialogDescription>
              Send a test email to verify your SMTP configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="testTo">Recipient Email *</Label>
              <Input
                id="testTo"
                type="email"
                value={testEmailData.to}
                onChange={(e) => setTestEmailData({ ...testEmailData, to: e.target.value })}
                placeholder="admin@rentease.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="testSubject">Subject</Label>
              <Input
                id="testSubject"
                value={testEmailData.subject}
                onChange={(e) => setTestEmailData({ ...testEmailData, subject: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Template</Label>
              <Select
                value={testEmailData.template}
                onValueChange={(v) => setTestEmailData({ ...testEmailData, template: v })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestEmailOpen(false)} className="border-slate-300 text-slate-600 hover:bg-slate-50">
              Cancel
            </Button>
            <Button
              onClick={handleTestEmail}
              disabled={isTesting}
              className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            >
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Test Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Editor Dialog */}
      <Dialog open={isTemplateEditorOpen} onOpenChange={setIsTemplateEditorOpen}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                <FileText className="h-4 w-4 text-white" />
              </div>
              Edit Email Template
            </DialogTitle>
            <DialogDescription>
              Edit the HTML template for {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Template Name</Label>
                <Input value={selectedTemplate.name} readOnly className="mt-1.5 bg-slate-50" />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={selectedTemplate.subject}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                  className="mt-1.5"
                />
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
              <div>
                <Label>HTML Template</Label>
                <Textarea
                  value={selectedTemplate.template || ''}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, template: e.target.value })}
                  rows={15}
                  className="mt-1.5 font-mono text-sm"
                  placeholder="Enter HTML template content..."
                />
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