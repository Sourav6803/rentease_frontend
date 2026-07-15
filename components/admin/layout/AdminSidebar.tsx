// 'use client'

// import { useState, useEffect, useRef, useMemo } from 'react'
// import Link from 'next/link'
// import { usePathname, useRouter } from 'next/navigation'
// import { useSession, signOut } from 'next-auth/react'
// import { useSidebarStore } from '@/store/SidebarStore'
// import { cn } from '@/lib/utils'
// import {
//   Users,
//   Store,
//   ShoppingBag,
//   Settings,
//   LogOut,
//   ChevronLeft,
//   ChevronRight,
//   TrendingUp,
//   ChevronDown,
//   AlertCircle,
//   X,
//   Shield,
//   LifeBuoy,
// } from 'lucide-react'
// import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
// import Image from 'next/image'
// import { useQuery } from '@tanstack/react-query'
// import { formatCompactINR } from '@/lib/api/admin-intelligence'
// import { getAdminDashboardStats, getOverview } from '@/lib/api/admin-intelligence'
// import { analyticsApi } from '@/lib/api/analytics'
// import menuItems from './MenuItemsData'

// // ─── Logout Modal Component ─────────────────────────────────────────────────────────────
// function LogoutModal({
//   isOpen,
//   onClose,
//   onConfirm,
//   isLoading,
//   adminName,
// }: {
//   isOpen: boolean
//   onClose: () => void
//   onConfirm: () => void
//   isLoading: boolean
//   adminName?: string
// }) {
//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div
//         className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
//         onClick={onClose}
//       />

//       <div className="relative z-10 w-full max-w-md mx-4 transform transition-all duration-300 scale-100 opacity-100">
//         <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
//           <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

//           <div className="p-6">
//             <div className="flex justify-center mb-4">
//               <div className="relative">
//                 <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
//                 <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
//                   <LogOut className="h-8 w-8 text-white" />
//                 </div>
//               </div>
//             </div>

//             <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
//               Logout Confirmation
//             </h3>

//             <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
//               Are you sure you want to logout from Admin Portal?
//               {adminName && (
//                 <span className="block mt-1 text-xs text-gray-500">
//                   Signed in as <span className="font-semibold text-gray-700 dark:text-gray-300">{adminName}</span>
//                 </span>
//               )}
//             </p>

//             <div className="mb-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
//                 <p className="text-xs text-amber-800 dark:text-amber-300">
//                   You will be redirected to the login page
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <Button
//                 variant="outline"
//                 onClick={onClose}
//                 disabled={isLoading}
//                 className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={onConfirm}
//                 disabled={isLoading}
//                 className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
//               >
//                 {isLoading ? (
//                   <>
//                     <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
//                     Logging out...
//                   </>
//                 ) : (
//                   <>
//                     <LogOut className="h-4 w-4 mr-2" />
//                     Logout
//                   </>
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ─── Collapsed Icon Button (with tooltip) ─────────────────────────────────────────────
// const CollapsedNavIcon = ({ item, isActive }: { item: any; isActive: boolean }) => {
//   const Icon = item.icon
//   const hasChildren = item.children?.length > 0

//   if (hasChildren) {
//     return (
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <div className="flex items-center justify-center w-10 h-10 rounded-lg mx-auto bg-blue-800/30 text-blue-200 cursor-not-allowed">
//             <Icon className="h-5 w-5" />
//           </div>
//         </TooltipTrigger>
//         <TooltipContent side="right" className="bg-[#1e3a5f] text-white border-blue-700 text-xs">
//           {item.name}
//         </TooltipContent>
//       </Tooltip>
//     )
//   }

//   return (
//     <Tooltip>
//       <TooltipTrigger asChild>
//         <Link
//           href={item.href}
//           className={cn(
//             'flex items-center justify-center w-10 h-10 rounded-lg mx-auto transition-all duration-150',
//             isActive
//               ? 'bg-gradient-to-r from-[#2874F0] to-[#1a5bbf] text-white shadow-lg'
//               : 'text-blue-200 hover:bg-blue-700/60 hover:text-white',
//           )}
//         >
//           <Icon className="h-5 w-5" />
//         </Link>
//       </TooltipTrigger>
//       <TooltipContent side="right" className="bg-[#1e3a5f] text-white border-blue-700 text-xs">
//         {item.name}
//       </TooltipContent>
//     </Tooltip>
//   )
// }

// const FALLBACK_QUICK_STATS = [
//   { label: 'Total Revenue', value: '₹24.5L', change: '+12.5%', trend: 'up' as const, icon: TrendingUp },
//   { label: 'Active Vendors', value: '156', change: '+8', trend: 'up' as const, icon: Store },
//   { label: 'Total Users', value: '2.5K', change: '+156', trend: 'up' as const, icon: Users },
//   { label: 'Active Rentals', value: '342', change: '+23', trend: 'up' as const, icon: ShoppingBag },
// ]

