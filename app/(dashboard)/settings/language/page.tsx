'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { SettingsCard } from '../components'
import { useSettings } from '../use-settings'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface LanguageData {
  preferred: string
  dateFormat: string
  timezone: string
  currency: string
}

export default function LanguageSettingsPage() {
  const { fetchSettings, updateSection } = useSettings()
  const [settings, setSettings] = useState<LanguageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchSettings().then(data => {
      if (!isMounted) return
      if (data) setSettings(data.language)
      setIsLoading(false)
    })
    return () => { isMounted = false }
  }, [fetchSettings])

  const handleChange = async (field: keyof LanguageData, value: string) => {
    if (!settings) return
    const newLang = { ...settings, [field]: value }
    const success = await updateSection('language', newLang)
    if (success) {
      setSettings(newLang)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SettingsCard title="Language Preferences" icon={Globe}>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </SettingsCard>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load language settings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsCard title="Language Preferences" icon={Globe}>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Preferred Language</Label>
            <Select
              value={settings.preferred}
              onValueChange={(value) => handleChange('preferred', value)}
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="bn">Bengali</SelectItem>
                <SelectItem value="ta">Tamil</SelectItem>
                <SelectItem value="te">Telugu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Date Format</Label>
            <Select
              value={settings.dateFormat}
              onValueChange={(value) => handleChange('dateFormat', value)}
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY/MM/DD">YYYY/MM/DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Timezone</Label>
            <Select
              value={settings.timezone}
              onValueChange={(value) => handleChange('timezone', value)}
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London',
                  'America/New_York', 'America/Los_Angeles', 'Australia/Sydney', 'Japan'
                ].map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Currency</Label>
            <Select
              value={settings.currency}
              onValueChange={(value) => handleChange('currency', value)}
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD'].map((curr) => (
                  <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}
