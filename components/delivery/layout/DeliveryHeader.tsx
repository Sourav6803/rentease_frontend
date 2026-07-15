// // components/delivery/layout/DeliveryHeader.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { usePathname } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import { useDeliverySidebarStore } from '@/store/DeliverySidebarStore';
// import { cn } from '@/lib/utils';
// import {
//   Bell,
//   Search,
//   Menu,
//   X,
//   Wifi,
//   WifiOff,
//   Clock,
//   MapPin,
//   Battery,
//   Signal,
//   Navigation,
//   ChevronDown,
//   User,
//   LogOut,
//   Settings,
//   HelpCircle,
// } from 'lucide-react';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { format } from 'date-fns';

// // Mock notifications
// const notifications = [
//   {
//     id: 1,
//     title: 'New Delivery Assignment',
//     description: 'Pick up from Furniture Store at 2:30 PM',
//     time: '5 min ago',
//     type: 'assignment',
//     read: false,
//   },
//   {
//     id: 2,
//     title: 'Customer Message',
//     description: 'Please call upon arrival',
//     time: '15 min ago',
//     type: 'message',
//     read: false,
//   },
//   {
//     id: 3,
//     title: 'Delivery Completed',
//     description: 'Order #DLV-1234 delivered successfully',
//     time: '1 hour ago',
//     type: 'completed',
//     read: true,
//   },
// ];

// export function DeliveryHeader() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentTime, setCurrentTime] = useState('');
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [isOnline, setIsOnline] = useState(true);
//   const [location, setLocation] = useState({ lat: 0, lng: 0, address: 'Fetching location...' });
  
//   const pathname = usePathname();
//   const { data: session } = useSession();
//   const { setMobileOpen, isCollapsed } = useDeliverySidebarStore();

//   const unreadCount = notifications.filter(n => !n.read).length;

//   useEffect(() => {
//     const updateTime = () => {
//       setCurrentTime(format(new Date(), 'hh:mm a'));
//     };
//     updateTime();
//     const interval = setInterval(updateTime, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     // Simulate getting user location
//     if ('geolocation' in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//             address: 'Current Location',
//           });
//         },
//         (error) => {
//           setLocation(prev => ({ ...prev, address: 'Location unavailable' }));
//         }
//       );
//     }
//   }, []);

//   useEffect(() => {
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);
    
//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);
    
//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   const getPageTitle = () => {
//     const segments = pathname.split('/').filter(Boolean);
//     if (segments.length <= 1) return 'Dashboard';
//     const lastSegment = segments[segments.length - 1];
//     return lastSegment
//       .split('-')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(' ');
//   };

//   const getInitials = () => {
//     const name = session?.user?.name || 'Delivery Partner';
//     return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
//   };

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('Searching for:', searchQuery);
//   };

//   return (
//     <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
//       <div className="flex h-14 items-center justify-between px-4 md:px-6">
//         {/* Left Section */}
//         <div className="flex items-center gap-3">
//           {/* Mobile Menu Button */}
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setMobileOpen(true)}
//             className="lg:hidden text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
//           >
//             <Menu className="h-5 w-5" />
//           </Button>
          
//           {/* Page Title */}
//           <div className="hidden md:block">
//             <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
//               {getPageTitle()}
//             </h1>
//             <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//               <Clock className="h-3 w-3" />
//               <span>{currentTime}</span>
//               <span>•</span>
//               <div className="flex items-center gap-1">
//                 <MapPin className="h-3 w-3" />
//                 <span className="truncate max-w-[200px]">{location.address}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Search Bar - Desktop */}
//         <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
//           <div className="relative w-full">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//             <Input
//               placeholder="Search orders, customers, addresses..."
//               className="w-full pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//         </form>

//         {/* Right Section */}
//         <div className="flex items-center gap-1">
//           {/* Online Status Indicator */}
//           <div className="hidden md:flex items-center gap-2 mr-2 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800">
//             {isOnline ? (
//               <>
//                 <Wifi className="h-3.5 w-3.5 text-green-500" />
//                 <span className="text-xs font-medium text-green-600 dark:text-green-400">Online</span>
//               </>
//             ) : (
//               <>
//                 <WifiOff className="h-3.5 w-3.5 text-red-500" />
//                 <span className="text-xs font-medium text-red-600 dark:text-red-400">Offline</span>
//               </>
//             )}
//           </div>

