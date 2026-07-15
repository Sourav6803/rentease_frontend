// // components/delivery/layout/DeliverySidebar.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import { useDeliverySidebarStore } from '@/store/DeliverySidebarStore';
// import { cn } from '@/lib/utils';
// import {
//   Home,
//   Calendar,
//   Navigation,
//   History,
//   User,
//   DollarSign,
//   Truck,
//   LogOut,
//   Settings,
//   HelpCircle,
//   ChevronLeft,
//   ChevronRight,
//   Menu,
//   X,
//   Star,
//   Wifi,
//   WifiOff,
//   Clock,
//   TrendingUp,
//   Award,
//   Shield,
//   MapPin,
//   Phone,
//   Mail,
//   Bell,
// } from 'lucide-react';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { Switch } from '@/components/ui/switch';
// import Image from 'next/image';
// // import { deliveryMenuItems } from './DeliveryMenuItemsData';

// // ─── Logout Modal Component ─────────────────────────────────────────────────────────────
// function LogoutModal({ 
//   isOpen, 
//   onClose, 
//   onConfirm, 
//   isLoading,
//   deliveryPersonName 
// }: { 
//   isOpen: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   isLoading: boolean;
//   deliveryPersonName?: string;
// }) {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div 
//         className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
//         onClick={onClose}
//       />
      
//       <div className="relative z-10 w-full max-w-md mx-4 transform transition-all duration-300 scale-100 opacity-100">
//         <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
//           <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500" />
          
//           <div className="p-6">
//             <div className="flex justify-center mb-4">
//               <div className="relative">
//                 <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl" />
//                 <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
//                   <LogOut className="h-8 w-8 text-white" />
//                 </div>
//               </div>
//             </div>

//             <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
//               End Shift?
//             </h3>
            
//             <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
//               Are you sure you want to logout from Delivery Portal?
//               {deliveryPersonName && (
//                 <span className="block mt-1 text-xs text-gray-500">
//                   <span className="font-semibold text-gray-700 dark:text-gray-300">{deliveryPersonName}</span>
//                 </span>
//               )}
//             </p>

//             <div className="mb-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
//               <div className="flex items-center gap-2">
//                 <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
//                 <p className="text-xs text-amber-800 dark:text-amber-300">
//                   Your session will end and you'll be redirected to login
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <Button
//                 variant="outline"
//                 onClick={onClose}
//                 disabled={isLoading}
//                 className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
//               >
//                 Stay Online
//               </Button>
//               <Button
//                 onClick={onConfirm}
//                 disabled={isLoading}
//                 className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
//               >
//                 {isLoading ? (
//                   <>
//                     <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
//                     Logging out...
//                   </>
//                 ) : (
//                   <>
//                     <LogOut className="h-4 w-4 mr-2" />
//                     End Shift
//                   </>
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Quick Stats Component ─────────────────────────────────────────────────────────────
// const QuickStats = ({ collapsed }: { collapsed: boolean }) => {
//   const stats = [
//     { label: 'Today\'s Earnings', value: '₹1,250', icon: DollarSign, trend: '+12%' },
//     { label: 'Completed', value: '8', icon: CheckCircle, trend: '+2' },
//     { label: 'Rating', value: '4.9', icon: Star, trend: '+0.1' },
//   ];

//   if (collapsed) return null;

//   return (
//     <div className="grid grid-cols-3 gap-2 p-3 border-b border-orange-200/30">
//       {stats.map((stat) => (
//         <div
//           key={stat.label}
//           className="rounded-lg bg-gradient-to-br from-orange-50/50 to-amber-50/30 p-2 text-center"
//         >
//           <stat.icon className="h-3 w-3 text-orange-500 mx-auto mb-1" />
//           <p className="text-xs font-bold text-gray-800">{stat.value}</p>
//           <p className="text-[9px] text-gray-500 truncate">{stat.label}</p>
//         </div>
//       ))}
//     </div>
//   );
// };

