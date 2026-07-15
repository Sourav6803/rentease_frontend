// // app/(delivery)/delivery/layout.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter, usePathname } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Home,
//   Calendar,
//   MapPin,
//   History,
//   User,
//   DollarSign,
//   Package,
//   Truck,
//   Clock,
//   Star,
//   Bell,
//   Menu,
//   X,
//   ChevronRight,
//   LogOut,
//   Settings,
//   HelpCircle,
//   Shield,
//   Smartphone,
//   Navigation,
//   Map,
//   Phone,
//   Mail,
//   Award,
// } from "lucide-react";

// interface DeliveryPerson {
//   _id: string;
//   name: string;
//   email: string;
//   phone: string;
//   avatar?: string;
//   employeeId: string;
//   vehicle: { type: string; number: string };
//   rating: number;
//   totalDeliveries: number;
//   earnings: number;
// }

// const navItems = [
//   { name: "Dashboard", href: "/delivery", icon: Home },
//   { name: "Today's Deliveries", href: "/delivery/today", icon: Calendar },
//   { name: "Active Delivery", href: "/delivery/active", icon: Navigation },
//   { name: "History", href: "/delivery/history", icon: History },
//   { name: "Profile", href: "/delivery/profile", icon: User },
//   { name: "Earnings", href: "/delivery/earnings", icon: DollarSign },
// ];

// export default function DeliveryLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { data: session, status: sessionStatus } = useSession();
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isOnline, setIsOnline] = useState(true);
//   const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // Public auth routes: no delivery shell (sidebar / in-layout header)
//   const isAuthPage = pathname?.startsWith("/delivery/auth") ?? false;

//   // Handle authentication for protected pages (only when NOT on auth page)
//   useEffect(() => {
//     // Skip auth check for auth pages
//     if (isAuthPage) {
//       setIsLoading(false);
//       return;
//     }

//     if (sessionStatus === "loading") return;

//     if (sessionStatus === "unauthenticated") {
//       router.push("/delivery/auth/login");
//       return;
//     }

//     // Mock delivery person data - replace with API call
//     setDeliveryPerson({
//       _id: "1",
//       name: "Rahul Sharma",
//       email: "rahul.sharma@rentease.com",
//       phone: "+91 98765 43210",
//       employeeId: "DLV001",
//       vehicle: { type: "bike", number: "DL 01 AB 1234" },
//       rating: 4.9,
//       totalDeliveries: 156,
//       earnings: 18750,
//     });
//     setIsLoading(false);
//   }, [sessionStatus, router, isAuthPage]);

//   // Check online status
//   useEffect(() => {
//     window.addEventListener("online", () => setIsOnline(true));
//     window.addEventListener("offline", () => setIsOnline(false));

//     return () => {
//       window.removeEventListener("online", () => setIsOnline(true));
//       window.removeEventListener("offline", () => setIsOnline(false));
//     };
//   }, []);

//   // Auth routes: shell only (no delivery sidebar/header); root Header/Footer skip /delivery in Header.tsx & Footer.tsx
//   if (isAuthPage) {
//     return <>{children}</>;
//   }
  

//   // Show loading state for protected pages
//   if (sessionStatus === "loading" || isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
//           <p className="text-sm text-slate-500">Loading delivery portal...</p>
//         </div>
//       </div>
//     );
//   }

//   // Render protected layout with sidebar
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       {/* Desktop Sidebar */}
//       <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 shadow-lg hidden lg:flex flex-col">
//         <div className="flex flex-col h-full">
//           {/* Logo */}
//           <div className="p-5 border-b border-slate-100">
//             <Link href="/delivery" className="flex items-center gap-2">
//               <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
//                 <Truck className="w-4 h-4 text-white" />
//               </div>
//               <div>
//                 <span className="font-bold text-slate-800 text-lg">RentEase</span>
//                 <span className="text-xs text-orange-500 block -mt-1">Delivery Partner</span>
//               </div>
//             </Link>
//           </div>

