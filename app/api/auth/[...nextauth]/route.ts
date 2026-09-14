

import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"
import { USE_SECURE_SESSION_COOKIE } from "@/lib/auth/sessionCookie"

type Role = "user" | "vendor" | "admin" | "super-admin" | "delivery"

interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
  isVerified: boolean
  loginType: string
  accessToken?: string
  refreshToken?: string
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

const REFRESH_BUFFER_MS = 60 * 1000

const DELIVERY_LOGIN_TYPES = new Set([
  "delivery",
  "delivery_partner",
  "delivery-person",
  "delivery_person",
])

function resolveLoginEndpoint(loginType?: string): string {
  if (
    loginType === "admin" ||
    loginType === "super_admin" ||
    loginType === "super-admin"
  ) {
    return "/api/v1/admin/auth/login"
  }

  if (loginType && DELIVERY_LOGIN_TYPES.has(loginType)) {
    return "/api/v1/deliveries/auth/login"
  }

  return "/api/v1/auth/login"
}

function normalizeAuthRole(role?: string): Role {
  if (!role) return "user"
  if (role === "super_admin" || role === "superadmin") return "super-admin"
  if (
    role === "delivery" ||
    role === "delivery_person" ||
    role === "delivery_partner" ||
    role === "delivery_team"
  ) {
    return "delivery"
  }
  if (
    role === "user" ||
    role === "vendor" ||
    role === "admin" ||
    role === "super-admin"
  ) {
    return role
  }
  return "user"
}

function getTokenExpiryMs(jwtToken?: string): number | null {
  if (!jwtToken) return null

  try {
    const payload = jwtToken.split(".")[1]
    if (!payload) return null

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decodedPayload = JSON.parse(Buffer.from(normalized, "base64").toString("utf-8"))
    if (!decodedPayload?.exp) return null

    return decodedPayload.exp * 1000
  } catch {
    return null
  }
}

