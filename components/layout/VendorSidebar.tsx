
'use client'

import { useState, useEffect, memo, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BarChart3, TrendingUp, LineChart,
  Package, PackageOpen, Warehouse, Tags, PlusCircle,
  ShoppingBag, Truck, ClipboardList, Clock,
  Wallet, DollarSign, CreditCard, FileText, Receipt,
  Users, Star,
  Settings, HelpCircle, Bell, Shield, LogOut,
  ChevronDown,
  Menu, X, Store,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/useToast'
import { useSidebarStore } from '@/store/SidebarStore'
import { useVendorRealtimeStats } from '@/hooks/useVendorRealtimeStats'
import { LogoutModal } from '../vendor/LogoutModal'
import Image from 'next/image'

function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
  return `₹${value}`
}

function getQuickStatValue(
  key: string,
  vendorData: VendorSidebarProfile | null,
  activeOrders: number,
  pendingOrders: number,
  isLoading: boolean
): { value: string | number; change: string | null } {
  if (isLoading) {
    return { value: '—', change: null }
  }
  switch (key) {
    case 'totalSales':
      return { value: formatCurrency(vendorData?.stats?.totalRevenue || 0), change: null }
    case 'activeOrders':
      return { value: activeOrders, change: null }
    case 'products':
      return {
        value: vendorData?.stats?.totalProducts ?? vendorData?.products?.total ?? 0,
        change: null,
      }
    case 'rating': {
      const avg = vendorData?.stats?.averageRating ?? 0
      return { value: avg.toFixed(1), change: null }
    }
    default:
      return { value: '—', change: null }
  }
}

type NavigationItem = {
  name: string
  href?: string
  icon: LucideIcon
  description: string
  badge?: string | null
  badgeKey?: 'activeOrders' | 'pendingOrders'
  exact?: boolean
  highlight?: boolean
  children?: NavigationItem[]
}

type VendorSidebarProfile = {
  stats?: {
    totalRevenue?: number
    totalProducts?: number
    averageRating?: number
  }
  products?: { total?: number }
  business?: { logo?: { url?: string } }
}
function injectBadges(items: NavigationItem[], stats: { activeOrders: number; pendingOrders: number }) {
  return items.map((item) => {
    if (item.children) {
      const children = item.children.map((child) => {
        if (child.badgeKey) {
          const value = child.badgeKey === 'activeOrders' ? stats.activeOrders : stats.pendingOrders
          return { ...child, badge: value > 0 ? String(value) : null }
        }
        return child
      })
      return { ...item, children }
    }
    if (item.badgeKey) {
      const value = item.badgeKey === 'activeOrders' ? stats.activeOrders : stats.pendingOrders
      return { ...item, badge: value > 0 ? String(value) : null }
    }
    return item
  })
}

