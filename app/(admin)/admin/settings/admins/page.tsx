// src/app/admin/settings/admins/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Shield,
  UserCog,
  Briefcase,
  BarChart3,
  Monitor,
  FileText,
  TrendingUp,
  FileSearch,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Activity,
  Sparkles,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import axios from 'axios'
import { cn } from '@/lib/utils'
import { CreateAdminModal } from '@/components/admin/modals/CreateAdminDialog'
import { EditAdminModal } from '@/components/admin/modals/EditAdminModal'
import { AdminDetailsModal } from '@/components/admin/modals/AdminDetailsModal'
import { DeleteAdminDialog } from '@/components/admin/modals/DeleteAdminDialog'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
const SEARCH_DEBOUNCE_MS = 400

const roleConfig: Record<string, { label: string; color: string; bg: string; ring: string; icon: any }> = {
  super_admin: { label: 'Super Admin', color: 'text-purple-700', bg: 'bg-purple-100', ring: 'ring-purple-200', icon: Shield },
  admin: { label: 'Admin', color: 'text-blue-700', bg: 'bg-blue-100', ring: 'ring-blue-200', icon: UserCog },
  operations_manager: { label: 'Operations Manager', color: 'text-green-700', bg: 'bg-green-100', ring: 'ring-green-200', icon: Briefcase },
  support_manager: { label: 'Support Manager', color: 'text-amber-700', bg: 'bg-amber-100', ring: 'ring-amber-200', icon: Users },
  finance_manager: { label: 'Finance Manager', color: 'text-emerald-700', bg: 'bg-emerald-100', ring: 'ring-emerald-200', icon: BarChart3 },
  vendor_manager: { label: 'Vendor Manager', color: 'text-orange-700', bg: 'bg-orange-100', ring: 'ring-orange-200', icon: Briefcase },
  inventory_manager: { label: 'Inventory Manager', color: 'text-cyan-700', bg: 'bg-cyan-100', ring: 'ring-cyan-200', icon: Monitor },
  content_manager: { label: 'Content Manager', color: 'text-pink-700', bg: 'bg-pink-100', ring: 'ring-pink-200', icon: FileText },
  analytics_viewer: { label: 'Analytics Viewer', color: 'text-indigo-700', bg: 'bg-indigo-100', ring: 'ring-indigo-200', icon: TrendingUp },
  auditor: { label: 'Auditor', color: 'text-slate-700', bg: 'bg-slate-100', ring: 'ring-slate-200', icon: FileSearch }
}

