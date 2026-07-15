'use client'

import { motion } from 'framer-motion'
import { ReactNode, ComponentType } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronRight,
  UserCircle,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  AlertCircle,
} from 'lucide-react'

interface SettingsCardProps {
  title: string
  description?: string
  children: ReactNode
  icon?: ComponentType<{ className?: string }>
  badge?: string
  className?: string
}

export function SettingsCard({ title, description, children, icon: Icon, badge, className = '' }: SettingsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
              </div>
            </div>
            {badge && (
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-0">
                {badge}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
      </Card>
    </motion.div>
  )
}

interface PremiumSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  description?: string
}

export function PremiumSwitch({ checked, onCheckedChange, label, description }: PremiumSwitchProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/50 transition-colors">
      <div className="space-y-0.5">
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
      />
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="lg:w-64 space-y-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
          <div className="flex-1 space-y-6">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

const sidebarItems = [
  { id: 'account', label: 'Account', icon: UserCircle, href: '/settings/account' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/settings/notifications' },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield, href: '/settings/privacy' },
  { id: 'payments', label: 'Payments', icon: CreditCard, href: '/settings/payments' },
  { id: 'appearance', label: 'Appearance', icon: Palette, href: '/settings/appearance' },
  { id: 'language', label: 'Language', icon: Globe, href: '/settings/language' },
  { id: 'danger', label: 'Danger Zone', icon: AlertCircle, href: '/settings/danger' },
]

export function SettingsSidebar() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1 sticky top-24">
      <div className="mb-4 px-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Menu</p>
      </div>
      {sidebarItems.map((tab) => {
        const Icon = tab.icon
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              isActive
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                : 'hover:bg-gray-100/80 text-gray-700 dark:text-gray-300'
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
            {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
            {tab.id === 'danger' && !isActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