//           {/* Battery/Signal - Mobile */}
//           <div className="md:hidden flex items-center gap-1 mr-1">
//             <Signal className="h-3.5 w-3.5 text-gray-500" />
//             <Battery className="h-3.5 w-3.5 text-gray-500" />
//           </div>

//           {/* Notifications */}
//           <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="icon" className="relative text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
//                 <Bell className="h-5 w-5" />
//                 {unreadCount > 0 && (
//                   <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
//                     {unreadCount}
//                   </span>
//                 )}
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-80 mt-2 rounded-xl">
//               <DropdownMenuLabel className="flex items-center justify-between">
//                 <span className="font-semibold">Notifications</span>
//                 <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-orange-600">
//                   Mark all read
//                 </Button>
//               </DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <div className="max-h-96 overflow-y-auto">
//                 {notifications.map((notification) => (
//                   <DropdownMenuItem key={notification.id} className="cursor-pointer p-3">
//                     <div className="flex gap-3">
//                       <div className="flex-1">
//                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                           {notification.title}
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                           {notification.description}
//                         </p>
//                         <p className="text-[10px] text-gray-400 mt-1">{notification.time}</p>
//                       </div>
//                       {!notification.read && (
//                         <div className="h-2 w-2 rounded-full bg-orange-500 mt-1" />
//                       )}
//                     </div>
//                   </DropdownMenuItem>
//                 ))}
//               </div>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem className="justify-center">
//                 <Button variant="ghost" size="sm" className="w-full text-xs">
//                   View all notifications
//                 </Button>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           {/* User Menu */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="relative h-9 gap-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
//                 <Avatar className="h-8 w-8 border-2 border-orange-400/60">
//                   <AvatarImage src={session?.user?.image || ''} />
//                   <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs">
//                     {getInitials()}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div className="hidden lg:flex lg:flex-col lg:items-start">
//                   <span className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
//                     {session?.user?.name?.split(' ')[0] || 'Partner'}
//                   </span>
//                   <span className="text-[10px] text-gray-500 dark:text-gray-400">Delivery Partner</span>
//                 </div>
//                 <ChevronDown className="hidden h-3.5 w-3.5 text-gray-400 lg:block" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-64 mt-2 rounded-xl">
//               <DropdownMenuLabel className="font-normal p-3">
//                 <div className="flex flex-col space-y-1">
//                   <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                     {session?.user?.name || 'Delivery Partner'}
//                   </p>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
//                   <Badge className="mt-1 w-fit bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-[9px] px-2">
//                     Delivery Partner
//                   </Badge>
//                 </div>
//               </DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem className="gap-2 cursor-pointer">
//                 <User className="h-4 w-4" />
//                 <span>My Profile</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem className="gap-2 cursor-pointer">
//                 <Settings className="h-4 w-4" />
//                 <span>Settings</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem className="gap-2 cursor-pointer">
//                 <HelpCircle className="h-4 w-4" />
//                 <span>Help Center</span>
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 focus:text-red-600">
//                 <LogOut className="h-4 w-4" />
//                 <span>End Shift</span>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Mobile Search Bar */}
//       <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2 md:hidden">
//         <form onSubmit={handleSearch} className="relative">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//           <Input
//             placeholder="Search..."
//             className="w-full pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </form>
//       </div>
//     </header>
//   );
// }


'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDeliverySidebarStore } from '@/store/DeliverySidebarStore';
import { cn } from '@/lib/utils';
import {
  Bell,
  Search,
  Menu,
  Wifi,
  WifiOff,
  Clock,
  MapPin,
  Navigation,
  ChevronDown,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Package,
  Star,
  TrendingUp,
  Zap,
  CheckCircle2,
  MessageSquare,
  X,
  Truck,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  type: 'assignment' | 'message' | 'completed' | 'alert';
  read: boolean;
}

// ─── Data ──────────────────────────────────────────────────────────────────
const notifications: Notification[] = [
  {
    id: 1,
    title: 'New Delivery Assignment',
    description: 'Pick up from Furniture Store at 2:30 PM',
    time: '5 min ago',
    type: 'assignment',
    read: false,
  },
  {
    id: 2,
    title: 'Customer Message',
    description: 'Please call upon arrival — Apt 4B',
    time: '15 min ago',
    type: 'message',
    read: false,
  },
  {
    id: 3,
    title: 'Delivery Completed',
    description: 'Order #DLV-1234 delivered successfully',
    time: '1 hour ago',
    type: 'completed',
    read: true,
  },
  {
    id: 4,
    title: 'Zone Bonus Active',
    description: 'Earn 2× in Sector 5 until 6 PM',
    time: '2 hours ago',
    type: 'alert',
    read: true,
  },
];

