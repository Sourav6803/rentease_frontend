'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import {
  TicketPercent,
  Percent,
  TrendingUp,
  IndianRupee,
  RefreshCw,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  History,
  Power,
  Trash2,
  Download,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import {
  getCouponAnalytics,
  discountApi,
  formatCompactINR,
  formatINR,
} from '@/lib/api/admin-intelligence'
import {
  IntelligencePageShell,
  KpiGrid,
  PeriodSelector,
  DateRangePicker,
  ChartCard,
  DataTable,
  ExportButton,
  StatusBadge,
  DiscountFormSheet,
  DiscountUsageSheet,
} from '@/components/admin/intelligence'
import type { DataTableColumn } from '@/components/admin/intelligence'
import type {
  KpiCardItem,
  Discount,
  DiscountListResponse,
} from '@/types/admin-intelligence.types'
import { useIntelligencePeriod } from '@/hooks/useIntelligencePeriod'
import { chartDayLabel } from '@/lib/intelligence/product-helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

const TYPE_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#d97706', '#059669', '#0891b2']

const STATIC_ANALYTICS = {
  overview: [{ totalDiscounts: 48, activeDiscounts: 22, totalUsage: 3840, totalDiscountAmount: 1240000 }],
  byType: [
    { _id: 'percentage', count: 18, usage: 2100 },
    { _id: 'fixed', count: 12, usage: 980 },
    { _id: 'cashback', count: 8, usage: 420 },
    { _id: 'festival', count: 6, usage: 340 },
  ],
  topDiscounts: [
    { code: 'WELCOME20', name: 'Welcome 20% Off', usageCount: 842, totalSavings: 420000 },
    { code: 'FESTIVAL500', name: 'Festival Flat ₹500', usageCount: 612, totalSavings: 306000 },
    { code: 'FIRSTRENT', name: 'First Rental Bonus', usageCount: 488, totalSavings: 244000 },
  ],
  usageByDay: [
    { _id: { day: 1, month: 6 }, usage: 42, savings: 18000 },
    { _id: { day: 5, month: 6 }, usage: 58, savings: 24000 },
    { _id: { day: 10, month: 6 }, usage: 71, savings: 31000 },
    { _id: { day: 15, month: 6 }, usage: 65, savings: 28000 },
    { _id: { day: 20, month: 6 }, usage: 89, savings: 42000 },
  ],
  redemptionRate: [{ rate: 12.4 }],
}

const STATIC_DISCOUNTS: DiscountListResponse = {
  discounts: [
    {
      _id: '1', code: 'WELCOME20', name: 'Welcome 20% Off', type: 'percentage', value: 20,
      status: 'active', usageCount: 842, priority: 10,
      validity: { startDate: '2026-06-01T00:00:00Z', endDate: '2026-12-31T00:00:00Z' },
    },
    {
      _id: '2', code: 'FESTIVAL500', name: 'Festival Flat ₹500', type: 'fixed', value: 500,
      status: 'active', usageCount: 612, priority: 5,
      validity: { startDate: '2026-06-01T00:00:00Z', endDate: '2026-09-30T00:00:00Z' },
    },
    {
      _id: '3', code: 'BDAY100', name: 'Birthday Special', type: 'birthday', value: 100,
      status: 'expired', usageCount: 210, priority: 0,
      validity: { startDate: '2026-01-01T00:00:00Z', endDate: '2026-05-31T00:00:00Z' },
    },
  ],
  pagination: { page: 1, limit: 20, total: 3, pages: 1 },
}

const STATUS_FILTERS = ['all', 'active', 'inactive', 'expired', 'exhausted', 'disabled']
const TYPE_FILTERS = [
  'all', 'percentage', 'fixed', 'cashback', 'free_delivery', 'no_deposit',
  'referral', 'festival', 'birthday', 'first_rental', 'return_customer',
]

const PAGE_SIZE = 20

