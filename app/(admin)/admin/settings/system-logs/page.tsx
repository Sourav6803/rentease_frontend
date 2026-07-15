// src/app/admin/settings/logs/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Info,
  Loader2,
  RefreshCw,
  Search,
  Server,
  Shield,
  Trash2,
  Users,
  X,
  Zap,
  Bug,
  Activity as ActivityIcon,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { format } from 'date-fns'
import axios from 'axios'
import { cn } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Types
interface ActivityLog {
  _id: string
  user: { _id: string; name: string; email: string; role: string }
  action: string
  resource: string
  resourceId: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: string
  severity: 'info' | 'warning' | 'error' | 'critical'
}

interface ErrorLog {
  _id: string
  errorId: string
  message: string
  stack: string
  code?: string
  statusCode?: number
  route: string
  method: string
  timestamp: string
  resolved: boolean
}

interface AuditLog {
  _id: string
  action: string
  resource: string
  resourceId: string
  changes: Array<{ field: string; oldValue: any; newValue: any }>
  performedBy: { _id: string; name: string; email: string; role: string }
  ipAddress: string
  timestamp: string
}

interface PerformanceLog {
  _id: string
  endpoint: string
  method: string
  responseTime: number
  statusCode: number
  timestamp: string
}

interface LogStats {
  totalLogs: number
  errorCount: number
  warningCount: number
  infoCount: number
  criticalCount: number
  uniqueUsers: number
  averageResponseTime: number
  topEndpoints: Array<{ endpoint: string; count: number; avgResponseTime: number }>
  errorsByHour: Array<{ hour: number; count: number }>
}

const TAB_THEMES: Record<string, { grad: string; tint: string; text: string }> = {
  activity: { grad: 'from-blue-500 to-indigo-500', tint: 'bg-blue-50', text: 'text-blue-600' },
  errors: { grad: 'from-rose-500 to-red-500', tint: 'bg-rose-50', text: 'text-rose-600' },
  audit: { grad: 'from-violet-500 to-purple-500', tint: 'bg-violet-50', text: 'text-violet-600' },
  performance: { grad: 'from-emerald-500 to-teal-500', tint: 'bg-emerald-50', text: 'text-emerald-600' },
}

// Severity Badge Component
function SeverityBadge({ severity }: { severity: string }) {
  const config = {
    info: { label: 'Info', color: 'text-blue-700', bg: 'bg-blue-100', icon: Info },
    warning: { label: 'Warning', color: 'text-amber-700', bg: 'bg-amber-100', icon: AlertTriangle },
    error: { label: 'Error', color: 'text-rose-700', bg: 'bg-rose-100', icon: AlertCircle },
    critical: { label: 'Critical', color: 'text-purple-700', bg: 'bg-purple-100', icon: AlertCircle }
  }
  const cfg = config[severity as keyof typeof config] || config.info
  const Icon = cfg.icon

  return (
    <Badge className={cn('border-0', cfg.bg, cfg.color)}>
      <Icon className="mr-1 h-3 w-3" />
      {cfg.label}
    </Badge>
  )
}

// Status Code Badge
function StatusCodeBadge({ code }: { code: number }) {
  const isError = code >= 400
  const isSuccess = code >= 200 && code < 300

  return (
    <Badge
      className={cn(
        'border-0 font-mono',
        isError ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white' : isSuccess ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-slate-200 text-slate-700'
      )}
    >
      {code}
    </Badge>
  )
}

