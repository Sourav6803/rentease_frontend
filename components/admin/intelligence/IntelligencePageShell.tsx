'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItemDef {
  label: string
  href?: string
}

interface IntelligencePageShellProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItemDef[]
  actions?: React.ReactNode
  children: React.ReactNode
  demoMode?: boolean
  demoMessage?: string
  className?: string
}

export function IntelligencePageShell({
  title,
  subtitle,
  breadcrumbs = [
    { label: 'Admin', href: '/admin/dashboard' },
    { label: 'Intelligence', href: '/admin/intelligence' },
  ],
  actions,
  children,
  demoMode = false,
  demoMessage = 'Live API unreachable — showing fallback demo data.',
  className,
}: IntelligencePageShellProps) {
  return (
    <div className={cn('min-h-full bg-slate-50', className)}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {breadcrumbs.length > 0 && (
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              {breadcrumbs.map((item, i) => (
                <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1.5">
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {item.href && i < breadcrumbs.length - 1 ? (
                      <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </motion.div>

        {demoMode && (
          <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm">{demoMessage}</AlertDescription>
          </Alert>
        )}

        {children}
      </div>
    </div>
  )
}

export default IntelligencePageShell
