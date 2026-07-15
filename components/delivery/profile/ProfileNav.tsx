// components/delivery/profile/ProfileNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  User, Truck, Calendar, FileText, CreditCard, BarChart3, Shield,
} from 'lucide-react';

const NAV = [
  { href: '/delivery/profile', label: 'Overview', icon: User, exact: true },
  { href: '/delivery/profile/vehicle', label: 'Vehicle & Zone', icon: Truck },
  { href: '/delivery/profile/schedule', label: 'Schedule', icon: Calendar },
  { href: '/delivery/profile/documents', label: 'Documents', icon: FileText },
  { href: '/delivery/profile/bank', label: 'Bank & Payouts', icon: CreditCard },
  { href: '/delivery/profile/performance', label: 'Performance', icon: BarChart3 },
  { href: '/delivery/profile/security', label: 'Security', icon: Shield },
];

export function ProfileNav() {
  const pathname = usePathname();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Keep the active tab in view on mobile (horizontal scroll)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [pathname]);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <div
        ref={scrollerRef}
        className="flex items-center gap-1 overflow-x-auto pb-px [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              ref={active ? activeRef : undefined}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex shrink-0 items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
              {active && (
                <motion.span
                  layoutId="profile-tab-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
