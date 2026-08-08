/**
 * Typed API client for the notification endpoints
 * (push token registration, preferences).
 *
 * Uses the same fetch-based envelope pattern as `lib/api/auth.ts`.
 */

// NOTE: the rest of the codebase (and .env*) standardise on
// NEXT_PUBLIC_API_BASE_URL. Read that first; fall back to the legacy
// NEXT_PUBLIC_API_URL name and finally localhost for dev. Using the wrong
// name here silently pointed push-token calls at localhost in production.
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  timestamp?: string
  data?: T
}

async function postJson<T>(
  path: string,
  payload: unknown,
  accessToken?: string
): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return (await res.json()) as ApiEnvelope<T>
}

async function putJson<T>(path: string, payload: unknown): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return (await res.json()) as ApiEnvelope<T>
}

async function getJson<T>(path: string, accessToken?: string): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: 'include',
  })
  return (await res.json()) as ApiEnvelope<T>
}

async function mutate<T>(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  accessToken?: string,
  body?: unknown
): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: 'include',
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  return (await res.json()) as ApiEnvelope<T>
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
}

export async function registerPushToken(
  token: string,
  platform: 'web' | 'android' | 'ios' = 'web',
  meta: { deviceId?: string; appVersion?: string } = {},
  accessToken?: string
) {
  return postJson<{ message: string }>(
    '/api/v1/notifications/push/register',
    {
      token,
      platform,
      deviceId: meta.deviceId,
      appVersion: meta.appVersion,
    },
    accessToken
  )
}

export async function unregisterPushToken(token: string, accessToken?: string) {
  return postJson<{ message: string }>(
    '/api/v1/notifications/push/unregister',
    { token },
    accessToken
  )
}

/**
 * Check whether the user already has an active push token for this device.
 *
 * Used on login to skip re-generating a token when one already exists. When
 * `deviceId` is supplied the backend checks that specific device; otherwise it
 * falls back to checking whether any token exists.
 *
 * @returns `{ exists: boolean, hasAnyToken: boolean }`
 */
export async function checkPushTokenStatus(
  deviceId?: string,
  accessToken?: string
): Promise<{ exists: boolean; hasAnyToken: boolean }> {
  const q = new URLSearchParams()
  if (deviceId) q.set('deviceId', deviceId)
  const qs = q.toString() ? `?${q.toString()}` : ''
  const res = await getJson<{ exists: boolean; hasAnyToken: boolean }>(
    `/api/v1/notifications/push/status${qs}`,
    accessToken
  )
  return res.data ?? { exists: false, hasAnyToken: false }
}

/** Raw notification document as returned by the backend list endpoint. */
export interface NotificationDoc {
  _id: string
  title: string
  content?: { text?: string; html?: string; preview?: string } | string
  type?: string
  category?: string
  priority?: string
  data?: Record<string, unknown>
  status?: string
  readAt?: string
  tracking?: { readAt?: string }
  createdAt: string
}

export interface NotificationListResult {
  notifications: NotificationDoc[]
  unreadCount: number
  pagination: { page: number; limit: number; total: number; pages: number }
}

export async function fetchNotifications(
  accessToken: string,
  params: { page?: number; limit?: number } = {}
) {
  const q = new URLSearchParams()
  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  const qs = q.toString() ? `?${q.toString()}` : ''
  return getJson<NotificationListResult>(`/api/v1/notifications${qs}`, accessToken)
}

export async function fetchUnreadCount(accessToken: string) {
  return getJson<{ count: number }>('/api/v1/notifications/unread/count', accessToken)
}

export async function markNotificationRead(accessToken: string, id: string) {
  return mutate<{ notification: NotificationDoc }>(
    `/api/v1/notifications/${id}/read`,
    'PATCH',
    accessToken
  )
}

export async function markAllNotificationsRead(accessToken: string) {
  return mutate<null>('/api/v1/notifications/read-all', 'POST', accessToken)
}

export async function getNotificationPreferences() {
  return getJson<{ notifications: NotificationPreferences }>('/api/v1/notifications/preferences')
}

export async function updateNotificationPreferences(notifications: Partial<NotificationPreferences>) {
  return putJson<{ notifications: NotificationPreferences }>('/api/v1/notifications/preferences', {
    notifications,
  })
}
