// src/app/admin/settings/api-keys/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Key,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Loader2,
  MoreVertical,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
interface APIKey {
  _id: string
  name: string
  key: string
  secret?: string
  permissions: string[]
  rateLimit: {
    enabled: boolean
    limit: number
    window: number
  }
  allowedIPs: string[]
  allowedDomains: string[]
  expiresAt?: string
  lastUsedAt?: string
  usageCount: number
  status: 'active' | 'revoked' | 'expired'
  createdBy: { _id: string; name: string; email: string }
  createdAt: string
  updatedAt: string
}

interface APIKeyStats {
  totalKeys: number
  activeKeys: number
  revokedKeys: number
  expiredKeys: number
  totalRequests: number
  averageRequestsPerDay: number
  topKeys: Array<{ keyId: string; name: string; usageCount: number }>
  usageByDay: Array<{ date: string; count: number }>
}

// Permission Categories
const permissionCategories = [
  {
    id: 'read',
    label: 'Read Access',
    grad: 'from-blue-500 to-indigo-500',
    permissions: ['products:read', 'rentals:read', 'users:read', 'vendors:read', 'payments:read']
  },
  {
    id: 'write',
    label: 'Write Access',
    grad: 'from-amber-500 to-orange-500',
    permissions: ['products:write', 'rentals:write', 'users:write', 'vendors:write']
  },
  {
    id: 'admin',
    label: 'Admin Access',
    grad: 'from-rose-500 to-red-500',
    permissions: ['admins:read', 'admins:write', 'settings:read', 'settings:write', 'reports:generate']
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    grad: 'from-violet-500 to-purple-500',
    permissions: ['webhooks:manage', 'webhooks:receive']
  }
]

