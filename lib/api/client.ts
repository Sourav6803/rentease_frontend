/**
 * frontend/lib/api/client.ts
 * Shared axios instance — token injected via NextAuth session interceptor.
 * Base path: /api/v1 (consumers call relative paths like '/settings').
 * Same pattern as the client in `delivery.ts`.
 */
import axios from 'axios'
import { getSession } from 'next-auth/react'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
  timeout: 20000,
})

// Token injection via NextAuth session interceptor (primary method)
apiClient.interceptors.request.use(async (config) => {
  const session = await getSession()
  const token = (session?.user as { accessToken?: string })?.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Fallback token setter for manual injection (for non-NextAuth contexts)
let _manualToken = ''
export function setApiToken(token: string) {
  _manualToken = token
}

// Additional interceptor to handle manual token as fallback
apiClient.interceptors.request.use((config) => {
  if (_manualToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${_manualToken}`
  }
  return config
})

export default apiClient
