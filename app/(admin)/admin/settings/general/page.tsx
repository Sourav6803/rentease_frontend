// src/app/admin/settings/general/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube,
  Save, Loader2, Upload, Image as ImageIcon, Monitor, Smartphone, Bell,
  CreditCard, Users, Wrench, Shield, RefreshCw, CheckCircle, AlertCircle,
  Sparkles, Palette, Building2, Search, Settings2, ToggleRight, Clock,
  Server, ShieldCheck, Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import axios from 'axios'
import { cn } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const generalSettingsSchema = z.object({
  siteName: z.string().min(3, 'Site name must be at least 3 characters'),
  siteDescription: z.string().max(500, 'Description must be less than 500 characters'),
  contactEmail: z.string().email('Invalid email address'),
  supportEmail: z.string().email('Invalid email address'),
  supportPhone: z.string().min(10, 'Invalid phone number'),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    country: z.string()
  }),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal(''))
  }),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    metaKeywords: z.string(),
    googleAnalyticsId: z.string().optional()
  }),
  currency: z.string().min(3, 'Currency code is required'),
  timezone: z.string().min(3, 'Timezone is required'),
  defaultCommission: z.coerce.number().min(0).max(100),
  maintenanceMode: z.boolean(),
  registrationEnabled: z.boolean(),
  vendorRegistrationEnabled: z.boolean(),
  features: z.object({
    pushNotifications: z.boolean(),
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    autoPayments: z.boolean(),
    vendorPayouts: z.boolean(),
    maintenanceRequests: z.boolean()
  })
})

type GeneralSettingsForm = z.infer<typeof generalSettingsSchema>

const DEFAULT_SETTINGS: GeneralSettingsForm = {
  siteName: 'RentEase',
  siteDescription: '',
  contactEmail: '',
  supportEmail: '',
  supportPhone: '',
  address: { street: '', city: '', state: '', pincode: '', country: 'India' },
  socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' },
  seo: { metaTitle: '', metaDescription: '', metaKeywords: '', googleAnalyticsId: '' },
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  defaultCommission: 10,
  maintenanceMode: false,
  registrationEnabled: true,
  vendorRegistrationEnabled: true,
  features: {
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: true,
    autoPayments: true,
    vendorPayouts: true,
    maintenanceRequests: true
  }
}

// ── Section accent palette (rotates per card — no black, no monotone) ──────
const SECTION_THEMES = {
  branding: { grad: 'from-blue-500 to-indigo-500', tint: 'bg-blue-50', text: 'text-blue-600' },
  contact: { grad: 'from-emerald-500 to-teal-500', tint: 'bg-emerald-50', text: 'text-emerald-600' },
  social: { grad: 'from-fuchsia-500 to-pink-500', tint: 'bg-fuchsia-50', text: 'text-fuchsia-600' },
  seo: { grad: 'from-amber-500 to-orange-500', tint: 'bg-amber-50', text: 'text-amber-600' },
  system: { grad: 'from-violet-500 to-purple-500', tint: 'bg-violet-50', text: 'text-violet-600' },
  features: { grad: 'from-cyan-500 to-blue-500', tint: 'bg-cyan-50', text: 'text-cyan-600' },
  access: { grad: 'from-rose-500 to-red-500', tint: 'bg-rose-50', text: 'text-rose-600' },
} as const

type ThemeKey = keyof typeof SECTION_THEMES

function SectionHeader({
  theme, icon: Icon, title, description, badge,
}: {
  theme: ThemeKey
  icon: any
  title: string
  description: string
  badge?: string
}) {
  const t = SECTION_THEMES[theme]
  return (
    <CardHeader className="flex flex-row items-start gap-3 px-5 pb-4 pt-5 sm:px-6">
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm',
          t.grad
        )}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg text-slate-900">{title}</CardTitle>
          {badge && (
            <Badge className={cn('border-0 font-medium', t.tint, t.text)}>{badge}</Badge>
          )}
        </div>
        <CardDescription className="mt-0.5">{description}</CardDescription>
      </div>
    </CardHeader>
  )
}

function SwitchField({ name, control, label, description, icon: Icon, theme }: any) {
  const t = SECTION_THEMES[theme as ThemeKey] ?? SECTION_THEMES.features
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:bg-slate-50/80">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', t.tint)}>
          <Icon className={cn('h-[18px] w-[18px]', t.text)} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600"
          />
        )}
      />
    </div>
  )
}