// // ─── Collapsed Icon Button ─────────────────────────────────────────────────────────────
// const CollapsedNavIcon = ({ item, isActive }: { item: any; isActive: boolean }) => {
//   const Icon = item.icon;
  
//   return (
//     <Tooltip>
//       <TooltipTrigger asChild>
//         <Link
//           href={item.href}
//           className={cn(
//             'flex items-center justify-center w-10 h-10 rounded-lg mx-auto transition-all duration-150',
//             isActive
//               ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
//               : 'text-orange-300 hover:bg-orange-700/40 hover:text-white',
//           )}
//         >
//           <Icon className="h-5 w-5" />
//         </Link>
//       </TooltipTrigger>
//       <TooltipContent side="right" className="bg-orange-900 text-white border-orange-700 text-xs">
//         {item.name}
//       </TooltipContent>
//     </Tooltip>
//   );
// };

// // ─── Main Component ───────────────────────────────────────────────────────────────────
// export function DeliverySidebar() {
//   const [mounted, setMounted] = useState(false);
//   const [isOnline, setIsOnline] = useState(true);
//   const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const [deliveryPerson, setDeliveryPerson] = useState<any>(null);
  
//   const { data: session } = useSession();
//   const pathname = usePathname();
//   const router = useRouter();
//   const { isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen } = useDeliverySidebarStore();

//   useEffect(() => {
//     setMounted(true);
//     // Fetch delivery person data
//     const fetchDeliveryPerson = async () => {
//       // Replace with actual API call
//       setDeliveryPerson({
//         name: session?.user?.name || 'Rahul Sharma',
//         rating: 4.9,
//         totalDeliveries: 156,
//         avatar: session?.user?.image,
//       });
//     };
//     fetchDeliveryPerson();
//   }, [session]);

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

//   const handleLogoutClick = () => setIsLogoutModalOpen(true);
  
//   const handleConfirmLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       // Replace with actual logout logic
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       setIsLogoutModalOpen(false);
//       router.push('/delivery/auth/login');
//     } finally {
//       setIsLoggingOut(false);
//     }
//   };

//   const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

//   if (!mounted) {
//     return <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-br from-orange-900 to-orange-800" />;
//   }

//   const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
//     <div className="flex h-full flex-col overflow-hidden">
//       {/* Header */}
//       <div className="flex h-14 shrink-0 items-center justify-between border-b border-orange-700/60 px-3 bg-gradient-to-r from-orange-900 to-orange-800">
//         {!collapsed ? (
//           <Link href="/delivery" className="flex items-center gap-2 min-w-0">
//             <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
//               <Truck className="h-4 w-4 text-white" />
//             </div>
//             <div className="min-w-0">
//               <p className="text-sm font-extrabold text-white leading-none tracking-tight">
//                 Rent<span className="text-orange-300">Ease</span>
//               </p>
//               <p className="text-[10px] text-orange-200 leading-none mt-0.5">
//                 Delivery Partner
//               </p>
//             </div>
//           </Link>
//         ) : (
//           <div className="mx-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
//             <Truck className="h-4 w-4 text-white" />
//           </div>
//         )}

//         {!isMobileOpen && (
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={toggleCollapse}
//             className="hidden md:flex h-7 w-7 rounded-lg text-white hover:bg-white/20 shrink-0"
//           >
//             {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
//           </Button>
//         )}
//       </div>

