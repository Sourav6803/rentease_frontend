'use client'

import { useState, useEffect } from 'react'
import { Mail, Smartphone, MessageSquare } from 'lucide-react'
import { SettingsCard, PremiumSwitch } from '../components'
import { useSettings } from '../use-settings'

interface NotificationData {
  email: { marketing: boolean; orders: boolean; reminders: boolean; promotions: boolean; newsletter: boolean }
  push: { enabled: boolean; orders: boolean; promotions: boolean; reminders: boolean }
  sms: { enabled: boolean; orders: boolean; otp: boolean }
}

export default function NotificationSettingsPage() {
  const { fetchSettings, updateSection } = useSettings()
  const [settings, setSettings] = useState<NotificationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchSettings().then(data => {
      if (!isMounted) return
      if (data) setSettings(data.notifications)
      setIsLoading(false)
    })
    return () => { isMounted = false }
  }, [fetchSettings])

  const handleEmailChange = async (key: string, checked: boolean) => {
    if (!settings) return
    const newEmail = { ...settings.email, [key]: checked }
    const success = await updateSection('notifications', { email: newEmail })
    if (success) {
      setSettings({ ...settings, email: newEmail })
    }
  }

  const handlePushChange = async (key: string, checked: boolean) => {
    if (!settings) return
    const newPush = { ...settings.push, [key]: checked }
    const success = await updateSection('notifications', { push: newPush })
    if (success) {
      setSettings({ ...settings, push: newPush })
    }
  }

  const handleSmsChange = async (key: string, checked: boolean) => {
    if (!settings) return
    const newSms = { ...settings.sms, [key]: checked }
    const success = await updateSection('notifications', { sms: newSms })
    if (success) {
      setSettings({ ...settings, sms: newSms })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SettingsCard title="Email Notifications" icon={Mail} badge="Customize">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
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
        <p className="text-gray-500">Failed to load notification settings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsCard title="Email Notifications" icon={Mail} badge="Customize">
        <div className="space-y-2">
          {[
            { key: 'marketing', label: 'Marketing emails', desc: 'Get updates about new products and offers' },
            { key: 'orders', label: 'Order updates', desc: 'Receive order confirmation and delivery updates' },
            { key: 'reminders', label: 'Rental reminders', desc: 'Get notified about upcoming rental returns' },
            { key: 'promotions', label: 'Promotions', desc: 'Exclusive deals and special offers' },
            { key: 'newsletter', label: 'Newsletter', desc: 'Weekly newsletter with curated content' },
          ].map((item) => (
            <PremiumSwitch
              key={item.key}
              label={item.label}
              description={item.desc}
              checked={settings.email[item.key as keyof typeof settings.email]}
              onCheckedChange={(checked) => handleEmailChange(item.key, checked)}
            />
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Push Notifications" icon={Smartphone}>
        <div className="space-y-3">
          <PremiumSwitch
            label="Enable Push Notifications"
            description="Receive real-time updates on your device"
            checked={settings.push.enabled}
            onCheckedChange={(checked) => handlePushChange('enabled', checked)}
          />
          {settings.push.enabled && (
            <div className="ml-6 pl-4 border-l-2 border-blue-500/20 space-y-2">
              {['orders', 'promotions', 'reminders'].map((type) => (
                <PremiumSwitch
                  key={type}
                  label={`${type.charAt(0).toUpperCase() + type.slice(1)} notifications`}
                  checked={settings.push[type as keyof typeof settings.push]}
                  onCheckedChange={(checked) => handlePushChange(type, checked)}
                />
              ))}
            </div>
          )}
        </div>
      </SettingsCard>

      <SettingsCard title="SMS Notifications" icon={MessageSquare}>
        <div className="space-y-3">
          <PremiumSwitch
            label="Enable SMS"
            description="Get important updates via text message"
            checked={settings.sms.enabled}
            onCheckedChange={(checked) => handleSmsChange('enabled', checked)}
          />
          {settings.sms.enabled && (
            <div className="ml-6 pl-4 border-l-2 border-blue-500/20 space-y-2">
              {['orders', 'otp'].map((type) => (
                <PremiumSwitch
                  key={type}
                  label={type === 'otp' ? 'OTP & Security' : `${type.charAt(0).toUpperCase() + type.slice(1)} updates`}
                  checked={settings.sms[type as keyof typeof settings.sms]}
                  onCheckedChange={(checked) => handleSmsChange(type, checked)}
                />
              ))}
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  )
}