// Helper Components
function APIKeyStatusBadge({ status }: { status: string }) {
  const config = {
    active: { label: 'Active', color: 'text-white', bg: 'bg-gradient-to-r from-emerald-500 to-teal-500', icon: CheckCircle },
    revoked: { label: 'Revoked', color: 'text-white', bg: 'bg-gradient-to-r from-rose-500 to-red-500', icon: XCircle },
    expired: { label: 'Expired', color: 'text-amber-700', bg: 'bg-amber-100', icon: AlertCircle }
  }
  const cfg = config[status as keyof typeof config] || config.active
  const Icon = cfg.icon

  return (
    <Badge className={cn('gap-1 border-0', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  )
}

// Stats Cards Component
function StatsCards({ stats }: { stats: APIKeyStats | null }) {
  if (!stats) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <Key className="h-8 w-8 text-blue-300" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-800">No API key stats yet</h3>
        <p className="text-sm text-slate-500">Stats will appear once keys start being used</p>
      </div>
    )
  }

  const tiles = [
    { label: 'Total Keys', value: String(stats.totalKeys), icon: Key, grad: 'from-slate-500 to-slate-600', tint: 'bg-slate-50', text: 'text-slate-700' },
    { label: 'Active', value: String(stats.activeKeys), icon: CheckCircle, grad: 'from-emerald-500 to-teal-500', tint: 'bg-emerald-50', text: 'text-emerald-700' },
    { label: 'Revoked', value: String(stats.revokedKeys), icon: XCircle, grad: 'from-rose-500 to-red-500', tint: 'bg-rose-50', text: 'text-rose-700' },
    { label: 'Expired', value: String(stats.expiredKeys), icon: AlertCircle, grad: 'from-amber-500 to-orange-500', tint: 'bg-amber-50', text: 'text-amber-700' },
    { label: 'Total Requests', value: stats.totalRequests.toLocaleString(), icon: Activity, grad: 'from-blue-500 to-indigo-500', tint: 'bg-blue-50', text: 'text-blue-700' },
    { label: 'Avg/Day', value: stats.averageRequestsPerDay.toLocaleString(), icon: TrendingUp, grad: 'from-cyan-500 to-blue-500', tint: 'bg-cyan-50', text: 'text-cyan-700' },
    { label: 'Rate Limit', value: '100/min', icon: Zap, grad: 'from-violet-500 to-purple-500', tint: 'bg-violet-50', text: 'text-violet-700' },
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

export default function APIKeysPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [stats, setStats] = useState<APIKeyStats | null>(null)
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showSecret, setShowSecret] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  // Bug fix: the modal previously showed createForm.name (the label the user typed)
  // in the "API Key" field instead of the actual generated key string returned by
  // the API. newKeyValue now captures response.data.data.key so the real key shows.
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null)

  // Create key form state
  const [createForm, setCreateForm] = useState({
    name: '',
    permissions: [] as string[],
    rateLimitEnabled: true,
    rateLimit: 100,
    rateLimitWindow: 60,
    allowedIPs: '',
    allowedDomains: '',
    expiresInDays: 30
  })

  const fetchAPIKeys = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/api-keys`, {
        params: {
          page: currentPage,
          limit: 20,
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        },
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        setApiKeys(response.data.data)
        setTotalPages(response.data.meta?.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
      toast.error('Failed to load API keys')
    } finally {
      setIsLoading(false)
    }
  }, [session, currentPage, searchQuery, statusFilter])

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/api-keys/stats`, {
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
      fetchAPIKeys()
      fetchStats()
    }
  }, [status, router, fetchAPIKeys, fetchStats])

  const handleCreateKey = async () => {
    if (!createForm.name.trim()) {
      toast.error('Please enter a key name')
      return
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/v1/admin/api-keys`, {
        name: createForm.name,
        permissions: createForm.permissions,
        rateLimit: {
          enabled: createForm.rateLimitEnabled,
          limit: createForm.rateLimit,
          window: createForm.rateLimitWindow
        },
        allowedIPs: createForm.allowedIPs.split(',').map(ip => ip.trim()).filter(Boolean),
        allowedDomains: createForm.allowedDomains.split(',').map(d => d.trim()).filter(Boolean),
        expiresInDays: createForm.expiresInDays
      }, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })

      if (response.data.success) {
        setNewKeyValue(response.data.data.key)
        setNewKeySecret(response.data.data.secret)
        toast.success('API Key created successfully', {
          description: 'Make sure to copy your secret key now. It won\'t be shown again!',
          duration: 10000
        })
        fetchAPIKeys()
        fetchStats()
        // Don't close modal immediately - show secret
      }
    } catch (error: any) {
      console.error('Error creating API key:', error)
      toast.error(error.response?.data?.message || 'Failed to create API key')
    }
  }

  const handleRevokeKey = async () => {
    if (!selectedKey) return

    try {
      const response = await axios.delete(`${BASE_URL}/api/v1/admin/api-keys/${selectedKey._id}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('API key revoked successfully')
        fetchAPIKeys()
        fetchStats()
        setIsRevokeDialogOpen(false)
        setSelectedKey(null)
      }
    } catch (error: any) {
      console.error('Error revoking API key:', error)
      toast.error(error.response?.data?.message || 'Failed to revoke API key')
    }
  }

  const handleRegenerateKey = async (keyId: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/admin/api-keys/${keyId}/regenerate`, {}, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        setNewKeyValue(response.data.data.key)
        setNewKeySecret(response.data.data.secret)
        toast.success('API key regenerated successfully', {
          description: 'Make sure to copy your new secret key!',
          duration: 10000
        })
        fetchAPIKeys()
      }
    } catch (error: any) {
      console.error('Error regenerating API key:', error)
      toast.error(error.response?.data?.message || 'Failed to regenerate API key')
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success(`${field} copied to clipboard`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const togglePermission = (permission: string) => {
    setCreateForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-xl" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-blue-600" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading API keys…</p>
      </div>
    )
  }

  return (
    // No h-screen / vertical overflow here — the admin <main> shell owns the only
    // scrollbar. overflow-x-hidden guards the hero blobs and wide table.
    <div className="w-full max-w-full space-y-6 px-1 pb-2 sm:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">API Keys Management</h2>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                Manage API keys for third-party integrations and external services
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setNewKeyValue(null)
              setNewKeySecret(null)
              setCreateForm({
                name: '',
                permissions: [],
                rateLimitEnabled: true,
                rateLimit: 100,
                rateLimitWindow: 60,
                allowedIPs: '',
                allowedDomains: '',
                expiresInDays: 30
              })
              setIsCreateModalOpen(true)
            }}
            className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Generate API Key
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Usage Chart */}
      {stats && stats.usageByDay.length > 0 && (
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="px-5 pb-2 pt-4 sm:px-6">
            <CardTitle className="text-sm font-semibold text-slate-800">API Usage (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6">
            <div className="space-y-2.5">
              {stats.usageByDay.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 truncate text-xs text-slate-500">{day.date}</span>
                  <div className="flex flex-1 items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${(day.count / Math.max(...stats.usageByDay.map(d => d.count))) * 100}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-slate-700">{day.count.toLocaleString()} requests</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Keys */}
      {stats && stats.topKeys.length > 0 && (
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <CardHeader className="px-5 pb-2 pt-4 sm:px-6">
            <CardTitle className="text-sm font-semibold text-slate-800">Most Active API Keys</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6">
            <div className="space-y-1">
              {stats.topKeys.map((key) => (
                <div key={key.keyId} className="flex items-center justify-between rounded-lg px-2 py-2 last:border-0 hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">{key.name}</span>
                  <span className="text-xs text-slate-400">{key.usageCount.toLocaleString()} requests</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-4 sm:p-4.5">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
              <Input
                placeholder="Search by key name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchAPIKeys}
              className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <CardHeader className="px-5 pb-3 pt-4 sm:px-6">
          <CardTitle className="text-base text-slate-900 sm:text-lg">API Keys</CardTitle>
          <CardDescription>
            {apiKeys.length} key{apiKeys.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6">
          {apiKeys.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <Key className="h-8 w-8 text-blue-300" />
              </div>
              <p className="mb-4 text-sm text-slate-500">No API keys found</p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Generate your first API key
              </Button>
            </div>
          ) : (
            // overflow-x-auto scoped to the table only, so a wide table scrolls
            // sideways inside this box instead of widening the whole page.
            <div className="-mx-1 overflow-x-auto px-1">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Key</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Usage</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Last Used</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr key={key._id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50">
                            <Key className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          <span className="font-semibold text-slate-800">{key.name}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {key.permissions.slice(0, 2).map((perm) => (
                            <Badge key={perm} variant="outline" className="border-slate-200 text-[10px] text-slate-500">
                              {perm}
                            </Badge>
                          ))}
                          {key.permissions.length > 2 && (
                            <span className="text-[10px] text-slate-400">
                              +{key.permissions.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-slate-50 px-2 py-1 text-xs text-slate-600">
                            {key.key.slice(0, 8)}...{key.key.slice(-8)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(key.key, 'Key')}
                            className="text-slate-400 transition-colors hover:text-blue-600"
                          >
                            {copiedField === 'Key' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <APIKeyStatusBadge status={key.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {key.usageCount.toLocaleString()} requests
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {key.lastUsedAt ? format(new Date(key.lastUsedAt), 'dd MMM yyyy') : 'Never'}
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
                                  onClick={() => {
                                    setSelectedKey(key)
                                    setIsDetailsModalOpen(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {key.status === 'active' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                                    onClick={() => handleRegenerateKey(key._id)}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Regenerate Key</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {key.status === 'active' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-slate-100">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedKey(key)
                                    setIsRevokeDialogOpen(true)
                                  }}
                                  className="text-rose-600 focus:text-rose-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Revoke Key
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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

      {/* Create API Key Modal */}
      <Dialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false)
            setNewKeyValue(null)
            setNewKeySecret(null)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                <Key className="h-4 w-4 text-white" />
              </div>
              {newKeySecret ? 'API Key Created' : 'Generate New API Key'}
            </DialogTitle>
            <DialogDescription>
              {newKeySecret
                ? 'Copy your secret key now. It won\'t be shown again!'
                : 'Configure permissions and restrictions for your API key'}
            </DialogDescription>
          </DialogHeader>

          {newKeySecret ? (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <AlertCircle className="h-4.5 w-4.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800">Important!</p>
                    <p className="mt-1 text-sm text-amber-700">
                      Make sure to copy your secret key now. You won't be able to see it again!
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Label>API Key</Label>
                <div className="relative mt-1.5">
                  <Input
                    value={newKeyValue ?? ''}
                    readOnly
                    className="bg-slate-50 pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => newKeyValue && copyToClipboard(newKeyValue, 'API Key')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600"
                  >
                    {copiedField === 'API Key' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label>Secret Key</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showSecret ? 'text' : 'password'}
                    value={newKeySecret}
                    readOnly
                    className="bg-slate-50 pr-20 font-mono text-sm"
                  />
                  <div className="absolute right-1 top-1 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSecret(!showSecret)}
                      className="h-8 px-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(newKeySecret, 'Secret Key')}
                      className="h-8 px-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {copiedField === 'Secret Key' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div>
                <Label>Key Name *</Label>
                <Input
                  placeholder="e.g., Production Server, Mobile App, Third-party Integration"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="mt-2 space-y-3">
                  {permissionCategories.map((category) => (
                    <div key={category.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <span className={cn('h-1.5 w-1.5 rounded-full bg-gradient-to-r', category.grad)} />
                        <p className="text-sm font-semibold text-slate-700">{category.label}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.permissions.map((perm) => {
                          const active = createForm.permissions.includes(perm)
                          return (
                            <Badge
                              key={perm}
                              className={cn(
                                'cursor-pointer select-none border-0 transition-colors',
                                active ? cn('bg-gradient-to-r text-white shadow-sm', category.grad) : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              )}
                              onClick={() => togglePermission(perm)}
                            >
                              {perm}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <Label className="mb-0">Rate Limiting</Label>
                    <p className="text-xs text-slate-500">Limit API requests</p>
                  </div>
                  <Switch
                    checked={createForm.rateLimitEnabled}
                    onCheckedChange={(checked) => setCreateForm({ ...createForm, rateLimitEnabled: checked })}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600"
                  />
                </div>
                {createForm.rateLimitEnabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Requests per window</Label>
                      <Input
                        type="number"
                        value={createForm.rateLimit}
                        onChange={(e) => setCreateForm({ ...createForm, rateLimit: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Time window (seconds)</Label>
                      <Input
                        type="number"
                        value={createForm.rateLimitWindow}
                        onChange={(e) => setCreateForm({ ...createForm, rateLimitWindow: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label>Allowed IPs (comma separated)</Label>
                <Input
                  placeholder="192.168.1.1, 10.0.0.1"
                  value={createForm.allowedIPs}
                  onChange={(e) => setCreateForm({ ...createForm, allowedIPs: e.target.value })}
                  className="mt-1.5"
                />
                <p className="mt-1 text-xs text-slate-400">Leave empty to allow all IPs</p>
              </div>

              <div>
                <Label>Allowed Domains (comma separated)</Label>
                <Input
                  placeholder="example.com, api.example.com"
                  value={createForm.allowedDomains}
                  onChange={(e) => setCreateForm({ ...createForm, allowedDomains: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Expires In (days)</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={createForm.expiresInDays}
                  onChange={(e) => setCreateForm({ ...createForm, expiresInDays: parseInt(e.target.value) })}
                  className="mt-1.5"
                />
                <p className="mt-1 text-xs text-slate-400">Set to 0 for no expiration</p>
              </div>
            </div>
          )}

          <DialogFooter>
            {newKeySecret ? (
              <Button
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setNewKeyValue(null)
                  setNewKeySecret(null)
                }}
                className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
              >
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-slate-300 text-slate-600 hover:bg-slate-50">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateKey}
                  className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                >
                  <Key className="h-4 w-4" />
                  Generate Key
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Key Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                <Key className="h-4 w-4 text-white" />
              </div>
              API Key Details
            </DialogTitle>
          </DialogHeader>
          {selectedKey && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">Key Name</p>
                  <p className="font-semibold text-slate-800">{selectedKey.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <APIKeyStatusBadge status={selectedKey.status} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">API Key</p>
                  <code className="rounded bg-white px-2 py-1 text-xs text-slate-700">
                    {selectedKey.key}
                  </code>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Created</p>
                  <p className="text-sm text-slate-700">{format(new Date(selectedKey.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Created By</p>
                  <p className="text-sm text-slate-700">{selectedKey.createdBy?.name || 'System'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Last Used</p>
                  <p className="text-sm text-slate-700">{selectedKey.lastUsedAt ? format(new Date(selectedKey.lastUsedAt), 'dd MMM yyyy') : 'Never'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Usage</p>
                  <p className="text-sm text-slate-700">{selectedKey.usageCount.toLocaleString()} requests</p>
                </div>
                {selectedKey.expiresAt && (
                  <div>
                    <p className="text-xs text-slate-400">Expires At</p>
                    <p className="text-sm text-slate-700">{format(new Date(selectedKey.expiresAt), 'dd MMM yyyy')}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {selectedKey.permissions.map((perm) => (
                    <Badge key={perm} className="border-0 bg-blue-50 text-blue-600">{perm}</Badge>
                  ))}
                </div>
              </div>

              {selectedKey.allowedIPs.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Allowed IPs</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedKey.allowedIPs.map((ip) => (
                      <Badge key={ip} variant="outline" className="border-slate-200 text-slate-600">{ip}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedKey.allowedDomains.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Allowed Domains</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedKey.allowedDomains.map((domain) => (
                      <Badge key={domain} variant="outline" className="border-slate-200 text-slate-600">{domain}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedKey.rateLimit.enabled && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Rate Limit</p>
                  <p className="text-sm text-slate-600">{selectedKey.rateLimit.limit} requests per {selectedKey.rateLimit.window} seconds</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)} className="border-slate-300 text-slate-600 hover:bg-slate-50">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Key Dialog */}
      <Dialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-red-500">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
              Revoke API Key
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this API key? This action cannot be undone.
              Any applications using this key will lose access immediately.
            </DialogDescription>
          </DialogHeader>
          {selectedKey && (
            <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3.5">
              <p className="text-sm font-semibold text-slate-800">{selectedKey.name}</p>
              <code className="text-xs text-slate-500">{selectedKey.key}</code>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRevokeDialogOpen(false)} className="border-slate-300 text-slate-600 hover:bg-slate-50">
              Cancel
            </Button>
            <Button
              onClick={handleRevokeKey}
              className="gap-2 border-0 bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}