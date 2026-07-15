import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    isVerified: boolean
    loginType: string
    accessToken?: string
    refreshToken?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      isVerified: boolean
      image?: string
      accessToken?: string
      refreshToken?: string
    }
    error?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    isVerified: boolean
    loginType?: string
    accessToken?: string
    error?: string
  }
}