// ─── Navigation config ────────────────────────────────────────────────────────

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/vendor/dashboard',
    icon: LayoutDashboard,
    badge: null,
    exact: true,
    description: 'Overview & key metrics',
  },
  {
    name: 'Analytics',
    icon: TrendingUp,
    description: 'Performance insights',
    children: [
      { name: 'Overview', href: '/vendor/analytics', icon: BarChart3, description: 'Performance metrics' },
      { name: 'Sales Report', href: '/vendor/analytics/sales', icon: LineChart, description: 'Revenue & orders' },
      { name: 'Product Performance', href: '/vendor/analytics/products', icon: Package, description: 'Top selling items' },
      { name: 'Customer Insights', href: '/vendor/analytics/customers', icon: Users, description: 'Customer behavior' },
    ],
  },
  {
    name: 'Products',
    icon: Package,
    description: 'Manage inventory',
    children: [
      { name: 'All Products', href: '/vendor/products/all-products', icon: PackageOpen, description: 'Manage inventory' },
      { name: 'Add New Product', href: '/vendor/products/add-product', icon: PlusCircle, description: 'Create new listing', highlight: true },
      { name: 'Categories', href: '/vendor/categories', icon: Tags, description: 'Manage categories' },
      { name: 'Inventory', href: '/vendor/products/inventory', icon: Warehouse, description: 'Stock management' },
    ],
  },
  {
    name: 'Orders',
    icon: ShoppingBag,
    description: 'Track all rentals',
    children: [
      { name: 'All Orders', href: '/vendor/orders', icon: ClipboardList, description: 'View all orders' },
      { name: 'Active Rentals', href: '/vendor/orders/active', icon: Clock, badgeKey: 'activeOrders', description: 'Currently rented' },
      { name: 'Pending', href: '/vendor/orders/pending', icon: Clock, badgeKey: 'pendingOrders', description: 'Awaiting confirmation' },
      { name: 'Completed', href: '/vendor/orders/completed', icon: CheckCircle, description: 'Finished rentals' },
    ],
  },
  { name: 'Delivery', href: '/vendor/delivery', icon: Truck, description: 'Manage deliveries' },
  {
    name: 'Payments & Payouts',
    icon: Wallet,
    description: 'Financial overview',
    children: [
      { name: 'Overview', href: '/vendor/payments', icon: DollarSign, description: 'Transaction summary' },
      { name: 'Payout History', href: '/vendor/payouts', icon: Receipt, description: 'Past payments' },
      { name: 'Bank Details', href: '/vendor/payments/bank-details', icon: CreditCard, description: 'Account information' },
      { name: 'Invoices', href: '/vendor/payments/invoices', icon: FileText, description: 'View invoices' },
    ],
  },
  { name: 'Reviews', href: '/vendor/reviews', icon: Star, description: 'Customer feedback' },
  { name: 'Customers', href: '/vendor/customers', icon: Users, description: 'Customer management' },
  {
    name: 'Settings',
    icon: Settings,
    description: 'Account & preferences',
    children: [
      { name: 'Profile', href: '/vendor/profile', icon: Store, description: 'Business information' },
      { name: 'Business Hours', href: '/vendor/settings/business-hours', icon: Clock, description: 'Working hours' },
      { name: 'Notifications', href: '/vendor/settings/notifications', icon: Bell, description: 'Alert preferences' },
      { name: 'Security', href: '/vendor/settings/security', icon: Shield, description: 'Account security' },
    ],
  },
  { name: 'Support', href: '/vendor/support', icon: HelpCircle, description: 'Get help' },
]

const quickStats = [
  { label: 'Total Sales', key: 'totalSales', icon: DollarSign },
  { label: 'Active Orders', key: 'activeOrders', icon: ShoppingBag },
  { label: 'Products', key: 'products', icon: Package },
  { label: 'Rating', key: 'rating', icon: Star },
]

// ─── Collapsed icon button (with tooltip) ─────────────────────────────────────

const CollapsedNavIcon = ({
  item,
  isActive,
}: {
  item: NavigationItem
  isActive: boolean
}) => {
  const Icon = item.icon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.href ?? '#'}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg mx-auto transition-all duration-150',
            isActive
              ? 'bg-yellow-400 text-blue-900'
              : 'text-blue-200 hover:bg-blue-700 hover:text-white',
          )}
        >
          <Icon className="h-5 w-5" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-[#1e3a5f] text-white border-blue-700 text-xs">
        {item.name}
      </TooltipContent>
    </Tooltip>
  )
}

// ─── Single nav item (expanded sidebar) ──────────────────────────────────────

