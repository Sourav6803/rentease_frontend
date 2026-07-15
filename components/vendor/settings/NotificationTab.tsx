// src/app/vendor/settings/components/NotificationsTab.tsx
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Bell,
  Mail,
  MessageSquare,
  Package,
  Truck,
  DollarSign,
  Star,
  Wrench,
  Calendar,
  AlertCircle,
  Save,
  Loader2,
  CheckCircle,
  Smartphone,
  Monitor,
  BellRing,
  BellOff
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

interface NotificationPreferences {
  email: {
    newRentals: boolean
    cancellations: boolean
    maintenanceRequests: boolean
    payments: boolean
    reviews: boolean
    dailyDigest: boolean
    weeklyReport: boolean
  }
  push: {
    enabled: boolean
    newRentals: boolean
    cancellations: boolean
    maintenanceRequests: boolean
    payments: boolean
  }
}

interface NotificationsTabProps {
  profile: any
  onUpdate: () => void
}

export function NotificationsTab({ profile, onUpdate }: NotificationsTabProps) {
  const { data: session } = useSession()
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    profile?.settings?.notificationPreferences || {
      email: {
        newRentals: true,
        cancellations: true,
        maintenanceRequests: true,
        payments: true,
        reviews: true,
        dailyDigest: false,
        weeklyReport: true
      },
      push: {
        enabled: false,
        newRentals: true,
        cancellations: true,
        maintenanceRequests: true,
        payments: true
      }
    }
  )
  const [isSaving, setIsSaving] = useState(false)

  const updateEmailPreference = (key: keyof NotificationPreferences['email'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value }
    }))
  }

  const updatePushPreference = (key: keyof NotificationPreferences['push'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      push: { ...prev.push, [key]: value }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put(
        `${BASE_URL}/api/v1/vendor/notification-preferences`,
        preferences,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`
          }
        }
      )

      if (response.data.success) {
        toast.success('Notification preferences updated successfully')
        onUpdate()
      }
    } catch (error: any) {
      console.error('Error updating notification preferences:', error)
      toast.error(error.response?.data?.message || 'Failed to update preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const emailNotifications = [
    { key: 'newRentals', label: 'New Rentals', icon: Package, description: 'Get notified when a customer rents your product' },
    { key: 'cancellations', label: 'Cancellations', icon: AlertCircle, description: 'Receive alerts when a rental is cancelled' },
    { key: 'maintenanceRequests', label: 'Maintenance Requests', icon: Wrench, description: 'Get notified about product maintenance needs' },
    { key: 'payments', label: 'Payments', icon: DollarSign, description: 'Receive payment confirmation and payout updates' },
    { key: 'reviews', label: 'Reviews', icon: Star, description: 'Get notified when customers leave reviews' },
    { key: 'dailyDigest', label: 'Daily Digest', icon: Calendar, description: 'Receive a summary of daily activities' },
    { key: 'weeklyReport', label: 'Weekly Report', icon: Bell, description: 'Get weekly performance reports' },
  ]

  const pushNotifications = [
    { key: 'newRentals', label: 'New Rentals', icon: Package },
    { key: 'cancellations', label: 'Cancellations', icon: AlertCircle },
    { key: 'maintenanceRequests', label: 'Maintenance', icon: Wrench },
    { key: 'payments', label: 'Payments', icon: DollarSign },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Notification Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Choose how you want to receive updates and alerts
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Preferences
        </Button>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Email Notifications</CardTitle>
          </div>
          <CardDescription>
            Receive updates directly to your registered email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailNotifications.map((notif, idx) => {
            const Icon = notif.icon
            const isEnabled = preferences.email[notif.key as keyof typeof preferences.email]
            return (
              <motion.div
                key={notif.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{notif.label}</p>
                    <p className="text-xs text-muted-foreground">{notif.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => updateEmailPreference(notif.key as keyof NotificationPreferences['email'], checked)}
                />
              </motion.div>
            )
          })}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Push Notifications</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={preferences.push.enabled ? "default" : "secondary"}>
                {preferences.push.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Switch
                checked={preferences.push.enabled}
                onCheckedChange={(checked) => updatePushPreference('enabled', checked)}
              />
            </div>
          </div>
          <CardDescription>
            Get real-time notifications on your device
          </CardDescription>
        </CardHeader>
        {preferences.push.enabled && (
          <CardContent className="space-y-4">
            {pushNotifications.map((notif, idx) => {
              const Icon = notif.icon
              const isEnabled = preferences.push[notif.key as keyof typeof preferences.push]
              return (
                <motion.div
                  key={notif.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="font-medium">{notif.label}</p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => updatePushPreference(notif.key as keyof NotificationPreferences['push'], checked)}
                  />
                </motion.div>
              )
            })}
          </CardContent>
        )}
        {!preferences.push.enabled && (
          <CardContent>
            <div className="text-center py-8">
              <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Push notifications are disabled. Enable them to receive real-time updates.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Info Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <BellRing className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-800">Stay Updated</p>
              <p className="text-sm text-blue-700 mt-1">
                Enable email and push notifications to never miss important updates about your rentals, payments, and customer inquiries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}