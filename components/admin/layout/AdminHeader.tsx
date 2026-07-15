


// // src/components/admin/layout/AdminHeader.tsx
// 'use client'

// import { useState } from 'react'
// import { usePathname, useRouter } from 'next/navigation'
// import { useSession, signOut } from 'next-auth/react'
// import { 
//   Menu, Search, Bell, Settings, LogOut, 
//   Sun, Moon, Laptop, User, Shield, 
//   ChevronDown, MessageSquare, HelpCircle,
//   Package, Wallet, X, Grid3X3, LayoutDashboard,
//   Store, TrendingUp, Users, Award, Clock,
//   AlertCircle, CheckCircle, Zap
// } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Badge } from '@/components/ui/badge'
// import { useTheme } from 'next-themes'
// import { cn } from '@/lib/utils'
// import { useSidebarStore } from '@/store/SidebarStore'
// import { format } from 'date-fns'

// // Enhanced notifications with gradient backgrounds
// const notifications = [
//   {
//     id: 1,
//     title: 'New Vendor Registration',
//     description: 'Furniture World has applied for vendor account',
//     time: '5 min ago',
//     type: 'vendor',
//     read: false,
//     gradient: 'from-blue-500 to-blue-600',
//     icon: Store
//   },
//   {
//     id: 2,
//     title: 'Product Approval Needed',
//     description: '12 products pending moderation',
//     time: '1 hour ago',
//     type: 'product',
//     read: false,
//     gradient: 'from-amber-500 to-orange-500',
//     icon: Package
//   },
//   {
//     id: 3,
//     title: 'Payment Dispute',
//     description: 'Rental #RNT2412 has payment dispute',
//     time: '2 hours ago',
//     type: 'payment',
//     read: true,
//     gradient: 'from-red-500 to-red-600',
//     icon: Wallet
//   },
//   {
//     id: 4,
//     title: 'System Update',
//     description: 'New version v2.1.0 deployed successfully',
//     time: '1 day ago',
//     type: 'system',
//     read: true,
//     gradient: 'from-green-500 to-emerald-500',
//     icon: Zap
//   }
// ]

// // Quick stats for header (optional)
// const quickStats = [
//   { label: 'Total Revenue', value: '₹24.5L', change: '+12.5%', icon: TrendingUp },
//   { label: 'Active Vendors', value: '156', change: '+8', icon: Store },
//   { label: 'Live Rentals', value: '342', change: '+23', icon: Clock },
// ]

// // ─── Logout Modal Component ─────────────────────────────────────────────────────────────
// function LogoutModal({ 
//   isOpen, 
//   onClose, 
//   onConfirm, 
//   isLoading,
//   adminName 
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
//       {/* Backdrop */}
//       <div 
//         className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
//         onClick={onClose}
//       />
      
//       {/* Modal */}
//       <div className="relative z-10 w-full max-w-md mx-4 transform transition-all duration-300 scale-100 opacity-100">
//         <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
//           {/* Gradient Header */}
//           <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
          
//           <div className="p-6">
//             {/* Icon */}
//             <div className="flex justify-center mb-4">
//               <div className="relative">
//                 <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
//                 <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
//                   <LogOut className="h-8 w-8 text-white" />
//                 </div>
//               </div>
//             </div>

//             {/* Title */}
//             <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
//               Logout Confirmation
//             </h3>
            
//             {/* Message */}
//             <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
//               Are you sure you want to logout from Admin Portal?
//               {adminName && (
//                 <span className="block mt-1 text-xs text-gray-500">
//                   Signed in as <span className="font-semibold text-gray-700 dark:text-gray-300">{adminName}</span>
//                 </span>
//               )}
//             </p>

//             {/* Warning */}
//             <div className="mb-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
//                 <p className="text-xs text-amber-800 dark:text-amber-300">
//                   You will be redirected to the login page
//                 </p>
//               </div>
//             </div>

//             {/* Buttons */}
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


// export function AdminHeader() {
//   const [searchQuery, setSearchQuery] = useState('')
//   const [showNotifications, setShowNotifications] = useState(false)
//   const [searchFocused, setSearchFocused] = useState(false)
//   const pathname = usePathname()
//   const { data: session } = useSession()
//   const { theme, setTheme } = useTheme()
//   const { setMobileOpen, isCollapsed } = useSidebarStore()
//   const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
//   const [isLoggingOut, setIsLoggingOut] = useState(false)
//   const router = useRouter()

//   const unreadCount = notifications.filter(n => !n.read).length

