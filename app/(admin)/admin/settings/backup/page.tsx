// src/app/admin/settings/backup/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Download,
  Upload,
  Trash2,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  HardDrive,
  FileArchive,
  Plus,
  ChevronLeft,
  ChevronRight,
  Database as DatabaseIcon,
  Cloud as CloudIcon,
  Save,
  Play,
  AlertTriangle,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
interface Backup {
  _id: string
  name: string
  size: number
  type: 'full' | 'incremental' | 'schema'
  status: 'completed' | 'failed' | 'in-progress' | 'pending'
  createdAt: string
  completedAt?: string
  createdBy: { _id: string; name: string; email: string }
  metadata: {
    collections: string[]
    documentsCount: number
    compression: 'gzip' | 'none'
    encryption: boolean
  }
  downloadUrl: string
}

interface BackupSchedule {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  dayOfWeek?: number
  dayOfMonth?: number
  retentionDays: number
  backupType: 'full' | 'incremental'
  lastRun?: string
  nextRun?: string
}

interface StorageStats {
  totalBackups: number
  totalSize: number
  availableSpace: number
  usedSpace: number
  backupsByDay: Array<{ date: string; count: number; size: number }>
  averageBackupSize: number
  oldestBackup: string
  newestBackup: string
}

// Helper Components
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function BackupStatusBadge({ status }: { status: string }) {
  const config = {
    completed: { label: 'Completed', color: 'text-white', bg: 'bg-gradient-to-r from-emerald-500 to-teal-500', icon: CheckCircle },
    failed: { label: 'Failed', color: 'text-white', bg: 'bg-gradient-to-r from-rose-500 to-red-500', icon: AlertCircle },
    'in-progress': { label: 'In Progress', color: 'text-white', bg: 'bg-gradient-to-r from-blue-500 to-indigo-500', icon: Loader2 },
    pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock }
  }
  const cfg = config[status as keyof typeof config] || config.completed
  const Icon = cfg.icon

  return (
    <Badge className={cn('gap-1 border-0', cfg.bg, cfg.color)}>
      <Icon className={cn('h-3 w-3', status === 'in-progress' && 'animate-spin')} />
      {cfg.label}
    </Badge>
  )
}

function BackupTypeBadge({ type }: { type: string }) {
  const config = {
    full: { label: 'Full Backup', color: 'text-violet-700', bg: 'bg-violet-100' },
    incremental: { label: 'Incremental', color: 'text-blue-700', bg: 'bg-blue-100' },
    schema: { label: 'Schema Only', color: 'text-emerald-700', bg: 'bg-emerald-100' }
  }
  const cfg = config[type as keyof typeof config] || config.full

  return <Badge className={cn('border-0', cfg.bg, cfg.color)}>{cfg.label}</Badge>
}

// Storage Stats Component
function StorageStatsCards({ stats }: { stats: StorageStats | null }) {
  if (!stats) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <DatabaseIcon className="h-8 w-8 text-blue-300" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-800">No storage data yet</h3>
        <p className="text-sm text-slate-500">Stats will appear once your first backup completes</p>
      </div>
    )
  }

  const usagePercentage = (stats.usedSpace / (stats.usedSpace + stats.availableSpace)) * 100
  const maxDailyCount = Math.max(...(stats.backupsByDay?.map(d => d.count) ?? [0]), 1)

  const tiles = [
    { label: 'Total Backups', value: String(stats.totalBackups), icon: DatabaseIcon, grad: 'from-blue-500 to-indigo-500', text: 'text-blue-700' },
    { label: 'Total Size', value: formatBytes(stats.totalSize), icon: HardDrive, grad: 'from-violet-500 to-purple-500', text: 'text-violet-700' },
    { label: 'Avg Backup Size', value: formatBytes(stats.averageBackupSize), icon: FileArchive, grad: 'from-amber-500 to-orange-500', text: 'text-amber-700' },
    { label: 'Available Space', value: formatBytes(stats.availableSpace), icon: CloudIcon, grad: 'from-emerald-500 to-teal-500', text: 'text-emerald-700' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon
          return (
            <Card key={tile.label} className="overflow-hidden border-slate-200 shadow-sm">
              <CardContent className="p-3.5 sm:p-4">
                <div className={cn('mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm', tile.grad)}>
                  <Icon className="h-4.5 w-4.5 text-white" />
                </div>
                <p className={cn('text-xl font-extrabold tracking-tight sm:text-2xl', tile.text)}>{tile.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{tile.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <CardContent className="p-4 sm:p-4.5">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-slate-700">Storage Usage</span>
            <span className="text-slate-500">{usagePercentage.toFixed(1)}% used</span>
          </div>
          <Progress value={usagePercentage} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500" />
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>Used: {formatBytes(stats.usedSpace)}</span>
            <span>Free: {formatBytes(stats.availableSpace)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardHeader className="px-5 pb-2 pt-4 sm:px-6">
          <CardTitle className="text-sm font-semibold text-slate-800">Backup History (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6">
          <div className="space-y-2.5">
            {stats.backupsByDay?.slice(-7).map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="w-20 shrink-0 truncate text-xs text-slate-500">{day.date}</span>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                      style={{ width: `${(day.count / maxDailyCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs font-semibold text-slate-700">{day.count} backups</span>
                  <span className="w-16 shrink-0 text-right text-xs text-slate-400">{formatBytes(day.size)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BackupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('backups')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [backups, setBackups] = useState<Backup[]>([])
  const [schedule, setSchedule] = useState<BackupSchedule | null>(null)
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [restoreOptions, setRestoreOptions] = useState({
    dropExisting: false,
    createBackupBeforeRestore: true,
    sendNotification: true
  })
  const [createBackupOptions, setCreateBackupOptions] = useState({
    type: 'full' as 'full' | 'incremental' | 'schema',
    collections: [] as string[],
    compress: true,
    encrypt: false
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [backupProgress, setBackupProgress] = useState(0)
  const [isBackupInProgress, setIsBackupInProgress] = useState(false)

  const fetchBackups = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/backup/list`, {
        params: { page: currentPage, limit: 20 },
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        setBackups(response.data.data)
        // Kept as you fixed it: pagination lives at response.data.meta, not
        // response.data.data.meta.
        setTotalPages(response.data.meta?.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Error fetching backups:', error)
      toast.error('Failed to load backups')
    } finally {
      setIsLoading(false)
    }
  }, [session, currentPage])

  const fetchSchedule = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/backup/schedule`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        setSchedule(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
    }
  }, [session])

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/backup/stats`, {
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
      fetchBackups()
      fetchSchedule()
      fetchStats()
    }
  }, [status, router, fetchBackups, fetchSchedule, fetchStats])

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    setIsBackupInProgress(true)
    setBackupProgress(0)

    const progressInterval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 500)

    try {
      const response = await axios.post(`${BASE_URL}/api/v1/admin/backup/create`, createBackupOptions, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })

      clearInterval(progressInterval)
      setBackupProgress(100)

      if (response.data.success) {
        toast.success('Backup created successfully')
        setIsCreateModalOpen(false)
        fetchBackups()
        fetchStats()
        setCreateBackupOptions({
          type: 'full',
          collections: [],
          compress: true,
          encrypt: false
        })
      }
    } catch (error: any) {
      clearInterval(progressInterval)
      console.error('Error creating backup:', error)
      toast.error(error.response?.data?.message || 'Failed to create backup')
    } finally {
      setIsCreatingBackup(false)
      setTimeout(() => {
        setIsBackupInProgress(false)
        setBackupProgress(0)
      }, 1000)
    }
  }

  const handleDownloadBackup = async (backup: Backup) => {
    try {
      // Kept as you fixed it: downloadUrl is a relative path, so it needs the
      // BASE_URL prefix to resolve to the API host.
      const response = await axios.get(`${BASE_URL}${backup.downloadUrl}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${backup.name}.gz`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Backup downloaded successfully')
    } catch (error) {
      console.error('Error downloading backup:', error)
      toast.error('Failed to download backup')
    }
  }

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return

    try {
      const response = await axios.post(`${BASE_URL}/api/v1/admin/backup/restore/${selectedBackup._id}`, restoreOptions, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Restore initiated successfully')
        setIsRestoreModalOpen(false)
        setSelectedBackup(null)
      }
    } catch (error: any) {
      console.error('Error restoring backup:', error)
      toast.error(error.response?.data?.message || 'Failed to restore backup')
    }
  }

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) return

    try {
      const response = await axios.delete(`${BASE_URL}/api/v1/admin/backup/${backupId}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Backup deleted successfully')
        fetchBackups()
        fetchStats()
      }
    } catch (error) {
      console.error('Error deleting backup:', error)
      toast.error('Failed to delete backup')
    }
  }

  const handleSaveSchedule = async () => {
    if (!schedule) return

    try {
      const response = await axios.put(`${BASE_URL}/api/v1/admin/backup/schedule`, schedule, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Backup schedule saved successfully')
        fetchSchedule()
      }
    } catch (error: any) {
      console.error('Error saving schedule:', error)
      toast.error(error.response?.data?.message || 'Failed to save schedule')
    }
  }

  const handleRunNow = async () => {
    setIsCreatingBackup(true)
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/admin/backup/run-now`, {}, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Backup job started')
        fetchBackups()
      }
    } catch (error: any) {
      console.error('Error running backup:', error)
      toast.error(error.response?.data?.message || 'Failed to start backup')
    } finally {
      setIsCreatingBackup(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-xl" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-blue-600" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading backup center…</p>
      </div>
    )
  }

  return (
    // No h-screen / vertical overflow here — the admin <main> shell owns the only
    // scrollbar. overflow-x-hidden guards the hero blobs and wide table from causing
    // a second, horizontal scrollbar.
    <div className="w-full max-w-full space-y-6 overflow-x-hidden px-1 pb-2 sm:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
              <DatabaseIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Backup & Recovery</h2>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                Manage database backups, schedule automated backups, and restore data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Create Backup
            </Button>
            <Button
              variant="outline"
              onClick={handleRunNow}
              disabled={isCreatingBackup}
              className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              {isCreatingBackup ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run Now
            </Button>
          </div>
        </div>
      </div>

      {/* Backup Progress Indicator */}
      {isBackupInProgress && (
        <Card className="overflow-hidden border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
          <CardContent className="p-4 sm:p-4.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800">Backup in progress...</p>
                <Progress value={backupProgress} className="mt-2 h-2 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500" />
              </div>
              <span className="shrink-0 text-sm font-semibold text-blue-700">{backupProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 p-1">
          <TabsTrigger
            value="backups"
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <DatabaseIcon className="h-4 w-4" />
            Backups
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        {/* Backups Tab */}
        <TabsContent value="backups" className="mt-6 space-y-6">
          <StorageStatsCards stats={stats} />

          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader className="px-5 pb-3 pt-4 sm:px-6">
              <CardTitle className="text-base text-slate-900 sm:text-lg">Backup History</CardTitle>
              <CardDescription>List of all database backups</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6">
              {backups.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50">
                    <DatabaseIcon className="h-8 w-8 text-violet-300" />
                  </div>
                  <p className="mb-4 text-sm text-slate-500">No backups found</p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    variant="outline"
                    className="border-violet-200 text-violet-700 hover:bg-violet-50"
                  >
                    Create your first backup
                  </Button>
                </div>
              ) : (
                <div className="-mx-1 overflow-x-auto px-1">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Size</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((backup) => (
                        <tr key={backup._id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-50">
                                <FileArchive className="h-3.5 w-3.5 text-violet-500" />
                              </div>
                              <span className="font-mono text-sm text-slate-700">{backup.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <BackupTypeBadge type={backup.type} />
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {formatBytes(backup.size)}
                          </td>
                          <td className="px-4 py-3">
                            <BackupStatusBadge status={backup.status} />
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">
                            {format(new Date(backup.createdAt), 'dd MMM yyyy, hh:mm a')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                      onClick={() => handleDownloadBackup(backup)}
                                      disabled={backup.status !== 'completed'}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Download</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                                      onClick={() => {
                                        setSelectedBackup(backup)
                                        setIsRestoreModalOpen(true)
                                      }}
                                      disabled={backup.status !== 'completed'}
                                    >
                                      <Upload className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Restore</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-slate-100">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDeleteBackup(backup._id)} className="text-rose-600 focus:text-rose-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="px-5 pb-3 pt-4 sm:px-6">
              <CardTitle className="text-base text-slate-900 sm:text-lg">Automated Backup Schedule</CardTitle>
              <CardDescription>Configure automatic backups to run on a schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-5 pb-5 sm:px-6">
              {schedule ? (
                <>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                    <div>
                      <p className="font-semibold text-slate-800">Enable Automatic Backups</p>
                      <p className="text-sm text-slate-500">
                        Automatically create backups based on schedule
                      </p>
                    </div>
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(checked) => setSchedule({ ...schedule, enabled: checked })}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-600 data-[state=checked]:to-teal-600"
                    />
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Backup Frequency</Label>
                      <Select
                        value={schedule.frequency}
                        onValueChange={(v: any) => setSchedule({ ...schedule, frequency: v })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Backup Time (24h)</Label>
                      <Input
                        type="time"
                        value={schedule.time}
                        onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                    {schedule.frequency === 'weekly' && (
                      <div>
                        <Label>Day of Week</Label>
                        <Select
                          value={String(schedule.dayOfWeek)}
                          onValueChange={(v) => setSchedule({ ...schedule, dayOfWeek: parseInt(v) })}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Monday</SelectItem>
                            <SelectItem value="2">Tuesday</SelectItem>
                            <SelectItem value="3">Wednesday</SelectItem>
                            <SelectItem value="4">Thursday</SelectItem>
                            <SelectItem value="5">Friday</SelectItem>
                            <SelectItem value="6">Saturday</SelectItem>
                            <SelectItem value="0">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {schedule.frequency === 'monthly' && (
                      <div>
                        <Label>Day of Month</Label>
                        <Input
                          type="number"
                          min={1}
                          max={28}
                          value={schedule.dayOfMonth}
                          onChange={(e) => setSchedule({ ...schedule, dayOfMonth: parseInt(e.target.value) })}
                          className="mt-1.5"
                        />
                      </div>
                    )}
                    <div>
                      <Label>Retention Period (days)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        value={schedule.retentionDays}
                        onChange={(e) => setSchedule({ ...schedule, retentionDays: parseInt(e.target.value) })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Backup Type</Label>
                      <Select
                        value={schedule.backupType}
                        onValueChange={(v: any) => setSchedule({ ...schedule, backupType: v })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Backup</SelectItem>
                          <SelectItem value="incremental">Incremental Backup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">Schedule Summary</p>
                        <p className="mt-1 text-xs text-emerald-700">
                          {schedule.enabled ? 'Backups are enabled' : 'Backups are disabled'}
                        </p>
                      </div>
                      <Button
                        onClick={handleSaveSchedule}
                        className="gap-2 border-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:from-emerald-700 hover:to-teal-700"
                      >
                        <Save className="h-4 w-4" />
                        Save Schedule
                      </Button>
                    </div>
                    {schedule.lastRun && (
                      <div className="mt-3 text-xs text-emerald-700">
                        Last run: {format(new Date(schedule.lastRun), 'dd MMM yyyy, hh:mm a')}
                      </div>
                    )}
                    {schedule.nextRun && (
                      <div className="text-xs text-emerald-700">
                        Next run: {format(new Date(schedule.nextRun), 'dd MMM yyyy, hh:mm a')}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <Calendar className="h-8 w-8 text-emerald-300" />
                  </div>
                  <p className="text-sm text-slate-500">No schedule configured yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Backup Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                <DatabaseIcon className="h-4 w-4 text-white" />
              </div>
              Create New Backup
            </DialogTitle>
            <DialogDescription>
              Configure backup options before creating
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Backup Type</Label>
              <Select
                value={createBackupOptions.type}
                onValueChange={(v: any) => setCreateBackupOptions({ ...createBackupOptions, type: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Backup (All collections)</SelectItem>
                  <SelectItem value="incremental">Incremental Backup (Changes only)</SelectItem>
                  <SelectItem value="schema">Schema Only (No data)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <div>
                <Label className="mb-0">Compress Backup</Label>
                <p className="text-xs text-slate-500">Use gzip compression</p>
              </div>
              <Switch
                checked={createBackupOptions.compress}
                onCheckedChange={(checked) => setCreateBackupOptions({ ...createBackupOptions, compress: checked })}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <div>
                <Label className="mb-0">Encrypt Backup</Label>
                <p className="text-xs text-slate-500">AES-256 encryption</p>
              </div>
              <Switch
                checked={createBackupOptions.encrypt}
                onCheckedChange={(checked) => setCreateBackupOptions({ ...createBackupOptions, encrypt: checked })}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-slate-300 text-slate-600 hover:bg-slate-50">
              Cancel
            </Button>
            <Button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            >
              {isCreatingBackup ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseIcon className="h-4 w-4" />}
              Create Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Backup Modal */}
      <Dialog open={isRestoreModalOpen} onOpenChange={setIsRestoreModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              Restore Backup
            </DialogTitle>
            <DialogDescription>
              This action will restore the database from the selected backup.
              <strong className="mt-2 block text-rose-600">⚠️ Warning: This action cannot be undone!</strong>
            </DialogDescription>
          </DialogHeader>
          {selectedBackup && (
            <div className="space-y-4 py-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                <p className="text-sm font-semibold text-slate-800">Backup Details</p>
                <p className="mt-1 text-xs text-slate-500">Name: {selectedBackup.name}</p>
                <p className="text-xs text-slate-500">Created: {format(new Date(selectedBackup.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                <p className="text-xs text-slate-500">Size: {formatBytes(selectedBackup.size)}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                <div>
                  <Label className="mb-0">Drop existing collections</Label>
                  <p className="text-xs text-slate-500">Remove current data before restore</p>
                </div>
                <Switch
                  checked={restoreOptions.dropExisting}
                  onCheckedChange={(checked) => setRestoreOptions({ ...restoreOptions, dropExisting: checked })}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-rose-600 data-[state=checked]:to-red-600"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                <div>
                  <Label className="mb-0">Create backup before restore</Label>
                  <p className="text-xs text-slate-500">Safety backup of current data</p>
                </div>
                <Switch
                  checked={restoreOptions.createBackupBeforeRestore}
                  onCheckedChange={(checked) => setRestoreOptions({ ...restoreOptions, createBackupBeforeRestore: checked })}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-600 data-[state=checked]:to-teal-600"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                <div>
                  <Label className="mb-0">Send notification</Label>
                  <p className="text-xs text-slate-500">Email notification on completion</p>
                </div>
                <Switch
                  checked={restoreOptions.sendNotification}
                  onCheckedChange={(checked) => setRestoreOptions({ ...restoreOptions, sendNotification: checked })}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreModalOpen(false)} className="border-slate-300 text-slate-600 hover:bg-slate-50">
              Cancel
            </Button>
            <Button
              onClick={handleRestoreBackup}
              className="gap-2 border-0 bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700"
            >
              <Upload className="h-4 w-4" />
              Restore Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}