// Log Stats Component
function LogStatsCards({ stats }: { stats: LogStats | null }) {
  if (!stats) return null

  const tiles = [
    { label: 'Total Logs', value: stats.totalLogs?.toLocaleString() ?? '0', icon: FileText, grad: 'from-slate-500 to-slate-600', tint: 'bg-slate-50', text: 'text-slate-700' },
    { label: 'Errors', value: stats.errorCount, icon: AlertCircle, grad: 'from-rose-500 to-red-500', tint: 'bg-rose-50', text: 'text-rose-700' },
    { label: 'Warnings', value: stats.warningCount, icon: AlertTriangle, grad: 'from-amber-500 to-orange-500', tint: 'bg-amber-50', text: 'text-amber-700' },
    { label: 'Critical', value: stats.criticalCount, icon: AlertCircle, grad: 'from-purple-500 to-fuchsia-500', tint: 'bg-purple-50', text: 'text-purple-700' },
    { label: 'Active Users', value: stats.uniqueUsers, icon: Users, grad: 'from-blue-500 to-indigo-500', tint: 'bg-blue-50', text: 'text-blue-700' },
    { label: 'Avg Response', value: `${stats.averageResponseTime}ms`, icon: Zap, grad: 'from-cyan-500 to-blue-500', tint: 'bg-cyan-50', text: 'text-cyan-700' },
    { label: 'API Calls', value: stats.topEndpoints.reduce((a, b) => a + b.count, 0).toLocaleString(), icon: Server, grad: 'from-emerald-500 to-teal-500', tint: 'bg-emerald-50', text: 'text-emerald-700' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-7">
      {tiles.map((tile) => {
        const Icon = tile.icon
        return (
          <Card key={tile.label} className="overflow-hidden border-slate-200 shadow-sm">
            <CardContent className="p-3.5 sm:p-4">
              <div className={cn('mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm', tile.grad)}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className={cn('text-xl font-extrabold tracking-tight sm:text-2xl', tile.text)}>{tile.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{tile.label}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Activity Log Row Component
function ActivityLogRow({ log, onViewDetails }: { log: ActivityLog; onViewDetails: (log: ActivityLog) => void }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 p-3 transition-colors hover:bg-slate-50/80">
      <div className="mt-0.5 shrink-0">
        <SeverityBadge severity={log.severity} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{log.user?.name || 'System'}</span>
          <span className="text-xs text-slate-400">{log.action}</span>
          <span className="text-xs text-slate-400">on</span>
          <Badge variant="outline" className="border-slate-200 text-xs text-slate-600">
            {log.resource}
          </Badge>
        </div>
        {log.details && Object.keys(log.details).length > 0 && (
          <p className="mt-1 truncate text-xs text-slate-400">
            {Object.entries(log.details).map(([key, value]) => `${key}: ${value}`).join(' • ')}
          </p>
        )}
        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
          <span>{format(new Date(log.timestamp), 'dd MMM yyyy, hh:mm:ss a')}</span>
          <span>•</span>
          <span>IP: {log.ipAddress}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-slate-400 hover:bg-blue-50 hover:text-blue-600" onClick={() => onViewDetails(log)}>
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Error Log Row Component
function ErrorLogRow({ log, onViewDetails }: { log: ErrorLog; onViewDetails: (log: ErrorLog) => void }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 p-3 transition-colors hover:bg-slate-50/80">
      <div className="shrink-0">
        <StatusCodeBadge code={log.statusCode || 500} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-slate-400">{log.errorId}</span>
          <span className="text-sm font-semibold text-slate-800">{log.message}</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
          <span>{log.method} {log.route}</span>
          <span>•</span>
          <span>{format(new Date(log.timestamp), 'dd MMM yyyy, hh:mm:ss a')}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {log.resolved && (
          <Badge className="gap-1 border-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </Badge>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => onViewDetails(log)}>
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Audit Log Row Component
const AUDIT_ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-50 text-emerald-600',
  UPDATE: 'bg-blue-50 text-blue-600',
  DELETE: 'bg-rose-50 text-rose-600',
  VIEW: 'bg-slate-100 text-slate-600',
  LOGIN: 'bg-teal-50 text-teal-600',
  LOGOUT: 'bg-orange-50 text-orange-600',
  APPROVE: 'bg-violet-50 text-violet-600',
  REJECT: 'bg-red-50 text-red-600'
}

function AuditLogRow({ log, onViewDetails }: { log: AuditLog; onViewDetails: (log: AuditLog) => void }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 p-3 transition-colors hover:bg-slate-50/80">
      <div className="shrink-0">
        <Badge className={cn('border-0', AUDIT_ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600')}>
          {log.action}
        </Badge>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{log.performedBy?.name || 'System'}</span>
          <span className="text-xs text-slate-400">{log.resource}</span>
          <span className="text-xs text-slate-400">#{log.resourceId.slice(-6)}</span>
        </div>
        {log.changes && log.changes.length > 0 && (
          <p className="mt-1 truncate text-xs text-slate-400">
            Changed: {log.changes.map(c => c.field).join(', ')}
          </p>
        )}
        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
          <span>{format(new Date(log.timestamp), 'dd MMM yyyy, hh:mm:ss a')}</span>
          <span>•</span>
          <span>IP: {log.ipAddress}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-slate-400 hover:bg-violet-50 hover:text-violet-600" onClick={() => onViewDetails(log)}>
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Performance Log Row Component
function PerformanceLogRow({ log }: { log: PerformanceLog }) {
  const isSlow = log.responseTime > 1000
  const isMedium = log.responseTime > 500

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 p-3 transition-colors hover:bg-slate-50/80">
      <div className="shrink-0">
        <StatusCodeBadge code={log.statusCode} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-slate-200 font-mono text-xs text-slate-600">{log.method}</Badge>
          <span className="truncate font-mono text-sm text-slate-500">{log.endpoint}</span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
          <span className={cn('font-medium', isSlow ? 'text-rose-600' : isMedium ? 'text-amber-600' : 'text-emerald-600')}>
            {log.responseTime}ms
          </span>
          <span>•</span>
          <span>{format(new Date(log.timestamp), 'dd MMM yyyy, hh:mm:ss a')}</span>
        </div>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-16 shrink-0">
              <Progress
                value={Math.min((log.responseTime / 2000) * 100, 100)}
                className={cn('h-1.5', isSlow ? '[&>div]:bg-rose-500' : isMedium ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500')}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>{log.responseTime}ms</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default function SystemLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('activity')
  const [isLoading, setIsLoading] = useState(true)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [performanceLogs, setPerformanceLogs] = useState<PerformanceLog[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isAutoRefresh, setIsAutoRefresh] = useState(false)

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      let endpoint = ''
      const params: any = {
        page: currentPage,
        limit: 50,
        search: searchQuery || undefined,
      }

      if (dateRange.start) params.startDate = dateRange.start
      if (dateRange.end) params.endDate = dateRange.end

      switch (activeTab) {
        case 'activity':
          endpoint = '/api/v1/admin/logs/activity'
          if (severityFilter !== 'all') params.severity = severityFilter
          break
        case 'errors':
          endpoint = '/api/v1/admin/logs/errors'
          break
        case 'audit':
          endpoint = '/api/v1/admin/logs/audit'
          break
        case 'performance':
          endpoint = '/api/v1/admin/logs/performance'
          break
      }

      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        params,
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })

      if (response.data.success) {
        const logs = response.data.data
        const pages = response.data.meta?.pagination?.totalPages || 1
        switch (activeTab) {
          case 'activity':
            setActivityLogs(logs)
            setTotalPages(pages)
            break
          case 'errors':
            setErrorLogs(logs)
            setTotalPages(pages)
            break
          case 'audit':
            setAuditLogs(logs)
            setTotalPages(pages)
            break
          case 'performance':
            setPerformanceLogs(logs)
            setTotalPages(pages)
            break
        }
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Failed to load logs')
    } finally {
      setIsLoading(false)
    }
  }, [session, activeTab, currentPage, searchQuery, severityFilter, dateRange])

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/logs/stats`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [session])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    if (status === 'authenticated') {
      fetchLogs()
      fetchStats()
    }
  }, [status, router, fetchLogs, fetchStats])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAutoRefresh) return
    const interval = setInterval(() => {
      fetchLogs()
      fetchStats()
    }, 30000)
    return () => clearInterval(interval)
  }, [isAutoRefresh, fetchLogs, fetchStats])

  const handleResolveError = async (errorId: string) => {
    try {
      const response = await axios.patch(`${BASE_URL}/api/v1/admin/logs/errors/${errorId}/resolve`, {}, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Error marked as resolved')
        fetchLogs()
      }
    } catch (error) {
      console.error('Error resolving error:', error)
      toast.error('Failed to resolve error')
    }
  }

  const handleExportLogs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/logs/export`, {
        params: { type: activeTab, format: 'csv' },
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${activeTab}-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Logs exported successfully')
    } catch (error) {
      console.error('Error exporting logs:', error)
      toast.error('Failed to export logs')
    }
  }

  const clearLogs = async () => {
    if (!confirm('Are you sure you want to clear all logs? This action cannot be undone.')) return

    try {
      const response = await axios.delete(`${BASE_URL}/api/v1/admin/logs/clear`, {
        params: { type: activeTab },
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Logs cleared successfully')
        fetchLogs()
      }
    } catch (error) {
      console.error('Error clearing logs:', error)
      toast.error('Failed to clear logs')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-xl" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-blue-600" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading system logs…</p>
      </div>
    )
  }

  const currentEmpty: Record<string, { icon: any; message: string; tint: string; text: string }> = {
    activity: { icon: ActivityIcon, message: 'No activity logs found', tint: 'bg-blue-50', text: 'text-blue-300' },
    errors: { icon: CheckCircle, message: 'No errors found! System is healthy.', tint: 'bg-emerald-50', text: 'text-emerald-400' },
    audit: { icon: Shield, message: 'No audit logs found', tint: 'bg-violet-50', text: 'text-violet-300' },
    performance: { icon: Zap, message: 'No performance logs found', tint: 'bg-emerald-50', text: 'text-emerald-300' },
  }

  return (
    // No h-screen / vertical overflow here — the admin <main> shell owns the only
    // scrollbar. overflow-x-hidden guards against the hero blobs and the filter
    // bar wrapping wide on small screens.
    <div className="w-full max-w-full space-y-6 px-1 pb-2 sm:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
              <ActivityIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">System Logs</h2>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                Monitor system activity, errors, audit trails, and performance metrics
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={cn(
                'gap-2',
                isAutoRefresh ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              )}
            >
              <RefreshCw className={cn('h-4 w-4', isAutoRefresh && 'animate-spin')} />
              Auto-refresh {isAutoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportLogs} className="gap-2 border-violet-200 text-violet-700 hover:bg-violet-50">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={clearLogs}
              className="gap-2 border-0 bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm hover:from-rose-700 hover:to-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <LogStatsCards stats={stats} />

      {/* Top Endpoints */}
      {stats && stats.topEndpoints.length > 0 && (
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <CardHeader className="px-5 pb-2 pt-4 sm:px-6">
            <CardTitle className="text-sm font-semibold text-slate-800">Top API Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6">
            <div className="space-y-2.5">
              {stats.topEndpoints.slice(0, 5).map((endpoint) => (
                <div key={endpoint.endpoint} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs text-slate-500">{endpoint.endpoint}</span>
                  <div className="flex flex-1 items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${(endpoint.count / stats.topEndpoints[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-slate-700">{endpoint.count} calls</span>
                    <span className="shrink-0 text-xs text-slate-400">{endpoint.avgResponseTime}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="-mx-1 overflow-x-auto px-1">
          <TabsList className="grid min-w-[480px] grid-cols-4 gap-1 bg-slate-100 p-1">
            <TabsTrigger value="activity" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              <ActivityIcon className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="errors" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-red-600 data-[state=active]:text-white">
              <Bug className="h-4 w-4" />
              Errors
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Shield className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white">
              <Zap className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filters Bar */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {activeTab === 'activity' && (
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-36"
          />
          <Input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-36"
          />
          <Button
            variant="outline"
            onClick={() => setDateRange({ start: '', end: '' })}
            className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>

        {(['activity', 'errors', 'audit', 'performance'] as const).map((tabKey) => {
          const theme = TAB_THEMES[tabKey]
          const empty = currentEmpty[tabKey]
          const EmptyIcon = empty.icon
          return (
            <TabsContent key={tabKey} value={tabKey} className="mt-4">
              <Card className="overflow-hidden border-slate-200 shadow-sm">
                <div className={cn('h-1 bg-gradient-to-r', theme.grad)} />
                <CardHeader className="px-5 pb-3 pt-4 sm:px-6">
                  <CardTitle className="text-base text-slate-900 sm:text-lg">
                    {tabKey === 'activity' && 'User Activity Logs'}
                    {tabKey === 'errors' && 'System Error Logs'}
                    {tabKey === 'audit' && 'Audit Trail'}
                    {tabKey === 'performance' && 'Performance Metrics'}
                  </CardTitle>
                  <CardDescription>
                    {tabKey === 'activity' && 'Track user actions and system events'}
                    {tabKey === 'errors' && 'Track application errors and exceptions'}
                    {tabKey === 'audit' && 'Track all data modifications and security events'}
                    {tabKey === 'performance' && 'Monitor API response times and system performance'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5 sm:px-6">
                  {tabKey === 'activity' && (
                    activityLogs.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className={cn('mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full', empty.tint)}>
                          <EmptyIcon className={cn('h-8 w-8', empty.text)} />
                        </div>
                        <p className="text-sm text-slate-500">{empty.message}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {activityLogs.map((log) => (
                          <ActivityLogRow key={log._id} log={log} onViewDetails={(l) => { setSelectedLog(l); setIsDetailsOpen(true) }} />
                        ))}
                      </div>
                    )
                  )}
                  {tabKey === 'errors' && (
                    errorLogs.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className={cn('mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full', empty.tint)}>
                          <EmptyIcon className={cn('h-8 w-8', empty.text)} />
                        </div>
                        <p className="text-sm text-slate-500">{empty.message}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {errorLogs.map((log) => (
                          <ErrorLogRow key={log._id} log={log} onViewDetails={(l) => { setSelectedLog(l); setIsDetailsOpen(true) }} />
                        ))}
                      </div>
                    )
                  )}
                  {tabKey === 'audit' && (
                    auditLogs.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className={cn('mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full', empty.tint)}>
                          <EmptyIcon className={cn('h-8 w-8', empty.text)} />
                        </div>
                        <p className="text-sm text-slate-500">{empty.message}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {auditLogs.map((log) => (
                          <AuditLogRow key={log._id} log={log} onViewDetails={(l) => { setSelectedLog(l); setIsDetailsOpen(true) }} />
                        ))}
                      </div>
                    )
                  )}
                  {tabKey === 'performance' && (
                    performanceLogs.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className={cn('mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full', empty.tint)}>
                          <EmptyIcon className={cn('h-8 w-8', empty.text)} />
                        </div>
                        <p className="text-sm text-slate-500">{empty.message}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {performanceLogs.map((log) => (
                          <PerformanceLogRow key={log._id} log={log} />
                        ))}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-slate-300 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-slate-300 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Tabs>

      {/* Log Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                <FileText className="h-4 w-4 text-white" />
              </div>
              Log Details
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="border-slate-300 text-slate-600 hover:bg-slate-50">
              Close
            </Button>
            {selectedLog?.errorId && !selectedLog?.resolved && (
              <Button
                onClick={() => handleResolveError(selectedLog.errorId)}
                className="gap-2 border-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Resolved
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}