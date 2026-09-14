
// middleware.ts

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequestWithAuth } from 'next-auth/middleware'
import type { JWT } from 'next-auth/jwt'
import {
  SESSION_COOKIE_NAME,
  USE_SECURE_SESSION_COOKIE,
} from '@/lib/auth/sessionCookie'

// The Edge middleware MUST sign/verify sessions with exactly the same secret as
// the NextAuth route handler (app/api/auth/[...nextauth]/route.ts uses
// `secret: process.env.NEXTAUTH_SECRET`).
//
// This previously fell back to a hardcoded 'dev-nextauth-secret' in
// development. Any mismatch between the two secrets makes every JWT decrypt
// fail, which is indistinguishable from "the user is logged out" — the
// middleware sees `token === null` and redirects to the login page while the
// browser still holds a perfectly valid session cookie. Failing loudly here is
// far better than debugging that silently.
const nextAuthSecret = process.env.NEXTAUTH_SECRET

if (!nextAuthSecret) {
  throw new Error(
    'NEXTAUTH_SECRET is not set — the auth middleware cannot verify sessions. ' +
      'Add it to frontend/.env.local (it must match the value the NextAuth route handler uses).',
  )
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role:
      | 'user'
      | 'vendor'
      | 'admin'
      | 'super-admin'
      | 'super_admin'
      | 'delivery'
    isVerified: boolean
    loginType?: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    error?: string
  }
}

interface UserToken extends JWT {
  id: string
  email: string
  name: string
  role:
    | 'user'
    | 'vendor'
    | 'admin'
    | 'super-admin'
    | 'super_admin'
    | 'delivery'
  isVerified: boolean
  loginType?: string
  accessToken?: string
  refreshToken?: string
  accessTokenExpires?: number
  error?: string
}

interface RouteConfig {
  path: string
  allowedRoles: Array<'user' | 'vendor' | 'admin' | 'super-admin' | 'delivery'>
  exact?: boolean
}

const routeConfigs: RouteConfig[] = [
  {
    path: '/vendor',
    allowedRoles: ['vendor', 'admin', 'super-admin'],
  },
  {
    path: '/vendor/dashboard',
    allowedRoles: ['vendor', 'admin', 'super-admin'],
  },
  {
    path: '/vendor/rentals',
    allowedRoles: ['vendor', 'admin', 'super-admin'],
  },

  {
    path: '/admin',
    allowedRoles: ['admin', 'super-admin'],
  },
  {
    path: '/admin/dashboard',
    allowedRoles: ['admin', 'super-admin'],
  },

  {
    path: '/dashboard',
    allowedRoles: ['user', 'vendor', 'admin', 'super-admin'],
  },

  {
    path: '/profile',
    allowedRoles: ['user', 'vendor', 'admin', 'super-admin'],
  },

  {
    path: '/rentals/create',
    allowedRoles: ['vendor', 'admin', 'super-admin'],
  },

  {
    path: '/rentals/manage',
    allowedRoles: ['vendor', 'admin', 'super-admin'],
  },

  {
    path: '/payments',
    allowedRoles: ['user', 'vendor', 'admin', 'super-admin'],
  },
]

const normalizeRole = (
  role?: string
): 'user' | 'vendor' | 'admin' | 'super-admin' | 'delivery' => {
  if (role === 'super_admin') return 'super-admin'
  if (role === 'delivery') return 'delivery'

  if (
    role === 'user' ||
    role === 'vendor' ||
    role === 'admin' ||
    role === 'super-admin'
  ) {
    return role
  }

  return 'user'
}

const findMatchingRoute = (
  path: string
): RouteConfig | undefined => {
  return routeConfigs.find((config) =>
    config.exact
      ? path === config.path
      : path.startsWith(config.path)
  )
}

// Roles that have a real dashboard page to land on. Regular users ('user') are
// intentionally excluded: there is no /dashboard route, so they should simply
// see the public home page.
const ROOT_REDIRECT_ROLES: Array<
  'user' | 'vendor' | 'admin' | 'super-admin' | 'delivery'
> = ['vendor', 'admin', 'super-admin', 'delivery']

const getDashboardUrl = (role: string): string => {
  const normalizedRole = normalizeRole(role)

  switch (normalizedRole) {
    case 'super-admin':
      return '/admin/dashboard'

    case 'admin':
      return '/admin/dashboard'

    case 'vendor':
      return '/vendor/dashboard'

    case 'delivery':
      return '/delivery/dashboard'

    default:
      return '/dashboard'
  }
}

