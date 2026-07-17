/**
 * app/robots.ts — Next.js metadata route.
 * Served at /robots.txt: tells crawlers which areas are public (shop pages)
 * and which are private portals (admin, vendor, delivery, user dashboard).
 */
import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/vendor/',
          '/delivery/',
          '/cart',
          '/checkout',
          '/profile',
          '/rentals',
          '/settings',
          '/login',
          '/register',
          '/verify-email',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
