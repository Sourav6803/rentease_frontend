'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import {
  AlertCircle,
  Key,
  LogOut,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Smartphone,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SettingsCard } from '../components'
import { useSettings } from '../use-settings'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

interface SecurityData {
  twoFactorEnabled: boolean
  loginAlerts: boolean
  lastPasswordChange?: string
}

export default function DangerZonePage() {
  const { data: session } = useSession()
  const { fetchSettings, changePassword, deleteAccount } = useSettings()
  const [settings, setSettings] = useState<SecurityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => {
    let isMounted = true
    fetchSettings().then(data => {
      if (!isMounted) return
      if (data) setSettings(data.security)
      setIsLoading(false)
    })
    return () => { isMounted = false }
  }, [fetchSettings])

  const updateSecurity = async (data: SecurityData): Promise<boolean> => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/v1/settings/security`,
        data,
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      )
      if (response.data.success) {
        toast.success('Security settings updated')
        return true
      }
      return false
    } catch (error) {
      const err = error as AxiosError
      console.error('Error updating security:', err)
      toast.error(err.response?.data?.message || 'Failed to update security settings')
      return false
    }
  }

  const handleToggle = async (field: keyof SecurityData, checked: boolean) => {
    if (!settings) return
    const newSecurity = { ...settings, [field]: checked }
    const success = await updateSecurity(newSecurity)
    if (success) {
      setSettings(newSecurity)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordData.new.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsSaving(true)
    const success = await changePassword(passwordData.current, passwordData.new)
    setIsSaving(false)
    if (success) {
      setShowPasswordDialog(false)
      setPasswordData({ current: '', new: '', confirm: '' })
      fetchSettings().then(data => {
        if (data) setSettings(data.security)
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    setIsSaving(true)
    const success = await deleteAccount(deleteConfirmText)
    setIsSaving(false)
    if (success) {
      setShowDeleteDialog(false)
      await signOut({ callbackUrl: '/login' })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SettingsCard title="Password" icon={Key} badge="Secure">
          <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        </SettingsCard>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load security settings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsCard title="Password" icon={Key} badge="Secure">
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
          <div>
            <p className="font-medium">Password</p>
            <p className="text-sm text-gray-500">
              Last changed {settings.lastPasswordChange || 'never'}
            </p>
          </div>
          <Button
            onClick={() => setShowPasswordDialog(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all rounded-xl"
          >
            Change Password
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard title="Two-Factor Authentication" icon={Shield}>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
            <div>
              <p className="font-medium">2FA Status</p>
              <p className="text-sm text-gray-500">
                {settings.twoFactorEnabled ? (
                  <span className="text-green-500 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Enabled - Your account is secure
                  </span>
                ) : (
                  <span className="text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Disabled - Recommended for security
                  </span>
                )}
              </p>
            </div>
            <Switch
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) => handleToggle('twoFactorEnabled', checked)}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
            />
          </div>
          {!settings.twoFactorEnabled && (
            <Button variant="outline" className="w-full rounded-xl border-blue-500/30 text-blue-600 hover:bg-blue-50">
              <Shield className="h-4 w-4 mr-2" />
              Set Up Two-Factor Authentication
            </Button>
          )}
        </div>
      </SettingsCard>

      <SettingsCard title="Login Alerts" icon={Bell}>
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
          <div>
            <p className="font-medium">Email Alerts for New Logins</p>
            <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
          </div>
          <Switch
            checked={settings.loginAlerts}
            onCheckedChange={(checked) => handleToggle('loginAlerts', checked)}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Active Sessions" icon={Smartphone}>
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Chrome on Windows</p>
                  <p className="text-sm text-gray-500">Active now</p>
                </div>
              </div>
              <Badge className="bg-green-500/10 text-green-600 border-0">Current Session</Badge>
            </div>
          </div>
          <Button variant="outline" className="w-full rounded-xl border-red-500/30 text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Logout from all devices
          </Button>
        </div>
      </SettingsCard>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          <DialogHeader className="pt-6 px-6">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Key className="h-5 w-5 text-blue-500" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 pb-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Current Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">New Password</Label>
              <Input
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">
                Password must be at least 8 characters
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Confirm New Password</Label>
              <Input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all rounded-xl"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setDeleteConfirmText('') }}>
        <AlertDialogContent className="rounded-2xl overflow-hidden border-red-200/50">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              To confirm, please type <span className="text-red-600 font-bold">DELETE</span> below:
            </p>
            <Input
              placeholder="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="border-red-200 focus-visible:ring-red-500 rounded-xl"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleteAccount() }}
              disabled={deleteConfirmText !== 'DELETE' || isSaving}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/25 transition-all rounded-xl"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