// Static, informational-only strip — not user-editable, purely context
function InfoStat({ icon: Icon, label, value, theme }: { icon: any; label: string; value: string; theme: ThemeKey }) {
  const t = SECTION_THEMES[theme]
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-white/60 bg-white/70 px-3 py-2.5 backdrop-blur-sm">
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', t.tint)}>
        <Icon className={cn('h-4 w-4', t.text)} />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

export default function GeneralSettingsPage() {
  const { data: session } = useSession()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [rawSettings, setRawSettings] = useState<any>(null)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    control
  } = useForm<GeneralSettingsForm>({
    resolver: zodResolver(generalSettingsSchema) as any,
    defaultValues: DEFAULT_SETTINGS
  })

  useEffect(() => {
    const fetchGeneralSettings = async () => {
      setIsLoading(true)
      setFetchError(null)
      try {
        const response = await axios.get(`${BASE_URL}/api/v1/admin/system/settings`, {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
        })
        if (response.data.success) {
          const data = response.data.data
          setRawSettings(data)
          setLogoPreview(data.logo || null)
          setFaviconPreview(data.favicon || null)
          const merged = {
            ...DEFAULT_SETTINGS,
            ...data,
            features: { ...DEFAULT_SETTINGS.features, ...(data.features || {}) }
          }
          reset(merged)
        }
      } catch (error: any) {
        console.error('Error fetching general settings:', error)
        setFetchError(error.response?.data?.message || 'Failed to load settings')
        reset(DEFAULT_SETTINGS)
      } finally {
        setIsLoading(false)
      }
    }
    if (session?.user?.accessToken) {
      fetchGeneralSettings()
    }
  }, [session, reset, control])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon') => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      if (field === 'logo') setLogoPreview(base64)
      else setFaviconPreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: GeneralSettingsForm) => {
    setIsSaving(true)
    try {
      const payload = {
        ...data,
        logo: logoPreview,
        favicon: faviconPreview
      }
      const response = await axios.put(`${BASE_URL}/api/v1/admin/system/settings`, payload, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Settings updated successfully')
        setRawSettings(response.data.data || payload)
        setLastSavedAt(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }))
      }
    } catch (error: any) {
      console.error('Error updating settings:', error)
      toast.error(error.response?.data?.message || 'Failed to update settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (rawSettings) {
      const merged = {
        ...DEFAULT_SETTINGS,
        ...rawSettings,
        features: { ...DEFAULT_SETTINGS.features, ...(rawSettings.features || {}) }
      }
      reset(merged)
      setLogoPreview(rawSettings.logo || null)
      setFaviconPreview(rawSettings.favicon || null)
    } else {
      reset(DEFAULT_SETTINGS)
    }
    toast.info('Changes discarded')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-xl" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-blue-600" />
        </div>
        <p className="text-sm font-medium text-s-slate-500">Loading platform settings…</p>
      </div>
    )
  }

  return (
    // ── FIX: No overflow-* on this wrapper. The admin <main> shell owns the
    // only scrollbar. Any overflow here would create a nested scroll container.
    // Removed max-w-full (redundant with w-full) and px-1 (layout already pads).
    <div className="w-full space-y-6 pb-2">
      {/* Hero header — gradient banner with live status + static context stats */}
      {/* ── FIX: overflow-hidden is KEPT here only to clip the decorative blur
          blobs. This is a local clip, not a scroll container — it does NOT
          create a second scrollbar because it has a fixed height context
          (content-driven, no overflow-y). */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-fuchsia-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Settings2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">General Settings</h2>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                Configure your platform branding, locale, and system configuration
              </p>
            </div>
          </div>
          {rawSettings?.maintenanceMode ? (
            <Badge className="gap-1 border-0 bg-gradient-to-r from-rose-500 to-red-500 px-3 py-1.5 text-white shadow-sm">
              <AlertCircle className="h-3.5 w-3.5" />
              Maintenance Mode
            </Badge>
          ) : (
            <Badge className="gap-1 border-0 bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-white shadow-sm">
              <CheckCircle className="h-3.5 w-3.5" />
              Operational
            </Badge>
          )}
        </div>
        {/* Static informational strip — read-only platform context */}
        <div className="relative mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <InfoStat icon={Server} label="Environment" value="Production" theme="system" />
          <InfoStat icon={Clock} label="Last Saved" value={lastSavedAt ?? 'Not yet this session'} theme="branding" />
          <InfoStat icon={ShieldCheck} label="Config Scope" value="Platform-wide" theme="access" />
          <InfoStat icon={Globe} label="Active Region" value="India (Asia/Kolkata)" theme="contact" />
        </div>
      </div>

      {fetchError && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">Error loading settings</p>
              <p className="text-sm text-red-700">{fetchError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFetchError(null)
                window.location.reload()
              }}
              className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Branding Section */}
        <Card className="border-slate-200 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <SectionHeader
            theme="branding"
            icon={Palette}
            title="Branding"
            description="Platform identity, logos, and description"
            badge="Public-facing"
          />
          <CardContent className="space-y-4 px-5 py-5 sm:px-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="siteName">Site Name *</Label>
                <Input id="siteName" {...register('siteName')} placeholder="RentEase" className="mt-1.5" />
                {errors.siteName && (
                  <p className="mt-1 text-xs text-red-500">{errors.siteName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea id="siteDescription" {...register('siteDescription')} rows={2} placeholder="Your one-stop platform for renting products" className="mt-1.5" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Site Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-100 bg-blue-50">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-full w-full object-contain" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-blue-300" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="logo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                    <p className="mt-1 text-xs text-slate-400">PNG, JPG up to 2MB · square recommended</p>
                  </div>
                </div>
              </div>
              <div>
                <Label>Favicon</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-indigo-100 bg-indigo-50">
                    {faviconPreview ? (
                      <img src={faviconPreview} alt="Favicon" className="h-full w-full object-contain" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-indigo-300" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="favicon-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'favicon')}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('favicon-upload')?.click()}
                      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Favicon
                    </Button>
                    <p className="mt-1 text-xs text-slate-400">ICO, PNG up to 2MB · 32×32 or 64×64</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-slate-200 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <SectionHeader
            theme="contact"
            icon={Building2}
            title="Contact Information"
            description="Support and business contact details"
          />
          <CardContent className="space-y-4 px-5 py-5 sm:px-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                  <Input id="contactEmail" type="email" {...register('contactEmail')} placeholder="contact@rentease.com" className="pl-9" />
                </div>
                {errors.contactEmail && (
                  <p className="mt-1 text-xs text-red-500">{errors.contactEmail.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="supportEmail">Support Email *</Label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                  <Input id="supportEmail" type="email" {...register('supportEmail')} placeholder="support@rentease.com" className="pl-9" />
                </div>
                {errors.supportEmail && (
                  <p className="mt-1 text-xs text-red-500">{errors.supportEmail.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="supportPhone">Support Phone</Label>
                <div className="relative mt-1.5">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
                  <Input id="supportPhone" {...register('supportPhone')} placeholder="+91 98765 43210" className="pl-9" />
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <Label className="mb-0">Business Address</Label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input placeholder="Street Address" {...register('address.street')} />
                </div>
                <Input placeholder="City" {...register('address.city')} />
                <Input placeholder="State" {...register('address.state')} />
                <Input placeholder="Pincode" {...register('address.pincode')} />
                <Input placeholder="Country" {...register('address.country')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card className="border-slate-200 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-fuchsia-500 to-pink-500" />
          <SectionHeader
            theme="social"
            icon={Globe}
            title="Social Media Links"
            description="Connect your social media profiles"
            badge="Optional"
          />
          <CardContent className="px-5 py-5 sm:px-6">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50', field: 'socialLinks.facebook', placeholder: 'Facebook URL' },
                { icon: Twitter, color: 'text-sky-500', bg: 'bg-sky-50', field: 'socialLinks.twitter', placeholder: 'Twitter URL' },
                { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50', field: 'socialLinks.instagram', placeholder: 'Instagram URL' },
                { icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50', field: 'socialLinks.linkedin', placeholder: 'LinkedIn URL' },
                { icon: Youtube, color: 'text-red-600', bg: 'bg-red-50', field: 'socialLinks.youtube', placeholder: 'YouTube URL' },
              ].map(({ icon: SIcon, color, bg, field, placeholder }) => (
                <div key={field} className="flex items-center gap-2 rounded-lg border border-slate-200 p-1.5 pl-2 focus-within:ring-2 focus-within:ring-fuchsia-200">
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', bg)}>
                    <SIcon className={cn('h-4 w-4', color)} />
                  </div>
                  <Input
                    placeholder={placeholder}
                    {...register(field as any)}
                    className="border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card className="border-slate-200 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <SectionHeader
            theme="seo"
            icon={Search}
            title="SEO & Analytics"
            description="Search engine optimization and tracking"
          />
          <CardContent className="space-y-4 px-5 py-5 sm:px-6">
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input id="metaTitle" {...register('seo.metaTitle')} placeholder="RentEase - Rent Anything, Anywhere" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea id="metaDescription" {...register('seo.metaDescription')} rows={2} placeholder="Rent furniture, appliances, electronics and more on flexible monthly plans." className="mt-1.5" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input id="metaKeywords" {...register('seo.metaKeywords')} placeholder="keyword1, keyword2, keyword3" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input id="googleAnalyticsId" {...register('seo.googleAnalyticsId')} placeholder="G-XXXXXXXXXX or UA-XXXXX-X" className="mt-1.5" />
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>Meta title should stay under 60 characters and meta description under 160 characters for optimal search engine display.</p>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card className="border-slate-200 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <SectionHeader
            theme="system"
            icon={Settings2}
            title="System Configuration"
            description="Currency, timezone, and platform defaults"
          />
          <CardContent className="space-y-4 px-5 py-5 sm:px-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="currency">Currency Code *</Label>
                <Input id="currency" {...register('currency')} placeholder="INR" className="mt-1.5" />
                {errors.currency && (
                  <p className="mt-1 text-xs text-red-500">{errors.currency.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="timezone">Timezone *</Label>
                <Input id="timezone" {...register('timezone')} placeholder="Asia/Kolkata" className="mt-1.5" />
                {errors.timezone && (
                  <p className="mt-1 text-xs text-red-500">{errors.timezone.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="defaultCommission">Default Commission (%) *</Label>
                <Input id="defaultCommission" type="number" {...register('defaultCommission')} placeholder="10" className="mt-1.5" />
                {errors.defaultCommission && (
                  <p className="mt-1 text-xs text-red-500">{errors.defaultCommission.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features & Access */}
        <Card className="border-slate-200 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <SectionHeader
            theme="features"
            icon={ToggleRight}
            title="Features & Access"
            description="Enable or disable platform features"
          />
          <CardContent className="px-5 py-5 sm:px-6">
            <div className="grid gap-3 md:grid-cols-2">
              <SwitchField name="features.pushNotifications" control={control} label="Push Notifications" description="Send push notifications to users" icon={Bell} theme="branding" />
              <SwitchField name="features.emailNotifications" control={control} label="Email Notifications" description="Send email notifications" icon={Mail} theme="contact" />
              <SwitchField name="features.smsNotifications" control={control} label="SMS Notifications" description="Send SMS alerts and OTPs" icon={Smartphone} theme="social" />
              <SwitchField name="features.autoPayments" control={control} label="Auto Payments" description="Enable automatic payment processing" icon={CreditCard} theme="seo" />
              <SwitchField name="features.vendorPayouts" control={control} label="Vendor Payouts" description="Automate vendor payouts" icon={Users} theme="features" />
              <SwitchField name="features.maintenanceRequests" control={control} label="Maintenance Requests" description="Allow users to raise support tickets" icon={Wrench} theme="system" />
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card className="border-slate-200 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-rose-500 to-red-500" />
          <SectionHeader
            theme="access"
            icon={Shield}
            title="Access Control"
            description="Registration and platform availability"
            badge="Sensitive"
          />
          <CardContent className="px-5 py-5 sm:px-6">
            <div className="space-y-3">
              <SwitchField name="maintenanceMode" control={control} label="Maintenance Mode" description="Temporarily disable platform access for all non-admin users" icon={Shield} theme="access" />
              <SwitchField name="registrationEnabled" control={control} label="User Registration" description="Allow new users to register accounts" icon={Users} theme="branding" />
              <SwitchField name="vendorRegistrationEnabled" control={control} label="Vendor Registration" description="Allow new vendors to apply" icon={Monitor} theme="contact" />
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-lg shadow-slate-200/50 backdrop-blur-md sm:justify-end">
          <p className="hidden text-xs text-slate-400 sm:block">
            {isDirty ? 'You have unsaved changes' : 'All changes saved'}
          </p>
          <div className="flex w-full gap-3 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-50 sm:flex-none"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 sm:flex-none"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}