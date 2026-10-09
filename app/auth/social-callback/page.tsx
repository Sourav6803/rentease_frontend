// Landing point for the backend's social-login redirect:
//   `${CLIENT_URL}/auth/social-callback?token=…&refreshToken=…`
//
// Split into a server page + a client handler on purpose: the search params are
// known at render time, so the "was it cancelled / is the token missing" cases
// become static renders instead of state that has to be set from an effect.

import Link from 'next/link'
import axios from 'axios'
import { AlertCircle } from 'lucide-react'

import { RentEaseLogo } from '@/components/brand/RentEaseLogo'
import { SocialSignInHandler } from '@/components/forms/login/SocialSignInHandler'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

/** Which portal a role actually signs in through. */
function signInPathForRole(role: string): string {
  if (role === 'vendor') return '/vendor/login'
  if (role === 'admin' || role === 'super-admin' || role === 'super_admin') {
    return '/admin/login'
  }
  if (role.startsWith('delivery')) return '/delivery/auth/login'
  return '/login'
}

/** Role as a person would say it, for the heading and the message. */
function roleLabel(role: string): string {
  if (role === 'super-admin' || role === 'super_admin') return 'admin'
  if (role.startsWith('delivery')) return 'delivery partner'
  return role
}

/**
 * Role owned by the account behind this token.
 *
 * Returns undefined when the lookup cannot be completed — the caller then falls
 * through to the normal handler, which runs the same verification against the
 * backend and reports its own failure.
 */
async function resolveRole(accessToken: string): Promise<string | undefined> {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    })

    const payload = data?.data ?? data
    const user = payload?.user ?? payload?.admin ?? payload

    return typeof user?.role === 'string' ? user.role : undefined
  } catch {
    return undefined
  }
}

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

  // The Google button only exists on the customer sign-in page, but the backend
  // decides the role from whichever account owns the Google email. Resolve it
  // here so a vendor / admin / delivery account is told which portal to use,
  // instead of being handed a customer session that the middleware will
  // immediately bounce it out of.
  const role = await resolveRole(accessToken)

  if (role && role !== 'user') {
    const label = roleLabel(role)

    return (
      <Card>
        <h1 className="mt-4 text-base font-bold text-foreground">
          Use the {label} sign-in page
        </h1>
        <p className="mt-2 flex items-start justify-center gap-1.5 text-xs leading-relaxed text-muted-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
          This Google account is registered as a {label} account, so it cannot
          sign in from the customer login page.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={signInPathForRole(role)}
            className="inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
          >
            Go to {label} sign-in
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-brand-soft"
          >
            Back to login
          </Link>
        </div>
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
