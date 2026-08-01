// 'use client'

// import { usePathname } from 'next/navigation'
// import { Settings, Sparkles } from 'lucide-react'
// import { Badge } from '@/components/ui/badge'
// import { SettingsSidebar } from './components'
// import { AnimatePresence, motion } from 'framer-motion'

// const pageTitles: Record<string, { title: string; description: string }> = {
//   '/settings/account': {
//     title: 'Account Information',
//     description: 'Manage your personal details and profile',
//   },
//   '/settings/notifications': {
//     title: 'Notifications',
//     description: 'Control how you receive notifications',
//   },
//   '/settings/privacy': {
//     title: 'Privacy & Security',
//     description: 'Manage your privacy and security preferences',
//   },
//   '/settings/payments': {
//     title: 'Payments',
//     description: 'Manage your payment methods and billing',
//   },
//   '/settings/appearance': {
//     title: 'Appearance',
//     description: 'Customize how the app looks',
//   },
//   '/settings/language': {
//     title: 'Language',
//     description: 'Set your language and regional preferences',
//   },
//   '/settings/danger': {
//     title: 'Danger Zone',
//     description: 'Irreversible actions that affect your account',
//   },
// }

// export default function SettingsLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname()
//   const pageInfo = pageTitles[pathname] || { title: 'Settings', description: 'Manage your account' }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
//       <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
//         {/* Header with gradient accent */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="relative"
//         >
//           <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-3xl" />
//           <div className="relative flex items-center justify-between">
//             <div>
//               <div className="flex items-center gap-3">
//                 <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
//                   <Settings className="h-6 w-6 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
//                     {pageInfo.title}
//                   </h1>
//                   <p className="text-gray-500 dark:text-gray-400 mt-1">
//                     {pageInfo.description}
//                   </p>
//                 </div>
//               </div>
//             </div>
//             <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-2">
//               <Sparkles className="h-3 w-3 mr-1" />
//               Premium
//             </Badge>
//           </div>
//         </motion.div>

//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Sidebar */}
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: 0.1 }}
//             className="lg:w-64 shrink-0 hidden lg:block"
//           >
//             <SettingsSidebar />
//           </motion.div>

//           {/* Mobile sidebar trigger + content */}
//           <div className="flex-1 space-y-6">
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={pathname}
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -20 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 {children}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Settings,
  Sparkles,
  Menu,
  ChevronRight,
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  AlertTriangle,
  MapPin,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SettingsSidebar } from './components'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Page metadata — single source of truth for header + mobile nav    */
/* ------------------------------------------------------------------ */

type PageMeta = {
  title: string
  description: string
  icon: React.ElementType
  danger?: boolean
}

const pageTitles: Record<string, PageMeta> = {
  '/settings/account': {
    title: 'Account Information',
    description: 'Manage your personal details and profile',
    icon: User,
  },
  '/settings/notifications': {
    title: 'Notifications',
    description: 'Control how you receive notifications',
    icon: Bell,
  },
  '/settings/privacy': {
    title: 'Privacy & Security',
    description: 'Manage your privacy and security preferences',
    icon: Shield,
  },
  '/settings/payments': {
    title: 'Payments',
    description: 'Manage your payment methods and billing',
    icon: CreditCard,
  },
  '/settings/address': {
    title: 'Addresses',
    description: 'Manage your addresses',
    icon: MapPin,
  },
  '/settings/appearance': {
    title: 'Appearance',
    description: 'Customize how the app looks',
    icon: Palette,
  },
  '/settings/language': {
    title: 'Language',
    description: 'Set your language and regional preferences',
    icon: Globe,
  },
  '/settings/danger': {
    title: 'Danger Zone',
    description: 'Irreversible actions that affect your account',
    icon: AlertTriangle,
    danger: true,
  },
}

const fallbackMeta: PageMeta = {
  title: 'Settings',
  description: 'Manage your account',
  icon: Settings,
}

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  const pageInfo = pageTitles[pathname] ?? fallbackMeta
  const PageIcon = pageInfo.icon

  // Close the mobile drawer whenever the route changes
  React.useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  const fade = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 16 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -16 },
      }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* ---------- Sticky mobile top bar ---------- */}
      <header className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl dark:border-gray-800/60 dark:bg-gray-950/80 lg:hidden">
        <div className="flex h-14 items-center gap-3 px-4">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              {/* <Button
                variant="ghost"
                size="icon"
                aria-label="Open settings navigation"
                className="shrink-0 -ml-1"
              >
                <Menu className="h-5 w-5" />
              </Button> */}
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b border-gray-100 px-4 py-4 dark:border-gray-800">
                <SheetTitle className="flex items-center gap-2 text-base">
                  <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-1.5">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  Settings
                </SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto p-3">
                <SettingsSidebar />
              </div>
            </SheetContent>
          </Sheet>

          {/* Breadcrumb-style current page */}
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-1.5 text-sm"
          >
            <Link
              href="/settings"
              className="shrink-0 text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Settings
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate font-medium text-gray-900 dark:text-white">
              {pageInfo.title}
            </span>
          </nav>

          <Badge className="ml-auto shrink-0 border-0 bg-gradient-to-r from-blue-500 to-purple-500 px-2.5 py-1 text-white">
            <Sparkles className="mr-1 h-3 w-3" />
            <span className="hidden xs:inline">Premium</span>
            <span className="xs:hidden">Pro</span>
          </Badge>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ---------- Page header ---------- */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative mb-6 sm:mb-8 lg:mb-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-3xl"
          />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div
                className={cn(
                  'shrink-0 rounded-xl p-2.5 shadow-lg sm:rounded-2xl sm:p-3',
                  pageInfo.danger
                    ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/30',
                )}
              >
                <PageIcon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:to-gray-400 sm:text-2xl lg:text-3xl">
                  {pageInfo.title}
                </h1>
                <p className="mt-0.5 line-clamp-2 text-sm text-gray-500 dark:text-gray-400 sm:mt-1 sm:text-base">
                  {pageInfo.description}
                </p>
              </div>
            </div>

            {/* Premium badge — hidden on mobile (it lives in the top bar) */}
            <Badge className="hidden shrink-0 border-0 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-white shadow-md shadow-purple-500/20 lg:inline-flex">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Premium
            </Badge>
          </div>
        </motion.div>

        {/* ---------- Sidebar + content ---------- */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Desktop sidebar — sticky so it stays in view on long pages */}
          <motion.aside
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="hidden w-64 shrink-0 lg:block"
          >
            <div className="sticky top-8 max-h-[calc(100dvh-4rem)] overflow-y-auto pb-4">
              <SettingsSidebar />
            </div>
          </motion.aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                {...fade}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-6"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
