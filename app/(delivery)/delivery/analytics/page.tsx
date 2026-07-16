// app/delivery/analytics/page.tsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import { deliveryPartnerApi, type ActivityItem, type EarningsBreakdownItem } from '@/lib/api/delivery';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Star,
  Target,
  DollarSign,
  Package,
  Clock,
  Award,
  RefreshCw,
  Calendar,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Zap,
  Crown,
  Medal,
  ThumbsUp,
  Clock as ClockIcon,
  AlertCircle,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

// Types
type Period = 'week' | 'month' | 'year';

interface PerformanceData {
  period: string;
  onTimeRate: number;
  averageRating: number;
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  totalDistance: number;
  totalEarnings: number;
}

interface EarningsData {
  period: string;
  total: number;
  currency: string;
  breakdown: EarningsBreakdownItem[];
}

// Container animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// KPI Card Component
function KpiCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext, 
  trend, 
  color = 'orange',
  className 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  subtext?: string; 
  trend?: { value: number; isPositive: boolean };
  color?: 'orange' | 'emerald' | 'blue' | 'purple' | 'red';
  className?: string;
}) {
  const colorClasses = {
    orange: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600',
    blue: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600',
    purple: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600',
    red: 'bg-red-50 dark:bg-red-950/20 text-red-600',
  };

  return (
    <motion.div variants={itemVariants} className={cn("h-full", className)}>
      <Card className="p-4 h-full hover:shadow-lg transition-all duration-300 border-orange-100/60 dark:border-orange-900/30 dark:bg-[#1a0900]">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2 rounded-xl", colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.isPositive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
            )}>
              {trend.isPositive ? <TrendingUpIcon className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}%
            </div>
          )}
        </div>
        <p className="text-2xl font-black tabular-nums text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </Card>
    </motion.div>
  );
}

// Metric Bar Component
function MetricBar({ 
  label, 
  value, 
  max = 100, 
  unit = '%', 
  color = 'orange',
  subtitle 
}: { 
  label: string; 
  value: number; 
  max?: number; 
  unit?: string; 
  color?: 'orange' | 'emerald' | 'blue';
  subtitle?: string;
}) {
  const percentage = (value / max) * 100;
  const colorClasses = {
    orange: 'bg-gradient-to-r from-orange-500 to-amber-500',
    emerald: 'bg-gradient-to-r from-emerald-500 to-green-500',
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}{unit}
        </span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClasses[color])}
        />
      </div>
    </div>
  );
}