//       {/* Delivery Person Profile */}
//       {deliveryPerson && !collapsed && (
//         <div className="p-4 bg-gradient-to-br from-orange-800/50 to-orange-900/30 border-b border-orange-700/30">
//           <div className="flex items-center gap-3">
//             <Avatar className="h-12 w-12 border-2 border-orange-400/60 shadow-lg">
//               <AvatarImage src={deliveryPerson.avatar} />
//               <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold">
//                 {deliveryPerson.name?.charAt(0) || 'R'}
//               </AvatarFallback>
//             </Avatar>
//             <div className="flex-1 min-w-0">
//               <p className="font-semibold text-white text-sm truncate">{deliveryPerson.name}</p>
//               <div className="flex items-center gap-1 mt-0.5">
//                 <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
//                 <span className="text-xs text-orange-200">{deliveryPerson.rating}</span>
//                 <span className="text-xs text-orange-400">•</span>
//                 <span className="text-xs text-orange-300">{deliveryPerson.totalDeliveries} deliveries</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Online Status Toggle */}
//       {!collapsed && (
//         <div className="p-3 border-b border-orange-700/30">
//           <div className="flex items-center justify-between p-2 rounded-lg bg-orange-800/30">
//             <div className="flex items-center gap-2">
//               {isOnline ? (
//                 <Wifi className="h-4 w-4 text-green-400" />
//               ) : (
//                 <WifiOff className="h-4 w-4 text-red-400" />
//               )}
//               <span className="text-sm font-medium text-white">
//                 {isOnline ? 'Online' : 'Offline'}
//               </span>
//             </div>
//             <Switch
//               checked={isOnline}
//               onCheckedChange={setIsOnline}
//               className="data-[state=checked]:bg-green-500"
//             />
//           </div>
//         </div>
//       )}

//       {/* Quick Stats */}
//       <QuickStats collapsed={collapsed} />

//       {/* Navigation */}
//       <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 px-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-orange-700/60">
//         {collapsed ? (
//           <nav className="space-y-2">
//             {deliveryMenuItems.map((item: any) => (
//               <CollapsedNavIcon
//                 key={item.name}
//                 item={item}
//                 isActive={isActive(item.href)}
//               />
//             ))}
//           </nav>
//         ) : (
//           <nav className="space-y-1">
//             {deliveryMenuItems.map((item: any) => {
//               const Icon = item.icon;
//               const active = isActive(item.href);
              
//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className={cn(
//                     'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
//                     active
//                       ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
//                       : 'text-orange-100 hover:bg-orange-800/40 hover:text-white',
//                   )}
//                 >
//                   <Icon className="h-4.5 w-4.5 shrink-0" />
//                   <span className="flex-1 truncate">{item.name}</span>
//                   {item.badge && (
//                     <Badge className="bg-orange-400 text-orange-950 text-[9px] px-1.5 py-0 h-4 ml-auto font-bold">
//                       {item.badge}
//                     </Badge>
//                   )}
//                 </Link>
//               );
//             })}
//           </nav>
//         )}
//       </div>

//       {/* Footer Actions */}
//       <div className="shrink-0 border-t border-orange-700/60 p-2 space-y-1">
//         {!collapsed && (
//           <>
//             <Link
//               href="/delivery/support"
//               className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-orange-200 hover:bg-orange-800/40 hover:text-white transition-all"
//             >
//               <HelpCircle className="h-4 w-4" />
//               <span>Support</span>
//             </Link>
//             <Link
//               href="/delivery/settings"
//               className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-orange-200 hover:bg-orange-800/40 hover:text-white transition-all"
//             >
//               <Settings className="h-4 w-4" />
//               <span>Settings</span>
//             </Link>
//           </>
//         )}
        
//         <button
//           onClick={handleLogoutClick}
//           className={cn(
//             'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
//             'text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all',
//             collapsed && 'justify-center px-0',
//           )}
//         >
//           <LogOut className="h-4.5 w-4.5 shrink-0" />
//           {!collapsed && <span>End Shift</span>}
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <TooltipProvider delayDuration={0}>
//       {/* Desktop Sidebar */}
//       <aside
//         className={cn(
//           'fixed left-0 top-0 z-40 h-screen',
//           'bg-gradient-to-br from-orange-900 via-orange-800 to-orange-900',
//           'border-r border-orange-700/50 shadow-2xl',
//           'transition-[width] duration-300 ease-in-out',
//           'hidden md:block',
//           isCollapsed ? 'w-16' : 'w-64',
//         )}
//       >
//         <SidebarContent collapsed={isCollapsed} />
//       </aside>

