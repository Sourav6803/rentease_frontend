// src/app/admin/vendors/approval/page.tsx
import { VendorApprovalContent } from '@/components/admin/VendorApprovalContent'
import { Metadata } from 'next'
import { Suspense } from 'react'


export const metadata: Metadata = {
  title: 'Vendor Approval | Admin Dashboard',
  description: 'Review and approve vendor applications',
  robots: 'noindex, nofollow',
}

export default function VendorApprovalPage() {
  return (
    <Suspense fallback={<VendorApprovalSkeleton />}>
      <VendorApprovalContent />
    </Suspense>
  )
}

function VendorApprovalSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-muted rounded-lg" />
          <div className="h-4 w-96 bg-muted rounded-lg" />
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}