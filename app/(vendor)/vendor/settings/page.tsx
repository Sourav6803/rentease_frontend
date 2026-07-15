// src/app/vendor/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Building2,
  Bell,
  Shield,
  CreditCard,
  Clock,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Store,
  MapPin,
  Mail,
  Phone,
  Globe,
  Lock,
  Key,
  Smartphone,
  FileText,
  Award,
  TrendingUp,
  Calendar,
  Package,
  Users,
  DollarSign,
  Star,
  Settings as SettingsIcon,
  LogOut,
  HelpCircle,
  MessageSquare,
  Zap,
  Heart,
  ShieldCheck,
  Truck,
  Wallet,
  Briefcase,
  BarChart3
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import axios from 'axios'
import { ProfileTab } from '@/components/vendor/settings/ProfileTab'
import { BusinessHoursTab } from '@/components/vendor/settings/BusinessHoursTab'
import { NotificationsTab } from '@/components/vendor/settings/NotificationTab'
import { SecurityTab } from '@/components/vendor/settings/SecurityTab'
import { BankDetailsTab } from '@/components/vendor/settings/BankDetailsTab'

// Import tab components
// import { ProfileTab } from './components/ProfileTab'
// import { BusinessHoursTab } from './components/BusinessHoursTab'
// import { NotificationsTab } from './components/NotificationsTab'
// import { SecurityTab } from './components/SecurityTab'
// import { BankDetailsTab } from './components/BankDetailsTab'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export default function VendorSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch vendor profile
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/vendor/login')
    }
    if (status === 'authenticated') {
      fetchVendorProfile()
    }
  }, [status])

  const fetchVendorProfile = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/vendor/profile/me`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`
        }
      })
      if (response.data.success) {
        setProfile(response.data.data.profile)
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: Building2, description: 'Manage your business information' },
    { id: 'hours', label: 'Business Hours', icon: Clock, description: 'Set your operational hours' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Configure alert preferences' },
    { id: 'bank', label: 'Bank Details', icon: CreditCard, description: 'Manage payout account' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Password & security settings' },
  ]

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  const getInitials = () => {
    if (!profile?.user?.profile) return 'V'
    return `${profile.user.profile.firstName?.[0] || ''}${profile.user.profile.lastName?.[0] || ''}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Vendor Settings</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Manage your business profile, operating hours, and account preferences
          </p>
        </div>

        {/* Profile Summary Card */}
        {profile && (
          <Card className="mb-8 overflow-hidden border-0 shadow-lg bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary shadow-lg">
                    <AvatarImage src={profile.user?.profile?.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-lg font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{profile.business?.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        {profile.verification?.status === 'verified' ? (
                          <>✓ Verified Vendor</>
                        ) : (
                          <>⏳ Pending Verification</>
                        )}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {profile.subscription?.plan} Plan
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {profile.user?.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {profile.contact?.primaryPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {profile.addresses?.registeredOffice?.city}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{profile.performance?.rating?.average || 0}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.floor(profile.performance?.rating?.average || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{profile.performance?.metrics?.totalRentals || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Rentals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">₹{(profile.performance?.metrics?.totalRevenue || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border overflow-hidden">
          <div className="border-b overflow-x-auto">
            <div className="flex min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                      isActive
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <ProfileTab profile={profile} onUpdate={fetchVendorProfile} />
            )}
            {activeTab === 'hours' && (
              <BusinessHoursTab profile={profile} onUpdate={fetchVendorProfile} />
            )}
            {activeTab === 'notifications' && (
              <NotificationsTab profile={profile} onUpdate={fetchVendorProfile} />
            )}
            {activeTab === 'bank' && (
              <BankDetailsTab profile={profile} onUpdate={fetchVendorProfile} />
            )}
            {activeTab === 'security' && (
              <SecurityTab />
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@rentease.com" className="text-primary hover:underline">
              support@rentease.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}