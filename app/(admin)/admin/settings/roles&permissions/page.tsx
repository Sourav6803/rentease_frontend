// src/app/admin/settings/roles-permissions/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Shield,
  Users,
  Key,
  Edit,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  ChevronRight,
  UserCog,
  DollarSign,
  Package,
  Settings,
  FileText,
  TrendingUp,
  ShieldCheck,
  Loader2,
  Briefcase,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import axios from 'axios'
import { cn } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const roleConfig: Record<string, { label: string; color: string; bg: string; ring: string; icon: any; description: string }> = {
  super_admin: { label: 'Super Admin', color: 'text-purple-700', bg: 'bg-purple-100', ring: 'ring-purple-200', icon: Shield, description: 'Full system access with all permissions' },
  admin: { label: 'Admin', color: 'text-blue-700', bg: 'bg-blue-100', ring: 'ring-blue-200', icon: UserCog, description: 'General administrator with broad access' },
  operations_manager: { label: 'Operations Manager', color: 'text-green-700', bg: 'bg-green-100', ring: 'ring-green-200', icon: Briefcase, description: 'Manages day-to-day operations' },
  support_manager: { label: 'Support Manager', color: 'text-amber-700', bg: 'bg-amber-100', ring: 'ring-amber-200', icon: Users, description: 'Manages customer support tickets' },
  finance_manager: { label: 'Finance Manager', color: 'text-emerald-700', bg: 'bg-emerald-100', ring: 'ring-emerald-200', icon: DollarSign, description: 'Manages payments, payouts, and financial reports' },
  vendor_manager: { label: 'Vendor Manager', color: 'text-orange-700', bg: 'bg-orange-100', ring: 'ring-orange-200', icon: Users, description: 'Manages vendor applications and onboarding' },
  inventory_manager: { label: 'Inventory Manager', color: 'text-cyan-700', bg: 'bg-cyan-100', ring: 'ring-cyan-200', icon: Package, description: 'Manages product inventory and stock' },
  content_manager: { label: 'Content Manager', color: 'text-pink-700', bg: 'bg-pink-100', ring: 'ring-pink-200', icon: FileText, description: 'Manages website content, categories, and pages' },
  analytics_viewer: { label: 'Analytics Viewer', color: 'text-indigo-700', bg: 'bg-indigo-100', ring: 'ring-indigo-200', icon: TrendingUp, description: 'Read-only access to analytics and reports' },
  auditor: { label: 'Auditor', color: 'text-slate-700', bg: 'bg-slate-100', ring: 'ring-slate-200', icon: ShieldCheck, description: 'Audit logs and compliance monitoring' }
}

const permissionCategories = [
  { id: 'users', label: 'Users', icon: Users, description: 'Manage user accounts and KYC' },
  { id: 'vendors', label: 'Vendors', icon: Users, description: 'Manage vendor applications and approvals' },
  { id: 'products', label: 'Products', icon: Package, description: 'Manage product listings and approvals' },
  { id: 'rentals', label: 'Rentals', icon: Settings, description: 'Manage rental orders and disputes' },
  { id: 'payments', label: 'Payments', icon: DollarSign, description: 'Manage payments, refunds, and payouts' },
  { id: 'inventory', label: 'Inventory', icon: Package, description: 'Manage product inventory' },
  { id: 'maintenance', label: 'Maintenance', icon: Settings, description: 'Manage maintenance requests' },
  { id: 'discounts', label: 'Discounts', icon: FileText, description: 'Manage promotional discounts' },
  { id: 'content', label: 'Content', icon: FileText, description: 'Manage website content' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'View analytics and reports' },
  { id: 'admins', label: 'Admins', icon: Shield, description: 'Manage admin accounts' },
  { id: 'system', label: 'System', icon: Settings, description: 'System configuration and logs' },
]

