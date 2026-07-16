import { useSession } from 'next-auth/react'
import axios, { AxiosError } from 'axios'
import { useToast } from '@/hooks/useToast'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

interface AccountData {
  name: string
  email: string
  phone: string
  username: string
  bio: string
  avatar?: string
  location?: string
}

interface NotificationData {
  email: { marketing: boolean; orders: boolean; reminders: boolean; promotions: boolean; newsletter: boolean }
  push: { enabled: boolean; orders: boolean; promotions: boolean; reminders: boolean }
  sms: { enabled: boolean; orders: boolean; otp: boolean }
}

interface PrivacyData {
  profileVisibility: 'public' | 'private' | 'contacts'
  showEmail: boolean
  showPhone: boolean
  showActivity: boolean
  dataSharing: boolean
  personalizedAds: boolean
}

interface AppearanceData {
  theme: 'light' | 'dark' | 'system'
  compactView: boolean
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large'
  accentColor: string
}

interface LanguageData {
  preferred: string
  dateFormat: string
  timezone: string
  currency: string
}

interface SecurityData {
  twoFactorEnabled: boolean
  loginAlerts: boolean
  lastPasswordChange?: string
}

interface PaymentMethod {
  id: string
  brand?: string
  type: string
  last4?: string
  upiId?: string
  isDefault?: boolean
}

interface SettingsState {
  account: AccountData
  notifications: NotificationData
  privacy: PrivacyData
  appearance: AppearanceData
  language: LanguageData
  security: SecurityData
}

export function useSettings() {
  const { data: session } = useSession()
  const toast = useToast()

  const getAuthHeader = () => ({
    Authorization: `Bearer ${session?.user?.accessToken}`
  })

  const fetchSettings = async (): Promise<SettingsState | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/settings`, {
        headers: getAuthHeader()
      })
      if (response.data.success) {
        return response.data.data.settings
      }
      return null
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>
      console.error('Error fetching settings:', err)
      toast.error(err.response?.data?.message || 'Failed to load settings')
      return null
    }
  }

  const updateSection = async <T,>(section: string, data: T): Promise<boolean> => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/v1/settings/${section}`,
        data,
        { headers: getAuthHeader() }
      )
      if (response.data.success) {
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings updated`)
        return true
      }
      return false
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>
      console.error(`Error updating ${section}:`, err)
      toast.error(err.response?.data?.message || `Failed to update ${section}`)
      return false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await axios.post(
        `${BASE_URL}/api/v1/settings/change-password`,
        { currentPassword, newPassword },
        { headers: getAuthHeader() }
      )
      toast.success('Password changed successfully')
      return true
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>
      console.error('Error changing password:', err)
      toast.error(err.response?.data?.message || 'Failed to change password')
      return false
    }
  }

  const deleteAccount = async (confirmText: string): Promise<boolean> => {
    try {
      await axios.delete(`${BASE_URL}/api/v1/settings/account`, {
        headers: getAuthHeader(),
        data: { confirmText }
      })
      toast.success('Account deleted successfully')
      return true
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>
      console.error('Error deleting account:', err)
      toast.error(err.response?.data?.message || 'Failed to delete account')
      return false
    }
  }

  const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/payments/methods`, {
        headers: getAuthHeader()
      })
      if (response.data.success) {
        return response.data.data.methods
      }
      return []
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      return []
    }
  }

  return {
    fetchSettings,
    updateSection,
    changePassword,
    deleteAccount,
    fetchPaymentMethods,
  }
}
