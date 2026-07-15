// app/vendor/security/2fa/page.tsx (Two-Factor Authentication)
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Smartphone, Shield, CheckCircle, XCircle, RefreshCw,
  Copy, Download, Key, AlertCircle, Mail, Phone,
  ArrowLeft, ChevronRight, QrCode
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

export default function TwoFactorAuthPage() {
  const { data: session } = useSession()
  const toast = useToast()
  
  const [isEnabled, setIsEnabled] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [step, setStep] = useState(1)
  const [secret, setSecret] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleEnable2FA = async () => {
    setIsLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/settings/security`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ twoFactorEnabled: true })
      })
      const data = await res.json()
      
      if (data.success) {
        setIsEnabled(true)
        setShowSetup(false)
        toast.success('2FA enabled successfully')
      }
    } catch (error) {
      toast.error('Failed to enable 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) return
    
    setIsLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/settings/security`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ twoFactorEnabled: false })
      })
      const data = await res.json()
      
      if (data.success) {
        setIsEnabled(false)
        toast.success('2FA disabled')
      }
    } catch (error) {
      toast.error('Failed to disable 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Two-Factor Authentication</h2>
          <p className="text-sm text-slate-500 mt-0.5">Add an extra layer of security to your account</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          isEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isEnabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {!isEnabled && !showSetup && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#2874f0]/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-10 w-10 text-[#2874f0]" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Secure Your Account with 2FA</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Two-factor authentication adds an extra layer of security to your account. 
            Even if someone steals your password, they won't be able to access your account.
          </p>
          <button
            onClick={() => setShowSetup(true)}
            className="mt-6 px-6 py-2.5 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors"
          >
            Set Up Two-Factor Authentication
          </button>
        </div>
      )}

      {showSetup && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#2874f0]/5 to-[#00a0e3]/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2874f0]/20 flex items-center justify-center">
                <Key className="h-5 w-5 text-[#2874f0]" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Step {step} of 3</p>
                <h3 className="font-semibold text-slate-800">
                  {step === 1 ? 'Download Authenticator App' : 
                   step === 2 ? 'Scan QR Code' : 'Verify Setup'}
                </h3>
              </div>
            </div>
          </div>

          <div className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    First, download an authenticator app on your phone. We recommend:
                  </p>
                  <div className="flex gap-3 mt-3">
                    <a href="#" className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm hover:shadow-md transition-shadow">
                      <img src="/google-auth.png" alt="Google" className="h-5 w-5" />
                      Google Authenticator
                    </a>
                    <a href="#" className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm hover:shadow-md transition-shadow">
                      <img src="/microsoft-auth.png" alt="Microsoft" className="h-5 w-5" />
                      Microsoft Authenticator
                    </a>
                    <a href="#" className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm hover:shadow-md transition-shadow">
                      <img src="/authy.png" alt="Authy" className="h-5 w-5" />
                      Authy
                    </a>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-lg">
                      <QrCode className="h-24 w-24 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">Or enter this code manually:</p>
                  <code className="px-3 py-1 bg-slate-100 rounded text-sm font-mono">ABCD EFGH IJKL MNOP</code>
                  <button className="ml-2 p-1 hover:bg-slate-100 rounded">
                    <Copy className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <p className="text-sm text-amber-800 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    Make sure to save your recovery codes after setup. They're the only way to regain access if you lose your phone.
                  </p>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-48 px-4 py-3 text-center text-lg tracking-wider border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 font-mono"
                    maxLength={6}
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleEnable2FA}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="px-6 py-2 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isEnabled && (
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-8 w-8 text-green-600 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-800">2FA is Active</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your account is protected with two-factor authentication. 
                  You'll need to enter a verification code from your authenticator app when logging in.
                </p>
              </div>
              <button
                onClick={handleDisable2FA}
                disabled={isLoading}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
              >
                Disable 2FA
              </button>
            </div>
          </div>

          {/* Recovery Codes */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Recovery Codes</h3>
              <p className="text-xs text-slate-500 mt-0.5">Use these codes if you lose access to your authenticator app</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-slate-50 p-4 rounded-lg">
                {[
                  'XXXX-XXXX-XXXX', 'XXXX-XXXX-XXXX', 'XXXX-XXXX-XXXX',
                  'XXXX-XXXX-XXXX', 'XXXX-XXXX-XXXX', 'XXXX-XXXX-XXXX'
                ].map((code, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span>{code}</span>
                    <button className="text-slate-400 hover:text-slate-600">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                  <Download className="h-4 w-4" />
                  Download Codes
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                  <RefreshCw className="h-4 w-4" />
                  Generate New Codes
                </button>
              </div>
            </div>
          </div>

          {/* Backup Methods */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Backup Verification Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Email Backup</p>
                    <p className="text-xs text-slate-500">Receive codes via email</p>
                  </div>
                </div>
                <button className="text-sm text-[#2874f0]">Set Up</button>
              </div>
              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">SMS Backup</p>
                    <p className="text-xs text-slate-500">Receive codes via SMS</p>
                  </div>
                </div>
                <button className="text-sm text-[#2874f0]">Set Up</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}