// // ─── Main Component ───────────────────────────────────────────────────────────────
// export function AdminSidebar() {
//   const [mounted, setMounted] = useState(false)
//   const [expandedItems, setExpandedItems] = useState<string[]>([])
//   const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
//   const [isLoggingOut, setIsLoggingOut] = useState(false)

//   const { data: session } = useSession()
//   const pathname = usePathname()
//   const router = useRouter()
//   const { isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen } = useSidebarStore()
//   const scrollRef = useRef<HTMLDivElement>(null)

//   const userRole = (session?.user?.role as keyof typeof menuItems) || 'admin'
//   const menu = menuItems[userRole] || menuItems.admin

//   // Add Settings and Support to menu if not present
//   const enhancedMenu = [...menu]

//   const hasSettings = enhancedMenu.some((item) => item.name === 'Settings')
//   if (!hasSettings) {
//     enhancedMenu.push({
//       name: 'Settings',
//       href: '/admin/settings',
//       icon: Settings,
//       exact: false,
//     })
//   }

//   const hasSupport = enhancedMenu.some((item) => item.name === 'Help & Support')
//   if (!hasSupport) {
//     enhancedMenu.push({
//       name: 'Help & Support',
//       href: '/admin/help&support',
//       icon: LifeBuoy,
//       exact: false,
//     })
//   }

//   // ── Live analytics counts ──────────────────────────────────────────────
//   const adminStatsQ = useQuery({
//     queryKey: ['admin-sidebar', 'dashboard-stats'],
//     queryFn: () => getAdminDashboardStats(),
//     staleTime: 60_000,
//     retry: 1,
//   })

//   const overviewQ = useQuery({
//     queryKey: ['admin-sidebar', 'overview'],
//     queryFn: () => getOverview(),
//     staleTime: 60_000,
//     retry: 1,
//   })

//   const userAnalyticsQ = useQuery({
//     queryKey: ['admin-sidebar', 'user-analytics'],
//     queryFn: () => analyticsApi.getUserAnalytics({ period: '30d' }),
//     staleTime: 60_000,
//     retry: 1,
//   })

//   const stats = adminStatsQ.data
//   const overview = overviewQ.data
//   const userAnalytics = userAnalyticsQ.data as any

//   const badgeMap = useMemo((): Record<string, number | undefined> => {
//     const kycTotal = userAnalytics?.overview?.totalUsers ?? stats?.users?.total ?? 0
//     const kycApproved = userAnalytics?.overview?.kycApproved ?? 0
//     const kycPending = Math.max(0, kycTotal - kycApproved)

//     return {
//       '/admin/vendors/approval': stats?.vendors?.pending,
//       '/admin/products/pending': stats?.products?.pending,
//       '/admin/users/kyc': kycPending,
//       '/admin/rentals/overdue': stats?.rentals?.overdue,
//       '/admin/products/reviews': stats?.pending?.reviews,
//       '/admin/inventory/alerts': overview?.outOfStockProducts,
//     }
//   }, [stats, userAnalytics, overview])

//   const quickStatsData = useMemo(() => {
//     if (!stats) return null
//     return [
//       {
//         label: 'Total Revenue',
//         value: formatCompactINR(stats.rentals?.revenue?.total ?? 0),
//         change: '',
//         trend: 'up' as const,
//         icon: TrendingUp,
//       },
//       {
//         label: 'Active Vendors',
//         value: (stats.vendors?.verified ?? 0).toLocaleString('en-IN'),
//         change: '',
//         trend: 'up' as const,
//         icon: Store,
//       },
//       {
//         label: 'Total Users',
//         value: (stats.users?.total ?? 0).toLocaleString('en-IN'),
//         change: '',
//         trend: 'up' as const,
//         icon: Users,
//       },
//       {
//         label: 'Active Rentals',
//         value: (stats.rentals?.active ?? 0).toLocaleString('en-IN'),
//         change: '',
//         trend: 'up' as const,
//         icon: ShoppingBag,
//       },
//     ]
//   }, [stats])

//   // Close mobile drawer on route change
//   useEffect(() => { setMobileOpen(false) }, [pathname, setMobileOpen])
//   useEffect(() => { setMounted(true) }, [])

//   // Auto-expand parent items when child route is active
//   useEffect(() => {
//     if (!mounted) return
//     enhancedMenu.forEach((item: any) => {
//       if (item.children) {
//         const hasActiveChild = item.children.some((child: any) => pathname.startsWith(child.href))
//         if (hasActiveChild && !expandedItems.includes(item.name)) {
//           setExpandedItems((prev) => [...prev, item.name])
//         }
//       }
//     })
//   }, [pathname, mounted, enhancedMenu, expandedItems])

