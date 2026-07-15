// // components/delivery/layout/DeliveryFooter.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { Heart, Shield, Clock, Wifi, WifiOff, Navigation, MapPin, Battery, Signal } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
// import { cn } from '@/lib/utils';

// export function DeliveryFooter() {
//   const [currentTime, setCurrentTime] = useState('');
//   const [isOnline, setIsOnline] = useState(true);
//   const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

//   useEffect(() => {
//     const updateTime = () => {
//       setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
//     };
//     updateTime();
//     const interval = setInterval(updateTime, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);
    
//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);

//     // Get battery info if available
//     if ('getBattery' in navigator) {
//       (navigator as any).getBattery().then((battery: any) => {
//         setBatteryLevel(Math.floor(battery.level * 100));
//         battery.addEventListener('levelchange', () => {
//           setBatteryLevel(Math.floor(battery.level * 100));
//         });
//       });
//     }

//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   return (
//     <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
//       <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
//         {/* Left Section */}
//         <div className="flex items-center gap-3">
//           <span>© {new Date().getFullYear()} RentEase Delivery</span>
//           <div className="hidden md:flex items-center gap-1">
//             <Heart className="h-3 w-3 text-orange-500" />
//             <span>Partner App</span>
//           </div>
//         </div>

//         {/* Center Section - Connection Status */}
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-1.5">
//             {isOnline ? (
//               <>
//                 <Wifi className="h-3 w-3 text-green-500" />
//                 <span className="text-green-600 dark:text-green-400">Online</span>
//               </>
//             ) : (
//               <>
//                 <WifiOff className="h-3 w-3 text-red-500" />
//                 <span className="text-red-600 dark:text-red-400">Offline</span>
//               </>
//             )}
//           </div>

//           <div className="h-3 w-px bg-gray-300 dark:bg-gray-700" />

//           <div className="flex items-center gap-1.5">
//             <Clock className="h-3 w-3" />
//             <span>{currentTime}</span>
//           </div>

//           {batteryLevel !== null && (
//             <>
//               <div className="h-3 w-px bg-gray-300 dark:bg-gray-700" />
//               <div className="flex items-center gap-1.5">
//                 <Battery className="h-3 w-3" />
//                 <span>{batteryLevel}%</span>
//               </div>
//             </>
//           )}
//         </div>

//         {/* Right Section */}
//         <div className="flex items-center gap-4">
//           <a href="/delivery/support" className="hover:text-orange-600 transition-colors">
//             Support
//           </a>
//           <a href="/delivery/faq" className="hover:text-orange-600 transition-colors hidden md:inline">
//             FAQ
//           </a>
//           <Badge variant="outline" className="text-[9px] border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400">
//             <Shield className="h-2.5 w-2.5 mr-1" />
//             v2.1.0
//           </Badge>
//         </div>
//       </div>

//       {/* Emergency/Quick Actions Bar - Mobile */}
//       <div className="md:hidden border-t border-gray-100 dark:border-gray-800 px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
//         <div className="flex items-center justify-around">
//           <button className="flex flex-col items-center gap-0.5">
//             <Navigation className="h-4 w-4 text-orange-500" />
//             <span className="text-[9px] text-gray-600 dark:text-gray-400">Navigate</span>
//           </button>
//           <button className="flex flex-col items-center gap-0.5">
//             <MapPin className="h-4 w-4 text-orange-500" />
//             <span className="text-[9px] text-gray-600 dark:text-gray-400">Share Location</span>
//           </button>
//           <button className="flex flex-col items-center gap-0.5">
//             <Signal className="h-4 w-4 text-orange-500" />
//             <span className="text-[9px] text-gray-600 dark:text-gray-400">Report Issue</span>
//           </button>
//         </div>
//       </div>
//     </footer>
//   );
// }


'use client';

import { useState, useEffect } from 'react';
import {
  Heart,
  Shield,
  Clock,
  Wifi,
  WifiOff,
  Navigation,
  MapPin,
  Battery,
  Signal,
  Phone,
  AlertTriangle,
  Zap,
  Star,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';

// ─── Types ──────────────────────────────────────────────────────────────────
interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  addEventListener(type: 'levelchange' | 'chargingchange', listener: EventListener): void;
}

