'use client';

/**
 * Delivery Partner — History page
 * Route: /delivery/history
 *
 * Data sources (see Delivery History API reference):
 *  - deliveryPartnerApi.getHistory({ page, limit, status, startDate, endDate })  [stub on backend today]
 *  - deliveryPartnerApi.getStats()
 *  - deliveryPartnerApi.getPerformance(period)
 *  - deliveryPartnerApi.getActivity(limit)
 *  - deliveryPartnerApi.getEarnings(period)
 *  - deliveryPartnerApi.getProfile()
 *  - deliveryPartnerApi.getDeliveryById(id)
 *  - deliveryPartnerApi.reportIssue(id, payload)   [POST /:deliveryId/report-issue]
 *
 * NOTE: method names above are assumed to match frontend/lib/api/delivery.ts.
 * Adjust the call sites in `fetchAll()` / `openDetail()` / `submitIssue()` if your
 * client uses different names or a different useDeliveryPartner() shape.
 *
 * GET /history currently returns an empty array (backend stub). Until the backend
 * implements pagination/filtering, this page falls back to composing a synthetic
 * list from getActivity() + getEarnings() so the page is never blank.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  formatDistanceToNowStrict,
  isToday,
  isYesterday,
  startOfDay,
  startOfWeek,
  startOfMonth,
} from 'date-fns';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Search,
  RefreshCw,
  MapPin,
  Star,
  Phone,
  ChevronRight,
  X,
  Download,
  CalendarDays,
  Inbox,
  Loader2,
  TrendingUp,
  Wallet,
  Clock,
  ImageOff,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Navigation as NavigationIcon,
  PackageX,
} from 'lucide-react';

import { deliveryPartnerApi } from '@/lib/api/delivery';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import {
  DeliveryTimeline,
  STATUS_META,
  type DeliveryStatus,
  type TimelineEvent,
} from '@/components/delivery/history/DeliveryTimeline';

/* ------------------------------------------------------------------------ */
/*                                   Types                                  */
/* ------------------------------------------------------------------------ */

type DeliveryType = 'delivery' | 'pickup' | 'exchange' | 'return' | 'maintenance';

interface DeliveryHistoryItem {
  _id: string;
  deliveryNumber: string;
  type: DeliveryType;
  status: DeliveryStatus;
  priority?: string;
  schedule: {
    scheduledDate: string;
    scheduledSlot?: string;
    deadline?: string;
  };
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    contactName: string;
    contactPhone: string;
  };
  items: { name: string; quantity: number; sku?: string }[];
  distance?: number;
  estimatedDuration?: number;
  earnings: number;
  completedAt?: string;
  deliveryTime?: number;
  rating?: number;
}

interface HistoryPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface HistorySummary {
  completed: number;
  failed: number;
  cancelled: number;
  totalEarnings: number;
}

interface ActivityItem {
  id: string;
  action: string;
  customer: string;
  time: string;
  earnings?: number;
  rating?: number;
  status: 'success' | 'pending' | 'warning' | 'failed' | 'cancelled';
  deliveryNumber: string;
}

interface EarningsBreakdownItem {
  deliveryNumber: string;
  date: string;
  amount: number;
}

interface EarningsData {
  period: 'week' | 'month' | 'year';
  total: number;
  currency: string;
  breakdown: EarningsBreakdownItem[];
}

interface DeliveryDetail {
  _id: string;
  deliveryNumber: string;
  type: DeliveryType;
  status: DeliveryStatus;
  schedule: {
    scheduledDate: string;
    scheduledSlot?: { start: string; end: string };
    rescheduledCount?: number;
  };
  address: { addressLine1: string; city: string; pincode: string; coordinates?: [number, number] };
  contact: { name: string; phone: string };
  items: { name: string; quantity: number }[];
  route?: { distance: number; duration: number; optimized?: boolean };
  tracking?: {
    estimatedArrival?: string;
    actualArrival?: string;
    timeline: TimelineEvent[];
  };
  proof?: {
    deliveredTo?: string;
    photos?: { url: string; caption?: string; timestamp?: string }[];
    otp?: { verifiedAt?: string };
  };
  charges?: { baseCharge: number; distanceCharge: number; totalCharge: number; paymentStatus: string };
  feedback?: { rating: number; comment?: string; submittedAt?: string };
  issues?: { issueType: string; description?: string }[];
}

interface DeliveryStats {
  totalDeliveries: number;
  rating: number;
  onTimeRate: number;
  employeeId: string;
  zone: string;
}

interface ProfilePerformance {
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  cancelledDeliveries: number;
  totalEarnings: number;
  lastDeliveryAt?: string;
}

