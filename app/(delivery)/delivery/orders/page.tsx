'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, isToday, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Phone, Navigation, Package, MapPin, Clock, DollarSign, Star, Zap,
  TrendingUp, CheckCircle2, AlertTriangle, MoreVertical, Search,
  Map, List, Filter, ChevronDown, RefreshCw, Loader2, X, Camera,
  FileSignature, User, MessageSquare, Calendar, ArrowRight,
  Truck, RotateCcw, Flag, StickyNote, Copy, Eye, Shield,
  Wifi, WifiOff, Battery, Signal, ChevronRight, Info,
  CheckCheck, XCircle, Timer, Award, Activity, Inbox,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { deliveryPartnerApi } from '@/lib/api/delivery';

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryStatus = 'assigned' | 'out_for_delivery' | 'in_transit' | 'reached' | 'delivered' | 'failed' | 'cancelled' | 'rescheduled';
type DeliveryType   = 'delivery' | 'pickup' | 'exchange' | 'return' | 'maintenance';
type Priority       = 'urgent' | 'high' | 'medium' | 'low';

interface DeliveryItem {
  _id?: string;
  name: string;
  sku?: string;
  quantity: number;
  condition?: string;
  images?: string[];
}

interface Delivery {
  _id: string;
  deliveryNumber: string;
  type: DeliveryType;
  status: DeliveryStatus;
  priority: Priority;
  schedule: {
    scheduledDate: string;
    scheduledSlot?: { start: string; end: string; label?: string };
    deadline?: string;
    rescheduledCount?: number;
  };
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: { type: 'Point'; coordinates: [number, number] };
    contactName?: string
    contactPhone?: string
  };
  contact: { name: string; phone: string; alternatePhone?: string; email?: string };
  items: DeliveryItem[];
  vehicle?: { type: string; number: string };
  route?: { distance?: number; duration?: number; polyline?: string; optimized?: boolean };
  tracking?: {
    currentLocation?: { coordinates: [number, number]; updatedAt: string };
    timeline?: Array<{ status: string; timestamp: string; note?: string }>;
    estimatedArrival?: string;
  };
  charges?: {
    totalCharge?: number;
    paymentMethod?: 'cash' | 'card' | 'wallet' | 'prepaid';
    paymentStatus?: 'pending' | 'paid' | 'failed';
  };
  rental?: { rentalNumber: string };
  earnings?: number;
  distanceToCustomer?: number;
  etaMinutes?: number;
}

interface Profile {
  _id?: string;
  employeeId: string;
  user: {
    profile: { firstName: string; lastName: string };
    phone: string;
  };
  vehicle: { type: string; number: string; model?: string };
  availability: { isAvailable: boolean; isOnDuty: boolean; currentLocation?: { coordinates: [number, number] } };
  performance: { averageRating: number; onTimeRate: number; completedDeliveries: number };
  maxConcurrentDeliveries: number;
}

interface Stats {
  todayDeliveries: number;
  completedToday: number;
  pendingToday: number;
  totalEarnings: number;
  todayEarnings?: number;
  thisWeekEarnings?: number;
  rating: number;
  onTimeRate: number;
  totalDeliveries: number;
  avgDeliveryTime: number;
  acceptanceRate?: number;
  activeDeliveries?: number;
  employeeId?: string;
  zone?: string;
}

// ─── Fallback Data ────────────────────────────────────────────────────────────

