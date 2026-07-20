import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password | RentEase',
  description: 'Set a new password for your RentEase account.',
}

export default function ResetPasswordPage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center py-8">
      {/* ResetPasswordForm reads the ?token= query param, so it must render inside Suspense */}
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </section>
  )
}
