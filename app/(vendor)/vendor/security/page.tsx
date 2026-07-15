// app/vendor/security/page.tsx (Security Overview)
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Shield, Lock, Key, Fingerprint, Smartphone,
  Eye, Bell, AlertTriangle, CheckCircle, XCircle,
  Clock, Globe, Monitor, Wifi, ShieldCheck,
  Activity, Calendar, Download, ChevronRight,
  ShieldAlert, ShieldCheck as ShieldCheckIcon
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

interface SecurityMetrics {
  twoFactorEnabled: boolean
  lastPasswordChange: string
  lastLogin: {
    date: string
    ip: string
    device: string
    location: string
  }
  activeSessions: number
  securityScore: number
  loginAlertsEnabled: boolean
  deviceTrustEnabled: boolean
}

interface RecentActivity {
  id: string
  type: 'login' | 'password_change' | '2fa_enabled' | '2fa_disabled' | 'device_trusted'
  device: string
  ip: string
  location: string
  timestamp: string
  status: 'success' | 'failed'
}

const securityChecks = [
  {
    id: '2fa',
    title: 'Two-Factor Authentication',
    description: 'Add an extra layer of security to your account',
    recommendation: 'Highly recommended',
    critical: true,
    action: 'Enable 2FA'
  },
  {
    id: 'password',
    title: 'Password Strength',
    description: 'Use a strong, unique password for your account',
    recommendation: 'Change every 90 days',
    critical: true,
    action: 'Change Password'
  },
  {
    id: 'login_alerts',
    title: 'Login Alerts',
    description: 'Get notified about new login attempts',
    recommendation: 'Keep enabled',
    critical: false,
    action: 'Configure'
  },
  {
    id: 'device_trust',
    title: 'Device Management',
    description: 'Manage trusted devices',
    recommendation: 'Review regularly',
    critical: false,
    action: 'Review Devices'
  },
  {
    id: 'api_access',
    title: 'API Access',
    description: 'Manage API keys and integrations',
    recommendation: 'Rotate keys quarterly',
    critical: true,
    action: 'Manage API Keys'
  }
]

const SecurityScoreRing = ({ score }: { score: number }) => {
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="200" height="200" className="transform -rotate-90">
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke={score >= 80 ? '#21a056' : score >= 60 ? '#f59e0b' : '#ef4444'}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-bold text-slate-800">{score}</p>
        <p className="text-xs text-slate-500">Security Score</p>
      </div>
    </div>
  )
}

