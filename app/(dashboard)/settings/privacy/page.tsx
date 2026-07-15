'use client'

import { useState, useEffect } from 'react'
import { Shield, User, Globe, Lock, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SettingsCard, PremiumSwitch } from '../components'
import { useSettings } from '../use-settings'

interface PrivacyData {
  profileVisibility: 'public' | 'private' | 'contacts'
  showEmail: boolean
  showPhone: boolean
  showActivity: boolean
  dataSharing: boolean
  personalizedAds: boolean
}

export default function PrivacySettingsPage() {
  const { fetchSettings, updateSection } = useSettings()
  const [settings, setSettings] = useState<PrivacyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchSettings().then(data => {
      if (!isMounted) return
      if (data) setSettings(data.privacy)
      setIsLoading(false)
    })
    return () => { isMounted = false }
  }, [fetchSettings])

  const handleVisibilityChange = async (value: string) => {
    if (!settings) return
    const newPrivacy = { ...settings, profileVisibility: value as PrivacyData['profileVisibility'] }
    const success = await updateSection('privacy', newPrivacy)
    if (success) {
      setSettings(newPrivacy)
    }
  }

  const handleToggle = async (field: keyof PrivacyData, checked: boolean) => {
    if (!settings) return
    const newPrivacy = { ...settings, [field]: checked }
    const success = await updateSection('privacy', newPrivacy)
    if (success) {
      setSettings(newPrivacy)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SettingsCard title="Profile Privacy" icon={Shield}>
          <div className="space-y-4">
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </SettingsCard>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load privacy settings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsCard title="Profile Privacy" icon={Shield}>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Profile Visibility</Label>
            <Select
              value={settings.profileVisibility}
              onValueChange={handleVisibilityChange}
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Public - Anyone can view</span>
                  </div>
                </SelectItem>
                <SelectItem value="contacts">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Contacts Only</span>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Private - Only me</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PremiumSwitch
            label="Show Email Address"
            description="Display email on your public profile"
            checked={settings.showEmail}
            onCheckedChange={(checked) => handleToggle('showEmail', checked)}
          />
          <PremiumSwitch
            label="Show Phone Number"
            description="Display phone on your public profile"
            checked={settings.showPhone}
            onCheckedChange={(checked) => handleToggle('showPhone', checked)}
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Data & Personalization" icon={User}>
        <div className="space-y-3">
          <PremiumSwitch
            label="Data Sharing"
            description="Share anonymized data to improve services"
            checked={settings.dataSharing}
            onCheckedChange={(checked) => handleToggle('dataSharing', checked)}
          />
          <PremiumSwitch
            label="Personalized Ads"
            description="Show relevant ads based on your activity"
            checked={settings.personalizedAds}
            onCheckedChange={(checked) => handleToggle('personalizedAds', checked)}
          />
          <PremiumSwitch
            label="Show Activity Status"
            description="Let others see when you're active"
            checked={settings.showActivity}
            onCheckedChange={(checked) => handleToggle('showActivity', checked)}
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Connected Accounts" icon={Share2}>
        <div className="space-y-3">
          {[
            { name: 'Google', icon: 'G', color: 'from-red-500 to-orange-500', connected: true },
            { name: 'Facebook', icon: 'F', color: 'from-blue-600 to-blue-700', connected: false },
            { name: 'Apple', icon: 'A', color: 'from-gray-700 to-gray-900', connected: false },
          ].map((account) => (
            <div key={account.name} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${account.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                  {account.icon}
                </div>
                <span className="font-medium">{account.name}</span>
                {account.connected && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Connected</span>
                )}
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">
                {account.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  )
}
