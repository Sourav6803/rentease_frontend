
// app/vendor/dashboard/page.tsx
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Star,
  Package,
  Calendar,
  Download,
  RefreshCw,
  Truck,
  AlertTriangle,
  CreditCard,
  Wallet,
  Building2,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  ChevronRight,
  IndianRupee,
  Sparkles,
  Activity,
  BarChart3,
  UserCheck,
  Clock,
  Target,
  Zap,
  Award,
  ShieldCheck,
  Bell,
  Percent,
  Repeat,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import moment from 'moment';
import { useVendorAnalytics, VendorAnalyticsProvider } from '@/contexts/VendorAnalyticsContext';
import { Period, TopProduct, Customer } from '@/types/vendorAnalytics';
import { cn } from '@/lib/utils';

// shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

// ─── Types ──────────────────────────────────────────────────────────

interface KPI {
  label: string;
  value: string | number;
  growth?: number;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  subText?: string;
}

// ─── Helper Functions ─────────────────────────────────────────────────

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCompactCurrency = (value: number): string => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

const timeAgo = (date: string | Date): string => {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'recently';
};

// ─── Color Palette ────────────────────────────────────────────────────

const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  cyan: '#06b6d4',
  orange: '#f97316',
  teal: '#14b8a6',
  rose: '#f43f5e',
  violet: '#7c3aed',
  gray: '#6b7280',
};

const CHART_COLORS = [
  COLORS.indigo,
  COLORS.teal,
  COLORS.warning,
  COLORS.rose,
  COLORS.cyan,
  COLORS.orange,
];

// ─── KPI Card Color Configs ────────────────────────────────────────────

const KPI_CONFIGS = [
  {
    gradient: 'from-violet-600 via-purple-600 to-indigo-700',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    textColor: 'text-white',
    glow: 'shadow-violet-500/30',
  },
  {
    gradient: 'from-emerald-500 via-teal-500 to-green-600',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    textColor: 'text-white',
    glow: 'shadow-emerald-500/30',
  },
  {
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    textColor: 'text-white',
    glow: 'shadow-orange-500/30',
  },
  {
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    textColor: 'text-white',
    glow: 'shadow-pink-500/30',
  },
  {
    gradient: 'from-cyan-500 via-sky-500 to-blue-600',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    textColor: 'text-white',
    glow: 'shadow-cyan-500/30',
  },
  {
    gradient: 'from-yellow-400 via-amber-400 to-orange-400',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
    textColor: 'text-white',
    glow: 'shadow-amber-500/30',
  },
];

// ─── Tab Config ────────────────────────────────────────────────────────

const TAB_STYLES = {
  overview: {
    active: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200',
    icon: <Activity className="h-4 w-4" />,
    label: 'Overview',
  },
  sales: {
    active: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200',
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Sales',
  },
  products: {
    active: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200',
    icon: <Package className="h-4 w-4" />,
    label: 'Products',
  },
  customers: {
    active: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-200',
    icon: <Users className="h-4 w-4" />,
    label: 'Customers',
  },
};

// ─── NEW: Quick Action Items ───────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Add Product', icon: Package, color: 'violet', desc: 'List a new rental item' },
  { label: 'View Orders', icon: ShoppingBag, color: 'emerald', desc: 'Manage active rentals' },
  { label: 'Payouts', icon: Wallet, color: 'orange', desc: 'Check earnings' },
  { label: 'Promotions', icon: Percent, color: 'pink', desc: 'Create offers' },
];

const ACTION_COLOR_MAP: Record<string, { bg: string; icon: string; hover: string }> = {
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/30', icon: 'text-violet-600', hover: 'hover:border-violet-300' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: 'text-emerald-600', hover: 'hover:border-emerald-300' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', icon: 'text-orange-600', hover: 'hover:border-orange-300' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-950/30', icon: 'text-pink-600', hover: 'hover:border-pink-300' },
};

// ─── NEW: Performance Goals (static) ───────────────────────────────────

