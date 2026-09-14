/**
 * The NextAuth session cookie name MUST be identical in two places:
 *
 *   1. the route handler — app/api/auth/[...nextauth]/route.ts
 *   2. the Edge middleware — middleware.ts
 *
 * next-auth v4 does NOT derive it the same way in both, which is a silent
 * trap:
 *
 *   route handler  core/init.js:
 *     `cookies: defaultCookies(authOptions.useSecureCookies ?? url.base.startsWith("https://"))`
 *     -> derived from the ACTUAL request origin
 *
 *   middleware     jwt/index.js:
 *     `secureCookie = process.env.NEXTAUTH_URL?.startsWith("https://") ?? !!process.env.VERCEL`
 *     -> derived from the NEXTAUTH_URL env var
 *
 * When those two disagree, the handler writes `__Secure-next-auth.session-token`
 * and the middleware goes looking for `next-auth.session-token`. It finds
 * nothing, treats the user as signed out, and bounces every protected route to
 * the login page with `?callbackUrl=...` and no `error=` param — which looks
 * exactly like "login silently did nothing".
 *
 * That is not hypothetical: with `NEXTAUTH_URL=http://localhost:3000` set in
 * Vercel's production environment, the handler (request is https) wrote the
 * `__Secure-` cookie while the middleware (env says http) looked for the plain
 * one. Every role was affected, and only the deployed site was broken.
 *
 * So do not rely on either library default. Pin one value and feed it to both
 * sides, and set `useSecureCookies` explicitly in authOptions so the invariant
 * holds by construction rather than by luck.
 *
 * production -> https -> `__Secure-` prefix (Secure cookies)
 * next dev   -> http  -> plain name
 *
 * Caveat: this keys off NODE_ENV, so a production build served over plain HTTP
 * would mark the cookie Secure and the browser would drop it. That is not a
 * supported deployment; production is HTTPS.
 */

export const USE_SECURE_SESSION_COOKIE = process.env.NODE_ENV === 'production'

export const SESSION_COOKIE_NAME = USE_SECURE_SESSION_COOKIE
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token'