//   // Scroll active item to the middle of the sidebar on navigation
//   useEffect(() => {
//     if (!mounted) return
//     const timer = setTimeout(() => {
//       const container = scrollRef.current
//       if (!container) return
//       const active = container.querySelector('[data-active="true"]') as HTMLElement | null
//       if (!active) return

//       const cRect = container.getBoundingClientRect()
//       const aRect = active.getBoundingClientRect()
//       const offset = aRect.top - cRect.top + container.scrollTop - (container.clientHeight - active.clientHeight) / 2
//       container.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' })
//     }, 80)

//     return () => clearTimeout(timer)
//   }, [pathname, mounted])

//   const toggleExpanded = (itemName: string) =>
//     setExpandedItems((prev) => (prev.includes(itemName) ? [] : [itemName]))

//   const isActive = (href: string, exact = false) =>
//     exact ? pathname === href : pathname.startsWith(href)

//   const getInitials = () => {
//     const name = session?.user?.name || 'Admin'
//     return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
//   }

//   const handleLogoutClick = () => {
//     setIsLogoutModalOpen(true)
//   }

//   const handleConfirmLogout = async () => {
//     setIsLoggingOut(true)
//     try {
//       await signOut({ redirect: false })
//       setIsLogoutModalOpen(false)
//       window.location.href = '/'
//       router.refresh()
//     } catch (error) {
//       console.error('Logout error:', error)
//     } finally {
//       setIsLoggingOut(false)
//     }
//   }

//   if (!mounted) {
//     return (
//       <aside className="fixed left-0 top-0 z-50 h-screen w-64 bg-gradient-to-br from-[#1a3a6b] to-[#0e2a4f]" />
//     )
//   }

//   const statsToRender = quickStatsData ?? FALLBACK_QUICK_STATS

//   // ── Inner Sidebar Content ──
//   const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
//     <div className="flex h-full flex-col overflow-hidden">
//       {/* ── Header ── */}
//       <div className="flex h-14 shrink-0 items-center justify-between border-b border-blue-700/60 px-3 ">
//         {!collapsed ? (
//           <Link href="/admin/dashboard" className="flex items-center gap-2 min-w-0">
//             <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
//               <Image src="/icon.svg" alt="RentEase" width={22} height={22} priority />
//             </div>
//             <div className="min-w-0">
//               <p className="text-sm font-extrabold text-white leading-none tracking-tight truncate">
//                 Rent<span className="text-[#FFE500]">Ease</span>
//               </p>
//               <p className="text-[10px] text-blue-200 italic leading-none mt-0.5">
//                 Admin Portal
//               </p>
//             </div>
//           </Link>
//         ) : (
//           <div className="mx-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
//             <Image src="/icon.svg" alt="RentEase" width={20} height={20} priority />
//           </div>
//         )}

//         {/* Toggle Button (desktop only) */}
//         {!isMobileOpen && (
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={toggleCollapse}
//             className="hidden md:flex h-7 w-7 rounded-lg text-white hover:bg-white/20 shrink-0 transition-all duration-200"
//           >
//             {collapsed
//               ? <ChevronRight className="h-4 w-4" />
//               : <ChevronLeft className="h-4 w-4" />}
//           </Button>
//         )}

//         {/* Close button (mobile drawer only) */}
//         {isMobileOpen && (
//           <button
//             onClick={() => setMobileOpen(false)}
//             className="flex md:hidden h-7 w-7 items-center justify-center rounded-lg hover:bg-white/20 transition-colors shrink-0"
//             aria-label="Close sidebar"
//           >
//             <X className="h-4 w-4 text-white" />
//           </button>
//         )}
//       </div>

