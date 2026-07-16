'use client'

import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, AtSign, MapPin, Camera,
  Crown, Check, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SettingsCard } from '../components'
import { useSettings } from '../use-settings'

interface AccountData {
  name: string
  email: string
  phone: string
  username: string
  bio: string
  avatar?: string
  location?: string
  joinedDate?: string
}

export default function AccountSettingsPage() {
  const { fetchSettings, updateSection } = useSettings()
  const [settings, setSettings] = useState<AccountData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    username: ''
  })

  useEffect(() => {
    let isMounted = true
    fetchSettings().then(data => {
      if (!isMounted) return
      if (data) {
        setSettings(data.account)
        setFormData({
          name: data.account.name,
          email: data.account.email,
          phone: data.account.phone,
          bio: data.account.bio || '',
          location: data.account.location || 'New Delhi, India',
          username: data?.account?.username || 'user123'
        })
      }
      setIsLoading(false)
    })
    return () => { isMounted = false }
  }, [fetchSettings])

  const handleBlur = async (field: string, value: string) => {
    const payload: Record<string, string> = { [field]: value }
    const success = await updateSection('account', payload)
    if (success) {
      setSettings(prev => prev ? { ...prev, [field]: value } : prev)
    }
  }

  const getInitials = (name?: string) =>
    name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SettingsCard title="Account Information" icon={User} badge="Premium">
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10">
              <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </SettingsCard>
      </div>
    )
  }

  const handleRetry = async () => {
    const data = await fetchSettings()
    if (data) {
      setSettings(data.account)
      setFormData({
        name: data.account.name,
        email: data.account.email,
        phone: data.account.phone,
        bio: data.account.bio || '',
        location: data.account.location || 'New Delhi, India',
        username: data.account?.username || 'user123'
      })
    }
    setIsLoading(false)
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load account settings</p>
        <Button onClick={handleRetry} className="mt-4">Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsCard title="Account Information" icon={User} badge="Premium">
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-6 p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10">
            <div className="relative group">
              <Avatar className="h-20 w-20 ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all">
                <AvatarImage src={settings.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                  {getInitials(settings.name)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{settings.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <AtSign className="h-3 w-3" />
                  {settings.username}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Joined {settings.joinedDate || 'Jan 2024'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  VIP Member
                </Badge>
                <Badge variant="outline" className="border-green-500/30 text-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onBlur={(e) => handleBlur('name', e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Username</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={formData.username}
                  disabled
                  className="pl-10 border-gray-200 rounded-xl bg-gray-50"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={(e) => handleBlur('email', e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  onBlur={(e) => handleBlur('phone', e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                />
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Bio</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              onBlur={(e) => handleBlur('bio', e.target.value)}
              rows={3}
              placeholder="Tell us a little about yourself..."
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl resize-none"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                onBlur={(e) => handleBlur('location', e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}
