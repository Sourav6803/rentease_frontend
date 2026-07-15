'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  Menu, Search, Bell, User, LogOut, Settings, Package,
  TrendingUp, Store, ShoppingBag, BarChart3,
  Wallet, HelpCircle, Sun, Moon, Laptop,
  Sparkles, ChevronDown, DollarSign, Star, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { LogoutModal } from '@/components/vendor/LogoutModal'
import { useSidebarStore } from '@/store/SidebarStore'

// ─── Data ────────────────────────────────────────────────────────────────────
const vendorNavItems = [
  { name: 'Dashboard', href: '/vendor/dashboard', icon: BarChart3, badge: null },
  { name: 'Products', href: '/vendor/products/all-products', icon: Package, badge: null },
  { name: 'Orders', href: '/vendor/orders', icon: ShoppingBag, badge: '12' },
  { name: 'Analytics', href: '/vendor/analytics', icon: TrendingUp, badge: null },
  { name: 'Payouts', href: '/vendor/payouts', icon: Wallet, badge: null },
  { name: 'Support', href: '/vendor/support', icon: HelpCircle, badge: null },
]

const quickActions = [
  { label: 'Add Product', icon: Package, href: '/vendor/products/add-product' },
  { label: 'View Orders', icon: ShoppingBag, href: '/vendor/orders' },
  { label: 'Analytics', icon: BarChart3, href: '/vendor/analytics' },
  { label: 'Support', icon: HelpCircle, href: '/vendor/support' },
]