// ─── Notification Icon ─────────────────────────────────────────────────────
function NotificationIcon({ type }: { type: Notification['type'] }) {
  const map = {
    assignment: { icon: Truck,         bg: 'bg-blue-500/15',   color: 'text-blue-400' },
    message:    { icon: MessageSquare, bg: 'bg-purple-500/15', color: 'text-purple-400' },
    completed:  { icon: CheckCircle2,  bg: 'bg-emerald-500/15',color: 'text-emerald-400' },
    alert:      { icon: Zap,           bg: 'bg-amber-500/15',  color: 'text-amber-400' },
  };
  const { icon: Icon, bg, color } = map[type];
  return (
    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', bg)}>
      <Icon className={cn('h-4 w-4', color)} />
    </div>
  );
}

// ─── Page title map ────────────────────────────────────────────────────────
function getPageMeta(pathname: string): { title: string; subtitle: string } {
  const map: Record<string, { title: string; subtitle: string }> = {
    '/delivery':           { title: 'Dashboard',      subtitle: 'Welcome back' },
    '/delivery/dashboard': { title: 'Dashboard',      subtitle: 'Welcome back' },
    '/delivery/orders':    { title: 'Active Orders',   subtitle: 'Live deliveries' },
    '/delivery/navigate':  { title: 'Navigate',        subtitle: 'GPS & routing' },
    '/delivery/schedule':  { title: 'Schedule',        subtitle: 'Your upcoming shifts' },
    '/delivery/earnings':  { title: 'Earnings',        subtitle: 'Payments & tips' },
    '/delivery/analytics': { title: 'Analytics',       subtitle: 'Performance metrics' },
    '/delivery/history':   { title: 'History',         subtitle: 'Past deliveries' },
    '/delivery/zones':     { title: 'Zones',           subtitle: 'Active delivery areas' },
    '/delivery/profile':   { title: 'Profile',         subtitle: 'Your account' },
    '/delivery/settings':  { title: 'Settings',        subtitle: 'Preferences' },
    '/delivery/support':   { title: 'Support',         subtitle: 'Help & resources' },
  };
  return map[pathname] ?? {
    title: pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? 'Dashboard',
    subtitle: 'Delivery Portal',
  };
}

