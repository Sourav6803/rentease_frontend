// components/delivery/BottomNavigation.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Calendar, Navigation, History, User } from 'lucide-react'

const navItems = [
  { name: 'Home', href: '/delivery', icon: Home },
  { name: 'Today', href: '/delivery/today', icon: Calendar },
  { name: 'Active', href: '/delivery/active', icon: Navigation },
  { name: 'History', href: '/delivery/history', icon: History },
  { name: 'Profile', href: '/delivery/profile', icon: User },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-40">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all ${
                isActive ? 'text-primary' : 'text-slate-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}