const FALLBACK_DELIVERIES: Delivery[] = [
  {
    _id: 'dlv001', deliveryNumber: 'DLV20240115-0042', type: 'delivery',
    status: 'out_for_delivery', priority: 'urgent',
    schedule: { scheduledDate: new Date(Date.now() + 30 * 60000).toISOString(), scheduledSlot: { start: '10:00', end: '12:00' }, deadline: new Date(Date.now() + 90 * 60000).toISOString() },
    address: { addressLine1: 'B-204, Cyber Towers, Sector 62', addressLine2: 'Near Metro Station', city: 'Noida', state: 'UP', pincode: '201301', coordinates: { type: 'Point', coordinates: [77.3636, 28.6280] } },
    contact: { name: 'Priya Sharma', phone: '+91 98765 43210', alternatePhone: '+91 98765 43211', email: 'priya.sharma@gmail.com' },
    items: [{ _id: 'i1', name: 'Sony WH-1000XM5 Headphones', sku: 'SNY-WH1000-BLK', quantity: 1, condition: 'new', images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200'] }],
    vehicle: { type: 'bike', number: 'DL 01 AB 1234' },
    route: { distance: 4.2, duration: 18, optimized: true },
    tracking: { estimatedArrival: new Date(Date.now() + 12 * 60000).toISOString(), timeline: [{ status: 'assigned', timestamp: new Date(Date.now() - 60 * 60000).toISOString(), note: 'Assigned' }, { status: 'out_for_delivery', timestamp: new Date(Date.now() - 20 * 60000).toISOString(), note: 'On the way' }] },
    charges: { totalCharge: 92, paymentMethod: 'prepaid', paymentStatus: 'paid' },
    earnings: 92, distanceToCustomer: 2.1, etaMinutes: 12,
  },
  {
    _id: 'dlv002', deliveryNumber: 'DLV20240115-0043', type: 'pickup',
    status: 'assigned', priority: 'high',
    schedule: { scheduledDate: new Date(Date.now() + 2 * 3600000).toISOString(), scheduledSlot: { start: '13:00', end: '15:00' } },
    address: { addressLine1: 'Tower C, DLF Cyber City', city: 'Gurgaon', state: 'HR', pincode: '122002', coordinates: { type: 'Point', coordinates: [77.0876, 28.4944] } },
    contact: { name: 'Amit Kumar', phone: '+91 99887 76655' },
    items: [{ name: 'MacBook Pro 14"', sku: 'APL-MBP14-2024', quantity: 1, condition: 'good', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200'] }],
    tracking: { timeline: [] },
    charges: { totalCharge: 120, paymentMethod: 'cash', paymentStatus: 'pending' },
    earnings: 120, distanceToCustomer: 8.4, etaMinutes: 32,
  },
  {
    _id: 'dlv003', deliveryNumber: 'DLV20240115-0044', type: 'delivery',
    status: 'in_transit', priority: 'urgent',
    schedule: { scheduledDate: new Date(Date.now() + 20 * 60000).toISOString(), scheduledSlot: { start: '11:00', end: '13:00' }, deadline: new Date(Date.now() + 25 * 60000).toISOString() },
    address: { addressLine1: 'A-12, Greater Kailash Part-II', city: 'New Delhi', state: 'DL', pincode: '110048', coordinates: { type: 'Point', coordinates: [77.2340, 28.5500] } },
    contact: { name: 'Neha Verma', phone: '+91 98000 11222' },
    items: [{ name: 'Samsung 55" QLED TV', sku: 'SSG-Q55-2024', quantity: 1, condition: 'new', images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200'] }],
    tracking: { estimatedArrival: new Date(Date.now() + 6 * 60000).toISOString(), timeline: [{ status: 'in_transit', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), note: 'Near destination' }] },
    charges: { totalCharge: 180, paymentMethod: 'wallet', paymentStatus: 'paid' },
    earnings: 180, distanceToCustomer: 1.3, etaMinutes: 6,
  },
  {
    _id: 'dlv004', deliveryNumber: 'DLV20240115-0045', type: 'exchange',
    status: 'reached', priority: 'medium',
    schedule: { scheduledDate: new Date(Date.now() - 15 * 60000).toISOString(), scheduledSlot: { start: '09:00', end: '11:00' } },
    address: { addressLine1: '301, Prestige Shantiniketan', addressLine2: 'Whitefield Main Road', city: 'Bengaluru', state: 'KA', pincode: '560048' },
    contact: { name: 'Vikram Nair', phone: '+91 97000 55443' },
    items: [{ name: 'Canon DSLR EOS 1500D', sku: 'CN-1500D', quantity: 1, condition: 'refurbished', images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200'] }, { name: 'Tripod Stand', sku: 'TRP-001', quantity: 1, condition: 'good' }],
    tracking: { estimatedArrival: new Date(Date.now() - 5 * 60000).toISOString(), timeline: [{ status: 'reached', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), note: 'Reached customer location' }] },
    charges: { totalCharge: 75, paymentMethod: 'prepaid', paymentStatus: 'paid' },
    earnings: 75, distanceToCustomer: 0, etaMinutes: 0,
  },
  {
    _id: 'dlv005', deliveryNumber: 'DLV20240115-0046', type: 'return',
    status: 'assigned', priority: 'low',
    schedule: { scheduledDate: new Date(Date.now() + 4 * 3600000).toISOString(), scheduledSlot: { start: '15:00', end: '17:00' } },
    address: { addressLine1: '22B, Marine Drive Apartments', city: 'Mumbai', state: 'MH', pincode: '400002' },
    contact: { name: 'Sneha Joshi', phone: '+91 91234 56789' },
    items: [{ name: 'Dyson V15 Vacuum Cleaner', sku: 'DYS-V15-GOLD', quantity: 1, condition: 'used', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200'] }],
    tracking: { timeline: [] },
    charges: { totalCharge: 60, paymentMethod: 'cash', paymentStatus: 'pending' },
    earnings: 60, distanceToCustomer: 15.2, etaMinutes: 55,
  },
  {
    _id: 'dlv006', deliveryNumber: 'DLV20240115-0047', type: 'delivery',
    status: 'out_for_delivery', priority: 'medium',
    schedule: { scheduledDate: new Date(Date.now() + 45 * 60000).toISOString(), scheduledSlot: { start: '12:00', end: '14:00' } },
    address: { addressLine1: 'Block 7, Hiranandani Gardens', city: 'Mumbai', state: 'MH', pincode: '400076' },
    contact: { name: 'Rohan Mehta', phone: '+91 96543 21098' },
    items: [{ name: 'LG 1.5 Ton Split AC', sku: 'LG-AC15-INV', quantity: 1, condition: 'new', images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200'] }],
    tracking: { estimatedArrival: new Date(Date.now() + 28 * 60000).toISOString(), timeline: [{ status: 'out_for_delivery', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), note: 'En route' }] },
    charges: { totalCharge: 200, paymentMethod: 'card', paymentStatus: 'paid' },
    earnings: 200, distanceToCustomer: 6.7, etaMinutes: 28,
  },
];

const FALLBACK_PROFILE: Profile = {
  employeeId: 'DLV25001',
  user: { profile: { firstName: 'Rahul', lastName: 'Sharma' }, phone: '+91 98765 11111' },
  vehicle: { type: 'bike', number: 'DL 01 AB 1234', model: 'Honda Activa 6G' },
  availability: { isAvailable: true, isOnDuty: true, currentLocation: { coordinates: [77.3520, 28.6210] } },
  performance: { averageRating: 4.9, onTimeRate: 96, completedDeliveries: 156 },
  maxConcurrentDeliveries: 5,
};

const FALLBACK_STATS: Stats = {
  todayDeliveries: 6, completedToday: 2, pendingToday: 4,
  totalEarnings: 18750, todayEarnings: 727,
  rating: 4.9, onTimeRate: 96, totalDeliveries: 156, avgDeliveryTime: 28,
};

// ─── Config maps ──────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; border: string; bg: string; dot: string }> = {
  urgent: { label: 'URGENT', color: 'text-red-600 dark:text-red-400',   border: 'border-l-red-500',   bg: 'bg-red-50 dark:bg-red-950/30',   dot: 'bg-red-500' },
  high:   { label: 'HIGH',   color: 'text-orange-600 dark:text-orange-400', border: 'border-l-orange-500', bg: 'bg-orange-50/50 dark:bg-orange-950/20', dot: 'bg-orange-500' },
  medium: { label: 'MED',    color: 'text-amber-600 dark:text-amber-400',   border: 'border-l-amber-500',  bg: 'bg-amber-50/50 dark:bg-amber-950/20',  dot: 'bg-amber-500' },
  low:    { label: 'LOW',    color: 'text-emerald-600 dark:text-emerald-400', border: 'border-l-emerald-500', bg: 'bg-emerald-50/30 dark:bg-emerald-950/10', dot: 'bg-emerald-500' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; pulse?: boolean }> = {
  assigned:         { label: 'Assigned',       color: 'text-blue-700 dark:text-blue-400',   bg: 'bg-blue-100 dark:bg-blue-950/40' },
  out_for_delivery: { label: 'On the Way',     color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-950/40', pulse: true },
  in_transit:       { label: 'In Transit',     color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-950/40', pulse: true },
  reached:          { label: 'Reached',        color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/40' },
};

const TYPE_CONFIG: Record<DeliveryType, { label: string; icon: React.ElementType; color: string }> = {
  delivery:    { label: 'Delivery',    icon: Truck,      color: 'text-blue-500' },
  pickup:      { label: 'Pickup',      icon: Package,    color: 'text-purple-500' },
  exchange:    { label: 'Exchange',    icon: RotateCcw,  color: 'text-amber-500' },
  return:      { label: 'Return',      icon: ArrowRight, color: 'text-red-500' },
  maintenance: { label: 'Service',     icon: Shield,     color: 'text-teal-500' },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  const delays = [500, 1000, 2000];
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); }
    catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (i === retries || (status && status < 500)) throw err;
      await new Promise(r => setTimeout(r, delays[i] ?? 2000));
    }
  }
  throw new Error('Max retries exceeded');
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-orange-100/60 dark:border-orange-900/30 bg-white dark:bg-[#1a0900] p-4 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="h-3 w-48 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
      <div className="flex gap-2">
        <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-14 w-14 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-14 w-14 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-9 flex-1 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 flex-1 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 flex-1 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub?: string; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="rounded-2xl border border-orange-100/60 dark:border-orange-900/30 bg-white dark:bg-[#1a0900] p-4 shadow-sm shadow-orange-100/30 dark:shadow-black/20"
    >
      <div className="flex items-start justify-between mb-2">
        <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', color)}>
          <Icon className="h-4.5 w-4.5 text-white" />
        </div>
        {sub && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full">{sub}</span>}
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums leading-none">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</p>
    </motion.div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

interface OrderCardProps {
  delivery: Delivery;
  onAction: (delivery: Delivery, action: string) => void;
  isActing: boolean;
}


// ─── Complete Delivery Sheet (5-step wizard) ──────────────────────────────────


function OrderCard({ delivery, onAction, isActing }: OrderCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const pc = PRIORITY_CONFIG[delivery.priority] ?? { label: 'Normal', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300', dot: 'bg-gray-400' };
  const sc = STATUS_CONFIG[delivery.status] ?? { label: delivery.status, color: 'text-gray-600', bg: 'bg-gray-100' };
  const tc = TYPE_CONFIG[delivery.type] ?? { label: delivery.type, color: 'text-gray-500', icon: Package };

  const TypeIcon = tc.icon;

  const contactName = delivery.address?.contactName || delivery.contact?.name || 'Customer';
  const contactPhone = delivery.address?.contactPhone || delivery.contact?.phone || '';

  const isOverdue = Boolean(
    delivery.schedule?.deadline && 
    Date.now() > new Date(delivery.schedule.deadline).getTime()
  );

  const ctaConfig = useMemo(() => {
    const map: Record<DeliveryStatus, { label: string; action: string; color: string }> = {
      assigned:         { label: 'Start Delivery',    action: 'start',    color: 'from-blue-500 to-blue-600' },
      out_for_delivery: { label: 'Mark In Transit',   action: 'progress', color: 'from-indigo-500 to-purple-600' },
      in_transit:       { label: "I've Arrived",      action: 'arrived',  color: 'from-purple-500 to-purple-600' },
      reached:          { label: 'Complete Delivery', action: 'complete', color: 'from-orange-500 to-amber-500' },
      delivered:        { label: 'Completed',         action: '',         color: 'from-emerald-500 to-emerald-600' },
      failed:           { label: 'Failed',            action: '',         color: 'from-red-500 to-red-600' },
      cancelled:        { label: 'Cancelled',         action: '',         color: 'from-gray-400 to-gray-500' },
      rescheduled:      { label: 'Rescheduled',       action: '',         color: 'from-amber-500 to-amber-600' },
    };
    return map[delivery.status as DeliveryStatus] ?? { label: delivery.status, action: '', color: 'from-gray-400 to-gray-500' };
  }, [delivery.status]);

  const menuItems = [
    { icon: Eye,          label: 'View Details',  action: 'detail' },
    { icon: StickyNote,   label: 'Add Notes',     action: 'notes' },
    { icon: Flag,         label: 'Report Issue',  action: 'report' },
    { icon: Calendar,     label: 'Reschedule',    action: 'reschedule' },
    { icon: XCircle,      label: 'Mark Failed',   action: 'fail', danger: true },
    { icon: Copy,         label: 'Copy Address',  action: 'copyAddress' },
  ];

  const handleCopyAddress = useCallback(() => {
    const addr = [
      delivery.address?.addressLine1,
      delivery.address?.addressLine2,
      `${delivery.address?.city}, ${delivery.address?.state} ${delivery.address?.pincode}`,
    ].filter(Boolean).join(', ');

    if (addr) {
      navigator.clipboard.writeText(addr);
    }
    setMenuOpen(false);
  }, [delivery.address]);

  // Safe scheduled slot display
  const scheduledSlotDisplay = delivery.schedule?.scheduledSlot 
    ? typeof delivery.schedule.scheduledSlot === 'string' 
      ? delivery.schedule.scheduledSlot 
      : `${delivery.schedule.scheduledSlot.start}–${delivery.schedule.scheduledSlot.end}`
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={cn(
        'relative rounded-2xl border border-orange-100/60 dark:border-orange-900/30',
        'bg-white dark:bg-[#1a0900]',
        'border-l-4', pc.border,
        'shadow-sm shadow-orange-100/20 dark:shadow-black/30',
        'overflow-hidden group',
      )}
    >
      {isOverdue && (
        <div className="absolute inset-0 border-2 border-red-500/30 rounded-2xl pointer-events-none animate-pulse" />
      )}

      <div className="p-4 space-y-3">
        {/* Row 1 — number · priority · type · menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-xs font-black text-gray-500 dark:text-gray-400 tracking-tight font-mono">
              #{delivery.deliveryNumber?.slice(-8) || 'N/A'}
            </span>
            <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-md', pc.color, pc.bg)}>
              {pc.label}
            </span>
            <span className={cn('flex items-center gap-1 text-[10px] font-semibold', tc.color)}>
              <TypeIcon className="h-3 w-3" />
              {tc.label.toUpperCase()}
            </span>
            {isOverdue && (
              <span className="flex items-center gap-1 text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded-md animate-pulse">
                <AlertTriangle className="h-3 w-3" />OVERDUE
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={cn('flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full', sc.color, sc.bg)}>
              {sc.pulse && <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', pc.dot)} />}
              {sc.label}
            </span>

            {/* Three-dot menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-600 transition-colors"
                aria-label="More actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-orange-100/60 dark:border-orange-900/30 bg-white dark:bg-[#1f0a00] shadow-xl shadow-orange-900/10 dark:shadow-black/40 py-1 overflow-hidden"
                  >
                    {menuItems.map(item => (
                      <button
                        key={item.action}
                        onClick={() => {
                          setMenuOpen(false);
                          if (item.action === 'copyAddress') {
                            handleCopyAddress();
                            return;
                          }
                          onAction(delivery, item.action);
                        }}
                        className={cn(
                          'flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors',
                          item.danger
                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-700 dark:hover:text-orange-300',
                        )}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />}
            </div>
          </div>
        </div>

        {/* Row 2 — Customer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-[10px] font-black shrink-0">
              {contactName.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{contactName}</p>
              {contactPhone && <p className="text-[10px] text-gray-400">{contactPhone}</p>}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">4.8</span>
          </div>
        </div>

        {/* Row 3 — Address */}
        <div className="flex items-start gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
            {delivery.address?.addressLine1}
            {delivery.address?.addressLine2 && `, ${delivery.address.addressLine2}`}
            {`, ${delivery.address?.city}, ${delivery.address?.state} ${delivery.address?.pincode}`}
          </p>
        </div>

        {/* Row 4 — Time · ETA · Distance */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {scheduledSlotDisplay && (
            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3 text-orange-400" />
              <span className="font-semibold">{scheduledSlotDisplay}</span>
            </div>
          )}
          {delivery.etaMinutes !== undefined && delivery.etaMinutes > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <Timer className="h-3 w-3 text-blue-400" />
              <span className="font-semibold">ETA {delivery.etaMinutes} min</span>
            </div>
          )}
          {delivery.distanceToCustomer !== undefined && delivery.distanceToCustomer > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <Navigation className="h-3 w-3 text-purple-400" />
              <span className="font-semibold">{delivery.distanceToCustomer} km</span>
            </div>
          )}
        </div>

        {/* Row 5 — Earnings · Payment · Items */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                ₹{delivery.earnings ?? delivery.charges?.totalCharge ?? 0}
              </span>
            </div>
            {delivery.charges?.paymentMethod && (
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                delivery.charges.paymentStatus === 'paid'
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                  : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
              )}>
                {delivery.charges.paymentMethod === 'cash' ? '💵 CASH' : 
                 delivery.charges.paymentMethod === 'prepaid' ? '✅ PAID' : 
                 delivery.charges.paymentMethod.toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            <Package className="h-3 w-3 inline mr-1" />
            {delivery.items?.length || 0} item{(delivery.items?.length || 0) !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Row 6 — Item thumbnails */}
        {delivery.items?.some((i: any) => i.images?.length) && (
          <div className="flex items-center gap-2">
            {delivery.items.slice(0, 3).map((item: any, idx: number) => (
              item.images?.[0] ? (
                <div key={idx} className="relative h-14 w-14 rounded-xl overflow-hidden border border-orange-100 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-950/20 shrink-0">
                  <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
                </div>
              ) : null
            ))}
            {(delivery.items?.length ?? 0) > 3 && (
              <div className="h-14 w-14 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 flex items-center justify-center shrink-0">
                <span className="text-xs font-black text-orange-500">+{(delivery.items.length - 3)}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate font-medium">
                {delivery.items?.[0]?.name || 'Item'}
              </p>
              {delivery.items?.[0]?.condition && (
                <span className="text-[9px] text-gray-400 uppercase">{delivery.items[0].condition}</span>
              )}
            </div>
          </div>
        )}

        {/* Row 7 — Action footer */}
        <div className="flex items-center gap-2 pt-1 border-t border-orange-50 dark:border-orange-900/20">
          {contactPhone && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`tel:${contactPhone}`}
                    className="flex items-center justify-center h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors shrink-0"
                    aria-label="Call Customer"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Call Customer</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  // href={delivery.address?.coordinates
                  //   ? `https://maps.google.com/?q=${delivery.address.coordinates?.coordinates[1]},${delivery.address.coordinates?.coordinates[0]}`
                  //   : `https://maps.google.com/?q=${encodeURIComponent(`${delivery?.address?.addressLine1}, ${delivery.address?.city}`)}`}
                  href={
                      delivery.address?.coordinates?.coordinates?.length === 2
                        ? `https://maps.google.com/?q=${delivery.address.coordinates.coordinates[1]},${delivery.address.coordinates.coordinates[0]}`
                        : `https://maps.google.com/?q=${encodeURIComponent(
                            [
                              delivery.address?.addressLine1,
                              delivery.address?.addressLine2,
                              delivery.address?.city,
                              delivery.address?.state,
                              delivery.address?.pincode,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          )}`
                    }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors shrink-0"
                  aria-label="Navigate to address"
                >
                  <Navigation className="h-4 w-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Navigate</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {ctaConfig.action && (
            <Button
              onClick={() => onAction(delivery, ctaConfig.action)}
              disabled={isActing}
              className={cn(
                'flex-1 h-9 rounded-xl text-xs font-bold text-white',
                'bg-gradient-to-r shadow-sm',
                ctaConfig.color,
                'focus-visible:ring-2 focus-visible:ring-orange-500',
              )}
              aria-label={ctaConfig.label}
            >
              {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <><span>{ctaConfig.label}</span><ChevronRight className="h-3.5 w-3.5 ml-1" /></>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface CompleteSheetProps {
  delivery: Delivery | null;
  open: boolean;
  onClose: () => void;
  onComplete: (id: string, data: FormData) => Promise<void>;
  token: string;
}

function CompleteSheet({ delivery, open, onClose, onComplete, token }: CompleteSheetProps) {
  const [step, setStep] = useState(1);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // if (delivery) {
    //   // setRecipientName(delivery.address.contactName);
    //   // setRecipientPhone(delivery.address.contactPhone);
      
    // }

    if (delivery) {
      setRecipientName(delivery.address.contactName ?? '');
      setRecipientPhone(delivery.address.contactPhone ?? '');
    }
    setStep(1); setOtp(''); setOtpSent(false); setOtpVerified(false);
    setPhotos([]); setPhotoPreviews([]); setNotes(''); setHasSig(false);
  }, [delivery, open]);

  useEffect(() => {
    if (otpCountdown > 0) {
      const id = setTimeout(() => setOtpCountdown(v => v - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [otpCountdown]);

  const handleSendOtp = async () => {
    if (!delivery) return;
    setIsLoading(true);
    try {
      await withRetry(() => deliveryPartnerApi.generateOtp(delivery._id));
      setOtpSent(true); setOtpCountdown(60);
      toast.success('OTP sent to customer. Check their phone for the 6-digit code.');
    } catch {
      toast.error('Could not send OTP. Please try again.');
    } finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!delivery) return;
    setIsLoading(true);
    try {
      const res = await withRetry(() => deliveryPartnerApi.verifyOtp(delivery._id, otp));
      if (res.data?.verified) { setOtpVerified(true); toast.success('OTP verified ✓'); }
      else toast.error('Invalid OTP');
    } catch {
      toast.error('Verification failed');
    } finally { setIsLoading(false); }
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 10 - photos.length);
    setPhotos(prev => [...prev, ...files]);
    files.forEach(f => { const r = new FileReader(); r.onload = ev => setPhotoPreviews(p => [...p, ev.target?.result as string]); r.readAsDataURL(f); });
  };

  // Canvas drawing
  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true); setHasSig(true);
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.lineTo(x, y); ctx.strokeStyle = '#ea580c'; ctx.lineWidth = 2; ctx.stroke();
  };
  const endDraw = () => setIsDrawing(false);
  const clearSig = () => { const c = canvasRef.current; if (!c) return; c.getContext('2d')?.clearRect(0, 0, c.width, c.height); setHasSig(false); };

  const handleSubmit = async () => {
    if (!delivery) return;
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('recipientName', recipientName);
      fd.append('recipientPhone', recipientPhone);
      if (otp) fd.append('otp', otp);
      if (notes) fd.append('notes', notes);
      photos.forEach(p => fd.append('photos', p));
      if (hasSig && canvasRef.current) {
        const blob = await new Promise<Blob | null>(r => canvasRef.current!.toBlob(r));
        if (blob) fd.append('signature', blob, 'signature.png');
      }
      await onComplete(delivery._id, fd);
    } finally { setIsLoading(false); }
  };

  const steps = ['Recipient', 'OTP', 'Photos', 'Signature', 'Submit'];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[92vh] rounded-t-3xl bg-white dark:bg-[#1a0900] border-orange-200/60 dark:border-orange-900/30 p-0 overflow-hidden">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-orange-100/60 dark:border-orange-900/20">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-black text-gray-900 dark:text-white">Complete Delivery</SheetTitle>
            <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-950/30" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-1 mt-3">
            {steps.map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center gap-1">
                <div className={cn('h-1.5 w-full rounded-full transition-all duration-300', i + 1 <= step ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-orange-100 dark:bg-orange-900/30')} />
                <span className={cn('text-[9px] font-bold hidden sm:block', i + 1 <= step ? 'text-orange-500' : 'text-gray-400')}>{s}</span>
              </div>
            ))}
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-full px-5 pb-32 pt-4 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Confirm recipient details</p>
              <div className="space-y-2">
                <label className="text-xs font-bold text-orange-500 uppercase tracking-wider">Recipient Name *</label>
                <Input value={recipientName} onChange={e => setRecipientName(e.target.value)} className="rounded-xl border-orange-200/60 dark:border-orange-800/30" placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-orange-500 uppercase tracking-wider">Phone</label>
                <Input value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} className="rounded-xl border-orange-200/60 dark:border-orange-800/30" placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Verify customer OTP</p>
              {!otpVerified ? (
                <>
                  <Button onClick={handleSendOtp} disabled={isLoading || otpCountdown > 0} className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {otpSent ? (otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend OTP') : 'Send OTP to Customer'}
                  </Button>
                  {otpSent && (
                    <div className="space-y-2">
                      <Input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="Enter 6-digit OTP" className="rounded-xl text-center text-2xl font-black tracking-[0.5em] border-orange-200/60 dark:border-orange-800/30" />
                      <Button onClick={handleVerifyOtp} disabled={otp.length !== 6 || isLoading} className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCheck className="h-4 w-4 mr-2" />}Verify OTP
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  </div>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">OTP Verified!</p>
                </div>
              )}
              <button onClick={() => setStep(3)} className="w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline text-center py-1">
                Skip OTP verification
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Upload delivery photos ({photos.length}/10)</p>
              <label className="flex flex-col items-center justify-center gap-2 h-28 rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-700/50 bg-orange-50/50 dark:bg-orange-950/10 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors">
                <Camera className="h-6 w-6 text-orange-400" />
                <span className="text-sm text-orange-600 dark:text-orange-400 font-semibold">Tap to capture / upload</span>
                <span className="text-xs text-gray-400">Up to 10 photos</span>
                <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handlePhotos} />
              </label>
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviews.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                      <img src={p} alt="" className="h-full w-full object-cover" />
                      <button onClick={() => { setPhotos(arr => arr.filter((_, j) => j !== i)); setPhotoPreviews(arr => arr.filter((_, j) => j !== i)); }} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center" aria-label="Remove photo">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Customer signature</p>
                <button onClick={clearSig} className="text-xs text-red-500 hover:text-red-700 font-semibold">Clear</button>
              </div>
              <canvas
                ref={canvasRef}
                width={340} height={180}
                className="w-full rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-700/50 bg-orange-50/30 dark:bg-orange-950/10 touch-none cursor-crosshair"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                aria-label="Signature pad"
              />
              {!hasSig && <p className="text-xs text-center text-gray-400">Draw signature above</p>}
              <div className="space-y-2">
                <label className="text-xs font-bold text-orange-500 uppercase tracking-wider">Delivery Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any notes about the delivery..." className="w-full rounded-xl border border-orange-200/60 dark:border-orange-800/30 bg-transparent text-sm text-gray-800 dark:text-gray-200 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Review & Submit</p>
              <div className="rounded-2xl border border-orange-100/60 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-950/10 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Recipient</span><span className="font-bold text-gray-900 dark:text-white">{recipientName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">OTP</span><span className={cn('font-bold', otpVerified ? 'text-emerald-600' : 'text-amber-500')}>{otpVerified ? 'Verified ✓' : 'Skipped'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Photos</span><span className="font-bold text-gray-900 dark:text-white">{photos.length} uploaded</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Signature</span><span className={cn('font-bold', hasSig ? 'text-emerald-600' : 'text-amber-500')}>{hasSig ? 'Captured' : 'Not drawn'}</span></div>
                {notes && <div className="flex justify-between"><span className="text-gray-500">Notes</span><span className="font-bold text-gray-900 dark:text-white text-right max-w-[60%]">{notes}</span></div>}
              </div>
              <Button onClick={handleSubmit} disabled={!recipientName || isLoading} className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm shadow-lg shadow-orange-900/20">
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</> : <><CheckCircle2 className="h-4 w-4 mr-2" />Confirm Delivery Complete</>}
              </Button>
            </div>
          )}
        </div>

        {/* Step nav footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-[#1a0900]/95 backdrop-blur-sm border-t border-orange-100/60 dark:border-orange-900/20 px-5 py-4 flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 h-11 rounded-xl border-orange-200 dark:border-orange-800/30 text-orange-700 dark:text-orange-300 font-bold" disabled={isLoading}>
              Back
            </Button>
          )}
          {step < 5 && (
            <Button onClick={() => setStep(s => s + 1)} disabled={(step === 1 && !recipientName) || isLoading} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold">
              Next →
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Fail Dialog ──────────────────────────────────────────────────────────────

function FailDialog({ delivery, open, onClose, onSubmit }: { delivery: Delivery | null; open: boolean; onClose: () => void; onSubmit: (id: string, reason: string, notes: string, reschedule: boolean) => Promise<void> }) {
  const [reason, setReason] = useState('customer_not_available');
  const [notes, setNotes] = useState('');
  const [reschedule, setReschedule] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const reasons = [
    { value: 'customer_not_available', label: 'Customer not available' },
    { value: 'wrong_address', label: 'Wrong address' },
    { value: 'damaged_item', label: 'Damaged item' },
    { value: 'vehicle_issue', label: 'Vehicle issue' },
    { value: 'other', label: 'Other reason' },
  ];
  const handleSubmit = async () => {
    if (!delivery || notes.length < 10) return;
    setIsLoading(true);
    try { await onSubmit(delivery._id, reason, notes, reschedule); }
    finally { setIsLoading(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl bg-white dark:bg-[#1a0900] border border-orange-100/60 dark:border-orange-900/30 max-w-sm mx-4 shadow-xl shadow-orange-900/10 dark:shadow-black/50">
        <DialogHeader><DialogTitle className="font-black text-gray-900 dark:text-white flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" />Mark Delivery Failed</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            {reasons.map(r => (
              <label key={r.value} className={cn('flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all', reason === r.value ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-orange-100/60 dark:border-orange-900/30 hover:bg-orange-50 dark:hover:bg-orange-950/10')}>
                <div className={cn('h-4 w-4 rounded-full border-2 flex items-center justify-center', reason === r.value ? 'border-red-500' : 'border-gray-300')}>
                  {reason === r.value && <div className="h-2 w-2 rounded-full bg-red-500" />}
                </div>
                <input type="radio" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} className="sr-only" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{r.label}</span>
              </label>
            ))}
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add details (min 10 characters)…" className="w-full rounded-xl border border-orange-200/60 dark:border-orange-800/30 bg-transparent text-sm text-gray-800 dark:text-gray-200 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-red-400" />
          {notes.length > 0 && notes.length < 10 && <p className="text-xs text-red-500">Add at least 10 characters</p>}
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setReschedule(v => !v)} className={cn('h-5 w-5 rounded border-2 flex items-center justify-center transition-colors', reschedule ? 'border-orange-500 bg-orange-500' : 'border-gray-300')}>
              {reschedule && <CheckCheck className="h-3 w-3 text-white" />}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Auto-reschedule for tomorrow</span>
          </label>
        </div>
        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-orange-200 dark:border-orange-800/30">Cancel</Button>
          <Button onClick={handleSubmit} disabled={notes.length < 10 || isLoading} className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Fail'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Report Dialog ────────────────────────────────────────────────────────────

function ReportDialog({ delivery, open, onClose, onSubmit }: { delivery: Delivery | null; open: boolean; onClose: () => void; onSubmit: (id: string, issueType: string, description: string) => Promise<void> }) {
  const [issueType, setIssueType] = useState('wrong_address');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const issues = [
    { value: 'wrong_address', label: 'Wrong address' },
    { value: 'customer_not_available', label: 'Customer unavailable' },
    { value: 'damaged_item', label: 'Damaged item' },
    { value: 'missing_item', label: 'Missing item' },
    { value: 'other', label: 'Other' },
  ];
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl bg-white dark:bg-[#1a0900] border border-orange-100/60 dark:border-orange-900/30 max-w-sm mx-4 shadow-xl">
        <DialogHeader><DialogTitle className="font-black text-gray-900 dark:text-white flex items-center gap-2"><Flag className="h-5 w-5 text-amber-500" />Report Issue</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {issues.map(i => (
              <button key={i.value} onClick={() => setIssueType(i.value)} className={cn('p-2.5 rounded-xl border text-xs font-semibold text-left transition-all', issueType === i.value ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400' : 'border-orange-100/60 dark:border-orange-900/30 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-950/10')}>
                {i.label}
              </button>
            ))}
          </div>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe the issue in detail…" className="w-full rounded-xl border border-orange-200/60 dark:border-orange-800/30 bg-transparent text-sm text-gray-800 dark:text-gray-200 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-orange-200 dark:border-orange-800/30">Cancel</Button>
          <Button onClick={async () => { if (!delivery) return; setIsLoading(true); try { await onSubmit(delivery._id, issueType, description); } finally { setIsLoading(false); } }} disabled={!description || isLoading} className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reschedule Dialog ────────────────────────────────────────────────────────

function RescheduleDialog({ delivery, open, onClose, onSubmit }: { delivery: Delivery | null; open: boolean; onClose: () => void; onSubmit: (id: string, date: string, slot: string, reason: string) => Promise<void> }) {
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('Morning (9 AM - 12 PM)');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const slots = ['Morning (9 AM - 12 PM)', 'Afternoon (12 PM - 3 PM)', 'Evening (3 PM - 6 PM)', 'Night (6 PM - 9 PM)'];
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl bg-white dark:bg-[#1a0900] border border-orange-100/60 dark:border-orange-900/30 max-w-sm mx-4 shadow-xl">
        <DialogHeader><DialogTitle className="font-black text-gray-900 dark:text-white flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-500" />Reschedule Delivery</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-orange-500 uppercase tracking-wider">New Date</label>
            <Input type="date" min={tomorrow} value={date} onChange={e => setDate(e.target.value)} className="rounded-xl border-orange-200/60 dark:border-orange-800/30" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-orange-500 uppercase tracking-wider">Time Slot</label>
            {slots.map(s => (
              <label key={s} className={cn('flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-sm', slot === s ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' : 'border-orange-100/60 dark:border-orange-900/30 hover:bg-orange-50 dark:hover:bg-orange-950/10')}>
                <div className={cn('h-4 w-4 rounded-full border-2 flex items-center justify-center', slot === s ? 'border-blue-500' : 'border-gray-300')}>
                  {slot === s && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                </div>
                <input type="radio" value={s} checked={slot === s} onChange={() => setSlot(s)} className="sr-only" />
                <span className="font-medium text-gray-700 dark:text-gray-300">{s}</span>
              </label>
            ))}
          </div>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="Reason for rescheduling…" className="w-full rounded-xl border border-orange-200/60 dark:border-orange-800/30 bg-transparent text-sm text-gray-800 dark:text-gray-200 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-orange-200 dark:border-orange-800/30">Cancel</Button>
          <Button onClick={async () => { if (!delivery || !date) return; setIsLoading(true); try { await onSubmit(delivery._id, date, slot, reason); } finally { setIsLoading(false); } }} disabled={!date || isLoading} className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reschedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();

  const [deliveries, setDeliveries]         = useState<Delivery[]>([]);
  const [profile, setProfile]               = useState<Profile | null>(null);
  const [stats, setStats]                   = useState<Stats | null>(null);
  const [isLoading, setIsLoading]           = useState(true);
  const [usingFallback, setUsingFallback]   = useState(false);
  const [activeTab, setActiveTab]           = useState<'all' | DeliveryStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<Set<Priority>>(new Set());
  const [typeFilter, setTypeFilter]         = useState<Set<DeliveryType>>(new Set());
  const [sortBy, setSortBy]                 = useState<'priority' | 'time' | 'distance' | 'earnings'>('priority');
  const [search, setSearch]                 = useState('');
  const [view, setView]                     = useState<'list' | 'map'>('list');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [openSheet, setOpenSheet]           = useState<null | 'complete' | 'fail' | 'report' | 'reschedule' | 'detail'>(null);
  const [actingId, setActingId]             = useState<string | null>(null);
  const [tipsVisible, setTipsVisible]       = useState(true);

  // Shift timer
  const [shiftSecs, setShiftSecs] = useState(0);
  useEffect(() => { const id = setInterval(() => setShiftSecs(s => s + 1), 1000); return () => clearInterval(id); }, []);
  const shiftTime = `${String(Math.floor(shiftSecs / 3600)).padStart(2,'0')}:${String(Math.floor((shiftSecs % 3600) / 60)).padStart(2,'0')}:${String(shiftSecs % 60).padStart(2,'0')}`;

  const token = (session?.user as { accessToken?: string })?.accessToken ?? '';

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/delivery/auth/login');
  }, [status, router]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!token) return;
    const [delivRes, profRes, statsRes] = await Promise.allSettled([
      withRetry(() => deliveryPartnerApi.getActive()),
      withRetry(() => deliveryPartnerApi.getProfile()),
      withRetry(() => deliveryPartnerApi.getStats()),
    ]);

    let deliveriesLoaded = false;
    if (delivRes.status === 'fulfilled') {
      const d = delivRes.value.data?.deliveries;
      if (d?.length) { setDeliveries(d as unknown as Delivery[]); deliveriesLoaded = true; }
    }
    if (!deliveriesLoaded) { setDeliveries(FALLBACK_DELIVERIES); setUsingFallback(true); }

    if (profRes.status === 'fulfilled') setProfile(profRes.value.data?.profile as unknown as Profile ?? FALLBACK_PROFILE);
    else setProfile(FALLBACK_PROFILE);

    if (statsRes.status === 'fulfilled') setStats((statsRes.value.data?.stats as unknown as Stats) ?? FALLBACK_STATS);
    else setStats(FALLBACK_STATS);
  }, [token]);

  useEffect(() => {
    setIsLoading(true);
    fetchAll().finally(() => setIsLoading(false));
  }, [fetchAll]);

  // Poll every 60s when tab visible
  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === 'visible') fetchAll(); }, 60000);
    return () => clearInterval(id);
  }, [fetchAll]);

  // Location heartbeat
  useEffect(() => {
    if (!profile?.availability.isOnDuty || !token) return;
    const id = setInterval(() => {
      navigator.geolocation?.getCurrentPosition(pos => {
        deliveryPartnerApi
          .updateLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.speed ?? undefined, undefined, pos.coords.accuracy)
          .catch(() => {});
      });
    }, 30000);
    return () => clearInterval(id);
  }, [profile, token]);

  // ── Filtered & sorted list ────────────────────────────────────────────────
  const ACTIVE_STATUSES: DeliveryStatus[] = ['assigned', 'out_for_delivery', 'in_transit', 'reached'];
  const PRIORITY_ORDER: Priority[] = ['urgent', 'high', 'medium', 'low'];

  const filteredDeliveries = useMemo(() => {
    let list = deliveries.filter(d => ACTIVE_STATUSES.includes(d.status));
    if (activeTab !== 'all') list = list.filter(d => d.status === activeTab);
    if (priorityFilter.size > 0) list = list.filter(d => priorityFilter.has(d.priority));
    if (typeFilter.size > 0) list = list.filter(d => typeFilter.has(d.type));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.deliveryNumber.toLowerCase().includes(q) ||
        d.contact.name.toLowerCase().includes(q) ||
        d.address.city.toLowerCase().includes(q) ||
        d.address.pincode.includes(q)
      );
    }
    return list.sort((a, b) => {
      if (sortBy === 'priority') return PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
      if (sortBy === 'time') return new Date(a.schedule.scheduledDate).getTime() - new Date(b.schedule.scheduledDate).getTime();
      if (sortBy === 'distance') return (a.distanceToCustomer ?? 99) - (b.distanceToCustomer ?? 99);
      if (sortBy === 'earnings') return (b.earnings ?? 0) - (a.earnings ?? 0);
      return 0;
    });
  }, [deliveries, activeTab, priorityFilter, typeFilter, search, sortBy]);

  // console.log("filter orders-->", filteredDeliveries)

  const tabCounts = useMemo(() => {
    const active = deliveries.filter(d => ACTIVE_STATUSES.includes(d.status));
    return {
      all: active.length,
      assigned: active.filter(d => d.status === 'assigned').length,
      out_for_delivery: active.filter(d => d.status === 'out_for_delivery').length,
      in_transit: active.filter(d => d.status === 'in_transit').length,
      reached: active.filter(d => d.status === 'reached').length,
    };
  }, [deliveries]);

  const activeCount = tabCounts.all;
  const totalEarnings = useMemo(() => deliveries.filter(d => ACTIVE_STATUSES.includes(d.status)).reduce((s, d) => s + (d.earnings ?? 0), 0) + (stats?.todayEarnings ?? 0), [deliveries, stats]);
  const avgEta = useMemo(() => { const vals = filteredDeliveries.filter(d => d.etaMinutes && d.etaMinutes > 0).map(d => d.etaMinutes!); return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0; }, [filteredDeliveries]);

  // ── Action handlers ───────────────────────────────────────────────────────
  // Get the device's current coordinates; returns null if unavailable / denied
  const getCurrentCoords = useCallback((): Promise<{ lat: number; lng: number } | null> =>
    new Promise(resolve => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 },
      );
    }), []);

  const handleAction = useCallback(async (delivery: Delivery, action: string) => {
    setSelectedDelivery(delivery);
    if (['complete', 'fail', 'report', 'reschedule', 'detail'].includes(action)) { setOpenSheet(action as typeof openSheet); return; }

    if (action === 'notes') {
      const note = prompt('Add a note for this delivery:');
      if (!note) return;
      try {
        await withRetry(() => deliveryPartnerApi.upsertNote(delivery._id, note));
        toast.success('Note added');
      } catch { toast.error('Could not save note'); }
      return;
    }

    setActingId(delivery._id);
    const optimisticStatus: Record<string, DeliveryStatus> = { start: 'out_for_delivery', progress: 'in_transit', arrived: 'reached' };
    const newStatus = optimisticStatus[action];
    if (newStatus) setDeliveries(prev => prev.map(d => d._id === delivery._id ? { ...d, status: newStatus } : d));

    // Capture real coordinates for the action
    const coords = await getCurrentCoords();
    const location = coords ?? { lat: 0, lng: 0 };

    try {
      if (action === 'start') {
        await withRetry(() => deliveryPartnerApi.startDelivery(delivery._id, location));
        toast.success('Delivery started! 🚀');
      } else if (action === 'progress') {
        await withRetry(() => deliveryPartnerApi.updateProgress(delivery._id, 'in_transit', location));
        toast.success('Status updated to In Transit');
      } else if (action === 'arrived') {
        await withRetry(() => deliveryPartnerApi.updateProgress(delivery._id, 'reached_location', location));
        toast.success("Great — you've arrived! 📍");
      }
    } catch {
      setDeliveries(prev => prev.map(d => d._id === delivery._id ? { ...d, status: delivery.status } : d));
      toast.error('Action failed', { description: 'Could not update status. Please try again.' });
    } finally { setActingId(null); }
  }, [token, toast, getCurrentCoords]);

  const handleComplete = useCallback(async (id: string, fd: FormData) => {
    await withRetry(() => deliveryPartnerApi.completeDelivery(id, fd));
    setDeliveries(prev => prev.filter(d => d._id !== id));
    setOpenSheet(null);
    toast.success('Delivery completed! 🎉', { description: 'Great work!' });
  }, [toast]);

  const handleFail = useCallback(async (id: string, reason: string, notes: string, reschedule: boolean) => {
    await withRetry(() => deliveryPartnerApi.failDelivery(id, { reason, notes, reschedule }));
    setDeliveries(prev => prev.filter(d => d._id !== id));
    setOpenSheet(null);
    toast.error('Delivery marked as failed', { description: 'Please try again.' });
  }, [toast]);

  const handleReport = useCallback(async (id: string, issueType: string, description: string) => {
    await withRetry(() => deliveryPartnerApi.reportIssue(id, { issueType, description }));
    setOpenSheet(null);
    toast.success('Issue reported successfully');
  }, [toast]);

  const handleReschedule = useCallback(async (id: string, date: string, slot: string, reason: string) => {
    await withRetry(() => deliveryPartnerApi.rescheduleDelivery(id, { newDate: new Date(date).toISOString(), newSlot: slot, reason }));
    setDeliveries(prev => prev.map(d => d._id === id ? { ...d, status: 'rescheduled' } : d));
    setOpenSheet(null);
    toast.success('Delivery rescheduled');
  }, [toast]);

  const togglePriority = useCallback((p: Priority) => {
    setPriorityFilter(prev => { const n = new Set(prev); n.has(p) ? n.delete(p) : n.add(p); return n; });
  }, []);

  const toggleType = useCallback((t: DeliveryType) => {
    setTypeFilter(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  }, []);

  const resetFilters = useCallback(() => {
    setActiveTab('all'); setPriorityFilter(new Set()); setTypeFilter(new Set()); setSearch(''); setSortBy('priority');
  }, []);

  // Performance hint
  const performanceHint = useMemo(() => {
    if (!profile || !stats) return null;
    const name = profile.user.profile.firstName;
    if (stats.onTimeRate < 90) return { text: `You're at ${stats.onTimeRate}% on-time. Hitting 95% unlocks a ₹500 weekly bonus 🎯`, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20', icon: TrendingUp };
    if (activeCount >= profile.maxConcurrentDeliveries) return { text: `You're at full capacity (${activeCount}/${profile.maxConcurrentDeliveries}). New orders won't be assigned until you complete one.`, color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20', icon: AlertTriangle };
    return { text: `Looking great today, ${name}! Keep up the stellar performance 🌟`, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/10', icon: Award };
  }, [profile, stats, activeCount]);

  if (status === 'loading') return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0e0500]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 space-y-5">

          {/* ── Page header ───────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Active Orders</h1>
                  {activeCount > 0 && (
                    <Badge className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black border-0 px-2.5">
                      {activeCount}
                    </Badge>
                  )}
                  {usingFallback && (
                    <Badge className="rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50 text-[10px] font-bold px-2">
                      Demo data
                    </Badge>
                  )}
                </div>
                {/* Live status strip */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">On Duty</span>
                  </div>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">{shiftTime} shift</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-bold">{activeCount} active</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black tabular-nums">₹{stats?.todayEarnings ?? 0} today</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Search */}
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" className="pl-9 h-9 w-52 rounded-xl bg-white dark:bg-[#1a0900] border-orange-200/60 dark:border-orange-900/30 text-sm" />
                  {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="h-3.5 w-3.5" /></button>}
                </div>
                {/* View toggle */}
                <div className="flex rounded-xl border border-orange-200/60 dark:border-orange-900/30 overflow-hidden bg-white dark:bg-[#1a0900]">
                  {[{ v: 'list', icon: List }, { v: 'map', icon: Map }].map(({ v, icon: Icon }) => (
                    <button key={v} onClick={() => setView(v as 'list' | 'map')} className={cn('flex items-center justify-center h-9 w-9 transition-colors', view === v ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300')} aria-label={v === 'list' ? 'List view' : 'Map view'}>
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
                {/* Refresh */}
                <button onClick={() => fetchAll()} className="flex items-center justify-center h-9 w-9 rounded-xl border border-orange-200/60 dark:border-orange-900/30 bg-white dark:bg-[#1a0900] text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors" aria-label="Refresh orders">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mobile search */}
            <div className="relative sm:hidden">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders, customers, areas…" className="pl-9 h-9 w-full rounded-xl bg-white dark:bg-[#1a0900] border-orange-200/60 dark:border-orange-900/30 text-sm" />
              {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><X className="h-3.5 w-3.5" /></button>}
            </div>
          </div>

          {/* ── Stat strip ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {isLoading ? Array(4).fill(null).map((_, i) => (
              <div key={i} className="rounded-2xl border border-orange-100/60 dark:border-orange-900/30 bg-white dark:bg-[#1a0900] p-4 animate-pulse h-24" />
            )) : <>
              <StatCard icon={Activity}    label="Active Now"    value={String(activeCount)}    color="bg-gradient-to-br from-orange-500 to-amber-500" />
              <StatCard icon={Clock}       label="Next Pickup"   value={filteredDeliveries.length > 0 ? formatDistanceToNow(new Date(filteredDeliveries[0].schedule.scheduledDate), { addSuffix: true }) : '—'} color="bg-gradient-to-br from-blue-500 to-blue-600" />
              <StatCard icon={DollarSign}  label="Today's Total" value={`₹${totalEarnings}`}   sub="+₹0" color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
              <StatCard icon={Timer}       label="Avg ETA"       value={avgEta > 0 ? `${avgEta}m` : '—'} color="bg-gradient-to-br from-purple-500 to-purple-600" />
            </>}
          </div>

          {/* ── Performance hint ────────────────────────────────────── */}
          {performanceHint && !isLoading && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className={cn('flex items-center gap-3 rounded-2xl border px-4 py-3', performanceHint.bg, 'border-current/20')}>
              <performanceHint.icon className={cn('h-4 w-4 shrink-0', performanceHint.color)} />
              <p className={cn('text-sm font-semibold', performanceHint.color)}>{performanceHint.text}</p>
            </motion.div>
          )}

          {/* ── Tips banner ─────────────────────────────────────────── */}
          <AnimatePresence>
            {tipsVisible && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="relative rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-24 opacity-10 flex items-center justify-center">
                    <Zap className="h-20 w-20" />
                  </div>
                  <div className="relative flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0"><Info className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black">Pro Tip</p>
                      <p className="text-xs text-white/90 mt-0.5">Always verify the customer's name AND OTP before handing over. Take 2 photos: one of the delivered item, one of the location.</p>
                    </div>
                    <button onClick={() => setTipsVisible(false)} className="shrink-0 h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors" aria-label="Dismiss tip"><X className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Filter tabs + chips ──────────────────────────────────── */}
          <div className="space-y-3">
            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
              <TabsList className="h-9 bg-white dark:bg-[#1a0900] border border-orange-100/60 dark:border-orange-900/30 rounded-xl p-1 gap-0.5 flex-wrap h-auto">
                {[
                  { value: 'all', label: 'All', count: tabCounts.all },
                  { value: 'assigned', label: 'Assigned', count: tabCounts.assigned },
                  { value: 'out_for_delivery', label: 'On the Way', count: tabCounts.out_for_delivery },
                  { value: 'in_transit', label: 'In Transit', count: tabCounts.in_transit },
                  { value: 'reached', label: 'Reached', count: tabCounts.reached },
                ].map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="text-xs font-bold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm px-2.5 py-1.5">
                    {tab.label}
                    {tab.count > 0 && <span className="ml-1.5 text-[10px] font-black opacity-80">({tab.count})</span>}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Priority chips */}
              {(['urgent', 'high', 'medium', 'low'] as Priority[]).map(p => {
                const pc = PRIORITY_CONFIG[p];
                const active = priorityFilter.has(p);
                return (
                  <button key={p} onClick={() => togglePriority(p)} className={cn('text-[10px] font-black px-2.5 py-1 rounded-full border transition-all', active ? cn(pc.color, pc.bg, 'border-current/30 shadow-sm') : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-orange-300 dark:hover:border-orange-700')} aria-pressed={active}>
                    {pc.label}
                  </button>
                );
              })}
              <div className="w-px h-5 bg-orange-200/60 dark:bg-orange-800/30" />
              {(['delivery', 'pickup', 'exchange', 'return'] as DeliveryType[]).map(t => {
                const tc2 = TYPE_CONFIG[t];
                const active = typeFilter.has(t);
                return (
                  <button key={t} onClick={() => toggleType(t)} className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all', active ? cn(tc2.color, 'bg-current/10 border-current/30') : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-orange-300 dark:hover:border-orange-700')} aria-pressed={active}>
                    {tc2.label}
                  </button>
                );
              })}
              <div className="ml-auto flex items-center gap-1.5">
                <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-[#1a0900] border border-orange-100/60 dark:border-orange-900/30 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400" aria-label="Sort orders">
                  <option value="priority">Priority</option>
                  <option value="time">Scheduled ↑</option>
                  <option value="distance">Distance ↑</option>
                  <option value="earnings">Earnings ↓</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Main content ─────────────────────────────────────────── */}
          {view === 'map' ? (
            <div className="rounded-2xl border border-orange-100/60 dark:border-orange-900/30 bg-white dark:bg-[#1a0900] overflow-hidden">
              {/* TODO: integrate Mapbox/Leaflet here */}
              <div className="relative h-72 md:h-96 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 flex items-center justify-center">
                <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ea580c 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="text-center">
                  <Map className="h-12 w-12 text-orange-300 dark:text-orange-700 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-400 dark:text-gray-600">Map view</p>
                  <p className="text-xs text-gray-300 dark:text-gray-700">Integrate Mapbox or Leaflet here</p>
                </div>
                {/* Stop markers */}
                {filteredDeliveries.map((d, i) => (
                  <div key={d._id} className={cn('absolute h-7 w-7 rounded-full text-white text-xs font-black flex items-center justify-center shadow-lg border-2 border-white', PRIORITY_CONFIG[d.priority].dot)} style={{ left: `${15 + i * 15}%`, top: `${25 + (i % 3) * 20}%` }}>
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Stop list */}
              <div className="divide-y divide-orange-50 dark:divide-orange-900/20 max-h-64 overflow-y-auto">
                {filteredDeliveries.map((d, i) => (
                  <div key={d._id} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50/50 dark:hover:bg-orange-950/10 cursor-pointer" onClick={() => { setSelectedDelivery(d); setOpenSheet('detail'); }}>
                    <div className={cn('h-7 w-7 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0', PRIORITY_CONFIG[d.priority].dot)}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{d.contact.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{d.address.addressLine1}, {d.address.city}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">₹{d.earnings ?? 0}</p>
                      {d.etaMinutes ? <p className="text-[10px] text-gray-400">{d.etaMinutes}m</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array(3).fill(null).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : filteredDeliveries.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
                  {deliveries.filter(d => ACTIVE_STATUSES.includes(d.status)).length === 0 ? (
                    <>
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/30 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-orange-400" />
                      </div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">All caught up! 🎉</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You've completed all your active deliveries.</p>
                      <Button onClick={() => router.push('/delivery/history')} variant="outline" className="rounded-xl border-orange-300 dark:border-orange-700/50 text-orange-600 dark:text-orange-400 font-bold">
                        View today's history →
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="h-16 w-16 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mb-4">
                        <Inbox className="h-8 w-8 text-orange-300" />
                      </div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">No orders match</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters or search.</p>
                      <Button onClick={resetFilters} className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold">
                        Reset filters
                      </Button>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredDeliveries.map((d, i) => (
                      <motion.div key={d._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }} exit={{ opacity: 0, scale: 0.97 }}>
                        <OrderCard delivery={d} onAction={handleAction} isActing={actingId === d._id} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}

          {/* ── Reference legend ─────────────────────────────────────── */}
          <details className="group rounded-2xl border border-orange-100/60 dark:border-orange-900/30 bg-white dark:bg-[#1a0900] overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
              <div className="flex items-center gap-2"><Info className="h-4 w-4 text-orange-400" /><span className="text-sm font-bold text-gray-700 dark:text-gray-300">Quick Reference</span></div>
              <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div><p className="font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Priority</p>
                {(['urgent', 'high', 'medium', 'low'] as Priority[]).map(p => <div key={p} className="flex items-center gap-1.5 mb-1"><div className={cn('h-2 w-2 rounded-full', PRIORITY_CONFIG[p].dot)} /><span className="text-gray-600 dark:text-gray-400 capitalize">{p}</span></div>)}</div>
              <div><p className="font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Status Flow</p>
                {['Assigned → On the Way → In Transit → Reached → Complete'].map(s => <p key={s} className="text-gray-500 dark:text-gray-400 leading-relaxed">{s}</p>)}</div>
              <div><p className="font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Payment</p>
                <p className="text-gray-500 mb-0.5">💵 CASH — collect on delivery</p><p className="text-gray-500">✅ PAID — already collected</p></div>
              <div><p className="font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Actions</p>
                <p className="text-gray-500 mb-0.5">📞 Call — dial customer</p><p className="text-gray-500 mb-0.5">🧭 Navigate — open maps</p><p className="text-gray-500">⋮ Menu — more options</p></div>
            </div>
          </details>

          {/* ── Emergency contacts ───────────────────────────────────── */}
          <div className="rounded-2xl border border-red-100/60 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center"><AlertTriangle className="h-3.5 w-3.5 text-red-500" /></div>
                <span className="font-black text-red-700 dark:text-red-400 text-xs">EMERGENCY</span>
              </div>
              <a href="tel:18001234567" className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"><Truck className="h-3.5 w-3.5 text-red-400" />Breakdown: 1800-123-4567</a>
              <a href="tel:18009876543" className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-orange-600 transition-colors"><Phone className="h-3.5 w-3.5 text-orange-400" />Support: 1800-987-6543</a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors"><MessageSquare className="h-3.5 w-3.5 text-emerald-400" />WhatsApp Help</a>
            </div>
          </div>

        </div>{/* /container */}
      </div>{/* /page */}

      {/* ── Sheets & Dialogs ───────────────────────────────────────── */}
      <CompleteSheet delivery={selectedDelivery} open={openSheet === 'complete'} onClose={() => setOpenSheet(null)} onComplete={handleComplete} token={token} />
      <FailDialog delivery={selectedDelivery} open={openSheet === 'fail'} onClose={() => setOpenSheet(null)} onSubmit={handleFail} />
      <ReportDialog delivery={selectedDelivery} open={openSheet === 'report'} onClose={() => setOpenSheet(null)} onSubmit={handleReport} />
      <RescheduleDialog delivery={selectedDelivery} open={openSheet === 'reschedule'} onClose={() => setOpenSheet(null)} onSubmit={handleReschedule} />

      {/* Detail sheet */}
      <Sheet open={openSheet === 'detail'} onOpenChange={() => setOpenSheet(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-white dark:bg-[#1a0900] border-orange-200/60 dark:border-orange-900/30 overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-orange-100/60 dark:border-orange-900/20">
            <SheetTitle className="font-black text-gray-900 dark:text-white">Delivery Details</SheetTitle>
          </SheetHeader>
          {selectedDelivery && (
            <div className="px-5 pt-5 pb-6 space-y-5">
              {/* Basic info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-500 uppercase tracking-wider">Order</span>
                  <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{selectedDelivery.deliveryNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-500 uppercase tracking-wider">Type</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">{selectedDelivery.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-500 uppercase tracking-wider">Priority</span>
                  <span className={cn('text-xs font-black', PRIORITY_CONFIG[selectedDelivery.priority].color)}>{selectedDelivery.priority.toUpperCase()}</span>
                </div>
              </div>
              {/* Customer */}
              <div className="rounded-xl bg-orange-50/50 dark:bg-orange-950/20 p-3 space-y-2">
                <p className="text-xs font-black text-orange-500 uppercase tracking-wider">Customer</p>
                <p className="font-bold text-gray-900 dark:text-white">{selectedDelivery.address.contactName}</p>
                <p className="text-sm text-gray-500">{selectedDelivery.address.contactPhone}</p>
                {selectedDelivery?.contact?.email && <p className="text-sm text-gray-500">{selectedDelivery?.contact?.email}</p>}
              </div>
              {/* Address */}
              <div className="rounded-xl bg-orange-50/50 dark:bg-orange-950/20 p-3 space-y-1">
                <p className="text-xs font-black text-orange-500 uppercase tracking-wider mb-2">Address</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{selectedDelivery.address.addressLine1}</p>
                {selectedDelivery.address.addressLine2 && <p className="text-sm text-gray-500">{selectedDelivery.address.addressLine2}</p>}
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDelivery.address.city}, {selectedDelivery.address.state} — {selectedDelivery.address.pincode}</p>
              </div>
              {/* Items */}
              <div>
                <p className="text-xs font-black text-orange-500 uppercase tracking-wider mb-2">Items ({selectedDelivery.items.length})</p>
                <div className="space-y-2">
                  {selectedDelivery.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.images?.[0] && <img src={item.images[0]} alt={item.name} className="h-10 w-10 rounded-lg object-cover border border-orange-100 dark:border-orange-900/30" />}
                      <div><p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p><p className="text-xs text-gray-500">Qty: {item.quantity} · {item.condition}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Timeline */}
              {selectedDelivery.tracking?.timeline && selectedDelivery.tracking.timeline.length > 0 && (
                <div>
                  <p className="text-xs font-black text-orange-500 uppercase tracking-wider mb-2">Timeline</p>
                  <div className="relative space-y-0 pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-orange-200 dark:before:bg-orange-800/40">
                    {selectedDelivery.tracking.timeline.map((t, i) => (
                      <div key={i} className="relative pb-3 last:pb-0">
                        <div className="absolute left-[-7px] top-1 h-3 w-3 rounded-full border-2 border-orange-500 bg-white dark:bg-[#1a0900]" />
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 capitalize">{t.status.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-gray-400">{format(new Date(t.timestamp), 'hh:mm a, dd MMM')}{t.note && ` · ${t.note}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button onClick={() => { setOpenSheet(null); handleAction(selectedDelivery, 'complete'); }} className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold" disabled={selectedDelivery.status !== 'reached'}>
                  Complete
                </Button>
                <Button variant="outline" onClick={() => { setOpenSheet(null); handleAction(selectedDelivery, 'fail'); }} className="flex-1 rounded-xl border-red-200 dark:border-red-800/30 text-red-500 font-bold">
                  Fail
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

    </TooltipProvider>
  );
}