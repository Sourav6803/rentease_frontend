// app/vendor/security/logs/page.tsx (Security Logs)
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Activity, Search, Filter, Download, RefreshCw,
  Calendar, ChevronLeft, ChevronRight, Eye,
  Shield, Key, LogIn, Settings, User, Lock,
  AlertTriangle, CheckCircle, XCircle, Clock,
  Database, Globe, Server, Terminal
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/useToast'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

interface SecurityLog {
  id: string
  type: string
  action: string
  severity: 'info' | 'warning' | 'critical'
  ip: string
  location: string
  device: string
  userAgent: string
  timestamp: string
  details: Record<string, any>
}

interface LogStats {
  total: number
  critical: number
  warning: number
  info: number
}

/**
 * The dropdown expresses *groups* of event types; the API accepts a
 * comma-separated list, so each option maps to the concrete event types.
 */
const TYPE_FILTERS: Record<string, string> = {
  all: 'all',
  login: 'login,failed_login',
  logout: 'logout,logout_all,session_revoked',
  api_access: 'api_key_created,api_key_revoked,api_key_regenerated',
  settings_change: 'settings_change',
  password_change: 'password_change',
  '2fa': '2fa_enabled,2fa_disabled,2fa_failed,recovery_codes_regenerated',
  security_alert: 'security_alert',
}

const getLogIcon = (type: string) => {
  switch(type) {
    case 'login': return LogIn
    case 'logout': return LogIn
    case 'logout_all': return LogIn
    case 'session_revoked': return LogIn
    case 'failed_login': return AlertTriangle
    case 'api_key_created': return Key
    case 'api_key_revoked': return Key
    case 'api_key_regenerated': return Key
    case 'settings_change': return Settings
    case 'password_change': return Lock
    case '2fa_enabled': return Shield
    case '2fa_disabled': return Shield
    case '2fa_failed': return Shield
    case 'recovery_codes_regenerated': return Shield
    case 'security_alert': return AlertTriangle
    default: return Activity
  }
}

const getSeverityConfig = (severity: string) => {
  switch(severity) {
    case 'critical':
      return { bg: '#fef2f2', color: '#ef4444', icon: AlertTriangle }
    case 'warning':
      return { bg: '#fef3c7', color: '#f59e0b', icon: AlertTriangle }
    default:
      return { bg: '#f0fdf4', color: '#21a056', icon: CheckCircle }
  }
}

