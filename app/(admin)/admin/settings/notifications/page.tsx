'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Mail,
  MessageSquare,
  Save,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Monitor
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import axios from 'axios'
import { cn } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const DEFAULT_NOTIFICATIONS = {
  email: {
    enabled: true,
    orders: true,
    promotions: false,
    reminders: true
  },
  push: {
    enabled: true,
    orders: true,
    promotions: false,
    reminders: true
  },
  sms: {
    enabled: true,
    orders: true,
    otp: true
  }
}

export default function NotificationsSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/settings`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        const settings = response.data.data?.settings || {}
        const notificationsData = settings.notifications || {}
        setNotifications({
          email: { ...DEFAULT_NOTIFICATIONS.email, ...notificationsData.email },
          push: { ...DEFAULT_NOTIFICATIONS.push, ...notificationsData.push },
          sms: { ...DEFAULT_NOTIFICATIONS.sms, ...notificationsData.sms }
        })
      }
    } catch (error: any) {
      console.error('Error fetching notification settings:', error)
      setFetchError(error.response?.data?.message || 'Failed to load notification settings')
      toast.error(error.response?.data?.message || 'Failed to load notification settings')
    } finally {
      setIsLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    if (status === 'authenticated') {
      fetchSettings()
    }
  }, [status, router, fetchSettings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put(`${BASE_URL}/api/v1/admin/settings/notifications`, notifications, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Notification settings saved successfully')
      }
    } catch (error: any) {
      console.error('Error saving notification settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save notification settings')
    } finally {
      setIsSaving(false)
    }
  }

  const updateChannel = (channel: 'email' | 'push' | 'sms') => (field: string, value: boolean) => {
    setNotifications({
      ...notifications,
      [channel]: {
        ...notifications[channel],
        enabled: channel === 'sms' ? notifications[channel].enabled : (field === 'enabled' ? value : notifications[channel].enabled),
        [field]: value
      }
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 opacity-20 blur-xl" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-amber-600" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading notification settings…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full space-y-6 px-1 pb-2 sm:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 shadow-lg shadow-amber-500/25">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                Push, in-app, and digest rules
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 border-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25 hover:from-amber-700 hover:to-orange-700"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {fetchError && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">Error loading notification settings</p>
              <p className="text-sm text-red-700">{fetchError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Email Notifications */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Email Notifications</CardTitle>
              <CardDescription className="mt-0.5">
                Manage email alerts and updates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div>
              <Label className="mb-0">Enable Email Notifications</Label>
              <p className="text-xs text-slate-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={notifications.email.enabled}
              onCheckedChange={(checked) => updateChannel('email')('enabled', checked)}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600"
            />
          </div>

          <div className="grid gap-3">
            {[
              { key: 'orders', label: 'Order Updates', description: 'Rental confirmations and delivery updates' },
              { key: 'promotions', label: 'Promotions', description: 'Marketing emails and special offers' },
              { key: 'reminders', label: 'Reminders', description: 'Payment due dates and renewal alerts' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <Switch
                  checked={notifications.email[item.key as keyof typeof notifications.email] as boolean}
                  onCheckedChange={(checked) => updateChannel('email')(item.key, checked)}
                  disabled={!notifications.email.enabled}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-sm">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Push Notifications</CardTitle>
              <CardDescription className="mt-0.5">
                In-app and browser push notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div>
              <Label className="mb-0">Enable Push Notifications</Label>
              <p className="text-xs text-slate-500">Receive push notifications in the browser</p>
            </div>
            <Switch
              checked={notifications.push.enabled}
              onCheckedChange={(checked) => updateChannel('push')('enabled', checked)}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-600 data-[state=checked]:to-purple-600"
            />
          </div>

          <div className="grid gap-3">
            {[
              { key: 'orders', label: 'Order Updates', description: 'Rental confirmations and delivery updates' },
              { key: 'promotions', label: 'Promotions', description: 'Marketing notifications and special offers' },
              { key: 'reminders', label: 'Reminders', description: 'Payment due dates and renewal alerts' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <Switch
                  checked={notifications.push[item.key as keyof typeof notifications.push] as boolean}
                  onCheckedChange={(checked) => updateChannel('push')(item.key, checked)}
                  disabled={!notifications.push.enabled}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-600 data-[state=checked]:to-purple-600"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">SMS Notifications</CardTitle>
              <CardDescription className="mt-0.5">
                Text message alerts and OTPs
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div>
              <Label className="mb-0">Enable SMS Notifications</Label>
              <p className="text-xs text-slate-500">Receive notifications via SMS</p>
            </div>
            <Switch
              checked={notifications.sms.enabled}
              onCheckedChange={(checked) => updateChannel('sms')('enabled', checked)}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-600 data-[state=checked]:to-teal-600"
            />
          </div>

          <div className="grid gap-3">
            {[
              { key: 'orders', label: 'Order Updates', description: 'Rental status and delivery alerts' },
              { key: 'otp', label: 'OTP Alerts', description: 'One-time passwords for login and verification' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <Switch
                  checked={notifications.sms[item.key as keyof typeof notifications.sms] as boolean}
                  onCheckedChange={(checked) => updateChannel('sms')(item.key, checked)}
                  disabled={!notifications.sms.enabled}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-600 data-[state=checked]:to-teal-600"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