const stats = [
  { label: 'Total Sales', value: '₹1,24,500', change: '+12.5%', icon: DollarSign },
  { label: 'Active Orders', value: '24', change: '+3', icon: ShoppingBag },
  { label: 'Products', value: '156', change: '+8', icon: Package },
  { label: 'Rating', value: '4.8', change: '+0.2', icon: Star },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

const QuickActionsMenu = ({ onClose }: { onClose?: () => void }) => (
  <div className="grid grid-cols-2 gap-1.5 p-2">
    {quickActions.map((action) => (
      <Link
        key={action.label}
        href={action.href}
        onClick={onClose}
        className="flex flex-col items-center gap-1.5 rounded-lg p-3 text-center
                   bg-blue-50 hover:bg-yellow-400 hover:text-blue-900
                   transition-all duration-150 group"
      >
        <action.icon className="w-5 h-5 text-blue-600 group-hover:text-blue-900" />
        <p className="text-xs font-semibold text-blue-800 group-hover:text-blue-900">
          {action.label}
        </p>
      </Link>
    ))}
  </div>
)

// ─── Main Header ──────────────────────────────────────────────────────────────

export function VendorHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [notifications] = useState(3)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const toast = useToast()

  const { setMobileOpen } = useSidebarStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/vendor/search?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  useEffect(() => { setMounted(true) }, [])
  
  useEffect(() => {
    if (mounted) {
      const t = setTimeout(() => setCartCount(3), 100)
      return () => clearTimeout(t)
    }
  }, [mounted])

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ redirect: false })
      toast.success('Logged out successfully')
      setIsLogoutModalOpen(false)
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to logout')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getInitials = (name?: string | null) =>
    name
      ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
      : 'V'

  // Loading skeleton
  if (status === 'loading') {
    return (
      <header className="sticky top-0 z-50 w-full bg-[#2874F0]">
        <div className="max-w-screen-2xl mx-auto px-4 flex h-14 items-center justify-between">
          <Skeleton className="h-7 w-32 bg-blue-400" />
          <Skeleton className="h-8 w-8 rounded-full bg-blue-400" />
        </div>
      </header>
    )
  }

  // Role guard
  const userRole = (session?.user as any)?.role
  if (userRole && !['vendor', 'admin', 'super-admin'].includes(userRole)) {
    router.push('/dashboard')
    return null
  }

  if (
    !mounted ||
    pathname?.startsWith('/reset-password') ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/verify-otp') ||
    pathname?.startsWith('/how-it-works') || 
    pathname?.startsWith('/support') ||
    pathname?.startsWith('/pricing') ||
    pathname?.startsWith('/terms') ||
    pathname?.startsWith('/privacy') ||
    pathname?.startsWith('/contact') ||
    pathname?.startsWith('/about') ||
    pathname?.startsWith('/success-stories')
  ) return null

  return (
    <>
      <header className="sticky top-0 z-40 shadow-md">

        {/* ── TOP BAR (Flipkart blue) ───────────────────────────────────────── */}
        <div className="bg-[#2874F0]">
          <div className="max-w-screen-2xl mx-auto px-3 sm:px-5 lg:px-8">
            <div className="flex h-14 items-center gap-3">

              {/* Mobile hamburger */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-blue-700 h-8 w-8 shrink-0"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={20} />
              </Button>

              {/* Logo - fixed width to maintain layout */}
              <Link href="/vendor/dashboard" className="flex items-center gap-2 shrink-0 select-none">
                <div className="w-8 h-8 rounded bg-yellow-400 flex items-center justify-center shadow-sm">
                  <Image src={'/icon.svg'} alt="Logo" height={40} width={40} />
                </div>
                <div className="hidden sm:block">
                  <p className="text-white font-extrabold text-base leading-none tracking-tight">
                    RentEase
                  </p>
                  <p className="text-yellow-300 text-[10px] font-medium leading-none mt-0.5 italic">
                    Vendor Portal
                  </p>
                </div>
              </Link>

              {/* Search bar - properly centered with flex-1 and max-width */}
              <form
                onSubmit={handleSearch}
                className="hidden sm:flex flex-1 justify-center px-4"
              >
                <div className="flex w-full max-w-xl rounded overflow-hidden shadow-sm">
                  <input
                    type="search"
                    placeholder="Search products, orders, customers..."
                    className="flex-1 h-9 px-3 text-sm text-gray-800 bg-white placeholder:text-gray-400
                               focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="h-9 px-4 bg-yellow-400 hover:bg-yellow-300 transition-colors
                               flex items-center justify-center shrink-0"
                    aria-label="Search"
                  >
                    <Search size={16} className="text-blue-900" />
                  </button>
                </div>
              </form>

              {/* Right cluster - fixed width to maintain balance */}
              <div className="flex items-center gap-1 ml-auto shrink-0">

                {/* Mobile search toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden text-white hover:bg-blue-700 h-8 w-8"
                  onClick={() => setIsSearchOpen((v) => !v)}
                  aria-label="Search"
                >
                  {isSearchOpen ? <X size={18} /> : <Search size={18} />}
                </Button>

                {/* Quick Actions */}
                <div
                  className="relative hidden md:block"
                  onMouseEnter={() => setShowQuickActions(true)}
                  onMouseLeave={() => setShowQuickActions(false)}
                >
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded
                               bg-white/10 hover:bg-white/20 text-white
                               transition-colors text-xs font-medium"
                    onClick={() => setShowQuickActions((v) => !v)}
                  >
                    <Sparkles size={13} className="text-yellow-300" />
                    <span className="hidden lg:inline">Quick Actions</span>
                    <ChevronDown
                      size={12}
                      className={cn('transition-transform', showQuickActions && 'rotate-180')}
                    />
                  </button>

                  {showQuickActions && (
                    <div className="absolute right-0 top-full mt-1.5 w-56 rounded-lg bg-white
                                    border border-blue-100 shadow-xl overflow-hidden z-50
                                    animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-blue-50 bg-blue-50">
                        <p className="text-xs font-semibold text-blue-700">Quick Actions</p>
                      </div>
                      <QuickActionsMenu onClose={() => setShowQuickActions(false)} />
                    </div>
                  )}
                </div>

                {/* Stats */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded
                                       bg-white/10 hover:bg-white/20 text-white
                                       transition-colors text-xs font-medium hidden md:flex">
                      <TrendingUp size={13} className="text-yellow-300" />
                      <span className="hidden lg:inline">Stats</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 p-2 bg-white border border-blue-100 shadow-xl">
                    <DropdownMenuLabel className="text-xs text-gray-500 font-medium px-1">
                      Today's Overview
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {stats.map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors p-2.5"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <stat.icon size={12} className="text-blue-500" />
                            <span className="text-[10px] font-bold text-green-600">{stat.change}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-800">{stat.value}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme toggle */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded
                                 bg-white/10 hover:bg-white/20 text-white transition-colors"
                      aria-label="Toggle theme"
                    >
                      {theme === 'light' ? <Sun size={15} /> : theme === 'dark' ? <Moon size={15} /> : <Laptop size={15} />}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border border-blue-100 shadow-xl">
                    {[
                      { label: 'Light', value: 'light', icon: Sun },
                      { label: 'Dark', value: 'dark', icon: Moon },
                      { label: 'System', value: 'system', icon: Laptop },
                    ].map(({ label, value, icon: Icon }) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() => setTheme(value)}
                        className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications */}
                <button
                  className="relative flex items-center justify-center w-8 h-8 rounded
                             bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={15} />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5
                                     rounded-full bg-[#FB641B] text-white text-[9px] font-bold
                                     flex items-center justify-center border border-[#2874F0]">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded
                                       hover:bg-white/10 text-white transition-colors ml-0.5">
                      <Avatar className="h-7 w-7 border-2 border-yellow-400">
                        <AvatarImage src={session?.user?.image || ''} />
                        <AvatarFallback className="bg-yellow-400 text-blue-900 text-[11px] font-bold">
                          {getInitials(session?.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:block text-left leading-none">
                        <p className="text-xs font-semibold text-white truncate max-w-[80px]">
                          {session?.user?.name || 'Vendor'}
                        </p>
                        <p className="text-[9px] text-yellow-300">Premium Vendor</p>
                      </div>
                      <ChevronDown size={12} className="text-blue-200 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-white border border-blue-100 shadow-xl">
                    <DropdownMenuLabel>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {session?.user?.name || 'Vendor'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {[
                      { href: '/vendor/profile', icon: User, label: 'Profile' },
                      { href: '/vendor/settings', icon: Settings, label: 'Settings' },
                      { href: '/vendor/help', icon: HelpCircle, label: 'Help Center' },
                    ].map(({ href, icon: Icon, label }) => (
                      <DropdownMenuItem key={href} asChild className="cursor-pointer hover:bg-blue-50 hover:text-blue-700">
                        <Link href={href} className="flex items-center gap-2 text-gray-700">
                          <Icon className="h-4 w-4" />
                          {label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogoutClick}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Mobile search expandable */}
          {isSearchOpen && (
            <div className="sm:hidden px-3 pb-3">
              <form onSubmit={handleSearch} className="flex items-center rounded overflow-hidden shadow-sm">
                <input
                  type="search"
                  placeholder="Search products, orders..."
                  className="flex-1 h-9 px-3 text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="h-9 px-4 bg-yellow-400 hover:bg-yellow-300 transition-colors flex items-center shrink-0"
                >
                  <Search size={16} className="text-blue-900" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── NAV BAR (white, desktop) ──────────────────────────────────────── */}
        <nav className="hidden lg:block bg-white border-b border-blue-100 shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-8">
            <div className="flex items-center gap-1 h-10">
              {vendorNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-2 px-3 h-full text-sm font-medium transition-colors',
                      isActive
                        ? 'text-[#2874F0] border-b-2 border-[#2874F0]'
                        : 'text-gray-600 hover:text-[#2874F0]'
                    )}
                  >
                    <item.icon size={15} />
                    {item.name}
                    {item.badge && (
                      <Badge className="bg-[#FB641B] hover:bg-[#FB641B] text-white text-[10px] px-1.5 py-0 h-4 ml-0.5">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

      </header>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
        vendorName={session?.user?.name || undefined}
      />
    </>
  )
}