//       {/* ── Quick Stats (expanded only) ── */}
//       {!collapsed && (
//         <div className="shrink-0 grid grid-cols-2 gap-1.5 p-3 border-b border-blue-700/60">
//           {statsToRender.map((stat) => (
//             <div
//               key={stat.label}
//               className="rounded-lg bg-gradient-to-br from-blue-800/50 to-blue-900/30 hover:from-blue-700/60 hover:to-blue-800/40 transition-all duration-200 p-2 cursor-default border border-blue-700/30"
//             >
//               <div className="flex items-center justify-between mb-0.5">
//                 <stat.icon className="h-3 w-3 text-blue-300" />
//                 <span className={cn(
//                   'text-[9px] font-bold px-1 py-0.5 rounded',
//                   stat.trend === 'up' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10',
//                 )}>
//                   {stat.change}
//                 </span>
//               </div>
//               <p className="text-sm font-bold text-white leading-tight">{stat.value}</p>
//               <p className="text-[10px] text-blue-300 mt-0.5 leading-none">{stat.label}</p>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── Navigation (scrollable) ── */}
//       <div
//         ref={scrollRef}
//         className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-2 px-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-700/60"
//       >
//         {collapsed ? (
//           <nav className="space-y-1">
//             {enhancedMenu.map((item: any) => (
//               <CollapsedNavIcon
//                 key={item.name}
//                 item={item}
//                 isActive={item.href ? isActive(item.href) : false}
//               />
//             ))}
//           </nav>
//         ) : (
//           <nav className="space-y-0.5">
//             {enhancedMenu.map((item: any) => {
//               const Icon = item.icon
//               const hasChildren = item.children && item.children.length > 0
//               const isItemExpanded = expandedItems.includes(item.name)

//               if (hasChildren) {
//                 return (
//                   <div key={item.name} className="mb-1">
//                     <button
//                       onClick={() => toggleExpanded(item.name)}
//                       className={cn(
//                         'group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium',
//                         'transition-all duration-150 focus:outline-none',
//                         'hover:bg-blue-700/40 hover:text-white',
//                       )}
//                     >
//                       <div className="flex items-center gap-3 min-w-0">
//                         <Icon className="h-4.5 w-4.5 shrink-0 text-blue-300" />
//                         <span className="truncate text-blue-100">{item.name}</span>
//                       </div>
//                       <ChevronDown
//                         className={cn(
//                           'h-4 w-4 shrink-0 text-blue-300 transition-transform duration-200',
//                           isItemExpanded && 'rotate-180',
//                         )}
//                       />
//                     </button>

//                     {isItemExpanded && (
//                       <div className="mt-0.5 ml-3 border-l border-blue-600/50 pl-3 space-y-0.5 py-1">
//                         {item.children.map((child: any) => {
//                           const childActive = isActive(child.href)
//                           const ChildIcon = child.icon
//                           const dynamicBadge = badgeMap[child.href]
//                           return (
//                             <Link
//                               key={child.href}
//                               href={child.href}
//                               data-active={childActive ? 'true' : undefined}
//                               className={cn(
//                                 'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150',
//                                 childActive
//                                   ? 'bg-gradient-to-r from-[#2874F0] to-[#1a5bbf] text-white shadow-md'
//                                   : 'text-blue-200 hover:bg-blue-700/50 hover:text-white',
//                               )}
//                             >
//                               <ChildIcon className="h-4 w-4 shrink-0" />
//                               <span className="flex-1 truncate">{child.name}</span>
//                               {dynamicBadge != null && dynamicBadge > 0 && (
//                                 <Badge className="bg-[#FFE500] text-blue-900 hover:bg-[#FFE500] text-[9px] px-1.5 py-0 h-4 ml-auto font-bold">
//                                   {dynamicBadge}
//                                 </Badge>
//                               )}
//                             </Link>
//                           )
//                         })}
//                       </div>
//                     )}
//                   </div>
//                 )
//               }

//               const active = isActive(item.href, item.exact)
//               const dynamicBadge = item.href ? badgeMap[item.href] : undefined
//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   data-active={active ? 'true' : undefined}
//                   className={cn(
//                     'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
//                     active
//                       ? 'bg-gradient-to-r from-[#2874F0] to-[#1a5bbf] text-white shadow-md'
//                       : 'text-blue-100 hover:bg-blue-700/40 hover:text-white',
//                   )}
//                 >
//                   <Icon className="h-4.5 w-4.5 shrink-0" />
//                   <span className="flex-1 truncate">{item.name}</span>
//                   {dynamicBadge != null && dynamicBadge > 0 && (
//                     <Badge className="bg-[#FFE500] text-blue-900 hover:bg-[#FFE500] text-[9px] px-1.5 py-0 h-4 ml-auto font-bold">
//                       {dynamicBadge}
//                     </Badge>
//                   )}
//                 </Link>
//               )
//             })}
//           </nav>
//         )}
//       </div>

//       {/* ── Footer ── */}
//       <div className="shrink-0 border-t border-blue-700/60 p-2">
//         {/* System Status */}
//         {!collapsed && (
//           <div className="rounded-lg bg-gradient-to-br from-blue-800/40 to-blue-900/30 p-2.5 mb-2 border border-blue-700/30">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-[10px] text-blue-300 font-medium">System Health</span>
//               <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-[9px] px-1.5 py-0 h-4">
//                 All Systems Operational
//               </Badge>
//             </div>
//             <div className="w-full bg-blue-900/50 rounded-full h-1 mb-1">
//               <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-1 rounded-full" style={{ width: '98%' }} />
//             </div>
//             <p className="text-[9px] text-blue-400">99.8% Uptime • Last 30 days</p>
//           </div>
//         )}

