'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Key,
  User,
  Mail,
  Phone,
  Save,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon
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

const DEFAULT_PROFILE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  avatar: null,
  department: '',
  designation: '',
  bio: ''
}

export default function AuthSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/auth/profile`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        const data = response.data.data?.admin || response.data.data || {}
        setProfile({
          firstName: data.profile?.firstName || '',
          lastName: data.profile?.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.profile?.avatar || null,
          department: data.profile?.department || '',
          designation: data.profile?.designation || '',
          bio: data.profile?.bio || ''
        })
      }
    } catch (error: any) {
      console.error('Error fetching admin profile:', error)
      setFetchError(error.response?.data?.message || 'Failed to load admin profile')
      toast.error(error.response?.data?.message || 'Failed to load admin profile')
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
      fetchProfile()
    }
  }, [status, router, fetchProfile])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put(
        `${BASE_URL}/api/v1/admin/auth/profile`,
        {
          profile: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phone: profile.phone,
            avatar: profile.avatar,
            department: profile.department,
            designation: profile.designation,
            bio: profile.bio
          }
        },
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
        }
      )
      if (response.data.success) {
        toast.success('Admin profile updated successfully')
        setProfile(response.data.data?.admin || profile)
      }
    } catch (error: any) {
      console.error('Error updating admin profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update admin profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-xl" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-blue-600" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading admin profile…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full space-y-6 px-1 pb-2 sm:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Authentication</h2>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                Admin profile, SSO, OAuth, password rules
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
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
              <p className="font-medium text-red-800">Error loading admin profile</p>
              <p className="text-sm text-red-700">{fetchError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProfile}
              className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Profile Information */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Profile Information</CardTitle>
              <CardDescription className="mt-0.5">
                Update your admin account details and public profile
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 px-5 pb-5 sm:px-6 md:grid-cols-2">
          <div>
            <Label>First Name</Label>
            <Input
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              className="mt-1.5"
              placeholder="John"
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              className="mt-1.5"
              placeholder="Doe"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="mt-1.5"
              placeholder="admin@rentease.com"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="mt-1.5"
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <Label>Department</Label>
            <Input
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              className="mt-1.5"
              placeholder="Operations"
            />
          </div>
          <div>
            <Label>Designation</Label>
            <Input
              value={profile.designation}
              onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
              className="mt-1.5"
              placeholder="Senior Manager"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Bio</Label>
            <Input
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="mt-1.5"
              placeholder="Short bio or description"
            />
          </div>
        </CardContent>
      </Card>

      {/* OAuth & SSO Info */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-sm">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">OAuth & SSO</CardTitle>
              <CardDescription className="mt-0.5">
                Single sign-on and third-party authentication
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-sm text-slate-600">
              SSO and OAuth providers can be configured by your super administrator. Contact them to enable Google, Microsoft, or other identity providers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
