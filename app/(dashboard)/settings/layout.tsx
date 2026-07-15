'use client'

import { usePathname } from 'next/navigation'
import { Settings, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SettingsSidebar } from './components'
import { AnimatePresence, motion } from 'framer-motion'

const pageTitles: Record<string, { title: string; description: string }> = {
  '/settings/account': {
    title: 'Account Information',
    description: 'Manage your personal details and profile',
  },
  '/settings/notifications': {
    title: 'Notifications',
    description: 'Control how you receive notifications',
  },
  '/settings/privacy': {
    title: 'Privacy & Security',
    description: 'Manage your privacy and security preferences',
  },
  '/settings/payments': {
    title: 'Payments',
    description: 'Manage your payment methods and billing',
  },
  '/settings/appearance': {
    title: 'Appearance',
    description: 'Customize how the app looks',
  },
  '/settings/language': {
    title: 'Language',
    description: 'Set your language and regional preferences',
  },
  '/settings/danger': {
    title: 'Danger Zone',
    description: 'Irreversible actions that affect your account',
  },
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pageInfo = pageTitles[pathname] || { title: 'Settings', description: 'Manage your account' }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header with gradient accent */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    {pageInfo.title}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {pageInfo.description}
                  </p>
                </div>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:w-64 shrink-0 hidden lg:block"
          >
            <SettingsSidebar />
          </motion.div>

          {/* Mobile sidebar trigger + content */}
          <div className="flex-1 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