//       {/* Mobile Overlay */}
//       {isMobileOpen && (
//         <div
//           className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
//           onClick={() => setMobileOpen(false)}
//         />
//       )}

//       {/* Mobile Drawer */}
//       <aside
//         className={cn(
//           'fixed left-0 top-0 z-50 h-screen w-72',
//           'bg-gradient-to-br from-orange-900 via-orange-800 to-orange-900',
//           'border-r border-orange-700/50 shadow-2xl',
//           'transition-transform duration-300 ease-in-out',
//           'md:hidden',
//           isMobileOpen ? 'translate-x-0' : '-translate-x-full',
//         )}
//       >
//         <SidebarContent collapsed={false} />
//       </aside>

//       {/* Mobile FAB */}
//       <button
//         onClick={() => setMobileOpen(true)}
//         className={cn(
//           'fixed bottom-5 left-4 z-40 md:hidden',
//           'h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-900/40',
//           'flex items-center justify-center transition-all active:scale-95',
//           isMobileOpen && 'hidden',
//         )}
//       >
//         <Menu className="h-5 w-5 text-white" />
//       </button>

//       {/* Logout Modal */}
//       <LogoutModal
//         isOpen={isLogoutModalOpen}
//         onClose={() => setIsLogoutModalOpen(false)}
//         onConfirm={handleConfirmLogout}
//         isLoading={isLoggingOut}
//         deliveryPersonName={deliveryPerson?.name}
//       />
//     </TooltipProvider>
//   );
// }

// // Missing imports
// import { CheckCircle } from 'lucide-react';
// import { deliveryMenuItems } from './DeliveryMenuItemsData';