// ─── Shift Timer ─────────────────────────────────────────────────────────────
function useShiftTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DeliveryFooter() {
  const [currentTime, setCurrentTime]   = useState('');
  const [isOnline, setIsOnline]         = useState(true);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging]     = useState(false);
  const shiftTime                       = useShiftTimer();
  const { profile, stats }              = useDeliveryPartner();
  const isOnDuty                        = profile?.availability.isOnDuty ?? false;

  // Clock — update every second for live feel
  useEffect(() => {
    const tick = () =>
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Network status
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Battery API
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: BatteryManager) => {
        setBatteryLevel(Math.floor(battery.level * 100));
        setIsCharging((battery as any).charging ?? false);
        battery.addEventListener('levelchange', () => setBatteryLevel(Math.floor(battery.level * 100)));
        battery.addEventListener('chargingchange', () => setIsCharging((battery as any).charging ?? false));
      });
    }
  }, []);

  const batteryColor =
    batteryLevel === null ? 'text-gray-400' :
    batteryLevel > 50     ? 'text-emerald-500' :
    batteryLevel > 20     ? 'text-amber-500'   : 'text-red-500';

  return (
    <footer className={cn(
      'border-t border-orange-100/80 dark:border-orange-900/30',
      'bg-white/80 dark:bg-[#0e0500]/90 backdrop-blur-sm',
    )}>
      {/* ── Desktop Footer ───────────────────────────────────── */}
      <div className="hidden md:flex items-center justify-between gap-4 px-6 py-2.5 text-xs">

        {/* Left — Branding */}
        <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Truck className="h-3 w-3 text-white" />
            </div>
            <span className="font-black text-gray-600 dark:text-gray-400 tracking-tight">
              Rent<span className="text-orange-500">Ease</span>
            </span>
          </div>
          <div className="h-3 w-px bg-orange-200/60 dark:bg-orange-800/40" />
          <div className="flex items-center gap-1 text-gray-400">
            <Heart className="h-3 w-3 text-orange-400 fill-orange-400" />
            <span>Partner Portal</span>
          </div>
          <div className="h-3 w-px bg-orange-200/60 dark:bg-orange-800/40" />
          <span className="text-gray-400/60">© {new Date().getFullYear()} RentEase</span>
        </div>

        {/* Center — Live status pills */}
        <div className="flex items-center gap-2">
          {/* Network */}
          <div className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all',
            isOnDuty && isOnline
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400',
          )}>
            {isOnDuty && isOnline
              ? <><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /><Wifi className="h-3 w-3" /><span>On Duty</span></>
              : <><WifiOff className="h-3 w-3" /><span>Off Duty</span></>}
          </div>

          {/* Today earnings */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
            <TrendingUp className="h-3 w-3" />
            <span>₹{(stats?.todayEarnings ?? 0).toLocaleString()} today</span>
          </div>

          {/* Clock */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-orange-200/60 dark:border-orange-800/30 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 text-[11px] font-bold">
            <Clock className="h-3 w-3" />
            <span className="tabular-nums">{currentTime}</span>
          </div>

          {/* Shift timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-200/60 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[11px] font-bold">
            <Zap className="h-3 w-3" />
            <span className="tabular-nums">{shiftTime}</span>
            <span className="text-blue-400/70">shift</span>
          </div>

          {/* Battery */}
          {batteryLevel !== null && (
            <div className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold',
              batteryLevel > 50
                ? 'border-emerald-200/60 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/20'
                : batteryLevel > 20
                ? 'border-amber-200/60 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-red-200/60 dark:border-red-800/30 bg-red-50/50 dark:bg-red-950/20',
              batteryColor,
            )}>
              <Battery className="h-3 w-3" />
              <span>{batteryLevel}%</span>
              {isCharging && <Zap className="h-2.5 w-2.5 text-amber-500" />}
            </div>
          )}
        </div>

        {/* Right — Links & version */}
        <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
          <a
            href="/delivery/support"
            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1"
          >
            Support <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <a
            href="/delivery/faq"
            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            FAQ
          </a>
          <a
            href="/delivery/terms"
            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors hidden lg:inline"
          >
            Terms
          </a>
          <div className="h-3 w-px bg-orange-200/60 dark:bg-orange-800/40" />
          <Badge className={cn(
            'rounded-full text-[10px] px-2 py-0.5 h-auto font-bold border',
            'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/40',
            'text-orange-600 dark:text-orange-400',
          )}>
            <Shield className="h-2.5 w-2.5 mr-1" />
            v2.1.0
          </Badge>
        </div>
      </div>

      {/* ── Mobile Footer ──────────────────────────────────────── */}
      <div className="md:hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-orange-100/60 dark:border-orange-900/20 text-[10px]">
          <div className={cn(
            'flex items-center gap-1.5 font-bold',
            isOnDuty && isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500',
          )}>
            <div className={cn('h-1.5 w-1.5 rounded-full', isOnDuty && isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
            {isOnDuty && isOnline ? 'On Duty' : 'Off Duty'}
          </div>

          <div className="flex items-center gap-1 text-orange-500 dark:text-orange-400 font-bold tabular-nums">
            <Zap className="h-3 w-3" />
            {shiftTime}
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            {batteryLevel !== null && (
              <div className={cn('flex items-center gap-0.5 font-semibold', batteryColor)}>
                <Battery className="h-3 w-3" />
                <span>{batteryLevel}%</span>
              </div>
            )}
            <div className="flex items-center gap-0.5 text-gray-400 tabular-nums">
              <Clock className="h-3 w-3" />
              {currentTime}
            </div>
          </div>
        </div>

        {/* Quick-action dock */}
        <div className="grid grid-cols-4 divide-x divide-orange-100/60 dark:divide-orange-900/20">
          {[
            { icon: Navigation, label: 'Navigate',       color: 'text-blue-500',    bg: 'hover:bg-blue-50 dark:hover:bg-blue-950/20' },
            { icon: MapPin,     label: 'Share Location', color: 'text-orange-500',  bg: 'hover:bg-orange-50 dark:hover:bg-orange-950/20' },
            { icon: Phone,      label: 'Call Support',   color: 'text-emerald-500', bg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20' },
            { icon: AlertTriangle, label: 'Report Issue',color: 'text-red-500',     bg: 'hover:bg-red-50 dark:hover:bg-red-950/20' },
          ].map(({ icon: Icon, label, color, bg }) => (
            <button
              key={label}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2.5 transition-colors',
                bg,
              )}
            >
              <Icon className={cn('h-4.5 w-4.5', color)} />
              <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 leading-none">{label}</span>
            </button>
          ))}
        </div>

        {/* Bottom branding strip */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-orange-50/40 dark:bg-orange-950/10 border-t border-orange-100/40 dark:border-orange-900/15">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
              <Truck className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 tracking-tight">
              Rent<span className="text-orange-500">Ease</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <a href="/delivery/support" className="hover:text-orange-500 transition-colors">Support</a>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <a href="/delivery/faq" className="hover:text-orange-500 transition-colors">FAQ</a>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <Badge className="rounded-full text-[9px] px-1.5 h-4 font-bold border bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/30 text-orange-500">
              v2.1
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
}