'use client'

// Turns the backend's handed-over RentEase tokens into a NextAuth session.
// State is only ever set from promise callbacks — never synchronously in the
// effect body (which would trigger cascading renders).

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { AlertCircle, Loader2 } from 'lucide-react'

export function SocialSignInHandler({
  accessToken,
  refreshToken,
  loginType = 'user',
}: {
  accessToken: string
  refreshToken: string
  loginType?: string
}) {
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    // React strict mode runs effects twice in dev — only sign in once.
    if (started.current) return
    started.current = true

    // Keep the token pair out of browser history and referrer headers.
    window.history.replaceState({}, '', '/auth/social-callback')

    signIn('social-handoff', { accessToken, refreshToken, loginType, redirect: false })
      .then((result) => {
        if (!result || result.error) {
          setError(result?.error ?? 'Could not complete sign-in. Please try again.')
          return
        }

        // Hard navigation on purpose: auth boundaries are exactly where a soft
        // client-side transition can serve a cached, pre-login render.
        window.location.replace('/')
      })
      .catch(() => setError('Could not complete sign-in. Please try again.'))
  }, [accessToken, refreshToken, loginType])

  if (error) {
    return (
      <>
        <h1 className="mt-4 text-base font-bold text-foreground">
          Sign-in could not be completed
        </h1>
        <p className="mt-2 flex items-start justify-center gap-1.5 text-xs leading-relaxed text-muted-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
          {error}
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
        >
          Back to login
        </Link>
      </>
    )
  }

  return (
    <>
      <div className="mt-4 flex items-center justify-center gap-2 text-brand">
        <Loader2 className="h-4 w-4 animate-spin" />
        <h1 className="text-sm font-bold">Completing sign-in…</h1>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Verifying your account with RentEase.
      </p>
    </>
  )
}