export default function SecurityLogsPage() {
  const { status } = useSession()
  const toast = useToast()

  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [stats, setStats] = useState<LogStats>({ total: 0, critical: 0, warning: 0, info: 0 })
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const buildQuery = useCallback((page: number) => {
    const params = new URLSearchParams({ page: String(page), limit: '10' })
    const type = TYPE_FILTERS[filterType] || 'all'

    if (type !== 'all') params.set('type', type)
    if (filterSeverity !== 'all') params.set('severity', filterSeverity)
    if (searchTerm.trim()) params.set('search', searchTerm.trim())
    if (dateRange.start) params.set('startDate', dateRange.start)
    if (dateRange.end) params.set('endDate', dateRange.end)

    return params
  }, [filterType, filterSeverity, searchTerm, dateRange])

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setIsLoading(true)
      const headers = await getAuthHeaders()
      const params = buildQuery(page)

      const res = await fetch(`${BASE_URL}/api/v1/vendor/security/logs?${params.toString()}`, { headers })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load security logs')
      }

      setLogs(data.data.logs || [])
      setStats(data.data.stats || { total: 0, critical: 0, warning: 0, info: 0 })
      setPagination(data.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 })
    } catch (error: any) {
      console.error('Error loading security logs:', error)
      toast.error(error.message || 'Failed to load security logs')
    } finally {
      setIsLoading(false)
    }
  }, [buildQuery, toast])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLogs(1)
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
    }
  }, [status, fetchLogs])

  /**
   * Re-query whenever a filter changes, debouncing free-text search so typing
   * does not fire a request per keystroke.
   */
  useEffect(() => {
    if (status !== 'authenticated') return

    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => fetchLogs(1), 350)

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current)
    }
  }, [searchTerm, filterType, filterSeverity, dateRange.start, dateRange.end, status, fetchLogs])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const headers = await getAuthHeaders()
      const params = buildQuery(1)

      const res = await fetch(`${BASE_URL}/api/v1/vendor/security/logs/export?${params.toString()}`, { headers })

      if (!res.ok) {
        throw new Error('Failed to export logs')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `security-logs-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Security logs exported')
    } catch (error: any) {
      console.error('Error exporting logs:', error)
      toast.error(error.message || 'Failed to export logs')
    } finally {
      setIsExporting(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setFilterSeverity('all')
    setDateRange({ start: '', end: '' })
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return
    fetchLogs(page)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-[#2874f0]" />
            <span className="text-xs text-slate-500">Total Events</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-1">All recorded events</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-xs text-slate-500">Critical Events</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
          <p className="text-xs text-slate-500 mt-1">Requires attention</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-slate-500">Warnings</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.warning}</p>
          <p className="text-xs text-slate-500 mt-1">Review recommended</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-slate-500">Info Events</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.info}</p>
          <p className="text-xs text-slate-500 mt-1">Normal activity</p>
        </div>
      </div>

      {/* Export Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Security Audit Logs</p>
              <p className="text-xs text-blue-700">Download logs for compliance and auditing purposes</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting || stats.total === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-blue-700 font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Logs (CSV)'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by action, IP address, or details..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">All Event Types</option>
            <option value="login">Login Activity</option>
            <option value="logout">Sessions &amp; Logouts</option>
            <option value="api_access">API Access</option>
            <option value="settings_change">Settings Changes</option>
            <option value="password_change">Password Changes</option>
            <option value="2fa">2FA Events</option>
            <option value="security_alert">Security Alerts</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
          />
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Timestamp</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Event</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">IP Address</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Location</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Device</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Severity</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">Loading security logs...</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const Icon = getLogIcon(log.type)
                  const severityConfig = getSeverityConfig(log.severity)
                  const SeverityIcon = severityConfig.icon
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedLog(log)}>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {log.timestamp ? format(new Date(log.timestamp), 'dd MMM, hh:mm a') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-700">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono text-slate-500">{log.ip || '—'}</code>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{log.location}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">{log.device}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium`}
                          style={{ backgroundColor: severityConfig.bg, color: severityConfig.color }}>
                          <SeverityIcon className="h-3 w-3" />
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Eye className="h-4 w-4 text-slate-400 hover:text-[#2874f0] transition-colors" />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && logs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No security logs found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing {logs.length} of {pagination.total} entries</p>
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

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedLog(null)} />
            <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-[#2874f0] to-[#00a0e3] px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-xs">Security Event Details</p>
                    <h3 className="text-lg font-bold">{selectedLog.action}</h3>
                  </div>
                  <button onClick={() => setSelectedLog(null)} className="p-1 rounded-full bg-white/20 hover:bg-white/30">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Event Type</p>
                    <p className="text-sm font-medium text-slate-700 capitalize">{selectedLog.type.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Severity</p>
                    <p className={`text-sm font-medium capitalize`}
                      style={{ color: getSeverityConfig(selectedLog.severity).color }}>
                      {selectedLog.severity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                    <p className="text-sm text-slate-700">
                      {selectedLog.timestamp ? format(new Date(selectedLog.timestamp), 'dd MMM yyyy, hh:mm:ss a') : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">IP Address</p>
                    <code className="text-sm font-mono text-slate-700">{selectedLog.ip || '—'}</code>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Location</p>
                    <p className="text-sm text-slate-700">{selectedLog.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Device</p>
                    <p className="text-sm text-slate-700">{selectedLog.device}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">User Agent</p>
                  <p className="text-xs font-mono text-slate-500 break-all">{selectedLog.userAgent || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Additional Details</p>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <pre className="text-xs font-mono text-slate-600 overflow-x-auto">
                      {JSON.stringify(selectedLog.details || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 border-t border-slate-200 px-6 py-4 bg-white">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-full px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