type StatusFilter = 'all' | 'delivered' | 'failed' | 'cancelled' | 'rescheduled';
type SortKey = 'newest' | 'oldest' | 'earnings_desc' | 'rating_asc';
type DatePreset = 'today' | 'week' | 'month' | 'custom' | 'all';

/* ------------------------------------------------------------------------ */
/*                              Static config                               */
/* ------------------------------------------------------------------------ */

const TYPE_META: Record<DeliveryType, string> = {
  delivery: 'Delivery',
  pickup: 'Pickup',
  exchange: 'Exchange',
  return: 'Return',
  maintenance: 'Maintenance',
};

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'delivered', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

/* ------------------------------------------------------------------------ */
/*                               Helper utils                               */
/* ------------------------------------------------------------------------ */

const formatINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

function dateRangeForPreset(preset: DatePreset, custom?: { from?: Date; to?: Date }) {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { startDate: startOfDay(now).toISOString(), endDate: now.toISOString() };
    case 'week':
      return { startDate: startOfWeek(now).toISOString(), endDate: now.toISOString() };
    case 'month':
      return { startDate: startOfMonth(now).toISOString(), endDate: now.toISOString() };
    case 'custom':
      return {
        startDate: custom?.from ? startOfDay(custom.from).toISOString() : undefined,
        endDate: custom?.to ? custom.to.toISOString() : undefined,
      };
    default:
      return { startDate: undefined, endDate: undefined };
  }
}

function dayHeading(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEEE, MMM d, yyyy');
}

