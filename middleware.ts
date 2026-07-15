
// middleware.ts

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequestWithAuth } from 'next-auth/middleware'
import type { JWT } from 'next-auth/jwt'

const nextAuthSecret =
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV === 'development'
    ? 'dev-nextauth-secret'
    : undefined)

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
    '/products/slug',
    '/categories',
    '/categories/${slug}',
    '/how-it-works',
    '/support',
    '/cart'
  ]

  if (publicRoutes.includes(path)) return true

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

    console.log(
      'Token in middleware:',
      token?.role,
      token?.email,
      'Path:',
      path
    )

    // Public routes
    if (isPublicPath(path)) {
      console.log(`✅ Public path: ${path}`)
      return NextResponse.next()
    }

    // No token
    if (!token) {
      console.log(`❌ No token for protected route: ${path}`)

      const loginUrl = getLoginUrl(undefined, path)

      const url = new URL(loginUrl, req.url)

      url.searchParams.set('callbackUrl', path)

      return NextResponse.redirect(url)
    }

    // Token refresh failed
    if (token.error === 'RefreshAccessTokenError') {
      console.log('❌ Refresh token expired')

      const loginUrl = getLoginUrl(token.role, path)

      const url = new URL(loginUrl, req.url)

      url.searchParams.set('callbackUrl', path)
      url.searchParams.set('error', 'session_expired')

      const response = NextResponse.redirect(url)

      clearAuthCookies(response)

      return response
    }

    const userRole = normalizeRole(token.role)

    console.log('User role:', userRole)

    // Redirect logged in users from root
    if (path === '/') {
      const dashboardUrl = getDashboardUrl(userRole)

      console.log(`🔄 Redirecting to ${dashboardUrl}`)

      return NextResponse.redirect(
        new URL(dashboardUrl, req.url)
      )
    }

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

    secret: nextAuthSecret,
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}