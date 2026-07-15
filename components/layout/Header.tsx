
'use client'

import { useState, useEffect, memo, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import axios from 'axios'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  Menu, X, Search, ShoppingCart, User, LogOut,
  Settings, Package, Heart, Sun, Moon, Laptop,
  Sparkles, Zap, Gift, Truck, Clock, ChevronDown,
  Shield, RotateCcw, BadgeCheck, LayoutDashboard,
  Store, ShieldCheck, TrendingUp, History, Loader2, ArrowUpLeft,
  CreditCard, Globe, AlertCircle, Bell, Palette
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'

// ─── Nav config ───────────────────────────────────────────────────────────────
const navItems = [
  { name: 'Home',         href: '/' },
  { name: 'Products',     href: '/products' },
  { name: 'Categories',   href: '/categories' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Support',      href: '/support' },
]

const getUserNavItems = (role?: string) => {
  const base = [
    { name: 'Dashboard',  href: '/dashboard',        icon: LayoutDashboard },
    { name: 'Profile',    href: '/profile',           icon: User },
    { name: 'My Rentals', href: '/rentals',           icon: Package },
    { name: 'Wishlist',   href: '/wishlist',          icon: Heart },
    { name: 'Settings',   href: '/settings/account',  icon: Settings },
  ]
  if (role === 'vendor') {
    base.splice(1, 0, { name: 'Vendor Dashboard', href: '/vendor/dashboard', icon: Store })
  }
  if (role === 'admin' || role === 'super-admin') {
    base.splice(1, 0, { name: 'Admin Dashboard', href: '/admin/dashboard', icon: ShieldCheck })
  }
  return base
}

// Role-based dashboard button config
const getDashboardButton = (role?: string) => {
  switch (role) {
    case 'vendor':
      return {
        href: '/vendor/dashboard',
        label: 'Vendor Dashboard',
        icon: Store,
        color: 'bg-emerald-600 hover:bg-emerald-700',
      }
    case 'admin':
    case 'super-admin':
      return {
        href: '/admin/dashboard',
        label: 'Admin Dashboard',
        icon: ShieldCheck,
        color: 'bg-purple-600 hover:bg-purple-700',
      }
    default:
      return {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        color: 'bg-blue-600 hover:bg-blue-700',
      }
  }
}

const promotions = [
  { icon: Zap,   text: '🎉 Limited Time: Get 20% off on your first rental!',  label: 'HOT DEAL' },
  { icon: Gift,  text: '🚚 Free Delivery on orders above ₹5,000',              label: 'FREE SHIP' },
  { icon: Truck, text: '⚡ Same-day delivery available in select cities',       label: 'FAST' },
  { icon: Clock, text: '📅 Flexible rental plans — 3 to 12 months',            label: 'FLEXIBLE' },
]

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
const RECENT_KEY = 'rentease_recent_searches'
const TRENDING = ['Sofa', 'Refrigerator', 'Washing Machine', 'Study Table', 'Air Conditioner', 'Bed']
const CURRENCY = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`

interface Suggestion {
  _id: string
  basicInfo: { name: string; slug: string; brand?: string }
  pricing?: { monthlyRent?: number }
  media?: { images?: Array<{ url: string; isPrimary?: boolean }> }
}

// ─── Search box with live autocomplete (Flipkart-style) ───────────────────────
const SearchBox = memo(function SearchBox({
  variant = 'desktop',
  autoFocus = false,
  onNavigate,
}: {
  variant?: 'desktop' | 'mobile'
  autoFocus?: boolean
  onNavigate?: () => void
}) {
  const router = useRouter()

  const [query, setQuery]           = useState('')
  const [open, setOpen]             = useState(false)
  const [focused, setFocused]       = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading]       = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [recent, setRecent]         = useState<string[]>([])

  const boxRef      = useRef<HTMLDivElement>(null)
  const abortRef    = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load recent searches once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      if (raw) setRecent(JSON.parse(raw).slice(0, 6))
    } catch { /* ignore */ }
  }, [])

  const saveRecent = useCallback((term: string) => {
    const t = term.trim()
    if (!t) return
    setRecent(prev => {
      const next = [t, ...prev.filter(x => x.toLowerCase() !== t.toLowerCase())].slice(0, 6)
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  const clearRecent = useCallback(() => {
    setRecent([])
    try { localStorage.removeItem(RECENT_KEY) } catch { /* ignore */ }
  }, [])

  // Debounced suggestion fetch against the real search API.
  useEffect(() => {
    const q = query.trim()
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (q.length < 2) {
      setSuggestions([])
      setLoading(false)
      if (abortRef.current) abortRef.current.abort()
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/products/search`, {
          params: { q, limit: 6, page: 1, inStock: true },
          signal: controller.signal,
        })
        if (res.data?.success) {
          setSuggestions(res.data.data.products || [])
          setActiveIndex(-1)
        }
      } catch (err) {
        if (!axios.isCancel(err)) setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 280)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  // Close on outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const goToSearch = useCallback((term: string) => {
    const t = term.trim()
    if (!t) return
    saveRecent(t)
    setOpen(false)
    setFocused(false)
    setActiveIndex(-1)
    onNavigate?.()
    router.push(`/search?q=${encodeURIComponent(t)}`)
  }, [router, saveRecent, onNavigate])

  const goToProduct = useCallback((s: Suggestion) => {
    saveRecent(s.basicInfo.name)
    setOpen(false)
    setFocused(false)
    onNavigate?.()
    router.push(`/products/${s.basicInfo.slug}`)
  }, [router, saveRecent, onNavigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeIndex >= 0 && suggestions[activeIndex]) goToProduct(suggestions[activeIndex])
    else goToSearch(query)
  }

  // Keyboard navigation over the suggestion list.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)) }
    else if (e.key === 'Escape') { setOpen(false); setFocused(false) }
  }

  const showPanel = open && focused
  const showSuggestions = query.trim().length >= 2

  const isMobile = variant === 'mobile'

  return (
    <div ref={boxRef} className={cn('relative', isMobile ? 'flex-1' : 'hidden md:flex flex-1 max-w-xl')}>
      <form onSubmit={handleSubmit} className="flex w-full">
        <div className="relative flex-1">
          {isMobile && (
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          )}
          <input
            type="search"
            autoFocus={autoFocus}
            placeholder="Search for products, brands and more…"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => { setFocused(true); setOpen(true) }}
            onKeyDown={onKeyDown}
            className={cn(
              'w-full text-sm text-gray-800 bg-white outline-none border-2 transition-colors duration-200',
              isMobile
                ? 'h-10 pl-9 pr-3 rounded-sm border-[#2874F0]'
                : cn('h-10 px-4 rounded-l-sm', focused ? 'border-yellow-400' : 'border-transparent'),
            )}
          />
          {loading && (
            <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2874F0] animate-spin" />
          )}
        </div>
        {!isMobile && (
          <button
            type="submit"
            className="h-10 px-4 bg-yellow-400 hover:bg-yellow-300 rounded-r-sm flex items-center justify-center shrink-0 transition-colors"
            aria-label="Search"
          >
            <Search size={18} className="text-[#0D47A1]" strokeWidth={2.5} />
          </button>
        )}
      </form>

      {/* ── Suggestion dropdown ── */}
      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden max-h-[70vh] overflow-y-auto">
          {/* Live product suggestions */}
          {showSuggestions ? (
            <>
              {suggestions.length > 0 ? (
                <ul className="py-1">
                  {suggestions.map((s, i) => {
                    const img = s.media?.images?.find(x => x.isPrimary)?.url || s.media?.images?.[0]?.url
                    return (
                      <li key={s._id}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => goToProduct(s)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                            activeIndex === i ? 'bg-blue-50' : 'hover:bg-slate-50',
                          )}
                        >
                          <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {img
                              ? <img src={img} alt={s.basicInfo.name} className="w-full h-full object-cover" />
                              : <Package size={16} className="text-slate-300" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{s.basicInfo.name}</p>
                            {s.basicInfo.brand && <p className="text-[11px] text-slate-400 truncate">in {s.basicInfo.brand}</p>}
                          </div>
                          {s.pricing?.monthlyRent != null && (
                            <span className="text-xs font-bold text-blue-700 shrink-0">{CURRENCY(s.pricing.monthlyRent)}/mo</span>
                          )}
                          <ArrowUpLeft size={13} className="text-slate-300 shrink-0" />
                        </button>
                      </li>
                    )
                  })}
                  <li className="border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => goToSearch(query)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-[#2874F0] hover:bg-blue-50 transition-colors"
                    >
                      <Search size={14} />
                      See all results for “{query.trim()}”
                    </button>
                  </li>
                </ul>
              ) : !loading ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-slate-500">No matches for “{query.trim()}”.</p>
                  <button
                    type="button"
                    onClick={() => goToSearch(query)}
                    className="mt-1.5 text-xs font-semibold text-[#2874F0] hover:underline"
                  >
                    Search anyway
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            /* Empty query → recent + trending */
            <div className="py-2">
              {recent.length > 0 && (
                <div className="px-3 pb-2">
                  <div className="flex items-center justify-between px-1 py-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <History size={12} /> Recent
                    </span>
                    <button onClick={clearRecent} className="text-[11px] font-semibold text-rose-500 hover:text-rose-600">Clear</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {recent.map(term => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => goToSearch(term)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-600 transition-colors"
                      >
                        <Clock size={11} className="text-slate-400" /> {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="px-3 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1 py-1.5">
                  <TrendingUp size={12} /> Trending
                </span>
                <div className="flex flex-wrap gap-1.5 px-1 pb-1">
                  {TRENDING.map(term => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => goToSearch(term)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-xs font-medium text-blue-700 transition-colors"
                    >
                      <TrendingUp size={11} /> {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

// ─── Promotional Banner ────────────────────────────────────────────────────────
const PromotionalBanner = memo(() => {
  const [idx,     setIdx]     = useState(0)
  const [visible, setVisible] = useState(true)
  const [show,    setShow]    = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setShow(false)
      setTimeout(() => { setIdx(p => (p + 1) % promotions.length); setShow(true) }, 350)
    }, 4500)
    return () => clearInterval(id)
  }, [])

  if (!visible) return null

  const promo = promotions[idx]

  return (
    <div className="w-full bg-[#0D47A1] border-b-2 border-yellow-400 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 10px)' }}
      />
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between gap-3 relative z-10">
        <div className={cn(
          'flex-1 flex items-center justify-center gap-2 min-w-0 transition-all duration-300',
          show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
        )}>
          <span className="text-white text-xs sm:text-sm font-medium text-center leading-snug truncate sm:whitespace-normal">
            {promo.text}
          </span>
          <Badge className="bg-yellow-400 text-blue-900 text-[10px] font-black shrink-0 hover:bg-yellow-400 border-0 px-2">
            {promo.label}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {promotions.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIdx(i); setShow(true) }}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 border-0',
                i === idx ? 'w-4 bg-yellow-400' : 'w-1.5 bg-white/40'
              )}
              aria-label={`Promo ${i + 1}`}
            />
          ))}
          <button
            onClick={() => setVisible(false)}
            className="ml-1 w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all"
            aria-label="Close"
          >
            <X size={10} />
          </button>
        </div>
      </div>
    </div>
  )
})
PromotionalBanner.displayName = 'PromotionalBanner'