export default function AdminsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [admins, setAdmins] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/admins`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchQuery || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        },
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        setAdmins(response.data.data.admins)
        setTotalPages(response.data.data.pagination.pages)
      }
    } catch (error: any) {
      console.error('Error fetching admins:', error)
      setFetchError(error.response?.data?.message || 'Failed to load admins')
      toast.error(error.response?.data?.message || 'Failed to load admins')
    } finally {
      setIsLoading(false)
    }
  }, [session, currentPage, roleFilter, statusFilter, searchQuery])

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/admins/stats`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error)
    }
  }, [session])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router, fetchStats])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAdmins()
    }
  }, [status, fetchAdmins])

  // Debounced search — was previously declared (searchTimerRef) but never wired up,
  // so every keystroke hit the API directly. Now search only fires 400ms after typing stops.
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setSearchQuery(searchInput)
      setCurrentPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [searchInput])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/v1/admin/admins/${adminId}`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        toast.success('Admin deleted successfully')
        fetchAdmins()
        fetchStats()
      }
    } catch (error: any) {
      console.error('Error deleting admin:', error)
      toast.error(error.response?.data?.message || 'Failed to delete admin')
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const statsCards = [
    { label: 'Total Admins', value: stats?.total || 0, icon: Users, grad: 'from-blue-500 to-indigo-500', tint: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Active Admins', value: stats?.active || 0, icon: CheckCircle, grad: 'from-emerald-500 to-teal-500', tint: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Inactive Admins', value: stats?.inactive || 0, icon: XCircle, grad: 'from-rose-500 to-red-500', tint: 'bg-rose-50', text: 'text-rose-600' },
    { label: 'Active Sessions', value: stats?.activeSessions || 0, icon: Activity, grad: 'from-violet-500 to-purple-500', tint: 'bg-violet-50', text: 'text-violet-600' },
  ]

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-xl" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-blue-600" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading administrators…</p>
      </div>
    )
  }

  return (
    // No h-screen / no vertical overflow set here — the admin <main> shell is the
    // only element that should own a scrollbar. overflow-x-hidden guards against
    // the gradient blobs / wide table pushing width and creating a second bar.
    <div className="w-full max-w-full space-y-6 px-1 pb-2 sm:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Admin Management</h2>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                Manage administrators, roles, and permissions
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add New Admin
          </Button>
        </div>
      </div>

      {fetchError && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">Error loading admins</p>
              <p className="text-sm text-red-700">{fetchError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAdmins}
              className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
            >
              <Card className="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-md">
                <CardContent className="p-3.5 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm', stat.grad)}>
                      <Icon className="h-4.5 w-4.5 text-white" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{stat.value}</span>
                  </div>
                  <p className="mt-2.5 text-xs font-medium text-slate-500">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Role Distribution */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardHeader className="px-5 pb-3 pt-4 sm:px-6">
          <CardTitle className="text-base text-slate-900 sm:text-lg">Role Distribution</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6">
          {stats?.byRole?.length ? (
            <div className="flex flex-wrap gap-2.5">
              {stats.byRole.map((role: any) => {
                const config = roleConfig[role._id] || roleConfig.admin
                const Icon = config.icon
                return (
                  <div key={role._id} className={cn('flex items-center gap-2 rounded-full px-3 py-1.5 ring-1', config.bg, config.ring)}>
                    <Icon className={cn('h-3.5 w-3.5', config.color)} />
                    <span className={cn('text-xs font-semibold', config.color)}>{config.label}</span>
                    <Badge className="border-0 bg-white/70 text-xs text-slate-700">{role.count}</Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No role data available yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-4 sm:p-4.5">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchInput}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="w-full md:w-[190px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(roleConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchAdmins}
              className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <CardHeader className="px-5 pb-3 pt-4 sm:px-6">
          <CardTitle className="text-base text-slate-900 sm:text-lg">Administrators</CardTitle>
          <CardDescription>
            {admins.length} admin{admins.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6">
          {admins.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <Users className="h-8 w-8 text-blue-300" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-slate-800">No admins found</h3>
              <p className="text-sm text-slate-500">
                {searchInput ? 'Try adjusting your search or filters' : 'Click "Add New Admin" to create one'}
              </p>
            </div>
          ) : (
            // overflow-x-auto is scoped to the table only, so a wide table scrolls
            // horizontally inside this box instead of widening the whole page
            // (which is the other common cause of a second/horizontal scrollbar).
            <div className="-mx-1 overflow-x-auto px-1">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Last Active</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin, idx) => {
                    const roleConf = roleConfig[admin.role] || roleConfig.admin
                    const RoleIcon = roleConf.icon
                    const isCurrentUser = admin.user?._id === session?.user?.id

                    return (
                      <motion.tr
                        key={admin._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.25 }}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 ring-2 ring-blue-50">
                              <AvatarImage src={admin.profile?.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-semibold text-white">
                                {getInitials(admin.profile?.firstName, admin.profile?.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {admin.profile?.firstName} {admin.profile?.lastName}
                              </p>
                              <p className="text-xs text-slate-400">
                                {admin.profile?.designation || 'No designation'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1', roleConf.bg, roleConf.color, roleConf.ring)}>
                            <RoleIcon className="h-3 w-3" />
                            {roleConf.label}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <p className="text-xs text-slate-700">{admin.email}</p>
                            <p className="text-xs text-slate-400">{admin.phone || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {admin.status?.isActive ? (
                            <Badge className="gap-1 border-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 border-rose-200 bg-rose-50 text-rose-600">
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500">
                            {admin.access?.lastLogin
                              ? new Date(admin.access.lastLogin).toLocaleDateString()
                              : 'Never'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-blue-50 hover:text-blue-600">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedAdmin(admin)
                                setIsDetailsModalOpen(true)
                              }}>
                                <Eye className="mr-2 h-4 w-4 text-blue-500" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAdmin(admin)
                                  setIsEditModalOpen(true)
                                }}
                                disabled={isCurrentUser}
                              >
                                <Edit className="mr-2 h-4 w-4 text-amber-500" />
                                Edit Admin
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAdmin(admin)
                                  setIsDeleteDialogOpen(true)
                                }}
                                disabled={isCurrentUser}
                                className="text-rose-600 focus:text-rose-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Admin
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    )
                  })}
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

      {/* Modals */}
      <CreateAdminModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchAdmins()
          fetchStats()
        }}
      />
      <EditAdminModal
        open={isEditModalOpen}
        admin={selectedAdmin}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedAdmin(null)
        }}
        onSuccess={() => {
          fetchAdmins()
          fetchStats()
        }}
      />
      <AdminDetailsModal
        open={isDetailsModalOpen}
        admin={selectedAdmin}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedAdmin(null)
        }}
      />
      <DeleteAdminDialog
        open={isDeleteDialogOpen}
        admin={selectedAdmin}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedAdmin(null)
        }}
        onConfirm={() => {
          if (selectedAdmin) {
            handleDeleteAdmin(selectedAdmin._id)
          }
          setIsDeleteDialogOpen(false)
          setSelectedAdmin(null)
        }}
      />
    </div>
  )
}