//         {/* Logout Button */}
//         <button
//           onClick={handleLogoutClick}
//           className={cn(
//             'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
//             'text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150',
//             collapsed && 'justify-center px-0',
//           )}
//         >
//           <LogOut className="h-4.5 w-4.5 shrink-0" />
//           {!collapsed && <span>Logout</span>}
//         </button>
//       </div>
//     </div>
//   )

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <TooltipProvider delayDuration={0}>
//       {/* ── Desktop sidebar ───────────────────────────────────────────── */}
//       <aside
//         className={cn(
//           'fixed left-0 top-0 z-40 h-screen',
//           'bg-gradient-to-br from-[#1a3a6b] via-[#173a62] to-[#0e2a4f]',
//           'border-r border-blue-700/50 shadow-2xl',
//           'transition-[width] duration-300 ease-in-out',
//           'hidden md:block',
//           isCollapsed ? 'w-16' : 'w-64',
//         )}
//       >
//         <SidebarContent collapsed={isCollapsed} />
//       </aside>

//       {/* ── Mobile overlay ────────────────────────────────────────────── */}
//       {isMobileOpen && (
//         <div
//           className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden transition-all duration-300"
//           onClick={() => setMobileOpen(false)}
//         />
//       )}

//       {/* ── Mobile drawer ─────────────────────────────────────────────── */}
//       <aside
//         className={cn(
//           'fixed left-0 top-0 z-50 h-screen w-72',
//           'bg-gradient-to-br from-[#1a3a6b] via-[#173a62] to-[#0e2a4f]',
//           'border-r border-blue-700/50 shadow-2xl',
//           'transition-transform duration-300 ease-in-out',
//           'md:hidden',
//           isMobileOpen ? 'translate-x-0' : '-translate-x-full',
//         )}
//       >
//         <SidebarContent collapsed={false} />
//       </aside>

//       {/* ── Logout Modal ── */}
//       <LogoutModal
//         isOpen={isLogoutModalOpen}
//         onClose={() => setIsLogoutModalOpen(false)}
//         onConfirm={handleConfirmLogout}
//         isLoading={isLoggingOut}
//         adminName={session?.user?.name || 'Admin User'}
//       />
//     </TooltipProvider>
//   )
// }


'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useSidebarStore } from '@/store/SidebarStore'
import { cn } from '@/lib/utils'
import {
  Users,
  Store,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ChevronDown,
  AlertCircle,
  X,
  LifeBuoy,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { formatCompactINR } from '@/lib/api/admin-intelligence'
import { getAdminDashboardStats, getOverview } from '@/lib/api/admin-intelligence'
import { analyticsApi } from '@/lib/api/analytics'
import menuItems from './MenuItemsData'

// ─── Logout Modal Component ─────────────────────────────────────────────────────────────
function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  adminName,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
  adminName?: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={isLoading ? undefined : onClose}
      />

      <div className="relative z-10 mx-4 w-full max-w-md scale-100 transform opacity-100 transition-all duration-300">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-2xl dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

          <div className="p-6">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                  <LogOut className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <h3 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">
              Logout Confirmation
            </h3>

            <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to logout from Admin Portal?
              {adminName && (
                <span className="mt-1 block text-xs text-gray-500">
                  Signed in as <span className="font-semibold text-gray-700 dark:text-gray-300">{adminName}</span>
                </span>
              )}
            </p>

            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  You will be redirected to the login page
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 border-gray-300 transition-all duration-200 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 transform bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-red-600 hover:to-red-700"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Collapsed Icon Button (with tooltip) ─────────────────────────────────────────────
const CollapsedNavIcon = ({ item, isActive }: { item: any; isActive: boolean }) => {
  const Icon = item.icon
  const hasChildren = item.children?.length > 0

  if (hasChildren) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="mx-auto flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-lg bg-blue-800/30 text-blue-200">
            <Icon className="h-5 w-5" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="border-blue-700 bg-[#1e3a5f] text-xs text-white">
          {item.name}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          className={cn(
            'mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-150',
            isActive
              ? 'bg-gradient-to-r from-[#2874F0] to-[#1a5bbf] text-white shadow-lg'
              : 'text-blue-200 hover:bg-blue-700/60 hover:text-white',
          )}
        >
          <Icon className="h-5 w-5" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="border-blue-700 bg-[#1e3a5f] text-xs text-white">
        {item.name}
      </TooltipContent>
    </Tooltip>
  )
}

