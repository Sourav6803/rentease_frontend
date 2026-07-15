// src/app/vendor/registration-success/page.tsx
import { Metadata } from 'next'
import { Suspense } from 'react'
import { RegistrationSuccessContent } from '@/components/vendor/RegistrationSuccessContent'

export const metadata: Metadata = {
  title: 'Registration Successful | RentEase Vendor Portal',
  description: 'Your vendor registration has been submitted successfully. Please verify your email to complete the process.',
  robots: 'noindex, nofollow',
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={<RegistrationSuccessSkeleton />}>
      <RegistrationSuccessContent />
    </Suspense>
  )
}

function RegistrationSuccessSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-blue-50 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-card rounded-2xl shadow-xl p-8 animate-pulse">
          <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-6" />
          <div className="h-8 bg-muted rounded-lg w-3/4 mx-auto mb-4" />
          <div className="h-4 bg-muted rounded-lg w-1/2 mx-auto mb-8" />
          <div className="space-y-4">
            <div className="h-24 bg-muted rounded-lg" />
            <div className="h-24 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}