// ─── Main Component ────────────────────────────────────────────────────────
export function DeliveryHeader() {
  const [searchQuery, setSearchQuery]           = useState('');
  const [currentTime, setCurrentTime]           = useState('');
  const [showSearch, setShowSearch]             = useState(false);
  const [isOnline, setIsOnline]                 = useState(true);
  const [location, setLocation]                 = useState('Fetching location…');
  const [notifList, setNotifList]               = useState<Notification[]>(notifications);
  const searchRef                               = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  const { data: session } = useSession();
  const { setMobileOpen } = useDeliverySidebarStore();
  const { profile, stats, activeDeliveries } = useDeliveryPartner();

  const unreadCount = notifList.filter(n => !n.read).length;
  const { title, subtitle } = getPageMeta(pathname);
  const partnerName = profile
    ? `${profile.user.profile.firstName} ${profile.user.profile.lastName}`.trim()
    : session?.user?.name || 'Delivery Partner';
  const partnerLevel = (profile?.performance.averageRating ?? stats?.rating ?? 0) >= 4.8
    ? 'Gold Partner'
    : 'Silver Partner';
  const isOnDuty = profile?.availability.isOnDuty ?? isOnline;

  // Clock
  useEffect(() => {
    const tick = () => setCurrentTime(format(new Date(), 'hh:mm a'));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  // Geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setLocation('Current Location'),
        () => setLocation('Location unavailable'),
      );
    }
  }, []);

  // Network
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    if (profile) setIsOnline(profile.availability.isOnDuty);
  }, [profile?.availability.isOnDuty]);

  // Focus search input when revealed
  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  const markAllRead = () => setNotifList(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const getInitials = () => {
    const name = session?.user?.name || 'Delivery Partner';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <header className={cn(
        'sticky top-0 z-30',
        'bg-white/90 dark:bg-[#120600]/95 backdrop-blur-xl',
        'border-b border-orange-100/80 dark:border-orange-900/30',
        'shadow-sm shadow-orange-100/50 dark:shadow-black/30',
      )}>
        {/* ── Top status bar (mobile only) ───────────────────── */}
        <div className="flex md:hidden items-center justify-between px-4 py-1 bg-orange-950/5 dark:bg-orange-950/30 border-b border-orange-100/60 dark:border-orange-900/20">
          <div className="flex items-center gap-1.5">
            <div className={cn('h-1.5 w-1.5 rounded-full', isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
            <span className={cn('text-[10px] font-semibold', isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <span className="text-[10px] text-orange-400/70 font-medium tracking-wide">
            RentEase Delivery
          </span>
          <div className="flex items-center gap-1 text-orange-400/60">
            <Clock className="h-3 w-3" />
            <span className="text-[10px]">{currentTime}</span>
          </div>
        </div>

        {/* ── Main header row ─────────────────────────────────── */}
        <div className="flex h-14 items-center justify-between gap-2 px-4 md:px-6">

          {/* ── Left ─────────────────────────────────────────── */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger */}
            <Button
              variant="ghost" size="icon"
              onClick={() => setMobileOpen(true)}
              className="md:hidden h-9 w-9 rounded-xl text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Page title */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-black text-gray-900 dark:text-white leading-none tracking-tight truncate">
                  {title}
                </h1>
                {/* Active pulse for dashboard */}
                {(pathname === '/delivery' || pathname === '/delivery/dashboard') && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <div className="hidden md:flex items-center gap-2 mt-0.5">
                <span className="text-xs text-orange-400/70 dark:text-orange-500/70 font-medium">{subtitle}</span>
                <span className="text-orange-300/40 dark:text-orange-700/40">·</span>
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{currentTime}</span>
                </div>
                <span className="text-orange-300/40 dark:text-orange-700/40">·</span>
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span className="max-w-[160px] truncate">{location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Center search (desktop) ───────────────────────── */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <Input
                placeholder="Search orders, addresses…"
                className={cn(
                  'w-full pl-9 h-9 rounded-xl text-sm',
                  'bg-orange-50/60 dark:bg-orange-950/20',
                  'border-orange-200/60 dark:border-orange-800/30',
                  'focus:border-orange-400 dark:focus:border-orange-600',
                  'focus:bg-white dark:focus:bg-orange-950/40',
                  'placeholder:text-gray-400 text-gray-800 dark:text-gray-200',
                  'transition-all duration-200',
                )}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ── Right actions ─────────────────────────────────── */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Online badge — desktop */}
            <div className={cn(
              'hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold mr-1 transition-all',
              isOnDuty && isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400',
            )}>
              {isOnDuty && isOnline
                ? <><Wifi className="h-3.5 w-3.5" /><span>On Duty</span></>
                : <><WifiOff className="h-3.5 w-3.5" /><span>Off Duty</span></>}
            </div>

            {/* Mobile search toggle */}
            <Button
              variant="ghost" size="icon"
              onClick={() => setShowSearch(v => !v)}
              className="md:hidden h-9 w-9 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
            >
              {showSearch ? <X className="h-4.5 w-4.5" /> : <Search className="h-4.5 w-4.5" />}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost" size="icon"
                  className="relative h-9 w-9 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-[9px] font-black text-white flex items-center justify-center shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={cn(
                  'w-80 mt-2 p-0 rounded-2xl overflow-hidden',
                  'bg-white dark:bg-[#1a0900]',
                  'border border-orange-100 dark:border-orange-900/40',
                  'shadow-xl shadow-orange-900/10 dark:shadow-black/50',
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-orange-100/60 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-950/30">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-black text-gray-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <Badge className="h-5 px-1.5 rounded-full bg-orange-500 text-white text-[10px] font-black border-0">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:text-orange-700 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-orange-50 dark:divide-orange-900/20">
                  {notifList.map(n => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-orange-50/60 dark:hover:bg-orange-950/20 transition-colors',
                        !n.read && 'bg-orange-50/40 dark:bg-orange-950/10',
                      )}
                    >
                      <NotificationIcon type={n.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none truncate">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{n.description}</p>
                        <p className="text-[10px] text-orange-400/70 mt-1 font-medium">{n.time}</p>
                      </div>
                      {!n.read && (
                        <span className="mt-1 h-2 w-2 rounded-full bg-orange-500 shrink-0 shadow-sm shadow-orange-400/40" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-orange-100/60 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-950/20">
                  <button className="w-full text-center text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors py-1">
                    View all notifications →
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'h-9 gap-2 px-2 rounded-xl',
                    'hover:bg-orange-50 dark:hover:bg-orange-950/30',
                    'text-gray-700 dark:text-gray-300',
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 border-2 border-orange-300/50 dark:border-orange-600/40">
                      <AvatarImage src={session?.user?.image || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-xs font-black">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#120600] bg-emerald-500" />
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-xs font-bold text-gray-900 dark:text-white leading-none">
                      {partnerName.split(' ')[0] || 'Partner'}
                    </span>
                    <span className="text-[10px] text-orange-500/70 font-medium">{partnerLevel}</span>
                  </div>
                  <ChevronDown className="hidden lg:block h-3 w-3 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={cn(
                  'w-64 mt-2 p-0 rounded-2xl overflow-hidden',
                  'bg-white dark:bg-[#1a0900]',
                  'border border-orange-100 dark:border-orange-900/40',
                  'shadow-xl shadow-orange-900/10 dark:shadow-black/50',
                )}
              >
                {/* Profile header */}
                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-orange-950/60 dark:to-orange-900/30 border-b border-orange-100/60 dark:border-orange-900/30">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-orange-300/60 dark:border-orange-600/40 shadow-md">
                        <AvatarImage src={session?.user?.image || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-[#1a0900] bg-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                        {partnerName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {profile?.user.email || session?.user?.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">{partnerLevel}</span>
                      </div>
                    </div>
                  </div>
                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { icon: Star,       value: `${stats?.rating ?? profile?.performance.averageRating ?? 0}`, label: 'Rating' },
                      { icon: Package,    value: `${stats?.totalDeliveries ?? profile?.performance.totalDeliveries ?? 0}`, label: 'Trips' },
                      { icon: TrendingUp, value: `${activeDeliveries.length}`, label: 'Active' },
                    ].map(({ icon: Icon, value, label }) => (
                      <div key={label} className="text-center rounded-lg bg-white/60 dark:bg-black/20 py-1.5 border border-orange-100/60 dark:border-orange-800/20">
                        <Icon className="h-3 w-3 text-orange-500 mx-auto mb-0.5" />
                        <p className="text-xs font-black text-gray-900 dark:text-white">{value}</p>
                        <p className="text-[9px] text-gray-400">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  {[
                    { icon: User,       label: 'My Profile',  href: '/delivery/profile' },
                    { icon: Navigation, label: 'Live Map',    href: '/delivery/navigate' },
                    { icon: Settings,   label: 'Settings',    href: '/delivery/settings' },
                    { icon: HelpCircle, label: 'Help Center', href: '/delivery/support' },
                  ].map(({ icon: Icon, label, href }) => (
                    <DropdownMenuItem key={label} asChild>
                      <a
                        href={href}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer',
                          'text-sm font-medium text-gray-700 dark:text-gray-300',
                          'hover:bg-orange-50 dark:hover:bg-orange-950/30',
                          'hover:text-orange-700 dark:hover:text-orange-300 transition-colors',
                        )}
                      >
                        <div className="h-7 w-7 rounded-lg bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                          <Icon className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                        </div>
                        {label}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </div>

                <div className="p-1.5 border-t border-orange-100/60 dark:border-orange-900/30">
                  <DropdownMenuItem className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer',
                    'text-sm font-bold text-red-500 hover:text-red-600',
                    'hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors',
                  )}>
                    <div className="h-7 w-7 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                      <LogOut className="h-3.5 w-3.5 text-red-500" />
                    </div>
                    End Shift
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ── Mobile Search Expand ────────────────────────────── */}
        <div className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          showSearch ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0',
        )}>
          <div className="px-4 pb-3 pt-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                ref={searchRef}
                placeholder="Search orders, addresses…"
                className={cn(
                  'w-full pl-9 h-9 rounded-xl text-sm',
                  'bg-orange-50/70 dark:bg-orange-950/20',
                  'border-orange-200/60 dark:border-orange-800/30',
                  'focus:border-orange-400 dark:focus:border-orange-600',
                  'placeholder:text-gray-400 text-gray-800 dark:text-gray-200',
                )}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}