//           {/* Delivery Person Info */}
//           {deliveryPerson && (
//             <div className="p-4 mx-3 mt-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                   {deliveryPerson.name.charAt(0)}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-semibold text-slate-800 text-sm truncate">
//                     {deliveryPerson.name}
//                   </p>
//                   <div className="flex items-center gap-1 mt-0.5">
//                     <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
//                     <span className="text-xs text-slate-600">{deliveryPerson.rating}</span>
//                     <span className="text-xs text-slate-400">•</span>
//                     <span className="text-xs text-slate-500">{deliveryPerson.totalDeliveries} deliveries</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-2 pt-2 border-t border-orange-100">
//                 <div className="flex items-center justify-between text-xs">
//                   <span className="text-slate-500">Today's Earnings</span>
//                   <span className="font-semibold text-orange-600">₹{deliveryPerson.earnings.toLocaleString()}</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Online Status Toggle */}
//           <div className="mx-3 mt-4 p-2 bg-slate-50 rounded-lg">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
//                 <span className="text-sm font-medium text-slate-700">
//                   {isOnline ? 'Online' : 'Offline'}
//                 </span>
//               </div>
//               <button
//                 onClick={() => setIsOnline(!isOnline)}
//                 className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
//                   isOnline 
//                     ? 'bg-green-100 text-green-700 hover:bg-green-200' 
//                     : 'bg-red-100 text-red-700 hover:bg-red-200'
//                 }`}
//               >
//                 {isOnline ? 'Working' : 'Break'}
//               </button>
//             </div>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
//             {navItems.map((item) => {
//               const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
//               return (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
//                     isActive
//                       ? "bg-orange-50 text-orange-600"
//                       : "text-slate-600 hover:bg-slate-50 hover:text-orange-500"
//                   }`}
//                 >
//                   <item.icon className={`w-5 h-5 ${isActive ? "text-orange-500" : "text-slate-400 group-hover:text-orange-400"}`} />
//                   <span className="text-sm font-medium">{item.name}</span>
//                   {isActive && <ChevronRight className="w-4 h-4 ml-auto text-orange-400" />}
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* Bottom Section */}
//           <div className="p-3 border-t border-slate-100 space-y-1">
//             <Link
//               href="/delivery/support"
//               className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-all"
//             >
//               <HelpCircle className="w-5 h-5 text-slate-400" />
//               <span className="text-sm">Support</span>
//             </Link>
//             <Link
//               href="/delivery/settings"
//               className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-all"
//             >
//               <Settings className="w-5 h-5 text-slate-400" />
//               <span className="text-sm">Settings</span>
//             </Link>
//             <button
//               onClick={() => router.push("/delivery/auth/logout")}
//               className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
//             >
//               <LogOut className="w-5 h-5" />
//               <span className="text-sm">Logout</span>
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* Mobile Header */}
//       <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
//         <div className="flex items-center justify-between px-4 py-3">
//           <button
//             onClick={() => setIsMobileMenuOpen(true)}
//             className="p-2 rounded-lg hover:bg-slate-100"
//           >
//             <Menu className="w-5 h-5 text-slate-600" />
//           </button>
//           <div className="flex items-center gap-2">
//             <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
//               <Truck className="w-3.5 h-3.5 text-white" />
//             </div>
//             <span className="font-bold text-slate-800">RentEase</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="relative">
//               <Bell className="w-5 h-5 text-slate-500" />
//               <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
//             </div>
//             <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
//               {deliveryPerson?.name?.charAt(0) || "R"}
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Mobile Sidebar Drawer */}
//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black/50 z-50 lg:hidden"
//               onClick={() => setIsMobileMenuOpen(false)}
//             />
//             <motion.aside
//               initial={{ x: -280 }}
//               animate={{ x: 0 }}
//               exit={{ x: -280 }}
//               transition={{ type: "spring", damping: 25, stiffness: 200 }}
//               className="fixed left-0 top-0 z-50 h-screen w-72 bg-white shadow-2xl lg:hidden"
//             >
//               <div className="flex flex-col h-full">
//                 <div className="flex items-center justify-between p-4 border-b border-slate-100">
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
//                       <Truck className="w-4 h-4 text-white" />
//                     </div>
//                     <div>
//                       <span className="font-bold text-slate-800">RentEase</span>
//                       <span className="text-xs text-orange-500 block -mt-1">Delivery Partner</span>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => setIsMobileMenuOpen(false)}
//                     className="p-2 rounded-lg hover:bg-slate-100"
//                   >
//                     <X className="w-5 h-5 text-slate-600" />
//                   </button>
//                 </div>