function groupByDay(items: DeliveryHistoryItem[]) {
  const groups = new Map<string, DeliveryHistoryItem[]>();
  for (const item of items) {
    const key = (item.completedAt || item.schedule?.scheduledDate || new Date().toISOString()).slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return Array.from(groups.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

/** Maps activity-feed status strings onto the canonical delivery status enum. */
function activityStatusToDeliveryStatus(s: ActivityItem['status']): DeliveryStatus {
  switch (s) {
    case 'success':
      return 'delivered';
    case 'failed':
      return 'failed';
    case 'cancelled':
      return 'cancelled';
    case 'warning':
      return 'rescheduled';
    default:
      return 'assigned';
  }
}

/**
 * Composes a best-effort history list from /activity + /earnings while
 * GET /history is still a backend stub returning an empty array.
 */
function buildFallbackHistory(activities: ActivityItem[], earnings: EarningsData | null): DeliveryHistoryItem[] {
  const earningsByNumber = new Map<string, EarningsBreakdownItem>();
  earnings?.breakdown?.forEach((b) => earningsByNumber.set(b.deliveryNumber, b));

  return activities.map((a) => {
    const matched = earningsByNumber.get(a.deliveryNumber);
    const today = new Date();
    return {
      _id: a.id,
      deliveryNumber: a.deliveryNumber,
      type: 'delivery',
      status: activityStatusToDeliveryStatus(a.status),
      schedule: { scheduledDate: matched?.date || today.toISOString() },
      address: {
        addressLine1: '—',
        city: '—',
        state: '',
        pincode: '—',
        contactName: a.customer,
        contactPhone: '',
      },
      items: [],
      earnings: a.earnings ?? matched?.amount ?? 0,
      completedAt: matched?.date,
      rating: a.rating,
    } as DeliveryHistoryItem;
  });
}

function exportCsv(rows: DeliveryHistoryItem[]) {
  const header = ['Date', 'Delivery #', 'Customer', 'Status', 'Earnings', 'Pincode'];
  const lines = rows.map((r) =>
    [
      r.completedAt ? format(new Date(r.completedAt), 'yyyy-MM-dd HH:mm') : '',
      r.deliveryNumber,
      r.address.contactName,
      r.status,
      r.earnings,
      r.address.pincode,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `delivery-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------------ */
/*                              Small components                            */
/* ------------------------------------------------------------------------ */

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm ring-1 ring-white/15">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-lg font-bold leading-tight text-white">{value}</p>
        <p className="truncate text-[11px] font-medium text-white/70">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.assigned;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.badge}`}>
      {meta.label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-orange-100/60 bg-white p-4 dark:border-orange-900/30 dark:bg-[#1a0900]">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="mt-3 h-3 w-48" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  );
}

function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-orange-200 bg-orange-50/50 px-6 py-14 text-center dark:border-orange-900/40 dark:bg-orange-950/10">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">{description}</p>
      {ctaHref && ctaLabel && (
        <Button
          asChild
          className="mt-5 rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white hover:opacity-90"
        >
          <Link href={ctaHref}>
            {ctaLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*                              History list card                           */
/* ------------------------------------------------------------------------ */

function HistoryCard({ item, onOpen }: { item: DeliveryHistoryItem; onOpen: () => void }) {
  const meta = STATUS_META[item.status] ?? STATUS_META.assigned;
  const stripe =
    item.status === 'delivered' || item.status === 'picked_up'
      ? 'bg-emerald-500'
      : item.status === 'failed'
        ? 'bg-red-500'
        : item.status === 'cancelled'
          ? 'bg-stone-400'
          : 'bg-amber-500';

  return (
    <motion.button
      layout
      type="button"
      onClick={onOpen}
      className="group relative flex w-full items-stretch overflow-hidden rounded-2xl border border-orange-100/60 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-orange-900/30 dark:bg-[#1a0900]"
    >
      <span className={`w-1.5 shrink-0 ${stripe}`} aria-hidden />
      <div className="flex flex-1 items-center justify-between gap-4 px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-stone-400 dark:text-stone-500">
              {item.deliveryNumber}
            </span>
            <StatusBadge status={item.status} />
            <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
              {TYPE_META[item.type] ?? item.type}
            </span>
          </div>
          <p className="mt-1.5 truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
            {item.address.contactName}
          </p>
          {item.address.addressLine1 !== '—' && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-stone-500 dark:text-stone-400">
              <MapPin className="h-3 w-3 shrink-0" />
              {item.address.addressLine1}, {item.address.city} · {item.address.pincode}
            </p>
          )}
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
            {item.completedAt
              ? `Completed · ${format(new Date(item.completedAt), 'MMM d, h:mm a')}`
              : item.schedule.scheduledSlot
                ? `Scheduled · ${item.schedule.scheduledSlot}`
                : format(new Date(item.schedule.scheduledDate), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {formatINR(item.earnings)}
          </span>
          <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
            {typeof item.rating === 'number' && (
              <span className="inline-flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {item.rating}
              </span>
            )}
            {item.deliveryTime && <span>{item.deliveryTime} min</span>}
          </div>
          <ChevronRight className="h-4 w-4 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-orange-400 dark:text-stone-600" />
        </div>
      </div>
    </motion.button>
  );
}

/* ------------------------------------------------------------------------ */
/*                                Main page                                 */
/* ------------------------------------------------------------------------ */

export default function DeliveryHistoryPage() {
  // useDeliveryPartner() is consulted for profile / fallback context per the
  // existing DeliveryPartnerContext pattern used across other delivery pages.
  const deliveryPartnerCtx = (useDeliveryPartner?.() as any) ?? {};

  const [activeTab, setActiveTab] = useState<'deliveries' | 'earnings' | 'activity'>('deliveries');

  // History list state
  const [history, setHistory] = useState<DeliveryHistoryItem[]>([]);
  const [pagination, setPagination] = useState<HistoryPagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [summary, setSummary] = useState<HistorySummary | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Supporting data
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [profilePerf, setProfilePerf] = useState<ProfilePerformance | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [earningsPeriod, setEarningsPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [earningsLoading, setEarningsLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<DeliveryType | 'all'>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});
  const [sortBy, setSortBy] = useState<SortKey>('newest');

  // Detail drawer
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DeliveryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueType, setIssueType] = useState('wrong_address');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueSubmitting, setIssueSubmitting] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  /* ----------------------------- Data fetching ---------------------------- */

  const fetchHistoryPage = useCallback(
    async (page: number, append: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const { startDate, endDate } = dateRangeForPreset(datePreset, customRange);
        const res = await deliveryPartnerApi.getHistory({
          page,
          limit: pagination.limit,
          status: statusFilter === 'all' ? undefined : statusFilter,
          startDate,
          endDate,
        });

        const data = res?.data ?? res;
        const list: DeliveryHistoryItem[] = data?.deliveries ?? [];

        if (list.length === 0 && page === 1) {
          // Backend stub fallback — compose from activity + earnings.
          const [activityRes, earningsRes] = await Promise.all([
            deliveryPartnerApi.getActivity(50),
            deliveryPartnerApi.getEarnings('year'),
          ]);
          const activities: ActivityItem[] = (activityRes?.data ?? activityRes)?.activities ?? [];
          const earningsData: EarningsData = (earningsRes?.data ?? earningsRes)?.breakdown
            ? (earningsRes.data ?? earningsRes)
            : { period: 'year', total: 0, currency: 'INR', breakdown: [] };

          const fallback = buildFallbackHistory(activities, earningsData);
          setHistory(fallback);
          setPagination({ page: 1, limit: fallback.length || 20, total: fallback.length, pages: 1 });
          setIsUsingFallback(true);
        } else {
          setHistory((prev) => (append ? [...prev, ...list] : list));
          setPagination(data?.pagination ?? { page, limit: 20, total: list.length, pages: 1 });
          setSummary(data?.summary ?? null);
          setIsUsingFallback(false);
        }
      } catch (err) {
        if ((err as any)?.name !== 'AbortError') {
          setHistoryError('Could not load delivery history. Please try again.');
        }
      } finally {
        setHistoryLoading(false);
      }
    },
    [datePreset, customRange, statusFilter, pagination.limit],
  );

  const fetchSupporting = useCallback(async () => {
    try {
      const [statsRes, perfRes, activityRes, profileRes] = await Promise.allSettled([
        deliveryPartnerApi.getStats(),
        deliveryPartnerApi.getPerformance('month'),
        deliveryPartnerApi.getActivity(8),
        deliveryPartnerApi.getProfile(),
      ]);

      if (statsRes.status === 'fulfilled') {
        const d = (statsRes.value?.data ?? statsRes.value)?.stats ?? statsRes.value;
        setStats(d);
      }
      if (activityRes.status === 'fulfilled') {
        const d = (activityRes.value?.data ?? activityRes.value)?.activities ?? [];
        setActivity(d);
      }
      if (profileRes.status === 'fulfilled') {
        const d = (profileRes.value?.data ?? profileRes.value)?.profile ?? profileRes.value;
        setProfilePerf(d?.performance ?? null);
      }
      void perfRes; // performance summary currently surfaced via stats/profile cards
    } catch {
      // Supporting widgets are non-critical — fail silently, primary list still works.
    }
  }, []);

  const fetchEarnings = useCallback(async (period: 'week' | 'month' | 'year') => {
    setEarningsLoading(true);
    try {
      const res = await deliveryPartnerApi.getEarnings(period);
      const d = (res?.data ?? res) as EarningsData;
      setEarnings(d);
    } catch {
      toast.error("Couldn't load earnings for this period.");
    } finally {
      setEarningsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistoryPage(1, false);
    fetchSupporting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, datePreset, customRange]);

  useEffect(() => {
    if (activeTab === 'earnings') fetchEarnings(earningsPeriod);
  }, [activeTab, earningsPeriod, fetchEarnings]);

  // Debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleRefresh = () => {
    fetchHistoryPage(1, false);
    fetchSupporting();
    toast.success('History refreshed');
  };

  /* ------------------------------- Filtering ------------------------------ */

  const filteredSorted = useMemo(() => {
    let rows = [...history];

    if (debouncedSearch) {
      rows = rows.filter(
        (r) =>
          r.deliveryNumber.toLowerCase().includes(debouncedSearch) ||
          r.address.contactName.toLowerCase().includes(debouncedSearch) ||
          r.address.pincode.toLowerCase().includes(debouncedSearch),
      );
    }
    if (typeFilter !== 'all') {
      rows = rows.filter((r) => r.type === typeFilter);
    }

    switch (sortBy) {
      case 'oldest':
        rows.sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''));
        break;
      case 'earnings_desc':
        rows.sort((a, b) => b.earnings - a.earnings);
        break;
      case 'rating_asc':
        rows.sort((a, b) => (a.rating ?? 5) - (b.rating ?? 5));
        break;
      default:
        rows.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
    }
    return rows;
  }, [history, debouncedSearch, typeFilter, sortBy]);

  const grouped = useMemo(() => groupByDay(filteredSorted), [filteredSorted]);

  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = [];
    if (statusFilter !== 'all')
      chips.push({
        key: 'status',
        label: STATUS_FILTERS.find((s) => s.value === statusFilter)?.label ?? statusFilter,
        clear: () => setStatusFilter('all'),
      });
    if (typeFilter !== 'all')
      chips.push({ key: 'type', label: TYPE_META[typeFilter], clear: () => setTypeFilter('all') });
    if (datePreset !== 'all')
      chips.push({
        key: 'date',
        label: datePreset === 'custom' ? 'Custom range' : datePreset === 'today' ? 'Today' : datePreset === 'week' ? 'This week' : 'This month',
        clear: () => setDatePreset('all'),
      });
    if (debouncedSearch) chips.push({ key: 'search', label: `"${search}"`, clear: () => setSearch('') });
    return chips;
  }, [statusFilter, typeFilter, datePreset, debouncedSearch, search]);

  const clearAllFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setDatePreset('all');
    setSearch('');
  };

  /* -------------------------------- Detail -------------------------------- */

  const findByDeliveryNumber = useCallback(
    (deliveryNumber: string) => history.find((h) => h.deliveryNumber === deliveryNumber)?._id,
    [history],
  );

  const openDetail = async (id: string) => {
    setOpenId(id);
    setDetail(null);
    setDetailLoading(true);
    setIssueOpen(false);
    setIssueDesc('');
    try {
      const res = await deliveryPartnerApi.getDeliveryById(id);
      const d = (res?.data ?? res)?.delivery ?? res;
      setDetail(d);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 404) {
        toast.error(status === 404 ? 'Delivery not found.' : "You don't have access to this delivery.");
        setOpenId(null);
      } else {
        toast.error('Could not load delivery details.');
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setOpenId(null);
    setDetail(null);
  };

  const submitIssue = async () => {
    if (!openId || !issueDesc.trim()) {
      toast.error('Please describe the issue first.');
      return;
    }
    setIssueSubmitting(true);
    try {
      await deliveryPartnerApi.reportIssue(openId, { issueType, description: issueDesc.trim() });
      toast.success('Issue reported');
      setIssueOpen(false);
      setIssueDesc('');
    } catch {
      toast.error("Couldn't submit the issue. Try again.");
    } finally {
      setIssueSubmitting(false);
    }
  };

  /* --------------------------------- Render -------------------------------- */

  const lastDeliveryLabel = profilePerf?.lastDeliveryAt
    ? `Last delivery · ${formatDistanceToNowStrict(new Date(profilePerf.lastDeliveryAt))} ago`
    : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-[#0e0500] md:pb-8">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        {/* ------------------------------- Hero ------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-amber-500 to-orange-700 p-6 shadow-lg sm:p-8"
        >
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">Delivery History</h1>
                {stats?.zone && (
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-white/25">
                    {stats.zone} · {stats.employeeId}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-white/85">Track every completed, failed, and cancelled delivery</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/80">
                {lastDeliveryLabel && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {lastDeliveryLabel}
                  </span>
                )}
                <Link href="/delivery/analytics" className="inline-flex items-center gap-1 font-medium text-white underline-offset-2 hover:underline">
                  View Analytics <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:w-auto lg:min-w-[420px]">
              <KpiCard
                label="Lifetime deliveries"
                value={String(profilePerf?.totalDeliveries ?? stats?.totalDeliveries ?? '—')}
                icon={TrendingUp}
                accent="bg-white/20 text-white"
              />
              <KpiCard
                label="Completed"
                value={String(profilePerf?.completedDeliveries ?? '—')}
                icon={ShieldCheck}
                accent="bg-emerald-500/30 text-emerald-50"
              />
              <KpiCard
                label="Failed"
                value={String(profilePerf?.failedDeliveries ?? '—')}
                icon={PackageX}
                accent="bg-red-500/30 text-red-50"
              />
              <KpiCard
                label="Total earnings"
                value={formatINR(profilePerf?.totalEarnings ?? 0)}
                icon={Wallet}
                accent="bg-white/20 text-white"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="absolute right-5 top-5 rounded-full bg-white/15 text-white hover:bg-white/25"
            aria-label="Refresh history"
          >
            <RefreshCw className={`h-4 w-4 ${historyLoading ? 'animate-spin' : ''}`} />
          </Button>
        </motion.section>

        {/* ---------------------------- Fallback banner ---------------------------- */}
        {isUsingFallback && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            History syncing — showing recent activity instead of the full list while this is set up.
          </div>
        )}

        {/* ------------------------------- Tabs -------------------------------- */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mt-6">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-orange-100/60 p-1 dark:bg-orange-950/30">
            <TabsTrigger
              value="deliveries"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
            >
              Deliveries
            </TabsTrigger>
            <TabsTrigger
              value="earnings"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
            >
              Earnings
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
            >
              Activity
            </TabsTrigger>
          </TabsList>

          {/* --------------------------- Deliveries tab --------------------------- */}
          <TabsContent value="deliveries" className="mt-5 space-y-4">
            {/* Filter toolbar */}
            <div className="sticky top-0 z-10 -mx-4 bg-slate-50/90 px-4 py-2 backdrop-blur dark:bg-[#0e0500]/90 sm:mx-0 sm:rounded-2xl sm:px-3">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by delivery #, customer, or pincode"
                    aria-label="Search delivery history"
                    className="rounded-xl border-orange-100/60 pl-9 dark:border-orange-900/30"
                  />
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="rounded-xl border-orange-100/60 dark:border-orange-900/30">
                      <CalendarDays className="mr-1.5 h-4 w-4" />
                      {datePreset === 'all' ? 'Any date' : datePreset === 'custom' ? 'Custom range' : datePreset === 'today' ? 'Today' : datePreset === 'week' ? 'This week' : 'This month'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-72 rounded-2xl p-3">
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['today', 'week', 'month', 'all'] as DatePreset[]).map((p) => (
                        <Button
                          key={p}
                          size="sm"
                          variant={datePreset === p ? 'default' : 'outline'}
                          className={`rounded-lg text-xs ${datePreset === p ? 'bg-gradient-to-r from-orange-500 to-indigo-600 text-white' : ''}`}
                          onClick={() => setDatePreset(p)}
                        >
                          {p === 'all' ? 'Any date' : p === 'today' ? 'Today' : p === 'week' ? 'This week' : 'This month'}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-2 border-t border-orange-100/60 pt-2 dark:border-orange-900/30">
                      <Calendar
                        mode="range"
                        selected={customRange as any}
                        onSelect={(range: any) => {
                          setCustomRange(range ?? {});
                          if (range?.from && range?.to) setDatePreset('custom');
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as DeliveryType | 'all')}>
                  <SelectTrigger className="w-full rounded-xl border-orange-100/60 dark:border-orange-900/30 sm:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {Object.entries(TYPE_META).map(([k, label]) => (
                      <SelectItem key={k} value={k}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                  <SelectTrigger className="w-full rounded-xl border-orange-100/60 dark:border-orange-900/30 sm:w-44">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="earnings_desc">Highest earnings</SelectItem>
                    <SelectItem value="rating_asc">Lowest rating</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="rounded-xl border-orange-100/60 dark:border-orange-900/30"
                  onClick={() => exportCsv(filteredSorted)}
                  disabled={filteredSorted.length === 0}
                >
                  <Download className="mr-1.5 h-4 w-4" /> Export
                </Button>
              </div>

              {/* Status segmented control */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatusFilter(s.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      statusFilter === s.value
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                        : 'bg-white text-stone-500 ring-1 ring-orange-100/60 dark:bg-[#1a0900] dark:text-stone-400 dark:ring-orange-900/30'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Active filter chips */}
              {activeFilterChips.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {activeFilterChips.map((c) => (
                    <button
                      key={c.key}
                      onClick={c.clear}
                      className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                    >
                      {c.label} <X className="h-3 w-3" />
                    </button>
                  ))}
                  <button onClick={clearAllFilters} className="text-[11px] font-medium text-stone-400 underline-offset-2 hover:underline">
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* List content */}
            {historyLoading && history.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : historyError ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center dark:border-red-900/30 dark:bg-red-950/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">{historyError}</p>
                <Button size="sm" onClick={() => fetchHistoryPage(1, false)} className="rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white">
                  Retry
                </Button>
              </div>
            ) : filteredSorted.length === 0 ? (
              <EmptyState
                title="No deliveries match these filters"
                description="Try widening the date range or clearing filters. New deliveries will show up here once completed."
                ctaHref="/delivery/orders"
                ctaLabel="View active orders"
              />
            ) : (
              <div className="space-y-6">
                {grouped.map(([day, items]) => (
                  <div key={day}>
                    <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                      {dayHeading(items[0].completedAt || items[0].schedule.scheduledDate)}
                    </h3>
                    <div className="space-y-2.5">
                      <AnimatePresence initial={false}>
                        {items.map((item) => (
                          <HistoryCard key={item._id} item={item} onOpen={() => openDetail(item._id)} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}

                <div className="flex flex-col items-center gap-2 pt-2 text-center">
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    Showing {filteredSorted.length} of {pagination.total || filteredSorted.length}
                  </p>
                  {!isUsingFallback && pagination.page < pagination.pages && (
                    <Button
                      variant="outline"
                      className="rounded-xl border-orange-200 dark:border-orange-900/40"
                      onClick={() => fetchHistoryPage(pagination.page + 1, true)}
                      disabled={historyLoading}
                    >
                      {historyLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                      Load more
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ---------------------------- Earnings tab ---------------------------- */}
          <TabsContent value="earnings" className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 rounded-xl bg-orange-100/60 p-1 dark:bg-orange-950/30">
                {(['week', 'month', 'year'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setEarningsPeriod(p)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition ${
                      earningsPeriod === p
                        ? 'bg-white text-orange-600 shadow-sm dark:bg-[#1a0900] dark:text-orange-400'
                        : 'text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {earningsLoading ? (
              <Skeleton className="h-40 w-full rounded-2xl" />
            ) : !earnings || earnings.breakdown.length === 0 ? (
              <EmptyState title="No earnings yet" description="Completed deliveries for this period will appear here." />
            ) : (
              <>
                <div className="rounded-2xl border border-orange-100/60 bg-white p-5 dark:border-orange-900/30 dark:bg-[#1a0900]">
                  <p className="text-xs font-medium text-stone-400 dark:text-stone-500">
                    Total · {earningsPeriod}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-stone-900 dark:text-stone-100">{formatINR(earnings.total)}</p>
                  <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{earnings.breakdown.length} deliveries</p>

                  {/* Lightweight bar chart, no extra chart dependency */}
                  <div className="mt-5 flex h-28 items-end gap-1.5">
                    {earnings.breakdown.slice(0, 20).map((b, i) => {
                      const max = Math.max(...earnings.breakdown.map((x) => x.amount), 1);
                      const h = Math.max(6, (b.amount / max) * 100);
                      return (
                        <div
                          key={`${b.deliveryNumber}-${i}`}
                          title={`${b.deliveryNumber} · ${formatINR(b.amount)}`}
                          style={{ height: `${h}%` }}
                          className="flex-1 rounded-t-md bg-gradient-to-t from-orange-500 to-amber-400"
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  {earnings.breakdown.map((b, i) => {
                    const matchedId = findByDeliveryNumber(b.deliveryNumber);
                    return (
                      <button
                        key={`${b.deliveryNumber}-${i}`}
                        disabled={!matchedId}
                        onClick={() => matchedId && openDetail(matchedId)}
                        className="flex w-full items-center justify-between rounded-xl border border-orange-100/60 bg-white px-4 py-2.5 text-left text-sm disabled:cursor-default disabled:opacity-70 dark:border-orange-900/30 dark:bg-[#1a0900]"
                      >
                        <span className="flex flex-col">
                          <span className="font-mono text-xs text-stone-400 dark:text-stone-500">{b.deliveryNumber}</span>
                          <span className="text-xs text-stone-500 dark:text-stone-400">{format(new Date(b.date), 'MMM d, h:mm a')}</span>
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatINR(b.amount)}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>

          {/* ---------------------------- Activity tab ----------------------------- */}
          <TabsContent value="activity" className="mt-5 space-y-2.5">
            {activity.length === 0 ? (
              <EmptyState title="No recent activity" description="Actions you take on deliveries will show up here." />
            ) : (
              activity.map((a) => {
                const dotColor =
                  a.status === 'success'
                    ? 'bg-emerald-500'
                    : a.status === 'failed'
                      ? 'bg-red-500'
                      : a.status === 'cancelled'
                        ? 'bg-stone-400'
                        : a.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-orange-400';
                const matchedId = findByDeliveryNumber(a.deliveryNumber);
                return (
                  <button
                    key={a.id}
                    disabled={!matchedId}
                    onClick={() => matchedId && openDetail(matchedId)}
                    className="flex w-full items-center gap-3 rounded-xl border border-orange-100/60 bg-white px-4 py-3 text-left disabled:cursor-default dark:border-orange-900/30 dark:bg-[#1a0900]"
                  >
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-stone-900 dark:text-stone-100">{a.action}</span>
                      <span className="block truncate text-xs text-stone-400 dark:text-stone-500">
                        {a.customer} · {a.time} · {a.deliveryNumber}
                      </span>
                    </span>
                    {typeof a.earnings === 'number' && a.status === 'success' && (
                      <span className="shrink-0 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatINR(a.earnings)}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ------------------------------ Detail drawer ----------------------------- */}
      <Sheet open={!!openId} onOpenChange={(o) => !o && closeDetail()}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto bg-white p-0 dark:bg-[#1a0900] sm:max-w-md"
        >
          {detailLoading || !detail ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ) : (
            <div className="p-6">
              <SheetHeader className="text-left">
                <div className="flex items-center justify-between gap-2">
                  <SheetTitle className="font-mono text-base text-stone-900 dark:text-stone-100">
                    {detail.deliveryNumber}
                  </SheetTitle>
                  <StatusBadge status={detail.status} />
                </div>
                <SheetDescription asChild>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500 dark:text-stone-400">{TYPE_META[detail.type] ?? detail.type}</span>
                    {detail.charges && (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatINR(detail.charges.totalCharge)}
                      </span>
                    )}
                  </div>
                </SheetDescription>
              </SheetHeader>

              {/* Customer */}
              <div className="mt-5 rounded-2xl bg-orange-50/60 p-4 dark:bg-orange-950/15">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{detail.contact.name}</p>
                <a
                  href={`tel:${detail.contact.phone}`}
                  className="mt-1 flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400"
                >
                  <Phone className="h-3.5 w-3.5" /> {detail.contact.phone}
                </a>
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {detail.address.addressLine1}, {detail.address.city} · {detail.address.pincode}
                </p>
              </div>

              {/* Items */}
              {detail.items.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {detail.items.map((it, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                    >
                      {it.name} × {it.quantity}
                    </span>
                  ))}
                </div>
              )}

              {/* Timeline */}
              <div className="mt-6">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                  Timeline
                </h4>
                <DeliveryTimeline events={detail.tracking?.timeline ?? []} />
              </div>

              {/* Proof */}
              {detail.proof && (
                <div className="mt-6">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                    Proof of delivery
                  </h4>
                  <div className="rounded-2xl border border-orange-100/60 p-4 text-sm dark:border-orange-900/30">
                    {detail.proof.deliveredTo && (
                      <p className="text-stone-600 dark:text-stone-300">
                        Delivered to <span className="font-medium text-stone-900 dark:text-stone-100">{detail.proof.deliveredTo}</span>
                      </p>
                    )}
                    {detail.proof.otp?.verifiedAt && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" /> OTP verified {format(new Date(detail.proof.otp.verifiedAt), 'h:mm a')}
                      </p>
                    )}
                    {detail.proof.photos && detail.proof.photos.length > 0 ? (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {detail.proof.photos.map((p, i) => (
                          <button
                            key={i}
                            onClick={() => setLightboxIndex(i)}
                            className="aspect-square overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.url} alt={p.caption ?? 'Delivery proof'} className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
                        <ImageOff className="h-3.5 w-3.5" /> No photos attached
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {detail.feedback && (
                <div className="mt-6">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                    Feedback
                  </h4>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < detail.feedback!.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200 dark:text-stone-700'}`}
                      />
                    ))}
                  </div>
                  {detail.feedback.comment && (
                    <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-300">"{detail.feedback.comment}"</p>
                  )}
                </div>
              )}

              {/* Issues */}
              {detail.issues && detail.issues.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                    Reported issues
                  </h4>
                  <div className="space-y-1.5">
                    {detail.issues.map((iss, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-300"
                      >
                        <span className="font-medium capitalize">{iss.issueType.replace(/_/g, ' ')}</span>
                        {iss.description && <span> — {iss.description}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Route summary */}
              {detail.route && (
                <p className="mt-6 text-xs text-stone-400 dark:text-stone-500">
                  Route · {detail.route.distance} km · {detail.route.duration} min
                </p>
              )}

              {/* Inline report-issue form */}
              {detail.status !== 'cancelled' && (
                <div className="mt-6 border-t border-orange-100/60 pt-4 dark:border-orange-900/30">
                  {!issueOpen ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIssueOpen(true)}
                      className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400"
                    >
                      <AlertTriangle className="mr-1.5 h-4 w-4" /> Report issue
                    </Button>
                  ) : (
                    <div className="space-y-2.5">
                      <Select value={issueType} onValueChange={setIssueType}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wrong_address">Wrong address</SelectItem>
                          <SelectItem value="customer_not_available">Customer not available</SelectItem>
                          <SelectItem value="item_damaged">Item damaged</SelectItem>
                          <SelectItem value="payment_issue">Payment issue</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        value={issueDesc}
                        onChange={(e) => setIssueDesc(e.target.value)}
                        placeholder="Describe what happened"
                        className="rounded-xl"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={submitIssue}
                          disabled={issueSubmitting}
                          className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white hover:opacity-90"
                        >
                          {issueSubmitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                          Submit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setIssueOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer actions */}
              <div className="mt-6 flex gap-2">
                {detail.address.coordinates && (
                  <Button
                    asChild
                    className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white hover:opacity-90"
                  >
                    <Link href={`/delivery/navigate?deliveryId=${detail._id}`}>
                      <NavigationIcon className="mr-1.5 h-4 w-4" /> Navigate again
                    </Link>
                  </Button>
                )}
                <Button variant="outline" onClick={closeDetail} className="rounded-xl">
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Photo lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && detail?.proof?.photos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6"
            onClick={() => setLightboxIndex(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={detail.proof.photos[lightboxIndex].url}
              alt={detail.proof.photos[lightboxIndex].caption ?? 'Delivery proof'}
              className="max-h-[85vh] max-w-full rounded-xl object-contain"
            />
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute right-6 top-6 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
              aria-label="Close photo"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}