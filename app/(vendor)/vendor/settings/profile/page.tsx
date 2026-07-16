


'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  FileText,
  Upload,
  Loader2,
  Save,
  Edit2,
  X,
  Plus,
  Trash2,
  Star,
  Award,
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Shield,
  RefreshCw,
  BadgeCheck,
  Zap,
  BarChart2,
  CalendarDays,
  Hash,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import axios from 'axios'
import { format } from 'date-fns'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const profileSchema = z.object({
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  businessDescription: z.string().max(500, 'Description must be less than 500 characters').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  secondaryPhone: z.string().optional(),
  supportEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  supportPhone: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
    </motion.div>
  )
}

function InfoRow({ label, value, mono = false }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      {value ? (
        <span className={`text-sm font-medium text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</span>
      ) : (
        <span className="text-sm text-slate-300 italic">Not provided</span>
      )}
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/60 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#2874f0]/10 rounded-lg p-1.5">
              <Icon className="h-4 w-4 text-[#2874f0]" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-700">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">{children}</CardContent>
      </Card>
    </motion.div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function VendorProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [serviceableCities, setServiceableCities] = useState<Array<{ city: string; state: string }>>([])
  const [serviceablePincodes, setServiceablePincodes] = useState<string[]>([])
  const [newCity, setNewCity] = useState({ city: '', state: '' })
  const [newPincode, setNewPincode] = useState('')
  const hasFetched = useRef(false) // ← prevents duplicate fetches

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: '',
      businessDescription: '',
      website: '',
      secondaryPhone: '',
      supportEmail: '',
      supportPhone: '',
    },
  })

  // ── FIX: Only fetch once session is authenticated and token is available ──────
  const fetchProfile = useCallback(async (token: string) => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${BASE_URL}/api/v1/vendor/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        const data = response.data.data.profile
        setProfile(data)
        setValue('businessName', data.business?.name || '')
        setValue('businessDescription', data.business?.description || '')
        setValue('website', data.business?.website || '')
        setValue('secondaryPhone', data.contact?.secondaryPhone || '')
        setValue('supportEmail', data.contact?.supportEmail || '')
        setValue('supportPhone', data.contact?.supportPhone || '')
        setServiceableCities(data.addresses?.serviceableCities || [])
        setServiceablePincodes(data.addresses?.serviceablePincodes || [])
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [setValue])

  useEffect(() => {
    // Wait until session is fully loaded and token exists
    if (status !== 'authenticated') return
    const token = session?.user?.accessToken
    if (!token) return
    // Prevent calling the API more than once per mount
    if (hasFetched.current) return
    hasFetched.current = true
    fetchProfile(token)
  }, [status, session?.user?.accessToken, fetchProfile])

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)
    try {
      const payload = {
        business: {
          name: data.businessName,
          description: data.businessDescription,
          website: data.website,
        },
        contact: {
          secondaryPhone: data.secondaryPhone,
          supportEmail: data.supportEmail,
          supportPhone: data.supportPhone,
        },
        addresses: {
          serviceableCities,
          serviceablePincodes,
        },
      }

      const response = await axios.put(`${BASE_URL}/api/v1/vendor/profile`, payload, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
      })

      if (response.data.success) {
        toast.success('Profile updated successfully')
        setIsEditing(false)
        // Re-allow fetch so we can refresh after save
        hasFetched.current = false
        fetchProfile(session!.user!.accessToken as string)
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const addCity = () => {
    if (newCity.city.trim() && newCity.state.trim()) {
      setServiceableCities((prev) => [...prev, { city: newCity.city.trim(), state: newCity.state.trim() }])
      setNewCity({ city: '', state: '' })
    }
  }

  const removeCity = (index: number) => setServiceableCities((prev) => prev.filter((_, i) => i !== index))

  const addPincode = () => {
    const trimmed = newPincode.trim()
    if (/^\d{6}$/.test(trimmed) && !serviceablePincodes.includes(trimmed)) {
      setServiceablePincodes((prev) => [...prev, trimmed])
      setNewPincode('')
    } else if (serviceablePincodes.includes(trimmed)) {
      toast.warning('Pincode already added')
    } else {
      toast.warning('Enter a valid 6-digit pincode')
    }
  }

  const removePincode = (pincode: string) => setServiceablePincodes((prev) => prev.filter((p) => p !== pincode))

  const cancelEdit = () => {
    setIsEditing(false)
    // Re-populate form with existing profile data
    if (profile) {
      setValue('businessName', profile.business?.name || '')
      setValue('businessDescription', profile.business?.description || '')
      setValue('website', profile.business?.website || '')
      setValue('secondaryPhone', profile.contact?.secondaryPhone || '')
      setValue('supportEmail', profile.contact?.supportEmail || '')
      setValue('supportPhone', profile.contact?.supportPhone || '')
      setServiceableCities(profile.addresses?.serviceableCities || [])
      setServiceablePincodes(profile.addresses?.serviceablePincodes || [])
    }
  }

  // ── Loading State ─────────────────────────────────────────────────────────────
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-[#2874f0]/20 border-t-[#2874f0] animate-spin" />
          <Building2 className="absolute inset-0 m-auto h-5 w-5 text-[#2874f0]" />
        </div>
        <p className="text-sm text-slate-400 font-medium">Loading your business profile…</p>
      </div>
    )
  }

  const planColors: Record<string, string> = {
    free: 'bg-slate-100 text-slate-600',
    basic: 'bg-blue-50 text-blue-600',
    premium: 'bg-amber-50 text-amber-600',
    enterprise: 'bg-purple-50 text-purple-600',
  }
  const planBadge = planColors[profile?.subscription?.plan?.toLowerCase()] || 'bg-slate-100 text-slate-600'

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* ── Top Banner ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#2874f0] to-[#1a55c4] rounded-2xl p-6 mb-6 text-white shadow-lg shadow-[#2874f0]/20">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/30">
              {profile?.business?.name?.[0]?.toUpperCase() || 'V'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{profile?.business?.name || 'Your Business'}</h1>
                {profile?.verification?.isVerified && (
                  <BadgeCheck className="h-5 w-5 text-green-300"  />
                )}
              </div>
              <p className="text-sm text-blue-100 mt-0.5 capitalize">
                {profile?.business?.businessType?.replace('_', ' ') || 'Vendor'} ·{' '}
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 ${planBadge.split(' ')[1]}`}>
                  {profile?.subscription?.plan || 'Free'} Plan
                </span>
              </p>
              <p className="text-xs text-blue-200 mt-1">{profile?.contact?.primaryEmail || profile?.user?.email}</p>
            </div>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              className="bg-white text-[#2874f0] hover:bg-blue-50 font-semibold shadow-none gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Products"
          value={profile?.products?.total ?? 0}
          icon={Package}
          color="bg-blue-50 text-blue-500"
          delay={0}
        />
        <StatCard
          label="Total Rentals"
          value={profile?.performance?.metrics?.totalRentals ?? 0}
          icon={TrendingUp}
          color="bg-emerald-50 text-emerald-500"
          delay={0.05}
        />
        <StatCard
          label="Revenue"
          value={`₹${((profile?.performance?.metrics?.totalRevenue || 0) / 1000).toFixed(1)}K`}
          icon={BarChart2}
          color="bg-violet-50 text-violet-500"
          delay={0.1}
        />
        <StatCard
          label="Avg. Rating"
          value={profile?.performance?.rating?.average?.toFixed(1) ?? '—'}
          icon={Star}
          color="bg-amber-50 text-amber-500"
          delay={0.15}
        />
      </div>

      <AnimatePresence mode="wait">
        {!isEditing ? (
          // ── VIEW MODE ───────────────────────────────────────────────────────
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Business Info */}
            <SectionCard icon={Building2} title="Business Information">
              <div className="grid sm:grid-cols-2 gap-5">
                <InfoRow label="Business Name" value={profile?.business?.name} />
                <InfoRow label="Business Type" value={profile?.business?.businessType?.replace('_', ' ')} />
                <InfoRow label="GSTIN" value={profile?.business?.gstin} mono />
                <InfoRow label="PAN Number" value={profile?.business?.panNumber} mono />
                {profile?.business?.website && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Website</span>
                    <a
                      href={profile.business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#2874f0] hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {profile.business.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {profile?.business?.description && (
                  <div className="sm:col-span-2 flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Description</span>
                    <p className="text-sm text-slate-700 leading-relaxed">{profile.business.description}</p>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Contact Info */}
            <SectionCard icon={Phone} title="Contact Information">
              <div className="grid sm:grid-cols-2 gap-5">
                <InfoRow label="Primary Phone" value={profile?.contact?.primaryPhone} />
                <InfoRow label="Secondary Phone" value={profile?.contact?.secondaryPhone} />
                <InfoRow label="Primary Email" value={profile?.contact?.primaryEmail || profile?.user?.email} />
                <InfoRow label="Support Email" value={profile?.contact?.supportEmail} />
                <InfoRow label="Support Phone" value={profile?.contact?.supportPhone} />
              </div>
            </SectionCard>

            {/* Service Areas */}
            <SectionCard icon={MapPin} title="Service Areas">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Serviceable Cities</p>
                  {serviceableCities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {serviceableCities.map((c, i) => (
                        <Badge key={i} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 font-medium">
                          {c.city}, {c.state}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-300 italic">No cities added</p>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Serviceable Pincodes</p>
                  {serviceablePincodes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {serviceablePincodes.map((p, i) => (
                        <Badge key={i} className="bg-slate-50 text-slate-600 border-slate-200 font-mono font-medium">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-300 italic">No pincodes added</p>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Subscription */}
            <SectionCard icon={Award} title="Subscription Plan">
              <div className="flex flex-wrap items-center justify-between gap-6 mb-5">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Current Plan</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${planBadge}`}>
                    {profile?.subscription?.plan || 'Free'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Valid Until</p>
                  <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    {profile?.subscription?.validUntil
                      ? format(new Date(profile.subscription.validUntil), 'dd MMM yyyy')
                      : '—'}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-[#fb641b] hover:bg-[#e55c18] text-white font-semibold rounded-lg gap-2 shadow-sm"
                >
                  <Zap className="h-4 w-4" />
                  Upgrade Plan
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-center">
                  <p className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Max Products</p>
                  <p className="font-bold text-slate-700">
                    {profile?.subscription?.limits?.maxProducts === -1 ? '∞' : profile?.subscription?.limits?.maxProducts ?? '—'}
                  </p>
                </div>
                <div className="text-center border-x border-slate-200">
                  <p className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Rentals/Month</p>
                  <p className="font-bold text-slate-700">
                    {profile?.subscription?.limits?.maxRentalsPerMonth === -1 ? '∞' : profile?.subscription?.limits?.maxRentalsPerMonth ?? '—'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Priority Support</p>
                  <p className="font-bold text-slate-700">
                    {profile?.subscription?.limits?.prioritySupport ? (
                      <span className="text-green-600 flex items-center justify-center gap-1"><CheckCircle className="h-4 w-4" /> Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </p>
                </div>
              </div>
            </SectionCard>
          </motion.div>
        ) : (
          // ── EDIT MODE ───────────────────────────────────────────────────────
          <motion.form
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Business Information */}
            <Card className="border border-slate-100 rounded-2xl shadow-sm">
              <CardHeader className="pb-3 bg-slate-50/60 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="bg-[#2874f0]/10 rounded-lg p-1.5">
                    <Building2 className="h-4 w-4 text-[#2874f0]" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-700">Business Information</CardTitle>
                    <CardDescription className="text-xs">Update your business details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div>
                  <Label htmlFor="businessName" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Business Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    {...register('businessName')}
                    className={`mt-1 ${errors.businessName ? 'border-red-400 focus-visible:ring-red-200' : ''}`}
                    placeholder="Your business name"
                  />
                  <FieldError message={errors.businessName?.message} />
                </div>
                <div>
                  <Label htmlFor="businessDescription" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Business Description
                  </Label>
                  <Textarea
                    id="businessDescription"
                    {...register('businessDescription')}
                    rows={4}
                    className="mt-1 resize-none"
                    placeholder="Tell customers about your business…"
                  />
                  <FieldError message={errors.businessDescription?.message} />
                </div>
                <div>
                  <Label htmlFor="website" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Website URL
                  </Label>
                  <div className="relative mt-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="website"
                      {...register('website')}
                      className="pl-9"
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                  <FieldError message={errors.website?.message} />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border border-slate-100 rounded-2xl shadow-sm">
              <CardHeader className="pb-3 bg-slate-50/60 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="bg-[#2874f0]/10 rounded-lg p-1.5">
                    <Phone className="h-4 w-4 text-[#2874f0]" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-700">Contact Information</CardTitle>
                    <CardDescription className="text-xs">How customers can reach you</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="secondaryPhone" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Secondary Phone
                    </Label>
                    <Input id="secondaryPhone" {...register('secondaryPhone')} className="mt-1" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <Label htmlFor="supportPhone" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Support Phone
                    </Label>
                    <Input id="supportPhone" {...register('supportPhone')} className="mt-1" placeholder="Customer helpline" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="supportEmail" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Support Email
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="supportEmail"
                        {...register('supportEmail')}
                        type="email"
                        className="pl-9"
                        placeholder="support@yourbusiness.com"
                      />
                    </div>
                    <FieldError message={errors.supportEmail?.message} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Areas */}
            <Card className="border border-slate-100 rounded-2xl shadow-sm">
              <CardHeader className="pb-3 bg-slate-50/60 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="bg-[#2874f0]/10 rounded-lg p-1.5">
                    <MapPin className="h-4 w-4 text-[#2874f0]" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-700">Service Areas</CardTitle>
                    <CardDescription className="text-xs">Where you provide your services</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-6">
                {/* Cities */}
                <div>
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                    Serviceable Cities
                  </Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="City"
                      value={newCity.city}
                      onChange={(e) => setNewCity({ ...newCity, city: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
                      className="flex-1"
                    />
                    <Input
                      placeholder="State"
                      value={newCity.state}
                      onChange={(e) => setNewCity({ ...newCity, state: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addCity}
                      className="bg-[#2874f0] hover:bg-[#1a55c4] text-white px-4 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <AnimatePresence>
                    <div className="flex flex-wrap gap-2">
                      {serviceableCities.map((city, idx) => (
                        <motion.div
                          key={`${city.city}-${idx}`}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                        >
                          <Badge className="bg-blue-50 text-blue-700 border-blue-100 pr-1 pl-3 font-medium gap-1">
                            {city.city}, {city.state}
                            <button
                              type="button"
                              onClick={() => removeCity(idx)}
                              className="ml-1 rounded-full hover:bg-red-100 p-0.5 text-blue-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                </div>

                <Separator />

                {/* Pincodes */}
                <div>
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                    Serviceable Pincodes
                  </Label>
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="6-digit pincode"
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value.replace(/\D/, ''))}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPincode())}
                        maxLength={6}
                        className="pl-9 font-mono"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={addPincode}
                      className="bg-[#2874f0] hover:bg-[#1a55c4] text-white px-4 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <AnimatePresence>
                    <div className="flex flex-wrap gap-2">
                      {serviceablePincodes.map((pincode) => (
                        <motion.div
                          key={pincode}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                        >
                          <Badge className="bg-slate-50 text-slate-600 border-slate-200 pr-1 pl-3 font-mono font-medium gap-1">
                            {pincode}
                            <button
                              type="button"
                              onClick={() => removePincode(pincode)}
                              className="ml-1 rounded-full hover:bg-red-100 p-0.5 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            {/* Sticky Footer Actions */}
            <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-slate-100 -mx-4 px-4 py-4 flex justify-between items-center rounded-b-2xl shadow-lg">
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Your data is secure and encrypted
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={cancelEdit} className="gap-2 rounded-lg">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#2874f0] hover:bg-[#1a55c4] text-white gap-2 rounded-lg font-semibold px-6"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}