// ─── Main Header ──────────────────────────────────────────────────────────────
export function Header() {
  const [scrolled,       setScrolled]       = useState(false)
  const [mobileSearch,   setMobileSearch]   = useState(false)
  const [mounted,        setMounted]        = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const pathname = usePathname()
  const router   = useRouter()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const toast = useToast()
  const { itemCount } = useCart()

  // Get user role
  const userRole = (session?.user as any)?.role
  const dashboardButton = getDashboardButton(userRole)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMounted(true) }, [])

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      toast.success('Logged out successfully')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to logout')
    }
  }

  const getInitials = (name?: string | null) =>
    name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'

  if (
    !mounted ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/vendor') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/delivery') ||
    pathname?.startsWith('/verify-email')||
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
      <PromotionalBanner />

      <header className={cn(
        'sticky top-0 z-50 w-full transition-shadow duration-300',
        scrolled ? 'shadow-xl' : 'shadow-md'
      )}>

        {/* ── TOP ROW ──────────────────────────────────────────────────────── */}
        <div className="bg-[#2874F0] w-full">
          <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-evenly gap-3">

            {/* Mobile hamburger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden shrink-0 text-white hover:bg-white/15 hover:text-white border border-white/20 h-9 w-9"
                  aria-label="Menu"
                >
                  <Menu size={20} />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-80 p-0 border-r border-border">
                {/* Drawer header */}
                <SheetHeader className="bg-[#2874F0] px-4 pt-5 pb-4">
                  <SheetTitle className="text-left">
                    <span className="text-2xl font-black text-white tracking-tight font-serif">
                      Rent<span className="text-yellow-400">Ease</span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 ml-0.5 align-super" />
                    </span>
                    {session && (
                      <p className="text-xs text-white/70 mt-1.5 font-normal">
                        Hello, {session.user?.name?.split(' ')[0] || 'User'} 👋
                      </p>
                    )}
                  </SheetTitle>
                </SheetHeader>

                {/* Dashboard Button in Mobile Menu */}
                {session && (
                  <div className="p-3 border-b">
                    <Button
                      className={cn(
                        "w-full text-white font-bold gap-2",
                        dashboardButton.color
                      )}
                      asChild
                    >
                      <Link href={dashboardButton.href} onClick={() => setMobileMenuOpen(false)}>
                        <dashboardButton.icon size={16} />
                        {dashboardButton.label}
                      </Link>
                    </Button>
                  </div>
                )}

                {session ? (
                  <div className="flex flex-col overflow-y-auto max-h-[calc(100vh-140px)]">
                    {/* User Profile Section */}
                    <div className="p-3">
                      <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Your Account
                      </p>
                      <nav className="flex flex-col gap-0.5">
                        {getUserNavItems(userRole).filter(item => item.name !== 'Settings').map(item => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                              pathname === item.href
                                ? 'bg-blue-50 text-[#2874F0] font-bold'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <item.icon size={18} className={cn(pathname === item.href ? 'text-[#2874F0]' : 'text-muted-foreground')} />
                            {item.name}
                          </Link>
                        ))}
                      </nav>
                    </div>

                    <Separator />

                    {/* Browse Section */}
                    <div className="p-3">
                      <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Browse
                      </p>
                      <nav className="flex flex-col gap-0.5">
                        {navItems.map(item => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                              pathname === item.href
                                ? 'bg-blue-50 text-[#2874F0] font-bold'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </nav>
                    </div>

                    <Separator />

                    {/* Settings Section */}
                    <div className="p-3">
                      <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Settings
                      </p>
                      <nav className="flex flex-col gap-0.5">
                        <Link
                          href="/settings/account"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                            pathname === '/settings/account'
                              ? 'bg-blue-50 text-[#2874F0] font-bold'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <User size={18} className={cn(pathname === '/settings/account' ? 'text-[#2874F0]' : 'text-muted-foreground')} />
                          Accounts
                        </Link>
                        <Link
                          href="/settings/notifications"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                            pathname === '/settings/notifications'
                              ? 'bg-blue-50 text-[#2874F0] font-bold'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <Bell size={18} className={cn(pathname === '/settings/notifications' ? 'text-[#2874F0]' : 'text-muted-foreground')} />
                          Notifications
                        </Link>
                        <Link
                          href="/settings/privacy"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                            pathname === '/settings/privacy'
                              ? 'bg-blue-50 text-[#2874F0] font-bold'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <Shield size={18} className={cn(pathname === '/settings/privacy' ? 'text-[#2874F0]' : 'text-muted-foreground')} />
                          Privacy & Security
                        </Link>
                        <Link
                          href="/settings/payments"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                            pathname === '/settings/payments'
                              ? 'bg-blue-50 text-[#2874F0] font-bold'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <CreditCard size={18} className={cn(pathname === '/settings/payments' ? 'text-[#2874F0]' : 'text-muted-foreground')} />
                          Payments
                        </Link>
                        <Link
                          href="/settings/appearance"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                            pathname === '/settings/appearance'
                              ? 'bg-blue-50 text-[#2874F0] font-bold'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <Palette size={18} className={cn(pathname === '/settings/appearance' ? 'text-[#2874F0]' : 'text-muted-foreground')} />
                          Appearance
                        </Link>
                        <Link
                          href="/settings/language"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                            pathname === '/settings/language'
                              ? 'bg-blue-50 text-[#2874F0] font-bold'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <Globe size={18} className={cn(pathname === '/settings/language' ? 'text-[#2874F0]' : 'text-muted-foreground')} />
                          Language
                        </Link>
                        <Link
                          href="/settings/danger"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                            pathname === '/settings/danger'
                              ? 'bg-blue-50 text-[#2874F0] font-bold'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <AlertCircle size={18} className={cn(pathname === '/settings/danger' ? 'text-[#2874F0]' : 'text-muted-foreground')} />
                          Danger Zone
                        </Link>
                      </nav>
                    </div>

                    {/* Logout */}
                    <div className="p-3 mt-auto border-t">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          handleLogout()
                        }}
                      >
                        <LogOut size={18} />
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Nav links */}
                    <nav className="flex flex-col gap-0.5 p-3">
                      {navItems.map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all border-l-[3px]',
                            pathname === item.href
                              ? 'bg-blue-50 text-[#2874F0] font-bold border-[#2874F0]'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>

                    <Separator />

                    {/* Auth buttons */}
                    <div className="flex flex-col gap-2 p-3">
                      <Button variant="outline" className="w-full border-[#2874F0] text-[#2874F0] hover:bg-blue-50" asChild>
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                      </Button>
                      <Button className="w-full bg-[#2874F0] hover:bg-[#1A5DC8] text-white font-bold" asChild>
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                          <Sparkles size={14} className="mr-1.5" /> Sign Up Free
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="shrink-0 flex flex-col items-start select-none">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none font-serif">
                Rent<span className="text-yellow-400">Ease</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 ml-0.5 align-super" />
              </span>
              <span className="text-[9px] font-semibold text-white/60 tracking-widest uppercase leading-none mt-0.5 hidden sm:block">
                Rent Everything
              </span>
            </Link>

            {/* Search bar — desktop (with live autocomplete) */}
            <SearchBox variant="desktop" />

            {/* Spacer on mobile */}
            <div className="flex-1 md:hidden" />

            {/* Right actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

              {/* Dashboard Button - Desktop */}
              {session && (
                <Button
                  className={cn(
                    "hidden md:flex items-center gap-2 text-white font-bold",
                    dashboardButton.color
                  )}
                  size="sm"
                  asChild
                >
                  <Link href={dashboardButton.href}>
                    <dashboardButton.icon size={16} />
                    {dashboardButton.label}
                  </Link>
                </Button>
              )}

              {/* Mobile search toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/15 hover:text-white border border-white/20 h-9 w-9"
                onClick={() => setMobileSearch(p => !p)}
                aria-label="Search"
              >
                <Search size={18} />
              </Button>

              {/* Theme toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/15 hover:text-white border border-white/20 h-9 w-9"
                    aria-label="Theme"
                  >
                    {theme === 'light' ? <Sun size={17} /> : theme === 'dark' ? <Moon size={17} /> : <Laptop size={17} />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" /> Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" /> Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Laptop className="mr-2 h-4 w-4" /> System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:bg-white/15 hover:text-white border border-white/20 h-9 w-9"
                onClick={() => router.push('/cart')}
                aria-label="Cart"
              >
                <ShoppingCart size={18} />
                {itemCount  > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-[#2874F0] leading-none">
                    {itemCount}
                  </span>
                )}
              </Button>

              {/* User menu */}
              {status === 'loading' ? (
                <Skeleton className="h-9 w-9 rounded-full bg-white/20" />
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 transition-colors cursor-pointer outline-none">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                        <AvatarFallback className="bg-yellow-400 text-[#0D47A1] text-xs font-black">
                          {getInitials(session.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-white text-xs font-semibold max-w-[72px] truncate">
                        {session.user?.name?.split(' ')[0] || 'Account'}
                      </span>
                      <ChevronDown size={13} className="hidden sm:block text-white/70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-bold leading-none">{session.user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{session.user?.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {getUserNavItems(userRole).map(item => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  {/* Desktop auth buttons */}
                  <div className="hidden md:flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white text-white bg-transparent hover:bg-white hover:text-[#2874F0] font-bold h-9 px-4 transition-all"
                      asChild
                    >
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button
                      size="sm"
                      className="bg-yellow-400 hover:bg-yellow-300 text-[#0D47A1] font-black h-9 px-4 border-0"
                      asChild
                    >
                      <Link href="/register">
                        <Sparkles size={13} className="mr-1" /> Sign Up
                      </Link>
                    </Button>
                  </div>
                  {/* Mobile: icon only */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-white hover:bg-white/15 hover:text-white border border-white/20 h-9 w-9"
                    asChild
                  >
                    <Link href="/login" aria-label="Login"><User size={18} /></Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── BOTTOM NAV BAR — desktop only ────────────────────────────────── */}
        <div className="hidden lg:block bg-[#1A5DC8] border-t border-white/10">
          <div className="max-w-screen-xl mx-auto px-6 h-10 flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3.5 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap border-b-2',
                  pathname === item.href
                    ? 'text-yellow-400 bg-white/10 border-yellow-400'
                    : 'text-white/80 hover:text-white hover:bg-white/10 border-transparent'
                )}
              >
                {item.name}
              </Link>
            ))}

            {/* Trust badges */}
            <div className="ml-auto flex items-center gap-5">
              {[
                { icon: BadgeCheck, text: 'Verified Products' },
                { icon: Shield,     text: 'Secure Payments' },
                { icon: RotateCcw,  text: 'Easy Returns' },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1 text-[11px] font-medium text-white/60 whitespace-nowrap">
                  <Icon size={12} className="text-yellow-400 shrink-0" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── MOBILE SEARCH DRAWER (with live autocomplete) ─────────────────── */}
        {mobileSearch && (
          <div className="md:hidden bg-white border-t-2 border-yellow-400 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <SearchBox variant="mobile" autoFocus onNavigate={() => setMobileSearch(false)} />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-sm"
                onClick={() => setMobileSearch(false)}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        )}
      </header>
    </>
  )
}