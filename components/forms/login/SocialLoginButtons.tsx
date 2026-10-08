'use client'

// Google sign-in entry point.
//
// ENABLED ONLY WHEN CONFIGURED. Two things have to be true before this renders:
//
//   1. The backend must have real Google OAuth credentials
//      (backend .env: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI).
//   2. This app must expose the matching client id + the backend callback URL:
//        NEXT_PUBLIC_GOOGLE_CLIENT_ID=<same id as the backend>
//        NEXT_PUBLIC_GOOGLE_REDIRECT_URI=<backend callback, e.g. https://api.example.com/api/v1/auth/google>
//
// Until both exist the button renders nothing, so the page can never present a
// button that leads to a broken Google flow.

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI

export const GOOGLE_LOGIN_ENABLED = Boolean(CLIENT_ID && REDIRECT_URI)

export function GoogleSignInButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)

  if (!GOOGLE_LOGIN_ENABLED) return null

  const handleClick = () => {
    setLoading(true)

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.set('client_id', CLIENT_ID as string)
    url.searchParams.set('redirect_uri', REDIRECT_URI as string)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid email profile')
    url.searchParams.set('prompt', 'select_account')

    window.location.href = url.toString()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-brand/40 hover:bg-brand-soft disabled:opacity-60',
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <GoogleGlyph className="h-4 w-4" />
      )}
      Continue with Google
    </button>
  )
}

/** Official four-colour Google "G", inline so there is no extra request. */
function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.77 24c0-1.6.28-3.14.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}