const permissionActions = [
  { id: 'view', label: 'View', description: 'View resource' },
  { id: 'create', label: 'Create', description: 'Create new resource' },
  { id: 'edit', label: 'Edit', description: 'Edit existing resource' },
  { id: 'delete', label: 'Delete', description: 'Delete resource' },
  { id: 'approve', label: 'Approve', description: 'Approve resource' },
  { id: 'block', label: 'Block', description: 'Block users/vendors' },
  { id: 'suspend', label: 'Suspend', description: 'Suspend vendors' },
  { id: 'manage', label: 'Manage', description: 'Manage resource' },
  { id: 'refund', label: 'Refund', description: 'Process refunds' },
  { id: 'export', label: 'Export', description: 'Export data' },
]

export default function RolesPermissionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [roles, setRoles] = useState<any[]>([])
  const [admins, setAdmins] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false)
  const [isCustomPermissionsOpen, setIsCustomPermissionsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [assignRoleData, setAssignRoleData] = useState({ adminId: '', role: '' })
  const [customPermissions, setCustomPermissions] = useState<any>({})
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/roles`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        const rolesData = Array.isArray(response.data.data) ? response.data.data : []
        setRoles(rolesData)
        // Bug fix: previously read `selectedRole` from the outer closure and listed it
        // as a useCallback dependency just for this check — meaning fetchRoles got a
        // new identity (and the effect below re-ran, re-fetching everything) on every
        // single role click. A functional update removes the need for that dependency.
        setSelectedRole(prev => prev || rolesData[0]?.id || '')
      }
    } catch (error: any) {
      console.error('Error fetching roles:', error)
      setFetchError(error.response?.data?.message || 'Failed to load roles')
      toast.error(error.response?.data?.message || 'Failed to load roles')
    }
  }, [session])

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/admin/roles/admins`, {
        params: {
          page: 1,
          limit: 100,
          search: searchQuery || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          status: undefined
        },
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        setAdmins(response.data.data.admins || [])
      }
    } catch (error: any) {
      console.error('Error fetching admins:', error)
      setFetchError(error.response?.data?.message || 'Failed to load admins')
      toast.error(error.response?.data?.message || 'Failed to load admins')
    } finally {
      setIsLoading(false)
    }
  }, [session, searchQuery, roleFilter])

  const handleAssignRole = async () => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/api/v1/admin/roles/admins/${assignRoleData.adminId}/role`,
        { role: assignRoleData.role },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      )
      if (response.data.success) {
        toast.success('Role assigned successfully')
        setIsAssignRoleOpen(false)
        fetchAdmins()
      }
    } catch (error: any) {
      console.error('Error assigning role:', error)
      toast.error(error.response?.data?.message || 'Failed to assign role')
    }
  }

  const handleUpdatePermissions = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/v1/admin/roles/admins/${selectedAdmin?._id}/permissions`,
        { permissions: customPermissions },
        { headers: { Authorization: `Bearer ${session?.user?.accessToken}` } }
      )
      if (response.data.success) {
        toast.success('Permissions updated successfully')
        setIsCustomPermissionsOpen(false)
        fetchAdmins()
      }
    } catch (error: any) {
      console.error('Error updating permissions:', error)
      toast.error(error.response?.data?.message || 'Failed to update permissions')
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    if (status === 'authenticated') {
      fetchRoles()
      fetchAdmins()
    }
  }, [status, router, fetchRoles, fetchAdmins])

  const selectedRoleData = roles.find(r => r.id === selectedRole)
  const roleConf = roleConfig[selectedRole] || roleConfig.admin

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-xl" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-blue-600" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading roles & permissions…</p>
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

        <div className="relative flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Roles & Permissions</h2>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-0.5 text-sm text-slate-600">
              Manage administrator roles and access permissions
            </p>
          </div>
        </div>
      </div>

      {fetchError && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">Error loading data</p>
              <p className="text-sm text-red-700">{fetchError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRoles}
              className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 p-1">
          <TabsTrigger
            value="roles"
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger
            value="admins"
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <Users className="h-4 w-4" />
            Administrators
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Roles List */}
            <Card className="overflow-hidden border-slate-200 shadow-sm lg:col-span-1">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardHeader className="px-5 pb-3 pt-4 sm:px-6">
                <CardTitle className="text-base text-slate-900 sm:text-lg">Roles</CardTitle>
                <CardDescription>
                  {roles.length} role{roles.length !== 1 ? 's' : ''} available
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-4">
                <div className="space-y-1.5">
                  {roles.map((role) => {
                    const config = roleConfig[role.id] || roleConfig.admin
                    const Icon = config.icon
                    const isSelected = selectedRole === role.id
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                          isSelected ? cn('border-transparent ring-2', config.bg, config.ring) : 'border-transparent hover:bg-slate-50'
                        )}
                      >
                        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', config.bg)}>
                          <Icon className={cn('h-4 w-4', config.color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800">{config.label}</p>
                          <p className="line-clamp-1 text-xs text-slate-500">
                            {role.description}
                          </p>
                        </div>
                        {isSelected && (
                          <ChevronRight className={cn('h-4 w-4 shrink-0', config.color)} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Role Details */}
            <Card className="overflow-hidden border-slate-200 shadow-sm lg:col-span-2">
              <div className={cn('h-1 bg-gradient-to-r', roleConf.color.includes('purple') ? 'from-purple-500 to-fuchsia-500' : 'from-blue-500 to-indigo-500')} />
              <CardHeader className="px-5 pb-3 pt-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', roleConf.bg)}>
                    <Shield className={cn('h-5 w-5', roleConf.color)} />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">{roleConf.label}</CardTitle>
                    <CardDescription>{selectedRoleData?.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 sm:px-6">
                <Tabs defaultValue="permissions" className="w-full">
                  <TabsList className="mb-4 bg-slate-100 p-1">
                    <TabsTrigger value="permissions" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Permissions</TabsTrigger>
                    <TabsTrigger value="description" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Description</TabsTrigger>
                  </TabsList>
                  <TabsContent value="permissions">
                    <div className="space-y-4">
                      {selectedRoleData?.permissions && Object.entries(selectedRoleData.permissions).map(([category, perms]) => {
                        const categoryConfig = permissionCategories.find(c => c.id === category)
                        if (!categoryConfig) return null

                        const Icon = categoryConfig.icon
                        const permEntries = Object.entries(perms as Record<string, boolean>)
                        const hasPermissions = permEntries.some(([, v]) => v === true)
                        if (!hasPermissions) return null

                        return (
                          <div key={category} className="rounded-xl border border-slate-200 p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50">
                                <Icon className="h-3.5 w-3.5 text-blue-500" />
                              </div>
                              <h4 className="font-semibold text-slate-800">{categoryConfig.label}</h4>
                              <span className="text-xs text-slate-400">
                                {categoryConfig.description}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {permEntries.map(([action, enabled]) => {
                                if (!enabled) return null
                                const actionConfig = permissionActions.find(a => a.id === action)
                                return (
                                  <Badge key={action} className="gap-1 border-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                                    <CheckCircle className="h-3 w-3" />
                                    {actionConfig?.label || action}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                      {!selectedRoleData?.permissions && (
                        <div className="py-12 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                            <Key className="h-8 w-8 text-blue-300" />
                          </div>
                          <p className="text-sm text-slate-500">No permissions configured for this role</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="description">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                      <h4 className="mb-2 font-semibold text-slate-800">Role Overview</h4>
                      <p className="text-sm text-slate-600">{selectedRoleData?.description}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Admins Tab */}
        <TabsContent value="admins" className="mt-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader className="px-5 pb-3 pt-4 sm:px-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-base text-slate-900 sm:text-lg">Administrators</CardTitle>
                  <CardDescription>Manage admin roles and permissions</CardDescription>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
                    <Input
                      placeholder="Search admins..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setRoleFilter('all')
                      }}
                      className="w-full pl-9 sm:w-64"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {Object.entries(roleConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={fetchAdmins}
                    className="gap-2 border-violet-200 text-violet-700 hover:bg-violet-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6">
              {admins.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50">
                    <Users className="h-8 w-8 text-violet-300" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-slate-800">No admins found</h3>
                  <p className="text-sm text-slate-500">
                    {searchQuery ? 'Try adjusting your search' : 'Create a new admin to get started'}
                  </p>
                </div>
              ) : (
                // overflow-x-auto scoped to the table only, so a wide table scrolls
                // sideways inside this box instead of widening the whole page.
                <div className="-mx-1 overflow-x-auto px-1">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => {
                        const config = roleConfig[admin.role] || roleConfig.admin
                        const Icon = config.icon
                        return (
                          <tr key={admin._id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 ring-2 ring-violet-50">
                                  <AvatarImage src={admin.profile?.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-xs font-semibold text-white">
                                    {admin.profile?.firstName?.[0]}{admin.profile?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {admin.profile?.firstName} {admin.profile?.lastName}
                                  </p>
                                  <p className="text-xs text-slate-400">{admin.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1', config.bg, config.color, config.ring)}>
                                <Icon className="h-3 w-3" />
                                {config.label}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {admin.status?.isActive ? (
                                <Badge className="gap-1 border-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
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
                              <div className="flex items-center gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                        onClick={() => {
                                          setSelectedAdmin(admin)
                                          setAssignRoleData({ adminId: admin._id, role: admin.role })
                                          setIsAssignRoleOpen(true)
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Change Role</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                                        onClick={() => {
                                          setSelectedAdmin(admin)
                                          setCustomPermissions(admin.permissions || {})
                                          setIsCustomPermissionsOpen(true)
                                        }}
                                        disabled={admin.role === 'super_admin'}
                                      >
                                        <Key className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Custom Permissions</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Role Modal */}
      <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                <UserCog className="h-4 w-4 text-white" />
              </div>
              Change Administrator Role
            </DialogTitle>
            <DialogDescription>
              Assign a new role to {selectedAdmin?.profile?.firstName} {selectedAdmin?.profile?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Select Role</Label>
              <Select
                value={assignRoleData.role}
                onValueChange={(v) => setAssignRoleData({ ...assignRoleData, role: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleConfig).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn('h-4 w-4', config.color)} />
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            {assignRoleData.role && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
                <p className="mb-1 text-sm font-semibold text-slate-800">Role Description</p>
                <p className="text-xs text-slate-500">
                  {roleConfig[assignRoleData.role]?.description}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignRoleOpen(false)} className="border-slate-300 text-slate-600 hover:bg-slate-50">
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              className="gap-2 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Permissions Modal */}
      <Dialog open={isCustomPermissionsOpen} onOpenChange={setIsCustomPermissionsOpen}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                <Key className="h-4 w-4 text-white" />
              </div>
              Custom Permissions
            </DialogTitle>
            <DialogDescription>
              Configure custom permissions for {selectedAdmin?.profile?.firstName} {selectedAdmin?.profile?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {permissionCategories.map((category) => {
              const Icon = category.icon
              const perms = customPermissions[category.id] || {}

              return (
                <div key={category.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-50">
                      <Icon className="h-3.5 w-3.5 text-violet-500" />
                    </div>
                    <h4 className="font-semibold text-slate-800">{category.label}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3">
                    {permissionActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50">
                        <Label className="mb-0 text-sm text-slate-600">{action.label}</Label>
                        <Switch
                          checked={perms[action.id] || false}
                          onCheckedChange={(checked) => {
                            setCustomPermissions({
                              ...customPermissions,
                              [category.id]: {
                                ...perms,
                                [action.id]: checked
                              }
                            })
                          }}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-600 data-[state=checked]:to-purple-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomPermissionsOpen(false)} className="border-slate-300 text-slate-600 hover:bg-slate-50">
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePermissions}
              className="gap-2 border-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
            >
              <Save className="h-4 w-4" />
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}