'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDeliverySidebarStore } from '@/store/DeliverySidebarStore';
import { cn } from '@/lib/utils';
import {
  Home,
  Calendar,
  Navigation,
  History,
  User,
  DollarSign,
  Truck,
  LogOut,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  Star,
  Wifi,
  WifiOff,
  Clock,
  TrendingUp,
  CheckCircle,
  Bell,
  MapPin,
  Package,
  BarChart3,
  Zap,
  Shield,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';

// ─── Types ──────────────────────────────────────────────────────────────────
interface DeliveryPerson {
  name: string;
  rating: number;
  totalDeliveries: number;
  avatar?: string;
  level?: string;
  earnings?: string;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  description?: string;
}

// ─── Menu Items ──────────────────────────────────────────────────────────────
const deliveryMenuItems: MenuItem[] = [
  { name: 'Dashboard',    href: '/delivery/dashboard',  icon: Home,       description: 'Overview & stats' },
  { name: 'Active Orders', href: '/delivery/orders',    icon: Package,    description: 'Current deliveries' },
  { name: 'Navigate',     href: '/delivery/navigate',   icon: Navigation, description: 'GPS & routes' },
  { name: 'Schedule',     href: '/delivery/schedule',   icon: Calendar,   description: 'Upcoming shifts' },
  { name: 'Earnings',     href: '/delivery/earnings',   icon: DollarSign, description: 'Payments & tips' },
  { name: 'Analytics',    href: '/delivery/analytics',  icon: BarChart3,  description: 'Performance metrics' },
  { name: 'History',      href: '/delivery/history',    icon: History,    description: 'Past deliveries' },
  { name: 'Zones',        href: '/delivery/zones',      icon: MapPin,     description: 'Delivery areas' },
  { name: 'Profile',      href: '/delivery/profile',    icon: User,       description: 'Your account' },
];

const bottomMenuItems: MenuItem[] = [
  { name: 'Notifications', href: '/delivery/notifications', icon: Bell,        badge: 2 },
  { name: 'Support',       href: '/delivery/support',       icon: HelpCircle },
  { name: 'Settings',      href: '/delivery/settings',      icon: Settings },
];

// ─── Logout Modal ────────────────────────────────────────────────────────────
function LogoutModal({
  isOpen, onClose, onConfirm, isLoading, deliveryPersonName,
}: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  isLoading: boolean; deliveryPersonName?: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
        <div className="relative overflow-hidden rounded-3xl bg-[#1a0f00] border border-orange-800/40 shadow-2xl">
          {/* Top gradient bar */}
          <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600" />

          {/* Glow BG */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />

          <div className="p-7 relative">
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-500/30 blur-xl animate-pulse" />
                <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-900/50 rotate-3">
                  <LogOut className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <h3 className="text-xl font-black text-center text-white mb-1 tracking-tight">End Your Shift?</h3>
            {deliveryPersonName && (
              <p className="text-center text-orange-300/80 text-sm mb-4 font-medium">{deliveryPersonName}</p>
            )}
            <p className="text-sm text-center text-orange-200/60 mb-5">
              You'll be signed out of the Delivery Portal and your active status will be cleared.
            </p>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-950/60 border border-amber-800/40 mb-6">
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-300/80">Your session will end and earnings will be saved automatically.</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 border border-orange-800/40 text-orange-200 hover:bg-orange-900/40 rounded-xl h-11"
              >
                Stay Online
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl h-11 font-bold shadow-lg shadow-red-900/40"
              >
                {isLoading ? (
                  <><div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />Logging out…</>
                ) : (
                  <><LogOut className="h-4 w-4 mr-2" />End Shift</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, color }: {
  icon: React.ElementType; value: string; label: string; color: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
      <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', color)}>
        <Icon className="h-3 w-3 text-white" />
      </div>
      <p className="text-sm font-black text-white leading-none">{value}</p>
      <p className="text-[9px] text-orange-300/70 leading-none text-center">{label}</p>
    </div>
  );
}

// ─── Nav Item (Expanded) ─────────────────────────────────────────────────────
function NavItem({ item, isActive }: { item: MenuItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        'group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
        isActive
          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-900/50'
          : 'text-orange-200/80 hover:bg-white/8 hover:text-white',
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/60" />
      )}
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all',
        isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10',
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 truncate">{item.name}</span>
      {item.badge !== undefined && (
        <Badge className="h-5 min-w-[20px] px-1.5 rounded-full bg-amber-400 text-orange-950 text-[10px] font-black border-0">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

// ─── Nav Item (Collapsed) ────────────────────────────────────────────────────
function CollapsedNavItem({ item, isActive }: { item: MenuItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-xl mx-auto transition-all duration-200',
            isActive
              ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-900/50'
              : 'text-orange-300/70 hover:bg-white/10 hover:text-white',
          )}
        >
          <Icon className="h-4.5 w-4.5" />
          {item.badge !== undefined && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-400 text-orange-950 text-[9px] font-black flex items-center justify-center">
              {item.badge}
            </span>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-orange-950 text-orange-100 border-orange-800 text-xs font-semibold rounded-xl">
        <p>{item.name}</p>
        {item.description && <p className="text-orange-400 text-[10px]">{item.description}</p>}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DeliverySidebar() {
  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: session } = useSession();
  const { profile, stats, activeDeliveries, toggleOnDuty } = useDeliveryPartner();
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen } = useDeliverySidebarStore();

  const deliveryPerson: DeliveryPerson | null = profile
    ? {
        name: `${profile.user.profile.firstName} ${profile.user.profile.lastName}`.trim(),
        rating: profile.rating ?? profile.performance.averageRating,
        totalDeliveries: profile.performance.totalDeliveries,
        avatar: profile.user.profile.avatar ?? session?.user?.image ?? undefined,
        level: profile.performance.averageRating >= 4.8 ? 'Gold Partner' : 'Silver Partner',
        earnings: `₹${(stats?.todayEarnings ?? stats?.thisWeekEarnings ?? 0).toLocaleString()}`,
      }
    : null;

  const menuItems = deliveryMenuItems.map((item) =>
    item.href === '/delivery/orders'
      ? { ...item, badge: activeDeliveries.length || undefined }
      : item,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (profile) setIsOnline(profile.availability.isOnDuty);
  }, [profile?.availability.isOnDuty]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      setIsLogoutModalOpen(false);
      router.push('/delivery/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  if (!mounted) return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#1a0800]" />
  );

  // ── Sidebar inner content (shared between desktop + mobile) ──────────────
  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className={cn(
        'flex h-16 shrink-0 items-center border-b border-white/8 px-3',
        collapsed ? 'justify-center' : 'justify-between gap-2',
      )}>
        {!collapsed && (
          <Link href="/delivery/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-900/60">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-black text-white leading-none tracking-tighter">
                Rent<span className="text-amber-400">Ease</span>
              </p>
              <p className="text-[10px] text-orange-400/80 leading-none mt-0.5 font-medium tracking-wide uppercase">
                Delivery Partner
              </p>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-900/60">
            <Truck className="h-5 w-5 text-white" />
          </div>
        )}
        {!isMobileOpen && (
          <Button
            variant="ghost" size="icon" onClick={toggleCollapse}
            className={cn(
              'hidden md:flex h-7 w-7 rounded-xl text-orange-300 hover:bg-white/10 hover:text-white shrink-0',
              collapsed && 'mt-1 mx-auto',
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
        {isMobileOpen && !collapsed && (
          <Button
            variant="ghost" size="icon" onClick={() => setMobileOpen(false)}
            className="md:hidden h-7 w-7 rounded-xl text-orange-300 hover:bg-white/10 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* ── Profile Card ────────────────────────────────────── */}
      {deliveryPerson && !collapsed && (
        <div className="shrink-0 mx-3 mt-3 rounded-2xl bg-gradient-to-br from-orange-800/50 to-orange-900/30 border border-orange-700/30 p-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar className="h-11 w-11 border-2 border-amber-400/50 shadow-lg">
                <AvatarImage src={deliveryPerson.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-sm">
                  {deliveryPerson.name?.charAt(0) ?? 'R'}
                </AvatarFallback>
              </Avatar>
              <span className={cn(
                'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#1a0800]',
                isOnline ? 'bg-emerald-400' : 'bg-red-400',
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate leading-none">{deliveryPerson.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <Zap className="h-3 w-3 text-amber-400" />
                <span className="text-[10px] text-amber-300 font-semibold">{deliveryPerson.level}</span>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-white">{deliveryPerson.rating}</span>
              </div>
              <span className="text-[10px] text-orange-400">{deliveryPerson.totalDeliveries} trips</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Online Toggle ────────────────────────────────────── */}
      {!collapsed && (
        <div className="shrink-0 mx-3 mt-2">
          <div className={cn(
            'flex items-center justify-between rounded-2xl px-3 py-2.5 border transition-all',
            isOnline
              ? 'bg-emerald-950/40 border-emerald-700/40'
              : 'bg-red-950/30 border-red-800/30',
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                'h-2 w-2 rounded-full',
                isOnline ? 'bg-emerald-400 shadow-lg shadow-emerald-500/60 animate-pulse' : 'bg-red-400',
              )} />
              {isOnline
                ? <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                : <WifiOff className="h-3.5 w-3.5 text-red-400" />}
              <span className={cn('text-sm font-bold', isOnline ? 'text-emerald-300' : 'text-red-400')}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <Switch
              checked={isOnline}
              onCheckedChange={async (checked) => {
                setIsOnline(checked);
                await toggleOnDuty();
              }}
              className="scale-90 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-700"
            />
          </div>
        </div>
      )}

      {/* ── Quick Stats ──────────────────────────────────────── */}
      {!collapsed && (
        <div className="shrink-0 mx-3 mt-2 flex gap-2">
          <StatCard icon={DollarSign} value={`₹${(stats?.todayEarnings ?? 0).toLocaleString()}`} label="Today" color="bg-emerald-600" />
          <StatCard icon={CheckCircle} value={`${stats?.completedToday ?? 0}`} label="Done" color="bg-blue-600" />
          <StatCard icon={TrendingUp} value={`${stats?.onTimeRate ?? 0}%`} label="On-time" color="bg-purple-600" />
        </div>
      )}

      {/* ── Scrollable Nav ───────────────────────────────────── */}
      <div className={cn(
        'flex-1 min-h-0 overflow-y-auto overflow-x-hidden',
        'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-orange-800/60',
        'mt-3 px-2',
      )}>
        {collapsed ? (
          <nav className="space-y-2 pb-2">
            {[...menuItems, ...bottomMenuItems].map(item => (
              <CollapsedNavItem key={item.href} item={item} isActive={isActive(item.href)} />
            ))}
          </nav>
        ) : (
          <>
            <p className="px-3 mb-1.5 text-[10px] font-black text-orange-500/60 uppercase tracking-[0.12em]">
              Main Menu
            </p>
            <nav className="space-y-0.5 pb-2">
              {menuItems.map(item => (
                <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
              ))}
            </nav>

            {/* Divider */}
            <div className="mx-3 my-3 h-px bg-gradient-to-r from-transparent via-orange-700/40 to-transparent" />

            <p className="px-3 mb-1.5 text-[10px] font-black text-orange-500/60 uppercase tracking-[0.12em]">
              Account
            </p>
            <nav className="space-y-0.5 pb-4">
              {bottomMenuItems.map(item => (
                <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
              ))}
            </nav>
          </>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-white/8 p-2">
        {/* Earnings mini-banner (expanded only) */}
        {!collapsed && deliveryPerson && (
          <div className="mb-2 mx-1 rounded-2xl bg-gradient-to-r from-orange-600/20 to-amber-600/10 border border-orange-700/30 px-3 py-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-orange-400/70 font-medium">Today's Earnings</p>
              <p className="text-sm font-black text-amber-300">{deliveryPerson.earnings}</p>
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
          </div>
        )}

        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold',
            'text-red-400/80 hover:bg-red-950/40 hover:text-red-300 transition-all duration-200 group',
            collapsed && 'justify-center px-0',
          )}
        >
          <div className="h-8 w-8 shrink-0 rounded-xl bg-red-950/40 group-hover:bg-red-900/60 flex items-center justify-center transition-all">
            <LogOut className="h-4 w-4" />
          </div>
          {!collapsed && <span>End Shift</span>}
        </button>
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen hidden md:flex flex-col',
          'bg-gradient-to-b from-[#1f0900] via-[#1a0800] to-[#160600]',
          'border-r border-white/6 shadow-2xl shadow-black/60',
          'transition-[width] duration-300 ease-in-out will-change-[width]',
          isCollapsed ? 'w-[72px]' : 'w-64',
        )}
      >
        {/* Subtle noise / grain overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
        {/* Glow at top */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-orange-600/10 to-transparent" />

        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* ── Mobile Overlay ──────────────────────────────────── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ───────────────────────────────────── */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-72 md:hidden flex flex-col',
          'bg-gradient-to-b from-[#1f0900] via-[#1a0800] to-[#160600]',
          'border-r border-white/6 shadow-2xl shadow-black/60',
          'transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-orange-600/10 to-transparent" />
        <SidebarContent collapsed={false} />
      </aside>

      {/* ── Logout Modal ────────────────────────────────────── */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
        deliveryPersonName={deliveryPerson?.name}
      />
    </TooltipProvider>
  );
}