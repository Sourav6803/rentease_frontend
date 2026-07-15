'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plug,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const integrations = [
  {
    id: 'razorpay',
    name: 'Razorpay',
    description: 'Payment gateway for UPI, cards, and netbanking',
    category: 'Payment',
    status: 'active',
    setupUrl: '/admin/settings/payments-gateway',
    icon: '💳'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'International payment processing with subscription support',
    category: 'Payment',
    status: 'active',
    setupUrl: '/admin/settings/payments-gateway',
    icon: '💳'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS and voice communication API',
    category: 'Communication',
    status: 'active',
    setupUrl: '/admin/settings/sms',
    icon: '📱'
  },
  {
    id: 'firebase',
    name: 'Firebase',
    description: 'Push notifications and real-time database',
    category: 'Communication',
    status: 'active',
    setupUrl: '/admin/settings/notifications',
    icon: '🔔'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery and marketing automation',
    category: 'Communication',
    status: 'active',
    setupUrl: '/admin/settings/email',
    icon: '✉️'
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Object storage for backups and media files',
    category: 'Storage',
    status: 'inactive',
    setupUrl: '/admin/settings/backup',
    icon: '🗄️'
  }
]

const statusConfig = {
  active: { label: 'Active', color: 'bg-gradient-to-r from-emerald-500 to-teal-500', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'bg-slate-100 text-slate-600', icon: AlertCircle }
}

export default function IntegrationsSettingsPage() {
  const router = useRouter()

  const activeCount = integrations.filter((i) => i.status === 'active').length

  return (
    <div className="w-full max-w-full space-y-6 px-1 pb-2 sm:px-0">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25">
              <Plug className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Integrations</h2>
                <Badge className="border-0 bg-violet-100 text-violet-700">
                  {activeCount} Active
                </Badge>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-0.5 text-sm text-slate-600">
                Third-party APIs and webhooks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => {
          const status = statusConfig[integration.status as keyof typeof statusConfig]
          const StatusIcon = status.icon

          return (
            <Card
              key={integration.id}
              className="group overflow-hidden border-slate-200 shadow-sm transition-all hover:border-violet-200 hover:shadow-md"
            >
              <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
              <CardHeader className="px-5 pb-4 pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xl">
                      {integration.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base text-slate-900">{integration.name}</CardTitle>
                      <Badge className={`mt-1 border-0 ${status.color}`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  {integration.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {integration.category}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(integration.setupUrl)}
                    className="gap-1 border-violet-200 text-violet-700 hover:bg-violet-50"
                  >
                    Configure
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Webhooks Section */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-fuchsia-500 to-pink-500" />
        <CardHeader className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-sm">
              <ExternalLink className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Webhooks</CardTitle>
              <CardDescription className="mt-0.5">
                Configure webhook endpoints for real-time event notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-sm text-slate-600">
              Webhook endpoints are managed per-integration. Visit the respective settings page to configure webhook URLs and secret keys.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
