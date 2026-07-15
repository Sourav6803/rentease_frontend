// src/app/vendor/settings/components/SecurityTab.tsx
'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Shield,
  Lock,
  Key,
  Smartphone,
  Fingerprint,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Save,
  RefreshCw,
  Mail,
  Phone,
  History,
  Clock,
  Monitor
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export function SecurityTab() {
  const { data: session } = useSession()
  const router = useRouter()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const validatePasswordForm = () => {
    let isValid = true
    const errors = { currentPassword: '', newPassword: '', confirmPassword: '' }

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required'
      isValid = false
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required'
      isValid = false
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
      isValid = false
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase and number'
      isValid = false
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
      isValid = false
    }

    setPasswordErrors(errors)
    return isValid
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePasswordForm()) return

    setIsChangingPassword(true)
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/auth/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`
          }
        }
      )

      if (response.data.success) {
        toast.success('Password changed successfully')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        
        // Optional: Sign out after password change
        setTimeout(() => {
          signOut({ callbackUrl: '/login' })
        }, 2000)
      }
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogoutAllDevices = async () => {
    setIsLoggingOutAll(true)
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/auth/logout-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`
          }
        }
      )

      if (response.data.success) {
        toast.success('Logged out from all devices')
        signOut({ callbackUrl: '/login' })
      }
    } catch (error: any) {
      console.error('Error logging out all devices:', error)
      toast.error(error.response?.data?.message || 'Failed to logout from all devices')
    } finally {
      setIsLoggingOutAll(false)
    }
  }

  const securityFeatures = [
    { icon: Lock, label: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account', status: 'disabled', action: 'Enable' },
    { icon: History, label: 'Login History', description: 'View your recent login activities', status: 'available', action: 'View' },
    { icon: Smartphone, label: 'Trusted Devices', description: 'Manage devices that can access your account', status: 'active', action: 'Manage' },
    { icon: Shield, label: 'Security Alerts', description: 'Get notified about suspicious activities', status: 'enabled', action: 'Configure' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Security Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account security and authentication preferences
        </p>
      </div>

      {/* Security Score Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-800">Your Security Score: Good</p>
              <p className="text-sm text-green-700">Your account has basic security measures in place</p>
            </div>
            <Badge className="bg-green-600">80%</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Change Password</CardTitle>
          </div>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="pl-9"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative mt-1">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="pl-9"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 8 characters and include uppercase, lowercase, and numbers
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative mt-1">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="pl-9"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" disabled={isChangingPassword} className="gap-2">
              {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Security Features</CardTitle>
          </div>
          <CardDescription>
            Additional security options to protect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {securityFeatures.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={feature.status === 'enabled' ? 'default' : 'secondary'} className="text-xs">
                    {feature.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    {feature.action}
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Session Management</CardTitle>
          </div>
          <CardDescription>
            Manage your active sessions and devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-xs text-muted-foreground">Chrome on Windows • Active now</p>
                </div>
              </div>
              <Badge variant="default">Current</Badge>
            </div>

            <Button
              variant="destructive"
              onClick={handleLogoutAllDevices}
              disabled={isLoggingOutAll}
              className="w-full gap-2"
            >
              {isLoggingOutAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Logout from all devices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg text-red-800">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-medium text-red-800">Deactivate Account</p>
              <p className="text-sm text-red-700">Temporarily disable your vendor account</p>
            </div>
            <Button variant="destructive" size="sm">
              Deactivate Account
            </Button>
          </div>
          <Separator className="my-4 bg-red-200" />
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-medium text-red-800">Delete Account</p>
              <p className="text-sm text-red-700">Permanently delete your vendor account and all data</p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}