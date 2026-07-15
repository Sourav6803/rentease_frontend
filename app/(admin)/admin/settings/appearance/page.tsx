'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Palette,
  Monitor,
  Smartphone,
  Save,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle
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

const DEFAULT_APPEARANCE = {
  theme: 'system',
  compactView: false,
  reducedMotion: false,
  fontSize: 'medium',
  sidebarStyle: 'default',
  colorScheme: 'blue'
}

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', description: 'Light mode theme' },
  { value: 'dark', label: 'Dark', description: 'Dark mode theme' },
  { value: 'system', label: 'System', description: 'Follow system preference' }
]

const FONT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small', description: 'Compact text for more content' },
  { value: 'medium', label: 'Medium', description: 'Default readable size' },
  { value: 'large', label: 'Large', description: 'Larger text for accessibility' }
]

const SIDEBAR_OPTIONS = [
  { value: 'default', label: 'Default', description: 'Full sidebar with icons and labels' },
  { value: 'minimal', label: 'Minimal', description: 'Collapsed sidebar with icons only' },
  { value: 'overlay', label: 'Overlay', description: 'Hidden sidebar with overlay toggle' }
]

const COLOR_SCHEME_OPTIONS = [
  { value: 'blue', label: 'Ocean Blue', description: 'Calm and professional' },
  { value: 'emerald', label: 'Emerald', description: 'Fresh and vibrant' },
  { value: 'violet', label: 'Violet', description: 'Creative and bold' },
  { value: 'rose', label: 'Rose', description: 'Warm and energetic' }
]

export default function AppearanceSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [appearance, setAppearance] = useState(DEFAULT_APPEARANCE)
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
        const appearanceData = settings.appearance || {}
        setAppearance({
          theme: appearanceData.theme || DEFAULT_APPEARANCE.theme,
          compactView: appearanceData.compactView ?? DEFAULT_APPEARANCE.compactView,
          reducedMotion: appearanceData.reducedMotion ?? DEFAULT_APPEARANCE.reducedMotion,
          fontSize: appearanceData.fontSize || DEFAULT_APPEARANCE.fontSize,
          sidebarStyle: appearanceData.sidebarStyle || DEFAULT_APPEARANCE.sidebarStyle,
          colorScheme: appearanceData.colorScheme || DEFAULT_APPEARANCE.colorScheme
        })
      }
    } catch (error: any) {
      console.error('Error fetching appearance settings:', error)
      setFetchError(error.response?.data?.message || 'Failed to load appearance settings')
      toast.error(error.response?.data?.message || 'Failed to load appearance settings')
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
      const response = await axios.put(`${BASE_URL}/api/v1/admin/settings/appearance`, appearance, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Appearance settings saved successfully')
      }
    } catch (error: any) {
      console.error('Error saving appearance settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save appearance settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 opacity-20 blur-xl" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-pink-600" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading appearance settings…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full space-y-6 px-1 pb-2 sm:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-pink-400/20 to-rose-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 shadow-lg shadow-pink-500/25">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Appearance</h2>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                Themes, layout, and UI customization
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 border-0 bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/25 hover:from-pink-700 hover:to-rose-700"
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
              <p className="font-medium text-red-800">Error loading appearance settings</p>
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

      {/* Theme Settings */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-sm">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Theme</CardTitle>
              <CardDescription className="mt-0.5">
                Choose your preferred color scheme and display mode
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Display Mode</Label>
              <Select
                value={appearance.theme}
                onValueChange={(value) => setAppearance({ ...appearance, theme: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {THEME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-slate-500">{option.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Color Scheme</Label>
              <Select
                value={appearance.colorScheme}
                onValueChange={(value) => setAppearance({ ...appearance, colorScheme: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select color scheme" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_SCHEME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-slate-500">{option.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-sm">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Layout</CardTitle>
              <CardDescription className="mt-0.5">
                Control sidebar behavior and content density
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Sidebar Style</Label>
              <Select
                value={appearance.sidebarStyle}
                onValueChange={(value) => setAppearance({ ...appearance, sidebarStyle: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select sidebar style" />
                </SelectTrigger>
                <SelectContent>
                  {SIDEBAR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-slate-500">{option.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Font Size</Label>
              <Select
                value={appearance.fontSize}
                onValueChange={(value) => setAppearance({ ...appearance, fontSize: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-slate-500">{option.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Accessibility</CardTitle>
              <CardDescription className="mt-0.5">
                Options for improved usability and comfort
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div>
              <Label className="mb-0">Compact View</Label>
              <p className="text-xs text-slate-500">Reduce spacing and padding for denser content</p>
            </div>
            <Switch
              checked={appearance.compactView}
              onCheckedChange={(checked) => setAppearance({ ...appearance, compactView: checked })}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-600 data-[state=checked]:to-rose-600"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div>
              <Label className="mb-0">Reduce Motion</Label>
              <p className="text-xs text-slate-500">Minimize animations throughout the interface</p>
            </div>
            <Switch
              checked={appearance.reducedMotion}
              onCheckedChange={(checked) => setAppearance({ ...appearance, reducedMotion: checked })}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-600 data-[state=checked]:to-rose-600"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
