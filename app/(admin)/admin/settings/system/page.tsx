'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Server,
  Save,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Database,
  HardDrive,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const DEFAULT_SYSTEM_SETTINGS = {
  appName: 'RentEase',
  appVersion: '1.0.0',
  environment: 'development',
  logLevel: 'info',
  cacheEnabled: true,
  cacheTTL: 3600,
  compressionEnabled: true,
  rateLimitEnabled: true,
  rateLimitMax: 100,
  rateLimitWindow: 15,
  maintenanceMode: false,
  debugMode: false,
  maxUploadSize: 10,
  allowedOrigins: '*'
}

const LOG_LEVELS = [
  { value: 'error', label: 'Error', description: 'Only errors' },
  { value: 'warn', label: 'Warning', description: 'Warnings and errors' },
  { value: 'info', label: 'Info', description: 'General information' },
  { value: 'debug', label: 'Debug', description: 'Detailed debugging' }
]

const ENVIRONMENTS = [
  { value: 'development', label: 'Development' },
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Production' }
]

export default function SystemSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState(DEFAULT_SYSTEM_SETTINGS)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/system/settings`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        const data = response.data.data?.settings || response.data.data || {}
        setSettings({ ...DEFAULT_SYSTEM_SETTINGS, ...data })
      }
    } catch (error: any) {
      console.error('Error fetching system settings:', error)
      setFetchError(error.response?.data?.message || 'Failed to load system settings')
      toast.error(error.response?.data?.message || 'Failed to load system settings')
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
      const response = await axios.put(`${BASE_URL}/api/v1/admin/system/settings`, settings, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('System settings saved successfully')
        setSettings(response.data.data?.settings || settings)
      }
    } catch (error: any) {
      console.error('Error saving system settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save system settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 opacity-20 blur-xl" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-slate-600" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading system settings…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full space-y-6 px-1 pb-2 sm:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-slate-50 to-zinc-100 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-slate-400/20 to-slate-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-zinc-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg shadow-slate-500/25">
              <Server className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">System</h2>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                Cache, infra, performance tuning
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 border-0 bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-md shadow-slate-500/25 hover:from-slate-700 hover:to-slate-800"
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
              <p className="font-medium text-red-800">Error loading system settings</p>
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

      {/* General System */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-slate-500 to-slate-600" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-sm">
              <Server className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">General</CardTitle>
              <CardDescription className="mt-0.5">
                Application metadata and runtime environment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 px-5 pb-5 sm:px-6 md:grid-cols-2">
          <div>
            <Label>App Name</Label>
            <Input
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              className="mt-1.5"
              placeholder="RentEase"
            />
          </div>
          <div>
            <Label>App Version</Label>
            <Input
              value={settings.appVersion}
              onChange={(e) => setSettings({ ...settings, appVersion: e.target.value })}
              className="mt-1.5"
              placeholder="1.0.0"
            />
          </div>
          <div>
            <Label>Environment</Label>
            <Select
              value={settings.environment}
              onValueChange={(value) => setSettings({ ...settings, environment: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                {ENVIRONMENTS.map((env) => (
                  <SelectItem key={env.value} value={env.value}>
                    {env.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Log Level</Label>
            <Select
              value={settings.logLevel}
              onValueChange={(value) => setSettings({ ...settings, logLevel: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select log level" />
              </SelectTrigger>
              <SelectContent>
                {LOG_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <p className="font-medium">{level.label}</p>
                      <p className="text-xs text-slate-500">{level.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cache & Performance */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Cache & Performance</CardTitle>
              <CardDescription className="mt-0.5">
                Caching and compression settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div>
              <Label className="mb-0">Enable Cache</Label>
              <p className="text-xs text-slate-500">Cache API responses for faster performance</p>
            </div>
            <Switch
              checked={settings.cacheEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, cacheEnabled: checked })}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-600 data-[state=checked]:to-teal-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Cache TTL (seconds)</Label>
              <Input
                type="number"
                value={settings.cacheTTL}
                onChange={(e) => setSettings({ ...settings, cacheTTL: parseInt(e.target.value) || 0 })}
                className="mt-1.5"
                placeholder="3600"
              />
            </div>
            <div>
              <Label>Max Upload Size (MB)</Label>
              <Input
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) || 0 })}
                className="mt-1.5"
                placeholder="10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div>
              <Label className="mb-0">Compression</Label>
              <p className="text-xs text-slate-500">Enable gzip compression for responses</p>
            </div>
            <Switch
              checked={settings.compressionEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, compressionEnabled: checked })}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-600 data-[state=checked]:to-teal-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
              <HardDrive className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Rate Limiting</CardTitle>
              <CardDescription className="mt-0.5">
                Protect APIs from abuse and overload
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div>
              <Label className="mb-0">Enable Rate Limiting</Label>
              <p className="text-xs text-slate-500">Limit API requests per client</p>
            </div>
            <Switch
              checked={settings.rateLimitEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, rateLimitEnabled: checked })}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-600 data-[state=checked]:to-orange-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Max Requests</Label>
              <Input
                type="number"
                value={settings.rateLimitMax}
                onChange={(e) => setSettings({ ...settings, rateLimitMax: parseInt(e.target.value) || 0 })}
                className="mt-1.5"
                placeholder="100"
              />
            </div>
            <div>
              <Label>Window (minutes)</Label>
              <Input
                type="number"
                value={settings.rateLimitWindow}
                onChange={(e) => setSettings({ ...settings, rateLimitWindow: parseInt(e.target.value) || 0 })}
                className="mt-1.5"
                placeholder="15"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-rose-500 to-red-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-500 shadow-sm">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Operational</CardTitle>
              <CardDescription className="mt-0.5">
                Maintenance and debugging controls
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div>
              <Label className="mb-0">Maintenance Mode</Label>
              <p className="text-xs text-slate-500">Temporarily disable access for non-admin users</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-rose-600 data-[state=checked]:to-red-600"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div>
              <Label className="mb-0">Debug Mode</Label>
              <p className="text-xs text-slate-500">Enable verbose logging for troubleshooting</p>
            </div>
            <Switch
              checked={settings.debugMode}
              onCheckedChange={(checked) => setSettings({ ...settings, debugMode: checked })}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-rose-600 data-[state=checked]:to-red-600"
            />
          </div>

          <div>
            <Label>Allowed Origins (CORS)</Label>
            <Input
              value={settings.allowedOrigins}
              onChange={(e) => setSettings({ ...settings, allowedOrigins: e.target.value })}
              className="mt-1.5 font-mono text-sm"
              placeholder="*"
            />
            <p className="mt-1 text-xs text-slate-400">Comma-separated origins, or * for all</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
