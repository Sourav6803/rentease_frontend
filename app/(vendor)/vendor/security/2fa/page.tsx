// app/vendor/security/2fa/page.tsx (Two-Factor Authentication)
'use client'

import { useState, useEffect, useCallback } from 'react'
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
    'Content-Type': 'application/json',
  }
}

export default function TwoFactorAuthPage() {
  const { data: session, status } = useSession()
  const toast = useToast()
  
  const [isEnabled, setIsEnabled] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [step, setStep] = useState(1)
  const [secret, setSecret] = useState('')
  const [secretFormatted, setSecretFormatted] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [recoveryStatus, setRecoveryStatus] = useState({ total: 0, remaining: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)

  // Disable flow (password + current code are both required by the API)
  const [showDisableForm, setShowDisableForm] = useState(false)
  const [disableForm, setDisableForm] = useState({ password: '', token: '' })

  // Regenerate recovery codes (password protected)
  const [showRegenerateForm, setShowRegenerateForm] = useState(false)
  const [regeneratePassword, setRegeneratePassword] = useState('')

  // Real security preferences drive the "backup method" rows.
  const [preferences, setPreferences] = useState({ loginAlerts: false, deviceTrust: false })

  /**
   * Load the live 2FA state — never assume a default.
   */
  const fetchTwoFactorState = useCallback(async () => {
    try {
      setIsPageLoading(true)
      const headers = await getAuthHeaders()

      const [overviewRes, codesRes] = await Promise.all([
        fetch(`${BASE_URL}/api/v1/vendor/security/overview`, { headers }),
        fetch(`${BASE_URL}/api/v1/vendor/security/2fa/recovery-codes`, { headers }),
      ])

      const overviewData = await overviewRes.json()
      const codesData = await codesRes.json()

      if (overviewRes.ok && overviewData.success) {
        // Response envelope is { success, message, data: { overview } }
        const overview = overviewData.data?.overview
        if (!overview) {
          throw new Error('Unexpected overview response')
        }
        setIsEnabled(Boolean(overview.twoFactorEnabled))
        setIsConfigured(Boolean(overview.twoFactorConfigured))
        setPreferences({
          loginAlerts: Boolean(overview.loginAlertsEnabled),
          deviceTrust: Boolean(overview.deviceTrustEnabled),
        })

        // A flag without a secret means an unfinished setup — restart it rather
        // than showing a misleading "Enabled" state.
        if (overview.twoFactorEnabled && !overview.twoFactorConfigured) {
          setShowSetup(true)
        }
      }

      if (codesRes.ok && codesData.success) {
        setRecoveryStatus({
          total: codesData.data.total ?? 0,
          remaining: codesData.data.remaining ?? 0,
        })
      }
    } catch (error) {
      console.error('Failed to load 2FA state:', error)
      toast.error('Failed to load two-factor settings')
    } finally {
      setIsPageLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTwoFactorState()
    } else if (status === 'unauthenticated') {
      setIsPageLoading(false)
    }
  }, [status, fetchTwoFactorState])

  /**
   * Step 1 → 2: ask the backend for a fresh secret + QR image.
   */
  const handleStartSetup = async () => {
    setIsLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/security/2fa/setup`, {
        method: 'POST',
        headers,
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to start two-factor setup')
      }

      setSecret(data.data.secret)
      setSecretFormatted(data.data.secretFormatted || data.data.secret)
      setQrCode(data.data.qrCode)
      setVerificationCode('')
      setShowSetup(true)
      setStep(2)
    } catch (error: any) {
      console.error('Error starting 2FA setup:', error)
      toast.error(error.message || 'Failed to start two-factor setup')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Step 3: verify the code and enable 2FA. Returns the recovery codes exactly
   * once — they are never retrievable afterwards.
   */
  const handleEnable2FA = async () => {
    setIsLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/security/2fa/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: verificationCode })
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code')
      }

      setIsEnabled(true)
      setIsConfigured(true)
      setRecoveryCodes(data.data.recoveryCodes || [])
      setRecoveryStatus({
        total: data.data.recoveryCodes?.length ?? 0,
        remaining: data.data.recoveryCodes?.length ?? 0,
      })
      setShowSetup(false)
      setStep(1)
      setVerificationCode('')
      toast.success('2FA enabled successfully')
    } catch (error: any) {
      console.error('Error enabling 2FA:', error)
      toast.error(error.message || 'Failed to enable 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Disable requires the account password AND a current code.
   */
  const handleDisable2FA = async () => {
    if (!disableForm.password || !disableForm.token) {
      toast.error('Enter your password and a current authentication code')
      return
    }

    setIsLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/security/2fa/disable`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          password: disableForm.password,
          token: disableForm.token,
        })
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to disable 2FA')
      }

      setIsEnabled(false)
      setIsConfigured(false)
      setShowDisableForm(false)
      setDisableForm({ password: '', token: '' })
      setRecoveryCodes([])
      setRecoveryStatus({ total: 0, remaining: 0 })
      toast.success('2FA disabled')
    } catch (error: any) {
      console.error('Error disabling 2FA:', error)
      toast.error(error.message || 'Failed to disable 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Regenerate the recovery codes (invalidates the previous set).
   */
  const handleRegenerateCodes = async () => {
    if (!regeneratePassword) {
      toast.error('Enter your password to generate new codes')
      return
    }

    setIsLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/security/2fa/recovery-codes/regenerate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ password: regeneratePassword })
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to regenerate recovery codes')
      }

      setRecoveryCodes(data.data.recoveryCodes || [])
      setRecoveryStatus({
        total: data.data.recoveryCodes?.length ?? 0,
        remaining: data.data.recoveryCodes?.length ?? 0,
      })
      setShowRegenerateForm(false)
      setRegeneratePassword('')
      toast.success('New recovery codes generated')
    } catch (error: any) {
      console.error('Error regenerating recovery codes:', error)
      toast.error(error.message || 'Failed to regenerate recovery codes')
    } finally {
      setIsLoading(false)
    }
  }

  const copyText = (value: string, label = 'Copied to clipboard') => {
    navigator.clipboard.writeText(value)
    toast.success(label)
  }

  const downloadRecoveryCodes = () => {
    if (!recoveryCodes.length) {
      toast.error('No recovery codes to download')
      return
    }

    const content = [
      'RentEase — Two-Factor Recovery Codes',
      'Each code can be used once. Store them somewhere safe.',
      '',
      ...recoveryCodes,
      '',
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'rentease-recovery-codes.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * The only real "backup method" preference we can persist today is login
   * alerts (email notifications). SMS 2FA has no backend support, so it is
   * shown as unavailable rather than offering a button that does nothing.
   */
  const toggleLoginAlerts = async () => {
    setIsLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/security/preferences`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ loginAlerts: !preferences.loginAlerts })
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update preferences')
      }

      setPreferences((prev) => ({ ...prev, loginAlerts: data.data.preferences.loginAlerts }))
      toast.success(data.data.preferences.loginAlerts ? 'Email alerts enabled' : 'Email alerts disabled')
    } catch (error: any) {
      console.error('Error updating preferences:', error)
      toast.error(error.message || 'Failed to update preferences')
    } finally {
      setIsLoading(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading two-factor settings...</p>
        </div>
      </div>
    )
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
          isConfigured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isConfigured ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {!isConfigured && !showSetup && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#2874f0]/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-10 w-10 text-[#2874f0]" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Secure Your Account with 2FA</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Two-factor authentication adds an extra layer of security to your account. 
            Even if someone steals your password, they won't be able to access your account.
          </p>
          {isEnabled && !isConfigured && (
            <p className="text-xs text-amber-600 mt-3">
              A previous setup was left unfinished. Complete it below to activate 2FA.
            </p>
          )}
          <button
            onClick={handleStartSetup}
            disabled={isLoading}
            className="mt-6 px-6 py-2.5 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Preparing...' : 'Set Up Two-Factor Authentication'}
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
                <div className="flex justify-between">
                  <button
                    onClick={() => { setShowSetup(false); setStep(1) }}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartSetup}
                    disabled={isLoading}
                    className="px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Next →'}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    {qrCode ? (
                      <img
                        src={qrCode}
                        alt="Scan this QR code with your authenticator app"
                        width={192}
                        height={192}
                        className="w-48 h-48 rounded-lg"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-lg">
                        <QrCode className="h-24 w-24 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">Or enter this code manually:</p>
                  <code className="px-3 py-1 bg-slate-100 rounded text-sm font-mono">
                    {secretFormatted || '—'}
                  </code>
                  <button
                    onClick={() => copyText(secret, 'Secret copied to clipboard')}
                    disabled={!secret}
                    className="ml-2 p-1 hover:bg-slate-100 rounded disabled:opacity-40"
                  >
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
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
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

      {isConfigured && (
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
                onClick={() => setShowDisableForm((prev) => !prev)}
                disabled={isLoading}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
              >
                Disable 2FA
              </button>
            </div>

            {showDisableForm && (
              <div className="mt-5 pt-5 border-t border-green-200 space-y-3">
                <p className="text-sm text-green-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  Disabling 2FA makes your account significantly less secure. Enter your password and a current code to confirm.
                </p>
                <input
                  type="password"
                  value={disableForm.password}
                  onChange={(e) => setDisableForm({ ...disableForm, password: e.target.value })}
                  placeholder="Account password"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
                />
                <input
                  type="text"
                  value={disableForm.token}
                  onChange={(e) => setDisableForm({ ...disableForm, token: e.target.value })}
                  placeholder="6-digit code or a recovery code"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 font-mono"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowDisableForm(false); setDisableForm({ password: '', token: '' }) }}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisable2FA}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    {isLoading ? 'Disabling...' : 'Confirm Disable'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recovery Codes */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">Recovery Codes</h3>
                <p className="text-xs text-slate-500 mt-0.5">Use these codes if you lose access to your authenticator app</p>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {recoveryStatus.remaining} of {recoveryStatus.total} unused
              </span>
            </div>
            <div className="p-6">
              {recoveryCodes.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-slate-50 p-4 rounded-lg">
                    {recoveryCodes.map((code, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span>{code}</span>
                        <button
                          onClick={() => copyText(code, 'Recovery code copied')}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600 mt-3">
                    These codes are shown only once. Save them now.
                  </p>
                </>
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">
                    Recovery codes are only displayed once, when they are generated.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Generate a new set below if you did not save yours.
                  </p>
                </div>
              )}

              {showRegenerateForm && (
                <div className="mt-4 space-y-3">
                  <input
                    type="password"
                    value={regeneratePassword}
                    onChange={(e) => setRegeneratePassword(e.target.value)}
                    placeholder="Account password"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowRegenerateForm(false); setRegeneratePassword('') }}
                      className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRegenerateCodes}
                      disabled={isLoading}
                      className="flex-1 px-3 py-1.5 text-sm bg-[#2874f0] text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                      {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={downloadRecoveryCodes}
                  disabled={!recoveryCodes.length}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <Download className="h-4 w-4" />
                  Download Codes
                </button>
                {!showRegenerateForm && (
                  <button
                    onClick={() => setShowRegenerateForm(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Generate New Codes
                  </button>
                )}
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
                    <p className="text-xs text-slate-500">Receive login alerts via email</p>
                  </div>
                </div>
                <button
                  onClick={toggleLoginAlerts}
                  disabled={isLoading}
                  className={`text-sm font-medium disabled:opacity-50 ${preferences.loginAlerts ? 'text-green-600' : 'text-[#2874f0]'}`}
                >
                  {preferences.loginAlerts ? 'Enabled' : 'Set Up'}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg opacity-60">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">SMS Backup</p>
                    <p className="text-xs text-slate-500">Not available — SMS second factor is not supported yet</p>
                  </div>
                </div>
                <span className="text-sm text-slate-400">Unavailable</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