const PERFORMANCE_GOALS = [
  { label: 'Monthly Revenue Target', current: 78, color: COLORS.violet, value: '₹3.9L / ₹5L' },
  { label: 'Order Fulfillment Rate', current: 94, color: COLORS.teal, value: '94%' },
  { label: 'Customer Satisfaction', current: 88, color: COLORS.warning, value: '4.4 / 5.0' },
  { label: 'On-Time Delivery', current: 96, color: COLORS.cyan, value: '96%' },
];

// ─── Loading Skeleton ─────────────────────────────────────────────────

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-violet-400 to-indigo-400" />
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2].map(i => (
        <Card key={i}>
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ─── Custom Tooltip ────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, currency = false }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl p-3 min-w-[140px]">
        <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-gray-500">{entry.name}</span>
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {currency ? formatCompactCurrency(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── NEW: Section Header Component ─────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, subtitle, accent = 'violet' }: { icon: React.ElementType; title: string; subtitle?: string; accent?: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={cn(
      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
      accent === 'violet' && 'bg-violet-100 text-violet-600 dark:bg-violet-950/40',
      accent === 'emerald' && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40',
      accent === 'orange' && 'bg-orange-100 text-orange-600 dark:bg-orange-950/40',
    )}>
      <Icon className="h-4.5 w-4.5" />
    </div>
    <div>
      <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

// ─── Main Dashboard Component ─────────────────────────────────────────

const VendorDashboardContent: React.FC = () => {
  const {
    loading,
    period,
    setPeriod,
    overview,
    salesReport,
    productPerformance,
    customerInsights,
    error,
    fetchAllData,
    clearError,
  } = useVendorAnalytics();

  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, [period, fetchAllData]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const exportData = {
        overview,
        salesReport,
        productPerformance,
        customerInsights,
        exportedAt: new Date().toISOString(),
        period,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendor-analytics-${period}-${moment().format('YYYY-MM-DD')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  }, [overview, salesReport, productPerformance, customerInsights, period]);

  // Prepare chart data
  const dailyRevenueData = useMemo(() =>
    salesReport?.dailyRevenue?.map(d => ({ date: d._id, revenue: d.amount, orders: d.count })) || [],
    [salesReport?.dailyRevenue]
  );

  const rentalStatusData = useMemo(() =>
    overview?.rentalsByStatus?.map(s => ({ name: s._id, value: s.count })) || [],
    [overview?.rentalsByStatus]
  );

  const revenueByTypeData = useMemo(() =>
    salesReport?.revenueByType?.map(t => ({ type: t._id, amount: t.amount })) || [],
    [salesReport?.revenueByType]
  );

  const paymentMethodsData = useMemo(() =>
    salesReport?.revenueByMethod?.map(m => ({ method: m._id, amount: m.amount })) || [],
    [salesReport?.revenueByMethod]
  );

  const monthlyTrendsData = useMemo(() =>
    salesReport?.monthlyTrends?.map(m => ({ month: m._id, revenue: m.revenue })) || [],
    [salesReport?.monthlyTrends]
  );

  const topProductsData = useMemo(() =>
    [...(productPerformance?.topProducts || [])]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5),
    [productPerformance?.topProducts]
  );

  const categoryData = useMemo(() =>
    productPerformance?.categoryBreakdown?.map(c => ({ category: c._id, revenue: c.totalRevenue })) || [],
    [productPerformance?.categoryBreakdown]
  );

  const customerSegmentsData = useMemo(() => [
    { name: 'VIP', value: customerInsights?.summary?.vipCount || 0, color: COLORS.rose },
    { name: 'Frequent', value: customerInsights?.summary?.frequentCount || 0, color: COLORS.warning },
    { name: 'Regular', value: customerInsights?.segments?.regular?.length || 0, color: COLORS.indigo },
    { name: 'New', value: customerInsights?.segments?.new?.length || 0, color: COLORS.teal },
  ], [customerInsights]);

  const inventoryData = useMemo(() => {
    const inv = productPerformance?.inventoryStatus;
    return [
      { name: 'Available', value: inv?.availableInventory || 0, color: COLORS.teal },
      { name: 'Rented', value: inv?.rentedInventory || 0, color: COLORS.indigo },
      { name: 'Low Stock', value: inv?.lowStockProducts || 0, color: COLORS.warning },
      { name: 'Out of Stock', value: inv?.outOfStockProducts || 0, color: COLORS.danger },
    ];
  }, [productPerformance?.inventoryStatus]);

  const KPIS: (Omit<KPI, 'gradient' | 'iconBg' | 'iconColor' | 'textColor'> & { configIdx: number })[] = [
    {
      label: 'Total Revenue',
      value: formatCurrency(overview?.kpi?.revenue?.current || 0),
      growth: overview?.kpi?.revenue?.growth,
      icon: IndianRupee,
      configIdx: 0,
    },
    {
      label: 'Total Rentals',
      value: overview?.kpi?.rentals?.current || 0,
      growth: overview?.kpi?.rentals?.growth,
      icon: ShoppingBag,
      configIdx: 1,
    },
    {
      label: 'Active Products',
      value: overview?.kpi?.activeProducts || 0,
      icon: Package,
      configIdx: 2,
    },
    {
      label: 'Avg Order Value',
      value: formatCurrency(salesReport?.summary?.averageOrderValue || 0),
      icon: Wallet,
      configIdx: 3,
    },
    {
      label: 'Total Customers',
      value: overview?.kpi?.totalCustomers || 0,
      icon: Users,
      configIdx: 4,
    },
    {
      label: 'Avg Rating',
      value: (overview?.kpi?.averageRating || 0).toFixed(1),
      icon: Star,
      configIdx: 5,
      subText: `out of 5.0`,
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
        <Card className="max-w-md w-full border-0 shadow-2xl">
          <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-600 rounded-t-lg" />
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Dashboard
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={fetchAllData}
              className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950/20">

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 px-4 sm:px-6 py-6 sm:py-8 mb-6 sm:mb-8">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full translate-x-1/3 translate-y-1/2 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-blue-400/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />

        <div className="relative container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-white/70 text-xs sm:text-sm font-medium tracking-wide uppercase">
                  RentEase Analytics
                </span>
                <Badge className="bg-white/20 text-white border-white/30 text-xs hover:bg-white/30">
                  Vendor Dashboard
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'} 👋
              </h1>
              <p className="text-indigo-200 text-xs sm:text-sm">
                Here's your rental business performance at a glance
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
                <SelectTrigger className="w-[130px] sm:w-[140px] bg-white/10 border-white/30 text-white hover:bg-white/20 [&>span]:text-white">
                  <Calendar className="mr-2 h-4 w-4 text-white" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={exporting}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                <Download className="mr-0 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export'}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchAllData}
                className="text-white hover:bg-white/20 h-9 w-9 flex-shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* NEW: Quick highlight strip in header */}
          <div className="relative mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Zap, label: 'Today\'s Orders', value: overview?.kpi?.rentals?.current ?? '—' },
              { icon: Clock, label: 'Avg Response', value: '12 min' },
              { icon: ShieldCheck, label: 'Trust Score', value: '98%' },
              { icon: Award, label: 'Seller Tier', value: 'Gold' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15 px-3 py-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm leading-tight">{item.value}</p>
                  <p className="text-indigo-200 text-[11px] truncate">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl pb-12">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* KPI Grid */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6 sm:mb-8 -mt-4">
              {KPIS.map((kpi, idx) => {
                const cfg = KPI_CONFIGS[kpi.configIdx];
                const Icon = kpi.icon;
                return (
                  <Card
                    key={kpi.label}
                    className={cn(
                      "relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group",
                      cfg.glow
                    )}
                  >
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-100`} />
                    {/* Decorative circles */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full transition-transform duration-500 group-hover:scale-125" />
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />

                    <CardContent className="relative p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-xl ${cfg.iconBg} backdrop-blur-sm`}>
                          <Icon className={`h-5 w-5 ${cfg.iconColor}`} />
                        </div>
                        {kpi.growth !== undefined && (
                          <div className={cn(
                            "flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full",
                            kpi.growth >= 0
                              ? "bg-white/20 text-white"
                              : "bg-black/20 text-white"
                          )}>
                            {kpi.growth >= 0
                              ? <ArrowUpRight className="h-3 w-3" />
                              : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(kpi.growth).toFixed(1)}%
                          </div>
                        )}
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-white mb-0.5 tracking-tight">
                        {kpi.value}
                      </p>
                      <p className="text-[11px] sm:text-xs text-white/70 font-medium uppercase tracking-wider">
                        {kpi.label}
                      </p>
                      {kpi.subText && (
                        <p className="text-xs text-white/50 mt-0.5">{kpi.subText}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* NEW: Quick Actions Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {QUICK_ACTIONS.map((action) => {
                const c = ACTION_COLOR_MAP[action.color];
                return (
                  <button
                    key={action.label}
                    className={cn(
                      "group flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 text-left",
                      c.hover
                    )}
                  >
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", c.bg)}>
                      <action.icon className={cn("h-5 w-5", c.icon)} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{action.label}</p>
                      <p className="text-xs text-gray-400 truncate">{action.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 ml-auto flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  </button>
                );
              })}
            </div>

            {/* Custom Colorful Tabs */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">

              {/* Custom Tab Bar - now scrollable on mobile */}
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                <div className="flex gap-2 p-1.5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-max sm:w-fit">
                  {Object.entries(TAB_STYLES).map(([value, cfg]) => (
                    <button
                      key={value}
                      onClick={() => setActiveTab(value)}
                      className={cn(
                        "flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                        activeTab === value
                          ? `${cfg.active} scale-[1.02]`
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── Overview Tab ─────────────────────────────────── */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Revenue & Orders Chart */}
                  <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-violet-500 to-indigo-600" />
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-gray-900 dark:text-white text-base font-bold">Revenue & Orders Trend</CardTitle>
                          <CardDescription className="text-xs mt-0.5">Daily revenue and order volume over time</CardDescription>
                        </div>
                        <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-xs">
                          {period}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={320}>
                        <ComposedChart data={dailyRevenueData} barSize={20}>
                          <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.1} />
                              <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <YAxis yAxisId="left" tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <Tooltip content={<CustomTooltip currency />} />
                          <Bar yAxisId="right" dataKey="orders" fill={COLORS.teal} radius={[4, 4, 0, 0]} name="Orders" />
                          <Area yAxisId="left" type="monotone" dataKey="revenue" stroke={COLORS.indigo} fill="url(#revenueGrad)" strokeWidth={2.5} name="Revenue" dot={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Rental Status */}
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-600" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-gray-900 dark:text-white text-base font-bold">Rental Status</CardTitle>
                      <CardDescription className="text-xs">Current rental distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={rentalStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {rentalStatusData.map((entry, idx) => (
                              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} rentals`, 'Count']} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-2">
                        {rentalStatusData.map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                              <span className="text-gray-600 dark:text-gray-400 capitalize">{entry.name}</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* NEW: Performance Goals Section */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-violet-600" />
                        <CardTitle className="text-base font-bold">Performance Goals</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">This Month</Badge>
                    </div>
                    <CardDescription className="text-xs mt-0.5">Track your progress towards key business targets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {PERFORMANCE_GOALS.map((goal, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{goal.label}</span>
                            <span className="text-xs font-bold" style={{ color: goal.color }}>{goal.value}</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${goal.current}%`, background: `linear-gradient(90deg, ${goal.color}aa, ${goal.color})` }}
                            />
                          </div>
                          <p className="text-[11px] text-gray-400">{goal.current}% complete</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue by Type & Payment Methods */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Revenue by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={revenueByTypeData} layout="vertical" barSize={16}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                          <XAxis type="number" tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <YAxis type="category" dataKey="type" width={90} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                            {revenueByTypeData.map((_, idx) => (
                              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={paymentMethodsData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="amount"
                            paddingAngle={3}
                            label={({ method, percent }) =>
                              `${method} ${((percent ?? 0) * 100).toFixed(0)}%`
                            }
                            labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                          >
                            {paymentMethodsData.map((entry, idx) => (
                              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold">Recent Activity</CardTitle>
                        <CardDescription className="text-xs mt-0.5">Latest rental orders and transactions</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                        View All <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[280px] pr-4">
                      <div className="space-y-2">
                        {overview?.recentActivity?.length ? (
                          overview.recentActivity.slice(0, 10).map((activity, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                            >
                              <div className="p-2 rounded-xl flex-shrink-0"
                                style={{ backgroundColor: `${CHART_COLORS[idx % CHART_COLORS.length]}15` }}>
                                <Truck className="h-4 w-4" style={{ color: CHART_COLORS[idx % CHART_COLORS.length] }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{activity.product}</p>
                                  <p className="font-bold text-gray-900 dark:text-white text-sm ml-2 flex-shrink-0">{formatCurrency(activity.amount)}</p>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{activity.customer}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: activity.status === 'completed'
                                        ? `${COLORS.teal}15`
                                        : `${COLORS.warning}15`,
                                      color: activity.status === 'completed' ? COLORS.teal : COLORS.warning
                                    }}
                                  >
                                    {activity.status}
                                  </span>
                                  <span className="text-xs text-gray-400">{timeAgo(activity.time)}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No recent activity</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ─── Sales Performance Tab ────────────────────────── */}
              <TabsContent value="sales" className="space-y-6 mt-0">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Monthly Revenue Trend</CardTitle>
                      <CardDescription className="text-xs">Revenue performance over months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={monthlyTrendsData}>
                          <defs>
                            <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke={COLORS.teal}
                            fill="url(#monthlyGrad)"
                            strokeWidth={2.5}
                            dot={{ fill: COLORS.teal, r: 4, strokeWidth: 2, stroke: '#fff' }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Sales Summary</CardTitle>
                      <CardDescription className="text-xs">Key performance numbers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Big Revenue Card */}
                      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <p className="text-xs text-violet-200 font-medium uppercase tracking-widest mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold text-white">
                          {formatCurrency(salesReport?.summary?.totalRevenue || 0)}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                          <span className="text-xs text-emerald-300 font-medium">Strong performance this period</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-100 dark:border-emerald-900">
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Total Orders</p>
                          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                            {salesReport?.summary?.totalOrders || 0}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Unique Customers</p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {salesReport?.summary?.uniqueCustomers || 0}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-100 dark:border-amber-900">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Average Order Value</p>
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                          {formatCurrency(salesReport?.summary?.averageOrderValue || 0)}
                        </p>
                        <Progress
                          value={Math.min(((salesReport?.summary?.averageOrderValue || 0) / 5000) * 100, 100)}
                          className="mt-2 h-1.5"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ─── Product Analytics Tab ────────────────────────── */}
              <TabsContent value="products" className="space-y-6 mt-0">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Top Products by Revenue</CardTitle>
                      <CardDescription className="text-xs">Your highest earning products</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={topProductsData} layout="vertical" barSize={16}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                          <XAxis type="number" tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Bar dataKey="totalRevenue" radius={[0, 6, 6, 0]}>
                            {topProductsData.map((_, idx) => (
                              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Category Breakdown</CardTitle>
                      <CardDescription className="text-xs">Revenue by product category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={categoryData} barSize={24}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                            {categoryData.map((_, idx) => (
                              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Inventory Status */}
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Inventory Status</CardTitle>
                      <CardDescription className="text-xs">Current stock distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={inventoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            dataKey="value"
                            paddingAngle={3}
                          >
                            {inventoryData.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {inventoryData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg"
                            style={{ backgroundColor: `${item.color}10` }}>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
                            </div>
                            <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                      {(productPerformance?.inventoryStatus?.lowStockProducts ?? 0) > 0 && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                            {productPerformance?.inventoryStatus?.lowStockProducts} products are low on stock
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Product Performance Summary */}
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-600" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Performance Summary</CardTitle>
                      <CardDescription className="text-xs">Key product metrics at a glance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {topProductsData.slice(0, 4).map((product, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[160px]">
                              {product.name}
                            </span>
                            <span className="text-xs font-bold" style={{ color: CHART_COLORS[idx % CHART_COLORS.length] }}>
                              {formatCompactCurrency(product.totalRevenue)}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.min((product.totalRevenue / (topProductsData[0]?.totalRevenue || 1)) * 100, 100)}%`,
                                backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ─── Customer Insights Tab ────────────────────────── */}
              <TabsContent value="customers" className="space-y-6 mt-0">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {/* Customer Loyalty */}
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-600" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Customer Loyalty</CardTitle>
                      <CardDescription className="text-xs">Repeat customer performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center py-4">
                        <div className="relative">
                          <svg viewBox="0 0 140 140" className="w-36 h-36">
                            <circle cx="70" cy="70" r="60" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                            <circle
                              cx="70"
                              cy="70"
                              r="60"
                              fill="none"
                              stroke="url(#loyaltyGrad)"
                              strokeWidth="10"
                              strokeDasharray={`${(customerInsights?.summary?.repeatRate || 0) * 3.77} 377`}
                              strokeLinecap="round"
                              transform="rotate(-90 70 70)"
                            />
                            <defs>
                              <linearGradient id="loyaltyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={COLORS.rose} />
                                <stop offset="100%" stopColor={COLORS.pink} />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              {Math.round(customerInsights?.summary?.repeatRate || 0)}%
                            </span>
                            <span className="text-xs text-gray-500">repeat rate</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {customerInsights?.summary?.repeatCustomers || 0} of {customerInsights?.summary?.totalCustomers || 0} customers
                        </p>
                      </div>
                      <Separator className="my-3" />
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Avg. Lifetime Value</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(customerInsights?.summary?.avgLTV || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Total Customers</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {customerInsights?.summary?.totalCustomers || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Segments */}
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Customer Segments</CardTitle>
                      <CardDescription className="text-xs">Breakdown by loyalty tier</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={customerSegmentsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={75}
                            dataKey="value"
                            paddingAngle={3}
                          >
                            {customerSegmentsData.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-2">
                        {customerSegmentsData.map((segment, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 rounded-lg"
                            style={{ backgroundColor: `${segment.color}10` }}>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{segment.name}</span>
                            </div>
                            <span className="text-xs font-bold" style={{ color: segment.color }}>{segment.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Customers */}
                  <Card className="border-0 shadow-lg overflow-hidden md:col-span-2 xl:col-span-1">
                    <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Top Customers</CardTitle>
                      <CardDescription className="text-xs">Highest spending customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px] pr-2">
                        <div className="space-y-2">
                          {customerInsights?.topCustomers?.slice(0, 5).map((customer, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <Avatar className="h-9 w-9 flex-shrink-0">
                                <AvatarFallback
                                  className="text-xs font-bold text-white"
                                  style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                                >
                                  {customer.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                  {customer.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{customer.email}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {customer.totalRentals} rentals · {customer.uniqueProducts} products
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold" style={{ color: CHART_COLORS[idx % CHART_COLORS.length] }}>
                                  {formatCompactCurrency(customer.totalSpent)}
                                </p>
                                <p className="text-xs text-gray-400">{timeAgo(customer.lastRental)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* NEW: Footer info bar */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Data synced {timeAgo(new Date())} · Updated in real-time</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Secure</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> India</span>
                <span>© 2025 RentEase</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Wrapped Component ─────────────────────────────────────────────────

interface VendorDashboardProps {
  vendorId: string;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({ vendorId }) => (
  <VendorAnalyticsProvider vendorId={vendorId}>
    <VendorDashboardContent />
  </VendorAnalyticsProvider>
);

export default VendorDashboard;