const FALLBACK_QUICK_STATS = [
  { label: 'Total Revenue', value: '₹24.5L', change: '+12.5%', trend: 'up' as const, icon: TrendingUp },
  { label: 'Active Vendors', value: '156', change: '+8', trend: 'up' as const, icon: Store },
  { label: 'Total Users', value: '2.5K', change: '+156', trend: 'up' as const, icon: Users },
  { label: 'Active Rentals', value: '342', change: '+23', trend: 'up' as const, icon: ShoppingBag },
]

// ─── Sidebar Content ────────────────────────────────────────────────────────
// CRITICAL FIX: this was previously declared *inside* AdminSidebar()'s render body.
// A component defined inline gets a brand-new function reference every render, so
// React treats it as a different component type on every state update (e.g.
// clicking to expand a menu item) and unmounts + remounts the whole subtree —
// including the scrollable nav container, which is why scrollTop reset to 0 and
// it looked like an instant "scroll to top". Hoisting it to module scope and
// passing everything it needs as props keeps it the same component instance
// across renders, so the DOM (and its scroll position) persists.
interface SidebarContentProps {
  collapsed: boolean
  isMobileOpen: boolean
  toggleCollapse: () => void
  setMobileOpen: (open: boolean) => void
  statsToRender: typeof FALLBACK_QUICK_STATS
  scrollRef: React.RefObject<HTMLDivElement | null>
  enhancedMenu: any[]
  expandedItems: string[]
  toggleExpanded: (name: string) => void
  isActive: (href: string, exact?: boolean) => boolean
  badgeMap: Record<string, number | undefined>
  handleLogoutClick: () => void
}