//                 {/* Mobile Delivery Person Info */}
//                 {deliveryPerson && (
//                   <div className="p-4 m-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
//                     <div className="flex items-center gap-3">
//                       <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                         {deliveryPerson.name.charAt(0)}
//                       </div>
//                       <div className="flex-1">
//                         <p className="font-semibold text-slate-800">{deliveryPerson.name}</p>
//                         <div className="flex items-center gap-2 mt-1">
//                           <div className="flex items-center gap-1">
//                             <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
//                             <span className="text-xs text-slate-600">{deliveryPerson.rating}</span>
//                           </div>
//                           <span className="text-xs text-slate-400">•</span>
//                           <span className="text-xs text-slate-500">{deliveryPerson.totalDeliveries} deliveries</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Mobile Online Status */}
//                 <div className="mx-3 p-3 bg-slate-50 rounded-lg">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
//                       <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
//                     </div>
//                     <button
//                       onClick={() => setIsOnline(!isOnline)}
//                       className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//                       }`}
//                     >
//                       {isOnline ? 'Working' : 'Break'}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Mobile Navigation */}
//                 <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
//                   {navItems.map((item) => {
//                     const isActive = pathname === item.href;
//                     return (
//                       <Link
//                         key={item.name}
//                         href={item.href}
//                         onClick={() => setIsMobileMenuOpen(false)}
//                         className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
//                           isActive
//                             ? "bg-orange-50 text-orange-600"
//                             : "text-slate-600 hover:bg-slate-50"
//                         }`}
//                       >
//                         <item.icon className={`w-5 h-5 ${isActive ? "text-orange-500" : "text-slate-400"}`} />
//                         <span className="text-sm font-medium">{item.name}</span>
//                       </Link>
//                     );
//                   })}
//                 </nav>

//                 {/* Mobile Bottom */}
//                 <div className="p-3 border-t border-slate-100 space-y-1">
//                   <Link
//                     href="/delivery/support"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                     className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50"
//                   >
//                     <HelpCircle className="w-5 h-5 text-slate-400" />
//                     <span className="text-sm">Support</span>
//                   </Link>
//                   <Link
//                     href="/delivery/settings"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                     className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50"
//                   >
//                     <Settings className="w-5 h-5 text-slate-400" />
//                     <span className="text-sm">Settings</span>
//                   </Link>
//                   <button
//                     onClick={() => router.push("/delivery/auth/logout")}
//                     className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
//                   >
//                     <LogOut className="w-5 h-5" />
//                     <span className="text-sm">Logout</span>
//                   </button>
//                 </div>
//               </div>
//             </motion.aside>
//           </>
//         )}
//       </AnimatePresence>

//       {/* Main Content */}
//       <main className="lg:ml-64 pt-16 lg:pt-0">
//         <div className="p-4 lg:p-8">{children}</div>
//       </main>
//     </div>
//   );
// }

// app/(delivery)/delivery/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { DeliverySidebar } from '@/components/delivery/layout/DeliverySidebar';
import { DeliveryHeader } from '@/components/delivery/layout/DeliveryHeader';
import { DeliveryFooter } from '@/components/delivery/layout/DeliveryFooter';
import { DeliveryPartnerProvider } from '@/contexts/DeliveryPartnerContext';
import { useDeliverySidebarStore } from '@/store/DeliverySidebarStore';
import { Loader2 } from 'lucide-react';

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const { isCollapsed, setMobileOpen } = useDeliverySidebarStore();

  // Check if it's an auth page (no sidebar/header/footer)
  const isAuthPage = pathname?.startsWith('/delivery/auth') ?? false;

  useEffect(() => {
    if (isAuthPage) {
      setIsLoading(false);
      return;
    }

    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/delivery/auth/login');
      return;
    }

    // Check if user has delivery role
    const role = (session?.user as { role?: string } | undefined)?.role;
    const deliveryRoles = ['delivery_partner', 'delivery_boy', 'delivery'];

    if (!role || !deliveryRoles.includes(role)) {
      router.push('/delivery/auth/login');
      return;
    }

    setIsLoading(false);
  }, [session, status, router, pathname, isAuthPage]);

  // Close mobile sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setMobileOpen]);

  // Loading state
  if (isLoading && !isAuthPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          <p className="text-sm text-gray-500">Loading delivery portal...</p>
        </div>
      </div>
    );
  }

  // Auth pages - render without layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Protected layout with sidebar, header, footer
  return (
    <DeliveryPartnerProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        <DeliverySidebar />

        <div
          className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
            isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}
        >
          <DeliveryHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8">{children}</div>
          </main>
          <DeliveryFooter />
        </div>
      </div>
    </DeliveryPartnerProvider>
  );
}