function formatDateShort(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

export default function IntelligenceCouponsPage() {
  const { period, setPeriod, customRange, setCustomRange, params, isCustom } = useIntelligencePeriod('30d')
  const queryClient = useQueryClient()

  // ---- management state ----
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Discount | null>(null)
  const [usageFor, setUsageFor] = useState<Discount | null>(null)
  const [usageOpen, setUsageOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null)

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      type: typeFilter === 'all' ? undefined : typeFilter,
    }),
    [page, search, statusFilter, typeFilter],
  )

  const analyticsQ = useQuery({
    queryKey: ['ai', 'coupons', 'analytics', params],
    queryFn: () => getCouponAnalytics(params),
    staleTime: 60_000,
  })

  const listQ = useQuery({
    queryKey: ['ai', 'coupons', 'list', listParams],
    queryFn: () => discountApi.list(listParams),
    staleTime: 30_000,
  })

  const expiringQ = useQuery({
    queryKey: ['ai', 'coupons', 'expiring'],
    queryFn: () => discountApi.expiring(7),
    staleTime: 300_000,
  })

  const demoMode = analyticsQ.isError
  const analytics = demoMode ? STATIC_ANALYTICS : (analyticsQ.data ?? STATIC_ANALYTICS)
  const overview = analytics.overview?.[0] ?? STATIC_ANALYTICS.overview[0]
  const redemption = (analytics as { redemptionRate?: { rate: number }[] }).redemptionRate?.[0]?.rate ?? 0

  const listData = listQ.isError ? STATIC_DISCOUNTS : (listQ.data ?? STATIC_DISCOUNTS)

  // ---- mutations ----
  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      discountApi.toggleStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['ai', 'coupons'] })
    },
    onError: (e: unknown) =>
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update status'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => discountApi.remove(id),
    onSuccess: () => {
      toast.success('Coupon disabled')
      queryClient.invalidateQueries({ queryKey: ['ai', 'coupons'] })
      setDeleteTarget(null)
    },
    onError: (e: unknown) =>
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete coupon'),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => discountApi.deactivateExpired(),
    onSuccess: () => {
      toast.success('Expired coupons deactivated')
      queryClient.invalidateQueries({ queryKey: ['ai', 'coupons'] })
    },
    onError: () => toast.error('Failed to deactivate expired coupons'),
  })

  const [exporting, setExporting] = useState(false)
  const handleServerExport = async () => {
    setExporting(true)
    try {
      await discountApi.exportFile('csv')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  // ---- charts ----
  const usageTrend = useMemo(
    () =>
      ((analytics as { usageByDay?: Record<string, unknown>[] }).usageByDay ?? []).map((d) => ({
        label: chartDayLabel(d),
        usage: Number(d.usage ?? 0),
        savings: Number(d.savings ?? 0),
      })),
    [analytics],
  )

  const typeData = useMemo(
    () =>
      (analytics.byType ?? []).map((t) => ({
        name: String(t._id ?? 'other'),
        value: Number(t.usage ?? t.count ?? 0),
      })),
    [analytics],
  )

  const kpiItems: KpiCardItem[] = [
    { key: 'total', title: 'Total Coupons', value: overview.totalDiscounts ?? 0, icon: TicketPercent, accent: '#2563eb', loading: analyticsQ.isLoading },
    { key: 'active', title: 'Active Coupons', value: overview.activeDiscounts ?? 0, icon: Percent, accent: '#059669', loading: analyticsQ.isLoading },
    { key: 'usage', title: 'Total Redemptions', value: (overview.totalUsage ?? 0).toLocaleString('en-IN'), icon: TrendingUp, accent: '#7c3aed', loading: analyticsQ.isLoading },
    { key: 'savings', title: 'Total Savings', value: formatCompactINR(overview.totalDiscountAmount ?? 0), icon: IndianRupee, accent: '#d97706', loading: analyticsQ.isLoading },
    { key: 'rate', title: 'Redemption Rate', value: `${Number(redemption).toFixed(1)}%`, icon: TrendingUp, accent: '#0891b2', loading: analyticsQ.isLoading },
  ]

  const topColumns: DataTableColumn<Record<string, unknown>>[] = [
    { key: 'code', header: 'Code', sortable: true, accessor: (r) => String(r.code ?? '') },
    { key: 'name', header: 'Name', sortable: true, accessor: (r) => String(r.name ?? '') },
    { key: 'usageCount', header: 'Uses', sortable: true, accessor: (r) => Number(r.usageCount ?? 0) },
    { key: 'totalSavings', header: 'Total Savings', sortable: true, render: (r) => formatINR(Number(r.totalSavings ?? 0)) },
  ]

  const listColumns: DataTableColumn<Discount>[] = [
    { key: 'code', header: 'Code', sortable: true, render: (r) => <span className="font-mono text-xs font-semibold text-slate-800">{r.code}</span> },
    { key: 'name', header: 'Name', sortable: true, accessor: (r) => r.name },
    { key: 'type', header: 'Type', sortable: true, render: (r) => <span className="capitalize text-slate-600">{r.type.replace(/_/g, ' ')}</span> },
    {
      key: 'value',
      header: 'Value',
      render: (r) =>
        r.type === 'percentage' ? `${r.value ?? 0}%` : ['fixed', 'cashback'].includes(r.type) ? formatINR(r.value ?? 0) : '—',
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'usageCount', header: 'Uses', sortable: true, accessor: (r) => r.usageCount ?? 0 },
    { key: 'validity', header: 'Valid until', render: (r) => <span className="text-xs text-slate-500">{formatDateShort(r.validity?.endDate)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'w-10 text-right',
      render: (r) => <RowActions row={r} />,
    },
  ]

  function RowActions({ row }: { row: Discount }) {
    const isDemo = listQ.isError
    const canActivate = row.status !== 'active'
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Row actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={() => { setEditing(row); setFormOpen(true) }}
            disabled={isDemo}
          >
            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => { setUsageFor(row); setUsageOpen(true) }}
            disabled={isDemo}
          >
            <History className="mr-2 h-3.5 w-3.5" /> Usage history
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toggleMutation.mutate({ id: row._id, status: canActivate ? 'active' : 'inactive' })}
            disabled={isDemo || toggleMutation.isPending}
          >
            <Power className="mr-2 h-3.5 w-3.5" />
            {canActivate ? 'Activate' : 'Deactivate'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setDeleteTarget(row)}
            disabled={isDemo}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const exportRows = listData.discounts.map((d) => ({
    code: d.code,
    name: d.name,
    type: d.type,
    status: d.status,
    usage: d.usageCount ?? 0,
  }))

  const pagination = listData.pagination

  return (
    <IntelligencePageShell
      title="Coupons & Offers"
      subtitle="Discount performance, redemption trends & promotion management"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: 'Coupons' },
      ]}
      demoMode={demoMode}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <PeriodSelector value={period} onChange={setPeriod} />
          {isCustom && <DateRangePicker value={customRange} onChange={setCustomRange} />}
          <ExportButton filename="coupons-export.csv" rows={exportRows} columns={['code', 'name', 'type', 'status', 'usage']} />
          <button
            type="button"
            onClick={() => { analyticsQ.refetch(); listQ.refetch(); expiringQ.refetch() }}
            disabled={analyticsQ.isFetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${analyticsQ.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => { setEditing(null); setFormOpen(true) }}
          >
            <Plus className="h-4 w-4" /> New Coupon
          </Button>
        </div>
      }
    >
      {/* Expiring alert */}
      {!!expiringQ.data && expiringQ.data > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1 text-sm text-amber-800">
            <span className="font-semibold">{expiringQ.data}</span> coupon
            {expiringQ.data === 1 ? '' : 's'} expiring within 7 days.
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 bg-white text-amber-700 hover:bg-amber-100"
            onClick={() => deactivateMutation.mutate()}
            disabled={deactivateMutation.isPending}
          >
            {deactivateMutation.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Deactivate expired
          </Button>
        </div>
      )}

      <KpiGrid items={kpiItems} columns={4} className="mb-8" />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Usage Trend" description="Daily coupon redemptions" loading={analyticsQ.isLoading} empty={!usageTrend.length}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={usageTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="usage" stroke="#2563eb" strokeWidth={2} dot={false} name="Redemptions" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By Coupon Type" description="Usage distribution" loading={analyticsQ.isLoading} empty={!typeData.length}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {typeData.map((_, i) => (
                  <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Top Performing Coupons</h2>
        <DataTable
          columns={topColumns}
          data={(analytics as { topDiscounts?: Record<string, unknown>[] }).topDiscounts ?? []}
          loading={analyticsQ.isLoading}
          searchable={false}
          pageSize={5}
        />
      </div>

      {/* Management section */}
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Manage Coupons</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search code or name…"
                className="h-8 w-52 pl-8 text-xs"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize text-xs">{s === 'all' ? 'All statuses' : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {TYPE_FILTERS.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize text-xs">{t === 'all' ? 'All types' : t.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleServerExport} disabled={exporting}>
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              CSV
            </Button>
          </div>
        </div>

        <DataTable
          columns={listColumns}
          data={listData.discounts}
          loading={listQ.isLoading}
          searchable={false}
          pageSize={PAGE_SIZE}
          getRowKey={(r) => r._id}
          emptyTitle="No coupons found"
          emptyDescription="Adjust your filters or create a new coupon."
        />

        {/* Server pagination */}
        {pagination.pages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing page {pagination.page} of {pagination.pages} · {pagination.total} total
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || listQ.isFetching} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pagination.pages || listQ.isFetching} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit sheet */}
      <DiscountFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        discount={editing}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['ai', 'coupons'] })}
      />

      {/* Usage history sheet */}
      <DiscountUsageSheet open={usageOpen} onOpenChange={setUsageOpen} discount={usageFor} />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable this coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{deleteTarget?.code}</span> will be disabled and can no
              longer be redeemed. This is a soft delete — existing redemption history is preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={(e) => { e.preventDefault(); if (deleteTarget) deleteMutation.mutate(deleteTarget._id) }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Disable coupon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </IntelligencePageShell>
  )
}