// Earnings Chart Component
function EarningsChart({ data, period }: { data: EarningsBreakdownItem[]; period: Period }) {
  const [expanded, setExpanded] = useState(false);
  
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group by date
    const grouped = data.reduce((acc, item) => {
      const date = format(parseISO(item.date), 'MMM dd');
      acc[date] = (acc[date] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
  }, [data]);
  
  const maxAmount = Math.max(...chartData.map(d => d.amount), 0);
  const totalEarnings = data.reduce((sum, item) => sum + item.amount, 0);
  
  const displayData = expanded ? chartData : chartData.slice(-7);
  
  return (
    <Card className="p-4 border-orange-100/60 dark:border-orange-900/30 dark:bg-[#1a0900]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Earnings Overview</h3>
          <p className="text-sm text-gray-500">Daily earnings for this {period}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">₹{totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total {period}</p>
        </div>
      </div>
      
      {chartData.length > 0 ? (
        <>
          <div className="relative h-48 md:h-64 mb-4">
            <div className="absolute inset-0 flex items-end gap-1 md:gap-2">
              {displayData.map((item, idx) => {
                const height = (item.amount / maxAmount) * 100;
                return (
                  <motion.div
                    key={idx}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.02 }}
                    className="flex-1 bg-gradient-to-t from-orange-500 to-amber-500 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer group relative"
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{item.amount}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {displayData.map((item, idx) => (
              <span key={idx} className="text-center flex-1 truncate">{item.date}</span>
            ))}
          </div>
          
          {chartData.length > 7 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-4"
            >
              {expanded ? (
                <>Show Less <ChevronUp className="w-4 h-4 ml-1" /></>
              ) : (
                <>Show All {chartData.length} Days <ChevronDown className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No earnings data for this period</p>
          <p className="text-sm text-gray-400">Complete deliveries to see earnings</p>
        </div>
      )}
    </Card>
  );
}

// Completion Funnel Component
function CompletionFunnel({ completed, failed, total }: { completed: number; failed: number; total: number }) {
  const completedPercent = total > 0 ? (completed / total) * 100 : 0;
  const failedPercent = total > 0 ? (failed / total) * 100 : 0;
  const pendingPercent = 100 - completedPercent - failedPercent;
  
  return (
    <Card className="p-4 border-orange-100/60 dark:border-orange-900/30 dark:bg-[#1a0900]">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Delivery Funnel</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-emerald-600">Completed</span>
          <span className="font-medium">{completed} ({completedPercent.toFixed(1)}%)</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completedPercent}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
          />
        </div>
        
        <div className="flex justify-between text-sm mt-3">
          <span className="text-amber-600">Pending/In Progress</span>
          <span className="font-medium">{total - completed - failed} ({pendingPercent.toFixed(1)}%)</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pendingPercent}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-500"
          />
        </div>
        
        <div className="flex justify-between text-sm mt-3">
          <span className="text-red-600">Failed</span>
          <span className="font-medium">{failed} ({failedPercent.toFixed(1)}%)</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${failedPercent}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-red-500 to-rose-500"
          />
        </div>
      </div>
    </Card>
  );
}

// Activity Feed Component
function ActivityFeed({ activities, loading }: { activities: ActivityItem[]; loading: boolean }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-amber-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No recent activity</p>
        <p className="text-sm text-gray-400">Start delivering to see your activity</p>
      </Card>
    );
  }
  
  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-3 pr-4">
        {activities.map((activity, idx) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="mt-1">{getStatusIcon(activity.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                    <div className="flex items-center gap-2">
                      {activity.earnings && (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                          ₹{activity.earnings}
                        </Badge>
                      )}
                      {activity.rating && (
                        <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">
                          <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                          {activity.rating}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.customer}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{activity.time}</span>
                    <span>{activity.deliveryNumber}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}

// Earnings Table Component
function EarningsTable({ data, period }: { data: EarningsBreakdownItem[]; period: Period }) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [data, sortOrder]);
  
  const filteredData = sortedData.filter(item =>
    item.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No earnings data for this period</p>
      </Card>
    );
  }
  
  return (
    <Card className="p-4 border-orange-100/60 dark:border-orange-900/30 dark:bg-[#1a0900]">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">Earnings Breakdown</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search delivery..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          >
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {filteredData.map((item, idx) => (
            <motion.div
              key={item.deliveryNumber}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.01 }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{item.deliveryNumber}</p>
                <p className="text-xs text-gray-500">{format(parseISO(item.date), 'MMM dd, yyyy h:mm a')}</p>
              </div>
              <p className="text-lg font-bold text-emerald-600">₹{item.amount}</p>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

// Main Page Component
export default function AnalyticsPage() {
  const { stats: contextStats, profile, isLoading: contextLoading } = useDeliveryPartner();
  const toast  = useToast();
  
  const [period, setPeriod] = useState<Period>('week');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState({ performance: true, earnings: true, activities: true });
  
  // Calculate partner level based on rating
  const partnerLevel = useMemo(() => {
    const rating = contextStats?.rating || profile?.rating || 0;
    if (rating >= 4.8) return { name: 'Gold Partner', icon: Crown, color: 'text-yellow-500' };
    if (rating >= 4.5) return { name: 'Silver Partner', icon: Medal, color: 'text-gray-400' };
    if (rating >= 4.0) return { name: 'Bronze Partner', icon: Award, color: 'text-amber-600' };
    return { name: 'Rising Partner', icon: Zap, color: 'text-blue-500' };
  }, [contextStats?.rating, profile?.rating]);
  
  // Fetch all analytics data
  const fetchAnalyticsData = useCallback(async (currentPeriod: Period) => {
    setLoading({ performance: true, earnings: true, activities: true });
    
    const [perfRes, earnRes, actRes] = await Promise.allSettled([
      deliveryPartnerApi.getPerformance(currentPeriod),
      deliveryPartnerApi.getEarnings(currentPeriod),
      deliveryPartnerApi.getActivity(30),
    ]);
    
    if (perfRes.status === 'fulfilled' && perfRes.value.success) {
      setPerformance(perfRes.value.data?.performance || null);
    } else {
      console.error('Failed to fetch performance');
      setPerformance(null);
    }
    setLoading(prev => ({ ...prev, performance: false }));
    
    if (earnRes.status === 'fulfilled' && earnRes.value.success) {
      setEarnings(earnRes.value.data || null);
    } else {
      console.error('Failed to fetch earnings');
      setEarnings(null);
    }
    setLoading(prev => ({ ...prev, earnings: false }));
    
    if (actRes.status === 'fulfilled' && actRes.value.success) {
      setActivities(actRes.value.data?.activities || []);
    } else {
      console.error('Failed to fetch activities');
      setActivities([]);
    }
    setLoading(prev => ({ ...prev, activities: false }));
  }, []);
  
  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAnalyticsData(period);
    
    toast.success('Analytics data has been updated');
    setIsRefreshing(false);
  }, [period, fetchAnalyticsData, toast]);
  
  // Initial load and period change
  useEffect(() => {
    fetchAnalyticsData(period);
  }, [period, fetchAnalyticsData]);
  
  const isLoading = contextLoading || loading.performance || loading.earnings || loading.activities;
  
  // Stats from context or fallback
  const stats = contextStats || {
    todayDeliveries: 0,
    completedToday: 0,
    pendingToday: 0,
    todayEarnings: 0,
    thisWeekEarnings: 0,
    totalEarnings: 0,
    rating: 0,
    onTimeRate: 0,
    totalDeliveries: 0,
    acceptanceRate: 0,
    avgDeliveryTime: 0,
  };
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0e0500]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
                <Badge className="bg-white/20 text-white border-white/30">
                  {partnerLevel.name}
                </Badge>
              </div>
              <p className="text-orange-100">Track your performance and earnings</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-white/10 rounded-lg p-1">
                {(['week', 'month', 'year'] as Period[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-all",
                      period === p ? "bg-white text-orange-600" : "text-white hover:bg-white/20"
                    )}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Partner Info */}
          <div className="flex items-center gap-4 text-sm text-orange-100 mt-2">
            <span className="flex items-center gap-1">
              <Truck className="w-4 h-4" />
              {profile?.employeeId || stats.employeeId || 'DP-0000'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {profile?.zone || stats.zone || 'Central'} Zone
            </span>
            {profile?.metadata?.hiredAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {format(parseISO(profile.metadata.hiredAt), 'MMM yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* KPI Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          <KpiCard
            icon={Package}
            label="Today's Trips"
            value={stats.todayDeliveries}
            subtext={`${stats.completedToday} completed`}
            color="orange"
          />
          <KpiCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.completedToday}
            subtext={`${stats.pendingToday} pending`}
            color="emerald"
          />
          <KpiCard
            icon={DollarSign}
            label="Today's Earnings"
            value={`₹${stats.todayEarnings?.toLocaleString() || 0}`}
            color="emerald"
          />
          <KpiCard
            icon={TrendingUp}
            label="Week Earnings"
            value={`₹${stats.thisWeekEarnings?.toLocaleString() || 0}`}
            color="blue"
          />
          <KpiCard
            icon={Star}
            label="Rating"
            value={stats.rating?.toFixed(1) || '0'}
            subtext="out of 5.0"
            color="purple"
          />
          <KpiCard
            icon={Target}
            label="On-Time Rate"
            value={`${stats.onTimeRate || 0}%`}
            color="emerald"
          />
          <KpiCard
            icon={Truck}
            label="Total Trips"
            value={stats.totalDeliveries?.toLocaleString() || 0}
            color="blue"
          />
          <KpiCard
            icon={Award}
            label="Lifetime Earnings"
            value={`₹${stats.totalEarnings?.toLocaleString() || 0}`}
            color="orange"
          />
        </motion.div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-[#1a0900] border border-orange-100 dark:border-orange-900/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              Earnings
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              Performance
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
              Activity
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <EarningsChart data={earnings?.breakdown || []} period={period} />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card className="p-4 border-orange-100/60 dark:border-orange-900/30 dark:bg-[#1a0900]">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Key Metrics</h3>
                  <MetricBar
                    label="On-Time Delivery Rate"
                    value={performance?.onTimeRate || stats.onTimeRate || 0}
                    unit="%"
                    color="emerald"
                  />
                  <div className="mt-4">
                    <MetricBar
                      label="Average Rating"
                      value={performance?.averageRating || stats.rating || 0}
                      max={5}
                      unit="★"
                      color="orange"
                    />
                  </div>
                  <div className="mt-4">
                    <MetricBar
                      label="Completion Rate"
                      value={stats.acceptanceRate || 0}
                      unit="%"
                      color="blue"
                      subtitle="Completed vs Accepted"
                    />
                  </div>
                </Card>
              </div>
              
              <div className="space-y-4">
                <Card className="p-4 border-orange-100/60 dark:border-orange-900/30 dark:bg-[#1a0900]">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Total Distance</span>
                      <span className="font-bold text-gray-900">{performance?.totalDistance?.toFixed(1) || 0} km</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Failed Deliveries</span>
                      <span className="font-bold text-red-600">{performance?.failedDeliveries || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Avg Delivery Time</span>
                      <span className="font-bold text-gray-900">{stats.avgDeliveryTime || 0} min</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Active Deliveries</span>
                      <span className="font-bold text-orange-600">{stats.activeDeliveries || 0}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            
            <CompletionFunnel
              completed={performance?.completedDeliveries || stats.totalDeliveries || 0}
              failed={performance?.failedDeliveries || 0}
              total={performance?.totalDeliveries || stats.totalDeliveries || 0}
            />
          </TabsContent>
          
          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <EarningsChart data={earnings?.breakdown || []} period={period} />
            <EarningsTable data={earnings?.breakdown || []} period={period} />
          </TabsContent>
          
          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-4 border-orange-100/60 dark:border-orange-900/30 dark:bg-[#1a0900]">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
                <MetricBar
                  label="On-Time Delivery Rate"
                  value={performance?.onTimeRate || stats.onTimeRate || 0}
                  unit="%"
                  color="emerald"
                />
                <div className="mt-6">
                  <MetricBar
                    label="Customer Rating"
                    value={performance?.averageRating || stats.rating || 0}
                    max={5}
                    unit="★"
                    color="orange"
                  />
                </div>
                <div className="mt-6">
                  <MetricBar
                    label="Completion Rate"
                    value={stats.acceptanceRate || 0}
                    unit="%"
                    color="blue"
                  />
                </div>
              </Card>
              
              <Card className="p-4 border-orange-100/60 dark:border-orange-900/30 dark:bg-[#1a0900]">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Delivery Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{performance?.totalDeliveries || 0}</p>
                    <p className="text-sm text-gray-500">Total Deliveries</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{performance?.completedDeliveries || 0}</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{performance?.failedDeliveries || 0}</p>
                    <p className="text-sm text-gray-500">Failed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{performance?.totalDistance?.toFixed(0) || 0} km</p>
                    <p className="text-sm text-gray-500">Distance</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <CompletionFunnel
              completed={performance?.completedDeliveries || stats.totalDeliveries || 0}
              failed={performance?.failedDeliveries || 0}
              total={performance?.totalDeliveries || stats.totalDeliveries || 0}
            />
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity">
            <ActivityFeed activities={activities} loading={loading.activities} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}