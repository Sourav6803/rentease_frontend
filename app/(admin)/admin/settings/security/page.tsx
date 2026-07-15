'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Shield,
  Smartphone,
  Lock,
  Save,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Eye
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

const DEFAULT_SECURITY = {
  twoFactorEnabled: false,
  loginAlerts: true,
  lastPasswordChange: null
}

export default function SecuritySettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [security, setSecurity] = useState(DEFAULT_SECURITY)
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
        const securityData = settings.security || {}
        setSecurity({
          twoFactorEnabled: securityData.twoFactorEnabled ?? DEFAULT_SECURITY.twoFactorEnabled,
          loginAlerts: securityData.loginAlerts ?? DEFAULT_SECURITY.loginAlerts,
          lastPasswordChange: securityData.lastPasswordChange || DEFAULT_SECURITY.lastPasswordChange
        })
      }
    } catch (error: any) {
      console.error('Error fetching security settings:', error)
      setFetchError(error.response?.data?.message || 'Failed to load security settings')
      toast.error(error.response?.data?.message || 'Failed to load security settings')
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
      const response = await axios.put(`${BASE_URL}/api/v1/admin/settings/security`, {
        twoFactorEnabled: security.twoFactorEnabled,
        loginAlerts: security.loginAlerts
      }, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Security settings saved successfully')
        setSecurity(response.data.data?.security || security)
      }
    } catch (error: any) {
      console.error('Error saving security settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save security settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 opacity-20 blur-xl" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-red-600" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading security settings…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full space-y-6 px-1 pb-2 sm:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-red-400/20 to-rose-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-pink-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 shadow-lg shadow-red-500/25">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Security</h2>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                2FA, GDPR, audit policies
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 border-0 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/25 hover:from-red-700 hover:to-rose-700"
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
              <p className="font-medium text-red-800">Error loading security settings</p>
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

      {/* Authentication */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-500 shadow-sm">
              <KeyRound className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Authentication</CardTitle>
              <CardDescription className="mt-0.5">
                Two-factor authentication and login security
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <Smartphone className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <Label className="mb-0">Two-Factor Authentication</Label>
                <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
              </div>
            </div>
            <Switch
              checked={security.twoFactorEnabled}
              onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-600 data-[state=checked]:to-rose-600"
            />
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Eye className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">2FA Status</p>
                <p className="mt-1 text-xs text-blue-700">
                  {security.twoFactorEnabled
                    ? 'Two-factor authentication is enabled. You will be prompted for a code when logging in.'
                    : 'Two-factor authentication is disabled. Enable it for stronger account security.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Monitoring</CardTitle>
              <CardDescription className="mt-0.5">
                Login alerts and activity monitoring
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div>
              <Label className="mb-0">Login Alerts</Label>
              <p className="text-xs text-slate-500">Get notified when someone logs into your account</p>
            </div>
            <Switch
              checked={security.loginAlerts}
              onCheckedChange={(checked) => setSecurity({ ...security, loginAlerts: checked })}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-600 data-[state=checked]:to-orange-600"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">Last Password Change</p>
            <p className="mt-1 text-sm text-slate-700">
              {security.lastPasswordChange
                ? new Date(security.lastPasswordChange).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })
                : 'Never changed'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-sm">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Password</CardTitle>
              <CardDescription className="mt-0.5">
                Change your admin account password
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-sm text-slate-600 mb-3">
              Use the change password form in the General settings page, or contact your super admin if you need assistance.
            </p>
            <Badge className="border-0 bg-slate-100 text-slate-600">
              Managed in General Settings
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
