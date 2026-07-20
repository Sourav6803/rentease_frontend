import type { Metadata } from 'next'

import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password | RentEase',
  description: 'Request a password reset link for your RentEase account.',
}

export default function ForgotPasswordPage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center py-8">
      <ForgotPasswordForm />
    </section>
  )
}