//   // Get page title from pathname
//   const getPageTitle = () => {
//     const segments = pathname.split('/').filter(Boolean)
//     if (segments.length <= 1) return 'Dashboard'
//     const lastSegment = segments[segments.length - 1]
//     return lastSegment
//       .split('-')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(' ')
//   }

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault()
//     console.log('Searching for:', searchQuery)
//   }

//   // const handleLogout = async () => {
//   //   await signOut({ redirect: false })
//   //   window.location.href = '/login'
//   // }

//   const handleLogoutClick = () => {
//     setIsLogoutModalOpen(true)
//   }

//   const handleConfirmLogout = async () => {
//     setIsLoggingOut(true)
//     try {
//       await signOut({ redirect: false })
//       setIsLogoutModalOpen(false)
//       router.push('/')
//       router.refresh()
//     } catch (error) {
//       console.error('Logout error:', error)
//     } finally {
//       setIsLoggingOut(false)
//     }
//   }

//   const getInitials = () => {
//     const name = session?.user?.name || 'Admin'
//     return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
//   }

//   const getUserRole = () => {
//     const role = (session?.user as any)?.role || 'admin'
//     return role.replace(/_/g, ' ').toLowerCase()
//   }

//   return (
//     <header className="sticky top-0 z-40 bg-linear-to-r from-[#1a3a6b] via-[#1e3f6e] to-[#1a3a6b] border-b border-blue-700/60 shadow-lg">
//       <div className="flex h-14 items-center justify-between px-4 md:px-6">
//         {/* Left Section */}
//         <div className="flex items-center gap-3">
//           {/* Mobile Menu Button */}
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setMobileOpen(true)}
//             className="lg:hidden text-white hover:bg-white/10 hover:text-white transition-all duration-200"
//           >
//             <Menu className="h-5 w-5" />
//           </Button>
          
//           {/* Page Title & Breadcrumb */}
//           <div className="hidden md:block">
//             <div className="flex items-center gap-2 text-sm">
//               <LayoutDashboard className="h-4 w-4 text-blue-300" />
//               <span className="text-blue-300">Admin</span>
//               <span className="text-xs text-blue-400/60">/</span>
//               <span className="font-semibold text-white">{getPageTitle()}</span>
//             </div>
//             <p className="text-xs text-blue-300/80 mt-0.5 flex items-center gap-1">
//               <span>Welcome back, {session?.user?.name?.split(' ')[0] || 'Admin'}</span>
//               <span className="text-blue-400">•</span>
//               <span className="flex items-center gap-1">
//                 <Clock className="h-3 w-3" />
//                 {format(new Date(), 'hh:mm a')}
//               </span>
//             </p>
//           </div>
//         </div>

//         {/* Search Bar - Desktop */}
//         <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
//           <div className={cn(
//             "relative w-full transition-all duration-300",
//             searchFocused && "scale-[1.02]"
//           )}>
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
//             <Input
//               placeholder="Search users, vendors, products..."
//               className="w-full pl-9 bg-white/10 border-white/20 text-white placeholder:text-blue-300/60 focus-visible:ring-blue-400 focus-visible:ring-offset-0 rounded-lg"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               onFocus={() => setSearchFocused(true)}
//               onBlur={() => setSearchFocused(false)}
//             />
//             {searchQuery && (
//               <button
//                 type="button"
//                 onClick={() => setSearchQuery('')}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
//               >
//                 <X className="h-3.5 w-3.5" />
//               </button>
//             )}
//           </div>
//         </form>

//         {/* Right Section */}
//         <div className="flex items-center gap-1">
//           {/* Search - Mobile */}
//           <Button
//             variant="ghost"
//             size="icon"
//             className="md:hidden text-white hover:bg-white/10 hover:text-white"
//           >
//             <Search className="h-5 w-5" />
//           </Button>

