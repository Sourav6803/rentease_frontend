// src/app/(auth)/verify-email/page.tsx
'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { EmailVerificationStatus } from '@/components/vendor/EmailVerificationStatus'
import { Loader2 } from 'lucide-react'

function VerifyEmailInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return (
      <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Invalid link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This verification link is missing a token. Open the link from your email, or request a new
          verification email.
        </p>
      </div>
    )
  }

  return <EmailVerificationStatus token={token} />
}

export default function VerifyEmailPage() {
  return (
    <section className="mx-auto max-w-lg py-8">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm">Loading verification…</p>
          </div>
        }
      >
        <VerifyEmailInner />
      </Suspense>
    </section>
  )
}