const SidebarItem = memo(({
  item,
  isActive,
  isExpanded,
  onToggle,
}: {
  item: (typeof navigationItems)[number]
  isActive: boolean
  isExpanded: boolean
  onToggle: () => void
}) => {
  const hasChildren = Boolean(item.children?.length)
  const Icon = item.icon
  const pathname = usePathname()

  if (hasChildren) {
    const children = item.children || []
    return (
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium',
              'transition-all duration-150 focus:outline-none',
              isActive
                ? 'bg-yellow-400/20 text-yellow-300'
                : 'text-blue-100 hover:bg-blue-700/60 hover:text-white',
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-blue-300 transition-transform duration-200',
                isExpanded && 'rotate-180',
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-0.5 ml-3 border-l border-blue-600/50 pl-3 space-y-0.5 py-1">
            {children.map((child) => {
              if (!child.href) return null
              const childActive = pathname === child.href
              const ChildIcon = child.icon
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150',
                    childActive
                      ? 'bg-yellow-400 text-blue-900 font-semibold'
                      : child.highlight
                      ? 'text-yellow-300 hover:bg-yellow-400/10 hover:text-yellow-200'
                      : 'text-blue-200 hover:bg-blue-700/50 hover:text-white',
                  )}
                >
                  <ChildIcon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{child.name}</span>
                  {child.badge && (
                    <Badge className="bg-[#FB641B] hover:bg-[#FB641B] text-white text-[10px] px-1.5 py-0 h-4 ml-auto">
                      {child.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Link
      href={item.href || '#'}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-yellow-400 text-blue-900'
          : 'text-blue-100 hover:bg-blue-700/60 hover:text-white',
      )}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" />
      <span className="flex-1 truncate">{item.name}</span>
      {item.badge && (
        <Badge className="bg-[#FB641B] hover:bg-[#FB641B] text-white text-[10px] px-1.5 py-0 h-4">
          {item.badge}
        </Badge>
      )}
    </Link>
  )
})
SidebarItem.displayName = 'SidebarItem'

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export function VendorSidebar() {
  // FIX: isMobileOpen now lives in the shared Zustand store instead of local
  // state, so VendorHeader's hamburger button can open this same drawer.
  const { isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen } = useSidebarStore()

  const [expandedItems, setExpandedItems] = useState<string[]>([
    'Analytics', 'Products', 'Orders', 'Payments & Payouts', 'Settings',
  ])
  const { profile: vendorData, isLoading, activeOrders, pendingOrders } =
    useVendorRealtimeStats()

  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const toast = useToast()

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname, setMobileOpen])

  const toggleExpanded = (name: string) =>
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    )

  const isRouteActive = (item: NavigationItem) => {
    if (item.href) {
      return item.exact
        ? pathname === item.href
        : pathname.startsWith(item.href)
    }
    if (item.children) {
      return item.children.some((child) => child.href && pathname.startsWith(child.href))
    }
    return false
  }

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ redirect: false })
      toast.success('Logged out successfully')
      setIsLogoutModalOpen(false)
      // router.push('/')
       window.location.href = '/' // More aggressive than router.push
      router.refresh()
    } catch {
      toast.error('Failed to logout')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // FIX: previously sliced the first 2 raw characters of the business name
  // (e.g. "Royal Furnishings" -> "RO"). Now takes the first letter of up to
  // two words, like a normal initials avatar (e.g. "Royal Furnishings" -> "RF").
  const getInitials = () => {
    const name = vendorData?.business?.name || session?.user?.name
    if (!name) return 'V'
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
  }

  const resolvedNavItems = useMemo(
    () => injectBadges(navigationItems, { activeOrders, pendingOrders }),
    [activeOrders, pendingOrders]
  )

  // ── Inner sidebar content (shared between desktop + mobile drawer) ──────────
  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-blue-700/60 px-3">
        {!collapsed ? (
          <Link href="/vendor/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-400">
              {/* <Store className="h-4 w-4 text-blue-900" /> */}
              <div className="w-8 h-8 rounded bg-yellow-400 flex items-center justify-center shadow-sm">
                                <Image src={'/icon.svg'} alt="Logo" height={40} width={40} />
                              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-white leading-none tracking-tight truncate">
                RentEase
              </p>
              <p className="text-[10px] text-yellow-300 italic leading-none mt-0.5">
                Vendor Portal
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 mx-auto">
            <Store className="h-4 w-4 text-blue-900" />
          </div>
        )}

        {/* Toggle (desktop only) */}
        {!isMobileOpen && (
          <button
            onClick={toggleCollapse}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg
                       hover:bg-blue-700 transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4 text-blue-200" />
          </button>
        )}

        {/* Close button (mobile drawer only) */}
        {isMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="flex md:hidden h-7 w-7 items-center justify-center rounded-lg
                       hover:bg-blue-700 transition-colors shrink-0"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4 text-blue-200" />
          </button>
        )}
      </div>

      {/* ── Vendor Profile ── */}
      <div className={cn(
        'shrink-0 border-b border-blue-700/60 p-3',
        collapsed ? 'flex justify-center' : '',
      )}>
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 border-2 border-yellow-400/60">
              <AvatarImage src={vendorData?.business?.logo?.url || ''} />
              <AvatarFallback className="bg-blue-700 text-yellow-300 font-bold text-sm">
                {isLoading ? '…' : getInitials()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-[#1a3a6b]" />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <Skeleton className="h-3.5 w-24 bg-blue-700 mb-1" />
              ) : (
                <p className="truncate text-sm font-semibold text-white leading-tight">
                  {vendorData?.business?.name || session?.user?.name || 'Vendor'}
                </p>
              )}
              <p className="truncate text-[11px] text-blue-300 leading-tight">
                {vendorData?.vendorId || session?.user?.email || '—'}
              </p>
              {vendorData?.verification?.status === 'verified' && (
                <Badge className="mt-1 bg-green-500/20 text-green-400 border border-green-500/30
                                  text-[9px] px-1.5 py-0 h-4">
                  ✓ Verified
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Stats (expanded only) ── */}
      {/* {!collapsed && (
        <div className="shrink-0 grid grid-cols-2 gap-1.5 p-3 border-b border-blue-700/60">
          {quickStats.map((stat) => {
            const { value, change } = getQuickStatValue(
              stat.key,
              vendorData,
              activeOrders,
              pendingOrders,
              isLoading
            )
            return (
            <div
              key={stat.label}
              className="rounded-lg bg-blue-800/50 hover:bg-blue-700/60 transition-colors p-2"
            >
              <div className="flex items-center justify-between mb-0.5">
                <stat.icon className="h-3 w-3 text-blue-300" />
                {change !== null && (
                  <span className="text-[9px] font-bold text-green-400">
                    {change}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-white leading-tight">{value}</p>
              <p className="text-[10px] text-blue-300 mt-0.5 leading-none">{stat.label}</p>
            </div>
          )
          })}
        </div>
      )} */}

      {/* ── Navigation (scrollable) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-2 px-2
                      scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-700/60">
        {collapsed ? (
          /* Collapsed: icon-only with tooltips */
          <nav className="space-y-1">
            {resolvedNavItems.map((item) => (
              <CollapsedNavIcon
                key={item.name}
                item={item}
                isActive={isRouteActive(item)}
              />
            ))}
          </nav>
        ) : (
          /* Expanded: full labels + collapsible groups */
          <nav className="space-y-0.5">
            {resolvedNavItems.map((item) => (
              <SidebarItem
                key={item.name}
                item={item}
                isActive={isRouteActive(item)}
                isExpanded={expandedItems.includes(item.name)}
                onToggle={() => toggleExpanded(item.name)}
              />
            ))}
          </nav>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-blue-700/60 p-2 space-y-1">
        {/* Subscription pill */}
        {!collapsed && vendorData?.subscription && (
          <div className="rounded-lg bg-blue-800/50 p-2.5 mb-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-blue-300 font-medium">Plan</span>
              <Badge className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/30
                                text-[9px] px-1.5 py-0 h-4">
                {(vendorData.subscription.plan || 'basic').toUpperCase()}
              </Badge>
            </div>
            <div className="w-full bg-blue-900 rounded-full h-1 mb-1">
              <div className="bg-yellow-400 h-1 rounded-full" style={{ width: '65%' }} />
            </div>
            <p className="text-[10px] text-blue-400">
              {(vendorData.subscription.limits?.maxProducts || 0) - (vendorData.products?.total || 0)} products remaining
            </p>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogoutClick}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
            'text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors',
            collapsed && 'justify-center px-0',
          )}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Support */}
        {/* {!collapsed && (
          <Link
            href="/vendor/support"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs
                       text-blue-400 hover:text-blue-200 hover:bg-blue-700/40 transition-colors"
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>Need help? Contact Support</span>
          </Link>
        )} */}
      </div>
    </div>
  )

  const shouldHideSidebar =
    pathname?.startsWith('/how-it-works') ||
    pathname?.startsWith('/support') ||
    pathname?.startsWith('/pricing') ||
    pathname?.startsWith('/terms') ||
    pathname?.startsWith('/privacy') ||
    pathname?.startsWith('/contact') ||
    pathname?.startsWith('/about') ||
    pathname?.startsWith('/success-stories');

  if (shouldHideSidebar) {
    return null;
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider delayDuration={0}>

      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen',
          'bg-[#1a3a6b]', // Flipkart-toned navy blue
          'border-r border-blue-700/50',
          'transition-[width] duration-300 ease-in-out',
          'hidden md:block', // hidden on mobile
          isCollapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* ── Mobile overlay ────────────────────────────────────────────── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      {/* FIX: now driven by the shared store's isMobileOpen, which
          VendorHeader's hamburger button also controls. This drawer shows
          the SAME full nested navigation as desktop (not a stripped-down
          flat list), so mobile and desktop nav no longer disagree. */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-72',
          'bg-[#1a3a6b] border-r border-blue-700/50',
          'transition-transform duration-300 ease-in-out',
          'md:hidden', // only on mobile
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent collapsed={false} />
      </aside>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
        vendorName={vendorData?.business?.name || session?.user?.name}
      />

    </TooltipProvider>
  )
}