//           {/* Notifications */}
//           <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 hover:text-white transition-all duration-200">
//                 <Bell className="h-5 w-5" />
//                 {unreadCount > 0 && (
//                   <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[10px] font-bold text-white shadow-lg animate-pulse">
//                     {unreadCount}
//                   </span>
//                 )}
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-80 mt-2 rounded-xl border border-blue-200/20 shadow-2xl bg-white dark:bg-gray-900">
//               <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-t-xl">
//                 <span className="font-bold text-gray-900 dark:text-white">Notifications</span>
//                 <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-medium text-blue-600 hover:text-blue-700">
//                   Mark all as read
//                 </Button>
//               </DropdownMenuLabel>
//               <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
//               <div className="max-h-96 overflow-y-auto">
//                 {notifications.map((notification) => {
//                   const Icon = notification.icon
//                   return (
//                     <DropdownMenuItem key={notification.id} className="cursor-pointer p-3 focus:bg-gray-50 dark:focus:bg-gray-800 transition-all duration-150">
//                       <div className="flex gap-3">
//                         <div className={cn(
//                           "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r shadow-md",
//                           notification.gradient
//                         )}>
//                           <Icon className="h-4 w-4 text-white" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{notification.title}</p>
//                           <p className="text-xs text-gray-600 dark:text-gray-400">{notification.description}</p>
//                           <p className="text-[10px] text-gray-500 dark:text-gray-500 flex items-center gap-1">
//                             <Clock className="h-2.5 w-2.5" />
//                             {notification.time}
//                           </p>
//                         </div>
//                         {!notification.read && (
//                           <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 mt-1" />
//                         )}
//                       </div>
//                     </DropdownMenuItem>
//                   )
//                 })}
//               </div>
//               <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
//               <DropdownMenuItem className="justify-center p-2">
//                 <Button variant="ghost" size="sm" className="w-full text-xs font-medium text-blue-600 hover:text-blue-700">
//                   View all notifications
//                 </Button>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           {/* Theme Toggle */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white transition-all duration-200">
//                 {theme === 'light' ? <Sun className="h-5 w-5" /> : theme === 'dark' ? <Moon className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="min-w-[140px] mt-2 rounded-xl border border-blue-200/20 shadow-xl">
//               <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2 cursor-pointer">
//                 <Sun className="h-4 w-4" /> Light
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2 cursor-pointer">
//                 <Moon className="h-4 w-4" /> Dark
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2 cursor-pointer">
//                 <Laptop className="h-4 w-4" /> System
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           {/* User Menu */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="relative h-9 gap-2 px-2 hover:bg-white/10 transition-all duration-200 rounded-lg">
//                 <Avatar className="h-8 w-8 border-2 border-[#FFE500]/60 shadow-md">
//                   <AvatarImage src={session?.user?.image || ''} />
//                   <AvatarFallback className="bg-gradient-to-r from-[#2874F0] to-[#1a5bbf] text-[#FFE500] font-bold text-xs">
//                     {getInitials()}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div className="hidden lg:flex lg:flex-col lg:items-start">
//                   <span className="text-sm font-semibold text-white leading-none">
//                     {session?.user?.name?.split(' ')[0] || 'Admin'}
//                   </span>
//                   <span className="text-[10px] text-blue-300 capitalize flex items-center gap-1">
//                     <Shield className="h-2.5 w-2.5" />
//                     {getUserRole()}
//                   </span>
//                 </div>
//                 <ChevronDown className="hidden h-3.5 w-3.5 text-blue-300 lg:block" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-64 mt-2 rounded-xl border border-blue-200/20 shadow-xl">
//               <DropdownMenuLabel className="font-normal p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-t-xl">
//                 <div className="flex flex-col space-y-1">
//                   <p className="text-sm font-bold text-gray-900 dark:text-white">{session?.user?.name}</p>
//                   <p className="text-xs text-gray-600 dark:text-gray-400">{session?.user?.email}</p>
//                   <Badge className="mt-1 w-fit bg-gradient-to-r from-[#2874F0] to-[#1a5bbf] text-white border-0 text-[9px] px-2">
//                     <Shield className="h-2.5 w-2.5 mr-1" />
//                     {getUserRole().toUpperCase()} Access
//                   </Badge>
//                 </div>
//               </DropdownMenuLabel>
//               <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
//               <DropdownMenuItem className="gap-2 cursor-pointer py-2.5">
//                 <User className="h-4 w-4" />
//                 <span>Profile Settings</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem className="gap-2 cursor-pointer py-2.5">
//                 <Settings className="h-4 w-4" />
//                 <span>Account Settings</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem className="gap-2 cursor-pointer py-2.5">
//                 <HelpCircle className="h-4 w-4" />
//                 <span>Help Center</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem className="gap-2 cursor-pointer py-2.5">
//                 <Award className="h-4 w-4" />
//                 <span>What's New</span>
//               </DropdownMenuItem>
//               <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
//               <DropdownMenuItem onClick={handleLogoutClick} className="gap-2 cursor-pointer py-2.5 text-red-500 focus:text-red-500">
//                 <LogOut className="h-4 w-4" />
//                 <span>Logout</span>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Mobile Search Bar - Enhanced */}
//       <div className="border-t border-white/10 px-4 py-3 md:hidden bg-white/5 backdrop-blur-sm">
//         <form onSubmit={handleSearch} className="relative">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
//           <Input
//             placeholder="Search..."
//             className="w-full pl-9 bg-white/10 border-white/20 text-white placeholder:text-blue-300/60 rounded-lg"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </form>
//       </div>

//       {/* ── Logout Modal ── */}
//       <LogoutModal
//         isOpen={isLogoutModalOpen}
//         onClose={() => setIsLogoutModalOpen(false)}
//         onConfirm={handleConfirmLogout}
//         isLoading={isLoggingOut}
//         adminName={session?.user?.name || 'Admin User'}
//       />
//     </header>
//   )
// }


// src/components/admin/layout/AdminHeader.tsx
'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  Menu, Search, Bell, Settings, LogOut, 
  Sun, Moon, Laptop, User, Shield, 
  ChevronDown, MessageSquare, HelpCircle,
  Package, Wallet, X, Grid3X3, LayoutDashboard,
  Store, TrendingUp, Users, Award, Clock,
  AlertCircle, CheckCircle, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/store/SidebarStore'
import { format } from 'date-fns'

// Enhanced notifications with gradient backgrounds
const notifications = [
  {
    id: 1,
    title: 'New Vendor Registration',
    description: 'Furniture World has applied for vendor account',
    time: '5 min ago',
    type: 'vendor',
    read: false,
    gradient: 'from-blue-500 to-blue-600',
    icon: Store
  },
  {
    id: 2,
    title: 'Product Approval Needed',
    description: '12 products pending moderation',
    time: '1 hour ago',
    type: 'product',
    read: false,
    gradient: 'from-amber-500 to-orange-500',
    icon: Package
  },
  {
    id: 3,
    title: 'Payment Dispute',
    description: 'Rental #RNT2412 has payment dispute',
    time: '2 hours ago',
    type: 'payment',
    read: true,
    gradient: 'from-red-500 to-red-600',
    icon: Wallet
  },
  {
    id: 4,
    title: 'System Update',
    description: 'New version v2.1.0 deployed successfully',
    time: '1 day ago',
    type: 'system',
    read: true,
    gradient: 'from-green-500 to-emerald-500',
    icon: Zap
  }
]

// Quick stats for header (optional)
const quickStats = [
  { label: 'Total Revenue', value: '₹24.5L', change: '+12.5%', icon: TrendingUp },
  { label: 'Active Vendors', value: '156', change: '+8', icon: Store },
  { label: 'Live Rentals', value: '342', change: '+23', icon: Clock },
]

// ─── Logout Modal Component ─────────────────────────────────────────────────────────────
function LogoutModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading,
  adminName 
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 transform transition-all duration-300 scale-100 opacity-100">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
          {/* Gradient Header */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
          
          <div className="p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
                <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                  <LogOut className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Logout Confirmation
            </h3>
            
            {/* Message */}
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to logout from Admin Portal?
              {adminName && (
                <span className="block mt-1 text-xs text-gray-500">
                  Signed in as <span className="font-semibold text-gray-700 dark:text-gray-300">{adminName}</span>
                </span>
              )}
            </p>

            {/* Warning */}
            <div className="mb-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  You will be redirected to the login page
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
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


export function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  // FIX: mobile search bar is now toggled via this state instead of always
  // rendering. Mirrors VendorHeader's isSearchOpen pattern.
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const { setMobileOpen, isCollapsed } = useSidebarStore()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.read).length

  // Get page title from pathname
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length <= 1) return 'Dashboard'
    const lastSegment = segments[segments.length - 1]
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
  }

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ redirect: false })
      setIsLogoutModalOpen(false)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getInitials = () => {
    const name = session?.user?.name || 'Admin'
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getUserRole = () => {
    const role = (session?.user as any)?.role || 'admin'
    return role.replace(/_/g, ' ').toLowerCase()
  }

  return (
    <header className="sticky top-0 z-40 bg-linear-to-r from-[#1a3a6b] via-[#1e3f6e] to-[#1a3a6b] border-b border-blue-700/60 shadow-lg">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button — opens AdminSidebar's mobile drawer */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-white hover:bg-white/10 hover:text-white transition-all duration-200"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Page Title & Breadcrumb */}
          <div className="hidden md:block">
            <div className="flex items-center gap-2 text-sm">
              <LayoutDashboard className="h-4 w-4 text-blue-300" />
              <span className="text-blue-300">Admin</span>
              <span className="text-xs text-blue-400/60">/</span>
              <span className="font-semibold text-white">{getPageTitle()}</span>
            </div>
            <p className="text-xs text-blue-300/80 mt-0.5 flex items-center gap-1">
              <span>Welcome back, {session?.user?.name?.split(' ')[0] || 'Admin'}</span>
              <span className="text-blue-400">•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(), 'hh:mm a')}
              </span>
            </p>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className={cn(
            "relative w-full transition-all duration-300",
            searchFocused && "scale-[1.02]"
          )}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
            <Input
              placeholder="Search users, vendors, products..."
              className="w-full pl-9 bg-white/10 border-white/20 text-white placeholder:text-blue-300/60 focus-visible:ring-blue-400 focus-visible:ring-offset-0 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-1">
          {/* Search toggle - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSearchOpen((v) => !v)}
            className="md:hidden text-white hover:bg-white/10 hover:text-white"
            aria-label={isMobileSearchOpen ? 'Close search' : 'Open search'}
          >
            {isMobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 hover:text-white transition-all duration-200">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[10px] font-bold text-white shadow-lg animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 mt-2 rounded-xl border border-blue-200/20 shadow-2xl bg-white dark:bg-gray-900">
              <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-t-xl">
                <span className="font-bold text-gray-900 dark:text-white">Notifications</span>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-medium text-blue-600 hover:text-blue-700">
                  Mark all as read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => {
                  const Icon = notification.icon
                  return (
                    <DropdownMenuItem key={notification.id} className="cursor-pointer p-3 focus:bg-gray-50 dark:focus:bg-gray-800 transition-all duration-150">
                      <div className="flex gap-3">
                        <div className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r shadow-md",
                          notification.gradient
                        )}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{notification.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{notification.description}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-500 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 mt-1" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </div>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuItem className="justify-center p-2">
                <Button variant="ghost" size="sm" className="w-full text-xs font-medium text-blue-600 hover:text-blue-700">
                  View all notifications
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white transition-all duration-200">
                {theme === 'light' ? <Sun className="h-5 w-5" /> : theme === 'dark' ? <Moon className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px] mt-2 rounded-xl border border-blue-200/20 shadow-xl">
              <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2 cursor-pointer">
                <Sun className="h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2 cursor-pointer">
                <Moon className="h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2 cursor-pointer">
                <Laptop className="h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 gap-2 px-2 hover:bg-white/10 transition-all duration-200 rounded-lg">
                <Avatar className="h-8 w-8 border-2 border-[#FFE500]/60 shadow-md">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-[#2874F0] to-[#1a5bbf] text-[#FFE500] font-bold text-xs">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex lg:flex-col lg:items-start">
                  <span className="text-sm font-semibold text-white leading-none">
                    {session?.user?.name?.split(' ')[0] || 'Admin'}
                  </span>
                  <span className="text-[10px] text-blue-300 capitalize flex items-center gap-1">
                    <Shield className="h-2.5 w-2.5" />
                    {getUserRole()}
                  </span>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-blue-300 lg:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mt-2 rounded-xl border border-blue-200/20 shadow-xl">
              <DropdownMenuLabel className="font-normal p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-t-xl">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{session?.user?.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{session?.user?.email}</p>
                  <Badge className="mt-1 w-fit bg-gradient-to-r from-[#2874F0] to-[#1a5bbf] text-white border-0 text-[9px] px-2">
                    <Shield className="h-2.5 w-2.5 mr-1" />
                    {getUserRole().toUpperCase()} Access
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuItem className="gap-2 cursor-pointer py-2.5">
                <User className="h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer py-2.5">
                <Settings className="h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer py-2.5">
                <HelpCircle className="h-4 w-4" />
                <span>Help Center</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer py-2.5">
                <Award className="h-4 w-4" />
                <span>What's New</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuItem onClick={handleLogoutClick} className="gap-2 cursor-pointer py-2.5 text-red-500 focus:text-red-500">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Bar — now toggled by the search icon instead of
          always rendering, matching VendorHeader's expandable pattern. */}
      {isMobileSearchOpen && (
        <div className="border-t border-white/10 px-4 py-3 md:hidden bg-white/5 backdrop-blur-sm">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
            <Input
              placeholder="Search..."
              className="w-full pl-9 bg-white/10 border-white/20 text-white placeholder:text-blue-300/60 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </form>
        </div>
      )}

      {/* ── Logout Modal ── */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
        adminName={session?.user?.name || 'Admin User'}
      />
    </header>
  )
}