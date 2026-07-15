'use client'

import { useRouter } from 'next/navigation'
import { Construction } from 'lucide-react'
import { IntelligencePageShell, EmptyState, INTELLIGENCE_MODULES } from '@/components/admin/intelligence'

interface IntelligenceModulePlaceholderProps {
  moduleKey: string
}

export function IntelligenceModulePlaceholder({ moduleKey }: IntelligenceModulePlaceholderProps) {
  const router = useRouter()
  const mod = INTELLIGENCE_MODULES.find((m) => m.key === moduleKey)

  return (
    <IntelligencePageShell
      title={mod?.label ?? 'Intelligence Module'}
      subtitle="Module UI will be implemented in the next prompt"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: mod?.label ?? 'Module' },
      ]}
    >
      <EmptyState
        icon={Construction}
        title={`${mod?.label ?? 'Module'} — coming soon`}
        description="Foundation is ready. This module will connect to the admin intelligence API in the next implementation step."
        actionLabel="Back to Hub"
        onAction={() => router.push('/admin/intelligence')}
      />
    </IntelligencePageShell>
  )
}

export default IntelligenceModulePlaceholder
