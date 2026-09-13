'use client'

import { SessionProvider, signOut, useSession } from 'next-auth/react'
import { ReactNode, useEffect, useRef } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Single place that reacts to a dead backend session.
 *
 * The next-auth `jwt` callback keeps the (now useless) token around and only
 * sets `error: "RefreshAccessTokenError"` when the backend refresh fails. The
 * session callback blanks `session.user` in that state, and this guard is what
 * actually tears the local session down — previously every page handled 401s
 * ad-hoc (or not at all), so the header happily kept rendering the signed-in
 * user while nothing worked.
 */
function SessionGuard() {
  const { data: session } = useSession()
  const signingOut = useRef(false)

  useEffect(() => {
    if ((session as any)?.error !== 'RefreshAccessTokenError') {
      signingOut.current = false
      return
    }

    // Re-entrancy guard: signOut() itself triggers session refetches, and
    // without this the effect could fire repeatedly.
    if (signingOut.current) return
    signingOut.current = true

    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

    // Send the user back to the login screen for the area they were using.
    const loginPath = pathname.startsWith('/vendor')
      ? '/vendor/login'
      : pathname.startsWith('/admin')
        ? '/admin/login'
        : pathname.startsWith('/delivery')
          ? '/delivery/login'
          : '/login'

    signOut({ callbackUrl: loginPath })
  }, [session])

  return null
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus>
      <SessionGuard />
      {children}
    </SessionProvider>
  )
}
