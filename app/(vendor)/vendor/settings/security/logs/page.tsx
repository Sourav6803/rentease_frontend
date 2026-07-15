// app/vendor/security/logs/page.tsx (Security Logs)
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Search, Filter, Download, RefreshCw,
  Calendar, ChevronLeft, ChevronRight, Eye,
  Shield, Key, LogIn, Settings, User, Lock,
  AlertTriangle, CheckCircle, XCircle, Clock,
  Database, Globe, Server, Terminal
} from 'lucide-react'
import { format } from 'date-fns'

interface SecurityLog {
  id: string
  type: 'login' | 'logout' | 'api_access' | 'settings_change' | 'password_change' | '2fa' | 'security_alert'
  action: string
  severity: 'info' | 'warning' | 'critical'
  ip: string
  location: string
  device: string
  userAgent: string
  timestamp: string
  details: Record<string, any>
}

const mockLogs: SecurityLog[] = [
  {
    id: '1',
    type: 'login',
    action: 'Successful login',
    severity: 'info',
    ip: '103.58.154.78',
    location: 'Mumbai, India',
    device: 'Chrome on Windows',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-15T10:30:00',
    details: { method: 'password', twoFactorUsed: true }
  },
  {
    id: '2',
    type: 'api_access',
    action: 'API key used',
    severity: 'info',
    ip: '45.118.167.34',
    location: 'Bangalore, India',
    device: 'Production Server',
    userAgent: 'RentEase-API-Client/1.0',
    timestamp: '2024-01-15T09:15:00',
    details: { endpoint: '/api/v1/products', keyName: 'Production App', statusCode: 200 }
  },
  {
    id: '3',
    type: 'settings_change',
    action: 'Notification settings updated',
    severity: 'info',
    ip: '103.58.154.78',
    location: 'Mumbai, India',
    device: 'Chrome on Windows',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-14T16:20:00',
    details: { changes: ['email_notifications', 'sms_alerts'] }
  },
  {
    id: '4',
    type: 'security_alert',
    action: 'Failed login attempt',
    severity: 'warning',
    ip: '203.192.245.99',
    location: 'Unknown',
    device: 'Unknown Device',
    userAgent: 'Mozilla/5.0 (compatible; Unknown)',
    timestamp: '2024-01-14T22:10:00',
    details: { attempts: 3, reason: 'Invalid password' }
  },
  {
    id: '5',
    type: 'logout',
    action: 'Session ended',
    severity: 'info',
    ip: '103.58.154.78',
    location: 'Mumbai, India',
    device: 'Safari on iPhone',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    timestamp: '2024-01-14T15:30:00',
    details: { sessionDuration: '2h 15m', reason: 'user_initiated' }
  },
  {
    id: '6',
    type: 'password_change',
    action: 'Password changed',
    severity: 'info',
    ip: '103.58.154.78',
    location: 'Mumbai, India',
    device: 'Chrome on Windows',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-13T11:45:00',
    details: { method: 'user_initiated' }
  },
  {
    id: '7',
    type: '2fa',
    action: '2FA enabled',
    severity: 'info',
    ip: '103.58.154.78',
    location: 'Mumbai, India',
    device: 'Chrome on Windows',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-13T11:30:00',
    details: { method: 'authenticator_app' }
  },
  {
    id: '8',
    type: 'security_alert',
    action: 'Suspicious activity detected',
    severity: 'critical',
    ip: '45.189.234.67',
    location: 'Singapore',
    device: 'Unknown Device',
    userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
    timestamp: '2024-01-12T03:15:00',
    details: { reason: 'Multiple rapid requests', blocked: true }
  },
  {
    id: '9',
    type: 'api_access',
    action: 'API rate limit reached',
    severity: 'warning',
    ip: '45.118.167.34',
    location: 'Bangalore, India',
    device: 'Analytics Server',
    userAgent: 'RentEase-API-Client/1.0',
    timestamp: '2024-01-11T14:20:00',
    details: { endpoint: '/api/v1/analytics', keyName: 'Analytics Integration', rateLimit: 1000, requests: 1023 }
  }
]

const getLogIcon = (type: string) => {
  switch(type) {
    case 'login': return LogIn
    case 'logout': return LogIn
    case 'api_access': return Key
    case 'settings_change': return Settings
    case 'password_change': return Lock
    case '2fa': return Shield
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
  const [logs, setLogs] = useState<SecurityLog[]>(mockLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null)

  const filteredLogs = logs.filter(log => {
    if (searchTerm && !log.action.toLowerCase().includes(searchTerm.toLowerCase()) && !log.ip.includes(searchTerm)) return false
    if (filterType !== 'all' && log.type !== filterType) return false
    if (filterSeverity !== 'all' && log.severity !== filterSeverity) return false
    if (dateRange.start && new Date(log.timestamp) < new Date(dateRange.start)) return false
    if (dateRange.end && new Date(log.timestamp) > new Date(dateRange.end)) return false
    return true
  })

  const stats = {
    total: logs.length,
    critical: logs.filter(l => l.severity === 'critical').length,
    warning: logs.filter(l => l.severity === 'warning').length,
    info: logs.filter(l => l.severity === 'info').length
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
          <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
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
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-blue-700 font-medium hover:bg-blue-50 transition-colors">
            <Download className="h-4 w-4" />
            Export Logs (CSV)
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
          <button
            onClick={() => {
              setSearchTerm('')
              setFilterType('all')
              setFilterSeverity('all')
              setDateRange({ start: '', end: '' })
            }}
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
              {filteredLogs.map((log) => {
                const Icon = getLogIcon(log.type)
                const severityConfig = getSeverityConfig(log.severity)
                const SeverityIcon = severityConfig.icon
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedLog(log)}>
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {format(new Date(log.timestamp), 'dd MMM, hh:mm a')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-700">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono text-slate-500">{log.ip}</code>
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
              })}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No security logs found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing {filteredLogs.length} of {logs.length} entries</p>
          <div className="flex gap-1.5">
            <button className="p-2 rounded-lg border border-slate-200 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="px-3 py-1 rounded-lg bg-[#2874f0] text-white text-sm">1</button>
            <button className="px-3 py-1 rounded-lg hover:bg-slate-100 text-sm">2</button>
            <button className="px-3 py-1 rounded-lg hover:bg-slate-100 text-sm">3</button>
            <button className="p-2 rounded-lg border border-slate-200">
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
                    <p className="text-sm font-medium text-slate-700 capitalize">{selectedLog.type.replace('_', ' ')}</p>
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
                    <p className="text-sm text-slate-700">{format(new Date(selectedLog.timestamp), 'dd MMM yyyy, hh:mm:ss a')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">IP Address</p>
                    <code className="text-sm font-mono text-slate-700">{selectedLog.ip}</code>
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
                  <p className="text-xs font-mono text-slate-500 break-all">{selectedLog.userAgent}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Additional Details</p>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <pre className="text-xs font-mono text-slate-600 overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
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