export default function SecurityOverviewPage() {
  const { data: session, status } = useSession()
  const  toast = useToast()
  
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    twoFactorEnabled: false,
    lastPasswordChange: '',
    lastLogin: {
      date: '',
      ip: '',
      device: '',
      location: ''
    },
    activeSessions: 1,
    securityScore: 92,
    loginAlertsEnabled: true,
    deviceTrustEnabled: false
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSecurityData()
    }
  }, [status])

  const fetchSecurityData = async () => {
    try {
      const headers = await getAuthHeaders()
      
      // Fetch user settings for security info
      const res = await fetch(`${BASE_URL}/api/v1/settings`, { headers })
      const data = await res.json()
      
      if (data.success) {
        setSecurityMetrics({
          twoFactorEnabled: data.data.settings?.security?.twoFactorEnabled || false,
          lastPasswordChange: data.data.settings?.security?.lastPasswordChange || new Date().toISOString(),
          lastLogin: {
            date: new Date().toISOString(),
            ip: '103.58.154.78',
            device: 'Chrome on Windows',
            location: 'Mumbai, India'
          },
          activeSessions: 1,
          securityScore: 92,
          loginAlertsEnabled: true,
          deviceTrustEnabled: false
        })
      }
    } catch (error) {
      toast.error('Failed to load security data')
    } finally {
      setIsLoading(false)
    }
  }

  const statusCards = [
    {
      icon: Lock,
      label: '2FA Status',
      value: securityMetrics.twoFactorEnabled ? 'Enabled' : 'Disabled',
      status: securityMetrics.twoFactorEnabled ? 'success' : 'warning',
      color: securityMetrics.twoFactorEnabled ? '#21a056' : '#f59e0b'
    },
    {
      icon: Clock,
      label: 'Last Password Change',
      value: securityMetrics.lastPasswordChange ? format(new Date(securityMetrics.lastPasswordChange), 'dd MMM yyyy') : 'Never',
      status: 'info',
      color: '#2874f0'
    },
    {
      icon: Monitor,
      label: 'Active Sessions',
      value: `${securityMetrics.activeSessions} device${securityMetrics.activeSessions !== 1 ? 's' : ''}`,
      status: 'info',
      color: '#8b5cf6'
    },
    {
      icon: Bell,
      label: 'Login Alerts',
      value: securityMetrics.loginAlertsEnabled ? 'Enabled' : 'Disabled',
      status: securityMetrics.loginAlertsEnabled ? 'success' : 'warning',
      color: securityMetrics.loginAlertsEnabled ? '#21a056' : '#f59e0b'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading security data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Score & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Score Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Security Score</p>
            <p className="text-2xl font-bold text-slate-800">{securityMetrics.securityScore}/100</p>
            <div className="flex items-center gap-1 mt-2">
              <ShieldCheckIcon className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Very Good</span>
            </div>
          </div>
          <SecurityScoreRing score={securityMetrics.securityScore} />
        </div>

        {/* Status Cards */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statusCards.map((card, idx) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className="bg-white rounded-xl border border-slate-200 p-4"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${card.color}10` }}>
                    <Icon className="h-4 w-4" style={{ color: card.color }} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{card.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Security Checks */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Security Checklist</h2>
          <p className="text-xs text-slate-500 mt-0.5">Recommended actions to secure your account</p>
        </div>
        <div className="divide-y divide-slate-100">
          {securityChecks.map((check) => (
            <div key={check.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  check.critical ? 'bg-red-50' : 'bg-blue-50'
                }`}>
                  {check.critical ? (
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                  ) : (
                    <Shield className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{check.title}</p>
                  <p className="text-sm text-slate-500">{check.description}</p>
                  <p className="text-xs text-amber-600 mt-1">⚠️ {check.recommendation}</p>
                </div>
              </div>
              <Link
                href={`/vendor/security/${check.id === '2fa' ? '2fa' : check.id === 'password' ? 'change-password' : '#'}`}
                className="px-4 py-2 text-sm font-medium text-[#2874f0] hover:bg-[#ebf3fb] rounded-lg transition-colors"
              >
                {check.action} →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Login Activity */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Recent Login Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Monitor access to your account</p>
          </div>
          <Link href="/vendor/security/login-activity" className="text-sm text-[#2874f0] hover:underline">
            View All →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { device: 'Chrome on Windows', ip: '103.58.154.78', location: 'Mumbai, India', time: '2 hours ago', status: 'success' },
            { device: 'Safari on iPhone', ip: '203.192.245.12', location: 'Delhi, India', time: 'Yesterday', status: 'success' },
            { device: 'Firefox on Mac', ip: '45.118.167.34', location: 'Bangalore, India', time: '3 days ago', status: 'failed' }
          ].map((activity, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {activity.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{activity.device}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span>{activity.ip}</span>
                    <span>•</span>
                    <span>{activity.location}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">{activity.time}</p>
                <p className={`text-xs font-medium ${activity.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {activity.status === 'success' ? 'Successful' : 'Failed attempt'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <Lock className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-slate-800">Use Strong Passwords</h3>
          <p className="text-xs text-slate-600 mt-1">Use at least 12 characters with mixed case, numbers, and symbols</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <Smartphone className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-slate-800">Enable 2FA</h3>
          <p className="text-xs text-slate-600 mt-1">Add an extra layer of security with two-factor authentication</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <Eye className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-slate-800">Review Devices</h3>
          <p className="text-xs text-slate-600 mt-1">Regularly check and remove unrecognized devices</p>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <Bell className="h-8 w-8 text-amber-600 mb-3" />
          <h3 className="font-semibold text-slate-800">Stay Alert</h3>
          <p className="text-xs text-slate-600 mt-1">Report suspicious activity immediately to support</p>
        </div>
      </div>
    </div>
  )
}