function SidebarContent({
  collapsed = false,
  isMobileOpen,
  toggleCollapse,
  setMobileOpen,
  statsToRender,
  scrollRef,
  enhancedMenu,
  expandedItems,
  toggleExpanded,
  isActive,
  badgeMap,
  handleLogoutClick,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-blue-700/60 px-3">
        {!collapsed ? (
          <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Image src="/icon.svg" alt="RentEase" width={22} height={22} priority />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold leading-none tracking-tight text-white">
                Rent<span className="text-[#FFE500]">Ease</span>
              </p>
              <p className="mt-0.5 text-[10px] italic leading-none text-blue-200">
                Admin Portal
              </p>
            </div>
          </Link>
        ) : (
          <div className="mx-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Image src="/icon.svg" alt="RentEase" width={20} height={20} priority />
          </div>
        )}

        {!isMobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hidden h-7 w-7 shrink-0 rounded-lg text-white transition-all duration-200 hover:bg-white/20 md:flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}

        {isMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white/20 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        )}
      </div>

      {/* ── Quick Stats (expanded only) ── */}
      {!collapsed && (
        <div className="grid shrink-0 grid-cols-2 gap-1.5 border-b border-blue-700/60 p-3">
          {statsToRender.map((stat) => (
            <div
              key={stat.label}
              className="cursor-default rounded-lg border border-blue-700/30 bg-gradient-to-br from-blue-800/50 to-blue-900/30 p-2 transition-all duration-200 hover:from-blue-700/60 hover:to-blue-800/40"
            >
              <div className="mb-0.5 flex items-center justify-between">
                <stat.icon className="h-3 w-3 text-blue-300" />
                <span
                  className={cn(
                    'rounded px-1 py-0.5 text-[9px] font-bold',
                    stat.trend === 'up' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400',
                  )}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-bold leading-tight text-white">{stat.value}</p>
              <p className="mt-0.5 text-[10px] leading-none text-blue-300">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Navigation (scrollable) ── */}
      <div
        ref={scrollRef}
        className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-700/60 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2"
      >
        {collapsed ? (
          <nav className="space-y-1">
            {enhancedMenu.map((item: any) => (
              <CollapsedNavIcon key={item.name} item={item} isActive={item.href ? isActive(item.href) : false} />
            ))}
          </nav>
        ) : (
          <nav className="space-y-0.5">
            {enhancedMenu.map((item: any) => {
              const Icon = item.icon
              const hasChildren = item.children && item.children.length > 0
              const isItemExpanded = expandedItems.includes(item.name)

              if (hasChildren) {
                return (
                  <div key={item.name} className="mb-1">
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-blue-700/40 hover:text-white focus:outline-none"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Icon className="h-[18px] w-[18px] shrink-0 text-blue-300" />
                        <span className="truncate text-blue-100">{item.name}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 text-blue-300 transition-transform duration-200',
                          isItemExpanded && 'rotate-180',
                        )}
                      />
                    </button>

                    {isItemExpanded && (
                      <div className="ml-3 mt-0.5 space-y-0.5 border-l border-blue-600/50 py-1 pl-3">
                        {item.children.map((child: any) => {
                          const childActive = isActive(child.href)
                          const ChildIcon = child.icon
                          const dynamicBadge = badgeMap[child.href]
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              data-active={childActive ? 'true' : undefined}
                              className={cn(
                                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150',
                                childActive
                                  ? 'bg-gradient-to-r from-[#2874F0] to-[#1a5bbf] text-white shadow-md'
                                  : 'text-blue-200 hover:bg-blue-700/50 hover:text-white',
                              )}
                            >
                              <ChildIcon className="h-4 w-4 shrink-0" />
                              <span className="flex-1 truncate">{child.name}</span>
                              {dynamicBadge != null && dynamicBadge > 0 && (
                                <Badge className="ml-auto h-4 bg-[#FFE500] px-1.5 py-0 text-[9px] font-bold text-blue-900 hover:bg-[#FFE500]">
                                  {dynamicBadge}
                                </Badge>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              const active = isActive(item.href, item.exact)
              const dynamicBadge = item.href ? badgeMap[item.href] : undefined
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active ? 'true' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    active
                      ? 'bg-gradient-to-r from-[#2874F0] to-[#1a5bbf] text-white shadow-md'
                      : 'text-blue-100 hover:bg-blue-700/40 hover:text-white',
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1 truncate">{item.name}</span>
                  {dynamicBadge != null && dynamicBadge > 0 && (
                    <Badge className="ml-auto h-4 bg-[#FFE500] px-1.5 py-0 text-[9px] font-bold text-blue-900 hover:bg-[#FFE500]">
                      {dynamicBadge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-blue-700/60 p-2">
        {!collapsed && (
          <div className="mb-2 rounded-lg border border-blue-700/30 bg-gradient-to-br from-blue-800/40 to-blue-900/30 p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-medium text-blue-300">System Health</span>
              <Badge className="h-4 border border-green-500/30 bg-green-500/20 px-1.5 py-0 text-[9px] text-green-400">
                All Systems Operational
              </Badge>
            </div>
            <div className="mb-1 h-1 w-full rounded-full bg-blue-900/50">
              <div className="h-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-400" style={{ width: '98%' }} />
            </div>
            <p className="text-[9px] text-blue-400">99.8% Uptime • Last 30 days</p>
          </div>
        )}

        <button
          onClick={handleLogoutClick}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
            'text-red-400 transition-all duration-150 hover:bg-red-500/10 hover:text-red-300',
            collapsed && 'justify-center px-0',
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────────
export function AdminSidebar() {
  const [mounted, setMounted] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen } = useSidebarStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const userRole = (session?.user?.role as keyof typeof menuItems) || 'admin'
  const menu = menuItems[userRole] || menuItems.admin

  // Fix: memoize so this array only gets a new identity when userRole actually
  // changes, not on every render — stops the auto-expand effect below from
  // re-running on unrelated state updates.
  const enhancedMenu = useMemo(() => {
    const list = [...menu]

    if (!list.some((item) => item.name === 'Settings')) {
      list.push({ name: 'Settings', href: '/admin/settings', icon: Settings, exact: false })
    }
    if (!list.some((item) => item.name === 'Help & Support')) {
      list.push({ name: 'Help & Support', href: '/admin/help&support', icon: LifeBuoy, exact: false })
    }

    return list
  }, [menu])

  // ── Live analytics counts ──────────────────────────────────────────────
  const adminStatsQ = useQuery({
    queryKey: ['admin-sidebar', 'dashboard-stats'],
    queryFn: () => getAdminDashboardStats(),
    staleTime: 60_000,
    retry: 1,
  })

  const overviewQ = useQuery({
    queryKey: ['admin-sidebar', 'overview'],
    queryFn: () => getOverview(),
    staleTime: 60_000,
    retry: 1,
  })

  const userAnalyticsQ = useQuery({
    queryKey: ['admin-sidebar', 'user-analytics'],
    queryFn: () => analyticsApi.getUserAnalytics({ period: '30d' }),
    staleTime: 60_000,
    retry: 1,
  })

  const stats = adminStatsQ.data
  const overview = overviewQ.data
  const userAnalytics = userAnalyticsQ.data as any

  const badgeMap = useMemo((): Record<string, number | undefined> => {
    const kycTotal = userAnalytics?.overview?.totalUsers ?? stats?.users?.total ?? 0
    const kycApproved = userAnalytics?.overview?.kycApproved ?? 0
    const kycPending = Math.max(0, kycTotal - kycApproved)

    return {
      '/admin/vendors/approval': stats?.vendors?.pending,
      '/admin/products/pending': stats?.products?.pending,
      '/admin/users/kyc': kycPending,
      '/admin/rentals/overdue': stats?.rentals?.overdue,
      '/admin/products/reviews': stats?.pending?.reviews,
      '/admin/inventory/alerts': overview?.outOfStockProducts,
    }
  }, [stats, userAnalytics, overview])

  const quickStatsData = useMemo(() => {
    if (!stats) return null
    return [
      {
        label: 'Total Revenue',
        value: formatCompactINR(stats.rentals?.revenue?.total ?? 0),
        change: '',
        trend: 'up' as const,
        icon: TrendingUp,
      },
      {
        label: 'Active Vendors',
        value: (stats.vendors?.verified ?? 0).toLocaleString('en-IN'),
        change: '',
        trend: 'up' as const,
        icon: Store,
      },
      {
        label: 'Total Users',
        value: (stats.users?.total ?? 0).toLocaleString('en-IN'),
        change: '',
        trend: 'up' as const,
        icon: Users,
      },
      {
        label: 'Active Rentals',
        value: (stats.rentals?.active ?? 0).toLocaleString('en-IN'),
        change: '',
        trend: 'up' as const,
        icon: ShoppingBag,
      },
    ]
  }, [stats])

  useEffect(() => { setMobileOpen(false) }, [pathname, setMobileOpen])
  useEffect(() => { setMounted(true) }, [])

  // Auto-expand parent items when child route is active
  useEffect(() => {
    if (!mounted) return
    enhancedMenu.forEach((item: any) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child: any) => pathname.startsWith(child.href))
        if (hasActiveChild && !expandedItems.includes(item.name)) {
          setExpandedItems((prev) => [...prev, item.name])
        }
      }
    })
  }, [pathname, mounted, enhancedMenu, expandedItems])

  // Scroll active item to the middle of the sidebar on navigation
  useEffect(() => {
    if (!mounted) return
    const timer = setTimeout(() => {
      const container = scrollRef.current
      if (!container) return
      const active = container.querySelector('[data-active="true"]') as HTMLElement | null
      if (!active) return

      const cRect = container.getBoundingClientRect()
      const aRect = active.getBoundingClientRect()
      const offset = aRect.top - cRect.top + container.scrollTop - (container.clientHeight - active.clientHeight) / 2
      container.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' })
    }, 80)

    return () => clearTimeout(timer)
  }, [pathname, mounted])

  const toggleExpanded = useCallback(
    (itemName: string) => setExpandedItems((prev) => (prev.includes(itemName) ? [] : [itemName])),
    [],
  )

  const isActive = useCallback(
    (href: string, exact = false) => (exact ? pathname === href : pathname.startsWith(href)),
    [pathname],
  )

  const handleLogoutClick = useCallback(() => setIsLogoutModalOpen(true), [])

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ redirect: false })
      setIsLogoutModalOpen(false)
      window.location.href = '/'
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!mounted) {
    return <aside className="fixed left-0 top-0 z-50 h-screen w-64 bg-gradient-to-br from-[#1a3a6b] to-[#0e2a4f]" />
  }

  const statsToRender = quickStatsData ?? FALLBACK_QUICK_STATS

  return (
    <TooltipProvider delayDuration={0}>
      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen',
          'bg-gradient-to-br from-[#1a3a6b] via-[#173a62] to-[#0e2a4f]',
          'border-r border-blue-700/50 shadow-2xl',
          'transition-[width] duration-300 ease-in-out',
          'hidden md:block',
          isCollapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent
          collapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          toggleCollapse={toggleCollapse}
          setMobileOpen={setMobileOpen}
          statsToRender={statsToRender}
          scrollRef={scrollRef}
          enhancedMenu={enhancedMenu}
          expandedItems={expandedItems}
          toggleExpanded={toggleExpanded}
          isActive={isActive}
          badgeMap={badgeMap}
          handleLogoutClick={handleLogoutClick}
        />
      </aside>

      {/* ── Mobile overlay ────────────────────────────────────────────── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-300 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-72',
          'bg-gradient-to-br from-[#1a3a6b] via-[#173a62] to-[#0e2a4f]',
          'border-r border-blue-700/50 shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          'md:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent
          collapsed={false}
          isMobileOpen={isMobileOpen}
          toggleCollapse={toggleCollapse}
          setMobileOpen={setMobileOpen}
          statsToRender={statsToRender}
          scrollRef={scrollRef}
          enhancedMenu={enhancedMenu}
          expandedItems={expandedItems}
          toggleExpanded={toggleExpanded}
          isActive={isActive}
          badgeMap={badgeMap}
          handleLogoutClick={handleLogoutClick}
        />
      </aside>

      {/* ── Logout Modal ── */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
        adminName={session?.user?.name || 'Admin User'}
      />
    </TooltipProvider>
  )
}