const getLoginUrl = (
  role?: string,
  path?: string
): string => {
  // Route based login (order matters: /admin/delivery is admin, not delivery portal)
  if (path?.startsWith('/admin')) {
    return '/admin/login'
  }

  if (path?.startsWith('/vendor')) {
    return '/vendor/login'
  }

  if (path?.startsWith('/delivery')) {
    return '/delivery/auth/login'
  }

  // Role based login
  const normalizedRole = normalizeRole(role)

  switch (normalizedRole) {
    case 'admin':
    case 'super-admin':
      return '/admin/login'

    case 'vendor':
      return '/vendor/login'

    case 'delivery':
      return '/delivery/auth/login'

    default:
      return '/login'
  }
}

const clearAuthCookies = (response: NextResponse) => {
  const cookies = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    'next-auth.csrf-token',
    '__Host-next-auth.csrf-token',
  ]

  cookies.forEach((cookie) => {
    response.cookies.delete(cookie)
  })

  return response
}

/** Delivery partner portal auth pages (no session required) */
const isDeliveryAuthPath = (path: string): boolean =>
  path.startsWith('/delivery/auth')

const isPublicPath = (path: string): boolean => {
  const publicRoutes = [
    '/',
    '/login',
    '/admin/login',
    '/vendor/login',
    '/register',
    '/vendor/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/resend-verification',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/firebase-messaging-sw.js',
    '/products',
    '/categories',
    '/categories/${slug}',
    '/how-it-works',
    '/support',
    '/cart'
  ]

  const publicPrefixes = [
    '/products/',
    '/categories/',
  ]

  if (publicRoutes.includes(path)) return true

  if (publicPrefixes.some(prefix => path.startsWith(prefix))) {
  return true
}

  // Dynamic public routes
  if (path.startsWith('/products/')) return true
  if (path.startsWith('/categories/')) return true

  if (isDeliveryAuthPath(path)) return true

  if (path.startsWith('/api/auth')) return true

  if (path.includes('/_next/')) return true

  if (path.includes('/images/')) return true

  if (path.includes('/uploads/')) return true

  if (path.includes('/favicon.ico')) return true

  if (path.includes('/icon.svg')) return true

  return false
}

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token as UserToken | null
    const path = req.nextUrl.pathname

    // Root redirect — MUST run before the public-path early return below.
    // Previously this lived after it, and because '/' is in publicRoutes the
    // early return always won, so the block was unreachable dead code: a
    // signed-in user browsing to the home page got the public landing page
    // while the header still showed them as logged in.
    // Skipped when the refresh already failed, otherwise it would bounce the
    // user into a dashboard whose API calls all 401.
    if (
      path === '/' &&
      token &&
      token.error !== 'RefreshAccessTokenError'
    ) {
      const rootRole = normalizeRole(token.role)

      // Only roles that actually own a dashboard page. getDashboardUrl() falls
      // back to '/dashboard' for regular users, but there is no
      // app/(dashboard)/dashboard/page.tsx — redirecting them would 404. Shoppers
      // should keep seeing the public home page anyway.
      if (ROOT_REDIRECT_ROLES.includes(rootRole)) {
        const rootDashboardUrl = getDashboardUrl(rootRole)

        if (rootDashboardUrl) {
          return NextResponse.redirect(new URL(rootDashboardUrl, req.url))
        }
      }
    }

    // Public routes
    if (isPublicPath(path)) {
      return NextResponse.next()
    }

    // No token
    if (!token) {
      const loginUrl = getLoginUrl(undefined, path)

      const url = new URL(loginUrl, req.url)

      url.searchParams.set('callbackUrl', path)

      const response = NextResponse.redirect(url)

      // Clear the (undecryptable / expired) session cookies here too, not just
      // on the refresh-failure branch. Leaving them behind is what let a stale
      // session keep the header looking signed in on public pages after the user
      // had already been bounced to the login screen.
      if (
        req.cookies.has('next-auth.session-token') ||
        req.cookies.has('__Secure-next-auth.session-token')
      ) {
        clearAuthCookies(response)
      }

      return response
    }

    // Token refresh failed
    if (token.error === 'RefreshAccessTokenError') {
      const loginUrl = getLoginUrl(token.role, path)

      const url = new URL(loginUrl, req.url)

      url.searchParams.set('callbackUrl', path)
      url.searchParams.set('error', 'session_expired')

      const response = NextResponse.redirect(url)

      clearAuthCookies(response)

      return response
    }

    // Safe from here on: `!token` and the refresh-failure branch both returned
    // above, so a token is guaranteed and `userRole` is non-nullable (the
    // helpers below, e.g. getDashboardUrl, require a concrete role).
    const userRole = normalizeRole(token.role)

    // Prevent visiting wrong login pages
    if (
      path === '/admin/login' &&
      (userRole === 'admin' || userRole === 'super-admin')
    ) {
      return NextResponse.redirect(
        new URL('/admin/dashboard', req.url)
      )
    }

    if (
      path === '/vendor/login' &&
      (userRole === 'vendor' ||
        userRole === 'admin' ||
        userRole === 'super-admin')
    ) {
      return NextResponse.redirect(
        new URL(getDashboardUrl(userRole), req.url)
      )
    }

    if (path === '/login' && token) {
      return NextResponse.redirect(
        new URL(getDashboardUrl(userRole), req.url)
      )
    }

    if (
      isDeliveryAuthPath(path) &&
      userRole === 'delivery'
    ) {
      return NextResponse.redirect(new URL('/delivery/dashboard', req.url))
    }

    // Delivery partner portal (exclude auth pages)
    if (
      path.startsWith('/delivery') &&
      !isDeliveryAuthPath(path)
    ) {
      if (userRole !== 'delivery') {
        console.log(`❌ ${userRole} tried accessing delivery portal`)

        if (userRole !== 'user') {
          return NextResponse.redirect(
            new URL(getDashboardUrl(userRole), req.url)
          )
        }

        const loginUrl = new URL('/delivery/auth/login', req.url)
        loginUrl.searchParams.set('callbackUrl', path)
        loginUrl.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(loginUrl)
      }
    }

    // Admin protection
    if (path.startsWith('/admin')) {
      if (
        userRole !== 'admin' &&
        userRole !== 'super-admin'
      ) {
        console.log(
          `❌ ${userRole} tried accessing admin area`
        )

        if (userRole !== 'user') {
          return NextResponse.redirect(
            new URL(getDashboardUrl(userRole), req.url)
          )
        }

        const loginUrl = new URL('/admin/login', req.url)

        loginUrl.searchParams.set('callbackUrl', path)
        loginUrl.searchParams.set('error', 'unauthorized')

        return NextResponse.redirect(loginUrl)
      }

      console.log(
        `✅ Admin access granted for ${userRole}`
      )
    }

    // Vendor protection
    if (
      path.startsWith('/vendor') &&
      !path.startsWith('/vendor/register')
    ) {
      if (
        userRole !== 'vendor' &&
        userRole !== 'admin' &&
        userRole !== 'super-admin'
      ) {
        console.log(
          `❌ ${userRole} tried accessing vendor area`
        )

        if (userRole !== 'user') {
          return NextResponse.redirect(
            new URL(getDashboardUrl(userRole), req.url)
          )
        }

        const loginUrl = new URL('/vendor/login', req.url)

        loginUrl.searchParams.set('callbackUrl', path)
        loginUrl.searchParams.set('error', 'unauthorized')

        return NextResponse.redirect(loginUrl)
      }
    }

    // Route config validation
    const matchedRoute = findMatchingRoute(path)

    if (
      matchedRoute &&
      !matchedRoute.allowedRoles.includes(userRole)
    ) {
      console.log(
        `❌ Role mismatch: ${userRole} not allowed on ${path}`
      )

      return NextResponse.redirect(
        new URL(getDashboardUrl(userRole), req.url)
      )
    }

    // Email verification
    const skipVerificationPaths = [
      '/verify-email',
      '/resend-verification',
    ]

    if (
      token.isVerified === false &&
      !skipVerificationPaths.some((p) =>
        path.startsWith(p)
      )
    ) {
      return NextResponse.redirect(
        new URL('/verify-email', req.url)
      )
    }

    console.log(`✅ Access granted for ${path}`)

    return NextResponse.next()
  },

  {
    callbacks: {
      // IMPORTANT
      // Let middleware control ALL redirects
      authorized: () => true,
    },

    pages: {
      signIn: '/login',
      error: '/login',
    },

    // Read the session cookie by the SAME name the NextAuth route handler
    // writes it with. next-auth resolves the middleware's name from
    // `process.env.NEXTAUTH_URL` and the handler's from the request origin, so
    // leaving both to their defaults lets a stale NEXTAUTH_URL make the
    // middleware look for a cookie that is never written — every protected
    // route then bounces to the login page while the session is perfectly
    // valid. See lib/auth/sessionCookie.ts.
    cookies: {
      sessionToken: { name: SESSION_COOKIE_NAME },
    },

    secret: nextAuthSecret,
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\..*).*)',
  ],
}