async function refreshAccessToken(token: any) {
  try {
    if (!token?.refreshToken) {
      throw new Error("Missing refresh token")
    }

    console.log("🔄 Refreshing access token...")

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/auth/refresh-token`,
      {
        refreshToken: token.refreshToken,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    )

    const tokens = response.data?.data?.tokens

    if (!tokens) throw new Error("No tokens returned")

    console.log("✅ Access token refreshed successfully", getTokenExpiryMs(tokens.accessToken))

    const nextAccessTokenExpires =
      getTokenExpiryMs(tokens.accessToken) ?? Date.now() + 14 * 60 * 1000

    console.log("✅ New access token generated")

    return {
      ...token,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || token.refreshToken,
      accessTokenExpires: nextAccessTokenExpires,
      error: undefined,
    }
  } catch (error: any) {
    console.log("❌ Refresh token failed", error?.response?.data)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" },
      },

      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.password) {
          throw new Error("Password required")
        }

        if (!credentials.email && !credentials.phone) {
          throw new Error("Email or phone required")
        }

        try {
          const loginType = credentials.loginType || "user"
          const endpoint = resolveLoginEndpoint(loginType)
          const apiUrl = `${API_BASE_URL}${endpoint}`

          const requestBody: Record<string, string> = {
            password: credentials.password,
          }

          if (credentials.email) requestBody.email = credentials.email.trim()
          if (credentials.phone) requestBody.phone = credentials.phone.trim()

          if (process.env.NODE_ENV === "development") {
            console.log(`[NextAuth] Login → ${apiUrl} (loginType: ${loginType})`)
          }

          const response = await axios.post(apiUrl, requestBody, {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
            timeout: 15000,
          })

          if (response.status === 200 && response.data?.success) {
            const data = response.data
            const payload = data.data ?? data

            const userData =
              payload.admin ||
              payload.user ||
              payload.deliveryPerson?.user ||
              data.user

            const tokens = payload.tokens || data.tokens

            if (!userData || !tokens?.accessToken) {
              throw new Error("Invalid response from server")
            }

            const role = normalizeAuthRole(userData.role)

            if (
              DELIVERY_LOGIN_TYPES.has(loginType) &&
              role !== "delivery"
            ) {
              throw new Error("This account is not registered as a delivery partner")
            }

            const authUser: AuthUser = {
              id: userData.id || userData._id,
              email: userData.email,
              name:
                userData.fullName ||
                `${userData.profile?.firstName || ""} ${
                  userData.profile?.lastName || ""
                }`.trim() ||
                userData.email,
              role,
              isVerified:
                userData.isVerified ??
                userData.verification?.email ??
                true,
              loginType,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            }

            return authUser
          }

          throw new Error("Authentication failed")
        } catch (error: any) {
          const status = error.response?.status
          const payload = error.response?.data

          // The backend body is sometimes JSON and sometimes a bare string (the
          // express-rate-limit handler sends `options.message` directly), so try
          // both shapes.
          const backendMessage =
            typeof payload === "string" ? payload.trim() : payload?.message

          // Preserve the real reason. Squashing every 401 into
          // "Invalid credentials" hid account locks and rate limits behind a
          // wrong message, so the user kept retrying a locked account and never
          // learned why they were blocked.
          // next-auth forwards a thrown Error's message to the client verbatim
          // (core/routes/callback.js: `redirect: ${url}/error?error=encodeURIComponent(error.message)`).
          if (backendMessage) {
            throw new Error(backendMessage)
          }

          if (status === 401) {
            throw new Error("Invalid credentials")
          }

          if (status === 429) {
            throw new Error("Too many attempts. Please wait a few minutes and try again.")
          }

          throw new Error("Login failed")
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // 🔥 First login
      if (user) {
        const u = user as AuthUser

        token.id = u.id
        token.email = u.email
        token.name = u.name
        token.role = u.role
        token.isVerified = u.isVerified
        token.loginType = u.loginType
        token.accessToken = u.accessToken
        token.refreshToken = u.refreshToken

        token.accessTokenExpires =
          getTokenExpiryMs(u.accessToken) ?? Date.now() + 14 * 60 * 1000
        token.error = undefined

        return token
      }

      const accessTokenExpires = Number(token.accessTokenExpires || 0)
      const shouldRefresh =
        !accessTokenExpires || Date.now() >= accessTokenExpires - REFRESH_BUFFER_MS

      // If token still valid and not close to expiry, keep current token
      if (!shouldRefresh) {
        return token
      }

      // 🔥 Token expired → refresh
      return await refreshAccessToken(token)
    },

    async session({ session, token }) {
      // A failed refresh means the backend credentials are already dead. Do NOT
      // keep advertising the account as signed in: the header was showing the
      // vendor's name and dashboard button while every API call had been
      // returning 401 for a long time.
      if (token.error === "RefreshAccessTokenError") {
        session.user = undefined as any

        ;(session as any).error = token.error
        ;(session as any).accessTokenExpires = token.accessTokenExpires

        return session
      }

      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as string,
        isVerified: token.isVerified as boolean,
        loginType: token.loginType as string,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
      } as any

      ;(session as any).error = token.error
      ;(session as any).accessTokenExpires = token.accessTokenExpires

      return session
    },

    // FIXED: redirect callback doesn't receive token directly
    async redirect({ url, baseUrl }) {
      // Relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }

      // Same-origin URLs
      if (new URL(url).origin === baseUrl) {
        return url
      }

      return baseUrl
    }
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    // Was 30 days while the backend access token lives 15 minutes and the
    // refresh token 7 days. That mismatch is exactly why the UI could keep
    // showing a signed-in vendor long after every API call started failing.
    // 7 days now matches JWT_REFRESH_EXPIRES_IN.
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Pin the cookie name from the SAME constant the Edge middleware reads.
  // The library default here is `url.base.startsWith("https://")` — the actual
  // request origin — while the middleware's default is
  // `NEXTAUTH_URL?.startsWith("https://") ?? !!VERCEL`. Two different sources,
  // which is exactly how a stale NEXTAUTH_URL silently breaks every protected
  // route. Do NOT remove this and fall back to the library default.
  // See lib/auth/sessionCookie.ts.
  useSecureCookies: USE_SECURE_SESSION_COOKIE,

  debug: process.env.NODE_ENV === "development",

  // NOTE: the `cookies.sessionToken.name` override that used to live here was
  // removed on purpose — but the reason recorded at the time was wrong. It
  // claimed "the Edge middleware in middleware.ts resolves the session through
  // that same default naming". It does not: the middleware reads NEXTAUTH_URL,
  // this handler reads the request origin. So removing the override did not
  // remove the mismatch, it only moved the failure to the other direction and
  // made it depend on an environment variable. The two sides are now kept in
  // agreement explicitly: `useSecureCookies` here, and the `cookies` option
  // passed to withAuth in middleware.ts.
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }