// Landing point for the backend's social-login redirect:
//   `${CLIENT_URL}/auth/social-callback?token=…&refreshToken=…`
//
// Split into a server page + a client handler on purpose: the search params are
// known at render time, so the "was it cancelled / is the token missing" cases
// become static renders instead of state that has to be set from an effect.

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import { RentEaseLogo } from '@/components/brand/RentEaseLogo'
import { SocialSignInHandler } from '@/components/forms/login/SocialSignInHandler'

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-lg">
        <div className="flex justify-center">
          <RentEaseLogo size={44} withRing />
        </div>
        {children}
      </div>
    </div>
  )
}

export default async function SocialCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams

  const denied = typeof params.error === 'string' ? params.error : undefined
  const accessToken = typeof params.token === 'string' ? params.token : undefined
  const refreshToken =
    typeof params.refreshToken === 'string' ? params.refreshToken : ''
  const loginType = typeof params.loginType === 'string' ? params.loginType : 'user'

  if (denied || !accessToken) {
    return (
      <Card>
        <h1 className="mt-4 text-base font-bold text-foreground">
          Sign-in could not be completed
        </h1>
        <p className="mt-2 flex items-start justify-center gap-1.5 text-xs leading-relaxed text-muted-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
          {denied
            ? 'Google sign-in was cancelled or refused. Please try again.'
            : 'We never received a sign-in token. Please start again from the login page.'}
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
        >
          Back to login
        </Link>
      </Card>
    )
  }

  return (
    <Card>
      <SocialSignInHandler
        accessToken={accessToken}
        refreshToken={refreshToken}
        loginType={loginType}
      />
    </Card>
  )
}
