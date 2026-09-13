// app/vendor/security/login-activity/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Monitor, Smartphone, Tablet, Globe, MapPin,
  Clock, CheckCircle, XCircle, AlertTriangle,
  ChevronLeft, ChevronRight, Filter, Download,
  LogOut, Shield
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/useToast'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders(json = false) {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  const headers: Record<string, string> = {
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
  if (json) headers['Content-Type'] = 'application/json'
  return headers
}

interface LoginSession {
  id: string
  sessionId?: string | null
  device: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  ip: string
  location: string
  lastActive: string
  isCurrent: boolean
  status: 'active' | 'expired'
}

interface LoginHistoryRow {
  id: string
  date: string
  device: string
  browser: string
  os: string
  ip: string
  location: string
  status: 'success' | 'failed'
  reason: string | null
  twoFactorUsed: boolean
}

const getDeviceIcon = (type: string) => {
  switch(type) {
    case 'desktop': return Monitor
    case 'mobile': return Smartphone
    case 'tablet': return Tablet
    default: return Monitor
  }
}

export default function LoginActivityPage() {
  const { status } = useSession()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  const [sessions, setSessions] = useState<LoginSession[]>([])
  const [history, setHistory] = useState<LoginHistoryRow[]>([])
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'success' | 'failed'>('all')
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 })

  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [busySessionId, setBusySessionId] = useState<string | null>(null)
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false)

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true)
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/security/sessions`, { headers })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load sessions')
      }

      // Defensive: React throws on duplicate keys, so de-duplicate by id before
      // rendering even though the API now returns stable unique session ids.
      const seen = new Set<string>()
      const uniqueSessions = (data.data.sessions || []).filter((item: LoginSession) => {
        if (!item?.id || seen.has(item.id)) return false
        seen.add(item.id)
        return true
      })

      setSessions(uniqueSessions)
    } catch (error: any) {
      console.error('Error loading sessions:', error)
      toast.error(error.message || 'Failed to load sessions')
    } finally {
      setIsLoadingSessions(false)
    }
  }, [toast])

  const fetchHistory = useCallback(async (page = 1, statusFilter: 'all' | 'success' | 'failed' = 'all') => {
    try {
      setIsLoadingHistory(true)
      const headers = await getAuthHeaders()
      const params = new URLSearchParams({ page: String(page), limit: '5' })
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`${BASE_URL}/api/v1/vendor/security/login-activity?${params.toString()}`, { headers })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load login history')
      }

      // Same duplicate-key guard for the history table.
      const seenHistory = new Set<string>()
      const uniqueHistory = (data.data.history || []).filter((item: LoginHistoryRow) => {
        if (!item?.id || seenHistory.has(item.id)) return false
        seenHistory.add(item.id)
        return true
      })

      setHistory(uniqueHistory)
      setPagination(data.data.pagination || { page: 1, limit: 5, total: 0, totalPages: 1 })
    } catch (error: any) {
      console.error('Error loading login history:', error)
      toast.error(error.message || 'Failed to load login history')
    } finally {
      setIsLoadingHistory(false)
    }
  }, [toast])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSessions()
      fetchHistory(1, 'all')
    } else if (status === 'unauthenticated') {
      setIsLoadingSessions(false)
      setIsLoadingHistory(false)
    }
  }, [status, fetchSessions, fetchHistory])

  const handleRevokeSession = async (session: LoginSession) => {
    if (!confirm(`Sign out "${session.device}"? It will need to log in again.`)) return

    setBusySessionId(session.id)
    try {
      const headers = await getAuthHeaders(true)
      const res = await fetch(`${BASE_URL}/api/v1/vendor/security/sessions/${session.id}`, {
        method: 'DELETE',
        headers,
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to revoke session')
      }

      setSessions((prev) => prev.filter((item) => item.id !== session.id))
      toast.success('Session signed out')
    } catch (error: any) {
      console.error('Error revoking session:', error)
      toast.error(error.message || 'Failed to revoke session')
    } finally {
      setBusySessionId(null)
    }
  }

  const handleLogoutAll = async () => {
    if (!confirm('Sign out from ALL devices, including this one? You will need to log in again.')) return

    setIsLoggingOutAll(true)
    try {
      const headers = await getAuthHeaders(true)
      const res = await fetch(`${BASE_URL}/api/v1/vendor/security/sessions/logout-all`, {
        method: 'POST',
        headers,
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to sign out from all devices')
      }

      toast.success('Signed out from all devices')
      setSessions([])
    } catch (error: any) {
      console.error('Error signing out all devices:', error)
      toast.error(error.message || 'Failed to sign out from all devices')
    } finally {
      setIsLoggingOutAll(false)
    }
  }

  /**
   * Server-generated CSV of the login/failed-login audit trail.
   */
  const handleDownloadLogs = async () => {
    try {
      const headers = await getAuthHeaders()
      const params = new URLSearchParams({ type: 'login,failed_login' })
      if (historyStatusFilter !== 'all') {
        params.set('type', historyStatusFilter === 'success' ? 'login' : 'failed_login')
      }

      const res = await fetch(`${BASE_URL}/api/v1/vendor/security/logs/export?${params.toString()}`, { headers })

      if (!res.ok) {
        throw new Error('Failed to export login history')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `login-history-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Login history downloaded')
    } catch (error: any) {
      console.error('Error downloading login history:', error)
      toast.error(error.message || 'Failed to download login history')
    }
  }

  const changeHistoryFilter = (value: 'all' | 'success' | 'failed') => {
    setHistoryStatusFilter(value)
    fetchHistory(1, value)
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return
    fetchHistory(page, historyStatusFilter)
  }

  const activeSessions = sessions.filter((s) => s.status === 'active')

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Review Your Sessions</p>
            <p className="text-sm text-blue-700">
              If you see any unfamiliar devices or locations, end the session immediately and change your password.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'active'
                ? 'bg-[#2874f0] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active Sessions ({activeSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-[#2874f0] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Login History
          </button>
        </div>
      </div>

      {activeTab === 'active' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Active Sessions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Devices currently logged into your account</p>
            </div>
            <button
              onClick={handleLogoutAll}
              disabled={isLoggingOutAll || activeSessions.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOutAll ? 'Signing out...' : 'Log Out All Devices'}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {isLoadingSessions ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">Loading sessions...</div>
            ) : activeSessions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Monitor className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No active sessions recorded</p>
                <p className="text-xs text-slate-400 mt-1">Sessions appear here after you log in</p>
              </div>
            ) : (
              activeSessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceType)
                return (
                  <div key={session.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        session.isCurrent ? 'bg-green-100' : 'bg-slate-100'
                      }`}>
                        <DeviceIcon className={`h-5 w-5 ${session.isCurrent ? 'text-green-600' : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-slate-800">{session.device}</p>
                          {session.isCurrent && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Current Session</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>{session.browser}</span>
                          <span>•</span>
                          <span>{session.os}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {session.ip || 'Unknown IP'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last active: {session.lastActive ? format(new Date(session.lastActive), 'dd MMM, hh:mm a') : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session)}
                        disabled={busySessionId === session.id}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {busySessionId === session.id ? 'Signing out...' : 'Log Out'}
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-semibold text-slate-800">Login History</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your most recent login attempts</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-slate-400">
                <Filter className="h-3.5 w-3.5" />
              </div>
              <select
                value={historyStatusFilter}
                onChange={(e) => changeHistoryFilter(e.target.value as 'all' | 'success' | 'failed')}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">All attempts</option>
                <option value="success">Successful only</option>
                <option value="failed">Failed only</option>
              </select>
              <button
                onClick={handleDownloadLogs}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#2874f0] hover:bg-[#ebf3fb] rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Logs
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Date & Time</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Device</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">IP Address</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Location</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingHistory ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">Loading login history...</td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Clock className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500">No login attempts recorded</p>
                      <p className="text-xs text-slate-400 mt-1">Attempts appear here from your next login onwards</p>
                    </td>
                  </tr>
                ) : (
                  history.map((login) => (
                    <tr key={login.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {login.date ? format(new Date(login.date), 'dd MMM yyyy, hh:mm a') : '—'}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600">
                        {login.device}
                        {login.twoFactorUsed && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">2FA</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm font-mono text-slate-500">{login.ip || '—'}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{login.location}</td>
                      <td className="px-6 py-3">
                        {login.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Successful
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600" title={login.reason || undefined}>
                            <XCircle className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {history.length} of {pagination.total} entries
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    page === pagination.page ? 'bg-[#2874f0] text-white' : 'hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">Security Recommendations</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Enable 2FA for all devices
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                End unused sessions regularly
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Never share login credentials
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Report suspicious activity immediately
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
