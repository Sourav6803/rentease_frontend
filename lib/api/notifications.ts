/**
 * Typed API client for the notification endpoints
 * (push token registration, preferences).
 *
 * Uses the same fetch-based envelope pattern as `lib/api/auth.ts`.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  timestamp?: string
  data?: T
}

async function postJson<T>(path: string, payload: unknown): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

async function getJson<T>(path: string): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
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
  meta: { deviceId?: string; appVersion?: string } = {}
) {
  return postJson<{ message: string }>('/api/v1/notifications/push/register', {
    token,
    platform,
    deviceId: meta.deviceId,
    appVersion: meta.appVersion,
  })
}

export async function unregisterPushToken(token: string) {
  return postJson<{ message: string }>('/api/v1/notifications/push/unregister', { token })
}

export async function getNotificationPreferences() {
  return getJson<{ notifications: NotificationPreferences }>('/api/v1/notifications/preferences')
}

export async function updateNotificationPreferences(notifications: Partial<NotificationPreferences>) {
  return putJson<{ notifications: NotificationPreferences }>('/api/v1/notifications/preferences', {
    notifications,
  })
}
